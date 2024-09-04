// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log('Reel Href Extractor extension installed.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    if (message.action === 'reprocessReels') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Error injecting content script:', chrome.runtime.lastError);
                    } else {
                        console.log('Content script re-injected successfully.');
                    }
                });
            }
        });
    }
});

// Listen for the extension icon click
chrome.action.onClicked.addListener((tab) => {
    console.log(tab);
    // Send a message to the active tab to reprocess reels
    chrome.tabs.sendMessage(tab.id, { action: 'reprocessReels' });
});
