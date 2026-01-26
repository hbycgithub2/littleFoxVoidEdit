// 功能验证脚本 - 在浏览器控制台运行

console.log('=== 功能验证开始 ===\n');

const scene = window.game?.scene?.getScene('EditorScene');

if (!scene) {
    console.error('❌ EditorScene 未找到');
} else {
    console.log('✅ EditorScene 已加载\n');
    
    // 3.1 图层管理
    console.log('3.1 图层管理:');
    console.log('  LayerManager:', scene.layerManager ? '✅' : '❌');
    console.log('  LayerPanelController:', window.layerPanelController ? '✅' : '❌');
    if (scene.layerManager) {
        console.log('  默认图层:', scene.layerManager.getLayer(1) ? '✅' : '❌');
    }
    
    // 3.2 对齐工具
    console.log('\n3.2 对齐工具:');
    console.log('  AlignmentManager:', scene.alignmentManager ? '✅' : '❌');
    console.log('  对齐按钮:', document.getElementById('alignLeftBtn') ? '✅' : '❌');
    
    // 3.3 分组功能
    console.log('\n3.3 分组功能:');
    console.log('  GroupManager:', scene.groupManager ? '✅' : '❌');
    console.log('  分组按钮:', document.getElementById('groupBtn') ? '✅' : '❌');
    
    // 3.4 时间轴
    console.log('\n3.4 时间轴:');
    console.log('  TimelinePanel:', window.timelinePanel ? '✅' : '❌');
    console.log('  Canvas元素:', document.getElementById('timelineCanvas') ? '✅' : '❌');
    
    // 3.5 样式预设
    console.log('\n3.5 样式预设:');
    console.log('  StyleManager:', scene.styleManager ? '✅' : '❌');
    console.log('  StylePanelController:', window.stylePanelController ? '✅' : '❌');
    if (scene.styleManager) {
        const presets = scene.styleManager.getPresets();
        console.log('  默认预设数量:', presets.length, presets.length >= 5 ? '✅' : '❌');
    }
    
    // 3.6 加载动画
    console.log('\n3.6 加载动画:');
    console.log('  LoadingManager:', scene.loadingManager ? '✅' : '❌');
    console.log('  Phaser Tween:', scene.tweens ? '✅' : '❌');
    
    console.log('\n=== 功能验证完成 ===');
    
    // 测试加载动画
    if (scene.loadingManager) {
        console.log('\n测试加载动画...');
        scene.loadingManager.show('测试中...', true);
        setTimeout(() => {
            scene.loadingManager.updateProgress(0.5);
            setTimeout(() => {
                scene.loadingManager.hide();
                console.log('✅ 加载动画测试完成');
            }, 500);
        }, 500);
    }
}
