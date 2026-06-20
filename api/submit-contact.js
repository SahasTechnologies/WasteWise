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

		// NOTE on Turnstile: tokens are single-use. When FormTorch is configured
		// we let FormTorch's TorchWarden be the sole verifier (it consumes the
		// token). We only run our own siteverify as a fallback when FormTorch is
		// not set, so the token is never verified twice.
		const formTorchEndpoint = process.env.FORMTORCH_ENDPOINT || 'https://formtorch.com/f/3t8uk4rg4m';
		const usingFormTorch = !!formTorchEndpoint;

		// 1. CAPTCHA gate
		if (usingFormTorch) {
			// FormTorch enforces TorchWarden+Turnstile server-side. Forward the
			// fresh token to it now; if it rejects the CAPTCHA we abort here.
			if (!turnstileToken) {
				return new Response(JSON.stringify({ ok: false, error: 'Missing CAPTCHA token' }), { status: 400 });
			}
			const forwardPayload = {
				Name: String(Name || ''),
				Email: String(Email || ''),
				Message: String(Message || ''),
				_subject: 'New WasteWise Contact Form Message',
				'cf-turnstile-response': turnstileToken,
			};
			console.log(`[submit-contact] Forwarding to FormTorch: ${formTorchEndpoint}`);
			const formTorchRes = await fetch(formTorchEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				body: JSON.stringify(forwardPayload),
			});
			console.log(`[submit-contact] FormTorch response status: ${formTorchRes.status} (${formTorchRes.ok ? 'OK' : 'FAILED'})`);
			if (!formTorchRes.ok) {
				const errText = await formTorchRes.text();
				console.error(`[submit-contact] FormTorch error body:`, errText.slice(0, 300));
				// CAPTCHA failure is the one case we surface to the user
				if (errText.includes('CAPTCHA')) {
					return new Response(JSON.stringify({ ok: false, error: 'Invalid CAPTCHA, please try again.' }), { status: 400 });
				}
			}
		} else if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
			// Fallback: verify the token ourselves when FormTorch isn't in use.
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

		// 3. Save to DB (always keep our own record)
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

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error('Contact DB error:', err);
		return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
	}
}
