# LoadingManager 使用指南

## 简介
LoadingManager 是一个基于 Phaser Tween 系统的加载动画管理器，提供平滑的视觉反馈。

## 基本用法

### 1. 获取实例
```javascript
const scene = game.scene.getScene('EditorScene');
const loader = scene.loadingManager;
```

### 2. 显示简单加载动画
```javascript
// 显示加载动画（无进度条）
loader.show('正在加载...');

// 模拟异步操作
setTimeout(() => {
    loader.hide();
}, 2000);
```

### 3. 显示带进度条的加载动画
```javascript
// 显示加载动画（带进度条）
loader.show('正在处理数据...', true);

// 模拟进度更新
let progress = 0;
const interval = setInterval(() => {
    progress += 0.1;
    loader.updateProgress(progress);
    loader.updateMessage(`处理中 ${Math.round(progress * 100)}%`);
    
    if (progress >= 1) {
        clearInterval(interval);
        loader.hide(() => {
            console.log('完成！');
        });
    }
}, 200);
```

## API 参考

### show(message, showProgress)
显示加载动画

**参数：**
- `message` (string): 加载消息，默认 "加载中..."
- `showProgress` (boolean): 是否显示进度条，默认 false

**示例：**
```javascript
loader.show('正在加载视频...', false);
loader.show('正在导入数据...', true);
```

### updateProgress(progress)
更新进度条

**参数：**
- `progress` (number): 进度值，范围 0-1

**示例：**
```javascript
loader.updateProgress(0.5);  // 50%
loader.updateProgress(0.75); // 75%
loader.updateProgress(1.0);  // 100%
```

### updateMessage(message)
更新加载消息

**参数：**
- `message` (string): 新消息

**示例：**
```javascript
loader.updateMessage('正在处理第 1/10 项...');
loader.updateMessage('正在处理第 2/10 项...');
```

### hide(onComplete)
隐藏加载动画

**参数：**
- `onComplete` (function): 完成回调（可选）

**示例：**
```javascript
// 简单隐藏
loader.hide();

// 带回调
loader.hide(() => {
    console.log('动画已隐藏');
    toast.success('加载完成！');
});
```

## 实际应用示例

### 视频加载（VideoController）
```javascript
// 开始加载
this.video.addEventListener('loadstart', () => {
    const scene = this.game.scene.getScene('EditorScene');
    if (scene && scene.loadingManager) {
        scene.loadingManager.show('正在加载视频...', false);
    }
});

// 加载完成
this.video.addEventListener('loadedmetadata', () => {
    const scene = this.game.scene.getScene('EditorScene');
    if (scene && scene.loadingManager) {
        scene.loadingManager.hide();
    }
});

// 加载失败
this.video.addEventListener('error', () => {
    const scene = this.game.scene.getScene('EditorScene');
    if (scene && scene.loadingManager) {
        scene.loadingManager.hide();
    }
});
```

### 数据导入（DataManager）
```javascript
importData(data) {
    const scene = this.game.scene.getScene('EditorScene');
    
    // 显示加载动画
    if (scene && scene.loadingManager) {
        scene.loadingManager.show('正在导入数据...', true);
    }
    
    const total = data.hotspots.length;
    let imported = 0;
    
    // 导入数据
    data.hotspots.forEach((config) => {
        scene.addHotspot(config);
        imported++;
        
        // 更新进度
        if (scene.loadingManager) {
            const progress = imported / total;
            scene.loadingManager.updateProgress(progress);
            scene.loadingManager.updateMessage(`正在导入 ${imported}/${total}`);
        }
    });
    
    // 隐藏加载动画
    if (scene.loadingManager) {
        scene.loadingManager.hide(() => {
            toast.success(`成功导入 ${total} 个热区`);
        });
    }
}
```

## 技术细节

### Phaser 对象使用
- `scene.add.rectangle()` - 创建遮罩
- `scene.add.text()` - 创建文本
- `scene.add.graphics()` - 创建图形
- `scene.add.image()` - 创建图像
- `scene.tweens.add()` - 创建动画

### 动画参数
- 淡入/淡出时间：300ms
- 旋转速度：360度/秒
- 进度条过渡：200ms
- 缓动函数：Power2

### 层级设置
- 遮罩：10000
- 文本/图标：10001
- 进度条：10002

### 资源管理
- 所有对象在 hide() 后自动销毁
- 使用 destroy() 方法清理资源
- 防止重复显示（isShowing 标志）

## 注意事项

1. **单例模式**：同一时间只能显示一个加载动画
2. **资源清理**：hide() 会自动销毁所有对象
3. **错误处理**：确保在 catch 块中调用 hide()
4. **进度范围**：progress 值会自动限制在 0-1 之间
5. **场景依赖**：必须在 EditorScene 创建后使用

## 最佳实践

### ✅ 推荐
```javascript
// 使用 try-catch 确保动画正确隐藏
try {
    loader.show('处理中...', true);
    // 执行操作
    loader.hide();
} catch (error) {
    loader.hide();
    console.error(error);
}
```

### ❌ 避免
```javascript
// 不要忘记隐藏动画
loader.show('加载中...');
// 操作完成后忘记调用 hide()

// 不要在动画显示时再次调用 show()
loader.show('消息1');
loader.show('消息2'); // 会被忽略
```
