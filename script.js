// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Игровые данные
let gameData = {
    carrots: 0,
    neptunium: 0,
    clicks: 0,
    clickBonus: 1,
    gardenSlots: 3,
    gardenSize: 1,
    growthSpeed: 1,
    waterScore: 0,
    monkeyScore: 0,
    upgrades: {
        growth: 1,
        clicker: 1
    },
    settings: {
        clickSound: true,
        upgradeSound: true,
        waterSound: true,
        monkeySound: true,
        displayMode: 'normal'
    }
};

// Загрузка данных
function loadGameData() {
    const saved = localStorage.getItem('cosmicCarrotData');
    if (saved) {
        gameData = {...gameData, ...JSON.parse(saved)};
    }
    updateUI();
}

// Сохранение данных
function saveGameData() {
    localStorage.setItem('cosmicCarrotData', JSON.stringify(gameData));
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('carrotCount').textContent = gameData.carrots;
    document.getElementById('neptuniumCount').textContent = gameData.neptunium;
    document.getElementById('clickCount').textContent = gameData.clicks;
    document.getElementById('clickBonus').textContent = gameData.clickBonus;
    document.getElementById('growthLevel').textContent = gameData.upgrades.growth;
    document.getElementById('clickerLevel').textContent = gameData.upgrades.clicker;
    document.getElementById('waterScore').textContent = gameData.waterScore;
    document.getElementById('monkeyScore').textContent = gameData.monkeyScore;
    
    // Обновление настроек
    document.getElementById('clickSound').checked = gameData.settings.clickSound;
    document.getElementById('upgradeSound').checked = gameData.settings.upgradeSound;
    document.getElementById('waterSound').checked = gameData.settings.waterSound;
    document.getElementById('monkeySound').checked = gameData.settings.monkeySound;
    document.getElementById('displayMode').value = gameData.settings.displayMode;
    
    updateGarden();
}

// Навигация по экранам
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Кликер морковки
function clickCarrot() {
    gameData.carrots += gameData.clickBonus;
    gameData.clicks++;
    
    if (gameData.settings.clickSound) {
        playSound('click');
    }
    
    // Анимация
    const carrot = document.querySelector('.carrot-animation');
    carrot.style.animation = 'none';
    setTimeout(() => {
        carrot.style.animation = 'bounce 0.5s ease';
    }, 10);
    
    updateUI();
    saveGameData();
}

// Грядка
function updateGarden() {
    const gardenPlot = document.getElementById('gardenPlot');
    gardenPlot.innerHTML = '';
    
    for (let i = 0; i < gameData.gardenSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'garden-slot';
        slot.innerHTML = '<div class="carrot-growing">🥕</div>';
        
        // Случайная готовность к сбору
        if (Math.random() > 0.5) {
            slot.classList.add('ready');
            slot.onclick = () => harvestSlot(i);
        }
        
        gardenPlot.appendChild(slot);
    }
    
    document.getElementById('harvestCount').textContent = 
        Math.floor(gameData.gardenSlots * 0.5 * gameData.growthSpeed);
}

function harvestSlot(slotIndex) {
    const harvest = Math.floor(10 * gameData.growthSpeed);
    gameData.carrots += harvest;
    
    // Обновляем слот
    const slots = document.querySelectorAll('.garden-slot');
    slots[slotIndex].classList.remove('ready');
    slots[slotIndex].innerHTML = '<div class="carrot-growing">🌱</div>';
    
    // Через время снова будет готов
    setTimeout(() => {
        if (slots[slotIndex]) {
            slots[slotIndex].innerHTML = '<div class="carrot-growing">🥕</div>';
            slots[slotIndex].classList.add('ready');
        }
    }, 5000 / gameData.growthSpeed);
    
    updateUI();
    saveGameData();
}

function harvestAll() {
    const readySlots = document.querySelectorAll('.garden-slot.ready');
    const totalHarvest = readySlots.length * 10 * gameData.growthSpeed;
    gameData.carrots += totalHarvest;
    
    readySlots.forEach(slot => {
        slot.classList.remove('ready');
        slot.innerHTML = '<div class="carrot-growing">🌱</div>';
        
        setTimeout(() => {
            slot.innerHTML = '<div class="carrot-growing">🥕</div>';
            slot.classList.add('ready');
        }, 5000 / gameData.growthSpeed);
    });
    
    updateUI();
    saveGameData();
}

// Поливалка
let waterGameInterval;
let waterTarget;

function startWaterGame() {
    const container = document.getElementById('waterTarget');
    container.innerHTML = '';
    
    gameData.waterScore = 0;
    updateUI();
    
    waterTarget = document.createElement('div');
    waterTarget.className = 'water-target';
    container.appendChild(waterTarget);
    
    moveWaterTarget();
    
    waterTarget.onclick = () => {
        gameData.waterScore++;
        gameData.carrots += 2;
        
        if (gameData.settings.waterSound) {
            playSound('water');
        }
        
        updateUI();
        moveWaterTarget();
    };
    
    // Завершение игры через 30 секунд
    setTimeout(() => {
        if (waterTarget.parentNode) {
            waterTarget.parentNode.removeChild(waterTarget);
        }
        clearInterval(waterGameInterval);
        
        // Награда за игру
        const reward = gameData.waterScore * 5;
        gameData.carrots += reward;
        updateUI();
        saveGameData();
        
        alert(`Игра окончена! Вы набрали ${gameData.waterScore} очков и получили ${reward} морковок!`);
    }, 30000);
}

function moveWaterTarget() {
    if (!waterTarget) return;
    
    const container = document.querySelector('.water-container');
    const maxX = container.clientWidth - 60;
    const maxY = container.clientHeight - 60;
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    waterTarget.style.left = `${randomX}px`;
    waterTarget.style.top = `${randomY}px`;
}

// Обезьянка
let monkeyGameInterval;
let monkeys = [];

function startMonkeyGame() {
    const container = document.getElementById('monkey');
    container.innerHTML = '';
    
    gameData.monkeyScore = 0;
    updateUI();
    
    // Создаем обезьянок
    for (let i = 0; i < 3; i++) {
        createMonkey(i);
    }
    
    // Завершение игры через 30 секунд
    setTimeout(() => {
        monkeys.forEach(monkey => {
            if (monkey.parentNode) {
                monkey.parentNode.removeChild(monkey);
            }
        });
        monkeys = [];
        clearInterval(monkeyGameInterval);
        
        // Награда за игру
        const reward = gameData.monkeyScore * 8;
        gameData.carrots += reward;
        updateUI();
        saveGameData();
        
        alert(`Игра окончена! Вы поймали ${gameData.monkeyScore} обезьянок и получили ${reward} морковок!`);
    }, 30000);
}

function createMonkey(id) {
    const container = document.querySelector('.monkey-container');
    const monkey = document.createElement('div');
    monkey.className = 'monkey';
    monkey.id = `monkey-${id}`;
    monkey.innerHTML = `
        <div class="monkey-icon">🐒</div>
        <div class="carrot-icon">🥕</div>
    `;
    
    monkey.onclick = () => catchMonkey(id);
    container.appendChild(monkey);
    monkeys.push(monkey);
    
    moveMonkey(id);
    
    // Движение обезьянки
    monkeyGameInterval = setInterval(() => {
        moveMonkey(id);
    }, 1000);
}

function moveMonkey(id) {
    const monkey = document.getElementById(`monkey-${id}`);
    if (!monkey) return;
    
    const container = document.querySelector('.monkey-container');
    const maxX = container.clientWidth - 60;
    const maxY = container.clientHeight - 60;
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    monkey.style.left = `${randomX}px`;
    monkey.style.top = `${randomY}px`;
}

function catchMonkey(id) {
    gameData.monkeyScore++;
    gameData.carrots += 5;
    
    if (gameData.settings.monkeySound) {
        playSound('monkey');
    }
    
    // Удаляем пойманную обезьянку и создаем новую
    const monkey = document.getElementById(`monkey-${id}`);
    if (monkey && monkey.parentNode) {
        monkey.parentNode.removeChild(monkey);
    }
    createMonkey(id);
    
    updateUI();
    saveGameData();
}

// Улучшения
function buyUpgrade(type) {
    const cost = type === 'growth' ? 10 : 15;
    
    if (gameData.neptunium >= cost) {
        gameData.neptunium -= cost;
        
        if (type === 'growth') {
            gameData.upgrades.growth++;
            gameData.growthSpeed = gameData.upgrades.growth;
        } else if (type === 'clicker') {
            gameData.upgrades.clicker++;
            gameData.clickBonus = gameData.upgrades.clicker;
        }
        
        if (gameData.settings.upgradeSound) {
            playSound('upgrade');
        }
        
        updateUI();
        saveGameData();
    } else {
        alert('Недостаточно Нептуния!');
    }
}

function openUpgradeCase() {
    if (gameData.neptunium >= 25) {
        gameData.neptunium -= 25;
        
        // 90% шанс улучшения, 10% шанс дебафа
        if (Math.random() > 0.1) {
            // Улучшение
            const upgrades = ['growth', 'clicker'];
            const randomUpgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
            
            if (randomUpgrade === 'growth') {
                gameData.upgrades.growth++;
                gameData.growthSpeed = gameData.upgrades.growth;
                alert('Улучшена скорость роста!');
            } else {
                gameData.upgrades.clicker++;
                gameData.clickBonus = gameData.upgrades.clicker;
                alert('Улучшен бонус кликера!');
            }
        } else {
            // Дебаф
            if (Math.random() > 0.5 && gameData.upgrades.growth > 1) {
                gameData.upgrades.growth--;
                gameData.growthSpeed = gameData.upgrades.growth;
                alert('Дебаф: снижена скорость роста!');
            } else if (gameData.upgrades.clicker > 1) {
                gameData.upgrades.clicker--;
                gameData.clickBonus = gameData.upgrades.clicker;
                alert('Дебаф: снижен бонус кликера!');
            } else {
                gameData.carrots = Math.max(0, gameData.carrots - 50);
                alert('Дебаф: потеряно 50 морковок!');
            }
        }
        
        if (gameData.settings.upgradeSound) {
            playSound('upgrade');
        }
        
        updateUI();
        saveGameData();
    } else {
        alert('Недостаточно Нептуния!');
    }
}

// Магазин
function openShopTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Shop').classList.add('active');
}

function buyShopItem(item) {
    const costs = {
        'gardenSlot': 50,
        'gardenSize': 30,
        'autoClicker': 100,
        'betterWatering': 80,
        'extraMonkey': 120
    };
    
    const cost = costs[item];
    
    if (gameData.carrots >= cost) {
        gameData.carrots -= cost;
        
        switch(item) {
            case 'gardenSlot':
                gameData.gardenSlots++;
                alert('Добавлен новый слот грядки!');
                break;
            case 'gardenSize':
                gameData.gardenSize++;
                alert('Увеличен размер грядки!');
                break;
            case 'autoClicker':
                startAutoClicker();
                alert('Активирован авто-кликер!');
                break;
            case 'betterWatering':
                // Улучшение поливалки
                alert('Улучшена лейка!');
                break;
            case 'extraMonkey':
                // Улучшение игры с обезьянкой
                alert('Добавлена дополнительная обезьянка!');
                break;
        }
        
        updateUI();
        saveGameData();
    } else {
        alert('Недостаточно морковок!');
    }
}

// Авто-кликер
function startAutoClicker() {
    setInterval(() => {
        gameData.carrots += gameData.clickBonus;
        updateUI();
        saveGameData();
    }, 5000);
}

// Настройки
document.getElementById('clickSound').addEventListener('change', (e) => {
    gameData.settings.clickSound = e.target.checked;
    saveGameData();
});

document.getElementById('upgradeSound').addEventListener('change', (e) => {
    gameData.settings.upgradeSound = e.target.checked;
    saveGameData();
});

document.getElementById('waterSound').addEventListener('change', (e) => {
    gameData.settings.waterSound = e.target.checked;
    saveGameData();
});

document.getElementById('monkeySound').addEventListener('change', (e) => {
    gameData.settings.monkeySound = e.target.checked;
    saveGameData();
});

document.getElementById('displayMode').addEventListener('change', (e) => {
    gameData.settings.displayMode = e.target.value;
    applyDisplayMode();
    saveGameData();
});

function applyDisplayMode() {
    const body = document.body;
    
    switch(gameData.settings.displayMode) {
        case 'simple':
            body.style.fontSize = '14px';
            break;
        case 'normal':
            body.style.fontSize = '16px';
            break;
        case 'hyper':
            body.style.fontSize = '18px';
            break;
    }
}

function showInfo() {
    alert('Cosmic Carrot - космическая ферма морковки с элементами кликера и мини-игр. Разработано с любовью к космосу и воде!');
}

// Звуки
function playSound(type) {
    const soundEl = document.getElementById(type + 'SoundEl');
    if (soundEl) {
        soundEl.currentTime = 0;
        soundEl.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    loadGameData();
    applyDisplayMode();
    
    // Генерация Нептуния каждые 2 минуты
    setInterval(() => {
        gameData.neptunium++;
        updateUI();
        saveGameData();
    }, 120000);
    
    // Авто-сохранение каждые 30 секунд
    setInterval(() => {
        saveGameData();
    }, 30000);
});

// Интеграция с Telegram
tg.ready();
tg.MainButton.setText('Сохранить прогресс').show();
tg.MainButton.onClick(() => {
    saveGameData();
    tg.showAlert('Прогресс сохранен!');
});
