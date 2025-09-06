// اختبار بسيط لوظائف SmartSubs
const { parseFilename } = require('./lib/parser');
const { matchSubtitles } = require('./lib/matcher');

console.log('🧪 اختبار وظائف SmartSubs\n');

// اختبار تحليل اسم الملف
const testFilenames = [
    'Game.of.Thrones.S08E06.1080p.BluRay.x264-DEMAND.mkv',
    'The.Matrix.1999.1080p.BluRay.x264-AMIABLE.mkv',
    'Breaking.Bad.S05E14.720p.WEB-DL.x265-RARBG.mp4',
    'Avengers.Endgame.2019.4K.UHD.BluRay.x265-TERMINAL.mkv'
];

console.log('📄 اختبار تحليل أسماء الملفات:');
testFilenames.forEach((filename, index) => {
    console.log(`\n${index + 1}. ${filename}`);
    const parsed = parseFilename(filename);
    console.log(`   📺 العنوان: ${parsed.title}`);
    console.log(`   🎬 الدقة: ${parsed.resolution || 'غير محدد'}`);
    console.log(`   💿 المصدر: ${parsed.source || 'غير محدد'}`);
    console.log(`   🔧 الكودك: ${parsed.codec || 'غير محدد'}`);
    console.log(`   👥 المجموعة: ${parsed.releaseGroup || 'غير محدد'}`);
    if (parsed.season && parsed.episode) {
        console.log(`   📺 الموسم/الحلقة: S${parsed.season}E${parsed.episode}`);
    }
});

// اختبار مطابقة الترجمات
console.log('\n\n🎯 اختبار مطابقة الترجمات:');
const videoInfo = parseFilename('Game.of.Thrones.S08E06.1080p.BluRay.x264-DEMAND.mkv');
const sampleSubtitles = [
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
    }
];

console.log('\n🔍 فيديو الاختبار:', videoInfo.original);
console.log('📋 الترجمات المتاحة:');
sampleSubtitles.forEach((sub, index) => {
    console.log(`   ${index + 1}. ${sub.name}`);
});

const matchedSubs = matchSubtitles(videoInfo, sampleSubtitles);
console.log('\n✨ الترجمات المحسنة:');
matchedSubs.forEach((sub, index) => {
    console.log(`   ${index + 1}. ${sub.name}`);
});

console.log('\n✅ اكتمل الاختبار بنجاح!');
