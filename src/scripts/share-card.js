function initializeShare() {
    const shareUrl = window.location.origin;
    const shareTitle = 'WasteWise - Recycling made easy for everyone';
    const shareText = 'Check out WasteWise to learn about recycling, find local drop-off points, and see your environmental impact!';

    const facebookBtn = document.getElementById('share-facebook');
    const whatsappBtn = document.getElementById('share-whatsapp');
    const linkedinBtn = document.getElementById('share-linkedin');
    const copyBtn = document.getElementById('share-copy');
    const toast = document.getElementById('share-toast');

    function showToast() {
        if (toast) {
            toast.classList.add('visible');
            setTimeout(() => {
                toast.classList.remove('visible');
            }, 2000);
        }
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast();
        });
    }

    if (facebookBtn) {
        facebookBtn.onclick = () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
        };
    }

    if (whatsappBtn) {
        whatsappBtn.onclick = () => {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        };
    }

    if (linkedinBtn) {
        linkedinBtn.onclick = () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
        };
    }

    if (copyBtn) copyBtn.onclick = copyToClipboard;
}

// Run on initial load
initializeShare();

// View transitions support
document.addEventListener('astro:after-swap', initializeShare);
