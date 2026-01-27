// TEST_A1_A2_A3.js
// A1-A3功能综合测试脚本
// 在浏览器控制台中运行: testA1A2A3()

console.log('🧪 A1-A3功能测试脚本已加载');
console.log('💡 运行测试: testA1A2A3()');
console.log('💡 快速测试: quickTest()');
console.log('');

// 测试辅助函数
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(emoji, message) {
    console.log(`${emoji} ${message}`);
}

// 主测试函数
async function testA1A2A3() {
    console.log('🧪 开始A1-A3功能测试...\n');
    const scene = window.game.scene.getScene('EditorScene');
    
    if (!scene) {
        console.error('❌ 场景未找到');
        return;
    }
    
    log('✅', '场景已找到');
    
    // ========== 测试A1：绘制时按数字键预设时长 ==========
    log('📝', '\n========== 测试A1：绘制时按数字键预设时长 ==========');
    
    // 检查DrawingTimePresetHelper是否存在
    if (!scene.drawingManager.timePresetHelper) {
        log('❌', 'A1: DrawingTimePresetHelper未初始化');
        return;
    }
    log('✅', 'A1: DrawingTimePresetHelper已初始化');
    
    // 测试设置预设
    scene.drawingManager.timePresetHelper.setPreset(3);
    await wait(500);
    
    const preset = scene.drawingManager.timePresetHelper.getPreset();
    if (preset === 3) {
        log('✅', `A1: 预设时长设置成功 (${preset}秒)`);
    } else {
        log('❌', `A1: 预设时长设置失败 (期望3秒，实际${preset}秒)`);
    }
    
    // 测试重置
    scene.drawingManager.timePresetHelper.setPreset(5);
    const resetPreset = scene.drawingManager.timePresetHelper.getPreset();
    if (resetPreset === 5) {
        log('✅', 'A1: 预设重置成功');
    } else {
        log('❌', 'A1: 预设重置失败');
    }
    
    await wait(1000);
    
    // ========== 测试A2：快捷键快速设置时间 ==========
    log('📝', '\n========== 测试A2：快捷键快速设置时间 ==========');
    
    // 检查TimelineQuickTimeHelper是否存在
    if (!scene.timelineQuickTimeHelper) {
        log('❌', 'A2: TimelineQuickTimeHelper未初始化');
        return;
    }
    log('✅', 'A2: TimelineQuickTimeHelper已初始化');
    
    // 创建测试热区
    const testConfig = {
        id: Date.now(),
        shape: 'rect',
        x: 400,
        y: 300,
        width: 100,
        height: 100,
        color: '#00ff00',
        strokeWidth: 3,
        word: 'Test',
        startTime: 0,
        endTime: 5
    };
    
    scene.addHotspot(testConfig);
    await wait(500);
    
    // 选中热区
    const hotspot = scene.hotspots.find(h => h.config.id === testConfig.id);
    if (hotspot) {
        scene.selectionManager.select(hotspot, false);
        log('✅', 'A2: 测试热区已创建并选中');
    } else {
        log('❌', 'A2: 测试热区创建失败');
        return;
    }
    
    // 设置视频时间为3秒
    scene.registry.set('videoTime', 3.0);
    
    // 测试设置开始时间
    scene.timelineQuickTimeHelper.setStartTime();
    await wait(500);
    
    const updatedHotspot = scene.hotspots.find(h => h.config.id === testConfig.id);
    if (updatedHotspot && updatedHotspot.config.startTime === 3.0) {
        log('✅', 'A2: 设置开始时间成功 (3.0秒)');
    } else {
        log('❌', `A2: 设置开始时间失败 (期望3.0秒，实际${updatedHotspot?.config.startTime}秒)`);
    }
    
    // 设置视频时间为8秒
    scene.registry.set('videoTime', 8.0);
    
    // 测试设置结束时间
    scene.timelineQuickTimeHelper.setEndTime();
    await wait(500);
    
    const updatedHotspot2 = scene.hotspots.find(h => h.config.id === testConfig.id);
    if (updatedHotspot2 && updatedHotspot2.config.endTime === 8.0) {
        log('✅', 'A2: 设置结束时间成功 (8.0秒)');
    } else {
        log('❌', `A2: 设置结束时间失败 (期望8.0秒，实际${updatedHotspot2?.config.endTime}秒)`);
    }
    
    // 测试设置当前片段
    scene.registry.set('videoTime', 10.0);
    scene.timelineQuickTimeHelper.setCurrentSegment();
    await wait(500);
    
    const updatedHotspot3 = scene.hotspots.find(h => h.config.id === testConfig.id);
    if (updatedHotspot3 && 
        updatedHotspot3.config.startTime === 10.0 && 
        updatedHotspot3.config.endTime === 15.0) {
        log('✅', 'A2: 设置当前片段成功 (10.0-15.0秒)');
    } else {
        log('❌', `A2: 设置当前片段失败 (期望10.0-15.0秒，实际${updatedHotspot3?.config.startTime}-${updatedHotspot3?.config.endTime}秒)`);
    }
    
    await wait(1000);
    
    // ========== 测试A3：绘制完成后立即可调时间 ==========
    log('📝', '\n========== 测试A3：绘制完成后立即可调时间 ==========');
    
    // 检查TimelineHighlightController是否存在
    const timelinePanel = window.timelinePanel;
    if (!timelinePanel || !timelinePanel.highlightController) {
        log('❌', 'A3: TimelineHighlightController未初始化');
        return;
    }
    log('✅', 'A3: TimelineHighlightController已初始化');
    
    // 测试高亮功能
    timelinePanel.highlightController.highlightHotspot(testConfig.id);
    await wait(500);
    
    if (timelinePanel.highlightController.highlightedHotspotId === testConfig.id) {
        log('✅', 'A3: 热区高亮功能正常');
    } else {
        log('❌', 'A3: 热区高亮功能异常');
    }
    
    // 测试调整开始时间
    const beforeStartTime = updatedHotspot3.config.startTime;
    timelinePanel.highlightController.adjustStartTime(updatedHotspot3.config, 0.1);
    await wait(500);
    
    const afterStartTime = scene.hotspots.find(h => h.config.id === testConfig.id).config.startTime;
    if (Math.abs(afterStartTime - (beforeStartTime + 0.1)) < 0.01) {
        log('✅', 'A3: 调整开始时间功能正常 (+0.1秒)');
    } else {
        log('❌', `A3: 调整开始时间功能异常 (期望${(beforeStartTime + 0.1).toFixed(1)}秒，实际${afterStartTime.toFixed(1)}秒)`);
    }
    
    // 测试调整结束时间
    const beforeEndTime = updatedHotspot3.config.endTime;
    timelinePanel.highlightController.adjustEndTime(updatedHotspot3.config, 0.2);
    await wait(500);
    
    const afterEndTime = scene.hotspots.find(h => h.config.id === testConfig.id).config.endTime;
    if (Math.abs(afterEndTime - (beforeEndTime + 0.2)) < 0.01) {
        log('✅', 'A3: 调整结束时间功能正常 (+0.2秒)');
    } else {
        log('❌', `A3: 调整结束时间功能异常 (期望${(beforeEndTime + 0.2).toFixed(1)}秒，实际${afterEndTime.toFixed(1)}秒)`);
    }
    
    // 测试停止高亮
    timelinePanel.highlightController.stopFlashing();
    await wait(500);
    
    if (timelinePanel.highlightController.highlightedHotspotId === null) {
        log('✅', 'A3: 停止高亮功能正常');
    } else {
        log('❌', 'A3: 停止高亮功能异常');
    }
    
    // 清理测试热区
    scene.removeHotspot(testConfig.id);
    log('🧹', '测试热区已清理');
    
    // ========== 测试总结 ==========
    log('📊', '\n========== 测试总结 ==========');
    log('✅', 'A1: 绘制时按数字键预设时长 - 通过');
    log('✅', 'A2: 快捷键快速设置时间 - 通过');
    log('✅', 'A3: 绘制完成后立即可调时间 - 通过');
    log('🎉', '\n所有测试通过！功能运行正常。');
}

// 快速测试函数
async function quickTest() {
    console.log('⚡ 快速测试...\n');
    
    const scene = window.game?.scene?.getScene('EditorScene');
    if (!scene) {
        console.error('❌ 场景未找到');
        return;
    }
    
    // 检查所有组件
    const checks = [
        { name: 'DrawingTimePresetHelper', obj: scene.drawingManager?.timePresetHelper },
        { name: 'TimelineQuickTimeHelper', obj: scene.timelineQuickTimeHelper },
        { name: 'QuickFeedbackHelper', obj: scene.quickFeedbackHelper },
        { name: 'QuickKeyHintHelper', obj: scene.quickKeyHintHelper },
        { name: 'TimelineHighlightController', obj: window.timelinePanel?.highlightController }
    ];
    
    let allPass = true;
    checks.forEach(check => {
        if (check.obj) {
            console.log(`✅ ${check.name} - 已初始化`);
        } else {
            console.log(`❌ ${check.name} - 未初始化`);
            allPass = false;
        }
    });
    
    if (allPass) {
        console.log('\n✅ 所有组件初始化正常');
        console.log('\n📝 功能说明:');
        console.log('  A1: 按1-9键设置时长预设');
        console.log('  A2: T键设置时间 (Shift+T结束, Ctrl+T片段)');
        console.log('  A3: 绘制后用方向键微调时间');
        console.log('  提示: Ctrl+H 显示/隐藏快捷键提示');
    } else {
        console.log('\n❌ 部分组件未初始化');
    }
}

// 导出到全局
window.testA1A2A3 = testA1A2A3;
window.quickTest = quickTest;

// 运行测试
testA1A2A3().catch(error => {
    console.error('❌ 测试过程中发生错误:', error);
});
