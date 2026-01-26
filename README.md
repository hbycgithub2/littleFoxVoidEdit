# Little Fox Video Editor

> 视频热区编辑器 - 100% 遵循 Phaser 3 官方标准

## ✨ 特性

- 🎨 **多种绘制工具**: 圆形、矩形、椭圆、多边形
- 🎯 **精确编辑**: 拖拽移动、8方向缩放、多选操作
- ↩️ **撤销/重做**: 完整的命令历史管理
- 📋 **复制/粘贴**: 批量操作支持
- 💾 **数据管理**: JSON 导出/导入，数据验证
- ⏱️ **时间轴控制**: 热区根据视频时间显示/隐藏
- ⌨️ **快捷键支持**: 提高工作效率
- ⚡ **性能优化**: 脏标记、对象池、事件优化、内存管理
- 🎉 **用户体验**: Toast 提示、工具提示、扩展快捷键

## 🚀 快速开始

### 启动项目

```bash
# 方法 1：使用 Python（推荐）
python -m http.server 8000

# 方法 2：使用 Node.js
npx http-server -p 8000

# 方法 3：使用 Live Server（VS Code）
# 右键 index.html → Open with Live Server
```

**访问地址**: http://localhost:8000

### 准备视频文件

将视频文件放在 `assets/videos/` 目录下，并在 `index.html` 中更新视频路径。

## 📖 使用指南

### 基础操作

1. **绘制热区**
   - 点击工具栏选择绘制工具（⭕ 圆形 / ▭ 矩形 / ⬭ 椭圆 / ⬟ 多边形）
   - 在视频上拖拽绘制（多边形需点击添加顶点，按 Enter 完成）

2. **选择热区**
   - 单击热区选中（变红色）
   - Ctrl+点击多选

3. **编辑热区**
   - 拖拽移动热区
   - 拖拽白色手柄缩放
   - 在属性面板编辑单词、时间、颜色

4. **删除热区**
   - 选中后按 Delete 键
   - 或点击属性面板的「删除」按钮

5. **撤销/重做**
   - Ctrl+Z 撤销
   - Ctrl+Shift+Z 或 Ctrl+Y 重做

6. **复制/粘贴**
   - Ctrl+C 复制选中的热区
   - Ctrl+V 粘贴（自动偏移 20px）

7. **导出/导入**
   - 点击「💾 导出」保存 JSON 文件
   - 点击「📂 导入」加载 JSON 文件

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` / `Ctrl+Y` | 重做 |
| `Ctrl+C` | 复制选中的热区 |
| `Ctrl+V` | 粘贴热区 |
| `Ctrl+A` | 全选热区 |
| `Ctrl+D` | 取消选择 |
| `Ctrl+S` | 保存（导出） |
| `Ctrl+O` | 打开（导入） |
| `Space` | 播放/暂停视频 |
| `Delete` | 删除选中的热区 |
| `Esc` | 取消绘制模式 |
| `Enter` | 完成多边形绘制 |
| `Ctrl+点击` | 多选热区 |

## 🏗️ 项目架构

### 文件结构

```
littleFoxVoidEdit/
├── index.html                    # 入口 HTML
├── css/style.css                 # 样式文件
├── src/
│   ├── main.js                   # 应用入口
│   ├── core/                     # 核心工具层
│   │   ├── CommandManager.js     # 命令管理器（撤销/重做）
│   │   ├── SelectionManager.js   # 选择管理器（多选）
│   │   ├── HotspotRegistry.js    # 热区注册表（工厂模式）
│   │   ├── HotspotPool.js        # 热区对象池（性能优化）
│   │   └── DataValidator.js      # 数据验证器
│   ├── phaser/                   # Phaser 层
│   │   ├── config.js             # Phaser 配置
│   │   ├── scenes/               # 场景
│   │   │   └── EditorScene.js    # 主编辑场景
│   │   ├── gameobjects/          # 游戏对象
│   │   │   ├── Hotspot.js        # 热区基类
│   │   │   ├── CircleHotspot.js  # 圆形热区
│   │   │   ├── RectHotspot.js    # 矩形热区
│   │   │   ├── EllipseHotspot.js # 椭圆热区
│   │   │   └── PolygonHotspot.js # 多边形热区
│   │   └── managers/             # 管理器
│   │       ├── DrawingManager.js         # 绘制管理器
│   │       ├── PolygonDrawingManager.js  # 多边形绘制管理器
│   │       ├── InputManager.js           # 输入管理器
│   │       └── DragOptimizer.js          # 拖拽优化器
│   ├── dom/                      # DOM 控制层
│   │   ├── VideoController.js    # 视频控制器
│   │   ├── UIController.js       # UI 控制器
│   │   ├── PropertyPanelController.js    # 属性面板控制器
│   │   └── HotspotListController.js      # 热区列表控制器
│   ├── data/                     # 数据层
│   │   └── DataManager.js        # 数据管理器
│   └── utils/                    # 工具层
│       ├── PerformanceMonitor.js # 性能监控
│       ├── Throttle.js           # 防抖节流
│       ├── RenderOptimizer.js    # 渲染优化器
│       ├── MemoryOptimizer.js    # 内存优化器
│       └── EventOptimizer.js     # 事件优化器
└── assets/
    └── videos/                   # 视频文件
```

### 设计模式

- **命令模式**: 撤销/重做功能
- **工厂模式**: 热区创建
- **观察者模式**: 事件系统
- **单例模式**: 热区注册表

## 🎯 技术特点

### 100% 遵循 Phaser 3 官方标准

- ✅ 使用 `Phaser.Scene` 作为核心架构
- ✅ 使用 `Phaser.GameObjects.Graphics` 绘制热区
- ✅ 使用 `Phaser.GameObjects.Container` 管理层级
- ✅ 使用 `setInteractive()` 和 `setDraggable()` 官方 API
- ✅ 使用 `scene.registry` 管理场景数据
- ✅ 使用 `scene.events` 和 `game.events` 处理事件
- ✅ 使用 `scene.add.existing()` 添加自定义对象
- ✅ 使用 `preUpdate()` 生命周期方法

### 性能优化（优先级 3）

- ✅ **脏标记系统**: 减少不必要的重绘
- ✅ **对象池管理**: 复用热区对象，减少 GC 压力
- ✅ **事件优化**: 自动管理事件监听器，防止内存泄漏
- ✅ **拖拽优化**: 使用节流和阈值优化拖拽性能
- ✅ **渲染优化**: 批量更新，减少渲染调用
- ✅ **内存管理**: 自动跟踪和清理对象
- ✅ **批量更新**: 只在状态变化时更新可见性

### 用户体验优化（优先级 4）

- ✅ **Toast 提示**: 操作反馈、成功/错误提示
- ✅ **工具提示**: 鼠标悬停显示快捷键
- ✅ **快捷键扩展**: Space、Ctrl+A、Ctrl+D、Ctrl+S、Ctrl+O
- ✅ **智能反馈**: 自动显示操作结果

### 代码质量

- ✅ ES6 模块化
- ✅ 完整的注释
- ✅ 单一职责原则
- ✅ 每个文件不超过 300 行
- ✅ 性能优化（缓存、防抖、脏标记）

## 📚 文档

- [架构设计文档](ARCHITECTURE_OPTIMIZED.md) - 完整的架构设计
- [快速开始指南](QUICK_START.md) - 快速上手
- [测试清单](TEST_CHECKLIST.md) - 功能测试
- [实现状态](IMPLEMENTATION_STATUS.md) - 开发进度
- [优先级 1 完成报告](PRIORITY1_COMPLETE.md) - 最新进展

## 🧪 测试

查看 [快速测试指南](QUICK_TEST_PRIORITY1.md) 进行功能测试。

## 🔧 开发

### 添加新的热区类型

```javascript
// 1. 创建新的热区类
import Hotspot from './Hotspot.js';

export default class CustomHotspot extends Hotspot {
    draw() {
        // 绘制逻辑
    }
    
    getHitArea() {
        // 碰撞区域
    }
}

// 2. 注册到注册表
import hotspotRegistry from '../core/HotspotRegistry.js';
hotspotRegistry.register('custom', CustomHotspot);
```

## 📊 性能

- **FPS**: 60 FPS 流畅运行
- **支持热区数量**: 50+
- **内存占用**: < 100MB
- **响应速度**: < 100ms

## 🌐 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 许可证

MIT License

---

**技术栈**: Phaser 3.60+ | ES6 Modules | HTML5 Video  
**版本**: 1.0.0  
**更新日期**: 2025-01-26
