// src/utils/DrawingHelpPanel.js
// 绘制帮助面板 - 遵循 Phaser 3 官方标准

export default class DrawingHelpPanel {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        
        // 创建半透明背景（遵循 Phaser 官方标准）
        this.background = scene.add.graphics();
        this.background.setDepth(2999);
        this.background.setVisible(false);
        
        // 创建帮助文本（遵循 Phaser 官方标准）
        this.helpText = scene.add.text(
            scene.game.config.width / 2,
            scene.game.config.height / 2,
            '',
            {
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 20 },
                align: 'left',
                lineSpacing: 8
            }
        );
        this.helpText.setOrigin(0.5);
        this.helpText.setDepth(3000);
        this.helpText.setVisible(false);
        
        this.setupKeyboard();
        this.updateContent();
    }
    
    setupKeyboard() {
        // F1 键切换帮助面板
        this.scene.input.keyboard.on('keydown-F1', (event) => {
            event.preventDefault();
            this.toggle();
        });
    }
    
    updateContent() {
        const content = [
            '🎨 绘制功能完整指南',
            '',
            '=== 基础绘制 (4种形状) ===',
            'C - 圆形热区',
            'R - 矩形热区',
            'E - 椭圆热区',
            'P - 多边形热区（点击添加顶点，Enter完成）',
            '',
            '=== 吸附系统 (3种) ===',
            'G - 网格吸附（显示网格线）',
            'S - 智能吸附（吸附到其他热区）',
            '    自动对齐辅助线（紫色线条）',
            '',
            '=== 约束功能 (3种) ===',
            'Shift - 约束比例（矩形→正方形，椭圆→圆形）',
            'Alt - 约束角度（45°增量）',
            'Ctrl - 复制模式',
            '',
            '=== 变换功能 (3种) ===',
            'M - 镜像模式（水平/垂直/关闭）',
            'Q - 逆时针旋转 15°',
            'E - 顺时针旋转 15°',
            '',
            '=== 模板系统 (3种) ===',
            '1 - 小型模板 (50px)',
            '2 - 中型模板 (100px)',
            '3 - 大型模板 (150px)',
            '',
            '=== 辅助显示 (4种) ===',
            'I - 精度信息（距离、角度、比例）',
            'H - 快捷键提示',
            'F1 - 完整帮助（当前面板）',
            '    状态栏（顶部自动显示）',
            '',
            '=== 操作控制 (5种) ===',
            'Space - 重复上次绘制',
            'Backspace - 撤销多边形顶点',
            'ESC - 取消当前绘制',
            'Enter - 完成多边形绘制',
            'Delete - 删除选中热区',
            '',
            '=== 视觉反馈 (8种) ===',
            '• 半透明填充预览',
            '• 实时尺寸/坐标显示',
            '• 十字辅助线',
            '• 完成动画（✓ + 扩散圆圈）',
            '• 取消动画（✗ + 缩放）',
            '• 顶点添加动画（脉冲）',
            '• 吸附指示（紫色圆圈）',
            '• 对齐线（紫色线条）',
            '',
            '=== 音效反馈 (3种) ===',
            '• 完成音效（上升音调）',
            '• 取消音效（下降音调）',
            '• 点击音效（短促音）',
            '注：音效默认关闭',
            '',
            '按 F1 或 ESC 关闭此帮助'
        ];
        
        this.helpText.setText(content.join('\n'));
    }
    
    toggle() {
        this.visible = !this.visible;
        
        if (this.visible) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        this.visible = true;
        
        // 绘制半透明背景
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        this.background.clear();
        this.background.fillStyle(0x000000, 0.8);
        this.background.fillRect(0, 0, width, height);
        this.background.setVisible(true);
        
        this.helpText.setVisible(true);
        
        console.log('📖 帮助面板已打开');
    }
    
    hide() {
        this.visible = false;
        this.background.setVisible(false);
        this.helpText.setVisible(false);
        
        console.log('📖 帮助面板已关闭');
    }
    
    destroy() {
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        
        if (this.helpText) {
            this.scene.input.keyboard.off('keydown-F1');
            this.helpText.destroy();
            this.helpText = null;
        }
    }
}
