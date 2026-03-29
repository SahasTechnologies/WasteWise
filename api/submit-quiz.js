import { neon } from '@neondatabase/serverless';

const connectionString = import.meta.env.DATABASE_URL || import.meta.env.POSTGRES_URL;
if (!connectionString) {
	throw new Error('Missing DATABASE_URL/POSTGRES_URL');
}
const sql = neon(connectionString);

// Ensure the table exists (runs once per cold-start, harmless after that)
async function ensureTable() {
	await sql`
		CREATE TABLE IF NOT EXISTS quiz_submissions (
			id          SERIAL PRIMARY KEY,
			q1          CHAR(1),
			q2          CHAR(1),
			q3          CHAR(1),
			q4          CHAR(1),
			q5          CHAR(1),
			q6          CHAR(1),
			q7          CHAR(1),
			q8          CHAR(1),
			q9          CHAR(1),
			q10         CHAR(1),
			ip          VARCHAR(255),
			submitted_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
}

export const prerender = false;

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, ip, city, isp } = body;

		// Validate: only allow A-D or X (unanswered) — single char
		const sanitize = (v) => {
			const s = String(v || 'X').toUpperCase().trim();
			return /^[A-DX]$/.test(s) ? s : 'X';
		};

		const fullIpDetails = `${String(ip || 'unknown')} - ${String(city || 'unknown')}, ${String(isp || 'unknown')}`.slice(0, 255);

		await ensureTable();

		await sql`
			INSERT INTO quiz_submissions (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, ip)
			VALUES (
				${sanitize(q1)}, ${sanitize(q2)}, ${sanitize(q3)},
				${sanitize(q4)}, ${sanitize(q5)}, ${sanitize(q6)},
				${sanitize(q7)}, ${sanitize(q8)}, ${sanitize(q9)},
				${sanitize(q10)}, ${fullIpDetails}
			)
		`;

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('submit-quiz error:', err);
		return new Response(JSON.stringify({ ok: false, error: String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
