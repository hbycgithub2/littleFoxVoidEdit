// 调试主页面缩略图
console.log('\n=== 主页面缩略图调试 ===\n');

// 1. 检查TimelinePanel
console.log('1. TimelinePanel:', !!window.timelinePanel);
if (window.timelinePanel) {
    console.log('   thumbnailManager:', !!window.timelinePanel.thumbnailManager);
    if (window.timelinePanel.thumbnailManager) {
        console.log('   thumbnails:', window.timelinePanel.thumbnailManager.thumbnails.length);
        console.log('   generating:', window.timelinePanel.thumbnailManager.generating);
    }
}

// 2. 检查视频
const video = document.querySelector('video');
console.log('\n2. 视频:', {
    exists: !!video,
    duration: video?.duration,
    readyState: video?.readyState
});

// 3. 手动触发
if (video && video.duration && window.timelinePanel?.thumbnailManager) {
    console.log('\n3. 手动触发生成缩略图...');
    window.timelinePanel.thumbnailManager.loadVideo(video);
} else {
    console.log('\n3. 无法触发:');
    if (!video) console.log('   - 视频不存在');
    if (!video?.duration) console.log('   - 视频未加载');
    if (!window.timelinePanel) console.log('   - TimelinePanel不存在');
    if (!window.timelinePanel?.thumbnailManager) console.log('   - ThumbnailManager不存在');
}

console.log('\n=== 调试完成 ===\n');
