// Модуль для работы с сохранениями
const Storage = {
    // Сохранение игры
    saveGame: (gameState) => {
        try {
            localStorage.setItem('neptuniumFarmGame', JSON.stringify(gameState));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения игры:', error);
            return false;
        }
    },

    // Загрузка игры
    loadGame: () => {
        try {
            const saved = localStorage.getItem('neptuniumFarmGame');
            if (saved) {
                return JSON.parse(saved);
            }
            return null;
        } catch (error) {
            console.error('Ошибка загрузки игры:', error);
            return null;
        }
    },

    // Сброс прогресса
    resetGame: () => {
        try {
            localStorage.removeItem('neptuniumFarmGame');
            return true;
        } catch (error) {
            console.error('Ошибка сброса игры:', error);
            return false;
        }
    }
};