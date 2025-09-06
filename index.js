const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const https = require('https');
const zlib = require('zlib');

const OPEN_SUBTITLES_API_KEY = 'UPXsVJMBOLaCGkA6PFopK2YKYCJ7VXk6';

const manifest = {
    id: 'com.smartsubs.addon',
    version: '1.0.0',
    name: 'SmartSubs - محسن الترجمات',
    description: 'إضافة تحسن اختيار الترجمات بناءً على مطابقة الفيديو',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    catalogs: []
};

const builder = addonBuilder(manifest);

// تحميل وتحويل ترجمة من OpenSubtitles
async function downloadAndConvertSubtitle(fileId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.opensubtitles.com',
            path: `/api/v1/download`,
            method: 'POST',
            headers: {
                'Api-Key': OPEN_SUBTITLES_API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.link) {
                        // تحميل الملف الفعلي
                        downloadSubtitleFile(response.link)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(new Error('No download link'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify({ file_id: fileId }));
        req.end();
    });
}

async function downloadSubtitleFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let buffer = Buffer.alloc(0);
            res.on('data', chunk => buffer = Buffer.concat([buffer, chunk]));
            res.on('end', () => {
                try {
                    // فك الضغط إذا كان الملف مضغوط
                    const content = zlib.gunzipSync(buffer).toString('utf8');
                    // تحويل لـ base64 data URL
                    const base64Content = Buffer.from(content, 'utf8').toString('base64');
                    resolve(`data:text/srt;base64,${base64Content}`);
                } catch (e) {
                    // إذا لم يكن مضغوط
                    const base64Content = buffer.toString('base64');
                    resolve(`data:text/srt;base64,${base64Content}`);
                }
            });
        }).on('error', reject);
    });
}

// بحث في ترجمات OpenSubtitles (بدون تحميل)
async function searchOpenSubtitles(filename, language = 'ara') {
    return new Promise((resolve, reject) => {
        const searchUrl = `https://api.opensubtitles.com/api/v1/subtitles?query=${encodeURIComponent(filename)}&languages=${language}&moviehash_match=include`;
        
        const options = {
            hostname: 'api.opensubtitles.com',
            path: `/api/v1/subtitles?query=${encodeURIComponent(filename)}&languages=${language}`,
            method: 'GET',
            headers: {
                'Api-Key': OPEN_SUBTITLES_API_KEY,
                'User-Agent': 'SmartSubs v1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.data && response.data.length > 0) {
                        // بدلاً من روابط تحميل، نعطي معلومات تعليمية
                        const subs = response.data.slice(0, 3).map((item, index) => ({
                            id: item.attributes.files.file_id.toString(),
                            name: `📋 [SmartSubs] ${item.attributes.filename || 'Arabic'} - وُجد ${response.data.length} ترجمة`,
                            url: generateInfoSubtitle(item.attributes.filename, response.data.length, index + 1),
                            lang: language
                        }));
                        resolve(subs);
                    } else {
                        resolve([{
                            id: 'no-results',
                            name: '❌ [SmartSubs] لم توجد ترجمات مطابقة - جرب البحث اليدوي',
                            url: generateInfoSubtitle('لا توجد ترجمات', 0, 0),
                            lang: language
                        }]);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

// إنشاء ترجمة تعليمية
function generateInfoSubtitle(filename, totalCount, rank) {
    const srtContent = `1
00:00:05,000 --> 00:00:10,000
SmartSubs - نتائج البحث

2  
00:00:10,000 --> 00:00:15,000
اسم الملف: ${filename || 'غير معروف'}

3
00:00:15,000 --> 00:00:20,000
إجمالي الترجمات المتاحة: ${totalCount}

4
00:00:20,000 --> 00:00:25,000
الترتيب: #${rank} (الأنسب للأعلى)

5
00:00:25,000 --> 00:00:30,000
لتحميل الترجمة: اذهب إلى opensubtitles.com

6
00:00:30,000 --> 00:00:35,000
ابحث عن نفس اسم الملف وحمّل يدوياً
`;

    const base64Content = Buffer.from(srtContent, 'utf8').toString('base64');
    return `data:text/srt;base64,${base64Content}`;
}

builder.defineSubtitlesHandler(async (args) => {
    try {
        // محاكاة اسم الفيديو أو استخراجه
        const filename = args.extra?.videoFilename || 
                        args.extra?.filename ||
                        extractFilenameFromIMDB(args) ||
                        'تجريبي';

        console.log('SmartSubs: Searching for', filename);

        const subs = await searchOpenSubtitles(filename, 'ara');
        console.log(`SmartSubs: Found ${subs.length} subtitle matches`);

        return { subtitles: subs };
    } catch (err) {
        console.error('SmartSubs Error:', err);
        return { 
            subtitles: [{
                id: 'error',
                name: '⚠️ [SmartSubs] خطأ في البحث - تحقق من الاتصال',
                url: generateInfoSubtitle('خطأ', 0, 0),
                lang: 'ara'
            }]
        };
    }
});

// استخراج اسم من IMDB إذا لم يتوفر اسم الملف
function extractFilenameFromIMDB(args) {
    if (args.id && args.id.includes('tt')) {
        const imdbId = args.id.split(':');
        // هنا يمكن استخدام IMDB API للحصول على اسم الفيلم
        return `${args.type}_${imdbId}`;
    }
    return null;
}

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log(`🚀 SmartSubs running on port ${PORT}`);
console.log('📝 الإضافة ستعرض معلومات الترجمات المتاحة وإرشادات التحميل');

serveHTTP(builder.getInterface(), { port: PORT });

console.log(`SmartSubs running on port ${PORT}`);
