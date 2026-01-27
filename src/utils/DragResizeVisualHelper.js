// src/utils/DragResizeVisualHelper.js
// 拖拽和缩放视觉反馈工具 - 完全遵循 Phaser 3 官方标准
// 功能：显示尺寸、位置、Shift提示

export default class DragResizeVisualHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 视觉元素（遵循 Phaser 官方标准）
        this.sizeText = null;
        this.positionText = null;
        this.shiftHint = null;
        this.guideLine = null;
        
        this.setupEvents();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听拖拽开始
        this.scene.events.on('hotspot:dragstart', (hotspot) => {
            this.showPositionInfo(hotspot);
        });
        
        // 监听拖拽中
        this.scene.events.on('hotspot:drag', (hotspot) => {
            this.updatePositionInfo(hotspot);
        });
        
        // 监听拖拽结束
        this.scene.events.on('hotspot:dragend', () => {
            this.hidePositionInfo();
        });
        
        // 监听缩放开始
        this.scene.events.on('hotspot:resizestart', (hotspot) => {
            this.showSizeInfo(hotspot);
            this.showShiftHint();
        });
        
        // 监听缩放中
        this.scene.events.on('hotspot:resized', (data) => {
            this.updateSizeInfo(data.hotspot);
        });
        
        // 监听缩放结束（通过检测没有更多的 resized 事件）
        let resizeTimeout = null;
        this.scene.events.on('hotspot:resized', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.hideSizeInfo();
                this.hideShiftHint();
            }, 100);
        });
    }
    
    /**
     * 显示位置信息（遵循 Phaser 官方标准）
     */
    showPositionInfo(hotspot) {
        if (!this.positionText) {
            // 使用 Phaser.GameObjects.Text 创建文本
            this.positionText = this.scene.add.text(0, 0, '', {
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            });
            this.positionText.setDepth(10000);
        }
        
        this.updatePositionInfo(hotspot);
        this.positionText.setVisible(true);
    }
    
    /**
     * 更新位置信息（遵循 Phaser 官方标准）
     */
    updatePositionInfo(hotspot) {
        if (!this.positionText) return;
        
        const x = Math.round(hotspot.x);
        const y = Math.round(hotspot.y);
        
        this.positionText.setText(`位置: (${x}, ${y})`);
        this.positionText.setPosition(hotspot.x + 20, hotspot.y - 30);
    }
    
    /**
     * 隐藏位置信息（遵循 Phaser 官方标准）
     */
    hidePositionInfo() {
        if (this.positionText) {
            this.positionText.setVisible(false);
        }
    }
    
    /**
     * 显示尺寸信息（遵循 Phaser 官方标准）
     */
    showSizeInfo(hotspot) {
        if (!this.sizeText) {
            // 使用 Phaser.GameObjects.Text 创建文本
            this.sizeText = this.scene.add.text(0, 0, '', {
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            });
            this.sizeText.setDepth(10000);
        }
        
        this.updateSizeInfo(hotspot);
        this.sizeText.setVisible(true);
    }
    
    /**
     * 更新尺寸信息（遵循 Phaser 官方标准）
     */
    updateSizeInfo(hotspot) {
        if (!this.sizeText) return;
        
        let sizeText = '';
        
        if (hotspot.config.shape === 'rect') {
            const w = Math.round(hotspot.config.width);
            const h = Math.round(hotspot.config.height);
            sizeText = `尺寸: ${w} × ${h}`;
        } else if (hotspot.config.shape === 'circle') {
            const r = Math.round(hotspot.config.radius);
            sizeText = `半径: ${r}`;
        } else if (hotspot.config.shape === 'ellipse') {
            const rx = Math.round(hotspot.config.radiusX);
            const ry = Math.round(hotspot.config.radiusY);
            sizeText = `半径: ${rx} × ${ry}`;
        } else if (hotspot.config.shape === 'polygon') {
            const count = hotspot.config.points ? hotspot.config.points.length : 0;
            sizeText = `顶点: ${count}`;
        }
        
        this.sizeText.setText(sizeText);
        this.sizeText.setPosition(hotspot.x + 20, hotspot.y - 30);
    }
    
    /**
     * 隐藏尺寸信息（遵循 Phaser 官方标准）
     */
    hideSizeInfo() {
        if (this.sizeText) {
            this.sizeText.setVisible(false);
        }
    }
    
    /**
     * 显示 Shift 提示（遵循 Phaser 官方标准）
     */
    showShiftHint() {
        if (!this.shiftHint) {
            // 使用 Phaser.GameObjects.Text 创建文本
            this.shiftHint = this.scene.add.text(
                this.scene.cameras.main.width / 2,
                this.scene.cameras.main.height - 50,
                '按住 Shift 保持比例',
                {
                    fontSize: '16px',
                    color: '#ffff00',
                    backgroundColor: '#000000',
                    padding: { x: 12, y: 6 }
                }
            );
            this.shiftHint.setOrigin(0.5, 0.5);
            this.shiftHint.setDepth(10000);
            this.shiftHint.setScrollFactor(0); // 固定在屏幕上
        }
        
        this.shiftHint.setVisible(true);
        
        // 添加闪烁效果（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: this.shiftHint,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * 隐藏 Shift 提示（遵循 Phaser 官方标准）
     */
    hideShiftHint() {
        if (this.shiftHint) {
            // 停止所有动画
            this.scene.tweens.killTweensOf(this.shiftHint);
            this.shiftHint.setVisible(false);
            this.shiftHint.setAlpha(1);
        }
    }
    
    /**
     * 显示对齐辅助线（遵循 Phaser 官方标准）
     */
    showGuideLine(x1, y1, x2, y2) {
        if (!this.guideLine) {
            // 使用 Phaser.GameObjects.Graphics 创建辅助线
            this.guideLine = this.scene.add.graphics();
            this.guideLine.setDepth(9999);
        }
        
        this.guideLine.clear();
        this.guideLine.lineStyle(1, 0xff00ff, 0.8);
        this.guideLine.lineBetween(x1, y1, x2, y2);
    }
    
    /**
     * 隐藏对齐辅助线（遵循 Phaser 官方标准）
     */
    hideGuideLine() {
        if (this.guideLine) {
            this.guideLine.clear();
        }
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        if (this.sizeText) {
            this.sizeText.destroy();
            this.sizeText = null;
        }
        
        if (this.positionText) {
            this.positionText.destroy();
            this.positionText = null;
        }
        
        if (this.shiftHint) {
            this.scene.tweens.killTweensOf(this.shiftHint);
            this.shiftHint.destroy();
            this.shiftHint = null;
        }
        
        if (this.guideLine) {
            this.guideLine.destroy();
            this.guideLine = null;
        }
        
        // 移除事件监听
        this.scene.events.off('hotspot:dragstart');
        this.scene.events.off('hotspot:drag');
        this.scene.events.off('hotspot:dragend');
        this.scene.events.off('hotspot:resizestart');
        this.scene.events.off('hotspot:resized');
    }
}
