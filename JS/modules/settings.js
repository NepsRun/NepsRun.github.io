// Модуль настроек
const Settings = {
    init: (gameState, updateUI, saveGame) => {
        // Загрузка текущих настроек
        Settings.loadSettings(gameState);
        
        // Обработчики для переключения звуков
        document.getElementById('soundClicker').addEventListener('change', (e) => {
            gameState.settings.soundClicker = e.target.checked;
            saveGame();
        });
        
        document.getElementById('soundUpgrades').addEventListener('change', (e) => {
            gameState.settings.soundUpgrades = e.target.checked;
            saveGame();
        });
        
        document.getElementById('soundShop').addEventListener('change', (e) => {
            gameState.settings.soundShop = e.target.checked;
            saveGame();
        });
        
        document.getElementById('soundMusic').addEventListener('change', (e) => {
            gameState.settings.soundMusic = e.target.checked;
            saveGame();
        });
        
        // Обработчики для версий приложения
        const versionBtns = document.querySelectorAll('.version-btn');
        versionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                versionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.settings.version = btn.getAttribute('data-version');
                saveGame();
                
                Utils.showNotification(`Режим изменен на: ${btn.textContent}`, 'info');
            });
        });
        
        // Обработчик сброса прогресса
        document.getElementById('resetProgress').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
                if (Storage.resetGame()) {
                    location.reload();
                } else {
                    Utils.showNotification('Ошибка при сбросе прогресса', 'error');
                }
            }
        });
        
        // Обработчик подключения к боту
        document.getElementById('connectBot').addEventListener('click', () => {
            Utils.showNotification('Функция подключения к боту в разработке', 'info');
        });
        
        // Обработчик быстрого сбора
        document.getElementById('quickHarvest').addEventListener('click', () => {
            Farm.plantAll(gameState, updateUI, saveGame);
        });
    },

    loadSettings: (gameState) => {
        document.getElementById('soundClicker').checked = gameState.settings.soundClicker;
        document.getElementById('soundUpgrades').checked = gameState.settings.soundUpgrades;
        document.getElementById('soundShop').checked = gameState.settings.soundShop;
        document.getElementById('soundMusic').checked = gameState.settings.soundMusic;
        
        // Установка активной версии
        const versionBtns = document.querySelectorAll('.version-btn');
        versionBtns.forEach(btn => {
            if (btn.getAttribute('data-version') === gameState.settings.version) {
                btn.classList.add('active');
            }
        });
    }
};