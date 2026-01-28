// src/phaser/timeline/scenes/TimelineThumbnailScene.js
// 时间轴缩略图场景 - 遵循Phaser官方Scene标准（V1.0 MVP）

export default class TimelineThumbnailScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TimelineThumbnailScene' });
    }
    
    /**
     * Phaser生命周期 - 预加载
     */
    preload() {
        // 加载占位图（可选）
        // this.load.image('placeholder', 'assets/placeholder.png');
    }
    
    /**
     * Phaser生命周期 - 创建
     */
    create() {
        console.log('🎬 TimelineThumbnailScene created');
        
        // 创建容器层级（遵循Phaser标准）
        this.backgroundLayer = this.add.container(0, 0);
        this.thumbnailLayer = this.add.container(0, 0);
        this.uiLayer = this.add.container(0, 0);
        
        // 设置容器深度
        this.backgroundLayer.setDepth(0);
        this.thumbnailLayer.setDepth(100);
        this.uiLayer.setDepth(200);
        
        // 确保容器可见
        this.backgroundLayer.setVisible(true);
        this.thumbnailLayer.setVisible(true);
        this.uiLayer.setVisible(true);
        
        console.log('📦 容器已创建:', {
            backgroundLayer: !!this.backgroundLayer,
            thumbnailLayer: !!this.thumbnailLayer,
            uiLayer: !!this.uiLayer
        });
        
        // 设置相机边界
        this.cameras.main.setBounds(0, 0, 10000, 100);
        this.cameras.main.setBackgroundColor('#000000');
        
        console.log('📷 相机设置:', {
            bounds: this.cameras.main.getBounds(),
            backgroundColor: this.cameras.main.backgroundColor
        });
        
        // 初始化状态
        this.thumbnails = new Map(); // 存储缩略图对象
        this.videoElement = null;
        this.videoDuration = 0;
        this.performanceMonitor = null; // V2.0: 性能监控器
        this.advancedInteraction = null; // V3.0: 高级交互
        
        // 绘制背景
        this.drawBackground();
        
        console.log('✅ TimelineThumbnailScene ready');
    }
    
    /**
     * Phaser生命周期 - 更新
     */
    update(time, delta) {
        // V2.0: 更新性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.update();
        }
        
        // V3.0: 更新惯性滚动
        if (this.advancedInteraction) {
            this.advancedInteraction.updateInertia();
        }
    }
    
    /**
     * 绘制背景
     */
    drawBackground() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x1a1a1a, 1); // 深灰色背景
        graphics.fillRect(0, 0, 10000, 100);
        
        // 添加网格线
        graphics.lineStyle(1, 0x333333, 0.5);
        for (let x = 0; x < 10000; x += 80) {
            graphics.lineBetween(x, 0, x, 100);
        }
        
        this.backgroundLayer.add(graphics);
        console.log('✅ 背景已绘制');
    }
    
    /**
     * 加载视频
     * @param {HTMLVideoElement} videoElement
     */
    loadVideo(videoElement) {
        this.videoElement = videoElement;
        this.videoDuration = videoElement.duration;
        
        console.log('📺 视频已加载:', {
            duration: this.videoDuration,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
        });
    }
    
    /**
     * 添加缩略图
     * @param {number} timestamp - 时间戳
     * @param {string} textureKey - 纹理键名
     * @param {number} x - X坐标
     */
    addThumbnail(timestamp, textureKey, x) {
        // 创建Image对象（遵循Phaser标准）
        const image = this.add.image(x, 50, textureKey);
        image.setOrigin(0, 0.5);
        image.setDisplaySize(80, 60);
        
        // 添加到容器
        this.thumbnailLayer.add(image);
        
        // 存储引用
        this.thumbnails.set(timestamp, image);
        
        return image;
    }
    
    /**
     * 移除缩略图
     * @param {number} timestamp
     */
    removeThumbnail(timestamp) {
        const image = this.thumbnails.get(timestamp);
        if (image) {
            image.destroy();
            this.thumbnails.delete(timestamp);
        }
    }
    
    /**
     * 清空所有缩略图
     */
    clearThumbnails() {
        this.thumbnails.forEach(image => image.destroy());
        this.thumbnails.clear();
    }
    
    /**
     * 设置相机滚动位置
     * @param {number} x
     */
    setCameraScroll(x) {
        this.cameras.main.scrollX = x;
    }
    
    /**
     * 获取相机滚动位置
     */
    getCameraScroll() {
        return this.cameras.main.scrollX;
    }
    
    /**
     * 场景销毁
     */
    shutdown() {
        this.clearThumbnails();
        console.log('🛑 TimelineThumbnailScene shutdown');
    }
}
