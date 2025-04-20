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
        } else if (url.includes('tiktok.com')) {
            enabledTabId = 'tiktokContent';
        } else if (url.includes('youtube.com')) {
            enabledTabId = 'youtubeContent';
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
            document.getElementById('fbPageImage').src = fbPageInfo.imageUrl || '';
            document.getElementById('fbPageUrl').href = fbPageInfo.url || '';

        }


    });
    // Step 2: Download JSON with cookie
    downloadBtn.addEventListener('click', () => {
        chrome.cookies.getAll({ domain: 'facebook.com' }, (cookies) => {
            const cookieObj = cookies.reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {});

            const exportData = {
                reels: reelsData,
                cookies: cookieObj,
                collectedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            chrome.downloads.download({
                url: url,
                filename: `facebook_reels_${Date.now()}.json`,
                saveAs: true
            });
        });
    });
});
