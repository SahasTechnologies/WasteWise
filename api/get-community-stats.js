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
		let quizTotal = 0;
		let contactTotal = 0;
		let pollTotal = 0;

		try {
			const res = await sql`SELECT COUNT(*) as count FROM quiz_submissions`;
			quizTotal = parseInt(res[0]?.count || 0, 10);
		} catch (e) {}
		
		try {
			const res = await sql`SELECT COUNT(*) as count FROM contact_submissions`;
			contactTotal = parseInt(res[0]?.count || 0, 10);
		} catch (e) {}
		
		try {
			const res = await sql`SELECT COUNT(*) as count FROM poll_submissions`;
			pollTotal = parseInt(res[0]?.count || 0, 10);
		} catch (e) {}

		return new Response(JSON.stringify({
			quiz: quizTotal,
			contact: contactTotal,
			poll: pollTotal,
			total: quizTotal + contactTotal + pollTotal
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('get-community-stats error:', err);
		return new Response(JSON.stringify({ quiz: 0, contact: 0, poll: 0, total: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
	}
}
