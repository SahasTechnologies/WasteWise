// Proxy endpoint for RecycleMate location maps API
export const prerender = false;

export async function GET(context) {
	try {
		const request = context?.request ?? context;
		const url = new URL(request.url);
		const mapId = url.searchParams.get('mapId');
		const softPlastics = url.searchParams.get('softPlastics') || '1';

		if (!mapId) {
			return new Response(JSON.stringify({ error: 'Missing mapId parameter' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/location/maps/${mapId}?excludeIcons=1&softPlastics=${softPlastics}`;
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
		console.error('recyclemate-map error:', err);
		return new Response(JSON.stringify({ error: String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
