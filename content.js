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
                // if (reelElement) {
                //     createDownloadButton(reelElement, reel.href); // Ensure button is created for new reels
                // }
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
    function getFbPageSlug() {
        const url = new URL(window.location.href);
        const pathnameParts = url.pathname.split('/').filter(Boolean);

        if (url.pathname.startsWith('/profile.php')) {
            // If it's an ID-based profile
            const id = url.searchParams.get('id');
            return id || ''; // return the ID as the slug
        } else if (pathnameParts.length > 0) {
            // If it's a username-based page
            return pathnameParts[0];
        }

        return ''; // fallback
    }
    // ✅ Function to extract and store FB page name
    function storeFbPageInfo() {
        const pageName = document.querySelector('h1')?.innerText || '';
        const url = window.location.href;
        const slug = getFbPageSlug(); // ← Use updated function

        // Get Likes Text
        const getPageLikesText = () => {
            const anchorElements = document.querySelectorAll('a');
            for (let anchor of anchorElements) {
                const text = anchor.textContent.trim().toLowerCase();
                if (text.includes('likes')) {
                    return anchor.textContent.trim(); // e.g. "123,456 likes"
                }
            }
            return null;
        };
        const likesText = getPageLikesText();

        // Get Followers Text
        const getPageFollowersText = () => {
            const anchorElements = document.querySelectorAll('a');
            for (let anchor of anchorElements) {
                const text = anchor.textContent.trim().toLowerCase();
                if (text.includes('followers')) {
                    return anchor.textContent.trim(); // e.g. "789,000 followers"
                }
            }
            return null;
        };
        const followersText = getPageFollowersText();

        // Get all mask elements
        const maskElements = document.querySelectorAll('mask');
        const maskIds = Array.from(maskElements)
            .map(el => el.getAttribute('id'))
            .filter(id => id); // Remove null/undefined

        // Get second mask ID
        const secondMaskId = maskIds[1];
        let imageUrl = '';

        if (secondMaskId) {
            const gElement = document.querySelector(`g[mask="url(#${secondMaskId})"]`);
            const image = gElement?.querySelector('image');
            imageUrl = image?.getAttribute('xlink:href') || image?.getAttribute('href') || '';
        }

        const fbPageInfo = { pageName, slug, url, imageUrl, likesText, followersText };

        chrome.storage.local.set({ fbPageInfo }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error storing fbPageInfo:', chrome.runtime.lastError);
            } else {
                console.log('FB Page Info stored:', fbPageInfo);
            }
        });
    }

    // Function to process reels
    storeFbPageInfo(); // Extract page info on each processing
    function processReels() {
        console.log('Processing reels!');


        const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');

        if (reelElements.length === 0) {
            chrome.storage.local.remove(['reelsData', 'fbPageInfo'], function () {
                console.log('No reel elements found. Storage has been reset.');
            });
            return;
        }

        const reelsData = Array.from(reelElements).map(element => {
            const href = element.getAttribute('href');
            const imgElement = element.querySelector('img');
            const src = imgElement ? imgElement.getAttribute('src') : null;

            // reels view Find the span elements inside the reel element
            const spans = element.querySelectorAll('span');
            let targetSpanText = null;

            spans.forEach(span => {
                const spanText = span.innerText.trim();  // Get the trimmed text inside the span
                if (spanText) {
                    targetSpanText = spanText;  // Store the plain text
                }
            });
            return { href, src, targetSpanText };
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
