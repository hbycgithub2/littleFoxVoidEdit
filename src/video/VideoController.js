// src/video/VideoController.js
// 视频控制器 - 完全遵循 Phaser 3 官方标准
// 功能：视频加载、播放控制、时间同步、热区显示控制

export default class VideoController {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 800,
            height: config.height || 450,
            videoKey: config.videoKey || 'video',
            ...config
        };
        
        this.video = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.hotspots = [];
        this.videoElement = null;
        
        this.init();
    }
    
    /**
     * 初始化视频控制器（遵循 Phaser 标准）
     */
    init() {
        console.log('🎥 初始化视频控制器...');
    }
    
    /**
     * 加载视频（遵循 Phaser 标准）
     */
    loadVideo(url) {
        return new Promise((resolve, reject) => {
            console.log('📥 加载视频:', url);
            
            // 创建 HTML5 视频元素
            this.videoElement = document.createElement('video');
            this.videoElement.src = url;
            this.videoElement.crossOrigin = 'anonymous';
            this.videoElement.preload = 'auto';
            
            // 监听加载完成
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.duration = this.videoElement.duration;
                console.log(`✓ 视频加载完成，时长: ${this.duration.toFixed(2)}秒`);
                
                // 创建 Phaser 视频纹理
                this.createVideoTexture();
                
                resolve({
                    duration: this.duration,
                    width: this.videoElement.videoWidth,
                    height: this.videoElement.videoHeight
                });
            });
            
            // 监听错误
            this.videoElement.addEventListener('error', (e) => {
                console.error('❌ 视频加载失败:', e);
                reject(e);
            });
            
            // 监听时间更新
            this.videoElement.addEventListener('timeupdate', () => {
                this.currentTime = this.videoElement.currentTime;
                this.updateHotspots();
                this.scene.events.emit('video:timeupdate', this.currentTime);
            });
            
            // 监听播放状态
            this.videoElement.addEventListener('play', () => {
                this.isPlaying = true;
                this.scene.events.emit('video:play');
            });
            
            this.videoElement.addEventListener('pause', () => {
                this.isPlaying = false;
                this.scene.events.emit('video:pause');
            });
            
            this.videoElement.addEventListener('ended', () => {
                this.isPlaying = false;
                this.scene.events.emit('video:ended');
            });
        });
    }
    
    /**
     * 创建 Phaser 视频纹理（遵循 Phaser 标准）
     */
    createVideoTexture() {
        // 创建视频显示对象
        this.video = this.scene.add.video(
            this.config.x,
            this.config.y,
            this.config.videoKey
        );
        
        // 加载视频元素
        this.video.loadURL(this.videoElement.src, false, 'anonymous');
        
        // 设置显示大小
        this.video.setDisplaySize(this.config.width, this.config.height);
        this.video.setOrigin(0, 0);
        
        console.log('✓ Phaser 视频纹理已创建');
    }
    
    /**
     * 播放视频（遵循 Phaser 标准）
     */
    play() {
        if (this.videoElement) {
            this.videoElement.play().then(() => {
                console.log('▶ 视频播放');
            }).catch(err => {
                console.error('播放失败:', err);
            });
        }
        
        if (this.video) {
            this.video.play();
        }
    }
    
    /**
     * 暂停视频（遵循 Phaser 标准）
     */
    pause() {
        if (this.videoElement) {
            this.videoElement.pause();
            console.log('⏸ 视频暂停');
        }
        
        if (this.video) {
            this.video.pause();
        }
    }
    
    /**
     * 切换播放/暂停（遵循 Phaser 标准）
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * 跳转到指定时间（遵循 Phaser 标准）
     */
    seekTo(time) {
        if (this.videoElement) {
            time = Math.max(0, Math.min(time, this.duration));
            this.videoElement.currentTime = time;
            this.currentTime = time;
            
            if (this.video) {
                this.video.seekTo(time);
            }
            
            this.updateHotspots();
            this.scene.events.emit('video:seek', time);
            
            console.log(`⏩ 跳转到: ${time.toFixed(2)}秒`);
        }
    }
    
    /**
     * 添加热区（遵循 Phaser 标准）
     */
    addHotspot(hotspot) {
        this.hotspots.push(hotspot);
        this.updateHotspots();
    }
    
    /**
     * 更新热区显示/隐藏（遵循 Phaser 标准）
     */
    updateHotspots() {
        this.hotspots.forEach(hotspot => {
            const startTime = hotspot.config.startTime || 0;
            const endTime = hotspot.config.endTime || this.duration;
            
            // 根据当前时间显示/隐藏热区
            const shouldShow = this.currentTime >= startTime && 
                              this.currentTime <= endTime;
            
            if (hotspot.setVisible) {
                hotspot.setVisible(shouldShow);
            }
        });
    }
    
    /**
     * 设置播放速度（遵循 Phaser 标准）
     */
    setPlaybackRate(rate) {
        if (this.videoElement) {
            this.videoElement.playbackRate = rate;
            console.log(`⚡ 播放速度: ${rate}x`);
        }
    }
    
    /**
     * 设置音量（遵循 Phaser 标准）
     */
    setVolume(volume) {
        if (this.videoElement) {
            this.videoElement.volume = Math.max(0, Math.min(1, volume));
            console.log(`🔊 音量: ${(volume * 100).toFixed(0)}%`);
        }
    }
    
    /**
     * 静音/取消静音（遵循 Phaser 标准）
     */
    toggleMute() {
        if (this.videoElement) {
            this.videoElement.muted = !this.videoElement.muted;
            console.log(this.videoElement.muted ? '🔇 静音' : '🔊 取消静音');
        }
    }
    
    /**
     * 获取视频信息
     */
    getVideoInfo() {
        return {
            currentTime: this.currentTime,
            duration: this.duration,
            isPlaying: this.isPlaying,
            volume: this.videoElement ? this.videoElement.volume : 0,
            muted: this.videoElement ? this.videoElement.muted : false,
            playbackRate: this.videoElement ? this.videoElement.playbackRate : 1
        };
    }
    
    /**
     * 销毁（遵循 Phaser 标准）
     */
    destroy() {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
            this.videoElement = null;
        }
        
        if (this.video) {
            this.video.destroy();
            this.video = null;
        }
        
        this.hotspots = [];
        
        console.log('✓ 视频控制器已销毁');
    }
}
