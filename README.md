# RellExtractor Chrome Extension

A Chrome extension for extracting reels/videos from social media platforms.

## Supported Platforms

- **Facebook**: Extracts reels from Facebook pages
- **Instagram**: Extracts reels from Instagram profiles
- **TikTok**: Extracts videos from TikTok profiles
- **YouTube**: Extracts videos from YouTube channels

## YouTube Functionality

The extension now supports YouTube channel video extraction with the following features:

### Page Information Extraction
- **Channel Name**: Extracted from the first `<span>` text inside `<h1>` tags
- **Channel Slug**: Extracted from the URL (e.g., `@SmithsCreationOfficial` from `https://www.youtube.com/@SmithsCreationOfficial/videos`)
- **Subscribers Count**: Found in text containing "subscribers" (e.g., "9.1M subscribers")
- **Videos Count**: Found in text containing "videos" (e.g., "1K videos")
- **Profile Image**: Extracted from channel avatar elements

### Video Extraction
- **Video Links**: Finds all `<a>` tags containing `/watch?v=` URLs
- **Video IDs**: Extracts unique video identifiers from URLs
- **Video Titles**: Attempts to extract titles from nearby heading elements
- **Thumbnails**: Extracts thumbnail image URLs
- **View Counts**: Looks for text containing view information
- **Duration**: Extracts video duration when available

### Usage
1. Navigate to a YouTube channel page (e.g., `https://www.youtube.com/@SmithsCreationOfficial/videos`)
2. Click the extension icon to open the popup
3. The YouTube tab will automatically activate
4. Click "🎥 Collect YouTube Videos" to extract video information
5. Use "⬇️ Download YouTube JSON" to save the extracted data

### Data Storage
- Page information is stored in `youtubePageInfo`
- Video data is stored in `youtubeVideosData`
- Data persists across page refreshes until navigating to a different channel

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your Chrome toolbar

## Features

- **Automatic Detection**: Automatically detects which platform you're on
- **Real-time Updates**: Uses MutationObserver to detect new content
- **Data Persistence**: Stores extracted data in Chrome's local storage
- **JSON Export**: Download extracted data in JSON format
- **Cross-platform**: Works with Facebook, Instagram, TikTok, and YouTube
