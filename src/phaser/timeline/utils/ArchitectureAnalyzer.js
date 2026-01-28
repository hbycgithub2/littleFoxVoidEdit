// src/phaser/timeline/utils/ArchitectureAnalyzer.js
// 架构分析工具 - 分析现有Phaser和DOM架构（输出到console）

export default class ArchitectureAnalyzer {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * 分析Phaser架构
     */
    analyzePhaserArchitecture() {
        console.log('\n🔍 === Phaser架构分析 ===\n');
        
        const scene = this.game.scene.getScene('EditorScene');
        
        if (!scene) {
            console.error('❌ EditorScene未找到');
            return null;
        }
        
        const analysis = {
            sceneKey: scene.scene.key,
            managers: this.getManagers(scene),
            helpers: this.getHelpers(scene),
            gameSize: {
                width: this.game.config.width,
                height: this.game.config.height
            },
            renderer: this.game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas'
        };
        
        console.log('📦 场景信息:', {
            key: analysis.sceneKey,
            renderer: analysis.renderer,
            size: `${analysis.gameSize.width}x${analysis.gameSize.height}`
        });
        
        console.log('\n🎮 管理器列表:', analysis.managers);
        console.log('\n🛠️ 辅助工具列表:', analysis.helpers);
        
        return analysis;
    }
    
    /**
     * 分析DOM时间轴架构
     */
    analyzeDOMTimeline() {
        console.log('\n🔍 === DOM时间轴架构分析 ===\n');
        
        const timelineCanvas = document.getElementById('timelineCanvas');
        const video = document.getElementById('video');
        
        if (!timelineCanvas) {
            console.error('❌ 时间轴Canvas未找到');
            return null;
        }
        
        const analysis = {
            canvas: {
                element: timelineCanvas,
                width: timelineCanvas.width,
                height: timelineCanvas.height,
                context: timelineCanvas.getContext('2d') ? '2D' : null
            },
            video: {
                element: video,
                duration: video ? video.duration : 0,
                currentTime: video ? video.currentTime : 0
            },
            controllers: this.getTimelineControllers()
        };
        
        console.log('📺 时间轴Canvas:', {
            size: `${analysis.canvas.width}x${analysis.canvas.height}`,
            context: analysis.canvas.context
        });
        
        console.log('\n🎬 视频信息:', {
            duration: `${analysis.video.duration}s`,
            currentTime: `${analysis.video.currentTime}s`
        });
        
        console.log('\n🎛️ 时间轴控制器:', analysis.controllers);
        
        return analysis;
    }
    
    /**
     * 确定集成方案
     */
    determineIntegrationStrategy() {
        console.log('\n🔍 === 集成方案分析 ===\n');
        
        const strategy = {
            approach: 'hybrid',
            description: 'Phaser渲染缩略图 + DOM时间轴控制',
            integration: {
                phaserPart: '使用独立Scene渲染视频缩略图',
                domPart: '保留现有TimelinePanel控制逻辑',
                communication: '通过事件总线通信'
            },
            benefits: [
                '不影响现有时间轴功能',
                'Phaser负责高性能渲染',
                'DOM负责交互和控制',
                '可独立开关'
            ]
        };
        
        console.log('📋 集成策略:', strategy.approach);
        console.log('📝 说明:', strategy.description);
        console.log('\n🔗 集成方式:');
        console.log('  - Phaser部分:', strategy.integration.phaserPart);
        console.log('  - DOM部分:', strategy.integration.domPart);
        console.log('  - 通信方式:', strategy.integration.communication);
        console.log('\n✅ 优势:');
        strategy.benefits.forEach((benefit, i) => {
            console.log(`  ${i + 1}. ${benefit}`);
        });
        
        return strategy;
    }
    
    /**
     * 技术选型决策
     */
    makeTechnicalDecisions() {
        console.log('\n🔍 === 技术选型决策 ===\n');
        
        const decisions = {
            videoFrameExtraction: {
                primary: 'Canvas drawImage',
                fallback: 'VideoFrame API (如果支持)',
                reason: 'Canvas兼容性最好，VideoFrame性能更优'
            },
            textureManagement: {
                method: 'Phaser.Textures.addBase64',
                caching: 'LRU缓存策略',
                reason: '遵循Phaser官方纹理管理方式'
            },
            rendering: {
                container: 'Phaser.GameObjects.Container',
                objects: 'Phaser.GameObjects.Image',
                scrolling: 'Phaser.Cameras.Scene2D.Camera',
                reason: '使用Phaser标准GameObject和Camera'
            },
            communication: {
                method: 'CustomEvent + EventEmitter',
                events: ['video:loaded', 'video:timeupdate', 'thumbnail:ready'],
                reason: '解耦Phaser和DOM，双向通信'
            }
        };
        
        console.log('🎬 视频帧提取:');
        console.log('  - 主方案:', decisions.videoFrameExtraction.primary);
        console.log('  - 备选:', decisions.videoFrameExtraction.fallback);
        console.log('  - 理由:', decisions.videoFrameExtraction.reason);
        
        console.log('\n🖼️ 纹理管理:');
        console.log('  - 方法:', decisions.textureManagement.method);
        console.log('  - 缓存:', decisions.textureManagement.caching);
        console.log('  - 理由:', decisions.textureManagement.reason);
        
        console.log('\n🎨 渲染方式:');
        console.log('  - 容器:', decisions.rendering.container);
        console.log('  - 对象:', decisions.rendering.objects);
        console.log('  - 滚动:', decisions.rendering.scrolling);
        console.log('  - 理由:', decisions.rendering.reason);
        
        console.log('\n📡 通信机制:');
        console.log('  - 方法:', decisions.communication.method);
        console.log('  - 事件:', decisions.communication.events.join(', '));
        console.log('  - 理由:', decisions.communication.reason);
        
        return decisions;
    }
    
    /**
     * 运行完整分析
     */
    runFullAnalysis() {
        console.log('\n🚀 === 开始架构调研 ===\n');
        
        const results = {
            phaser: this.analyzePhaserArchitecture(),
            dom: this.analyzeDOMTimeline(),
            strategy: this.determineIntegrationStrategy(),
            decisions: this.makeTechnicalDecisions()
        };
        
        console.log('\n✅ === 架构调研完成 ===\n');
        console.log('💡 提示: 使用 architectureAnalyzer.getResults() 获取完整结果');
        
        this.results = results;
        return results;
    }
    
    /**
     * 获取分析结果
     */
    getResults() {
        return this.results || null;
    }
    
    // 辅助方法
    getManagers(scene) {
        const managers = [];
        const managerKeys = [
            'commandManager', 'selectionManager', 'layerManager', 
            'groupManager', 'styleManager', 'drawingManager',
            'polygonDrawingManager', 'inputManager', 'dragOptimizer',
            'alignmentManager', 'canvasPointerController'
        ];
        
        managerKeys.forEach(key => {
            if (scene[key]) managers.push(key);
        });
        
        return managers;
    }
    
    getHelpers(scene) {
        const helpers = [];
        const helperKeys = [
            'drawingModeIndicator', 'drawingHistoryDisplay', 
            'shortcutHintDisplay', 'drawingStatusBar',
            'boxSelectionHelper', 'selectionVisualHelper',
            'dragResizeHelper', 'historyVisualHelper'
        ];
        
        helperKeys.forEach(key => {
            if (scene[key]) helpers.push(key);
        });
        
        return helpers;
    }
    
    getTimelineControllers() {
        const controllers = [];
        if (window.timelinePanel) {
            const panel = window.timelinePanel;
            const controllerKeys = [
                'playheadController', 'timeScaleController',
                'tooltipController', 'selectionController',
                'dragController', 'thumbnailController'
            ];
            
            controllerKeys.forEach(key => {
                if (panel[key]) controllers.push(key);
            });
        }
        return controllers;
    }
}
