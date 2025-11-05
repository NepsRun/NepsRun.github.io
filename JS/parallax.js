class ParallaxBackground {
    constructor() {
        this.layers = document.querySelectorAll('.parallax-layer');
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX - window.innerWidth / 2) / 50;
            this.mouseY = (e.clientY - window.innerHeight / 2) / 50;
            this.update();
        });

        // Мобильное управление
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.mouseX = (touch.clientX - window.innerWidth / 2) / 20;
            this.mouseY = (touch.clientY - window.innerHeight / 2) / 20;
            this.update();
        });

        // Анимация фона при скролле
        window.addEventListener('scroll', () => {
            this.updateScroll();
        });
    }

    update() {
        this.layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed'));
            const x = this.mouseX * speed;
            const y = this.mouseY * speed;
            
            layer.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    updateScroll() {
        const scrollY = window.scrollY;
        this.layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed'));
            const y = scrollY * speed * 0.1;
            layer.style.transform = `translateY(${y}px)`;
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new ParallaxBackground();
});
