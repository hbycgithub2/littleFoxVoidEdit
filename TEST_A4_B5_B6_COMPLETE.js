// TEST_A4_B5_B6_COMPLETE.js
// A4、B5、B6 完整功能测试和验证脚本

/**
 * 综合测试脚本 - 验证所有功能完整性和优化效果
 * 
 * 测试内容：
 * 1. A4: 时间轴直接创建热区
 * 2. B5: 磁性吸附
 * 3. B6: 批量时间调整
 * 4. 集成测试：三个功能协同工作
 * 5. 性能测试：验证优化效果
 */

// ============================================
// 测试工具函数
// ============================================

function log(message, type = 'info') {
    const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        test: '#9C27B0'
    };
    console.log(`%c${message}`, `color: ${colors[type]}; font-weight: bold;`);
}

function assert(condition, message) {
    if (!condition) {
        log(`❌ 断言失败: ${message}`, 'error');
        throw new Error(message);
    }
    log(`✓ ${message}`, 'success');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// A4: 时间轴直接创建测试
// ============================================

async function testA4DirectCreate() {
    log('\n========== A4: 时间轴直接创建测试 ==========', 'test');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.directCreateController) {
        log('❌ TimelineDirectCreateController 未初始化', 'error');
        return false;
    }
    
    const controller = timeline.directCreateController;
    const initialCount = scene.hotspots.length;
    
    // 测试1: 基本创建功能
    log('\n测试1: Alt+拖拽创建热区', 'info');
    controller.handleMouseDown(100, 50, true); // Alt键按下
    controller.handleMouseMove(300, 50);
    controller.handleMouseUp();
    await sleep(100);
    
    assert(scene.hotspots.length === initialCount + 1, '热区已创建');
    const newHotspot = scene.hotspots[scene.hotspots.length - 1];
    assert(newHotspot.config.startTime < newHotspot.config.endTime, '时间范围正确');
    
    // 测试2: 最小时长检查
    log('\n测试2: 最小时长检查（0.5秒）', 'info');
    const beforeCount = scene.hotspots.length;
    controller.handleMouseDown(400, 50, true);
    controller.handleMouseMove(410, 50); // 很短的距离
    controller.handleMouseUp();
    await sleep(100);
    
    // 应该因为太短而不创建
    if (scene.hotspots.length === beforeCount) {
        log('✓ 正确拒绝了太短的时间范围', 'success');
    } else {
        log('⚠ 应该拒绝太短的时间范围', 'warning');
    }
    
    // 测试3: 实时预览
    log('\n测试3: 实时预览效果', 'info');
    controller.handleMouseDown(500, 50, true);
    assert(controller.isDragging === true, '拖拽状态已激活');
    controller.handleMouseMove(700, 50);
    assert(controller.previewEndTime > controller.previewStartTime, '预览时间更新');
    controller.cancel();
    assert(controller.isDragging === false, '取消后状态重置');
    
    // 测试4: Escape取消
    log('\n测试4: Escape键取消创建', 'info');
    controller.handleMouseDown(600, 50, true);
    controller.handleMouseMove(800, 50);
    controller.cancel();
    assert(controller.isDragging === false, 'Escape取消成功');
    
    // 测试5: 自动触发A3高亮
    log('\n测试5: 创建后自动高亮（A3集成）', 'info');
    controller.handleMouseDown(100, 50, true);
    controller.handleMouseMove(400, 50);
    controller.handleMouseUp();
    await sleep(200);
    
    if (timeline.highlightController && timeline.highlightController.isHighlighting) {
        log('✓ 自动触发A3高亮成功', 'success');
    } else {
        log('⚠ A3高亮未触发', 'warning');
    }
    
    log('\n✅ A4测试完成', 'success');
    return true;
}

// ============================================
// B5: 磁性吸附测试
// ============================================

async function testB5MagneticSnap() {
    log('\n========== B5: 磁性吸附测试 ==========', 'test');
    
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.snapController) {
        log('❌ TimelineSnapController 未初始化', 'error');
        return false;
    }
    
    const controller = timeline.snapController;
    
    // 测试1: 吸附开关
    log('\n测试1: S键切换吸附', 'info');
    const initialState = controller.enabled;
    controller.toggle();
    assert(controller.enabled === !initialState, '吸附状态切换成功');
    controller.toggle(); // 恢复原状态
    
    // 测试2: 网格吸附
    log('\n测试2: 网格吸附', 'info');
    controller.setEnabled(true);
    const time1 = 5.08; // 接近5秒
    const snapped1 = controller.snapTime(time1);
    assert(Math.abs(snapped1 - 5.0) < 0.1, `网格吸附: ${time1} -> ${snapped1}`);
    
    // 测试3: 热区边缘吸附
    log('\n测试3: 热区边缘吸附', 'info');
    const scene = window.game.scene.getScene('EditorScene');
    if (scene.hotspots.length > 0) {
        const hotspot = scene.hotspots[0];
        const nearStart = hotspot.config.startTime + 0.05;
        const snapped2 = controller.snapTime(nearStart, 'other-id');
        assert(Math.abs(snapped2 - hotspot.config.startTime) < 0.1, 
            `热区吸附: ${nearStart} -> ${snapped2}`);
    }
    
    // 测试4: 优先级系统
    log('\n测试4: 吸附优先级（高>中>低）', 'info');
    const snapPoints = controller.calculateSnapPoints();
    const highPriority = snapPoints.filter(s => 
        s.type.startsWith('hotspot-') || s.type === 'marker'
    );
    const mediumPriority = snapPoints.filter(s => 
        s.type === 'in-point' || s.type === 'out-point'
    );
    const lowPriority = snapPoints.filter(s => s.type === 'grid');
    
    log(`  高优先级点: ${highPriority.length}个`, 'info');
    log(`  中优先级点: ${mediumPriority.length}个`, 'info');
    log(`  低优先级点: ${lowPriority.length}个`, 'info');
    
    // 测试5: 视觉反馈
    log('\n测试5: 吸附线视觉反馈', 'info');
    controller.snapTime(5.0);
    assert(controller.currentSnapLine !== null, '吸附线已设置');
    assert(controller.currentSnapType !== null, '吸附类型已记录');
    controller.clearSnap();
    assert(controller.currentSnapLine === null, '吸附状态已清除');
    
    log('\n✅ B5测试完成', 'success');
    return true;
}

// ============================================
// B6: 批量时间调整测试
// ============================================

async function testB6BatchAdjust() {
    log('\n========== B6: 批量时间调整测试 ==========', 'test');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.dragController) {
        log('❌ TimelineDragController 未初始化', 'error');
        return false;
    }
    
    const controller = timeline.dragController;
    
    // 准备测试：创建多个热区
    log('\n准备: 创建3个测试热区', 'info');
    const testHotspots = [];
    for (let i = 0; i < 3; i++) {
        const config = {
            id: Date.now() + i,
            shape: 'rect',
            x: 100 + i * 50,
            y: 100,
            width: 50,
            height: 50,
            color: '#00ff00',
            strokeWidth: 2,
            startTime: i * 2,
            endTime: i * 2 + 1
        };
        scene.addHotspot(config);
        testHotspots.push(config);
        await sleep(10);
    }
    
    // 测试1: 多选
    log('\n测试1: 多选热区', 'info');
    timeline.selectionController.clearSelection();
    testHotspots.forEach(h => {
        timeline.selectionController.selectedIds.add(h.id);
    });
    assert(timeline.selectionController.getSelectionCount() === 3, '已选中3个热区');
    
    // 测试2: 批量调整开始时间
    log('\n测试2: 批量调整开始时间', 'info');
    const originalTimes = testHotspots.map(h => ({
        id: h.id,
        start: h.startTime,
        end: h.endTime
    }));
    
    // 模拟拖拽开始手柄
    const target = { hotspot: testHotspots[0], handle: 'start' };
    controller.startDrag(target, 0);
    assert(controller.batchOriginalTimes !== null, '批量原始时间已保存');
    assert(controller.batchOriginalTimes.size === 3, '保存了3个热区的时间');
    
    // 模拟拖拽（调整+0.5秒）
    controller.drag(50); // 假设scale=10，50px = 5秒
    controller.endDrag();
    
    // 验证所有热区都被调整
    const allAdjusted = testHotspots.every(h => {
        const original = originalTimes.find(o => o.id === h.id);
        return h.startTime !== original.start;
    });
    assert(allAdjusted, '所有选中热区的开始时间都被调整');
    
    // 测试3: 批量移动（保持相对位置）
    log('\n测试3: 批量移动（保持相对位置）', 'info');
    const beforeMove = testHotspots.map(h => ({
        id: h.id,
        start: h.startTime,
        end: h.endTime,
        duration: h.endTime - h.startTime
    }));
    
    // 模拟拖拽主体
    const target2 = { hotspot: testHotspots[0], handle: 'body' };
    controller.startDrag(target2, 0);
    controller.drag(100); // 移动
    controller.endDrag();
    
    // 验证持续时间不变
    const durationsPreserved = testHotspots.every(h => {
        const before = beforeMove.find(b => b.id === h.id);
        const currentDuration = h.endTime - h.startTime;
        return Math.abs(currentDuration - before.duration) < 0.01;
    });
    assert(durationsPreserved, '批量移动保持了持续时间');
    
    // 测试4: 边界检查
    log('\n测试4: 批量操作边界检查', 'info');
    // 尝试移动到负数时间
    const target3 = { hotspot: testHotspots[0], handle: 'body' };
    controller.startDrag(target3, 1000);
    controller.drag(0); // 尝试移动到很前面
    controller.endDrag();
    
    // 验证没有热区的开始时间小于0
    const noneNegative = testHotspots.every(h => h.startTime >= 0);
    assert(noneNegative, '边界检查：没有负数时间');
    
    // 测试5: 撤销/重做
    log('\n测试5: 批量操作的撤销/重做', 'info');
    const beforeUndo = testHotspots.map(h => ({
        id: h.id,
        start: h.startTime,
        end: h.endTime
    }));
    
    // 撤销
    scene.commandManager.undo();
    await sleep(50);
    
    const afterUndo = testHotspots.map(h => ({
        id: h.id,
        start: h.startTime,
        end: h.endTime
    }));
    
    // 验证时间已恢复
    const undoWorked = beforeUndo.some((before, i) => {
        const after = afterUndo[i];
        return before.start !== after.start || before.end !== after.end;
    });
    assert(undoWorked, '撤销成功恢复时间');
    
    // 重做
    scene.commandManager.redo();
    await sleep(50);
    
    const afterRedo = testHotspots.map(h => ({
        id: h.id,
        start: h.startTime,
        end: h.endTime
    }));
    
    const redoWorked = beforeUndo.every((before, i) => {
        const after = afterRedo[i];
        return Math.abs(before.start - after.start) < 0.01 && 
               Math.abs(before.end - after.end) < 0.01;
    });
    assert(redoWorked, '重做成功恢复时间');
    
    // 清理测试热区
    log('\n清理: 删除测试热区', 'info');
    testHotspots.forEach(h => {
        scene.removeHotspot(h.id);
    });
    
    log('\n✅ B6测试完成', 'success');
    return true;
}

// ============================================
// 集成测试：A4 + B5 + B6
// ============================================

async function testIntegration() {
    log('\n========== 集成测试: A4 + B5 + B6 ==========', 'test');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    // 测试场景：使用A4创建热区，使用B5吸附，使用B6批量调整
    log('\n场景: 创建多个热区并批量对齐', 'info');
    
    // 1. 启用吸附
    timeline.snapController.setEnabled(true);
    log('✓ 吸附已启用', 'success');
    
    // 2. 使用A4创建3个热区
    log('\n使用A4创建3个热区...', 'info');
    const createdIds = [];
    for (let i = 0; i < 3; i++) {
        const startX = 100 + i * 300;
        timeline.directCreateController.handleMouseDown(startX, 50, true);
        timeline.directCreateController.handleMouseMove(startX + 200, 50);
        timeline.directCreateController.handleMouseUp();
        await sleep(100);
        
        const lastHotspot = scene.hotspots[scene.hotspots.length - 1];
        createdIds.push(lastHotspot.config.id);
    }
    assert(createdIds.length === 3, '创建了3个热区');
    
    // 3. 多选这些热区
    log('\n多选热区...', 'info');
    timeline.selectionController.clearSelection();
    createdIds.forEach(id => {
        timeline.selectionController.selectedIds.add(id);
    });
    assert(timeline.selectionController.getSelectionCount() === 3, '已选中3个热区');
    
    // 4. 使用B6批量移动，B5自动吸附
    log('\n批量移动并吸附到网格...', 'info');
    const firstHotspot = scene.hotspots.find(h => h.config.id === createdIds[0]);
    const target = { hotspot: firstHotspot.config, handle: 'body' };
    
    timeline.dragController.startDrag(target, 100);
    
    // 移动到接近5秒的位置（应该吸附到5秒）
    const targetX = 5.1 * timeline.scale;
    timeline.dragController.drag(targetX);
    
    // 检查是否吸附
    if (timeline.snapController.currentSnapLine !== null) {
        log('✓ 拖拽时触发了吸附', 'success');
    }
    
    timeline.dragController.endDrag();
    await sleep(100);
    
    // 验证所有热区都被移动
    const allMoved = createdIds.every(id => {
        const hotspot = scene.hotspots.find(h => h.config.id === id);
        return hotspot && hotspot.config.startTime > 0;
    });
    assert(allMoved, '所有热区都被批量移动');
    
    // 5. 验证相对位置保持
    log('\n验证相对位置保持...', 'info');
    const hotspots = createdIds.map(id => 
        scene.hotspots.find(h => h.config.id === id)
    );
    
    const durations = hotspots.map(h => 
        h.config.endTime - h.config.startTime
    );
    
    const durationsValid = durations.every(d => d > 0 && d < 10);
    assert(durationsValid, '持续时间合理');
    
    // 清理
    log('\n清理测试热区...', 'info');
    createdIds.forEach(id => {
        scene.removeHotspot(id);
    });
    
    log('\n✅ 集成测试完成', 'success');
    return true;
}

// ============================================
// 性能测试
// ============================================

async function testPerformance() {
    log('\n========== 性能测试 ==========', 'test');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    // 测试1: A4创建性能
    log('\n测试1: A4创建性能（10次）', 'info');
    const a4Times = [];
    for (let i = 0; i < 10; i++) {
        const start = performance.now();
        
        timeline.directCreateController.handleMouseDown(100 + i * 50, 50, true);
        timeline.directCreateController.handleMouseMove(300 + i * 50, 50);
        timeline.directCreateController.handleMouseUp();
        
        const duration = performance.now() - start;
        a4Times.push(duration);
        await sleep(10);
    }
    
    const a4Avg = a4Times.reduce((a, b) => a + b, 0) / a4Times.length;
    const a4Max = Math.max(...a4Times);
    log(`  平均: ${a4Avg.toFixed(2)}ms`, 'info');
    log(`  最大: ${a4Max.toFixed(2)}ms`, 'info');
    assert(a4Max < 50, 'A4创建性能 < 50ms');
    
    // 测试2: B5吸附性能
    log('\n测试2: B5吸附性能（100次）', 'info');
    const b5Times = [];
    for (let i = 0; i < 100; i++) {
        const start = performance.now();
        timeline.snapController.snapTime(i * 0.1);
        const duration = performance.now() - start;
        b5Times.push(duration);
    }
    
    const b5Avg = b5Times.reduce((a, b) => a + b, 0) / b5Times.length;
    const b5Max = Math.max(...b5Times);
    log(`  平均: ${b5Avg.toFixed(3)}ms`, 'info');
    log(`  最大: ${b5Max.toFixed(3)}ms`, 'info');
    assert(b5Max < 1, 'B5吸附性能 < 1ms');
    
    // 测试3: B6批量操作性能
    log('\n测试3: B6批量操作性能（20个热区）', 'info');
    
    // 创建20个热区
    const testIds = [];
    for (let i = 0; i < 20; i++) {
        const config = {
            id: Date.now() + i,
            shape: 'rect',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            color: '#00ff00',
            strokeWidth: 2,
            startTime: i * 0.5,
            endTime: i * 0.5 + 0.4
        };
        scene.addHotspot(config);
        testIds.push(config.id);
        await sleep(5);
    }
    
    // 全选
    timeline.selectionController.clearSelection();
    testIds.forEach(id => {
        timeline.selectionController.selectedIds.add(id);
    });
    
    // 批量移动
    const firstHotspot = scene.hotspots.find(h => h.config.id === testIds[0]);
    const target = { hotspot: firstHotspot.config, handle: 'body' };
    
    const start = performance.now();
    timeline.dragController.startDrag(target, 0);
    timeline.dragController.drag(100);
    timeline.dragController.endDrag();
    const duration = performance.now() - start;
    
    log(`  批量移动20个热区: ${duration.toFixed(2)}ms`, 'info');
    assert(duration < 100, 'B6批量操作性能 < 100ms');
    
    // 清理
    testIds.forEach(id => {
        scene.removeHotspot(id);
    });
    
    log('\n✅ 性能测试完成', 'success');
    return true;
}

// ============================================
// 主测试函数
// ============================================

async function runAllTests() {
    log('\n╔════════════════════════════════════════════════════════╗', 'test');
    log('║     A4、B5、B6 完整功能测试和验证                      ║', 'test');
    log('╚════════════════════════════════════════════════════════╝', 'test');
    
    const results = {
        a4: false,
        b5: false,
        b6: false,
        integration: false,
        performance: false
    };
    
    try {
        results.a4 = await testA4DirectCreate();
        await sleep(500);
        
        results.b5 = await testB5MagneticSnap();
        await sleep(500);
        
        results.b6 = await testB6BatchAdjust();
        await sleep(500);
        
        results.integration = await testIntegration();
        await sleep(500);
        
        results.performance = await testPerformance();
        
    } catch (error) {
        log(`\n❌ 测试失败: ${error.message}`, 'error');
        console.error(error);
    }
    
    // 总结
    log('\n╔════════════════════════════════════════════════════════╗', 'test');
    log('║                    测试结果总结                        ║', 'test');
    log('╚════════════════════════════════════════════════════════╝', 'test');
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    log(`\nA4 时间轴直接创建: ${results.a4 ? '✅ 通过' : '❌ 失败'}`, results.a4 ? 'success' : 'error');
    log(`B5 磁性吸附: ${results.b5 ? '✅ 通过' : '❌ 失败'}`, results.b5 ? 'success' : 'error');
    log(`B6 批量时间调整: ${results.b6 ? '✅ 通过' : '❌ 失败'}`, results.b6 ? 'success' : 'error');
    log(`集成测试: ${results.integration ? '✅ 通过' : '❌ 失败'}`, results.integration ? 'success' : 'error');
    log(`性能测试: ${results.performance ? '✅ 通过' : '❌ 失败'}`, results.performance ? 'success' : 'error');
    
    log(`\n总计: ${passed}/${total} 通过`, passed === total ? 'success' : 'warning');
    
    if (passed === total) {
        log('\n🎉 所有测试通过！功能完整且性能优秀！', 'success');
    } else {
        log('\n⚠️ 部分测试失败，请检查相关功能', 'warning');
    }
    
    return results;
}

// ============================================
// 快速测试函数（用于开发调试）
// ============================================

async function quickTest() {
    log('\n========== 快速测试 ==========', 'test');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    log('\n1. 测试A4创建', 'info');
    timeline.directCreateController.handleMouseDown(100, 50, true);
    timeline.directCreateController.handleMouseMove(300, 50);
    timeline.directCreateController.handleMouseUp();
    await sleep(200);
    log('✓ A4创建完成', 'success');
    
    log('\n2. 测试B5吸附', 'info');
    const snapped = timeline.snapController.snapTime(5.08);
    log(`✓ 吸附: 5.08 -> ${snapped.toFixed(2)}`, 'success');
    
    log('\n3. 测试B6批量', 'info');
    if (scene.hotspots.length >= 2) {
        timeline.selectionController.clearSelection();
        scene.hotspots.slice(0, 2).forEach(h => {
            timeline.selectionController.selectedIds.add(h.config.id);
        });
        log(`✓ 已选中 ${timeline.selectionController.getSelectionCount()} 个热区`, 'success');
    }
    
    log('\n✅ 快速测试完成', 'success');
}

// ============================================
// 导出测试函数
// ============================================

window.testA4B5B6 = {
    runAll: runAllTests,
    quick: quickTest,
    a4: testA4DirectCreate,
    b5: testB5MagneticSnap,
    b6: testB6BatchAdjust,
    integration: testIntegration,
    performance: testPerformance
};

// 自动运行提示
console.log('%c测试脚本已加载！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
console.log('%c运行测试:', 'color: #2196F3; font-weight: bold;');
console.log('  testA4B5B6.runAll()     - 运行所有测试');
console.log('  testA4B5B6.quick()      - 快速测试');
console.log('  testA4B5B6.a4()         - 测试A4');
console.log('  testA4B5B6.b5()         - 测试B5');
console.log('  testA4B5B6.b6()         - 测试B6');
console.log('  testA4B5B6.integration()- 集成测试');
console.log('  testA4B5B6.performance()- 性能测试');
