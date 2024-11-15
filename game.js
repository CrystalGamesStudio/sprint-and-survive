const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pointsDisplay = document.getElementById('points');
const distanceDisplay = document.getElementById('distance');
const statsDiv = document.getElementById('stats');

const player = {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    speed: 5,
    jumpForce: 12,
    gravity: 0.5,
    velocityY: 0,
    isJumping: false
};

const obstacles = [];
let points = 0;
let distance = 1000; // metry do mety
let obstacleSpeed = 5;
let gameState = 'menu'; // 'menu', 'playing', 'over', 'won', 'howToPlay'
let message = '';

const buttons = {
    replay: {
        x: canvas.width / 2 - 150,
        y: canvas.height / 2 + 20,
        width: 300,
        height: 50,
        text: 'Zagraj ponownie',
        color: '#4CAF50',
        hoverColor: '#45a049'
    },
    menu: {
        x: canvas.width / 2 - 150,
        y: canvas.height / 2 + 90,
        width: 300,
        height: 50,
        text: 'Wróć do menu',
        color: '#2196F3',
        hoverColor: '#1976D2'
    },
    start: {
        x: canvas.width / 2 - 150,
        y: canvas.height / 2 + 20,
        width: 300,
        height: 50,
        text: 'Rozpocznij grę',
        color: '#4CAF50',
        hoverColor: '#45a049'
    },
    howToPlay: {
        x: canvas.width / 2 - 150,
        y: canvas.height / 2 + 90, // Pod przyciskiem start
        width: 300,
        height: 50,
        text: 'Jak grać',
        color: '#FF9800',
        hoverColor: '#F57C00'
    },
    back: {
        x: canvas.width / 2 - 150,
        y: canvas.height - 70,
        width: 300,
        height: 50,
        text: 'Powrót',
        color: '#2196F3',
        hoverColor: '#1976D2'
    }
};

let hoveredButton = null;

let currentLanguage = 'pl';

const translations = {
    pl: {
        title: "Sprint'n Survive",
        controls: 'Sterowanie:',
        spaceControl: 'SPACJA - skok',
        arrowsControl: 'STRZAŁKI - ruch góra/dół',
        startButton: 'Rozpocznij grę',
        replayButton: 'Zagraj ponownie',
        menuButton: 'Wróć do menu',
        points: 'Punkty',
        distance: 'Do mety',
        gameOver: 'Koniec gry! Wynik:',
        victory: 'Gratulacje! Wynik:',
        howToPlayButton: 'Jak grać?',
        backButton: 'Powrót',
        instructions: [
            "Jak grać w Sprint'n Survive?",
            '1. Używaj SPACJI do skoku',
            '2. Strzałkami GÓRA/DÓŁ poruszasz się w pionie',
            '3. Unikaj czerwonych przeszkód',
            '4. Zdobywaj punkty za każdą ominiętą przeszkodę',
            '5. Dotrzyj do mety aby wygrać!'
        ]
    },
    en: {
        title: "Sprint'n Survive",
        controls: 'Controls:',
        spaceControl: 'SPACE - jump',
        arrowsControl: 'ARROWS - move up/down',
        startButton: 'Start Game',
        replayButton: 'Play Again',
        menuButton: 'Back to Menu',
        points: 'Points',
        distance: 'To finish',
        gameOver: 'Game Over! Score:',
        victory: 'Congratulations! Score:',
        howToPlayButton: 'How to Play?',
        backButton: 'Back',
        instructions: [
            "How to play Sprint'n Survive?",
            '1. Use SPACE to jump',
            '2. Use UP/DOWN arrows to move vertically',
            '3. Avoid red obstacles',
            '4. Gain points for each avoided obstacle',
            '5. Reach the finish line to win!'
        ]
    },
    cn: {
        title: "Sprint'n Survive",
        controls: '控制：',
        spaceControl: '空格键 - 跳跃',
        arrowsControl: '方向键 - 上下移动',
        startButton: '开始游戏',
        replayButton: '再玩一次',
        menuButton: '返回菜单',
        points: '分数',
        distance: '终点距离',
        gameOver: '游戏结束！得分：',
        victory: '恭喜！得分：',
        howToPlayButton: '如何玩',
        backButton: '返回',
        instructions: [
            "如何玩 Sprint'n Survive?",
            '1. 使用空格键跳跃',
            '2. 使用上/下箭头垂直移动',
            '3. 避开红色障碍物',
            '4. 每避开一个障碍物获得分数',
            '5. 到达终点即可获胜！'
        ]
    }
};

const languageButtons = {
    pl: {
        x: 20,
        y: 20,
        width: 40,
        height: 40,
        text: 'PL',
        color: '#666666',
        hoverColor: '#888888'
    },
    en: {
        x: 70,
        y: 20,
        width: 40,
        height: 40,
        text: 'EN',
        color: '#666666',
        hoverColor: '#888888'
    },
    cn: {
        x: 120,
        y: 20,
        width: 40,
        height: 40,
        text: 'CN',
        color: '#666666',
        hoverColor: '#888888'
    }
};

function updateButtonTexts() {
    buttons.start.text = translations[currentLanguage].startButton;
    buttons.replay.text = translations[currentLanguage].replayButton;
    buttons.menu.text = translations[currentLanguage].menuButton;
    buttons.howToPlay.text = translations[currentLanguage].howToPlayButton;
    buttons.back.text = translations[currentLanguage].backButton;
}

function createObstacle() {
    const height = Math.random() * 100 + 50;
    const obstacle = {
        x: canvas.width,
        y: canvas.height - height,
        width: 30,
        height: height
    };
    obstacles.push(obstacle);
}

function update() {
    if (gameState !== 'playing') return;
    
    // Aktualizacja pozycji gracza
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Ograniczenie ruchu gracza do canvas
    if (player.y > canvas.height - player.height - 20) {
        player.y = canvas.height - player.height - 20;
        player.isJumping = false;
        player.velocityY = 0;
    }

    if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }

    // Aktualizacja przeszkód
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;
        
        // Usuwanie przeszkód poza ekranem
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            points += 10;
            if (pointsDisplay) {
                pointsDisplay.textContent = points;
            }
        }

        // Kolizja z przeszkodą
        if (checkCollision(player, obstacles[i])) {
            gameOver();
        }
    }

    // Dodawanie nowych przeszkód
    if (obstacles.length === 0 || 
        obstacles[obstacles.length - 1].x < canvas.width - 300) {
        createObstacle();
    }

    // Aktualizacja dystansu do mety
    distance = Math.max(0, distance - 0.1);
    if (distanceDisplay) {
        distanceDisplay.textContent = Math.floor(distance);
    }

    // Sprawdzenie czy gracz dotarł do mety
    if (distance <= 0) {
        win();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'playing') {
        // Tło gry z gradientem
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000066');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rysowanie podłoża z gradientem
        const groundGradient = ctx.createLinearGradient(0, canvas.height - 20, 0, canvas.height);
        groundGradient.addColorStop(0, '#4CAF50');
        groundGradient.addColorStop(1, '#45a049');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

        // Rysowanie gracza z cieniem
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.roundRect(player.x, player.y, player.width, player.height, 5);
        ctx.fill();

        // Rysowanie przeszkód z gradientem
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        obstacles.forEach(obstacle => {
            const obstacleGradient = ctx.createLinearGradient(obstacle.x, 0, obstacle.x + obstacle.width, 0);
            obstacleGradient.addColorStop(0, '#ff4444');
            obstacleGradient.addColorStop(1, '#cc0000');
            ctx.fillStyle = obstacleGradient;
            ctx.beginPath();
            ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
            ctx.fill();
        });
    }

    // Reset cienia
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Wyświetlanie menu
    if (gameState === 'menu') {
        drawMenu();
    } else if (gameState === 'howToPlay') {
        drawHowToPlay();
    }
    
    // Wyświetlanie komunikatu o przegranej/wygranej
    if (gameState === 'over' || gameState === 'won') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px "Comic Neue"';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 60);
        
        drawButton(buttons.replay);
        drawButton(buttons.menu);
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

function gameOver() {
    gameState = 'over';
    message = translations[currentLanguage].gameOver + ' ' + points;
    statsDiv.style.display = 'none';
}

function win() {
    gameState = 'won';
    message = translations[currentLanguage].victory + ' ' + points;
    statsDiv.style.display = 'none';
}

function resetGame() {
    obstacles.length = 0;
    points = 0;
    distance = 1000;
    player.y = 200;
    player.velocityY = 0;
    player.isJumping = false;
    
    if (statsDiv) {
        if (gameState === 'playing') {
            statsDiv.style.display = 'block';
            pointsDisplay.textContent = '0';
            distanceDisplay.textContent = '1000';
        } else {
            statsDiv.style.display = 'none';
        }
    }
}

// Funkcja rysowania menu
function drawMenu() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Rysuj przyciski języków
    Object.values(languageButtons).forEach(button => {
        drawLanguageButton(button);
    });
    
    // Rysuj tytuł
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px "Comic Neue"';
    ctx.textAlign = 'center';
    ctx.fillText(translations[currentLanguage].title, canvas.width / 2, canvas.height / 2 - 80);
    
    // Rysuj przyciski
    drawButton(buttons.start);
    drawButton(buttons.howToPlay);
}

function drawButton(button) {
    // Cień przycisku
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Tło przycisku
    ctx.fillStyle = button === hoveredButton ? button.hoverColor : button.color;
    ctx.beginPath();
    ctx.roundRect(button.x, button.y, button.width, button.height, 10);
    ctx.fill();

    // Reset cienia dla tekstu
    ctx.shadowColor = 'transparent';
    
    // Tekst przycisku
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px "Comic Neue"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.text, button.x + button.width/2, button.y + button.height/2);
}

function isClickInside(pos, button) {
    return pos.x > button.x && 
           pos.x < button.x + button.width && 
           pos.y > button.y && 
           pos.y < button.y + button.height;
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    if (gameState === 'menu') {
        // Sprawdź kliknięcia w przyciski języka
        Object.entries(languageButtons).forEach(([lang, button]) => {
            if (isClickInside(pos, button)) {
                currentLanguage = lang;
                updateButtonTexts();
                // Zaktualizuj tekst w pasku statystyk
                document.getElementById('stats').innerHTML = 
                    `${translations[currentLanguage].points}: <span id="points">0</span> | 
                     ${translations[currentLanguage].distance}: <span id="distance">1000</span>m`;
                updateReferences();
            }
        });
        
        // Sprawdź kliknięcie w przycisk start
        if (isClickInside(pos, buttons.start)) {
            gameState = 'playing';
            if (statsDiv) {
                statsDiv.style.display = 'block';
                updateReferences(); // Aktualizuj referencje
                pointsDisplay.textContent = '0';
                distanceDisplay.textContent = '1000';
            }
            resetGame();
        } else if (isClickInside(pos, buttons.howToPlay)) {
            gameState = 'howToPlay';
        }
    } else if (gameState === 'howToPlay') {
        if (isClickInside(pos, buttons.back)) {
            gameState = 'menu';
        }
    } else if (gameState === 'over' || gameState === 'won') {
        if (isClickInside(pos, buttons.replay)) {
            gameState = 'playing';
            resetGame();
            statsDiv.style.display = 'block';
        } else if (isClickInside(pos, buttons.menu)) {
            gameState = 'menu';
            resetGame();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        switch(e.code) {
            case 'Space':
                if (!player.isJumping) {
                    player.velocityY = -player.jumpForce;
                    player.isJumping = true;
                }
                break;
            case 'ArrowUp':
                player.y -= player.speed;
                break;
            case 'ArrowDown':
                player.y += player.speed;
                break;
        }
    }
});

// Rozpoczęcie gry
gameState = 'menu';
animate();

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    hoveredButton = null;
    
    if (gameState === 'menu') {
        if (isClickInside(pos, buttons.start)) {
            hoveredButton = buttons.start;
        } else if (isClickInside(pos, buttons.howToPlay)) {
            hoveredButton = buttons.howToPlay;
        }
        // Sprawdź hover dla przycisków języka
        Object.entries(languageButtons).forEach(([lang, button]) => {
            if (isClickInside(pos, button)) {
                hoveredButton = button;
            }
        });
    } else if (gameState === 'over' || gameState === 'won') {
        if (isClickInside(pos, buttons.replay)) {
            hoveredButton = buttons.replay;
        } else if (isClickInside(pos, buttons.menu)) {
            hoveredButton = buttons.menu;
        } else if (isClickInside(pos, buttons.howToPlay)) {
            hoveredButton = buttons.howToPlay;
        }
    } else if (gameState === 'howToPlay') {
        if (isClickInside(pos, buttons.back)) {
            hoveredButton = buttons.back;
        }
    }
});

// Dodaj efekt kursora
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    let isOverButton = false;
    
    if (gameState === 'menu') {
        isOverButton = isClickInside(pos, buttons.start);
        // Dodaj sprawdzanie przycisków języka
        Object.values(languageButtons).forEach(button => {
            if (isClickInside(pos, button)) {
                isOverButton = true;
            }
        });
    } else if (gameState === 'over' || gameState === 'won') {
        isOverButton = isClickInside(pos, buttons.replay) || isClickInside(pos, buttons.menu) || isClickInside(pos, buttons.howToPlay);
    } else if (gameState === 'howToPlay') {
        isOverButton = isClickInside(pos, buttons.back);
    }

    canvas.style.cursor = isOverButton ? 'pointer' : 'default';
});

// Zapobieganie przewijaniu strony
window.addEventListener('keydown', function(e) {
    if(e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});

// Zapobieganie przewijaniu na urządzeniach mobilnych
document.body.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

updateButtonTexts();

// Dodaj funkcję drawLanguageButton po funkcji drawButton:
function drawLanguageButton(button) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    
    // Tło przycisku
    ctx.fillStyle = button === hoveredButton ? button.hoverColor : button.color;
    ctx.beginPath();
    ctx.roundRect(button.x, button.y, button.width, button.height, 5);
    ctx.fill();
    
    // Tekst przycisku
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = currentLanguage === button.text.toLowerCase() ? '#4CAF50' : 'white';
    ctx.font = 'bold 16px "Comic Neue"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.text, button.x + button.width/2, button.y + button.height/2);
}

// Dodaj funkcję rysowania ekranu instrukcji
function drawHowToPlay() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rysuj instrukcje
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    const instructions = translations[currentLanguage].instructions;
    const lineHeight = 40;
    const startY = 100;

    instructions.forEach((line, index) => {
        ctx.font = index === 0 ? 'bold 30px "Comic Neue"' : 'bold 20px "Comic Neue"';
        ctx.fillText(line, 50, startY + (lineHeight * index));
    });

    // Rysuj przycisk powrotu
    drawButton(buttons.back);
}

// Dodaj funkcję aktualizacji referencji
function updateReferences() {
    pointsDisplay = document.getElementById('points');
    distanceDisplay = document.getElementById('distance');
    statsDiv = document.getElementById('stats');
    
    // Sprawdź czy elementy istnieją
    if (!pointsDisplay || !distanceDisplay || !statsDiv) {
        console.error('Nie można znaleźć elementów DOM');
        return;
    }
    
    // Aktualizuj etykiety zgodnie z wybranym językiem
    document.getElementById('points-label').textContent = translations[currentLanguage].points + ':';
    document.getElementById('distance-label').textContent = translations[currentLanguage].distance + ':';
}

// Dodaj sprawdzenie pozycji przycisku start
console.log('Start button position:', buttons.start); // Dodaj dla debugowania

// Na początku pliku, po deklaracji zmiennych:
updateReferences();