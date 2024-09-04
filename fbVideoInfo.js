// Function to get cookies for a specific domain
function getCookies(domain) {
    return new Promise(function (resolve, reject) {
        chrome.cookies.getAll({ domain: domain }, function (cookies) {
            if (chrome.runtime.lastError) {
                reject('Failed to retrieve cookies: ' + chrome.runtime.lastError);
            } else {
                // Format cookies as a single string
                var formattedCookies = cookies.map(function (cookie) {
                    return `${cookie.name}=${cookie.value}`;
                }).join('; ');
                resolve(formattedCookies);
            }
        });
    });
}

// Function to parse JSON strings safely
function parseString(string) {
    try {
        return JSON.parse(`{"text": "${string}"}`).text;
    } catch (error) {
        console.error('Failed to parse string:', error);
        return string;
    }
}

// Function to get Facebook video info using Axios with dynamic cookies
function getFbVideoInfo(videoUrl) {
    return getCookies('.facebook.com').then(cookie => {
        const headers = {
            // "cookie": cookie, // No need to set cookies manually, the browser will handle it
            "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        };

        return axios.get(videoUrl, {
            headers,
            withCredentials: true,  // Ensures browser cookies are sent with the request
        }).then(response => {
            const data = response.data.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
            const sdMatch = data.match(/"browser_native_sd_url":"(.*?)"/) ||
                data.match(/"playable_url":"(.*?)"/) ||
                data.match(/sd_src\s*:\s*"([^"]*)"/) ||
                data.match(/(?<="src":")(https:\/\/[^"]*)/);
            const hdMatch = data.match(/"browser_native_hd_url":"(.*?)"/) ||
                data.match(/"playable_url_quality_hd":"(.*?)"/) ||
                data.match(/hd_src\s*:\s*"([^"]*)"/);
            const titleMatch = data.match(/<meta\sname="description"\scontent="(.*?)"/);
            const thumbMatch = data.match(/"preferred_thumbnail":{"image":{"uri":"(.*?)"/);
            const durationMatch = data.match(/"playable_duration_in_ms":([0-9]+)/);
            const contentDescription = data.match(/"message":{"text":"(.*?)"/)[1] || "";
            if (sdMatch && sdMatch[1] && durationMatch) {
                return {
                    url: videoUrl,
                    contentDescription: contentDescription,
                    duration_ms: Number(durationMatch[1]),
                    sd: parseString(sdMatch[1]),
                    hd: hdMatch && hdMatch[1] ? parseString(hdMatch[1]) : "",
                    title: titleMatch && titleMatch[1] ? parseString(titleMatch[1]) : data.match(/<title>(.*?)<\/title>/)?.[1] ?? "",
                    thumbnail: thumbMatch && thumbMatch[1] ? parseString(thumbMatch[1]) : ""
                };
            } else {
                throw new Error("Unable to fetch video information at this time. Please try again");
            }
        });
    }).catch(err => {
        console.error('Error fetching video info:', err);
        throw err;
    });
}

// Expose the getFbVideoInfo function globally
window.getFbVideoInfo = getFbVideoInfo;
