// --- FUNCIONALIDADES DO MODAL DE POKÉMON ---

// Tabela de efetividade de tipos (simplificada)
const typeEffectiveness = {
    normal: { weaknesses: ['fighting'], resistances: [], immunities: ['ghost'] },
    fire: { weaknesses: ['water', 'ground', 'rock'], resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immunities: [] },
    water: { weaknesses: ['electric', 'grass'], resistances: ['fire', 'water', 'ice', 'steel'], immunities: [] },
    electric: { weaknesses: ['ground'], resistances: ['electric', 'flying', 'steel'], immunities: [] },
    grass: { weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'], resistances: ['water', 'electric', 'grass', 'ground'], immunities: [] },
    ice: { weaknesses: ['fire', 'fighting', 'rock', 'steel'], resistances: ['ice'], immunities: [] },
    fighting: { weaknesses: ['flying', 'psychic', 'fairy'], resistances: ['bug', 'rock', 'dark'], immunities: [] },
    poison: { weaknesses: ['ground', 'psychic'], resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immunities: [] },
    ground: { weaknesses: ['water', 'grass', 'ice'], resistances: ['poison', 'rock'], immunities: ['electric'] },
    flying: { weaknesses: ['electric', 'ice', 'rock'], resistances: ['grass', 'fighting', 'bug'], immunities: ['ground'] },
    psychic: { weaknesses: ['bug', 'ghost', 'dark'], resistances: ['fighting', 'psychic'], immunities: [] },
    bug: { weaknesses: ['fire', 'flying', 'rock'], resistances: ['grass', 'fighting', 'ground'], immunities: [] },
    rock: { weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'], resistances: ['normal', 'fire', 'poison', 'flying'], immunities: [] },
    ghost: { weaknesses: ['ghost', 'dark'], resistances: ['poison', 'bug'], immunities: ['normal', 'fighting'] },
    dragon: { weaknesses: ['ice', 'dragon', 'fairy'], resistances: ['fire', 'water', 'electric', 'grass'], immunities: [] },
    dark: { weaknesses: ['fighting', 'bug', 'fairy'], resistances: ['ghost', 'dark'], immunities: ['psychic'] },
    steel: { weaknesses: ['fire', 'fighting', 'ground'], resistances: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immunities: ['poison'] },
    fairy: { weaknesses: ['poison', 'steel'], resistances: ['fighting', 'bug', 'dark'], immunities: ['dragon'] }
};

// Função de teste para verificar cálculos de efetividade
function testTypeEffectiveness() {
    // Teste Parasect (Bug/Grass) - deve ter 4x fraqueza ao Fire
    const parasectTypes = [{ type: { name: 'bug' } }, { type: { name: 'grass' } }];
    const parasectEffectiveness = calculateTypeEffectiveness(parasectTypes);
    
    const fireWeakness = parasectEffectiveness.weaknesses.find(w => w.type === 'fire');
    console.log('Parasect Fire weakness:', fireWeakness ? fireWeakness.multiplier : 'None');
    
    // Teste Charizard (Fire/Flying) - deve ter 4x fraqueza ao Rock  
    const charizardTypes = [{ type: { name: 'fire' } }, { type: { name: 'flying' } }];
    const charizardEffectiveness = calculateTypeEffectiveness(charizardTypes);
    
    const rockWeakness = charizardEffectiveness.weaknesses.find(w => w.type === 'rock');
    console.log('Charizard Rock weakness:', rockWeakness ? rockWeakness.multiplier : 'None');
}

// Descomente a linha abaixo para testar
// testTypeEffectiveness();

// Cache para armazenar dados de evolução
const evolutionCache = new Map();

// Cache para armazenar descrições de habilidades
const abilityCache = new Map();

// Cache para armazenar dados de movimentos
const movesCache = new Map();

// Cache para armazenar descrições de movimentos
const moveDescriptionCache = new Map();

// Função para buscar descrição de um movimento
async function fetchMoveDescription(moveUrl) {
    console.log('fetchMoveDescription chamado para:', moveUrl);
    try {
        const response = await fetch(moveUrl);
        const data = await response.json();
        
        console.log('Dados do movimento recebidos:', data);
        
        // Procurar por descrição em português, se não encontrar, usar inglês
        const portugueseEntry = data.flavor_text_entries.find(entry => entry.language.name === 'pt');
        const englishEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');
        
        let description = 'Descrição não disponível';
        if (portugueseEntry) {
            description = portugueseEntry.flavor_text;
        } else if (englishEntry) {
            description = englishEntry.flavor_text;
        }
        
        // Também incluir informações adicionais se disponíveis
        const effect = data.effect_entries.find(entry => entry.language.name === 'en');
        if (effect && effect.short_effect) {
            description += `\n\nEfeito: ${effect.short_effect}`;
        }
        
        console.log('Descrição final:', description);
        return description;
    } catch (error) {
        console.error('Erro ao buscar descrição do movimento:', error);
        return 'Erro ao carregar descrição';
    }
}

// Função para buscar dados de um movimento específico
async function fetchMoveData(moveUrl) {
    try {
        const response = await fetch(moveUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados do movimento:', error);
        return null;
    }
}

// Função para buscar e processar movimentos de um pokémon
async function fetchPokemonMoves(pokemon) {
    // Verificar cache primeiro
    if (movesCache.has(pokemon.id)) {
        return movesCache.get(pokemon.id);
    }
    
    try {
        const movePromises = pokemon.moves.map(async (moveEntry) => {
            const moveData = await fetchMoveData(moveEntry.move.url);
            if (!moveData) return null;
            
            return {
                name: moveData.name.replace('-', ' '),
                originalName: moveData.name,
                url: moveEntry.move.url,
                type: moveData.type?.name || 'unknown',
                power: moveData.power || '-',
                accuracy: moveData.accuracy || '-',
                pp: moveData.pp || '-',
                damageClass: moveData.damage_class?.name || 'status',
                learnMethods: moveEntry.version_group_details
            };
        });
        
        const moves = await Promise.all(movePromises);
        const validMoves = moves.filter(move => move !== null);
        
        // Organizar movimentos por método de aprendizado
        const organizedMoves = {
            levelUp: [],
            machine: []
        };
        
        validMoves.forEach(move => {
            move.learnMethods.forEach(method => {
                if (method.move_learn_method.name === 'level-up') {
                    const existingMove = organizedMoves.levelUp.find(m => m.name === move.name);
                    if (!existingMove) {
                        organizedMoves.levelUp.push({
                            ...move,
                            level: method.level_learned_at
                        });
                    }
                } else if (method.move_learn_method.name === 'machine') {
                    const existingMove = organizedMoves.machine.find(m => m.name === move.name);
                    if (!existingMove) {
                        organizedMoves.machine.push(move);
                    }
                }
            });
        });
        
        // Ordenar movimentos por nível
        organizedMoves.levelUp.sort((a, b) => a.level - b.level);
        
        // Ordenar TMs/HMs por nome
        organizedMoves.machine.sort((a, b) => a.name.localeCompare(b.name));
        
        // Criar lista com todos os movimentos para a aba "Todos"
        organizedMoves.all = [
            ...organizedMoves.levelUp.map(move => ({ ...move, origin: 'level' })),
            ...organizedMoves.machine.map(move => ({ ...move, origin: 'machine' }))
        ];
        
        // Ordenar todos os movimentos por nome
        organizedMoves.all.sort((a, b) => a.name.localeCompare(b.name));
        
        // Armazenar no cache
        movesCache.set(pokemon.id, organizedMoves);
        
        return organizedMoves;
    } catch (error) {
        console.error('Erro ao processar movimentos:', error);
        return { levelUp: [], machine: [], all: [] };
    }
}

// Função para buscar descrição de uma habilidade
async function fetchAbilityDescription(abilityUrl) {
    try {
        const response = await fetch(abilityUrl);
        const data = await response.json();
        
        // Procurar por descrição em português, se não encontrar, usar inglês
        const portugueseEntry = data.flavor_text_entries.find(entry => entry.language.name === 'pt');
        const englishEntry = data.flavor_text_entries.find(entry => entry.language.name === 'en');
        
        return portugueseEntry ? portugueseEntry.flavor_text : (englishEntry ? englishEntry.flavor_text : 'Descrição não disponível');
    } catch (error) {
        console.error('Erro ao buscar descrição da habilidade:', error);
        return 'Erro ao carregar descrição';
    }
}

// Função para buscar dados de espécie do pokémon
async function fetchPokemonSpecies(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados da espécie:', error);
        return null;
    }
}

// Função para buscar dados da cadeia evolutiva
async function fetchEvolutionChain(evolutionChainUrl) {
    try {
        const response = await fetch(evolutionChainUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar cadeia evolutiva:', error);
        return null;
    }
}

// Função para processar a cadeia evolutiva e extrair informações
function processEvolutionChain(evolutionChain) {
    const evolutions = [];
    
    function extractEvolutions(chainLink) {
        if (chainLink.species) {
            const pokemonId = chainLink.species.url.split('/').slice(-2, -1)[0];
            evolutions.push({
                id: parseInt(pokemonId),
                name: chainLink.species.name,
                trigger: chainLink.evolution_details.length > 0 ? chainLink.evolution_details[0] : null
            });
        }
        
        if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
            chainLink.evolves_to.forEach(evolution => {
                extractEvolutions(evolution);
            });
        }
    }
    
    extractEvolutions(evolutionChain.chain);
    return evolutions;
}

// Função para buscar e processar evoluções de um pokémon
async function fetchPokemonEvolutions(pokemonId) {
    // Verificar cache primeiro
    if (evolutionCache.has(pokemonId)) {
        return evolutionCache.get(pokemonId);
    }
    
    try {
        // Buscar dados da espécie
        const speciesData = await fetchPokemonSpecies(pokemonId);
        if (!speciesData || !speciesData.evolution_chain) {
            return [];
        }
        
        // Buscar cadeia evolutiva
        const evolutionChainData = await fetchEvolutionChain(speciesData.evolution_chain.url);
        if (!evolutionChainData) {
            return [];
        }
        
        // Processar evoluções
        const evolutions = processEvolutionChain(evolutionChainData);
        
        // Armazenar no cache para todos os pokémons da cadeia
        evolutions.forEach(evolution => {
            evolutionCache.set(evolution.id, evolutions);
        });
        
        return evolutions;
    } catch (error) {
        console.error('Erro ao processar evoluções:', error);
        return [];
    }
}

// Função para renderizar evoluções no modal
async function renderEvolutions(pokemonId) {
    const evolutionsContainer = document.getElementById('modal-pokemon-evolutions');
    evolutionsContainer.innerHTML = '<div class="evolution-loading">Carregando evoluções...</div>';
    
    try {
        const evolutions = await fetchPokemonEvolutions(pokemonId);
        
        if (evolutions.length <= 1) {
            evolutionsContainer.innerHTML = '<div class="no-evolutions">Este Pokémon não possui evoluções</div>';
            return;
        }
        
        let evolutionsHtml = '<div class="evolution-chain">';
        
        for (let i = 0; i < evolutions.length; i++) {
            const evolution = evolutions[i];
            const pokemon = allPokemons.find(p => p.id === evolution.id);
            
            if (pokemon) {
                const isCurrentPokemon = evolution.id === pokemonId;
                const evolutionTrigger = evolution.trigger && i > 0 ? getEvolutionTriggerText(evolution.trigger) : '';
                
                evolutionsHtml += `
                    <div class="evolution-step ${isCurrentPokemon ? 'current' : ''}">
                        ${i > 0 ? `<div class="evolution-arrow">→</div>` : ''}
                        <div class="evolution-pokemon" onclick="navigateToPokemon(${evolution.id})" title="Clique para ver detalhes">
                            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                            <div class="evolution-name">${pokemon.name}</div>
                            <div class="evolution-id">#${pokemon.id.toString().padStart(3, '0')}</div>
                            ${evolutionTrigger ? `<div class="evolution-trigger">${evolutionTrigger}</div>` : ''}
                        </div>
                    </div>
                `;
            }
        }
        
        evolutionsHtml += '</div>';
        evolutionsContainer.innerHTML = evolutionsHtml;
        
    } catch (error) {
        console.error('Erro ao renderizar evoluções:', error);
        evolutionsContainer.innerHTML = '<div class="evolution-error">Erro ao carregar evoluções</div>';
    }
}

// Função para obter texto descritivo do gatilho de evolução
function getEvolutionTriggerText(trigger) {
    if (!trigger) return '';
    
    const triggerTexts = [];
    
    if (trigger.min_level) {
        triggerTexts.push(`Nível ${trigger.min_level}`);
    }
    
    if (trigger.item) {
        triggerTexts.push(`${trigger.item.name.replace('-', ' ')}`);
    }
    
    if (trigger.held_item) {
        triggerTexts.push(`Segurando ${trigger.held_item.name.replace('-', ' ')}`);
    }
    
    if (trigger.time_of_day) {
        triggerTexts.push(`Durante o ${trigger.time_of_day === 'day' ? 'dia' : 'noite'}`);
    }
    
    if (trigger.min_happiness) {
        triggerTexts.push(`Felicidade alta`);
    }
    
    if (trigger.min_beauty) {
        triggerTexts.push(`Beleza alta`);
    }
    
    if (trigger.location) {
        triggerTexts.push(`Em ${trigger.location.name.replace('-', ' ')}`);
    }
    
    return triggerTexts.length > 0 ? triggerTexts.join(', ') : 'Evolução especial';
}

// Função para navegar para outro pokémon no modal
function navigateToPokemon(pokemonId) {
    const pokemon = allPokemons.find(p => p.id === pokemonId);
    if (pokemon) {
        openPokemonModal(pokemon);
    }
}

// Variáveis para controle do tooltip de movimentos
let moveTooltipTimeout = null;
let currentMoveTooltip = null;

// Função para mostrar tooltip do movimento com delay
function showMoveTooltip(element, moveUrl, moveName) {
    // Limpar timeout anterior se existir
    if (moveTooltipTimeout) {
        clearTimeout(moveTooltipTimeout);
    }
    
    // Remover tooltip existente
    hideMoveTooltip();
    
    // Configurar novo timeout
    moveTooltipTimeout = setTimeout(async () => {
        // Verificar se ainda estamos sobre o elemento
        if (element.matches(':hover')) {
            await displayMoveTooltip(element, moveUrl, moveName);
        }
    }, 300); // Reduzido de 500ms para 300ms para resposta mais rápida
}

// Função para exibir o tooltip do movimento
async function displayMoveTooltip(element, moveUrl, moveName) {
    // Verificar cache primeiro
    let description;
    if (moveDescriptionCache.has(moveUrl)) {
        description = moveDescriptionCache.get(moveUrl);
    } else {
        description = 'Carregando descrição...';
        // Buscar descrição em background
        fetchMoveDescription(moveUrl).then(desc => {
            moveDescriptionCache.set(moveUrl, desc);
            // Atualizar tooltip se ainda estiver visível
            const tooltip = document.querySelector('.move-tooltip');
            if (tooltip && tooltip.dataset.moveUrl === moveUrl) {
                tooltip.querySelector('.move-tooltip-content').innerHTML = desc.replace(/\n/g, '<br>');
            }
        }).catch(error => {
            console.error('Erro ao carregar descrição:', error);
            const tooltip = document.querySelector('.move-tooltip');
            if (tooltip && tooltip.dataset.moveUrl === moveUrl) {
                tooltip.querySelector('.move-tooltip-content').innerHTML = 'Erro ao carregar descrição';
            }
        });
    }
    
    // Criar tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'move-tooltip';
    tooltip.dataset.moveUrl = moveUrl;
    tooltip.innerHTML = `
        <div class="move-tooltip-arrow"></div>
        <div class="move-tooltip-header">${moveName}</div>
        <div class="move-tooltip-content">${description.replace(/\n/g, '<br>')}</div>
    `;
    
    // Posicionar tooltip
    document.body.appendChild(tooltip);
    currentMoveTooltip = tooltip;
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Posição horizontal (centralizada no elemento)
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Ajustar se sair da tela
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    
    // Posição vertical (acima do elemento)
    let top = rect.top - tooltipRect.height - 10;
    
    // Se não couber acima, colocar abaixo
    if (top < 10) {
        top = rect.bottom + 10;
        tooltip.classList.add('move-tooltip-bottom');
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    // Animação de entrada
    setTimeout(() => {
        tooltip.classList.add('move-tooltip-visible');
    }, 10);
}

// Função para esconder tooltip do movimento
function hideMoveTooltip() {
    // Limpar timeout se existir
    if (moveTooltipTimeout) {
        clearTimeout(moveTooltipTimeout);
        moveTooltipTimeout = null;
    }
    
    // Remover tooltip existente
    if (currentMoveTooltip) {
        currentMoveTooltip.classList.remove('move-tooltip-visible');
        setTimeout(() => {
            if (currentMoveTooltip && currentMoveTooltip.parentNode) {
                currentMoveTooltip.parentNode.removeChild(currentMoveTooltip);
            }
            currentMoveTooltip = null;
        }, 200);
    }
}

// Variáveis para armazenar os movimentos originais para filtragem
let originalMoves = { levelUp: [], machine: [], all: [] };

// Função para filtrar movimentos
function filterMoves() {
    const searchTerm = document.getElementById('moves-search').value.toLowerCase();
    const activeTab = document.querySelector('.moves-tab-content.active').id;
    
    let movesToFilter;
    if (activeTab === 'level-moves') {
        movesToFilter = originalMoves.levelUp;
    } else if (activeTab === 'tm-hm-moves') {
        movesToFilter = originalMoves.machine;
    } else if (activeTab === 'all-moves') {
        movesToFilter = originalMoves.all;
    } else {
        movesToFilter = [];
    }
    
    if (!searchTerm) {
        // Se não há termo de busca, mostrar todos os movimentos
        renderMovesTable(activeTab, movesToFilter);
    } else {
        // Filtrar movimentos baseado no termo de busca
        const filteredMoves = movesToFilter.filter(move => 
            move.name.toLowerCase().includes(searchTerm) ||
            move.type.toLowerCase().includes(searchTerm) ||
            move.damageClass.toLowerCase().includes(searchTerm)
        );
        renderMovesTable(activeTab, filteredMoves);
    }
    
    // Controlar visibilidade do botão X
    toggleClearMovesButton();
}

// Função para limpar filtro de movimentos
function clearMovesFilter() {
    const searchInput = document.getElementById('moves-search');
    searchInput.value = '';
    filterMoves();
    searchInput.focus();
}

// Função para controlar visibilidade do botão X
function toggleClearMovesButton() {
    const searchInput = document.getElementById('moves-search');
    const clearButton = document.getElementById('clear-moves-search');
    
    if (clearButton && searchInput) {
        if (searchInput.value.length > 0) {
            clearButton.classList.add('visible');
        } else {
            clearButton.classList.remove('visible');
        }
    }
}

// Função auxiliar para renderizar tabela de movimentos
function renderMovesTable(tabId, moves) {
    const container = document.getElementById(tabId);
    
    if (!container) {
        console.error('Container não encontrado:', tabId);
        return;
    }
    
    const isLevelMoves = tabId === 'level-moves' || tabId === 'inline-level-moves';
    const isAllMoves = tabId === 'all-moves' || tabId === 'inline-all-moves';
    
    if (moves.length === 0) {
        let noMovesMessage;
        const searchInput = document.getElementById('moves-search') || document.getElementById('inline-moves-search');
        if (searchInput && searchInput.value) {
            noMovesMessage = 'Nenhum movimento encontrado com o filtro aplicado';
        } else {
            if (isLevelMoves) {
                noMovesMessage = 'Este Pokémon não aprende movimentos por nível';
            } else if (isAllMoves) {
                noMovesMessage = 'Este Pokémon não possui movimentos';
            } else {
                noMovesMessage = 'Este Pokémon não pode aprender TMs ou HMs';
            }
        }
            
        container.innerHTML = `<div class="no-moves">${noMovesMessage}</div>`;
        return;
    }
    
    // Para a aba "Todos", incluir coluna de origem (Nível/TM-HM)
    let headerColumns, gridColumns;
    
    if (isAllMoves) {
        headerColumns = ['Origem', 'Nome', 'Tipo', 'Poder', 'Precisão', 'PP', 'Categoria'];
        gridColumns = '80px 1fr 80px 70px 80px 50px 80px';
    } else if (isLevelMoves) {
        headerColumns = ['Nível', 'Nome', 'Tipo', 'Poder', 'Precisão', 'PP', 'Categoria'];
        gridColumns = '60px 1fr 80px 70px 80px 50px 80px';
    } else {
        headerColumns = ['Nome', 'Tipo', 'Poder', 'Precisão', 'PP', 'Categoria'];
        gridColumns = '1fr 80px 70px 80px 50px 80px';
    }
    
    container.innerHTML = `
        <div class="moves-table">
            <div class="moves-header" style="grid-template-columns: ${gridColumns}">
                ${headerColumns.map(col => `<div class="move-${col.toLowerCase().replace('ção', 'cao').replace('ão', 'ao')}">${col}</div>`).join('')}
            </div>
            <div class="moves-body">
                ${moves.map(move => {
                    let rowContent = '';
                    
                    if (isAllMoves) {
                        // Para aba "Todos", mostrar origem do movimento
                        const origin = move.level !== undefined ? `Nv ${move.level}` : 'TM/HM';
                        rowContent += `<div class="move-origin" data-label="Origem">${origin}</div>`;
                    } else if (isLevelMoves) {
                        // Para aba "Por Nível", mostrar nível
                        rowContent += `<div class="move-level" data-label="Nível">${move.level || '-'}</div>`;
                    }
                    
                    rowContent += `
                        <div class="move-name" data-label="Nome" 
                             onmouseenter="showMoveTooltip(this, '${move.url}', '${move.originalName}')" 
                             onmouseleave="hideMoveTooltip()">${move.name}</div>
                        <div class="move-type" data-label="Tipo">
                            <span class="pokemon-type type-${move.type}">${move.type}</span>
                        </div>
                        <div class="move-power" data-label="Poder">${move.power}</div>
                        <div class="move-accuracy" data-label="Precisão">${move.accuracy === null ? '-' : move.accuracy + '%'}</div>
                        <div class="move-pp" data-label="PP">${move.pp}</div>
                        <div class="move-category" data-label="Categoria">
                            <span class="move-category-${move.damageClass}">${move.damageClass}</span>
                        </div>
                    `;
                    
                    return `<div class="move-row" style="grid-template-columns: ${gridColumns}">${rowContent}</div>`;
                }).join('')}
            </div>
        </div>
    `;
}

// Função para renderizar movimentos no modal
async function renderMoves(pokemon) {
    const allMovesContainer = document.getElementById('all-moves');
    const levelMovesContainer = document.getElementById('level-moves');
    const tmHmMovesContainer = document.getElementById('tm-hm-moves');
    
    // Mostrar loading
    allMovesContainer.innerHTML = '<div class="moves-loading">Carregando todos os movimentos...</div>';
    levelMovesContainer.innerHTML = '<div class="moves-loading">Carregando movimentos por nível...</div>';
    tmHmMovesContainer.innerHTML = '<div class="moves-loading">Carregando TMs e HMs...</div>';
    
    try {
        const moves = await fetchPokemonMoves(pokemon);
        
        // Criar lista combinada de todos os movimentos
        const allMoves = [];
        
        // Adicionar movimentos por nível
        moves.levelUp.forEach(move => {
            allMoves.push({
                ...move,
                source: 'level',
                level: move.level
            });
        });
        
        // Adicionar TMs e HMs
        moves.machine.forEach(move => {
            // Verificar se o movimento já está na lista (evitar duplicatas)
            const existingMove = allMoves.find(m => m.name === move.name);
            if (!existingMove) {
                allMoves.push({
                    ...move,
                    source: 'machine',
                    level: undefined
                });
            }
        });
        
        // Ordenar todos os movimentos alfabeticamente
        allMoves.sort((a, b) => a.name.localeCompare(b.name));
        
        // Armazenar movimentos originais para filtragem
        originalMoves = {
            levelUp: moves.levelUp,
            machine: moves.machine,
            all: allMoves
        };
        
        // Renderizar tabelas usando a função auxiliar
        renderMovesTable('all-moves', allMoves);
        renderMovesTable('level-moves', moves.levelUp);
        renderMovesTable('tm-hm-moves', moves.machine);
        
        // Limpar filtro ao carregar novos movimentos
        const searchInput = document.getElementById('moves-search');
        if (searchInput) {
            searchInput.value = '';
            toggleClearMovesButton();
        }
        
    } catch (error) {
        console.error('Erro ao renderizar movimentos:', error);
        allMovesContainer.innerHTML = '<div class="moves-error">Erro ao carregar todos os movimentos</div>';
        levelMovesContainer.innerHTML = '<div class="moves-error">Erro ao carregar movimentos por nível</div>';
        tmHmMovesContainer.innerHTML = '<div class="moves-error">Erro ao carregar TMs e HMs</div>';
    }
}

// Função para alternar entre abas de movimentos
function switchMovesTab(tabName) {
    // Remover classe active de todas as abas
    document.querySelectorAll('.moves-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.moves-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Adicionar classe active à aba selecionada
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Aplicar filtro para a nova aba
    filterMoves();
}

// Função para calcular efetividade combinada de tipos
function calculateTypeEffectiveness(pokemonTypes) {
    let combinedWeaknesses = [];
    let combinedResistances = [];
    let combinedImmunities = [];
    
    // Para cada tipo do pokémon
    pokemonTypes.forEach(type => {
        const typeName = type.type.name;
        if (typeEffectiveness[typeName]) {
            combinedWeaknesses.push(...typeEffectiveness[typeName].weaknesses);
            combinedResistances.push(...typeEffectiveness[typeName].resistances);
            combinedImmunities.push(...typeEffectiveness[typeName].immunities);
        }
    });
    
    // Remover duplicatas e calcular efetividade final
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    const finalWeaknesses = [];
    const finalResistances = [];
    const finalImmunities = [];
    
    allTypes.forEach(attackingType => {
        let effectiveness = 1;
        
        pokemonTypes.forEach(defenderType => {
            const defenderTypeName = defenderType.type.name;
            if (typeEffectiveness[defenderTypeName]) {
                if (typeEffectiveness[defenderTypeName].immunities.includes(attackingType)) {
                    effectiveness *= 0;
                } else if (typeEffectiveness[defenderTypeName].weaknesses.includes(attackingType)) {
                    effectiveness *= 2;
                } else if (typeEffectiveness[defenderTypeName].resistances.includes(attackingType)) {
                    effectiveness *= 0.5;
                }
            }
        });
        
        if (effectiveness === 0) {
            finalImmunities.push(attackingType);
        } else if (effectiveness > 1) {
            finalWeaknesses.push({ type: attackingType, multiplier: effectiveness });
        } else if (effectiveness < 1) {
            finalResistances.push({ type: attackingType, multiplier: effectiveness });
        }
    });
    
    return {
        weaknesses: finalWeaknesses,
        resistances: finalResistances,
        immunities: finalImmunities
    };
}

// Função para abrir o modal com detalhes do pokémon
function openPokemonModal(pokemon) {
    const modal = document.getElementById('pokemon-modal');
    
    // Preencher informações básicas
    document.getElementById('modal-pokemon-name').textContent = pokemon.name;
    document.getElementById('modal-pokemon-id').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    document.getElementById('modal-pokemon-image').src = pokemon.sprites.front_default || pokemon.sprites.other?.['official-artwork']?.front_default || '';
    
    // Preencher tipos
    const typesContainer = document.getElementById('modal-pokemon-types');
    typesContainer.innerHTML = pokemon.types.map(type => 
        `<span class="pokemon-type type-${type.type.name}">${type.type.name}</span>`
    ).join('');
    
    // Preencher estatísticas
    const statsContainer = document.getElementById('modal-pokemon-stats');
    statsContainer.innerHTML = pokemon.stats.map(stat => {
        const statName = stat.stat.name;
        const statValue = stat.base_stat;
        const percentage = Math.min((statValue / 255) * 100, 100); // 255 é aproximadamente o valor máximo
        
        return `
            <div class="stat-bar">
                <div class="stat-bar-label">
                    <span>${statName.replace('-', ' ')}</span>
                    <span class="stat-value">${statValue}</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill stat-${statName}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Calcular e preencher efetividade de tipos
    const effectiveness = calculateTypeEffectiveness(pokemon.types);
    
    document.getElementById('modal-pokemon-weaknesses').innerHTML = 
        effectiveness.weaknesses.length > 0 
            ? effectiveness.weaknesses.map(weakness => {
                const multiplierText = weakness.multiplier === 4 ? ' (4×)' : weakness.multiplier === 2 ? ' (2×)' : '';
                return `<span class="pokemon-type type-${weakness.type}">${weakness.type}${multiplierText}</span>`;
            }).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    document.getElementById('modal-pokemon-resistances').innerHTML = 
        effectiveness.resistances.length > 0 
            ? effectiveness.resistances.map(resistance => {
                const multiplierText = resistance.multiplier === 0.25 ? ' (¼×)' : resistance.multiplier === 0.5 ? ' (½×)' : '';
                return `<span class="pokemon-type type-${resistance.type}">${resistance.type}${multiplierText}</span>`;
            }).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    document.getElementById('modal-pokemon-immunities').innerHTML = 
        effectiveness.immunities.length > 0 
            ? effectiveness.immunities.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    // Preencher habilidades com tooltips
    const abilitiesContainer = document.getElementById('modal-pokemon-abilities');
    abilitiesContainer.innerHTML = pokemon.abilities.map((ability, index) => {
        const abilityName = ability.ability.name.replace('-', ' ');
        const abilityClass = ability.is_hidden ? 'hidden' : '';
        return `
            <div class="ability-item ${abilityClass}" 
                 data-ability-url="${ability.ability.url}" 
                 data-ability-index="${index}"
                 onmouseenter="showAbilityTooltip(this, '${ability.ability.url}')"
                 onmouseleave="hideAbilityTooltip()">
                ${abilityName}
                ${ability.is_hidden ? '<span class="hidden-label">(Oculta)</span>' : ''}
            </div>
        `;
    }).join('');
    
    // Carregar evoluções do pokémon
    renderEvolutions(pokemon.id);
    
    // Carregar movimentos do pokémon
    renderMoves(pokemon);
    
    // Mostrar modal
    modal.style.display = 'flex';
}

// Função para fechar o modal
function closePokemonModal() {
    const modal = document.getElementById('pokemon-modal');
    modal.style.display = 'none';
}

// Função para mostrar detalhes do pokémon
function showPokemonDetails(pokemonId) {
    // Esta variável 'allPokemons' deve estar definida no script principal
    if (typeof allPokemons !== 'undefined') {
        const pokemon = allPokemons.find(p => p.id === pokemonId);
        if (pokemon) {
            openPokemonInline(pokemon);
        }
    } else {
        console.error('Lista de pokémons não encontrada. Certifique-se de que o script principal foi carregado.');
    }
}

// Função para mostrar tooltip da habilidade
async function showAbilityTooltip(element, abilityUrl) {
    // Verificar se já existe um tooltip
    const existingTooltip = document.querySelector('.ability-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Verificar cache primeiro
    let description;
    if (abilityCache.has(abilityUrl)) {
        description = abilityCache.get(abilityUrl);
    } else {
        description = 'Carregando descrição...';
        // Buscar descrição em background
        fetchAbilityDescription(abilityUrl).then(desc => {
            abilityCache.set(abilityUrl, desc);
            // Atualizar tooltip se ainda estiver visível
            const tooltip = document.querySelector('.ability-tooltip');
            if (tooltip && tooltip.dataset.abilityUrl === abilityUrl) {
                tooltip.querySelector('.tooltip-content').textContent = desc;
            }
        });
    }
    
    // Criar tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'ability-tooltip';
    tooltip.dataset.abilityUrl = abilityUrl;
    tooltip.innerHTML = `
        <div class="tooltip-arrow"></div>
        <div class="tooltip-content">${description}</div>
    `;
    
    // Posicionar tooltip
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Posição horizontal (centralizada no elemento)
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Ajustar se sair da tela
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    
    // Posição vertical (acima do elemento)
    let top = rect.top - tooltipRect.height - 10;
    
    // Se não couber acima, colocar abaixo
    if (top < 10) {
        top = rect.bottom + 10;
        tooltip.classList.add('tooltip-bottom');
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    // Animação de entrada
    setTimeout(() => {
        tooltip.classList.add('tooltip-visible');
    }, 10);
}

// Função para esconder tooltip da habilidade
function hideAbilityTooltip() {
    const tooltip = document.querySelector('.ability-tooltip');
    if (tooltip) {
        tooltip.classList.remove('tooltip-visible');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 200);
    }
}

// Inicializar event listeners do modal quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para o modal
    const modal = document.getElementById('pokemon-modal');
    const closeButton = document.querySelector('.close');
    
    if (closeButton) {
        closeButton.addEventListener('click', closePokemonModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePokemonModal();
            }
        });
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePokemonModal();
            closeInlineDetails(); // Também fechar detalhes inline com ESC
        }
    });
    
    // Event listeners para os detalhes inline
    const closeInlineBtn = document.getElementById('close-inline-details');
    if (closeInlineBtn) {
        closeInlineBtn.addEventListener('click', closeInlineDetails);
    }
    
    // Event listeners para as abas de movimentos
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('moves-tab-btn')) {
            const tabName = e.target.getAttribute('data-tab');
            switchMovesTab(tabName);
        }
    });
    
    // Event listeners para o filtro de movimentos
    const movesSearchInput = document.getElementById('moves-search');
    const clearMovesSearchBtn = document.getElementById('clear-moves-search');
    
    if (movesSearchInput) {
        movesSearchInput.addEventListener('input', function() {
            filterMoves();
            toggleClearMovesButton();
        });
        
        movesSearchInput.addEventListener('keyup', toggleClearMovesButton);
    }
    
    if (clearMovesSearchBtn) {
        clearMovesSearchBtn.addEventListener('click', clearMovesFilter);
    }
});

// ====== FUNÇÕES PARA DETALHES INLINE ======

// Função para abrir detalhes inline na própria página
function openPokemonInline(pokemon) {
    // Esconder listagem de Pokémon
    const pokemonsContainer = document.getElementById('pokemons-container');
    pokemonsContainer.style.display = 'none';
    
    // Mostrar área de detalhes inline
    const inlineDetails = document.getElementById('pokemon-inline-details');
    inlineDetails.style.display = 'block';
    
    // Preencher informações básicas
    document.getElementById('inline-pokemon-name').textContent = pokemon.name;
    document.getElementById('inline-pokemon-id').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    document.getElementById('inline-pokemon-image').src = pokemon.sprites.front_default || pokemon.sprites.other?.['official-artwork']?.front_default || '';
    
    // Preencher tipos
    const typesContainer = document.getElementById('inline-pokemon-types');
    typesContainer.innerHTML = pokemon.types.map(type => 
        `<span class="pokemon-type type-${type.type.name}">${type.type.name}</span>`
    ).join('');
    
    // Preencher estatísticas
    const statsContainer = document.getElementById('inline-pokemon-stats');
    statsContainer.innerHTML = pokemon.stats.map(stat => {
        const statName = stat.stat.name;
        const statValue = stat.base_stat;
        const percentage = Math.min((statValue / 255) * 100, 100);
        
        // Mapear nome da stat para classe CSS
        const statClass = statName.replace('-', '-');
        
        return `
            <div class="stat-bar">
                <div class="stat-bar-label">
                    <span>${statName.replace('-', ' ')}</span>
                    <span class="stat-value">${statValue}</span>
                </div>
                <div class="stat-bar-background">
                    <div class="stat-bar-fill stat-${statClass}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    // Calcular efetividade de tipos
    const effectiveness = calculateTypeEffectiveness(pokemon.types);
    
    document.getElementById('inline-pokemon-weaknesses').innerHTML = 
        effectiveness.weaknesses.length > 0 
            ? effectiveness.weaknesses.map(weakness => {
                const multiplierText = weakness.multiplier === 4 ? ' (4×)' : weakness.multiplier === 2 ? ' (2×)' : '';
                return `<span class="pokemon-type type-${weakness.type}">${weakness.type}${multiplierText}</span>`;
            }).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    document.getElementById('inline-pokemon-resistances').innerHTML = 
        effectiveness.resistances.length > 0 
            ? effectiveness.resistances.map(resistance => {
                const multiplierText = resistance.multiplier === 0.25 ? ' (¼×)' : resistance.multiplier === 0.5 ? ' (½×)' : '';
                return `<span class="pokemon-type type-${resistance.type}">${resistance.type}${multiplierText}</span>`;
            }).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    document.getElementById('inline-pokemon-immunities').innerHTML = 
        effectiveness.immunities.length > 0 
            ? effectiveness.immunities.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    // Preencher habilidades com tooltips
    const abilitiesContainer = document.getElementById('inline-pokemon-abilities');
    abilitiesContainer.innerHTML = pokemon.abilities.map((ability, index) => {
        const abilityName = ability.ability.name.replace('-', ' ');
        const isHidden = ability.is_hidden;
        const hiddenClass = isHidden ? ' hidden' : '';
        const hiddenText = isHidden ? ' (Habilidade Oculta)' : '';
        return `
            <span class="ability-item${hiddenClass}" 
                  onmouseenter="showAbilityTooltip(this, '${ability.ability.url}')" 
                  onmouseleave="hideAbilityTooltip()">
                ${abilityName}${hiddenText}
            </span>
        `;
    }).join(', ');
    
    // Buscar e carregar evoluções
    loadPokemonEvolutions(pokemon, 'inline-pokemon-evolutions');
    
    // Renderizar movimentos inline
    renderInlineMoves(pokemon);
    
    // Configurar event listeners para as abas de movimentos inline
    setupInlineMoveTabs();
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para carregar evoluções do Pokémon
async function loadPokemonEvolutions(pokemon, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="evolution-loading">Carregando evoluções...</div>';
    
    try {
        // Buscar dados da espécie para obter a chain de evolução
        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();
        
        // Buscar a chain de evolução
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        // Processar a chain de evolução
        const evolutionChain = await processEvolutionChain(evolutionData.chain);
        
        // Renderizar as evoluções
        if (evolutionChain.length > 1) {
            container.innerHTML = `
                <div class="evolution-chain">
                    ${evolutionChain.map((evo, index) => {
                        const isCurrentPokemon = evo.id === pokemon.id;
                        const currentClass = isCurrentPokemon ? ' current' : '';
                        return `
                            <div class="evolution-step${currentClass}">
                                <div class="evolution-pokemon" onclick="showPokemonDetails(${evo.id})">
                                    <img src="${evo.sprite}" alt="${evo.name}">
                                    <div class="evolution-name">${evo.name}</div>
                                    <div class="evolution-id">#${evo.id.toString().padStart(3, '0')}</div>
                                </div>
                            </div>
                            ${index < evolutionChain.length - 1 ? '<div class="evolution-arrow">→</div>' : ''}
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div class="no-evolutions">Este Pokémon não possui evoluções.</div>';
        }
        
    } catch (error) {
        console.error('Erro ao carregar evoluções:', error);
        container.innerHTML = '<div class="evolution-error">Erro ao carregar evoluções.</div>';
    }
}

// Função para processar a chain de evolução recursivamente
async function processEvolutionChain(chain) {
    const evolutions = [];
    
    // Função recursiva para percorrer a chain
    async function parseChain(currentChain) {
        // Buscar dados do Pokémon atual
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentChain.species.name}`);
        const pokemonData = await pokemonResponse.json();
        
        evolutions.push({
            id: pokemonData.id,
            name: currentChain.species.name,
            sprite: pokemonData.sprites.front_default || pokemonData.sprites.other?.['official-artwork']?.front_default || ''
        });
        
        // Processar evoluções seguintes
        for (const evolution of currentChain.evolves_to) {
            await parseChain(evolution);
        }
    }
    
    await parseChain(chain);
    return evolutions;
}

// Função para fechar detalhes inline
function closeInlineDetails() {
    // Esconder área de detalhes inline
    document.getElementById('pokemon-inline-details').style.display = 'none';
    
    // Mostrar listagem de Pokémon com layout correto
    const pokemonsContainer = document.getElementById('pokemons-container');
    pokemonsContainer.style.display = 'flex'; // Manter o layout flex original
}

// Função para renderizar movimentos inline
async function renderInlineMoves(pokemon) {
    const allMovesContainer = document.getElementById('inline-all-moves');
    const levelMovesContainer = document.getElementById('inline-level-moves');
    const tmHmMovesContainer = document.getElementById('inline-tm-hm-moves');
    
    // Verificar se os containers existem
    if (!allMovesContainer || !levelMovesContainer || !tmHmMovesContainer) {
        console.error('Containers de movimentos inline não encontrados');
        return;
    }
    
    // Mostrar loading
    allMovesContainer.innerHTML = '<div class="moves-loading">Carregando todos os movimentos...</div>';
    levelMovesContainer.innerHTML = '<div class="moves-loading">Carregando movimentos por nível...</div>';
    tmHmMovesContainer.innerHTML = '<div class="moves-loading">Carregando TMs e HMs...</div>';
    
    try {
        const pokemonMoves = await fetchPokemonMoves(pokemon);
        
        // Renderizar movimentos nas respectivas abas usando containers diretos
        renderMovesTable('inline-all-moves', pokemonMoves.all);
        renderMovesTable('inline-level-moves', pokemonMoves.levelUp);
        renderMovesTable('inline-tm-hm-moves', pokemonMoves.machine);
        
        // Configurar filtro para inline
        setupInlineMovesFilter(pokemonMoves);
        
    } catch (error) {
        console.error('Erro ao carregar movimentos:', error);
        allMovesContainer.innerHTML = '<div class="moves-error">Erro ao carregar todos os movimentos</div>';
        levelMovesContainer.innerHTML = '<div class="moves-error">Erro ao carregar movimentos por nível</div>';
        tmHmMovesContainer.innerHTML = '<div class="moves-error">Erro ao carregar TMs e HMs</div>';
    }
}

// Configurar abas de movimentos inline
function setupInlineMoveTabs() {
    const tabButtons = document.querySelectorAll('#pokemon-inline-details .moves-tab-btn');
    const tabContents = document.querySelectorAll('#pokemon-inline-details .moves-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover classe active de todas as abas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active na aba clicada
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Aplicar filtro para a nova aba
            filterInlineMoves();
        });
    });
}

// Configurar filtro de movimentos inline
function setupInlineMovesFilter(pokemonMoves) {
    const searchInput = document.getElementById('inline-moves-search');
    const clearButton = document.getElementById('inline-clear-moves-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterInlineMoves);
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            filterInlineMoves();
        });
    }
}

// Filtrar movimentos inline
function filterInlineMoves() {
    const searchTerm = document.getElementById('inline-moves-search')?.value.toLowerCase() || '';
    const activeTab = document.querySelector('#pokemon-inline-details .moves-tab-btn.active')?.getAttribute('data-tab');
    
    if (!activeTab) return;
    
    const movesContainer = document.getElementById(activeTab);
    const moveRows = movesContainer.querySelectorAll('.move-row');
    
    moveRows.forEach(row => {
        const moveName = row.querySelector('.move-name')?.textContent.toLowerCase() || '';
        const shouldShow = moveName.includes(searchTerm);
        row.style.display = shouldShow ? 'grid' : 'none';
    });
}