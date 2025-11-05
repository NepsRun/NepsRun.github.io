<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cosmic Carrot</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Aquatico&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Анимированный фон -->
        <div class="cosmic-background">
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
        </div>

        <!-- Главный экран -->
        <div id="mainScreen" class="screen active">
            <div class="header">
                <h1 class="title">COSMIC CARROT</h1>
                <div class="resources">
                    <div class="resource">
                        <span class="resource-icon">🥕</span>
                        <span id="carrotCount">0</span>
                    </div>
                    <div class="resource">
                        <span class="resource-icon">🔱</span>
                        <span id="neptuniumCount">0</span>
                    </div>
                </div>
            </div>

            <div class="menu-buttons">
                <button class="cosmic-btn" onclick="showScreen('gardenScreen')">
                    <span class="btn-icon">🪴</span>
                    Грядка
                </button>
                <button class="cosmic-btn" onclick="showScreen('clickerScreen')">
                    <span class="btn-icon">🥕</span>
                    Морковка-Кликер
                </button>
                <button class="cosmic-btn" onclick="showScreen('waterScreen')">
                    <span class="btn-icon">💧</span>
                    Поливалка
                </button>
                <button class="cosmic-btn" onclick="showScreen('monkeyScreen')">
                    <span class="btn-icon">🐒</span>
                    Забери у обезьянки
                </button>
                <button class="cosmic-btn" onclick="showScreen('upgradeScreen')">
                    <span class="btn-icon">⚡</span>
                    Улучшения
                </button>
                <button class="cosmic-btn" onclick="showScreen('shopScreen')">
                    <span class="btn-icon">🛒</span>
                    Магазин
                </button>
                <button class="cosmic-btn" onclick="showScreen('settingsScreen')">
                    <span class="btn-icon">⚙️</span>
                    Настройки
                </button>
            </div>
        </div>

        <!-- Грядка -->
        <div id="gardenScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Космическая Грядка</h2>
            </div>
            <div class="garden-container">
                <div id="gardenPlot" class="garden-plot">
                    <!-- Грядки будут генерироваться динамически -->
                </div>
                <div class="garden-info">
                    <p>Урожай: <span id="harvestCount">0</span> морковок</p>
                    <button class="cosmic-btn harvest-btn" onclick="harvestAll()">Собрать урожай</button>
                </div>
            </div>
        </div>

        <!-- Кликер -->
        <div id="clickerScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Морковка-Кликер</h2>
            </div>
            <div class="clicker-container">
                <div class="carrot-circle" onclick="clickCarrot()">
                    <div class="carrot-animation">🥕</div>
                </div>
                <p class="click-info">Кликов: <span id="clickCount">0</span></p>
                <p class="click-bonus">Бонус за клик: <span id="clickBonus">1</span></p>
            </div>
        </div>

        <!-- Поливалка -->
        <div id="waterScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Космическая Поливалка</h2>
            </div>
            <div class="water-game">
                <div class="water-container">
                    <div id="waterTarget" class="water-target"></div>
                </div>
                <button class="cosmic-btn water-btn" onclick="startWaterGame()">Начать полив</button>
                <p class="water-score">Очков: <span id="waterScore">0</span></p>
            </div>
        </div>

        <!-- Обезьянка -->
        <div id="monkeyScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Забери морковку у обезьянки</h2>
            </div>
            <div class="monkey-game">
                <div class="monkey-container">
                    <div id="monkey" class="monkey" onclick="catchMonkey()">
                        <div class="monkey-icon">🐒</div>
                        <div class="carrot-icon">🥕</div>
                    </div>
                </div>
                <button class="cosmic-btn monkey-btn" onclick="startMonkeyGame()">Начать игру</button>
                <p class="monkey-score">Поймано: <span id="monkeyScore">0</span></p>
            </div>
        </div>

        <!-- Улучшения -->
        <div id="upgradeScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Улучшения</h2>
            </div>
            <div class="upgrades-container">
                <div class="upgrade-item">
                    <h3>Скорость роста</h3>
                    <p>Увеличивает скорость роста морковки на грядке</p>
                    <p>Уровень: <span id="growthLevel">1</span></p>
                    <button class="cosmic-btn upgrade-btn" onclick="buyUpgrade('growth')">Улучшить (10 🔱)</button>
                </div>
                <div class="upgrade-item">
                    <h3>Бонус кликера</h3>
                    <p>Увеличивает морковок за клик</p>
                    <p>Уровень: <span id="clickerLevel">1</span></p>
                    <button class="cosmic-btn upgrade-btn" onclick="buyUpgrade('clicker')">Улучшить (15 🔱)</button>
                </div>
                <div class="upgrade-item">
                    <h3>Кейс улучшений</h3>
                    <p>Случайное улучшение (10% шанс дебафа)</p>
                    <button class="cosmic-btn case-btn" onclick="openUpgradeCase()">Открыть (25 🔱)</button>
                </div>
            </div>
        </div>

        <!-- Магазин -->
        <div id="shopScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Космический Магазин</h2>
            </div>
            <div class="shop-tabs">
                <button class="tab-btn active" onclick="openShopTab('garden')">Грядка</button>
                <button class="tab-btn" onclick="openShopTab('clicker')">Кликер</button>
                <button class="tab-btn" onclick="openShopTab('water')">Поливалка</button>
                <button class="tab-btn" onclick="openShopTab('monkey')">Обезьянка</button>
            </div>
            
            <div id="gardenShop" class="shop-tab active">
                <div class="shop-item">
                    <h3>Дополнительный слот грядки</h3>
                    <p>Добавляет +1 слот для выращивания морковки</p>
                    <button class="cosmic-btn shop-btn" onclick="buyShopItem('gardenSlot')">Купить (50 🥕)</button>
                </div>
                <div class="shop-item">
                    <h3>Увеличение размера грядки</h3>
                    <p>Увеличивает размер существующей грядки</p>
                    <button class="cosmic-btn shop-btn" onclick="buyShopItem('gardenSize')">Купить (30 🥕)</button>
                </div>
            </div>
            
            <div id="clickerShop" class="shop-tab">
                <div class="shop-item">
                    <h3>Авто-кликер</h3>
                    <p>Автоматически кликает каждые 5 секунд</p>
                    <button class="cosmic-btn shop-btn" onclick="buyShopItem('autoClicker')">Купить (100 🥕)</button>
                </div>
            </div>
            
            <div id="waterShop" class="shop-tab">
                <div class="shop-item">
                    <h3>Улучшенная лейка</h3>
                    <p>Увеличивает награду за полив</p>
                    <button class="cosmic-btn shop-btn" onclick="buyShopItem('betterWatering')">Купить (80 🥕)</button>
                </div>
            </div>
            
            <div id="monkeyShop" class="shop-tab">
                <div class="shop-item">
                    <h3>Дополнительная обезьянка</h3>
                    <p>Добавляет +1 обезьянку в мини-игре</p>
                    <button class="cosmic-btn shop-btn" onclick="buyShopItem('extraMonkey')">Купить (120 🥕)</button>
                </div>
            </div>
        </div>

        <!-- Настройки -->
        <div id="settingsScreen" class="screen">
            <div class="screen-header">
                <button class="back-btn" onclick="showScreen('mainScreen')">← Назад</button>
                <h2>Настройки</h2>
            </div>
            <div class="settings-container">
                <div class="setting-item">
                    <h3>Звуки</h3>
                    <div class="sound-settings">
                        <label>
                            <input type="checkbox" id="clickSound" checked> Звук кликера
                        </label>
                        <label>
                            <input type="checkbox" id="upgradeSound" checked> Звук улучшений
                        </label>
                        <label>
                            <input type="checkbox" id="waterSound" checked> Звук поливалки
                        </label>
                        <label>
                            <input type="checkbox" id="monkeySound" checked> Звук обезьянки
                        </label>
                    </div>
                </div>
                
                <div class="setting-item">
                    <h3>Режим отображения</h3>
                    <select id="displayMode" class="cosmic-select">
                        <option value="simple">Упрощенная версия</option>
                        <option value="normal" selected>Производственная</option>
                        <option value="hyper">Гипер версия</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <h3>Информация</h3>
                    <button class="cosmic-btn info-btn" onclick="showInfo()">О приложении</button>
                </div>
                
                <div class="setting-item">
                    <h3>Обратная связь</h3>
                    <p>@Dideshet, @BaldManke</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Аудио элементы -->
    <audio id="clickSoundEl" src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="></audio>
    <audio id="upgradeSoundEl" src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="></audio>
    <audio id="waterSoundEl" src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="></audio>
    <audio id="monkeySoundEl" src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="></audio>

    <script src="script.js"></script>
</body>
</html>
