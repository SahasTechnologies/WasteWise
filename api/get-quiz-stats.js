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
		// Get individual score counts (1-10)
		const results = await sql`
			SELECT 
				COUNT(*) FILTER (WHERE score = 1) as score_1,
				COUNT(*) FILTER (WHERE score = 2) as score_2,
				COUNT(*) FILTER (WHERE score = 3) as score_3,
				COUNT(*) FILTER (WHERE score = 4) as score_4,
				COUNT(*) FILTER (WHERE score = 5) as score_5,
				COUNT(*) FILTER (WHERE score = 6) as score_6,
				COUNT(*) FILTER (WHERE score = 7) as score_7,
				COUNT(*) FILTER (WHERE score = 8) as score_8,
				COUNT(*) FILTER (WHERE score = 9) as score_9,
				COUNT(*) FILTER (WHERE score = 10) as score_10
			FROM quiz_submissions
		`;

		const stats = results[0] || {
			score_1: 0,
			score_2: 0,
			score_3: 0,
			score_4: 0,
			score_5: 0,
			score_6: 0,
			score_7: 0,
			score_8: 0,
			score_9: 0,
			score_10: 0
		};

		return new Response(JSON.stringify(stats), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('get-quiz-stats error:', err);
		return new Response(JSON.stringify({ 
			score_1: 0,
			score_2: 0,
			score_3: 0,
			score_4: 0,
			score_5: 0,
			score_6: 0,
			score_7: 0,
			score_8: 0,
			score_9: 0,
			score_10: 0
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
