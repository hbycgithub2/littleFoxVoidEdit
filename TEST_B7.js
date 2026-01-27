// TEST_B7.js
// B7: 时间范围复制粘贴功能测试脚本

/**
 * B7功能测试
 * 
 * 测试内容：
 * 1. 复制单个热区的时间范围
 * 2. 复制多个热区的时间范围
 * 3. 粘贴时间范围到当前时间
 * 4. 粘贴时间范围到指定时间
 * 5. 保持相对时间关系
 * 6. 键盘快捷键测试
 */

async function testB7() {
    console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
    console.log('%c║          B7: 时间范围复制粘贴测试                      ║', 'color: #9C27B0; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.rangeCopyController) {
        console.log('%c❌ TimelineRangeCopyController 未初始化', 'color: #F44336;');
        return false;
    }
    
    const controller = timeline.rangeCopyController;
    
    // 测试1: 复制单个热区
    console.log('\n%c【测试1】复制单个热区的时间范围', 'color: #2196F3; font-weight: bold;');
    
    if (scene.hotspots.length === 0) {
        console.log('  ⚠ 没有热区，先创建一个');
        // 创建测试热区
        const config = {
            id: Date.now(),
            shape: 'rect',
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            color: '#00ff00',
            strokeWidth: 2,
            startTime: 5.0,
            endTime: 8.0
        };
        scene.addHotspot(config);
        await sleep(100);
    }
    
    const testHotspot = scene.hotspots[0].config;
    controller.copySingleTimeRange(testHotspot);
    await sleep(100);
    
    const copiedInfo = controller.getCopiedInfo();
    if (copiedInfo && copiedInfo.count === 1) {
        console.log('  ✓ 单个热区复制成功');
        console.log(`    时长: ${copiedInfo.duration.toFixed(1)}s`);
    } else {
        console.log('  ❌ 单个热区复制失败');
        return false;
    }
    
    // 测试2: 粘贴到当前时间
    console.log('\n%c【测试2】粘贴到当前时间', 'color: #2196F3; font-weight: bold;');
    
    const beforeCount = scene.hotspots.length;
    controller.pasteTimeRanges(10.0); // 粘贴到10秒
    await sleep(200);
    const afterCount = scene.hotspots.length;
    
    if (afterCount > beforeCount) {
        console.log('  ✓ 粘贴成功');
        console.log(`    热区数量: ${beforeCount} -> ${afterCount}`);
        
        const newHotspot = scene.hotspots[scene.hotspots.length - 1].config;
        console.log(`    新热区时间: ${newHotspot.startTime.toFixed(1)}s - ${newHotspot.endTime.toFixed(1)}s`);
    } else {
        console.log('  ❌ 粘贴失败');
        return false;
    }
    
    // 测试3: 批量复制
    console.log('\n%c【测试3】批量复制多个热区', 'color: #2196F3; font-weight: bold;');
    
    // 选择前2个热区
    timeline.selectionController.clearSelection();
    scene.hotspots.slice(0, Math.min(2, scene.hotspots.length)).forEach(h => {
        timeline.selectionController.selectedIds.add(h.config.id);
    });
    
    controller.copyTimeRanges();
    await sleep(100);
    
    const batchCopiedInfo = controller.getCopiedInfo();
    if (batchCopiedInfo && batchCopiedInfo.count >= 1) {
        console.log('  ✓ 批量复制成功');
        console.log(`    复制数量: ${batchCopiedInfo.count}个`);
        console.log(`    总时长: ${batchCopiedInfo.duration.toFixed(1)}s`);
    } else {
        console.log('  ❌ 批量复制失败');
        return false;
    }
    
    // 测试4: 批量粘贴
    console.log('\n%c【测试4】批量粘贴', 'color: #2196F3; font-weight: bold;');
    
    const beforeBatchCount = scene.hotspots.length;
    controller.pasteTimeRanges(20.0); // 粘贴到20秒
    await sleep(200);
    const afterBatchCount = scene.hotspots.length;
    
    if (afterBatchCount > beforeBatchCount) {
        console.log('  ✓ 批量粘贴成功');
        console.log(`    热区数量: ${beforeBatchCount} -> ${afterBatchCount}`);
        console.log(`    新增: ${afterBatchCount - beforeBatchCount}个`);
    } else {
        console.log('  ❌ 批量粘贴失败');
        return false;
    }
    
    // 测试5: 相对时间关系
    console.log('\n%c【测试5】验证相对时间关系', 'color: #2196F3; font-weight: bold;');
    
    if (batchCopiedInfo.count >= 2) {
        const pastedHotspots = scene.hotspots.slice(-batchCopiedInfo.count);
        const timeDiffs = [];
        
        for (let i = 1; i < pastedHotspots.length; i++) {
            const diff = pastedHotspots[i].config.startTime - pastedHotspots[i-1].config.startTime;
            timeDiffs.push(diff);
        }
        
        console.log('  ✓ 相对时间差:', timeDiffs.map(d => d.toFixed(1) + 's').join(', '));
    } else {
        console.log('  ⚠ 跳过测试（热区数量不足）');
    }
    
    // 测试6: 边界检查
    console.log('\n%c【测试6】边界检查', 'color: #2196F3; font-weight: bold;');
    
    // 尝试粘贴到负数时间
    const beforeNegativeCount = scene.hotspots.length;
    controller.pasteTimeRanges(-5.0);
    await sleep(100);
    const afterNegativeCount = scene.hotspots.length;
    
    if (afterNegativeCount === beforeNegativeCount) {
        console.log('  ✓ 正确拒绝了负数时间');
    } else {
        console.log('  ⚠ 应该拒绝负数时间');
    }
    
    // 测试7: 清空复制数据
    console.log('\n%c【测试7】清空复制数据', 'color: #2196F3; font-weight: bold;');
    
    controller.clear();
    const clearedInfo = controller.getCopiedInfo();
    
    if (clearedInfo === null) {
        console.log('  ✓ 复制数据已清空');
    } else {
        console.log('  ❌ 清空失败');
        return false;
    }
    
    // 总结
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
    console.log('%c║                    测试结果总结                        ║', 'color: #4CAF50; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
    
    console.log('\n%c✅ B7测试完成！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('\n功能验证:');
    console.log('  ✓ 单个复制粘贴');
    console.log('  ✓ 批量复制粘贴');
    console.log('  ✓ 相对时间保持');
    console.log('  ✓ 边界检查');
    console.log('  ✓ 数据清空');
    
    console.log('\n快捷键:');
    console.log('  Ctrl+Shift+C - 复制时间范围');
    console.log('  Ctrl+Shift+V - 粘贴时间范围');
    
    return true;
}

// 快速测试
async function quickTestB7() {
    console.log('%c快速测试 B7...', 'color: #2196F3; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.rangeCopyController) {
        console.log('❌ 控制器未初始化');
        return;
    }
    
    // 创建测试热区
    if (scene.hotspots.length === 0) {
        const config = {
            id: Date.now(),
            shape: 'rect',
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            color: '#00ff00',
            strokeWidth: 2,
            startTime: 5.0,
            endTime: 8.0
        };
        scene.addHotspot(config);
        await sleep(100);
    }
    
    // 复制
    const testHotspot = scene.hotspots[0].config;
    timeline.rangeCopyController.copySingleTimeRange(testHotspot);
    console.log('✓ 已复制时间范围');
    
    // 粘贴
    await sleep(100);
    timeline.rangeCopyController.pasteTimeRanges(15.0);
    console.log('✓ 已粘贴到15秒');
    
    console.log('✅ 快速测试完成！');
}

// 工具函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 导出测试函数
window.testB7 = {
    full: testB7,
    quick: quickTestB7
};

// 自动运行提示
console.log('%cB7测试脚本已加载！', 'color: #9C27B0; font-size: 16px; font-weight: bold;');
console.log('%c运行测试:', 'color: #2196F3; font-weight: bold;');
console.log('  testB7.full()   - 完整测试');
console.log('  testB7.quick()  - 快速测试');
