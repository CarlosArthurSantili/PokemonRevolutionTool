// --- FUNÇÕES GERAIS DE NAVEGAÇÃO ---

function switchSection(targetId) {
    // 1. Esconde todas as seções e remove o estado ativo dos links
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // 2. Mostra a seção desejada
    document.getElementById(targetId).classList.add('active');

    // 3. Marca o link ativo
    const activeLink = document.querySelector(`[data-target="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Adiciona listeners para os links de navegação
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        switchSection(targetId);
    });
});

function IndependentTimer(containerId, initialSeconds) {
    const container = document.getElementById(containerId);
    const display = container.querySelector('.timer-display');
    const startButton = container.querySelector('.start-button');
    const statusMessage = container.querySelector('.status-message');
    
    const LS_KEY = `timer_data_${containerId}`;
    
    let timeLeft = initialSeconds;
    let countdownInterval;

    function saveState() {
        const data = JSON.stringify({
            startTime: Date.now(),
            duration: initialSeconds,
            state: "RUNNING"
        });
        localStorage.setItem(LS_KEY, data);
    }

    function clearState() {
        localStorage.removeItem(LS_KEY);
    }

    function timerFinished() {
        clearInterval(countdownInterval);
        
        startButton.disabled = false;
        startButton.textContent = "Iniciar Novamente";
        statusMessage.textContent = "✅ CONCLUÍDO!";
        statusMessage.classList.add('finished');
        display.textContent = formatTime(0);
    }

    function runCountdown(startSeconds, isResume = false) {
        startButton.disabled = true;
        startButton.textContent = "Contando...";
        statusMessage.classList.remove('finished'); 
        
        timeLeft = startSeconds;
        display.textContent = formatTime(timeLeft);
        
        clearInterval(countdownInterval);

        if (isResume) {
             statusMessage.textContent = `Contagem retomada (${formatTime(timeLeft)} restantes)...`;
        } else {
             statusMessage.textContent = "Tempo em andamento...";
        }

        countdownInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                display.textContent = formatTime(timeLeft);
            } else {
                timerFinished();
            }
        }, 1000);
    }

    function startCountdown() {
        saveState();
        runCountdown(initialSeconds);
    }
    
    function loadAndResume() {
        const savedData = localStorage.getItem(LS_KEY);
        
        if (savedData) {
            try {
                const state = JSON.parse(savedData);
                const elapsedMilliseconds = Date.now() - state.startTime;
                const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
                const remainingSeconds = state.duration - elapsedSeconds;
                
                if (remainingSeconds > 0) {
                    runCountdown(remainingSeconds, true);
                    startButton.textContent = "Rodando...";
                } else {
                    timerFinished(); 
                    statusMessage.textContent = "✅ CONCLUÍDO (Offline)!";
                }
            } catch (e) {
                clearState();
                display.textContent = formatTime(initialSeconds);
                statusMessage.textContent = "Erro de carregamento. Pronto para iniciar.";
            }
        } else {
            display.textContent = formatTime(initialSeconds);
            startButton.textContent = "Iniciar";
            statusMessage.textContent = "Pronto para iniciar.";
        }
    }

    startButton.addEventListener('click', startCountdown);
    loadAndResume();
}

// Inicializa os 4 timers
new IndependentTimer('timer1', 20160);
new IndependentTimer('timer2', 20160); 
new IndependentTimer('timer3', 0); 
new IndependentTimer('timer4', 0);
new IndependentTimer('timer5', 0); 
new IndependentTimer('timer6', 0); 
new IndependentTimer('timer7', 0);
new IndependentTimer('timer8', 0);

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');

    // Desativa todas as abas e botões
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Ativa a aba clicada
    button.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});

// Função para formatar tempo em hh:mm:ss (usada só para timers não daily)
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Função para calcular segundos até próxima meia-noite UTC (usada só para timers não daily)
function secondsUntilNextUTCmidnight() {
    const now = new Date();
    const nowUTC = new Date(now.toISOString());
    const nextMidnightUTC = new Date(Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate() + 1, 0, 0, 0
    ));
    return Math.floor((nextMidnightUTC - nowUTC) / 1000);
}

document.querySelectorAll('.timer-box').forEach(timerBox => {
    const title = timerBox.querySelector('h2').innerText.toLowerCase();
    const display = timerBox.querySelector('.timer-display');
    const button = timerBox.querySelector('.start-button');
    const status = timerBox.querySelector('.status-message');

    let intervalId = null;
    let countdown = 0;

    button.addEventListener('click', () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            button.innerText = "Iniciar";
            status.innerText = "Parado.";
            return;
        }

        // Se o título contém "daily", calcula o tempo até meia-noite UTC
        if (title.includes('daily')) {
            countdown = secondsUntilNextUTCmidnight();
        } else {
            // Para timers não-daily, você pode definir um valor fixo, por exemplo:
            // Aqui, só um exemplo: 1 hora
            countdown = 1209600; 
        }

        status.innerText = "Contando...";

        // Atualiza a exibição imediatamente
        display.innerText = formatTime(countdown);

        intervalId = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(intervalId);
                intervalId = null;
                display.innerText = "00:00:00";
                status.innerText = "Tempo esgotado!";
                button.innerText = "Iniciar";
            } else {
                display.innerText = formatTime(countdown);
            }
        }, 1000);

        button.innerText = "Parar";
    });
});

document.getElementById('reset-all-timers').addEventListener('click', () => {
    if (!confirm("Deseja realmente resetar todos os timers?")) return;

    document.querySelectorAll('.timer-box').forEach(timerBox => {
        const title = timerBox.querySelector('h2').innerText.toLowerCase();
        const display = timerBox.querySelector('.timer-display');
        const button = timerBox.querySelector('.start-button');
        const status = timerBox.querySelector('.status-message');

        const storageKey = `${timerBox.id}_done_date`;

        // Limpa o localStorage
        localStorage.removeItem(storageKey);

        // Se for daily, resetar UI
        if (title.includes('daily')) {
            display.innerText = "";
            status.innerText = "Não feito.";
            button.innerText = "Marcar como Feito";
        }

        // Opcional: se quiser resetar também contadores fixos (não daily), zere aqui
        // Exemplo: parar qualquer contagem se estiver ativa
        // if (intervalId) { clearInterval(intervalId); intervalId = null; }
    });

    alert("Todos os timers foram resetados!");
});

// Guarda os intervalos ativos dos timers não-daily
const activeTimers = {};

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

document.querySelectorAll('.timer-box').forEach(timerBox => {
    const title = timerBox.querySelector('h2').innerText.toLowerCase();
    const display = timerBox.querySelector('.timer-display');
    const button = timerBox.querySelector('.start-button');
    const status = timerBox.querySelector('.status-message');
    const timerId = timerBox.id;
    const storageKey = `${timerId}_done_date`;

    // DAILY TIMERS
    if (title.includes('daily')) {
        const getTodayUTC = () => new Date().toISOString().split("T")[0];
        const todayUTC = getTodayUTC();
        const savedDate = localStorage.getItem(storageKey);
        let isDone = savedDate === todayUTC;

        updateDailyUI(isDone);

        button.addEventListener('click', () => {
            const done = localStorage.getItem(storageKey) === todayUTC;
            if (!done) {
                localStorage.setItem(storageKey, todayUTC);
                updateDailyUI(true);
            } else {
                localStorage.removeItem(storageKey);
                updateDailyUI(false);
            }
        });

        function updateDailyUI(done) {
            if (done) {
                display.innerText = "✅ Feito!";
                status.innerText = "Você já marcou este timer como feito hoje (UTC).";
                button.innerText = "Desmarcar";
            } else {
                display.innerText = "";
                status.innerText = "Não feito.";
                button.innerText = "Marcar como Feito";
            }
        }

    } else {
        // FIXED COUNTDOWN TIMERS
        let countdown = 0;
        let intervalId = null;

        button.addEventListener('click', () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
                activeTimers[timerId] = null;
                button.innerText = "Iniciar";
                status.innerText = "Parado.";
                return;
            }

            // Ajustar tempo inicial conforme o timer
            if (title.includes('dig route')) {
                countdown = 604800; // 1 semana
            } else if (title.includes('hoenn shrooms')) {
                countdown = 1209600; // 2 semanas
            } else {
                countdown = 3600; // default
            }

            status.innerText = "Contando...";
            display.innerText = formatTime(countdown);

            intervalId = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(intervalId);
                    intervalId = null;
                    activeTimers[timerId] = null;
                    display.innerText = "00:00:00";
                    status.innerText = "Tempo esgotado!";
                    button.innerText = "Iniciar";
                } else {
                    display.innerText = formatTime(countdown);
                }
            }, 1000);

            button.innerText = "Parar";
            activeTimers[timerId] = intervalId;
        });
    }
});
