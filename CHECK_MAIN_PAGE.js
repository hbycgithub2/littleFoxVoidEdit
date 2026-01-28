// 检查主页面缩略图状态
console.log('\n========== 主页面缩略图诊断 ==========\n');

// 1. 检查容器
const container = document.getElementById('timelineThumbnailContainer');
console.log('1️⃣ 容器:', {
    exists: !!container,
    display: container?.style.display,
    width: container?.clientWidth,
    height: container?.clientHeight
});

// 2. 检查Phaser Game
console.log('\n2️⃣ Phaser Game:', {
    thumbnailGame: !!window.thumbnailGame,
    thumbnailInitializer: !!window.thumbnailInitializer
});

if (window.thumbnailGame) {
    console.log('  Game配置:', {
        width: window.thumbnailGame.config.width,
        height: window.thumbnailGame.config.height,
        sceneCount: window.thumbnailGame.scene.scenes.length
    });
}

// 3. 检查Scene
if (window.thumbnailGame) {
    const scene = window.thumbnailGame.scene.getScene('TimelineThumbnailScene');
    console.log('\n3️⃣ Scene:', {
        exists: !!scene,
        active: scene?.scene.isActive(),
        visible: scene?.scene.isVisible()
    });
    
    if (scene) {
        console.log('  Scene状态:', {
            thumbnailLayer: !!scene.thumbnailLayer,
            thumbnailCount: scene.thumbnailLayer?.list.length
        });
    }
}

// 4. 检查视频
const video = document.querySelector('video');
console.log('\n4️⃣ 视频:', {
    exists: !!video,
    duration: video?.duration,
    readyState: video?.readyState,
    src: video?.src?.substring(0, 50)
});

// 5. 检查Renderer
if (window.thumbnailInitializer?.renderer) {
    const stats = window.thumbnailInitializer.renderer.getStats();
    console.log('\n5️⃣ Renderer:', stats);
} else {
    console.log('\n5️⃣ Renderer: 未初始化');
}

// 6. 手动触发生成
console.log('\n💡 如果视频已加载但没有缩略图，运行:');
console.log('  thumbnailInitializer.loadVideo(document.querySelector("video"))');

console.log('\n========== 诊断完成 ==========\n');
