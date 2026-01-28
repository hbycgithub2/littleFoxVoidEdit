// src/phaser/timeline/utils/ProgressiveLoader.js
// 渐进式加载器 - 先低分辨率后高清（V3.0）

export default class ProgressiveLoader {
    constructor(config) {
        this.config = config;
        this.enabled = config.enableProgressiveLoad;
        this.lowResQuality = 0.3;
        this.highResQuality = config.quality || 0.8;
    }
    
    /**
     * 渐进式提取帧
     * @param {VideoFrameExtractor} extractor
     * @param {number} timestamp
     * @param {Function} onLowRes - 低分辨率回调
     * @param {Function} onHighRes - 高分辨率回调
     */
    async extractProgressive(extractor, timestamp, onLowRes, onHighRes) {
        if (!this.enabled) {
            // 直接提取高清
            const highRes = await extractor.extractFrame(timestamp);
            if (onHighRes) onHighRes(highRes);
            return highRes;
        }
        
        // 先提取低分辨率
        const lowRes = await this.extractLowRes(extractor, timestamp);
        if (onLowRes) onLowRes(lowRes);
        
        // 延迟提取高分辨率
        setTimeout(async () => {
            const highRes = await this.extractHighRes(extractor, timestamp);
            if (onHighRes) onHighRes(highRes);
        }, 100);
        
        return lowRes;
    }
    
    /**
     * 提取低分辨率
     */
    async extractLowRes(extractor, timestamp) {
        // 临时降低质量
        const originalQuality = extractor.config.quality;
        extractor.config.quality = this.lowResQuality;
        
        const frame = await extractor.extractFrame(timestamp);
        
        // 恢复质量
        extractor.config.quality = originalQuality;
        
        return frame;
    }
    
    /**
     * 提取高分辨率
     */
    async extractHighRes(extractor, timestamp) {
        // 使用高质量
        const originalQuality = extractor.config.quality;
        extractor.config.quality = this.highResQuality;
        
        const frame = await extractor.extractFrame(timestamp);
        
        // 恢复质量
        extractor.config.quality = originalQuality;
        
        return frame;
    }
    
    /**
     * 批量渐进式加载
     */
    async loadBatch(extractor, timestamps, onProgress) {
        const results = [];
        
        for (let i = 0; i < timestamps.length; i++) {
            const timestamp = timestamps[i];
            
            // 先加载低分辨率
            const lowRes = await this.extractLowRes(extractor, timestamp);
            results.push({ timestamp, base64: lowRes, quality: 'low' });
            
            if (onProgress) {
                onProgress(i + 1, timestamps.length, 'low');
            }
        }
        
        // 后台加载高分辨率
        this.loadHighResInBackground(extractor, timestamps, results, onProgress);
        
        return results;
    }
    
    /**
     * 后台加载高分辨率
     */
    async loadHighResInBackground(extractor, timestamps, results, onProgress) {
        for (let i = 0; i < timestamps.length; i++) {
            const timestamp = timestamps[i];
            
            try {
                const highRes = await this.extractHighRes(extractor, timestamp);
                results[i] = { timestamp, base64: highRes, quality: 'high' };
                
                if (onProgress) {
                    onProgress(i + 1, timestamps.length, 'high');
                }
            } catch (error) {
                console.error(`高清加载失败 (${timestamp}s):`, error);
            }
            
            // 避免阻塞
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}
