(function () {
    let lastCheckedCount = 0; // Track the number of loaded reels
    let lastInstagramCheckedCount = 0; // Track Instagram reels count

    // Function to store reels data in chrome.storage.local
    function storeReelsData(reelsData) {
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping storage');
                return;
            }

            chrome.storage.local.get('reelsData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting reelsData:', chrome.runtime.lastError);
                    return;
                }

                const existingReels = result.reelsData || [];
                const existingReelsMap = new Map(existingReels.map(reel => [reel.href, reel]));

                reelsData.forEach(reel => {
                    existingReelsMap.set(reel.href, reel);
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
        } catch (error) {
            console.error('Error in storeReelsData:', error);
        }
    }

    // Function to store Instagram reels data
    function storeInstagramReelsData(instagramReelsData) {
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping storage');
                return;
            }

            chrome.storage.local.get('instagramReelsData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting instagramReelsData:', chrome.runtime.lastError);
                    return;
                }

                const existingReels = result.instagramReelsData || [];
                const existingReelsMap = new Map(existingReels.map(reel => [reel.href, reel]));

                instagramReelsData.forEach(reel => {
                    existingReelsMap.set(reel.href, reel);
                });

                const updatedReels = Array.from(existingReelsMap.values());
                chrome.storage.local.set({ 'instagramReelsData': updatedReels }, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error storing instagramReelsData:', chrome.runtime.lastError);
                    } else {
                        console.log('instagramReelsData stored successfully');
                    }
                });
            });
        } catch (error) {
            console.error('Error in storeInstagramReelsData:', error);
        }
    }

    // Function to get the Facebook page slug
    function getFbPageSlug() {
        const url = new URL(window.location.href);
        const pathnameParts = url.pathname.split('/').filter(Boolean);

        if (url.pathname.startsWith('/profile.php')) {
            const id = url.searchParams.get('id');
            return id || '';
        } else if (pathnameParts.length > 0) {
            return pathnameParts[0];
        }
        return '';
    }

    // Function to get the Instagram page slug
    function getInstagramPageSlug() {
        const url = new URL(window.location.href);
        const pathnameParts = url.pathname.split('/').filter(Boolean);

        if (pathnameParts.length > 0) {
            console.log(pathnameParts[0]);
            return pathnameParts[0];
        }
        return '';
    }

    // Function to store Facebook page info
    function storeFbPageInfo() {
        const pageName = document.querySelector('h1')?.innerText || '';
        const url = window.location.href;
        const slug = getFbPageSlug();

        const getPageLikesText = () => {
            const anchorElements = document.querySelectorAll('a');
            for (let anchor of anchorElements) {
                const text = anchor.textContent.trim().toLowerCase();
                if (text.includes('likes')) {
                    return anchor.textContent.trim();
                }
            }
            return null;
        };
        const likesText = getPageLikesText();

        const getPageFollowersText = () => {
            const anchorElements = document.querySelectorAll('a');
            for (let anchor of anchorElements) {
                const text = anchor.textContent.trim().toLowerCase();
                if (text.includes('followers')) {
                    return anchor.textContent.trim();
                }
            }
            return null;
        };
        const followersText = getPageFollowersText();

        const maskElements = document.querySelectorAll('mask');
        const maskIds = Array.from(maskElements)
            .map(el => el.getAttribute('id'))
            .filter(id => id);

        const secondMaskId = maskIds[1];
        let imageUrl = '';
        if (secondMaskId) {
            const gElement = document.querySelector(`g[mask="url(#${secondMaskId})"]`);
            const image = gElement?.querySelector('image');
            imageUrl = image?.getAttribute('xlink:href') || image?.getAttribute('href') || '';
        }

        const fbPageInfo = { pageName, slug, url, imageUrl, likesText, followersText };

        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping Facebook page info storage');
                return;
            }

            chrome.storage.local.set({ fbPageInfo }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error storing fbPageInfo:', chrome.runtime.lastError);
                } else {
                    console.log('FB Page Info stored:', fbPageInfo);
                }
            });
        } catch (error) {
            console.error('Error in storeFbPageInfo:', error);
        }
    }

    // Function to store Instagram page info
    function storeInstagramPageInfo() {
        const url = window.location.href;
        const slug = getInstagramPageSlug();

        // 1. Get profile picture URL from header section
        let imageUrl = '';
        let pageName = '';
        const header = document.querySelector('header');
        if (header) {
            const profileImg = header.querySelector('img[alt*="profile picture"]');
            if (profileImg) {
                // Decode HTML entities and clean the URL
                imageUrl = profileImg.src
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

                // Extract page name from alt text (remove "profile picture" part)
                const altText = profileImg.alt || '';
                pageName = altText.replace(/\s*profile picture\s*/i, '').trim();
            }
        }

        // 2. Get followers count from header section
        let followersText = '';
        if (header) {
            const followersLink = header.querySelector('a[href*="/followers/"]');
            if (followersLink) {
                // Navigate through the nested span structure: a > span > span[title] > span
                const titleSpan = followersLink.querySelector('span[title]');
                if (titleSpan) {
                    // Get the value from title attribute
                    followersText = titleSpan.getAttribute('title') || '';
                } else {
                    // Fallback: get text content from the nested span structure
                    const nestedSpan = followersLink.querySelector('span span span');
                    if (nestedSpan) {
                        followersText = nestedSpan.textContent.trim();
                    }
                }
            }
        }

        // 3. Get following count (similar structure but different href)
        let followingText = '';
        if (header) {
            const followingLink = header.querySelector('a[href*="/following/"]');
            if (followingLink) {
                const titleSpan = followingLink.querySelector('span[title]');
                if (titleSpan) {
                    followingText = titleSpan.getAttribute('title') || '';
                } else {
                    const nestedSpan = followingLink.querySelector('span span span');
                    if (nestedSpan) {
                        followingText = nestedSpan.textContent.trim();
                    }
                }
            }
        }

        // 4. Get posts count if available
        let postsText = '';
        if (header) {
            const postsLink = header.querySelector('a[href*="/posts/"]');
            if (postsLink) {
                const titleSpan = postsLink.querySelector('span[title]');
                if (titleSpan) {
                    postsText = titleSpan.getAttribute('title') || '';
                } else {
                    const nestedSpan = postsLink.querySelector('span span span');
                    if (nestedSpan) {
                        postsText = nestedSpan.textContent.trim();
                    }
                }
            }
        }

        // 5. Get bio/description if available
        let bioText = '';
        const bioElement = document.querySelector('[data-testid="user-bio"]') ||
            document.querySelector('h1') ||
            document.querySelector('h2');
        if (bioElement) {
            bioText = bioElement.textContent.trim();
        }

        const instagramPageInfo = {
            pageName: pageName || bioText || 'Unnamed Page',
            slug,
            url,
            imageUrl,
            followersText,
            followingText,
            postsText,
            bioText
        };

        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping Instagram page info storage');
                return;
            }

            chrome.storage.local.set({ instagramPageInfo }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error storing instagramPageInfo:', chrome.runtime.lastError);
                } else {
                    console.log('Instagram Page Info stored:', instagramPageInfo);
                    console.log('Profile Image URL:', imageUrl);
                }
            });
        } catch (error) {
            console.error('Error in storeInstagramPageInfo:', error);
        }
    }

    // Function to process reels
    function processReels() {
        console.log('Processing reels!');

        const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');
        const currentSlug = getFbPageSlug();

        // Check if reelsData exists and has a different slug
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, processing reels without storage check');
                processCurrentReels(reelElements, currentSlug);
                return;
            }

            chrome.storage.local.get('reelsData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting reelsData:', chrome.runtime.lastError);
                    processCurrentReels(reelElements, currentSlug);
                    return;
                }

                const existingReels = result.reelsData || [];

                if (existingReels.length > 0 && existingReels[0].reelPageslug !== currentSlug) {
                    // Clear reelsData if the slug has changed
                    chrome.storage.local.set({ reelsData: [] }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing reelsData:', chrome.runtime.lastError);
                        } else {
                            console.log('Cleared reelsData due to page change.');
                        }
                        processCurrentReels(reelElements, currentSlug); // Process reels after clearing
                    });
                } else {
                    processCurrentReels(reelElements, currentSlug); // Process reels normally
                }
            });
        } catch (error) {
            console.error('Error in processReels:', error);
            processCurrentReels(reelElements, currentSlug);
        }
    }

    // Function to detect Instagram page type
    function getInstagramPageType() {
        const url = window.location.href;
        if (url.includes('/reels/')) {
            return 'reels-page';
        } else if (url.includes('/reel/')) {
            return 'single-reel';
        } else {
            return 'profile-page';
        }
    }

    // Function to process Instagram reels
    function processInstagramReels() {
        console.log('Processing Instagram reels!');

        const pageType = getInstagramPageType();
        console.log('Instagram page type:', pageType);

        // Instagram reels follow the pattern /slug/reel/ where slug is the page name
        // Look for links that contain /reel/ in the href
        let reelElements = document.querySelectorAll('a[href*="/reel/"]');

        // If on reels page, also look for additional selectors
        if (pageType === 'reels-page') {
            const additionalElements = document.querySelectorAll('article a[href*="/reel/"], div[role="button"] a[href*="/reel/"]');
            reelElements = [...reelElements, ...additionalElements];
        }

        console.log('Found Instagram reel elements:', reelElements.length);
        console.log('Page URL:', window.location.href);

        const currentSlug = getInstagramPageSlug();

        // Check if instagramReelsData exists and has a different slug
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, processing Instagram reels without storage check');
                processCurrentInstagramReels(reelElements, currentSlug);
                return;
            }

            chrome.storage.local.get('instagramReelsData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting instagramReelsData:', chrome.runtime.lastError);
                    processCurrentInstagramReels(reelElements, currentSlug);
                    return;
                }

                const existingReels = result.instagramReelsData || [];

                if (existingReels.length > 0 && existingReels[0].reelPageslug !== currentSlug) {
                    // Clear instagramReelsData if the slug has changed
                    chrome.storage.local.set({ instagramReelsData: [] }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing instagramReelsData:', chrome.runtime.lastError);
                        } else {
                            console.log('Cleared instagramReelsData due to page change.');
                        }
                        processCurrentInstagramReels(reelElements, currentSlug);
                    });
                } else {
                    processCurrentInstagramReels(reelElements, currentSlug);
                }
            });
        } catch (error) {
            console.error('Error in processInstagramReels:', error);
            processCurrentInstagramReels(reelElements, currentSlug);
        }
    }

    // Helper function to process current reels
    function processCurrentReels(reelElements, currentSlug) {
        if (reelElements.length === 0) {
            try {
                if (!chrome || !chrome.storage) {
                    console.log('Chrome storage not available, skipping storage reset');
                    return;
                }

                chrome.storage.local.remove(['reelsData', 'fbPageInfo'], function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error removing storage:', chrome.runtime.lastError);
                    } else {
                        console.log('No reel elements found. Storage has been reset.');
                    }
                });
            } catch (error) {
                console.error('Error in processCurrentReels storage reset:', error);
            }
            return;
        }

        storeFbPageInfo(); // Update page info

        const reelsData = Array.from(reelElements).map(element => {
            const href = element.getAttribute('href');
            const imgElement = element.querySelector('img');
            const src = imgElement ? imgElement.getAttribute('src') : null;

            const spans = element.querySelectorAll('span');
            let targetSpanText = null;
            spans.forEach(span => {
                const spanText = span.innerText.trim();
                if (spanText) {
                    targetSpanText = spanText;
                }
            });

            const reelPage = document.querySelector('h1')?.innerText || '';
            const reelUrl = window.location.href;
            const reelPageslug = currentSlug;

            return { href, src, targetSpanText, reelPage, reelUrl, reelPageslug };
        });

        storeReelsData(reelsData);
    }

    // Helper function to process current Instagram reels
    function processCurrentInstagramReels(reelElements, currentSlug) {
        if (reelElements.length === 0) {
            try {
                if (!chrome || !chrome.storage) {
                    console.log('Chrome storage not available, skipping Instagram storage reset');
                    return;
                }

                chrome.storage.local.remove(['instagramReelsData', 'instagramPageInfo'], function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error removing Instagram storage:', chrome.runtime.lastError);
                    } else {
                        console.log('No Instagram reel elements found. Storage has been reset.');
                    }
                });
            } catch (error) {
                console.error('Error in processCurrentInstagramReels storage reset:', error);
            }
            return;
        }

        storeInstagramPageInfo(); // Update page info

        const instagramReelsData = Array.from(reelElements).map((element, index) => {
            const href = element.getAttribute('href');
            console.log(`Processing Instagram reel ${index + 1}:`, href);

            // Find image in the reel element - try multiple selectors for different page layouts
            let imgElement = element.querySelector('img');
            let src = null;

            if (imgElement) {
                src = imgElement.getAttribute('src');
            } else {
                // Try alternative selectors for different page layouts
                imgElement = element.querySelector('div[style*="background-image"]');
                if (imgElement) {
                    const style = imgElement.getAttribute('style');
                    const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
                    if (match) {
                        src = match[1];
                    }
                }

                // Try video thumbnail if image not found
                if (!src) {
                    const videoElement = element.querySelector('video');
                    if (videoElement) {
                        src = videoElement.getAttribute('poster') || videoElement.getAttribute('src');
                    }
                }

                // Try canvas element (sometimes used for thumbnails)
                if (!src) {
                    const canvasElement = element.querySelector('canvas');
                    if (canvasElement) {
                        try {
                            src = canvasElement.toDataURL();
                        } catch (e) {
                            console.log('Could not get canvas data URL');
                        }
                    }
                }
            }

            // Get caption or description from alt text
            const captionElement = element.querySelector('img[alt]');
            const caption = captionElement ? captionElement.getAttribute('alt') : '';

            // Get likes count if available - try multiple selectors
            let likesElement = element.querySelector('[aria-label*="like"], [aria-label*="Like"]');
            if (!likesElement) {
                likesElement = element.querySelector('[data-testid*="like"]');
            }
            const likesText = likesElement ? likesElement.getAttribute('aria-label') || likesElement.textContent : '';

            // Get views count if available - try multiple selectors
            let viewsElement = element.querySelector('[aria-label*="view"], [aria-label*="View"]');
            if (!viewsElement) {
                viewsElement = element.querySelector('[data-testid*="view"]');
            }
            const viewsText = viewsElement ? viewsElement.getAttribute('aria-label') || viewsElement.textContent : '';

            // Get comments count if available
            let commentsElement = element.querySelector('[aria-label*="comment"], [aria-label*="Comment"]');
            if (!commentsElement) {
                commentsElement = element.querySelector('[data-testid*="comment"]');
            }
            const commentsText = commentsElement ? commentsElement.getAttribute('aria-label') || commentsElement.textContent : '';

            const reelPage = document.querySelector('h1')?.innerText ||
                document.querySelector('h2')?.innerText || '';
            const reelUrl = window.location.href;
            const reelPageslug = currentSlug;

            // Extract reel ID from href (e.g., "DNf5teMhxFF" from "/silliness.animal/reel/DNf5teMhxFF/")
            const reelId = href ? href.split('/').filter(Boolean).pop() : '';

            // Log the found data for debugging
            console.log(`Reel ${index + 1} data:`, {
                href,
                src: src ? 'Found' : 'Not found',
                caption: caption ? 'Found' : 'Not found',
                likesText: likesText ? 'Found' : 'Not found',
                viewsText: viewsText ? 'Found' : 'Not found',
                commentsText: commentsText ? 'Found' : 'Not found'
            });

            return {
                href,
                src,
                caption,
                likesText,
                viewsText,
                commentsText,
                reelId,
                reelPage,
                reelUrl,
                reelPageslug
            };
        });

        console.log('Processed Instagram reels data:', instagramReelsData);
        storeInstagramReelsData(instagramReelsData);
    }

    // MutationObserver to watch for new reel elements
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check for Facebook reels
                const reelElements = document.querySelectorAll('a[aria-label="Reel tile preview"]');
                if (reelElements.length !== lastCheckedCount) {
                    lastCheckedCount = reelElements.length;
                    processReels();
                }

                // Check for Instagram reels
                const instagramReelElements = document.querySelectorAll('a[href*="/reel/"]');
                if (instagramReelElements.length !== lastInstagramCheckedCount) {
                    lastInstagramCheckedCount = instagramReelElements.length;
                    console.log('Instagram reels count changed:', lastInstagramCheckedCount);
                    processInstagramReels();
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        console.log('Initial page load complete!');

        // Check if we're on Facebook or Instagram
        if (window.location.hostname.includes('facebook.com')) {
            processReels(); // Capture Facebook reels on initial load
        } else if (window.location.hostname.includes('instagram.com')) {
            processInstagramReels(); // Capture Instagram reels on initial load
        }
    });

    // Detect navigation changes (for single-page apps)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            console.log('URL changed, reprocessing reels.');
            lastCheckedCount = 0; // Reset count to ensure reprocessing
            lastInstagramCheckedCount = 0; // Reset Instagram count

            // Check which platform we're on
            if (window.location.hostname.includes('facebook.com')) {
                processReels();
            } else if (window.location.hostname.includes('instagram.com')) {
                processInstagramReels();
            }
        }
    }).observe(document, { subtree: true, childList: true });
})();