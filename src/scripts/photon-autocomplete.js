export default (function initPhoton() {
    
    const input = document.getElementById('address');
    if (!input) return;

    const form = input.closest('form'); //?? is const form= input... not allowed
    if (!form) return;

    let dropdown = document.createElement('div');
    dropdown.className = 'photon-dropdown';

    let selected = null;
    let lastController = null;
    let activeIndex = -1;
    let currentItems = [];
    let loading = false;


    fetch('https://photon.komoot.io/api/?q=sydney&limit=1&lang=en&lat=-33.8688&lon=151.2093').catch(() => {});
    // yeah sorry its sydney only

    function ensureDropdown() {
        if (!dropdown.isConnected) {
            const wrap = input.closest('.input-wrap') || input.parentElement;

            if (wrap) {
                wrap.style.position = 'relative'; //theory of relativity 🧠🤓
                wrap.appendChild(dropdown); //sorry for the last comment... im skipping sci revision for this even though its nothing related to theory of realtivity
            } // my exam is on waves and all the stuff in waves bro i need to studyyyyy for this and history and maths and english and computing and commerce and japanese

            else { document.body.appendChild(dropdown); }
        }
    }


    function clearDropdown() {
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
        activeIndex = -1;
        currentItems = [];
    }



    function setLoading(on) {
        loading = on;
        if (!on) {
            dropdown.style.display = 'none';
            return;
        }
        ensureDropdown();
        dropdown.innerHTML = '';
        dropdown.style.display = 'block';
        const div = document.createElement('div');
        div.className = 'photon-loading';
        div.textContent = 'Loading';
        dropdown.appendChild(div);
    }
    // to future me: i tried to make it as easy as possible to read with perfect formatting
    // but its probably still bad


    function showNoResults() {
        ensureDropdown();
        dropdown.innerHTML  = '';
        dropdown.style.display = 'block';
        currentItems = [];
        activeIndex = -1;
        const div = document.createElement('div');
        div.className = 'photon-loading';
        div.textContent = 'No results found';
        dropdown.appendChild(div);
    }

    function showDropdown(items) {
        ensureDropdown();
        dropdown.innerHTML = '';
        dropdown.style.display = 'block';
        currentItems = items;
        activeIndex = -1;

            items.forEach((f, idx) => {
                const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'photon-option';
                    btn.dataset.index = String(idx);


                        const props = f.properties || {};
                        const label = props.name || props.street || props.city || props.country || '';
                        const postcode = props.postcode ? ` ${props.postcode}` : '';
                        const city = props.city ? `, ${props.city}` : '';
                        const state = props.state ? `, ${props.state}` : '';
                        const country = props.country ? `, ${props.country}` : '';
			            btn.textContent = `${label}${postcode}${city}${state}${country}`.trim();
                        // yk btn is an australian kids news show... i used to watch it in primary

                            btn.addEventListener('click', () => {
                                selected = f;
                                input.value = btn.textContent || '';
                                input.dataset.photonId = props.osm_id ? String(props.osm_id) : '';
                                clearDropdown();
                            });

                            btn.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                            });

                            dropdown.appendChild(btn);
            });


    }


    async function fetchSuggestions(q) {
        if (lastController) lastController.abort();
        lastController =  new AbortController();

            const url = new URL('https://photon.komoot.io/api/');
                url.searchParams.set('q', q);
                url.searchParams.set('limit', '6');
                url.searchParams.set('lang', 'en');
                // the sydney-ish lat lon
                url.searchParams.set('lat', '-33.8688');
                url.searchParams.set('lon', '151.2093');

                   const res = await fetch(url.toString(), { signal: lastController.signal });
		            if (!res.ok) return [];
                    const data = await res.json();
                    return Array.isArray(data.features) ? data.features : [];
    }

    let t = null;

    input.addEventListener('input', () => {
        selected = null;
        input.dataset.photonId = '';
        const q = input.value.trim();

            if (q.length < 3) {
                clearDropdown();
                return;
            }

            if (t) clearTimeout(t);
            t = setTimeout(async()=>{
                    const minLoadingTime = 600;
                    const startTime = Date.now();
                    const qAtStart = input.value.trim();

                    try{
                        setLoading(true);

                        const features = await fetchSuggestions(qAtStart);
                        const elapsed = Date.now() - startTime;
                        const remaining = Math.max(0, minLoadingTime - elapsed);
                        
                        await new Promise(r => setTimeout(r, remaining));
                        setLoading(false);

                        if (input.value.trim() !== qAtStart) return;

                        if (!features.length) {
                            showNoResults();
                            return;
                        }

                        showDropdown(features);
                    } catch (e) {
                        if (e && e.name === 'AbortError') return;
                        console.error('Photon fetch failed', e);
                        const elapsed = Date.now() - startTime;
                        const remaining  = Math.max(0, minLoadingTime - elapsed);

                        await new Promise(r => setTimeout(r, remaining));
                        setLoading(false);
                        clearDropdown();
                    }
            }, 200);
    });

    input.addEventListener('keydown', (e) => {
        if (dropdown.style.display === 'none' || (!currentItems || !currentItems.length)) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(currentItems.length  -  1, activeIndex + 1);
            updateActive();
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(0, activeIndex - 1);
            updateActive();
        }

        if (e.key === 'Enter') {
            if (activeIndex >= 0) {
                e.preventDefault();
                const el = dropdown.querySelector(`.photon-option[data-index="${activeIndex}"]`);
                if (el) el.click();
            }
        }

        if (e.key === 'Escape') {clearDropdown();}
    });

    function updateActive() {
        dropdown.querySelectorAll('.photon-option').forEach((el) => {
            el.classList.remove('is-active');
        });

        const active = dropdown.querySelector(`.photon-option[data-index="${activeIndex}"]`);

        if (active) {
            active.classList.add('is-active');
            active.scrollIntoView({ block: 'nearest'});
        }

    }


    input.addEventListener('blur', () => {
        setTimeout(() => clearDropdown(), 150);
    });

    document.addEventListener('mousedown', (e) => {
        const target = e.target;
        if (!(target instanceof Node)) return;
        if (target === input) return;
        if (dropdown.contains(target)) return;
        clearDropdown();
    });


    form.addEventListener('submit', (e) => {
        if (!input.value.trim()) return;

        if (loading) {
            e.preventDefault();
            return;
        }

        if (!selected) {
            e.preventDefault();
            input.focus();
        }
    });
})();