// Модуль фермы
const Farm = {
    init(gameInstance) {
        this.game = gameInstance;
        this.setupFarm();
    },

    setupFarm() {
        this.renderFarm(this.game.state);
        
        document.getElementById('plantAllBtn')?.addEventListener('click', () => {
            this.plantAll();
        });

        document.getElementById('quickHarvest')?.addEventListener('click', () => {
            this.harvestAll();
        });
    },

    renderFarm(gameState) {
        const farmGrid = document.getElementById('farmGrid');
        if (!farmGrid) return;

        farmGrid.innerHTML = '';
        const plots = gameState.farm.plots;

        for (let i = 0; i < plots; i++) {
            const plot = document.createElement('div');
            plot.className = 'plot available';
            plot.innerHTML = '<div class="carrot-icon">🥕</div>';
            plot.addEventListener('click', () => {
                this.handlePlotClick(i);
            });
            farmGrid.appendChild(plot);
        }
    },

    handlePlotClick(plotIndex) {
        const plots = document.querySelectorAll('.plot');
        const plot = plots[plotIndex];
        
        if (plot.classList.contains('available')) {
            this.plantCarrot(plot);
        } else if (plot.classList.contains('ready')) {
            this.harvestCarrot(plot);
        }
    },

    plantCarrot(plot) {
        plot.classList.remove('available');
        plot.classList.add('growing');
        
        const growthTime = this.game.state.farm.growthTime / this.game.state.upgrades.farmSpeed;
        
        const timer = document.createElement('div');
        timer.className = 'plot-timer';
        timer.textContent = Math.ceil(growthTime / 1000) + 'с';
        plot.appendChild(timer);
        
        // Таймер обратного отсчета
        let timeLeft = Math.ceil(growthTime / 1000);
        const countdown = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft + 'с';
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                plot.classList.remove('growing');
                plot.classList.add('ready');
                timer.textContent = 'Готово!';
            }
        }, 1000);
        
        // Установка таймера завершения роста
        setTimeout(() => {
            if (plot.parentNode) {
                plot.classList.remove('growing');
                plot.classList.add('ready');
                if (timer.parentNode) {
                    timer.textContent = 'Готово!';
                }
                clearInterval(countdown);
            }
        }, growthTime);
    },

    harvestCarrot(plot) {
        const reward = Math.floor(Math.random() * 5) + 3;
        this.game.addCarrots(reward);
        
        plot.classList.remove('ready');
        plot.classList.add('available');
        
        // Удаляем таймер
        const timer = plot.querySelector('.plot-timer');
        if (timer) {
            timer.remove();
        }
        
        // Анимация сбора
        const harvestText = document.createElement('div');
        harvestText.className = 'click-info';
        harvestText.textContent = `+${reward} 🥕`;
        harvestText.style.cssText = `
            position: absolute;
            color: #ffa726;
            font-weight: bold;
            animation: floatUp 1s forwards;
            z-index: 100;
        `;
        plot.appendChild(harvestText);
        
        setTimeout(() => {
            if (harvestText.parentNode) {
                harvestText.remove();
            }
        }, 1000);
    },

    plantAll() {
        const plots = document.querySelectorAll('.plot.available');
        plots.forEach((plot, index) => {
            setTimeout(() => {
                this.plantCarrot(plot);
            }, index * 200);
        });
    },

    harvestAll() {
        const plots = document.querySelectorAll('.plot.ready');
        let totalReward = 0;
        
        plots.forEach((plot, index) => {
            setTimeout(() => {
                const reward = Math.floor(Math.random() * 5) + 3;
                totalReward += reward;
                
                plot.classList.remove('ready');
                plot.classList.add('available');
                
                const timer = plot.querySelector('.plot-timer');
                if (timer) timer.remove();
                
                // Анимация для каждого сбора
                const harvestText = document.createElement('div');
                harvestText.className = 'click-info';
                harvestText.textContent = `+${reward} 🥕`;
                harvestText.style.cssText = `
                    position: absolute;
                    color: #ffa726;
                    font-weight: bold;
                    animation: floatUp 1s forwards;
                    z-index: 100;
                `;
                plot.appendChild(harvestText);
                
                setTimeout(() => {
                    if (harvestText.parentNode) {
                        harvestText.remove();
                    }
                }, 1000);
                
                // Последний сбор - показываем общую награду
                if (index === plots.length - 1) {
                    setTimeout(() => {
                        this.game.showNotification(`Собрано ${totalReward} морковок!`, 'success');
                        this.game.addCarrots(totalReward);
                    }, 500);
                }
            }, index * 100);
        });
        
        if (plots.length === 0) {
            this.game.showNotification('Нет готовых растений для сбора', 'info');
        }
    }
};
