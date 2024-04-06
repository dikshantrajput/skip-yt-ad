// Initialize variables to keep track of previous URL and interval ID
let previousUrl = '';
let intervalId;
let intervalIdForMultipleAds;

const skipAd = () => {
    const skipAddButtons = document.getElementsByClassName("ytp-ad-skip-button-text");
    if (skipAddButtons.length === 1) {
        const button = skipAddButtons[0];
        const skipButtonCta = button.parentElement.classList.contains("ytp-ad-skip-button-modern");
        if (skipButtonCta) {
            button.parentElement.click();
            chrome.runtime.sendMessage({ action: 'adSkipped' });
            return true; // Indicate that the ad was skipped
        }
    }
    return false; // Indicate that the ad was not skipped
};

const manageRetries = (maxRetries, callback, intervalId) => {
    if(intervalId) clearInterval(intervalId)
    let retries = 0;
    intervalId = setInterval(() => {
        const adSkipped = callback();
        if (adSkipped || retries >= maxRetries) {
            clearInterval(intervalId);
        }
        retries++;
    }, 500); // Check every 500 milliseconds
};

const executeCallbackAfterTimeout = (duration, callback) => {
    const [minutes, seconds] = duration ? duration.split(':').map(Number) : [0, 0];
    const totalMilliseconds = (minutes * 60 + seconds) * 1000;
    setTimeout(callback, totalMilliseconds);
}

const findMultipleAdsComponent = () => {
    const multipleAdsComponent = document.querySelector(".ytp-ad-simple-ad-badge > .ytp-ad-text")
    if (multipleAdsComponent) {
        const durationOfFirstAdComponent = document.querySelector(".ytp-time-display.notranslate  .ytp-time-duration")
        if (durationOfFirstAdComponent) {
            const duration = durationOfFirstAdComponent.textContent
            // wait for these many minutes and seconds
            executeCallbackAfterTimeout(duration, () => {
                manageRetries(5, skipAd, intervalId)
            })
            return true
        }

    }
    return false
}

// Create a MutationObserver to detect changes in the DOM
const observer = new MutationObserver((mutations) => {
    // Check if the URL has changed
    if (window.location.href !== previousUrl) {
        // Update the previous URL
        previousUrl = window.location.href;
        // Clear any existing interval
        manageRetries(5, findMultipleAdsComponent, intervalIdForMultipleAds)
        manageRetries(5, skipAd, intervalId)

    }
});

// Define configuration for the MutationObserver
const config = { subtree: true, childList: true };

// Start observing changes in the document
observer.observe(document, config);
