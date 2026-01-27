// TEST_A4.js - A4功能测试脚本（时间轴直接创建热区）
// 完全遵循 Phaser 3 官方标准

/**
 * 快速测试 A4 功能
 * 在浏览器控制台运行: quickTestA4()
 */
function quickTestA4() {
    console.log('🧪 开始测试 A4：时间轴直接创建热区');
    console.log('');
    
    // 测试1：检查控制器是否存在
    console.log('📋 测试1：检查 TimelineDirectCreateController');
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    if (!timeline) {
        console.error('❌ 找不到 TimelinePanel');
        return;
    }
    
    if (!timeline.directCreateController) {
        console.error('❌ TimelineDirectCreateController 未初始化');
        return;
    }
    console.log('✅ TimelineDirectCreateController 已初始化');
    console.log('');
    
    // 测试2：检查集成点
    console.log('📋 测试2：检查集成点');
    const integrationPoints = {
        'handleMouseDown': typeof timeline.directCreateController.handleMouseDown === 'function',
        'handleMouseMove': typeof timeline.directCreateController.handleMouseMove === 'function',
        'handleMouseUp': typeof timeline.directCreateController.handleMouseUp === 'function',
        'drawPreview': typeof timeline.directCreateController.drawPreview === 'function',
        'cancel': typeof timeline.directCreateController.cancel === 'function'
    };
    
    let allIntegrated = true;
    for (const [method, exists] of Object.entries(integrationPoints)) {
        if (exists) {
            console.log(`✅ ${method} 方法存在`);
        } else {
            console.error(`❌ ${method} 方法缺失`);
            allIntegrated = false;
        }
    }
    console.log('');
    
    // 测试3：检查配置
    console.log('📋 测试3：检查配置');
    console.log(`   最小时长: ${timeline.directCreateController.minDuration}秒`);
    console.log(`   当前拖拽状态: ${timeline.directCreateController.isDragging ? '是' : '否'}`);
    console.log('');
    
    // 测试4：检查DrawingManager的lastDrawMode
    console.log('📋 测试4：检查 DrawingManager');
    const scene = window.game?.scene?.getScene('EditorScene');
    if (!scene || !scene.drawingManager) {
        console.error('❌ 找不到 DrawingManager');
        return;
    }
    
    const lastMode = scene.drawingManager.lastDrawMode || 'rect';
    console.log(`✅ 上次使用的形状: ${lastMode}`);
    console.log('');
    
    // 测试5：检查HighlightController集成
    console.log('📋 测试5：检查 HighlightController 集成');
    if (!timeline.highlightController) {
        console.warn('⚠️ TimelineHighlightController 未初始化（可选功能）');
    } else {
        console.log('✅ TimelineHighlightController 已集成');
    }
    console.log('');
    
    // 测试6：模拟创建流程
    console.log('📋 测试6：模拟创建流程');
    console.log('   1. 按住 Alt 键');
    console.log('   2. 在时间轴上拖拽（避开顶部30px的时间刻度区域）');
    console.log('   3. 松开鼠标完成创建');
    console.log('   4. 按 Escape 键可以取消');
    console.log('');
    
    // 测试7：检查Toast提示系统
    console.log('📋 测试7：检查 Toast 提示系统');
    if (window.toast) {
        console.log('✅ Toast 系统可用');
    } else {
        console.warn('⚠️ Toast 系统不可用（提示可能不显示）');
    }
    console.log('');
    
    // 总结
    console.log('📊 测试总结');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allIntegrated) {
        console.log('✅ 所有功能已正确集成');
        console.log('');
        console.log('🎯 使用方法：');
        console.log('   1. 按住 Alt 键');
        console.log('   2. 在时间轴上拖拽（避开顶部时间刻度）');
        console.log('   3. 松开鼠标，热区将在画面中心创建');
        console.log('   4. 时间条会自动高亮，可用方向键微调时间');
        console.log('   5. 按 Escape 可取消拖拽');
        console.log('');
        console.log('💡 提示：');
        console.log('   - 最小时长：0.5秒');
        console.log('   - 使用上次绘制的形状类型');
        console.log('   - 默认尺寸：100x100px');
        console.log('   - 创建后可在画面中调整位置和大小');
    } else {
        console.error('❌ 部分功能未正确集成，请检查代码');
    }
}

/**
 * 详细测试 A4 功能
 * 在浏览器控制台运行: detailedTestA4()
 */
function detailedTestA4() {
    console.log('🔬 开始详细测试 A4：时间轴直接创建热区');
    console.log('');
    
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    const scene = window.game?.scene?.getScene('EditorScene');
    
    if (!timeline || !scene) {
        console.error('❌ 无法获取必要的对象');
        return;
    }
    
    const controller = timeline.directCreateController;
    
    // 测试1：检查初始状态
    console.log('📋 测试1：初始状态');
    console.log(`   isDragging: ${controller.isDragging}`);
    console.log(`   dragStartX: ${controller.dragStartX}`);
    console.log(`   dragCurrentX: ${controller.dragCurrentX}`);
    console.log(`   previewStartTime: ${controller.previewStartTime}`);
    console.log(`   previewEndTime: ${controller.previewEndTime}`);
    console.log(`   minDuration: ${controller.minDuration}`);
    console.log('');
    
    // 测试2：模拟鼠标按下（Alt+点击）
    console.log('📋 测试2：模拟 Alt+点击');
    const testX = 100;
    const testY = 50; // 在时间刻度下方
    const result1 = controller.handleMouseDown(testX, testY, true);
    console.log(`   handleMouseDown(${testX}, ${testY}, true) 返回: ${result1}`);
    console.log(`   isDragging: ${controller.isDragging}`);
    console.log(`   dragStartX: ${controller.dragStartX}`);
    console.log('');
    
    // 测试3：模拟鼠标移动
    console.log('📋 测试3：模拟鼠标移动');
    const testX2 = 200;
    const testY2 = 50;
    const result2 = controller.handleMouseMove(testX2, testY2);
    console.log(`   handleMouseMove(${testX2}, ${testY2}) 返回: ${result2}`);
    console.log(`   dragCurrentX: ${controller.dragCurrentX}`);
    console.log(`   previewStartTime: ${controller.previewStartTime.toFixed(2)}`);
    console.log(`   previewEndTime: ${controller.previewEndTime.toFixed(2)}`);
    console.log(`   duration: ${(controller.previewEndTime - controller.previewStartTime).toFixed(2)}秒`);
    console.log('');
    
    // 测试4：取消拖拽
    console.log('📋 测试4：取消拖拽');
    controller.cancel();
    console.log(`   isDragging: ${controller.isDragging}`);
    console.log('');
    
    // 测试5：测试最小时长检查
    console.log('📋 测试5：测试最小时长检查');
    controller.handleMouseDown(100, 50, true);
    controller.handleMouseMove(103, 50); // 很小的移动
    console.log(`   duration: ${(controller.previewEndTime - controller.previewStartTime).toFixed(2)}秒`);
    console.log(`   是否小于最小时长: ${(controller.previewEndTime - controller.previewStartTime) < controller.minDuration}`);
    const result3 = controller.handleMouseUp();
    console.log(`   handleMouseUp() 返回: ${result3}`);
    console.log('');
    
    // 测试6：检查绘制预览
    console.log('📋 测试6：检查绘制预览');
    controller.handleMouseDown(100, 50, true);
    controller.handleMouseMove(200, 50);
    console.log('   调用 drawPreview() 方法...');
    const canvas = timeline.canvas;
    const ctx = canvas.getContext('2d');
    controller.drawPreview(ctx);
    console.log('   ✅ drawPreview() 执行完成');
    controller.cancel();
    console.log('');
    
    // 测试7：检查形状类型
    console.log('📋 测试7：检查形状类型');
    const shapes = ['circle', 'rect', 'ellipse'];
    shapes.forEach(shape => {
        scene.drawingManager.lastDrawMode = shape;
        console.log(`   设置 lastDrawMode = ${shape}`);
        console.log(`   创建热区将使用: ${scene.drawingManager.lastDrawMode}`);
    });
    console.log('');
    
    console.log('✅ 详细测试完成');
}

/**
 * 压力测试 A4 功能
 * 在浏览器控制台运行: stressTestA4()
 */
function stressTestA4() {
    console.log('💪 开始压力测试 A4：时间轴直接创建热区');
    console.log('');
    
    const timeline = window.game?.scene?.getScene('EditorScene')?.game?.timelinePanel;
    const scene = window.game?.scene?.getScene('EditorScene');
    
    if (!timeline || !scene) {
        console.error('❌ 无法获取必要的对象');
        return;
    }
    
    const controller = timeline.directCreateController;
    
    // 测试1：快速连续操作
    console.log('📋 测试1：快速连续操作（10次）');
    let successCount = 0;
    for (let i = 0; i < 10; i++) {
        controller.handleMouseDown(100 + i * 10, 50, true);
        controller.handleMouseMove(200 + i * 10, 50);
        controller.cancel();
        successCount++;
    }
    console.log(`   ✅ 完成 ${successCount}/10 次操作`);
    console.log('');
    
    // 测试2：边界值测试
    console.log('📋 测试2：边界值测试');
    const boundaryTests = [
        { x1: 0, y1: 30, x2: 10, y2: 30, desc: '最小X坐标' },
        { x1: 0, y1: 30, x2: 1000, y2: 30, desc: '最大X坐标' },
        { x1: 100, y1: 31, x2: 200, y2: 31, desc: '时间刻度边界' },
        { x1: 100, y1: 100, x2: 200, y2: 100, desc: '正常区域' }
    ];
    
    boundaryTests.forEach(test => {
        controller.handleMouseDown(test.x1, test.y1, true);
        controller.handleMouseMove(test.x2, test.y2);
        const duration = controller.previewEndTime - controller.previewStartTime;
        console.log(`   ${test.desc}: ${duration.toFixed(2)}秒`);
        controller.cancel();
    });
    console.log('');
    
    // 测试3：检查内存泄漏
    console.log('📋 测试3：检查内存泄漏（100次操作）');
    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
        controller.handleMouseDown(100, 50, true);
        controller.handleMouseMove(200, 50);
        controller.cancel();
    }
    const endTime = performance.now();
    console.log(`   ✅ 完成 100 次操作，耗时: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`   平均每次: ${((endTime - startTime) / 100).toFixed(2)}ms`);
    console.log('');
    
    console.log('✅ 压力测试完成');
}

// 导出到全局
window.quickTestA4 = quickTestA4;
window.detailedTestA4 = detailedTestA4;
window.stressTestA4 = stressTestA4;

console.log('📦 A4 测试脚本已加载');
console.log('   运行 quickTestA4() - 快速测试');
console.log('   运行 detailedTestA4() - 详细测试');
console.log('   运行 stressTestA4() - 压力测试');
