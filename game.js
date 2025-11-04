class NeptunCarrotGame {
    constructor() {
        this.state = {
            resources: {
                np: 100,
                carrots: 0
            },
            bunker: {
                level: 1,
                experience: 0,
                experienceRequired: 100
            },
            farm: {
                plots: Array(6).fill().map(() => ({
                    state: 'empty', // empty, growing, ready
                    progress: 0,
                    growthTime: 30000 // 30 секунд
                }))
            },
            upgrades: {
                lab: {
                    basic_research: { level: 0, maxLevel: 10 },
                    carrot_boost: { level: 0, maxLevel: 5 }
                },
                neptun: {
                    water_system: { level: 0, maxLevel: 10 }
                },
                titan: {
                    auto_clicker: { level: 0, maxLevel: 5 }
                }
            },
            stats: {
                perClick: 1,
                autoIncome: 0,
                totalClicks: 0,
                totalNp: 100,
                carrotsHarvested: 0
            },
            leaderboard: this.loadLeaderboard()
        };
        
        this.autoInterval = null;
        this.farmInterval = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGame();
        this.updateUI();
        this.startAutoSystems();
        this.startFarmSystem();
        this.generateQuantumParticles();
        this.updateLeaderboard();
    }
    
    setupEventListeners() {
        // Клик по морковке
        document.getElementById('main-carrot').addEventListener('click', (e) => {
            this.handleCarrotClick(e);
        });
        
        // Нижняя навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Системы улучшений
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
        
        // Огород
        document.getElementById('plant-all-btn').addEventListener('click', () => {
            this.plantAllPlots();
        });
        
        document.getElementById('harvest-all-btn').addEventListener('click', () => {
            this.harvestAllPlots();
        });
        
        // Магазин
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const option = e.target.closest('.sell-option');
                this.sellCarrots(parseInt(option.dataset.amount));
            });
        });
        
        // Закрытие профессора
        document.getElementById('close-professor').addEventListener('click', () => {
            this.hideProfessor();
        });
    }
    
    // === КЛИКЕР ===
    handleCarrotClick(event) {
        const carrot = document.getElementById('main-carrot');
        const clickEffect = document.getElementById('click-effect');
        
        // Анимация клика
        carrot.style.transform = 'scale(0.95)';
        setTimeout(() => {
            carrot.style.transform = 'scale(1)';
        }, 100);
        
        // Расчет дохода
        let income = this.state.stats.perClick;
        
        // Эффект клика
        clickEffect.textContent = `+${income}`;
        clickEffect.style.animation = 'none';
        void clickEffect.offsetWidth;
        clickEffect.style.animation = 'clickPulse 0.6s ease-out';
        
        // Начисление нептуния
        this.addResource('np', income);
        this.addBunkerExperience(1);
        
        // Статистика
        this.state.stats.totalClicks++;
        
        // Случайный бонус (5% шанс)
        if (Math.random() < 0.05) {
            this.showBonusEffect();
        }
    }
    
    // === ОГОРОД ===
    startFarmSystem() {
        this.farmInterval = setInterval(() => {
            this.updateFarm();
        }, 1000);
        
        this.renderFarm();
    }
    
    renderFarm() {
        const farmGrid = document.getElementById('farm-grid');
        farmGrid.innerHTML = '';
        
        this.state.farm.plots.forEach((plot, index) => {
            const plotElement = document.createElement('div');
            plotElement.className = `farm-plot ${plot.state}`;
            plotElement.innerHTML = `
                ${plot.state === 'growing' ? `<div class="progress" style="width: ${plot.progress}%"></div>` : ''}
            `;
            
            plotElement.addEventListener('click', () => {
                this.handlePlotClick(index);
            });
            
            farmGrid.appendChild(plotElement);
        });
        
        this.updateFarmStats();
    }
    
    handlePlotClick(plotIndex) {
        const plot = this.state.farm.plots[plotIndex];
        
        switch(plot.state) {
            case 'empty':
                this.plantPlot(plotIndex);
                break;
            case 'ready':
                this.harvestPlot(plotIndex);
                break;
        }
    }
    
    plantPlot(plotIndex) {
        const plot = this.state.farm.plots[plotIndex];
        
        // Учитываем улучшения скорости роста
        let growthTime = plot.growthTime;
        if (this.state.upgrades.lab.carrot_boost.level > 0) {
            const boost = 0.2 * this.state.upgrades.lab.carrot_boost.level;
            growthTime = growthTime * (1 - boost);
        }
        
        plot.state = 'growing';
        plot.progress = 0;
        plot.startTime = Date.now();
        plot.growthTime = growthTime;
        
        this.renderFarm();
        this.showProfessorMessage("Морковка посажена! Жди урожая!", 2000);
    }
    
    harvestPlot(plotIndex) {
        const plot = this.state.farm.plots[plotIndex];
        
        // Начисляем морковку
        this.state.resources.carrots += 1;
        this.state.stats.carrotsHarvested += 1;
        
        // Сбрасываем грядку
        plot.state = 'empty';
        plot.progress = 0;
        
        this.renderFarm();
        this.updateUI();
        this.showProfessorMessage("Урожай собран! +1 морковка!", 2000);
    }
    
    plantAllPlots() {
        let planted = 0;
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'empty') {
                this.plantPlot(index);
                planted++;
            }
        });
        
        if (planted > 0) {
            this.showProfessorMessage(`Посажено ${planted} грядок!`, 2000);
        }
    }
    
    harvestAllPlots() {
        let harvested = 0;
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'ready') {
                this.harvestPlot(index);
                harvested++;
            }
        });
        
        if (harvested > 0) {
            this.showProfessorMessage(`Собрано ${harvested} морковок!`, 2000);
        }
    }
    
    updateFarm() {
        let updated = false;
        const now = Date.now();
        
        this.state.farm.plots.forEach(plot => {
            if (plot.state === 'growing' && plot.startTime) {
                const elapsed = now - plot.startTime;
                plot.progress = Math.min((elapsed / plot.growthTime) * 100, 100);
                
                if (elapsed >= plot.growthTime) {
                    plot.state = 'ready';
                    updated = true;
                }
            }
        });
        
        if (updated) {
            this.renderFarm();
        }
    }
    
    updateFarmStats() {
        const readyCount = this.state.farm.plots.filter(plot => plot.state === 'ready').length;
        const growingCount = this.state.farm.plots.filter(plot => plot.state === 'growing').length;
        
        document.getElementById('ready-count').textContent = readyCount;
        document.getElementById('growing-count').textContent = growingCount;
    }
    
    // === МАГАЗИН ===
    sellCarrots(amount) {
        if (this.state.resources.carrots >= amount) {
            const income = amount * 5; // 5 нептуния за морковку
            
            this.state.resources.carrots -= amount;
            this.addResource('np', income);
            
            this.showProfessorMessage(`Продано ${amount} морковок за ${income} нептуния!`, 3000);
            this.updateUI();
            this.saveGame();
        } else {
            this.showProfessorMessage("Недостаточно морковки для продажи!", 3000);
        }
    }
    
    // === ЛИДЕРБОРД ===
    loadLeaderboard() {
        const saved = localStorage.getItem('neptunLeaderboard');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Стартовые данные
        return [
            { name: 'Профессор Банансон', np: 10000, level: 10 },
            { name: 'Космический Фермер', np: 5000, level: 8 },
            { name: 'Нептуниевый Магнат', np: 3000, level: 6 },
            { name: 'Вы', np: 100, level: 1 }
        ];
    }
    
    saveLeaderboard() {
        // Обновляем свои данные
        const playerIndex = this.state.leaderboard.findIndex(player => player.name === 'Вы');
        if (playerIndex !== -1) {
            this.state.leaderboard[playerIndex].np = this.state.stats.totalNp;
            this.state.leaderboard[playerIndex].level = this.state.bunker.level;
        }
        
        // Сортируем по нептунию
        this.state.leaderboard.sort((a, b) => b.np - a.np);
        
        localStorage.setItem('neptunLeaderboard', JSON.stringify(this.state.leaderboard));
    }
    
    updateLeaderboard() {
        this.saveLeaderboard();
        
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        
        this.state.leaderboard.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            
            item.innerHTML = `
                <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-stats">
                        Ур. ${player.level} | ${this.formatNumber(player.np)} Np
                    </div>
                </div>
            `;
            
            leaderboardList.appendChild(item);
        });
        
        // Обновляем статистику игрока
        const playerRank = this.state.leaderboard.findIndex(player => player.name === 'Вы') + 1;
        document.getElementById('player-rank').textContent = playerRank;
        document.getElementById('player-np').textContent = this.formatNumber(this.state.stats.totalNp);
        document.getElementById('player-bunker-level').textContent = this.state.bunker.level;
    }
    
    // === ОБЩИЕ СИСТЕМЫ ===
    switchTab(tabName) {
        // Обновляем активные кнопки навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем соответствующий раздел
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}-section`).classList.add('active');
    }
    
    switchSystem(systemName) {
        document.querySelectorAll('.system-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-system="${systemName}"]`).classList.add('active');
        
        document.querySelectorAll('.upgrade-category').forEach(category => {
            category.classList.remove('active');
        });
        document.getElementById(`${systemName}-upgrades`).classList.add('active');
    }
    
    addBunkerExperience(amount) {
        this.state.bunker.experience += amount;
        
        if (this.state.bunker.experience >= this.state.bunker.experienceRequired) {
            this.levelUpBunker();
        }
        
        this.updateUI();
    }
    
    levelUpBunker() {
        this.state.bunker.level++;
        this.state.bunker.experience = 0;
        this.state.bunker.experienceRequired = Math.floor(this.state.bunker.experienceRequired * 1.5);
        
        // Добавляем новые грядки каждые 2 уровня
        if (this.state.bunker.level % 2 === 0) {
            this.state.farm.plots.push({
                state: 'empty',
                progress: 0,
                growthTime: 30000
            });
            this.showProfessorMessage(`Новый уровень бункера! Добавлена грядка!`, 4000);
        } else {
            this.showProfessorMessage(`Новый уровень бункера! Теперь у вас ${this.state.bunker.level} уровень!`, 4000);
        }
        
        this.renderFarm();
        this.saveGame();
    }
    
    buyUpgrade(upgradeId) {
        const upgradeConfig = this.getUpgradeConfig(upgradeId);
        if (!upgradeConfig) return;
        
        const upgrade = this.getUpgradeState(upgradeId);
        const cost = this.calculateUpgradeCost(upgradeId, upgrade.level);
        
        if (this.state.resources.np >= cost && upgrade.level < upgrade.maxLevel) {
            this.state.resources.np -= cost;
            upgrade.level++;
            this.applyUpgradeEffect(upgradeId);
            
            this.addBunkerExperience(10);
            this.showProfessorMessage(`Улучшение "${upgradeConfig.name}" куплено!`, 3000);
            
            this.updateUI();
            this.saveGame();
        }
    }
    
    getUpgradeConfig(upgradeId) {
        const configs = {
            basic_research: { name: "Базовые исследования", system: "lab" },
            carrot_boost: { name: "Ускорение роста", system: "lab" },
            water_system: { name: "Водная система", system: "neptun" },
            auto_clicker: { name: "Авто-кликер", system: "titan" }
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
            carrot_boost: 200,
            water_system: 100,
            auto_clicker: 300
        };
        
        return Math.floor(baseCosts[upgradeId] * Math.pow(1.5, level));
    }
    
    applyUpgradeEffect(upgradeId) {
        switch (upgradeId) {
            case 'basic_research':
                this.state.stats.perClick += 1;
                break;
            case 'water_system':
                this.state.stats.autoIncome += 1;
                break;
        }
        
        this.startAutoSystems();
    }
    
    startAutoSystems() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        
        if (this.state.stats.autoIncome > 0) {
            this.autoInterval = setInterval(() => {
                this.addResource('np', this.state.stats.autoIncome);
                this.addBunkerExperience(this.state.stats.autoIncome * 0.1);
            }, 1000);
        }
        
        const autoClickerLevel = this.state.upgrades.titan.auto_clicker.level;
        if (autoClickerLevel > 0) {
            setInterval(() => {
                for (let i = 0; i < autoClickerLevel; i++) {
                    this.addResource('np', this.state.stats.perClick);
                    this.addBunkerExperience(1);
                }
            }, 1000);
        }
    }
    
    addResource(currency, amount) {
        this.state.resources[currency] += amount;
        if (currency === 'np') {
            this.state.stats.totalNp += amount;
        }
        this.updateUI();
    }
    
    updateUI() {
        // Ресурсы
        document.getElementById('np-amount').textContent = this.formatNumber(this.state.resources.np);
        document.getElementById('carrots-amount').textContent = this.state.resources.carrots;
        
        // Статистика
        document.getElementById('per-click').textContent = this.formatNumber(this.state.stats.perClick);
        document.getElementById('auto-income').textContent = this.formatNumber(this.state.stats.autoIncome);
        
        // Уровень бункера
        document.getElementById('bunker-level').textContent = this.state.bunker.level;
        
        // Прогресс уровня
        const progressPercent = (this.state.bunker.experience / this.state.bunker.experienceRequired) * 100;
        document.getElementById('level-progress').style.width = progressPercent + '%';
        document.getElementById('level-progress-text').textContent = 
            `${this.formatNumber(this.state.bunker.experience)}/${this.formatNumber(this.state.bunker.experienceRequired)}`;
        
        // Обновляем кнопки улучшений
        this.updateUpgradeButtons();
        
        // Обновляем кнопки продажи
        this.updateSellButtons();
    }
    
    updateUpgradeButtons() {
        document.querySelectorAll('.upgrade-item').forEach(item => {
            const upgradeId = item.dataset.upgrade;
            const btn = item.querySelector('.buy-btn');
            const costElement = item.querySelector('.upgrade-cost');
            
            const upgrade = this.getUpgradeState(upgradeId);
            const cost = this.calculateUpgradeCost(upgradeId, upgrade.level);
            
            if (costElement) {
                costElement.textContent = `Стоимость: ${this.formatNumber(cost)} Np`;
            }
            
            if (btn) {
                if (upgrade.level >= upgrade.maxLevel) {
                    btn.textContent = 'Макс ур.';
                    btn.disabled = true;
                } else {
                    btn.disabled = this.state.resources.np < cost;
                }
            }
        });
    }
    
    updateSellButtons() {
        document.querySelectorAll('.sell-btn').forEach(btn => {
            const option = btn.closest('.sell-option');
            const amount = parseInt(option.dataset.amount);
            btn.disabled = this.state.resources.carrots < amount;
        });
    }
    
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
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
            "Квантовый скачок! Бонусный нептуний!",
            "Удача на твоей стороне! Дополнительный доход!",
            "Цепная реакция! Критический клик!"
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showProfessorMessage(message, 2000);
    }
    
    generateQuantumParticles() {
        const particlesContainer = document.querySelector('.quantum-particles');
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    saveGame() {
        localStorage.setItem('neptunCarrotGame', JSON.stringify(this.state));
        this.updateLeaderboard();
    }
    
    loadGame() {
        const saved = localStorage.getItem('neptunCarrotGame');
        if (saved) {
            this.state = JSON.parse(saved);
            this.recalculateStats();
            this.renderFarm();
        }
    }
    
    recalculateStats() {
        // Пересчитываем статистику на основе улучшений
        this.state.stats.perClick = 1;
        this.state.stats.autoIncome = 0;
        
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
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NeptunCarrotGame();
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});
