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
            loadFacebookReels();
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
        chrome.storage.local.get('reelsData', function (data) {
            const reels = data.reelsData || [];
            if (reels.length > 0) {
                facebookContent.innerHTML = '';
                reels.forEach(reel => {
                    const reelHtml = `
                        <div class="w-1/3 p-2">
                            <div class="border p-2 rounded shadow">
                                <img src="${reel.src}" alt="Reel Preview" class="w-full object-cover rounded mb-2" style="height: 200px;">
                                <button data-href="https://www.facebook.com${reel.href}" class="download-btn text-white bg-blue-500 hover:bg-blue-600 p-2 rounded block text-center">Download</button>
                            </div>
                        </div>`;
                    facebookContent.innerHTML += reelHtml;
                });

                // Attach event listeners to each download button
                document.querySelectorAll('.download-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const videoUrl = this.getAttribute('data-href');
                        handleDownloadClick(videoUrl);
                    });
                });
            } else {
                facebookContent.innerHTML = '<p>No reels found.</p>';
            }
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
});
