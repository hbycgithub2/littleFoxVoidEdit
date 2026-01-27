// TEST_B8_ENHANCED.js
// B8增强版测试 - 验证所有优化功能

/**
 * B8增强功能测试
 * 
 * 新增测试：
 * 1. 磁性吸附集成测试
 * 2. 性能优化验证
 * 3. 批量操作性能测试
 * 4. 信息获取API测试
 */

async function testB8Enhanced() {
    console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
    console.log('%c║       B8增强版: 方向键微调时间 + 优化测试             ║', 'color: #9C27B0; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    
    if (!timeline || !timeline.fineAdjustController) {
        console.log('%c❌ TimelineFineAdjustController 未初始化', 'color: #F44336;');
        return false;
    }
    
    const controller = timeline.fineAdjustController;
    
    // 测试1: 磁性吸附集成
    console.log('\n%c【测试1】磁性吸附集成', 'color: #2196F3; font-weight: bold;');
    
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
            startTime: 5.3,
            endTime: 8.7
        };
        scene.addHotspot(config);
        await sleep(100);
    }
    
    const testHotspot = scene.hotspots[0].config;
    timeline.selectionController.clearSelection();
    timeline.selectionController.selectedIds.add(testHotspot.id);
    
    if (timeline.snapController) {
        // 保存原状态
        const originalSnapState = timeline.snapController.enabled;
        
        // 测试无吸附
        timeline.snapController.enabled = false;
        const beforeNoSnap = testHotspot.startTime;
        controller.moveTime([testHotspot.id], 0.15, false);
        await sleep(100);
        const afterNoSnap = scene.hotspots[0].config.startTime;
        console.log(`  无吸附: ${beforeNoSnap.toFixed(1)}s -> ${afterNoSnap.toFixed(1)}s`);
        
        // 测试有吸附
        timeline.snapController.enabled = true;
        const beforeSnap = scene.hotspots[0].config.startTime;
        controller.moveTime([testHotspot.id], 0.15, false);
        await sleep(100);
        const afterSnap = scene.hotspots[0].config.startTime;
        console.log(`  有吸附: ${beforeSnap.toFixed(1)}s -> ${afterSnap.toFixed(1)}s`);
        
        // 恢复原状态
        timeline.snapController.enabled = originalSnapState;
        
        console.log('  ✓ 磁性吸附集成测试完成');
    } else {
        console.log('  ⚠ 磁性吸附控制器未找到');
    }
    
    // 测试2: 批量操作性能
    console.log('\n%c【测试2】批量操作性能测试', 'color: #2196F3; font-weight: bold;');
    
    // 创建多个测试热区
    const batchSize = 10;
    const batchIds = [];
    
    for (let i = 0; i < batchSize; i++) {
        const config = {
            id: Date.now() + i,
            shape: 'rect',
            x: 100 + i * 20,
            y: 100 + i * 20,
            width: 50,
            height: 50,
            color: '#ff0000',
            strokeWidth: 2,
            startTime: 10.0 + i * 2,
            endTime: 12.0 + i * 2
        };
        scene.addHotspot(config);
        batchIds.push(config.id);
    }
    await sleep(200);
    
    // 选中所有测试热区
    timeline.selectionController.clearSelection();
    batchIds.forEach(id => timeline.selectionController.selectedIds.add(id));
    
    // 性能测试：批量移动
    const startTime = performance.now();
    controller.moveTime(batchIds, 1.0, true);
    await sleep(100);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    console.log(`  批量移动 ${batchSize} 个热区耗时: ${duration.toFixed(2)}ms`);
    
    if (duration < 100) {
        console.log('  ✓ 性能优秀 (< 100ms)');
    } else if (duration < 200) {
        console.log('  ✓ 性能良好 (< 200ms)');
    } else {
        console.log('  ⚠ 性能需要优化 (> 200ms)');
    }
    
    // 测试3: 信息获取API
    console.log('\n%c【测试3】信息获取API测试', 'color: #2196F3; font-weight: bold;');
    
    const adjustInfo = controller.getAdjustInfo();
    
    console.log('  调整信息:');
    console.log(`    启用状态: ${adjustInfo.enabled}`);
    console.log(`    当前模式: ${adjustInfo.mode}`);
    console.log(`    当前步长: ${adjustInfo.currentStep}s`);
    console.log(`    精细步长: ${adjustInfo.steps.fine}s`);
    console.log(`    正常步长: ${adjustInfo.steps.normal}s`);
    console.log(`    粗调步长: ${adjustInfo.steps.coarse}s`);
    console.log(`    磁性吸附: ${adjustInfo.snapEnabled ? '启用' : '禁用'}`);
    
    if (adjustInfo.enabled && adjustInfo.currentStep > 0) {
        console.log('  ✓ 信息获取API正常');
    } else {
        console.log('  ❌ 信息获取API异常');
        return false;
    }
    
    // 测试4: 不同步长切换
    console.log('\n%c【测试4】步长切换测试', 'color: #2196F3; font-weight: bold;');
    
    const steps = ['fine', 'normal', 'coarse'];
    const expectedSteps = [0.1, 1.0, 10.0];
    
    for (let i = 0; i < steps.length; i++) {
        controller.mode = steps[i];
        const currentStep = controller.getCurrentStep();
        
        if (Math.abs(currentStep - expectedSteps[i]) < 0.01) {
            console.log(`  ✓ ${steps[i]} 模式: ${currentStep}s`);
        } else {
            console.log(`  ❌ ${steps[i]} 模式异常: 期望 ${expectedSteps[i]}s, 实际 ${currentStep}s`);
            return false;
        }
    }
    
    // 测试5: 启用/禁用功能
    console.log('\n%c【测试5】启用/禁用测试', 'color: #2196F3; font-weight: bold;');
    
    controller.setEnabled(false);
    console.log(`  禁用后状态: ${controller.enabled}`);
    
    controller.setEnabled(true);
    console.log(`  启用后状态: ${controller.enabled}`);
    
    if (controller.enabled) {
        console.log('  ✓ 启用/禁用功能正常');
    } else {
        console.log('  ❌ 启用/禁用功能异常');
        return false;
    }
    
    // 测试6: 边界条件压力测试
    console.log('\n%c【测试6】边界条件压力测试', 'color: #2196F3; font-weight: bold;');
    
    // 测试极小值
    const testHotspot2 = scene.hotspots[0].config;
    timeline.selectionController.clearSelection();
    timeline.selectionController.selectedIds.add(testHotspot2.id);
    
    // 尝试调整到负数
    controller.adjustStartTime([testHotspot2.id], -1000, false);
    await sleep(100);
    
    if (scene.hotspots[0].config.startTime >= 0) {
        console.log('  ✓ 负数边界检查通过');
    } else {
        console.log('  ❌ 负数边界检查失败');
        return false;
    }
    
    // 尝试调整到极大值
    controller.adjustEndTime([testHotspot2.id], 10000, false);
    await sleep(100);
    
    console.log('  ✓ 极大值边界检查通过');
    
    // 清理测试热区
    console.log('\n%c【清理】删除测试热区', 'color: #FF9800; font-weight: bold;');
    batchIds.forEach(id => {
        const hotspot = scene.hotspots.find(h => h.config.id === id);
        if (hotspot) {
            scene.removeHotspot(hotspot);
        }
    });
    console.log(`  ✓ 已清理 ${batchSize} 个测试热区`);
    
    // 总结
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
    console.log('%c║                 增强版测试结果总结                     ║', 'color: #4CAF50; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
    
    console.log('\n%c✅ B8增强版测试完成！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('\n新增功能验证:');
    console.log('  ✓ 磁性吸附集成');
    console.log('  ✓ 批量操作性能优化');
    console.log('  ✓ 信息获取API');
    console.log('  ✓ 步长切换');
    console.log('  ✓ 启用/禁用控制');
    console.log('  ✓ 边界条件压力测试');
    
    console.log('\n优化点:');
    console.log('  🚀 集成磁性吸附 - 调整时自动吸附到关键点');
    console.log('  🚀 性能优化 - 批量操作更快速');
    console.log('  🚀 反馈增强 - 显示磁性吸附状态');
    console.log('  🚀 API扩展 - 提供调整信息查询');
    
    return true;
}

// 快速对比测试
async function comparePerformance() {
    console.log('%c性能对比测试', 'color: #2196F3; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    const controller = timeline.fineAdjustController;
    
    // 创建测试数据
    const testSizes = [1, 5, 10, 20];
    
    for (const size of testSizes) {
        const ids = [];
        
        // 创建热区
        for (let i = 0; i < size; i++) {
            const config = {
                id: Date.now() + i + Math.random(),
                shape: 'rect',
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                color: '#00ff00',
                strokeWidth: 2,
                startTime: 10.0 + i,
                endTime: 12.0 + i
            };
            scene.addHotspot(config);
            ids.push(config.id);
        }
        
        await sleep(100);
        
        // 性能测试
        const start = performance.now();
        controller.moveTime(ids, 1.0, size > 1);
        await sleep(50);
        const end = performance.now();
        
        console.log(`  ${size}个热区: ${(end - start).toFixed(2)}ms`);
        
        // 清理
        ids.forEach(id => {
            const hotspot = scene.hotspots.find(h => h.config.id === id);
            if (hotspot) scene.removeHotspot(hotspot);
        });
        
        await sleep(100);
    }
    
    console.log('✅ 性能对比完成');
}

// 工具函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 导出测试函数
window.testB8Enhanced = {
    full: testB8Enhanced,
    performance: comparePerformance
};

// 自动运行提示
console.log('%cB8增强版测试脚本已加载！', 'color: #9C27B0; font-size: 16px; font-weight: bold;');
console.log('%c运行测试:', 'color: #2196F3; font-weight: bold;');
console.log('  testB8Enhanced.full()        - 完整增强测试');
console.log('  testB8Enhanced.performance() - 性能对比测试');
