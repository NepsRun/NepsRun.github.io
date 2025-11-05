// Модуль улучшений
const Upgrades = {
    init: (gameState, updateUI, saveGame) => {
        Upgrades.renderUpgrades(gameState, updateUI, saveGame);
        
        // Обработчик кейса улучшений
        document.getElementById('openCaseBtn').addEventListener('click', () => {
            Upgrades.openCase(gameState, updateUI, saveGame);
        });
    },

    renderUpgrades: (gameState, updateUI, saveGame) => {
        const upgradeList = document.getElementById('upgradeList');
        const upgrades = [
            {
                name: "Мощность генератора",
                desc: "Увеличивает выход ресурсов за активацию",
                cost: 50,
                level: gameState.upgrades.clickPower,
                maxLevel: 10,
                upgrade: () => {
                    gameState.upgrades.clickPower++;
                    gameState.perClick = gameState.upgrades.clickPower;
                }
            },
            {
                name: "Автоматический сбор",
                desc: "Добавляет пассивный доход ресурсов",
                cost: 100,
                level: gameState.upgrades.autoIncome,
                maxLevel: 5,
                upgrade: () => {
                    gameState.upgrades.autoIncome++;
                }
            },
            {
                name: "Ускорение роста",
                desc: "Увеличивает скорость выращивания моркови",
                cost: 150,
                level: gameState.upgrades.farmSpeed,
                maxLevel: 5,
                upgrade: () => {
                    gameState.upgrades.farmSpeed++;
                }
            },
            {
                name: "Эффективность захвата",
                desc: "Увеличивает награду в модуле нейтрализации",
                cost: 120,
                level: gameState.miniGames.monkey.rewardMultiplier,
                maxLevel: 5,
                upgrade: () => {
                    gameState.miniGames.monkey.rewardMultiplier++;
                }
            },
            {
                name: "Эффективность орошения",
                desc: "Увеличивает награду в системе полива",
                cost: 120,
                level: gameState.miniGames.watering.rewardMultiplier,
                maxLevel: 5,
                upgrade: () => {
                    gameState.miniGames.watering.rewardMultiplier++;
                }
            }
        ];
        
        upgradeList.innerHTML = '';
        
        upgrades.forEach((upgrade, index) => {
            const item = document.createElement('div');
            item.className = 'upgrade-item';
            
            const canAfford = gameState.carrots >= upgrade.cost * (upgrade.level + 1);
            const isMaxLevel = upgrade.level >= upgrade.maxLevel;
            
            item.innerHTML = `
                <div class="upgrade-info">
                    <div class="upgrade-name">${upgrade.name} (Ур. ${upgrade.level}/${upgrade.maxLevel})</div>
                    <div class="upgrade-desc">${upgrade.desc}</div>
                </div>
                <button class="upgrade-btn" ${!canAfford || isMaxLevel ? 'disabled' : ''}>
                    ${isMaxLevel ? 'Максимум' : `${upgrade.cost * (upgrade.level + 1)} 🥕`}
                </button>
            `;
            
            const btn = item.querySelector('.upgrade-btn');
            if (!isMaxLevel) {
                btn.addEventListener('click', () => {
                    const cost = upgrade.cost * (upgrade.level + 1);
                    if (gameState.carrots >= cost) {
                        gameState.carrots -= cost;
                        upgrade.upgrade();
                        updateUI();
                        Upgrades.renderUpgrades(gameState, updateUI, saveGame);
                        saveGame();
                        
                        if (gameState.settings.soundUpgrades) {
                            Utils.playSound('upgrade');
                        }
                        
                        Utils.showNotification(`${upgrade.name} улучшена до уровня ${upgrade.level + 1}!`, 'success');
                    }
                });
            }
            
            upgradeList.appendChild(item);
        });
    },

    openCase: (gameState, updateUI, saveGame) => {
        if (gameState.neptunium >= 10) {
            gameState.neptunium -= 10;
            
            // 90% шанс на улучшение, 10% на дебаф
            if (Math.random() < 0.9) {
                // Случайное улучшение
                const randomUpgrade = Math.floor(Math.random() * 5);
                let message = '';
                
                switch (randomUpgrade) {
                    case 0:
                        gameState.upgrades.clickPower++;
                        gameState.perClick = gameState.upgrades.clickPower;
                        message = `Мощность генератора увеличена до уровня ${gameState.upgrades.clickPower}!`;
                        break;
                    case 1:
                        gameState.upgrades.autoIncome++;
                        message = `Автоматический сбор увеличен до уровня ${gameState.upgrades.autoIncome}!`;
                        break;
                    case 2:
                        gameState.upgrades.farmSpeed++;
                        message = `Ускорение роста увеличено до уровня ${gameState.upgrades.farmSpeed}!`;
                        break;
                    case 3:
                        gameState.miniGames.monkey.rewardMultiplier++;
                        message = `Эффективность захвата увеличена до уровня ${gameState.miniGames.monkey.rewardMultiplier}!`;
                        break;
                    case 4:
                        gameState.miniGames.watering.rewardMultiplier++;
                        message = `Эффективность орошения увеличена до уровня ${gameState.miniGames.watering.rewardMultiplier}!`;
                        break;
                }
                
                Utils.showNotification(`Поздравляем! ${message}`, 'success');
            } else {
                // Дебаф
                const randomDebuff = Math.floor(Math.random() * 3);
                let message = '';
                
                switch (randomDebuff) {
                    case 0:
                        gameState.perClick = Math.max(1, gameState.perClick - 1);
                        message = "Мощность генератора снижена!";
                        break;
                    case 1:
                        gameState.upgrades.farmSpeed = Math.max(1, gameState.upgrades.farmSpeed - 1);
                        message = "Скорость роста снижена!";
                        break;
                    case 2:
                        gameState.carrots = Math.max(0, gameState.carrots - 50);
                        message = "Потеряно 50 единиц ресурса!";
                        break;
                }
                
                Utils.showNotification(`Неудача! ${message}`, 'error');
            }
            
            updateUI();
            Upgrades.renderUpgrades(gameState, updateUI, saveGame);
            saveGame();
        } else {
            Utils.showNotification('Недостаточно нептуния для открытия кейса!', 'error');
        }
    }
};