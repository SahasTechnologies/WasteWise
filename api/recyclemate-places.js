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
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Origin': 'https://recyclemate.com.au',
				'Referer': 'https://recyclemate.com.au/'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`RecycleMate API error: ${response.status}`, errorText);
			
			// Return empty array instead of error to prevent breaking the UI
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: { 
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=1800'
				},
			});
		}

		const data = await response.json();
		
		// RecycleMate returns {places: [...]} so extract the places array
		const places = data.places || data;

		return new Response(JSON.stringify(Array.isArray(places) ? places : []), {
			status: 200,
			headers: { 
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=1800'
			},
		});
	} catch (err) {
		console.error('recyclemate-places error:', err);
		// Return empty array instead of error
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
