const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const { parseFilename } = require('./lib/parser');
const { matchSubtitles } = require('./lib/matcher');

// تعريف الـ manifest للإضافة
const manifest = {
    id: 'com.smartsubs.addon',
    version: '1.0.0',
    name: 'SmartSubs - ذكي للترجمة',
    description: 'إضافة ذكية تختار أفضل ترجمة تناسب ملف الفيديو تلقائياً بناءً على اسم الملف والمواصفات',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    catalogs: [],
    behaviorHints: {
        adult: false,
        p2p: false,
        configurable: false
    },
    logo: 'https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=SmartSubs'
};

// إنشاء builder للإضافة
const builder = addonBuilder(manifest);

// معالج الترجمات الرئيسي
builder.defineSubtitlesHandler(async (args) => {
    try {
        console.log('SmartSubs: Processing request for', args.type, args.id);

        // الحصول على اسم ملف الفيديو من السياق
        const filename = extractVideoFilename(args);

        if (!filename) {
            console.log('SmartSubs: No video filename available');
            return { subtitles: [] };
        }

        console.log('SmartSubs: Video filename:', filename);

        // تحليل اسم ملف الفيديو
        const videoInfo = parseFilename(filename);
        console.log('SmartSubs: Parsed video info:', videoInfo);

        // محاكاة الترجمات الموجودة (في التطبيق الفعلي ستأتي من Stremio)
        const existingSubtitles = getSimulatedSubtitles(args);

        // مطابقة وتحسين الترجمات
        const smartSubtitles = matchSubtitles(videoInfo, existingSubtitles);

        console.log(`SmartSubs: Returning ${smartSubtitles.length} enhanced subtitles`);

        return { subtitles: smartSubtitles };

    } catch (error) {
        console.error('SmartSubs Error:', error);
        return { subtitles: [] };
    }
});

// استخراج اسم ملف الفيديو من args
function extractVideoFilename(args) {
    // البحث في أماكن مختلفة لاسم الملف
    return args.extra?.videoFilename || 
           args.extra?.filename || 
           args.extra?.videoTitle ||
           simulateVideoFilename(args);  // محاكاة لأغراض الاختبار
}

// محاكاة اسم ملف الفيديو (للاختبار)
function simulateVideoFilename(args) {
    if (args.type === 'series') {
        return 'Game.of.Thrones.S08E06.1080p.BluRay.x264-DEMAND.mkv';
    } else {
        return 'The.Matrix.1999.1080p.BluRay.x264-AMIABLE.mkv';
    }
}

// محاكاة الترجمات الموجودة (للاختبار)
function getSimulatedSubtitles(args) {
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
