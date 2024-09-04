(function () {
    let lastCheckedCount = 0; // Track the number of loaded reels

    // Function to store reels data in chrome.storage.local
    function storeReelsData(reelsData) {
        console.log(reelsData);
        chrome.storage.local.get('reelsData', function (result) {
            const existingReels = result.reelsData || [];

            // Create a map to ensure unique hrefs
            const existingReelsMap = new Map(existingReels.map(reel => [reel.href, reel]));

            // Add new reels to the map
            reelsData.forEach(reel => {
                existingReelsMap.set(reel.href, reel);
            });

            // Convert the map back to an array
            const updatedReels = Array.from(existingReelsMap.values());

            // Store the updated reels data
            chrome.storage.local.set({ 'reelsData': updatedReels }, function () {
                if (chrome.runtime.lastError) {
                    console.error('Error storing reelsData:', chrome.runtime.lastError);
                } else {
                    console.log('reelsData stored successfully');
                }
            });
        });
    }

    // Function to process reels and reset storage if none are found
    function processReels() {
        console.log('Processing reels!');

        // Grab all elements with aria-label="Reel tile preview"
        const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');

        if (reelElements.length === 0) {
            // No reel elements found, clear the storage
            chrome.storage.local.remove('reelsData', function () {
                if (chrome.runtime.lastError) {
                    console.error('Error removing reelsData:', chrome.runtime.lastError);
                } else {
                    console.log('reelsData removed successfully');
                }
            });
            console.log('No reel elements found. Storage has been reset.');
            return;
        }

        // Extract href and src attributes
        const reelsData = Array.from(reelElements).map(element => {
            const href = element.getAttribute('href');
            const imgElement = element.querySelector('img'); // Assuming the preview image is inside the <a> tag
            const src = imgElement ? imgElement.getAttribute('src') : null;
            return { href, src };
        });

        // Store reels data in storage
        storeReelsData(reelsData);
    }

    // Create a MutationObserver instance
    const observer = new MutationObserver((mutationsList) => {
        let newReelsDetected = false;

        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Get all elements with aria-label="Reel tile preview"
                const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');

                if (reelElements.length > lastCheckedCount) {
                    newReelsDetected = true;
                }
            }
        }

        // Process reels if new ones were detected
        if (newReelsDetected) {
            lastCheckedCount = document.querySelectorAll('a[aria-label="Reel tile preview"]').length;
            processReels();
        }
    });

    // Start observing the document body for child additions
    observer.observe(document.body, { childList: true, subtree: true });

    // Ensure to also check if the initial page load is complete
    window.addEventListener('load', () => {
        console.log('Initial page load complete!');
        processReels(); // Ensure that reels are captured on initial load
    });

})();
