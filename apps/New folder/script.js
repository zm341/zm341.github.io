// DOM Elements
const startScreen = document.getElementById('start-screen');
const triviaScreen = document.getElementById('trivia-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const answerButtonsElement = document.getElementById('answer-buttons');
const currentScoreElement = document.getElementById('current-score');
const finalScoreElement = document.getElementById('final-score');

// Game State Variables
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Fetch questions from JSON and Start Game
async function startGame() {
    try {
        // Fetch the JSON file
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error("Could not load questions.");
        
        let loadedQuestions = await response.json();
        
        // Shuffle the questions for variety
        questions = loadedQuestions.sort(() => Math.random() - 0.5);
        
        // Reset state
        currentQuestionIndex = 0;
        score = 0;
        updateScoreDisplay();
        
        // Switch screens
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        
        triviaScreen.classList.remove('hidden');
        triviaScreen.classList.add('active');
        
        setNextQuestion();
    } catch (error) {
        console.error("Error loading game data:", error);
        questionText.innerText = "ERROR: CONNECTION LOST. CHECK JSON FILE.";
    }
}

function setNextQuestion() {
    resetState();
    showQuestion(questions[currentQuestionIndex]);
}

function showQuestion(question) {
    questionText.innerText = question.question;
    
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('arcade-btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";
    
    // Disable all buttons to prevent multiple clicks
    Array.from(answerButtonsElement.children).forEach(button => {
        button.disabled = true;
        setStatusClass(button, button.dataset.correct === "true");
    });

    if (correct) {
        score += 100; // 100 points per correct answer
        updateScoreDisplay();
    }

    // Wait a brief moment before moving to the next question
    setTimeout(() => {
        if (questions.length > currentQuestionIndex + 1) {
            currentQuestionIndex++;
            setNextQuestion();
        } else {
            endGame();
        }
    }, 1500); // 1.5 second delay to see the result
}

function setStatusClass(element, correct) {
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function updateScoreDisplay() {
    // Pad the score with leading zeros to look like an arcade score (e.g., 00100)
    currentScoreElement.innerText = score.toString().padStart(5, '0');
}

function endGame() {
    triviaScreen.classList.add('hidden');
    triviaScreen.classList.remove('active');
    
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('active');
    
    finalScoreElement.innerText = score.toString().padStart(5, '0');
}