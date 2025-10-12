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
            finalWeaknesses.push(attackingType);
        } else if (effectiveness < 1) {
            finalResistances.push(attackingType);
        }
    });
    
    return {
        weaknesses: [...new Set(finalWeaknesses)],
        resistances: [...new Set(finalResistances)],
        immunities: [...new Set(finalImmunities)]
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
            ? effectiveness.weaknesses.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    document.getElementById('modal-pokemon-resistances').innerHTML = 
        effectiveness.resistances.length > 0 
            ? effectiveness.resistances.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    document.getElementById('modal-pokemon-immunities').innerHTML = 
        effectiveness.immunities.length > 0 
            ? effectiveness.immunities.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')
            : '<span style="color: #666;">Nenhuma</span>';
    
    // Preencher habilidades
    const abilitiesContainer = document.getElementById('modal-pokemon-abilities');
    abilitiesContainer.innerHTML = pokemon.abilities.map(ability => 
        `<div class="ability-item ${ability.is_hidden ? 'hidden' : ''}">${ability.ability.name.replace('-', ' ')}</div>`
    ).join('');
    
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
            openPokemonModal(pokemon);
        }
    } else {
        console.error('Lista de pokémons não encontrada. Certifique-se de que o script principal foi carregado.');
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
        }
    });
});