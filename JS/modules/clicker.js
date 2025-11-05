// Модуль кликера
const Clicker = {
    init: (gameState, updateUI, saveGame) => {
        const carrot = document.getElementById('clickerCarrot');
        
        carrot.addEventListener('click', () => {
            // Добавление морковок
            gameState.carrots += gameState.perClick;
            gameState.playerExp += 1;
            
            // Создание анимации клика
            const clickText = document.createElement('div');
            clickText.className = 'click-info';
            clickText.textContent = `+${gameState.perClick} 🥕`;
            clickText.style.left = Math.random() * 80 + 10 + '%';
            clickText.style.top = Math.random() * 80 + 10 + '%';
            carrot.appendChild(clickText);
            
            setTimeout(() => {
                clickText.remove();
            }, 1000);
            
            // Обновление интерфейса и сохранение
            updateUI();
            Clicker.checkLevelUp(gameState, updateUI);
            saveGame();
            
            // Воспроизведение звука
            if (gameState.settings.soundClicker) {
                Utils.playSound('click');
            }
        });
    },

    checkLevelUp: (gameState, updateUI) => {
        if (gameState.playerExp >= 100) {
            gameState.playerLevel++;
            gameState.playerExp = 0;
            gameState.neptunium += 5;
            Utils.showNotification(`Поздравляем! Вы достигли уровня ${gameState.playerLevel}!`, 'success');
            updateUI();
        }
    }
};