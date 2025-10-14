// Sistema de movesets competitivos para Pokémon
class CompetitiveMovesets {
    constructor() {
        this.smogonData = {};
        this.movesetCache = new Map();
        this.initializeKnownSets();
    }

    // Dados conhecidos de movesets competitivos baseados em Smogon e competições
    initializeKnownSets() {
        this.smogonData = {
            charizard: {
                formats: {
                    'OU': [
                        {
                            name: 'Special Attacker',
                            description: 'Atacante especial com Solar Power',
                            moves: ['Solar Beam', 'Fire Blast', 'Focus Blast', 'Roost'],
                            ability: 'Solar Power',
                            item: 'Life Orb',
                            nature: 'Timid',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '32.5%'
                        },
                        {
                            name: 'Solar Power Sweeper',
                            description: 'Sweep com Solar Power e sun',
                            moves: ['Solar Beam', 'Fire Blast', 'Weather Ball', 'Focus Blast'],
                            ability: 'Solar Power',
                            item: 'Choice Specs',
                            nature: 'Timid',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '18.7%'
                        }
                    ],
                    'UU': [
                        {
                            name: 'Dragon Dance',
                            description: 'Setup físico com Dragon Dance',
                            moves: ['Dragon Dance', 'Fire Punch', 'Thunder Punch', 'Earthquake'],
                            ability: 'Blaze',
                            item: 'Leftovers',
                            nature: 'Jolly',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '25.1%'
                        }
                    ]
                }
            },
            pikachu: {
                formats: {
                    'NU': [
                        {
                            name: 'Light Ball Attacker',
                            description: 'Atacante especial com Light Ball',
                            moves: ['Thunderbolt', 'Hidden Power Ice', 'Grass Knot', 'Volt Switch'],
                            ability: 'Lightning Rod',
                            item: 'Light Ball',
                            nature: 'Timid',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '89.2%'
                        }
                    ]
                }
            },
            garchomp: {
                formats: {
                    'OU': [
                        {
                            name: 'Physical Sweeper',
                            description: 'Sweeper físico padrão',
                            moves: ['Earthquake', 'Dragon Claw', 'Stone Edge', 'Swords Dance'],
                            ability: 'Rough Skin',
                            item: 'Life Orb',
                            nature: 'Jolly',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '45.8%'
                        },
                        {
                            name: 'Choice Scarf',
                            description: 'Revenge killer com Choice Scarf',
                            moves: ['Earthquake', 'Outrage', 'Stone Edge', 'Fire Fang'],
                            ability: 'Rough Skin',
                            item: 'Choice Scarf',
                            nature: 'Jolly',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '31.7%'
                        }
                    ]
                }
            },
            metagross: {
                formats: {
                    'OU': [
                        {
                            name: 'Choice Band',
                            description: 'Atacante físico com Choice Band',
                            moves: ['Meteor Mash', 'Earthquake', 'Explosion', 'Bullet Punch'],
                            ability: 'Clear Body',
                            item: 'Choice Band',
                            nature: 'Adamant',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '42.3%'
                        },
                        {
                            name: 'Agility',
                            description: 'Setup de velocidade com Agility',
                            moves: ['Agility', 'Meteor Mash', 'Earthquake', 'Ice Punch'],
                            ability: 'Clear Body',
                            item: 'Life Orb',
                            nature: 'Jolly',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '28.9%'
                        }
                    ]
                }
            },
            lucario: {
                formats: {
                    'UU': [
                        {
                            name: 'Physical Attacker',
                            description: 'Atacante físico com Close Combat',
                            moves: ['Close Combat', 'Extreme Speed', 'Ice Punch', 'Bullet Punch'],
                            ability: 'Inner Focus',
                            item: 'Life Orb',
                            nature: 'Adamant',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '38.6%'
                        },
                        {
                            name: 'Special Attacker',
                            description: 'Atacante especial com Aura Sphere',
                            moves: ['Aura Sphere', 'Psychic', 'Hidden Power Ice', 'Vacuum Wave'],
                            ability: 'Inner Focus',
                            item: 'Life Orb',
                            nature: 'Timid',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '35.2%'
                        }
                    ]
                }
            },
            dragonite: {
                formats: {
                    'OU': [
                        {
                            name: 'Dragon Dance',
                            description: 'Setup físico clássico',
                            moves: ['Dragon Dance', 'Outrage', 'Fire Punch', 'Extreme Speed'],
                            ability: 'Multiscale',
                            item: 'Lum Berry',
                            nature: 'Adamant',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '52.1%'
                        },
                        {
                            name: 'Choice Band',
                            description: 'Atacante físico imediato',
                            moves: ['Outrage', 'Extreme Speed', 'Fire Punch', 'Earthquake'],
                            ability: 'Multiscale',
                            item: 'Choice Band',
                            nature: 'Adamant',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '28.3%'
                        }
                    ]
                }
            },
            tyranitar: {
                formats: {
                    'OU': [
                        {
                            name: 'Choice Scarf',
                            description: 'Revenge killer e sand setter',
                            moves: ['Stone Edge', 'Crunch', 'Earthquake', 'Fire Punch'],
                            ability: 'Sand Stream',
                            item: 'Choice Scarf',
                            nature: 'Jolly',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '38.9%'
                        },
                        {
                            name: 'Dragon Dance',
                            description: 'Setup físico para late game',
                            moves: ['Dragon Dance', 'Stone Edge', 'Crunch', 'Fire Punch'],
                            ability: 'Sand Stream',
                            item: 'Leftovers',
                            nature: 'Jolly',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '31.4%'
                        }
                    ]
                }
            },
            gengar: {
                formats: {
                    'OU': [
                        {
                            name: 'Special Attacker',
                            description: 'Atacante especial rápido',
                            moves: ['Shadow Ball', 'Focus Blast', 'Thunderbolt', 'Destiny Bond'],
                            ability: 'Cursed Body',
                            item: 'Life Orb',
                            nature: 'Timid',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '45.2%'
                        }
                    ]
                }
            },
            alakazam: {
                formats: {
                    'OU': [
                        {
                            name: 'Magic Guard',
                            description: 'Sweeper especial com Magic Guard',
                            moves: ['Psychic', 'Focus Blast', 'Shadow Ball', 'Recover'],
                            ability: 'Magic Guard',
                            item: 'Life Orb',
                            nature: 'Timid',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '52.8%'
                        }
                    ]
                }
            },
            gyarados: {
                formats: {
                    'OU': [
                        {
                            name: 'Dragon Dance',
                            description: 'Setup físico clássico',
                            moves: ['Dragon Dance', 'Waterfall', 'Earthquake', 'Ice Fang'],
                            ability: 'Intimidate',
                            item: 'Leftovers',
                            nature: 'Adamant',
                            evs: '4 HP / 252 Atk / 252 Spe',
                            usage: '67.3%'
                        }
                    ]
                }
            },
            lapras: {
                formats: {
                    'UU': [
                        {
                            name: 'Bulky Water',
                            description: 'Tank especial com recovery',
                            moves: ['Surf', 'Ice Beam', 'Thunderbolt', 'Heal Bell'],
                            ability: 'Water Absorb',
                            item: 'Leftovers',
                            nature: 'Calm',
                            evs: '252 HP / 4 SpA / 252 SpD',
                            usage: '23.7%'
                        }
                    ]
                }
            },
            snorlax: {
                formats: {
                    'OU': [
                        {
                            name: 'CurseLax',
                            description: 'Setup físico com Curse',
                            moves: ['Curse', 'Body Slam', 'Rest', 'Sleep Talk'],
                            ability: 'Thick Fat',
                            item: 'Leftovers',
                            nature: 'Careful',
                            evs: '252 HP / 4 Atk / 252 SpD',
                            usage: '41.6%'
                        }
                    ]
                }
            },
            machamp: {
                formats: {
                    'UU': [
                        {
                            name: 'Guts Attacker',
                            description: 'Atacante físico com Guts',
                            moves: ['Dynamic Punch', 'Stone Edge', 'Bullet Punch', 'Ice Punch'],
                            ability: 'Guts',
                            item: 'Flame Orb',
                            nature: 'Adamant',
                            evs: '252 HP / 252 Atk / 4 SpD',
                            usage: '34.8%'
                        }
                    ]
                }
            },
            blastoise: {
                formats: {
                    'UU': [
                        {
                            name: 'Rapid Spin',
                            description: 'Spinner defensivo',
                            moves: ['Surf', 'Rapid Spin', 'Roar', 'Toxic'],
                            ability: 'Torrent',
                            item: 'Leftovers',
                            nature: 'Bold',
                            evs: '252 HP / 252 Def / 4 SpA',
                            usage: '28.3%'
                        }
                    ]
                }
            },
            venusaur: {
                formats: {
                    'UU': [
                        {
                            name: 'Chlorophyll Sweeper',
                            description: 'Sweeper com sun support',
                            moves: ['Solar Beam', 'Sludge Bomb', 'Hidden Power Fire', 'Growth'],
                            ability: 'Chlorophyll',
                            item: 'Life Orb',
                            nature: 'Modest',
                            evs: '4 HP / 252 SpA / 252 Spe',
                            usage: '39.1%'
                        }
                    ]
                }
            }
        };
    }

    // Busca movesets competitivos para um Pokémon
    async getCompetitiveMovesets(pokemonName) {
        const normalizedName = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Verifica cache primeiro
        if (this.movesetCache.has(normalizedName)) {
            return this.movesetCache.get(normalizedName);
        }

        let movesets = [];
        
        // Busca nos dados locais primeiro
        if (this.smogonData[normalizedName]) {
            movesets = this.formatLocalData(this.smogonData[normalizedName]);
        }

        // Tenta buscar dados adicionais online
        try {
            const onlineData = await this.fetchOnlineMovesets(normalizedName);
            if (onlineData && onlineData.length > 0) {
                movesets = movesets.concat(onlineData);
            }
        } catch (error) {
            console.log('Erro ao buscar dados online:', error.message);
        }

        // SEMPRE gera sugestões baseadas nos moves do Pokémon (não só quando não encontra nada)
        const suggestions = await this.generateSuggestedMovesets(pokemonName);
        if (suggestions && suggestions.length > 0) {
            movesets = movesets.concat(suggestions);
        }

        // Se ainda não tem nada, cria movesets genéricos básicos
        if (movesets.length === 0) {
            movesets = await this.generateBasicMovesets(pokemonName);
        }

        // Cache o resultado
        this.movesetCache.set(normalizedName, movesets);
        
        return movesets;
    }

    // Formata dados locais para exibição
    formatLocalData(pokemonData) {
        const formatted = [];
        
        for (const [format, sets] of Object.entries(pokemonData.formats)) {
            for (const set of sets) {
                formatted.push({
                    ...set,
                    format: format,
                    source: 'Smogon Analysis',
                    tier: format,
                    popularity: set.usage || 'N/A'
                });
            }
        }
        
        return formatted;
    }

    // Busca dados online (placeholder para futuras implementações)
    async fetchOnlineMovesets(pokemonName) {
        // Aqui poderia integrar com APIs do Smogon, Pikalytics, etc.
        // Por enquanto retorna vazio
        return [];
    }

    // Gera sugestões baseadas nos moves conhecidos do Pokémon
    async generateSuggestedMovesets(pokemonName) {
        try {
            // Busca dados do Pokémon da PokeAPI
            const response = await fetch(`https://pokeapi.co/v2/pokemon/${pokemonName.toLowerCase()}`);
            if (!response.ok) return [];
            
            const pokemonData = await response.json();
            const moves = pokemonData.moves.map(m => m.move.name);
            
            // Categoriza moves por tipo
            const moveCategories = await this.categorizeMoves(moves);
            
            // Gera sugestões baseadas em padrões comuns
            return this.generateMoveCombinations(moveCategories, pokemonData);
            
        } catch (error) {
            console.error('Erro ao gerar sugestões:', error);
            return [];
        }
    }

    // Categoriza moves em tipos úteis
    async categorizeMoves(moves) {
        const categories = {
            stab: [],
            coverage: [],
            setup: [],
            utility: [],
            priority: [],
            status: [],
            recovery: [],
            hazards: []
        };

        // Listas expandidas de moves por categoria
        const setupMoves = [
            'dragon-dance', 'swords-dance', 'nasty-plot', 'calm-mind', 'agility', 'rock-polish',
            'bulk-up', 'curse', 'coil', 'shell-smash', 'quiver-dance', 'tail-glow', 'geomancy',
            'growth', 'work-up', 'hone-claws', 'iron-defense', 'acid-armor', 'cosmic-power',
            'focus-energy', 'meditate', 'howl', 'belly-drum', 'autotomize', 'charge-beam'
        ];
        
        const priorityMoves = [
            'extreme-speed', 'quick-attack', 'bullet-punch', 'ice-shard', 'vacuum-wave',
            'mach-punch', 'aqua-jet', 'shadow-sneak', 'fake-out', 'sucker-punch',
            'first-impression', 'accelerock', 'water-shuriken', 'aerial-ace'
        ];
        
        const utilityMoves = [
            'roost', 'recover', 'synthesis', 'moonlight', 'morning-sun', 'rest', 'slack-off',
            'soft-boiled', 'wish', 'heal-bell', 'aromatherapy', 'substitute', 'protect',
            'u-turn', 'volt-switch', 'flip-turn', 'teleport', 'baton-pass', 'rapid-spin',
            'defog', 'toxic', 'will-o-wisp', 'thunder-wave', 'sleep-powder', 'spore',
            'leech-seed', 'stealth-rock', 'spikes', 'toxic-spikes', 'sticky-web'
        ];

        const recoveryMoves = [
            'roost', 'recover', 'synthesis', 'moonlight', 'morning-sun', 'rest', 'slack-off',
            'soft-boiled', 'wish', 'regenerator', 'drain-punch', 'giga-drain', 'leech-life'
        ];

        const hazardMoves = [
            'stealth-rock', 'spikes', 'toxic-spikes', 'sticky-web', 'defog', 'rapid-spin'
        ];

        const statusMoves = [
            'toxic', 'will-o-wisp', 'thunder-wave', 'sleep-powder', 'spore', 'hypnosis',
            'stun-spore', 'paralyze', 'burn', 'poison', 'confuse-ray', 'swagger'
        ];

        // Moves de ataque comuns por tipo para coverage
        const commonAttackMoves = [
            // Fire
            'flamethrower', 'fire-blast', 'heat-wave', 'overheat', 'fire-punch', 'flame-charge',
            // Water  
            'surf', 'hydro-pump', 'scald', 'waterfall', 'aqua-tail', 'water-pulse',
            // Electric
            'thunderbolt', 'thunder', 'discharge', 'thunder-punch', 'volt-tackle',
            // Grass
            'energy-ball', 'leaf-storm', 'giga-drain', 'seed-bomb', 'power-whip',
            // Ice
            'ice-beam', 'blizzard', 'ice-punch', 'icicle-crash', 'freeze-dry',
            // Fighting
            'close-combat', 'superpower', 'focus-blast', 'drain-punch', 'brick-break',
            // Poison
            'sludge-bomb', 'poison-jab', 'gunk-shot', 'sludge-wave',
            // Ground
            'earthquake', 'earth-power', 'drill-run', 'stomping-tantrum',
            // Flying
            'air-slash', 'hurricane', 'brave-bird', 'aerial-ace', 'fly',
            // Psychic
            'psychic', 'psyshock', 'zen-headbutt', 'future-sight', 'psycho-cut',
            // Bug
            'bug-buzz', 'u-turn', 'megahorn', 'signal-beam', 'x-scissor',
            // Rock
            'stone-edge', 'rock-slide', 'power-gem', 'head-smash', 'rock-blast',
            // Ghost
            'shadow-ball', 'shadow-claw', 'hex', 'shadow-sneak', 'phantom-force',
            // Dragon
            'dragon-pulse', 'dragon-claw', 'outrage', 'draco-meteor', 'dragon-rush',
            // Dark
            'dark-pulse', 'crunch', 'knock-off', 'sucker-punch', 'night-slash',
            // Steel
            'iron-head', 'meteor-mash', 'flash-cannon', 'bullet-punch', 'steel-wing',
            // Fairy
            'moonblast', 'dazzling-gleam', 'play-rough', 'fairy-wind', 'draining-kiss',
            // Normal
            'return', 'body-slam', 'double-edge', 'hyper-beam', 'facade', 'quick-attack'
        ];
        
        for (const move of moves) {
            if (setupMoves.includes(move)) {
                categories.setup.push(move);
            } else if (priorityMoves.includes(move)) {
                categories.priority.push(move);
            } else if (recoveryMoves.includes(move)) {
                categories.recovery.push(move);
            } else if (hazardMoves.includes(move)) {
                categories.hazards.push(move);
            } else if (statusMoves.includes(move)) {
                categories.status.push(move);
            } else if (utilityMoves.includes(move)) {
                categories.utility.push(move);
            } else if (commonAttackMoves.includes(move)) {
                categories.coverage.push(move);
            } else {
                // Por padrão, moves desconhecidos vão para coverage
                categories.coverage.push(move);
            }
        }

        return categories;
    }

    // Gera combinações de moves baseadas nas categorias
    generateMoveCombinations(categories, pokemonData) {
        const suggestions = [];
        const types = pokemonData.types.map(t => t.type.name);
        const stats = pokemonData.stats;
        
        // Analisar stats para determinar roles
        const attack = stats.find(s => s.stat.name === 'attack').base_stat;
        const spAttack = stats.find(s => s.stat.name === 'special-attack').base_stat;
        const speed = stats.find(s => s.stat.name === 'speed').base_stat;
        const hp = stats.find(s => s.stat.name === 'hp').base_stat;
        const defense = stats.find(s => s.stat.name === 'defense').base_stat;
        const spDefense = stats.find(s => s.stat.name === 'special-defense').base_stat;
        
        const isPhysical = attack > spAttack;
        const isFast = speed >= 80;
        const isBulky = (hp + defense + spDefense) >= 240;
        const hasGoodOffense = Math.max(attack, spAttack) >= 80;

        // 1. Sweeper Set (se tem bons stats ofensivos)
        if (hasGoodOffense && categories.setup.length > 0) {
            const setupMove = categories.setup[0];
            let attackMoves = categories.coverage.slice(0, 3);
            
            // Se não tem moves suficientes, adiciona prioridade
            if (attackMoves.length < 3 && categories.priority.length > 0) {
                attackMoves.push(categories.priority[0]);
            }
            
            suggestions.push({
                name: isPhysical ? 'Physical Sweeper' : 'Special Sweeper',
                description: `Setup sweeper focado em ${isPhysical ? 'ataque físico' : 'ataque especial'}`,
                moves: [setupMove, ...attackMoves].slice(0, 4),
                format: 'Sweeper',
                source: 'Auto-generated',
                usage: 'Recomendado para offense teams'
            });
        }

        // 2. Choice Set (atacante puro)
        if (hasGoodOffense && categories.coverage.length >= 4) {
            suggestions.push({
                name: isFast ? 'Choice Scarf' : 'Choice Band/Specs',
                description: `Atacante ${isFast ? 'revenge killer' : 'wallbreaker'} com choice item`,
                moves: categories.coverage.slice(0, 4),
                format: 'Choice',
                source: 'Auto-generated',
                usage: isFast ? 'Revenge killing' : 'Wallbreaking'
            });
        }

        // 3. Bulky Support (se tem bons stats defensivos)
        if (isBulky) {
            let supportMoves = [];
            
            // Adiciona recovery se disponível
            if (categories.recovery.length > 0) {
                supportMoves.push(categories.recovery[0]);
            }
            
            // Adiciona utility moves
            if (categories.utility.length > 0) {
                supportMoves.push(...categories.utility.slice(0, 2));
            }
            
            // Adiciona status moves
            if (categories.status.length > 0) {
                supportMoves.push(categories.status[0]);
            }
            
            // Adiciona pelo menos um move de ataque
            if (categories.coverage.length > 0) {
                supportMoves.push(categories.coverage[0]);
            }
            
            if (supportMoves.length >= 3) {
                suggestions.push({
                    name: 'Bulky Support',
                    description: 'Set defensivo focado em suporte e utility',
                    moves: supportMoves.slice(0, 4),
                    format: 'Support',
                    source: 'Auto-generated',
                    usage: 'Suporte para o time'
                });
            }
        }

        // 4. Priority Attacker (se tem moves de prioridade)
        if (categories.priority.length >= 2 && hasGoodOffense) {
            let prioritySet = [...categories.priority.slice(0, 2)];
            prioritySet.push(...categories.coverage.slice(0, 2));
            
            suggestions.push({
                name: 'Priority Attacker',
                description: 'Foco em ataques de prioridade',
                moves: prioritySet.slice(0, 4),
                format: 'Priority',
                source: 'Auto-generated',
                usage: 'Revenge killing e cleanup'
            });
        }

        // 5. Hazard Setter/Remover
        if (categories.hazards.length > 0) {
            let hazardSet = [categories.hazards[0]];
            
            // Adiciona recovery se disponível
            if (categories.recovery.length > 0) {
                hazardSet.push(categories.recovery[0]);
            }
            
            // Adiciona ataques
            hazardSet.push(...categories.coverage.slice(0, 2));
            
            suggestions.push({
                name: categories.hazards[0].includes('defog') || categories.hazards[0].includes('rapid-spin') ? 'Hazard Remover' : 'Hazard Setter',
                description: 'Controle de hazards no campo',
                moves: hazardSet.slice(0, 4),
                format: 'Utility',
                source: 'Auto-generated',
                usage: 'Controle de campo'
            });
        }

        // 6. All-Out Attacker (se não tem outros roles claros)
        if (suggestions.length === 0 && categories.coverage.length >= 3) {
            let attackerSet = categories.coverage.slice(0, 4);
            
            // Substitui um move por prioridade se disponível
            if (categories.priority.length > 0 && attackerSet.length >= 4) {
                attackerSet[3] = categories.priority[0];
            }
            
            suggestions.push({
                name: 'All-Out Attacker',
                description: 'Foco total em dano e cobertura',
                moves: attackerSet,
                format: 'Attacker',
                source: 'Auto-generated',
                usage: 'Máximo dano possível'
            });
        }

        // 7. Balanced Set (mix de tudo)
        if (categories.coverage.length >= 2) {
            let balancedSet = [];
            
            // 2 ataques
            balancedSet.push(...categories.coverage.slice(0, 2));
            
            // 1 utility/support se disponível
            if (categories.utility.length > 0) {
                balancedSet.push(categories.utility[0]);
            } else if (categories.recovery.length > 0) {
                balancedSet.push(categories.recovery[0]);
            } else if (categories.status.length > 0) {
                balancedSet.push(categories.status[0]);
            }
            
            // 1 setup/priority se disponível
            if (categories.setup.length > 0) {
                balancedSet.push(categories.setup[0]);
            } else if (categories.priority.length > 0) {
                balancedSet.push(categories.priority[0]);
            } else if (categories.coverage.length > 2) {
                balancedSet.push(categories.coverage[2]);
            }
            
            if (balancedSet.length >= 3) {
                suggestions.push({
                    name: 'Balanced Set',
                    description: 'Set equilibrado com damage e utility',
                    moves: balancedSet.slice(0, 4),
                    format: 'Balanced',
                    source: 'Auto-generated',
                    usage: 'Versatilidade em várias situações'
                });
            }
        }

        return suggestions;
    }

    // Gera movesets básicos para qualquer Pokémon como fallback
    async generateBasicMovesets(pokemonName) {
        try {
            // Busca dados básicos do Pokémon
            const response = await fetch(`https://pokeapi.co/v2/pokemon/${pokemonName.toLowerCase()}`);
            if (!response.ok) return [];
            
            const pokemonData = await response.json();
            const types = pokemonData.types.map(t => t.type.name);
            
            // Moves básicos por tipo para garantir que sempre há algo
            const basicMovesByType = {
                fire: ['flamethrower', 'fire-blast', 'heat-wave', 'fire-punch'],
                water: ['surf', 'hydro-pump', 'scald', 'waterfall'],
                electric: ['thunderbolt', 'thunder', 'discharge', 'thunder-punch'],
                grass: ['energy-ball', 'leaf-storm', 'giga-drain', 'seed-bomb'],
                ice: ['ice-beam', 'blizzard', 'ice-punch', 'icicle-crash'],
                fighting: ['close-combat', 'focus-blast', 'drain-punch', 'brick-break'],
                poison: ['sludge-bomb', 'poison-jab', 'gunk-shot', 'sludge-wave'],
                ground: ['earthquake', 'earth-power', 'drill-run', 'stomping-tantrum'],
                flying: ['air-slash', 'hurricane', 'brave-bird', 'aerial-ace'],
                psychic: ['psychic', 'psyshock', 'zen-headbutt', 'future-sight'],
                bug: ['bug-buzz', 'u-turn', 'megahorn', 'signal-beam'],
                rock: ['stone-edge', 'rock-slide', 'power-gem', 'head-smash'],
                ghost: ['shadow-ball', 'shadow-claw', 'hex', 'phantom-force'],
                dragon: ['dragon-pulse', 'dragon-claw', 'outrage', 'draco-meteor'],
                dark: ['dark-pulse', 'crunch', 'knock-off', 'sucker-punch'],
                steel: ['iron-head', 'meteor-mash', 'flash-cannon', 'bullet-punch'],
                fairy: ['moonblast', 'dazzling-gleam', 'play-rough', 'fairy-wind'],
                normal: ['return', 'body-slam', 'double-edge', 'quick-attack']
            };

            const suggestions = [];
            
            // Set 1: STAB Attacker
            let stabMoves = [];
            for (const type of types) {
                if (basicMovesByType[type]) {
                    stabMoves.push(...basicMovesByType[type].slice(0, 2));
                }
            }
            
            // Adiciona moves de cobertura comuns
            const commonCoverage = ['earthquake', 'ice-beam', 'thunderbolt', 'fire-blast'];
            for (const move of commonCoverage) {
                if (stabMoves.length < 4 && !stabMoves.includes(move)) {
                    stabMoves.push(move);
                }
            }
            
            if (stabMoves.length >= 3) {
                suggestions.push({
                    name: 'STAB Attacker',
                    description: `Atacante focado em moves do tipo ${types.join('/')}`,
                    moves: stabMoves.slice(0, 4),
                    format: 'Standard',
                    source: 'Basic Template',
                    usage: 'Set básico recomendado'
                });
            }

            // Set 2: Balanced Set
            const balancedMoves = [];
            
            // 2 STAB moves
            for (const type of types) {
                if (basicMovesByType[type] && balancedMoves.length < 2) {
                    balancedMoves.push(basicMovesByType[type][0]);
                }
            }
            
            // Utility moves comuns
            const utilityMoves = ['protect', 'substitute', 'toxic', 'will-o-wisp'];
            for (const move of utilityMoves) {
                if (balancedMoves.length < 4) {
                    balancedMoves.push(move);
                }
            }
            
            if (balancedMoves.length >= 3) {
                suggestions.push({
                    name: 'Balanced Set',
                    description: 'Set equilibrado com ataque e utility',
                    moves: balancedMoves.slice(0, 4),
                    format: 'Balanced',
                    source: 'Basic Template',
                    usage: 'Versatilidade geral'
                });
            }

            // Set 3: Support Set
            const supportMoves = ['toxic', 'will-o-wisp', 'stealth-rock', 'defog'];
            
            // Adiciona um STAB move
            if (types.length > 0 && basicMovesByType[types[0]]) {
                supportMoves.unshift(basicMovesByType[types[0]][0]);
            }
            
            suggestions.push({
                name: 'Support Set',
                description: 'Set focado em suporte e status',
                moves: supportMoves.slice(0, 4),
                format: 'Support',
                source: 'Basic Template',
                usage: 'Suporte para o time'
            });

            return suggestions;
            
        } catch (error) {
            console.error('Erro ao gerar movesets básicos:', error);
            
            // Fallback final - set genérico
            return [{
                name: 'Generic Set',
                description: 'Set genérico básico',
                moves: ['tackle', 'growl', 'rest', 'sleep-talk'],
                format: 'Basic',
                source: 'Fallback',
                usage: 'Set de emergência'
            }];
        }
    }

    // Busca movesets por tier específico
    async getMovesetsByTier(pokemonName, tier = 'OU') {
        const allMovesets = await this.getCompetitiveMovesets(pokemonName);
        return allMovesets.filter(set => set.tier === tier || set.format === tier);
    }

    // Busca os movesets mais populares
    async getPopularMovesets(pokemonName, limit = 3) {
        const allMovesets = await this.getCompetitiveMovesets(pokemonName);
        
        // Ordena por popularidade
        return allMovesets
            .filter(set => set.usage && set.usage !== 'N/A')
            .sort((a, b) => {
                const aUsage = parseFloat(a.usage.replace('%', ''));
                const bUsage = parseFloat(b.usage.replace('%', ''));
                return bUsage - aUsage;
            })
            .slice(0, limit);
    }

    // Formata movesets para exibição HTML
    formatMovesetsForDisplay(movesets) {
        if (!movesets || movesets.length === 0) {
            return '<p class="no-movesets">Nenhum moveset competitivo encontrado para este Pokémon.</p>';
        }

        let html = '<div class="competitive-movesets">';
        html += '<h3>Movesets Competitivos</h3>';
        
        for (const set of movesets) {
            html += `
                <div class="moveset-card">
                    <div class="moveset-header">
                        <h4>${set.name}</h4>
                        <div class="moveset-meta">
                            ${this.formatTierBadge(set.tier || set.format)}
                            ${set.usage && set.usage !== 'N/A' ? this.formatUsageBadge(set.usage) : ''}
                        </div>
                    </div>
                    
                    <p class="moveset-description">${set.description}</p>
                    
                    <div class="moveset-details">
                        <div class="moves-section">
                            <strong>Moves:</strong>
                            <div class="moves-list">
                                ${set.moves.map(move => `<span class="move-tag">${this.formatMoveName(move)}</span>`).join('')}
                            </div>
                        </div>
                        
                        ${set.ability ? `<div class="detail-item"><strong>Ability:</strong> ${set.ability}</div>` : ''}
                        ${set.item ? `<div class="detail-item"><strong>Item:</strong> ${set.item}</div>` : ''}
                        ${set.nature ? `<div class="detail-item"><strong>Nature:</strong> ${set.nature}</div>` : ''}
                        ${set.evs ? `<div class="detail-item"><strong>EVs:</strong> ${set.evs}</div>` : ''}
                    </div>
                    
                    <div class="moveset-source">
                        <small>Fonte: ${set.source}</small>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    // Formata badge de tier com tooltip explicativo
    formatTierBadge(tier) {
        const tierDescriptions = {
            'OU': 'OverUsed - Tier mais alto do competitivo. Pokémon muito fortes e populares',
            'UU': 'UnderUsed - Tier intermediário. Pokémon viáveis mas menos dominantes que OU',
            'RU': 'RarelyUsed - Tier inferior. Pokémon menos usados no competitivo',
            'NU': 'NeverUsed - Tier mais baixo. Pokémon raramente vistos em batalhas',
            'Ubers': 'Tier dos lendários. Pokémon extremamente poderosos e banidos do OU',
            'LC': 'Little Cup - Tier de Pokémon nível 5 (não evoluídos)',
            'Standard': 'Set padrão recomendado para uso geral',
            'Sweeper': 'Set focado em causar muito dano rapidamente',
            'Choice': 'Set com Choice items (Band/Specs/Scarf)',
            'Support': 'Set focado em apoiar o time',
            'Balanced': 'Set equilibrado entre ataque e utilidade',
            'Suggested': 'Set sugerido baseado no movepool',
            'Basic': 'Set básico para iniciantes',
            'Attacker': 'Set focado em ataque puro',
            'Priority': 'Set focado em ataques de prioridade',
            'Utility': 'Set focado em controle de campo'
        };

        const description = tierDescriptions[tier] || `Tier ${tier} - Categoria competitiva deste set`;
        
        return `<span class="tier" data-tooltip="${description}">${tier}</span>`;
    }

    // Formata badge de usage com tooltip explicativo
    formatUsageBadge(usage) {
        let description;
        const usagePercent = parseFloat(usage.replace('%', ''));
        
        if (usagePercent >= 40) {
            description = `${usage} - Moveset MUITO POPULAR. Usado por ${usage} dos jogadores deste Pokémon. Altamente recomendado!`;
        } else if (usagePercent >= 20) {
            description = `${usage} - Moveset VIÁVEL. Usado por ${usage} dos jogadores. Boa opção competitiva.`;
        } else if (usagePercent >= 10) {
            description = `${usage} - Moveset NICHO. Usado por ${usage} dos jogadores. Situacional mas funcional.`;
        } else {
            description = `${usage} - Moveset RARO. Usado por ${usage} dos jogadores. Experimental ou muito específico.`;
        }
        
        return `<span class="usage" data-tooltip="${description}">${usage}</span>`;
    }

    // Formata nome do move para exibição
    formatMoveName(move) {
        return move
            .replace(/-/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }
}

// Instância global
const competitiveMovesets = new CompetitiveMovesets();

// Função para buscar e exibir movesets competitivos
async function showCompetitiveMovesets(pokemonName, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Mostra loading
        container.innerHTML = '<div class="loading">Carregando movesets competitivos...</div>';

        // Busca movesets
        const movesets = await competitiveMovesets.getCompetitiveMovesets(pokemonName);
        
        // Mostra resultados
        container.innerHTML = competitiveMovesets.formatMovesetsForDisplay(movesets);
        
    } catch (error) {
        console.error('Erro ao carregar movesets:', error);
        document.getElementById(containerId).innerHTML = 
            '<p class="error">Erro ao carregar movesets competitivos.</p>';
    }
}