class SpaceShooter {
    constructor(gameState, updateUI, saveGame) {
        this.gameState = gameState;
        this.updateUI = updateUI;
        this.saveGame = saveGame;
        this.gameActive = false;
        this.score = 0;
        this.lives = 3;
        this.init();
    }

    init() {
        this.createGameArea();
        this.bindEvents();
    }

    createGameArea() {
        const shooterTab = document.getElementById('shooter');
        shooterTab.innerHTML = `
            <div class="card">
                <h2 class="card-title">🚀 Космический шутер</h2>
                <p>Защити ферму от астероидов!</p>
                
                <div class="game-stats">
                    <div class="game-stat">Очки: <span id="shooterScore">0</span></div>
                    <div class="game-stat">Жизни: <span id="shooterLives">3</span></div>
                    <div class="game-stat">Волна: <span id="shooterWave">1</span></div>
                </div>
                
                <div class="game-area" id="shooterArea">
                    <div class="player" id="playerShip">🚀</div>
                </div>
                
                <button class="btn btn-primary" id="startShooter">Начать защиту</button>
                <div class="game-controls">
                    <button class="control-btn left">←</button>
                    <button class="control-btn shoot">⚡</button>
                    <button class="control-btn right">→</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('startShooter').addEventListener('click', () => {
            this.startGame();
        });

        // Управление с клавиатуры
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePlayer(-20);
                    break;
                case 'ArrowRight':
                    this.movePlayer(20);
                    break;
                case ' ':
                    this.shoot();
                    break;
            }
        });

        // Сенсорное управление
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = e.target.classList[1];
                this.handleTouchControl(action);
            });
        });
    }

    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        
        document.getElementById('startShooter').disabled = true;
        document.getElementById('startShooter').textContent = 'Идет игра...';
        
        this.updateGameStats();
        this.spawnAsteroids();
        this.gameLoop = setInterval(() => this.updateGame(), 1000/60);
    }

    spawnAsteroids() {
        this.asteroidInterval = setInterval(() => {
            if (!this.gameActive) return;
            
            const asteroid = document.createElement('div');
            asteroid.className = 'asteroid';
            asteroid.innerHTML = '🪨';
            asteroid.style.left = Math.random() * 80 + 10 + '%';
            
            const shooterArea = document.getElementById('shooterArea');
            shooterArea.appendChild(asteroid);
            
            this.animateAsteroid(asteroid);
        }, 1000 - (this.wave * 100)); // Ускоряется с каждой волной
    }

    animateAsteroid(asteroid) {
        let position = 0;
        const fallSpeed = 2 + Math.random() * 3;
        
        const fall = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(fall);
                return;
            }
            
            position += fallSpeed;
            asteroid.style.top = position + 'px';
            
            // Проверка столкновения
            if (this.checkCollision(asteroid)) {
                this.handleCollision(asteroid);
                clearInterval(fall);
            }
            
            // Удаление за пределами экрана
            if (position > 300) {
                asteroid.remove();
                clearInterval(fall);
            }
        }, 50);
    }

    checkCollision(asteroid) {
        const player = document.getElementById('playerShip');
        const asteroidRect = asteroid.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        
        return !(asteroidRect.right < playerRect.left || 
                asteroidRect.left > playerRect.right ||
                asteroidRect.bottom < playerRect.top ||
                asteroidRect.top > playerRect.bottom);
    }

    handleCollision(asteroid) {
        asteroid.remove();
        this.lives--;
        this.updateGameStats();
        
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    movePlayer(distance) {
        if (!this.gameActive) return;
        
        const player = document.getElementById('playerShip');
        const currentLeft = parseInt(player.style.left || '50');
        const newLeft = Math.max(0, Math.min(100, currentLeft + distance));
        
        player.style.left = newLeft + '%';
    }

    shoot() {
        if (!this.gameActive) return;
        
        const player = document.getElementById('playerShip');
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.innerHTML = '⚡';
        bullet.style.left = player.style.left;
        
        const shooterArea = document.getElementById('shooterArea');
        shooterArea.appendChild(bullet);
        
        this.animateBullet(bullet);
    }

    animateBullet(bullet) {
        let position = 50;
        
        const shoot = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(shoot);
                return;
            }
            
            position -= 5;
            bullet.style.top = position + 'px';
            
            // Проверка попадания
            const asteroids = document.querySelectorAll('.asteroid');
            asteroids.forEach(asteroid => {
                if (this.checkBulletCollision(bullet, asteroid)) {
                    this.handleAsteroidDestroy(asteroid);
                    bullet.remove();
                    clearInterval(shoot);
                }
            });
            
            // Удаление за пределами экрана
            if (position < 0) {
                bullet.remove();
                clearInterval(shoot);
            }
        }, 50);
    }

    handleAsteroidDestroy(asteroid) {
        asteroid.remove();
        this.score += 10;
        this.updateGameStats();
        
        // Проверка новой волны
        if (this.score >= this.wave * 100) {
            this.wave++;
            this.updateGameStats();
        }
    }

    updateGameStats() {
        document.getElementById('shooterScore').textContent = this.score;
        document.getElementById('shooterLives').textContent = this.lives;
        document.getElementById('shooterWave').textContent = this.wave;
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.gameLoop);
        clearInterval(this.asteroidInterval);
        
        // Награда за игру
        const reward = Math.floor(this.score * this.gameState.miniGames.shooter.rewardMultiplier);
        this.gameState.carrots += reward;
        
        document.getElementById('startShooter').disabled = false;
        document.getElementById('startShooter').textContent = 'Начать защиту';
        
        // Очистка игровой области
        document.getElementById('shooterArea').innerHTML = 
            '<div class="player" id="playerShip">🚀</div>';
        
        this.updateUI();
        this.saveGame();
        
        alert(`Игра окончена! Вы набрали ${this.score} очков и получили ${reward} морковок!`);
    }

    handleTouchControl(action) {
        switch(action) {
            case 'left':
                this.movePlayer(-20);
                break;
            case 'right':
                this.movePlayer(20);
                break;
            case 'shoot':
                this.shoot();
                break;
        }
    }
}