
 
Table of Contents 	 
I. Introduction 
II. Research and Analysis 
III. Design Process 
IV. Development Process 
V. User Testing and Feedback 
VI. Final Product. 

 
 
Introduction 
Concept Overview 
Wastewise is an interactive website that helps you find recycling points, learn information and more, to reduce the barriers people normally face when recycling their waste. The project aims to increase the amount of recycled products in Sydney and to help build a better world and conserve Sydney’s environment. 
The site is currently live at https://wastewise.shimpi.dev 
This document details the process of creating a website like WasteWise. All three of these iterations were tested by multiple users to make sure that the website is good and accessible to everyone. 
 
 
 
 
Research and Analysis 
Community Issue Research 
Australia’s waste problem is significant and growing. According to the Australian Bureau of Statistics, over 60 million tonnes were thrown away by Australian residents every year for the past decade 
 
 
Source: Australian Bureau of Statistics 
This stat needs to change, and it should have an overall downward trend rather than an upward trend. 
Target Audience Analysis 
Ideally, anyone should be able to use this website to learn more about recycling and its impact on our community and the world in general. However, this website is specifically tailored to residents in Australia who manage their own waste. In addition, this website also caters to the younger generation since it is best to educate from a young age to stop these bad habits early.  
Competitor Analysis 
This site does not take money, commissions, affiliations, revenue or advertising data. Due to this, we have no business competitors. In fact, we want more websites and online resources to be dedicated to waste management and recycling in Australia to help preserve Australia’s natural beauty and environment. 
Furthermore, numerous sites exist that perform some of the functions that our site does, including RecycleMate for recycling locations, Recyculator by NSW Government EPA for calculating savings, the Recycle Right quiz by Ku-ring-gai Council and many others. Our site supports these sites since they are official government sources, and it is important for users to access as many resources as possible for recycling, none of these competitors has all of this functionality in one easy-to-use site, which is why Wastewise was made. 
 
Design Process 
Site Layout 
On Wastewise, every page centres around the main page, since this is the page that the users will see when they log on to the site. From the main page, users can access every other page with the header, footer, or multiple areas on the site itself. We made the website look clean and minimalistic, as we learnt in Enterprise Computing, to make sure that we do not overwhelm the user with excessive buttons and options. Instead, we show our pitch in a slow, easy-to-digest way on the home page, which links to each of our pages. 
Colour Scheme and Font Design 
On Wastewise, we have a set colour scheme to ensure consistency across the website. Here are the colours we have used: 
 
This ensures that the entire website looks like one singular site and ensures regularity and consistency. 
For fonts, we used 2 fonts: Fustat and Caprasimo. Caprasimo is used as the heading font, and is used for text that needs to be emphasised across my website. Below is a specimen of the Regular font weight of both fonts. Caprasimo stands out much more than Fustat, and I used it for things like numbers to emphasise them. 
 
As you can see in the example below, the two fonts are used for different purposes. Fustat is a modern sans-serif minimalist typeface that is used for text due to its superior legibility and minimalism. On the opposite end, Caprasimo is a bold, retro-inspired soft serif display typeface, which is specifically made to stand. With this font, I have put text that needs to be emphasised, like big stats and numbers. 
 
 
Multimedia Elements 
I have multiple multimedia elements on this site to serve different functions. 
 
Development Process 
Programming Languages and Frameworks 
On Wastewise, I have used a variety of languages and frameworks to achieve the final layout. On this site, I have used the Astro framework. I used this since it has many benefits over direct HTML: 
•	Islands Architecture - Astro uses an Islands architecture to render the majority of the static site first (HTML and CSS), and then there are smaller islands of JavaScript throughout the website, when you need interactivity.  
•	Boosted Speed - Due to this increased efficiency, the site normally loads faster while having the same, if not more, performance. This increases user satisfaction as they are not waiting for a site to load, and also boosts SEO since crawlers can load the site faster without unnecessary JavaScript. 
•	Reusable components -  Astro allows me to reuse components across my site, and I have used this for my header and footer. This ensures consistency throughout the site, which is a core UX principle, while allowing the site to scale better as it grows by not repeating code. 
•	Integration with other frameworks -  For ease of use, I have used HTML as my internal framework in Astro. If the site were to get more complicated, I can easily switch to other frameworks within Astro, like React, Vue, Svelte or Solid. 
For deploying the site, I have used Vite. Vite is a modern open-source build tool that provides an extremely efficient build development environment with features such as hot module replacement (which allows code changes to be rendered instantly) and allows me to start a development server to test my changes before committing them. 
For the raw languages used, I had used a variety of languages to ensure the website loads. 
Astro - The astro files serve as the base of my website. In .astro files, you can code in multiple languages, including React, Vue, Svelte or HTML. For simplicity, I have used HTML, or HyperText Markup Language. 
CSS - For coding the design of the site, I have used CSS, or Cascading Style Sheets. This allows the browser to understand exactly how an element should look in the site with parameters such as border radius and colour (without U) 
JS - For my site, while I could use Typescript or many other JS-like scripts, I stuck to vanilla JavaScript for simplicity. I have also used this for my Vercel functions, which do things like fetch my database. 
JSON - While it is not a coding language, I have also used JSON, or JavaScript object notation to store things like my answers and articles. Instead of hard-coding each one in the site and creating code individually, I can write the questions/articles in a JSON file to reduce code and also to make it easier to change. 
Technical Challenges 
While coding this site, I had to overcome numerous technical challenges. Here is one of the challenges I overcame to implement a groundbreaking feature 
I always wanted a way for users to search for recycling points on WasteWise.  
First, the user needs to be able to type in their location. For autocomplete data, I had tried integrating Google Maps API, but it requires setting up Google Cloud with credits and a card number, since it is paid. I couldn’t find an alternative, even on OpenStreetMap, but I did find Photon Komoot (photon.komoot.io). This is a Google Maps API alternative that uses OpenStreetMap instead of Google Maps, meaning that it is free and has unlimited usage. Here is how easy it is to fetch from Photon: 
[code snippet here] 
Then, the site has to show locations. From the start, I was thinking that I had to manually find sites and import them into a JSON file. I tried Google Maps scrapers and tried to find open datasets of recycling points, but couldn’t find any, even after searching for a long time. Since I thought it didn’t exist, I downgraded and thought that it could only show the bin day for organisational purposes instead, but even this didn’t work, as there are over 30 councils in Sydney. Some of these councils have open API endpoints with proper documentation, like the City of Sydney Council, while others have easy but undocumented APIs like Blacktown City Council, and others like Hills Shire Council have multiple API calls based on internal IDs. But then, I found RecycleMate. 
By checking the network requests the site makes to the RecycleMate API, I was able to find out their API endpoints and integrate them within my site. Since there was a CORS error, I shifted it to a Vercel function, and the available options to show for recycling were working. 
Then, I needed to actually find an API that would tell me the exact locations for each recyclcing center. I tried to use RecycleMate’s same API, but unfortunately, the server function was giving a 500 error in Vercel, and after checking that nothing was wrong, I implemented more verbose logging to check the actual problem. Then I found out it was a 401 Unauthorised error by checking logs in Vercel. However, this was not something I could fix since I didn’t have any key or Authorisation token. Feeling dejected, I thought I would have to scrap all of my work, when I found the Bearer Authorisation token being sent in Chrome developer tools, and when I implemented that, the site worked! 
Now, I needed to actually plot the points on a map... Google Maps API was paid, so I shifted my attention to OpenStreetMap’s Leaflet, which can plot multiple points on a map. Using this, I was able to integrate the system while avoiding paid plans and unnecessary headache of creating custom data tables and fetching via API tools instead. 
There were many more errors like the Tally Forms to Custom DB switch, change from Cloudflare Pages to GitHub Pages to Vercel due to each having different features, I think the one above was the one that took the most time to fix. 
 
User Testing & Summary 
Feedback and Iteration 
First Round 
For the first round, I shared the website link with 5 people in my enterprise computing class for them to review and provide feedback on. This testing was conducted using a task-based usability methodology, which I chose since it directly tests the usability of the site.  
My quantitative testing objective with this session was to check the time to navigate to both pages and the abandonment rate for my tally form. 
These tasks were to: 
•	Navigate to the ‘Articles’ page and ‘About’ page 
•	Contact Us 
•	Take the quiz 
With this testing session, I found that all users managed to navigate to the quiz, articles and about page in under 10 seconds of initially typing the URL. Each user was able to contact me via the integrated Tally form. However, the abandonment rate for the quiz was quite high (80%). The feedback I had received about the form is as follows: 
•	If a user had skipped a single question accidentally, the form would not submit, and they would not know the error if they did not scroll up to the specific question 
•	The 10 questions right at the start overwhelm the user, so they go out of the form 
•	After submitting, the page takes too long to redirect to my answers page 
Many of these issues are with the Tally forms themselves, and there was not much I could do if I still wanted to use a managed form service. Typeform was a very strong alternative, although it was paid. This meant that I had to implement my own form with my own custom backend to change the styling and animation. To implement this, I  changed from Tally forms to a self-coded form service that stores the questions in JSON (since it is not sensitive) and user submission timestamps and questions in NeonDB, which integrates very cleanly in Vercel. I also integrated this same backend for the contact form. 
Second Round 
For the second round, I conducted the same usability test with the public and shared my site with over 15 people. Their goals were the things that I had fixed earlier, along with some new things that had been improved: 
•	Contact me via the new contact form 
•	Fill in the quiz 
•	Navigate to the Find, About and Community Pages 
•	Use the impact statistics and recycling saving calculator. 
Everybody was able to contact me via the form, and it was working properly. Because of the newer Typeform-style rise animation and immediate feedback, the user engagement was very high. Here are some quotes from users who had submitted forms: 
 
 	“It [the form] is really hard, and I actually learned many things from it because it immediately tells me why I’m wrong”
— Niranjan Savin 
 
 	“The form animations were really nice”
— Jaden Lee 
 
 	“When I finish, I want to retry the quiz because I can see people who got full marks”
— Lawrence Zhang 
This shows that the quiz was wildly successful and motivated people to continue and retry with the graph at the end. The animations were also rated highly, even though they were really subtle, and other users who preferred not to be quoted mentioned that the overall experience while filling out the form was good. This is a huge step-up from Tally since over 3 quarters of people had dropped out before completing, showing an increase in user engagement. 
However, while people were submitting the contact form, it was experiencing abuse. Users were writing inappropriate forms, and others were spamming contact answers to fill my DB. I had to take the deployment down temporarily on Vercel, and thankfully, it is very easy to stop the deployment. To fix this, I implemented three things: 
•	I replaced the direct Formsubmit call with a call to my Vercel Serverless function, which will then call Formsubmit, to not expose my email ID hash and to stop users from spamming in the console 
•	I put a Cloudflare Turnstile verification. While this does not stop humans or profanity, it will still block any bots and bad actors who want to automate forms. 
•	I put a rate limit of two forms per minute. This is so that if users suddenly realise that they forgot to mention something, they can start a new form and add it without being rate-limited, while bad actors sending multiple forms per minute will see a friendly message on rate limits 
•	I integrated the Fast, Open-Source Profanity API code to check my form submission for profanity before submitting, and show an error if profane. 
Third Round 
This time, I tried to get as many people on the site as possible and just asked them to navigate the site normally while I collected data. I was collecting: 
•	Most clicked button 
•	Abuse of the contact form 
•	Answers regarding pain points 
•	How difficult it was to navigate the website 
The most clicked button was the Quiz button. This is what I had wanted, as it directly prompts the user into an interactive learning session, which keeps them on the site while providing quality education. Since this is a bright green button on the top bar, it is easy for users to see and press this button. 
The abuse on the contact form was much less, but there were now some complaints on the form. The profanity filter was unnecessarily blocking words that were not profane in the context, and other words that were not profane at all. The response was very direct, saying that the site is antisemitic and homophobic, among other things, blocking words like Jewish and gay. However, I don’t know how much of this hate is from users who have realised that their abuse tactics have stopped working, and how many users actually despise this change. Nevertheless, I have integrated an API change to use Profanity-Checker API instead, which looks like it is a V2 of the other API. This one still has the same ratings, but will send a list of bad words. If the list is empty, it will send. If it detects a bad word, it will kindly inform the user that the message has been flagged and cannot be sent, and that they need to send an email to wastewise@shimpi.dev. Since this email forwards to my personal Gmail account, it uses Gmail’s advanced spam, scam and profanity filters to automatically block users with bad messages while allowing genuine requests. I think this is a good compromise while still allowing the user to send if the request is real. 
This new version also blocks bots and scripts, since the messsage simple will not send without the Cloudflare Turnstile marking the user as not human. I specifically chose Cloudflare Turnstile, since, unlike ReCaptcha, it is much more private and even GDPR compliant for privacy, but more importantly, it verifies most users without them having to click the checkbox. For the small percentage (7% in my testing) of users who do have to click the checkbox, it does not ask them to ‘select all squares with a motorbike’ or similar prompts, making sure users do not drop out of form submission at this stage when they have already completed everything else. 
The only users annoyed by the rate limit were users who had used methods to abuse the form endpoint. Even now, there is still abuse; it is hard to block since it uses slang and different forms of obfuscation and misspellings, so that the API would not get it, though this is much less (only 1 submission). Since it is low, I have decided not to take action on this, as putting more filters could negatively impact the User Experience, which I do not want. 
Testing Sessions Summary 
Overall, I have implemented many changes, and all have improved the overall functionality and ultimately, the satisfaction of the user since I developed with the UI and UX in mind. This meant not to put aggressive and annoying popups (reCaptcha sometimes is annoying, so I didn’t add it), elements that could overwhelm the user (like the Tally form) and improving functions that could backfire (like the v1 Profanity API) while still retaining function. 
The overall demographics of this user testing were young Australians aged 13-25 who are new to recycling, and older Australians who have experience aged 40-50. During testing, people of all ages and demographics have commented on the site unofficially. While I did prioritise the changes mentioned during the specified rounds, I had also taken the other unofficial feedback mentions into account as in the real world, people of all ages will use this site. 
At the end, I had multiple contact submissions with good feedback. Some names have remained anonymous as the users have not explicitly given consent to show their names 
 
 	“Sahas Shimpi should be commended on all aspects of his excellent website”
— Sohil Bayyareddy 
 
 	“In my humble opinion, this is a top-tier website”
— Anonymous 
 
 	“[the website] deserves the congratulations of anyone viewing this due to the sheer quality of it”
— Anonymous 
 
 
Final Product Overview 
Features and Interactive Elements 
My resulting website has multiple interactive features and elements added throughout the site. 
1.	Contact form - Allows the user to submit feedback and other general queries about the site, and includes abuse protection with CAPTCHA, profanity detection, abuse-detection IP logging and an email reveal with obfuscation to protect against bots if the user is not comfortable sending via the integrated form 
2.	Quiz System - Allows the user to interact with the site by answering 10 questions of varying difficulty with explanations, and shows the user's score and the entire community’s score after finishing, with an interactive retake quiz button to further improve understanding 
3.	Recycling Centre Find - An interactive module that asks the user about their general location and item to recycle, and when the user submits it, they see a map of recycling centres (if any are available) with centre data, or an error mentioning they should check with the council if none are found 
4.	Impact Calculator - A recycling savings calculator implemented right in the home screen for ease of use, complete with exact savings per material 
5.	Community Poll - Asks the community what the greatest barrier is that stops them from recycling, and shows poll results once answered. It is helpful for people to understand and help each other 
6.	Articles Page - View interactive elements like YouTube videos right on the page, or click and access external articles 
7.	Navigation - Navigation to multiple pages with easy-to-use interactive buttons, all available from the home screen 
For these interactive elements to work, multiple APIs and embeds were required. Here is the list of APIs, embeds and external sites the site uses: 
Security 
•	api.ipify.org (via Vercel Functions endpoint) - fetches the user IP address for forms and quizzes to prevent abuse.  
•	ip-api.com (via Vercel Functions endpoint) - maps the IP to geolocation data, which includes City and ISP to prevent abuse.  
•	challenges.cloudflare.com/turnstile - Used for verifying if the user is human for submitting a contact form and checking the WasteWise official email address 
General Functionality 
•	datesapi.net - Fetches the current year to show copyright information in the footer (e.g. © 2026 WasteWise. All rights reserved.).  
•	formsubmit.co (via Vercel Functions endpoint) - used for sending the response from the contact form to my email address for free 
•	submify.vercel.app (via Vercel Functions endpoint) - used as an alternative to formsubmit.co if it is down (for example, at the time of writing, formsubmit.co is temporarily down) 
•	Vercel Analytics & Speed Insights - used for privacy-focused analytics and speed insights to collect generalised data on the site and improve performance over time 
Map 
•	photon.komoot.io - Used for the autocompletion of addresses typed in the Find section, can fetch for the entire world, but the bias is set to addresses in Sydney 
•	nomimatim.openstreetmap.org - Used for converting the text address into GeoJSON and coordinates for map parsing 
•	Leaflet - Used for plotting multiple points on an OpenStreetMap map 
RecycleMate 
•	api.recyclemate.com.au/v2/items (via Vercel Functions Endpoint) - Used for finding the items in the RecycleMate database that are recyclable 
•	api.recyclemate.com.au/v2/places/item/{itemId} (via Vercel Functions Endpoint) - Used for finding the locations of recyclable items, official websites, opening times by day and more in RecycleMate 
•	api.recyclemate.com.au/v2/councils (via Vercel Functions Endpoint) - Used for fetching council information in the RecycleMate database 
•	api.recyclemate.com.au/v2/location/maps/{mapId} (via Vercel Functions Endpoint) - Used for getting map location data from RecycleMate 
Database 
•	Write the NeonDB API fetches here 
 
There are also multiple other external dependencies the website relies on to ensure functionality: 
•	Astro Framework - This helped me to achieve many benefits with its free framework with ongoing support 
•	Node.js and NPM - Used for managing all of my Node modules for the development of this website.  
•	Vite - Used for building the website and converting the Astro into static HTML, CSS and JS 
•	GitHub - Used for the free hosting and syncing of all of my code to make sure it stays online and sends to relevant sources (like Vercel) 
•	Vercel - Used for the deployment of my site, and I specifically chose Vercel due to the serverless functions and storing of environment variables like my database keys in an encrypted format, not visible to the client. 
Without the help of all of these wonderful websites, I wouldn’t have been able to make WasteWise. I express my sincere thanks to all these websites, which I have used and integrated into the development of this website. 
Community Issue Addressed 
WasteWise fulfils its objective of addressing the lack of recycling in Australia through a combination of education, interactivity, data, calls to action, focus on user engagement and more. By providing data, the site shows the seriousness and the lack of attention to this topic, particularly in Australia. The recycling quiz tests users' knowledge of recycling beforehand, and their memory retention when they retry the test, and the articles effectively educate users on different aspects of recycling, based on extensive user feedback and test trials. The community quiz brings the scale into action by showing that ‘you are not alone’ in this, and there are many people around Australia who want to actively participate, based on the submission numbers that are growing every single day.  
Altogether, the website provides genuine insight into the current Australian stance on recycling with the numerous data collection methods throughout the site, with poll responses, quiz scores and contact submissions. At the time of writing, the website had over 50 total community responses with an average retry quiz rate of over 70%, showing that the education on this site is effective. The user testing shows a satisfaction rate of the website at around 84% based on verbal polls and questionnaires, ultimately showing how WasteWise reaches its goal with various different factors and methods spread across the website. 
