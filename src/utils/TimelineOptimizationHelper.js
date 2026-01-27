// src/utils/TimelineOptimizationHelper.js
// 时间轴优化辅助工具 - 提供额外的优化功能

/**
 * 时间轴优化辅助工具
 * 提供A4、B5、B6的额外优化功能
 */
export default class TimelineOptimizationHelper {
    constructor(scene) {
        this.scene = scene;
        this.timeline = null;
        
        // 等待timeline初始化
        setTimeout(() => {
            this.timeline = window.timelinePanel;
            this.init();
        }, 100);
    }
    
    /**
     * 初始化优化功能
     */
    init() {
        if (!this.timeline) return;
        
        // 优化1: 自适应吸附阈值
        this.setupAdaptiveSnapThreshold();
        
        // 优化2: 批量操作预览
        this.setupBatchPreview();
        
        // 优化3: 智能边界处理
        this.setupSmartBoundary();
        
        // 优化4: 操作提示系统
        this.setupOperationHints();
    }
    
    /**
     * 优化1: 自适应吸附阈值（根据缩放级别调整）
     */
    setupAdaptiveSnapThreshold() {
        if (!this.timeline || !this.timeline.snapController) return;
        
        const originalSnapTime = this.timeline.snapController.snapTime.bind(this.timeline.snapController);
        
        this.timeline.snapController.snapTime = (time, draggedHotspotId = null) => {
            // 根据缩放级别调整阈值
            const scale = this.timeline.scale;
            let threshold;
            
            if (scale < 5) {
                threshold = 20; // 缩小时，增大阈值
            } else if (scale < 20) {
                threshold = 10; // 正常阈值
            } else {
                threshold = 5;  // 放大时，减小阈值（更精确）
            }
            
            // 临时修改阈值
            const originalThreshold = this.timeline.snapController.snapThreshold;
            this.timeline.snapController.snapThreshold = threshold;
            
            // 调用原始方法
            const result = originalSnapTime(time, draggedHotspotId);
            
            // 恢复阈值
            this.timeline.snapController.snapThreshold = originalThreshold;
            
            return result;
        };
    }
    
    /**
     * 优化2: 批量操作预览（拖拽前显示结果）
     */
    setupBatchPreview() {
        if (!this.timeline || !this.timeline.dragController) return;
        
        // 在拖拽过程中显示预览线
        const originalDrag = this.timeline.dragController.drag.bind(this.timeline.dragController);
        
        this.timeline.dragController.drag = (x) => {
            // 调用原始方法
            originalDrag(x);
            
            // 如果是批量操作，显示预览
            const selectedIds = this.timeline.selectionController.getSelectedIds();
            if (selectedIds.length > 1) {
                // 在render中会自动显示选中高亮
                // 这里可以添加额外的视觉提示
            }
        };
    }
    
    /**
     * 优化3: 智能边界处理（自动调整到最佳位置）
     */
    setupSmartBoundary() {
        if (!this.timeline || !this.timeline.dragController) return;
        
        // 增强边界检查逻辑已在DragController中实现
        // 这里可以添加额外的智能建议
    }
    
    /**
     * 优化4: 操作提示系统（首次使用时显示）
     */
    setupOperationHints() {
        // 检查是否是首次使用
        const hasSeenHints = localStorage.getItem('timeline_hints_seen');
        
        if (!hasSeenHints) {
            // 延迟显示提示，避免干扰初始化
            setTimeout(() => {
                this.showFirstTimeHints();
            }, 2000);
        }
    }
    
    /**
     * 显示首次使用提示
     */
    showFirstTimeHints() {
        const hints = [
            '💡 按住 Alt 键在时间轴上拖拽可以快速创建热区',
            '💡 按 S 键可以切换磁性吸附功能',
            '💡 多选热区后拖拽可以批量调整时间',
            '💡 按 Escape 键可以取消当前操作'
        ];
        
        let currentHint = 0;
        
        const showNextHint = () => {
            if (currentHint >= hints.length) {
                localStorage.setItem('timeline_hints_seen', 'true');
                return;
            }
            
            this.scene.events.emit('ui:showToast', {
                message: hints[currentHint],
                duration: 4000,
                color: '#2196F3'
            });
            
            currentHint++;
            setTimeout(showNextHint, 4500);
        };
        
        showNextHint();
    }
    
    /**
     * 临时禁用吸附（按住Ctrl时）
     */
    enableTemporarySnapDisable() {
        if (!this.timeline || !this.timeline.snapController) return;
        
        let ctrlPressed = false;
        let originalEnabled = true;
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Control' && !ctrlPressed) {
                ctrlPressed = true;
                originalEnabled = this.timeline.snapController.enabled;
                this.timeline.snapController.setEnabled(false);
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Control' && ctrlPressed) {
                ctrlPressed = false;
                this.timeline.snapController.setEnabled(originalEnabled);
            }
        });
    }
    
    /**
     * 批量对齐功能（左对齐、右对齐、居中）
     */
    alignSelected(type) {
        if (!this.timeline) return;
        
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        if (selectedIds.length < 2) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 请至少选择2个热区',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        // 找到参考点
        let referenceTime;
        switch (type) {
            case 'left':
                // 左对齐：对齐到最早的开始时间
                referenceTime = Math.min(...selectedHotspots.map(h => h.startTime));
                selectedHotspots.forEach(h => {
                    const duration = h.endTime - h.startTime;
                    h.startTime = referenceTime;
                    h.endTime = referenceTime + duration;
                });
                break;
                
            case 'right':
                // 右对齐：对齐到最晚的结束时间
                referenceTime = Math.max(...selectedHotspots.map(h => h.endTime));
                selectedHotspots.forEach(h => {
                    const duration = h.endTime - h.startTime;
                    h.endTime = referenceTime;
                    h.startTime = referenceTime - duration;
                });
                break;
                
            case 'center':
                // 居中对齐：对齐到平均中心点
                const avgCenter = selectedHotspots.reduce((sum, h) => 
                    sum + (h.startTime + h.endTime) / 2, 0) / selectedHotspots.length;
                selectedHotspots.forEach(h => {
                    const duration = h.endTime - h.startTime;
                    h.startTime = avgCenter - duration / 2;
                    h.endTime = avgCenter + duration / 2;
                });
                break;
        }
        
        // 更新场景
        this.scene.syncToRegistry();
        this.timeline.render();
        
        this.scene.events.emit('ui:showToast', {
            message: `✓ 已对齐 ${selectedIds.length} 个热区`,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    /**
     * 批量分布功能（等间隔分布）
     */
    distributeSelected() {
        if (!this.timeline) return;
        
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        if (selectedIds.length < 3) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 请至少选择3个热区',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        // 按开始时间排序
        selectedHotspots.sort((a, b) => a.startTime - b.startTime);
        
        // 计算总范围
        const firstStart = selectedHotspots[0].startTime;
        const lastStart = selectedHotspots[selectedHotspots.length - 1].startTime;
        const totalRange = lastStart - firstStart;
        
        // 计算间隔
        const interval = totalRange / (selectedHotspots.length - 1);
        
        // 分布（保持第一个和最后一个不动）
        for (let i = 1; i < selectedHotspots.length - 1; i++) {
            const duration = selectedHotspots[i].endTime - selectedHotspots[i].startTime;
            selectedHotspots[i].startTime = firstStart + interval * i;
            selectedHotspots[i].endTime = selectedHotspots[i].startTime + duration;
        }
        
        // 更新场景
        this.scene.syncToRegistry();
        this.timeline.render();
        
        this.scene.events.emit('ui:showToast', {
            message: `✓ 已分布 ${selectedIds.length} 个热区`,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    /**
     * 批量缩放功能（按比例调整所有时长）
     */
    scaleSelected(factor) {
        if (!this.timeline) return;
        
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        if (selectedIds.length === 0) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 请先选择热区',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        // 找到参考点（最早的开始时间）
        const referenceTime = Math.min(...selectedHotspots.map(h => h.startTime));
        
        // 缩放
        selectedHotspots.forEach(h => {
            const relativeStart = h.startTime - referenceTime;
            const duration = h.endTime - h.startTime;
            
            h.startTime = referenceTime + relativeStart * factor;
            h.endTime = h.startTime + duration * factor;
        });
        
        // 更新场景
        this.scene.syncToRegistry();
        this.timeline.render();
        
        this.scene.events.emit('ui:showToast', {
            message: `✓ 已缩放 ${selectedIds.length} 个热区 (${factor}x)`,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 清理事件监听等
    }
}
