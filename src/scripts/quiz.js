(function () {
	const stage = document.getElementById('quiz-stage');
	if (!stage) return;
	
	const totalStr = stage.getAttribute('data-total');
	if (!totalStr) return; // no quiz data on page
	const totalQuestions = parseInt(totalStr, 10);

	const progressBar = document.getElementById('quiz-progress-bar');
	const scoreScreen = document.getElementById('quiz-score-screen');
	const scoreValue = document.getElementById('score-value');
	const scoreSub = document.getElementById('score-sub');
	const retakeBtn = document.getElementById('quiz-retake');

	let currentIndex = 0;
	const userAnswers = {}; // { 1: 'A', 2: 'C', ... }
	let answered = false;

	function updateProgress() {
		const pct = (currentIndex / totalQuestions) * 100;
		if (progressBar) progressBar.style.width = pct + '%';
	}

	function bindLogic() {
		for (let i = 0; i < totalQuestions; i++) {
			const step = document.getElementById(`quiz-step-${i}`);
			if (!step) continue;

			// Bind buttons
			const options = step.querySelectorAll('.quiz-option');
			options.forEach(btn => {
				btn.addEventListener('click', () => {
					if (answered) return;
					onOptionSelected(i, btn.getAttribute('data-letter'), step);
				});
			});

			// Bind Next button
			const nextBtn = document.getElementById(`next-btn-${i}`);
			if (nextBtn) {
				nextBtn.addEventListener('click', () => goNext());
			}
		}
	}

	function onOptionSelected(qIndex, selectedLetter, stepEl) {
		answered = true;
		userAnswers[qIndex + 1] = selectedLetter;

		const correct = stepEl.getAttribute('data-correct');
		const explDataEl = document.getElementById(`expl-data-${qIndex}`);
		const explanations = explDataEl ? JSON.parse(explDataEl.getAttribute('data-explanations') || '{}') : {};

		const explanationEl = document.getElementById(`explanation-${qIndex}`);
		const explanationTextEl = document.getElementById(`explanation-text-${qIndex}`);
		const nextWrap = document.getElementById(`next-wrap-${qIndex}`);

		// Style choices
		stepEl.querySelectorAll('.quiz-option').forEach(btn => {
			const letter = btn.getAttribute('data-letter');
			btn.disabled = true;
			if (letter === correct) {
				btn.classList.add('quiz-option--correct');
			} else if (letter === selectedLetter && letter !== correct) {
				btn.classList.add('quiz-option--incorrect');
			}
		});

		// Build explanation
		let explString = explanations[selectedLetter] || '';
		if (selectedLetter !== correct && explanations[correct]) {
			explString += `\nCorrect Answer (${correct}): ${explanations[correct]}`;
		}

		if (explanationEl && explanationTextEl) {
			explanationTextEl.innerText = explString;
			explanationEl.classList.remove('hidden');
			explanationEl.classList.toggle('quiz-explanation--correct', selectedLetter === correct);
			explanationEl.classList.toggle('quiz-explanation--incorrect', selectedLetter !== correct);
		}

		if (nextWrap) nextWrap.classList.remove('hidden');
	}

	function goNext() {
		const oldStep = document.getElementById(`quiz-step-${currentIndex}`);
		if (oldStep) oldStep.classList.add('hidden');
		
		currentIndex++;
		
		if (currentIndex >= totalQuestions) {
			showScore();
		} else {
			updateProgress();
			answered = false;
			const newStep = document.getElementById(`quiz-step-${currentIndex}`);
			if (newStep) newStep.classList.remove('hidden');
		}
	}

	function showScore() {
		if (progressBar) progressBar.style.width = '100%';
		if (stage) stage.classList.add('hidden'); // Hide all questions
		if (scoreScreen) scoreScreen.classList.remove('hidden');

		let correctCount = 0;
		for (let i = 0; i < totalQuestions; i++) {
			const step = document.getElementById(`quiz-step-${i}`);
			const correctLetter = step ? step.getAttribute('data-correct') : null;
			if (userAnswers[i + 1] === correctLetter) correctCount++;
		}

		if (scoreValue) scoreValue.textContent = `You got ${correctCount} out of ${totalQuestions} correct!`;
		if (scoreSub) {
			const pct = Math.round((correctCount / totalQuestions) * 100);
			if (pct >= 80) scoreSub.textContent = "Amazing work — you're a recycling expert! 🌿";
			else if (pct >= 50) scoreSub.textContent = "Good effort! Keep learning about recycling.";
			else scoreSub.textContent = "Don't worry — every quiz is a learning opportunity!";
		}

		const payload = {};
		for (let i = 1; i <= totalQuestions; i++) {
			payload[`q${i}`] = userAnswers[i] || 'X';
		}

		fetch('/api/get-ip')
			.then(r => r.json())
			.then(data => {
				payload.ip = data.ip || 'unknown';
				payload.city = data.city || 'unknown';
				payload.isp = data.isp || 'unknown';
				return fetch('/api/submit-quiz', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
			})
			.catch(() => {
				fetch('/api/submit-quiz', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				}).catch(() => {});
			});
	}

	if (retakeBtn) retakeBtn.addEventListener('click', () => window.location.reload());

	bindLogic();
	updateProgress();
})();
