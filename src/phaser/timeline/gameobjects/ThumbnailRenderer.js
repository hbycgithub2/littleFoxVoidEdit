// src/phaser/timeline/gameobjects/ThumbnailRenderer.js
// 缩略图渲染器 - 管理缩略图的生成和显示（V2.0 - 虚拟滚动）

import VideoFrameExtractor from '../utils/VideoFrameExtractor.js';
import ThumbnailCacheManager from './ThumbnailCacheManager.js';
import ThumbnailPoolManager from './ThumbnailPoolManager.js';

export default class ThumbnailRenderer {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.extractor = null;
        this.generating = false;
        
        // V2.0: 缓存和对象池
        this.cacheManager = new ThumbnailCacheManager(scene, config.maxCacheSize);
        this.poolManager = new ThumbnailPoolManager(scene, config.poolSize);
        
        // 存储所有帧数据
        this.frames = [];
        this.visibleThumbnails = new Map(); // 当前可见的缩略图
    }
    
    /**
     * 初始化提取器
     * @param {HTMLVideoElement} videoElement
     */
    init(videoElement) {
        this.extractor = new VideoFrameExtractor(videoElement, this.config);
        console.log('✅ ThumbnailRenderer initialized');
    }
    
    /**
     * 生成所有缩略图
     * @param {number} duration - 视频时长
     * @param {Function} onProgress - 进度回调
     */
    async generateThumbnails(duration, onProgress) {
        if (this.generating) {
            console.warn('⚠️ 缩略图生成中...');
            return;
        }
        
        this.generating = true;
        console.log('🎬 开始生成缩略图...', { duration });
        
        // 计算采样点
        const timestamps = this.extractor.calculateSamplePoints(
            duration,
            this.config.samplingInterval
        );
        
        console.log(`📊 采样点数量: ${timestamps.length}`, timestamps.slice(0, 5));
        
        // 批量提取帧
        this.frames = await this.extractor.extractFrames(timestamps, onProgress);
        
        console.log(`✅ 帧提取完成，共${this.frames.length}帧`);
        
        // V2.0: 只渲染���见区域
        console.log('🎨 开始渲染可见缩略图...');
        this.renderVisibleThumbnails();
        
        this.generating = false;
        console.log('✅ 缩略图生成完成');
    }
    
    /**
     * V2.0: 渲染可见区域的缩略图
     */
    renderVisibleThumbnails() {
        const visibleRange = this.calculateVisibleRange();
        
        // 移除不可见的缩略图
        this.removeInvisibleThumbnails(visibleRange);
        
        // 添加新的可见缩略图
        this.addVisibleThumbnails(visibleRange);
        
        console.log(`✅ 可见缩略图: ${this.visibleThumbnails.size}个`);
    }
    
    /**
     * 计算可见范围
     */
    calculateVisibleRange() {
        const camera = this.scene.cameras.main;
        const scrollX = camera.scrollX;
        const viewWidth = camera.width;
        const margin = this.config.preloadMargin || 200;
        
        return {
            startX: Math.max(0, scrollX - margin),
            endX: scrollX + viewWidth + margin
        };
    }
    
    /**
     * 移除不可见的缩略图
     */
    removeInvisibleThumbnails(visibleRange) {
        const toRemove = [];
        
        this.visibleThumbnails.forEach((image, index) => {
            const x = index * this.config.thumbnailWidth;
            
            if (x < visibleRange.startX || x > visibleRange.endX) {
                toRemove.push(index);
            }
        });
        
        toRemove.forEach(index => {
            const image = this.visibleThumbnails.get(index);
            this.poolManager.release(image);
            this.visibleThumbnails.delete(index);
        });
    }
    
    /**
     * 添加可见的缩略图
     */
    addVisibleThumbnails(visibleRange) {
        this.frames.forEach((frame, index) => {
            const x = index * this.config.thumbnailWidth;
            
            // 检查是否在可见范围内
            if (x >= visibleRange.startX && x <= visibleRange.endX) {
                // 如果还未渲染
                if (!this.visibleThumbnails.has(index)) {
                    this.renderThumbnail(frame.timestamp, frame.base64, index);
                }
            }
        });
    }
    
    /**
     * 渲染单个缩略图（V2.0 - 使用缓存和对象池）
     */
    renderThumbnail(timestamp, base64, index) {
        const cacheKey = `thumb_${timestamp}`;
        const textureKey = `thumbnail_${index}`; // 使用index而不是timestamp，更简洁
        
        // 从对象池获取Image
        const image = this.poolManager.acquire();
        
        // 检查缓存
        let cachedTextureKey = this.cacheManager.get(cacheKey);
        
        if (!cachedTextureKey) {
            // 添加纹理到Phaser（异步）
            if (!this.scene.textures.exists(textureKey)) {
                // 监听纹理加载完成 - 使用on而不是once，并检查key匹配
                const onTextureAdded = (key) => {
                    if (key === textureKey) {
                        // 纹理加载完成，设置到Image
                        image.setTexture(textureKey);
                        
                        // 移除监听器
                        this.scene.textures.off('addtexture', onTextureAdded);
                    }
                };
                
                // 先监听，再添加
                this.scene.textures.on('addtexture', onTextureAdded);
                this.scene.textures.addBase64(textureKey, base64);
            }
            
            // 添加到缓存
            this.cacheManager.set(cacheKey, textureKey);
            cachedTextureKey = textureKey;
        } else {
            // 使用缓存的纹理
            if (this.scene.textures.exists(cachedTextureKey)) {
                image.setTexture(cachedTextureKey);
            }
        }
        
        // 设置位置和大小
        image.setDisplaySize(this.config.thumbnailWidth, this.config.thumbnailHeight);
        
        const x = index * this.config.thumbnailWidth;
        const y = 50;
        image.setPosition(x, y);
        image.setOrigin(0, 0.5);
        
        // 确保可见
        image.setVisible(true);
        image.setAlpha(1);
        image.setDepth(100);
        
        // 添加到场景容器
        this.scene.thumbnailLayer.add(image);
        
        // 存储引用
        this.visibleThumbnails.set(index, image);
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalFrames: this.frames.length,
            visibleThumbnails: this.visibleThumbnails.size,
            cache: this.cacheManager.getStats(),
            pool: this.poolManager.getStats()
        };
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.extractor) {
            this.extractor.destroy();
        }
        this.cacheManager.destroy();
        this.poolManager.destroy();
        this.frames = [];
        this.visibleThumbnails.clear();
    }
}
