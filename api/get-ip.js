/*
This vercel function is to find the user's real IP. I could use
ipify.org directly, but some browsers may block this. The IP
identifier is only here to stop abuse on my form since it is 
technically a public endpoint which a bot could spam if smart
enough. I'm not using this IP to deliver targeted ads etc.
*/

export const prerender = false;

export async function GET(context) {
	try {
		const request = context?.request ?? context;
		if (!request || !request.headers) {
			throw new Error('Invalid request');
		}
		const forwarded = request.headers.get('x-forwarded-for');
		const real = request.headers.get('x-real-ip');

		let ip = 'unknown';
		if (forwarded) ip = forwarded.split(',')[0].trim();
		else if (real) ip = real.trim();

		if (ip === 'unknown' || ip === '::1' || ip.includes('127.0.0.1')) {
			try {
				const f = await fetch('https://api.ipify.org?format=json');
				if (f.ok) {
					const d = await f.json();
					ip = d.ip;
				}
			} catch (e) { }
		}

		let city = 'unknown', isp = 'unknown', region = 'unknown';
		if (ip !== 'unknown') {
			try {
				const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
				if (geoRes.ok) {
					const geo = await geoRes.json();
					if (geo.status === 'success') {
						city = geo.city || geo.regionName || 'unknown';
						region = geo.region || '';
						isp = geo.isp || geo.org || 'unknown';
					}
				}
			} catch (e) { }
		}

		return new Response(JSON.stringify({ ip, city, region, isp }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		return new Response(JSON.stringify({ ip: 'unknown', city: 'unknown', isp: 'unknown' }), { status: 200 });
	}
}
