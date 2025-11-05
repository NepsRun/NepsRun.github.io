// Модуль кликера
const Clicker = {
    init(gameInstance) {
        this.game = gameInstance;
        this.setupClicker();
    },

    setupClicker() {
        const carrot = document.getElementById('clickerCarrot');
        if (!carrot) return;

        carrot.addEventListener('click', () => {
            this.handleClick();
        });

        // Добавляем анимацию пульсации
        setInterval(() => {
            if (carrot.style.transform === 'scale(1.05)') {
                carrot.style.transform = 'scale(1)';
            } else {
                carrot.style.transform = 'scale(1.05)';
            }
        }, 1000);
    },

    handleClick() {
        const carrot = document.getElementById('clickerCarrot');
        const perClick = this.game.state.perClick;
        
        // Добавляем морковки
        this.game.addCarrots(perClick);
        
        // Создаем анимацию клика
        this.createClickAnimation(carrot, perClick);
        
        // Анимация кнопки
        carrot.style.transform = 'scale(0.95)';
        setTimeout(() => {
            carrot.style.transform = 'scale(1.05)';
        }, 100);
        
        // Воспроизведение звука
        this.game.playSound('click');
    },

    createClickAnimation(element, amount) {
        const clickText = document.createElement('div');
        clickText.className = 'click-info';
        clickText.textContent = `+${amount} 🥕`;
        clickText.style.left = Math.random() * 60 + 20 + '%';
        clickText.style.top = Math.random() * 60 + 20 + '%';
        
        // Стили для анимации
        clickText.style.cssText = `
            position: absolute;
            color: #ffa726;
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            animation: floatUp 1s forwards;
            z-index: 100;
        `;
        
        element.appendChild(clickText);
        
        setTimeout(() => {
            if (clickText.parentNode) {
                clickText.remove();
            }
        }, 1000);
    }
};
