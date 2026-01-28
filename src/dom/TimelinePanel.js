// src/dom/TimelinePanel.js
// 时间轴面板 - 显示热区的时间范围（使用 Canvas 绘制）

import PlayheadController from './timeline/PlayheadController.js';
import TimeScaleController from './timeline/TimeScaleController.js';
import TimelineTooltipController from './timeline/TimelineTooltipController.js';
import LayerGroupController from './timeline/LayerGroupController.js';
import TimelineSelectionController from './timeline/TimelineSelectionController.js';
import TimelineDragController from './timeline/TimelineDragController.js';
import TimelineContextMenu from './timeline/TimelineContextMenu.js';
import TimelineKeyboardController from './timeline/TimelineKeyboardController.js';
import TimelineSnapController from './timeline/TimelineSnapController.js';
import TimelineMarkerController from './timeline/TimelineMarkerController.js';
import TimelineVirtualScrollController from './timeline/TimelineVirtualScrollController.js';
import TimelineThumbnailController from './timeline/TimelineThumbnailController.js';
import TimelineRangeController from './timeline/TimelineRangeController.js';
import TimelineDataController from './timeline/TimelineDataController.js';
import TimelineWaveformController from './timeline/TimelineWaveformController.js';
import TimelineMenuHandler from './timeline/TimelineMenuHandler.js';
import TimelineFramePreviewController from './timeline/TimelineFramePreviewController.js';
import TimelineHighlightController from './timeline/TimelineHighlightController.js';
import TimelineDirectCreateController from './timeline/TimelineDirectCreateController.js';
import TimelineRangeCopyController from './timeline/TimelineRangeCopyController.js';
import TimelineFineAdjustController from './timeline/TimelineFineAdjustController.js';
import TimelineThumbnailManager from './timeline/TimelineThumbnailManager.js';
import TimelineHorizontalScrollController from './timeline/TimelineHorizontalScrollController.js';

export default class TimelinePanel {
    constructor(game) {
        this.game = game;
        this.scene = null;
        this.canvas = null;
        this.ctx = null;
        this.videoDuration = 0;
        this.currentTime = 0;
        this.scale = 10; // 每秒的像素数
        
        // 等待场景准备好
        this.game.events.once('ready', () => {
            this.scene = this.game.scene.getScene('EditorScene');
            this.init();
        });
    }
    
    init() {
        // 初始化播放头控制器
        this.playheadController = new PlayheadController(this);
        
        // 初始化时间刻度控制器
        this.timeScaleController = new TimeScaleController(this);
        
        // 初始化工具提示控制器
        this.tooltipController = new TimelineTooltipController(this);
        
        // 初始化图层分组控制器
        this.layerGroupController = new LayerGroupController(this);
        
        // 初始化选择控制器
        this.selectionController = new TimelineSelectionController(this);
        
        // 初始化拖拽控制器
        this.dragController = new TimelineDragController(this);
        
        // 初始化右键菜单
        this.contextMenu = new TimelineContextMenu(this);
        
        // 初始化键盘控制器
        this.keyboardController = new TimelineKeyboardController(this);
        
        // 初始化吸附控制器
        this.snapController = new TimelineSnapController(this);
        
        // 初始化标记控制器
        this.markerController = new TimelineMarkerController(this);
        
        // 初始化虚拟滚动控制器
        this.virtualScrollController = new TimelineVirtualScrollController(this);
        
        // 初始化缩略图控制器
        this.thumbnailController = new TimelineThumbnailController(this);
        
        // 初始化时间区域控制器
        this.rangeController = new TimelineRangeController(this);
        
        // 初始化数据控制器
        this.dataController = new TimelineDataController(this);
        
        // 初始化波形控制器
        this.waveformController = new TimelineWaveformController(this);
        
        // 初始化菜单处理器
        this.menuHandler = new TimelineMenuHandler(this);
        
        // 初始化视频帧预览控制器
        this.framePreviewController = new TimelineFramePreviewController(this);
        
        // 初始化时间条高亮控制器
        this.highlightController = new TimelineHighlightController(this);
        
        // 初始化时间轴直接创建控制器
        this.directCreateController = new TimelineDirectCreateController(this);
        
        // 初始化时间范围复制粘贴控制器
        this.rangeCopyController = new TimelineRangeCopyController(this);
        
        // 初始化时间微调控制器
        this.fineAdjustController = new TimelineFineAdjustController(this);
        
        // 初始化缩略图管理器
        this.thumbnailManager = new TimelineThumbnailManager(this);
        
        // 初始化水平滚动控制器
        this.horizontalScrollController = new TimelineHorizontalScrollController(this);
        
        this.setupCanvas();
        this.setupEvents();
        this.render();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('timelineCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // 设置 canvas 尺寸
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.render();
    }
    
    setupEvents() {
        // 监听视频时间更新
        this.game.events.on('video:timeupdate', (time) => {
            // 如果正在拖拽播放头，忽略视频的 timeupdate 事件
            const isDragging = this.playheadController && this.playheadController.isDraggingPlayhead();
            if (isDragging) {
                return;
            }
            this.currentTime = time;
            this.render();
        });
        
        // 监听视频加载
        this.game.events.on('video:loaded', (duration) => {
            this.videoDuration = duration;
            this.render();
        });
        
        // 监听video:loaded事件生成缩略图
        window.addEventListener('video:loaded', (event) => {
            const videoElement = event.detail?.element;
            if (videoElement && videoElement.duration) {
                console.log('🎬 TimelinePanel: 开始生成缩略图...');
                this.thumbnailManager.loadVideo(videoElement);
            }
        });
        
        // 检查视频是否已加载（处理监听器设置前视频已加载的情况）
        setTimeout(() => {
            const video = document.querySelector('video');
            if (video && video.duration && video.readyState >= 2) {
                console.log('🎬 TimelinePanel: 视频已加载，立即生成缩略图...');
                this.thumbnailManager.loadVideo(video);
            }
        }, 1000);
        
        // 监听热区变化
        this.scene.events.on('hotspot:added', () => this.render());
        this.scene.events.on('hotspot:removed', () => this.render());
        this.scene.events.on('hotspot:updated', (data) => {
            // 热区更新时清除对应的缩略图缓存
            if (this.thumbnailController && data.hotspotId) {
                this.thumbnailController.clearCache(data.hotspotId);
            }
            this.render();
        });
        this.scene.registry.events.on('changedata', (_, key) => {
            if (key === 'hotspots') {
                this.render();
            }
        });
        
        // Canvas 交互
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        
        // 键盘快捷键
        this.setupKeyboardShortcuts();
    }
    
    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        this.keydownHandler = (e) => {
            // S 键：切换磁性吸附
            if (e.key === 's' || e.key === 'S') {
                // 检查是否在输入框中
                const activeElement = document.activeElement;
                const isInputFocused = activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.isContentEditable
                );
                
                if (!isInputFocused && this.snapController) {
                    e.preventDefault();
                    this.snapController.toggle();
                    this.render();
                }
            }
            
            // Escape 键：取消直接创建或清空选择或清除区域
            if (e.key === 'Escape') {
                e.preventDefault();
                
                // 优先取消直接创建
                if (this.directCreateController && this.directCreateController.isDragging) {
                    this.directCreateController.cancel();
                    return;
                }
                
                // 然后清除区域或选择
                if (this.rangeController.getRange()) {
                    this.rangeController.clearRange();
                } else {
                    this.selectionController.clearSelection();
                }
            }
            
            // Delete 键：删除选中的热区
            if (e.key === 'Delete' && this.selectionController.getSelectionCount() > 0) {
                e.preventDefault();
                this.selectionController.deleteSelected();
            }
            
            // Ctrl+A：全选
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
            }
            
            // Alt+拖拽：选择时间区域（在 onMouseDown 中处理）
            // L 键：切换循环播放区域
            if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                this.rangeController.toggleLoop();
            }
            
            // 新增：Space 键 - 播放选中热区片段
            if (e.key === ' ' && !e.ctrlKey && !e.shiftKey) {
                const selected = this.selectionController.getSelectedIds();
                if (selected.length === 1) {
                    e.preventDefault();
                    const hotspots = this.scene.registry.get('hotspots') || [];
                    const hotspot = hotspots.find(h => h.id === Array.from(selected)[0]);
                    if (hotspot) {
                        this.rangeController.setRange(hotspot.startTime, hotspot.endTime);
                        this.rangeController.startLoop();
                    }
                }
            }
            
            // 新增：Enter 键 - 跳转到选中热区开始
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                const selected = this.selectionController.getSelectedIds();
                if (selected.length === 1) {
                    e.preventDefault();
                    const hotspots = this.scene.registry.get('hotspots') || [];
                    const hotspot = hotspots.find(h => h.id === Array.from(selected)[0]);
                    if (hotspot) {
                        this.game.events.emit('video:seek', hotspot.startTime);
                        this.flashHotspot(hotspot);
                    }
                }
            }
        };
        
        window.addEventListener('keydown', this.keydownHandler);
    }
    
    /**
     * 全选所有热区
     */
    selectAll() {
        const hotspots = this.scene.registry.get('hotspots') || [];
        hotspots.forEach(config => {
            this.selectionController.selectedIds.add(config.id);
        });
        this.selectionController.emitSelectionChanged();
        this.render();
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        const { width, height } = this.canvas;
        
        // 更新虚拟滚动可见区域
        this.virtualScrollController.updateVisibleArea();
        
        // 清空画布
        this.ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, width, height);
        
        // 应用水平滚动
        this.horizontalScrollController.applyScroll(this.ctx);
        
        // 绘制时间刻度
        this.drawTimeScale();
        
        // 绘制缩略图
        if (this.thumbnailManager) {
            this.thumbnailManager.draw(this.ctx);
        }
        
        // 绘制波形
        if (this.waveformController) {
            this.waveformController.drawWaveform(this.ctx);
        }
        
        // 应用垂直滚动
        this.virtualScrollController.applyScroll(this.ctx);
        
        // 绘制热区
        this.drawHotspotBars();
        
        // 恢复垂直滚动
        this.virtualScrollController.restoreScroll(this.ctx);
        
        // 恢复水平滚动
        this.horizontalScrollController.restoreScroll(this.ctx);
        
        // 绘制当前时间指示器
        this.drawCurrentTimeIndicator();
        
        // 绘制选中高亮
        if (this.selectionController) {
            this.virtualScrollController.applyScroll(this.ctx);
            this.selectionController.drawSelectionHighlight(this.ctx);
            this.virtualScrollController.restoreScroll(this.ctx);
        }
        
        // 绘制高亮闪烁
        if (this.highlightController) {
            this.virtualScrollController.applyScroll(this.ctx);
            this.highlightController.drawHighlight(this.ctx);
            this.virtualScrollController.restoreScroll(this.ctx);
        }
        
        // 绘制框选框
        if (this.selectionController) {
            this.selectionController.drawBoxSelection(this.ctx);
        }
        
        // 绘制入点/出点标记
        if (this.keyboardController) {
            this.keyboardController.drawInOutPoints(this.ctx);
        }
        
        // 绘制标记
        if (this.markerController) {
            this.markerController.drawMarkers(this.ctx);
        }
        
        // 绘制吸附线
        if (this.snapController) {
            this.snapController.drawSnapLine(this.ctx);
        }
        
        // 绘制滚动条
        if (this.virtualScrollController) {
            this.virtualScrollController.drawScrollbar(this.ctx);
        }
        
        // 绘制时间区域选择
        if (this.rangeController) {
            this.rangeController.drawRange(this.ctx);
        }
        
        // 绘制点击视觉反馈
        if (this.timeScaleController) {
            this.timeScaleController.drawClickFeedback(this.ctx);
        }
        
        // 绘制直接创建预览
        if (this.directCreateController) {
            this.directCreateController.drawPreview(this.ctx);
        }
    }
    
    drawTimeScale() {
        const { width } = this.canvas;
        const scaleHeight = 30;
        
        // 背景
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, width, scaleHeight);
        
        // 刻度线和文字
        this.ctx.strokeStyle = '#666';
        this.ctx.fillStyle = '#aaa';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        const maxTime = this.videoDuration || 60;
        const step = this.scale < 5 ? 10 : (this.scale < 20 ? 5 : 1);
        
        for (let t = 0; t <= maxTime; t += step) {
            const x = t * this.scale;
            
            if (x > width) break;
            
            // 刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(x, scaleHeight - 10);
            this.ctx.lineTo(x, scaleHeight);
            this.ctx.stroke();
            
            // 时间文字
            this.ctx.fillText(`${t}s`, x, scaleHeight - 15);
        }
    }
    
    drawHotspotBars() {
        if (!this.scene) return;
        
        // 使用图层分组控制器绘制
        this.layerGroupController.drawLayerGroups(this.ctx);
    }
    
    drawCurrentTimeIndicator() {
        const x = this.currentTime * this.scale - this.horizontalScrollController.scrollX;
        const canvasHeight = this.canvas.height;
        const canvasWidth = this.canvas.width;
        
        // 只在可见区域内绘制
        if (x < 0 || x > canvasWidth) return;
        
        // 红色竖线
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, canvasHeight);
        this.ctx.stroke();
        
        // 顶部三角形
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x - 5, 10);
        this.ctx.lineTo(x + 5, 10);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 中键或Shift+左键：水平滚动
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            this.horizontalScrollController.startDrag(e.clientX);
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // 优先检测Alt+拖拽创建
        if (this.directCreateController.handleMouseDown(x, y, e.altKey)) {
            return;
        }
        
        // 检测滚动条点击
        if (this.virtualScrollController.hitTestScrollbar(x, y)) {
            this.virtualScrollController.startDragScrollbar(y);
            return;
        }
        
        // 优先检测播放头点击（优先级最高）
        const playheadHit = this.playheadController.hitTest(x, y);
        
        if (playheadHit) {
            this.playheadController.startDrag();
            this.canvas.style.cursor = 'ew-resize';
            return;
        }
        
        // 检测时间区域手柄点击
        const rangeTarget = this.rangeController.hitTest(x, y);
        if (rangeTarget === 'start' || rangeTarget === 'end') {
            this.rangeController.startDragHandle(rangeTarget, x);
            this.canvas.style.cursor = 'ew-resize';
            return;
        }
        
        // 检测标记点击
        const marker = this.markerController.hitTest(x, y);
        if (marker) {
            if (e.button === 0) {
                // 左键：开始拖拽标记
                this.markerController.startDragMarker(marker);
                this.canvas.style.cursor = 'ew-resize';
            } else if (e.button === 2) {
                // 右键：显示标记菜单（在 onContextMenu 中处理）
            }
            return;
        }
        
        // 检测图层标题点击（折叠/展开）
        const layerId = this.layerGroupController.hitTestLayerHeader(x, y + this.virtualScrollController.scrollY);
        if (layerId !== null) {
            this.layerGroupController.toggleLayerCollapse(layerId);
            return;
        }
        
        // 检查是否点击了热区时间条或手柄
        const target = this.dragController.hitTest(x, y + this.virtualScrollController.scrollY);
        
        if (target) {
            // 选择热区（支持 Ctrl+点击多选）
            this.selectionController.selectHotspot(target.hotspot.id, e.ctrlKey || e.metaKey);
            
            // 开始拖拽
            this.dragController.startDrag(target, x);
            
            // 根据拖拽类型设置光标
            if (target.handle === 'body') {
                this.canvas.style.cursor = 'move';
            } else {
                this.canvas.style.cursor = 'ew-resize';
            }
            return;
        }
        
        // 检测时间刻度点击（使用控制器处理）
        if (this.timeScaleController.hitTest(x, y)) {
            this.timeScaleController.handleClick(x);
            return;
        }
        
        // Alt+拖拽：开始选择时间区域
        if (e.altKey) {
            this.rangeController.startDragRange(x);
            return;
        }
        
        // 如果点击空白区域，开始框选（非 Ctrl 点击时清空选择）
        if (!e.ctrlKey && !e.metaKey) {
            this.selectionController.clearSelection();
        }
        this.selectionController.startBoxSelection(x, y);
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 处理水平滚动拖拽
        if (this.horizontalScrollController.drag(e.clientX)) {
            return;
        }
        
        // 处理直接创建拖拽
        if (this.directCreateController.handleMouseMove(x, y)) {
            return;
        }
        
        // 处理滚动条拖拽
        if (this.virtualScrollController.isDraggingScrollbar) {
            this.virtualScrollController.dragScrollbar(y);
            return;
        }
        
        // 优先处理播放头拖拽
        const isDraggingPlayhead = this.playheadController.isDraggingPlayhead();
        if (isDraggingPlayhead) {
            this.playheadController.drag(x);
            // 拖拽时隐藏工具提示
            this.tooltipController.hide();
            return;
        }
        
        // 处理时间区域拖拽
        if (this.rangeController.isDraggingRange()) {
            if (this.rangeController.dragHandle === 'body') {
                this.rangeController.dragRange(x);
            } else {
                this.rangeController.dragHandle(x);
            }
            this.tooltipController.hide();
            return;
        }
        
        // 处理标记拖拽
        if (this.markerController.isDragging()) {
            this.markerController.dragMarker(x);
            this.tooltipController.hide();
            return;
        }
        
        // 处理热区时间条拖拽
        if (this.dragController.isDraggingBar()) {
            this.dragController.drag(x);
            // 拖拽时隐藏工具提示
            this.tooltipController.hide();
            return;
        }
        
        // 处理框选
        if (this.selectionController.isBoxSelecting) {
            this.selectionController.updateBoxSelection(x, y);
            return;
        }
        
        // 更新工具提示（非拖拽状态）
        this.tooltipController.handleMouseMove(x, y + this.virtualScrollController.scrollY, e.clientX, e.clientY);
        
        // 更新视频帧预览（在时间刻度区域悬停时）
        if (this.timeScaleController.hitTest(x, y)) {
            const time = x / this.scale;
            if (time >= 0 && time <= this.videoDuration) {
                this.framePreviewController.show(time, e.clientX, e.clientY);
            }
        } else {
            this.framePreviewController.hide();
        }
        
        // 更新鼠标样式（优先级：滚动条 > 播放头 > 区域 > 标记 > 热区手柄 > 时间刻度 > 默认）
        const scrollbarCursor = this.virtualScrollController.getCursor(x, y);
        if (scrollbarCursor) {
            this.canvas.style.cursor = scrollbarCursor;
            return;
        }
        
        const playheadCursor = this.playheadController.getCursor(x, y);
        if (playheadCursor) {
            this.canvas.style.cursor = playheadCursor;
            return;
        }
        
        const rangeCursor = this.rangeController.getCursor(x, y);
        if (rangeCursor) {
            this.canvas.style.cursor = rangeCursor;
            return;
        }
        
        const markerCursor = this.markerController.getCursor(x, y);
        if (markerCursor) {
            this.canvas.style.cursor = markerCursor;
            return;
        }
        
        const dragCursor = this.dragController.getCursor(x, y + this.virtualScrollController.scrollY);
        if (dragCursor) {
            this.canvas.style.cursor = dragCursor;
            return;
        }
        
        const timeScaleCursor = this.timeScaleController.getCursor(x, y);
        if (timeScaleCursor) {
            this.canvas.style.cursor = timeScaleCursor;
            return;
        }
        
        this.canvas.style.cursor = 'default';
    }
    
    onMouseUp() {
        // 结束水平滚动拖拽
        this.horizontalScrollController.endDrag();
        
        // 处理直接创建完成
        if (this.directCreateController.handleMouseUp()) {
            return;
        }
        
        // 结束滚动条拖拽
        this.virtualScrollController.endDragScrollbar();
        
        // 结束播放头拖拽
        this.playheadController.endDrag();
        
        // 结束时间区域拖拽
        this.rangeController.endDragRange();
        
        // 结束标记拖拽
        this.markerController.endDragMarker();
        
        // 结束框选
        this.selectionController.endBoxSelection();
        
        // 结束热区时间条拖拽
        this.dragController.endDrag();
        
        this.canvas.style.cursor = 'default';
    }
    
    /**
     * 鼠标离开 Canvas（隐藏工具提示，取消框选）
     */
    onMouseLeave() {
        this.tooltipController.hide();
        this.selectionController.cancelBoxSelection();
        this.framePreviewController.hide();
    }
    
    /**
     * 双击事件处理（遵循 Phaser 标准）
     */
    onDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 考虑虚拟滚动偏移
        const scrollY = this.virtualScrollController ? this.virtualScrollController.scrollY : 0;
        
        // 检测是否双击了热区条
        const hotspot = this.layerGroupController.getHotspotAtPosition(x, y + scrollY);
        
        if (hotspot) {
            // 跳转到热区开始时间
            this.game.events.emit('video:seek', hotspot.startTime);
            
            // 发送 Phaser 事件
            this.scene.events.emit('timeline:hotspot:doubleClick', {
                hotspotId: hotspot.id,
                startTime: hotspot.startTime,
                endTime: hotspot.endTime
            });
            
            // 视觉反馈：闪烁效果
            this.flashHotspot(hotspot);
        }
    }
    
    /**
     * 热区闪烁效果（视觉反馈 - 优化版）
     * @param {object} hotspot - 热区配置
     */
    flashHotspot(hotspot) {
        // 临时存储闪烁状态
        if (!this.flashingHotspots) {
            this.flashingHotspots = new Set();
        }
        
        this.flashingHotspots.add(hotspot.id);
        
        // 使用动画帧实现脉冲效果（更流畅）
        let flashCount = 0;
        const maxFlashes = 3;
        const flashInterval = 100;
        
        const flashTimer = setInterval(() => {
            flashCount++;
            this.render();
            
            if (flashCount >= maxFlashes * 2) {
                clearInterval(flashTimer);
                this.flashingHotspots.delete(hotspot.id);
                this.render();
            }
        }, flashInterval);
    }
    
    /**
     * 右键菜单
     */
    onContextMenu(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检测是否点击了时间区域
        const rangeTarget = this.rangeController.hitTest(x, y);
        if (rangeTarget) {
            // 显示时间区域菜单
            this.menuHandler.showRangeMenu(e.clientX, e.clientY);
            return;
        }
        
        // 检测是否点击了热区
        const target = this.dragController.hitTest(x, y);
        
        if (target) {
            // 右键点击热区：显示热区菜单
            this.contextMenu.show(e.clientX, e.clientY, target.hotspot);
        } else {
            // 右键点击空白：显示空白菜单（带导出/导入选项）
            this.menuHandler.showBlankMenu(e.clientX, e.clientY);
        }
    }
    
    onWheel(e) {
        // 优先处理水平滚动（Shift+滚轮）
        if (this.horizontalScrollController.handleWheel(e)) {
            return;
        }
        
        // 处理垂直滚动
        if (this.virtualScrollController.handleWheel(e)) {
            return;
        }
        
        e.preventDefault();
        
        // 缩放时间轴
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(1, Math.min(50, this.scale * delta));
        
        this.render();
    }
    
    /**
     * 清理资源（遵循 Phaser 标准）
     */
    destroy() {
        // 清理控制器
        if (this.playheadController) {
            this.playheadController.destroy();
            this.playheadController = null;
        }
        
        if (this.timeScaleController) {
            this.timeScaleController.destroy();
            this.timeScaleController = null;
        }
        
        if (this.tooltipController) {
            this.tooltipController.destroy();
            this.tooltipController = null;
        }
        
        if (this.layerGroupController) {
            this.layerGroupController = null;
        }
        
        if (this.selectionController) {
            this.selectionController.destroy();
            this.selectionController = null;
        }
        
        if (this.dragController) {
            this.dragController.destroy();
            this.dragController = null;
        }
        
        if (this.contextMenu) {
            this.contextMenu.destroy();
            this.contextMenu = null;
        }
        
        if (this.keyboardController) {
            this.keyboardController.destroy();
            this.keyboardController = null;
        }
        
        if (this.snapController) {
            this.snapController.destroy();
            this.snapController = null;
        }
        
        if (this.markerController) {
            this.markerController.destroy();
            this.markerController = null;
        }
        
        if (this.virtualScrollController) {
            this.virtualScrollController.destroy();
            this.virtualScrollController = null;
        }
        
        if (this.thumbnailController) {
            this.thumbnailController.destroy();
            this.thumbnailController = null;
        }
        
        if (this.rangeController) {
            this.rangeController.destroy();
            this.rangeController = null;
        }
        
        if (this.dataController) {
            this.dataController.destroy();
            this.dataController = null;
        }
        
        if (this.waveformController) {
            this.waveformController.destroy();
            this.waveformController = null;
        }
        
        if (this.menuHandler) {
            this.menuHandler.destroy();
            this.menuHandler = null;
        }
        
        if (this.framePreviewController) {
            this.framePreviewController.destroy();
            this.framePreviewController = null;
        }
        
        if (this.highlightController) {
            this.highlightController.destroy();
            this.highlightController = null;
        }
        
        if (this.directCreateController) {
            this.directCreateController.destroy();
            this.directCreateController = null;
        }
        
        if (this.rangeCopyController) {
            this.rangeCopyController.destroy();
            this.rangeCopyController = null;
        }
        
        if (this.fineAdjustController) {
            this.fineAdjustController.destroy();
            this.fineAdjustController = null;
        }
        
        if (this.thumbnailManager) {
            this.thumbnailManager = null;
        }
        
        // 移除事件监听
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
            this.canvas.removeEventListener('mousemove', this.onMouseMove);
            this.canvas.removeEventListener('mouseup', this.onMouseUp);
            this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
            this.canvas.removeEventListener('wheel', this.onWheel);
            this.canvas.removeEventListener('contextmenu', this.onContextMenu);
            this.canvas.removeEventListener('dblclick', this.onDoubleClick);
        }
        
        // 移除键盘事件监听
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        
        console.log('TimelinePanel destroyed');
    }
}
