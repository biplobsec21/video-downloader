(function () {
    let lastCheckedCount = 0; // Track the number of loaded reels

    // Function to create a download button and append it to the reel
    function createDownloadButton(reelElement, videoUrl) {
        const button = document.createElement('button');
        button.innerText = 'Download';
        button.style.position = 'absolute';
        button.style.top = '10px'; // Adjust as necessary
        button.style.left = '10px'; // Adjust as necessary
        button.style.zIndex = '1000';
        button.onclick = () => {
            console.log('Downloading video:', videoUrl);
            // Add your download logic here
        };
        reelElement.appendChild(button);
    }

    // Function to store reels data in chrome.storage.local
    function storeReelsData(reelsData) {
        chrome.storage.local.get('reelsData', function (result) {
            const existingReels = result.reelsData || [];
            const existingReelsMap = new Map(existingReels.map(reel => [reel.href, reel]));

            reelsData.forEach(reel => {
                existingReelsMap.set(reel.href, reel);
                const reelElement = document.querySelector(`a[href="${reel.href}"]`);
                if (reelElement) {
                    createDownloadButton(reelElement, reel.href); // Ensure button is created for new reels
                }
            });

            const updatedReels = Array.from(existingReelsMap.values());
            chrome.storage.local.set({ 'reelsData': updatedReels }, function () {
                if (chrome.runtime.lastError) {
                    console.error('Error storing reelsData:', chrome.runtime.lastError);
                } else {
                    console.log('reelsData stored successfully');
                }
            });
        });
    }

    // Function to process reels
    function processReels() {
        console.log('Processing reels!');

        const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');

        if (reelElements.length === 0) {
            chrome.storage.local.remove('reelsData', function () {
                console.log('No reel elements found. Storage has been reset.');
            });
            return;
        }

        const reelsData = Array.from(reelElements).map(element => {
            const href = element.getAttribute('href');
            const imgElement = element.querySelector('img');
            const src = imgElement ? imgElement.getAttribute('src') : null;
            return { href, src };
        });

        storeReelsData(reelsData);
    }

    // MutationObserver to watch for new reel elements
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');
                if (reelElements.length > lastCheckedCount) {
                    lastCheckedCount = reelElements.length;
                    processReels();
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        console.log('Initial page load complete!');
        processReels(); // Capture reels on initial load
    });
})();
