# 时间轴视频缩略图 Phaser 实现方案

## 📋 方案概述

本文档详细说明如何使用 Phaser 官方标准方式实现类似剪映的时间轴视频缩略图功能。

### 核心目标
- ✅ 实现视频帧提取和缩略图生成
- ✅ 使用 Phaser 标准 API 进行渲染
- ✅ 优化性能（虚拟滚动、纹理池）
- ✅ 不影响现有功能
- ✅ 模块化设计，单文件不超过 200 行

---

## 🎯 剪映缩略图技术分析

### 视觉特征
1. **缩略图尺寸**：高度 60-80px，宽度动态调整
2. **采样策略**：等间隔采样（0.5-1秒/帧）
3. **视觉连续性**：缩略图无缝拼接
4. **动态密度**：支持时间轴缩放

### 技术实现推测
1. **视频抽帧**：使用 Canvas API 或 WebCodecs API
2. **缓存策略**：预生成并缓存缩略图
3. **虚拟渲染**：只渲染可见区域
4. **分层架构**：背景层、缩略图层、UI层分离

---

## 🏗️ 架构设计

### 目录结构
```
littleFoxVoidEdit/
└── src/
    └── phaser/
        └── timeline/
            ├── scenes/
            │   └── TimelineThumbnailScene.js      (150行) - Phaser场景
            ├── components/
            │   ├── ThumbnailGenerator.js          (200行) - 缩略图生成器
            │   ├── ThumbnailRenderer.js           (180行) - 缩略图渲染器
            │   └── ThumbnailScroller.js           (150行) - 滚动控制器
            ├── managers/
            │   ├── ThumbnailCacheManager.js       (120行) - 缓存管理器
            │   └── ThumbnailPoolManager.js        (100行) - 纹理池管理器
            └── utils/
                ├── VideoFrameExtractor.js         (150行) - 视频帧提取
                └── ThumbnailConfig.js             (50行)  - 配置文件
```

### 模块职责

| 模块 | 职责 | 行数 |
|------|------|------|
| TimelineThumbnailScene | Phaser场景管理，生命周期控制 | 150 |
| ThumbnailGenerator | 视频帧提取，缩略图生成 | 200 |
| ThumbnailRenderer | Phaser对象创建，渲染管理 | 180 |
| ThumbnailScroller | 滚动交互，可视区域计算 | 150 |
| ThumbnailCacheManager | LRU缓存，内存管理 | 120 |
| ThumbnailPoolManager | 纹理对象池，复用管理 | 100 |
| VideoFrameExtractor | 底层视频帧提取API封装 | 150 |
| ThumbnailConfig | 配置参数定义 | 50 |

---

## 🔧 技术方案详解

### 1. 视频帧提取（VideoFrameExtractor）

#### 技术选型
```javascript
// 优先级：VideoFrame API > Canvas drawImage
if (window.VideoFrame) {
  // 使用现代 VideoFrame API (Chrome 94+)
  // 优点：性能好，支持硬件加速
} else {
  // 降级到 Canvas drawImage
  // 优点：兼容性好
}
```

#### 核心流程
```
1. 加载视频 → 2. 计算采样点 → 3. 逐帧提取 → 4. 转换为纹理数据
```

#### 关键代码结构
```javascript
class VideoFrameExtractor {
  constructor(videoElement) {
    this.video = videoElement;
    this.canvas = new OffscreenCanvas(width, height);
  }
  
  async extractFrame(timestamp) {
    // 跳转到指定时间
    this.video.currentTime = timestamp;
    await this.waitForSeek();
    
    // 绘制到Canvas
    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, width, height);
    
    // 转换为Base64或ImageData
    return this.canvas.convertToBlob();
  }
  
  calculateSamplePoints(duration, interval) {
    // 计算采样时间点
    const points = [];
    for (let t = 0; t < duration; t += interval) {
      points.push(t);
    }
    return points;
  }
}
```

---

### 2. Phaser 场景设计（TimelineThumbnailScene）

#### 场景结构
```javascript
class TimelineThumbnailScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TimelineThumbnailScene' });
  }
  
  preload() {
    // 预加载占位图
    this.load.image('placeholder', 'assets/placeholder.png');
  }
  
  create() {
    // 创建容器层级
    this.backgroundLayer = this.add.container(0, 0);
    this.thumbnailLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);
    
    // 初始化组件
    this.generator = new ThumbnailGenerator(this);
    this.renderer = new ThumbnailRenderer(this);
    this.scroller = new ThumbnailScroller(this);
    
    // 设置相机
    this.cameras.main.setBounds(0, 0, totalWidth, height);
  }
  
  update(time, delta) {
    // 更新可视区域
    this.scroller.update();
    
    // 渲染可见缩略图
    this.renderer.renderVisibleThumbnails();
  }
}
```

#### Phaser 官方标准实践
- ✅ 使用 `Phaser.Scene` 生命周期
- ✅ 使用 `Phaser.GameObjects.Container` 组织层级
- ✅ 使用 `Phaser.Cameras.Scene2D.Camera` 控制视口
- ✅ 使用 `Phaser.Textures.TextureManager` 管理纹理

---

### 3. 缩略图渲染器（ThumbnailRenderer）

#### 渲染策略
```javascript
class ThumbnailRenderer {
  constructor(scene) {
    this.scene = scene;
    this.poolManager = new ThumbnailPoolManager(scene);
    this.visibleThumbnails = new Map();
  }
  
  renderVisibleThumbnails() {
    const visibleRange = this.calculateVisibleRange();
    
    // 移除不可见的缩略图
    this.removeInvisibleThumbnails(visibleRange);
    
    // 添加新的可见缩略图
    this.addVisibleThumbnails(visibleRange);
  }
  
  addThumbnail(timestamp, x, y) {
    // 从对象池获取Image对象
    const image = this.poolManager.acquire();
    
    // 设置纹理（从缓存或生成）
    const texture = this.getOrGenerateTexture(timestamp);
    image.setTexture(texture);
    
    // 设置位置
    image.setPosition(x, y);
    
    // 添加到场景
    this.scene.thumbnailLayer.add(image);
    
    return image;
  }
  
  calculateVisibleRange() {
    const camera = this.scene.cameras.main;
    const scrollX = camera.scrollX;
    const viewWidth = camera.width;
    
    return {
      startX: scrollX - PRELOAD_MARGIN,
      endX: scrollX + viewWidth + PRELOAD_MARGIN
    };
  }
}
```

---

### 4. 纹理池管理（ThumbnailPoolManager）

#### 对象池模式
```javascript
class ThumbnailPoolManager {
  constructor(scene, poolSize = 20) {
    this.scene = scene;
    this.pool = [];
    this.activeObjects = new Set();
    
    // 预创建对象池
    for (let i = 0; i < poolSize; i++) {
      const image = scene.add.image(0, 0, 'placeholder');
      image.setVisible(false);
      this.pool.push(image);
    }
  }
  
  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      // 池已空，创建新对象
      obj = this.scene.add.image(0, 0, 'placeholder');
    }
    
    obj.setVisible(true);
    this.activeObjects.add(obj);
    return obj;
  }
  
  release(obj) {
    obj.setVisible(false);
    this.activeObjects.delete(obj);
    this.pool.push(obj);
  }
  
  releaseAll() {
    this.activeObjects.forEach(obj => this.release(obj));
  }
}
```

---

### 5. 缓存管理（ThumbnailCacheManager）

#### LRU 缓存策略
```javascript
class ThumbnailCacheManager {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  set(key, texture) {
    // 如果已存在，先删除（更新顺序）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 添加到末尾（最新）
    this.cache.set(key, texture);
    
    // 检查大小限制
    if (this.cache.size > this.maxSize) {
      // 删除最旧的（第一个）
      const firstKey = this.cache.keys().next().value;
      const oldTexture = this.cache.get(firstKey);
      
      // 销毁纹理
      if (oldTexture && oldTexture.destroy) {
        oldTexture.destroy();
      }
      
      this.cache.delete(firstKey);
    }
  }
  
  get(key) {
    if (!this.cache.has(key)) return null;
    
    // 更新访问顺序
    const texture = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, texture);
    
    return texture;
  }
  
  clear() {
    this.cache.forEach(texture => {
      if (texture && texture.destroy) {
        texture.destroy();
      }
    });
    this.cache.clear();
  }
}
```

---

### 6. 滚动控制器（ThumbnailScroller）

#### 交互实现
```javascript
class ThumbnailScroller {
  constructor(scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
    this.isDragging = false;
    this.dragStartX = 0;
    this.scrollStartX = 0;
    
    this.setupInput();
  }
  
  setupInput() {
    const input = this.scene.input;
    
    // 拖拽开始
    input.on('pointerdown', (pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.scrollStartX = this.camera.scrollX;
    });
    
    // 拖拽中
    input.on('pointermove', (pointer) => {
      if (!this.isDragging) return;
      
      const deltaX = this.dragStartX - pointer.x;
      this.camera.scrollX = this.scrollStartX + deltaX;
    });
    
    // 拖拽结束
    input.on('pointerup', () => {
      this.isDragging = false;
    });
    
    // 滚轮缩放
    input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      this.camera.scrollX += deltaY * 0.5;
    });
  }
  
  update() {
    // 限制滚动范围
    const maxScrollX = this.camera.getBounds().width - this.camera.width;
    this.camera.scrollX = Phaser.Math.Clamp(
      this.camera.scrollX,
      0,
      maxScrollX
    );
  }
}
```

---

### 7. 配置文件（ThumbnailConfig）

```javascript
export const ThumbnailConfig = {
  // 缩略图尺寸
  thumbnailWidth: 80,
  thumbnailHeight: 60,
  
  // 采样间隔（秒）
  samplingInterval: 0.5,
  
  // 缓存设置
  maxCacheSize: 50,
  poolSize: 20,
  
  // 预加载边距（像素）
  preloadMargin: 200,
  
  // 图片质量
  quality: 0.8,
  
  // 性能选项
  useWebWorker: true,
  enablePreload: true,
  
  // 降级选项
  fallbackToCanvas: true
};
```

---

## 📝 实现步骤

### 阶段 1：基础架构搭建（第1-2天）

#### 步骤 1.1：创建目录结构
```bash
mkdir -p src/phaser/timeline/scenes
mkdir -p src/phaser/timeline/components
mkdir -p src/phaser/timeline/managers
mkdir -p src/phaser/timeline/utils
```

#### 步骤 1.2：创建配置文件
创建 `src/phaser/timeline/utils/ThumbnailConfig.js`
- 定义所有配置参数
- 导出配置对象

#### 步骤 1.3：创建视频帧提取器
创建 `src/phaser/timeline/utils/VideoFrameExtractor.js`
- 实现 Canvas 抽帧功能
- 实现采样点计算
- 添加错误处理

**验收标准：**
- ✅ 能成功从视频提取单帧
- ✅ 能计算正确的采样时间点
- ✅ 错误处理完善

---

### 阶段 2：核心组件开发（第3-5天）

#### 步骤 2.1：实现缓存管理器
创建 `src/phaser/timeline/managers/ThumbnailCacheManager.js`
- 实现 LRU 缓存逻辑
- 实现纹理销毁
- 添加内存监控

#### 步骤 2.2：实现纹理池管理器
创建 `src/phaser/timeline/managers/ThumbnailPoolManager.js`
- 实现对象池模式
- 实现对象获取/释放
- 添加池大小动态调整

#### 步骤 2.3：实现缩略图生成器
创建 `src/phaser/timeline/components/ThumbnailGenerator.js`
- 集成 VideoFrameExtractor
- 实现批量生成
- 实现进度回调

**验收标准：**
- ✅ 缓存正常工作，不超过限制
- ✅ 对象池复用正常
- ✅ 能批量生成缩略图

---

### 阶段 3：Phaser 场景集成（第6-8天）

#### 步骤 3.1：创建 Phaser 场景
创建 `src/phaser/timeline/scenes/TimelineThumbnailScene.js`
- 实现场景生命周期
- 创建容器层级
- 设置相机

#### 步骤 3.2：实现缩略图渲染器
创建 `src/phaser/timeline/components/ThumbnailRenderer.js`
- 实现可视区域计算
- 实现虚拟滚动
- 集成纹理池和缓存

#### 步骤 3.3：实现滚动控制器
创建 `src/phaser/timeline/components/ThumbnailScroller.js`
- 实现拖拽滚动
- 实现滚轮缩放
- 添加惯性效果

**验收标准：**
- ✅ 场景正常启动
- ✅ 缩略图正确渲染
- ✅ 滚动交互流畅

---

### 阶段 4：系统集成（第9-10天）

#### 步骤 4.1：集成到主应用
修改 `index.html` 或主入口文件
```javascript
// 创建 Phaser 配置
const config = {
  type: Phaser.AUTO,
  parent: 'timeline-thumbnail-container',
  width: 800,
  height: 80,
  scene: TimelineThumbnailScene,
  transparent: true
};

// 创建游戏实例
const game = new Phaser.Game(config);
```

#### 步骤 4.2：事件总线通信
```javascript
// 在现有代码中触发事件
window.dispatchEvent(new CustomEvent('video:loaded', {
  detail: { videoElement, duration }
}));

// 在 Phaser 场景中监听
window.addEventListener('video:loaded', (e) => {
  this.loadVideo(e.detail.videoElement);
});
```

#### 步骤 4.3：添加配置开关
在配置文件中添加：
```javascript
enablePhaserThumbnails: true  // 启用/禁用功能
```

**验收标准：**
- ✅ 与现有系统无冲突
- ✅ 事件通信正常
- ✅ 可通过配置开关控制

---

### 阶段 5：性能优化（第11-12天）

#### 步骤 5.1：实现分帧渲染
```javascript
// 使用 requestIdleCallback
requestIdleCallback(() => {
  this.generateNextThumbnail();
});
```

#### 步骤 5.2：添加性能监控
```javascript
// 监控帧率
this.scene.game.loop.actualFps

// 监控内存
performance.memory.usedJSHeapSize
```

#### 步骤 5.3：优化纹理大小
```javascript
// 根据设备性能动态调整
const scale = this.getDeviceScale();
const width = baseWidth * scale;
const height = baseHeight * scale;
```

**验收标准：**
- ✅ 帧率稳定在 60fps
- ✅ 内存使用合理
- ✅ 滚动流畅无卡顿

---

### 阶段 6：测试与文档（第13-14天）

#### 步骤 6.1：单元测试
创建 `test-timeline-thumbnail.html`
- 测试视频帧提取
- 测试缓存管理
- 测试对象池

#### 步骤 6.2：集成测试
- 测试完整流程
- 测试边界情况
- 测试性能指标

#### 步骤 6.3：编写使用文档
创建 `TIMELINE_THUMBNAIL_USAGE.md`
- API 文档
- 配置说明
- 故障排查

**验收标准：**
- ✅ 所有测试通过
- ✅ 文档完整清晰
- ✅ 无已知 bug

---

## 🎨 UI 集成方案

### HTML 结构
```html
<div id="timeline-container">
  <!-- Phaser 渲染容器 -->
  <div id="timeline-thumbnail-phaser"></div>
  
  <!-- 时间刻度（DOM） -->
  <div id="timeline-ruler"></div>
  
  <!-- 播放头（DOM） -->
  <div id="timeline-playhead"></div>
</div>
```

### CSS 样式
```css
#timeline-thumbnail-phaser {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 1;
}

#timeline-ruler {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  z-index: 2;
}

#timeline-playhead {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: white;
  z-index: 3;
}
```

---

## 🔍 关键技术细节

### 1. 视频帧提取优化

#### 使用 OffscreenCanvas
```javascript
// 在 Web Worker 中处理
const canvas = new OffscreenCanvas(width, height);
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0, width, height);
const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
```

#### 智能采样
```javascript
// 优先提取关键帧
const keyframes = await this.detectKeyframes(video);
const samples = this.mergeSamples(keyframes, regularSamples);
```

### 2. Phaser 纹理管理

#### 动态添加纹理
```javascript
// 从 Blob 创建纹理
const texture = this.textures.addBase64(
  `thumbnail_${timestamp}`,
  base64Data
);
```

#### 纹理销毁
```javascript
// 及时销毁不用的纹理
this.textures.remove(`thumbnail_${timestamp}`);
```

### 3. 性能优化技巧

#### 节流渲染
```javascript
let lastRenderTime = 0;
const RENDER_INTERVAL = 16; // 60fps

update(time) {
  if (time - lastRenderTime < RENDER_INTERVAL) return;
  lastRenderTime = time;
  
  this.renderVisibleThumbnails();
}
```

#### 预加载策略
```javascript
// 预加载相邻区域
const preloadRange = {
  start: visibleStart - PRELOAD_COUNT,
  end: visibleEnd + PRELOAD_COUNT
};
```

---

## ⚠️ 注意事项

### 1. 不影响现有功能
- ✅ 使用独立的 Phaser 场景
- ✅ 通过事件总线通信，不直接调用现有代码
- ✅ 提供配置开关，可随时禁用
- ✅ 降级方案：禁用时使用原有实现

### 2. 文件大小控制
- ✅ 每个文件不超过 200 行
- ✅ 单一职责原则
- ✅ 避免重复代码
- ✅ 合理使用工具函数

### 3. 内存管理
- ✅ 限制缓存大小
- ✅ 及时销毁纹理
- ✅ 使用对象池
- ✅ 监听页面可见性，释放资源

### 4. 兼容性
- ✅ 提供降级方案
- ✅ 检测 API 支持
- ✅ 错误处理完善
- ✅ 测试多种浏览器

---

## 📊 性能指标

### 目标指标
- 帧率：≥ 60fps
- 内存：≤ 100MB（50个缩略图）
- 首次渲染：≤ 500ms
- 滚动延迟：≤ 16ms

### 监控方法
```javascript
// 帧率监控
console.log('FPS:', this.game.loop.actualFps);

// 内存监控
console.log('Memory:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');

// 渲染时间
const start = performance.now();
this.render();
console.log('Render time:', performance.now() - start, 'ms');
```

---

## 🚀 快速开始

### 最小可用示例
```javascript
// 1. 创建场景
const scene = new TimelineThumbnailScene();

// 2. 创建 Phaser 游戏
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'timeline-container',
  width: 800,
  height: 80,
  scene: scene,
  transparent: true
});

// 3. 加载视频
const video = document.querySelector('video');
scene.loadVideo(video);

// 4. 开始生成缩略图
scene.generateThumbnails();
```

---

## 📚 参考资料

### Phaser 官方文档
- [Phaser 3 API](https://photonstorm.github.io/phaser3-docs/)
- [Scene 生命周期](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)
- [Texture Manager](https://photonstorm.github.io/phaser3-docs/Phaser.Textures.TextureManager.html)
- [Camera](https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html)

### Web API
- [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)
- [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [VideoFrame API](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame)

---

## ✅ 验收清单

### 功能完整性
- [ ] 能正确提取视频帧
- [ ] 缩略图正确显示
- [ ] 滚动交互流畅
- [ ] 缩放功能正常
- [ ] 播放头同步

### 性能指标
- [ ] 帧率 ≥ 60fps
- [ ] 内存使用合理
- [ ] 无内存泄漏
- [ ] 滚动无卡顿

### 代码质量
- [ ] 文件大小符合要求
- [ ] 代码结构清晰
- [ ] 注释完整
- [ ] 无 ESLint 错误

### 集成测试
- [ ] 不影响现有功能
- [ ] 事件通信正常
- [ ] 配置开关有效
- [ ] 降级方案可用

---

## 🎯 下一步行动

1. **确认方案**：请确认以上方案是否符合需求
2. **开始实施**：按照阶段 1 开始实施
3. **持续沟通**：每个阶段完成后进行验收
4. **迭代优化**：根据实际情况调整方案

---

**文档版本**：v1.0  
**创建日期**：2026-01-27  
**最后更新**：2026-01-27
