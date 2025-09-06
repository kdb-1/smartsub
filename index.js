const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

// تعريف الـ manifest للإضافة
const manifest = {
    id: 'com.smartsubs.addon',
    version: '1.0.0',
    name: 'SmartSubs - ذكي للترجمة',
    description: 'إضافة ذكية تختار أفضل ترجمة تناسب ملف الفيديو تلقائياً',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    catalogs: [],
    behaviorHints: {
        adult: false,
        p2p: false,
        configurable: false
    }
};

// ========== دوال التحليل والمطابقة ==========

// تحليل اسم ملف الفيديو
function parseFilename(filename) {
    const result = {
        original: filename,
        title: null,
        resolution: null,
        source: null,
        codec: null,
        releaseGroup: null,
        season: null,
        episode: null
    };

    // استخراج الدقة
    if (/1080p/i.test(filename)) result.resolution = '1080P';
    else if (/720p/i.test(filename)) result.resolution = '720P';
    else if (/4K|2160p/i.test(filename)) result.resolution = '4K';
    else if (/480p/i.test(filename)) result.resolution = '480P';

    // استخراج المصدر
    if (/BluRay|BD/i.test(filename)) result.source = 'BLURAY';
    else if (/WEB-DL/i.test(filename)) result.source = 'WEB-DL';
    else if (/WEBRip/i.test(filename)) result.source = 'WEBRIP';
    else if (/HDTV/i.test(filename)) result.source = 'HDTV';
    else if (/DVDRip/i.test(filename)) result.source = 'DVDRIP';

    // استخراج الكودك
    if (/x264/i.test(filename)) result.codec = 'X264';
    else if (/x265|HEVC/i.test(filename)) result.codec = 'X265';
    else if (/AV1/i.test(filename)) result.codec = 'AV1';

    // استخراج الموسم والحلقة
    const episodeMatch = filename.match(/S(\d{1,2})E(\d{1,2})/i);
    if (episodeMatch) {
        result.season = parseInt(episodeMatch[1]);
        result.episode = parseInt(episodeMatch[2]);
    }

    // استخراج مجموعة الإصدار
    const groupMatch = filename.match(/[-.\s]([A-Za-z0-9]{3,})(?:\.[a-z0-9]+)?$/);
    if (groupMatch) {
        result.releaseGroup = groupMatch[1];
    }

    return result;
}

// حساب التأخير بين المصادر
function calculateDelay(videoSource, subtitleSource) {
    const delayTable = {
        'BLURAY->WEB-DL': 0.5,
        'WEB-DL->BLURAY': -0.5,
        'HDTV->WEB-DL': -1.25,
        'WEB-DL->HDTV': 1.25,
        'HDTV->BLURAY': -1.5,
        'BLURAY->HDTV': 1.5
    };

    if (!videoSource || !subtitleSource || videoSource === subtitleSource) {
        return 0;
    }

    const key = `${subtitleSource}->${videoSource}`;
    return delayTable[key] || 0;
}

// مطابقة الترجمات
function matchSubtitles(videoInfo, subtitles) {
    if (!subtitles || subtitles.length === 0) {
        return [];
    }

    // تحليل كل ترجمة وحساب النتيجة
    const analyzed = subtitles.map(subtitle => {
        let score = 0;
        const name = subtitle.name || '';

        // تحليل ترجمة
        const subSource = /BluRay|BD/i.test(name) ? 'BLURAY' :
                         /WEB-DL/i.test(name) ? 'WEB-DL' :
                         /HDTV/i.test(name) ? 'HDTV' : '';

        const subResolution = /1080p/i.test(name) ? '1080P' :
                             /720p/i.test(name) ? '720P' :
                             /4K/i.test(name) ? '4K' : '';

        const subCodec = /x264/i.test(name) ? 'X264' :
                        /x265|HEVC/i.test(name) ? 'X265' : '';

        // حساب النتيجة
        if (videoInfo.resolution && subResolution === videoInfo.resolution) score += 4;
        if (videoInfo.source && subSource === videoInfo.source) score += 3;
        if (videoInfo.codec && subCodec === videoInfo.codec) score += 2;
        if (videoInfo.releaseGroup && name.includes(videoInfo.releaseGroup)) score += 5;

        return { subtitle, score, subSource, isExact: score >= 8 };
    });

    // ترتيب حسب النتيجة
    analyzed.sort((a, b) => b.score - a.score);

    // تحسين أفضل 3 نتائج
    const enhanced = analyzed.slice(0, 3).map(match => {
        const { subtitle, isExact, subSource } = match;

        if (isExact) {
            return {
                ...subtitle,
                name: `✅ [SmartSubs] ${subtitle.name} (مطابقة ممتازة)`
            };
        }

        const delay = calculateDelay(videoInfo.source, subSource);
        
        if (Math.abs(delay) < 0.1) {
            return {
                ...subtitle,
                name: `⚡ [SmartSubs] ${subtitle.name} (مطابقة جيدة)`
            };
        }

        const sign = delay > 0 ? '+' : '';
        return {
            ...subtitle,
            name: `⚙️ [SmartSubs] ${subtitle.name} • adjust ${sign}${delay.toFixed(2)}s`
        };
    });

    return enhanced;
}

// ========== الإضافة الرئيسية ==========

const builder = addonBuilder(manifest);

// معالج الترجمات
builder.defineSubtitlesHandler(async (args) => {
    try {
        console.log('SmartSubs: Processing request for', args.type, args.id);
        
        // محاكاة اسم ملف الفيديو للاختبار
        const filename = args.extra?.videoFilename || 
                        simulateVideoFilename(args);
        
        if (!filename) {
            console.log('SmartSubs: No video filename available');
            return { subtitles: [] };
        }

        console.log('SmartSubs: Video filename:', filename);
        
        // تحليل اسم الفيديو
        const videoInfo = parseFilename(filename);
        console.log('SmartSubs: Parsed video info:', videoInfo);
        
        // محاكاة الترجمات الموجودة
        const existingSubtitles = getSimulatedSubtitles();
        
        // مطابقة وتحسين الترجمات
        const smartSubtitles = matchSubtitles(videoInfo, existingSubtitles);
        
        console.log(`SmartSubs: Returning ${smartSubtitles.length} enhanced subtitles`);
        
        return { subtitles: smartSubtitles };
        
    } catch (error) {
        console.error('SmartSubs Error:', error);
        return { subtitles: [] };
    }
});

// محاكاة اسم ملف الفيديو
function simulateVideoFilename(args) {
    if (args.type === 'series') {
        return 'Game.of.Thrones.S08E06.1080p.BluRay.x264-DEMAND.mkv';
    }
    return 'The.Matrix.1999.1080p.BluRay.x264-AMIABLE.mkv';
}

// محاكاة الترجمات الموجودة
function getSimulatedSubtitles() {
    return [
        {
            id: 'sub1',
            name: 'Arabic - BluRay x264 DEMAND',
            url: 'https://example.com/sub1.srt',
            lang: 'ara'
        },
        {
            id: 'sub2', 
            name: 'Arabic - WEB-DL x265 RARBG',
            url: 'https://example.com/sub2.srt',
            lang: 'ara'
        },
        {
            id: 'sub3',
            name: 'Arabic - HDTV x264 LOL',
            url: 'https://example.com/sub3.srt',
            lang: 'ara'
        },
        {
            id: 'sub4',
            name: 'English - BluRay x264 DEMAND', 
            url: 'https://example.com/sub4.srt',
            lang: 'eng'
        }
    ];
}

// بدء الخادم
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log('🚀 SmartSubs addon is running!');
console.log(`📍 Local: http://localhost:${PORT}/manifest.json`);
console.log(`🌐 Production: https://your-app.onrender.com/manifest.json`);
