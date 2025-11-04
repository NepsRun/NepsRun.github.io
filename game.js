class Game {
    constructor() {
        this.state = {
            np237: 100,
            carrots: 0,
            upgrades: {
                click: { level: 0, cost: 50 },
                auto: { level: 0, cost: 100 },
                farm: { level: 0, cost: 150 }
            },
            farm: Array(6).fill('empty'),
            perClick: 1,
            autoIncome: 0
        };
        
        this.init();
    }

    init() {
        this.load();
        this.setupEvents();
        this.updateUI();
        this.startAuto();
        this.renderFarm();
    }

    setupEvents() {
        // Клик по морковке
        document.getElementById('carrot-btn').addEventListener('click', () => {
            this.click();
        });

        // Навигация
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Покупка улучшений
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgrade = e.target.closest('.upgrade');
                this.buyUpgrade(upgrade.dataset.id);
            });
        });

        // Огород
        document.getElementById('plant-btn').addEventListener('click', () => {
            this.plantAll();
        });

        document.getElementById('harvest-btn').addEventListener('click', () => {
            this.harvestAll();
        });

        // Магазин
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.shop-item');
                this.sellCarrots(parseInt(item.dataset.amount));
            });
        });
    }

    click() {
        this.state.np237 += this.state.perClick;
        this.updateUI();
        this.save();
        
        // Анимация
        const carrot = document.getElementById('carrot-btn');
        carrot.style.transform = 'scale(0.9)';
        setTimeout(() => carrot.style.transform = 'scale(1)', 100);
    }

    buyUpgrade(type) {
        const upgrade = this.state.upgrades[type];
        
        if (this.state.np237 >= upgrade.cost) {
            this.state.np237 -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);

            // Эффекты
            switch(type) {
                case 'click':
                    this.state.perClick += 1;
                    break;
                case 'auto':
                    this.state.autoIncome += 1;
                    this.startAuto();
                    break;
                case 'farm':
                    // Ускорение фермы уже учтено в логике роста
                    break;
            }

            this.updateUI();
            this.save();
        }
    }

    startAuto() {
        // Очищаем старые интервалы
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }

        // Запускаем авто-доход
        if (this.state.autoIncome > 0) {
            this.autoInterval = setInterval(() => {
                this.state.np237 += this.state.autoIncome;
                this.updateUI();
                this.save();
            }, 1000);
        }
    }

    // Огород
    renderFarm() {
        const grid = document.getElementById('farm-grid');
        grid.innerHTML = '';

        this.state.farm.forEach((plot, index) => {
            const plotElement = document.createElement('div');
            plotElement.className = `plot ${plot}`;
            
            let emoji = '➕';
            if (plot === 'growing') emoji = '🌱';
            if (plot === 'ready') emoji = '🥕';
            
            plotElement.textContent = emoji;
            
            plotElement.addEventListener('click', () => {
                if (plot === 'empty') this.plant(index);
                if (plot === 'ready') this.harvest(index);
            });

            grid.appendChild(plotElement);
        });
    }

    plant(index) {
        if (this.state.farm[index] === 'empty') {
            this.state.farm[index] = 'growing';
            this.renderFarm();
            this.save();

            // Авто-сбор через 30 секунд
            setTimeout(() => {
                if (this.state.farm[index] === 'growing') {
                    this.state.farm[index] = 'ready';
                    this.renderFarm();
                    this.save();
                }
            }, 30000);
        }
    }

    harvest(index) {
        if (this.state.farm[index] === 'ready') {
            this.state.farm[index] = 'empty';
            this.state.carrots += 1;
            this.renderFarm();
            this.updateUI();
            this.save();
        }
    }

    plantAll() {
        this.state.farm.forEach((plot, index) => {
            if (plot === 'empty') {
                this.plant(index);
            }
        });
    }

    harvestAll() {
        this.state.farm.forEach((plot, index) => {
            if (plot === 'ready') {
                this.harvest(index);
            }
        });
    }

    // Магазин
    sellCarrots(amount) {
        if (this.state.carrots >= amount) {
            this.state.carrots -= amount;
            this.state.np237 += amount * 5;
            this.updateUI();
            this.save();
        }
    }

    // Навигация
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    // Обновление интерфейса
    updateUI() {
        // Ресурсы
        document.getElementById('np237').textContent = this.state.np237;
        document.getElementById('carrots').textContent = this.state.carrots;
        
        // Статистика
        document.getElementById('per-click').textContent = this.state.perClick;
        document.getElementById('auto-income').textContent = this.state.autoIncome;

        // Обновляем кнопки улучшений
        this.updateUpgradeButtons();
        
        // Обновляем кнопки магазина
        this.updateShopButtons();
    }

    updateUpgradeButtons() {
        document.querySelectorAll('.upgrade').forEach(upgradeElement => {
            const type = upgradeElement.dataset.id;
            const upgrade = this.state.upgrades[type];
            const btn = upgradeElement.querySelector('.buy-btn');
            const costElement = upgradeElement.querySelector('.cost');

            costElement.textContent = `${upgrade.cost} нептуния`;
            btn.disabled = this.state.np237 < upgrade.cost;
        });
    }

    updateShopButtons() {
        document.querySelectorAll('.shop-item').forEach(item => {
            const amount = parseInt(item.dataset.amount);
            const btn = item.querySelector('.sell-btn');
            btn.disabled = this.state.carrots < amount;
        });
    }

    // Сохранение
    save() {
        localStorage.setItem('neptunGame', JSON.stringify(this.state));
    }

    load() {
        const saved = localStorage.getItem('neptunGame');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
}

// Запуск игры
const game = new Game();
