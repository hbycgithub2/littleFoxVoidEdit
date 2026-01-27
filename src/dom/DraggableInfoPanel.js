// src/dom/DraggableInfoPanel.js
// 可拖拽信息面板 - 使用 DOM 元素，可移动到屏幕任意位置

export default class DraggableInfoPanel {
    constructor(options = {}) {
        this.id = options.id || 'draggable-panel-' + Date.now();
        this.title = options.title || '信息面板';
        this.content = options.content || '';
        this.x = options.x || 10;
        this.y = options.y || 10;
        this.visible = options.visible !== undefined ? options.visible : false;
        
        console.log('📦 创建面板:', {
            id: this.id,
            title: this.title,
            x: this.x,
            y: this.y,
            visible: this.visible
        });
        
        this.createPanel();
        this.setupDragging();
    }
    
    createPanel() {
        console.log('🎨 创建 DOM 元素:', this.id);
        
        // 创建面板容器
        this.panel = document.createElement('div');
        this.panel.id = this.id;
        this.panel.style.cssText = `
            position: fixed;
            left: ${this.x}px;
            top: ${this.y}px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            padding: 12px;
            border: 1px solid #00ff00;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            z-index: 10000;
            cursor: move;
            user-select: none;
            display: ${this.visible ? 'block' : 'none'};
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
        `;
        
        // 创建标题
        this.titleEl = document.createElement('div');
        this.titleEl.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #00ff00;
        `;
        this.titleEl.textContent = this.title;
        this.panel.appendChild(this.titleEl);
        
        // 创建内容
        this.contentEl = document.createElement('div');
        this.contentEl.style.cssText = `
            white-space: pre-wrap;
            line-height: 1.4;
        `;
        this.contentEl.textContent = this.content;
        this.panel.appendChild(this.contentEl);
        
        // 添加到页面
        document.body.appendChild(this.panel);
        
        console.log('✅ DOM 元素已添加到页面:', {
            id: this.panel.id,
            display: this.panel.style.display,
            position: `(${this.panel.style.left}, ${this.panel.style.top})`
        });
    }
    
    setupDragging() {
        console.log('🖱️ 设置拖拽事件:', this.id);
        
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.panelStartX = 0;
        this.panelStartY = 0;
        
        // 鼠标按下
        this.mouseDownHandler = (e) => {
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.panelStartX = parseInt(this.panel.style.left);
            this.panelStartY = parseInt(this.panel.style.top);
            
            this.panel.style.opacity = '0.8';
            console.log('🎯 开始拖拽面板:', {
                title: this.title,
                startPos: { x: this.dragStartX, y: this.dragStartY },
                panelPos: { x: this.panelStartX, y: this.panelStartY }
            });
        };
        
        this.panel.addEventListener('mousedown', this.mouseDownHandler);
        
        // 鼠标移动
        this.mouseMoveHandler = (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
            
            const newX = this.panelStartX + deltaX;
            const newY = this.panelStartY + deltaY;
            
            this.panel.style.left = newX + 'px';
            this.panel.style.top = newY + 'px';
            
            // 每 100ms 输出一次日志，避免刷屏
            if (!this.lastLogTime || Date.now() - this.lastLogTime > 100) {
                console.log('📏 拖拽中:', {
                    title: this.title,
                    delta: { x: deltaX, y: deltaY },
                    newPos: { x: newX, y: newY }
                });
                this.lastLogTime = Date.now();
            }
        };
        
        document.addEventListener('mousemove', this.mouseMoveHandler);
        
        // 鼠标释放
        this.mouseUpHandler = () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.panel.style.opacity = '1';
                console.log('✅ 拖拽结束:', {
                    title: this.title,
                    finalPos: {
                        x: parseInt(this.panel.style.left),
                        y: parseInt(this.panel.style.top)
                    }
                });
            }
        };
        
        document.addEventListener('mouseup', this.mouseUpHandler);
        
        console.log('✅ 拖拽事件已设置');
    }
    
    setContent(content) {
        this.content = content;
        this.contentEl.textContent = content;
        console.log('📝 更新内容:', this.title);
    }
    
    setTitle(title) {
        this.title = title;
        this.titleEl.textContent = title;
        console.log('📝 更新标题:', title);
    }
    
    show() {
        this.visible = true;
        this.panel.style.display = 'block';
        console.log('👁️ 显示面板:', {
            title: this.title,
            position: `(${this.panel.style.left}, ${this.panel.style.top})`
        });
    }
    
    hide() {
        this.visible = false;
        this.panel.style.display = 'none';
        console.log('🙈 隐藏面板:', this.title);
    }
    
    toggle() {
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';
        console.log(this.visible ? '👁️ 显示面板:' : '🙈 隐藏面板:', this.title);
    }
    
    destroy() {
        console.log('🗑️ 销毁面板:', this.title);
        
        // 移除事件监听
        if (this.panel && this.mouseDownHandler) {
            this.panel.removeEventListener('mousedown', this.mouseDownHandler);
        }
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler);
        }
        
        // 移除 DOM 元素
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
        
        console.log('✅ 面板已销毁');
    }
}
