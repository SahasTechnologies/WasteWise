// Proxy endpoint for RecycleMate items search API
export const prerender = false;

export async function OPTIONS() {
	// Handle CORS preflight
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}

export async function GET(context) {
	try {
		const request = context?.request ?? context;
		const url = new URL(request.url);
		const query = url.searchParams.get('q');
		const softPlastics = url.searchParams.get('softPlastics') || '1';

		if (!query) {
			return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
				status: 400,
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/items?q=${encodeURIComponent(query)}&softPlastics=${softPlastics}`;
		
		// First send OPTIONS request
		await fetch(apiUrl, {
			method: 'OPTIONS',
			headers: {
				'Accept': 'application/json',
				'Origin': 'https://recyclemate.com.au',
				'Access-Control-Request-Method': 'GET',
				'Access-Control-Request-Headers': 'content-type',
			}
		});

		// Then send the actual GET request
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Origin': 'https://recyclemate.com.au',
				'Referer': 'https://recyclemate.com.au/',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'public, max-age=3600'
			},
		});
	} catch (err) {
		console.error('recyclemate-items error:', err);
		return new Response(JSON.stringify({ error: String(err) }), {
			status: 500,
			headers: { 
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}
