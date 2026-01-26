// src/dom/VideoController.js
// 视频控制器 - 管理 HTML5 Video 元素

export default class VideoController {
    constructor(game) {
        this.game = game;
        this.video = document.getElementById('video');
        
        if (!this.video) {
            console.warn('Video element not found');
            return;
        }
        
        this.setupEvents();
    }
    
    setupEvents() {
        // 视频开始加载
        this.video.addEventListener('loadstart', () => {
            const scene = this.game.scene.getScene('EditorScene');
            if (scene && scene.loadingManager) {
                scene.loadingManager.show('正在加载视频...', false);
            }
        });
        
        // 视频加载完成
        this.video.addEventListener('loadedmetadata', () => {
            const scene = this.game.scene.getScene('EditorScene');
            if (scene && scene.loadingManager) {
                scene.loadingManager.show('正在加载视频...', false);
            }
        });
        
        // 视频加载完成
        this.video.addEventListener('loadedmetadata', () => {
            try {
                const w = this.video.videoWidth;
                const h = this.video.videoHeight;
                
                console.log(`📹 Video loaded: ${w}x${h}`);
                
                // 调整 Phaser Canvas 尺寸（遵循 Phaser 官方标准）
                this.game.scale.resize(w, h);
                
                // 强制刷新Canvas尺寸
                setTimeout(() => {
                    this.game.scale.resize(w, h);
                    console.log('🎨 Canvas尺寸已调整:', {
                        width: this.game.canvas.width,
                        height: this.game.canvas.height
                    });
                }, 100);
                
                // 调整容器尺寸
                const container = document.getElementById('phaserContainer');
                if (container) {
                    container.style.width = w + 'px';
                    container.style.height = h + 'px';
                    
                    console.log('🎨 Canvas容器尺寸:', {
                        width: container.style.width,
                        height: container.style.height,
                        zIndex: window.getComputedStyle(container).zIndex
                    });
                }
                
                // 检查Video的z-index
                console.log('📹 Video z-index:', window.getComputedStyle(this.video).zIndex);
                
                // 发送全局事件
                this.game.events.emit('video:loaded', this.video.duration);
                
                // 隐藏加载动画
                const scene = this.game.scene.getScene('EditorScene');
                if (scene && scene.loadingManager) {
                    scene.loadingManager.hide();
                }
            } catch (error) {
                console.error('视频加载处理失败:', error);
            }
        });
        
        // 视频加载错误
        this.video.addEventListener('error', (e) => {
            console.error('视频加载错误:', e);
            
            // 隐藏加载动画
            const scene = this.game.scene.getScene('EditorScene');
            if (scene && scene.loadingManager) {
                scene.loadingManager.hide();
            }
            
            alert('视频加载失败，请检查视频文件路径');
        });
        
        // 视频时间更新
        this.video.addEventListener('timeupdate', () => {
            this.game.events.emit('video:timeupdate', this.video.currentTime);
        });
        
        // 视频跳转完成（拖动进度条后）
        this.video.addEventListener('seeked', () => {
            this.game.events.emit('video:timeupdate', this.video.currentTime);
        });
        
        // 监听全局事件
        this.game.events.on('video:play', () => this.play());
        this.game.events.on('video:pause', () => this.pause());
        this.game.events.on('video:seek', (time) => this.seek(time));
    }
    
    play() {
        if (this.video) {
            this.video.play().catch(err => {
                console.warn('Video play failed:', err);
            });
        }
    }
    
    pause() {
        if (this.video) {
            this.video.pause();
        }
    }
    
    seek(time) {
        if (this.video) {
            this.video.currentTime = time;
        }
    }
    
    getCurrentTime() {
        return this.video ? this.video.currentTime : 0;
    }
    
    getDuration() {
        return this.video ? this.video.duration : 0;
    }
}
