function setPollStatus(msg) {
    const el = document.getElementById('poll-status');
    if (el) el.textContent = msg || '';
}

function hasVotedOnDevice() {
    return localStorage.getItem('form') === 'true';
}

function markVotedOnDevice() {
    localStorage.setItem('form', 'true');
}

async function loadPollResults() {
    if (!hasVotedOnDevice()) return;

    try {
        const res = await fetch('/api/submit-poll');
        if (!res.ok) return;
        const data = await res.json();

        const resultsWrap = document.getElementById('poll-results');
        const totalEl = document.getElementById('poll-total');
        const barsEl = document.getElementById('poll-bars');
        const form = document.getElementById('poll-form');

        if (!resultsWrap || !totalEl || !barsEl) return;

        const total = Number(data.total || 0);
        totalEl.textContent = `Total votes: ${total}`;

        barsEl.innerHTML = '';
        (data.results || []).forEach((r) => {
            const row = document.createElement('div');
            row.className = 'poll-bar-row';
            row.innerHTML = `
                <div class="poll-bar-label">${r.barrier}</div>
                <div class="poll-bar-track">
                    <div class="poll-bar-fill" style="width:${r.percentage || 0}%"></div>
                </div>
                <div class="poll-bar-meta">${r.count} (${r.percentage || 0}%)</div>
            `;
            barsEl.appendChild(row);
        });

        resultsWrap.classList.remove('hidden');

        // Hide form if already voted
        if (hasVotedOnDevice() && form) {
            form.style.display = 'none';
            setPollStatus('You have already voted on this device.');
        }
    } catch (_) {}
}

function bindPoll() {
    const form = document.getElementById('poll-form');
    if (!form) return;

    // Check if already voted and hide form
    if (hasVotedOnDevice()) {
        form.style.display = 'none';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setPollStatus('');

        if (hasVotedOnDevice()) {
            setPollStatus('You have already voted on this device.');
            return;
        }

        const fd = new FormData(form);
        const barrier = fd.get('barrier');
        if (!barrier) {
            setPollStatus('Please select an option.');
            return;
        }

        try {
            setPollStatus('Submitting...');
            let ipdata = { ip: 'unknown', city: 'unknown', isp: 'unknown' };
            try {
                const ipres = await fetch('/api/get-ip');
                if (ipres.ok) ipdata = await ipres.json();
            } catch (_) {}

            const res = await fetch('/api/submit-poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    barrier: String(barrier),
                    ip: ipdata.ip,
                    city: ipdata.city,
                    isp: ipdata.isp
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.ok === false) {
                setPollStatus(data.error || 'Failed to submit.');
                return;
            }

            // Mark as voted on this device
            markVotedOnDevice();

            setPollStatus('Thanks! Loading results...');
            await loadPollResults();
            setPollStatus('Vote recorded.');
        } catch (_) {
            setPollStatus('Failed to submit.');
        }
    });
}

loadPollResults();
bindPoll();

document.addEventListener('astro:after-swap', () => {
    loadPollResults();
    bindPoll();
});
