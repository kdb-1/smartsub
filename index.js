const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

// تعريف الـ manifest للإضافة
const manifest = {
    id: 'com.smartsubs.addon',
    version: '1.0.0', 
    name: 'SmartSubs - محسن الترجمات',
    description: 'يرتب ويحسن الترجمات الموجودة بناءً على مطابقة الفيديو',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    catalogs: []
};

// إنشاء builder للإضافة
const builder = addonBuilder(manifest);

// معالج الترجمات
builder.defineSubtitlesHandler(async (args) => {
    try {
        console.log('SmartSubs: Processing subtitles request');
        
        // بدلاً من إنشاء ترجمات وهمية، نرجع مصفوفة فارغة 
        // لأن SmartSubs يجب أن يعمل مع الترجمات الموجودة من إضافات أخرى
        
        return { 
            subtitles: [
                // ترجمة تعليمية توضح كيف تعمل الإضافة
                {
                    id: 'smartsubs-info',
                    name: '📋 [SmartSubs] لا توجد ترجمات لتحسينها - ثبت إضافات ترجمة أخرى أولاً',
                    url: generateInfoSubtitle(),
                    lang: 'ara'
                }
            ]
        };
        
    } catch (error) {
        console.error('SmartSubs Error:', error);
        return { subtitles: [] };
    }
});

// إنشاء ملف ترجمة تعليمي
function generateInfoSubtitle() {
    const srtContent = `1
00:00:05,000 --> 00:00:10,000
مرحباً! هذه إضافة SmartSubs

2  
00:00:10,000 --> 00:00:15,000
تحتاج إلى تثبيت إضافات ترجمة أخرى أولاً

3
00:00:15,000 --> 00:00:20,000
مثل OpenSubtitles أو Subscene

4
00:00:20,000 --> 00:00:25,000
ثم ستقوم SmartSubs بتحسين ترتيب الترجمات

5
00:00:25,000 --> 00:00:30,000
وإعطاء تعليمات للتعديل اليدوي
`;

    // تشفير المحتوى إلى base64 لإنشاء data URL صالح
    const base64Content = Buffer.from(srtContent, 'utf8').toString('base64');
    return `data:text/srt;base64,${base64Content}`;
}

// بدء الخادم
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log('🚀 SmartSubs addon is running!');
console.log(`📍 Manifest: https://your-app.onrender.com/manifest.json`);
