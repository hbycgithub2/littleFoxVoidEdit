// 测试视频帧提取
// 在浏览器控制台运行

(async function() {
    console.log('\n========== 测试视频帧提取 ==========\n');
    
    const video = document.getElementById('video');
    if (!video || !video.duration) {
        console.error('❌ 视频未加载');
        return;
    }
    
    console.log('✅ 视频信息:', {
        duration: video.duration.toFixed(2) + 's',
        currentTime: video.currentTime.toFixed(2) + 's',
        readyState: video.readyState
    });
    
    // 创建测试Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    
    // 测试提取3个不同时间点的帧
    const testTimes = [0.5, 1.0, 1.5];
    
    console.log('\n🎬 测试提取3个时间点:', testTimes);
    
    for (let i = 0; i < testTimes.length; i++) {
        const time = testTimes[i];
        
        console.log(`\n--- 提取帧#${i} (${time}s) ---`);
        
        // 等待seek完成
        await new Promise((resolve) => {
            const onSeeked = () => {
                console.log(`  ✅ Seeked完成, currentTime: ${video.currentTime.toFixed(2)}s`);
                video.removeEventListener('seeked', onSeeked);
                resolve();
            };
            
            video.addEventListener('seeked', onSeeked, { once: true });
            video.currentTime = time;
            console.log(`  📍 设置currentTime = ${time}s`);
        });
        
        // 绘制到Canvas
        ctx.drawImage(video, 0, 0, 80, 60);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log(`  ✅ 帧提取成功, base64长度: ${base64.length}`);
        console.log(`  📊 Base64前50字符: ${base64.substring(0, 50)}...`);
        
        // 小延迟
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('\n========== 测试完成 ==========\n');
    console.log('💡 如果3个帧的base64前50字符不同，说明提取成功');
    console.log('💡 如果都相同，说明提取的是同一帧');
    
})();
