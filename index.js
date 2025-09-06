const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const fetch = require('node-fetch');

const OPEN_SUBTITLES_API_KEY = 'UPXsVJMBOLaCGkA6PFopK2YKYCJ7VXk6';

const manifest = {
    id: 'com.smartsubs.addon',
    version: '1.0.0',
    name: 'SmartSubs - OpenSubtitles API',
    description: 'إضافة تختار الترجمة الأنسب من OpenSubtitles تلقائياً',
    resources: ['subtitles'],
    types: ['movie', 'series'],
    catalogs: []
};

const builder = addonBuilder(manifest);

async function fetchOpenSubtitles(filename, language = 'ara') {
  const url = `https://api.opensubtitles.com/api/v1/subtitles?query=${encodeURIComponent(filename)}&languages=${language}`;

  const response = await fetch(url, {
    headers: {
      'Api-Key': OPEN_SUBTITLES_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('OpenSubtitles API Error:', await response.text());
    throw new Error(`OpenSubtitles API error: ${response.statusText}`);
  }

  const data = await response.json();

  // إعادة ترتيب أو اختيار يمكن إضافته هنا إذا أردت لاحقاً
  return data.data.map(item => ({
    id: item.attributes.files[0].file_id.toString(),
    name: item.attributes.filename,
    lang: item.attributes.language,
    url: item.attributes.files[0].file_url
  }));
}

builder.defineSubtitlesHandler(async (args) => {
    try {
        const filename = args.extra?.videoFilename || args.extra?.filename;
        if (!filename) return { subtitles: [] };

        console.log('SmartSubs: Fetching subtitles for', filename);

        const subs = await fetchOpenSubtitles(filename, 'ara');
        console.log(`SmartSubs: Found ${subs.length} subtitles`);

        return { subtitles: subs };
    } catch (err) {
        console.error('SmartSubs Error:', err);
        return { subtitles: [] };
    }
});

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log(`SmartSubs running on port ${PORT}`);
