const { addonBuilder } = require(‘stremio-addon-sdk’);

const manifest = {
id: ‘org.smartsubs.addon’,
version: ‘1.0.0’,
name: ‘SmartSubs - Intelligent Subtitle Matcher’,
description: ‘Automatically matches subtitles to video releases and suggests timing adjustments’,
types: [‘movie’, ‘series’],
catalogs: [],
resources: [‘subtitles’],
behaviorHints: {
configurable: false,
configurationRequired: false
}
};

const addon = new addonBuilder(manifest);

// Parse video filename to extract release info
function parseVideoFilename(filename) {
if (!filename) return {};

```
const info = {
    resolution: null,
    source: null,
    codec: null,
    releaseGroup: null
};

// Extract resolution
const resolutionMatch = filename.match(/\b(2160p|4K|1080p|720p|480p)\b/i);
if (resolutionMatch) info.resolution = resolutionMatch[1].toLowerCase();

// Extract source
const sourceMatch = filename.match(/\b(BluRay|Blu-Ray|BDRip|WEB-DL|WEBRip|HDRip|DVDRip|HDTV|CAM|TS)\b/i);
if (sourceMatch) info.source = sourceMatch[1].toLowerCase().replace('-', '');

// Extract codec
const codecMatch = filename.match(/\b(x264|x265|h264|h265|HEVC|AV1|XviD)\b/i);
if (codecMatch) info.codec = codecMatch[1].toLowerCase();

// Extract release group (usually at the end before extension)
const releaseGroupMatch = filename.match(/-([A-Za-z0-9]+)(?:\.[^.]+)?$/);
if (releaseGroupMatch) info.releaseGroup = releaseGroupMatch[1];

return info;
```

}

// Parse subtitle filename to extract similar info
function parseSubtitleName(subtitleName) {
return parseVideoFilename(subtitleName);
}

// Calculate compatibility score between video and subtitle
function calculateCompatibilityScore(videoInfo, subtitleInfo) {
let score = 0;
let maxScore = 0;

```
// Resolution match (highest priority)
maxScore += 4;
if (videoInfo.resolution && subtitleInfo.resolution) {
    if (videoInfo.resolution === subtitleInfo.resolution) {
        score += 4;
    }
}

// Source match (high priority)
maxScore += 3;
if (videoInfo.source && subtitleInfo.source) {
    if (videoInfo.source === subtitleInfo.source) {
        score += 3;
    }
}

// Codec match (medium priority)
maxScore += 2;
if (videoInfo.codec && subtitleInfo.codec) {
    if (videoInfo.codec === subtitleInfo.codec) {
        score += 2;
    }
}

// Release group match (exact match bonus)
maxScore += 1;
if (videoInfo.releaseGroup && subtitleInfo.releaseGroup) {
    if (videoInfo.releaseGroup.toLowerCase() === subtitleInfo.releaseGroup.toLowerCase()) {
        score += 1;
    }
}

return maxScore > 0 ? score / maxScore : 0;
```

}

// Estimate timing offset based on release differences
function estimateTimingOffset(videoInfo, subtitleInfo) {
let offsetSeconds = 0;

```
// Different sources often have different timing
if (videoInfo.source && subtitleInfo.source && videoInfo.source !== subtitleInfo.source) {
    const sourceOffsets = {
        'bluray-webdl': 0.5,
        'bluray-webrip': 0.75,
        'webdl-bluray': -0.5,
        'webrip-bluray': -0.75,
        'hdtv-bluray': 1.0,
        'bluray-hdtv': -1.0,
        'webdl-hdtv': 0.25,
        'hdtv-webdl': -0.25
    };
    
    const key = `${videoInfo.source}-${subtitleInfo.source}`;
    if (sourceOffsets[key]) {
        offsetSeconds = sourceOffsets[key];
    }
}

// Round to nearest 0.25s (Stremio's step)
return Math.round(offsetSeconds * 4) / 4;
```

}

// Format timing adjustment for display
function formatTimingAdjustment(offsetSeconds) {
if (offsetSeconds === 0) return ‘’;
const sign = offsetSeconds > 0 ? ‘+’ : ‘’;
return ` • adjust ${sign}${offsetSeconds}s`;
}

// Main subtitle processing function
function processSubtitles(videoFilename, originalSubtitles) {
if (!videoFilename || !originalSubtitles || originalSubtitles.length === 0) {
return originalSubtitles;
}

```
const videoInfo = parseVideoFilename(videoFilename);
const processedSubtitles = [];

// Score and sort subtitles by compatibility
const scoredSubtitles = originalSubtitles.map(subtitle => {
    const subtitleInfo = parseSubtitleName(subtitle.id || subtitle.url || '');
    const score = calculateCompatibilityScore(videoInfo, subtitleInfo);
    const offset = score < 1 ? estimateTimingOffset(videoInfo, subtitleInfo) : 0;
    
    return {
        ...subtitle,
        score,
        offset,
        subtitleInfo
    };
});

// Sort by score (highest first)
scoredSubtitles.sort((a, b) => b.score - a.score);

// Process subtitles
scoredSubtitles.forEach((subtitle, index) => {
    let displayName = subtitle.id || subtitle.url || `Subtitle ${index + 1}`;
    
    if (subtitle.score === 1) {
        // Perfect match
        displayName = `✅ ${displayName}`;
    } else if (subtitle.score > 0.7) {
        // Good match with minor adjustment
        const adjustment = formatTimingAdjustment(subtitle.offset);
        displayName = `SmartSubs${adjustment} • ${displayName}`;
    } else if (subtitle.offset !== 0) {
        // Lower compatibility, suggest timing adjustment
        const adjustment = formatTimingAdjustment(subtitle.offset);
        displayName = `SmartSubs${adjustment} • ${displayName}`;
    }
    
    processedSubtitles.push({
        id: subtitle.id,
        url: subtitle.url,
        lang: subtitle.lang,
        displayName: displayName
    });
});

return processedSubtitles;
```

}

// Subtitle endpoint
addon.defineResourceHandler(‘subtitles’, async (args) => {
try {
const { type, id } = args;

```
    // Extract video filename from the stream info if available
    // This is a simplified approach - in practice, you'd need to get this from Stremio's context
    let videoFilename = '';
    
    // Since we can't directly access other addons' data, we'll need to work with what Stremio provides
    // This is a conceptual implementation - actual implementation would require Stremio API integration
    
    // For now, return an empty array as we're primarily a subtitle processor
    // In a real implementation, this would interface with Stremio's subtitle system
    return Promise.resolve({ subtitles: [] });
    
} catch (error) {
    console.error('Error in subtitle handler:', error);
    return Promise.resolve({ subtitles: [] });
}
```

});

// Export the addon
module.exports = addon.getInterface();

// Start the addon server if this file is run directly
if (require.main === module) {
const port = process.env.PORT || 7000;
const server = addon.getInterface();

```
server.listen(port, () => {
    console.log(`SmartSubs addon listening on port ${port}`);
    console.log(`Manifest URL: http://localhost:${port}/manifest.json`);
});
```

}