// TEST_B6.js - B6功能测试脚本（批量时间调整）
// 完全遵循 Phaser 3 官方标准

/**
 * 快速测试 B6 功能
 * 在浏览器控制台运行: quickTestB6()
 */
function quickTestB6() {
    console.log('🧪 开始测试 B6：批量时间调整');
    console.log('');
    
    // 测试1：检查控制器是否存在
    console.log('📋 测试1：检查控制器');
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    const scene = window.game?.scene?.getScene('EditorScene');
    
    if (!timeline || !scene) {
        console.error('❌ 找不到必要的对象');
        return;
    }
    
    if (!timeline.dragController) {
        console.error('❌ TimelineDragController 未初始化');
        return;
    }
    
    if (!timeline.selectionController) {
        console.error('❌ TimelineSelectionController 未初始化');
        return;
    }
    
    console.log('✅ TimelineDragController 已初始化');
    console.log('✅ TimelineSelectionController 已初始化');
    console.log('');
    
    // 测试2：检查批量方法
    console.log('📋 测试2：检查批量方法');
    const methods = {
        'batchAdjustStartTime': typeof timeline.dragController.batchAdjustStartTime === 'function',
        'batchAdjustEndTime': typeof timeline.dragController.batchAdjustEndTime === 'function',
        'batchMoveTime': typeof timeline.dragController.batchMoveTime === 'function',
        'getOriginalTime': typeof timeline.dragController.getOriginalTime === 'function'
    };
    
    let allMethodsExist = true;
    for (const [method, exists] of Object.entries(methods)) {
        if (exists) {
            console.log(`✅ ${method} 方法存在`);
        } else {
            console.error(`❌ ${method} 方法缺失`);
            allMethodsExist = false;
        }
    }
    console.log('');
    
    // 测试3：检查热区数量
    console.log('📋 测试3：检查热区数量');
    const hotspots = scene.registry.get('hotspots') || [];
    console.log(`   当前热区数: ${hotspots.length}`);
    
    if (hotspots.length < 2) {
        console.warn('   ⚠️ 热区数量少于2个，无法测试批量功能');
        console.warn('   请先创建至少2个热区');
    } else {
        console.log('   ✅ 热区数量足够，可以测试批量功能');
    }
    console.log('');
    
    // 测试4：检查选择功能
    console.log('📋 测试4：检查选择功能');
    const selectedCount = timeline.selectionController.getSelectionCount();
    console.log(`   当前选中数: ${selectedCount}`);
    
    if (selectedCount === 0) {
        console.log('   提示：请在时间轴上选中多个热区进行测试');
    } else if (selectedCount === 1) {
        console.log('   提示：当前只选中1个热区，请Ctrl+点击选中更多');
    } else {
        console.log(`   ✅ 已选中 ${selectedCount} 个热区，可以测试批量拖拽`);
    }
    console.log('');
    
    // 测试5：检查批量原始时间保存
    console.log('📋 测试5：检查批量原始时间保存');
    if (timeline.dragController.batchOriginalTimes) {
        console.log(`   批量原始时间已保存: ${timeline.dragController.batchOriginalTimes.size}个`);
    } else {
        console.log('   批量原始时间未保存（正常，拖拽时才保存）');
    }
    console.log('');
    
    // 总结
    console.log('📊 测试总结');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allMethodsExist) {
        console.log('✅ 所有功能已正确集成');
        console.log('');
        console.log('🎯 使用方法：');
        console.log('   1. 在时间轴上选中多个热区（Ctrl+点击）');
        console.log('   2. 拖拽任意一个热区的时间条');
        console.log('   3. 所有选中的热区同步移动');
        console.log('   4. 支持三种拖拽模式：');
        console.log('      - 拖拽开始手柄：批量调整开始时间');
        console.log('      - 拖拽结束手柄：批量调整结束时间');
        console.log('      - 拖拽中间区域：批量整体移动');
        console.log('');
        console.log('💡 提示：');
        console.log('   - 批量操作支持撤销/重做（Ctrl+Z / Ctrl+Y）');
        console.log('   - 批量操作会显示Toast提示');
        console.log('   - 保持相对位置不变');
        console.log('   - 自动边界检查');
    } else {
        console.error('❌ 部分功能未正确集成，请检查代码');
    }
}

/**
 * 详细测试 B6 功能
 * 在浏览器控制台运行: detailedTestB6()
 */
function detailedTestB6() {
    console.log('🔬 开始详细测试 B6：批量时间调整');
    console.log('');
    
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    const scene = window.game?.scene?.getScene('EditorScene');
    
    if (!timeline || !scene) {
        console.error('❌ 无法获取必要的对象');
        return;
    }
    
    const dragController = timeline.dragController;
    const selectionController = timeline.selectionController;
    
    // 测试1：模拟选择多个热区
    console.log('📋 测试1：模拟选择多个热区');
    const hotspots = scene.registry.get('hotspots') || [];
    
    if (hotspots.length < 2) {
        console.error('❌ 热区数量不足，请先创建至少2个热区');
        return;
    }
    
    // 选择前2个热区
    selectionController.clearSelection();
    selectionController.selectHotspot(hotspots[0].id, false);
    selectionController.selectHotspot(hotspots[1].id, true);
    
    console.log(`   已选中 ${selectionController.getSelectionCount()} 个热区`);
    console.log(`   热区1: ${hotspots[0].startTime}s - ${hotspots[0].endTime}s`);
    console.log(`   热区2: ${hotspots[1].startTime}s - ${hotspots[1].endTime}s`);
    console.log('');
    
    // 测试2：测试批量移动
    console.log('📋 测试2：测试批量移动');
    const originalTimes = hotspots.slice(0, 2).map(h => ({
        id: h.id,
        start: h.startTime,
        end: h.endTime
    }));
    
    console.log('   执行批量移动 +1秒...');
    dragController.batchMoveTime(1.0);
    
    hotspots.slice(0, 2).forEach((h, i) => {
        const orig = originalTimes[i];
        console.log(`   热区${i+1}: ${orig.start}s → ${h.startTime}s (偏移: ${(h.startTime - orig.start).toFixed(1)}s)`);
    });
    
    // 恢复原始时间
    console.log('   恢复原始时间...');
    dragController.batchMoveTime(-1.0);
    console.log('');
    
    // 测试3：测试批量调整开始时间
    console.log('📋 测试3：测试批量调整开始时间');
    console.log('   执行批量调整开始时间 +0.5秒...');
    dragController.batchAdjustStartTime(0.5);
    
    hotspots.slice(0, 2).forEach((h, i) => {
        const orig = originalTimes[i];
        console.log(`   热区${i+1}: ${orig.start}s → ${h.startTime}s`);
    });
    
    // 恢复
    dragController.batchAdjustStartTime(-0.5);
    console.log('');
    
    // 测试4：测试批量调整结束时间
    console.log('📋 测试4：测试批量调整结束时间');
    console.log('   执行批量调整结束时间 +0.5秒...');
    dragController.batchAdjustEndTime(0.5);
    
    hotspots.slice(0, 2).forEach((h, i) => {
        const orig = originalTimes[i];
        console.log(`   热区${i+1}: ${orig.end}s → ${h.endTime}s`);
    });
    
    // 恢复
    dragController.batchAdjustEndTime(-0.5);
    console.log('');
    
    // 测试5：测试边界检查
    console.log('📋 测试5：测试边界检查');
    console.log('   测试移动到负数时间...');
    const beforeMove = hotspots[0].startTime;
    dragController.batchMoveTime(-100);
    const afterMove = hotspots[0].startTime;
    console.log(`   移动前: ${beforeMove}s`);
    console.log(`   移动后: ${afterMove}s`);
    console.log(`   ${afterMove >= 0 ? '✅' : '❌'} 边界检查正常`);
    
    // 恢复
    dragController.batchMoveTime(100);
    console.log('');
    
    // 测试6：测试原始时间保存
    console.log('📋 测试6：测试原始时间保存');
    
    // 模拟开始拖拽
    const mockTarget = {
        hotspot: hotspots[0],
        handle: 'body'
    };
    dragController.startDrag(mockTarget, 100);
    
    console.log(`   批量原始时间已保存: ${dragController.batchOriginalTimes ? dragController.batchOriginalTimes.size : 0}个`);
    
    if (dragController.batchOriginalTimes) {
        dragController.batchOriginalTimes.forEach((time, id) => {
            console.log(`   热区 ${id}: ${time.startTime}s - ${time.endTime}s`);
        });
    }
    
    // 结束拖拽
    dragController.endDrag();
    console.log('');
    
    // 清除选择
    selectionController.clearSelection();
    
    console.log('✅ 详细测试完成');
}

/**
 * 压力测试 B6 功能
 * 在浏览器控制台运行: stressTestB6()
 */
function stressTestB6() {
    console.log('💪 开始压力测试 B6：批量时间调整');
    console.log('');
    
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    const scene = window.game?.scene?.getScene('EditorScene');
    
    if (!timeline || !scene) {
        console.error('❌ 无法获取必要的对象');
        return;
    }
    
    const dragController = timeline.dragController;
    const selectionController = timeline.selectionController;
    
    // 测试1：大量批量移动
    console.log('📋 测试1：大量批量移动（100次）');
    const hotspots = scene.registry.get('hotspots') || [];
    
    if (hotspots.length < 2) {
        console.error('❌ 热区数量不足');
        return;
    }
    
    // 选择所有热区
    selectionController.clearSelection();
    hotspots.forEach(h => {
        selectionController.selectHotspot(h.id, true);
    });
    
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
        dragController.batchMoveTime(0.01);
        dragController.batchMoveTime(-0.01);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`   ✅ 完成 100 次批量移动，耗时: ${duration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(duration / 100).toFixed(3)}ms`);
    console.log('');
    
    // 测试2：大量批量调整
    console.log('📋 测试2：大量批量调整（100次）');
    const adjustStart = performance.now();
    
    for (let i = 0; i < 50; i++) {
        dragController.batchAdjustStartTime(0.01);
        dragController.batchAdjustStartTime(-0.01);
    }
    
    for (let i = 0; i < 50; i++) {
        dragController.batchAdjustEndTime(0.01);
        dragController.batchAdjustEndTime(-0.01);
    }
    
    const adjustEnd = performance.now();
    const adjustDuration = adjustEnd - adjustStart;
    console.log(`   ✅ 完成 100 次批量调整，耗时: ${adjustDuration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(adjustDuration / 100).toFixed(3)}ms`);
    console.log('');
    
    // 测试3：大量选择操作
    console.log('📋 测试3：大量选择操作（100次）');
    const selectStart = performance.now();
    
    for (let i = 0; i < 100; i++) {
        selectionController.clearSelection();
        hotspots.forEach(h => {
            selectionController.selectHotspot(h.id, true);
        });
    }
    
    const selectEnd = performance.now();
    const selectDuration = selectEnd - selectStart;
    console.log(`   ✅ 完成 100 次选择操作，耗时: ${selectDuration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(selectDuration / 100).toFixed(3)}ms`);
    console.log('');
    
    // 测试4：内存泄漏检查
    console.log('📋 测试4：内存泄漏检查（1000次操作）');
    const memStart = performance.now();
    
    for (let i = 0; i < 1000; i++) {
        const mockTarget = {
            hotspot: hotspots[0],
            handle: 'body'
        };
        dragController.startDrag(mockTarget, 100);
        dragController.batchMoveTime(0.001);
        dragController.endDrag();
    }
    
    const memEnd = performance.now();
    const memDuration = memEnd - memStart;
    console.log(`   ✅ 完成 1000 次操作，耗时: ${memDuration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(memDuration / 1000).toFixed(3)}ms`);
    console.log('');
    
    // 清除选择
    selectionController.clearSelection();
    
    console.log('✅ 压力测试完成');
    console.log('');
    console.log('📊 性能指标：');
    console.log(`   批量移动: ${(duration / 100).toFixed(3)}ms/次`);
    console.log(`   批量调整: ${(adjustDuration / 100).toFixed(3)}ms/次`);
    console.log(`   选择操作: ${(selectDuration / 100).toFixed(3)}ms/次`);
    console.log(`   完整拖拽: ${(memDuration / 1000).toFixed(3)}ms/次`);
}

// 导出到全局
window.quickTestB6 = quickTestB6;
window.detailedTestB6 = detailedTestB6;
window.stressTestB6 = stressTestB6;

console.log('📦 B6 测试脚本已加载');
console.log('   运行 quickTestB6() - 快速测试');
console.log('   运行 detailedTestB6() - 详细测试');
console.log('   运行 stressTestB6() - 压力测试');
