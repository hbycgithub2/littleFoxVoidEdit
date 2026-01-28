// src/phaser/timeline/ThumbnailInitializer.js
// 时间轴缩略图初始化器 - 遵循Phaser官方初始化模式

import ThumbnailConfig from './ThumbnailConfig.js';
import EnvironmentChecker from '../utils/EnvironmentChecker.js';
import ArchitectureAnalyzer from './utils/ArchitectureAnalyzer.js';
import EventBridge from './utils/EventBridge.js';
import TimelineThumbnailScene from './scenes/TimelineThumbnailScene.js';
import ThumbnailRenderer from './gameobjects/ThumbnailRenderer.js';
import ThumbnailScroller from './gameobjects/ThumbnailScroller.js';
import ThumbnailPerformanceMonitor from './utils/ThumbnailPerformanceMonitor.js';
import WorkerManager from './utils/WorkerManager.js';
import SmartSampler from './utils/SmartSampler.js';
import ProgressiveLoader from './utils/ProgressiveLoader.js';
import AdvancedInteraction from './gameobjects/AdvancedInteraction.js';

export default class ThumbnailInitializer {
    constructor(game) {
        this.game = game;
        this.config = ThumbnailConfig;
        this.initialized = false;
        
        // 创建架构分析器和事件桥接器
        this.analyzer = new ArchitectureAnalyzer(game);
        this.eventBridge = new EventBridge();
        
        // V1.0组件
        this.thumbnailScene = null;
        this.renderer = null;
        this.scroller = null;
        
        // V2.0组件
        this.performanceMonitor = null;
        this.version = 'v1.0'; // 当前版本
        
        // V3.0组件
        this.workerManager = null;
        this.smartSampler = null;
        this.progressiveLoader = null;
        this.advancedInteraction = null;
    }
    
    /**
     * 初始化时间轴缩略图功能
     * @returns {boolean} 是否成功初始化
     */
    init() {
        console.log('🎬 时间轴缩略图初始化器启动...');
        
        // 检查功能开关
        if (!this.config.enabled) {
            console.log('⏸️ 时间轴缩略图功能已禁用');
            return false;
        }
        
        // 环境检查
        const envCheck = EnvironmentChecker.check();
        if (!envCheck.phaser.valid) {
            console.error('❌ 环境检查失败:', envCheck.phaser.message);
            if (this.config.fallbackToDom) {
                console.log('🔄 降级到DOM实现');
                return false;
            }
        }
        
        console.log('✅ 环境检查通过');
        console.log('📦 配置信息:', {
            version: this.config.version,
            thumbnailSize: `${this.config.thumbnailWidth}x${this.config.thumbnailHeight}`,
            samplingInterval: `${this.config.samplingInterval}s`,
            debug: this.config.debug
        });
        
        this.initialized = true;
        return true;
    }
    
    /**
     * 获取配置
     */
    getConfig() {
        return this.config;
    }
    
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        console.log('🔧 配置已更新:', newConfig);
    }
    
    /**
     * 启用功能
     */
    enable(version = 'v3.0') {
        this.config.enabled = true;
        console.log('✅ 时间轴缩略图功能已启用');
        const result = this.init();
        
        if (result) {
            if (version === 'v3.0') {
                this.startV3();
            } else if (version === 'v2.0') {
                this.startV2();
            } else {
                this.startV1();
            }
        }
        
        return result;
    }
    
    /**
     * 启动V1.0 MVP
     */
    startV1() {
        console.log('🚀 启动V1.0 MVP...');
        this.version = 'v1.0';
        
        // 添加场景到游戏
        if (!this.game.scene.getScene('TimelineThumbnailScene')) {
            this.game.scene.add('TimelineThumbnailScene', TimelineThumbnailScene, false);
            console.log('✅ Scene已添加到游戏');
        }
        
        // 启动场景
        this.game.scene.start('TimelineThumbnailScene');
        console.log('✅ Scene已启动');
        
        // 等待场景创建完成
        setTimeout(() => {
            const scene = this.game.scene.getScene('TimelineThumbnailScene');
            if (scene) {
                console.log('✅ Scene获取成功');
                
                // 创建渲染器和滚动控制器
                this.renderer = new ThumbnailRenderer(scene, this.config);
                this.scroller = new ThumbnailScroller(scene, this.renderer);
                
                console.log('✅ Renderer和Scroller已创建');
                
                // 监听视频加载事件
                this.eventBridge.on('video-loaded', (data) => {
                    console.log('🎬 收到video-loaded事件');
                    this.onVideoLoaded(data);
                });
                
                console.log('✅ V1.0 MVP已启动');
            } else {
                console.error('❌ Scene获取失败');
            }
        }, 100);
    }
    
    /**
     * 启动V2.0性能优化版
     */
    startV2() {
        console.log('🚀 启动V2.0性能优化版...');
        this.version = 'v2.0';
        
        // 先启动V1.0
        this.startV1();
        
        // 等待V1.0启动完成后添加V2.0组件
        setTimeout(() => {
            const scene = this.game.scene.getScene('TimelineThumbnailScene');
            if (scene) {
                // 创建性能监控器
                this.performanceMonitor = new ThumbnailPerformanceMonitor(scene);
                this.performanceMonitor.start();
                
                console.log('✅ V2.0性能优化已启动');
                console.log('💡 V2.0特性:');
                console.log('  - LRU缓存管理');
                console.log('  - 对象池复用');
                console.log('  - 虚拟滚动');
                console.log('  - 性能监控');
            }
        }, 200);
    }
    
    /**
     * 启动V3.0高级特性版
     */
    startV3() {
        console.log('🚀 启动V3.0高级特性版...');
        this.version = 'v3.0';
        
        // 先启动V2.0
        this.startV2();
        
        // 等待V2.0启动完成后添加V3.0组件
        setTimeout(() => {
            const scene = this.game.scene.getScene('TimelineThumbnailScene');
            if (scene) {
                // 创建V3.0组件
                this.workerManager = new WorkerManager(this.config);
                this.workerManager.init();
                
                this.smartSampler = new SmartSampler(this.config);
                this.progressiveLoader = new ProgressiveLoader(this.config);
                this.advancedInteraction = new AdvancedInteraction(scene, this.scroller);
                
                // 监听高级交互事件
                scene.events.on('seek-to-time', (time) => {
                    this.eventBridge.sendToDOM('timeline:seek', { time });
                });
                
                console.log('✅ V3.0高级特性已启动');
                console.log('💡 V3.0特性:');
                console.log('  - Web Worker异步处理');
                console.log('  - 智能关键帧采样');
                console.log('  - 渐进式加载');
                console.log('  - 高级交互（缩放、惯性、定位）');
            }
        }, 400);
    }
    
    /**
     * 视频加载回调
     */
    async onVideoLoaded(data) {
        console.log('🎬 onVideoLoaded被调用', data);
        
        const video = data.element || document.getElementById('video');
        if (!video) {
            console.error('❌ 视频元素未找到');
            return;
        }
        
        console.log('📺 视频元素找到:', {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
        });
        
        const scene = this.game.scene.getScene('TimelineThumbnailScene');
        if (!scene) {
            console.error('❌ TimelineThumbnailScene未找到');
            return;
        }
        
        console.log('✅ Scene找到');
        
        // 加载视频到场景
        scene.loadVideo(video);
        
        // 检查渲染器
        if (!this.renderer) {
            console.error('❌ Renderer未初始化');
            return;
        }
        
        // 初始化渲染器
        this.renderer.init(video);
        console.log('✅ Renderer已初始化');
        
        // 生成缩略图
        console.log('🎬 开始生成缩略图...');
        await this.renderer.generateThumbnails(video.duration, (current, total) => {
            console.log(`📊 生成进度: ${current}/${total}`);
            this.eventBridge.notifyProgress(current, total);
        });
        
        console.log('✅ 缩略图生成完成');
    }
    
    /**
     * 禁用功能
     */
    disable() {
        this.config.enabled = false;
        this.initialized = false;
        console.log('⏸️ 时间轴缩略图功能已禁用');
    }
    
    /**
     * 运行架构分析
     */
    analyzeArchitecture() {
        console.log('🔍 开始架构分析...');
        return this.analyzer.runFullAnalysis();
    }
    
    /**
     * 获取事件桥接器
     */
    getEventBridge() {
        return this.eventBridge;
    }
    
    /**
     * 手动加载视频（用于测试）
     */
    async loadVideo(videoElement) {
        await this.onVideoLoaded({ element: videoElement });
    }
    
    /**
     * 获取场景
     */
    getScene() {
        return this.game.scene.getScene('TimelineThumbnailScene');
    }
    
    /**
     * 获取性能统计
     */
    getPerformanceStats() {
        const stats = {
            version: this.version,
            renderer: this.renderer ? this.renderer.getStats() : null,
            performance: this.performanceMonitor ? this.performanceMonitor.getStats() : null
        };
        
        console.log('📊 性能统计:', stats);
        return stats;
    }
    
    /**
     * 检查性能
     */
    checkPerformance() {
        if (this.performanceMonitor) {
            return this.performanceMonitor.checkPerformance();
        }
        return null;
    }
}
