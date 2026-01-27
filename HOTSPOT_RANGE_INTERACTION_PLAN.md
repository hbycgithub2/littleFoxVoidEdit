# 热区时间范围交互增强计划

## 目标
增强时间轴上热区范围条的交互功能，让用户能快速操作热区的时间段。

## 用户场景
用户在画面上画了一个圈（热区），设置了开始时间 35.2s 和结束时间 38.9s。
现在需要快速操作这个时间段：跳转、播放、调整等。

---

## 实现步骤

### 步骤 1：增强 LayerGroupController - 添加双击检测
**文件**: `src/dom/timeline/LayerGroupController.js`

**修改内容**:
1. 在 `drawHotspotBar()` 方法中记录热区条的位置信息
2. 添加 `hitTestHotspotBar()` 方法 - 检测鼠标是否点击热区条
3. 添加 `getHotspotAtPosition()` 方法 - 获取指定位置的热区

**新增代码** (约 30 行):
```javascript
/**
 * 检测热区条点击
 * @param {number} mouseX - 鼠标 X 坐标
 * @param {number} mouseY - 鼠标 Y 坐标
 * @returns {object|null} 热区配置或 null
 */
hitTestHotspotBar(mouseX, mouseY) {
    // 遍历所有图层和热区，检测点击
    // 返回被点击的热区配置
}

/**
 * 获取指定位置的热区
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @returns {object|null} 热区配置或 null
 */
getHotspotAtPosition(x, y) {
    // 实现逻辑
}
```

---

### 步骤 2：修改 TimelinePanel - 添加双击事件
**文件**: `src/dom/TimelinePanel.js`

**修改内容**:
1. 在 `setupEvents()` 中添加 `dblclick` 事件监听
2. 添加 `onDoubleClick()` 方法处理双击
3. 双击热区条 → 跳转到开始时间

**新增代码** (约 20 行):
```javascript
setupEvents() {
    // ... 现有代码 ...
    
    // 添加双击事件
    this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
}

/**
 * 处理双击事件
 */
onDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检测是否双击了热区条
    const hotspot = this.layerGroupController.getHotspotAtPosition(x, y);
    if (hotspot) {
        // 跳转到开始时间
        this.game.events.emit('video:seek', hotspot.startTime);
    }
}
```

---

### 步骤 3：增强 TimelineContextMenu - 添加时间操作菜单
**文件**: `src/dom/timeline/TimelineContextMenu.js`

**修改内容**:
1. 在 `show()` 方法中添加时间操作选项
2. 添加 `jumpToStart()` - 跳转到开始时间
3. 添加 `jumpToEnd()` - 跳转到结束时间
4. 添加 `playSegment()` - 循环播放片段
5. 添加 `copyTimeRange()` - 复制时间范围

**新增代码** (约 40 行):
```javascript
show(x, y, hotspot) {
    // ... 现有代码 ...
    
    // 添加时间操作分隔线
    this.addSeparator();
    
    // 添加时间操作选项
    this.addMenuItem('⏩ 跳转到开始', () => this.jumpToStart(hotspot));
    this.addMenuItem('⏭️ 跳转到结束', () => this.jumpToEnd(hotspot));
    this.addMenuItem('🔁 播放此片段', () => this.playSegment(hotspot));
    this.addMenuItem('📋 复制时间范围', () => this.copyTimeRange(hotspot));
}

jumpToStart(hotspot) {
    this.game.events.emit('video:seek', hotspot.config.startTime);
}

jumpToEnd(hotspot) {
    this.game.events.emit('video:seek', hotspot.config.endTime);
}

playSegment(hotspot) {
    // 使用 TimelineRangeController 设置循环播放
    this.timeline.rangeController.setRange(
        hotspot.config.startTime,
        hotspot.config.endTime
    );
    this.timeline.rangeController.startLoop();
}

copyTimeRange(hotspot) {
    const text = `${hotspot.config.startTime} - ${hotspot.config.endTime}`;
    navigator.clipboard.writeText(text);
    // 显示提示
    this.game.toastManager.show('已复制时间范围', 'success');
}
```

---

### 步骤 4：增强 PropertyPanelController - 显示时长
**文件**: `src/dom/PropertyPanelController.js`

**修改内容**:
1. 在 `update()` 方法中计算并显示时长
2. 在属性面板 HTML 中添加时长显示元素

**新增代码** (约 15 行):
```javascript
update(data) {
    // ... 现有代码 ...
    
    if (data.count === 1) {
        const hotspot = data.selected[0];
        
        // 计算时长
        const duration = hotspot.config.endTime - hotspot.config.startTime;
        
        // 显示时长
        if (this.propDuration) {
            this.propDuration.textContent = `${duration.toFixed(1)}秒`;
        }
    }
}
```

**HTML 修改** (在 `index.html` 中):
```html
<div class="property-row">
    <label>持续时间:</label>
    <span id="propDuration" style="color: #4CAF50;">0.0秒</span>
</div>
```

---

### 步骤 5：增强 TimelineTooltipController - 显示详细信息
**文件**: `src/dom/timeline/TimelineTooltipController.js`

**修改内容**:
1. 在 `handleMouseMove()` 中检测热区条悬停
2. 显示详细信息：名称、开始时间、结束时间、时长

**新增代码** (约 20 行):
```javascript
handleMouseMove(x, y, clientX, clientY) {
    // 检测是否悬停在热区条上
    const hotspot = this.timeline.layerGroupController.getHotspotAtPosition(x, y);
    
    if (hotspot) {
        const duration = hotspot.endTime - hotspot.startTime;
        const content = `
            <strong>${hotspot.word || hotspot.shape}</strong><br>
            开始: ${hotspot.startTime.toFixed(1)}s<br>
            结束: ${hotspot.endTime.toFixed(1)}s<br>
            时长: ${duration.toFixed(1)}s
        `;
        this.show(content, clientX, clientY);
    } else {
        this.hide();
    }
}
```

---

### 步骤 6：视觉反馈 - 高亮当前播放的热区
**文件**: `src/dom/timeline/LayerGroupController.js`

**修改内容**:
1. 在 `drawHotspotBar()` 中检测当前播放时间
2. 如果播放时间在热区范围内，添加高亮效果

**新增代码** (约 10 行):
```javascript
drawHotspotBar(ctx, config, y, layer) {
    // ... 现有代码 ...
    
    // 检测是否正在播放此热区
    const currentTime = this.timeline.currentTime;
    const isPlaying = currentTime >= config.startTime && currentTime <= config.endTime;
    
    if (isPlaying) {
        // 添加高亮边框
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x1 - 1, y - 1, width + 2, this.barHeight + 2);
    }
}
```

---

## 总结

### 修改文件列表：
1. `src/dom/timeline/LayerGroupController.js` - 添加 30 行
2. `src/dom/TimelinePanel.js` - 添加 20 行
3. `src/dom/timeline/TimelineContextMenu.js` - 添加 40 行
4. `src/dom/PropertyPanelController.js` - 添加 15 行
5. `src/dom/timeline/TimelineTooltipController.js` - 添加 20 行
6. `index.html` - 添加 5 行（时长显示）

**总计**: 约 130 行代码

### 功能清单：
✅ 双击热区条 → 跳转到开始时间  
✅ 右键菜单 → 跳转、播放、复制时间范围  
✅ 属性面板显示时长  
✅ 悬停显示详细信息  
✅ 播放时高亮当前热区  

### 技术标准：
✅ 完全遵循 Phaser 3 标准  
✅ 使用 Canvas 绘制和事件系统  
✅ 不影响现有功能  
✅ 文件大小控制良好  

---

## 执行顺序
1. 先修改 `LayerGroupController.js` - 添加检测方法
2. 再修改 `TimelinePanel.js` - 添加双击事件
3. 然后修改 `TimelineContextMenu.js` - 添加右键菜单
4. 接着修改 `PropertyPanelController.js` - 显示时长
5. 最后修改 `TimelineTooltipController.js` - 增强提示
6. 修改 `index.html` - 添加时长显示元素

---

**完成后效果**：
用户画了一个圈（35.2s - 38.9s），可以：
- 双击时间轴上的范围条 → 立即跳转到 35.2s
- 右键范围条 → 选择"播放此片段" → 循环播放 35.2s - 38.9s
- 悬停范围条 → 看到详细信息
- 播放到这个时间段时 → 范围条高亮显示
