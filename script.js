// Word lists and categories
const categories = {
    animals: ['elephant', 'giraffe', 'penguin', 'cheetah', 'kangaroo'],
    countries: ['brazil', 'japan', 'australia', 'egypt', 'canada'],
    fruits: ['banana', 'strawberry', 'pineapple', 'watermelon', 'kiwi'],
    sports: ['basketball', 'tennis', 'swimming', 'volleyball', 'cycling']
};

const difficulties = {
    easy: [].concat(...Object.values(categories).map(cat => cat.filter(word => word.length <= 6))),
    medium: [].concat(...Object.values(categories).map(cat => cat.filter(word => word.length > 6 && word.length <= 8))),
    hard: [].concat(...Object.values(categories).map(cat => cat.filter(word => word.length > 8)))
};

let currentCategory = '';
let words = difficulties.medium;
let currentWord = '';
let scrambledWord = '';
let score = 0;
let timeLeft = 60;
let timerInterval;
let level = 1;
let gameMode = 'classic';
let soundEnabled = true;
let players = [];
let currentPlayer = { name: 'Player 1', score: 0 };

// DOM elements
const elements = {
    scrambledWord: document.getElementById('scrambled-word'),
    userInput: document.getElementById('user-input'),
    submitButton: document.getElementById('submit-btn'),
    message: document.getElementById('message'),
    newWordButton: document.getElementById('new-word-btn'),
    scoreElement: document.getElementById('score'),
    timerElement: document.getElementById('timer'),
    levelElement: document.getElementById('level'),
    hintButton: document.getElementById('hint-btn'),
    quitButton: document.getElementById('quit-btn'),
    highScoresList: document.getElementById('high-scores-list'),
    achievementsList: document.getElementById('achievements-list'),
    easyButton: document.getElementById('easy-btn'),
    mediumButton: document.getElementById('medium-btn'),
    hardButton: document.getElementById('hard-btn'),
    soundOnButton: document.getElementById('sound-on-btn'),
    soundOffButton: document.getElementById('sound-off-btn'),
    lightThemeButton: document.getElementById('light-theme-btn'),
    darkThemeButton: document.getElementById('dark-theme-btn'),
    categoryDisplay: document.getElementById('category-display'),
    playerList: document.getElementById('player-list'),
    chatBox: document.getElementById('chat-box'),
    chatInput: document.getElementById('chat-input'),
    sendChatButton: document.getElementById('send-chat-btn'),
    startMultiplayerButton: document.getElementById('start-multiplayer-btn'),
    leaveMultiplayerButton: document.getElementById('leave-multiplayer-btn'),
    timeBoostButton: document.getElementById('time-boost'),
    revealLetterButton: document.getElementById('reveal-letter'),
    skipWordButton: document.getElementById('skip-word')
};

const screens = {
    mainMenu: document.getElementById('main-menu'),
    gameModes: document.getElementById('game-modes'),
    game: document.getElementById('game-screen'),
    multiplayer: document.getElementById('multiplayer-screen'),
    highScores: document.getElementById('high-scores-screen'),
    achievements: document.getElementById('achievements-screen'),
    settings: document.getElementById('settings-screen')
};

const buttons = {
    singlePlayer: document.getElementById('single-player-btn'),
    multiplayer: document.getElementById('multiplayer-btn'),
    classicMode: document.getElementById('classic-mode-btn'),
    timeAttack: document.getElementById('time-attack-btn'),
    endlessMode: document.getElementById('endless-mode-btn'),
    categoryMode: document.getElementById('category-mode-btn'),
    highScores: document.getElementById('high-scores-btn'),
    achievements: document.getElementById('achievements-btn'),
    settings: document.getElementById('settings-btn'),
    back: document.getElementById('back-btn'),
    backToMenu: document.querySelectorAll('#back-to-menu-btn')
};

const achievements = [
    { id: 'first_word', name: 'First Word', description: 'Guess your first word correctly', unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Guess 5 words in under 30 seconds', unlocked: false },
    { id: 'word_master', name: 'Word Master', description: 'Reach level 10 in Classic Mode', unlocked: false },
    { id: 'time_lord', name: 'Time Lord', description: 'Score 100 points in Time Attack Mode', unlocked: false },
    { id: 'endless_warrior', name: 'Endless Warrior', description: 'Guess 50 words in Endless Mode', unlocked: false },
    { id: 'category_champion', name: 'Category Champion', description: 'Complete all categories in Category Challenge', unlocked: false },
    { id: 'multiplayer_victor', name: 'Multiplayer Victor', description: 'Win a multiplayer game', unlocked: false }
];

let highScores = {
    classic: [],
    timeAttack: [],
    endless: [],
    category: []
};

function getRandomWord() {
    if (gameMode === 'category') {
        return words[Math.floor(Math.random() * words.length)];
    } else {
        const categoryKeys = Object.keys(categories);
        currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        return categories[currentCategory][Math.floor(Math.random() * categories[currentCategory].length)];
    }
}

function scrambleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function newWord() {
    currentWord = getRandomWord();
    scrambledWord = scrambleWord(currentWord);
    elements.scrambledWord.textContent = scrambledWord;
    elements.userInput.value = '';
    elements.message.textContent = '';
    if (gameMode === 'category') {
        elements.categoryDisplay.textContent = `Category: ${currentCategory}`;
    }
}

function checkGuess() {
    const userGuess = elements.userInput.value.toLowerCase();
    if (userGuess === currentWord) {
        elements.message.textContent = 'Correct! Well done!';
        elements.message.style.color = 'green';
        score += calculateScore();
        elements.scoreElement.textContent = score;
        if (gameMode === 'classic') {
            level++;
            elements.levelElement.textContent = level;
        }
        checkAchievements();
        newWord();
    } else {
        elements.message.textContent = 'Wrong. Try again!';
        elements.message.style.color = 'red';
    }
}

function calculateScore() {
    let baseScore = 10;
    if (gameMode === 'timeAttack') {
        baseScore += Math.floor(timeLeft / 5);
    }
    return baseScore * (gameMode === 'hard' ? 2 : 1);
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    elements.timerElement.textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        elements.timerElement.textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function setDifficulty(difficulty) {
    words = difficulties[difficulty];
    elements.easyButton.classList.remove('active');
    elements.mediumButton.classList.remove('active');
    elements.hardButton.classList.remove('active');
    
    if (difficulty === 'easy') {
        elements.easyButton.classList.add('active');
    } else if (difficulty === 'medium') {
        elements.mediumButton.classList.add('active');
    } else {
        elements.hardButton.classList.add('active');
    }
}

function resetGame() {
    score = 0;
    level = 1;
    elements.scoreElement.textContent = score;
    elements.levelElement.textContent = level;
    elements.submitButton.disabled = false;
    elements.newWordButton.disabled = false;
    if (gameMode !== 'endless') {
        startTimer();
    }
    newWord();
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

function startGame(mode) {
    gameMode = mode;
    resetGame();
    showScreen('game');
}

function endGame() {
    elements.message.textContent = 'Game Over!';
    elements.message.style.color = 'red';
    elements.submitButton.disabled = true;
    elements.newWordButton.disabled = true;
    updateHighScores();
    setTimeout(() => showScreen('mainMenu'), 3000);
}

function updateHighScores() {
    highScores[gameMode].push(score);
    highScores[gameMode].sort((a, b) => b - a);
    highScores[gameMode] = highScores[gameMode].slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function displayHighScores() {
    elements.highScoresList.innerHTML = '';
    for (const mode in highScores) {
        const modeScores = highScores[mode];
        const modeElement = document.createElement('li');
        modeElement.innerHTML = `<strong>${mode}:</strong>`;
        const scoreList = document.createElement('ol');
        modeScores.forEach(score => {
            const scoreItem = document.createElement('li');
            scoreItem.textContent = score;
            scoreList.appendChild(scoreItem);
        });
        modeElement.appendChild(scoreList);
        elements.highScoresList.appendChild(modeElement);
    }
}

function checkAchievements() {
    if (!achievements[0].unlocked) {
        achievements[0].unlocked = true;
        showAchievementNotification('First Word');
    }
    if (gameMode === 'classic' && level === 10 && !achievements[2].unlocked) {
        achievements[2].unlocked = true;
        showAchievementNotification('Word Master');
    }
    if (gameMode === 'timeAttack' && score >= 100 && !achievements[3].unlocked) {
        achievements[3].unlocked = true;
        showAchievementNotification('Time Lord');
    }
    if (gameMode === 'endless' && score >= 500 && !achievements[4].unlocked) {
        achievements[4].unlocked = true;
        showAchievementNotification('Endless Warrior');
    }
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

function showAchievementNotification(achievementName) {
    const notification = document.createElement('div');
    notification.textContent = `Achievement Unlocked: ${achievementName}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'gold';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function displayAchievements() {
    elements.achievementsList.innerHTML = '';
    achievements.forEach(achievement => {
        const achievementItem = document.createElement('li');
        achievementItem.innerHTML = `
            <strong>${achievement.name}</strong>: ${achievement.description}
            ${achievement.unlocked ? '✅' : '❌'}
        `;
        elements.achievementsList.appendChild(achievementItem);
    });
}

function provideHint() {
    const hintLength = Math.ceil(currentWord.length / 3);
    const hint = currentWord.slice(0, hintLength) + '_'.repeat(currentWord.length - hintLength);
    elements.message.textContent = `Hint: ${hint}`;
    elements.message.style.color = 'blue';
}

function toggleSound(enabled) {
    soundEnabled = enabled;
    elements.soundOnButton.classList.toggle('active', enabled);
    elements.soundOffButton.classList.toggle('active', !enabled);
    // Implement sound logic here
}

function toggleTheme(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    elements.lightThemeButton.classList.toggle('active', theme === 'light');
    elements.darkThemeButton.classList.toggle('active', theme === 'dark');
}

function initMultiplayer() {
    // Implement multiplayer logic here (e.g., WebSocket connection)
    showScreen('multiplayer');
}

function sendChatMessage() {
    const message = elements.chatInput.value;
    if (message.trim() !== '') {
        const chatMessage = document.createElement('p');
        chatMessage.textContent = `${currentPlayer.name}: ${message}`;
        elements.chatBox.appendChild(chatMessage);
        elements.chatInput.value = '';
        // Send message to other players (implement WebSocket logic)
    }
}

function usePowerUp(powerUp) {
    switch (powerUp) {
        case 'timeBoost':
            timeLeft += 10;
            elements.timerElement.textContent = timeLeft;
            break;
        case 'revealLetter':
            const revealIndex = Math.floor(Math.random() * currentWord.length);
            elements.scrambledWord.textContent = 
                scrambledWord.substring(0, revealIndex) + 
                currentWord[revealIndex] + 
                scrambledWord.substring(revealIndex + 1);
            break;
        case 'skipWord':
            newWord();
            break;
    }
    // Implement cooldown or limited uses for power-ups
}

// Event Listeners
elements.submitButton.addEventListener('click', checkGuess);
elements.newWordButton.addEventListener('click', newWord);
elements.hintButton.addEventListener('click', provideHint);
elements.quitButton.addEventListener('click', () => showScreen('mainMenu'));

buttons.singlePlayer.addEventListener('click', () => showScreen('gameModes'));
buttons.multiplayer.addEventListener('click', initMultiplayer);
buttons.classicMode.addEventListener('click', () => startGame('classic'));
buttons.timeAttack.addEventListener('click', () => startGame('timeAttack'));
buttons.endlessMode.addEventListener('click', () => startGame('endless'));
buttons.categoryMode.addEventListener('click', () => startGame('category'));
buttons.highScores.addEventListener('click', () => {
    displayHighScores();
    showScreen('highScores');
});
buttons.achievements.addEventListener('click', () => {
    displayAchievements();
    showScreen('achievements');
});
buttons.settings.addEventListener('click', () => showScreen('settings'));
buttons.back.addEventListener('click', () => showScreen('mainMenu'));
buttons.backToMenu.forEach(btn => btn.addEventListener('click', () => showScreen('mainMenu')));

elements.easyButton.addEventListener('click', () => setDifficulty('easy'));
elements.mediumButton.addEventListener('click', () => setDifficulty('medium'));
elements.hardButton.addEventListener('click', () => setDifficulty('hard'));
elements.soundOnButton.addEventListener('click', () => toggleSound(true));
elements.soundOffButton.addEventListener('click', () => toggleSound(false));
elements.lightThemeButton.addEventListener('click', () => toggleTheme('light'));
elements.darkThemeButton.addEventListener('click', () => toggleTheme('dark'));

elements.sendChatButton.addEventListener('click', sendChatMessage);
elements.startMultiplayerButton.addEventListener('click', () => {
    // Implement start multiplayer game logic
});
elements.leaveMultiplayerButton