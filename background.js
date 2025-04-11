// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log('Reel Href Extractor extension installed.');
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(tabId, changeInfo);
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

