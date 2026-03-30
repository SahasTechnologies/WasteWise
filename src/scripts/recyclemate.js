(function () {
	const addressInput = document.getElementById('address-input');
	const itemInput = document.getElementById('item-input');
	const searchBtn = document.getElementById('search-btn');
	const addressSuggestions = document.getElementById('address-suggestions');
	const itemSuggestions = document.getElementById('item-suggestions');
	const addressLoading = document.getElementById('address-loading');
	const itemLoading = document.getElementById('item-loading');
	const resultsContainer = document.getElementById('results-container');
	const itemInfo = document.getElementById('item-info');
	const locationsList = document.getElementById('locations-list');
	const mapContainer = document.getElementById('map-container');
	const mapElement = document.getElementById('map');

	let currentLocation = null;
	let selectedItem = null;
	let debounceTimer = null;

	// Geocode address using Nominatim
	async function geocodeAddress(address) {
		try {
			const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(address)}`;
			const response = await fetch(url, {
				headers: { 'User-Agent': 'WasteWise/1.0' }
			});
			const data = await response.json();
			return data;
		} catch (err) {
			console.error('Geocoding error:', err);
			return [];
		}
	}

	// Address autocomplete
	addressInput.addEventListener('input', () => {
		clearTimeout(debounceTimer);
		const query = addressInput.value.trim();
		
		if (query.length < 3) {
			addressSuggestions.innerHTML = '';
			addressSuggestions.classList.remove('active');
			addressLoading.classList.add('hidden');
			return;
		}

		// Show loading indicator
		addressLoading.classList.remove('hidden');

		debounceTimer = setTimeout(async () => {
			const results = await geocodeAddress(query);
			
			// Hide loading indicator
			addressLoading.classList.add('hidden');
			
			if (results.length > 0) {
				addressSuggestions.innerHTML = results.map(r => 
					`<div class="suggestion-item" data-lat="${r.lat}" data-lon="${r.lon}" data-display="${r.display_name}">
						${r.display_name}
					</div>`
				).join('');
				addressSuggestions.classList.add('active');
				
				// Bind click events
				addressSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
					item.addEventListener('click', () => {
						addressInput.value = item.getAttribute('data-display');
						currentLocation = {
							lat: parseFloat(item.getAttribute('data-lat')),
							lng: parseFloat(item.getAttribute('data-lon'))
						};
						addressSuggestions.innerHTML = '';
						addressSuggestions.classList.remove('active');
					});
				});
			} else {
				addressSuggestions.innerHTML = '';
				addressSuggestions.classList.remove('active');
			}
		}, 300);
	});

	// Item search autocomplete
	itemInput.addEventListener('input', () => {
		clearTimeout(debounceTimer);
		const query = itemInput.value.trim();
		
		if (query.length < 2) {
			itemSuggestions.innerHTML = '';
			itemSuggestions.classList.remove('active');
			itemLoading.classList.add('hidden');
			return;
		}

		// Show loading indicator
		itemLoading.classList.remove('hidden');

		debounceTimer = setTimeout(async () => {
			try {
				const response = await fetch(`/api/recyclemate-items?q=${encodeURIComponent(query)}`);
				const items = await response.json();
				
				// Hide loading indicator
				itemLoading.classList.add('hidden');
				
				if (items && items.length > 0) {
					itemSuggestions.innerHTML = items.slice(0, 8).map(item => 
						`<div class="suggestion-item" data-item='${JSON.stringify(item)}'>
							${item.name}
						</div>`
					).join('');
					itemSuggestions.classList.add('active');
					
					// Bind click events
					itemSuggestions.querySelectorAll('.suggestion-item').forEach(elem => {
						elem.addEventListener('click', () => {
							const itemData = JSON.parse(elem.getAttribute('data-item'));
							itemInput.value = itemData.name;
							selectedItem = itemData;
							itemSuggestions.innerHTML = '';
							itemSuggestions.classList.remove('active');
						});
					});
				} else {
					itemSuggestions.innerHTML = '';
					itemSuggestions.classList.remove('active');
				}
			} catch (err) {
				console.error('Item search error:', err);
				itemLoading.classList.add('hidden');
			}
		}, 300);
	});

	// Close suggestions when clicking outside
	document.addEventListener('click', (e) => {
		if (!addressInput.contains(e.target) && !addressSuggestions.contains(e.target)) {
			addressSuggestions.classList.remove('active');
		}
		if (!itemInput.contains(e.target) && !itemSuggestions.contains(e.target)) {
			itemSuggestions.classList.remove('active');
		}
	});

	// Search button handler
	searchBtn.addEventListener('click', async () => {
		if (!currentLocation) {
			alert('Please select an address from the suggestions');
			return;
		}
		
		if (!selectedItem) {
			alert('Please select an item from the suggestions');
			return;
		}

		searchBtn.disabled = true;
		searchBtn.textContent = 'Searching...';

		try {
			// Display item information
			displayItemInfo(selectedItem);

			// Get item ID for places search
			let itemId = selectedItem.id;
			
			// If item has components, use the first component's ID
			if (selectedItem.components && selectedItem.components.length > 0) {
				itemId = selectedItem.components[0].id;
			}

			// Try to fetch from API first, fallback to local data
			let places = [];
			
			try {
				const placesResponse = await fetch(
					`/api/recyclemate-places?itemId=${itemId}&lat=${currentLocation.lat}&lng=${currentLocation.lng}`
				);
				places = await placesResponse.json();
			} catch (apiError) {
				console.log('API failed, using local data:', apiError);
			}

			// If API returns empty or fails, use local data
			if (!places || places.length === 0) {
				try {
					const localResponse = await fetch('/src/data/recycling-locations.json');
					const localData = await localResponse.json();
					
					// Filter locations within 50km radius
					if (localData.locations && localData.locations.length > 0) {
						places = localData.locations.filter(place => {
							if (!place.location || !place.location.coordinates) return false;
							const [lng, lat] = place.location.coordinates;
							const distance = calculateDistance(
								currentLocation.lat, currentLocation.lng,
								lat, lng
							);
							return distance <= 50; // 50km radius
						}).sort((a, b) => {
							const distA = calculateDistance(
								currentLocation.lat, currentLocation.lng,
								a.location.coordinates[1], a.location.coordinates[0]
							);
							const distB = calculateDistance(
								currentLocation.lat, currentLocation.lng,
								b.location.coordinates[1], b.location.coordinates[0]
							);
							return distA - distB;
						});
					}
				} catch (localError) {
					console.error('Local data error:', localError);
				}
			}

			if (places && places.length > 0) {
				displayLocations(places);
				displayMap(places, currentLocation);
			} else {
				// Show helpful message with link to RecycleMate
				locationsList.innerHTML = `
					<div class="no-results-card">
						<h3>Find Recycling Locations</h3>
						<p>To find specific recycling locations for <strong>${selectedItem.name}</strong> near you, please visit RecycleMate directly:</p>
						<a href="https://recyclemate.com.au" target="_blank" rel="noopener noreferrer" class="recyclemate-link">
							Visit RecycleMate →
						</a>
						<p class="help-text">RecycleMate provides detailed information about recycling locations, collection services, and disposal options in your area.</p>
					</div>
				`;
			}

			resultsContainer.classList.remove('hidden');
		} catch (err) {
			console.error('Search error:', err);
			locationsList.innerHTML = '<p class="no-results">An error occurred while searching. Please try again.</p>';
			resultsContainer.classList.remove('hidden');
		} finally {
			searchBtn.disabled = false;
			searchBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> Search';
		}
	});

	// Calculate distance between two coordinates (Haversine formula)
	function calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 6371; // Earth's radius in km
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLon/2) * Math.sin(dLon/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	}

	function displayItemInfo(item) {
		let html = `<h2>${item.name}</h2>`;
		
		if (item.message) {
			html += `<p class="item-message">${item.message}</p>`;
		}
		
		if (item.wasteType) {
			html += `<p class="item-waste-type"><strong>Category:</strong> ${item.wasteType}</p>`;
		}

		if (item.components && item.components.length > 0) {
			html += '<div class="item-components"><h3>Options:</h3><ul>';
			item.components.forEach(comp => {
				html += `<li><strong>${comp.name}</strong>`;
				if (comp.message) {
					html += ` - ${comp.message}`;
				}
				html += '</li>';
			});
			html += '</ul></div>';
		}

		itemInfo.innerHTML = html;
	}

	function displayLocations(places) {
		let html = '<h3>Nearby Recycling Locations</h3>';
		
		places.slice(0, 10).forEach((place, index) => {
			html += `
				<div class="location-card">
					<h4>${index + 1}. ${place.name}</h4>
					<p class="location-address">${place.address}</p>
					${place.openingHours ? `
						<details class="location-hours">
							<summary>Opening Hours</summary>
							<ul>
								${place.openingHours.map(h => `<li>${h}</li>`).join('')}
							</ul>
						</details>
					` : ''}
					${place.website ? `<p><a href="${place.website}" target="_blank" rel="noopener">Visit Website</a></p>` : ''}
					${place.facilityMessage ? `<p class="facility-message">${place.facilityMessage}</p>` : ''}
				</div>
			`;
		});

		locationsList.innerHTML = html;
	}

	function displayMap(places, userLocation) {
		mapContainer.classList.remove('hidden');
		
		// Create a simple embedded map with markers
		const markers = places.slice(0, 10).map((place, i) => {
			const coords = place.location?.coordinates;
			if (coords && coords.length === 2) {
				return `&marker=${coords[1]},${coords[0]}`;
			}
			return '';
		}).join('');

		const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.05},${userLocation.lat - 0.05},${userLocation.lng + 0.05},${userLocation.lat + 0.05}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`;
		
		mapElement.innerHTML = `<iframe width="100%" height="100%" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${mapUrl}"></iframe>`;
	}
})();
