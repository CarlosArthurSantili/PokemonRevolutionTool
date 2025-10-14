// --- FUNCIONALIDADES DO POKEMON TEAM ---

// Variáveis globais do team
let pokemonTeam = [];
let currentSlotIndex = -1;
let currentMoveSlotIndex = -1;
let allPokemonData = [];

// Cache para movimentos de cada Pokémon
const pokemonMovesCache = new Map();

// Inicializar o team quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadTeamFromStorage();
    setupTeamEventListeners();
});

// Configurar event listeners
function setupTeamEventListeners() {
    // Busca de Pokémon no modal
    const pokemonSearch = document.getElementById('team-pokemon-search');
    if (pokemonSearch) {
        pokemonSearch.addEventListener('input', filterPokemonGrid);
    }
    
    // Filtro de geração
    const generationFilter = document.getElementById('team-generation-filter');
    if (generationFilter) {
        generationFilter.addEventListener('change', filterPokemonGrid);
    }
    
    // Busca de movimentos
    const moveSearch = document.getElementById('move-search');
    if (moveSearch) {
        moveSearch.addEventListener('input', filterMoveList);
    }
    
    // Filtro de tipo de movimento
    const moveTypeFilter = document.getElementById('move-type-filter');
    if (moveTypeFilter) {
        moveTypeFilter.addEventListener('change', filterMoveList);
    }
}

// Carregar team do localStorage
function loadTeamFromStorage() {
    const savedTeam = localStorage.getItem('pokemonTeam');
    if (savedTeam) {
        pokemonTeam = JSON.parse(savedTeam);
        renderTeam();
        updateTeamAnalysis();
    } else {
        // Inicializar team vazio
        pokemonTeam = Array(6).fill(null);
    }
}

// Salvar team no localStorage
function saveTeamToStorage() {
    localStorage.setItem('pokemonTeam', JSON.stringify(pokemonTeam));
}

// Renderizar o team na interface
function renderTeam() {
    for (let i = 0; i < 6; i++) {
        const pokemon = pokemonTeam[i];
        const slot = document.querySelector(`[data-slot="${i}"] .pokemon-slot`);
        const movesContainer = document.querySelector(`[data-slot="${i}"] .moves-slots`);
        
        if (pokemon) {
            renderPokemonInSlot(slot, pokemon, i);
            renderMovesInSlot(movesContainer, pokemon.moves || [], i);
        } else {
            renderEmptySlot(slot, i);
            renderEmptyMoves(movesContainer);
        }
    }
}

// Renderizar Pokémon no slot
function renderPokemonInSlot(slot, pokemon, slotIndex) {
    slot.className = 'pokemon-slot filled';
    slot.innerHTML = `
        <button class="remove-pokemon" onclick="removePokemon(${slotIndex})" title="Remover Pokémon">🗑</button>
        <div class="pokemon-name">${pokemon.name}</div>
        <img class="pokemon-image" src="${pokemon.image}" alt="${pokemon.name}">
        <div class="pokemon-types">
            ${pokemon.types.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')}
        </div>
    `;
    slot.onclick = null;
}

// Renderizar slot vazio
function renderEmptySlot(slot, slotIndex) {
    slot.className = 'pokemon-slot empty';
    slot.innerHTML = '<div class="add-pokemon">+</div>';
    slot.onclick = () => openPokemonSelector(slotIndex);
}

// Renderizar movimentos no slot
function renderMovesInSlot(movesContainer, moves, slotIndex) {
    const moveSlots = movesContainer.querySelectorAll('.move-slot');
    
    moveSlots.forEach((moveSlot, moveIndex) => {
        const move = moves[moveIndex];
        
        if (move) {
            moveSlot.className = 'move-slot filled';
            moveSlot.innerHTML = `
                <button class="remove-move" onclick="removeMove(${slotIndex}, ${moveIndex})" title="Remover movimento">×</button>
                <div class="move-name">${move.name}</div>
                <div class="move-details">
                    <span class="move-type-badge type-${move.type}">${move.type}</span>
                    <span>P:${move.power || '-'}</span>
                    <span>A:${move.accuracy || '-'}%</span>
                </div>
            `;
            moveSlot.onclick = null;
        } else {
            moveSlot.className = 'move-slot empty';
            moveSlot.innerHTML = '+';
            moveSlot.onclick = () => openMoveSelector(slotIndex, moveIndex);
        }
    });
}

// Renderizar movimentos vazios
function renderEmptyMoves(movesContainer) {
    const moveSlots = movesContainer.querySelectorAll('.move-slot');
    moveSlots.forEach((moveSlot, index) => {
        moveSlot.className = 'move-slot empty';
        moveSlot.innerHTML = '+';
        moveSlot.onclick = null;
    });
}

// Abrir modal de seleção de Pokémon
async function openPokemonSelector(slotIndex) {
    currentSlotIndex = slotIndex;
    
    const modal = document.getElementById('pokemon-selector-modal');
    const grid = document.getElementById('pokemon-selector-grid');
    
    // Mostrar modal com loading
    modal.style.display = 'flex';
    grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Carregando Pokémons...</div>';
    
    // Carregar pokémons se ainda não estiver carregado
    if (allPokemonData.length === 0) {
        await loadAllPokemon();
    }
    
    renderPokemonGrid(allPokemonData);
}

// Fechar modal de seleção de Pokémon
function closePokemonSelector() {
    document.getElementById('pokemon-selector-modal').style.display = 'none';
    currentSlotIndex = -1;
}

// Carregar todos os Pokémon da API
async function loadAllPokemon() {
    try {
        // Carregar até 8ª geração (905 pokémons)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=905');
        const data = await response.json();
        
        // Carregar em lotes para melhor performance
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < data.results.length; i += batchSize) {
            const batch = data.results.slice(i, i + batchSize);
            batches.push(batch);
        }
        
        allPokemonData = [];
        
        // Carregar primeiro lote imediatamente
        await loadPokemonBatch(batches[0]);
        
        // Carregar outros lotes em background
        setTimeout(async () => {
            for (let i = 1; i < batches.length; i++) {
                await loadPokemonBatch(batches[i]);
                // Atualizar grid se estiver sendo exibido
                if (document.getElementById('pokemon-selector-modal').style.display === 'flex') {
                    filterPokemonGrid();
                }
            }
        }, 100);
        
    } catch (error) {
        console.error('Erro ao carregar pokémons:', error);
        allPokemonData = [];
    }
}

// Carregar lote de Pokémon
async function loadPokemonBatch(batch) {
    const pokemonPromises = batch.map(async (pokemon) => {
        try {
            const pokemonResponse = await fetch(pokemon.url);
            const pokemonData = await pokemonResponse.json();
            
            return {
                id: pokemonData.id,
                name: pokemonData.name,
                image: pokemonData.sprites.front_default || pokemonData.sprites.other?.['official-artwork']?.front_default,
                types: pokemonData.types.map(type => type.type.name),
                url: pokemon.url
            };
        } catch (error) {
            console.error(`Erro ao carregar ${pokemon.name}:`, error);
            return null;
        }
    });
    
    const batchResults = await Promise.all(pokemonPromises);
    const validResults = batchResults.filter(result => result !== null);
    allPokemonData.push(...validResults);
    
    // Ordenar por ID
    allPokemonData.sort((a, b) => a.id - b.id);
}

// Renderizar grid de Pokémon
function renderPokemonGrid(pokemonList) {
    const grid = document.getElementById('pokemon-selector-grid');
    
    grid.innerHTML = pokemonList.map(pokemon => `
        <div class="pokemon-grid-item" onclick="selectPokemon(${pokemon.id})">
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <div class="name">${pokemon.name}</div>
        </div>
    `).join('');
}

// Filtrar grid de Pokémon
function filterPokemonGrid() {
    const searchTerm = document.getElementById('team-pokemon-search').value.toLowerCase();
    const generation = document.getElementById('team-generation-filter').value;
    
    let filteredPokemon = allPokemonData;
    
    // Filtrar por nome
    if (searchTerm) {
        filteredPokemon = filteredPokemon.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por geração
    if (generation) {
        const genRanges = {
            '1': [1, 151],
            '2': [152, 251],
            '3': [252, 386],
            '4': [387, 493],
            '5': [494, 649],
            '6': [650, 721],
            '7': [722, 809],
            '8': [810, 905]
        };
        
        const [min, max] = genRanges[generation];
        filteredPokemon = filteredPokemon.filter(pokemon => 
            pokemon.id >= min && pokemon.id <= max
        );
    }
    
    renderPokemonGrid(filteredPokemon);
}

// Selecionar Pokémon
async function selectPokemon(pokemonId) {
    const pokemon = allPokemonData.find(p => p.id === pokemonId);
    
    if (pokemon) {
        // Carregar dados completos do Pokémon incluindo movimentos
        const fullPokemonData = await fetchFullPokemonData(pokemon.url);
        
        const teamPokemon = {
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.image,
            types: pokemon.types,
            moves: [],
            availableMoves: fullPokemonData.moves || []
        };
        
        pokemonTeam[currentSlotIndex] = teamPokemon;
        saveTeamToStorage();
        renderTeam();
        updateTeamAnalysis();
        closePokemonSelector();
    }
}

// Buscar dados completos do Pokémon
async function fetchFullPokemonData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados do pokémon:', error);
        return { moves: [] };
    }
}

// Remover Pokémon do team
function removePokemon(slotIndex) {
    pokemonTeam[slotIndex] = null;
    saveTeamToStorage();
    renderTeam();
    updateTeamAnalysis();
}

// Abrir modal de seleção de movimento
async function openMoveSelector(slotIndex, moveIndex) {
    const pokemon = pokemonTeam[slotIndex];
    
    if (!pokemon) {
        alert('Adicione um Pokémon primeiro!');
        return;
    }
    
    currentSlotIndex = slotIndex;
    currentMoveSlotIndex = moveIndex;
    
    const modal = document.getElementById('move-selector-modal');
    const list = document.getElementById('move-selector-list');
    
    // Mostrar modal com loading
    modal.style.display = 'flex';
    list.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Carregando movimentos...</div>';
    
    // Carregar movimentos do Pokémon se não estiver em cache
    if (!pokemonMovesCache.has(pokemon.id)) {
        await loadPokemonMoves(pokemon);
    }
    
    const moves = pokemonMovesCache.get(pokemon.id) || [];
    renderMoveList(moves);
}

// Fechar modal de seleção de movimento
function closeMoveSelector() {
    document.getElementById('move-selector-modal').style.display = 'none';
    currentSlotIndex = -1;
    currentMoveSlotIndex = -1;
}

// Carregar movimentos do Pokémon
async function loadPokemonMoves(pokemon) {
    try {
        const moves = [];
        
        // Carregar mais movimentos (até 50 para ter boa variedade)
        for (const moveEntry of pokemon.availableMoves.slice(0, 50)) {
            try {
                const moveResponse = await fetch(moveEntry.move.url);
                const moveData = await moveResponse.json();
                
                const versionGroupDetails = moveEntry.version_group_details[0] || {};
                const learnMethod = versionGroupDetails.move_learn_method?.name || 'unknown';
                const level = versionGroupDetails.level_learned_at || 0;
                
                moves.push({
                    name: moveData.name.replace('-', ' '),
                    type: moveData.type?.name || 'normal',
                    power: moveData.power || '-',
                    accuracy: moveData.accuracy || '-',
                    pp: moveData.pp || '-',
                    learnMethod: learnMethod,
                    level: level,
                    damageClass: moveData.damage_class?.name || 'status'
                });
            } catch (moveError) {
                console.error(`Erro ao carregar movimento ${moveEntry.move.name}:`, moveError);
            }
        }
        
        // Ordenar movimentos: primeiro por nível, depois por nome
        moves.sort((a, b) => {
            if (a.learnMethod === 'level-up' && b.learnMethod === 'level-up') {
                return a.level - b.level;
            }
            if (a.learnMethod === 'level-up') return -1;
            if (b.learnMethod === 'level-up') return 1;
            return a.name.localeCompare(b.name);
        });
        
        pokemonMovesCache.set(pokemon.id, moves);
    } catch (error) {
        console.error('Erro ao carregar movimentos:', error);
        pokemonMovesCache.set(pokemon.id, []);
    }
}

// Renderizar lista de movimentos
function renderMoveList(moves) {
    const list = document.getElementById('move-selector-list');
    
    list.innerHTML = moves.map(move => `
        <div class="move-list-item" onclick="selectMove('${move.name}', '${move.type}', '${move.power}', '${move.accuracy}')">
            <div class="move-info">
                <div class="move-name">${move.name}</div>
                <div class="move-stats">
                    <span>Poder: ${move.power}</span>
                    <span>Precisão: ${move.accuracy}%</span>
                    <span>PP: ${move.pp}</span>
                    <span>Método: ${move.learnMethod === 'level-up' ? `Nv ${move.level}` : 'TM/HM'}</span>
                </div>
            </div>
            <span class="move-type-badge type-${move.type}">${move.type}</span>
        </div>
    `).join('');
}

// Filtrar lista de movimentos
function filterMoveList() {
    const pokemon = pokemonTeam[currentSlotIndex];
    if (!pokemon) return;
    
    const searchTerm = document.getElementById('move-search').value.toLowerCase();
    const typeFilter = document.getElementById('move-type-filter').value;
    
    let moves = pokemonMovesCache.get(pokemon.id) || [];
    
    // Filtrar por nome
    if (searchTerm) {
        moves = moves.filter(move => 
            move.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por tipo
    if (typeFilter) {
        moves = moves.filter(move => {
            if (typeFilter === 'level') return move.learnMethod === 'level-up';
            if (typeFilter === 'machine') return move.learnMethod === 'machine';
            return true;
        });
    }
    
    renderMoveList(moves);
}

// Selecionar movimento
function selectMove(name, type, power, accuracy) {
    const pokemon = pokemonTeam[currentSlotIndex];
    
    if (!pokemon.moves) {
        pokemon.moves = [];
    }
    
    const move = {
        name: name,
        type: type,
        power: power,
        accuracy: accuracy
    };
    
    pokemon.moves[currentMoveSlotIndex] = move;
    
    saveTeamToStorage();
    renderTeam();
    updateTeamAnalysis();
    closeMoveSelector();
}

// Remover movimento
function removeMove(slotIndex, moveIndex) {
    const pokemon = pokemonTeam[slotIndex];
    
    if (pokemon && pokemon.moves) {
        pokemon.moves[moveIndex] = null;
        // Reorganizar array removendo nulls
        pokemon.moves = pokemon.moves.filter(move => move !== null);
        
        saveTeamToStorage();
        renderTeam();
        updateTeamAnalysis();
    }
}

// Atualizar análise do team
function updateTeamAnalysis() {
    const teamPokemon = pokemonTeam.filter(p => p !== null);
    
    // Tipos cobertos
    const coveredTypes = new Set();
    const uncoveredTypes = new Set();
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    // Analisar movimentos para tipos cobertos
    teamPokemon.forEach(pokemon => {
        if (pokemon.moves) {
            pokemon.moves.forEach(move => {
                if (move) {
                    coveredTypes.add(move.type);
                }
            });
        }
    });
    
    // Tipos não cobertos
    allTypes.forEach(type => {
        if (!coveredTypes.has(type)) {
            uncoveredTypes.add(type);
        }
    });
    
    // Renderizar análise
    renderTypeAnalysis(coveredTypes, uncoveredTypes);
    renderWeaknessAnalysis(teamPokemon);
    renderResistanceAnalysis(teamPokemon);
}

// Renderizar análise de tipos
function renderTypeAnalysis(covered, uncovered) {
    const coveredContainer = document.getElementById('covered-types');
    const uncoveredContainer = document.getElementById('uncovered-types');
    
    coveredContainer.innerHTML = Array.from(covered).map(type => 
        `<span class="pokemon-type type-${type}">${type}</span>`
    ).join('');
    
    uncoveredContainer.innerHTML = Array.from(uncovered).map(type => 
        `<span class="pokemon-type type-${type}">${type}</span>`
    ).join('');
}

// Renderizar análise de fraquezas
function renderWeaknessAnalysis(teamPokemon) {
    const container = document.getElementById('team-weaknesses');
    const weaknessCount = {};
    
    teamPokemon.forEach(pokemon => {
        const effectiveness = calculateTypeEffectiveness(pokemon.types.map(type => ({ type: { name: type } })));
        
        effectiveness.weaknesses.forEach(weakness => {
            const type = weakness.type || weakness;
            const multiplier = weakness.multiplier || 2;
            
            if (!weaknessCount[type]) {
                weaknessCount[type] = { 
                    count: 0, 
                    maxMultiplier: 0, 
                    pokemonNames: new Set() 
                };
            }
            
            weaknessCount[type].count++;
            weaknessCount[type].maxMultiplier = Math.max(weaknessCount[type].maxMultiplier, multiplier);
            weaknessCount[type].pokemonNames.add(pokemon.name);
        });
    });
    
    // Ordenar por quantidade (decrescente) e depois por tipo
    const sortedWeaknesses = Object.entries(weaknessCount).sort((a, b) => {
        if (b[1].count !== a[1].count) {
            return b[1].count - a[1].count; // Ordenar por quantidade (maior primeiro)
        }
        return a[0].localeCompare(b[0]); // Se empate, ordenar alfabeticamente
    });
    
    container.innerHTML = sortedWeaknesses.map(([type, data]) => `
        <div class="weakness-item">
            <span class="pokemon-type type-${type}">${type} ${data.maxMultiplier > 2 ? `(${data.maxMultiplier}×)` : ''}</span>
            <span class="pokemon-separator">|</span>
            <span class="pokemon-names">${Array.from(data.pokemonNames).join(', ')}</span>
            <span class="pokemon-count">${data.count} Pokémon</span>
        </div>
    `).join('');
}

// Renderizar análise de resistências
function renderResistanceAnalysis(teamPokemon) {
    const container = document.getElementById('team-resistances');
    const resistanceCount = {};
    
    teamPokemon.forEach(pokemon => {
        const effectiveness = calculateTypeEffectiveness(pokemon.types.map(type => ({ type: { name: type } })));
        
        effectiveness.resistances.forEach(resistance => {
            const type = resistance.type || resistance;
            const multiplier = resistance.multiplier || 0.5;
            
            if (!resistanceCount[type]) {
                resistanceCount[type] = { 
                    count: 0, 
                    minMultiplier: 1, 
                    pokemonNames: new Set() 
                };
            }
            
            resistanceCount[type].count++;
            resistanceCount[type].minMultiplier = Math.min(resistanceCount[type].minMultiplier, multiplier);
            resistanceCount[type].pokemonNames.add(pokemon.name);
        });
        
        effectiveness.immunities.forEach(immunity => {
            if (!resistanceCount[immunity]) {
                resistanceCount[immunity] = { 
                    count: 0, 
                    minMultiplier: 0, 
                    pokemonNames: new Set() 
                };
            }
            
            resistanceCount[immunity].count++;
            resistanceCount[immunity].minMultiplier = 0;
            resistanceCount[immunity].pokemonNames.add(pokemon.name);
        });
    });
    
    // Ordenar por quantidade (decrescente) e depois por tipo
    const sortedResistances = Object.entries(resistanceCount).sort((a, b) => {
        if (b[1].count !== a[1].count) {
            return b[1].count - a[1].count; // Ordenar por quantidade (maior primeiro)
        }
        return a[0].localeCompare(b[0]); // Se empate, ordenar alfabeticamente
    });
    
    container.innerHTML = sortedResistances.map(([type, data]) => `
        <div class="resistance-item">
            <span class="pokemon-type type-${type}">${type} ${data.minMultiplier === 0 ? '(0×)' : data.minMultiplier < 1 ? `(${data.minMultiplier}×)` : ''}</span>
            <span class="pokemon-separator">|</span>
            <span class="pokemon-names">${Array.from(data.pokemonNames).join(', ')}</span>
            <span class="pokemon-count">${data.count} Pokémon</span>
        </div>
    `).join('');
}

// Função para limpar todo o team
function clearTeam() {
    if (confirm('Tem certeza que deseja limpar todo o team? Esta ação não pode ser desfeita.')) {
        pokemonTeam = Array(6).fill(null);
        saveTeamToStorage();
        renderTeam();
        updateTeamAnalysis();
    }
}

// Função para exportar team
function exportTeam() {
    const teamData = pokemonTeam.filter(p => p !== null);
    
    if (teamData.length === 0) {
        alert('Não há Pokémon no team para exportar!');
        return;
    }
    
    const exportData = {
        team: teamData,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'pokemon-team.json';
    link.click();
}

// Função para acionar o input de arquivo
function triggerImportTeam() {
    const fileInput = document.getElementById('import-file-input');
    fileInput.click();
}

// Função para importar team
function importTeam(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Verificar se é um arquivo JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Por favor, selecione um arquivo JSON válido!');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validar estrutura do arquivo
            if (!importData.team || !Array.isArray(importData.team)) {
                throw new Error('Estrutura de arquivo inválida');
            }
            
            // Confirmar importação
            const teamPokemonNames = importData.team.map(p => p.name).join(', ');
            const confirmMessage = `Deseja importar este team?\n\n` +
                                 `📋 ${importData.team.length} Pokémon(s): ${teamPokemonNames}\n` +
                                 `📅 Exportado em: ${importData.exportDate ? new Date(importData.exportDate).toLocaleString() : 'Data desconhecida'}\n` +
                                 `🗂️ Versão: ${importData.version || 'Desconhecida'}\n\n` +
                                 `⚠️ Isso irá substituir seu team atual!`;
            
            if (!confirm(confirmMessage)) {
                return;
            }
            
            // Processar dados importados
            processImportedTeam(importData.team);
            
            // Limpar input
            event.target.value = '';
            
            alert('Team importado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao importar team:', error);
            alert('Erro ao importar o arquivo! Verifique se é um arquivo de team válido.');
        }
    };
    
    reader.readAsText(file);
}

// Função para processar o team importado
function processImportedTeam(importedTeam) {
    // Limpar team atual
    pokemonTeam = Array(6).fill(null);
    
    let importedCount = 0;
    
    // Adicionar Pokémon importados
    importedTeam.forEach((pokemon, index) => {
        if (index < 6 && pokemon && pokemon.name && pokemon.id) {
            // Validar estrutura do Pokémon
            const validatedPokemon = {
                id: parseInt(pokemon.id) || 1,
                name: pokemon.name.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                image: pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
                types: Array.isArray(pokemon.types) ? pokemon.types.filter(type => typeof type === 'string') : ['normal'],
                moves: [],
                availableMoves: pokemon.availableMoves || []
            };
            
            // Validar e processar movimentos
            if (Array.isArray(pokemon.moves) && pokemon.moves.length > 0) {
                validatedPokemon.moves = pokemon.moves
                    .filter(move => move && typeof move === 'object' && move.name)
                    .slice(0, 4) // Máximo 4 movimentos
                    .map(move => ({
                        name: move.name,
                        type: move.type || 'normal',
                        power: move.power || '-',
                        accuracy: move.accuracy || '-'
                    }));
            }
            
            // Garantir pelo menos um tipo
            if (validatedPokemon.types.length === 0) {
                validatedPokemon.types = ['normal'];
            }
            
            pokemonTeam[index] = validatedPokemon;
            importedCount++;
        }
    });
    
    // Salvar e renderizar
    saveTeamToStorage();
    renderTeam();
    updateTeamAnalysis();
    
    console.log(`Team importado: ${importedCount} Pokémon(s) adicionados com sucesso!`);
}