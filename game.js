class NeptunCarrotGame {
    constructor() {
        this.state = {
            resources: {
                np237: 100,
                np239: 0,
                pu238: 0
            },
            upgrades: {
                lab: {
                    basic_research: { level: 0, maxLevel: 10 },
                    isotope_study: { level: 0, maxLevel: 5 }
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
                totalClicks: 0
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
    }
    
    handleCarrotClick(event) {
        const carrot = document.getElementById('main-carrot');
        const clickEffect = document.getElementById('click-effect');
        
        // Анимация клика
        carrot.style.transform = 'scale(0.95)';
        setTimeout(() => {
            carrot.style.transform = 'scale(1)';
        }, 100);
        
        // Эффект клика
        clickEffect.textContent = `+${this.stats.perClick}`;
        clickEffect.style.animation = 'none';
        void clickEffect.offsetWidth;
        clickEffect.style.animation = 'clickPulse 0.6s ease-out';
        
        // Начисление нептуния
        this.addResource('np237', this.stats.perClick);
        
        // Статистика
        this.state.stats.totalClicks++;
        
        // Случайный бонус (5% шанс)
        if (Math.random() < 0.05) {
            this.showBonusEffect();
        }
    }
    
    showBonusEffect() {
        const messages = [
            "Отличный клик! Критическое попадание!",
            "Нептуний-237 пульсирует сильнее!",
            "Цепная реакция! Бонусный нептуний!"
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showProfessorMessage(message, 2000);
        
        // Визуальный эффект бонуса
        const carrot = document.querySelector('.carrot');
        carrot.style.filter = 'drop-shadow(0 0 30px #ff0000)';
        setTimeout(() => {
            carrot.style.filter = 'drop-shadow(0 0 20px var(--carrot-orange))';
        }, 500);
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
            
            // Сообщение профессора
            this.showProfessorMessage(`Улучшение "${upgradeConfig.name}" достигло уровня ${upgrade.level}!`, 3000);
            
            this.updateUI();
            this.saveGame();
        }
    }
    
    getUpgradeConfig(upgradeId) {
        const configs = {
            basic_research: { name: "Базовые исследования", system: "lab" },
            isotope_study: { name: "Изучение изотопов", system: "lab" },
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
            isotope_study: 200,
            water_system: 100,
            auto_clicker: 300,
            lab_monkey: 500
        };
        
        return Math.floor(baseCosts[upgradeId] * Math.pow(1.5, level));
    }
    
    applyUpgradeEffect(upgradeId) {
        switch (upgradeId) {
            case 'basic_research':
                this.state.stats.perClick += 1;
                break;
            case 'isotope_study':
                this.state.stats.perClick += 2;
                break;
            case 'water_system':
                this.state.stats.autoIncome += 1;
                break;
            case 'lab_monkey':
                // +5% ко всему доходу за уровень
                const multiplier = 1 + (0.05 * this.state.upgrades.monkeys.lab_monkey.level);
                this.state.stats.perClick = Math.floor(this.state.stats.perClick * multiplier);
                this.state.stats.autoIncome = Math.floor(this.state.stats.autoIncome * multiplier);
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
                this.addResource('np237', this.state.stats.autoIncome);
            }, 1000);
        }
        
        // Авто-кликеры
        const autoClickerLevel = this.state.upgrades.titan.auto_clicker.level;
        if (autoClickerLevel > 0) {
            setInterval(() => {
                for (let i = 0; i < autoClickerLevel; i++) {
                    this.addResource('np237', this.state.stats.perClick);
                }
            }, 1000);
        }
    }
    
    addResource(currency, amount) {
        this.state.resources[currency] += amount;
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
    }
    
    updateUI() {
        // Обновляем ресурсы
        document.getElementById('np237-amount').textContent = this.formatNumber(this.state.resources.np237);
        document.getElementById('np239-amount').textContent = this.formatNumber(this.state.resources.np239);
        document.getElementById('pu238-amount').textContent = this.formatNumber(this.state.resources.pu238);
        
        // Обновляем статистику
        document.getElementById('per-click').textContent = this.formatNumber(this.state.stats.perClick);
        document.getElementById('auto-income').textContent = this.formatNumber(this.state.stats.autoIncome);
        
        // Обновляем кнопки улучшений
        this.updateUpgradeButtons();
    }
    
    updateUpgradeButtons() {
        document.querySelectorAll('.upgrade-item').forEach(item => {
            const upgradeId = item.dataset.upgrade;
            const btn = item.querySelector('.buy-btn');
            const costElement = item.querySelector('.upgrade-cost');
            
            const upgrade = this.getUpgradeState(upgradeId);
            const cost = this.calculateUpgradeCost(upgradeId, upgrade.level);
            
            if (costElement) {
                costElement.textContent = `Стоимость: ${this.formatNumber(cost)} Нептуний-237`;
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
            isotope_study: 'Исследовать',
            water_system: 'Установить',
            auto_clicker: 'Создать',
            lab_monkey: 'Нанять'
        };
        return texts[upgradeId] || 'Купить';
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    showProfessorMessage(message, duration = 3000) {
        const messageElement = document.getElementById('professor-message');
        if (messageElement) {
            messageElement.textContent = message;
            
            setTimeout(() => {
                // Возвращаем стандартное сообщение
                messageElement.textContent = "Кликай по умной морковке, чтобы добывать нептуний!";
            }, duration);
        }
    }
    
    saveGame() {
        localStorage.setItem('neptunCarrotGame', JSON.stringify(this.state));
    }
    
    loadGame() {
        const saved = localStorage.getItem('neptunCarrotGame');
        if (saved) {
            this.state = JSON.parse(saved);
            this.recalculateStats();
        }
    }
    
    recalculateStats() {
        // Сбрасываем базовые значения
        this.state.stats.perClick = 1;
        this.state.stats.autoIncome = 0;
        
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
        
        // Обезьяны применяются последними для правильного множителя
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
    window.game = new NeptunCarrotGame();
    
    // Инициализация Telegram Web App
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Настройка интерфейса под Telegram
        document.body.style.backgroundColor = 'var(--bunker-dark)';
    }
});
