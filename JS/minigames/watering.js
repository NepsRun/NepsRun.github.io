// Модуль мини-игры "Поливалка"
const Watering = {
    init(gameInstance) {
        this.game = gameInstance;
        this.gameActive = false;
        this.score = 0;
        this.timeLeft = 30;
        this.setupWateringGame();
    },

    setupWateringGame() {
        const startBtn = document.getElementById('startWateringBtn');
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
        
        const gameArea = document.getElementById('wateringArea');
        const startBtn = document.getElementById('startWateringBtn');
        
        if (!gameArea || !startBtn) return;

        // Обновляем UI
        this.updateGameStats();
        gameArea.innerHTML = '';
        startBtn.disabled = true;
        startBtn.textContent = 'Идет полив...';
        
        // Создаем лейку
        this.createWateringCan(gameArea);
        
        // Запускаем таймер
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateGameStats();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Запускаем генерацию капель
        this.waterInterval = setInterval(() => {
            if (!this.gameActive) return;
            this.createWaterDrop(gameArea);
        }, 800);
        
        // Обработчик движения мыши
        this.mouseMoveHandler = (e) => this.moveWateringCan(e);
        gameArea.addEventListener('mousemove', this.mouseMoveHandler);
        
        // Обработчик касаний для мобильных устройств
        this.touchMoveHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.moveWateringCan(touch);
        };
        gameArea.addEventListener('touchmove', this.touchMoveHandler);
    },

    createWateringCan(gameArea) {
        this.wateringCan = document.createElement('div');
        this.wateringCan.className = 'watering-can';
        this.wateringCan.style.cssText = `
            position: absolute;
            width: 50px;
            height: 70px;
            background: #2196f3;
            border-radius: 5px 5px 20px 20px;
            cursor: pointer;
            z-index: 10;
            left: 50%;
            top: 10px;
            transform: translateX(-50%);
        `;
        gameArea.appendChild(this.wateringCan);
    },

    createWaterDrop(gameArea) {
        const drop = document.createElement('div');
        drop.className = 'water-drop';
        drop.style.cssText = `
            position: absolute;
            width: 12px;
            height: 12px;
            background: #2196f3;
            border-radius: 50%;
            z-index: 5;
            left: ${Math.random() * 85 + 5}%;
            top: 0;
        `;
        
        gameArea.appendChild(drop);
        
        // Анимация падения
        let position = 0;
        const fallInterval = setInterval(() => {
            if (!this.gameActive || !drop.parentNode) {
                clearInterval(fallInterval);
                return;
            }
            
            position += 4;
            drop.style.top = position + 'px';
            
            // Проверка выхода за пределы
            if (position > 300) {
                drop.remove();
                clearInterval(fallInterval);
            }
        }, 50);
        
        // Обработчик клика по капле
        drop.addEventListener('click', () => {
            this.catchWaterDrop(drop);
        });
        
        // Автоудаление через 3 секунды
        setTimeout(() => {
            if (drop.parentNode) {
                drop.remove();
                clearInterval(fallInterval);
            }
        }, 3000);
    },

    moveWateringCan(e) {
        if (!this.wateringCan || !this.gameActive) return;
        
        const gameArea = document.getElementById('wateringArea');
        const rect = gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        this.wateringCan.style.left = Math.max(10, Math.min(90, (x / rect.width) * 100)) + '%';
    },

    catchWaterDrop(drop) {
        if (!this.gameActive) return;
        
        this.score++;
        this.updateGameStats();
        
        // Анимация попадания
        drop.style.background = '#4caf50';
        drop.style.transform = 'scale(1.5)';
        
        setTimeout(() => {
            if (drop.parentNode) {
                drop.remove();
            }
        }, 200);
        
        // Создаем текст +1
        const hitText = document.createElement('div');
        hitText.textContent = '+1';
        hitText.style.cssText = `
            position: absolute;
            color: #4caf50;
            font-weight: bold;
            font-size: 16px;
            pointer-events: none;
            animation: floatUp 1s forwards;
            left: ${drop.style.left};
            top: ${drop.style.top};
        `;
        document.getElementById('wateringArea').appendChild(hitText);
        
        setTimeout(() => {
            if (hitText.parentNode) {
                hitText.remove();
            }
        }, 1000);
    },

    updateGameStats() {
        const scoreElement = document.getElementById('wateringScore');
        const timeElement = document.getElementById('wateringTime');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (timeElement) timeElement.textContent = this.timeLeft;
    },

    endGame() {
        this.gameActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.waterInterval);
        
        const startBtn = document.getElementById('startWateringBtn');
        const gameArea = document.getElementById('wateringArea');
        
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Запустить систему';
        }
        
        if (gameArea) {
            gameArea.removeEventListener('mousemove', this.mouseMoveHandler);
            gameArea.removeEventListener('touchmove', this.touchMoveHandler);
            gameArea.innerHTML = '';
        }
        
        // Награда
        const reward = this.game.getGameReward('watering', this.score);
        this.game.addCarrots(reward);
        
        this.game.showNotification(
            `Полив завершен! Набрано ${this.score} очков. Награда: ${reward} морковок!`,
            'success'
        );
    }
};
