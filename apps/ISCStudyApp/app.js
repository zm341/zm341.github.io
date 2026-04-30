// --- State Variables ---
let questionsData = [];
let currentQuestionIndex = 0;
let selectedOptionIndex = null;

// --- DOM Elements ---
const questionMeta = document.getElementById('question-meta');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const feedbackArea = document.getElementById('feedback-area');
const feedbackStatus = document.getElementById('feedback-status');
const feedbackText = document.getElementById('feedback-text');
const streakCount = document.getElementById('streak-count');
const scoreCount = document.getElementById('score-count');

// --- Matrix Rain Background ---
function initializeMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    // Characters for the rain
    const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    // Initialize drops
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        // Black BG with opacity to show trailing effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0'; // Neon green text
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Randomly reset drops to the top
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 33);
    
    // Handle resizing
    window.addEventListener('resize', () => {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    });
}

// --- Gamification Logic ---
function initGamification() {
    // Load score
    let score = localStorage.getItem('matrix_score') || 0;
    scoreCount.innerText = score;

    // Load and calculate streak
    let lastLogin = localStorage.getItem('matrix_last_login');
    let streak = parseInt(localStorage.getItem('matrix_streak')) || 0;
    const today = new Date().toDateString();

    if (lastLogin !== today) {
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === yesterday.toDateString()) {
            streak++; // Logged in yesterday, increment
        } else if (lastLogin) {
            streak = 1; // Missed a day, reset streak
        } else {
            streak = 1; // First time login ever
        }
        
        localStorage.setItem('matrix_streak', streak);
        localStorage.setItem('matrix_last_login', today);
    }
    streakCount.innerText = streak;
}

function updateScore() {
    let score = parseInt(localStorage.getItem('matrix_score')) || 0;
    score += 10; // 10 XP per correct answer
    localStorage.setItem('matrix_score', score);
    scoreCount.innerText = score;
}

function triggerGlitch() {
    // Uses canvas-confetti library loaded in index.html
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#003300', '#000000'],
        shapes: ['square']
    });
}

// --- Quiz Logic ---
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Network response was not ok');
        questionsData = await response.json();
        renderQuestion();
    } catch (error) {
        questionText.innerText = "CRITICAL ERROR: Failed to load data construct. (Are you running this on a local web server?)";
        console.error("Fetch error:", error);
    }
}

function renderQuestion() {
    const q = questionsData[currentQuestionIndex];
    questionMeta.innerText = `> ${q.contentArea} | Level: ${q.skillLevel} | Program ${currentQuestionIndex + 1}/${questionsData.length}`;
    questionText.innerText = q.questionText;
    
    // Reset UI
    optionsContainer.innerHTML = '';
    feedbackArea.style.display = 'none';
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    selectedOptionIndex = null;

    // Generate option buttons
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = `> ${option}`;
        btn.onclick = () => selectOption(index, btn);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(index, btnElement) {
    // Deselect all others
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Select clicked
    btnElement.classList.add('selected');
    selectedOptionIndex = index;
    submitBtn.style.display = 'block'; // Reveal execute button
}

function checkAnswer() {
    const q = questionsData[currentQuestionIndex];
    const buttons = document.querySelectorAll('.option-btn');
    const selectedBtn = buttons[selectedOptionIndex];

    submitBtn.style.display = 'none'; // Hide execute button
    
    // Disable all buttons so user can't change answer
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });

    // Check if correct
    if (selectedOptionIndex === q.correctAnswerIndex) {
        selectedBtn.classList.add('correct');
        feedbackStatus.innerText = "ACCESS GRANTED. +10 XP";
        feedbackStatus.className = "status-correct";
        updateScore();
    } else {
        selectedBtn.classList.add('incorrect');
        buttons[q.correctAnswerIndex].classList.add('correct'); // Highlight the actual correct answer
        feedbackStatus.innerText = "ANOMALY DETECTED. INCORRECT.";
        feedbackStatus.className = "status-incorrect";
    }

    // Show rationale
    feedbackText.innerText = q.explanation;
    feedbackArea.style.display = 'block';
    nextBtn.style.display = 'block'; // Reveal next program button
}

function nextProgram() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsData.length) {
        renderQuestion();
    } else {
        // End of the questions
        questionMeta.innerText = "> SESSION COMPLETE";
        questionText.innerText = "Construct upload finished. You are ready to face the Agents.";
        optionsContainer.innerHTML = '';
        feedbackArea.style.display = 'none';
        nextBtn.style.display = 'none';
        triggerGlitch(); // Confetti time!
    }
}

// --- Event Listeners & Initialization ---
submitBtn.addEventListener('click', checkAnswer);
nextBtn.addEventListener('click', nextProgram);

// Boot up sequence
window.onload = function() {
    initializeMatrixRain();
    initGamification();
    loadQuestions();
};