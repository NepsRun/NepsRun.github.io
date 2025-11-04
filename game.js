class NeptunClickerGame {
    constructor() {
        this.state = {
            resources: {
                np237: 100,
                np239: 0,
                pu238: 0
            },
            bunker: {
                level: 1,
                experience: 0,
                experienceRequired: 100
            },
            upgrades: {
                lab: {
                    basic_research: { level: 0, maxLevel: 10 }
                },
                neptun: {
                    water_system: { level: 0, maxLevel: 10 }
                },
                titan: {
                    auto_clicker: { level: 0, maxLevel: 5 }
                },
                monkeys: {
                    lab_monkey: { level: 0, maxLevel: 3 }
                }
            },
            stats: {
                perClick: 1,
                autoIncome: 0,
                multiplier: 1,
                totalClicks: 0,
                totalNp237: 100
            },
            leaderboard: []
        };
        
        this.autoInterval = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGame();
        this.updateUI();
        this.startAutoSystems();
        this.generateQuantumParticles();
        this.updateLeaderboard();
    }
    
    setupEventListeners() {
        // Клик по морковке
        document.getElementById('main-carrot').addEventListener('click', (e) => {
            this.handleCarrotClick(e);
        });
        
        // Переключение систем
        document.querySelectorAll('.system-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchSystem(e.currentTarget.dataset.system);
            });
        });
        
        // Покупка улучшений
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeItem = e.target.closest('.upgrade-item');
                this.buyUpgrade(upgradeItem.dataset.upgrade);
            });
        });
        
        // Улучшение бункера
        document.getElementById('upgrade-bunker-btn').addEventListener('click', () => {
            this.upgradeBunker();
        });
        
        // Закрытие профессора
        document.getElementById('close-professor').addEventListener('click', () => {
            this.hideProfessor();
        });
    }
    
    handleCarrotClick(event) {
        const carrot = document.getElementById('main-carrot');
        const clickEffect = document.getElementById('click-effect');
        
        // Анимация клика
        carrot.style.transform = 'scale(0.95)';
        setTimeout(() => {
            carrot.style.transform = 'scale(1)';
        }, 100);
        
        // Расчет дохода
        let income = this.stats.perClick * this.stats.multiplier;
        
        // Эффект клика
        clickEffect.textContent = `+${Math.floor(income)}`;
        clickEffect.style.animation = 'none';
        void clickEffect.offsetWidth;
        clickEffect.style.animation = 'clickPulse 0.6s ease-out';
        
        // Начисление нептуния
        this.addResource('np237', income);
        this.addBunkerExperience(1);
        
        // Статистика
        this.state.stats.totalClicks++;
        
        // Случайный бонус (5% шанс)
        if (Math.random() < 0.05) {
            this.showBonusEffect();
        }
    }
    
    addBunkerExperience(amount) {
        this.state.bunker.experience += amount;
        
        // Проверка уровня
        if (this.state.bunker.experience >= this.state.bunker.experienceRequired) {
            this.levelUpBunker();
        }
        
        this.updateUI();
    }
    
    levelUpBunker() {
        this.state.bunker.level++;
        this.state.bunker.experience = 0;
        this.state.bunker.experienceRequired = Math.floor(this.state.bunker.experienceRequired * 1.5);
        
        // Сообщение профессора
        this.showProfessorMessage(`Поздравляю! Бункер достиг ${this.state.bunker.level} уровня!`, 5000);
        
        this.saveGame();
    }
    
    upgradeBunker() {
        const cost = this.getBunkerUpgradeCost();
        
        if (this.state.resources.np237 >= cost) {
            this.state.resources.np237 -= cost;
            this.addBunkerExperience(50);
            this.showProfessorMessage("Отличное вложение! Бункер становится лучше!", 3000);
            this.updateUI();
            this.saveGame();
        }
    }
    
    getBunkerUpgradeCost() {
        return 100 * Math.pow(2, this.state.bunker.level - 1);
    }
    
    buyUpgrade(upgradeId) {
        const upgradeConfig = this.getUpgradeConfig(upgradeId);
        if (!upgradeConfig) return;
        
        const upgrade = this.getUpgradeState(upgradeId);
        const cost = this.calculateUpgradeCost(upgradeId, upgrade.level);
        
        if (this.state.resources.np237 >= cost && upgrade.level < upgrade.maxLevel) {
            // Списание ресурсов
            this.state.resources.np237 -= cost;
            
            // Улучшение
            upgrade.level++;
            
            // Применение эффекта
            this.applyUpgradeEffect(upgradeId);
            
            // Опыт за улучшение
            this.addBunkerExperience(10);
            
            // Сообщение профессора
            this.showProfessorMessage(`Улучшение "${upgradeConfig.name}" достигло уровня ${upgrade.level}!`, 3000);
            
            this.updateUI();
            this.saveGame();
        }
    }
    
    getUpgradeConfig(upgradeId) {
        const configs = {
            basic_research: { name: "Базовые исследования", system: "lab" },
            water_system: { name: "Водная система", system: "neptun" },
            auto_clicker: { name: "Авто-кликер", system: "titan" },
            lab_monkey: { name: "Обезьяна-лаборант", system: "monkeys" }
        };
        return configs[upgradeId];
    }
    
    getUpgradeState(upgradeId) {
        const config = this.getUpgradeConfig(upgradeId);
        return this.state.upgrades[config.system][upgradeId];
    }
    
    calculateUpgradeCost(upgradeId, level) {
        const baseCosts = {
            basic_research: 50,
            water_system: 100,
            auto_clicker: 300,
            lab_monkey: 500
        };
        
        return Math.floor(baseCosts[upgradeId] * Math.pow(1.8, level));
    }
    
    applyUpgradeEffect(upgradeId) {
        switch (upgradeId) {
            case 'basic_research':
                this.state.stats.perClick += 1;
                break;
            case 'water_system':
                this.state.stats.autoIncome += 1;
                break;
            case 'lab_monkey':
                this.state.stats.multiplier *= 1.05;
                break;
        }
        
        this.startAutoSystems();
    }
    
    startAutoSystems() {
        // Очищаем предыдущие интервалы
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        
        // Авто-доход
        if (this.state.stats.autoIncome > 0) {
            this.autoInterval = setInterval(() => {
                const income = this.state.stats.autoIncome * this.state.stats.multiplier;
                this.addResource('np237', income);
                this.addBunkerExperience(income * 0.1);
            }, 1000);
        }
        
        // Авто-кликеры
        const autoClickerLevel = this.state.upgrades.titan.auto_clicker.level;
        
        if (autoClickerLevel > 0) {
            setInterval(() => {
                for (let i = 0; i < autoClickerLevel; i++) {
                    const income = this.state.stats.perClick * this.state.stats.multiplier;
                    this.addResource('np237', income);
                    this.addBunkerExperience(1);
                }
            }, 1000);
        }
    }
    
    addResource(currency, amount) {
        this.state.resources[currency] += amount;
        this.state.stats.totalNp237 += amount;
        this.updateUI();
    }
    
    switchSystem(systemName) {
        // Обновляем активные табы
        document.querySelectorAll('.system-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-system="${systemName}"]`).classList.add('active');
        
        // Показываем соответствующие улучшения
        document.querySelectorAll('.upgrade-category').forEach(category => {
            category.classList.remove('active');
        });
        document.getElementById(`${systemName}-upgrades`).classList.add('active');
        
        if (systemName === 'leaderboard') {
            this.updateLeaderboard();
        }
    }
    
    updateUI() {
        // Обновляем ресурсы
        document.getElementById('np237-amount').textContent = this.formatNumber(this.state.resources.np237);
        document.getElementById('np239-amount').textContent = this.formatNumber(this.state.resources.np239);
        document.getElementById('pu238-amount').textContent = this.formatNumber(this.state.resources.pu238);
        
        // Обновляем статистику
        document.getElementById('per-click').textContent = this.formatNumber(this.state.stats.perClick);
        document.getElementById('auto-income').textContent = this.formatNumber(this.state.stats.autoIncome);
        document.getElementById('multiplier').textContent = this.state.stats.multiplier.toFixed(1) + 'x';
        
        // Обновляем уровень бункера
        document.getElementById('bunker-level').textContent = this.state.bunker.level;
        
        // Обновляем прогресс уровня
        const progressPercent = (this.state.bunker.experience / this.state.bunker.experienceRequired) * 100;
        document.getElementById('level-progress').style.width = progressPercent + '%';
        document.getElementById('level-progress-text').textContent = 
            `${this.formatNumber(this.state.bunker.experience)}/${this.formatNumber(this.state.bunker.experienceRequired)}`;
        
        // Обновляем кнопку улучшения бункера
        const bunkerUpgradeCost = this.getBunkerUpgradeCost();
        document.getElementById('bunker-upgrade-cost').textContent = this.formatNumber(bunkerUpgradeCost) + ' Np-237';
        document.getElementById('upgrade-bunker-btn').disabled = this.state.resources.np237 < bunkerUpgradeCost;
        
        // Обновляем кнопки улучшений
        this.updateUpgradeButtons();
        
        // Обновляем лидерборд если активен
        if (document.querySelector('[data-system="leaderboard"]').classList.contains('active')) {
            this.updateLeaderboard();
        }
    }
    
    updateUpgradeButtons() {
        document.querySelectorAll('.upgrade-item').forEach(item => {
            const upgradeId = item.dataset.upgrade;
            const btn = item.querySelector('.buy-btn');
            const costElement = item.querySelector('.upgrade-cost');
            const levelElement = item.querySelector('.level-current');
            
            const upgrade = this.getUpgradeState(upgradeId);
            const cost = this.calculateUpgradeCost(upgradeId, upgrade.level);
            
            if (levelElement) {
                levelElement.textContent = upgrade.level;
            }
            
            if (costElement) {
                costElement.textContent = `Стоимость: ${this.formatNumber(cost)} Np-237`;
            }
            
            if (btn) {
                if (upgrade.level >= upgrade.maxLevel) {
                    btn.textContent = 'Макс ур.';
                    btn.disabled = true;
                } else {
                    btn.textContent = this.getUpgradeButtonText(upgradeId);
                    btn.disabled = this.state.resources.np237 < cost;
                }
            }
        });
    }
    
    getUpgradeButtonText(upgradeId) {
        const texts = {
            basic_research: 'Исследовать',
            water_system: 'Установить',
            auto_clicker: 'Создать',
            lab_monkey: 'Нанять'
        };
        return texts[upgradeId] || 'Купить';
    }
    
    updateLeaderboard() {
        // Генерируем фейковые данные для демо
        this.generateMockLeaderboard();
        
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        
        this.state.leaderboard.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="leaderboard-rank rank-${index + 1}">${index + 1}</div>
                <div class="leaderboard-avatar">${player.avatar}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-stats">
                        Ур. ${player.level} | ${this.formatNumber(player.score)} Np-237
                    </div>
                </div>
            `;
            leaderboardList.appendChild(item);
        });
        
        // Обновляем статистику игрока
        document.getElementById('player-rank').textContent = this.getPlayerRank();
        document.getElementById('player-total').textContent = this.formatNumber(this.state.stats.totalNp237);
        document.getElementById('player-bunker-level').textContent = this.state.bunker.level;
    }
    
    generateMockLeaderboard() {
        const avatars = ['🐵', '🐶', '🐱', '🐯', '🐺', '🦊', '🦁', '🐮', '🐷', '🐔'];
        const names = ['Профессор', 'Ученый', 'Инженер', 'Исследователь', 'Новатор', 'Гений', 'Техник', 'Лаборант', 'Аналитик', 'Экспериментатор'];
        
        this.state.leaderboard = [];
        
        // Добавляем текущего игрока
        this.state.leaderboard.push({
            name: 'Вы',
            avatar: '🐵',
            level: this.state.bunker.level,
            score: this.state.stats.totalNp237
        });
        
        // Генерируем фейковых игроков
        for (let i = 0; i < 9; i++) {
            this.state.leaderboard.push({
                name: names[Math.floor(Math.random() * names.length)] + ' ' + (i + 1),
                avatar: avatars[Math.floor(Math.random() * avatars.length)],
                level: Math.floor(Math.random() * 10) + 1,
                score: Math.floor(Math.random() * 100000) + 1000
            });
        }
        
        // Сортируем по очкам
        this.state.leaderboard.sort((a, b) => b.score - a.score);
    }
    
    getPlayerRank() {
        const playerIndex = this.state.leaderboard.findIndex(player => player.name === 'Вы');
        return playerIndex !== -1 ? playerIndex + 1 : '-';
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.floor(num).toString();
    }
    
    showProfessorMessage(message, duration = 3000) {
        const messageElement = document.getElementById('professor-message');
        const panel = document.querySelector('.professor-panel');
        
        if (messageElement) {
            messageElement.textContent = message;
            panel.style.display = 'flex';
            
            if (duration > 0) {
                setTimeout(() => {
                    this.hideProfessor();
                }, duration);
            }
        }
    }
    
    hideProfessor() {
        document.querySelector('.professor-panel').style.display = 'none';
    }
    
    showBonusEffect() {
        const messages = [
            "Квантовый скачок! Критическое попадание!",
            "Нептуний резонирует с высшей гармонией!",
            "Твои клики вызывают цепную реакцию!",
            "Произошла временная аномалия! Бонус!",
            "Обезьяны ликуют от твоих успехов!"
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showProfessorMessage(message, 2000);
        
        // Визуальный эффект
        const carrot = document.querySelector('.carrot');
        carrot.style.filter = 'drop-shadow(0 0 30px #ff0000)';
        setTimeout(() => {
            carrot.style.filter = 'drop-shadow(0 0 20px var(--carrot-orange))';
        }, 500);
    }
    
    generateQuantumParticles() {
        const particlesContainer = document.querySelector('.quantum-particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (2 + Math.random() * 2) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    saveGame() {
        localStorage.setItem('neptunClicker', JSON.stringify(this.state));
    }
    
    loadGame() {
        const saved = localStorage.getItem('neptunClicker');
        if (saved) {
            this.state = JSON.parse(saved);
            this.recalculateStats();
        }
    }
    
    recalculateStats() {
        // Сбрасываем базовые значения
        this.state.stats.perClick = 1;
        this.state.stats.autoIncome = 0;
        this.state.stats.multiplier = 1;
        
        // Применяем эффекты улучшений
        Object.keys(this.state.upgrades.lab).forEach(upgradeId => {
            const upgrade = this.state.upgrades.lab[upgradeId];
            for (let i = 0; i < upgrade.level; i++) {
                this.applyUpgradeEffect(upgradeId);
            }
        });
        
        Object.keys(this.state.upgrades.neptun).forEach(upgradeId => {
            const upgrade = this.state.upgrades.neptun[upgradeId];
            for (let i = 0; i < upgrade.level; i++) {
                this.applyUpgradeEffect(upgradeId);
            }
        });
        
        Object.keys(this.state.upgrades.monkeys).forEach(upgradeId => {
            const upgrade = this.state.upgrades.monkeys[upgradeId];
            for (let i = 0; i < upgrade.level; i++) {
                this.applyUpgradeEffect(upgradeId);
            }
        });
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NeptunClickerGame();
    
    // Инициализация Telegram Web App
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});