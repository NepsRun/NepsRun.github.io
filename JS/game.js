// Основной файл игры
class NeptuniumFarm {
    constructor() {
        this.state = {
            carrots: 100,
            neptunium: 10,
            playerLevel: 1,
            playerExp: 0,
            perClick: 1,
            farm: {
                plots: 6,
                plotSize: 1,
                growthTime: 30000,
                growthSpeed: 1,
                carrots: 0
            },
            upgrades: {
                clickPower: 1,
                autoIncome: 0,
                farmSpeed: 1,
                monkeyReward: 1,
                wateringReward: 1,
                shooterReward: 1,
                builderReward: 1
            },
            miniGames: {
                watering: {
                    score: 0,
                    rewardMultiplier: 1
                },
                monkey: {
                    score: 0,
                    rewardMultiplier: 1
                },
                shooter: {
                    score: 0,
                    rewardMultiplier: 1,
                    completed: 0
                },
                builder: {
                    score: 0,
                    rewardMultiplier: 1,
                    completed: 0
                }
            },
            settings: {
                soundClicker: true,
                soundUpgrades: true,
                soundShop: true,
                soundMusic: true,
                version: 'simple'
            }
        };

        this.init();
    }

    init() {
        // Инициализация Telegram Web App
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            console.log('Telegram Web App инициализирован');
        } else {
            console.log('Запущено вне Telegram');
            this.mockTelegramUser();
        }

        // Загрузка сохраненной игры
        this.loadGame();
        
        // Инициализация компонентов
        this.initNavigation();
        this.initModules();
        this.startAutoIncome();
        
        console.log('Космическая ферма инициализирована');
    }

    mockTelegramUser() {
        window.Telegram = {
            WebApp: {
                initDataUnsafe: {
                    user: {
                        first_name: "Космонавт",
                        last_name: "Тестовый"
                    }
                },
                ready: function() { console.log('Telegram ready') },
                expand: function() { console.log('Telegram expand') }
            }
        };
    }

    loadGame() {
        const saved = localStorage.getItem('neptuniumFarmGame');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Мерджим сохраненное состояние с текущим
                this.state = { ...this.state, ...parsed };
                console.log('Игра загружена');
            } catch (e) {
                console.error('Ошибка загрузки игры:', e);
            }
        }
        this.updateUI();
    }

    saveGame() {
        try {
            localStorage.setItem('neptuniumFarmGame', JSON.stringify(this.state));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения игры:', error);
            return false;
        }
    }

    updateUI() {
        // Обновление основных показателей
        this.updateElement('carrots', this.state.carrots);
        this.updateElement('neptunium', this.state.neptunium);
        this.updateElement('playerLevel', this.state.playerLevel);
        this.updateElement('playerExp', this.state.playerExp);
        this.updateElement('perClick', this.state.perClick);
        this.updateElement('autoIncome', this.state.upgrades.autoIncome);
        
        // Обновление прогресса уровня
        const expPercent = (this.state.playerExp / 100) * 100;
        const progressFill = document.getElementById('levelProgress');
        if (progressFill) {
            progressFill.style.width = expPercent + '%';
        }
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = this.formatNumber(value);
        }
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

    addCarrots(amount) {
        this.state.carrots += amount;
        this.state.playerExp += Math.floor(amount / 2);
        this.updateUI();
        this.checkLevelUp();
        this.saveGame();
    }

    addNeptunium(amount) {
        this.state.neptunium += amount;
        this.updateUI();
        this.saveGame();
    }

    checkLevelUp() {
        if (this.state.playerExp >= 100) {
            this.state.playerLevel++;
            this.state.playerExp = 0;
            this.state.neptunium += 5;
            
            this.showNotification(`🎉 Уровень повышен! Теперь вы уровень ${this.state.playerLevel}`, 'success');
            this.updateUI();
            this.saveGame();
        }
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#2e7d32' : type === 'error' ? '#c62828' : '#333'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                
                // Обновляем активную навигацию
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Показываем активную вкладку
                tabContents.forEach(tab => tab.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Специальные действия при переключении вкладок
                this.onTabChange(tabId);
            });
        });
    }

    onTabChange(tabId) {
        switch(tabId) {
            case 'farm':
                if (typeof Farm !== 'undefined') {
                    Farm.renderFarm(this.state);
                }
                break;
            case 'upgrades':
                if (typeof Upgrades !== 'undefined') {
                    Upgrades.renderUpgrades(this.state);
                }
                break;
            case 'shop':
                if (typeof Shop !== 'undefined') {
                    Shop.renderShop(this.state);
                }
                break;
        }
    }

    initModules() {
        // Инициализация кликера
        if (typeof Clicker !== 'undefined') {
            Clicker.init(this);
        }

        // Инициализация фермы
        if (typeof Farm !== 'undefined') {
            Farm.init(this);
        }

        // Инициализация мини-игр
        if (typeof Watering !== 'undefined') {
            Watering.init(this);
        }

        if (typeof Monkey !== 'undefined') {
            Monkey.init(this);
        }

        if (typeof SpaceShooter !== 'undefined') {
            this.shooter = new SpaceShooter(this);
        }

        if (typeof BuilderGame !== 'undefined') {
            this.builder = new BuilderGame(this);
        }

        // Инициализация систем
        if (typeof Upgrades !== 'undefined') {
            Upgrades.init(this);
        }

        if (typeof Shop !== 'undefined') {
            Shop.init(this);
        }

        if (typeof Settings !== 'undefined') {
            Settings.init(this);
        }
    }

    startAutoIncome() {
        setInterval(() => {
            if (this.state.upgrades.autoIncome > 0) {
                this.addCarrots(this.state.upgrades.autoIncome);
            }
        }, 1000);
    }

    // Утилиты для мини-игр
    playSound(soundName) {
        if (this.state.settings.soundClicker && soundName === 'click') {
            // В реальном приложении здесь будет воспроизведение звука
            console.log('Playing click sound');
        }
        if (this.state.settings.soundUpgrades && soundName === 'upgrade') {
            console.log('Playing upgrade sound');
        }
        if (this.state.settings.soundShop && soundName === 'purchase') {
            console.log('Playing purchase sound');
        }
    }

    getGameReward(gameType, score) {
        const multipliers = {
            watering: this.state.upgrades.wateringReward,
            monkey: this.state.upgrades.monkeyReward,
            shooter: this.state.upgrades.shooterReward,
            builder: this.state.upgrades.builderReward
        };
        
        return Math.floor(score * (multipliers[gameType] || 1));
    }
}

// Создаем глобальный экземпляр игры
let game;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    game = new NeptuniumFarm();
});
