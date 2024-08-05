const easyWords = ['cat', 'dog', 'sun', 'moon', 'tree', 'book', 'bird', 'fish', 'star', 'rain'];
const mediumWords = ['python', 'javascript', 'html', 'css', 'react', 'nodejs', 'database', 'algorithm'];
const hardWords = ['cryptocurrency', 'artificial', 'intelligence', 'blockchain', 'cybersecurity', 'quantum', 'nanotechnology'];

let words = mediumWords;
let currentWord = '';
let scrambledWord = '';
let score = 0;
let timeLeft = 60;
let timerInterval;

const scrambledWordElement = document.getElementById('scrambled-word');
const userInputElement = document.getElementById('user-input');
const submitButton = document.getElementById('submit-btn');
const messageElement = document.getElementById('message');
const newWordButton = document.getElementById('new-word-btn');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const easyButton = document.getElementById('easy-btn');
const mediumButton = document.getElementById('medium-btn');
const hardButton = document.getElementById('hard-btn');

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function scrambleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function newWord() {
    currentWord = getRandomWord();
    scrambledWord = scrambleWord(currentWord);
    scrambledWordElement.textContent = scrambledWord;
    userInputElement.value = '';
    messageElement.textContent = '';
}

function checkGuess() {
    const userGuess = userInputElement.value.toLowerCase();
    if (userGuess === currentWord) {
        messageElement.textContent = 'Correct! Well done!';
        messageElement.style.color = 'green';
        score += 10;
        scoreElement.textContent = score;
        newWord();
    } else {
        messageElement.textContent = 'Wrong. Try again!';
        messageElement.style.color = 'red';
    }
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerElement.textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            messageElement.textContent = 'Time\'s up! Game over.';
            messageElement.style.color = 'red';
            submitButton.disabled = true;
            newWordButton.disabled = true;
        }
    }, 1000);
}

function setDifficulty(difficulty) {
    words = difficulty;
    easyButton.classList.remove('active');
    mediumButton.classList.remove('active');
    hardButton.classList.remove('active');
    
    if (difficulty === easyWords) {
        easyButton.classList.add('active');
    } else if (difficulty === mediumWords) {
        mediumButton.classList.add('active');
    } else {
        hardButton.classList.add('active');
    }
    
    resetGame();
}

function resetGame() {
    score = 0;
    scoreElement.textContent = score;
    submitButton.disabled = false;
    newWordButton.disabled = false;
    startTimer();
    newWord();
}

submitButton.addEventListener('click', checkGuess);
newWordButton.addEventListener('click', newWord);
easyButton.addEventListener('click', () => setDifficulty(easyWords));
mediumButton.addEventListener('click', () => setDifficulty(mediumWords));
hardButton.addEventListener('click', () => setDifficulty(hardWords));

// Start the game
resetGame();