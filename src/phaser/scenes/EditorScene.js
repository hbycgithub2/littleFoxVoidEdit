// src/phaser/scenes/EditorScene.js
// 主场景 - 完全遵循 Phaser 3 官方标准（重构版 + 性能优化）

import CommandManager, { DeleteHotspotCommand, MoveHotspotCommand, ResizeHotspotCommand, PasteHotspotsCommand } from '../../core/CommandManager.js';
import SelectionManager from '../../core/SelectionManager.js';
import LayerManager from '../../core/LayerManager.js';
import GroupManager from '../../core/GroupManager.js';
import StyleManager from '../../core/StyleManager.js';
import hotspotRegistry from '../../core/HotspotRegistry.js';
import DrawingManager from '../managers/DrawingManager.js';
import PolygonDrawingManager from '../managers/PolygonDrawingManager.js';
import InputManager from '../managers/InputManager.js';
import DragOptimizer from '../managers/DragOptimizer.js';
import AlignmentManager from '../managers/AlignmentManager.js';
import CanvasPointerController from '../managers/CanvasPointerController.js';
import PerformanceMonitor from '../../utils/PerformanceMonitor.js';
import RenderOptimizer from '../../utils/RenderOptimizer.js';
import MemoryOptimizer from '../../utils/MemoryOptimizer.js';
import EventOptimizer from '../../utils/EventOptimizer.js';
import LoadingManager from '../../utils/LoadingManager.js';

export default class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
    }
    
    create() {
        console.log('EditorScene created');
        
        // 初始化核心工具
        this.commandManager = new CommandManager(this);
        this.selectionManager = new SelectionManager(this);
        this.layerManager = new LayerManager(this);
        this.groupManager = new GroupManager(this);
        this.styleManager = new StyleManager(this);
        this.alignmentManager = new AlignmentManager(this);
        
        // 初始化管理器（遵循 Phaser 官方标准）
        this.drawingManager = new DrawingManager(this);
        this.polygonDrawingManager = new PolygonDrawingManager(this);
        this.inputManager = new InputManager(this);
        this.dragOptimizer = new DragOptimizer(this);
        this.canvasPointerController = new CanvasPointerController(this);
        
        // 初始化性能优化工具（优先级 3）
        this.performanceMonitor = new PerformanceMonitor(this);
        this.renderOptimizer = new RenderOptimizer(this);
        this.memoryOptimizer = new MemoryOptimizer(this);
        this.eventOptimizer = new EventOptimizer();
        this.loadingManager = new LoadingManager(this);
        // this.performanceMonitor.enable(); // 开发时启用
        
        // 初始化容器（遵循 Phaser 官方标准）
        this.hotspotContainer = this.add.container(0, 0);
        this.hotspotContainer.setDepth(1000); // 确保在最上层
        this.hotspots = [];
        
        console.log('🎯 HotspotContainer创建:', {
            depth: this.hotspotContainer.depth,
            visible: this.hotspotContainer.visible,
            active: this.hotspotContainer.active
        });
        
        // 初始化剪贴板
        this.clipboard = [];
        
        // 性能优化：缓存上一次的视频时间
        this.lastVideoTime = -1;
        
        // 初始化 registry（遵循 Phaser 官方标准）
        this.registry.set('hotspots', []);
        this.registry.set('selectedIds', []);
        this.registry.set('drawMode', null);
        this.registry.set('videoTime', 0);
        
        // 设置事件监听
        this.setupEvents();
        
        // 通知系统场景已准备好
        this.game.events.emit('ready');
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听热区点击
        this.events.on('hotspot:clicked', (hotspot, multiSelect) => {
            this.selectionManager.select(hotspot, multiSelect);
        });
        
        // 监听热区移动（用于撤销/重做）
        this.events.on('hotspot:moved', (data) => {
            const command = new MoveHotspotCommand(
                this,
                data.hotspot.config.id,
                data.oldPos,
                data.newPos
            );
            // 注意：这里不执行 execute，因为已经移动了
            this.commandManager.history.push(command);
            this.commandManager.redoStack = [];
        });
        
        // 监听热区缩放（用于撤销/重做）
        this.events.on('hotspot:resized', (data) => {
            const command = new ResizeHotspotCommand(
                this,
                data.hotspot.config.id,
                data.oldSize,
                data.newSize,
                data.oldPos,
                data.newPos
            );
            // 注意：这里不执行 execute，因为已经缩放了
            this.commandManager.history.push(command);
            this.commandManager.redoStack = [];
            
            // 同步到 registry
            this.syncToRegistry();
        });
        
        // 监听全局事件（跨场景通信）
        this.game.events.on('hotspot:delete', () => {
            this.deleteSelected();
        });
        
        this.game.events.on('history:undo', () => {
            this.commandManager.undo();
        });
        
        this.game.events.on('history:redo', () => {
            this.commandManager.redo();
        });
        
        this.game.events.on('hotspot:copy', () => {
            this.copySelected();
        });
        
        this.game.events.on('hotspot:paste', () => {
            this.pasteHotspots();
        });
        
        // 监听视频时间更新
        this.game.events.on('video:timeupdate', (time) => {
            this.registry.set('videoTime', time);
        });
    }
    

    
    /**
     * 添加热区
     */
    addHotspot(config) {
        console.log('➕ 添加热区:', config);
        
        // 使用注册表创建热区
        const hotspot = hotspotRegistry.create(this, config);
        
        // 优化拖拽性能（优先级 3）
        this.dragOptimizer.optimizeDrag(hotspot);
        
        // 跟踪对象用于内存管理（优先级 3）
        this.memoryOptimizer.track(hotspot, (obj) => {
            // 清理缩放手柄
            if (obj.resizeHandles) {
                obj.resizeHandles.forEach(handle => handle.destroy());
            }
        });
        
        // ✅ 关键修复：先添加到场景显示列表
        this.add.existing(hotspot);
        
        // 然后添加到容器（用于管理）
        this.hotspotContainer.add(hotspot);
        this.hotspots.push(hotspot);
        
        console.log('📦 热区已添加到容器:', {
            containerChildren: this.hotspotContainer.length,
            hotspotDepth: hotspot.depth,
            hotspotVisible: hotspot.visible,
            hotspotActive: hotspot.active,
            hotspotX: hotspot.x,
            hotspotY: hotspot.y
        });
        
        // 添加到图层（优先级 3.1）
        // 优先添加到当前选中的图层，否则添加到默认图层
        const currentLayerId = this.registry.get('currentLayerId');
        const targetLayer = currentLayerId 
            ? this.layerManager.getLayer(currentLayerId)
            : this.layerManager.getLayers()[0];
        
        if (targetLayer) {
            this.layerManager.addHotspotToLayer(hotspot, targetLayer.id);
        }
        
        // 立即检查并设置可见性（确保新创建的热区能立即显示）
        const videoTime = this.registry.get('videoTime') || 0;
        const shouldShow = hotspot.shouldShow(videoTime);
        
        console.log('👁️ 热区可见性检查:', {
            hotspotId: config.id,
            videoTime: videoTime,
            startTime: config.startTime,
            endTime: config.endTime,
            shouldShow: shouldShow,
            hotspotVisible: hotspot.visible
        });
        
        hotspot.setVisible(shouldShow);
        hotspot.setActive(shouldShow);
        
        // 强制设置深度，确保在最上层
        hotspot.setDepth(1000);
        
        console.log('✅ 热区已添加，visible:', hotspot.visible, 'active:', hotspot.active, 'depth:', hotspot.depth);
        
        // 更新 registry
        this.syncToRegistry();
        
        // 发送事件
        this.events.emit('hotspot:added', hotspot);
    }
    
    /**
     * 删除热区
     */
    removeHotspot(hotspotId) {
        const index = this.hotspots.findIndex(h => h.config.id === hotspotId);
        if (index === -1) return;
        
        const hotspot = this.hotspots[index];
        
        // 从选择中移除
        this.selectionManager.deselect(hotspot);
        
        // 从图层中移除（优先级 3.1）
        if (hotspot.layerId) {
            this.layerManager.removeHotspotFromLayer(hotspot, hotspot.layerId);
        }
        
        // 使用内存优化器清理（优先级 3）
        this.memoryOptimizer.cleanup(hotspot);
        this.hotspots.splice(index, 1);
        
        // 更新 registry
        this.syncToRegistry();
        
        // 发送事件
        this.events.emit('hotspot:removed', hotspotId);
    }
    
    /**
     * 移动热区
     */
    moveHotspot(hotspotId, x, y) {
        const hotspot = this.hotspots.find(h => h.config.id === hotspotId);
        if (!hotspot) return;
        
        hotspot.x = x;
        hotspot.y = y;
        hotspot.config.x = x;
        hotspot.config.y = y;
        
        // 更新手柄位置
        if (hotspot.updateHandlePositions) {
            hotspot.updateHandlePositions();
        }
        
        this.syncToRegistry();
    }
    
    /**
     * 缩放热区
     */
    resizeHotspot(hotspotId, size, pos) {
        const hotspot = this.hotspots.find(h => h.config.id === hotspotId);
        if (!hotspot) return;
        
        // 更新尺寸
        Object.assign(hotspot.config, size);
        
        // 更新位置（如果提供）
        if (pos) {
            hotspot.x = pos.x;
            hotspot.y = pos.y;
            hotspot.config.x = pos.x;
            hotspot.config.y = pos.y;
        }
        
        // 更新视觉
        hotspot.updateVisual();
        
        // 更新手柄位置
        if (hotspot.updateHandlePositions) {
            hotspot.updateHandlePositions();
        }
        
        // 更新交互区域
        const hitArea = hotspot.getHitArea();
        hotspot.setInteractive(hitArea.shape, hitArea.callback);
        
        this.syncToRegistry();
    }
    
    /**
     * 删除选中的热区
     */
    deleteSelected() {
        const selected = this.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            const command = new DeleteHotspotCommand(this, hotspot.config.id);
            this.commandManager.execute(command);
        });
    }
    
    /**
     * 复制选中的热区（遵循 Phaser 官方标准）
     */
    copySelected() {
        const selected = this.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        // 深拷贝配置到剪贴板
        this.clipboard = selected.map(hotspot => ({ ...hotspot.config }));
        
        console.log(`已复制 ${this.clipboard.length} 个热区`);
    }
    

    
    /**
     * 粘贴热区（遵循 Phaser 官方标准）
     */
    pasteHotspots() {
        if (this.clipboard.length === 0) return;
        
        // 创建新的配置（偏移位置避免重叠）
        const offset = 20;
        const newConfigs = this.clipboard.map(config => ({
            ...config,
            id: Date.now() + Math.random(),  // 新 ID
            x: config.x + offset,
            y: config.y + offset
        }));
        
        // 使用命令模式（支持撤销/重做）
        const command = new PasteHotspotsCommand(this, newConfigs);
        this.commandManager.execute(command);
        
        // 选中新粘贴的热区
        this.selectionManager.clearSelection();
        newConfigs.forEach(config => {
            const hotspot = this.hotspots.find(h => h.config.id === config.id);
            if (hotspot) {
                this.selectionManager.select(hotspot, true);
            }
        });
        
        console.log(`已粘贴 ${newConfigs.length} 个热区`);
    }
    
    /**
     * 同步数据到 registry
     */
    syncToRegistry() {
        const hotspots = this.hotspots.map(h => ({ ...h.config }));
        this.registry.set('hotspots', hotspots);
    }
    
    /**
     * 每帧更新（遵循 Phaser 官方标准）
     * 性能优化：只在视频时间变化时更新，使用批量更新
     */
    update(time, delta) {
        const videoTime = this.registry.get('videoTime');
        
        // 性能优化：只在时间变化时更新（避免每帧都检查）
        if (this.lastVideoTime === videoTime) {
            // 更新性能监控
            if (this.performanceMonitor) {
                this.performanceMonitor.update();
            }
            return;
        }
        this.lastVideoTime = videoTime;
        
        // 性能优化：批量更新所有热区的显示状态
        let visibilityChanged = false;
        
        this.hotspots.forEach(hotspot => {
            const shouldShow = hotspot.shouldShow(videoTime);
            
            // 性能优化：只在状态变化时更新
            if (hotspot.visible !== shouldShow) {
                hotspot.setVisible(shouldShow);
                hotspot.setActive(shouldShow);
                visibilityChanged = true;
            }
        });
        
        // 如果有可见性变化，标记需要重绘
        if (visibilityChanged && this.renderOptimizer) {
            this.hotspots.forEach(hotspot => {
                if (hotspot.visible) {
                    this.renderOptimizer.markDirty(hotspot);
                }
            });
        }
        
        // 更新性能监控
        if (this.performanceMonitor) {
            this.performanceMonitor.update();
        }
    }
    
    /**
     * 场景销毁时清理资源（遵循 Phaser 官方标准）
     */
    shutdown() {
        // 清理所有优化器
        if (this.memoryOptimizer) {
            this.memoryOptimizer.destroy();
        }
        
        if (this.renderOptimizer) {
            this.renderOptimizer.destroy();
        }
        
        if (this.eventOptimizer) {
            this.eventOptimizer.clear();
        }
        
        if (this.performanceMonitor) {
            this.performanceMonitor.disable();
        }
        
        // 清理管理器
        if (this.drawingManager) {
            this.drawingManager.destroy();
        }
        
        if (this.polygonDrawingManager) {
            this.polygonDrawingManager.destroy();
        }
        
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        
        if (this.canvasPointerController) {
            this.canvasPointerController.destroy();
        }
        
        console.log('EditorScene shutdown - 资源已清理');
    }
}
