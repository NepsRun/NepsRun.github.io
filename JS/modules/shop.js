// Модуль магазина
const Shop = {
    init: (gameState, updateUI, saveGame) => {
        Shop.renderShop(gameState, updateUI, saveGame);
    },

    renderShop: (gameState, updateUI, saveGame) => {
        const shopItems = document.getElementById('shopItems');
        const items = [
            {
                name: "Дополнительный модуль",
                desc: "Добавляет один модуль выращивания",
                cost: 200,
                type: "farm",
                purchase: () => {
                    gameState.farm.plots++;
                    Farm.renderFarm(gameState);
                }
            },
            {
                name: "Увеличение модуля",
                desc: "Увеличивает емкость модуля выращивания",
                cost: 300,
                type: "farm",
                purchase: () => {
                    gameState.farm.plotSize++;
                }
            },
            {
                name: "Модернизация генератора",
                desc: "Увеличивает базовую мощность генератора",
                cost: 150,
                type: "clicker",
                purchase: () => {
                    gameState.perClick += 2;
                }
            },
            {
                name: "Оптимизация орошения",
                desc: "Увеличивает время работы системы полива",
                cost: 180,
                type: "watering",
                purchase: () => {
                    // Увеличиваем время в мини-игре
                }
            },
            {
                name: "Улучшение сканирования",
                desc: "Увеличивает количество целей в модуле нейтрализации",
                cost: 180,
                type: "monkey",
                purchase: () => {
                    // Увеличиваем количество обезьянок
                }
            }
        ];
        
        shopItems.innerHTML = '';
        
        items.forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            
            const canAfford = gameState.carrots >= item.cost;
            
            shopItem.innerHTML = `
                <div class="shop-info">
                    <div class="shop-name">${item.name}</div>
                    <div class="shop-desc">${item.desc}</div>
                </div>
                <button class="shop-btn" ${!canAfford ? 'disabled' : ''}>${item.cost} 🥕</button>
            `;
            
            const btn = shopItem.querySelector('.shop-btn');
            btn.addEventListener('click', () => {
                if (gameState.carrots >= item.cost) {
                    gameState.carrots -= item.cost;
                    item.purchase();
                    updateUI();
                    saveGame();
                    
                    if (gameState.settings.soundShop) {
                        Utils.playSound('purchase');
                    }
                    
                    Utils.showNotification(`Приобретено: ${item.name}!`, 'success');
                }
            });
            
            shopItems.appendChild(shopItem);
        });
    }
};