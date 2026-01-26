# Little Fox Video Editor - 快速开始指南

## 🚀 快速启动

### 1. 准备环境

**必需条件**：
- 现代浏览器（Chrome、Firefox、Edge、Safari）
- 本地 Web 服务器（推荐使用 VS Code 的 Live Server 插件）

**可选条件**：
- 测试视频文件（MP4 格式）

### 2. 启动项目

#### 方法 1：使用 VS Code Live Server
1. 在 VS Code 中打开项目文件夹
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"
4. 浏览器自动打开项目

#### 方法 2：使用 Python 服务器
```bash
# Python 3
python -m http.server 8000

# 然后在浏览器打开
# http://localhost:8000
```

#### 方法 3：使用 Node.js 服务器
```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000

# 然后在浏览器打开
# http://localhost:8000
```

### 3. 准备视频文件

将测试视频文件放在 `assets/videos/sample.mp4`

如果没有视频文件，可以：
- 使用自己的视频
- 下载免费测试视频
- 使用浏览器录制屏幕

## 📖 基本操作

### 绘制热区

1. **圆形热区**
   - 点击工具栏的 ⭕ 按钮
   - 在视频上点击并拖拽
   - 释放鼠标完成绘制

2. **矩形热区**
   - 点击工具栏的 ▭ 按钮
   - 在视频上点击并拖拽
   - 释放鼠标完成绘制

3. **椭圆热区**
   - 点击工具栏的 ⬭ 按钮
   - 在视频上点击并拖拽
   - 释放鼠标完成绘制

4. **多边形热区**
   - 点击工具栏的 ⬟ 按钮
   - 在视频上点击添加顶点
   - 按 Enter 键完成绘制
   - 或点击起点附近闭合多边形

### 选择和编辑

1. **选择热区**
   - 单击热区选中
   - 按住 Ctrl/Cmd 键多选

2. **移动热区**
   - 拖拽热区到新位置

3. **缩放热区**
   - 选中热区后会显示缩放手柄
   - 拖拽手柄调整大小

4. **编辑属性**
   - 选中热区后在右侧属性面板编辑
   - 可以修改：单词、开始时间、结束时间、颜色

5. **删除热区**
   - 选中热区后按 Delete 键
   - 或点击属性面板的删除按钮

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` 或 `Ctrl+Y` | 重做 |
| `Ctrl+C` | 复制选中的热区 |
| `Ctrl+V` | 粘贴热区 |
| `Delete` | 删除选中的热区 |
| `ESC` | 取消绘制模式 |
| `Enter` | 完成多边形绘制 |

### 数据管理

1. **导出数据**
   - 点击工具栏的 💾 按钮
   - 自动下载 `hotspots.json` 文件

2. **导入数据**
   - 点击工具栏的 📂 按钮
   - 选择之前导出的 JSON 文件
   - 系统会验证数据并导入

## 🎯 功能特性

### 核心功能
- ✅ 绘制多种形状的热区（圆形、矩形、椭圆、多边形）
- ✅ 选择、移动、缩放热区
- ✅ 编辑热区属性（单词、时间、颜色）
- ✅ 撤销/重做操作
- ✅ 复制/粘贴热区
- ✅ 导出/导入 JSON 数据
- ✅ 热区列表管理
- ✅ 时间轴显示/隐藏

### 高级功能
- ✅ 多选功能（Ctrl/Cmd + 点击）
- ✅ 缩放手柄（8 个方向）
- ✅ 实时预览
- ✅ 数据验证
- ✅ 错误提示

## 🔧 技术架构

### 完全遵循 Phaser 3 官方标准
- 使用 `Phaser.Scene` 作为核心架构
- 使用 `Phaser.GameObjects.Graphics` 绘制热区
- 使用 `Phaser.GameObjects.Container` 管理层级
- 使用 `setInteractive()` 和 `setDraggable()` 官方 API
- 使用 `scene.registry` 管理场景数据
- 使用 `scene.events` 和 `game.events` 处理事件

### 三层架构
1. **Phaser 层**：热区对象、场景管理
2. **Core 工具层**：命令管理、选择管理、注册表
3. **DOM 层**：视频控制、UI 控制

## 📊 数据格式

### 导出的 JSON 格式

```json
{
  "version": "1.0",
  "createdAt": "2025-01-26T12:00:00.000Z",
  "hotspots": [
    {
      "id": 1706270400000,
      "shape": "circle",
      "x": 400,
      "y": 300,
      "radius": 50,
      "color": "#00ff00",
      "strokeWidth": 3,
      "word": "apple",
      "startTime": 0,
      "endTime": 5
    },
    {
      "id": 1706270500000,
      "shape": "rect",
      "x": 500,
      "y": 400,
      "width": 100,
      "height": 80,
      "color": "#00ff00",
      "strokeWidth": 3,
      "word": "banana",
      "startTime": 2,
      "endTime": 7
    }
  ]
}
```

### 热区类型

1. **圆形 (circle)**
   - `x`, `y`: 中心点坐标
   - `radius`: 半径

2. **矩形 (rect)**
   - `x`, `y`: 中心点坐标
   - `width`, `height`: 宽度和高度

3. **椭圆 (ellipse)**
   - `x`, `y`: 中心点坐标
   - `radiusX`, `radiusY`: X 轴和 Y 轴半径

4. **多边形 (polygon)**
   - `x`, `y`: 中心点坐标
   - `points`: 顶点数组（相对坐标）

## 🐛 常见问题

### 1. 视频无法播放
- 检查视频文件路径是否正确
- 确保视频格式为 MP4 (H.264)
- 某些浏览器需要 HTTPS 才能播放视频
- 检查浏览器控制台错误信息

### 2. Canvas 和视频不对齐
- 等待视频加载完成（loadedmetadata 事件）
- 检查 CSS 中的 transform 属性
- 确保 Phaser Canvas 透明度设置正确

### 3. 热区无法选中
- 检查热区是否在当前时间范围内
- 确保热区的 `startTime` 和 `endTime` 正确
- 检查浏览器控制台错误信息

### 4. 导入数据失败
- 检查 JSON 格式是否正确
- 确保所有必填字段都存在
- 查看错误提示信息

## 📚 扩展开发

### 添加新的热区类型

1. 创建新的热区类（继承 `Hotspot`）
2. 实现 `draw()` 和 `getHitArea()` 方法
3. 在 `HotspotRegistry` 中注册

示例：
```javascript
import Hotspot from './Hotspot.js';

export default class StarHotspot extends Hotspot {
    draw() {
        // 绘制五角星
        // ...
    }
    
    getHitArea() {
        return {
            shape: new Phaser.Geom.Polygon(points),
            callback: Phaser.Geom.Polygon.Contains
        };
    }
}

// 注册
import hotspotRegistry from '../core/HotspotRegistry.js';
hotspotRegistry.register('star', StarHotspot);
```

### 添加新的命令

在 `CommandManager.js` 中添加新的命令类：

```javascript
class CustomCommand extends Command {
    constructor(scene, params) {
        super();
        this.scene = scene;
        this.params = params;
    }
    
    execute() {
        // 执行操作
    }
    
    undo() {
        // 撤销操作
    }
}
```

## 🎉 总结

Little Fox Video Editor 是一个完全遵循 Phaser 3 官方标准的视频热区编辑器，具有：

- ✅ 完整的热区绘制和编辑功能
- ✅ 强大的撤销/重做系统
- ✅ 灵活的数据导出/导入
- ✅ 现代化的 UI 设计
- ✅ 良好的代码架构和扩展性

**开始使用吧！** 🚀

---

**版本**: 1.0.0  
**更新时间**: 2025-01-26  
**遵循标准**: Phaser 3 官方标准 100%
