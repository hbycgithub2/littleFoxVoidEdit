// src/utils/DrawingStatusBar.js
// 绘制状态栏 - 遵循 Phaser 3 官方标准

export default class DrawingStatusBar {
    constructor(scene) {
        this.scene = scene;
        
        // 创建状态栏背景（遵循 Phaser 官方标准）
        const width = scene.game.config.width;
        this.background = scene.add.graphics();
        this.background.fillStyle(0x000000, 0.8);
        this.background.fillRect(0, 0, width, 30);
        this.background.setDepth(1999);
        
        // 创建状态文本（遵循 Phaser 官方标准）
        this.statusText = scene.add.text(10, 7, '', {
            fontSize: '13px',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        this.statusText.setDepth(2000);
        
        this.updateStatus();
        this.setupEvents();
    }
    
    setupEvents() {
        // 监听热区添加
        this.scene.events.on('hotspot:added', () => {
            this.updateStatus();
        });
        
        // 监听热区删除
        this.scene.events.on('hotspot:removed', () => {
            this.updateStatus();
        });
        
        // 监听绘制模式变化
        this.scene.registry.events.on('changedata-drawMode', () => {
            this.updateStatus();
        });
    }
    
    updateStatus() {
        const hotspots = this.scene.hotspots || [];
        const drawMode = this.scene.registry.get('drawMode');
        const gridEnabled = this.scene.drawingManager?.gridSnapHelper?.enabled || false;
        const smartSnapEnabled = this.scene.drawingManager?.smartSnapHelper?.enabled || false;
        const precisionEnabled = this.scene.drawingManager?.precisionHelper?.enabled || false;
        
        let status = `热区: ${hotspots.length}`;
        
        if (drawMode) {
            const modeNames = {
                'circle': '⭕圆形',
                'rect': '▭矩形',
                'ellipse': '⬭椭圆',
                'polygon': '⬟多边形'
            };
            status += ` | 模式: ${modeNames[drawMode] || drawMode}`;
        }
        
        status += ` | 网格: ${gridEnabled ? '✓' : '✗'}`;
        status += ` | 智能: ${smartSnapEnabled ? '✓' : '✗'}`;
        status += ` | 精度: ${precisionEnabled ? '✓' : '✗'}`;
        
        this.statusText.setText(status);
    }
    
    destroy() {
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        
        if (this.statusText) {
            this.scene.events.off('hotspot:added');
            this.scene.events.off('hotspot:removed');
            this.scene.registry.events.off('changedata-drawMode');
            this.statusText.destroy();
            this.statusText = null;
        }
    }
}
