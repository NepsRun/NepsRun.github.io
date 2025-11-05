// Модуль мини-игры "Обезьянка"
const Monkey = {
    init(gameInstance) {
        this.game = gameInstance;
        this.gameActive = false;
        this.score = 0;
        this.timeLeft = 30;
        this.monkeys = [];
        this.setupMonkeyGame();
    },

    setupMonkeyGame() {
        const startBtn = document.getElementById('startMonkeyBtn');
        if (!startBtn) return;

        startBtn.addEventListener('click', () => {
            if (!this.gameActive) {
                this.startGame();
            }
        });
    },

    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = 30;
        this.monkeys = [];
        
        const gameArea = document.getElementById('monkeyArea');
        const startBtn = document.getElementById('startMonkeyBtn');
        
        if (!gameArea || !startBtn) return;

        // Обновляем UI
        this.updateGameStats();
        gameArea.innerHTML = '';
        startBtn.disabled = true;
        startBtn.textContent = 'Сканирование...';
        
        // Запускаем таймер
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateGameStats();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Запускаем генерацию обезьянок
        this.monkeyInterval = setInterval(() => {
            if (!this.gameActive || this.monkeys.length >= 5) return;
            this.createMonkey(gameArea);
        }, 1500);
    },

    createMonkey(gameArea) {
        const monkey = document.createElement('div');
        monkey.className = 'monkey';
        monkey.innerHTML = '🐵';
        monkey.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            font-size: 40px;
            cursor: pointer;
            transition: all 0.3s;
            user-select: none;
        `;
        
        this.positionMonkey(monkey);
        gameArea.appendChild(monkey);
        this.monkeys.push(monkey);
        
        // Обработчик клика
        monkey.addEventListener('click', () => {
            this.catchMonkey(monkey);
        });
        
        // Движение обезьянки
        this.moveMonkey(monkey);
        
        // Автоудаление через 4 секунды
        setTimeout(() => {
            if (monkey.parentNode) {
                monkey.remove();
                this.monkeys = this.monkeys.filter(m => m !== monkey);
            }
        }, 4000);
    },

    positionMonkey(monkey) {
        monkey.style.left = Math.random() * 80 + 10 + '%';
        monkey.style.top = Math.random() * 70 + 15 + '%';
    },

    moveMonkey(monkey) {
        const moveInterval = setInterval(() => {
            if (!this.gameActive || !monkey.parentNode) {
                clearInterval(moveInterval);
                return;
            }
            
            // Случайное движение
            const newLeft = Math.random() * 80 + 10;
            const newTop = Math.random() * 70 + 15;
            
            monkey.style.left = newLeft + '%';
            monkey.style.top = newTop + '%';
            
        }, 1000 + Math.random() * 1000);
    },

    catchMonkey(monkey) {
        if (!this.gameActive) return;
        
        this.score++;
        this.updateGameStats();
        
        // Анимация поимки
        monkey.style.transform = 'scale(1.3)';
        monkey.style.opacity = '0.7';
        
        setTimeout(() => {
            if (monkey.parentNode) {
                monkey.remove();
                this.monkeys = this.monkeys.filter(m => m !== monkey);
            }
        }, 300);
        
        // Создаем текст +1
        const hitText = document.createElement('div');
        hitText.textContent = '+1';
        hitText.style.cssText = `
            position: absolute;
            color: #ffa726;
            font-weight: bold;
            font-size: 16px;
            pointer-events: none;
            animation: floatUp 1s forwards;
            left: ${monkey.style.left};
            top: ${monkey.style.top};
        `;
        document.getElementById('monkeyArea').appendChild(hitText);
        
        setTimeout(() => {
            if (hitText.parentNode) {
                hitText.remove();
            }
        }, 1000);
    },

    updateGameStats() {
        const scoreElement = document.getElementById('monkeyScore');
        const timeElement = document.getElementById('monkeyTime');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (timeElement) timeElement.textContent = this.timeLeft;
    },

    endGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.monkeyInterval);
        
        const startBtn = document.getElementById('startMonkeyBtn');
        const gameArea = document.getElementById('monkeyArea');
        
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Активировать сканирование';
        }
        
        if (gameArea) {
            gameArea.innerHTML = '';
        }
        
        // Удаляем всех обезьянок
        this.monkeys.forEach(monkey => {
            if (monkey.parentNode) {
                monkey.remove();
            }
        });
        this.monkeys = [];
        
        // Награда
        const reward = this.game.getGameReward('monkey', this.score);
        this.game.addCarrots(reward);
        
        this.game.showNotification(
            `Сканирование завершено! Поймано ${this.score} обезьянок. Награда: ${reward} морковок!`,
            'success'
        );
    }
};
