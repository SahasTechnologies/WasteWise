import { neon } from '@neondatabase/serverless';

const connectionString =
	process.env.DATABASE_URL ||
	process.env.POSTGRES_URL ||
	import.meta.env.DATABASE_URL ||
	import.meta.env.POSTGRES_URL;
if (!connectionString) {
	throw new Error('Missing DATABASE_URL/POSTGRES_URL');
}
const sql = neon(connectionString);

async function ensureTable() {
	await sql`
		CREATE TABLE IF NOT EXISTS contact_submissions (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255),
			email VARCHAR(255),
			message TEXT,
			ip VARCHAR(255),
			submitted_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
}

export const prerender = false;

export async function POST(context) {
	try {
		const request = context?.request ?? context;
		if (!request || typeof request.json !== 'function') {
			throw new Error('Invalid request');
		}
		const body = await request.json();
		const { Name, Email, Message, 'User IP': ip, City, ISP, 'cf-turnstile-response': turnstileToken } = body;

		// 1. Verify Turnstile Token
		if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
			const cfData = new URLSearchParams();
			cfData.append('secret', process.env.TURNSTILE_SECRET_KEY);
			cfData.append('response', turnstileToken);

			try {
				const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: cfData.toString(),
				});
				const verifyJson = await verifyRes.json();
				if (!verifyJson.success) {
					return new Response(JSON.stringify({ ok: false, error: 'Invalid CAPTCHA' }), { status: 400 });
				}
			} catch (e) {
				console.error('Turnstile verification error:', e);
			}
		}

		// 2. Rate limiting: Check submissions from this IP in the last minute
		await ensureTable();
		
		const recentSubmissions = await sql`
			SELECT COUNT(*) as count
			FROM contact_submissions
			WHERE ip LIKE ${(String(ip || 'unknown') + '%')}
			AND submitted_at > NOW() - INTERVAL '1 minute'
		`;
		
		if (recentSubmissions[0]?.count >= 2) {
			return new Response(
				JSON.stringify({ ok: false, error: 'Rate limit exceeded. Please wait a minute before submitting again.' }), 
				{ status: 429 }
			);
		}

		// 3. Save to DB
		const fullIpDetails = `${String(ip || 'unknown')} - ${String(City || 'unknown')}, ${String(ISP || 'unknown')}`.slice(0, 255);

		await sql`
			INSERT INTO contact_submissions (name, email, message, ip)
			VALUES (
				${String(Name || '').slice(0, 255)}, 
				${String(Email || '').slice(0, 255)}, 
				${String(Message || '')}, 
				${fullIpDetails}
			)
		`;

		// 4. Try forwarding to FormSubmit and Submify
		const targetEmail = process.env.EMAIL;
		if (targetEmail) {
			const forwardPayload = { ...body, _captcha: "false" };
			console.log(`[submit-contact] Forwarding to target email: ${targetEmail}`);

			// Try FormSubmit
			try {
				console.log(`[submit-contact] Attempting FormSubmit forwarding to ${targetEmail}`);
				const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
					body: JSON.stringify(forwardPayload),
				});
				// FormSubmit returns HTML, not JSON - check status only
				console.log(`[submit-contact] FormSubmit response status: ${formSubmitRes.status} (${formSubmitRes.ok ? 'OK' : 'FAILED'})`);
			} catch (err) {
				console.error(`[submit-contact] FormSubmit forwarding failed:`, err);
			}

			// Try Submify
			try {
				console.log(`[submit-contact] Attempting Submify forwarding to ${targetEmail}`);
				const submifyRes = await fetch(`https://submify.vercel.app/${targetEmail}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
					},
					body: JSON.stringify(forwardPayload),
				});
				// Submify returns HTML, not JSON - check status only
				console.log(`[submit-contact] Submify response status: ${submifyRes.status} (${submifyRes.ok ? 'OK' : 'FAILED'})`);
			} catch (err) {
				console.error(`[submit-contact] Submify forwarding failed:`, err);
			}
		} else {
			console.log(`[submit-contact] No EMAIL env var set, skipping external forwarding`);
		}

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error('Contact DB error:', err);
		return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
	}
}
