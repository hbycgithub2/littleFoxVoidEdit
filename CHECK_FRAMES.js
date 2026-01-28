// 检查实际提取的帧数据
const renderer = window.thumbnailInitializer?.renderer;
if (!renderer) {
    console.error('❌ Renderer未找到');
} else {
    const frames = renderer.frames;
    console.log('总帧数:', frames.length);
    
    if (frames.length > 0) {
        console.log('\n前5帧数据:');
        frames.slice(0, 5).forEach((frame, i) => {
            console.log(`帧${i}:`, {
                timestamp: frame.timestamp,
                base64Length: frame.base64.length,
                base64Start: frame.base64.substring(0, 80)
            });
        });
        
        // 检查base64是否相同
        const first = frames[0].base64;
        const allSame = frames.every(f => f.base64 === first);
        
        console.log('\n所有帧base64是否相同:', allSame ? '❌ 是（问题！）' : '✅ 否（正常）');
        
        if (allSame) {
            console.log('\n🔍 问题确认: 所有帧的base64完全相同');
            console.log('说明视频帧提取失败，都提取了同一帧');
        }
    }
}
