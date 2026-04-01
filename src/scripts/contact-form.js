// Contact form logic: IP fetching, email popup, profanity check, form submission

// Fetch visitor's IP and Geo info via our API and populate hidden fields
fetch('/api/get-ip')
	.then(r => r.json())
	.then(data => {
		const ipField = document.getElementById('user-ip-field');
		const cityField = document.getElementById('user-city-field');
		const ispField = document.getElementById('user-isp-field');
		
		if (ipField) ipField.value = data.ip || 'unknown';
		if (cityField) cityField.value = data.city || 'unknown';
		if (ispField) ispField.value = data.isp || 'unknown';
	})
	.catch(() => {});

const form = document.querySelector('.contact-form');
const formView = document.getElementById('form-view');
const successView = document.getElementById('success-view');

// Handle URL parameter for success view
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('finished') === 'true') {
	if (formView && successView) {
		formView.classList.add('hidden');
		successView.classList.remove('hidden');
	}
}

// ── Email popup logic ──────────────────────────────────────────────────────
const overlay = document.getElementById('email-popup-overlay');
const openBtn = document.getElementById('open-email-popup');
const closeBtn = document.getElementById('close-email-popup');
const emailReveal = document.getElementById('email-reveal');

openBtn?.addEventListener('click', () => {
	overlay?.classList.remove('hidden');
});

closeBtn?.addEventListener('click', () => {
	overlay?.classList.add('hidden');
});

overlay?.addEventListener('click', (e) => {
	if (e.target === overlay) overlay.classList.add('hidden');
});

// Called by Turnstile widget in the popup on success
window.onEmailTurnstileSuccess = async (token) => {
	try {
		const response = await fetch('/api/get-contact-email', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 'cf-turnstile-response': token }),
		});
		const data = await response.json();
		
		if (data.ok && data.email) {
			const emailLink = document.getElementById('email-reveal-address');
			if (emailLink) {
				emailLink.href = `mailto:${data.email}`;
				emailLink.textContent = data.email;
			}
			emailReveal?.classList.remove('hidden');
		} else {
			alert('Failed to verify. Please try again.');
		}
	} catch (err) {
		alert('Failed to load email. Please try again.');
	}
};

// ── Contact form submit ────────────────────────────────────────────────────
if (form) {
	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());
		
		// Must complete CAPTCHA before submitting
		const turnstileToken = payload['cf-turnstile-response'];
		if (!turnstileToken) {
			alert('Please complete the security check.');
			return;
		}
		
		const btn = form.querySelector('.contact-submit');
		if (btn) btn.textContent = 'Checking…';

		// Remove any existing profanity notice
		document.getElementById('profanity-notice')?.remove();

		// ── Client-side profanity check ─────────────────────────────────────
		try {
			const message = (payload['Message'] || '').trim();
			const name = (payload['Name'] || '').trim();
			const combined = `${name} ${message}`;

			const profRes = await fetch('https://profanity-api.xeven.workers.dev', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: combined }),
			});

			const profData = await profRes.json();

			if (profData.detectedProfaneWords?.length > 0) {
				// Show friendly notice instead of blocking
				const notice = document.createElement('div');
				notice.id = 'profanity-notice';
				notice.className = 'profanity-notice';
				notice.innerHTML = `
					Your message contains language that may be inappropriate. 
					If you'd prefer, you can reach us by clicking "See email address" above.
				`;
				const submitBtn = form.querySelector('.contact-submit');
				submitBtn?.parentNode?.insertBefore(notice, submitBtn);

				if (btn) btn.textContent = 'Send Message';
				// Reset turnstile so they can re-verify if they want to proceed
				if (window.turnstile) {
					window.turnstile.reset();
				}
				return;
			}
		} catch (_err) {
			// Profanity check failed silently — don't block submission
		}

		if (btn) btn.textContent = 'Sending…';

		try {
			const response = await fetch('/api/submit-contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			if (result.ok) {
				if (formView && successView) {
					formView.classList.add('hidden');
					successView.classList.remove('hidden');
				}
			} else {
				if (btn) btn.textContent = 'Error - Try Again';
				alert(result.error || 'Submission failed');
			}
		} catch (err) {
			if (btn) btn.textContent = 'Error - Try Again';
		}
	});
}
