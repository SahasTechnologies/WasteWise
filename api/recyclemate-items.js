// Proxy endpoint for RecycleMate items search API
export const prerender = false;

export async function GET(context) {
	try {
		const request = context?.request ?? context;
		const url = new URL(request.url);
		const query = url.searchParams.get('q');
		const softPlastics = url.searchParams.get('softPlastics') || '1';

		if (!query) {
			return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/items?q=${encodeURIComponent(query)}&softPlastics=${softPlastics}`;
		const response = await fetch(apiUrl, {
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'WasteWise/1.0'
			}
		});

		if (!response.ok) {
			throw new Error(`RecycleMate API error: ${response.status}`);
		}

		const data = await response.json();

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600'
			},
		});
	} catch (err) {
		console.error('recyclemate-items error:', err);
		return new Response(JSON.stringify({ error: String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
