const words = ['javascript', 'html', 'css', 'python', 'react', 'nodejs', 'database', 'algorithm'];
let currentWord = '';
let scrambledWord = '';

const scrambledWordElement = document.getElementById('scrambled-word');
const userInputElement = document.getElementById('user-input');
const submitButton = document.getElementById('submit-btn');
const messageElement = document.getElementById('message');
const newWordButton = document.getElementById('new-word-btn');

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
    } else {
        messageElement.textContent = 'Wrong. Try again!';
        messageElement.style.color = 'red';
    }
}

submitButton.addEventListener('click', checkGuess);
newWordButton.addEventListener('click', newWord);

// Start the game with a new word
newWord();