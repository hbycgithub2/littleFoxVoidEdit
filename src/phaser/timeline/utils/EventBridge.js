// src/phaser/timeline/utils/EventBridge.js
// 事件桥接器 - Phaser和DOM之间的通信（遵循Phaser EventEmitter模式）

export default class EventBridge extends Phaser.Events.EventEmitter {
    constructor() {
        super();
        this.setupDOMListeners();
    }
    
    /**
     * 设置DOM事件监听
     */
    setupDOMListeners() {
        // 监听视频加载（修复：统一使用冒号格式）
        window.addEventListener('video:loaded', (e) => {
            console.log('🎬 EventBridge收到video:loaded事件', e.detail);
            this.emit('video-loaded', e.detail);
        });
        
        // 监听视频时间更新
        window.addEventListener('video:timeupdate', (e) => {
            this.emit('video-timeupdate', e.detail);
        });
        
        // 监听时间轴滚动
        window.addEventListener('timeline:scroll', (e) => {
            this.emit('timeline-scroll', e.detail);
        });
        
        console.log('✅ EventBridge DOM监听器已设置');
    }
    
    /**
     * 发送事件到DOM
     */
    sendToDOM(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
    
    /**
     * 通知缩略图准备就绪
     */
    notifyThumbnailReady(timestamp, texture) {
        this.sendToDOM('thumbnail:ready', { timestamp, texture });
        this.emit('thumbnail-ready', { timestamp, texture });
    }
    
    /**
     * 通知缩略图加载进度
     */
    notifyProgress(current, total) {
        this.sendToDOM('thumbnail:progress', { current, total });
        this.emit('thumbnail-progress', { current, total });
    }
    
    /**
     * 请求视频信息
     */
    requestVideoInfo() {
        return new Promise((resolve) => {
            const video = document.getElementById('video');
            if (video) {
                resolve({
                    element: video,
                    duration: video.duration,
                    currentTime: video.currentTime,
                    width: video.videoWidth,
                    height: video.videoHeight
                });
            } else {
                resolve(null);
            }
        });
    }
}
