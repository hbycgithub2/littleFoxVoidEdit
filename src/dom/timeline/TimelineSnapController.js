// src/dom/timeline/TimelineSnapController.js
// 时间轴吸附控制器 - 管理时间条的吸附功能

/**
 * 时间轴吸附控制器
 * 职责：
 * 1. 管理吸附开关状态
 * 2. 计算吸附点（网格、其他时间条边缘）
 * 3. 在拖拽时自动对齐到吸附点
 * 4. 绘制吸附线视觉反馈
 * 5. 发送 Phaser 事件通知场景
 */
export default class TimelineSnapController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        
        // 吸附设置
        this.enabled = true; // 吸附开关
        this.snapThreshold = 10; // 吸附阈值（像素）
        this.snapToGrid = true; // 吸附到网格
        this.snapToHotspots = true; // 吸附到其他热区
        this.snapToMarkers = true; // 吸附到标记
        
        // 当前吸附状态
        this.currentSnapLine = null; // 当前吸附线位置
        this.currentSnapType = null; // 当前吸附类型
        this.currentSnapInfo = null; // 当前吸附信息（包含详细数据）
    }
    
    /**
     * 切换吸附开关
     */
    toggle() {
        this.enabled = !this.enabled;
        
        // 发送事件
        this.scene.events.emit('timeline:snap:toggled', {
            enabled: this.enabled
        });
        
        // 显示Toast提示
        this.scene.events.emit('ui:showToast', {
            message: this.enabled ? '✓ 磁性吸附已启用' : '✗ 磁性吸附已禁用',
            duration: 2000,
            color: this.enabled ? '#4CAF50' : '#999999'
        });
        
        console.log(`🧲 磁性吸附: ${this.enabled ? '启用' : '禁用'}`);
        
        return this.enabled;
    }
    
    /**
     * 设置吸附开关
     * @param {boolean} enabled - 是否启用吸附
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        // 发送事件
        this.scene.events.emit('timeline:snap:toggled', {
            enabled: this.enabled
        });
    }
    
    /**
     * 计算吸附时间（优化版 - 支持优先级和磁性强度）
     * @param {number} time - 原始时间（秒）
     * @param {string} draggedHotspotId - 正在拖拽的热区 ID（避免吸附到自己）
     * @returns {number} 吸附后的时间
     */
    snapTime(time, draggedHotspotId = null) {
        if (!this.enabled) {
            this.currentSnapLine = null;
            this.currentSnapType = null;
            this.currentSnapInfo = null;
            return time;
        }
        
        const snapPoints = this.calculateSnapPoints(draggedHotspotId);
        const timeInPixels = time * this.timeline.scale;
        
        // 按优先级分组吸附点
        const priorityGroups = {
            high: [],    // 热区边缘、标记
            medium: [],  // 入点/出点
            low: []      // 网格
        };
        
        snapPoints.forEach(snap => {
            if (snap.type.startsWith('hotspot-') || snap.type === 'marker') {
                priorityGroups.high.push(snap);
            } else if (snap.type === 'in-point' || snap.type === 'out-point') {
                priorityGroups.medium.push(snap);
            } else {
                priorityGroups.low.push(snap);
            }
        });
        
        // 优先查找高优先级吸附点
        let closestSnap = this.findClosestSnap(timeInPixels, priorityGroups.high, this.snapThreshold);
        
        // 如果没找到，查找中优先级
        if (!closestSnap) {
            closestSnap = this.findClosestSnap(timeInPixels, priorityGroups.medium, this.snapThreshold);
        }
        
        // 如果还没找到，查找低优先级（网格）
        if (!closestSnap) {
            closestSnap = this.findClosestSnap(timeInPixels, priorityGroups.low, this.snapThreshold * 0.8);
        }
        
        if (closestSnap) {
            // 吸附到最近的点
            this.currentSnapLine = closestSnap.x;
            this.currentSnapType = closestSnap.type;
            this.currentSnapInfo = closestSnap;
            
            // 发送吸附事件（遵循 Phaser 标准）
            this.scene.events.emit('timeline:snap:active', {
                time: closestSnap.time,
                type: closestSnap.type,
                info: closestSnap
            });
            
            return closestSnap.x / this.timeline.scale;
        } else {
            // 没有吸附点
            this.currentSnapLine = null;
            this.currentSnapType = null;
            this.currentSnapInfo = null;
            return time;
        }
    }
    
    /**
     * 查找最近的吸附点
     * @param {number} timeInPixels - 时间（像素）
     * @param {Array} snapPoints - 吸附点数组
     * @param {number} threshold - 吸附阈值
     * @returns {object|null} 最近的吸附点或 null
     */
    findClosestSnap(timeInPixels, snapPoints, threshold) {
        let closestSnap = null;
        let minDistance = threshold;
        
        snapPoints.forEach(snap => {
            const distance = Math.abs(timeInPixels - snap.x);
            if (distance < minDistance) {
                minDistance = distance;
                closestSnap = snap;
            }
        });
        
        return closestSnap;
    }
    
    /**
     * 计算所有吸附点
     * @param {string} draggedHotspotId - 正在拖拽的热区 ID
     * @returns {Array} 吸附点数组
     */
    calculateSnapPoints(draggedHotspotId) {
        const snapPoints = [];
        
        // 1. 网格吸附点
        if (this.snapToGrid) {
            const gridPoints = this.calculateGridSnapPoints();
            snapPoints.push(...gridPoints);
        }
        
        // 2. 热区边缘吸附点
        if (this.snapToHotspots) {
            const hotspotPoints = this.calculateHotspotSnapPoints(draggedHotspotId);
            snapPoints.push(...hotspotPoints);
        }
        
        // 3. 标记吸附点
        if (this.snapToMarkers && this.timeline.keyboardController) {
            const markerPoints = this.calculateMarkerSnapPoints();
            snapPoints.push(...markerPoints);
        }
        
        // 4. 入点/出点吸附点
        if (this.timeline.keyboardController) {
            const inOutPoints = this.calculateInOutSnapPoints();
            snapPoints.push(...inOutPoints);
        }
        
        return snapPoints;
    }
    
    /**
     * 计算网格吸附点
     * @returns {Array} 网格吸附点数组
     */
    calculateGridSnapPoints() {
        const points = [];
        const { width } = this.timeline.canvas;
        const maxTime = this.timeline.videoDuration || 60;
        
        // 根据缩放级别确定网格间隔
        let gridInterval;
        if (this.timeline.scale < 5) {
            gridInterval = 10; // 10秒
        } else if (this.timeline.scale < 20) {
            gridInterval = 5; // 5秒
        } else if (this.timeline.scale < 50) {
            gridInterval = 1; // 1秒
        } else {
            gridInterval = 0.5; // 0.5秒
        }
        
        for (let t = 0; t <= maxTime; t += gridInterval) {
            const x = t * this.timeline.scale;
            if (x > width) break;
            
            points.push({
                x: x,
                time: t,
                type: 'grid'
            });
        }
        
        return points;
    }
    
    /**
     * 计算热区边缘吸附点
     * @param {string} draggedHotspotId - 正在拖拽的热区 ID
     * @returns {Array} 热区吸附点数组
     */
    calculateHotspotSnapPoints(draggedHotspotId) {
        const points = [];
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        hotspots.forEach(config => {
            // 跳过正在拖拽的热区
            if (config.id === draggedHotspotId) return;
            
            // 开始边缘
            points.push({
                x: config.startTime * this.timeline.scale,
                time: config.startTime,
                type: 'hotspot-start',
                hotspotId: config.id
            });
            
            // 结束边缘
            points.push({
                x: config.endTime * this.timeline.scale,
                time: config.endTime,
                type: 'hotspot-end',
                hotspotId: config.id
            });
        });
        
        return points;
    }
    
    /**
     * 计算标记吸附点
     * @returns {Array} 标记吸附点数组
     */
    calculateMarkerSnapPoints() {
        const points = [];
        
        // 使用 TimelineMarkerController 的标记
        if (this.timeline.markerController) {
            const markers = this.timeline.markerController.getAllMarkers();
            markers.forEach(marker => {
                points.push({
                    x: marker.time * this.timeline.scale,
                    time: marker.time,
                    type: 'marker',
                    markerId: marker.id
                });
            });
        }
        
        return points;
    }
    
    /**
     * 计算入点/出点吸附点
     * @returns {Array} 入点/出点吸附点数组
     */
    calculateInOutSnapPoints() {
        const points = [];
        const inPoint = this.timeline.keyboardController.inPoint;
        const outPoint = this.timeline.keyboardController.outPoint;
        
        if (inPoint !== null) {
            points.push({
                x: inPoint * this.timeline.scale,
                time: inPoint,
                type: 'in-point'
            });
        }
        
        if (outPoint !== null) {
            points.push({
                x: outPoint * this.timeline.scale,
                time: outPoint,
                type: 'out-point'
            });
        }
        
        return points;
    }
    
    /**
     * 绘制吸附线（优化版 - 更好的视觉效果）
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawSnapLine(ctx) {
        if (this.currentSnapLine === null) return;
        
        const canvasHeight = this.timeline.canvas.height;
        
        // 根据吸附类型选择颜色和样式
        let color, label, showLabel = true;
        switch (this.currentSnapType) {
            case 'grid':
                color = '#ffaa00'; // 橙色
                label = `${(this.currentSnapLine / this.timeline.scale).toFixed(1)}s`;
                break;
            case 'hotspot-start':
                color = '#00ffff'; // 青色
                label = '开始';
                break;
            case 'hotspot-end':
                color = '#00ffff'; // 青色
                label = '结束';
                break;
            case 'marker':
                color = '#4488ff'; // 蓝色
                label = '标记';
                break;
            case 'in-point':
                color = '#00ff00'; // 绿色
                label = '入点';
                break;
            case 'out-point':
                color = '#ff6666'; // 红色
                label = '出点';
                break;
            default:
                color = '#ffffff'; // 白色
                label = '';
                showLabel = false;
        }
        
        // 绘制吸附线（虚线）
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.globalAlpha = 0.9;
        
        ctx.beginPath();
        ctx.moveTo(this.currentSnapLine, 30);
        ctx.lineTo(this.currentSnapLine, canvasHeight);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // 绘制顶部指示器（实心圆）
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.currentSnapLine, 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制外圈（白色边框）
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.currentSnapLine, 15, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制标签（如果有）
        if (showLabel && label) {
            ctx.fillStyle = color;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            
            // 绘制背景
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                this.currentSnapLine - textWidth / 2 - 4,
                2,
                textWidth + 8,
                14
            );
            
            // 绘制文字
            ctx.fillStyle = color;
            ctx.fillText(label, this.currentSnapLine, 14);
        }
        
        // 绘制底部时间提示（对于热区吸附）
        if (this.currentSnapInfo && (this.currentSnapType === 'hotspot-start' || this.currentSnapType === 'hotspot-end')) {
            const time = this.currentSnapInfo.time.toFixed(1);
            ctx.fillStyle = color;
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // 绘制背景
            const timeText = `${time}s`;
            const timeWidth = ctx.measureText(timeText).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                this.currentSnapLine - timeWidth / 2 - 3,
                canvasHeight - 16,
                timeWidth + 6,
                12
            );
            
            // 绘制文字
            ctx.fillStyle = color;
            ctx.fillText(timeText, this.currentSnapLine, canvasHeight - 15);
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * 清除吸附状态
     */
    clearSnap() {
        this.currentSnapLine = null;
        this.currentSnapType = null;
        this.currentSnapInfo = null;
    }
    
    /**
     * 获取吸附设置
     * @returns {object} 吸附设置对象
     */
    getSettings() {
        return {
            enabled: this.enabled,
            snapThreshold: this.snapThreshold,
            snapToGrid: this.snapToGrid,
            snapToHotspots: this.snapToHotspots,
            snapToMarkers: this.snapToMarkers
        };
    }
    
    /**
     * 更新吸附设置
     * @param {object} settings - 吸附设置对象
     */
    updateSettings(settings) {
        if (settings.enabled !== undefined) {
            this.enabled = settings.enabled;
        }
        if (settings.snapThreshold !== undefined) {
            this.snapThreshold = settings.snapThreshold;
        }
        if (settings.snapToGrid !== undefined) {
            this.snapToGrid = settings.snapToGrid;
        }
        if (settings.snapToHotspots !== undefined) {
            this.snapToHotspots = settings.snapToHotspots;
        }
        if (settings.snapToMarkers !== undefined) {
            this.snapToMarkers = settings.snapToMarkers;
        }
        
        // 发送事件
        this.scene.events.emit('timeline:snap:settingsChanged', this.getSettings());
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.clearSnap();
        console.log('TimelineSnapController destroyed');
    }
}
