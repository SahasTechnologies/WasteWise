// Set current year
function updateYear() {
    const yearSpan = document.getElementById('current-year');
    if (!yearSpan) return;
    yearSpan.textContent = new Date().getFullYear();
}

updateYear();
