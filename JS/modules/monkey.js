// Модуль мини-игры "Обезьянка"
const Monkey = {
    gameActive: false,
    timeLeft: 0,
    score: 0,
    gameTimer: null,
    monkeyInterval: null,
    monkeys: [],

    init: (gameState, updateUI, saveGame) => {
        const startBtn = document.getElementById('startMonkeyBtn');
        
        startBtn.addEventListener('click', () => {
            if (!Monkey.gameActive) {
                Monkey.startGame(gameState, updateUI, saveGame);
            }
        });
    },

    startGame: (gameState, updateUI, saveGame) => {
        Monkey.gameActive = true;
        Monkey.timeLeft = 30;
        Monkey.score = 0;
        Monkey.monkeys = [];
        
        document.getElementById('monkeyTime').textContent = Monkey.timeLeft;
        document.getElementById('monkeyScore').textContent = Monkey.score;
        
        const gameArea = document.getElementById('monkeyArea');
        gameArea.innerHTML = '';
        
        const startBtn = document.getElementById('startMonkeyBtn');
        startBtn.disabled = true;
        startBtn.textContent = 'Сканирование...';
        
        // Таймер игры
        Monkey.gameTimer = setInterval(() => {
            Monkey.timeLeft--;
            document.getElementById('monkeyTime').textContent = Monkey.timeLeft;
            
            if (Monkey.timeLeft <= 0) {
                Monkey.endGame(gameState, updateUI, saveGame);
            }
        }, 1000);
        
        // Создание обезьянок
        Monkey.monkeyInterval = setInterval(() => {
            if (!Monkey.gameActive) {
                clearInterval(Monkey.monkeyInterval);
                return;
            }
            
            if (Monkey.monkeys.length < 5) {
                Monkey.createMonkey(gameArea);
            }
        }, 1500);
    },

    createMonkey: (gameArea) => {
        const monkey = document.createElement('div');
        monkey.className = 'monkey';
        monkey.innerHTML = '🐵';
        monkey.style.left = Math.random() * 80 + 10 + '%';
        monkey.style.top = Math.random() * 80 + 10 + '%';
        
        monkey.addEventListener('click', () => {
            Monkey.score++;
            document.getElementById('monkeyScore').textContent = Monkey.score;
            
            // Анимация попадания
            monkey.classList.add('monkey-caught');
            
            setTimeout(() => {
                monkey.remove();
                Monkey.monkeys = Monkey.monkeys.filter(m => m !== monkey);
            }, 500);
        });
        
        gameArea.appendChild(monkey);
        Monkey.monkeys.push(monkey);
        
        // Движение обезьянки
        const moveInterval = setInterval(() => {
            if (!Monkey.gameActive || !monkey.parentNode) {
                clearInterval(moveInterval);
                return;
            }
            
            monkey.style.left = Math.random() * 80 + 10 + '%';
            monkey.style.top = Math.random() * 80 + 10 + '%';
        }, 1000);
        
        // Автоматическое удаление обезьянки через 3 секунды
        setTimeout(() => {
            if (monkey.parentNode) {
                monkey.remove();
                Monkey.monkeys = Monkey.monkeys.filter(m => m !== monkey);
            }
        }, 3000);
    },

    endGame: (gameState, updateUI, saveGame) => {
        Monkey.gameActive = false;
        clearInterval(Monkey.gameTimer);
        clearInterval(Monkey.monkeyInterval);
        
        const startBtn = document.getElementById('startMonkeyBtn');
        startBtn.disabled = false;
        startBtn.textContent = 'Активировать сканирование';
        
        Monkey.monkeys.forEach(monkey => {
            if (monkey.parentNode) {
                monkey.remove();
            }
        });
        Monkey.monkeys = [];
        
        const reward = Math.floor(Monkey.score * gameState.miniGames.monkey.rewardMultiplier);
        gameState.carrots += reward;
        updateUI();
        saveGame();
        
        Utils.showNotification(`Игра окончена! Вы поймали ${Monkey.score} обезьянок и получили ${reward} морковок!`, 'success');
    }
};