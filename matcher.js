const { calculateDelay } = require('./calculator');

class SubtitleMatcher {
    static matchSubtitles(videoInfo, subtitles) {
        if (!subtitles || subtitles.length === 0) {
            return [];
        }

        console.log('SmartSubs Matcher: Processing', subtitles.length, 'subtitles');

        // تحليل كل ترجمة وحساب النتيجة
        const analyzed = subtitles.map(subtitle => {
            const analysis = this.analyzeSubtitle(subtitle.name);
            const score = this.calculateMatchScore(videoInfo, analysis);

            return {
                subtitle,
                analysis,
                score,
                isExactMatch: score >= 8 // نتيجة عالية تعني تطابق ممتاز
            };
        });

        // ترتيب حسب النتيجة
        analyzed.sort((a, b) => b.score - a.score);

        // أخذ أفضل 3 نتائج
        const topMatches = analyzed.slice(0, 3);

        // تحسين الترجمات
        const enhanced = topMatches.map(match => {
            return this.enhanceSubtitle(videoInfo, match);
        });

        return enhanced;
    }

    static analyzeSubtitle(subtitleName) {
        const analysis = {
            resolution: null,
            source: null,
            codec: null,
            releaseGroup: null
        };

        // تحليل مشابه لتحليل الفيديو
        if (/1080p/i.test(subtitleName)) analysis.resolution = '1080P';
        else if (/720p/i.test(subtitleName)) analysis.resolution = '720P';
        else if (/4K|2160p/i.test(subtitleName)) analysis.resolution = '4K';

        if (/BluRay|BD/i.test(subtitleName)) analysis.source = 'BLURAY';
        else if (/WEB-DL/i.test(subtitleName)) analysis.source = 'WEB-DL';
        else if (/WEBRip/i.test(subtitleName)) analysis.source = 'WEBRIP';
        else if (/HDTV/i.test(subtitleName)) analysis.source = 'HDTV';

        if (/x264/i.test(subtitleName)) analysis.codec = 'X264';
        else if (/x265|HEVC/i.test(subtitleName)) analysis.codec = 'X265';

        // البحث عن release group في آخر النص
        const groupMatch = subtitleName.match(/([A-Z0-9]{3,})\s*$/);
        if (groupMatch) {
            analysis.releaseGroup = groupMatch[1];
        }

        return analysis;
    }

    static calculateMatchScore(video, subtitle) {
        let score = 0;

        // مطابقة الدقة (أهم عامل)
        if (video.resolution && subtitle.resolution === video.resolution) {
            score += 4;
        }

        // مطابقة المصدر (مهم جداً للتوقيت)
        if (video.source && subtitle.source === video.source) {
            score += 3;
        }

        // مطابقة الكودك
        if (video.codec && subtitle.codec === video.codec) {
            score += 2;
        }

        // مطابقة مجموعة الإصدار (الأهم للدقة)
        if (video.releaseGroup && subtitle.releaseGroup === video.releaseGroup) {
            score += 5; // نتيجة عالية لأنها تضمن التطابق الكامل
        }

        return score;
    }

    static enhanceSubtitle(videoInfo, match) {
        const { subtitle, analysis, score, isExactMatch } = match;

        if (isExactMatch) {
            // تطابق ممتاز - لا حاجة للتعديل
            return {
                ...subtitle,
                name: `✅ [SmartSubs] ${subtitle.name} (مطابقة ممتازة)`
            };
        }

        // حساب التأخير المطلوب
        const delay = calculateDelay(videoInfo.source, analysis.source);

        if (Math.abs(delay) < 0.1) {
            // تأخير ضئيل
            return {
                ...subtitle,
                name: `⚡ [SmartSubs] ${subtitle.name} (مطابقة جيدة)`
            };
        }

        // تأخير ملحوظ - إضافة تعليمات التعديل
        const sign = delay > 0 ? '+' : '';
        const delayText = `${sign}${delay.toFixed(2)}s`;

        return {
            ...subtitle,
            name: `⚙️ [SmartSubs] ${subtitle.name} • adjust ${delayText}`
        };
    }
}

module.exports = { matchSubtitles: SubtitleMatcher.matchSubtitles };
