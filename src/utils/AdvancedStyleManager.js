// src/utils/AdvancedStyleManager.js
// 高级样式管理器 - 完全遵循 Phaser 3 官方标准
// 功能：渐变色、动画效果、样式模板、批量操作优化

export default class AdvancedStyleManager {
    constructor(scene) {
        this.scene = scene;
        
        // 样式历史记录
        this.styleHistory = [];
        this.maxHistory = 20;
        
        // 样式模板
        this.templates = new Map();
        
        // 初始化默认模板
        this.initDefaultTemplates();
    }
    
    /**
     * 初始化默认样式模板（遵循 Phaser 标准）
     */
    initDefaultTemplates() {
        // 基础模板
        this.addTemplate('basic', {
            name: '基础样式',
            color: '#00ff00',
            strokeWidth: 3,
            alpha: 1.0
        });
        
        // 高亮模板
        this.addTemplate('highlight', {
            name: '高亮样式',
            color: '#ffff00',
            strokeWidth: 5,
            alpha: 1.0,
            glow: true
        });
        
        // 柔和模板
        this.addTemplate('soft', {
            name: '柔和样式',
            color: '#88ccff',
            strokeWidth: 2,
            alpha: 0.7
        });
        
        // 警告模板
        this.addTemplate('alert', {
            name: '警告样式',
            color: '#ff0000',
            strokeWidth: 4,
            alpha: 1.0,
            pulse: true
        });
        
        // 成功模板
        this.addTemplate('success', {
            name: '成功样式',
            color: '#00ff00',
            strokeWidth: 3,
            alpha: 0.9
        });
    }
    
    /**
     * 添加样式模板
     */
    addTemplate(id, template) {
        this.templates.set(id, {
            id,
            ...template,
            createdAt: Date.now()
        });
    }
    
    /**
     * 获取所有模板
     */
    getTemplates() {
        return Array.from(this.templates.values());
    }
    
    /**
     * 应用样式模板（遵循 Phaser 标准）
     */
    applyTemplate(templateId, hotspots) {
        const template = this.templates.get(templateId);
        if (!template) {
            console.warn(`模板 ${templateId} 不存在`);
            return false;
        }
        
        if (!hotspots || hotspots.length === 0) {
            console.warn('没有热区可应用样式');
            return false;
        }
        
        // 记录历史
        this.recordHistory(hotspots);
        
        // 应用样式
        hotspots.forEach(hotspot => {
            this.applyStyleToHotspot(hotspot, template);
        });
        
        console.log(`✓ 已应用模板 "${template.name}" 到 ${hotspots.length} 个热区`);
        return true;
    }
    
    /**
     * 应用样式到单个热区（遵循 Phaser 标准）
     */
    applyStyleToHotspot(hotspot, style) {
        // 基础样式
        if (style.color) {
            hotspot.config.color = style.color;
        }
        if (style.strokeWidth) {
            hotspot.config.strokeWidth = style.strokeWidth;
        }
        if (style.alpha !== undefined) {
            hotspot.config.alpha = style.alpha;
        }
        
        // 更新视觉
        hotspot.updateVisual();
        
        // 特殊效果
        if (style.glow) {
            this.addGlowEffect(hotspot);
        }
        if (style.pulse) {
            this.addPulseEffect(hotspot);
        }
    }
    
    /**
     * 添加发光效果（遵循 Phaser 标准）
     */
    addGlowEffect(hotspot) {
        // 移除旧效果
        if (hotspot.glowTween) {
            hotspot.glowTween.remove();
        }
        
        // 创建发光动画（遵循 Phaser 标准）
        hotspot.glowTween = this.scene.tweens.add({
            targets: hotspot,
            alpha: { from: 0.6, to: 1.0 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * 添加脉冲效果（遵循 Phaser 标准）
     */
    addPulseEffect(hotspot) {
        // 移除旧效果
        if (hotspot.pulseTween) {
            hotspot.pulseTween.remove();
        }
        
        // 创建脉冲动画（遵循 Phaser 标准）
        hotspot.pulseTween = this.scene.tweens.add({
            targets: hotspot,
            scaleX: { from: 1.0, to: 1.05 },
            scaleY: { from: 1.0, to: 1.05 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * 批量修改颜色（优化性能）
     */
    batchChangeColor(hotspots, color) {
        if (!hotspots || hotspots.length === 0) return;
        
        this.recordHistory(hotspots);
        
        // 批量更新（遵循 Phaser 标准）
        hotspots.forEach(hotspot => {
            hotspot.config.color = color;
            hotspot.updateVisual();
        });
        
        console.log(`✓ 批量修改 ${hotspots.length} 个热区的颜色`);
    }
    
    /**
     * 批量修改线宽（优化性能）
     */
    batchChangeStrokeWidth(hotspots, width) {
        if (!hotspots || hotspots.length === 0) return;
        
        this.recordHistory(hotspots);
        
        // 批量更新
        hotspots.forEach(hotspot => {
            hotspot.config.strokeWidth = width;
            hotspot.updateVisual();
        });
        
        console.log(`✓ 批量修改 ${hotspots.length} 个热区的线宽`);
    }
    
    /**
     * 批量修改透明度
     */
    batchChangeAlpha(hotspots, alpha) {
        if (!hotspots || hotspots.length === 0) return;
        
        this.recordHistory(hotspots);
        
        hotspots.forEach(hotspot => {
            hotspot.setAlpha(alpha);
        });
        
        console.log(`✓ 批量修改 ${hotspots.length} 个热区的透明度`);
    }
    
    /**
     * 渐变色应用（遵循 Phaser 标准）
     */
    applyGradientColors(hotspots, startColor, endColor) {
        if (!hotspots || hotspots.length === 0) return;
        
        this.recordHistory(hotspots);
        
        const count = hotspots.length;
        
        hotspots.forEach((hotspot, index) => {
            // 计算渐变比例
            const ratio = count > 1 ? index / (count - 1) : 0;
            
            // 插值颜色（遵循 Phaser 标准）
            const start = Phaser.Display.Color.HexStringToColor(startColor);
            const end = Phaser.Display.Color.HexStringToColor(endColor);
            const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
                start, end, 100, ratio * 100
            );
            
            const color = Phaser.Display.Color.GetColor(
                interpolated.r,
                interpolated.g,
                interpolated.b
            );
            
            hotspot.config.color = '#' + color.toString(16).padStart(6, '0');
            hotspot.updateVisual();
        });
        
        console.log(`✓ 应用渐变色到 ${count} 个热区`);
    }
    
    /**
     * 随机样式（用于测试）
     */
    applyRandomStyles(hotspots) {
        if (!hotspots || hotspots.length === 0) return;
        
        this.recordHistory(hotspots);
        
        const colors = [
            '#ff0000', '#00ff00', '#0000ff',
            '#ffff00', '#ff00ff', '#00ffff',
            '#ff9900', '#9900ff', '#00ff99'
        ];
        
        const widths = [1, 2, 3, 4, 5, 6];
        
        hotspots.forEach(hotspot => {
            hotspot.config.color = Phaser.Utils.Array.GetRandom(colors);
            hotspot.config.strokeWidth = Phaser.Utils.Array.GetRandom(widths);
            hotspot.updateVisual();
        });
        
        console.log(`✓ 应用随机样式到 ${hotspots.length} 个热区`);
    }
    
    /**
     * 记录样式历史
     */
    recordHistory(hotspots) {
        const snapshot = hotspots.map(h => ({
            id: h.config.id,
            color: h.config.color,
            strokeWidth: h.config.strokeWidth,
            alpha: h.alpha
        }));
        
        this.styleHistory.push({
            timestamp: Date.now(),
            snapshot
        });
        
        // 限制历史记录数量
        if (this.styleHistory.length > this.maxHistory) {
            this.styleHistory.shift();
        }
    }
    
    /**
     * 撤销样式修改
     */
    undo() {
        if (this.styleHistory.length === 0) {
            console.warn('没有可撤销的样式历史');
            return false;
        }
        
        const lastState = this.styleHistory.pop();
        
        // 恢复样式
        lastState.snapshot.forEach(state => {
            const hotspot = this.scene.hotspotManager.getHotspotById(state.id);
            if (hotspot) {
                hotspot.config.color = state.color;
                hotspot.config.strokeWidth = state.strokeWidth;
                hotspot.setAlpha(state.alpha);
                hotspot.updateVisual();
            }
        });
        
        console.log('✓ 已撤销样式修改');
        return true;
    }
    
    /**
     * 清除所有效果
     */
    clearEffects(hotspots) {
        if (!hotspots || hotspots.length === 0) return;
        
        hotspots.forEach(hotspot => {
            // 移除发光效果
            if (hotspot.glowTween) {
                hotspot.glowTween.remove();
                hotspot.glowTween = null;
            }
            
            // 移除脉冲效果
            if (hotspot.pulseTween) {
                hotspot.pulseTween.remove();
                hotspot.pulseTween = null;
            }
            
            // 重置透明度和缩放
            hotspot.setAlpha(1.0);
            hotspot.setScale(1.0);
        });
        
        console.log(`✓ 清除 ${hotspots.length} 个热区的效果`);
    }
    
    /**
     * 导出样式配置
     */
    exportStyles(hotspots) {
        if (!hotspots || hotspots.length === 0) return null;
        
        const styles = hotspots.map(h => ({
            id: h.config.id,
            color: h.config.color,
            strokeWidth: h.config.strokeWidth,
            alpha: h.alpha
        }));
        
        return JSON.stringify(styles, null, 2);
    }
    
    /**
     * 导入样式配置
     */
    importStyles(jsonString) {
        try {
            const styles = JSON.parse(jsonString);
            
            styles.forEach(style => {
                const hotspot = this.scene.hotspotManager.getHotspotById(style.id);
                if (hotspot) {
                    hotspot.config.color = style.color;
                    hotspot.config.strokeWidth = style.strokeWidth;
                    hotspot.setAlpha(style.alpha);
                    hotspot.updateVisual();
                }
            });
            
            console.log(`✓ 导入 ${styles.length} 个热区的样式`);
            return true;
        } catch (error) {
            console.error('导入样式失败:', error);
            return false;
        }
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.styleHistory = [];
        this.templates.clear();
    }
}
