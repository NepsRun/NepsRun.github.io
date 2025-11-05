class BuilderGame {
    constructor(gameState, updateUI, saveGame) {
        this.gameState = gameState;
        this.updateUI = updateUI;
        this.saveGame = saveGame;
        this.currentLevel = 1;
        this.init();
    }

    init() {
        this.createGameArea();
        this.bindEvents();
        this.loadLevel(this.currentLevel);
    }

    createGameArea() {
        const builderTab = document.getElementById('builder');
        builderTab.innerHTML = `
            <div class="card">
                <h2 class="card-title">🔧 Сборка механизмов</h2>
                <p>Собери работающий механизм из деталей!</p>
                
                <div class="game-stats">
                    <div class="game-stat">Уровень: <span id="builderLevel">1</span></div>
                    <div class="game-stat">Собрано: <span id="builderCompleted">0</span></div>
                    <div class="game-stat">Время: <span id="builderTime">60</span>с</div>
                </div>
                
                <div class="builder-container">
                    <div class="parts-area" id="partsArea">
                        <!-- Детали будут добавляться здесь -->
                    </div>
                    <div class="workspace" id="workspace">
                        <div class="target-schema" id="targetSchema"></div>
                    </div>
                </div>
                
                <button class="btn btn-primary" id="startBuilder">Начать сборку</button>
                <button class="btn btn-secondary" id="checkBuilder">Проверить</button>
            </div>
        `;
    }

    loadLevel(level) {
        const levels = {
            1: {
                parts: ['🔩', '🔧', '⚙️', '📏'],
                target: '🔩+🔧=⚙️',
                time: 60
            },
            2: {
                parts: ['🔩', '🔧', '⚙️', '📏', '🛠️'],
                target: '🔩+🔧+⚙️=🛠️',
                time: 45
            },
            3: {
                parts: ['🔩', '🔧', '⚙️', '📏', '🛠️', '⛓️'],
                target: '🛠️+⛓️+🔩=🚀',
                time: 30
            }
        };

        this.currentLevelData = levels[level] || levels[1];
        this.setupLevel();
    }

    setupLevel() {
        const partsArea = document.getElementById('partsArea');
        const targetSchema = document.getElementById('targetSchema');
        
        // Очистка
        partsArea.innerHTML = '';
        targetSchema.innerHTML = '';
        
        // Добавление деталей
        this.currentLevelData.parts.forEach(part => {
            const partElement = document.createElement('div');
            partElement.className = 'builder-part';
            partElement.innerHTML = part;
            partElement.draggable = true;
            partElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', part);
            });
            partsArea.appendChild(partElement);
        });
        
        // Установка цели
        targetSchema.innerHTML = this.currentLevelData.target;
        
        // Настройка рабочей области
        const workspace = document.getElementById('workspace');
        workspace.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            const part = e.dataTransfer.getData('text/plain');
            this.addPartToWorkspace(part, e.clientX, e.clientY);
        });
        
        // Обновление статистики
        document.getElementById('builderLevel').textContent = this.currentLevel;
        document.getElementById('builderTime').textContent = this.currentLevelData.time;
    }

    addPartToWorkspace(part, x, y) {
        const workspace = document.getElementById('workspace');
        const partElement = document.createElement('div');
        partElement.className = 'workspace-part';
        partElement.innerHTML = part;
        partElement.style.left = (x - workspace.getBoundingClientRect().left - 20) + 'px';
        partElement.style.top = (y - workspace.getBoundingClientRect().top - 20) + 'px';
        
        // Сделать перетаскиваемым
        partElement.draggable = true;
        partElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', part);
        });
        
        workspace.appendChild(partElement);
    }

    bindEvents() {
        document.getElementById('startBuilder').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('checkBuilder').addEventListener('click', () => {
            this.checkSolution();
        });
    }

    startGame() {
        this.gameActive = true;
        this.timeLeft = this.currentLevelData.time;
        this.currentSolution = [];
        
        document.getElementById('startBuilder').disabled = true;
        document.getElementById('checkBuilder').disabled = false;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('builderTime').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    checkSolution() {
        const workspaceParts = document.querySelectorAll('.workspace-part');
        const solution = Array.from(workspaceParts).map(part => part.innerHTML).join('');
        
        if (solution === this.currentLevelData.target.replace(/[+=]/g, '')) {
            this.completeLevel();
        } else {
            alert('Неправильная сборка! Попробуйте еще раз.');
        }
    }

    completeLevel() {
        clearInterval(this.timer);
        
        const reward = this.currentLevel * 25;
        this.gameState.carrots += reward;
        this.gameState.miniGames.builder.completed++;
        
        document.getElementById('builderCompleted').textContent = 
            this.gameState.miniGames.builder.completed;
        
        this.updateUI();
        this.saveGame();
        
        if (this.currentLevel < 3) {
            this.currentLevel++;
            setTimeout(() => {
                this.loadLevel(this.currentLevel);
                document.getElementById('startBuilder').disabled = false;
                document.getElementById('checkBuilder').disabled = true;
                alert(`Уровень ${this.currentLevel - 1} пройден! Награда: ${reward} морковок`);
            }, 1000);
        } else {
            this.endGame(true);
        }
    }

    endGame(success) {
        this.gameActive = false;
        clearInterval(this.timer);
        
        document.getElementById('startBuilder').disabled = false;
        document.getElementById('checkBuilder').disabled = true;
        
        if (!success) {
            alert('Время вышло! Попробуйте еще раз.');
        }
    }
}