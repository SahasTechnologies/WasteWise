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
		const payload = {};
		
		for (let i = 0; i < totalQuestions; i++) {
			const step = document.getElementById(`quiz-step-${i}`);
			const correctLetter = step ? step.getAttribute('data-correct') : null;
			const isCorrect = userAnswers[i + 1] === correctLetter ? 1 : 0;
			correctCount += isCorrect;
			payload[`q${i + 1}`] = isCorrect;
		}
		
		payload.score = correctCount;

		// Update score icon based on performance
		const scoreIcon = document.getElementById('score-icon');
		const pct = Math.round((correctCount / totalQuestions) * 100);
		
		if (scoreIcon) {
			const trophyIcon = scoreIcon.querySelector('.icon-trophy');
			const starIcon = scoreIcon.querySelector('.icon-star');
			
			if (pct >= 80) {
				// Show trophy for high scores
				if (trophyIcon) {
					trophyIcon.classList.remove('hidden');
					trophyIcon.style.color = '#22c55e';
				}
				if (starIcon) starIcon.classList.add('hidden');
			} else {
				// Show star for other scores
				if (starIcon) {
					starIcon.classList.remove('hidden');
					starIcon.style.color = pct >= 50 ? '#3b82f6' : '#f59e0b';
				}
				if (trophyIcon) trophyIcon.classList.add('hidden');
			}
		}

		if (scoreValue) scoreValue.textContent = `You got ${correctCount} out of ${totalQuestions} correct!`;
		if (scoreSub) {
			if (pct >= 80) scoreSub.textContent = "Amazing work — you're a recycling expert!";
			else if (pct >= 50) scoreSub.textContent = "Good effort! Keep learning about recycling.";
			else scoreSub.textContent = "Don't worry — every quiz is a learning opportunity!";
		}

		// Fetch and display statistics
		fetch('/api/get-quiz-stats')
			.then(r => r.json())
			.then(stats => {
				const total = parseInt(stats.range_0_10) + parseInt(stats.range_10_40) + 
							  parseInt(stats.range_40_70) + parseInt(stats.range_70_99) + 
							  parseInt(stats.range_100);
				
				if (total > 0) {
					const ranges = [
						{ id: '0-10', count: parseInt(stats.range_0_10) },
						{ id: '10-40', count: parseInt(stats.range_10_40) },
						{ id: '40-70', count: parseInt(stats.range_40_70) },
						{ id: '70-99', count: parseInt(stats.range_70_99) },
						{ id: '100', count: parseInt(stats.range_100) }
					];
					
					const maxCount = Math.max(...ranges.map(r => r.count));
					
					ranges.forEach(range => {
						const barEl = document.getElementById(`bar-${range.id}`);
						const countEl = document.getElementById(`count-${range.id}`);
						
						if (barEl && countEl) {
							const height = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
							barEl.style.height = height + '%';
							countEl.textContent = range.count;
						}
					});
				}
			})
			.catch(err => console.error('Failed to fetch stats:', err));

		// Submit quiz results
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
