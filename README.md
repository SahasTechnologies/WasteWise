[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://wastewise.shimpi.dev)
[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)

# WasteWise

WasteWise is a site built to help Australians understand, learn and take action on recycling. The site has multiple features such as find, contact, community and more to engage the user and enourage them to recycle. Below is my UX documentation and overall evaluation of the project (but it's quite long, so the essential parts are here)

## How to run
just go to https://wastewise.shimpi.dev
If you want to improve the site, please send a PR!

### Home Screen
The home screen features a calculator, graphs and chart from chart.js and lots more to educate users with easy steps on recycling

### Find Feature
This uses RecycleMate's API to find locations and Nomination + Photon Komoot for the locations and GeoJSON. The end map uses leaflet to plot the points.
How it works:
The first textbox shows from Komoot and wehn clicked geocodes with GeoJSON. the second one finds from RecycleMate's (hidden) API that took soo long to map out the entire dir since it makes multiple calls and has its own authorisation and bearer token and everything

### Contact form
This uses CLoudflare's captcha, Profanity API and many other things to prevent abuse, but this is where uses can contact me about the stie. This is because the site was experiencing some abuse and so to stop that I have unfortunately had to use this. But then some users mentioned that the profanity filter is not good so I also provide an email address where they can contct me from!

### Poll and Quiz
Data is saved in a custom NeonDB integration that is linked with Vercel to ensure that it is fast and reliable. On the community page, the thing fetches from the neonDB to show total responses and make more people encouraged to view.

### About page
it has nothing special (feature-wise), its just text

### Privacy policy
see idk read it ig

