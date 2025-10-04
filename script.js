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

// --- FUNÇÕES DE LÓGICA DO TIMER ---

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

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
        clearState(); 
        
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
                    clearState();
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
new IndependentTimer('timer1', 10);
new IndependentTimer('timer2', 60); 
new IndependentTimer('timer3', 120); 
new IndependentTimer('timer4', 5);