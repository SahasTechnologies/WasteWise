// Fetch current year from datesapi.net
async function updateYear() {
    const yearSpan = document.getElementById('current-year');
    if (!yearSpan) return;

    try {
        const response = await fetch('https://api.datesapi.net/today');
        if (response.ok) {
            const data = await response.json();
            if (data && data.result) {
                // data.result is in format YYYY-MM-DD
                const year = data.result.split('-')[0];
                yearSpan.textContent = year;
                return;
            }
        }
    } catch (error) {
        console.error('Failed to fetch date:', error);
    }

    // Fallback to local date if API fails
    yearSpan.textContent = new Date().getFullYear();
}

updateYear();
