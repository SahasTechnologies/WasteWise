# WasteWise: Recycling made easy, for everyone

## Introduction
Waste wise is an interactive website that is designed to empower residents in Sydney with knowledge and tools that they need to recycle effectively. By making a user-friendly interface to learn about waste management, find recycling points and track environmental impact, we aim to reduce the barriers that people have and enourage them to live a more sustainable life. Out mission is to increase the recycling rates all across Sydney to help protect our diverse natural local environment and animals, and build a more circular economy with sustainable practices.

## Issue Overview
The primary issue that WasteWise is trying to address is the lack of easily accessuble tools providing information about Sydney's recycling infrasture and waste management. There are many residents that want to recycle but cannot due to the complexity of finding and researching points for all their items like shoes, batteries and clothing. There is also a general lack of awareness about the impact of recycling on our local community and many people are not bothered since they don't see the impacts. WasteWise bridges this gap by providing and centralising all of this information and makes it easy to act on.

## Statistics
The scale of waste is significant, especially urban areas like Sydney.
- **Daily Generation**: Sydney households generate approximately _1,500 tonnes_ of waste, every single day.
- **Global Context**: On a Global scale, millions of tommes of waste are produced each year.

Even small actions can lead to really big savings for out planet. According to EPA Warm averages, recycling just _1kg_ of waste can save:
    - **2.5kg** of CO₂ equivalent emissions
    - **4.0kWh** of energy
    - **10 litres** of water

## Target Audience and Competitor Analysis
WasteWise is not a website that is run for profit, but rather to inform. WasteWise is a nonprofit informational project aimed at the general public in Sydney who have potential to recycle. This includes eco-conscious residents, data analysts looking for a cental place for data, and hopefully onboard local governments too in the future who are interest in promoting their recycling services.

Unlike other commercial waste management apps, WasteWise's primaty intention is accessibility and education without any profit motives or paywalls. While there are still government apps and services, like individual council pages, the user needs to find, research and navigate these pages, which are normally designed with bad UX and are difficult to navigate. WasteWise provides our users with a 'one-stop shop' for everything to learn about recycling and to take action on it.

## Design Process
The structure of our website centers around the main page, which allows everyone to access every page with the topbar and the bottom bar. It makes the website look clean with the topbar and footer allowing the user to navigate the site from anywhere with the abr that always stays in view without restricting available area. It allows us to minimise complex navigations and reduce the amount of hard to access pages on the site.

The main page has a big image as the hero section, inspired by [craft.do](https://craft.do)'s topbar and hero section which is a clean and layout. I originally designed this wireframe in Figma with a different image but decided to change it afterwards.

The design for this and the rest of my website is on **[Figma](https://www.figma.com/design/k2ffPxJ2DiTBlna65J8In7/WasteWise?node-id=0-1&t=Pqc5FVvQCmkjaCgN-1)**. I decided to use Figma since it is an easy to use content designer that works really well for websites. It also allows me to visualise my website and design my CSS around the variables I have already set visually in my code.

For the font and colour scheme, I am using **Fustat** as a text font to help build trust with a modern and corporate font. **Gluten** is the font used for 'eveyryone' in the hero section to foster a sene of fun instead of a boring website. The colour palette is heavily inspired by nature and has a theme of deep greens and shades of white and grey to evoke a sense of sustainability and nature.

## Development Process
In development of our webpage, we primarily used the **Astro** framework. Astro is a very good framework which improves many parts of the site compared to plain HTML/CSS/JS

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build) 

I chose Astro because of its unique islands architecture. In a normal HTMl/CSS/JS site, the whole page has to load JavaScript, even though the user might never touch those places. With Astro, the informational parts can stay as static HTML, while only hydrating the interactive parts with Javascript. This leads to much faster load times which leads to a better user experience.

Astro also has a component based structure. Because of this, I could create a single `Header.astro` and `Footer.astro` which I reuse across all my pages. This ensures consistency across the site, which is a key UX principle and made the development faster since I don't have to repeat code.

Since my site is an informational tool, it is best if Google ranks it high in its search. Since Astro generates static HTML by default, this already makes it very optimised for SEO. This is because the site loads faster for the crawler and it does not have to parse unnecessary JS to find data for the Google listing. It also means that the site is more accessible to users with slower connection speeds.

I had considered using React or Vue.js. However, they normally take a long time to build, which uses up my GitHub minutes much faster per communit, but it also means that the total file size of the website is ver large. With Astro, faster load times are more important as the site is not JS-heavy as I have tried to optimise my JS code throughout the site.

## Issues with the site
A big technical challenge I faced was the interaction of mapping and location data. On WasteWise, users can search for an item to recycle and their location to see a map:
``` Javascript
    fetch('https://photon.komoot.io/api/?q=sydney&limit=1&lang=en&lat=-33.8688&lon=151.2093').catch(() => {});
    // Fetch the data for the general coundary of Sydney

       function ensureDropdown() {
        if (!dropdown.isConnected) {
            const wrap = input.closest('.input-wrap') || input.parentElement;

            if (wrap) {
                wrap.style.position = 'relative';
                wrap.appendChild(dropdown); 
            } 
            else { document.body.appendChild(dropdown); }
            // Show the suggestions from Kommoot into the UI.
        }
    }
```
This code snippet fetches initial data focused on Sydney to make sure that local resuslts are preloaded. The `ensureDropdown` function manages the UI to display these suggestions. This was a big hurdle since many commercial APIs like Google Maps API is paid and complex to use. On top of this, testing during school was impossible as Komoot Photon is blocked on school WiFi.

Once a location is selected, we use **Nominatim** by OpenStreetMap to resolve  the coordinates and embed a map.
``` JavaScript
// Getting the coordinates via Nominatim
const searchUrl = new URL('https://nominatim.openstreetmap.org/search');
searchUrl.searchParams.set('format', 'json');
searchUrl.searchParams.set('q', address);

const res = await fetch(searchUrl, { ... });
const data = await res.json();

// Putting these coords in Openstreetmap
const embedUrl = new URL('https://www.openstreetmap.org/export/embed.html');
embedUrl.searchParams.set('marker', `${lat},${lon}`);

iframe.src = embedUrl.toString();
```
This was hard to integrate as I was originally thinking to use Google Maps. However, adding custom points requires you to configure Google Cloud with your website and pay for each request. I didn't find Nominatim until I searched for a while.

After this, a key goal was to show the specific bin collection days depending on the address the user puts in. Some councils like Fairfield City and Penrith provide public APIs for free which are easy to implement. However, other councils like Blacktown City Council still calls an API, but it is undocumented and is an internal endpoint. There are also councils like the Hills Shire council that require multiple sequential calls for suburb, street and house. That is why it is very difficult to integrate the bin days for the 30+ councils in Greater Sydney, each requiting their own code based on the API Infrastructre.

So, implementing a unified Bin Day on my site would need:
1. Council identification to make sure that the address is in Sydney, and also to know which council API to call
2. Writing _individual_ handlers for over 30 local councils and calling the council based on the specific address
3. CORS Management and blocks - many of these APIs lack CORS (Cross-Origin Resource Sharing) headers among other possible blocks when I try to put it on my site.
All this adds latency to the site and complexity, which is why it is very hard to implement council bin days.

I also had a big issue with choosing the specific form supplier. At the start I was thinking Google forms, but its UI doesn't match with my site and it looks out of place and has Google branding everywhere. This is the same with Microsoft forms. I then tried with Notion forms, but it had some limitations with the quiz aspect (for my WasteWise Quiz). At this point I was thinking to either selfcode a form and link it to Supabase/Firebase, or selfhost FormBricks on my home server and expose with Cloudflare Tunnel (like I do with Immich and other apps).

However, I then found Tally, whose free plan is very reliable with unlimited submissions and sustom colours and fonts, usable with a simple embed. The only problems were:
1. The tally logo in the bottom right: This was not that bad as the tally logo is small and does not interfere with the usable area or make the form longer by any means, its just that I would prefer if it wasn't there
2. There is no option to setting right and wrong answers as you would do in a quiz. To fix this, I made the WasteWise Quiz redirect on submission to /answers with query parameters for each option the user answered. The site would then check this against the JSON file in `src\data\answers.json` and mark the user for each correct and incorrect answer. This way, I can keep custom CSS while not having to worry about security with wiring a backend and also getting unlimited submissions and views.
3. The tally branding after submitting a form: This was very annoying as it would literally flash in your face that it is _'Made with Tally, the simplest way to create forms for free.'_ and then a big button to create your own form, which decreases user experience. To fix this, I had a creative idea to again redirect to `wastewise.shimpi.dev/contact?finished=true` and the page would detect the query parameter to show the custom thankyou screen.

While testing on localhost however, this would mean that the Tally form would still redirect to wastewise.shimpi.dev, and if I changed it to localhost:4321 in Tally, this would mean that the actual website does not work. To ensure form uptime, I had to create 2 forms and rememeber to delete the duplicate in Tally and change the embed in the code back to the original to make sure that the end site still works and does not break. This implementation fo answers and redirects is not the best, but it does mean that the user has a very good UX, improved security when the answers are transferred to the database, and less code for the same result.

## User Testing
### Round 1 - Internal Testing
During this round, I shared my website to 2 other people in my Enterprise Computing class. The primary feedback was to improve the compatibility on devices with a smaller width (like phones), make sure the Nominatim Map and Photon Komoot searching is more reliable, and the failure of Photon komoot on school Wi-Fi (I cannot fix this since it is blocked and is outside my control). I fixed the first two errors by ensuring a seperate layout for mobile and reinforcing the code for Photon Komoot.

### Round 2 - Private Beta
During this round, I shared my website with everyone in my enterprise computing class and with 5 people outside my class. The feedback this time was to improve the form handling (the quiz answer parsing was not reliable), and issues with placement of items on wider screens like an Odyssey Ultrawide monitor that a tester owns. To fix this, I made sure that [add fix here]

## Final Product Overview
There were many challenges encountered during the creation of the website, including the map errors and cross device compatibility and testing with non-Chromium browsers such as Firefox. However, the final verion of WasteWise successfully centralises recycling information and data into one site which is easy to navigate with good UI and UX.

Developing this site was a huge learning experience. It challenged me to think of creative alternatives to paid and expensive software (like $29 Tally Pro and Google Maps API) and helped me learn about the vast number of options and things I can add to my site. Balancing technical performance with a premium interface was what I wanted to achieve, and positive user testing shows that this balance was achieved and approved by the local community.

Overall, we believe that WasteWise provides a solid foundation for local action on recycling and taking the first steps to minimise waste on an individual level, and we look forward to further expand its features to cater to more of Sydney and provide more useful help to our local community.