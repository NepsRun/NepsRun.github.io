class NeptunGame {
    constructor() {
        this.state = {
            resources: {
                np237: 100,
                np239: 0,
                pu238: 0,
                carrots: 0
            },
            farm: {
                plots: Array(6).fill().map(() => ({
                    state: 'empty',
                    progress: 0,
                    growthTime: 30000
                }))
            },
            upgrades: {
                basic_research: { level: 0, maxLevel: 10 },
                isotope_study: { level: 0, maxLevel: 5 },
                water_system: { level: 0, maxLevel: 10 },
                auto_clicker: { level: 0, maxLevel: 5 }
            },
            stats: {
                perClick: 1,
                autoIncome: 0
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGame();
        this.updateUI();
        this.startAutoSystems();
        this.renderFarm();
    }
    
    setupEventListeners() {
        // Клик по морковке
        document.getElementById('main-carrot').addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Покупка улучшений
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgrade = e.target.closest('.upgrade');
                this.buyUpgrade(upgrade.dataset.upgrade);
            });
        });
        
        // Огород
        document.getElementById('plant-all').addEventListener('click', () => {
            this.plantAll();
        });
        
        document.getElementById('harvest-all').addEventListener('click', () => {
            this.harvestAll();
        });
        
        // Магазин
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const option = e.target.closest('.sell-option');
                this.sellCarrots(parseInt(option.dataset.amount));
            });
        });
    }
    
    handleClick(e) {
        const carrot = e.target;
        carrot.style.transform = 'scale(0.95)';
        setTimeout(() => carrot.style.transform = 'scale(1)', 100);
        
        this.addResource('np237', this.state.stats.perClick);
        this.updateUI();
    }
    
    switchTab(tabName) {
        // Обновляем кнопки
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем контент
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');
        
        if (tabName === 'farm') {
            this.renderFarm();
        }
    }
    
    buyUpgrade(upgradeId) {
        const upgrade = this.state.upgrades[upgradeId];
        const cost = this.getUpgradeCost(upgradeId, upgrade.level);
        
        if (this.state.resources.np237 >= cost && upgrade.level < upgrade.maxLevel) {
            this.state.resources.np237 -= cost;
            upgrade.level++;
            
            // Применяем эффект
            switch(upgradeId) {
                case 'basic_research':
                    this.state.stats.perClick += 1;
                    break;
                case 'isotope_study':
                    this.state.stats.perClick += 2;
                    break;
                case 'water_system':
                    this.state.stats.autoIncome += 1;
                    break;
            }
            
            this.startAutoSystems();
            this.updateUI();
            this.saveGame();
        }
    }
    
    getUpgradeCost(upgradeId, level) {
        const baseCosts = {
            basic_research: 50,
            isotope_study: 200,
            water_system: 100,
            auto_clicker: 300
        };
        return Math.floor(baseCosts[upgradeId] * Math.pow(1.5, level));
    }
    
    // Огород
    renderFarm() {
        const farmGrid = document.querySelector('.farm-grid');
        farmGrid.innerHTML = '';
        
        this.state.farm.plots.forEach((plot, index) => {
            const plotElement = document.createElement('div');
            plotElement.className = `farm-plot ${plot.state}`;
            plotElement.addEventListener('click', () => {
                if (plot.state === 'empty') this.plantPlot(index);
                else if (plot.state === 'ready') this.harvestPlot(index);
            });
            farmGrid.appendChild(plotElement);
        });
    }
    
    plantPlot(index) {
        const plot = this.state.farm.plots[index];
        plot.state = 'growing';
        plot.progress = 0;
        plot.startTime = Date.now();
        
        setTimeout(() => {
            plot.state = 'ready';
            this.renderFarm();
        }, plot.growthTime);
        
        this.renderFarm();
    }
    
    harvestPlot(index) {
        const plot = this.state.farm.plots[index];
        plot.state = 'empty';
        this.state.resources.carrots += 1;
        this.renderFarm();
        this.updateUI();
    }
    
    plantAll() {
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'empty') {
                this.plantPlot(index);
            }
        });
    }
    
    harvestAll() {
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'ready') {
                this.harvestPlot(index);
            }
        });
    }
    
    // Магазин
    sellCarrots(amount) {
        if (this.state.resources.carrots >= amount) {
            this.state.resources.carrots -= amount;
            this.addResource('np237', amount * 5);
            this.updateUI();
            this.saveGame();
        }
    }
    
    // Системы
    addResource(type, amount) {
        this.state.resources[type] += amount;
    }
    
    startAutoSystems() {
        // Авто-доход
        if (this.state.stats.autoIncome > 0) {
            setInterval(() => {
                this.addResource('np237', this.state.stats.autoIncome);
                this.updateUI();
            }, 1000);
        }
        
        // Авто-кликеры
        const autoClickerLevel = this.state.upgrades.auto_clicker.level;
        if (autoClickerLevel > 0) {
            setInterval(() => {
                for (let i = 0; i < autoClickerLevel; i++) {
                    this.addResource('np237', this.state.stats.perClick);
                }
                this.updateUI();
            }, 1000);
        }
    }
    
    updateUI() {
        // Ресурсы
        document.getElementById('np237').textContent = this.state.resources.np237;
        document.getElementById('np239').textContent = this.state.resources.np239;
        document.getElementById('pu238').textContent = this.state.resources.pu238;
        
        // Статистика
        document.getElementById('per-click').textContent = this.state.stats.perClick;
        document.getElementById('auto-income').textContent = this.state.stats.autoIncome;
        
        // Обновляем кнопки улучшений
        this.updateUpgradeButtons();
        
        // Обновляем кнопки магазина
        this.updateSellButtons();
    }
    
    updateUpgradeButtons() {
        document.querySelectorAll('.upgrade').forEach(upgradeElement => {
            const upgradeId = upgradeElement.dataset.upgrade;
            const upgrade = this.state.upgrades[upgradeId];
            const cost = this.getUpgradeCost(upgradeId, upgrade.level);
            const btn = upgradeElement.querySelector('.buy-btn');
            const costElement = upgradeElement.querySelector('.upgrade-cost');
            
            costElement.textContent = `${cost} Нептуний-237`;
            
            if (upgrade.level >= upgrade.maxLevel) {
                btn.textContent = 'Макс';
                btn.disabled = true;
            } else {
                btn.disabled = this.state.resources.np237 < cost;
            }
        });
    }
    
    updateSellButtons() {
        document.querySelectorAll('.sell-option').forEach(option => {
            const amount = parseInt(option.dataset.amount);
            const btn = option.querySelector('.sell-btn');
            btn.disabled = this.state.resources.carrots < amount;
        });
    }
    
    saveGame() {
        localStorage.setItem('neptunGame', JSON.stringify(this.state));
    }
    
    loadGame() {
        const saved = localStorage.getItem('neptunGame');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NeptunGame();
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});
