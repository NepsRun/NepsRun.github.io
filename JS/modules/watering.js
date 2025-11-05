// Модуль мини-игры "Поливалка"
const Watering = {
    gameActive: false,
    timeLeft: 0,
    score: 0,
    gameTimer: null,
    waterInterval: null,

    init: (gameState, updateUI, saveGame) => {
        const startBtn = document.getElementById('startWateringBtn');
        
        startBtn.addEventListener('click', () => {
            if (!Watering.gameActive) {
                Watering.startGame(gameState, updateUI, saveGame);
            }
        });
    },

    startGame: (gameState, updateUI, saveGame) => {
        Watering.gameActive = true;
        Watering.timeLeft = 30;
        Watering.score = 0;
        
        document.getElementById('wateringTime').textContent = Watering.timeLeft;
        document.getElementById('wateringScore').textContent = Watering.score;
        
        const gameArea = document.getElementById('wateringArea');
        gameArea.innerHTML = '';
        
        const startBtn = document.getElementById('startWateringBtn');
        startBtn.disabled = true;
        startBtn.textContent = 'Идет полив...';
        
        // Создание лейки
        const wateringCan = document.createElement('div');
        wateringCan.className = 'watering-can';
        wateringCan.style.left = '50%';
        wateringCan.style.top = '10px';
        gameArea.appendChild(wateringCan);
        
        // Таймер игры
        Watering.gameTimer = setInterval(() => {
            Watering.timeLeft--;
            document.getElementById('wateringTime').textContent = Watering.timeLeft;
            
            if (Watering.timeLeft <= 0) {
                Watering.endGame(gameState, updateUI, saveGame);
            }
        }, 1000);
        
        // Создание капель воды
        Watering.waterInterval = setInterval(() => {
            if (!Watering.gameActive) {
                clearInterval(Watering.waterInterval);
                return;
            }
            
            const drop = document.createElement('div');
            drop.className = 'water-drop';
            drop.style.left = Math.random() * 90 + 5 + '%';
            drop.style.top = '0';
            gameArea.appendChild(drop);
            
            setTimeout(() => {
                if (drop.parentNode) {
                    drop.remove();
                }
            }, 1000);
        }, 500);
        
        // Обработчик кликов по каплям
        gameArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('water-drop')) {
                Watering.score++;
                document.getElementById('wateringScore').textContent = Watering.score;
                e.target.remove();
                
                // Анимация попадания
                const hitText = document.createElement('div');
                hitText.className = 'click-info';
                hitText.textContent = '+1';
                hitText.style.left = e.target.style.left;
                hitText.style.top = e.target.style.top;
                gameArea.appendChild(hitText);
                
                setTimeout(() => {
                    hitText.remove();
                }, 1000);
            }
        });
        
        // Перемещение лейки
        gameArea.addEventListener('mousemove', (e) => {
            if (!Watering.gameActive) return;
            
            const rect = gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left;
            wateringCan.style.left = (x - 25) + 'px';
        });
    },

    endGame: (gameState, updateUI, saveGame) => {
        Watering.gameActive = false;
        clearInterval(Watering.gameTimer);
        clearInterval(Watering.waterInterval);
        
        const startBtn = document.getElementById('startWateringBtn');
        startBtn.disabled = false;
        startBtn.textContent = 'Запустить систему';
        
        const reward = Math.floor(Watering.score * gameState.miniGames.watering.rewardMultiplier);
        gameState.carrots += reward;
        updateUI();
        saveGame();
        
        Utils.showNotification(`Игра окончена! Вы набрали ${Watering.score} очков и получили ${reward} морковок!`, 'success');
    }
};