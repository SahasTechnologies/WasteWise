# How to Collect RecycleMate Location Data

Since RecycleMate's API requires authentication for some endpoints, you need to manually collect the data from their website.

## Quick Collection Method (Recommended)

1. **Open RecycleMate Website**
   - Go to https://recyclemate.com.au
   - Open Developer Tools (F12)
   - Go to the **Console** tab

2. **Paste this collection script:**

```javascript
// RecycleMate Data Collector
const collectedPlaces = new Map(); // Use Map to avoid duplicates

// Intercept fetch to capture place data
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch(...args);
  const url = args[0];
  
  // Capture individual place details
  if (typeof url === 'string' && url.match(/\/v2\/places\/\d+$/)) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      if (data._id) {
        collectedPlaces.set(data._id, data);
        console.log('✓ Collected:', data.name, '| Total:', collectedPlaces.size);
      }
    } catch (e) {
      console.error('Error parsing place:', e);
    }
  }
  
  return response;
};

// Download function
window.downloadRecyclingData = function() {
  const places = Array.from(collectedPlaces.values());
  
  const output = {
    locations: places,
    lastUpdated: new Date().toISOString().split('T')[0],
    totalLocations: places.length,
    collectionInfo: "Collected from recyclemate.com.au"
  };
  
  const dataStr = JSON.stringify(output, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recycling-locations.json';
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('✓ Downloaded', places.length, 'locations');
  console.log('Save this file as: src/data/recycling-locations.json');
};

console.log('✓ Data collector ready!');
console.log('1. Search for items and click on locations');
console.log('2. When done, run: downloadRecyclingData()');
```

3. **Collect Data**
   - Search for common items: "battery", "plastic", "glass", "electronics", "cardboard", "clothes"
   - Click on different locations on the map
   - Each click will capture that location's data
   - Watch the console for "✓ Collected" messages

4. **Download the Data**
   - When you've collected enough locations (aim for 50-100), type in console:
   ```javascript
   downloadRecyclingData()
   ```
   - Save the downloaded file

5. **Replace the Data File**
   - Save the downloaded file as `src/data/recycling-locations.json`
   - Replace the existing file in your project

## What the Data Looks Like

Each location has this structure:
```json
{
  "_id": "66ebe2f5152a07ef4434bfa5",
  "id": "38871",
  "name": "Fairfield City Council Recycling Drop Off Centre",
  "address": "Widemere Rd, Wetherill Park NSW 2164, Australia",
  "location": {
    "type": "Point",
    "coordinates": [150.913016, -33.8369634]
  },
  "openingHours": ["Monday: Closed", "Saturday: 8:00 AM – 3:30 PM"],
  "website": "https://...",
  "type": "Waste Facility",
  "itemTypes": ["32:E Waste Large Appliances", "38:Steel cans", ...]
}
```

## Tips for Best Coverage

1. **Search Multiple Items**
   - Batteries (all types)
   - Electronics (phones, computers, TVs)
   - Plastics (bottles, containers, soft plastics)
   - Glass
   - Cardboard/Paper
   - Textiles/Clothing
   - Furniture
   - Chemicals/Paint
   - Garden waste

2. **Click on Different Locations**
   - Click on various markers on the map
   - Try different suburbs/areas
   - Each click captures that location's full details

3. **Check Your Progress**
   - The console shows how many locations you've collected
   - Aim for at least 50-100 locations for good coverage

## After Collection

Once you have the data:
1. Save it as `src/data/recycling-locations.json`
2. The app will automatically use this data
3. Users can search and see locations on the map
4. Update the data every few months to keep it current

## Troubleshooting

**If the script doesn't work:**
- Make sure you're on https://recyclemate.com.au
- Refresh the page and paste the script again
- Check that you're clicking on location markers (not just searching)

**If no data is collected:**
- The script captures data when you click on map markers
- Make sure to actually click on the location pins on the map
- Each click should show "✓ Collected" in the console

