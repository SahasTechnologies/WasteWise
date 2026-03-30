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

export const prerender = false;

export async function GET() {
	try {
		// Get score distribution
		const results = await sql`
			SELECT 
				COUNT(*) FILTER (WHERE score >= 0 AND score <= 1) as range_0_10,
				COUNT(*) FILTER (WHERE score >= 2 AND score <= 4) as range_10_40,
				COUNT(*) FILTER (WHERE score >= 5 AND score <= 7) as range_40_70,
				COUNT(*) FILTER (WHERE score >= 8 AND score <= 9) as range_70_99,
				COUNT(*) FILTER (WHERE score = 10) as range_100
			FROM quiz_submissions
		`;

		const stats = results[0] || {
			range_0_10: 0,
			range_10_40: 0,
			range_40_70: 0,
			range_70_99: 0,
			range_100: 0
		};

		return new Response(JSON.stringify(stats), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('get-quiz-stats error:', err);
		return new Response(JSON.stringify({ 
			range_0_10: 0,
			range_10_40: 0,
			range_40_70: 0,
			range_70_99: 0,
			range_100: 0
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
