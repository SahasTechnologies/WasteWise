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

// Ensure the table exists (runs once per cold-start, harmless after that)
async function ensureTable() {
	await sql`
		CREATE TABLE IF NOT EXISTS quiz_submissions (
			id          SERIAL PRIMARY KEY,
			q1          SMALLINT,
			q2          SMALLINT,
			q3          SMALLINT,
			q4          SMALLINT,
			q5          SMALLINT,
			q6          SMALLINT,
			q7          SMALLINT,
			q8          SMALLINT,
			q9          SMALLINT,
			q10         SMALLINT,
			score       SMALLINT,
			ip          VARCHAR(255),
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
		const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, score, ip, city, isp } = body;

		// Validate: only allow 0 or 1 for each question
		const sanitize = (v) => {
			const num = parseInt(v, 10);
			return num === 1 ? 1 : 0;
		};

		const fullIpDetails = `${String(ip || 'unknown')} - ${String(city || 'unknown')}, ${String(isp || 'unknown')}`.slice(0, 255);

		await ensureTable();

		await sql`
			INSERT INTO quiz_submissions (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, score, ip)
			VALUES (
				${sanitize(q1)}, ${sanitize(q2)}, ${sanitize(q3)},
				${sanitize(q4)}, ${sanitize(q5)}, ${sanitize(q6)},
				${sanitize(q7)}, ${sanitize(q8)}, ${sanitize(q9)},
				${sanitize(q10)}, ${parseInt(score, 10) || 0}, ${fullIpDetails}
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
