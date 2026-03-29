import { sql } from '@vercel/postgres';

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

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { Name, Email, Message, 'User IP': ip, City, ISP } = body;

		const fullIpDetails = `${String(ip || 'unknown')} - ${String(City || 'unknown')}, ${String(ISP || 'unknown')}`.slice(0, 255);

		await ensureTable();

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
