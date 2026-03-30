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
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/items?q=${encodeURIComponent(query)}&softPlastics=${softPlastics}`;
		
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Accept': '*/*',
				'Authorization': 'Bearer 816762b93a21787e566babba92207521',
				'Origin': 'https://www.recyclemate.com.au',
				'Referer': 'https://www.recyclemate.com.au/',
				'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36'
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
