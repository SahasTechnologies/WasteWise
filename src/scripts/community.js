async function loadCommunityStats() {
    try {
        const res = await fetch('/api/get-community-stats');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const quizEl = document.getElementById('stat-quiz');
        const pollEl = document.getElementById('stat-poll');
        const contactEl = document.getElementById('stat-contact');
        const totalEl = document.getElementById('total-submissions');

        const quiz = data.quiz ?? 0;
        const poll = data.poll ?? 0;
        const contact = data.contact ?? 0;
        const total = quiz + poll + contact;

        if (quizEl) quizEl.textContent = String(quiz);
        if (pollEl) pollEl.textContent = String(poll);
        if (contactEl) contactEl.textContent = String(contact);
        if (totalEl) totalEl.textContent = String(total);
    } catch (_) {
        // On error, show 0
        const quizEl = document.getElementById('stat-quiz');
        const pollEl = document.getElementById('stat-poll');
        const contactEl = document.getElementById('stat-contact');
        const totalEl = document.getElementById('total-submissions');
        if (quizEl) quizEl.textContent = '0';
        if (pollEl) pollEl.textContent = '0';
        if (contactEl) contactEl.textContent = '0';
        if (totalEl) totalEl.textContent = '0';
    }
}

async function loadQuizChart() {
    const container = document.getElementById('chart-bars-container');
    if (!container) return;

    try {
        const res = await fetch('/api/get-quiz-stats');
        if (!res.ok) throw new Error('Failed to fetch');
        const stats = await res.json();
        
        const scoreCounts = [];
        for (let i = 1; i <= 10; i++) {
            scoreCounts.push({ score: i, count: parseInt(stats['score_' + i] || 0) });
        }
        
        const total = scoreCounts.reduce((sum, item) => sum + item.count, 0);
        
        // Build the chart HTML
        let chartHTML = '';
        if (total > 0) {
            const maxCount = Math.max(...scoreCounts.map(s => s.count));
            scoreCounts.forEach(item => {
                const height = (item.count / maxCount) * 100;
                chartHTML += `
                    <div class="chart-bar-group">
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" style="height: ${height}%"></div>
                        </div>
                        <span class="chart-label">${item.score}/10</span>
                        <span class="chart-count">${item.count}</span>
                    </div>
                `;
            });
        } else {
            // Show empty chart
            for (let i = 1; i <= 10; i++) {
                chartHTML += `
                    <div class="chart-bar-group">
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" style="height: 0%"></div>
                        </div>
                        <span class="chart-label">${i}/10</span>
                        <span class="chart-count">0</span>
                    </div>
                `;
            }
        }
        
        container.innerHTML = chartHTML;
    } catch (_) {
        // On error, show empty chart
        let chartHTML = '';
        for (let i = 1; i <= 10; i++) {
            chartHTML += `
                <div class="chart-bar-group">
                    <div class="chart-bar-wrapper">
                        <div class="chart-bar" style="height: 0%"></div>
                    </div>
                    <span class="chart-label">${i}/10</span>
                    <span class="chart-count">0</span>
                </div>
            `;
        }
        container.innerHTML = chartHTML;
    }
}

loadCommunityStats();
loadQuizChart();

document.addEventListener('astro:after-swap', () => {
    loadCommunityStats();
    loadQuizChart();
});
