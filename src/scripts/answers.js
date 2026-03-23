import answersData from '../data/answers.json';

function normalise(s) {
	return String(s ?? '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.replace(/\u00A0/g, ' ')
		.replace(/[""]/g, '"')
		.replace(/['']/g, "'");
}

function findSelectedKey(qData, userAnswer) {
	if (!userAnswer) return null;
	const nUser = normalise(userAnswer).replace(/[;,.]/g, '');

	for (const [key, value] of Object.entries(qData.options)) {
		const nv = normalise(value).replace(/[;,.]/g, '');
		if (nv === nUser) return key;
	}
	return null;
}

function renderResults() {
	const params = new URLSearchParams(window.location.search);
	const scoreEl = document.getElementById('score-display');
	const questionsContainer = document.getElementById('questions-container');
	if (!questionsContainer) return;

	let correctCount = 0;
	let answeredCount = 0;

	for (let i = 1; i <= 10; i++) {
		const userAnswer = params.get(String(i));
		const qData = answersData[i - 1];
		if (!qData) continue;

		const selectedKey = findSelectedKey(qData, userAnswer);
		const isAnswered = Boolean(selectedKey);
		if (isAnswered) answeredCount++;
		if (selectedKey && selectedKey === qData.correctAnswer) correctCount++;

		const questionBlock = questionsContainer.querySelector(`[data-question-id="${i}"]`);
		if (!questionBlock) continue;

		const options = questionBlock.querySelectorAll('.option');
		options.forEach(option => {
			const letter = option.getAttribute('data-letter');
			const isSelected = selectedKey === letter;
			const isCorrect = letter === qData.correctAnswer;
			const explanation = option.querySelector('.explanation');
			const statusContainer = option.querySelector('.option-status-container');

			if (isSelected && isCorrect) {
				option.classList.add('correct');
			} else if (isSelected && !isCorrect) {
				option.classList.add('incorrect');
			} else if (!isSelected && isCorrect) {
				option.classList.add('correct-answer');
			}

			if ((isSelected || (selectedKey && isCorrect)) && explanation) {
				explanation.classList.remove('explanation-hidden');
			}

			if (isSelected && statusContainer) {
				const status = document.createElement('div');
				status.className = 'option-status';
				status.textContent = isCorrect ? 'Correct' : 'Incorrect';
				statusContainer.appendChild(status);
			}
		});
	}

	if (scoreEl) {
		if (answeredCount === 0) {
			scoreEl.textContent = 'You got 0/10 correct!';
		} else {
			scoreEl.textContent = `You got ${correctCount}/10 correct!`;
		}
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', renderResults);
} else {
	renderResults();
}