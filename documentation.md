# WasteWise
Waste wise is an interactive website that will help you to find recycling points, learn information and more to reduce the barriers people face when recycling. This project aims to increase the amount of recycled products in Sydney and help to build a better world and conserve Sydney's environment.

The site is live [here](https://wastewise.shimpi.dev)

## Issue Overview
The issues that Wastewise attempts to address is the lack of recycling and knowledge of waste management in Sydney.

## Statistics
According to the this that , insert facts here

## Target Audience and Competitor Analysis
Wastewise does not have a target audience as it is an informational site rather than a site meant for money or businesses. Our website caters to inviduals who believe in our cause and want to recycle their items and live a more sustainable life with less waste.

Additionally, add here

## Design Process
The structure of our website centers around the main page, which allows everyone to access every page with the topbar and the bottom bar. It makes the website look clean with the topbar and footer allowing the user to navigate the site from anywhere with the abr that always stays in view without restricting available area. It allows us to minimise complex navigations and reduce the amount of hard to access pages on the site.

The main page has a big image as the hero section, inspired by [craft.do](https://craft.do)'s topbar and hero section which is a clean and layout. I originally designed this wireframe in Figma with a different image but decided to change it afterwards.

The design for this and the rest of my website is on **[Figma](https://www.figma.com/design/k2ffPxJ2DiTBlna65J8In7/WasteWise?node-id=0-1&t=Pqc5FVvQCmkjaCgN-1)**. I decided to use Figma since it is an easy to use content designer that works really well for websites. It also allows me to visualise my website and design my CSS around the variables I have already set visually in my code.

For the font and colour scheme, I am using Fustat as a text font which looks modern and corporate, building trust with the user, while Gluten is the font for 'everyone' in the top bar to suggest fun. For the colour scheme, I need 5 colours I only have 2 shades of green so please do not mark me down thank you so much

Additionally, i dont know

## Development Process
In development of our webpage, we primarily used the Astro framework to speed up our site by [insert astro details here]. Astro helps to (insert here) and made our site (insert here).

A major issue that I had ran into is the dataset for the map data and location-related information. On my site, there is a feature where the user can enter their suburb or general location, and these things will happen:

1. My site will fetch autocomplete address data from `photon.komoot.io`, which I used instead of Google Maps since it is a free alternative.
Code snippet:
``` Javascript
    fetch('https://photon.komoot.io/api/?q=sydney&limit=1&lang=en&lat=-33.8688&lon=151.2093').catch(() => {});
    // yeah sorry its sydney only

    function ensureDropdown() {
        if (!dropdown.isConnected) {
            const wrap = input.closest('.input-wrap') || input.parentElement;

            if (wrap) {
                wrap.style.position = 'relative';
                wrap.appendChild(dropdown); 
            } 
            else { document.body.appendChild(dropdown); }
        }
    }
```
What this code does is [explain here]

This was hard since I spent a lot of time trying to find alternatives to Google Maps since Google's product is very widely known and used. I also could not work at school since Photom Komoot is blocked on school WiFi which made it hard to develop.

2. Once a user enters their address, it redirects to `/find?item={item}&address={address}`, e.g. `https://wastewise.shimpi.dev/find/?item=shoes&address=Baulkham+Hills+High+School+2153%2C+The+Hills+Shire+Council%2C+New+South+Wales%2C+Australia`.
I did not want to have functions since:
 - When I usesd cloudflare pages for my static site hosting, for implementing Cloudflare functions I need to pay if too many requests go through. This is the same with Vercel (wharever they call it) and Netlify (whatevery they call it)
 - I wanted to show a badge of the status of the current build (if it passed or failed) and to do this with Cloudflare, I will need to start a new worker which the README will fetch, which is very inconvenient, and that is why I switched to Github pages with a custom domain linked via a DNS CNAME record. However, Github pages are meant solely for static sites and have no form of functions at all.
Here is the code snippet for URL query parameter parsing:
``` JavaScript
	const params = new URLSearchParams(window.location.search);
	const address = params.get('address')?.trim();

	if (!address) return;

	const subtitle = document.getElementById('map-subtitle');
	if (subtitle) subtitle.textContent = `Map for: ${address}`;
```

3. It will then show a map with the places of nearby recycling spots for that specific item. I could not use Google Maps since it is a paid function, and Google My Maps is clunky and may not always work properly depending on the location the user enters. That is why I have used [Nomatim](https://nomatim.openstreetmap.org) to plot the location that the user has entered.
Here is the code snippet:
``` JavaScript
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
```
[explain what each part of code does here]

4. It will then show the bin day for that area, so the user can effectively organise their bins and efficiently recycle more.
This is still a work in progress, but this was the main hurdle since there was a big issue with this. 

Some governments in Sydney like [Fairfield City](https://data.fairfieldcity.nsw.gov.au/explore/dataset/garbage-runs-region-fairfield/api/) expose a public api, other governments like [Blacktown City](https://www.blacktown.nsw.gov.au/Services/Waste-services-and-collection/Bin-collection-and-new-service-delivery-days) have a Hidden API that you can find with Chrome developer network tools, and then there are councils like [Hills Shire](https://www.thehills.nsw.gov.au/Residents/Waste-Recycling/When-is-my-bin-day/Check-which-bin-to-put-out-and-when) which make multiple API calls for suburb, street and house no and make multiple API calls.

To implement this on my site with a simple address, I will need to first verify the address is in Sydney, then find the council the address is in, and then use the specific API for that council. Since there are over 30 local councils in NSW, this would mean that I would have to individually find out and code the API access for each council, which is inconvenient. On top of this, many API endpoints would have restrictions like CORS, which would mean I have to use a CORS Proxy (which is also blocked in school, so it would be very hard to implement).

So yeah this is why it was really hard to do this.

After writing this, I went back and made some revisions to just show the official governmwnt URL for finding bins.

## User Testing and feedback

### Round 1
I sent the link to 5 people in my enterprise computing class and asked to bugtest. Here is what happened:
1. Jaden Lee said that the website breaks on phone and many of the sections do not show and center properly
2. Abdullah Khan said that the map finder does not work (because he was on school wifi - this is not somethingI can fix)
3. Devam Dudeja said that the map was unreliable as it could sometimes not show the map.

During this round, I fixed the map reliability and made the map more sound and better to use

## Final Product Overview
There were many challenges encountered during the creation of the website, including the map errors and cross device compatibility and testing with non-Chromium browsers such as Firefox. [add more]

During this, I felt ___
This learning experience showed me many thigns, .....

Overall, we believe that____