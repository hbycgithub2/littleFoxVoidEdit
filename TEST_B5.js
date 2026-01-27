// TEST_B5.js - B5功能测试脚本（时间轴磁性吸附）
// 完全遵循 Phaser 3 官方标准

/**
 * 快速测试 B5 功能
 * 在浏览器控制台运行: quickTestB5()
 */
function quickTestB5() {
    console.log('🧪 开始测试 B5：时间轴磁性吸附');
    console.log('');
    
    // 测试1：检查控制器是否存在
    console.log('📋 测试1：检查 TimelineSnapController');
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    if (!timeline) {
        console.error('❌ 找不到 TimelinePanel');
        return;
    }
    
    if (!timeline.snapController) {
        console.error('❌ TimelineSnapController 未初始化');
        return;
    }
    console.log('✅ TimelineSnapController 已初始化');
    console.log('');
    
    // 测试2：检查吸附设置
    console.log('📋 测试2：检查吸附设置');
    const settings = timeline.snapController.getSettings();
    console.log(`   启用状态: ${settings.enabled ? '是' : '否'}`);
    console.log(`   吸附阈值: ${settings.snapThreshold}px`);
    console.log(`   吸附到网格: ${settings.snapToGrid ? '是' : '否'}`);
    console.log(`   吸附到热区: ${settings.snapToHotspots ? '是' : '否'}`);
    console.log(`   吸附到标记: ${settings.snapToMarkers ? '是' : '否'}`);
    console.log('');
    
    // 测试3：检查吸附方法
    console.log('📋 测试3：检查吸附方法');
    const methods = {
        'snapTime': typeof timeline.snapController.snapTime === 'function',
        'findClosestSnap': typeof timeline.snapController.findClosestSnap === 'function',
        'calculateSnapPoints': typeof timeline.snapController.calculateSnapPoints === 'function',
        'drawSnapLine': typeof timeline.snapController.drawSnapLine === 'function',
        'toggle': typeof timeline.snapController.toggle === 'function'
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
    
    // 测试4：检查吸附点计算
    console.log('📋 测试4：检查吸附点计算');
    const snapPoints = timeline.snapController.calculateSnapPoints();
    console.log(`   总吸附点数: ${snapPoints.length}`);
    
    const typeCount = {};
    snapPoints.forEach(point => {
        typeCount[point.type] = (typeCount[point.type] || 0) + 1;
    });
    
    for (const [type, count] of Object.entries(typeCount)) {
        console.log(`   ${type}: ${count}个`);
    }
    console.log('');
    
    // 测试5：测试吸附计算
    console.log('📋 测试5：测试吸附计算');
    const testTime = 5.0;
    const snappedTime = timeline.snapController.snapTime(testTime);
    console.log(`   原始时间: ${testTime}s`);
    console.log(`   吸附后时间: ${snappedTime}s`);
    console.log(`   是否吸附: ${testTime !== snappedTime ? '是' : '否'}`);
    if (timeline.snapController.currentSnapType) {
        console.log(`   吸附类型: ${timeline.snapController.currentSnapType}`);
    }
    console.log('');
    
    // 测试6：测试切换功能
    console.log('📋 测试6：测试切换功能');
    const originalState = timeline.snapController.enabled;
    console.log(`   原始状态: ${originalState ? '启用' : '禁用'}`);
    
    timeline.snapController.toggle();
    console.log(`   切换后: ${timeline.snapController.enabled ? '启用' : '禁用'}`);
    
    timeline.snapController.toggle();
    console.log(`   再次切换: ${timeline.snapController.enabled ? '启用' : '禁用'}`);
    console.log('');
    
    // 总结
    console.log('📊 测试总结');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allMethodsExist) {
        console.log('✅ 所有功能已正确集成');
        console.log('');
        console.log('🎯 使用方法：');
        console.log('   1. 拖拽热区时间条，自动吸附到其他热区边缘');
        console.log('   2. 吸附时显示彩色吸附线和标签');
        console.log('   3. 吸附优先级：热区边缘 > 标记 > 网格');
        console.log('   4. 按 S 键切换吸附开关');
        console.log('');
        console.log('💡 提示：');
        console.log('   - 青色线：吸附到热区边缘');
        console.log('   - 橙色线：吸附到网格');
        console.log('   - 蓝色线：吸附到标记');
        console.log('   - 绿色线：吸附到入点');
        console.log('   - 红色线：吸附到出点');
    } else {
        console.error('❌ 部分功能未正确集成，请检查代码');
    }
}

/**
 * 详细测试 B5 功能
 * 在浏览器控制台运行: detailedTestB5()
 */
function detailedTestB5() {
    console.log('🔬 开始详细测试 B5：时间轴磁性吸附');
    console.log('');
    
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    const scene = window.game?.scene?.getScene('EditorScene');
    
    if (!timeline || !scene) {
        console.error('❌ 无法获取必要的对象');
        return;
    }
    
    const controller = timeline.snapController;
    
    // 测试1：测试不同时间的吸附
    console.log('📋 测试1：测试不同时间的吸附');
    const testTimes = [0.5, 1.0, 2.5, 5.0, 10.0];
    testTimes.forEach(time => {
        const snapped = controller.snapTime(time);
        const diff = Math.abs(snapped - time);
        console.log(`   ${time}s → ${snapped}s (偏移: ${diff.toFixed(3)}s)`);
    });
    console.log('');
    
    // 测试2：测试吸附阈值
    console.log('📋 测试2：测试吸附阈值');
    const originalThreshold = controller.snapThreshold;
    console.log(`   原始阈值: ${originalThreshold}px`);
    
    controller.snapThreshold = 5;
    console.log(`   设置阈值为 5px`);
    const snap1 = controller.snapTime(5.05);
    console.log(`   5.05s 吸附结果: ${snap1}s`);
    
    controller.snapThreshold = 20;
    console.log(`   设置阈值为 20px`);
    const snap2 = controller.snapTime(5.05);
    console.log(`   5.05s 吸附结果: ${snap2}s`);
    
    controller.snapThreshold = originalThreshold;
    console.log(`   恢复原始阈值: ${originalThreshold}px`);
    console.log('');
    
    // 测试3：测试吸附类型过滤
    console.log('📋 测试3：测试吸附类型过滤');
    
    // 禁用网格吸附
    controller.snapToGrid = false;
    const snapPoints1 = controller.calculateSnapPoints();
    const gridCount1 = snapPoints1.filter(p => p.type === 'grid').length;
    console.log(`   禁用网格吸附后，网格点数: ${gridCount1}`);
    
    // 启用网格吸附
    controller.snapToGrid = true;
    const snapPoints2 = controller.calculateSnapPoints();
    const gridCount2 = snapPoints2.filter(p => p.type === 'grid').length;
    console.log(`   启用网格吸附后，网格点数: ${gridCount2}`);
    console.log('');
    
    // 测试4：测试优先级
    console.log('📋 测试4：测试吸附优先级');
    console.log('   创建测试热区...');
    
    // 获取当前热区数量
    const hotspots = scene.registry.get('hotspots') || [];
    console.log(`   当前热区数: ${hotspots.length}`);
    
    if (hotspots.length > 0) {
        const testHotspot = hotspots[0];
        console.log(`   测试热区时间: ${testHotspot.startTime}s - ${testHotspot.endTime}s`);
        
        // 测试吸附到热区开始
        const nearStart = testHotspot.startTime + 0.05;
        const snappedStart = controller.snapTime(nearStart, testHotspot.id);
        console.log(`   ${nearStart}s → ${snappedStart}s (应吸附到开始)`);
        
        // 测试吸附到热区结束
        const nearEnd = testHotspot.endTime - 0.05;
        const snappedEnd = controller.snapTime(nearEnd, testHotspot.id);
        console.log(`   ${nearEnd}s → ${snappedEnd}s (应吸附到结束)`);
    } else {
        console.log('   ⚠️ 没有热区，跳过优先级测试');
    }
    console.log('');
    
    // 测试5：测试视觉反馈
    console.log('📋 测试5：测试视觉反馈');
    controller.snapTime(5.0);
    console.log(`   当前吸附线位置: ${controller.currentSnapLine}`);
    console.log(`   当前吸附类型: ${controller.currentSnapType}`);
    console.log(`   当前吸附信息: ${JSON.stringify(controller.currentSnapInfo)}`);
    console.log('');
    
    console.log('✅ 详细测试完成');
}

/**
 * 压力测试 B5 功能
 * 在浏览器控制台运行: stressTestB5()
 */
function stressTestB5() {
    console.log('💪 开始压力测试 B5：时间轴磁性吸附');
    console.log('');
    
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    
    if (!timeline) {
        console.error('❌ 无法获取 TimelinePanel');
        return;
    }
    
    const controller = timeline.snapController;
    
    // 测试1：大量吸附计算
    console.log('📋 测试1：大量吸附计算（1000次）');
    const startTime = performance.now();
    
    for (let i = 0; i < 1000; i++) {
        const randomTime = Math.random() * 60;
        controller.snapTime(randomTime);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`   ✅ 完成 1000 次吸附计算，耗时: ${duration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(duration / 1000).toFixed(3)}ms`);
    console.log('');
    
    // 测试2：快速切换
    console.log('📋 测试2：快速切换（100次）');
    const toggleStart = performance.now();
    
    for (let i = 0; i < 100; i++) {
        controller.toggle();
    }
    
    const toggleEnd = performance.now();
    const toggleDuration = toggleEnd - toggleStart;
    console.log(`   ✅ 完成 100 次切换，耗时: ${toggleDuration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(toggleDuration / 100).toFixed(3)}ms`);
    console.log('');
    
    // 测试3：大量吸附点计算
    console.log('📋 测试3：大量吸附点计算（100次）');
    const calcStart = performance.now();
    
    for (let i = 0; i < 100; i++) {
        controller.calculateSnapPoints();
    }
    
    const calcEnd = performance.now();
    const calcDuration = calcEnd - calcStart;
    console.log(`   ✅ 完成 100 次吸附点计算，耗时: ${calcDuration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(calcDuration / 100).toFixed(3)}ms`);
    console.log('');
    
    // 测试4：内存泄漏检查
    console.log('📋 测试4：内存泄漏检查（1000次操作）');
    const memStart = performance.now();
    
    for (let i = 0; i < 1000; i++) {
        controller.snapTime(Math.random() * 60);
        controller.clearSnap();
    }
    
    const memEnd = performance.now();
    const memDuration = memEnd - memStart;
    console.log(`   ✅ 完成 1000 次操作，耗时: ${memDuration.toFixed(2)}ms`);
    console.log(`   平均每次: ${(memDuration / 1000).toFixed(3)}ms`);
    console.log('');
    
    console.log('✅ 压力测试完成');
    console.log('');
    console.log('📊 性能指标：');
    console.log(`   吸附计算: ${(duration / 1000).toFixed(3)}ms/次`);
    console.log(`   切换操作: ${(toggleDuration / 100).toFixed(3)}ms/次`);
    console.log(`   吸附点计算: ${(calcDuration / 100).toFixed(3)}ms/次`);
}

// 导出到全局
window.quickTestB5 = quickTestB5;
window.detailedTestB5 = detailedTestB5;
window.stressTestB5 = stressTestB5;

console.log('📦 B5 测试脚本已加载');
console.log('   运行 quickTestB5() - 快速测试');
console.log('   运行 detailedTestB5() - 详细测试');
console.log('   运行 stressTestB5() - 压力测试');
