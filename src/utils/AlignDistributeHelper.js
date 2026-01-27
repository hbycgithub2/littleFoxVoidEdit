// src/utils/AlignDistributeHelper.js
// 对齐和分布工具 - 完全遵循 Phaser 3 官方标准
// 功能：左/右/居中/顶部/底部对齐、水平/垂直分布

export default class AlignDistributeHelper {
    constructor(scene) {
        this.scene = scene;
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘快捷键（遵循 Phaser 标准）
     */
    setupKeyboard() {
        const keyboard = this.scene.input.keyboard;
        
        // Ctrl+Shift+L - 左对齐
        keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
                switch(event.key.toLowerCase()) {
                    case 'l': this.alignLeft(); break;
                    case 'r': this.alignRight(); break;
                    case 'h': this.alignCenterHorizontal(); break;
                    case 't': this.alignTop(); break;
                    case 'b': this.alignBottom(); break;
                    case 'v': this.alignCenterVertical(); break;
                    case 'd': this.distributeHorizontal(); break;
                    case 'e': this.distributeVertical(); break;
                }
            }
        });
    }
    
    /**
     * 左对齐（遵循 Phaser 标准）
     */
    alignLeft() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        // 找到最左边的 x 坐标
        const minX = Math.min(...selected.map(h => h.x));
        
        // 对齐所有热区（遵循 Phaser 标准）
        selected.forEach(hotspot => {
            hotspot.x = minX;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 左对齐 ${selected.length} 个热区`);
    }
    
    /**
     * 右对齐（遵循 Phaser 标准）
     */
    alignRight() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        // 找到最右边的 x 坐标
        const maxX = Math.max(...selected.map(h => h.x));
        
        selected.forEach(hotspot => {
            hotspot.x = maxX;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 右对齐 ${selected.length} 个热区`);
    }
    
    /**
     * 水平居中对齐（遵循 Phaser 标准）
     */
    alignCenterHorizontal() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        // 计算中心 x 坐标
        const minX = Math.min(...selected.map(h => h.x));
        const maxX = Math.max(...selected.map(h => h.x));
        const centerX = (minX + maxX) / 2;
        
        selected.forEach(hotspot => {
            hotspot.x = centerX;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 水平居中对齐 ${selected.length} 个热区`);
    }
    
    /**
     * 顶部对齐（遵循 Phaser 标准）
     */
    alignTop() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        // 找到最上边的 y 坐标
        const minY = Math.min(...selected.map(h => h.y));
        
        selected.forEach(hotspot => {
            hotspot.y = minY;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 顶部对齐 ${selected.length} 个热区`);
    }
    
    /**
     * 底部对齐（遵循 Phaser 标准）
     */
    alignBottom() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        // 找到最下边的 y 坐标
        const maxY = Math.max(...selected.map(h => h.y));
        
        selected.forEach(hotspot => {
            hotspot.y = maxY;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 底部对齐 ${selected.length} 个热区`);
    }
    
    /**
     * 垂直居中对齐（遵循 Phaser 标准）
     */
    alignCenterVertical() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        // 计算中心 y 坐标
        const minY = Math.min(...selected.map(h => h.y));
        const maxY = Math.max(...selected.map(h => h.y));
        const centerY = (minY + maxY) / 2;
        
        selected.forEach(hotspot => {
            hotspot.y = centerY;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 垂直居中对齐 ${selected.length} 个热区`);
    }
    
    /**
     * 水平分布（遵循 Phaser 标准）
     */
    distributeHorizontal() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 3) {
            console.warn('⚠️ 至少需要选择 3 个热区');
            return;
        }
        
        // 按 x 坐标排序
        const sorted = [...selected].sort((a, b) => a.x - b.x);
        
        // 计算间距
        const minX = sorted[0].x;
        const maxX = sorted[sorted.length - 1].x;
        const spacing = (maxX - minX) / (sorted.length - 1);
        
        // 分布热区（遵循 Phaser 标准）
        sorted.forEach((hotspot, index) => {
            hotspot.x = minX + spacing * index;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 水平分布 ${selected.length} 个热区`);
    }
    
    /**
     * 垂直分布（遵循 Phaser 标准）
     */
    distributeVertical() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 3) {
            console.warn('⚠️ 至少需要选择 3 个热区');
            return;
        }
        
        // 按 y 坐标排序
        const sorted = [...selected].sort((a, b) => a.y - b.y);
        
        // 计算间距
        const minY = sorted[0].y;
        const maxY = sorted[sorted.length - 1].y;
        const spacing = (maxY - minY) / (sorted.length - 1);
        
        // 分布热区
        sorted.forEach((hotspot, index) => {
            hotspot.y = minY + spacing * index;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 垂直分布 ${selected.length} 个热区`);
    }
    
    /**
     * 均匀分布（考虑热区宽度）- 遵循 Phaser 标准
     */
    distributeHorizontalSpaced() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 3) {
            console.warn('⚠️ 至少需要选择 3 个热区');
            return;
        }
        
        const sorted = [...selected].sort((a, b) => a.x - b.x);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        // 计算总宽度
        const totalWidth = sorted.reduce((sum, h) => {
            const bounds = h.getBounds ? h.getBounds() : { width: 100 };
            return sum + bounds.width;
        }, 0);
        
        const availableSpace = last.x - first.x;
        const spacing = (availableSpace - totalWidth) / (sorted.length - 1);
        
        let currentX = first.x;
        sorted.forEach((hotspot, index) => {
            if (index > 0) {
                const prevBounds = sorted[index - 1].getBounds ? 
                    sorted[index - 1].getBounds() : { width: 100 };
                currentX += prevBounds.width + spacing;
                hotspot.x = currentX;
            }
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 均匀水平分布 ${selected.length} 个热区`);
    }
    
    /**
     * 均匀垂直分布（考虑热区高度）- 遵循 Phaser 标准
     */
    distributeVerticalSpaced() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 3) {
            console.warn('⚠️ 至少需要选择 3 个热区');
            return;
        }
        
        const sorted = [...selected].sort((a, b) => a.y - b.y);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        const totalHeight = sorted.reduce((sum, h) => {
            const bounds = h.getBounds ? h.getBounds() : { height: 80 };
            return sum + bounds.height;
        }, 0);
        
        const availableSpace = last.y - first.y;
        const spacing = (availableSpace - totalHeight) / (sorted.length - 1);
        
        let currentY = first.y;
        sorted.forEach((hotspot, index) => {
            if (index > 0) {
                const prevBounds = sorted[index - 1].getBounds ? 
                    sorted[index - 1].getBounds() : { height: 80 };
                currentY += prevBounds.height + spacing;
                hotspot.y = currentY;
            }
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 均匀垂直分布 ${selected.length} 个热区`);
    }
    
    /**
     * 网格对齐 - 遵循 Phaser 标准
     */
    alignToGrid(gridSize = 50) {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            hotspot.x = Math.round(hotspot.x / gridSize) * gridSize;
            hotspot.y = Math.round(hotspot.y / gridSize) * gridSize;
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 网格对齐完成 (${gridSize}px)`);
    }
    
    /**
     * 匹配宽度 - 遵循 Phaser 标准
     */
    matchWidth() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        const targetWidth = selected[0].displayWidth || 100;
        selected.forEach(hotspot => {
            if (hotspot.setDisplaySize) {
                hotspot.setDisplaySize(targetWidth, hotspot.displayHeight);
            }
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 匹配宽度完成`);
    }
    
    /**
     * 匹配高度 - 遵循 Phaser 标准
     */
    matchHeight() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        const targetHeight = selected[0].displayHeight || 80;
        selected.forEach(hotspot => {
            if (hotspot.setDisplaySize) {
                hotspot.setDisplaySize(hotspot.displayWidth, targetHeight);
            }
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 匹配高度完成`);
    }
    
    /**
     * 匹配大小 - 遵循 Phaser 标准
     */
    matchSize() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) {
            console.warn('⚠️ 至少需要选择 2 个热区');
            return;
        }
        
        const targetWidth = selected[0].displayWidth || 100;
        const targetHeight = selected[0].displayHeight || 80;
        
        selected.forEach(hotspot => {
            if (hotspot.setDisplaySize) {
                hotspot.setDisplaySize(targetWidth, targetHeight);
            }
        });
        
        this.scene.syncToRegistry();
        console.log(`✓ 匹配大小完成`);
    }
    
    /**
     * 对齐到画布中心（遵循 Phaser 标准）
     */
    alignToCanvasCenter() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        
        if (selected.length === 1) {
            // 单个热区居中
            selected[0].x = centerX;
            selected[0].y = centerY;
        } else {
            // 多个热区作为整体居中
            const bounds = this.getSelectionBounds(selected);
            const offsetX = centerX - (bounds.minX + bounds.maxX) / 2;
            const offsetY = centerY - (bounds.minY + bounds.maxY) / 2;
            
            selected.forEach(hotspot => {
                hotspot.x += offsetX;
                hotspot.y += offsetY;
            });
        }
        
        this.scene.syncToRegistry();
        console.log(`✓ 对齐到画布中心`);
    }
    
    /**
     * 获取选区边界（遵循 Phaser 标准）
     */
    getSelectionBounds(hotspots) {
        const xs = hotspots.map(h => h.x);
        const ys = hotspots.map(h => h.y);
        
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.scene.input.keyboard.off('keydown');
    }
}
