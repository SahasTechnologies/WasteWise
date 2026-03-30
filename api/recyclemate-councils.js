// Proxy endpoint for RecycleMate councils API
export const prerender = false;

export async function GET(context) {
	try {
		const request = context?.request ?? context;
		const url = new URL(request.url);
		const lat = url.searchParams.get('lat');
		const lng = url.searchParams.get('lng');

		if (!lat || !lng) {
			return new Response(JSON.stringify({ error: 'Missing lat or lng parameter' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/councils?lat=${lat}&lng=${lng}`;
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
		console.error('recyclemate-councils error:', err);
		return new Response(JSON.stringify({ error: String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
