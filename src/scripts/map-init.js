export default async function initMap() {
	const params = new URLSearchParams(window.location.search);
	const address = params.get('address')?.trim();

	if (!address) return;

	const subtitle = document.getElementById('map-subtitle');
	if (subtitle) subtitle.textContent = `Map for: ${address}`;

	try {
		const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
		searchUrl.searchParams.set('format', 'json');
		searchUrl.searchParams.set('limit', '1');
		searchUrl.searchParams.set('q', address);

		const res = await fetch(searchUrl, {
			headers: {
				'accept': 'application/json',
				'user-agent': 'WasteWise/0.0.1'
			}
		});

		if (!res.ok) return;

		const data = await res.json();
		const first = Array.isArray(data) ? data[0] : null;
		const lat = typeof first?.lat === 'string' || typeof first?.lat === 'number' ? Number(first.lat) : null;
		const lon = typeof first?.lon === 'string' || typeof first?.lon === 'number' ? Number(first.lon) : null;

		if (typeof lat === 'number' && Number.isFinite(lat) && typeof lon === 'number' && Number.isFinite(lon)) {
			const embedUrl = new URL('https://www.openstreetmap.org/export/embed.html');
			embedUrl.searchParams.set('layer', 'mapnik');
			embedUrl.searchParams.set('marker', `${lat},${lon}`);
			embedUrl.searchParams.set('zoom', '18');

			const iframe = document.getElementById('map-iframe');
			if (iframe) iframe.src = embedUrl.toString();
		}
	} catch (e) {
		console.error('Map init failed:', e);
	}
}
