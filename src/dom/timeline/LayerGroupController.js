// src/dom/timeline/LayerGroupController.js
// 图层分组控制器 - 管理时间轴上的图层分组显示

/**
 * 图层分组控制器
 * 职责：
 * 1. 按图层分组显示热区时间条
 * 2. 管理图层折叠/展开状态
 * 3. 绘制图层标题和颜色标识
 * 4. 处理图层标题点击事件
 */
export default class LayerGroupController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        
        // 图层折叠状态（layerId -> boolean）
        this.collapsedLayers = new Map();
        
        // 性能优化：热区位置缓存
        this.hotspotPositionCache = new Map();
        this.cacheInvalidated = true;
        
        // 图层颜色（默认颜色）
        this.layerColors = [
            '#00ff00',  // 绿色
            '#00bfff',  // 蓝色
            '#ff69b4',  // 粉色
            '#ffd700',  // 金色
            '#ff6347',  // 红色
            '#9370db',  // 紫色
            '#00ced1',  // 青色
            '#ffa500'   // 橙色
        ];
        
        // 布局常量
        this.scaleHeight = 30;
        this.layerHeaderHeight = 25;
        this.barHeight = 20;
        this.barGap = 5;
    }
    
    /**
     * 获取图层颜色
     * @param {number} layerId - 图层 ID
     * @returns {string} 颜色值
     */
    getLayerColor(layerId) {
        const index = (layerId - 1) % this.layerColors.length;
        return this.layerColors[index];
    }
    
    /**
     * 切换图层折叠状态
     * @param {number} layerId - 图层 ID
     */
    toggleLayerCollapse(layerId) {
        const isCollapsed = this.collapsedLayers.get(layerId) || false;
        this.collapsedLayers.set(layerId, !isCollapsed);
        
        // 使缓存失效
        this.invalidateCache();
        
        // 触发重绘
        this.timeline.render();
    }
    
    /**
     * 检查图层是否折叠
     * @param {number} layerId - 图层 ID
     * @returns {boolean} 是否折叠
     */
    isLayerCollapsed(layerId) {
        return this.collapsedLayers.get(layerId) || false;
    }
    
    /**
     * 绘制图层分组的热区时间条
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawLayerGroups(ctx) {
        if (!this.scene) {
            console.error('❌ LayerGroupController: scene 未初始化');
            return;
        }
        
        // 使缓存失效（每次绘制时重建）
        this.invalidateCache();
        
        const layers = this.scene.layerManager.getLayers();
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        // 修复：图层从缩略图下方开始（Y=75，缩略图高度45 + 时间刻度30）
        let currentY = this.scaleHeight + 45 + 10;
        
        layers.forEach(layer => {
            // 绘制图层标题
            currentY = this.drawLayerHeader(ctx, layer, currentY);
            
            // 如果图层未折叠，绘制该图层的热区
            if (!this.isLayerCollapsed(layer.id)) {
                const layerHotspots = hotspots.filter(h => h.layerId === layer.id);
                
                layerHotspots.forEach(config => {
                    this.drawHotspotBar(ctx, config, currentY, layer);
                    currentY += this.barHeight + this.barGap;
                });
                
                // 如果图层没有热区，显示提示
                if (layerHotspots.length === 0) {
                    this.drawEmptyLayerHint(ctx, currentY);
                    currentY += 20;
                }
            }
        });
    }
    
    /**
     * 绘制图层标题
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {object} layer - 图层对象
     * @param {number} y - Y 坐标
     * @returns {number} 下一个 Y 坐标
     */
    drawLayerHeader(ctx, layer, y) {
        const { width } = this.timeline.canvas;
        const isCollapsed = this.isLayerCollapsed(layer.id);
        const layerColor = this.getLayerColor(layer.id);
        
        // 背景
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(0, y, width, this.layerHeaderHeight);
        
        // 左侧颜色条
        ctx.fillStyle = layerColor;
        ctx.fillRect(0, y, 4, this.layerHeaderHeight);
        
        // 折叠/展开图标
        const iconX = 15;
        const iconY = y + this.layerHeaderHeight / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(isCollapsed ? '▶' : '▼', iconX, iconY);
        
        // 图层名称
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(layer.name, 35, iconY);
        
        // 热区数量
        const hotspotCount = layer.hotspots.length;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px Arial';
        ctx.fillText(`(${hotspotCount})`, 35 + ctx.measureText(layer.name).width + 8, iconY);
        
        // 可见性图标
        if (!layer.visible) {
            ctx.fillStyle = '#ff6666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('👁️', width - 40, iconY);
        }
        
        // 锁定图标
        if (layer.locked) {
            ctx.fillStyle = '#ffaa66';
            ctx.font = '14px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('🔒', width - 15, iconY);
        }
        
        return y + this.layerHeaderHeight;
    }
    
    /**
     * 绘制热区时间条
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {object} config - 热区配置
     * @param {number} y - Y 坐标
     * @param {object} layer - 图层对象
     */
    drawHotspotBar(ctx, config, y, layer) {
        const x1 = config.startTime * this.timeline.scale;
        const x2 = config.endTime * this.timeline.scale;
        const width = x2 - x1;
        
        // 使用图层颜色或热区自定义颜色
        const color = config.color || this.getLayerColor(layer.id);
        
        // 检查是否正在播放此热区（高亮效果）
        const currentTime = this.timeline.currentTime;
        const isPlaying = currentTime >= config.startTime && currentTime <= config.endTime;
        
        // 检查是否正在闪烁（双击反馈）
        const isFlashing = this.timeline.flashingHotspots && this.timeline.flashingHotspots.has(config.id);
        
        // 热区条背景
        ctx.fillStyle = color;
        ctx.globalAlpha = isFlashing ? 0.9 : 0.6;
        ctx.fillRect(x1, y, width, this.barHeight);
        ctx.globalAlpha = 1.0;
        
        // 绘制缩略图（如果启用）
        if (this.timeline.thumbnailController) {
            this.timeline.thumbnailController.drawThumbnail(ctx, config, x1, y, width, this.barHeight);
        }
        
        // 边框（播放时高亮 + 脉冲效果）
        if (isPlaying) {
            // 计算脉冲效果（使用时间戳实现动画）
            const pulseIntensity = Math.abs(Math.sin(Date.now() / 200)) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(255, 255, 0, ${pulseIntensity})`;
            ctx.lineWidth = 3 + pulseIntensity;
            ctx.strokeRect(x1 - 1, y - 1, width + 2, this.barHeight + 2);
            
            // 添加外发光效果
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 10 * pulseIntensity;
            ctx.strokeRect(x1 - 1, y - 1, width + 2, this.barHeight + 2);
            ctx.shadowBlur = 0;
        } else if (isFlashing) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x1 - 1, y - 1, width + 2, this.barHeight + 2);
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y, width, this.barHeight);
        }
        
        // 文字（如果有缩略图，文字向右偏移）
        const hasThumb = this.timeline.thumbnailController && 
                        this.timeline.thumbnailController.enabled && 
                        width >= 70;
        const textX = hasThumb ? x1 + 70 : x1 + 5;
        const textMaxWidth = hasThumb ? width - 75 : width - 10;
        
        if (textMaxWidth > 20) {
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            // 裁剪文字以适应时间条宽度
            const text = config.word || `${config.shape}`;
            const textWidth = ctx.measureText(text).width;
            
            if (textWidth < textMaxWidth) {
                ctx.fillText(text, textX, y + 4);
            } else if (textMaxWidth > 20) {
                // 如果空间不够，显示省略号
                ctx.fillText('...', textX, y + 4);
            }
        }
        
        // 拖拽手柄
        this.drawHandle(ctx, x1, y);
        this.drawHandle(ctx, x2, y);
    }
    
    /**
     * 绘制拖拽手柄
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     */
    drawHandle(ctx, x, y) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 3, y, 6, this.barHeight);
    }
    
    /**
     * 绘制空图层提示
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} y - Y 坐标
     */
    drawEmptyLayerHint(ctx, y) {
        ctx.fillStyle = '#666666';
        ctx.font = 'italic 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('（此图层暂无热区）', 40, y);
    }
    
    /**
     * 检测图层标题点击
     * @param {number} mouseX - 鼠标 X 坐标
     * @param {number} mouseY - 鼠标 Y 坐标
     * @returns {number|null} 图层 ID 或 null
     */
    hitTestLayerHeader(mouseX, mouseY) {
        if (!this.scene) return null;
        
        const layers = this.scene.layerManager.getLayers();
        // 修复：图层从缩略图下方开始
        let currentY = this.scaleHeight + 45 + 10;
        
        for (const layer of layers) {
            // 检查是否点击了图层标题
            if (mouseY >= currentY && mouseY < currentY + this.layerHeaderHeight) {
                return layer.id;
            }
            
            currentY += this.layerHeaderHeight;
            
            // 如果图层未折叠，跳过热区高度
            if (!this.isLayerCollapsed(layer.id)) {
                const hotspots = this.scene.registry.get('hotspots') || [];
                const layerHotspots = hotspots.filter(h => h.layerId === layer.id);
                
                if (layerHotspots.length > 0) {
                    currentY += layerHotspots.length * (this.barHeight + this.barGap);
                } else {
                    currentY += 20; // 空图层提示高度
                }
            }
        }
        
        return null;
    }
    
    /**
     * 获取热区在时间轴上的 Y 坐标
     * @param {object} config - 热区配置
     * @returns {number|null} Y 坐标或 null
     */
    getHotspotY(config) {
        if (!this.scene) return null;
        
        const layers = this.scene.layerManager.getLayers();
        const hotspots = this.scene.registry.get('hotspots') || [];
        // 修复：图层从缩略图下方开始
        let currentY = this.scaleHeight + 45 + 10;
        
        for (const layer of layers) {
            currentY += this.layerHeaderHeight;
            
            // 如果图层折叠，跳过
            if (this.isLayerCollapsed(layer.id)) {
                continue;
            }
            
            // 查找该图层的热区
            const layerHotspots = hotspots.filter(h => h.layerId === layer.id);
            
            for (const hotspot of layerHotspots) {
                if (hotspot.id === config.id) {
                    return currentY;
                }
                currentY += this.barHeight + this.barGap;
            }
            
            // 空图层提示高度
            if (layerHotspots.length === 0) {
                currentY += 20;
            }
        }
        
        return null;
    }
    
    /**
     * 获取指定位置的热区（用于双击、悬停等交互 - 优化版）
     * @param {number} x - Canvas 内的 X 坐标
     * @param {number} y - Canvas 内的 Y 坐标
     * @returns {object|null} 热区配置或 null
     */
    getHotspotAtPosition(x, y) {
        if (!this.scene) return null;
        
        // 如果缓存失效，重建缓存
        if (this.cacheInvalidated) {
            this.rebuildPositionCache();
        }
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        for (const config of hotspots) {
            // 从缓存获取 Y 坐标
            const barY = this.hotspotPositionCache.get(config.id);
            
            if (barY === undefined) continue; // 图层折叠时跳过
            
            // 计算热区的 X 范围
            const x1 = config.startTime * this.timeline.scale;
            const x2 = config.endTime * this.timeline.scale;
            
            // 检查是否在热区范围内
            if (x >= x1 && x <= x2 && y >= barY && y <= barY + this.barHeight) {
                return config;
            }
        }
        
        return null;
    }
    
    /**
     * 重建热区位置缓存（性能优化）
     */
    rebuildPositionCache() {
        this.hotspotPositionCache.clear();
        
        if (!this.scene) return;
        
        const layers = this.scene.layerManager.getLayers();
        const hotspots = this.scene.registry.get('hotspots') || [];
        // 修复：图层从缩略图下方开始
        let currentY = this.scaleHeight + 45 + 10;
        
        for (const layer of layers) {
            currentY += this.layerHeaderHeight;
            
            // 如果图层折叠，跳过
            if (this.isLayerCollapsed(layer.id)) {
                continue;
            }
            
            // 查找该图层的热区
            const layerHotspots = hotspots.filter(h => h.layerId === layer.id);
            
            for (const hotspot of layerHotspots) {
                this.hotspotPositionCache.set(hotspot.id, currentY);
                currentY += this.barHeight + this.barGap;
            }
            
            // 空图层提示高度
            if (layerHotspots.length === 0) {
                currentY += 20;
            }
        }
        
        this.cacheInvalidated = false;
    }
    
    /**
     * 使缓存失效（在图层变化时调用）
     */
    invalidateCache() {
        this.cacheInvalidated = true;
    }
}
