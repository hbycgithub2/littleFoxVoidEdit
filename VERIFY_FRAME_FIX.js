// 验证帧提取修复
// 在 test-thumbnail-simple.html 控制台运行

(async function() {
    console.log('\n========== 验证帧提取修复 ==========\n');
    
    // 1. 检查环境
    const video = document.getElementById('video');
    if (!video || !video.duration) {
        console.error('❌ 视频未加载');
        return;
    }
    
    console.log('✅ 视频已加载:', video.duration.toFixed(2) + 's');
    
    // 2. 清理旧数据
    if (window.thumbnailInitializer) {
        console.log('🧹 清理旧数据...');
        const scene = window.game?.scene.getScene('TimelineThumbnailScene');
        if (scene) {
            scene.thumbnailLayer?.removeAll(true);
        }
        if (window.thumbnailInitializer.renderer) {
            window.thumbnailInitializer.renderer.frames = [];
            window.thumbnailInitializer.renderer.visibleThumbnails.clear();
        }
    }
    
    // 3. 重新启用
    console.log('\n📦 启用缩略图功能...');
    window.thumbnailInitializer.enable('v3.0');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const scene = window.game.scene.getScene('TimelineThumbnailScene');
    if (!scene) {
        console.error('❌ Scene创建失败');
        return;
    }
    console.log('✅ Scene已创建');
    
    // 4. 生成缩略图
    console.log('\n🎬 开始生成缩略图...');
    console.log('⏱️ 这可能需要10-30秒，请耐心等待...\n');
    
    const startTime = Date.now();
    await window.thumbnailInitializer.loadVideo(video);
    const endTime = Date.now();
    
    console.log(`\n✅ 生成完成，耗时: ${((endTime - startTime) / 1000).toFixed(1)}s`);
    
    // 5. 验证结果
    console.log('\n📊 验证结果:');
    
    const renderer = window.thumbnailInitializer.renderer;
    if (!renderer) {
        console.error('❌ Renderer未找到');
        return;
    }
    
    const frames = renderer.frames;
    console.log('  总帧数:', frames.length);
    
    if (frames.length === 0) {
        console.error('❌ 没有提取到帧');
        return;
    }
    
    // 检查前5帧的时间戳
    console.log('\n🔍 前5帧时间戳:');
    frames.slice(0, 5).forEach((frame, i) => {
        console.log(`  帧${i}: ${frame.timestamp.toFixed(2)}s`);
    });
    
    // 检查base64是否不同
    console.log('\n🔍 检查帧内容是否不同:');
    const base64Samples = frames.slice(0, 5).map(f => f.base64.substring(0, 100));
    const allSame = base64Samples.every(b => b === base64Samples[0]);
    
    if (allSame) {
        console.error('❌ 所有帧的base64相同！提取失败！');
        console.log('💡 可能原因:');
        console.log('  1. seeked事件未正确触发');
        console.log('  2. video.currentTime设置失败');
        console.log('  3. 视频seeking状态异常');
    } else {
        console.log('✅ 帧内容不同，提取成功！');
    }
    
    // 检查缩略图显示
    console.log('\n🔍 检查缩略图显示:');
    const thumbnailCount = scene.thumbnailLayer.list.length;
    console.log('  缩略图数量:', thumbnailCount);
    
    if (thumbnailCount > 0) {
        console.log('  前3个缩略图:');
        scene.thumbnailLayer.list.slice(0, 3).forEach((img, i) => {
            console.log(`    #${i}:`, {
                texture: img.texture.key,
                position: `(${img.x}, ${img.y})`,
                size: `${img.texture.source[0]?.width}x${img.texture.source[0]?.height}`
            });
        });
    }
    
    // 最终结论
    console.log('\n' + '='.repeat(50));
    if (!allSame && thumbnailCount > 0) {
        console.log('🎉 修复成功！');
        console.log('💡 现在应该可以看到不同的视频缩略图了');
    } else {
        console.log('❌ 仍有问题');
        if (allSame) {
            console.log('  - 帧提取失败（所有帧相同）');
        }
        if (thumbnailCount === 0) {
            console.log('  - 缩略图渲染失败');
        }
    }
    console.log('='.repeat(50) + '\n');
    
})();
