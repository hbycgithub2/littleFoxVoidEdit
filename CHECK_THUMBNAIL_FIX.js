// 检查缩略图修复状态
// 在浏览器控制台运行此脚本

console.log('\n========== 缩略图修复验证 ==========\n');

// 1. 检查Scene
const scene = window.game?.scene.getScene('TimelineThumbnailScene');
console.log('1️⃣ Scene检查:');
console.log('  存在:', !!scene);

if (!scene) {
    console.error('❌ Scene未找到，请先启用缩略图功能');
    console.log('\n💡 执行: thumbnailInitializer.enable()');
} else {
    console.log('  ✅ Scene已创建');
    
    // 2. 检查Container
    console.log('\n2️⃣ Container检查:');
    console.log('  backgroundLayer:', {
        exists: !!scene.backgroundLayer,
        visible: scene.backgroundLayer?.visible,
        listLength: scene.backgroundLayer?.list.length
    });
    console.log('  thumbnailLayer:', {
        exists: !!scene.thumbnailLayer,
        visible: scene.thumbnailLayer?.visible,
        listLength: scene.thumbnailLayer?.list.length
    });
    
    // 3. 检查Camera
    console.log('\n3️⃣ Camera检查:');
    const camera = scene.cameras.main;
    console.log('  位置:', { x: camera.x, y: camera.y });
    console.log('  滚动:', { scrollX: camera.scrollX, scrollY: camera.scrollY });
    console.log('  尺寸:', { width: camera.width, height: camera.height });
    console.log('  边界:', camera.getBounds());
    
    // 4. 检查背景层（应该有红色测试矩形）
    console.log('\n4️⃣ 背景层检查:');
    if (scene.backgroundLayer && scene.backgroundLayer.list.length > 0) {
        console.log('  ✅ 背景层有', scene.backgroundLayer.list.length, '个对象');
        console.log('  第一个对象类型:', scene.backgroundLayer.list[0].type);
    } else {
        console.log('  ❌ 背景层为空');
    }
    
    // 5. 检查缩略图层
    console.log('\n5️⃣ 缩略图层检查:');
    if (scene.thumbnailLayer && scene.thumbnailLayer.list.length > 0) {
        console.log('  ✅ 缩略图层有', scene.thumbnailLayer.list.length, '个Image');
        
        // 检查前3个Image
        for (let i = 0; i < Math.min(3, scene.thumbnailLayer.list.length); i++) {
            const img = scene.thumbnailLayer.list[i];
            console.log(`  Image#${i}:`, {
                type: img.type,
                x: img.x,
                y: img.y,
                width: img.displayWidth,
                height: img.displayHeight,
                visible: img.visible,
                alpha: img.alpha,
                depth: img.depth,
                texture: img.texture.key,
                textureSize: `${img.texture.source[0]?.width}x${img.texture.source[0]?.height}`
            });
        }
    } else {
        console.log('  ⚠️ 缩略图层为空（可能还未生成）');
    }
    
    // 6. 检查纹理
    console.log('\n6️⃣ 纹理检查:');
    const textures = scene.textures;
    const textureKeys = textures.getTextureKeys();
    const thumbnailTextures = textureKeys.filter(k => k.startsWith('thumbnail_'));
    console.log('  总纹理数:', textureKeys.length);
    console.log('  缩略图纹理数:', thumbnailTextures.length);
    if (thumbnailTextures.length > 0) {
        console.log('  前5个缩略图纹理:', thumbnailTextures.slice(0, 5));
        
        // 检查第一个纹理的详细信息
        const firstTexture = textures.get(thumbnailTextures[0]);
        console.log('  第一个纹理详情:', {
            key: firstTexture.key,
            width: firstTexture.source[0]?.width,
            height: firstTexture.source[0]?.height,
            valid: firstTexture.source[0]?.width > 32 // 不是__MISSING纹理
        });
    }
    
    // 7. 检查Renderer
    console.log('\n7️⃣ Renderer检查:');
    if (window.thumbnailInitializer?.renderer) {
        const stats = window.thumbnailInitializer.renderer.getStats();
        console.log('  统计:', stats);
    } else {
        console.log('  ⚠️ Renderer未初始化');
    }
}

console.log('\n========== 验证完成 ==========\n');

// 8. 给出建议
console.log('💡 下一步操作:');
if (!scene) {
    console.log('  1. 刷新页面');
    console.log('  2. 点击"启用缩略图功能"按钮');
    console.log('  3. 点击"生成缩略图"按钮');
} else if (!scene.thumbnailLayer || scene.thumbnailLayer.list.length === 0) {
    console.log('  1. 点击"生成缩略图"按钮');
    console.log('  2. 等待几秒钟');
    console.log('  3. 再次运行此脚本');
} else {
    console.log('  ✅ 一切正常！');
    console.log('  - 如果看到红色测试矩形，说明Phaser渲染正常');
    console.log('  - 如果看到视频缩略图，说明修复成功！');
    console.log('  - 如果只看到红色矩形但没有缩略图，请检查纹理是否正确加载');
}

console.log('\n');
