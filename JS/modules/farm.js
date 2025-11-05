// Модуль фермы
const Farm = {
    init: (gameState, updateUI, saveGame) => {
        Farm.renderFarm(gameState);
        
        // Обработчик кнопки "Посадить все"
        document.getElementById('plantAllBtn').addEventListener('click', () => {
            Farm.plantAll(gameState, updateUI, saveGame);
        });
    },

    renderFarm: (gameState) => {
        const farmGrid = document.getElementById('farmGrid');
        farmGrid.innerHTML = '';
        
        for (let i = 0; i < gameState.farm.plots; i++) {
            const plot = document.createElement('div');
            plot.className = 'plot available';
            plot.innerHTML = '<div class="carrot-icon">🥕</div>';
            plot.addEventListener('click', () => {
                Farm.plantCarrot(i, gameState, updateUI, saveGame);
            });
            farmGrid.appendChild(plot);
        }
    },

    plantCarrot: (plotIndex, gameState, updateUI, saveGame) => {
        const plots = document.querySelectorAll('.plot');
        const plot = plots[plotIndex];
        
        if (plot.classList.contains('available')) {
            plot.classList.remove('available');
            plot.classList.add('growing');
            
            const growthTime = gameState.farm.growthTime / gameState.upgrades.farmSpeed;
            
            const timer = document.createElement('div');
            timer.className = 'plot-timer';
            timer.textContent = (growthTime / 1000).toFixed(0) + 'с';
            plot.appendChild(timer);
            
            let timeLeft = growthTime / 1000;
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
            
            setTimeout(() => {
                plot.classList.remove('growing');
                plot.classList.add('ready');
                timer.textContent = 'Готово!';
                clearInterval(countdown);
            }, growthTime);
            
        } else if (plot.classList.contains('ready')) {
            // Сбор урожая
            const reward = Utils.random(3, 8);
            gameState.carrots += reward;
            gameState.playerExp += 5;
            
            plot.classList.remove('ready');
            plot.classList.add('available');
            plot.querySelector('.plot-timer').remove();
            
            // Анимация сбора
            const harvestText = document.createElement('div');
            harvestText.className = 'click-info';
            harvestText.textContent = `+${reward} 🥕`;
            harvestText.style.left = '50%';
            harvestText.style.top = '50%';
            plot.appendChild(harvestText);
            
            setTimeout(() => {
                harvestText.remove();
            }, 1000);
            
            updateUI();
            Clicker.checkLevelUp(gameState, updateUI);
            saveGame();
        }
    },

    plantAll: (gameState, updateUI, saveGame) => {
        const plots = document.querySelectorAll('.plot.available');
        plots.forEach((plot, index) => {
            setTimeout(() => {
                plot.click();
            }, index * 200);
        });
    }
};