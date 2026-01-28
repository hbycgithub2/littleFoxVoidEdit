// 深度10层诊断脚本 - 缩略图不显示问题

console.log('========== 深度10层诊断开始 ==========\n');

// 层1: 检查全局对象
console.log('📦 层1: 全局对象检查');
console.log('  window.game:', !!window.game);
console.log('  window.thumbnailInitializer:', !!window.thumbnailInitializer);
console.log('  window.videoController:', !!window.videoController);

// 层2: 检查Phaser Game
if (window.game) {
    console.log('\n🎮 层2: Phaser Game检查');
    console.log('  game.scene:', !!window.game.scene);
    console.log('  game.textures:', !!window.game.textures);
    console.log('  game.events:', !!window.game.events);
}

// 层3: 检查Scene
if (window.game && window.game.scene) {
    console.log('\n🎬 层3: Scene检查');
    const scene = window.game.scene.getScene('TimelineThumbnailScene');
    console.log('  TimelineThumbnailScene:', !!scene);
    if (scene) {
        console.log('  scene.thumbnailLayer:', !!scene.thumbnailLayer);
        console.log('  scene.cameras.main:', !!scene.cameras.main);
        console.log('  scene.textures:', !!scene.textures);
    }
}

// 层4: 检查ThumbnailInitializer
if (window.thumbnailInitializer) {
    console.log('\n🔧 层4: ThumbnailInitializer检查');
    console.log('  initialized:', window.thumbnailInitializer.initialized);
    console.log('  config.enabled:', window.thumbnailInitializer.config.enabled);
    console.log('  version:', window.thumbnailInitializer.version);
    console.log('  renderer:', !!window.thumbnailInitializer.renderer);
    console.log('  scroller:', !!window.thumbnailInitializer.scroller);
    console.log('  eventBridge:', !!window.thumbnailInitializer.eventBridge);
}

// 层5: 检查Renderer
if (window.thumbnailInitializer && window.thumbnailInitializer.renderer) {
    console.log('\n🎨 层5: Renderer检查');
    const renderer = window.thumbnailInitializer.renderer;
    console.log('  extractor:', !!renderer.extractor);
    console.log('  frames.length:', renderer.frames.length);
    console.log('  visibleThumbnails.size:', renderer.visibleThumbnails.size);
    console.log('  generating:', renderer.generating);
}

// 层6: 检查Video元素
console.log('\n📹 层6: Video元素检查');
const video = document.getElementById('video');
console.log('  video元素:', !!video);
if (video) {
    console.log('  duration:', video.duration);
    console.log('  videoWidth:', video.videoWidth);
    console.log('  videoHeight:', video.videoHeight);
    console.log('  readyState:', video.readyState);
}

// 层7: 检查EventBridge
if (window.thumbnailInitializer && window.thumbnailInitializer.eventBridge) {
    console.log('\n🌉 层7: EventBridge检查');
    const bridge = window.thumbnailInitializer.eventBridge;
    console.log('  listenerCount(video-loaded):', bridge.listenerCount('video-loaded'));
}

// 层8: 检查Phaser纹理
if (window.game && window.game.textures) {
    console.log('\n🖼️ 层8: Phaser纹理检查');
    const textureManager = window.game.textures;
    const textureKeys = textureManager.getTextureKeys();
    console.log('  总纹理数:', textureKeys.length);
    const thumbnailTextures = textureKeys.filter(k => k.startsWith('thumbnail_'));
    console.log('  缩略图纹理数:', thumbnailTextures.length);
    if (thumbnailTextures.length > 0) {
        console.log('  前3个纹理:', thumbnailTextures.slice(0, 3));
    }
}

// 层9: 检查Scene的GameObject
if (window.game) {
    const scene = window.game.scene.getScene('TimelineThumbnailScene');
    if (scene && scene.thumbnailLayer) {
        console.log('\n🎮 层9: GameObject检查');
        console.log('  thumbnailLayer.list.length:', scene.thumbnailLayer.list.length);
        console.log('  thumbnailLayer.visible:', scene.thumbnailLayer.visible);
        console.log('  thumbnailLayer.x:', scene.thumbnailLayer.x);
        console.log('  thumbnailLayer.y:', scene.thumbnailLayer.y);
    }
}

// 层10: 检查Camera
if (window.game) {
    const scene = window.game.scene.getScene('TimelineThumbnailScene');
    if (scene && scene.cameras.main) {
        console.log('\n📷 层10: Camera检查');
        const camera = scene.cameras.main;
        console.log('  scrollX:', camera.scrollX);
        console.log('  scrollY:', camera.scrollY);
        console.log('  width:', camera.width);
        console.log('  height:', camera.height);
        console.log('  bounds:', camera.getBounds());
    }
}

console.log('\n========== 深度10层诊断完成 ==========');
console.log('\n💡 手动测试命令:');
console.log('  thumbnailInitializer.enable("v3.0")');
console.log('  thumbnailInitializer.loadVideo(document.getElementById("video"))');
console.log('  thumbnailInitializer.getPerformanceStats()');
