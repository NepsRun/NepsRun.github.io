class NeptunFarm {
    constructor() {
        this.state = {
            resources: {
                np: 150,
                carrots: 5
            },
            level: 1,
            farm: {
                plots: Array(6).fill().map(() => ({
                    state: 'empty',
                    progress: 0,
                    growthTime: 30000
                }))
            },
            upgrades: {
                basicResearch: { level: 0, cost: 50 },
                waterSystem: { level: 0, cost: 100 }
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
        this.render();
        this.startAutoSystems();
    }
    
    setupEventListeners() {
        // Клик по морковке
        document.getElementById('main-carrot').addEventListener('click', () => {
            this.handleClick();
        });
        
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
        
        // Ферма
        document.getElementById('plant-all').addEventListener('click', () => {
            this.plantAll();
        });
        
        document.getElementById('harvest-all').addEventListener('click', () => {
            this.harvestAll();
        });
        
        // Магазин
        document.querySelectorAll('.btn.sell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.sell-card');
                const amount = parseInt(card.querySelector('span').textContent);
                this.sellCarrots(amount);
            });
        });
        
        // Улучшения
        document.querySelectorAll('.btn.upgrade').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.upgrade-card');
                const upgradeName = card.querySelector('h3').textContent;
                this.buyUpgrade(upgradeName);
            });
        });
    }
    
    handleClick() {
        this.addResource('np', this.state.stats.perClick);
        this.showNotification(`+${this.state.stats.perClick} Np`, 'success');
        this.render();
    }
    
    switchTab(tabName) {
        // Обновляем активную навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем активную секцию
        document.querySelectorAll('.game-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }
    
    // Ферма
    plantAll() {
        let planted = 0;
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'empty') {
                this.plantPlot(index);
                planted++;
            }
        });
        
        if (planted > 0) {
            this.showNotification(`Planted ${planted} plots`, 'success');
        }
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
    
    harvestAll() {
        let harvested = 0;
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'ready') {
                this.harvestPlot(index);
                harvested++;
            }
        });
        
        if (harvested > 0) {
            this.showNotification(`Harvested ${harvested} carrots`, 'success');
        }
    }
    
    harvestPlot(index) {
        const plot = this.state.farm.plots[index];
        plot.state = 'empty';
        plot.progress = 0;
        this.state.resources.carrots += 1;
        this.render();
    }
    
    renderFarm() {
        const farmGrid = document.querySelector('.farm-grid');
        farmGrid.innerHTML = '';
        
        this.state.farm.plots.forEach((plot, index) => {
            const plotElement = document.createElement('div');
            plotElement.className = `farm-plot ${plot.state}`;
            
            if (plot.state === 'growing') {
                plotElement.innerHTML = `<div class="progress" style="width: ${plot.progress}%"></div>`;
            }
            
            plotElement.addEventListener('click', () => {
                if (plot.state === 'empty') this.plantPlot(index);
                else if (plot.state === 'ready') this.harvestPlot(index);
            });
            
            farmGrid.appendChild(plotElement);
        });
    }
    
    // Магазин
    sellCarrots(amount) {
        if (this.state.resources.carrots >= amount) {
            const income = amount * 5;
            this.state.resources.carrots -= amount;
            this.addResource('np', income);
            this.showNotification(`Sold ${amount} carrots for ${income} Np`, 'success');
            this.render();
        }
    }
    
    // Улучшения
    buyUpgrade(upgradeName) {
        let upgradeKey, cost;
        
        switch(upgradeName) {
            case 'Basic Research':
                upgradeKey = 'basicResearch';
                cost = this.state.upgrades.basicResearch.cost;
                break;
            case 'Water System':
                upgradeKey = 'waterSystem';
                cost = this.state.upgrades.waterSystem.cost;
                break;
        }
        
        if (this.state.resources.np >= cost) {
            this.state.resources.np -= cost;
            this.state.upgrades[upgradeKey].level++;
            this.state.upgrades[upgradeKey].cost = Math.floor(cost * 1.5);
            
            // Применяем эффекты
            if (upgradeKey === 'basicResearch') {
                this.state.stats.perClick += 1;
            } else if (upgradeKey === 'waterSystem') {
                this.state.stats.autoIncome += 1;
                this.startAutoSystems();
            }
            
            this.showNotification(`Upgraded ${upgradeName}`, 'success');
            this.render();
        }
    }
    
    // Системы
    addResource(type, amount) {
        this.state.resources[type] += amount;
    }
    
    startAutoSystems() {
        if (this.state.stats.autoIncome > 0) {
            setInterval(() => {
                this.addResource('np', this.state.stats.autoIncome);
                this.render();
            }, 1000);
        }
    }
    
    // Рендер
    render() {
        // Ресурсы
        document.querySelectorAll('.resource-amount')[0].textContent = this.state.resources.np;
        document.querySelectorAll('.resource-amount')[1].textContent = this.state.resources.carrots;
        
        // Статистика
        document.querySelector('.click-stats strong:first-child').textContent = `+${this.state.stats.perClick} Np`;
        document.querySelector('.click-stats strong:last-child').textContent = `+${this.state.stats.autoIncome} Np/s`;
        
        // Уровень
        document.querySelector('.level-number').textContent = this.state.level;
        
        // Ферма
        this.renderFarm();
        
        // Обновляем кнопки
        this.updateButtons();
        
        this.saveGame();
    }
    
    updateButtons() {
        // Магазин
        document.querySelectorAll('.sell-card').forEach((card, index) => {
            const amounts = [1, 10];
            const btn = card.querySelector('.btn.sell');
            btn.disabled = this.state.resources.carrots < amounts[index];
        });
        
        // Улучшения
        document.querySelectorAll('.upgrade-card').forEach((card, index) => {
            const upgrade = index === 0 ? this.state.upgrades.basicResearch : this.state.upgrades.waterSystem;
            const btn = card.querySelector('.btn.upgrade');
            const costElement = card.querySelector('.upgrade-cost');
            
            costElement.textContent = `${upgrade.cost} Np`;
            btn.disabled = this.state.resources.np < upgrade.cost;
        });
    }
    
    // Утилиты
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    saveGame() {
        localStorage.setItem('neptunFarm', JSON.stringify(this.state));
    }
    
    loadGame() {
        const saved = localStorage.getItem('neptunFarm');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NeptunFarm();
    
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});
