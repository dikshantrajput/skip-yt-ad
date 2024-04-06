chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'adSkipped') {
    chrome.storage.local.get('adCount', function(data) {
      const adCount = data.adCount || 0;
      chrome.storage.local.set({ 'adCount': adCount + 1 });
    });
  }
});
