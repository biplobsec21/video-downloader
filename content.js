(function () {
    let lastCheckedCount = 0; // Track the number of loaded reels
    let lastInstagramCheckedCount = 0; // Track Instagram reels count
    let lastTikTokCheckedCount = 0; // Track TikTok reels count
    let lastYouTubeCheckedCount = 0; // Track YouTube videos count

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

    // Function to store TikTok reels data
    function storeTikTokReelsData(tiktokReelsData) {
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping TikTok storage');
                return;
            }

            chrome.storage.local.get('tiktokReelsData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting tiktokReelsData:', chrome.runtime.lastError);
                    return;
                }

                const existingReels = result.tiktokReelsData || [];
                const existingReelsMap = new Map(existingReels.map(reel => [reel.href, reel]));

                tiktokReelsData.forEach(reel => {
                    existingReelsMap.set(reel.href, reel);
                });

                const updatedReels = Array.from(existingReelsMap.values());
                chrome.storage.local.set({ 'tiktokReelsData': updatedReels }, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error storing tiktokReelsData:', chrome.runtime.lastError);
                    } else {
                        console.log('tiktokReelsData stored successfully');
                    }
                });
            });
        } catch (error) {
            console.error('Error in storeTikTokReelsData:', error);
        }
    }

    // Function to store YouTube videos data
    function storeYouTubeVideosData(youtubeVideosData) {
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping YouTube storage');
                return;
            }

            chrome.storage.local.get('youtubeVideosData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting youtubeVideosData:', chrome.runtime.lastError);
                    return;
                }

                const existingVideos = result.youtubeVideosData || [];
                const existingVideosMap = new Map(existingVideos.map(video => [video.href, video]));

                youtubeVideosData.forEach(video => {
                    existingVideosMap.set(video.href, video);
                });

                const updatedVideos = Array.from(existingVideosMap.values());
                chrome.storage.local.set({ 'youtubeVideosData': updatedVideos }, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error storing youtubeVideosData:', chrome.runtime.lastError);
                    } else {
                        console.log('youtubeVideosData stored successfully');
                    }
                });
            });
        } catch (error) {
            console.error('Error in storeYouTubeVideosData:', error);
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

    // Function to get the TikTok page slug
    function getTikTokPageSlug() {
        const url = new URL(window.location.href);
        const pathnameParts = url.pathname.split('/').filter(Boolean);

        // TikTok URLs follow pattern: /@username/...
        if (pathnameParts.length > 0 && pathnameParts[0].startsWith('@')) {
            const slug = pathnameParts[0].substring(1); // Remove @ symbol
            console.log('TikTok slug:', slug);
            return slug;
        }
        return '';
    }

    // Function to get the YouTube page slug
    function getYouTubePageSlug() {
        const url = new URL(window.location.href);
        const pathnameParts = url.pathname.split('/').filter(Boolean);

        // YouTube URLs follow pattern: /@username/... or /c/username/...
        if (pathnameParts.length > 0 && pathnameParts[0].startsWith('@')) {
            const slug = pathnameParts[0].substring(1); // Remove @ symbol
            console.log('YouTube slug:', slug);
            return slug;
        } else if (pathnameParts.length > 1 && pathnameParts[0] === 'c') {
            const slug = pathnameParts[1];
            console.log('YouTube slug (c/):', slug);
            return slug;
        }
        return '';
    }

    function isYouTubeChannelVideosPage() {
        try {
            const url = new URL(window.location.href);
            // Match /@channel/videos optionally trailing slash
            return url.hostname.includes('youtube.com') && /^\/@[^/]+\/videos\/?$/.test(url.pathname);
        } catch (e) {
            return false;
        }
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
                // Get the top-level span that contains the full text like "11.4K followers"
                const topSpan = followersLink.querySelector('span');
                if (topSpan) {
                    const fullText = topSpan.textContent.trim();
                    console.log('Full followers text:', fullText);

                    // Extract the number part (e.g., "11.4K" from "11.4K followers")
                    const match = fullText.match(/^[\d.,]+[KMB]?/);
                    if (match) {
                        followersText = "Followers: " + match[0];
                        console.log('Extracted followers number:', followersText);
                    } else {
                        followersText = fullText;
                    }
                } else {
                    // Fallback: look for the span with title attribute
                    const titleSpan = followersLink.querySelector('span[title]');
                    if (titleSpan) {
                        followersText = titleSpan.getAttribute('title') || '';
                    }
                }
            }
        }

        // 3. Get following count (similar structure but different href)
        let followingText = '';
        if (header) {
            const followingLink = header.querySelector('a[href*="/following/"]');
            if (followingLink) {
                // Get the top-level span that contains the full text like "500 following"
                const topSpan = followingLink.querySelector('span');
                if (topSpan) {
                    const fullText = topSpan.textContent.trim();
                    console.log('Full following text:', fullText);

                    // Extract the number part (e.g., "500" from "500 following")
                    const match = fullText.match(/^[\d.,]+[KMB]?/);
                    if (match) {
                        followingText = "Following: " + match[0];
                        console.log('Extracted following number:', followingText);
                    } else {
                        followingText = fullText;
                    }
                } else {
                    // Fallback: look for the span with title attribute
                    const titleSpan = followingLink.querySelector('span[title]');
                    if (titleSpan) {
                        followingText = titleSpan.getAttribute('title') || '';
                    }
                }
            }
        }

        // 4. Get posts count if available
        let postsText = '';
        if (header) {
            const postsLink = header.querySelector('a[href*="/posts/"]');
            if (postsLink) {
                // Get the top-level span that contains the full text like "150 posts"
                const topSpan = postsLink.querySelector('span');
                if (topSpan) {
                    const fullText = topSpan.textContent.trim();
                    console.log('Full posts text:', fullText);

                    // Extract the number part (e.g., "150" from "150 posts")
                    const match = fullText.match(/^[\d.,]+[KMB]?/);
                    if (match) {
                        postsText = match[0];
                        console.log('Extracted posts number:', postsText);
                    } else {
                        postsText = fullText;
                    }
                } else {
                    // Fallback: look for the span with title attribute
                    const titleSpan = postsLink.querySelector('span[title]');
                    if (titleSpan) {
                        postsText = titleSpan.getAttribute('title') || '';
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

    // Function to store TikTok page info
    function storeTikTokPageInfo() {
        const url = window.location.href;
        const slug = getTikTokPageSlug();

        // 1. Get profile image from data-e2e="user-avatar"
        let imageUrl = '';
        const avatarElement = document.querySelector('[data-e2e="user-avatar"]');
        if (avatarElement) {
            const imgElement = avatarElement.querySelector('img');
            if (imgElement) {
                imageUrl = imgElement.getAttribute('src');
            }
        }

        // 2. Get page title from h1 and h2
        let pageName = '';
        const titleElement = document.querySelector('h1[data-e2e="user-title"]');
        const subtitleElement = document.querySelector('h2[data-e2e="user-subtitle"]');

        if (titleElement) {
            pageName = titleElement.textContent.trim();
        }
        if (subtitleElement) {
            pageName += ' - ' + subtitleElement.textContent.trim();
        }

        // 3. Get followers count
        let followersText = '';
        const followersElement = document.querySelector('[data-e2e="followers-count"]');
        if (followersElement) {
            const followersCount = followersElement.textContent.trim();
            followersText = "Followers: " + followersCount;
        }

        // 4. Get following count
        let followingText = '';
        const followingElement = document.querySelector('[data-e2e="following-count"]');
        if (followingElement) {
            const followingCount = followingElement.textContent.trim();
            followingText = "Following: " + followingCount;
        }

        // 5. Get likes count
        let likesText = '';
        const likesElement = document.querySelector('[data-e2e="likes-count"]');
        if (likesElement) {
            const likesCount = likesElement.textContent.trim();
            likesText = "Likes: " + likesCount;
        }

        const tiktokPageInfo = {
            pageName,
            slug,
            url,
            imageUrl,
            followersText,
            followingText,
            likesText
        };

        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping TikTok page info storage');
                return;
            }

            chrome.storage.local.set({ tiktokPageInfo }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error storing tiktokPageInfo:', chrome.runtime.lastError);
                } else {
                    console.log('TikTok Page Info stored:', tiktokPageInfo);
                    console.log('Profile Image URL:', imageUrl);
                }
            });
        } catch (error) {
            console.error('Error in storeTikTokPageInfo:', error);
        }
    }

    // Function to store YouTube page info
    function storeYouTubePageInfo() {
        const url = window.location.href;
        const slug = getYouTubePageSlug();

        // 1. Get page name from h1 > span first text
        let pageName = '';
        const h1Element = document.querySelector('#page-header h1');
        if (h1Element) {
            const firstSpan = h1Element.querySelector('span');
            if (firstSpan) {
                pageName = firstSpan.textContent.trim();
                // Clean up the page name by removing extra text after the main name
                pageName = pageName.split(',')[0].trim();
            }
        }

        // 2. Get profile image from avatar element
        let imageUrl = '';
        const avatarElement = document.querySelector('#page-header img');
        if (avatarElement) {
            imageUrl = avatarElement.getAttribute('src');
        }

        // 3. Get subscribers count - look for text containing "subscribers"
        let subscribersText = '';
        const allSpans = document.querySelectorAll('span');
        for (let span of allSpans) {
            const text = span.textContent.trim();
            if (text.includes('subscribers')) {
                subscribersText = "Subscribers: " + text;
                break;
            }
        }

        // 4. Get videos count - look for text containing "videos" after subscribers
        let videosText = '';
        for (let span of allSpans) {
            const text = span.textContent.trim();
            if (text.includes('videos')) {
                videosText = "Videos: " + text;
                break;
            }
        }

        const youtubePageInfo = {
            pageName,
            slug,
            url,
            imageUrl,
            subscribersText,
            videosText
        };

        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, skipping YouTube page info storage');
                return;
            }

            chrome.storage.local.set({ youtubePageInfo }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error storing youtubePageInfo:', chrome.runtime.lastError);
                } else {
                    console.log('YouTube Page Info stored:', youtubePageInfo);
                    console.log('Profile Image URL:', imageUrl);
                }
            });
        } catch (error) {
            console.error('Error in storeYouTubePageInfo:', error);
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

    // Function to process TikTok reels
    function processTikTokReels() {
        console.log('Processing TikTok reels!');

        // TikTok reels follow the pattern /@username/video/...
        // Look for links that contain /video/ in the href
        const reelElements = document.querySelectorAll('a[href*="/video/"]');

        console.log('Found TikTok reel elements:', reelElements.length);
        console.log('Page URL:', window.location.href);

        const currentSlug = getTikTokPageSlug();

        // Check if tiktokReelsData exists and has a different slug
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, processing TikTok reels without storage check');
                processCurrentTikTokReels(reelElements, currentSlug);
                return;
            }

            chrome.storage.local.get('tiktokReelsData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting tiktokReelsData:', chrome.runtime.lastError);
                    processCurrentTikTokReels(reelElements, currentSlug);
                    return;
                }

                const existingReels = result.tiktokReelsData || [];

                if (existingReels.length > 0 && existingReels[0].reelPageslug !== currentSlug) {
                    // Clear tiktokReelsData if the slug has changed
                    chrome.storage.local.set({ tiktokReelsData: [] }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing tiktokReelsData:', chrome.runtime.lastError);
                        } else {
                            console.log('Cleared tiktokReelsData due to page change.');
                        }
                        processCurrentTikTokReels(reelElements, currentSlug);
                    });
                } else {
                    processCurrentTikTokReels(reelElements, currentSlug);
                }
            });
        } catch (error) {
            console.error('Error in processTikTokReels:', error);
            processCurrentTikTokReels(reelElements, currentSlug);
        }
    }

    // Function to process YouTube videos
    function processYouTubeVideos() {
        console.log('Processing YouTube videos!');

        if (!isYouTubeChannelVideosPage()) {
            console.log('Not a channel /@handle/videos page. Clearing YouTube storage.');
            try {
                if (chrome && chrome.storage) {
                    chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo'], function () {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing YouTube storage:', chrome.runtime.lastError);
                        } else {
                            console.log('YouTube storage cleared because URL is not /@channel/videos');
                        }
                    });
                }
            } catch (e) { }
            return; // Do not process
        }

        // YouTube videos follow the pattern /watch?v=...
        // Look for links that contain /watch?v= in the href
        const videoElements = document.querySelectorAll('a[href*="/watch?v="]');

        console.log('Found YouTube video elements:', videoElements.length);
        console.log('Page URL:', window.location.href);

        const currentSlug = getYouTubePageSlug();

        // Check if youtubeVideosData exists and has a different slug
        try {
            if (!chrome || !chrome.storage) {
                console.log('Chrome storage not available, processing YouTube videos without storage check');
                processCurrentYouTubeVideos(videoElements, currentSlug);
                return;
            }

            chrome.storage.local.get('youtubeVideosData', function (result) {
                if (chrome.runtime.lastError) {
                    console.error('Error getting youtubeVideosData:', chrome.runtime.lastError);
                    processCurrentYouTubeVideos(videoElements, currentSlug);
                    return;
                }

                const existingVideos = result.youtubeVideosData || [];

                if (existingVideos.length > 0 && existingVideos[0].videoPageslug !== currentSlug) {
                    // Clear youtubeVideosData if the slug has changed
                    chrome.storage.local.set({ youtubeVideosData: [] }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Error clearing youtubeVideosData:', chrome.runtime.lastError);
                        } else {
                            console.log('Cleared youtubeVideosData due to page change.');
                        }
                        processCurrentYouTubeVideos(videoElements, currentSlug);
                    });
                } else {
                    processCurrentYouTubeVideos(videoElements, currentSlug);
                }
            });
        } catch (error) {
            console.error('Error in processYouTubeVideos:', error);
            processCurrentYouTubeVideos(videoElements, currentSlug);
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

    // Helper function to process current TikTok reels
    function processCurrentTikTokReels(reelElements, currentSlug) {
        if (reelElements.length === 0) {
            try {
                if (!chrome || !chrome.storage) {
                    console.log('Chrome storage not available, skipping TikTok storage reset');
                    return;
                }

                chrome.storage.local.remove(['tiktokReelsData', 'tiktokPageInfo'], function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error removing TikTok storage:', chrome.runtime.lastError);
                    } else {
                        console.log('No TikTok reel elements found. Storage has been reset.');
                    }
                });
            } catch (error) {
                console.error('Error in processCurrentTikTokReels storage reset:', error);
            }
            return;
        }

        storeTikTokPageInfo(); // Update page info

        const tiktokReelsData = Array.from(reelElements).map((element, index) => {
            const href = element.getAttribute('href');
            console.log(`Processing TikTok reel ${index + 1}:`, href);

            // Find image in the reel element - look for picture tag first
            let imgElement = element.querySelector('picture img');
            let src = null;

            if (imgElement) {
                src = imgElement.getAttribute('src');
            } else {
                // Fallback: look for direct img tag
                imgElement = element.querySelector('img');
                if (imgElement) {
                    src = imgElement.getAttribute('src');
                }
            }

            // Get video ID from href (e.g., "7539856708861054215" from "/@voicequeenputul/video/7539856708861054215")
            const videoId = href ? href.split('/').pop() : '';

            // Get likes count if available
            let likesElement = element.querySelector('[data-e2e*="like"], [data-e2e*="Like"]');
            const likesText = likesElement ? likesElement.textContent.trim() : '';

            // Get comments count if available
            let commentsElement = element.querySelector('[data-e2e*="comment"], [data-e2e*="Comment"]');
            const commentsText = commentsElement ? commentsElement.textContent.trim() : '';

            // Get shares count if available
            let sharesElement = element.querySelector('[data-e2e*="share"], [data-e2e*="Share"]');
            const sharesText = sharesElement ? sharesElement.textContent.trim() : '';

            const reelPage = document.querySelector('h1[data-e2e="user-title"]')?.textContent.trim() || '';
            const reelUrl = window.location.href;
            const reelPageslug = currentSlug;

            // Log the found data for debugging
            console.log(`TikTok Reel ${index + 1} data:`, {
                href,
                src: src ? 'Found' : 'Not found',
                videoId,
                likesText: likesText ? 'Found' : 'Not found',
                commentsText: commentsText ? 'Found' : 'Not found',
                sharesText: sharesText ? 'Found' : 'Not found'
            });

            return {
                href,
                src,
                videoId,
                likesText,
                commentsText,
                sharesText,
                reelPage,
                reelUrl,
                reelPageslug
            };
        });

        console.log('Processed TikTok reels data:', tiktokReelsData);
        storeTikTokReelsData(tiktokReelsData);
    }

    // Helper function to process current YouTube videos
    function processCurrentYouTubeVideos(videoElements, currentSlug) {
        if (videoElements.length === 0) {
            try {
                if (!chrome || !chrome.storage) {
                    console.log('Chrome storage not available, skipping YouTube storage reset');
                    return;
                }

                chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo'], function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error removing YouTube storage:', chrome.runtime.lastError);
                    } else {
                        console.log('No YouTube video elements found. Storage has been reset.');
                    }
                });
            } catch (error) {
                console.error('Error in processCurrentYouTubeVideos storage reset:', error);
            }
            return;
        }

        storeYouTubePageInfo(); // Update page info

        const youtubeVideosData = Array.from(videoElements).map((element, index) => {
            const href = element.getAttribute('href');
            console.log(`Processing YouTube video ${index + 1}:`, href);

            // Get video ID from href (e.g., "dQw4w9WgXcQ" from "/watch?v=dQw4w9WgXcQ")
            const videoId = href ? href.split('?v=').pop() : '';

            // Get video title from the element or nearby elements
            let videoTitle = '';
            const titleElement = element.querySelector('h3, h4, [title]') || element.closest('div').querySelector('h3, h4, [title]');
            if (titleElement) {
                videoTitle = titleElement.textContent.trim() || titleElement.getAttribute('title') || '';
            }

            // Get video thumbnail URL
            let thumbnailUrl = '';
            // const rendererContainer = element.closest('ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-rich-grid-media, ytd-video-renderer');
            // let thumbnailElement = rendererContainer ? rendererContainer.querySelector('ytd-thumbnail yt-image img, ytd-thumbnail img') : null;
            // if (!thumbnailElement) {
            //     // Fallbacks if structure differs
            //     thumbnailElement = (rendererContainer || document).querySelector('a#thumbnail yt-image img, a#thumbnail img');
            // }
            // if (!thumbnailElement) {
            //     thumbnailElement = element.querySelector('yt-image img, img');
            // }
            // if (thumbnailElement) {
            //     thumbnailUrl = thumbnailElement.getAttribute('src') || thumbnailElement.getAttribute('data-thumb') || thumbnailElement.getAttribute('data-src') || '';
            // } else {
            thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            // }

            // Get views count - look for text containing "view" or "views"
            let viewsText = '';
            const viewsElement = element.querySelector('span, div');
            if (viewsElement) {
                const text = viewsElement.textContent.trim();
                if (text.includes('view') || text.includes('View')) {
                    viewsText = text;
                }
            }

            // Get video duration if available
            let durationText = '';
            const durationElement = element.querySelector('[aria-label*="duration"], [aria-label*="Duration"]');
            if (durationElement) {
                durationText = durationElement.getAttribute('aria-label') || '';
            }

            const videoPage = document.querySelector('h1')?.innerText || '';
            const videoUrl = window.location.href;
            const videoPageslug = currentSlug;

            // Log the found data for debugging
            console.log(`YouTube Video ${index + 1} data:`, {
                href,
                videoId,
                videoTitle: videoTitle ? 'Found' : 'Not found',
                thumbnailUrl: thumbnailUrl ? 'Found' : 'Not found',
                viewsText: viewsText ? 'Found' : 'Not found',
                durationText: durationText ? 'Found' : 'Not found'
            });

            return {
                href,
                videoId,
                videoTitle,
                thumbnailUrl,
                viewsText,
                durationText,
                videoPage,
                videoUrl,
                videoPageslug
            };
        });

        console.log('Processed YouTube videos data:', youtubeVideosData);
        storeYouTubeVideosData(youtubeVideosData);
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

                // Check for TikTok reels
                const tiktokReelElements = document.querySelectorAll('a[href*="/video/"]');
                if (tiktokReelElements.length !== lastTikTokCheckedCount) {
                    lastTikTokCheckedCount = tiktokReelElements.length;
                    console.log('TikTok reels count changed:', lastTikTokCheckedCount);
                    processTikTokReels();
                }

                // Check for YouTube videos
                const youtubeVideoElements = document.querySelectorAll('a[href*="/watch?v="]');
                if (youtubeVideoElements.length !== lastYouTubeCheckedCount) {
                    lastYouTubeCheckedCount = youtubeVideoElements.length;
                    console.log('YouTube videos count changed:', lastYouTubeCheckedCount);
                    processYouTubeVideos();
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        console.log('Initial page load complete!');

        // Check if we're on Facebook, Instagram, TikTok, or YouTube
        if (window.location.hostname.includes('facebook.com')) {
            processReels(); // Capture Facebook reels on initial load
            // Clear YouTube storage when not on YouTube
            try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
        } else if (window.location.hostname.includes('instagram.com')) {
            processInstagramReels(); // Capture Instagram reels on initial load
            try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
        } else if (window.location.hostname.includes('tiktok.com')) {
            processTikTokReels(); // Capture TikTok reels on initial load
            try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
        } else if (window.location.hostname.includes('youtube.com')) {
            if (isYouTubeChannelVideosPage()) {
                processYouTubeVideos(); // Capture YouTube videos on initial load
            } else {
                // Clear if not on channel videos page
                try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
            }
        } else {
            // Any other site: clear YouTube
            try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
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
            lastTikTokCheckedCount = 0; // Reset TikTok count
            lastYouTubeCheckedCount = 0; // Reset YouTube count

            // Check which platform we're on
            if (window.location.hostname.includes('facebook.com')) {
                processReels();
                try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
            } else if (window.location.hostname.includes('instagram.com')) {
                processInstagramReels();
                try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
            } else if (window.location.hostname.includes('tiktok.com')) {
                processTikTokReels();
                try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
            } else if (window.location.hostname.includes('youtube.com')) {
                if (isYouTubeChannelVideosPage()) {
                    processYouTubeVideos();
                } else {
                    // Clear storage if not on /@handle/videos
                    try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
                }
            } else {
                // Any other site: clear YouTube storage
                try { chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']); } catch (e) { }
            }
        }
    }).observe(document, { subtree: true, childList: true });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log('Message received in content script:', request);

        if (request.action === 'collectReels') {
            processReels();
            sendResponse({ success: true, message: 'Facebook reels collection started' });
        } else if (request.action === 'collectInstagramReels') {
            processInstagramReels();
            sendResponse({ success: true, message: 'Instagram reels collection started' });
        } else if (request.action === 'collectTikTokReels') {
            processTikTokReels();
            sendResponse({ success: true, message: 'TikTok reels collection started' });
        } else if (request.action === 'collectYouTubeVideos') {
            processYouTubeVideos();
            sendResponse({ success: true, message: 'YouTube videos collection started' });
        }

        return true; // Keep the message channel open for async response
    });
})();