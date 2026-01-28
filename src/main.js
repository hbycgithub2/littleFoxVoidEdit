// src/main.js
// 应用入口 - 初始化 Phaser Game

import config from './phaser/config.js';
import VideoController from './dom/VideoController.js';
import UIController from './dom/UIController.js';
import PropertyPanelController from './dom/PropertyPanelController.js';
import HotspotListController from './dom/HotspotListController.js';
import LayerPanelController from './dom/LayerPanelController.js';
import StylePanelController from './dom/StylePanelController.js';
import TimelinePanel from './dom/TimelinePanel.js';
import TimelineResizer from './dom/TimelineResizer.js';
import DataManager from './data/DataManager.js';
import ToastManager from './dom/ToastManager.js';
import TooltipManager from './dom/TooltipManager.js';
import KeyboardManager from './utils/KeyboardManager.js';
import PerformanceTest from './utils/PerformanceTest.js';
import ViewMenu from './dom/ViewMenu.js';
import ThumbnailInitializer from './phaser/timeline/ThumbnailInitializer.js';

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    if (window.toast) {
        window.toast.error('发生错误：' + event.error.message);
    }
});

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的 Promise 错误:', event.reason);
    if (window.toast) {
        window.toast.error('Promise 错误：' + event.reason);
    }
});

try {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
} catch (error) {
    console.error('初始化失败:', error);
    alert('系统初始化失败：' + error.message);
}

function initApp() {
    try {
        // 创建 Phaser Game（遵循官方标准）
        const game = new Phaser.Game(config);
        
        
        // 初始化用户体验工具（优先级 4）
        const toast = new ToastManager();
        const tooltip = new TooltipManager();
        const keyboard = new KeyboardManager(game);
        
        // 延迟初始化 ViewMenu，确保 DOM 已加载
        setTimeout(() => {
            const viewMenu = new ViewMenu({ toast });
            window.viewMenu = viewMenu;
            console.log('✅ ViewMenu 已初始化');
            
            // 延迟获取场景并设置面板（确保场景已创建）
            setTimeout(() => {
                const scene = game.scene.getScene('EditorScene');
                console.log('🎯 尝试获取场景:', !!scene);
                
                if (scene) {
                    console.log('📦 场景面板:', {
                        drawingStatusBar: !!scene.drawingStatusBar,
                        drawingHistoryDisplay: !!scene.drawingHistoryDisplay,
                        shortcutHintDisplay: !!scene.shortcutHintDisplay,
                        dragResizeStatusIndicator: !!scene.dragResizeStatusIndicator,
                        historyVisualHelper: !!scene.historyVisualHelper
                    });
                    
                    viewMenu.setScenePanels(
                        scene.drawingStatusBar,
                        scene.drawingHistoryDisplay,
                        scene.shortcutHintDisplay,
                        scene.dragResizeStatusIndicator,
                        scene.historyVisualHelper
                    );
                } else {
                    console.error('❌ 场景未找到');
                }
            }, 500); // 等待场景完全创建
        }, 100);
        
        // 初始化 DOM 控制器（依赖注入 game 实例）
        const videoController = new VideoController(game);
        const uiController = new UIController(game, toast, keyboard);
        const propertyPanelController = new PropertyPanelController(game);
        const hotspotListController = new HotspotListController(game);
        const layerPanelController = new LayerPanelController(game);
        const timelinePanel = new TimelinePanel(game);
        const timelineResizer = new TimelineResizer(game);
        const stylePanelController = new StylePanelController(game, toast);
        const dataManager = new DataManager(game, toast);
        
        // 等待场景创建完成后通知控制器
        game.events.once('ready', () => {
            const scene = game.scene.getScene('EditorScene');
            if (scene) {
                uiController.setScene(scene);
                propertyPanelController.setScene(scene);
                hotspotListController.setScene(scene);
                
                // 初始化性能测试工具
                const perfTest = new PerformanceTest(scene);
                window.perfTest = perfTest;
                
                game.events.emit('scene-ready', scene);
                toast.success('编辑器已就绪');
                
                console.log('\n💡 性能测试命令:');
                console.log('  perfTest.createTestHotspots(50)  - 创建 50 个测试热区');
                console.log('  perfTest.startMonitoring(10)     - 开始监控 10 秒');
                console.log('  perfTest.cleanup()               - 清理测试热区');
                console.log('  perfTest.runFullTest()           - 运行完整测试\n');
            }
        });
        
        // 初始化工具提示
        setTimeout(() => {
            tooltip.attachAll();
        }, 100);
        
        // 导出供调试（开发环境）
        window.game = game;
        window.videoController = videoController;
        window.uiController = uiController;
        window.propertyPanelController = propertyPanelController;
        window.hotspotListController = hotspotListController;
        window.layerPanelController = layerPanelController;
        window.timelinePanel = timelinePanel;
        window.timelineResizer = timelineResizer;
        window.stylePanelController = stylePanelController;
        window.dataManager = dataManager;
        window.toast = toast;
        window.tooltip = tooltip;
        window.keyboard = keyboard;
        
        console.log('Little Fox Video Editor - 系统初始化完成');
        console.log('✅ Phaser Game 实例已创建');
        console.log('✅ VideoController 已初始化');
        console.log('✅ UIController 已初始化');
        console.log('✅ PropertyPanelController 已初始化');
        console.log('✅ HotspotListController 已初始化');
        console.log('✅ LayerPanelController 已初始化');
        console.log('✅ TimelinePanel 已初始化');
        console.log('✅ StylePanelController 已初始化');
        console.log('✅ DataManager 已初始化');
        console.log('✅ ToastManager 已初始化');
        console.log('✅ TooltipManager 已初始化');
        console.log('✅ KeyboardManager 已初始化');
        console.log('⏸️ ThumbnailInitializer 已初始化（默认禁用）');
        console.log('\n💡 时间轴缩略图命令:');
        console.log('  thumbnailInitializer.enable()              - 启用缩略图功能');
        console.log('  thumbnailInitializer.disable()             - 禁用缩略图功能');
        console.log('  thumbnailInitializer.getConfig()           - 查看配置');
        console.log('  thumbnailInitializer.analyzeArchitecture() - 运行架构分析');
        console.log('  thumbnailInitializer.loadVideo(video)      - 手动加载视频\n');
        
    } catch (error) {
        console.error('初始化失败:', error);
        alert('系统初始化失败：' + error.message);
    }
}
