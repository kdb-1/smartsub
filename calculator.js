class DelayCalculator {
    // جدول التأخيرات المعروفة بين المصادر المختلفة
    static delayTable = {
        'BLURAY->WEB-DL': 0.5,
        'WEB-DL->BLURAY': -0.5,
        'BLURAY->WEBRIP': 0.75,
        'WEBRIP->BLURAY': -0.75,
        'HDTV->WEB-DL': -1.25,
        'WEB-DL->HDTV': 1.25,
        'HDTV->BLURAY': -1.5,
        'BLURAY->HDTV': 1.5,
        'DVDRIP->BLURAY': -0.3,
        'BLURAY->DVDRIP': 0.3
    };

    static calculateDelay(videoSource, subtitleSource) {
        if (!videoSource || !subtitleSource || videoSource === subtitleSource) {
            return 0;
        }

        const key = `${subtitleSource}->${videoSource}`;
        const delay = this.delayTable[key];

        if (delay !== undefined) {
            console.log(`SmartSubs: Calculated delay: ${delay}s (${key})`);
            return delay;
        }

        // تخمين ذكي بناءً على نوع المصدر
        return this.estimateDelay(videoSource, subtitleSource);
    }

    static estimateDelay(videoSource, subtitleSource) {
        // تخمينات عامة
        const videoRank = this.getSourceRank(videoSource);
        const subtitleRank = this.getSourceRank(subtitleSource);

        const difference = videoRank - subtitleRank;

        // كل درجة فرق = تأخير 0.25 ثانية تقريباً
        return difference * 0.25;
    }

    static getSourceRank(source) {
        const ranks = {
            'BLURAY': 5,
            'WEB-DL': 4,
            'WEBRIP': 3,
            'HDRIP': 2,
            'HDTV': 1,
            'DVDRIP': 1,
            'CAM': 0,
            'TS': 0
        };

        return ranks[source] || 2; // متوسط افتراضي
    }

    // تقريب التأخير لأقرب 0.25 ثانية (خطوات Stremio)
    static roundToStremioStep(delay) {
        return Math.round(delay * 4) / 4;
    }
}

module.exports = { 
    calculateDelay: (videoSource, subtitleSource) => {
        const delay = DelayCalculator.calculateDelay(videoSource, subtitleSource);
        return DelayCalculator.roundToStremioStep(delay);
    }
};
