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
	const shuffledOptions = {}; // Store the shuffled order for each question
	let answered = false;
	let cachedStats = null; // Cache the stats fetched at start

	// Fetch stats at the beginning
	async function prefetchStats() {
		try {
			const response = await fetch('/api/get-quiz-stats');
			cachedStats = await response.json();
		} catch (err) {
			console.error('Failed to prefetch stats:', err);
			cachedStats = null;
		}
	}

	// Fisher-Yates shuffle algorithm
	function shuffleArray(array) {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Shuffle options for each question
	function shuffleQuestionOptions() {
		for (let i = 0; i < totalQuestions; i++) {
			const optionsContainer = document.getElementById(`quiz-options-${i}`);
			if (!optionsContainer) continue;

			const buttons = Array.from(optionsContainer.querySelectorAll('.quiz-option'));
			const optionsData = buttons.map(btn => ({
				letter: btn.getAttribute('data-letter'),
				text: btn.getAttribute('data-text') || btn.querySelector('.quiz-option-text').textContent
			}));

			// Shuffle the options
			const shuffled = shuffleArray(optionsData);
			shuffledOptions[i] = shuffled;

			// Re-render the buttons in shuffled order
			optionsContainer.innerHTML = '';
			shuffled.forEach((opt, idx) => {
				const newLabel = String.fromCharCode(65 + idx); // A, B, C, D
				const button = document.createElement('button');
				button.className = `quiz-option option-btn-${i}`;
				button.setAttribute('data-letter', opt.letter); // Keep original letter for answer checking
				button.setAttribute('data-display-letter', newLabel); // Display letter
				button.setAttribute('role', 'listitem');
				button.setAttribute('aria-label', `Option ${newLabel}: ${opt.text}`);
				
				button.innerHTML = `
					<span class="quiz-option-label">${newLabel}</span>
					<span class="quiz-option-text">${opt.text}</span>
				`;
				
				optionsContainer.appendChild(button);
			});
		}
	}

	function updateProgress() {
		const pct = (currentIndex / totalQuestions) * 100;
		if (progressBar) progressBar.style.width = pct + '%';
	}

	function bindLogic() {
		for (let i = 0; i < totalQuestions; i++) {
			const step = document.getElementById(`quiz-step-${i}`);
			if (!step) continue;

			// Bind buttons (need to rebind after shuffle)
			const optionsContainer = document.getElementById(`quiz-options-${i}`);
			if (optionsContainer) {
				optionsContainer.addEventListener('click', (e) => {
					const btn = e.target.closest('.quiz-option');
					if (!btn || answered) return;
					onOptionSelected(i, btn.getAttribute('data-letter'), btn.getAttribute('data-display-letter'), step);
				});
			}

			// Bind Next button
			const nextBtn = document.getElementById(`next-btn-${i}`);
			if (nextBtn) {
				nextBtn.addEventListener('click', () => goNext());
			}
		}
	}

	function onOptionSelected(qIndex, originalLetter, displayLetter, stepEl) {
		answered = true;
		userAnswers[qIndex + 1] = originalLetter;

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
			} else if (letter === originalLetter && letter !== correct) {
				btn.classList.add('quiz-option--incorrect');
			}
		});

		// Build explanation
		let explString = explanations[originalLetter] || '';
		if (originalLetter !== correct && explanations[correct]) {
			explString += `\n\nCorrect Answer: ${explanations[correct]}`;
		}

		if (explanationEl && explanationTextEl) {
			explanationTextEl.innerText = explString;
			explanationEl.classList.remove('hidden');
			explanationEl.classList.toggle('quiz-explanation--correct', originalLetter === correct);
			explanationEl.classList.toggle('quiz-explanation--incorrect', originalLetter !== correct);
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
				// Show green star for other scores
				if (starIcon) {
					starIcon.classList.remove('hidden');
					starIcon.style.color = '#22c55e';
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

		// Use cached stats and add user's score
		const stats = cachedStats || {};
		
		// Create array for scores 1-10
		const scoreCounts = [];
		for (let i = 1; i <= 10; i++) {
			let count = parseInt(stats[`score_${i}`] || 0);
			// Add 1 to the user's score to include their current result
			if (i === correctCount) {
				count += 1;
			}
			scoreCounts.push({ score: i, count: count });
		}
		
		const total = scoreCounts.reduce((sum, item) => sum + item.count, 0);
		
		if (total > 0) {
			const maxCount = Math.max(...scoreCounts.map(s => s.count));
			
			scoreCounts.forEach(item => {
				const barEl = document.getElementById(`bar-${item.score}`);
				const countEl = document.getElementById(`count-${item.score}`);
				
				if (barEl && countEl) {
					const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
					barEl.style.height = height + '%';
					countEl.textContent = item.count;
					
					// Highlight the user's score
					if (item.score === correctCount) {
						barEl.classList.add('user-score-bar');
						const barGroup = barEl.closest('.chart-bar-group');
						if (barGroup) {
							barGroup.classList.add('user-score-group');
						}
					}
				}
			});
		} else {
			// If no stats available, just show user's score
			const barEl = document.getElementById(`bar-${correctCount}`);
			const countEl = document.getElementById(`count-${correctCount}`);
			if (barEl && countEl) {
				barEl.style.height = '100%';
				countEl.textContent = '1';
				barEl.classList.add('user-score-bar');
				const barGroup = barEl.closest('.chart-bar-group');
				if (barGroup) {
					barGroup.classList.add('user-score-group');
				}
			}
		}

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

	// Initialize: prefetch stats, shuffle options, then bind logic
	prefetchStats().then(() => {
		shuffleQuestionOptions();
		bindLogic();
		updateProgress();
		
		// Only add ready class once, after a small delay to ensure DOM is settled
		setTimeout(() => {
			if (stage) stage.classList.add('ready');
		}, 50);
	});
})();
