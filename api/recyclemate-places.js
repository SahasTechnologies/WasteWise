// Proxy endpoint for RecycleMate places API
export const prerender = false;

export async function GET(context) {
	try {
		const request = context?.request ?? context;
		const url = new URL(request.url);
		const itemId = url.searchParams.get('itemId');
		const lat = url.searchParams.get('lat');
		const lng = url.searchParams.get('lng');
		const limit = url.searchParams.get('limit') || '100';
		const offset = url.searchParams.get('offset') || '0';

		if (!itemId || !lat || !lng) {
			return new Response(JSON.stringify({ error: 'Missing required parameters: itemId, lat, lng' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/places/item/${itemId}?limit=${limit}&offset=${offset}&lat=${lat}&lng=${lng}`;
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
				'Cache-Control': 'public, max-age=1800'
			},
		});
	} catch (err) {
		console.error('recyclemate-places error:', err);
		return new Response(JSON.stringify({ error: String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
