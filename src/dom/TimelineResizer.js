// src/dom/TimelineResizer.js
// 时间轴高度调整器 - 遵循 Phaser 3 官方标准

export default class TimelineResizer {
    constructor(game) {
        this.game = game;
        this.isDragging = false;
        this.startY = 0;
        this.startHeight = 180;
        this.minHeight = 100;
        this.maxHeight = 500;
        
        this.timelinePanel = document.getElementById('timelinePanel');
        this.resizer = document.getElementById('timelineResizer');
        this.timelineCanvas = document.getElementById('timelineCanvas');
        
        if (this.resizer && this.timelinePanel) {
            this.setupEvents();
        }
    }
    
    setupEvents() {
        // 鼠标按下开始拖拽
        this.resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation(); // 阻止事件冒泡
            this.isDragging = true;
            this.startY = e.clientY;
            this.startHeight = this.timelinePanel.offsetHeight;
            
            console.log('🎯 开始拖拽时间轴:', {
                startY: this.startY,
                startHeight: this.startHeight
            });
            
            // 添加拖拽样式
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
        });
        
        // 鼠标移动调整高度
        this.mouseMoveHandler = (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            
            // 计算新高度（时间轴在底部，向上拖拽增加高度，向下拖拽减少高度）
            const deltaY = this.startY - e.clientY; // 向上为正，向下为负
            let newHeight = this.startHeight + deltaY;
            
            // 限制高度范围
            newHeight = Math.max(this.minHeight, Math.min(newHeight, this.maxHeight));
            
            console.log('📏 调整高度:', {
                startY: this.startY,
                currentY: e.clientY,
                deltaY: deltaY,
                startHeight: this.startHeight,
                newHeight: newHeight,
                direction: deltaY > 0 ? '向上↑增加' : '向下↓减少'
            });
            
            // 强制设置所有高度相关属性（使用 setProperty 确保生效）
            this.timelinePanel.style.setProperty('height', `${newHeight}px`, 'important');
            this.timelinePanel.style.setProperty('min-height', `${newHeight}px`, 'important');
            this.timelinePanel.style.setProperty('max-height', `${newHeight}px`, 'important');
            this.timelinePanel.style.setProperty('flex', `0 0 ${newHeight}px`, 'important');
            this.timelinePanel.style.setProperty('flex-basis', `${newHeight}px`, 'important');
            this.timelinePanel.style.setProperty('flex-grow', '0', 'important');
            this.timelinePanel.style.setProperty('flex-shrink', '0', 'important');
            
            // 实时更新 Canvas 尺寸
            if (this.timelineCanvas) {
                requestAnimationFrame(() => {
                    const container = this.timelineCanvas.parentElement;
                    if (container) {
                        this.timelineCanvas.width = container.clientWidth;
                        this.timelineCanvas.height = container.clientHeight;
                        
                        // 触发 TimelinePanel 重绘
                        if (window.timelinePanel && window.timelinePanel.render) {
                            window.timelinePanel.render();
                        }
                    }
                });
            }
        };
        
        document.addEventListener('mousemove', this.mouseMoveHandler);
        
        // 鼠标释放结束拖拽
        this.mouseUpHandler = () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                console.log('✅ 拖拽结束，最终高度:', this.timelinePanel.offsetHeight);
            }
        };
        
        document.addEventListener('mouseup', this.mouseUpHandler);
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        // 移除事件监听
        if (this.resizer) {
            this.resizer.removeEventListener('mousedown', null);
        }
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler);
        }
    }
}
