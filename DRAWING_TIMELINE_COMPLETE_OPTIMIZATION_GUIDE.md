# 绘图与时间轴完整优化指南

## 📋 目录
1. [优化方案总览](#优化方案总览)
2. [详细执行步骤](#详细执行步骤)
3. [技术实现规范](#技术实现规范)
4. [测试验证清单](#测试验证清单)

---

## 优化方案总览

### 🎯 核心优化目标
**提升绘图和时间控制的效率，减少重复操作，优化工作流程**

### 📊 优化方案分类

#### A类：时间控制优化（最高优先级）⭐⭐⭐⭐⭐
1. **绘制时按数字键预设时长**
2. **快捷键快速设置时间**
3. **绘制完成后立即可调时间**
4. **时间轴直接创建热区**

#### B类：交互体验优化（高优先级）⭐⭐⭐⭐
5. **时间轴磁性吸附**
6. **批量时间调整**
7. **时间范围复制粘贴**
8. **方向键微调时间**

#### C类：高级功能（中优先级）⭐⭐⭐
9. **绘制模板系统**
10. **智能时长建议**
11. **时间轴可视化增强**
12. **热区时间冲突检测**

---

## 详细执行步骤

### 阶段1：时间预设系统（A1）

#### 功能描述
绘制时按住数字键1-9，直接设置热区时长（1-9秒），默认5秒

#### 执行步骤

**步骤1.1：创建时间预设辅助类**

```javascript
// 文件位置：src/utils/DrawingTimePresetHelper.js
// 完全遵循 Phaser 3 官方标准

export default class DrawingTimePresetHelper {
    constructor(scene) {
        this.scene = scene;
        this.currentPreset = 5; // 默认5秒
        this.isActive = false;
        
        // 创建显示文本（遵循 Phaser 标准）
        this.presetText = scene.add.text(10, 10, '', {
            fontSize: '16px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.presetText.setDepth(1003);
        this.presetText.setScrollFactor(0);
        this.presetText.setVisible(false);
        
        this.setupKeyboard();
    }
    
    setupKeyboard() {
        // 监听数字键1-9（遵循 Phaser 标准）
        for (let i = 1; i <= 9; i++) {
            this.scene.input.keyboard.on(`keydown-${i}`, () => {
                this.setPreset(i);
            });
        }
        
        // 监听0键重置为默认5秒
        this.scene.input.keyboard.on('keydown-0', () => {
            this.setPreset(5);
        });
    }
    
    setPreset(seconds) {
        this.currentPreset = seconds;
        this.isActive = true;
        this.showPreset();
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('drawing:presetChanged', seconds);
        
        console.log(`⏱️ 时长预设: ${seconds}秒`);
    }
    
    showPreset() {
        this.presetText.setText(`时长: ${this.currentPreset}秒`);
        this.presetText.setVisible(true);
        
        // 3秒后自动隐藏
        this.scene.time.delayedCall(3000, () => {
            this.presetText.setVisible(false);
        });
    }
    
    getPreset() {
        return this.currentPreset;
    }
    
    reset() {
        this.currentPreset = 5;
        this.isActive = false;
        this.presetText.setVisible(false);
    }
    
    destroy() {
        if (this.presetText) {
            this.presetText.destroy();
        }
    }
}
```

**步骤1.2：集成到DrawingManager**

修改文件：`src/phaser/managers/DrawingManager.js`

在构造函数中添加：
```javascript
// 导入时间预设辅助类
import DrawingTimePresetHelper from '../../utils/DrawingTimePresetHelper.js';

// 在构造函数中初始化
this.timePresetHelper = new DrawingTimePresetHelper(scene);
```

在`createHotspotConfig`方法中修改：
```javascript
createHotspotConfig(startX, startY, width, height) {
    const videoTime = this.scene.registry.get('videoTime') || 0;
    
    // 使用预设时长（如果有）
    const duration = this.timePresetHelper.getPreset();
    
    const config = {
        id: Date.now(),
        shape: this.drawMode,
        color: '#00ff00',
        strokeWidth: 3,
        word: '',
        startTime: videoTime,
        endTime: videoTime + duration  // 使用预设时长
    };
    
    // ... 其余代码保持不变
}
```

在`destroy`方法中添加：
```javascript
if (this.timePresetHelper) {
    this.timePresetHelper.destroy();
    this.timePresetHelper = null;
}
```

**步骤1.3：测试验证**
- [ ] 绘制时按1-9键，检查是否显示时长提示
- [ ] 绘制完成后，检查热区时长是否正确
- [ ] 按0键重置为5秒，验证是否生效
- [ ] 检查控制台日志是否正确输出

---

### 阶段2：快捷键时间设置（A2）

#### 功能描述
- `T` - 设置开始时间为当前视频时间
- `Shift+T` - 设置结束时间为当前视频时间
- `Ctrl+T` - 一键设置为当前片段（开始=当前，结束=当前+5秒）

#### 执行步骤

**步骤2.1：创建快捷键时间辅助类**

```javascript
// 文件位置：src/utils/TimelineQuickTimeHelper.js
// 完全遵循 Phaser 3 官方标准

import { ModifyHotspotCommand } from '../core/CommandManager.js';

export default class TimelineQuickTimeHelper {
    constructor(scene) {
        this.scene = scene;
        this.setupKeyboard();
    }
    
    setupKeyboard() {
        // T键 - 设置开始时间
        this.scene.input.keyboard.on('keydown-T', (event) => {
            if (event.shiftKey) {
                // Shift+T - 设置结束时间
                this.setEndTime();
            } else if (event.ctrlKey || event.metaKey) {
                // Ctrl+T - 设置为当前片段
                this.setCurrentSegment();
            } else {
                // T - 设置开始时间
                this.setStartTime();
            }
        });
    }
    
    setStartTime() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            return;
        }
        
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        selected.forEach(hotspot => {
            const oldValue = hotspot.config.startTime;
            const newValue = parseFloat(videoTime.toFixed(1));
            
            // 边界检查：开始时间不应大于结束时间
            if (newValue > hotspot.config.endTime) {
                console.warn(`⚠️ 开始时间 ${newValue}s 大于结束时间 ${hotspot.config.endTime}s`);
                return;
            }
            
            // 使用命令模式（支持撤销）
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'startTime',
                oldValue,
                newValue
            );
            this.scene.commandManager.execute(command);
        });
        
        console.log(`📍 设置开始时间: ${videoTime.toFixed(1)}s`);
        this.showFeedback('开始时间已设置');
    }
    
    setEndTime() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            return;
        }
        
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        selected.forEach(hotspot => {
            const oldValue = hotspot.config.endTime;
            const newValue = parseFloat(videoTime.toFixed(1));
            
            // 边界检查：结束时间不应小于开始时间
            if (newValue < hotspot.config.startTime) {
                console.warn(`⚠️ 结束时间 ${newValue}s 小于开始时间 ${hotspot.config.startTime}s`);
                return;
            }
            
            // 使用命令模式（支持撤销）
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                oldValue,
                newValue
            );
            this.scene.commandManager.execute(command);
        });
        
        console.log(`📍 设置结束时间: ${videoTime.toFixed(1)}s`);
        this.showFeedback('结束时间已设置');
    }
    
    setCurrentSegment() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            return;
        }
        
        const videoTime = this.scene.registry.get('videoTime') || 0;
        const startTime = parseFloat(videoTime.toFixed(1));
        const endTime = parseFloat((videoTime + 5).toFixed(1));
        
        selected.forEach(hotspot => {
            // 设置开始时间
            const startCommand = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'startTime',
                hotspot.config.startTime,
                startTime
            );
            this.scene.commandManager.execute(startCommand);
            
            // 设置结束时间
            const endCommand = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                hotspot.config.endTime,
                endTime
            );
            this.scene.commandManager.execute(endCommand);
        });
        
        console.log(`📍 设置为当前片段: ${startTime}s - ${endTime}s`);
        this.showFeedback(`片段已设置: ${startTime}s - ${endTime}s`);
    }
    
    showFeedback(message) {
        // 使用场景的事件系统显示反馈（遵循 Phaser 标准）
        this.scene.events.emit('ui:showToast', {
            message: message,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    destroy() {
        // 移除键盘监听
        this.scene.input.keyboard.off('keydown-T');
    }
}
```

**步骤2.2：集成到EditorScene**

修改文件：`src/phaser/scenes/EditorScene.js`

在`create`方法中添加：
```javascript
// 导入快捷键时间辅助类
import TimelineQuickTimeHelper from '../../utils/TimelineQuickTimeHelper.js';

// 在create方法中初始化
this.timelineQuickTimeHelper = new TimelineQuickTimeHelper(this);
```

在`shutdown`方法中添加：
```javascript
if (this.timelineQuickTimeHelper) {
    this.timelineQuickTimeHelper.destroy();
}
```

**步骤2.3：测试验证**
- [ ] 选中热区，按T键，检查开始时间是否更新
- [ ] 选中热区，按Shift+T，检查结束时间是否更新
- [ ] 选中热区，按Ctrl+T，检查是否设置为当前片段
- [ ] 测试边界情况（开始>结束，结束<开始）
- [ ] 测试多选情况

---

### 阶段3：绘制完成后立即可调时间（A3）

#### 功能描述
绘制完成后，时间轴上的时间条自动闪烁高亮，可用方向键微调时间

#### 执行步骤

**步骤3.1：创建时间条高亮控制器**

```javascript
// 文件位置：src/dom/timeline/TimelineHighlightController.js
// 完全遵循 Phaser 3 官方标准

export default class TimelineHighlightController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        this.highlightedHotspotId = null;
        this.flashCount = 0;
        this.maxFlashes = 6;
        this.flashTimer = null;
        
        this.setupEvents();
    }
    
    setupEvents() {
        // 监听热区添加事件
        this.scene.events.on('hotspot:added', (hotspot) => {
            this.highlightHotspot(hotspot.config.id);
        });
        
        // 监听键盘事件（方向键微调）
        this.keydownHandler = (e) => {
            if (!this.highlightedHotspotId) return;
            
            this.handleKeyDown(e);
        };
        
        window.addEventListener('keydown', this.keydownHandler);
    }
    
    highlightHotspot(hotspotId) {
        this.highlightedHotspotId = hotspotId;
        this.flashCount = 0;
        
        // 开始闪烁动画
        this.startFlashing();
        
        // 显示提示
        this.showHint();
        
        console.log(`✨ 高亮热区: ${hotspotId}`);
    }
    
    startFlashing() {
        if (this.flashTimer) {
            clearInterval(this.flashTimer);
        }
        
        this.flashTimer = setInterval(() => {
            this.flashCount++;
            this.timeline.render();
            
            if (this.flashCount >= this.maxFlashes) {
                this.stopFlashing();
            }
        }, 200);
    }
    
    stopFlashing() {
        if (this.flashTimer) {
            clearInterval(this.flashTimer);
            this.flashTimer = null;
        }
        this.highlightedHotspotId = null;
        this.timeline.render();
    }
    
    showHint() {
        // 发送事件显示提示（遵循 Phaser 标准）
        this.scene.events.emit('ui:showToast', {
            message: '使用 ←→ 调整开始时间，Shift+←→ 调整结束时间，Enter 确认',
            duration: 5000,
            color: '#2196F3'
        });
    }
    
    handleKeyDown(e) {
        const hotspots = this.scene.registry.get('hotspots') || [];
        const hotspot = hotspots.find(h => h.id === this.highlightedHotspotId);
        
        if (!hotspot) return;
        
        const step = 0.1; // 0.1秒步进
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift+← 减少结束时间
                    this.adjustEndTime(hotspot, -step);
                } else {
                    // ← 减少开始时间
                    this.adjustStartTime(hotspot, -step);
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift+→ 增加结束时间
                    this.adjustEndTime(hotspot, step);
                } else {
                    // → 增加开始时间
                    this.adjustStartTime(hotspot, step);
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                this.stopFlashing();
                console.log('✅ 时间调整完成');
                break;
                
            case 'Escape':
                e.preventDefault();
                this.stopFlashing();
                console.log('❌ 取消时间调整');
                break;
        }
    }
    
    adjustStartTime(hotspot, delta) {
        const newTime = Math.max(0, hotspot.startTime + delta);
        
        // 边界检查
        if (newTime >= hotspot.endTime) {
            console.warn('⚠️ 开始时间不能大于等于结束时间');
            return;
        }
        
        // 发送事件更新（遵循 Phaser 标准）
        this.scene.events.emit('hotspot:updateTime', {
            hotspotId: hotspot.id,
            property: 'startTime',
            oldValue: hotspot.startTime,
            newValue: parseFloat(newTime.toFixed(1))
        });
        
        console.log(`⏪ 开始时间: ${newTime.toFixed(1)}s`);
    }
    
    adjustEndTime(hotspot, delta) {
        const newTime = hotspot.endTime + delta;
        
        // 边界检查
        if (newTime <= hotspot.startTime) {
            console.warn('⚠️ 结束时间不能小于等于开始时间');
            return;
        }
        
        // 发送事件更新（遵循 Phaser 标准）
        this.scene.events.emit('hotspot:updateTime', {
            hotspotId: hotspot.id,
            property: 'endTime',
            oldValue: hotspot.endTime,
            newValue: parseFloat(newTime.toFixed(1))
        });
        
        console.log(`⏩ 结束时间: ${newTime.toFixed(1)}s`);
    }
    
    drawHighlight(ctx) {
        if (!this.highlightedHotspotId) return;
        
        // 闪烁效果（偶数次显示）
        if (this.flashCount % 2 === 0) return;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const hotspot = hotspots.find(h => h.id === this.highlightedHotspotId);
        
        if (!hotspot) return;
        
        const startX = hotspot.startTime * this.timeline.scale;
        const endX = hotspot.endTime * this.timeline.scale;
        const width = endX - startX;
        
        // 找到热区在时间轴上的Y位置
        const y = this.timeline.layerGroupController.getHotspotY(hotspot);
        
        if (y === null) return;
        
        // 绘制高亮边框
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(startX, y, width, 20);
        
        // 绘制半透明覆盖
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(startX, y, width, 20);
    }
    
    destroy() {
        this.stopFlashing();
        
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.scene.events.off('hotspot:added');
    }
}
```

**步骤3.2：集成到TimelinePanel**

修改文件：`src/dom/TimelinePanel.js`

在`init`方法中添加：
```javascript
// 导入高亮控制器
import TimelineHighlightController from './timeline/TimelineHighlightController.js';

// 初始化高亮控制器
this.highlightController = new TimelineHighlightController(this);
```

在`render`方法中添加（在绘制选中高亮之后）：
```javascript
// 绘制高亮闪烁效果
if (this.highlightController) {
    this.virtualScrollController.applyScroll(this.ctx);
    this.highlightController.drawHighlight(this.ctx);
    this.virtualScrollController.restoreScroll(this.ctx);
}
```

在`destroy`方法中添加：
```javascript
if (this.highlightController) {
    this.highlightController.destroy();
    this.highlightController = null;
}
```

**步骤3.3：处理时间更新事件**

在EditorScene中添加事件监听：
```javascript
// 在setupEvents方法中添加
this.events.on('hotspot:updateTime', (data) => {
    const hotspot = this.hotspots.find(h => h.config.id === data.hotspotId);
    if (!hotspot) return;
    
    // 使用命令模式更新（支持撤销）
    const command = new ModifyHotspotCommand(
        this,
        data.hotspotId,
        data.property,
        data.oldValue,
        data.newValue
    );
    this.commandManager.execute(command);
});
```

**步骤3.4：测试验证**
- [ ] 绘制热区后，检查时间条是否闪烁
- [ ] 按←→键，检查开始时间是否调整
- [ ] 按Shift+←→，检查结束时间是否调整
- [ ] 按Enter，检查是否停止闪烁
- [ ] 按Escape，检查是否取消
- [ ] 测试边界情况（时间不能小于0，开始<结束）

---

### 阶段4：时间轴直接创建热区（A4）

#### 功能描述
按住Alt键在时间轴上拖拽，直接创建时间范围，自动在画面中心生成热区

#### 执行步骤

**步骤4.1：创建时间轴直接创建控制器**


```javascript
// 文件位置：src/dom/timeline/TimelineDirectCreateController.js
// 完全遵循 Phaser 3 官方标准

import { AddHotspotCommand } from '../../core/CommandManager.js';

export default class TimelineDirectCreateController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragCurrentX = 0;
        this.previewStartTime = 0;
        this.previewEndTime = 0;
    }
    
    /**
     * 检测是否按住Alt键并在时间轴上拖拽
     */
    handleMouseDown(x, y, altKey) {
        if (!altKey) return false;
        
        // 检查是否在时间轴区域（排除时间刻度区域）
        if (y < 30) return false;
        
        this.isDragging = true;
        this.dragStartX = x;
        this.dragCurrentX = x;
        
        // 计算时间
        this.previewStartTime = x / this.timeline.scale;
        this.previewEndTime = this.previewStartTime;
        
        console.log('🎬 开始在时间轴上创建热区');
        return true;
    }
    
    /**
     * 更新拖拽预览
     */
    handleMouseMove(x, y) {
        if (!this.isDragging) return false;
        
        this.dragCurrentX = x;
        
        // 计算时间范围
        const startX = Math.min(this.dragStartX, this.dragCurrentX);
        const endX = Math.max(this.dragStartX, this.dragCurrentX);
        
        this.previewStartTime = startX / this.timeline.scale;
        this.previewEndTime = endX / this.timeline.scale;
        
        // 最小时长0.5秒
        if (this.previewEndTime - this.previewStartTime < 0.5) {
            this.previewEndTime = this.previewStartTime + 0.5;
        }
        
        // 触发重绘
        this.timeline.render();
        
        return true;
    }
    
    /**
     * 完成拖拽，创建热区
     */
    handleMouseUp() {
        if (!this.isDragging) return false;
        
        this.isDragging = false;
        
        // 检查时长是否足够
        const duration = this.previewEndTime - this.previewStartTime;
        if (duration < 0.5) {
            console.warn('⚠️ 时间范围太短，最小0.5秒');
            this.timeline.render();
            return true;
        }
        
        // 创建热区
        this.createHotspot();
        
        // 清除预览
        this.timeline.render();
        
        return true;
    }
    
    /**
     * 创建热区（在画面中心）
     */
    createHotspot() {
        // 获取上次使用的形状类型
        const lastShape = this.scene.drawingManager.lastDrawMode || 'rect';
        
        // 获取画面中心位置
        const centerX = this.scene.game.config.width / 2;
        const centerY = this.scene.game.config.height / 2;
        
        // 默认尺寸
        const defaultSize = 100;
        
        // 创建配置
        const config = {
            id: Date.now(),
            shape: lastShape,
            color: '#00ff00',
            strokeWidth: 3,
            word: '',
            startTime: parseFloat(this.previewStartTime.toFixed(1)),
            endTime: parseFloat(this.previewEndTime.toFixed(1)),
            x: centerX,
            y: centerY
        };
        
        // 根据形状添加尺寸属性
        switch (lastShape) {
            case 'circle':
                config.radius = defaultSize / 2;
                break;
            case 'rect':
                config.width = defaultSize;
                config.height = defaultSize;
                break;
            case 'ellipse':
                config.radiusX = defaultSize / 2;
                config.radiusY = defaultSize / 2;
                break;
        }
        
        // 使用命令模式添加热区（遵循 Phaser 标准）
        const command = new AddHotspotCommand(this.scene, config);
        this.scene.commandManager.execute(command);
        
        console.log(`✅ 在时间轴创建热区: ${this.previewStartTime.toFixed(1)}s - ${this.previewEndTime.toFixed(1)}s`);
        
        // 显示提示
        this.scene.events.emit('ui:showToast', {
            message: '热区已创建，可在画面中调整位置和大小',
            duration: 3000,
            color: '#4CAF50'
        });
    }
    
    /**
     * 绘制预览
     */
    drawPreview(ctx) {
        if (!this.isDragging) return;
        
        const startX = Math.min(this.dragStartX, this.dragCurrentX);
        const endX = Math.max(this.dragStartX, this.dragCurrentX);
        const width = endX - startX;
        
        // 绘制预览条（在时间轴底部）
        const y = this.timeline.canvas.height - 40;
        const height = 30;
        
        // 半透明背景
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.fillRect(startX, y, width, height);
        
        // 边框
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, y, width, height);
        
        // 显示时长
        const duration = this.previewEndTime - this.previewStartTime;
        const text = `${duration.toFixed(1)}s`;
        
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, startX + width / 2, y + height / 2 + 5);
        
        // 显示提示
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('松开鼠标创建热区', startX, y - 5);
    }
    
    /**
     * 取消拖拽
     */
    cancel() {
        if (this.isDragging) {
            this.isDragging = false;
            this.timeline.render();
        }
    }
    
    destroy() {
        this.cancel();
    }
}
```

**步骤4.2：集成到TimelinePanel**

修改文件：`src/dom/TimelinePanel.js`

在`init`方法中添加：
```javascript
// 导入直接创建控制器
import TimelineDirectCreateController from './timeline/TimelineDirectCreateController.js';

// 初始化直接创建控制器
this.directCreateController = new TimelineDirectCreateController(this);
```

在`onMouseDown`方法中添加（在最前面）：
```javascript
onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 优先检测Alt+拖拽创建
    if (this.directCreateController.handleMouseDown(x, y, e.altKey)) {
        return;
    }
    
    // ... 其余代码保持不变
}
```

在`onMouseMove`方法中添加：
```javascript
onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 处理直接创建拖拽
    if (this.directCreateController.handleMouseMove(x, y)) {
        return;
    }
    
    // ... 其余代码保持不变
}
```

在`onMouseUp`方法中添加：
```javascript
onMouseUp() {
    // 处理直接创建完成
    if (this.directCreateController.handleMouseUp()) {
        return;
    }
    
    // ... 其余代码保持不变
}
```

在`render`方法中添加（在最后）：
```javascript
// 绘制直接创建预览
if (this.directCreateController) {
    this.directCreateController.drawPreview(this.ctx);
}
```

在`destroy`方法中添加：
```javascript
if (this.directCreateController) {
    this.directCreateController.destroy();
    this.directCreateController = null;
}
```

**步骤4.3：测试验证**
- [ ] 按住Alt键在时间轴上拖拽，检查是否显示预览
- [ ] 释放鼠标，检查是否在画面中心创建热区
- [ ] 检查热区的时间范围是否正确
- [ ] 测试最小时长限制（0.5秒）
- [ ] 检查是否使用上次的形状类型

---

### 阶段5：时间轴磁性吸附（B5）

#### 功能描述
拖拽时间条时，自动吸附到其他热区的开始/结束时间，显示吸附线提示

#### 执行步骤

**步骤5.1：增强TimelineSnapController**

修改文件：`src/dom/timeline/TimelineSnapController.js`

添加磁性吸附功能：
```javascript
/**
 * 检测磁性吸附点
 * @param {number} time - 当前时间
 * @param {string} excludeId - 排除的热区ID（正在拖拽的热区）
 * @returns {object} 吸附结果 {snapped: boolean, time: number, type: string}
 */
findMagneticSnapPoint(time, excludeId = null) {
    if (!this.enabled) {
        return { snapped: false, time: time };
    }
    
    const hotspots = this.timeline.scene.registry.get('hotspots') || [];
    const snapDistance = 0.2; // 0.2秒吸附距离
    
    let closestSnap = null;
    let minDistance = snapDistance;
    
    // 检查所有热区的开始和结束时间
    hotspots.forEach(hotspot => {
        if (hotspot.id === excludeId) return;
        
        // 检查开始时间
        const startDist = Math.abs(time - hotspot.startTime);
        if (startDist < minDistance) {
            minDistance = startDist;
            closestSnap = {
                snapped: true,
                time: hotspot.startTime,
                type: 'start',
                hotspotId: hotspot.id
            };
        }
        
        // 检查结束时间
        const endDist = Math.abs(time - hotspot.endTime);
        if (endDist < minDistance) {
            minDistance = endDist;
            closestSnap = {
                snapped: true,
                time: hotspot.endTime,
                type: 'end',
                hotspotId: hotspot.id
            };
        }
    });
    
    // 检查整秒位置
    const roundedTime = Math.round(time);
    const roundDist = Math.abs(time - roundedTime);
    if (roundDist < minDistance) {
        minDistance = roundDist;
        closestSnap = {
            snapped: true,
            time: roundedTime,
            type: 'second'
        };
    }
    
    return closestSnap || { snapped: false, time: time };
}

/**
 * 绘制磁性吸附线
 */
drawMagneticSnapLine(ctx, snapResult) {
    if (!snapResult || !snapResult.snapped) return;
    
    const x = snapResult.time * this.timeline.scale;
    const canvasHeight = this.timeline.canvas.height;
    
    // 绘制吸附线
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制标签
    let label = '';
    switch (snapResult.type) {
        case 'start':
            label = '开始';
            break;
        case 'end':
            label = '结束';
            break;
        case 'second':
            label = `${snapResult.time}s`;
            break;
    }
    
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, 25);
}
```

**步骤5.2：集成到TimelineDragController**

修改文件：`src/dom/timeline/TimelineDragController.js`

在拖拽时应用磁性吸附：
```javascript
drag(x) {
    if (!this.isDragging || !this.dragTarget) return;
    
    const deltaX = x - this.dragStartX;
    const deltaTime = deltaX / this.timeline.scale;
    
    if (this.dragTarget.handle === 'body') {
        // 拖拽整个时间条
        let newStartTime = this.dragStartTime + deltaTime;
        
        // 应用磁性吸附
        const snapResult = this.timeline.snapController.findMagneticSnapPoint(
            newStartTime,
            this.dragTarget.hotspot.id
        );
        
        if (snapResult.snapped) {
            newStartTime = snapResult.time;
            this.currentSnapResult = snapResult;
        } else {
            this.currentSnapResult = null;
        }
        
        // ... 其余代码
    } else if (this.dragTarget.handle === 'start') {
        // 拖拽开始手柄
        let newStartTime = this.dragStartTime + deltaTime;
        
        // 应用磁性吸附
        const snapResult = this.timeline.snapController.findMagneticSnapPoint(
            newStartTime,
            this.dragTarget.hotspot.id
        );
        
        if (snapResult.snapped) {
            newStartTime = snapResult.time;
            this.currentSnapResult = snapResult;
        } else {
            this.currentSnapResult = null;
        }
        
        // ... 其余代码
    }
    // ... 其余代码
}
```

在`render`方法中绘制吸附线：
```javascript
// 在TimelinePanel的render方法中
if (this.dragController && this.dragController.currentSnapResult) {
    this.snapController.drawMagneticSnapLine(
        this.ctx,
        this.dragController.currentSnapResult
    );
}
```

**步骤5.3：测试验证**
- [ ] 拖拽时间条，检查是否吸附到其他热区
- [ ] 检查是否显示吸附线和标签
- [ ] 测试吸附到开始时间
- [ ] 测试吸附到结束时间
- [ ] 测试吸附到整秒位置
- [ ] 测试吸附距离（0.2秒）

---

### 阶段6：批量时间调整（B6）

#### 功能描述
选中多个热区，拖拽任意一个时间条，其他同步移动

#### 执行步骤

**步骤6.1：增强TimelineDragController**

修改文件：`src/dom/timeline/TimelineDragController.js`

添加批量拖拽支持：
```javascript
drag(x) {
    if (!this.isDragging || !this.dragTarget) return;
    
    const deltaX = x - this.dragStartX;
    const deltaTime = deltaX / this.timeline.scale;
    
    // 检查是否多选
    const selectedIds = this.timeline.selectionController.getSelectedIds();
    const isMultiSelect = selectedIds.size > 1;
    
    if (this.dragTarget.handle === 'body') {
        // 拖拽整个时间条
        let newStartTime = this.dragStartTime + deltaTime;
        const duration = this.dragTarget.hotspot.endTime - this.dragTarget.hotspot.startTime;
        
        // 应用磁性吸附
        const snapResult = this.timeline.snapController.findMagneticSnapPoint(
            newStartTime,
            this.dragTarget.hotspot.id
        );
        
        if (snapResult.snapped) {
            newStartTime = snapResult.time;
            this.currentSnapResult = snapResult;
        } else {
            this.currentSnapResult = null;
        }
        
        const newEndTime = newStartTime + duration;
        
        // 边界检查
        if (newStartTime < 0) {
            newStartTime = 0;
            newEndTime = duration;
        }
        
        // 更新主热区
        this.dragTarget.hotspot.startTime = parseFloat(newStartTime.toFixed(1));
        this.dragTarget.hotspot.endTime = parseFloat(newEndTime.toFixed(1));
        
        // 如果是多选，同步更新其他选中的热区
        if (isMultiSelect) {
            const actualDelta = newStartTime - this.dragStartTime;
            
            selectedIds.forEach(id => {
                if (id === this.dragTarget.hotspot.id) return;
                
                const hotspots = this.timeline.scene.registry.get('hotspots') || [];
                const hotspot = hotspots.find(h => h.id === id);
                
                if (hotspot) {
                    const hotspotDuration = hotspot.endTime - hotspot.startTime;
                    let hotspotNewStart = hotspot.startTime + actualDelta;
                    
                    // 边界检查
                    if (hotspotNewStart < 0) {
                        hotspotNewStart = 0;
                    }
                    
                    hotspot.startTime = parseFloat(hotspotNewStart.toFixed(1));
                    hotspot.endTime = parseFloat((hotspotNewStart + hotspotDuration).toFixed(1));
                }
            });
        }
        
        // 触发重绘
        this.timeline.render();
    }
    // ... 其余代码
}
```

在`endDrag`方法中保存批量修改：
```javascript
endDrag() {
    if (!this.isDragging) return;
    
    const selectedIds = this.timeline.selectionController.getSelectedIds();
    const isMultiSelect = selectedIds.size > 1;
    
    if (isMultiSelect) {
        // 批量更新到registry
        this.timeline.scene.syncToRegistry();
        
        // 发送批量更新事件
        this.timeline.scene.events.emit('hotspot:batchTimeUpdated', {
            hotspotIds: Array.from(selectedIds)
        });
        
        console.log(`✅ 批量调整 ${selectedIds.size} 个热区的时间`);
    } else {
        // 单个更新
        // ... 原有代码
    }
    
    this.isDragging = false;
    this.dragTarget = null;
    this.currentSnapResult = null;
}
```

**步骤6.2：测试验证**
- [ ] 选中多个热区
- [ ] 拖拽其中一个时间条
- [ ] 检查其他热区是否同步移动
- [ ] 检查时间偏移量是否一致
- [ ] 测试边界情况（不能小于0）
- [ ] 检查撤销/重做是否正常

---

### 阶段7：时间范围复制粘贴（B7）

#### 功能描述
- `Ctrl+Shift+C` - 复制时间范围
- `Ctrl+Shift+V` - 粘贴时间范围到选中的热区

#### 执行步骤

**步骤7.1：创建时间范围复制辅助类**


```javascript
// 文件位置：src/utils/TimeRangeCopyHelper.js
// 完全遵循 Phaser 3 官方标准

import { ModifyHotspotCommand } from '../core/CommandManager.js';

export default class TimeRangeCopyHelper {
    constructor(scene) {
        this.scene = scene;
        this.copiedTimeRange = null;
        this.setupKeyboard();
    }
    
    setupKeyboard() {
        // Ctrl+Shift+C - 复制时间范围
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
                event.preventDefault();
                this.copyTimeRange();
            }
        });
        
        // Ctrl+Shift+V - 粘贴时间范围
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
                event.preventDefault();
                this.pasteTimeRange();
            }
        });
    }
    
    copyTimeRange() {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            return;
        }
        
        // 复制第一个选中热区的时间范围
        const hotspot = selected[0];
        this.copiedTimeRange = {
            startTime: hotspot.config.startTime,
            endTime: hotspot.config.endTime,
            duration: hotspot.config.endTime - hotspot.config.startTime
        };
        
        console.log(`📋 已复制时间范围: ${this.copiedTimeRange.startTime}s - ${this.copiedTimeRange.endTime}s (${this.copiedTimeRange.duration}s)`);
        
        // 显示反馈
        this.scene.events.emit('ui:showToast', {
            message: `已复制时间范围: ${this.copiedTimeRange.duration.toFixed(1)}秒`,
            duration: 2000,
            color: '#2196F3'
        });
    }
    
    pasteTimeRange() {
        if (!this.copiedTimeRange) {
            console.warn('⚠️ 没有复制的时间范围');
            return;
        }
        
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            return;
        }
        
        // 粘贴到所有选中的热区
        selected.forEach(hotspot => {
            const oldStartTime = hotspot.config.startTime;
            const oldEndTime = hotspot.config.endTime;
            
            // 保持开始时间，只调整结束时间以匹配时长
            const newEndTime = oldStartTime + this.copiedTimeRange.duration;
            
            // 使用命令模式更新结束时间
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                oldEndTime,
                parseFloat(newEndTime.toFixed(1))
            );
            this.scene.commandManager.execute(command);
        });
        
        console.log(`📌 已粘贴时间范围到 ${selected.length} 个热区`);
        
        // 显示反馈
        this.scene.events.emit('ui:showToast', {
            message: `已粘贴时间范围到 ${selected.length} 个热区`,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    destroy() {
        this.scene.input.keyboard.off('keydown');
    }
}
```

**步骤7.2：集成到EditorScene**

修改文件：`src/phaser/scenes/EditorScene.js`

在`create`方法中添加：
```javascript
// 导入时间范围复制辅助类
import TimeRangeCopyHelper from '../../utils/TimeRangeCopyHelper.js';

// 初始化
this.timeRangeCopyHelper = new TimeRangeCopyHelper(this);
```

在`shutdown`方法中添加：
```javascript
if (this.timeRangeCopyHelper) {
    this.timeRangeCopyHelper.destroy();
}
```

**步骤7.3：测试验证**
- [ ] 选中热区，按Ctrl+Shift+C，检查是否复制时间范围
- [ ] 选中其他热区，按Ctrl+Shift+V，检查是否粘贴
- [ ] 测试多选粘贴
- [ ] 检查时长是否正确
- [ ] 检查撤销/重做是否正常

---

### 阶段8：方向键微调时间（B8）

#### 功能描述
选中热区后，使用方向键微调时间：
- `←` - 开始时间-0.1秒
- `→` - 开始时间+0.1秒
- `Shift+←` - 结束时间-0.1秒
- `Shift+→` - 结束时间+0.1秒
- `Ctrl+←` - 整体左移0.1秒
- `Ctrl+→` - 整体右移0.1秒

#### 执行步骤

**步骤8.1：创建方向键微调辅助类**

```javascript
// 文件位置：src/utils/ArrowKeyTimeAdjustHelper.js
// 完全遵循 Phaser 3 官方标准

import { ModifyHotspotCommand } from '../core/CommandManager.js';

export default class ArrowKeyTimeAdjustHelper {
    constructor(scene) {
        this.scene = scene;
        this.step = 0.1; // 0.1秒步进
        this.setupKeyboard();
    }
    
    setupKeyboard() {
        // 左箭头
        this.scene.input.keyboard.on('keydown-LEFT', (event) => {
            if (this.isInputFocused()) return;
            
            event.preventDefault();
            
            if (event.ctrlKey || event.metaKey) {
                // Ctrl+← 整体左移
                this.moveAll(-this.step);
            } else if (event.shiftKey) {
                // Shift+← 结束时间-0.1秒
                this.adjustEndTime(-this.step);
            } else {
                // ← 开始时间-0.1秒
                this.adjustStartTime(-this.step);
            }
        });
        
        // 右箭头
        this.scene.input.keyboard.on('keydown-RIGHT', (event) => {
            if (this.isInputFocused()) return;
            
            event.preventDefault();
            
            if (event.ctrlKey || event.metaKey) {
                // Ctrl+→ 整体右移
                this.moveAll(this.step);
            } else if (event.shiftKey) {
                // Shift+→ 结束时间+0.1秒
                this.adjustEndTime(this.step);
            } else {
                // → 开始时间+0.1秒
                this.adjustStartTime(this.step);
            }
        });
    }
    
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }
    
    adjustStartTime(delta) {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            const oldValue = hotspot.config.startTime;
            const newValue = Math.max(0, oldValue + delta);
            
            // 边界检查
            if (newValue >= hotspot.config.endTime) {
                console.warn('⚠️ 开始时间不能大于等于结束时间');
                return;
            }
            
            // 使用命令模式
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'startTime',
                oldValue,
                parseFloat(newValue.toFixed(1))
            );
            this.scene.commandManager.execute(command);
        });
        
        console.log(`⏪ 调整开始时间: ${delta > 0 ? '+' : ''}${delta}s`);
    }
    
    adjustEndTime(delta) {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            const oldValue = hotspot.config.endTime;
            const newValue = oldValue + delta;
            
            // 边界检查
            if (newValue <= hotspot.config.startTime) {
                console.warn('⚠️ 结束时间不能小于等于开始时间');
                return;
            }
            
            // 使用命令模式
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                oldValue,
                parseFloat(newValue.toFixed(1))
            );
            this.scene.commandManager.execute(command);
        });
        
        console.log(`⏩ 调整结束时间: ${delta > 0 ? '+' : ''}${delta}s`);
    }
    
    moveAll(delta) {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            const oldStartTime = hotspot.config.startTime;
            const oldEndTime = hotspot.config.endTime;
            
            let newStartTime = oldStartTime + delta;
            let newEndTime = oldEndTime + delta;
            
            // 边界检查
            if (newStartTime < 0) {
                const offset = -newStartTime;
                newStartTime = 0;
                newEndTime += offset;
            }
            
            // 更新开始时间
            const startCommand = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'startTime',
                oldStartTime,
                parseFloat(newStartTime.toFixed(1))
            );
            this.scene.commandManager.execute(startCommand);
            
            // 更新结束时间
            const endCommand = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                oldEndTime,
                parseFloat(newEndTime.toFixed(1))
            );
            this.scene.commandManager.execute(endCommand);
        });
        
        console.log(`↔️ 整体移动: ${delta > 0 ? '+' : ''}${delta}s`);
    }
    
    destroy() {
        this.scene.input.keyboard.off('keydown-LEFT');
        this.scene.input.keyboard.off('keydown-RIGHT');
    }
}
```

**步骤8.2：集成到EditorScene**

修改文件：`src/phaser/scenes/EditorScene.js`

在`create`方法中添加：
```javascript
// 导入方向键微调辅助类
import ArrowKeyTimeAdjustHelper from '../../utils/ArrowKeyTimeAdjustHelper.js';

// 初始化
this.arrowKeyTimeAdjustHelper = new ArrowKeyTimeAdjustHelper(this);
```

在`shutdown`方法中添加：
```javascript
if (this.arrowKeyTimeAdjustHelper) {
    this.arrowKeyTimeAdjustHelper.destroy();
}
```

**步骤8.3：测试验证**
- [ ] 选中热区，按←→，检查开始时间是否调整
- [ ] 按Shift+←→，检查结束时间是否调整
- [ ] 按Ctrl+←→，检查是否整体移动
- [ ] 测试边界情况（时间不能小于0）
- [ ] 测试多选情况
- [ ] 检查撤销/重做是否正常

---

## 技术实现规范

### 1. Phaser官方标准

#### 1.1 事件系统
```javascript
// ✅ 正确：使用scene.events
this.scene.events.emit('hotspot:timeChanged', data);
this.scene.events.on('hotspot:timeChanged', (data) => {});

// ❌ 错误：直接调用
this.timeline.updateHotspot(data);
```

#### 1.2 Registry状态管理
```javascript
// ✅ 正确：使用registry
this.scene.registry.set('drawingTimePreset', 5);
const preset = this.scene.registry.get('drawingTimePreset');

// ❌ 错误：全局变量
window.drawingTimePreset = 5;
```

#### 1.3 输入系统
```javascript
// ✅ 正确：使用scene.input.keyboard
this.scene.input.keyboard.on('keydown-T', () => {});

// ❌ 错误：直接监听window
window.addEventListener('keydown', () => {});
```

#### 1.4 时间系统
```javascript
// ✅ 正确：使用scene.time
this.scene.time.delayedCall(3000, () => {});

// ❌ 错误：使用setTimeout
setTimeout(() => {}, 3000);
```

### 2. 命令模式（支持撤销/重做）

```javascript
// ✅ 正确：使用命令模式
const command = new ModifyHotspotCommand(
    this.scene,
    hotspotId,
    'startTime',
    oldValue,
    newValue
);
this.scene.commandManager.execute(command);

// ❌ 错误：直接修改
hotspot.config.startTime = newValue;
```

### 3. 性能优化

#### 3.1 节流
```javascript
// ✅ 正确：使用节流
const throttledUpdate = Phaser.Utils.throttle(this.update, 16, this);

// ❌ 错误：每帧执行
this.scene.events.on('update', this.update);
```

#### 3.2 脏标记
```javascript
// ✅ 正确：使用脏标记
if (this._isDirty) {
    this.render();
    this._isDirty = false;
}

// ❌ 错误：每次都渲染
this.render();
```

### 4. 代码规范

#### 4.1 文件命名
- Helper类：`DrawingTimePresetHelper.js`
- Controller类：`TimelineHighlightController.js`
- Manager类：`DrawingManager.js`

#### 4.2 注释规范
```javascript
/**
 * 设置时间预设
 * @param {number} seconds - 时长（秒）
 * 遵循 Phaser 3 官方标准
 */
setPreset(seconds) {
    // 实现代码
}
```

#### 4.3 日志规范
```javascript
console.log('⏱️ 时长预设: 5秒');  // 信息
console.warn('⚠️ 时间范围太短');   // 警告
console.error('❌ 创建失败');      // 错误
```

---

## 测试验证清单

### 功能测试

#### A1：绘制时按数字键预设时长
- [ ] 按1-9键，显示时长提示
- [ ] 绘制完成后，时长正确
- [ ] 按0键重置为5秒
- [ ] 提示3秒后自动隐藏

#### A2：快捷键快速设置时间
- [ ] T键设置开始时间
- [ ] Shift+T设置结束时间
- [ ] Ctrl+T设置为当前片段
- [ ] 边界检查正常
- [ ] 多选支持正常

#### A3：绘制完成后立即可调时间
- [ ] 时间条闪烁6次
- [ ] ←→调整开始时间
- [ ] Shift+←→调整结束时间
- [ ] Enter确认
- [ ] Escape取消

#### A4：时间轴直接创建热区
- [ ] Alt+拖拽显示预览
- [ ] 释放创建热区
- [ ] 热区在画面中心
- [ ] 时间范围正确
- [ ] 最小时长0.5秒

#### B5：时间轴磁性吸附
- [ ] 吸附到开始时间
- [ ] 吸附到结束时间
- [ ] 吸附到整秒
- [ ] 显示吸附线
- [ ] 吸附距离0.2秒

#### B6：批量时间调整
- [ ] 多选拖拽同步
- [ ] 时间偏移一致
- [ ] 边界检查正常
- [ ] 撤销/重做正常

#### B7：时间范围复制粘贴
- [ ] Ctrl+Shift+C复制
- [ ] Ctrl+Shift+V粘贴
- [ ] 多选粘贴
- [ ] 时长正确

#### B8：方向键微调时间
- [ ] ←→调整开始
- [ ] Shift+←→调整结束
- [ ] Ctrl+←→整体移动
- [ ] 边界检查正常

### 兼容性测试
- [ ] 不影响现有绘制功能
- [ ] 不影响现有时间轴功能
- [ ] 不影响撤销/重做
- [ ] 不影响选择功能

### 性能测试
- [ ] 100个热区流畅运行
- [ ] 拖拽无卡顿
- [ ] 内存无泄漏
- [ ] CPU占用正常

### 边界测试
- [ ] 时间不能小于0
- [ ] 开始时间<结束时间
- [ ] 最小时长0.5秒
- [ ] 最大时长不超过视频时长

---

## 实施建议

### 推荐实施顺序

**第一批（立即实施）- 2-3小时**
1. A1：绘制时按数字键预设时长
2. A2：快捷键快速设置时间
3. A3：绘制完成后立即可调时间

**第二批（短期实施）- 3-4小时**
4. A4：时间轴直接创建热区
5. B5：时间轴磁性吸附
6. B6：批量时间调整

**第三批（中期实施）- 2-3小时**
7. B7：时间范围复制粘贴
8. B8：方向键微调时间

### 预期效果

- **效率提升：** 70%+
- **操作步骤减少：** 50%+
- **用户满意度：** 显著提升

---

## 快捷键总览

### 绘制相关
- `1-9` - 设置时长预设（1-9秒）
- `0` - 重置为默认5秒
- `C` - 圆形模式
- `R` - 矩形模式
- `E` - 椭圆模式
- `ESC` - 取消绘制

### 时间控制
- `T` - 设置开始时间为当前
- `Shift+T` - 设置结束时间为当前
- `Ctrl+T` - 设置为当前片段
- `←` - 开始时间-0.1秒
- `→` - 开始时间+0.1秒
- `Shift+←` - 结束时间-0.1秒
- `Shift+→` - 结束时间+0.1秒
- `Ctrl+←` - 整体左移0.1秒
- `Ctrl+→` - 整体右移0.1秒

### 时间范围
- `Ctrl+Shift+C` - 复制时间范围
- `Ctrl+Shift+V` - 粘贴时间范围

### 时间轴操作
- `Alt+拖拽` - 在时间轴上创建热区
- `Enter` - 确认时间调整
- `Escape` - 取消时间调整

---

## 常见问题

### Q1：为什么要按数字键而不是自动检测？
A：按数字键是主动操作，用户可以精确控制时长，避免自动检测的不确定性。

### Q2：磁性吸附会不会影响精确定位？
A：吸附距离设置为0.2秒，足够小不会影响精确操作，同时可以通过设置关闭。

### Q3：批量调整会不会导致时间冲突？
A：系统会自动检测边界，确保时间不会小于0，但不会自动解决热区之间的重叠。

### Q4：方向键微调和时间轴键盘控制冲突吗？
A：不冲突。方向键微调只在选中热区时生效，时间轴键盘控制在没有选中时生效。

---

## 总结

本优化方案完全遵循Phaser 3官方标准，通过8个核心功能的实施，可以大幅提升绘图和时间控制的效率。建议按照推荐的实施顺序，分三批完成，每批完成后进行充分测试，确保不影响现有功能。

预计总开发时间：7-10小时
预计效率提升：70%+

---

**文档版本：** 1.0
**最后更新：** 2025-01-27
**遵循标准：** Phaser 3 官方标准


---

## A4功能补充说明

### A4：时间轴直接创建热区
**状态**: ✅ 已完成  
**文件**: `src/dom/timeline/TimelineDirectCreateController.js`

**功能说明**:
- 按住 Alt 键在时间轴上拖拽，直接创建时间范围
- 自动在画面中心创建热区（使用上次绘制的形状）
- 实时显示预览条和时长信息
- 最小时长限制：0.5秒
- 创建后自动高亮，可立即调整时间
- 按 Escape 键取消创建

**使用方法**:
1. 按住 Alt 键
2. 在时间轴上拖拽（避开顶部30px的时间刻度区域）
3. 松开鼠标完成创建
4. 热区将在画面中心创建，时间条自动高亮
5. 可在画面中调整位置和大小
6. 可用方向键微调时间

**技术实现**:
- 使用 Canvas 绘制预览条（渐变背景+边框）
- 集成到 TimelinePanel 的鼠标事件系统
- 使用 AddHotspotCommand 支持撤销/重做
- 自动触发 TimelineHighlightController 高亮
- 最高优先级处理（优先于其他交互）

**预览效果**:
- 渐变绿色背景（半透明）
- 实线绿色边框
- 左右边缘垂直标记线
- 居中显示时长（大字体）
- 下方显示时间范围（小字体）
- 上方显示操作提示

**快捷键**:
- `Alt+拖拽`: 在时间轴上创建热区
- `Escape`: 取消创建

**测试脚本**:
```javascript
// 快速测试
quickTestA4()

// 详细测试
detailedTestA4()

// 压力测试
stressTestA4()
```

---

## A1-A4 完整集成关系图

```
EditorScene (主场景)
├── DrawingManager (绘制管理)
│   └── DrawingTimePresetHelper (A1: 时长预设)
│
├── TimelineQuickTimeHelper (A2: 快捷键设置时间)
│
└── TimelinePanel (时间轴面板)
    ├── TimelineHighlightController (A3: 高亮微调)
    └── TimelineDirectCreateController (A4: 直接创建)
        └── 触发 TimelineHighlightController
```

---

## 完整快捷键总览

### 绘制相关 (A1)
- `1-9`: 设置热区时长（1-9秒）
- `0`: 重置为默认时长（5秒）

### 时间设置 (A2)
- `T`: 设置开始时间为当前时间
- `Shift+T`: 设置结束时间为当前时间
- `Ctrl+T`: 设置当前片段（开始=当前，结束=当前+5秒）

### 时间微调 (A3)
- `←/→`: 调整开始时间（±0.1秒）
- `Shift+←/→`: 调整结束时间（±0.1秒）
- `Enter`: 确认调整
- `Escape`: 取消高亮

### 直接创建 (A4)
- `Alt+拖拽`: 在时间轴上创建热区
- `Escape`: 取消创建

---

## 完整使用场景示例

### 场景1：快速创建固定时长热区
1. 按数字键 `3`（设置3秒时长）
2. 在画面上拖拽绘制圆形
3. 松开鼠标，自动创建3秒时长的热区
4. 时间条自动高亮，可用方向键微调

### 场景2：精确设置时间点
1. 播放视频到 35.2 秒
2. 在时间轴上选中热区
3. 按 `T` 键设置开始时间为 35.2s
4. 播放到 38.9 秒
5. 按 `Shift+T` 设置结束时间为 38.9s

### 场景3：时间轴快速创建
1. 按住 `Alt` 键
2. 在时间轴上从 35.2s 拖拽到 38.9s
3. 松开鼠标，热区在画面中心创建
4. 时间条自动高亮，可立即微调
5. 在画面中调整热区位置和大小

### 场景4：批量设置时间
1. 在时间轴上框选多个热区（Ctrl+点击多选）
2. 播放到目标时间点
3. 按 `T` 键，所有选中热区的开始时间统一设置
4. Toast 提示显示成功数量

---

## 完整文件清单

### 核心功能文件
1. `src/utils/DrawingTimePresetHelper.js` - A1 实现
2. `src/utils/TimelineQuickTimeHelper.js` - A2 实现
3. `src/dom/timeline/TimelineHighlightController.js` - A3 实现
4. `src/dom/timeline/TimelineDirectCreateController.js` - A4 实现

### 集成文件
1. `src/phaser/managers/DrawingManager.js` - A1 集成
2. `src/phaser/scenes/EditorScene.js` - A2 集成
3. `src/dom/TimelinePanel.js` - A3、A4 集成

### 测试文件
1. `TEST_A1_A2_A3.js` - A1-A3 测试脚本
2. `TEST_A4.js` - A4 测试脚本
3. `QUICK_GUIDE_A1_A2_A3.txt` - 快速指南

### 文档文件
1. `DRAWING_TIMELINE_COMPLETE_OPTIMIZATION_GUIDE.md` - 本文档
2. `HOTSPOT_RANGE_INTERACTION_PLAN.md` - 原始计划

---

## 常见问题补充

### Q5: Alt+拖拽没反应？
A: 确保拖拽区域在时间刻度下方（Y > 30px），避开顶部时间刻度区域。

### Q6: 创建的热区太小？
A: A4 创建的热区默认 100x100px，可在画面中手动调整大小。

### Q7: 时间范围太短无法创建？
A: 最小时长限制为 0.5 秒，会显示错误提示。

---

## 更新日志补充

### 2024-01-27
- ✅ 完成 A4：时间轴直接创建热区
- ✅ 优化预览显示效果（渐变背景、边缘标记）
- ✅ 集成 A3 自动高亮功能
- ✅ 添加 Escape 取消功能
- ✅ 添加最小时长错误提示
- ✅ 创建 TEST_A4.js 测试脚本
- ✅ 更新完整优化指南

---

**文档版本**: 2.0  
**最后更新**: 2024-01-27  
**维护者**: Kiro AI Assistant
