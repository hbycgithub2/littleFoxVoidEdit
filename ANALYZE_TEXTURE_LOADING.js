// 深度分析纹理加载问题
// 在浏览器控制台运行

console.log('\n========== 纹理加载深度分析 ==========\n');

// 问题1: textures.once('addtexture')可能在纹理已添加后才监听
console.log('🔍 问题分析:');
console.log('');
console.log('当前代码逻辑:');
console.log('  1. 调用 textures.once("addtexture", callback)');
console.log('  2. 调用 textures.addBase64(key, base64)');
console.log('  3. 等待事件触发');
console.log('');
console.log('⚠️ 潜在问题:');
console.log('  - addBase64是异步的，但事件可能在监听器设置前就触发');
console.log('  - once只监听一次，如果错过就永远不会触发');
console.log('  - 多个纹理同时加载时，once可能只捕获第一个');
console.log('');

// 解决方案
console.log('💡 解决方案:');
console.log('');
console.log('方案1: 使用纹理加载完成回调');
console.log('  textures.addBase64(key, base64).then(() => {');
console.log('    image.setTexture(key);');
console.log('  });');
console.log('');
console.log('方案2: 先监听，再添加（当前方案）');
console.log('  textures.once("addtexture", () => {...});');
console.log('  textures.addBase64(key, base64);');
console.log('');
console.log('方案3: 使用on而不是once，并手动管理');
console.log('  const handler = (key) => {');
console.log('    if (key === textureKey) {');
console.log('      image.setTexture(key);');
console.log('      textures.off("addtexture", handler);');
console.log('    }');
console.log('  };');
console.log('  textures.on("addtexture", handler);');
console.log('  textures.addBase64(key, base64);');
console.log('');

// 检查Phaser API
console.log('📚 Phaser API检查:');
const scene = window.game?.scene.getScene('TimelineThumbnailScene');
if (scene) {
    console.log('  textures.addBase64类型:', typeof scene.textures.addBase64);
    console.log('  textures.once类型:', typeof scene.textures.once);
    console.log('  textures.on类型:', typeof scene.textures.on);
    
    // 测试addBase64返回值
    console.log('');
    console.log('🧪 测试addBase64返回值:');
    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = scene.textures.addBase64('test_texture_' + Date.now(), testBase64);
    console.log('  返回值类型:', typeof result);
    console.log('  返回值:', result);
    console.log('  是否是Promise:', result instanceof Promise);
} else {
    console.log('  ⚠️ Scene未找到，无法测试');
}

console.log('\n========== 分析完成 ==========\n');
