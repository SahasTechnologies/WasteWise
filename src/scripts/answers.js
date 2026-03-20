document.addEventListener("DOMContentLoaded", () => {
    const searchParams = new URLSearchParams(window.location.search);

    // Validate we have 10 answers (keys 1 through 10)
    let answeredQuestionsCount = 0;
    for (let i = 1; i <= 10; i++) {
        if (searchParams.has(i.toString())) {
            answeredQuestionsCount++;
        }
    }

    // If not all 10 are answered, they either cheated or refreshed without data. Redirecting.
    if (answeredQuestionsCount < 10 && !window.location.href.includes('localhost') && !document.body.hasAttribute('data-dev-override')) {
        // Enforcing 10 params. We'll redirect if they don't have all of them.
        window.location.href = '/quiz';
        return;
    }

    const container = document.getElementById("questions-container");
    if (!container) return;

    const answersData = JSON.parse(container.getAttribute("data-answers") || "[]");

    let score = 0;

    // Loop over the questions in the DOM
    const questionBlocks = document.querySelectorAll(".question-block");

    questionBlocks.forEach(block => {
        const qIdStr = block.getAttribute("data-question-id");
        if (!qIdStr) return;
        const qId = parseInt(qIdStr, 10);

        const questionData = answersData.find(q => q.id === qId);
        if (!questionData) return;

        // Determine user answer
        const rawParamValue = searchParams.get(qIdStr);
        let userAnswerLetter = null;

        if (rawParamValue) {
            const cleanValue = rawParamValue.trim().toLowerCase();

            // Parse which letter they chose
            for (const [optLetter, optText] of Object.entries(questionData.options)) {
                if (cleanValue === optLetter.toLowerCase() || cleanValue === optText.trim().toLowerCase()) {
                    userAnswerLetter = optLetter;
                    break;
                }
            }
        }

        const isCorrectAnswer = userAnswerLetter === questionData.correctAnswer;
        if (isCorrectAnswer) score++;

        const options = block.querySelectorAll(".option");
        options.forEach(optionEl => {
            const optLetter = optionEl.getAttribute("data-letter");
            const isUserChoice = userAnswerLetter === optLetter;
            const isCorrectChoice = questionData.correctAnswer === optLetter;

            const statusContainer = optionEl.querySelector(".option-status-container");
            const explanation = optionEl.querySelector(".explanation");

            if (isUserChoice && isCorrectChoice) {
                optionEl.classList.add("correct");
                statusContainer.innerHTML = '<div class="option-status">Correct</div>';
                explanation.style.display = 'block';
            } else if (isUserChoice && !isCorrectChoice) {
                optionEl.classList.add("incorrect");
                statusContainer.innerHTML = '<div class="option-status">Incorrect</div>';
                explanation.style.display = 'block';
            } else if (!isUserChoice && isCorrectChoice) {
                optionEl.classList.add("correct-answer");
                statusContainer.innerHTML = '<div class="option-status">Correct Answer</div>';
                explanation.style.display = 'block';
            }
        });
    });

    // Update score display
    const scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay) {
        scoreDisplay.innerHTML = `You scored <strong>${score}</strong> out of <strong>${answersData.length}</strong>! ${score > 7 ? '🎉 Great job!' : 'Keep learning and try again!'}`;
    }
});