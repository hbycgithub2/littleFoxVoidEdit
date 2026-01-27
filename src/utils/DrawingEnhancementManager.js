// src/utils/DrawingEnhancementManager.js
// 绘制增强功能管理器 - 遵循 Phaser 3 官方标准

export default class DrawingEnhancementManager {
    constructor(scene) {
        this.scene = scene;
        
        // 功能开关
        this.mirrorMode = null; // 'horizontal' | 'vertical' | null
        this.rotationAngle = 0; // 旋转角度
        this.copyMode = false; // 复制模式
        
        // 创建提示文本（遵循 Phaser 官方标准）
        this.enhancementText = scene.add.text(10, 80, '', {
            fontSize: '12px',
            color: '#ff00ff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.enhancementText.setDepth(2000);
        this.enhancementText.setVisible(false);
        
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听
     */
    setupKeyboard() {
        // M 键 - 切换镜像模式
        this.scene.input.keyboard.on('keydown-M', () => {
            this.toggleMirrorMode();
        });
        
        // Q/E 键 - 旋转
        this.scene.input.keyboard.on('keydown-Q', () => {
            this.rotate(-15);
        });
        
        this.scene.input.keyboard.on('keydown-E', () => {
            this.rotate(15);
        });
        
        // Ctrl 键状态监听
        this.scene.input.keyboard.on('keydown-CTRL', () => {
            this.copyMode = true;
            this.updateHint();
        });
        
        this.scene.input.keyboard.on('keyup-CTRL', () => {
            this.copyMode = false;
            this.updateHint();
        });
    }
    
    /**
     * 切换镜像模式
     */
    toggleMirrorMode() {
        if (!this.mirrorMode) {
            this.mirrorMode = 'horizontal';
        } else if (this.mirrorMode === 'horizontal') {
            this.mirrorMode = 'vertical';
        } else {
            this.mirrorMode = null;
        }
        
        this.updateHint();
        
        const modeText = this.mirrorMode === 'horizontal' ? '水平镜像' : 
                        this.mirrorMode === 'vertical' ? '垂直镜像' : '关闭';
        console.log(`🪞 镜像模式: ${modeText}`);
    }
    
    /**
     * 旋转
     * @param {number} angle - 旋转角度
     */
    rotate(angle) {
        this.rotationAngle = (this.rotationAngle + angle) % 360;
        if (this.rotationAngle < 0) this.rotationAngle += 360;
        
        this.updateHint();
        console.log(`🔄 旋转角度: ${this.rotationAngle}°`);
    }
    
    /**
     * 重置旋转
     */
    resetRotation() {
        this.rotationAngle = 0;
        this.updateHint();
    }
    
    /**
     * 应用增强功能到热区配置
     * @param {object} config - 热区配置
     * @returns {object} 增强后的配置
     */
    applyEnhancements(config) {
        // 应用镜像
        if (this.mirrorMode) {
            config = this.applyMirror(config);
        }
        
        // 应用旋转
        if (this.rotationAngle !== 0) {
            config.rotation = this.rotationAngle * Math.PI / 180;
        }
        
        return config;
    }
    
    /**
     * 应用镜像
     * @private
     */
    applyMirror(config) {
        if (this.mirrorMode === 'horizontal') {
            // 水平镜像：翻转 X 坐标
            if (config.shape === 'rect' || config.shape === 'ellipse') {
                config.scaleX = -1;
            }
        } else if (this.mirrorMode === 'vertical') {
            // 垂直镜像：翻转 Y 坐标
            if (config.shape === 'rect' || config.shape === 'ellipse') {
                config.scaleY = -1;
            }
        }
        
        return config;
    }
    
    /**
     * 更新提示
     */
    updateHint() {
        const hints = [];
        
        if (this.copyMode) {
            hints.push('📋 复制模式');
        }
        
        if (this.mirrorMode) {
            const mode = this.mirrorMode === 'horizontal' ? '水平' : '垂直';
            hints.push(`🪞 ${mode}镜像`);
        }
        
        if (this.rotationAngle !== 0) {
            hints.push(`🔄 旋转 ${this.rotationAngle}°`);
        }
        
        if (hints.length > 0) {
            this.enhancementText.setText(hints.join(' | '));
            this.enhancementText.setVisible(true);
        } else {
            this.enhancementText.setVisible(false);
        }
    }
    
    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            mirrorMode: this.mirrorMode,
            rotationAngle: this.rotationAngle,
            copyMode: this.copyMode
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.enhancementText) {
            this.scene.input.keyboard.off('keydown-M');
            this.scene.input.keyboard.off('keydown-Q');
            this.scene.input.keyboard.off('keydown-E');
            this.scene.input.keyboard.off('keydown-CTRL');
            this.scene.input.keyboard.off('keyup-CTRL');
            this.enhancementText.destroy();
            this.enhancementText = null;
        }
    }
}
