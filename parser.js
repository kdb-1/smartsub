class VideoParser {
    static parseFilename(filename) {
        const result = {
            original: filename,
            title: null,
            year: null,
            season: null,
            episode: null,
            resolution: null,
            source: null,
            codec: null,
            releaseGroup: null,
            language: null
        };

        // استخراج الدقة (Resolution)
        const resolutionPatterns = [
            { pattern: /\b(2160p|4K|UHD)\b/i, value: '4K' },
            { pattern: /\b(1080p)\b/i, value: '1080P' },
            { pattern: /\b(720p)\b/i, value: '720P' },
            { pattern: /\b(480p|576p)\b/i, value: '480P' }
        ];

        for (const { pattern, value } of resolutionPatterns) {
            if (pattern.test(filename)) {
                result.resolution = value;
                break;
            }
        }

        // استخراج المصدر (Source)
        const sourcePatterns = [
            { pattern: /\b(BluRay|Blu-ray|BD|BDRip)\b/i, value: 'BLURAY' },
            { pattern: /\b(WEB-DL|WEBDL|WEB\.DL)\b/i, value: 'WEB-DL' },
            { pattern: /\b(WEBRip|WEB-Rip|WEB\.Rip)\b/i, value: 'WEBRIP' },
            { pattern: /\b(HDRip|HD-Rip)\b/i, value: 'HDRIP' },
            { pattern: /\b(DVDRip|DVD-Rip)\b/i, value: 'DVDRIP' },
            { pattern: /\b(HDTV|HD-TV)\b/i, value: 'HDTV' },
            { pattern: /\b(CAMRip|CAM)\b/i, value: 'CAM' },
            { pattern: /\b(TS|TELESYNC)\b/i, value: 'TS' }
        ];

        for (const { pattern, value } of sourcePatterns) {
            if (pattern.test(filename)) {
                result.source = value;
                break;
            }
        }

        // استخراج الكودك (Codec)
        const codecPatterns = [
            { pattern: /\b(x264|H\.264|AVC)\b/i, value: 'X264' },
            { pattern: /\b(x265|H\.265|HEVC)\b/i, value: 'X265' },
            { pattern: /\b(AV1)\b/i, value: 'AV1' },
            { pattern: /\b(XviD)\b/i, value: 'XVID' }
        ];

        for (const { pattern, value } of codecPatterns) {
            if (pattern.test(filename)) {
                result.codec = value;
                break;
            }
        }

        // استخراج الموسم والحلقة
        const episodeMatch = filename.match(/S(\d{1,2})E(\d{1,2})/i);
        if (episodeMatch) {
            result.season = parseInt(episodeMatch[1]);
            result.episode = parseInt(episodeMatch[2]);
        }

        // استخراج السنة
        const yearMatch = filename.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            result.year = parseInt(yearMatch[0]);
        }

        // استخراج مجموعة الإصدار (Release Group)
        const releaseGroupMatch = filename.match(/[-\.\s]([A-Za-z0-9]+)(?:\.[a-z0-9]+)?$/);
        if (releaseGroupMatch && releaseGroupMatch[1].length >= 3) {
            result.releaseGroup = releaseGroupMatch[1];
        }

        // استخراج العنوان
        let title = filename;
        // إزالة التفاصيل التقنية
        title = title.replace(/\.(19|20)\d{2}\./, ' ');
        title = title.replace(/\.S\d{1,2}E\d{1,2}\./, ' ');
        title = title.replace(/\.\d{3,4}p\./, ' ');
        title = title.replace(/\.(BluRay|WEB-DL|HDRip|HDTV)\./, ' ');
        title = title.replace(/\.(x264|x265|HEVC)\./, ' ');
        title = title.replace(/\.mkv$|\.mp4$|\.avi$/i, '');
        title = title.replace(/\./g, ' ').trim();
        result.title = title;

        return result;
    }
}

module.exports = { parseFilename: VideoParser.parseFilename };
