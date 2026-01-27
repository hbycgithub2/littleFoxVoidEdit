// src/phaser/managers/DrawingManager.js
// 绘制管理器 - 处理基础形状绘制（遵循 Phaser 3 官方标准）

import { AddHotspotCommand } from '../../core/CommandManager.js';
import GridSnapHelper from '../../utils/GridSnapHelper.js';
import DrawingGuideHelper from '../../utils/DrawingGuideHelper.js';
import DrawingPrecisionHelper from '../../utils/DrawingPrecisionHelper.js';
import SmartSnapHelper from '../../utils/SmartSnapHelper.js';
import AlignmentGuideHelper from '../../utils/AlignmentGuideHelper.js';
import DrawingAnimationHelper from '../../utils/DrawingAnimationHelper.js';
import DrawingTemplateManager from '../../utils/DrawingTemplateManager.js';
import DrawingEnhancementManager from '../../utils/DrawingEnhancementManager.js';
import DrawingSoundManager from '../../utils/DrawingSoundManager.js';
import DrawingTimePresetHelper from '../../utils/DrawingTimePresetHelper.js';

export default class DrawingManager {
    constructor(scene) {
        this.scene = scene;
        
        // 绘制状态
        this.isDrawing = false;
        this.drawStartPos = null;
        this.drawMode = null;
        
        // 绘制历史（最近使用的形状）
        this.lastDrawMode = null;
        
        // 绘制预览图形（遵循 Phaser 官方标准）
        this.drawingGraphics = scene.add.graphics();
        this.drawingGraphics.setDepth(1001); // 在热区上方
        
        // 辅助工具（遵循 Phaser 官方标准）
        this.gridSnapHelper = new GridSnapHelper(scene, 10);
        this.guideHelper = new DrawingGuideHelper(scene);
        this.precisionHelper = new DrawingPrecisionHelper(scene);
        this.precisionHelper.enable(); // 默认启用精度显示
        this.smartSnapHelper = new SmartSnapHelper(scene);
        this.alignmentGuideHelper = new AlignmentGuideHelper(scene);
        this.alignmentGuideHelper.enable(); // 默认启用对齐辅助线
        this.animationHelper = new DrawingAnimationHelper(scene);
        this.templateManager = new DrawingTemplateManager(scene);
        this.enhancementManager = new DrawingEnhancementManager(scene);
        this.soundManager = new DrawingSoundManager(scene);
        this.timePresetHelper = new DrawingTimePresetHelper(scene);
        
        // 尺寸文本（遵循 Phaser 官方标准）
        this.sizeText = scene.add.text(0, 0, '', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.sizeText.setDepth(1002);
        this.sizeText.setVisible(false);
        
        // 坐标文本（遵循 Phaser 官方标准）
        this.coordText = scene.add.text(0, 0, '', {
            fontSize: '12px',
            color: '#00ffff',
            backgroundColor: '#000000',
            padding: { x: 6, y: 3 }
        });
        this.coordText.setDepth(1002);
        this.coordText.setVisible(false);
    }
    
    /**
     * 开始绘制
     * @param {number} x - 起始 X 坐标
     * @param {number} y - 起始 Y 坐标
     * @param {string} mode - 绘制模式 (circle|rect|ellipse)
     */
    startDrawing(x, y, mode) {
        // 应用网格吸附
        const snapped = this.gridSnapHelper.snap(x, y);
        
        this.isDrawing = true;
        this.drawStartPos = snapped;
        this.drawMode = mode;
        
        // 启用辅助线
        this.guideHelper.enable();
        
        // 显示当前预设时长（如果不是默认值）
        const preset = this.timePresetHelper.getPreset();
        if (preset !== 5) {
            this.timePresetHelper.showPreset();
        }
        
        console.log(`🎨 开始绘制 ${mode}，起点: (${snapped.x.toFixed(0)}, ${snapped.y.toFixed(0)})，时长: ${preset}秒`);
    }
    
    /**
     * 更新绘制预览（遵循 Phaser 官方标准）
     * @param {number} x - 当前 X 坐标
     * @param {number} y - 当前 Y 坐标
     * @param {boolean} shiftKey - 是否按住 Shift 键（约束比例）
     * @param {boolean} altKey - 是否按住 Alt 键（约束角度）
     */
    updatePreview(x, y, shiftKey = false, altKey = false) {
        if (!this.isDrawing) return;
        
        // 应用网格吸附
        let snapped = this.gridSnapHelper.snap(x, y);
        x = snapped.x;
        y = snapped.y;
        
        // 应用智能吸附（吸附到其他热区）
        if (this.smartSnapHelper.enabled) {
            const smartSnap = this.smartSnapHelper.snap(x, y);
            if (smartSnap.snapped) {
                x = smartSnap.x;
                y = smartSnap.y;
            }
        }
        
        // 更新对齐辅助线
        this.alignmentGuideHelper.update(x, y);
        
        const startX = this.drawStartPos.x;
        const startY = this.drawStartPos.y;
        let width = x - startX;
        let height = y - startY;
        
        // Alt 键约束角度（遵循 Phaser 官方标准）
        if (altKey && (this.drawMode === 'rect' || this.drawMode === 'ellipse')) {
            const angle = Math.atan2(height, width) * 180 / Math.PI;
            const distance = Math.sqrt(width * width + height * height);
            
            // 约束到最近的 45° 角度
            const constrainedAngle = Math.round(angle / 45) * 45;
            const radians = constrainedAngle * Math.PI / 180;
            
            width = Math.cos(radians) * distance;
            height = Math.sin(radians) * distance;
            x = startX + width;
            y = startY + height;
        }
        
        // Shift 键约束比例（遵循 Phaser 官方标准）
        if (shiftKey) {
            if (this.drawMode === 'rect') {
                // 矩形：约束为正方形
                const size = Math.max(Math.abs(width), Math.abs(height));
                width = width >= 0 ? size : -size;
                height = height >= 0 ? size : -size;
                x = startX + width;
                y = startY + height;
            } else if (this.drawMode === 'ellipse') {
                // 椭圆：约束为圆形
                const size = Math.max(Math.abs(width), Math.abs(height));
                width = width >= 0 ? size : -size;
                height = height >= 0 ? size : -size;
                x = startX + width;
                y = startY + height;
            }
        }
        
        this.drawingGraphics.clear();
        
        // 使用半透明填充 + 边框，更好的视觉效果
        this.drawingGraphics.lineStyle(3, 0x00ff00, 1);
        this.drawingGraphics.fillStyle(0x00ff00, 0.1);
        
        // 更新辅助线
        this.guideHelper.update(startX, startY, x, y, this.drawMode);
        
        // 更新尺寸文本
        this.updateSizeText(startX, startY, x, y, shiftKey, altKey);
        
        // 更新坐标文本（遵循 Phaser 官方标准）
        this.updateCoordText(x, y);
        
        // 更新精度信息（遵循 Phaser 官方标准）
        this.precisionHelper.update(startX, startY, x, y, this.drawMode);
        
        switch (this.drawMode) {
            case 'circle':
                const radius = Math.sqrt(width * width + height * height);
                this.drawingGraphics.strokeCircle(startX, startY, radius);
                this.drawingGraphics.fillCircle(startX, startY, radius);
                break;
                
            case 'rect':
                this.drawingGraphics.strokeRect(startX, startY, width, height);
                this.drawingGraphics.fillRect(startX, startY, width, height);
                break;
                
            case 'ellipse':
                const centerX = startX + width / 2;
                const centerY = startY + height / 2;
                const radiusX = Math.abs(width / 2);
                const radiusY = Math.abs(height / 2);
                this.drawingGraphics.strokeEllipse(centerX, centerY, radiusX, radiusY);
                this.drawingGraphics.fillEllipse(centerX, centerY, radiusX, radiusY);
                break;
        }
        
        // 保存当前坐标（用于 finishDrawing）
        this.currentX = x;
        this.currentY = y;
    }
    
    /**
     * 更新尺寸文本（遵循 Phaser 官方标准）
     * @private
     */
    updateSizeText(startX, startY, currentX, currentY, shiftKey = false, altKey = false) {
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        let text = '';
        let subText = '';
        
        // 获取当前预设时长
        const duration = this.timePresetHelper.getPreset();
        
        switch (this.drawMode) {
            case 'circle':
                const radius = Math.sqrt(width * width + height * height);
                text = `半径: ${radius.toFixed(0)}px`;
                // 显示角度和时长
                const angle = Math.atan2(currentY - startY, currentX - startX) * 180 / Math.PI;
                subText = `角度: ${angle.toFixed(0)}° | 时长: ${duration}秒`;
                break;
            case 'rect':
                text = `${width.toFixed(0)} × ${height.toFixed(0)}px`;
                if (shiftKey) text += ' (正方形)';
                if (altKey) text += ' (角度约束)';
                // 显示宽高比和时长
                const ratio = width > 0 && height > 0 ? (width / height).toFixed(2) : '0';
                subText = `比例: ${ratio}:1 | 时长: ${duration}秒`;
                break;
            case 'ellipse':
                text = `${width.toFixed(0)} × ${height.toFixed(0)}px`;
                if (shiftKey) text += ' (圆形)';
                if (altKey) text += ' (角度约束)';
                // 显示宽高比和时长
                const ellipseRatio = width > 0 && height > 0 ? (width / height).toFixed(2) : '0';
                subText = `比例: ${ellipseRatio}:1 | 时长: ${duration}秒`;
                break;
        }
        
        if (text) {
            const centerX = (startX + currentX) / 2;
            const centerY = (startY + currentY) / 2;
            
            const fullText = subText ? `${text}\n${subText}` : text;
            this.sizeText.setText(fullText);
            this.sizeText.setPosition(centerX - this.sizeText.width / 2, centerY - 30);
            this.sizeText.setVisible(true);
        }
    }
    
    /**
     * 更新坐标文本（遵循 Phaser 官方标准）
     * @private
     */
    updateCoordText(x, y) {
        const text = `X: ${x.toFixed(0)}, Y: ${y.toFixed(0)}`;
        this.coordText.setText(text);
        this.coordText.setPosition(x + 10, y + 10);
        this.coordText.setVisible(true);
    }
    
    /**
     * 完成绘制
     * @param {number} x - 结束 X 坐标
     * @param {number} y - 结束 Y 坐标
     * @returns {boolean} 是否成功创建热区
     */
    finishDrawing(x, y) {
        if (!this.isDrawing) return false;
        
        this.isDrawing = false;
        this.drawingGraphics.clear();
        
        // 使用 updatePreview 中保存的坐标（已应用 Shift 约束）
        if (this.currentX !== undefined && this.currentY !== undefined) {
            x = this.currentX;
            y = this.currentY;
        }
        
        const startX = this.drawStartPos.x;
        const startY = this.drawStartPos.y;
        const width = x - startX;
        const height = y - startY;
        
        // 最小尺寸检查
        const minSize = 10;
        if (Math.abs(width) < minSize || Math.abs(height) < minSize) {
            console.warn(`⚠️ 热区太小 (${Math.abs(width).toFixed(0)} x ${Math.abs(height).toFixed(0)})，最小尺寸: ${minSize}px`);
            return false;
        }
        
        // 创建热区配置（使用 let 以便后续修改）
        let config = this.createHotspotConfig(startX, startY, width, height);
        
        console.log(`✅ 完成绘制 ${this.drawMode}:`, {
            size: this.drawMode === 'circle' ? `半径 ${config.radius.toFixed(0)}` : `${config.width || config.radiusX * 2}x${config.height || config.radiusY * 2}`,
            position: `(${config.x.toFixed(0)}, ${config.y.toFixed(0)})`
        });
        
        // 播放完成动画（遵循 Phaser 官方标准）
        this.animationHelper.playCompleteAnimation(config.x, config.y, this.drawMode);
        
        // 应用模板（如果有）
        if (this.templateManager.getCurrentTemplate()) {
            config = this.templateManager.applyTemplate(config);
            this.templateManager.clearTemplate();
        }
        
        // 应用增强功能（镜像、旋转等）
        config = this.enhancementManager.applyEnhancements(config);
        
        // 播放音效
        this.soundManager.playCompleteSound();
        
        // 使用命令模式添加热区（遵循 Phaser 官方标准）
        const command = new AddHotspotCommand(this.scene, config);
        this.scene.commandManager.execute(command);
        
        // 保存最后使用的绘制模式
        this.lastDrawMode = this.drawMode;
        
        // 清除绘制模式
        this.scene.registry.set('drawMode', null);
        
        // 清除辅助线和文本
        this.guideHelper.clear();
        this.sizeText.setVisible(false);
        this.coordText.setVisible(false);
        this.precisionHelper.hide();
        this.smartSnapHelper.disable();
        this.alignmentGuideHelper.clear();
        
        return true;
    }
    
    /**
     * 创建热区配置
     * @private
     */
    createHotspotConfig(startX, startY, width, height) {
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        // 使用预设时长（如果有）
        const duration = this.timePresetHelper.getPreset();
        
        const config = {
            id: Date.now(),
            shape: this.drawMode,
            color: '#00ff00',
            strokeWidth: 3,
            word: '',
            startTime: videoTime,
            endTime: videoTime + duration  // 使用预设时长
        };
        
        console.log('🎨 创建热区配置:', {
            shape: config.shape,
            startTime: config.startTime,
            endTime: config.endTime,
            duration: duration,
            currentVideoTime: videoTime
        });
        
        // 根据形状添加特定属性
        switch (this.drawMode) {
            case 'circle':
                config.x = startX;
                config.y = startY;
                config.radius = Math.sqrt(width * width + height * height);
                break;
                
            case 'rect':
                // 矩形以中心点为原点
                config.width = Math.abs(width);
                config.height = Math.abs(height);
                config.x = startX + width / 2;
                config.y = startY + height / 2;
                break;
                
            case 'ellipse':
                config.radiusX = Math.abs(width / 2);
                config.radiusY = Math.abs(height / 2);
                config.x = startX + width / 2;
                config.y = startY + height / 2;
                break;
        }
        
        return config;
    }
    
    /**
     * 取消绘制
     */
    cancelDrawing() {
        if (this.isDrawing) {
            console.log('❌ 取消绘制');
            
            // 播放取消动画（遵循 Phaser 官方标准）
            if (this.drawStartPos) {
                this.animationHelper.playCancelAnimation(this.drawStartPos.x, this.drawStartPos.y);
            }
            
            // 播放音效
            this.soundManager.playCancelSound();
            
            this.isDrawing = false;
            this.drawingGraphics.clear();
            this.guideHelper.clear();
            this.sizeText.setVisible(false);
            this.coordText.setVisible(false);
            this.precisionHelper.hide();
            this.smartSnapHelper.disable();
            this.alignmentGuideHelper.clear();
        }
    }
    
    /**
     * 切换网格吸附（遵循 Phaser 官方标准）
     * @param {boolean} enabled - 是否启用
     */
    toggleGridSnap(enabled) {
        if (enabled) {
            this.gridSnapHelper.enable();
            console.log('✅ 网格吸附已启用');
        } else {
            this.gridSnapHelper.disable();
            console.log('❌ 网格吸附已禁用');
        }
    }
    
    /**
     * 重复上次绘制（遵循 Phaser 官方标准）
     * 快捷键：Space（当没有绘制模式时）
     */
    repeatLastDraw() {
        if (this.lastDrawMode) {
            this.scene.registry.set('drawMode', this.lastDrawMode);
            console.log(`🔄 重复上次绘制: ${this.lastDrawMode}`);
            return true;
        }
        return false;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.drawingGraphics) {
            this.drawingGraphics.destroy();
            this.drawingGraphics = null;
        }
        
        if (this.sizeText) {
            this.sizeText.destroy();
            this.sizeText = null;
        }
        
        if (this.coordText) {
            this.coordText.destroy();
            this.coordText = null;
        }
        
        if (this.gridSnapHelper) {
            this.gridSnapHelper.destroy();
            this.gridSnapHelper = null;
        }
        
        if (this.guideHelper) {
            this.guideHelper.destroy();
            this.guideHelper = null;
        }
        
        if (this.precisionHelper) {
            this.precisionHelper.destroy();
            this.precisionHelper = null;
        }
        
        if (this.smartSnapHelper) {
            this.smartSnapHelper.destroy();
            this.smartSnapHelper = null;
        }
        
        if (this.alignmentGuideHelper) {
            this.alignmentGuideHelper.destroy();
            this.alignmentGuideHelper = null;
        }
        
        if (this.animationHelper) {
            this.animationHelper.destroy();
            this.animationHelper = null;
        }
        
        if (this.templateManager) {
            this.templateManager.destroy();
            this.templateManager = null;
        }
        
        if (this.enhancementManager) {
            this.enhancementManager.destroy();
            this.enhancementManager = null;
        }
        
        if (this.soundManager) {
            this.soundManager.destroy();
            this.soundManager = null;
        }
        
        if (this.timePresetHelper) {
            this.timePresetHelper.destroy();
            this.timePresetHelper = null;
        }
    }
}

