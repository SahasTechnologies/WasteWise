document.addEventListener("DOMContentLoaded", () => {
    const searchParams = new URLSearchParams(window.location.search);

    let answeredQuestionsCount = 0;
    for (let i = 1; i <= 10; i++) {
        if (searchParams.has(i.toString())) {
            answeredQuestionsCount++;
        }
    }

    if (answeredQuestionsCount < 10 && !window.location.href.includes('localhost') && !document.body.hasAttribute('data-dev-override')) {
        // make sure no cheater chitting
        window.location.href = '/quiz';
        return;
    }

    const container = document.getElementById("questions-container");
    if (!container) return;

    const answersData = JSON.parse(container.getAttribute("data-answers") || "[]");

    let score = 0;

    // loops
    const questionBlocks = document.querySelectorAll(".question-block");

    questionBlocks.forEach(block => {
        const qIdStr = block.getAttribute("data-question-id");
        if (!qIdStr) return;
        const qId = parseInt(qIdStr, 10);

        const questionData = answersData.find(q => q.id === qId);
        if (!questionData) return;

        const rawParamValue = searchParams.get(qIdStr);
        let userAnswerLetter = null;

        if (rawParamValue) {
            const cleanValue = rawParamValue.trim().toLowerCase();

            // Parse
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

    // update
    const scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay) {
        scoreDisplay.innerHTML = `You scored <strong>${score}</strong> out of <strong>${answersData.length}</strong>! ${score > 7 ? '🎉 Great job!' : 'Keep learning and try again!'}`;
    }
});