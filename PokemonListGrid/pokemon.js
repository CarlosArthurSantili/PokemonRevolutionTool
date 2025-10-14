// --- FUNCIONALIDADE DOS POKÉMONS ---

let allPokemons = [];
let displayedPokemons = [];

// Função para buscar dados de um pokémon específico
async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados do pokémon:', error);
        return null;
    }
}

// Função para carregar lista de pokémons da PokéAPI
async function loadPokemons() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const pokemonsContainer = document.getElementById('pokemons-container');
    
    loadingSpinner.style.display = 'flex';
    pokemonsContainer.innerHTML = '';
    
    try {
        // Buscar lista de pokémons (até a 8ª geração - 905 pokémons)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=905');
        const data = await response.json();
        
        // Buscar detalhes de cada pokémon em lotes para melhor performance
        const batchSize = 50;
        allPokemons = [];
        
        for (let i = 0; i < data.results.length; i += batchSize) {
            const batch = data.results.slice(i, i + batchSize);
            const pokemonPromises = batch.map(pokemon => fetchPokemonData(pokemon.url));
            const batchResults = await Promise.all(pokemonPromises);
            
            // Filtrar pokémons que carregaram com sucesso
            const validPokemons = batchResults.filter(pokemon => pokemon !== null);
            allPokemons.push(...validPokemons);
            
            // Atualizar o loading para mostrar progresso
            const progress = Math.round(((i + batchSize) / data.results.length) * 100);
            const spinner = document.querySelector('.loading-spinner span');
            if (spinner) {
                spinner.textContent = `Carregando pokémons... ${progress}%`;
            }
        }
        
        // Ordenar por ID para manter ordem correta
        allPokemons.sort((a, b) => a.id - b.id);
        
        displayedPokemons = [...allPokemons];
        displayPokemons(displayedPokemons);
        
    } catch (error) {
        console.error('Erro ao carregar pokémons:', error);
        pokemonsContainer.innerHTML = '<div class="error-message">Erro ao carregar pokémons. Verifique sua conexão com a internet.</div>';
    } finally {
        loadingSpinner.style.display = 'none';
        // Resetar texto do loading
        const spinner = document.querySelector('.loading-spinner span');
        if (spinner) {
            spinner.textContent = 'Carregando pokémons...';
        }
    }
}

// Função para exibir pokémons na tela
function displayPokemons(pokemons) {
    const container = document.getElementById('pokemons-container');
    
    if (pokemons.length === 0) {
        container.innerHTML = '<div class="error-message">Nenhum pokémon encontrado.</div>';
        return;
    }
    
    container.innerHTML = pokemons.map(pokemon => createPokemonCard(pokemon)).join('');
}

// Função para criar card de um pokémon
function createPokemonCard(pokemon) {
    const types = pokemon.types.map(type => 
        `<span class="pokemon-type type-${type.type.name}">${type.type.name}</span>`
    ).join('');
    
    return `
        <div class="pokemon-card" onclick="showPokemonDetails(${pokemon.id})">
            <div class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</div>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='">
            <h3>${pokemon.name}</h3>
            <div class="pokemon-types">${types}</div>
        </div>
    `;
}

// Função para filtrar pokémons por busca
function filterPokemons() {
    const searchTerm = document.getElementById('pokemon-search').value.toLowerCase();
    const generationFilter = document.getElementById('generation-filter').value;
    
    let filtered = allPokemons;
    
    // Filtrar por nome
    if (searchTerm) {
        filtered = filtered.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm) ||
            pokemon.id.toString().includes(searchTerm)
        );
    }
    
    // Filtrar por geração
    if (generationFilter) {
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
        
        if (genRanges[generationFilter]) {
            const [min, max] = genRanges[generationFilter];
            filtered = filtered.filter(pokemon => pokemon.id >= min && pokemon.id <= max);
        }
    }
    
    displayedPokemons = filtered;
    displayPokemons(displayedPokemons);
}

// Função alternativa para carregar apenas pokémons de uma geração específica
async function loadPokemonsByGeneration(generation) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const pokemonsContainer = document.getElementById('pokemons-container');
    
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
    
    if (!genRanges[generation]) {
        console.error('Geração inválida:', generation);
        return;
    }
    
    const [min, max] = genRanges[generation];
    const count = max - min + 1;
    
    loadingSpinner.style.display = 'flex';
    pokemonsContainer.innerHTML = '';
    
    try {
        const pokemonUrls = [];
        for (let i = min; i <= max; i++) {
            pokemonUrls.push(`https://pokeapi.co/api/v2/pokemon/${i}`);
        }
        
        const pokemonPromises = pokemonUrls.map(url => fetchPokemonData(url));
        const generationPokemons = await Promise.all(pokemonPromises);
        
        // Filtrar pokémons que carregaram com sucesso
        const validPokemons = generationPokemons.filter(pokemon => pokemon !== null);
        
        // Adicionar à lista geral se ainda não existir
        validPokemons.forEach(pokemon => {
            if (!allPokemons.find(p => p.id === pokemon.id)) {
                allPokemons.push(pokemon);
            }
        });
        
        // Ordenar por ID
        allPokemons.sort((a, b) => a.id - b.id);
        
        // Aplicar filtro atual
        filterPokemons();
        
    } catch (error) {
        console.error('Erro ao carregar pokémons da geração:', error);
        pokemonsContainer.innerHTML = '<div class="error-message">Erro ao carregar pokémons da geração selecionada.</div>';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Função para carregar todos os pokémons de todas as gerações
async function loadAllPokemons() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const pokemonsContainer = document.getElementById('pokemons-container');
    
    loadingSpinner.style.display = 'flex';
    pokemonsContainer.innerHTML = '';
    
    try {
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
        
        // Carregar cada geração que ainda não foi carregada
        for (const [generation, [min, max]] of Object.entries(genRanges)) {
            const hasGenerationPokemons = allPokemons.some(p => p.id >= min && p.id <= max);
            
            if (!hasGenerationPokemons) {
                const spinner = document.querySelector('.loading-spinner span');
                if (spinner) {
                    spinner.textContent = `Carregando Geração ${generation}...`;
                }
                
                // Carregar pokémons desta geração
                const pokemonUrls = [];
                for (let i = min; i <= max; i++) {
                    pokemonUrls.push(`https://pokeapi.co/api/v2/pokemon/${i}`);
                }
                
                // Carregar em lotes menores para melhor performance
                const batchSize = 30;
                for (let i = 0; i < pokemonUrls.length; i += batchSize) {
                    const batch = pokemonUrls.slice(i, i + batchSize);
                    const pokemonPromises = batch.map(url => fetchPokemonData(url));
                    const batchResults = await Promise.all(pokemonPromises);
                    
                    // Filtrar pokémons que carregaram com sucesso
                    const validPokemons = batchResults.filter(pokemon => pokemon !== null);
                    
                    // Adicionar à lista geral se ainda não existir
                    validPokemons.forEach(pokemon => {
                        if (!allPokemons.find(p => p.id === pokemon.id)) {
                            allPokemons.push(pokemon);
                        }
                    });
                }
            }
        }
        
        // Ordenar por ID para manter ordem correta
        allPokemons.sort((a, b) => a.id - b.id);
        
        displayedPokemons = [...allPokemons];
        displayPokemons(displayedPokemons);
        
    } catch (error) {
        console.error('Erro ao carregar todos os pokémons:', error);
        pokemonsContainer.innerHTML = '<div class="error-message">Erro ao carregar todos os pokémons. Verifique sua conexão com a internet.</div>';
    } finally {
        loadingSpinner.style.display = 'none';
        // Resetar texto do loading
        const spinner = document.querySelector('.loading-spinner span');
        if (spinner) {
            spinner.textContent = 'Carregando pokémons...';
        }
    }
}

// Event listeners para os controles de pesquisa e navegação
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('pokemon-search');
    const clearSearchBtn = document.getElementById('clear-search');
    const generationSelect = document.getElementById('generation-filter');
    
    if (searchInput) {
        // Event listener para input de busca
        searchInput.addEventListener('input', function() {
            filterPokemons();
            toggleClearButton();
        });
        
        // Event listener para detectar mudanças no valor (incluindo programáticas)
        searchInput.addEventListener('propertychange', toggleClearButton);
        searchInput.addEventListener('keyup', toggleClearButton);
        
        // Verificar estado inicial
        toggleClearButton();
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            toggleClearButton();
            filterPokemons();
            searchInput.focus();
        });
    }
    
    // Função para mostrar/esconder o botão X
    function toggleClearButton() {
        if (clearSearchBtn && searchInput) {
            if (searchInput.value.length > 0) {
                clearSearchBtn.classList.add('visible');
            } else {
                clearSearchBtn.classList.remove('visible');
            }
        }
    }
    
    if (generationSelect) {
        generationSelect.addEventListener('change', async function() {
            const selectedGeneration = this.value;
            
            if (selectedGeneration) {
                // Verificar se já temos pokémons dessa geração carregados
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
                
                const [min, max] = genRanges[selectedGeneration];
                const hasGenerationPokemons = allPokemons.some(p => p.id >= min && p.id <= max);
                
                if (!hasGenerationPokemons) {
                    // Carregar pokémons da geração específica
                    await loadPokemonsByGeneration(selectedGeneration);
                } else {
                    // Apenas aplicar filtro
                    filterPokemons();
                }
            } else {
                // Se "Todas as Gerações" foi selecionado, verificar se temos todos os pokémons
                const totalExpectedPokemons = 905; // Total até a 8ª geração
                
                if (allPokemons.length < totalExpectedPokemons) {
                    // Carregar todos os pokémons se ainda não temos todos
                    await loadAllPokemons();
                } else {
                    // Apenas aplicar filtro (mostrar todos)
                    filterPokemons();
                }
            }
        });
    }
    
    // Carregar pokémons quando a aba for acessada pela primeira vez
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            if (targetId === 'section-pokemons' && allPokemons.length === 0) {
                // Verificar qual geração está selecionada no dropdown
                const generationSelect = document.getElementById('generation-filter');
                const selectedGeneration = generationSelect ? generationSelect.value : '';
                
                if (selectedGeneration) {
                    // Se uma geração específica está selecionada, carregar apenas ela
                    loadPokemonsByGeneration(selectedGeneration);
                } else {
                    // Se "Todas as Gerações" está selecionado (valor vazio), carregar todas
                    loadAllPokemons();
                }
            }
        });
    });
});