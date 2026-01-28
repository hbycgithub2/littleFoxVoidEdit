// src/phaser/timeline/gameobjects/ThumbnailCacheManager.js
// LRU缓存管理器 - 管理纹理缓存，限制内存使用（V2.0）

export default class ThumbnailCacheManager {
    constructor(scene, maxSize = 50) {
        this.scene = scene;
        this.maxSize = maxSize;
        this.cache = new Map(); // 使用Map保持插入顺序
        this.hits = 0;
        this.misses = 0;
    }
    
    /**
     * 添加到缓存
     * @param {string} key - 缓存键
     * @param {string} textureKey - Phaser纹理键
     */
    set(key, textureKey) {
        // 如果已存在，先删除（更新顺序）
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        // 添加到末尾（最新）
        this.cache.set(key, textureKey);
        
        // 检查大小限制
        if (this.cache.size > this.maxSize) {
            this.evictOldest();
        }
    }
    
    /**
     * 从缓存获取
     * @param {string} key
     * @returns {string|null} 纹理键
     */
    get(key) {
        if (!this.cache.has(key)) {
            this.misses++;
            return null;
        }
        
        this.hits++;
        
        // 更新访问顺序（移到末尾）
        const textureKey = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, textureKey);
        
        return textureKey;
    }
    
    /**
     * 检查是否存在
     */
    has(key) {
        return this.cache.has(key);
    }
    
    /**
     * 淘汰最旧的项
     */
    evictOldest() {
        // Map的第一个键是最旧的
        const oldestKey = this.cache.keys().next().value;
        const textureKey = this.cache.get(oldestKey);
        
        // 销毁Phaser纹理
        if (this.scene.textures.exists(textureKey)) {
            this.scene.textures.remove(textureKey);
        }
        
        this.cache.delete(oldestKey);
        
        if (this.scene.game.config.debug) {
            console.log(`🗑️ 淘汰缓存: ${oldestKey}`);
        }
    }
    
    /**
     * 清空缓存
     */
    clear() {
        this.cache.forEach((textureKey) => {
            if (this.scene.textures.exists(textureKey)) {
                this.scene.textures.remove(textureKey);
            }
        });
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
        console.log('🗑️ 缓存已清空');
    }
    
    /**
     * 获取缓存统计
     */
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total * 100).toFixed(2) : 0;
        
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`
        };
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.clear();
        this.scene = null;
    }
}
