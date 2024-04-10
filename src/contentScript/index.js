/**
 * Initializes the ad skipping functionality and observes changes in the target node.
 * @param {Node} targetNode - The node to observe for changes.
*/
// variable to store the MutationObserver instance
let observer;

// Function to handle ad skipping logic
const execute = (targetNode) => {

    // Function to skip the ad
    const skipAd = () => {
        const skipAddButtons = document.getElementsByClassName("ytp-ad-skip-button-text");
        if (skipAddButtons.length === 1) {
            const button = skipAddButtons[0];
            const skipButtonCta = button.parentElement.classList.contains("ytp-ad-skip-button-modern");
            if (skipButtonCta) {
                chrome.runtime.sendMessage({ action: 'adSkipped' });
                button.parentElement.click();
            }
        }
    };

    // Function to check if a node has child elements
    const checkChildElements = (node) => {
        return node?.children?.length > 0
    }

    // Function to check for child elements and skip ad
    const checkForChildElementAndSkipAd = (node) => {
        checkChildElements(node) && skipAd()
    }

    // Callback function for MutationObserver
    const observerCallback = (mutationsList, observer) => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                checkForChildElementAndSkipAd(targetNode)
            }
        }
    }

    // Disconnect existing observer if any
    if(observer && observer.disconnect) {
        observer.disconnect()
    }

    // Create a new MutationObserver to observe targetNode
    observer = new MutationObserver(observerCallback);
    observer.observe(targetNode, { childList: true });

    // Check for child elements and skip ad initially
    checkForChildElementAndSkipAd(targetNode)
}

/**
 * Handles changes in the URL and triggers ad skipping logic accordingly.
*/

// Variable to store the previous URL
let previousUrl = ''

// Function to handle URL changes
const handleUrlChange = () => {
    // Check if URL has changed
    if (window.location.href !== previousUrl) {
        // Find the targetNode containing video ads
        const targetNode = document.querySelector(".video-ads.ytp-ad-module");
        // Execute ad skipping logic if targetNode exists
        targetNode && execute(targetNode)
        // Update previousUrl with current URL
        previousUrl = window.location.href;
    }
}

/**
 * Observes changes in the <head> element to detect URL changes.
*/
// MutationObserver to observe changes to the <head> element for URL changes
const observerForUrlChange = new MutationObserver(handleUrlChange);
observerForUrlChange.observe(document.querySelector('head'), { childList: true });
