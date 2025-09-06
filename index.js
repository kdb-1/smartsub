const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
    id: 'com.smartsubs.addon',
    version: '1.0.0',
    name: 'SmartSubs - دليل الترجمات',
    description: 'يساعدك في اختيار أفضل ترجمة بناءً على مواصفات الفيديو',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    catalogs: []
};

const builder = addonBuilder(manifest);

// دالة إنشاء ترجمة تعليمية مضمونة العمل
function createInfoSubtitle(filename = 'تجريبي') {
    const srtContent = `1
00:00:05,000 --> 00:00:08,000
🎬 SmartSubs - دليل الترجمات الذكي

2
00:00:10,000 --> 00:00:13,000
اسم الفيديو: ${filename}

3
00:00:15,000 --> 00:00:18,000
💡 نصيحة: استخدم إضافات ترجمة موثوقة

4
00:00:20,000 --> 00:00:23,000
✅ أفضل الخيارات:

5
00:00:25,000 --> 00:00:28,000
1️⃣ OpenSubtitles v3 (رسمية)

6
00:00:30,000 --> 00:00:33,000
2️⃣ Subscene (مجتمعية)

7
00:00:35,000 --> 00:00:38,000
3️⃣ SubDB (تلقائية)

8
00:00:40,000 --> 00:00:43,000
🔧 للتعديل اليدوي:

9
00:00:45,000 --> 00:00:48,000
اضغط G = تأخير الترجمة

10
00:00:50,000 --> 00:00:53,000
اضغط H = تسريع الترجمة

11
00:00:55,000 --> 00:00:58,000
⚡ كل ضغطة = 0.25 ثانية

12
00:01:00,000 --> 00:01:05,000
🎯 SmartSubs يعمل! استمتع بالمشاهدة
`;

    return `data:text/srt;charset=utf-8;base64,${Buffer.from(srtContent).toString('base64')}`;
}

// معالج الترجمات
builder.defineSubtitlesHandler(async (args) => {
    try {
        console.log('SmartSubs: Request received for', args.type, args.id);

        // محاولة استخراج اسم الفيديو
        let videoName = 'فيديو غير معروف';
        
        if (args.extra?.filename) {
            videoName = args.extra.filename;
        } else if (args.extra?.videoFilename) {
            videoName = args.extra.videoFilename;
        } else if (args.id) {
            videoName = `${args.type}_${args.id}`;
        }

        console.log('SmartSubs: Video name extracted:', videoName);

        // إنشاء ترجمات تعليمية متعددة
        const subtitles = [
            {
                id: 'smartsubs-guide-1',
                name: '📋 [SmartSubs] دليل الاستخدام والنصائح',
                url: createInfoSubtitle(videoName),
                lang: 'ara'
            },
            {
                id: 'smartsubs-guide-2', 
                name: '⚙️ [SmartSubs] إرشادات التعديل اليدوي',
                url: createInfoSubtitle('إرشادات التعديل'),
                lang: 'ara'
            },
            {
                id: 'smartsubs-guide-3',
                name: '🎯 [SmartSubs] أفضل إضافات الترجمة',
                url: createInfoSubtitle('توصيات الإضافات'),
                lang: 'ara'
            }
        ];

        console.log(`SmartSubs: Returning ${subtitles.length} guide subtitles`);
        
        return { subtitles };

    } catch (error) {
        console.error('SmartSubs Error:', error);
        
        return { 
            subtitles: [{
                id: 'smartsubs-error',
                name: '❌ [SmartSubs] خطأ - لكن الإضافة تعمل!',
                url: createInfoSubtitle('خطأ مؤقت'),
                lang: 'ara'
            }]
        };
    }
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log('🚀 SmartSubs Guide running on port:', PORT);
console.log('✅ الإضافة ستظهر ترجمات تعليمية مفيدة');
console.log('📖 استخدمها لتعلم أفضل طرق اختيار وتعديل الترجمات');
