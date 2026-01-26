// src/dom/timeline/TimelineMarkerController.js
// 时间轴标记控制器 - 管理时间标记系统

/**
 * 时间轴标记控制器
 * 职责：
 * 1. 管理标记的添加/删除/编辑
 * 2. 标记命名和颜色分类
 * 3. 标记点击跳转
 * 4. 绘制标记视觉效果
 * 5. 导出/导入标记数据
 */
export default class TimelineMarkerController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 标记列表
        this.markers = [];
        
        // 标记颜色类型
        this.markerColors = {
            default: '#4488ff',    // 蓝色 - 默认
            important: '#ff4444',  // 红色 - 重要
            note: '#ffaa00',       // 橙色 - 注释
            chapter: '#00ff88',    // 绿色 - 章节
            warning: '#ff00ff'     // 紫色 - 警告
        };
        
        // 选中的标记
        this.selectedMarker = null;
        
        // 标记拖拽状态
        this.isDraggingMarker = false;
        this.draggedMarker = null;
    }
    
    /**
     * 添加标记
     * @param {number} time - 时间（秒）
     * @param {string} label - 标记标签
     * @param {string} color - 标记颜色类型
     * @returns {object} 创建的标记对象
     */
    addMarker(time, label = null, color = 'default') {
        const marker = {
            id: `marker_${Date.now()}`,
            time: time,
            label: label || `标记 ${this.markers.length + 1}`,
            color: color,
            description: ''
        };
        
        this.markers.push(marker);
        
        // 按时间排序
        this.markers.sort((a, b) => a.time - b.time);
        
        // 触发重绘
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:marker:added', { marker });
        
        return marker;
    }
    
    /**
     * 删除标记
     * @param {string} markerId - 标记 ID
     */
    deleteMarker(markerId) {
        const index = this.markers.findIndex(m => m.id === markerId);
        if (index !== -1) {
            const marker = this.markers[index];
            this.markers.splice(index, 1);
            
            // 如果删除的是选中的标记，清空选择
            if (this.selectedMarker && this.selectedMarker.id === markerId) {
                this.selectedMarker = null;
            }
            
            // 触发重绘
            this.timeline.render();
            
            // 发送事件
            this.scene.events.emit('timeline:marker:deleted', { markerId, marker });
        }
    }
    
    /**
     * 更新标记
     * @param {string} markerId - 标记 ID
     * @param {object} updates - 更新的属性
     */
    updateMarker(markerId, updates) {
        const marker = this.markers.find(m => m.id === markerId);
        if (!marker) return;
        
        // 更新属性
        if (updates.time !== undefined) marker.time = updates.time;
        if (updates.label !== undefined) marker.label = updates.label;
        if (updates.color !== undefined) marker.color = updates.color;
        if (updates.description !== undefined) marker.description = updates.description;
        
        // 如果时间改变，重新排序
        if (updates.time !== undefined) {
            this.markers.sort((a, b) => a.time - b.time);
        }
        
        // 触发重绘
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:marker:updated', { markerId, marker, updates });
    }
    
    /**
     * 获取标记
     * @param {string} markerId - 标记 ID
     * @returns {object|null} 标记对象
     */
    getMarker(markerId) {
        return this.markers.find(m => m.id === markerId) || null;
    }
    
    /**
     * 获取所有标记
     * @returns {Array} 标记数组
     */
    getAllMarkers() {
        return [...this.markers];
    }
    
    /**
     * 清除所有标记
     */
    clearAllMarkers() {
        this.markers = [];
        this.selectedMarker = null;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:marker:cleared');
    }
    
    /**
     * 跳转到标记
     * @param {string} markerId - 标记 ID
     */
    jumpToMarker(markerId) {
        const marker = this.getMarker(markerId);
        if (!marker) return;
        
        // 发送视频跳转事件
        this.game.events.emit('video:seek', marker.time);
        
        // 选中标记
        this.selectedMarker = marker;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:marker:jumped', { markerId, marker });
    }
    
    /**
     * 跳转到下一个标记
     */
    jumpToNextMarker() {
        const currentTime = this.timeline.currentTime;
        const nextMarker = this.markers.find(m => m.time > currentTime);
        
        if (nextMarker) {
            this.jumpToMarker(nextMarker.id);
        }
    }
    
    /**
     * 跳转到上一个标记
     */
    jumpToPreviousMarker() {
        const currentTime = this.timeline.currentTime;
        const previousMarkers = this.markers.filter(m => m.time < currentTime);
        
        if (previousMarkers.length > 0) {
            const previousMarker = previousMarkers[previousMarkers.length - 1];
            this.jumpToMarker(previousMarker.id);
        }
    }
    
    /**
     * 检测标记点击
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {object|null} 点击的标记对象
     */
    hitTest(x, y) {
        const hitRadius = 8; // 点击半径
        
        for (const marker of this.markers) {
            const markerX = marker.time * this.timeline.scale;
            const markerY = 6; // 菱形中心 Y 坐标
            
            const distance = Math.sqrt(
                Math.pow(x - markerX, 2) + 
                Math.pow(y - markerY, 2)
            );
            
            if (distance < hitRadius) {
                return marker;
            }
        }
        
        return null;
    }
    
    /**
     * 开始拖拽标记
     * @param {object} marker - 标记对象
     */
    startDragMarker(marker) {
        this.isDraggingMarker = true;
        this.draggedMarker = marker;
        this.selectedMarker = marker;
    }
    
    /**
     * 拖拽标记
     * @param {number} x - 当前鼠标 X 坐标
     */
    dragMarker(x) {
        if (!this.isDraggingMarker || !this.draggedMarker) return;
        
        let time = x / this.timeline.scale;
        
        // 应用吸附
        if (this.timeline.snapController) {
            time = this.timeline.snapController.snapTime(time, null);
        }
        
        // 限制在有效范围内
        time = Math.max(0, time);
        if (this.timeline.videoDuration > 0) {
            time = Math.min(time, this.timeline.videoDuration);
        }
        
        // 更新标记时间
        this.draggedMarker.time = time;
        
        // 重新排序
        this.markers.sort((a, b) => a.time - b.time);
        
        // 触发重绘
        this.timeline.render();
    }
    
    /**
     * 结束拖拽标记
     */
    endDragMarker() {
        if (this.isDraggingMarker && this.draggedMarker) {
            // 发送事件
            this.scene.events.emit('timeline:marker:moved', {
                markerId: this.draggedMarker.id,
                marker: this.draggedMarker
            });
        }
        
        this.isDraggingMarker = false;
        this.draggedMarker = null;
    }
    
    /**
     * 检查是否正在拖拽标记
     * @returns {boolean} 是否拖拽中
     */
    isDragging() {
        return this.isDraggingMarker;
    }
    
    /**
     * 绘制标记
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawMarkers(ctx) {
        const canvasHeight = this.timeline.canvas.height;
        
        this.markers.forEach(marker => {
            const x = marker.time * this.timeline.scale;
            const color = this.markerColors[marker.color] || this.markerColors.default;
            const isSelected = this.selectedMarker && this.selectedMarker.id === marker.id;
            
            // 竖线
            ctx.strokeStyle = color;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.setLineDash(isSelected ? [] : [2, 2]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 顶部菱形
            ctx.fillStyle = color;
            if (isSelected) {
                // 选中时绘制更大的菱形
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x - 6, 8);
                ctx.lineTo(x, 16);
                ctx.lineTo(x + 6, 8);
                ctx.closePath();
                ctx.fill();
                
                // 白色边框
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // 普通菱形
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x - 4, 6);
                ctx.lineTo(x, 12);
                ctx.lineTo(x + 4, 6);
                ctx.closePath();
                ctx.fill();
            }
            
            // 标签（旋转显示）
            ctx.save();
            ctx.translate(x + 2, 20);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = color;
            ctx.font = isSelected ? 'bold 11px Arial' : '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(marker.label, 0, 0);
            ctx.restore();
        });
    }
    
    /**
     * 导出标记数据
     * @returns {string} JSON 字符串
     */
    exportMarkers() {
        const data = {
            version: '1.0',
            markers: this.markers.map(m => ({
                time: m.time,
                label: m.label,
                color: m.color,
                description: m.description
            }))
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    /**
     * 导入标记数据
     * @param {string} jsonString - JSON 字符串
     * @returns {boolean} 是否成功
     */
    importMarkers(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.markers || !Array.isArray(data.markers)) {
                console.error('Invalid marker data format');
                return false;
            }
            
            // 清空现有标记
            this.clearAllMarkers();
            
            // 导入标记
            data.markers.forEach(m => {
                this.addMarker(m.time, m.label, m.color);
                
                // 更新描述
                const marker = this.markers[this.markers.length - 1];
                if (m.description) {
                    marker.description = m.description;
                }
            });
            
            // 发送事件
            this.scene.events.emit('timeline:marker:imported', {
                count: this.markers.length
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import markers:', error);
            return false;
        }
    }
    
    /**
     * 获取光标样式
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string|null} 光标样式或 null
     */
    getCursor(x, y) {
        const marker = this.hitTest(x, y);
        return marker ? 'pointer' : null;
    }
    
    /**
     * 清除所有标记
     */
    clearAllMarkers() {
        this.markers = [];
        this.selectedMarker = null;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:marker:allCleared');
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.markers = [];
        this.selectedMarker = null;
        this.isDraggingMarker = false;
        this.draggedMarker = null;
        console.log('TimelineMarkerController destroyed');
    }
}
