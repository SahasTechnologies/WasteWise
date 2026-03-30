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
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const apiUrl = `https://api.recyclemate.com.au/v2/places/item/${itemId}?limit=${limit}&offset=${offset}&lat=${lat}&lng=${lng}`;
		
		console.log('Fetching from RecycleMate:', apiUrl);

		const bearerToken = process.env.RECYCLEMATE_API_TOKEN || import.meta.env.RECYCLEMATE_API_TOKEN;

		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Accept': '*/*',
				'Authorization': `Bearer ${bearerToken}`,
				'Origin': 'https://www.recyclemate.com.au',
				'Referer': 'https://www.recyclemate.com.au/',
				'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
			}
		});

		console.log('RecycleMate response status:', response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`RecycleMate API error: ${response.status}`, errorText);
			
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': 'public, max-age=1800'
				},
			});
		}

		const data = await response.json();
		console.log('RecycleMate response data keys:', Object.keys(data));
		console.log('Has places property:', !!data.places);
		
		// RecycleMate returns {places: [...]} so extract the places array
		const places = data.places || [];
		console.log('Places count:', places.length);

		return new Response(JSON.stringify(places), {
			status: 200,
			headers: { 
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'public, max-age=1800'
			},
		});
	} catch (err) {
		console.error('recyclemate-places error:', err);
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: { 
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}
