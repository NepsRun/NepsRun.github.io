// Основной файл игры
const Game = {
    state: {
        carrots: 100,
        neptunium: 10,
        playerLevel: 1,
        playerExp: 0,
        perClick: 1,
        farm: {
            plots: 6,
            plotSize: 1,
            growthTime: 30000, // 30 секунд
            growthSpeed: 1,
            carrots: 0
        },
        upgrades: {
            clickPower: 1,
            autoIncome: 0,
            farmSpeed: 1,
            monkeyReward: 1
        },
        miniGames: {
            watering: {
                score: 0,
                rewardMultiplier: 1
            },
            monkey: {
                score: 0,
                rewardMultiplier: 1
            }
        },
        settings: {
            soundClicker: true,
            soundUpgrades: true,
            soundShop: true,
            soundMusic: true,
            version: 'simple'
        }
    },

    init: function() {
        // Инициализация Telegram Web App
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Загрузка сохраненной игры
        this.loadGame();
        
        // Инициализация модулей
        this.initModules();
        
        // Инициализация навигации
        this.initNavigation();
        
        // Запуск авто-дохода
        this.startAutoIncome();
        
        console.log('Игра инициализирована');
    },

    loadGame: function() {
        const saved = Storage.loadGame();
        if (saved) {
            this.state = { ...this.state, ...saved };
        }
        this.updateUI();
    },

    saveGame: function() {
        Storage.saveGame(this.state);
    },

    updateUI: function() {
        // Обновление основных показателей
        Utils.updateElement('carrots', this.state.carrots);
        Utils.updateElement('neptunium', this.state.neptunium);
        Utils.updateElement('playerLevel', this.state.playerLevel);
        Utils.updateElement('playerExp', this.state.playerExp);
        Utils.updateElement('perClick', this.state.perClick);
        Utils.updateElement('autoIncome', this.state.upgrades.autoIncome);
    },

    initModules: function() {
        const updateUI = this.updateUI.bind(this);
        const saveGame = this.saveGame.bind(this);
        
        Clicker.init(this.state, updateUI, saveGame);
        Farm.init(this.state, updateUI, saveGame);
        Watering.init(this.state, updateUI, saveGame);
        Monkey.init(this.state, updateUI, saveGame);
        Upgrades.init(this.state, updateUI, saveGame);
        Shop.init(this.state, updateUI, saveGame);
        Settings.init(this.state, updateUI, saveGame);
    },

    initNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                
                // Обновление активной навигации
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Показать активную вкладку
                tabContents.forEach(tab => tab.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // При переключении на вкладку фермы обновляем грядки
                if (tabId === 'farm') {
                    Farm.renderFarm(this.state);
                }
            });
        });
    },

    startAutoIncome: function() {
        setInterval(() => {
            if (this.state.upgrades.autoIncome > 0) {
                this.state.carrots += this.state.upgrades.autoIncome;
                this.updateUI();
                this.saveGame();
            }
        }, 1000);
    }
};

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});