// src/phaser/timeline/gameobjects/ThumbnailPoolManager.js
// 对象池管理器 - 复用Image对象，减少GC压力（V2.0）

export default class ThumbnailPoolManager {
    constructor(scene, poolSize = 20) {
        this.scene = scene;
        this.poolSize = poolSize;
        this.pool = [];
        this.activeObjects = new Set();
        
        // 预创建对象池
        this.initPool();
    }
    
    /**
     * 初始化对象池
     */
    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const image = this.createImage();
            this.pool.push(image);
        }
        console.log(`🎱 对象池已初始化: ${this.poolSize}个对象`);
    }
    
    /**
     * 创建Image对象
     */
    createImage() {
        // 创建一个空的Image（遵循Phaser标准）
        const image = this.scene.add.image(0, 0, '__DEFAULT');
        image.setVisible(false);
        image.setActive(false);
        return image;
    }
    
    /**
     * 获取对象
     * @returns {Phaser.GameObjects.Image}
     */
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            // 从池中获取
            obj = this.pool.pop();
        } else {
            // 池已空，创建新对象
            obj = this.createImage();
            console.warn('⚠️ 对象池已空，创建新对象');
        }
        
        // 激活对象
        obj.setVisible(true);
        obj.setActive(true);
        this.activeObjects.add(obj);
        
        return obj;
    }
    
    /**
     * 释放对象
     * @param {Phaser.GameObjects.Image} obj
     */
    release(obj) {
        if (!obj) return;
        
        // 重置对象状态
        obj.setVisible(false);
        obj.setActive(false);
        obj.setTexture('__DEFAULT');
        obj.setPosition(0, 0);
        
        // 从活动集合移除
        this.activeObjects.delete(obj);
        
        // 放回池中
        if (this.pool.length < this.poolSize) {
            this.pool.push(obj);
        } else {
            // 池已满，销毁对象
            obj.destroy();
        }
    }
    
    /**
     * 释放所有活动对象
     */
    releaseAll() {
        const objects = Array.from(this.activeObjects);
        objects.forEach(obj => this.release(obj));
        console.log(`🎱 释放了 ${objects.length} 个对象`);
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            poolSize: this.poolSize,
            available: this.pool.length,
            active: this.activeObjects.size,
            total: this.pool.length + this.activeObjects.size
        };
    }
    
    /**
     * 销毁对象池
     */
    destroy() {
        // 销毁所有对象
        this.pool.forEach(obj => obj.destroy());
        this.activeObjects.forEach(obj => obj.destroy());
        
        this.pool = [];
        this.activeObjects.clear();
        this.scene = null;
        
        console.log('🎱 对象池已销毁');
    }
}
