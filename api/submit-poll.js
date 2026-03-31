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
		CREATE TABLE IF NOT EXISTS poll_submissions (
			id SERIAL PRIMARY KEY,
			barrier VARCHAR(255),
			submitted_at TIMESTAMPTZ DEFAULT NOW(),
			ip_address VARCHAR(45)
		)
	`;
	try {
		await sql`ALTER TABLE poll_submissions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)`;
	} catch (e) {
		console.warn('Could not alter poll_submissions table:', e);
	}
}

export const prerender = false;

export async function POST(context) {
	try {
		const request = context?.request ?? context;
		const body = await request.json();
		const { barrier } = body;

		if (!barrier) return new Response(JSON.stringify({ ok: false, error: 'Missing barrier option' }), { status: 400 });

		await ensureTable();

		const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

		await sql`
			INSERT INTO poll_submissions (barrier, ip_address)
			VALUES (${String(barrier).slice(0, 255)}, ${ip})
		`;

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error('Poll DB error:', err);
		return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
	}
}

export async function GET() {
	try {
		await ensureTable();
		const results = await sql`
			SELECT barrier, COUNT(*) as count
			FROM poll_submissions
			GROUP BY barrier
		`;

		const totalRes = await sql`SELECT COUNT(*) as total FROM poll_submissions`;
		const total = parseInt(totalRes[0]?.total || 0, 10);

		const data = {
			total,
			results: results.map(row => ({
				barrier: row.barrier,
				count: parseInt(row.count, 10),
				percentage: total > 0 ? Math.round((parseInt(row.count, 10) / total) * 100) : 0
			}))
		};

		return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (err) {
		console.error('Poll GET DB error:', err);
		// Fallback to empty
		return new Response(JSON.stringify({ total: 0, results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	}
}
