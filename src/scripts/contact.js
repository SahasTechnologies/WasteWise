document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('finished') === 'true') {
        const formView = document.getElementById('form-view');
        const successView = document.getElementById('success-view');
        if (formView && successView) {
            formView.classList.add('hidden');
            successView.classList.remove('hidden');
        }
    }
});
