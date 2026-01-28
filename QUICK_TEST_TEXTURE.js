// 快速测试纹理修复
// 在 test-thumbnail-simple.html 页面的控制台运行

(async function() {
    console.log('\n🚀 快速测试开始...\n');
    
    // 1. 检查环境
    if (!window.game) {
        console.error('❌ window.game 未找到');
        return;
    }
    
    if (!window.thumbnailInitializer) {
        console.error('❌ window.thumbnailInitializer 未找到');
        return;
    }
    
    console.log('✅ 环境检查通过');
    
    // 2. 启用功能
    console.log('\n📦 启用缩略图功能...');
    window.thumbnailInitializer.enable('v3.0');
    
    // 等待Scene创建
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const scene = window.game.scene.getScene('TimelineThumbnailScene');
    if (!scene) {
        console.error('❌ Scene创建失败');
        return;
    }
    
    console.log('✅ Scene已创建');
    
    // 3. 加载视频
    const video = document.getElementById('video');
    if (!video || !video.duration) {
        console.error('❌ 视频未加载');
        return;
    }
    
    console.log('✅ 视频已加载:', video.duration.toFixed(2) + 's');
    
    // 4. 生成缩略图
    console.log('\n🎬 生成缩略图...');
    await window.thumbnailInitializer.loadVideo(video);
    
    // 等待生成完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. 验证结果
    console.log('\n📊 验证结果:');
    
    const stats = window.thumbnailInitializer.renderer.getStats();
    console.log('统计:', stats);
    
    if (scene.thumbnailLayer.list.length === 0) {
        console.error('❌ 没有缩略图生成');
        return;
    }
    
    console.log('✅ 缩略图数量:', scene.thumbnailLayer.list.length);
    
    // 检查前3个
    console.log('\n🔍 检查前3个缩略图:');
    for (let i = 0; i < Math.min(3, scene.thumbnailLayer.list.length); i++) {
        const img = scene.thumbnailLayer.list[i];
        const isValid = img.texture.key.startsWith('thumbnail_') && 
                       img.texture.source[0]?.width > 32;
        
        console.log(`Image#${i}:`, {
            texture: img.texture.key,
            size: `${img.texture.source[0]?.width}x${img.texture.source[0]?.height}`,
            position: `(${img.x}, ${img.y})`,
            visible: img.visible,
            valid: isValid ? '✅' : '❌'
        });
    }
    
    // 6. 最终结论
    const allValid = scene.thumbnailLayer.list.every(img => 
        img.texture.key.startsWith('thumbnail_') && 
        img.texture.source[0]?.width > 32
    );
    
    console.log('\n' + '='.repeat(50));
    if (allValid) {
        console.log('🎉 测试通过！纹理加载修复成功！');
        console.log('💡 现在应该可以在画布上看到视频缩略图了');
    } else {
        console.log('❌ 测试失败，仍有问题');
        console.log('💡 请检查控制台错误信息');
    }
    console.log('='.repeat(50) + '\n');
    
})();
