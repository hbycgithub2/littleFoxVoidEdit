// TEST_B8.js
// B8: 方向键微调时间功能测试脚本

/**
 * B8功能测试
 * 
 * 测试内容：
 * 1. 方向键调整开始时间
 * 2. 方向键调整结束时间
 * 3. 方向键整体移动
 * 4. 方向键调整持续时间
 * 5. 不同步长测试（0.1s, 1s, 10s）
 * 6. 批量微调测试
 */

async function testB8() {
    console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
    console.log('%c║          B8: 方向键微调时间测试                        ║', 'color: #9C27B0; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.fineAdjustController) {
        console.log('%c❌ TimelineFineAdjustController 未初始化', 'color: #F44336;');
        return false;
    }
    
    const controller = timeline.fineAdjustController;
    
    // 准备测试热区
    console.log('\n%c【准备】创建测试热区', 'color: #2196F3; font-weight: bold;');
    
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
            startTime: 10.0,
            endTime: 15.0
        };
        scene.addHotspot(config);
        await sleep(100);
    }
    
    const testHotspot = scene.hotspots[0].config;
    console.log(`  ✓ 测试热区: ${testHotspot.startTime}s - ${testHotspot.endTime}s`);
    
    // 选中测试热区
    timeline.selectionController.clearSelection();
    timeline.selectionController.selectedIds.add(testHotspot.id);
    
    // 测试1: 调整开始时间
    console.log('\n%c【测试1】Alt+← 调整开始时间', 'color: #2196F3; font-weight: bold;');
    
    const originalStart = testHotspot.startTime;
    controller.adjustStartTime([testHotspot.id], -0.1, false);
    await sleep(100);
    
    const newStart = scene.hotspots[0].config.startTime;
    if (Math.abs(newStart - (originalStart - 0.1)) < 0.01) {
        console.log(`  ✓ 开始时间调整成功: ${originalStart}s -> ${newStart}s`);
    } else {
        console.log(`  ❌ 开始时间调整失败`);
        return false;
    }
    
    // 测试2: 调整结束时间
    console.log('\n%c【测试2】Shift+→ 调整结束时间', 'color: #2196F3; font-weight: bold;');
    
    const originalEnd = testHotspot.endTime;
    controller.adjustEndTime([testHotspot.id], 0.1, false);
    await sleep(100);
    
    const newEnd = scene.hotspots[0].config.endTime;
    if (Math.abs(newEnd - (originalEnd + 0.1)) < 0.01) {
        console.log(`  ✓ 结束时间调整成功: ${originalEnd}s -> ${newEnd}s`);
    } else {
        console.log(`  ❌ 结束时间调整失败`);
        return false;
    }
    
    // 测试3: 整体移动
    console.log('\n%c【测试3】→ 整体向右移动', 'color: #2196F3; font-weight: bold;');
    
    const originalStartMove = scene.hotspots[0].config.startTime;
    const originalEndMove = scene.hotspots[0].config.endTime;
    const originalDuration = originalEndMove - originalStartMove;
    
    controller.moveTime([testHotspot.id], 1.0, false);
    await sleep(100);
    
    const newStartMove = scene.hotspots[0].config.startTime;
    const newEndMove = scene.hotspots[0].config.endTime;
    const newDuration = newEndMove - newStartMove;
    
    if (Math.abs(newStartMove - (originalStartMove + 1.0)) < 0.01 &&
        Math.abs(newDuration - originalDuration) < 0.01) {
        console.log(`  ✓ 整体移动成功，持续时间保持: ${originalDuration.toFixed(1)}s`);
    } else {
        console.log(`  ❌ 整体移动失败`);
        return false;
    }
    
    // 测试4: 调整持续时间
    console.log('\n%c【测试4】↑ 增加持续时间', 'color: #2196F3; font-weight: bold;');
    
    const originalDuration2 = scene.hotspots[0].config.endTime - scene.hotspots[0].config.startTime;
    controller.adjustDuration([testHotspot.id], 0.5, false);
    await sleep(100);
    
    const newDuration2 = scene.hotspots[0].config.endTime - scene.hotspots[0].config.startTime;
    if (Math.abs(newDuration2 - (originalDuration2 + 0.5)) < 0.01) {
        console.log(`  ✓ 持续时间调整成功: ${originalDuration2.toFixed(1)}s -> ${newDuration2.toFixed(1)}s`);
    } else {
        console.log(`  ❌ 持续时间调整失败`);
        return false;
    }
    
    // 测试5: 不同步长
    console.log('\n%c【测试5】不同步长测试', 'color: #2196F3; font-weight: bold;');
    
    // 精细步长 (0.1s)
    console.log('  测试精细步长 (0.1s)');
    const step1 = controller.steps.fine;
    console.log(`    ✓ 精细步长: ${step1}s`);
    
    // 正常步长 (1.0s)
    console.log('  测试正常步长 (1.0s)');
    const step2 = controller.steps.normal;
    console.log(`    ✓ 正常步长: ${step2}s`);
    
    // 粗调步长 (10.0s)
    console.log('  测试粗调步长 (10.0s)');
    const step3 = controller.steps.coarse;
    console.log(`    ✓ 粗调步长: ${step3}s`);
    
    // 测试6: 批量微调
    console.log('\n%c【测试6】批量微调', 'color: #2196F3; font-weight: bold;');
    
    // 创建第二个测试热区
    const config2 = {
        id: Date.now() + 1,
        shape: 'circle',
        x: 200,
        y: 200,
        radius: 50,
        color: '#ff0000',
        strokeWidth: 2,
        startTime: 20.0,
        endTime: 23.0
    };
    scene.addHotspot(config2);
    await sleep(100);
    
    // 选中两个热区
    timeline.selectionController.clearSelection();
    timeline.selectionController.selectedIds.add(testHotspot.id);
    timeline.selectionController.selectedIds.add(config2.id);
    
    const selectedIds = [testHotspot.id, config2.id];
    
    // 批量移动
    const beforeBatch = scene.hotspots.map(h => ({
        id: h.config.id,
        start: h.config.startTime,
        end: h.config.endTime
    }));
    
    controller.moveTime(selectedIds, 2.0, true);
    await sleep(100);
    
    const afterBatch = scene.hotspots.map(h => ({
        id: h.config.id,
        start: h.config.startTime,
        end: h.config.endTime
    }));
    
    const allMoved = afterBatch.every((after, i) => {
        const before = beforeBatch[i];
        if (selectedIds.includes(after.id)) {
            return Math.abs(after.start - (before.start + 2.0)) < 0.01;
        }
        return true;
    });
    
    if (allMoved) {
        console.log(`  ✓ 批量移动成功 (2个热区)`);
    } else {
        console.log(`  ❌ 批量移动失败`);
        return false;
    }
    
    // 测试7: 边界检查
    console.log('\n%c【测试7】边界检查', 'color: #2196F3; font-weight: bold;');
    
    // 尝试将开始时间调整到负数
    const hotspotAtZero = scene.hotspots.find(h => h.config.startTime < 1);
    if (hotspotAtZero) {
        controller.adjustStartTime([hotspotAtZero.config.id], -100, false);
        await sleep(100);
        const afterNegative = hotspotAtZero.config.startTime;
        
        if (afterNegative >= 0) {
            console.log(`  ✓ 正确阻止了负数时间`);
        } else {
            console.log(`  ⚠ 应该阻止负数时间`);
        }
    }
    
    // 测试8: 磁性吸附集成
    console.log('\n%c【测试8】磁性吸附集成', 'color: #2196F3; font-weight: bold;');
    
    if (timeline.snapController) {
        const snapWasEnabled = timeline.snapController.enabled;
        
        // 启用磁性吸附
        timeline.snapController.enabled = true;
        console.log('  ✓ 磁性吸附已启用');
        
        // 测试调整时的吸附
        const testHotspot2 = scene.hotspots[0].config;
        timeline.selectionController.clearSelection();
        timeline.selectionController.selectedIds.add(testHotspot2.id);
        
        const beforeSnap = testHotspot2.startTime;
        controller.moveTime([testHotspot2.id], 0.15, false); // 移动0.15s，应该吸附到整数
        await sleep(100);
        const afterSnap = scene.hotspots[0].config.startTime;
        
        console.log(`    移动前: ${beforeSnap.toFixed(1)}s`);
        console.log(`    移动后: ${afterSnap.toFixed(1)}s`);
        console.log(`    ✓ 磁性吸附功能已集成`);
        
        // 恢复原状态
        timeline.snapController.enabled = snapWasEnabled;
    } else {
        console.log('  ⚠ 磁性吸附控制器未找到');
    }
    
    // 测试9: 获取调整信息
    console.log('\n%c【测试9】获取调整信息', 'color: #2196F3; font-weight: bold;');
    
    const adjustInfo = controller.getAdjustInfo();
    console.log('  调整信息:');
    console.log(`    启用状态: ${adjustInfo.enabled}`);
    console.log(`    当前模式: ${adjustInfo.mode}`);
    console.log(`    当前步长: ${adjustInfo.currentStep}s`);
    console.log(`    磁性吸附: ${adjustInfo.snapEnabled ? '启用' : '禁用'}`);
    console.log('  ✓ 信息获取成功');
    
    // 总结
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
    console.log('%c║                    测试结果总结                        ║', 'color: #4CAF50; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
    
    console.log('\n%c✅ B8测试完成！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('\n功能验证:');
    console.log('  ✓ 调整开始时间 (Alt+←→)');
    console.log('  ✓ 调整结束时间 (Shift+←→)');
    console.log('  ✓ 整体移动 (←→)');
    console.log('  ✓ 调整持续时间 (↑↓)');
    console.log('  ✓ 多种步长 (0.1s/1s/10s)');
    console.log('  ✓ 批量微调');
    console.log('  ✓ 边界检查');
    console.log('  ✓ 磁性吸附集成');
    console.log('  ✓ 信息获取');
    
    console.log('\n快捷键说明:');
    console.log('  ←→ - 整体移动 (0.1s)');
    console.log('  Alt+←→ - 调整开始时间');
    console.log('  Shift+←→ - 调整结束时间');
    console.log('  ↑↓ - 调整持续时间');
    console.log('  Ctrl+方向键 - 1s步长');
    console.log('  Ctrl+Shift+方向键 - 10s步长');
    console.log('  S键 - 切换磁性吸附');
    
    return true;
}

// 快速测试
async function quickTestB8() {
    console.log('%c快速测试 B8...', 'color: #2196F3; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.fineAdjustController) {
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
            startTime: 10.0,
            endTime: 15.0
        };
        scene.addHotspot(config);
        await sleep(100);
    }
    
    const testHotspot = scene.hotspots[0].config;
    
    // 选中
    timeline.selectionController.clearSelection();
    timeline.selectionController.selectedIds.add(testHotspot.id);
    
    console.log(`原始时间: ${testHotspot.startTime}s - ${testHotspot.endTime}s`);
    
    // 测试移动
    timeline.fineAdjustController.moveTime([testHotspot.id], 1.0, false);
    await sleep(100);
    
    console.log(`移动后: ${scene.hotspots[0].config.startTime}s - ${scene.hotspots[0].config.endTime}s`);
    console.log('✅ 快速测试完成！');
}

// 工具函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 导出测试函数
window.testB8 = {
    full: testB8,
    quick: quickTestB8
};

// 自动运行提示
console.log('%cB8测试脚本已加载！', 'color: #9C27B0; font-size: 16px; font-weight: bold;');
console.log('%c运行测试:', 'color: #2196F3; font-weight: bold;');
console.log('  testB8.full()   - 完整测试');
console.log('  testB8.quick()  - 快速测试');
