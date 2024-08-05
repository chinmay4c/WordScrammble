const easyWords = ['cat', 'dog', 'sun', 'moon', 'tree', 'book', 'bird', 'fish', 'star', 'rain'];
const mediumWords = ['python', 'javascript', 'html', 'css', 'react', 'nodejs', 'database', 'algorithm'];
const hardWords = ['cryptocurrency', 'artificial', 'intelligence', 'blockchain', 'cybersecurity', 'quantum', 'nanotechnology'];

let words = mediumWords;
let currentWord = '';
let scrambledWord = '';
let score = 0;
let timeLeft = 60;
let timerInterval;
let level = 1;
let gameMode = 'classic';
let soundEnabled = true;

const screens = {
    mainMenu: document.getElementById('main-menu'),
    game: document.getElementById('game-screen'),
    highScores: document.getElementById('high-scores-screen'),
    achievements: document.getElementById('achievements-screen'),
    settings: document.getElementById('settings-screen')
};

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
    soundOffButton: document.getElementById('sound-off-btn')
};

const buttons = {
    classicMode: document.getElementById('classic-mode-btn'),
    timeAttack: document.getElementById('time-attack-btn'),
    endlessMode: document.getElementById('endless-mode-btn'),
    highScores: document.getElementById('high-scores-btn'),
    achievements: document.getElementById('achievements-btn'),
    settings: document.getElementById('settings-btn'),
    backToMenu: document.querySelectorAll('#back-to-menu-btn')
};

const achievements = [
    { id: 'first_word', name: 'First Word', description: 'Guess your first word correctly', unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Guess 5 words in under 30 seconds', unlocked: false },
    { id: 'word_master', name: 'Word Master', description: 'Reach level 10 in Classic Mode', unlocked: false },
    { id: 'time_lord', name: 'Time Lord', description: 'Score 100 points in Time Attack Mode', unlocked: false },
    { id: 'endless_warrior', name: 'Endless Warrior', description: 'Guess 50 words in Endless Mode', unlocked: false }
];

let highScores = {
    classic: [],
    timeAttack: [],
    endless: []
};

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
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
}

function checkGuess() {
    const userGuess = elements.userInput.value.toLowerCase();
    if (userGuess === currentWord) {
        elements.message.textContent = 'Correct! Well done!';
        elements.message.style.color = 'green';
        score += 10;
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
    words = difficulty;
    elements.easyButton.classList.remove('active');
    elements.mediumButton.classList.remove('active');
    elements.hardButton.classList.remove('active');
    
    if (difficulty === easyWords) {
        elements.easyButton.classList.add('active');
    } else if (difficulty === mediumWords) {
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