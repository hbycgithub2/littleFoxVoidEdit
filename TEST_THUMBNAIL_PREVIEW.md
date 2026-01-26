# 缩略图预览功能测试指南

## 功能概述
时间轴缩略图预览功能已完成实现，可以在时间条上显示热区的缩略图。

## 实现的功能

### 1. 缩略图生成
- ✅ 自动捕获热区截图
- ✅ 生成 60x16 像素缩略图
- ✅ 支持矩形、圆形、多边形热区
- ✅ 显示热区文字内容

### 2. 缓存管理
- ✅ 智能缓存（最大 100 个）
- ✅ FIFO 策略（先进先出）
- ✅ 热区更新时自动清除缓存

### 3. 异步生成
- ✅ 批量生成队列
- ✅ 非阻塞处理（每 10ms 一个）
- ✅ 自动预加载可见热区

### 4. 显示优化
- ✅ 只在时间条宽度足够时显示（>70px）
- ✅ 占位符显示（加载中）
- ✅ 文字自动右移（避免遮挡缩略图）

## 测试步骤

### 测试 1：基础显示
1. 启动项目：`START.bat`
2. 加载视频
3. 创建几个热区（不同形状）
4. 观察时间轴上的缩略图显示

**预期结果**：
- 时间条上显示热区缩略图
- 缩略图显示热区形状和颜色
- 文字在缩略图右侧显示

### 测试 2：缓存机制
1. 创建多个热区
2. 观察缩略图逐个生成
3. 修改某个热区
4. 观察该热区缩略图重新生成

**预期结果**：
- 首次显示占位符（"..."）
- 缩略图异步生成后自动显示
- 修改热区后缩略图更新

### 测试 3：性能测试
1. 创建大量热区（50+）
2. 滚动时间轴
3. 观察缩略图加载

**预期结果**：
- 只生成可见热区的缩略图
- 滚动流畅，无卡顿
- 缓存限制在 100 个以内

### 测试 4：不同宽度
1. 创建短时间热区（<1秒）
2. 创建长时间热区（>5秒）
3. 缩放时间轴

**预期结果**：
- 短时间条不显示缩略图
- 长时间条显示缩略图
- 缩放后自动调整显示

## 控制台事件

缩略图控制器会发送以下事件：

```javascript
// 缩略图开关切换
scene.events.on('timeline:thumbnail:toggled', (data) => {
    console.log('Thumbnail enabled:', data.enabled);
});

// 缩略图已缓存
scene.events.on('timeline:thumbnail:cached', (data) => {
    console.log('Thumbnail cached:', data.hotspotId, 'Cache size:', data.cacheSize);
});

// 缓存已清除
scene.events.on('timeline:thumbnail:cacheCleared', (data) => {
    console.log('Cache cleared:', data.hotspotId || 'all');
});
```

## 调试命令

在浏览器控制台中测试：

```javascript
// 获取时间轴面板
const timeline = window.game.scene.getScene('EditorScene').timelinePanel;

// 获取缓存统计
const stats = timeline.thumbnailController.getCacheStats();
console.log('Cache stats:', stats);

// 清除所有缓存
timeline.thumbnailController.clearCache();

// 禁用缩略图
timeline.thumbnailController.setEnabled(false);

// 启用缩略图
timeline.thumbnailController.setEnabled(true);

// 手动生成缩略图
timeline.thumbnailController.generateThumbnail('hotspot-id-here');
```

## 已知限制

1. **最小宽度**：时间条宽度 < 70px 时不显示缩略图
2. **缓存大小**：最多缓存 100 个缩略图
3. **生成速度**：每 10ms 生成一个（避免阻塞）

## 文件结构

```
src/dom/timeline/
├── TimelineThumbnailController.js  (422 行) - 缩略图控制器
├── LayerGroupController.js         (309 行) - 集成缩略图绘制
└── TimelinePanel.js                (582 行) - 初始化和事件监听
```

## 下一步优化建议

1. 添加缩略图质量设置（低/中/高）
2. 支持自定义缩略图尺寸
3. 添加缩略图点击放大预览
4. 支持缩略图导出功能
