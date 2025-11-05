// Утилиты для игры
const Utils = {
    // Форматирование чисел
    formatNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Случайное число в диапазоне
    random: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Воспроизведение звука
    playSound: (soundName) => {
        // В реальном приложении здесь будет код для воспроизведения звуков
        console.log(`Playing sound: ${soundName}`);
    },

    // Показать уведомление
    showNotification: (message, type = 'info') => {
        // Создание элемента уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Обновление элемента интерфейса
    updateElement: (elementId, value) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = Utils.formatNumber(value);
        }
    }
};