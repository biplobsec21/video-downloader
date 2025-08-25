// popup.js

document.addEventListener('DOMContentLoaded', function () {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const facebookContent = document.getElementById('facebookContent');

    // Function to handle tab switching
    function handleTabClick(event) {
        event.preventDefault();

        // Ignore clicks on disabled tabs
        if (this.classList.contains('cursor-not-allowed')) {
            return;
        }

        // Remove active classes from all links
        tabLinks.forEach(link => {
            link.classList.remove('text-blue-500', 'border-blue-500');
            link.classList.add('text-gray-600');
        });

        // Add active class to the clicked link
        this.classList.add('text-blue-500', 'border-blue-500');
        this.classList.remove('text-gray-600');

        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });

        // Show the content associated with the clicked tab
        const targetContent = document.getElementById(this.getAttribute('data-target'));
        targetContent.classList.remove('hidden');
    }

    // Function to enable/disable tabs based on the current URL
    function manageTabs(url) {
        let enabledTabId = null;

        if (url.includes('facebook.com')) {
            enabledTabId = 'facebookContent';
            // Load the Facebook reels data
            // loadFacebookReels(); // hide for the time being
        } else if (url.includes('instagram.com')) {
            enabledTabId = 'instagramContent';
            // Load the Instagram reels data
            loadInstagramReels();
        } else if (url.includes('tiktok.com')) {
            enabledTabId = 'tiktokContent';
            // Load the TikTok reels data
            loadTikTokReels();
        } else if (url.includes('youtube.com')) {
            // Only enable if matches /@handle/videos
            const isChannelVideos = /\/\@[^/]+\/videos\/?$/.test(new URL(url).pathname);
            if (isChannelVideos) {
                enabledTabId = 'youtubeContent';
                loadYouTubeData();
            } else {
                // Clear any stale YouTube storage and keep tab disabled
                try {
                    chrome.storage.local.remove(['youtubeVideosData', 'youtubePageInfo']);
                } catch (e) { }
            }
        }

        tabLinks.forEach(link => {
            const targetContent = link.getAttribute('data-target');
            if (targetContent === enabledTabId) {
                link.classList.remove('cursor-not-allowed', 'opacity-50');
                link.classList.add('text-blue-500', 'border-blue-500');
                document.getElementById(targetContent).classList.remove('hidden');
            } else {
                link.classList.add('cursor-not-allowed', 'opacity-50');
                link.removeEventListener('click', handleTabClick);
            }
        });

        tabContents.forEach(content => {
            if (content.id !== enabledTabId) {
                content.classList.add('hidden');
            }
        });
    }

    // Function to load Facebook reels data
    function loadFacebookReels() {
        // chrome.storage.local.get('reelsData', function (data) {
        //     const reels = data.reelsData || [];
        //     if (reels.length > 0) {
        //         facebookContent.innerHTML = '';
        //         reels.forEach(reel => {
        //             const reelHtml = `
        //                 <div class="w-1/3 p-2">
        //                     <div class="border p-2 rounded shadow">
        //                         <img src="${reel.src}" alt="Reel Preview" class="w-full object-cover rounded mb-2" style="height: 200px;">
        //                         <button data-href="https://www.facebook.com${reel.href}" class="download-btn text-white bg-blue-500 hover:bg-blue-600 p-2 rounded block text-center">Download</button>
        //                     </div>
        //                 </div>`;
        //             facebookContent.innerHTML += reelHtml;
        //         });

        //         // Attach event listeners to each download button
        //         document.querySelectorAll('.download-btn').forEach(button => {
        //             button.addEventListener('click', function () {
        //                 const videoUrl = this.getAttribute('data-href');
        //                 handleDownloadClick(videoUrl);
        //             });
        //         });
        //     } else {
        //         facebookContent.innerHTML = '<p>No reels found.</p>';
        //     }
        // });
    }

    // Function to validate and clean image URL
    function cleanImageUrl(url) {
        if (!url) return null;

        // Remove any HTML entities that might still be present
        let cleanedUrl = url
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        // Ensure it's a valid URL
        try {
            new URL(cleanedUrl);
            return cleanedUrl;
        } catch (e) {
            console.log('Invalid URL:', cleanedUrl);
            return null;
        }
    }

    // Function to handle CORS-blocked images
    function handleCorsImage(imageElement, imageUrl, fallbackSrc = 'icons/t.webp') {
        if (!imageUrl) {
            // Hide the image element if no URL is provided
            imageElement.style.display = 'none';
            return;
        }

        // For social media images, we'll use a simple approach
        // Since CORS blocks direct loading, we'll hide the image instead of showing fallback
        console.log('Attempting to load image:', imageUrl);

        // Try to load the image directly first
        imageElement.src = imageUrl;

        // Set up error handling for CORS issues
        imageElement.onerror = function () {
            console.log('Image failed to load due to CORS or other issues:', imageUrl);
            console.log('Hiding image element instead of showing fallback');
            imageElement.style.display = 'none';
            imageElement.onerror = null; // Prevent infinite loop
        };

        // Set up success handler
        imageElement.onload = function () {
            console.log('Image loaded successfully');
            imageElement.style.display = 'block'; // Ensure image is visible
        };
    }

    // Function to load Instagram reels data
    function loadInstagramReels() {
        chrome.storage.local.get('instagramPageInfo', ({ instagramPageInfo }) => {
            if (instagramPageInfo) {
                document.getElementById('instagramPageName').textContent = instagramPageInfo.slug || 'Unnamed Page';
                document.getElementById('instagramPageFollowers').textContent = instagramPageInfo.followersText || '';
                document.getElementById('instagramPageFollowing').textContent = instagramPageInfo.followingText || '';
                document.getElementById('instagramPagePosts').textContent = instagramPageInfo.postsText || '';

                // Handle Instagram page image with CORS handling
                const instagramPageImage = document.getElementById('instagramPageImage');
                console.log('Instagram Page Info:', instagramPageInfo);
                console.log('Instagram Image URL:', instagramPageInfo.imageUrl);

                const cleanedImageUrl = cleanImageUrl(instagramPageInfo.imageUrl);
                console.log('Cleaned Instagram Image URL:', cleanedImageUrl);

                handleCorsImage(instagramPageImage, cleanedImageUrl, 'icons/t.webp');

                document.getElementById('instagramPageUrl').addEventListener('click', (e) => {
                    e.preventDefault();
                    chrome.storage.local.get('instagramPageInfo', ({ instagramPageInfo }) => {
                        if (instagramPageInfo?.url) {
                            chrome.tabs.update({ url: instagramPageInfo.url });
                        }
                    });
                });
            } else {
                document.getElementById('instagramPageImage').style.display = 'none';
            }
        });
    }

    // Function to load TikTok reels data
    function loadTikTokReels() {
        chrome.storage.local.get(['tiktokReelsData', 'tiktokPageInfo'], function (data) {
            const reels = data.tiktokReelsData || [];
            const pageInfo = data.tiktokPageInfo || {};

            // Update page info
            if (pageInfo.pageName) {
                document.getElementById('tiktokPageName').textContent = pageInfo.pageName;
            }
            if (pageInfo.url) {
                document.getElementById('tiktokPageUrl').href = pageInfo.url;
            }
            if (pageInfo.imageUrl) {
                document.getElementById('tiktokPageImage').src = pageInfo.imageUrl;
            }
            if (pageInfo.followersText) {
                document.getElementById('tiktokPageFollowers').textContent = pageInfo.followersText;
            }
            if (pageInfo.followingText) {
                document.getElementById('tiktokPageFollowing').textContent = pageInfo.followingText;
            }
            if (pageInfo.likesText) {
                document.getElementById('tiktokPageLikes').textContent = pageInfo.likesText;
            }

            // Show summary if reels exist

        });
    }

    // Function to load YouTube page info and videos data
    function loadYouTubeData() {
        chrome.storage.local.get(['youtubeVideosData', 'youtubePageInfo'], function (data) {
            const videos = data.youtubeVideosData || [];
            const pageInfo = data.youtubePageInfo || {};

            // Update page info
            if (pageInfo.pageName) {
                document.getElementById('youtubePageName').textContent = pageInfo.pageName;
            }
            if (pageInfo.url) {
                document.getElementById('youtubePageUrl').href = pageInfo.url;
            }
            if (pageInfo.imageUrl) {
                document.getElementById('youtubePageImage').src = pageInfo.imageUrl;
            }
            if (pageInfo.subscribersText) {
                document.getElementById('youtubePageSubscribers').textContent = pageInfo.subscribersText;
            }
            if (pageInfo.videosText) {
                document.getElementById('youtubePageVideos').textContent = pageInfo.videosText;
            }

            // Render grid of thumbnails
            const grid = document.getElementById('youtubeGrid');
            grid.innerHTML = '';


        });
    }

    // Function to handle download button click
    function handleDownloadClick(videoUrl) {
        // Show the spinner
        document.getElementById('spinner').classList.remove('hidden');

        getFbVideoInfo(videoUrl)
            .then(videoInfo => {
                // Hide the spinner
                // document.getElementById('spinner').classList.add('hidden');

                // Handle the returned video info, e.g., download the video or display the info
                console.log(videoInfo);

                // Initiate download of the video (SD or HD depending on availability)
                const downloadUrl = videoInfo.hd || videoInfo.sd;
                if (downloadUrl) {
                    downloadVideo(downloadUrl);
                } else {
                    alert("No downloadable video URL found.");
                }
            })
            .catch(error => {
                // Hide the spinner
                document.getElementById('spinner').classList.add('hidden');

                console.error(error);
                alert("Failed to retrieve video information.");
            });
    }

    function downloadVideo(videoUrl) {
        const uniqueFilename = `video_${uuid.v4()}.mp4`;

        axios({
            url: videoUrl,
            responseType: 'blob', // Use blob for binary data
        })
            .then(response => {
                document.getElementById('spinner').classList.add('hidden');

                const blob = new Blob([response.data], { type: 'video/mp4' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = uniqueFilename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => {
                console.error('Error downloading the video:', error);
            });
    }

    // Use chrome.tabs to get the current URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0].url;
        manageTabs(currentUrl);
    });

    // Attach event listeners to each tab link
    tabLinks.forEach(link => {
        link.addEventListener('click', handleTabClick);
    });

    const collectBtn = document.getElementById('collectReelsBtn');
    const summaryDiv = document.getElementById('reelsSummary');
    const downloadBtn = document.getElementById('downloadJsonBtn');

    let reelsData = [];

    // Step 1: Collect reels from chrome.storage.local
    collectBtn.addEventListener('click', () => {
        chrome.storage.local.get(['reelsData'], async (result) => {
            reelsData = result.reelsData || [];

            if (reelsData.length === 0) {
                summaryDiv.innerHTML = '⚠️ No reels data found.';
                summaryDiv.classList.remove('hidden');
                downloadBtn.classList.add('hidden');
                return;
            }

            // Build summary HTML
            const firstItems = reelsData.slice(0, 3).map((reel, idx) => {
                return `<div class="mb-2 flex items-center space-x-2">
                        <span class="text-gray-600 text-sm">#${idx + 1}</span>
                        <img src="${reel.src}" alt="reel-img" class="w-10 h-10 object-cover rounded" />
                        <a href="${reel.href}" target="_blank" class="text-blue-500 underline text-sm break-all">${reel.href}</a>
                    </div>`;
            }).join('');

            summaryDiv.innerHTML = `
                ✅ Total Reels Found: <strong>${reelsData.length}</strong>
                <div class="mt-2">Preview (example):</div>
                ${firstItems}
            `;
            summaryDiv.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');
        });
    });

    chrome.storage.local.get('fbPageInfo', ({ fbPageInfo }) => {
        if (fbPageInfo) {
            document.getElementById('fbPageName').textContent = fbPageInfo.pageName || 'Unnamed Page';
            document.getElementById('fbPageLikes').textContent = fbPageInfo.likesText || '';
            document.getElementById('fbPageFollowers').textContent = fbPageInfo.followersText || '';

            // Handle Facebook page image with CORS handling
            const fbPageImage = document.getElementById('fbPageImage');
            console.log('Facebook Page Info:', fbPageInfo);
            console.log('Facebook Image URL:', fbPageInfo.imageUrl);

            const cleanedImageUrl = cleanImageUrl(fbPageInfo.imageUrl);
            console.log('Cleaned Facebook Image URL:', cleanedImageUrl);

            handleCorsImage(fbPageImage, cleanedImageUrl, 'icons/t.webp');

            document.getElementById('fbPageUrl').addEventListener('click', (e) => {
                e.preventDefault();

                chrome.storage.local.get('fbPageInfo', ({ fbPageInfo }) => {
                    if (fbPageInfo?.url) {
                        chrome.tabs.update({ url: fbPageInfo.url });
                    }
                });
            })

        } else {
            document.getElementById('fbPageImage').style.display = 'none';
        }

    });
    // Step 2: Download JSON with cookie
    downloadBtn.addEventListener('click', () => {
        chrome.cookies.getAll({ domain: 'facebook.com' }, (cookies) => {
            const cookieObj = cookies.reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {});

            chrome.storage.local.get('fbPageInfo', ({ fbPageInfo }) => {
                const exportData = {
                    reels: reelsData,
                    cookies: cookieObj,
                    fbPageInfo: fbPageInfo,
                    collectedAt: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const slug = fbPageInfo?.slug || 'facebook_reels';

                chrome.downloads.download({
                    url: url,
                    filename: `${slug}_${Date.now()}.json`,
                    saveAs: true
                });
            });
        });
    });
    // love button functionality
    const loveIcon = document.getElementById('loveIcon');
    const loveBtn = document.getElementById('loveBtn');

    chrome.storage.local.get(['fbPageInfo', 'savedFbPageInfo'], (data) => {
        const fbPageInfo = data.fbPageInfo;
        const slug = fbPageInfo?.slug;
        const savedFbPageInfo = data.savedFbPageInfo || {};

        const isSaved = slug && savedFbPageInfo[slug]?.some(p => p.url === fbPageInfo.url);
        toggleLoveIcon(isSaved);
    });

    loveBtn.addEventListener('click', () => {
        chrome.storage.local.get(['fbPageInfo', 'savedFbPageInfo'], (data) => {
            const fbPageInfo = data.fbPageInfo;
            const slug = fbPageInfo?.slug;
            if (!fbPageInfo || !slug) return;

            let savedFbPageInfo = data.savedFbPageInfo || {};
            let currentList = savedFbPageInfo[slug] || [];

            const index = currentList.findIndex(p => p.url === fbPageInfo.url);

            const isAlreadySaved = index !== -1;

            if (isAlreadySaved) {
                currentList.splice(index, 1); // Remove item
            } else {
                currentList.push(fbPageInfo); // Save item
            }

            // Update storage
            savedFbPageInfo[slug] = currentList;
            chrome.storage.local.set({ savedFbPageInfo }, () => {
                toggleLoveIcon(!isAlreadySaved);
            });
        });
    });

    // Helper to update heart icon style
    function toggleLoveIcon(saved) {
        loveIcon.classList.remove('scale-125');
        loveIcon.classList.add('scale-125');
        setTimeout(() => loveIcon.classList.remove('scale-125'), 300);

        if (saved) {
            loveIcon.classList.remove('text-white');
            loveIcon.classList.add('text-red-500');
        } else {
            loveIcon.classList.remove('text-red-500');
            loveIcon.classList.add('text-white');
        }
    }

    // Instagram functionality
    const collectInstagramBtn = document.getElementById('collectInstagramReelsBtn');
    const instagramSummaryDiv = document.getElementById('instagramReelsSummary');
    const downloadInstagramBtn = document.getElementById('downloadInstagramJsonBtn');

    let instagramReelsData = [];

    // Step 1: Collect Instagram reels from chrome.storage.local
    collectInstagramBtn.addEventListener('click', () => {
        chrome.storage.local.get(['instagramReelsData'], async (result) => {
            instagramReelsData = result.instagramReelsData || [];

            if (instagramReelsData.length === 0) {
                instagramSummaryDiv.innerHTML = '⚠️ No Instagram reels data found.';
                instagramSummaryDiv.classList.remove('hidden');
                downloadInstagramBtn.classList.add('hidden');
                return;
            }

            // Build summary HTML
            const firstItems = instagramReelsData.slice(0, 3).map((reel, idx) => {
                return `<div class="mb-2 flex items-center space-x-2">
                        <span class="text-gray-600 text-sm">#${idx + 1}</span>
                        <img src="${reel.src}" alt="reel-img" class="w-10 h-10 object-cover rounded" />
                        <a href="${reel.href}" target="_blank" class="text-pink-500 underline text-sm break-all">${reel.href}</a>
                    </div>`;
            }).join('');

            instagramSummaryDiv.innerHTML = `
                ✅ Total Instagram Reels Found: <strong>${instagramReelsData.length}</strong>
                <div class="mt-2">Preview (example):</div>
                ${firstItems}
            `;
            instagramSummaryDiv.classList.remove('hidden');
            downloadInstagramBtn.classList.remove('hidden');
        });
    });

    // Step 2: Download Instagram JSON with cookie
    downloadInstagramBtn.addEventListener('click', () => {
        chrome.cookies.getAll({ domain: 'instagram.com' }, (cookies) => {
            const cookieObj = cookies.reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {});

            chrome.storage.local.get('instagramPageInfo', ({ instagramPageInfo }) => {
                const exportData = {
                    reels: instagramReelsData,
                    cookies: cookieObj,
                    instagramPageInfo: instagramPageInfo,
                    collectedAt: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const slug = instagramPageInfo?.slug || 'instagram_reels';

                chrome.downloads.download({
                    url: url,
                    filename: `${slug}_${Date.now()}.json`,
                    saveAs: true
                });
            });
        });
    });

    // Instagram love button functionality
    const instagramLoveIcon = document.getElementById('instagramLoveIcon');
    const instagramLoveBtn = document.getElementById('instagramLoveBtn');

    chrome.storage.local.get(['instagramPageInfo', 'savedInstagramPageInfo'], (data) => {
        const instagramPageInfo = data.instagramPageInfo;
        const slug = instagramPageInfo?.slug;
        const savedInstagramPageInfo = data.savedInstagramPageInfo || {};

        const isSaved = slug && savedInstagramPageInfo[slug]?.some(p => p.url === instagramPageInfo.url);
        toggleInstagramLoveIcon(isSaved);
    });

    instagramLoveBtn.addEventListener('click', () => {
        chrome.storage.local.get(['instagramPageInfo', 'savedInstagramPageInfo'], (data) => {
            const instagramPageInfo = data.instagramPageInfo;
            const slug = instagramPageInfo?.slug;
            if (!instagramPageInfo || !slug) return;

            let savedInstagramPageInfo = data.savedInstagramPageInfo || {};
            let currentList = savedInstagramPageInfo[slug] || [];

            const index = currentList.findIndex(p => p.url === instagramPageInfo.url);

            const isAlreadySaved = index !== -1;

            if (isAlreadySaved) {
                currentList.splice(index, 1); // Remove item
            } else {
                currentList.push(instagramPageInfo); // Save item
            }

            // Update storage
            savedInstagramPageInfo[slug] = currentList;
            chrome.storage.local.set({ savedInstagramPageInfo }, () => {
                toggleInstagramLoveIcon(!isAlreadySaved);
            });
        });
    });

    // Helper to update Instagram heart icon style
    function toggleInstagramLoveIcon(saved) {
        instagramLoveIcon.classList.remove('scale-125');
        instagramLoveIcon.classList.add('scale-125');
        setTimeout(() => instagramLoveIcon.classList.remove('scale-125'), 300);

        if (saved) {
            instagramLoveIcon.classList.remove('text-white');
            instagramLoveIcon.classList.add('text-red-500');
        } else {
            instagramLoveIcon.classList.remove('text-red-500');
            instagramLoveIcon.classList.add('text-white');
        }
    }

    // TikTok functionality
    const collectTikTokBtn = document.getElementById('collectTikTokReelsBtn');
    const tiktokSummaryDiv = document.getElementById('tiktokReelsSummary');
    const downloadTikTokBtn = document.getElementById('downloadTikTokJsonBtn');

    let tiktokReelsData = [];

    // Step 1: Collect TikTok reels from chrome.storage.local
    collectTikTokBtn.addEventListener('click', () => {
        chrome.storage.local.get(['tiktokReelsData'], async (result) => {
            tiktokReelsData = result.tiktokReelsData || [];

            if (tiktokReelsData.length === 0) {
                tiktokSummaryDiv.innerHTML = '⚠️ No TikTok videos data found.';
                tiktokSummaryDiv.classList.remove('hidden');
                downloadTikTokBtn.classList.add('hidden');
                return;
            }

            // Build summary HTML
            const firstItems = tiktokReelsData.slice(0, 3).map((reel, idx) => {
                return `<div class="mb-2 flex items-center space-x-2">
                        <span class="text-gray-600 text-sm">#${idx + 1}</span>
                        <img src="${reel.src}" alt="video-img" class="w-10 h-10 object-cover rounded" />
                        <a href="${reel.href}" target="_blank" class="text-black underline text-sm break-all">${reel.href}</a>
                    </div>`;
            }).join('');

            tiktokSummaryDiv.innerHTML = `
                ✅ Total TikTok Videos Found: <strong>${tiktokReelsData.length}</strong>
                <div class="mt-2">Preview (example):</div>
                ${firstItems}
            `;
            tiktokSummaryDiv.classList.remove('hidden');
            downloadTikTokBtn.classList.remove('hidden');
        });
    });

    // Step 2: Download TikTok JSON with cookie
    downloadTikTokBtn.addEventListener('click', () => {
        chrome.cookies.getAll({ domain: 'tiktok.com' }, (cookies) => {
            const cookieObj = cookies.reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {});

            chrome.storage.local.get('tiktokPageInfo', ({ tiktokPageInfo }) => {
                const exportData = {
                    reels: tiktokReelsData,
                    cookies: cookieObj,
                    tiktokPageInfo: tiktokPageInfo,
                    collectedAt: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const slug = tiktokPageInfo?.slug || 'tiktok_videos';

                chrome.downloads.download({
                    url: url,
                    filename: `${slug}_${Date.now()}.json`,
                    saveAs: true
                });
            });
        });
    });

    // TikTok love button functionality
    const tiktokLoveIcon = document.getElementById('tiktokLoveIcon');
    const tiktokLoveBtn = document.getElementById('tiktokLoveBtn');

    chrome.storage.local.get(['tiktokPageInfo', 'savedTikTokPageInfo'], (data) => {
        const tiktokPageInfo = data.tiktokPageInfo;
        const slug = tiktokPageInfo?.slug;
        const savedTikTokPageInfo = data.savedTikTokPageInfo || {};

        const isSaved = slug && savedTikTokPageInfo[slug]?.some(p => p.url === tiktokPageInfo.url);
        toggleTikTokLoveIcon(isSaved);
    });

    tiktokLoveBtn.addEventListener('click', () => {
        chrome.storage.local.get(['tiktokPageInfo', 'savedTikTokPageInfo'], (data) => {
            const tiktokPageInfo = data.tiktokPageInfo;
            const slug = tiktokPageInfo?.slug;
            if (!tiktokPageInfo || !slug) return;

            let savedTikTokPageInfo = data.savedTikTokPageInfo || {};
            let currentList = savedTikTokPageInfo[slug] || [];

            const index = currentList.findIndex(p => p.url === tiktokPageInfo.url);

            const isAlreadySaved = index !== -1;

            if (isAlreadySaved) {
                currentList.splice(index, 1); // Remove item
            } else {
                currentList.push(tiktokPageInfo); // Save item
            }

            // Update storage
            savedTikTokPageInfo[slug] = currentList;
            chrome.storage.local.set({ savedTikTokPageInfo }, () => {
                toggleTikTokLoveIcon(!isAlreadySaved);
            });
        });
    });

    // Helper to update TikTok heart icon style
    function toggleTikTokLoveIcon(saved) {
        tiktokLoveIcon.classList.remove('scale-125');
        tiktokLoveIcon.classList.add('scale-125');
        setTimeout(() => tiktokLoveIcon.classList.remove('scale-125'), 300);

        if (saved) {
            tiktokLoveIcon.classList.remove('text-white');
            tiktokLoveIcon.classList.add('text-red-500');
        } else {
            tiktokLoveIcon.classList.remove('text-red-500');
            tiktokLoveIcon.classList.add('text-white');
        }
    }

    // Add event listeners for TikTok buttons
    document.getElementById('collectTikTokReelsBtn').addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'collectTikTokReels' }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    return;
                }
                console.log('TikTok reels collection response:', response);
                // Reload TikTok data after collection
                setTimeout(() => {
                    loadTikTokReels();
                }, 1000);
            });
        });
    });

    document.getElementById('downloadTikTokJsonBtn').addEventListener('click', function () {
        chrome.storage.local.get(['tiktokReelsData', 'tiktokPageInfo'], function (data) {
            const jsonData = {
                platform: 'TikTok',
                pageInfo: data.tiktokPageInfo || {},
                videos: data.tiktokReelsData || [],
                collectedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tiktok_data_${jsonData.pageInfo.slug || 'unknown'}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Add event listeners for YouTube buttons
    document.getElementById('collectYouTubeVideosBtn').addEventListener('click', function () {
        const summary = document.getElementById('youtubeVideosSummary');
        const downloadBtn = document.getElementById('downloadYouTubeJsonBtn');
        chrome.storage.local.get(['youtubeVideosData', 'youtubePageInfo'], function (data) {
            const videos = data.youtubeVideosData || [];
            const pageInfo = data.youtubePageInfo || {};

            if (videos.length === 0) {
                summary.innerHTML = '⚠️ No YouTube videos data found.';
                summary.classList.remove('hidden');
                downloadBtn.classList.add('hidden');
                return;
            }

            // Build summary HTML (first 3 items)
            const firstItems = videos.slice(0, 3).map((video, idx) => {
                const fullUrl = video.href?.startsWith('http') ? video.href : `https://www.youtube.com${video.href || ''}`;
                return `<div class="mb-2 flex items-center space-x-2">
                        <span class="text-gray-600 text-sm">#${idx + 1}</span>
                        <img src="${video.thumbnailUrl || ''}" alt="yt-thumb" class="w-10 h-10 object-cover rounded" />
                        <a href="${fullUrl}" target="_blank" class="text-red-500 underline text-sm break-all">${fullUrl}</a>
                    </div>`;
            }).join('');

            summary.innerHTML = `
                ✅ Total Videos Found: <strong>${videos.length}</strong>
                <div class="mt-2">Preview (example):</div>
                ${firstItems}
            `;
            summary.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');

            // Also refresh the grid beneath
            loadYouTubeData();
        });
    });

    document.getElementById('downloadYouTubeJsonBtn').addEventListener('click', function () {
        chrome.storage.local.get(['youtubeVideosData', 'youtubePageInfo'], function (data) {
            const jsonData = {
                platform: 'YouTube',
                pageInfo: data.youtubePageInfo || {},
                videos: data.youtubeVideosData || [],
                collectedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `youtube_data_${jsonData.pageInfo.slug || 'unknown'}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

});