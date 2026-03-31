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
	let photonSelected = null;
	let map = null;
	let tileLayer = null;
	let markersLayer = null;
	let userMarker = null;
	let placeMarkers = [];
	let photonBias = { lat: -33.8688, lng: 151.2093 };

	try {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					photonBias = { lat: pos.coords.latitude, lng: pos.coords.longitude };
				},
				() => {},
				{ maximumAge: 10 * 60 * 1000, timeout: 2000 }
			);
		}
	} catch (_) {}

	function normalizeText(s) {
		return String(s || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.trim();
	}

	function calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 6371;
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	function featureLabel(f) {
		const p = f?.properties || {};
		const parts = [];
		const name = p.name || p.street || '';
		if (name) parts.push(name);
		if (p.housenumber) parts.push(p.housenumber);
		if (p.postcode) parts.push(p.postcode);
		if (p.city) parts.push(p.city);
		if (p.state) parts.push(p.state);
		if (p.country) parts.push(p.country);
		return parts.filter(Boolean).join(', ').replace(/\s+,/g, ',').trim();
	}

	function featureTypeWeight(f) {
		const p = f?.properties || {};
		const osmKey = String(p.osm_key || '');
		const osmValue = String(p.osm_value || '');
		const type = String(p.type || '');

		const v = `${osmKey}:${osmValue}:${type}`;
		if (/building|house|address/.test(v)) return 3.0;
		if (/residential|street/.test(v)) return 2.3;
		if (/suburb|neighbourhood|district/.test(v)) return 1.6;
		if (/city|town|village/.test(v)) return 1.2;
		if (/state|country/.test(v)) return 0.6;
		return 1.0;
	}

	function textMatchScore(query, label) {
		const q = normalizeText(query);
		const l = normalizeText(label);
		if (!q || !l) return 0;
		if (l === q) return 3;
		if (l.startsWith(q)) return 2;
		if (l.includes(q)) return 1;
		return 0;
	}

	function scoreFeature(f, query) {
		const coords = f?.geometry?.coordinates;
		const lng = Array.isArray(coords) ? Number(coords[0]) : NaN;
		const lat = Array.isArray(coords) ? Number(coords[1]) : NaN;
		const distKm = Number.isFinite(lat) && Number.isFinite(lng)
			? calculateDistance(photonBias.lat, photonBias.lng, lat, lng)
			: 9999;

		const label = featureLabel(f);
		const match = textMatchScore(query, label);
		const typeW = featureTypeWeight(f);
		const distW = 1 / (1 + distKm / 3);
		return match * 2.2 + typeW * 1.4 + distW * 2.0;
	}

	async function photonSearch(address) {
		try {
			const url = new URL('https://photon.komoot.io/api/');
			url.searchParams.set('q', address);
			url.searchParams.set('limit', '6');
			url.searchParams.set('lang', 'en');
			url.searchParams.set('lat', String(photonBias.lat));
			url.searchParams.set('lon', String(photonBias.lng));
			const response = await fetch(url.toString());
			if (!response.ok) return [];
			const data = await response.json();
			const features = Array.isArray(data?.features) ? data.features : [];
			return features
				.map((f) => ({ f, s: scoreFeature(f, address) }))
				.sort((a, b) => b.s - a.s)
				.map((x) => x.f);
		} catch (err) {
			console.error('Geocoding error:', err);
			return [];
		}
	}

	// Address autocomplete
	addressInput.addEventListener('input', () => {
		clearTimeout(debounceTimer);
		const query = addressInput.value.trim();
		photonSelected = null;
		
		if (query.length < 3) {
			addressSuggestions.innerHTML = '';
			addressSuggestions.classList.remove('active');
			addressLoading.classList.add('hidden');
			return;
		}

		// Show loading indicator
		addressLoading.classList.remove('hidden');

		debounceTimer = setTimeout(async () => {
			const results = await photonSearch(query);
			
			// Hide loading indicator
			addressLoading.classList.add('hidden');
			
			if (results.length > 0) {
				addressSuggestions.innerHTML = results.map((r) => {
					const coords = r?.geometry?.coordinates;
					const lon = Array.isArray(coords) ? coords[0] : '';
					const lat = Array.isArray(coords) ? coords[1] : '';
					const label = featureLabel(r);
					const safeLabel = String(label || '').replace(/"/g, '&quot;');
					return `<div class="suggestion-item" data-lat="${lat}" data-lon="${lon}" data-display="${safeLabel}">${label}</div>`;
				}).join('');
				addressSuggestions.classList.add('active');
				
				// Bind click events
				addressSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
					item.addEventListener('click', () => {
						addressInput.value = item.getAttribute('data-display');
						currentLocation = {
							lat: parseFloat(item.getAttribute('data-lat')),
							lng: parseFloat(item.getAttribute('data-lon'))
						};
						photonSelected = {
							label: item.getAttribute('data-display'),
							lat: currentLocation.lat,
							lng: currentLocation.lng
						};
						addressSuggestions.innerHTML = '';
						addressSuggestions.classList.remove('active');
						try {
							if (map && currentLocation) {
								setUserMarker(currentLocation);
								map.setView([currentLocation.lat, currentLocation.lng], 14);
							}
						} catch (_) {}
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
		
		places.forEach((place, index) => {
			html += `
				<div class="location-card" data-place-id="${place._id}" data-index="${index}">
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
					${place.website ? `<p><a href="${place.website}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Visit Website</a></p>` : ''}
					${place.facilityMessage ? `<p class="facility-message">${place.facilityMessage}</p>` : ''}
				</div>
			`;
		});

		locationsList.innerHTML = html;
		
		// Add click handlers to location cards
		locationsList.querySelectorAll('.location-card').forEach(card => {
			card.addEventListener('click', () => {
				const idx = Number(card.getAttribute('data-index'));
				// Remove active class from all cards
				locationsList.querySelectorAll('.location-card').forEach(c => c.classList.remove('active'));
				// Add active class to clicked card
				card.classList.add('active');
				// Scroll card into view
				card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				try {
					const marker = Number.isFinite(idx) ? placeMarkers[idx] : null;
					if (map && marker) {
						map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14), { animate: true });
						if (marker.getPopup()) marker.openPopup();
					}
				} catch (_) {}
			});
		});
	}

	function ensureMap() {
		if (map) return;
		if (!mapElement) return;
		if (typeof window === 'undefined' || !window.L) return;

		map = window.L.map(mapElement, {
			zoomControl: true,
			attributionControl: true
		});

		tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; OpenStreetMap contributors'
		});
		tileLayer.addTo(map);

		markersLayer = window.L.layerGroup().addTo(map);
		map.setView([photonBias.lat, photonBias.lng], 12);
	}

	function setUserMarker(userLocation) {
		ensureMap();
		if (!map || !markersLayer) return;
		if (userMarker) {
			markersLayer.removeLayer(userMarker);
			userMarker = null;
		}
		userMarker = window.L.marker([userLocation.lat, userLocation.lng]);
		userMarker.bindPopup('Your location');
		markersLayer.addLayer(userMarker);
	}

	function clearPlaceMarkers() {
		if (!markersLayer) return;
		placeMarkers.forEach((m) => {
			try {
				markersLayer.removeLayer(m);
			} catch (_) {}
		});
		placeMarkers = [];
	}

	function displayMap(places, userLocation) {
		mapContainer.classList.remove('hidden');

		ensureMap();
		if (!map || !window.L) return;

		setUserMarker(userLocation);
		clearPlaceMarkers();

		const bounds = window.L.latLngBounds([[userLocation.lat, userLocation.lng]]);

		places.forEach((place, idx) => {
			const coords = place.location?.coordinates;
			if (!coords || coords.length !== 2) return;
			const [lng, lat] = coords;
			const marker = window.L.marker([lat, lng]);
			marker.bindPopup(`<strong>${place.name || 'Location'}</strong><br/>${place.address || ''}`);
			markersLayer.addLayer(marker);
			placeMarkers[idx] = marker;
			bounds.extend([lat, lng]);
		});

		setTimeout(() => {
			try {
				map.invalidateSize();
				map.fitBounds(bounds.pad(0.2));
			} catch (_) {}
		}, 0);
	}
})();
