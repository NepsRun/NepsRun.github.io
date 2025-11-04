class NeptunFarm {
    constructor() {
        this.state = {
            resources: {
                np237: 100,
                carrots: 0
            },
            farm: {
                plots: Array(6).fill().map(() => ({
                    state: 'empty',
                    progress: 0,
                    growthTime: 30000,
                    startTime: null
                }))
            },
            upgrades: {
                'click-power': { level: 0, cost: 50, effect: 'perClick' },
                'auto-income': { level: 0, cost: 100, effect: 'autoIncome' },
                'farm-speed': { level: 0, cost: 150, effect: 'farmSpeed' }
            },
            stats: {
                perClick: 1,
                autoIncome: 0
            }
        };
        
        this.autoInterval = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadGame();
        this.updateUI();
        this.startAutoSystems();
        this.renderFarm();
        this.updateFarmStats();
    }
    
    setupEventListeners() {
        // Клик по морковке
        document.getElementById('click-carrot').addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
        
        // Покупка улучшений
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.upgrade-card');
                this.buyUpgrade(card.dataset.id);
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
        document.querySelectorAll('.shop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.shop-item');
                this.sellCarrots(parseInt(item.dataset.amount));
            });
        });
        
        // Обновление прогресса фермы
        setInterval(() => {
            this.updateFarmProgress();
        }, 1000);
    }
    
    handleClick(e) {
        const carrot = e.currentTarget;
        
        // Анимация
        carrot.style.transform = 'scale(0.95)';
        setTimeout(() => {
            carrot.style.transform = 'scale(1)';
        }, 100);
        
        // Начисление
        this.addResource('np237', this.state.stats.perClick);
        
        // Эффект
        this.showNotification(`+${this.state.stats.perClick} Нептуния`, 'success');
        
        this.updateUI();
        this.saveGame();
    }
    
    buyUpgrade(upgradeId) {
        const upgrade = this.state.upgrades[upgradeId];
        
        if (this.state.resources.np237 >= upgrade.cost) {
            this.state.resources.np237 -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);
            
            // Применяем эффект
            this.applyUpgradeEffect(upgradeId);
            
            this.showNotification('Улучшение куплено!', 'success');
            this.updateUI();
            this.saveGame();
        } else {
            this.showNotification('Недостаточно Нептуния!', 'info');
        }
    }
    
    applyUpgradeEffect(upgradeId) {
        switch(upgradeId) {
            case 'click-power':
                this.state.stats.perClick += 1;
                break;
            case 'auto-income':
                this.state.stats.autoIncome += 1;
                this.startAutoSystems();
                break;
            case 'farm-speed':
                // Ускоряем рост на 50%
                this.state.farm.plots.forEach(plot => {
                    plot.growthTime = Math.floor(plot.growthTime * 0.5);
                });
                break;
        }
    }
    
    // Ферма
    renderFarm() {
        const farmGrid = document.getElementById('farm-grid');
        farmGrid.innerHTML = '';
        
        this.state.farm.plots.forEach((plot, index) => {
            const plotElement = document.createElement('div');
            plotElement.className = `farm-plot ${plot.state}`;
            
            // Добавляем прогресс-бар для растущих растений
            if (plot.state === 'growing') {
                const progressBar = document.createElement('div');
                progressBar.className = 'progress';
                progressBar.style.width = `${plot.progress}%`;
                plotElement.appendChild(progressBar);
            }
            
            plotElement.addEventListener('click', () => {
                if (plot.state === 'empty') this.plantPlot(index);
                else if (plot.state === 'ready') this.harvestPlot(index);
            });
            
            farmGrid.appendChild(plotElement);
        });
        
        this.updateFarmStats();
    }
    
    plantPlot(index) {
        const plot = this.state.farm.plots[index];
        plot.state = 'growing';
        plot.progress = 0;
        plot.startTime = Date.now();
        
        this.renderFarm();
        this.showNotification('Морковка посажена!', 'success');
        this.saveGame();
    }
    
    harvestPlot(index) {
        const plot = this.state.farm.plots[index];
        plot.state = 'empty';
        plot.progress = 0;
        plot.startTime = null;
        this.state.resources.carrots += 1;
        
        this.renderFarm();
        this.updateUI();
        this.showNotification('Морковка собрана! +1', 'success');
        this.saveGame();
    }
    
    plantAll() {
        let planted = 0;
        this.state.farm.plots.forEach((plot, index) => {
            if (plot.state === 'empty') {
                this.plantPlot(index);
                planted++;
            }
        });
        
        if (planted > 0) {
            this.showNotification(`Посажено ${planted} морковок!`, 'success');
        }
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
            this.showNotification(`Собрано ${harvested} морковок!`, 'success');
        }
    }
    
    updateFarmProgress() {
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
            this.saveGame();
        }
    }
    
    updateFarmStats() {
        const emptyPlots = this.state.farm.plots.filter(plot => plot.state === 'empty').length;
        const growingPlots = this.state.farm.plots.filter(plot => plot.state === 'growing').length;
        const readyPlots = this.state.farm.plots.filter(plot => plot.state === 'ready').length;
        
        document.getElementById('empty-plots').textContent = emptyPlots;
        document.getElementById('growing-plots').textContent = growingPlots;
        document.getElementById('ready-plots').textContent = readyPlots;
    }
    
    // Магазин
    sellCarrots(amount) {
        if (this.state.resources.carrots >= amount) {
            const income = amount * 5;
            this.state.resources.carrots -= amount;
            this.addResource('np237', income);
            
            this.showNotification(`Продано ${amount} морковок за ${income} Нептуния!`, 'success');
            this.updateUI();
            this.saveGame();
        } else {
            this.showNotification('Недостаточно морковок!', 'info');
        }
    }
    
    // Системы
    addResource(type, amount) {
        this.state.resources[type] += amount;
    }
    
    startAutoSystems() {
        // Очищаем старый интервал
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        
        // Запускаем авто-доход
        if (this.state.stats.autoIncome > 0) {
            this.autoInterval = setInterval(() => {
                this.addResource('np237', this.state.stats.autoIncome);
                this.updateUI();
                this.saveGame();
            }, 1000);
        }
    }
    
    // Навигация
    switchTab(tabName) {
        // Обновляем навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Показываем соответствующий раздел
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Особые действия для вкладок
        if (tabName === 'farm') {
            this.renderFarm();
        }
    }
    
    // Обновление интерфейса
    updateUI() {
        // Ресурсы
        document.getElementById('np237').textContent = this.state.resources.np237;
        document.getElementById('carrots').textContent = this.state.resources.carrots;
        
        // Статистика
        document.getElementById('per-click').textContent = this.state.stats.perClick;
        document.getElementById('auto-income').textContent = this.state.stats.autoIncome;
        
        // Обновляем кнопки улучшений
        this.updateUpgradeButtons();
        
        // Обновляем кнопки магазина
        this.updateShopButtons();
    }
    
    updateUpgradeButtons() {
        document.querySelectorAll('.upgrade-card').forEach(card => {
            const upgradeId = card.dataset.id;
            const upgrade = this.state.upgrades[upgradeId];
            const btn = card.querySelector('.upgrade-btn');
            const costElement = card.querySelector('.upgrade-cost');
            
            costElement.textContent = `${upgrade.cost} Нептуния`;
            
            if (upgrade.level > 0) {
                btn.textContent = `Ур. ${upgrade.level}`;
            }
            
            btn.disabled = this.state.resources.np237 < upgrade.cost;
        });
    }
    
    updateShopButtons() {
        document.querySelectorAll('.shop-item').forEach(item => {
            const amount = parseInt(item.dataset.amount);
            const btn = item.querySelector('.shop-btn');
            btn.disabled = this.state.resources.carrots < amount;
        });
    }
    
    // Уведомления
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
    
    // Сохранение
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
    
    // Инициализация Telegram Mini Apps
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Настройка под Telegram
        document.documentElement.style.setProperty('--background', 'var(--tg-theme-bg-color, #0f172a)');
        document.documentElement.style.setProperty('--text', 'var(--tg-theme-text-color, #f8fafc)');
    }
});
