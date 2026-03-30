(function () {
	const addressInput = document.getElementById('address-input');
	const itemInput = document.getElementById('item-input');
	const searchBtn = document.getElementById('search-btn');
	const addressSuggestions = document.getElementById('address-suggestions');
	const itemSuggestions = document.getElementById('item-suggestions');
	const resultsContainer = document.getElementById('results-container');
	const itemInfo = document.getElementById('item-info');
	const locationsList = document.getElementById('locations-list');
	const mapContainer = document.getElementById('map-container');
	const mapElement = document.getElementById('map');

	let currentLocation = null;
	let selectedItem = null;
	let debounceTimer = null;

	//nominatim geocoding
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

	//address autocomplete
	addressInput.addEventListener('input', () => {
		clearTimeout(debounceTimer);
		const query = addressInput.value.trim();
		
		if (query.length < 3) {
			addressSuggestions.innerHTML = '';
			addressSuggestions.classList.remove('active');
			return;
		}

		debounceTimer = setTimeout(async () => {
			const results = await geocodeAddress(query);
			
			if (results.length > 0) {
				addressSuggestions.innerHTML = results.map(r => 
					`<div class="suggestion-item" data-lat="${r.lat}" data-lon="${r.lon}" data-display="${r.display_name}">
						${r.display_name}
					</div>`
				).join('');
				addressSuggestions.classList.add('active');
				
				//bind click events
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

	//searching autocomplete
	itemInput.addEventListener('input', () => {
		clearTimeout(debounceTimer);
		const query = itemInput.value.trim();
		
		if (query.length < 2) {
			itemSuggestions.innerHTML = '';
			itemSuggestions.classList.remove('active');
			return;
		}

		debounceTimer = setTimeout(async () => {
			try {
				const response = await fetch(`/api/recyclemate-items?q=${encodeURIComponent(query)}`);
				const items = await response.json();
				
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

			// Fetch recycling locations
			const placesResponse = await fetch(
				`/api/recyclemate-places?itemId=${itemId}&lat=${currentLocation.lat}&lng=${currentLocation.lng}`
			);
			const places = await placesResponse.json();

			if (places && places.length > 0) {
				displayLocations(places);
				displayMap(places, currentLocation);
			} else {
				locationsList.innerHTML = '<p class="no-results">No recycling locations found nearby for this item.</p>';
			}

			resultsContainer.classList.remove('hidden');
		} catch (err) {
			console.error('Search error:', err);
			alert('An error occurred while searching. Please try again.');
		} finally {
			searchBtn.disabled = false;
			searchBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> Search';
		}
	});

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
