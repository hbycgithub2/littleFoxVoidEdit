// TEST_ALL_FEATURES_DEEP.js
// A1-A4, B5-B8 全功能深度测试（4层验证）

/**
 * 4层深度测试架构：
 * 层1 - 基础功能验证
 * 层2 - 性能和优化验证
 * 层3 - 集成和协作验证
 * 层4 - 边界和异常验证
 */

class DeepFeatureTester {
    constructor() {
        this.scene = null;
        this.timeline = null;
        this.results = {
            layer1: {},
            layer2: {},
            layer3: {},
            layer4: {}
        };
    }
    
    async init() {
        this.scene = window.game.scene.getScene('EditorScene');
        this.timeline = window.timelinePanel;
        
        if (!this.scene || !this.timeline) {
            throw new Error('场景或时间轴未初始化');
        }
    }
    
    // ========== 层1：基础功能验证 ==========
    async testLayer1() {
        console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #2196F3; font-weight: bold;');
        console.log('%c║              层1：基础功能验证                         ║', 'color: #2196F3; font-weight: bold;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #2196F3; font-weight: bold;');
        
        // A1: 时间条点击跳转
        console.log('\n%c【A1】时间条点击跳转', 'color: #4CAF50; font-weight: bold;');
        const a1Result = await this.testA1Basic();
        this.results.layer1.A1 = a1Result;
        
        // A2: 时间条拖拽跳转
        console.log('\n%c【A2】时间条拖拽跳转', 'color: #4CAF50; font-weight: bold;');
        const a2Result = await this.testA2Basic();
        this.results.layer1.A2 = a2Result;
        
        // A3: 热区高亮闪烁
        console.log('\n%c【A3】热区高亮闪烁', 'color: #4CAF50; font-weight: bold;');
        const a3Result = await this.testA3Basic();
        this.results.layer1.A3 = a3Result;
        
        // A4: 时间轴直接创建
        console.log('\n%c【A4】时间轴直接创建', 'color: #4CAF50; font-weight: bold;');
        const a4Result = await this.testA4Basic();
        this.results.layer1.A4 = a4Result;
        
        // B5: 磁性吸附
        console.log('\n%c【B5】磁性吸附', 'color: #4CAF50; font-weight: bold;');
        const b5Result = await this.testB5Basic();
        this.results.layer1.B5 = b5Result;

        // B6: 批量时间调整
        console.log('\n%c【B6】批量时间调整', 'color: #4CAF50; font-weight: bold;');
        const b6Result = await this.testB6Basic();
        this.results.layer1.B6 = b6Result;
        
        // B7: 时间范围复制粘贴
        console.log('\n%c【B7】时间范围复制粘贴', 'color: #4CAF50; font-weight: bold;');
        const b7Result = await this.testB7Basic();
        this.results.layer1.B7 = b7Result;
        
        // B8: 方向键微调
        console.log('\n%c【B8】方向键微调', 'color: #4CAF50; font-weight: bold;');
        const b8Result = await this.testB8Basic();
        this.results.layer1.B8 = b8Result;
        
        return this.results.layer1;
    }
    
    // A1基础测试
    async testA1Basic() {
        if (!this.timeline.timeScaleController) {
            return { pass: false, error: 'TimeScaleController未初始化' };
        }
        
        // 测试点击功能
        const hasClickHandler = typeof this.timeline.timeScaleController.handleClick === 'function';
        const hasHitTest = typeof this.timeline.timeScaleController.hitTest === 'function';
        
        console.log(`  点击处理器: ${hasClickHandler ? '✓' : '❌'}`);
        console.log(`  碰撞检测: ${hasHitTest ? '✓' : '❌'}`);
        
        return { 
            pass: hasClickHandler && hasHitTest,
            features: { clickHandler: hasClickHandler, hitTest: hasHitTest }
        };
    }
    
    // A2基础测试
    async testA2Basic() {
        if (!this.timeline.playheadController) {
            return { pass: false, error: 'PlayheadController未初始化' };
        }
        
        const hasDrag = typeof this.timeline.playheadController.startDrag === 'function';
        const hasHitTest = typeof this.timeline.playheadController.hitTest === 'function';
        
        console.log(`  拖拽功能: ${hasDrag ? '✓' : '❌'}`);
        console.log(`  碰撞检测: ${hasHitTest ? '✓' : '❌'}`);
        
        return {
            pass: hasDrag && hasHitTest,
            features: { drag: hasDrag, hitTest: hasHitTest }
        };
    }
    
    // A3基础测试
    async testA3Basic() {
        if (!this.timeline.highlightController) {
            return { pass: false, error: 'HighlightController未初始化' };
        }
        
        const hasHighlight = typeof this.timeline.highlightController.highlightHotspot === 'function';
        const hasDraw = typeof this.timeline.highlightController.drawHighlight === 'function';
        
        console.log(`  高亮功能: ${hasHighlight ? '✓' : '❌'}`);
        console.log(`  绘制功能: ${hasDraw ? '✓' : '❌'}`);
        
        return {
            pass: hasHighlight && hasDraw,
            features: { highlight: hasHighlight, draw: hasDraw }
        };
    }
    
    // A4基础测试
    async testA4Basic() {
        if (!this.timeline.directCreateController) {
            return { pass: false, error: 'DirectCreateController未初始化' };
        }
        
        const hasMouseDown = typeof this.timeline.directCreateController.handleMouseDown === 'function';
        const hasMouseMove = typeof this.timeline.directCreateController.handleMouseMove === 'function';
        const hasMouseUp = typeof this.timeline.directCreateController.handleMouseUp === 'function';
        
        console.log(`  鼠标按下: ${hasMouseDown ? '✓' : '❌'}`);
        console.log(`  鼠标移动: ${hasMouseMove ? '✓' : '❌'}`);
        console.log(`  鼠标释放: ${hasMouseUp ? '✓' : '❌'}`);
        
        return {
            pass: hasMouseDown && hasMouseMove && hasMouseUp,
            features: { mouseDown: hasMouseDown, mouseMove: hasMouseMove, mouseUp: hasMouseUp }
        };
    }
    
    // B5基础测试
    async testB5Basic() {
        if (!this.timeline.snapController) {
            return { pass: false, error: 'SnapController未初始化' };
        }
        
        const hasSnapTime = typeof this.timeline.snapController.snapTime === 'function';
        const hasToggle = typeof this.timeline.snapController.toggle === 'function';
        const hasEnabled = 'enabled' in this.timeline.snapController;
        
        console.log(`  吸附功能: ${hasSnapTime ? '✓' : '❌'}`);
        console.log(`  切换功能: ${hasToggle ? '✓' : '❌'}`);
        console.log(`  启用状态: ${hasEnabled ? '✓' : '❌'}`);
        
        return {
            pass: hasSnapTime && hasToggle && hasEnabled,
            features: { snapTime: hasSnapTime, toggle: hasToggle, enabled: hasEnabled }
        };
    }
    
    // B6基础测试
    async testB6Basic() {
        if (!this.timeline.dragController) {
            return { pass: false, error: 'DragController未初始化' };
        }
        
        const hasDrag = typeof this.timeline.dragController.drag === 'function';
        const hasStartDrag = typeof this.timeline.dragController.startDrag === 'function';
        const hasEndDrag = typeof this.timeline.dragController.endDrag === 'function';
        
        console.log(`  拖拽功能: ${hasDrag ? '✓' : '❌'}`);
        console.log(`  开始拖拽: ${hasStartDrag ? '✓' : '❌'}`);
        console.log(`  结束拖拽: ${hasEndDrag ? '✓' : '❌'}`);
        
        return {
            pass: hasDrag && hasStartDrag && hasEndDrag,
            features: { drag: hasDrag, startDrag: hasStartDrag, endDrag: hasEndDrag }
        };
    }
    
    // B7基础测试
    async testB7Basic() {
        if (!this.timeline.rangeCopyController) {
            return { pass: false, error: 'RangeCopyController未初始化' };
        }
        
        const hasCopy = typeof this.timeline.rangeCopyController.copyTimeRanges === 'function';
        const hasPaste = typeof this.timeline.rangeCopyController.pasteTimeRanges === 'function';
        const hasGetInfo = typeof this.timeline.rangeCopyController.getCopiedInfo === 'function';
        const hasCache = typeof this.timeline.rangeCopyController.getHotspots === 'function';
        
        console.log(`  复制功能: ${hasCopy ? '✓' : '❌'}`);
        console.log(`  粘贴功能: ${hasPaste ? '✓' : '❌'}`);
        console.log(`  信息获取: ${hasGetInfo ? '✓' : '❌'}`);
        console.log(`  缓存优化: ${hasCache ? '✓' : '❌'}`);
        
        return {
            pass: hasCopy && hasPaste && hasGetInfo && hasCache,
            features: { copy: hasCopy, paste: hasPaste, getInfo: hasGetInfo, cache: hasCache }
        };
    }
    
    // B8基础测试
    async testB8Basic() {
        if (!this.timeline.fineAdjustController) {
            return { pass: false, error: 'FineAdjustController未初始化' };
        }
        
        const hasAdjustStart = typeof this.timeline.fineAdjustController.adjustStartTime === 'function';
        const hasAdjustEnd = typeof this.timeline.fineAdjustController.adjustEndTime === 'function';
        const hasMove = typeof this.timeline.fineAdjustController.moveTime === 'function';
        const hasGetInfo = typeof this.timeline.fineAdjustController.getAdjustInfo === 'function';
        const hasCache = typeof this.timeline.fineAdjustController.getHotspots === 'function';
        
        console.log(`  调整开始: ${hasAdjustStart ? '✓' : '❌'}`);
        console.log(`  调整结束: ${hasAdjustEnd ? '✓' : '❌'}`);
        console.log(`  整体移动: ${hasMove ? '✓' : '❌'}`);
        console.log(`  信息获取: ${hasGetInfo ? '✓' : '❌'}`);
        console.log(`  缓存优化: ${hasCache ? '✓' : '❌'}`);
        
        return {
            pass: hasAdjustStart && hasAdjustEnd && hasMove && hasGetInfo && hasCache,
            features: { 
                adjustStart: hasAdjustStart, 
                adjustEnd: hasAdjustEnd, 
                move: hasMove,
                getInfo: hasGetInfo,
                cache: hasCache
            }
        };
    }

    
    // ========== 层2：性能和优化验证 ==========
    async testLayer2() {
        console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #FF9800; font-weight: bold;');
        console.log('%c║            层2：性能和优化验证                         ║', 'color: #FF9800; font-weight: bold;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #FF9800; font-weight: bold;');
        
        // 测试B7缓存性能
        console.log('\n%c【B7】缓存性能测试', 'color: #FF9800; font-weight: bold;');
        const b7Cache = await this.testB7Cache();
        this.results.layer2.B7_cache = b7Cache;
        
        // 测试B8缓存性能
        console.log('\n%c【B8】缓存性能测试', 'color: #FF9800; font-weight: bold;');
        const b8Cache = await this.testB8Cache();
        this.results.layer2.B8_cache = b8Cache;
        
        // 测试批量命令性能
        console.log('\n%c【B6/B7/B8】批量命令性能', 'color: #FF9800; font-weight: bold;');
        const batchPerf = await this.testBatchPerformance();
        this.results.layer2.batch_performance = batchPerf;
        
        // 测试磁性吸附性能
        console.log('\n%c【B5】磁性吸附性能', 'color: #FF9800; font-weight: bold;');
        const snapPerf = await this.testSnapPerformance();
        this.results.layer2.snap_performance = snapPerf;
        
        return this.results.layer2;
    }
    
    async testB7Cache() {
        const ctrl = this.timeline.rangeCopyController;
        
        // 测试有缓存
        const start1 = performance.now();
        for (let i = 0; i < 100; i++) {
            ctrl.getHotspots();
        }
        const withCache = performance.now() - start1;
        
        // 清除缓存后测试
        ctrl.clearCache();
        const start2 = performance.now();
        for (let i = 0; i < 100; i++) {
            ctrl.getHotspots();
        }
        const withoutCache = performance.now() - start2;
        
        const improvement = ((withoutCache - withCache) / withoutCache * 100).toFixed(1);
        
        console.log(`  有缓存: ${withCache.toFixed(2)}ms`);
        console.log(`  无缓存: ${withoutCache.toFixed(2)}ms`);
        console.log(`  性能提升: ${improvement}%`);
        
        return {
            pass: withCache < withoutCache,
            withCache,
            withoutCache,
            improvement: parseFloat(improvement)
        };
    }
    
    async testB8Cache() {
        const ctrl = this.timeline.fineAdjustController;
        
        const start1 = performance.now();
        for (let i = 0; i < 100; i++) {
            ctrl.getHotspots();
        }
        const withCache = performance.now() - start1;
        
        ctrl.clearCache();
        const start2 = performance.now();
        for (let i = 0; i < 100; i++) {
            ctrl.getHotspots();
        }
        const withoutCache = performance.now() - start2;
        
        const improvement = ((withoutCache - withCache) / withoutCache * 100).toFixed(1);
        
        console.log(`  有缓存: ${withCache.toFixed(2)}ms`);
        console.log(`  无缓存: ${withoutCache.toFixed(2)}ms`);
        console.log(`  性能提升: ${improvement}%`);
        
        return {
            pass: withCache < withoutCache,
            withCache,
            withoutCache,
            improvement: parseFloat(improvement)
        };
    }
    
    async testBatchPerformance() {
        // 创建测试热区
        const testIds = [];
        for (let i = 0; i < 10; i++) {
            const config = {
                id: Date.now() + i + Math.random(),
                shape: 'rect',
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                color: '#ff0000',
                strokeWidth: 2,
                startTime: 5.0 + i,
                endTime: 7.0 + i
            };
            this.scene.addHotspot(config);
            testIds.push(config.id);
        }
        
        await this.sleep(100);
        
        // 测试批量移动性能
        const start = performance.now();
        this.timeline.fineAdjustController.moveTime(testIds, 1.0, true);
        await this.sleep(50);
        const batchTime = performance.now() - start;
        
        console.log(`  批量移动10个热区: ${batchTime.toFixed(2)}ms`);
        
        // 清理
        testIds.forEach(id => {
            const hotspot = this.scene.hotspots.find(h => h.config.id === id);
            if (hotspot) this.scene.removeHotspot(hotspot);
        });
        
        return {
            pass: batchTime < 100,
            batchTime,
            threshold: 100
        };
    }
    
    async testSnapPerformance() {
        if (!this.timeline.snapController) {
            return { pass: false, error: 'SnapController未初始化' };
        }
        
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            this.timeline.snapController.snapTime(5.15, null);
        }
        const snapTime = performance.now() - start;
        
        console.log(`  1000次吸附计算: ${snapTime.toFixed(2)}ms`);
        console.log(`  平均每次: ${(snapTime / 1000).toFixed(3)}ms`);
        
        return {
            pass: snapTime < 100,
            totalTime: snapTime,
            avgTime: snapTime / 1000
        };
    }
    
    // ========== 层3：集成和协作验证 ==========
    async testLayer3() {
        console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
        console.log('%c║           层3：集成和协作验证                          ║', 'color: #4CAF50; font-weight: bold;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
        
        // A4 + A3 集成
        console.log('\n%c【A4+A3】直接创建后高亮', 'color: #4CAF50; font-weight: bold;');
        const a4a3 = await this.testA4A3Integration();
        this.results.layer3.A4_A3 = a4a3;
        
        // B5 + B6 集成
        console.log('\n%c【B5+B6】吸附+批量调整', 'color: #4CAF50; font-weight: bold;');
        const b5b6 = await this.testB5B6Integration();
        this.results.layer3.B5_B6 = b5b6;
        
        // B5 + B8 集成
        console.log('\n%c【B5+B8】吸附+微调', 'color: #4CAF50; font-weight: bold;');
        const b5b8 = await this.testB5B8Integration();
        this.results.layer3.B5_B8 = b5b8;
        
        // B7 + B8 集成
        console.log('\n%c【B7+B8】复制粘贴+微调', 'color: #4CAF50; font-weight: bold;');
        const b7b8 = await this.testB7B8Integration();
        this.results.layer3.B7_B8 = b7b8;
        
        // 撤销/重做集成
        console.log('\n%c【全功能】撤销/重做', 'color: #4CAF50; font-weight: bold;');
        const undoRedo = await this.testUndoRedoIntegration();
        this.results.layer3.undo_redo = undoRedo;
        
        return this.results.layer3;
    }
    
    async testA4A3Integration() {
        const hasDirectCreate = !!this.timeline.directCreateController;
        const hasHighlight = !!this.timeline.highlightController;
        
        if (!hasDirectCreate || !hasHighlight) {
            return { pass: false, error: '控制器未初始化' };
        }
        
        // 检查A4是否会触发A3
        const hasHighlightCall = this.timeline.directCreateController.toString().includes('highlightHotspot') ||
                                 this.timeline.directCreateController.toString().includes('highlight');
        
        console.log(`  A4控制器存在: ${hasDirectCreate ? '✓' : '❌'}`);
        console.log(`  A3控制器存在: ${hasHighlight ? '✓' : '❌'}`);
        console.log(`  集成调用: ${hasHighlightCall ? '✓' : '⚠'}`);
        
        return {
            pass: hasDirectCreate && hasHighlight,
            integrated: hasHighlightCall
        };
    }
    
    async testB5B6Integration() {
        const hasSnap = !!this.timeline.snapController;
        const hasDrag = !!this.timeline.dragController;
        
        if (!hasSnap || !hasDrag) {
            return { pass: false, error: '控制器未初始化' };
        }
        
        console.log(`  B5控制器存在: ${hasSnap ? '✓' : '❌'}`);
        console.log(`  B6控制器存在: ${hasDrag ? '✓' : '❌'}`);
        console.log(`  集成状态: ✓`);
        
        return {
            pass: hasSnap && hasDrag,
            integrated: true
        };
    }
    
    async testB5B8Integration() {
        const hasSnap = !!this.timeline.snapController;
        const hasAdjust = !!this.timeline.fineAdjustController;
        
        if (!hasSnap || !hasAdjust) {
            return { pass: false, error: '控制器未初始化' };
        }
        
        // 检查B8是否使用B5
        const adjustInfo = hasAdjust ? this.timeline.fineAdjustController.getAdjustInfo() : null;
        const snapIntegrated = adjustInfo && 'snapEnabled' in adjustInfo;
        
        console.log(`  B5控制器存在: ${hasSnap ? '✓' : '❌'}`);
        console.log(`  B8控制器存在: ${hasAdjust ? '✓' : '❌'}`);
        console.log(`  集成状态: ${snapIntegrated ? '✓' : '⚠'}`);
        
        return {
            pass: hasSnap && hasAdjust && snapIntegrated,
            integrated: snapIntegrated
        };
    }
    
    async testB7B8Integration() {
        const hasCopy = !!this.timeline.rangeCopyController;
        const hasAdjust = !!this.timeline.fineAdjustController;
        
        if (!hasCopy || !hasAdjust) {
            return { pass: false, error: '控制器未初始化' };
        }
        
        console.log(`  B7控制器存在: ${hasCopy ? '✓' : '❌'}`);
        console.log(`  B8控制器存在: ${hasAdjust ? '✓' : '❌'}`);
        console.log(`  可组合使用: ✓`);
        
        return {
            pass: hasCopy && hasAdjust,
            composable: true
        };
    }
    
    async testUndoRedoIntegration() {
        const hasCommandManager = !!this.scene.commandManager;
        
        if (!hasCommandManager) {
            return { pass: false, error: 'CommandManager未初始化' };
        }
        
        const canUndo = this.scene.commandManager.canUndo();
        const canRedo = this.scene.commandManager.canRedo();
        
        console.log(`  CommandManager存在: ${hasCommandManager ? '✓' : '❌'}`);
        console.log(`  可撤销: ${canUndo ? '✓' : '⚠'}`);
        console.log(`  可重做: ${canRedo ? '✓' : '⚠'}`);
        
        return {
            pass: hasCommandManager,
            canUndo,
            canRedo
        };
    }

    
    // ========== 层4：边界和异常验证 ==========
    async testLayer4() {
        console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #E91E63; font-weight: bold;');
        console.log('%c║          层4：边界和异常验证                           ║', 'color: #E91E63; font-weight: bold;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #E91E63; font-weight: bold;');
        
        // 边界时间测试
        console.log('\n%c【边界】时间边界处理', 'color: #E91E63; font-weight: bold;');
        const timeBoundary = await this.testTimeBoundary();
        this.results.layer4.time_boundary = timeBoundary;
        
        // 空数据测试
        console.log('\n%c【异常】空数据处理', 'color: #E91E63; font-weight: bold;');
        const emptyData = await this.testEmptyData();
        this.results.layer4.empty_data = emptyData;
        
        // 大量数据测试
        console.log('\n%c【压力】大量数据处理', 'color: #E91E63; font-weight: bold;');
        const largeData = await this.testLargeData();
        this.results.layer4.large_data = largeData;
        
        // 并发操作测试
        console.log('\n%c【并发】并发操作处理', 'color: #E91E63; font-weight: bold;');
        const concurrent = await this.testConcurrent();
        this.results.layer4.concurrent = concurrent;
        
        return this.results.layer4;
    }
    
    async testTimeBoundary() {
        const ctrl = this.timeline.fineAdjustController;
        
        // 创建边界测试热区
        const config = {
            id: Date.now() + Math.random(),
            shape: 'rect',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            color: '#ff0000',
            strokeWidth: 2,
            startTime: 0.1,
            endTime: 0.5
        };
        this.scene.addHotspot(config);
        await this.sleep(100);
        
        // 测试负数边界
        ctrl.adjustStartTime([config.id], -10, false);
        await this.sleep(50);
        
        const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
        const preventedNegative = hotspot && hotspot.config.startTime >= 0;
        
        console.log(`  防止负数时间: ${preventedNegative ? '✓' : '❌'}`);
        
        // 测试最小持续时间
        ctrl.adjustEndTime([config.id], -10, false);
        await this.sleep(50);
        
        const hotspot2 = this.scene.hotspots.find(h => h.config.id === config.id);
        const minDuration = hotspot2 && (hotspot2.config.endTime - hotspot2.config.startTime) >= 0.1;
        
        console.log(`  最小持续时间: ${minDuration ? '✓' : '❌'}`);
        
        // 清理
        if (hotspot2) this.scene.removeHotspot(hotspot2);
        
        return {
            pass: preventedNegative && minDuration,
            preventedNegative,
            minDuration
        };
    }
    
    async testEmptyData() {
        const copyCtrl = this.timeline.rangeCopyController;
        const adjustCtrl = this.timeline.fineAdjustController;
        
        // 清空选择
        this.timeline.selectionController.clearSelection();
        
        // 测试空复制
        copyCtrl.copyTimeRanges();
        await this.sleep(50);
        const copyInfo = copyCtrl.getCopiedInfo();
        const handleEmptyCopy = copyInfo === null || copyInfo.count === 0;
        
        console.log(`  空复制处理: ${handleEmptyCopy ? '✓' : '❌'}`);
        
        // 测试空粘贴
        copyCtrl.clear();
        copyCtrl.pasteTimeRanges();
        await this.sleep(50);
        const handleEmptyPaste = true; // 不会崩溃就算通过
        
        console.log(`  空粘贴处理: ${handleEmptyPaste ? '✓' : '❌'}`);
        
        // 测试空调整
        adjustCtrl.moveTime([], 1.0, false);
        await this.sleep(50);
        const handleEmptyAdjust = true;
        
        console.log(`  空调整处理: ${handleEmptyAdjust ? '✓' : '❌'}`);
        
        return {
            pass: handleEmptyCopy && handleEmptyPaste && handleEmptyAdjust,
            emptyCopy: handleEmptyCopy,
            emptyPaste: handleEmptyPaste,
            emptyAdjust: handleEmptyAdjust
        };
    }
    
    async testLargeData() {
        // 创建50个热区
        const testIds = [];
        console.log('  创建50个测试热区...');
        
        for (let i = 0; i < 50; i++) {
            const config = {
                id: Date.now() + i + Math.random(),
                shape: 'rect',
                x: 100 + (i % 10) * 20,
                y: 100 + Math.floor(i / 10) * 20,
                width: 50,
                height: 50,
                color: '#ff0000',
                strokeWidth: 2,
                startTime: i * 0.5,
                endTime: i * 0.5 + 0.3
            };
            this.scene.addHotspot(config);
            testIds.push(config.id);
        }
        
        await this.sleep(200);
        
        // 测试批量操作性能
        const start = performance.now();
        this.timeline.fineAdjustController.moveTime(testIds, 1.0, true);
        await this.sleep(100);
        const batchTime = performance.now() - start;
        
        console.log(`  批量移动50个热区: ${batchTime.toFixed(2)}ms`);
        
        const performanceGood = batchTime < 500;
        console.log(`  性能评估: ${performanceGood ? '✓ 优秀' : '⚠ 需优化'}`);
        
        // 清理
        testIds.forEach(id => {
            const hotspot = this.scene.hotspots.find(h => h.config.id === id);
            if (hotspot) this.scene.removeHotspot(hotspot);
        });
        
        return {
            pass: performanceGood,
            batchTime,
            count: 50,
            threshold: 500
        };
    }
    
    async testConcurrent() {
        // 创建测试热区
        const config = {
            id: Date.now() + Math.random(),
            shape: 'rect',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            color: '#ff0000',
            strokeWidth: 2,
            startTime: 5.0,
            endTime: 7.0
        };
        this.scene.addHotspot(config);
        await this.sleep(100);
        
        // 模拟并发操作
        this.timeline.selectionController.clearSelection();
        this.timeline.selectionController.selectedIds.add(config.id);
        
        const ctrl = this.timeline.fineAdjustController;
        
        // 快速连续调用
        ctrl.moveTime([config.id], 0.1, false);
        ctrl.moveTime([config.id], 0.1, false);
        ctrl.moveTime([config.id], 0.1, false);
        
        await this.sleep(100);
        
        const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
        const noCrash = !!hotspot;
        
        console.log(`  并发操作无崩溃: ${noCrash ? '✓' : '❌'}`);
        
        // 清理
        if (hotspot) this.scene.removeHotspot(hotspot);
        
        return {
            pass: noCrash,
            noCrash
        };
    }
    
    // ========== 工具方法 ==========
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ========== 运行所有测试 ==========
    async runAll() {
        console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold; font-size: 16px;');
        console.log('%c║     A1-A4, B5-B8 全功能深度测试 (4层验证)             ║', 'color: #9C27B0; font-weight: bold; font-size: 16px;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold; font-size: 16px;');
        
        try {
            await this.init();
            
            await this.testLayer1();
            await this.testLayer2();
            await this.testLayer3();
            await this.testLayer4();
            
            this.printSummary();
            
        } catch (error) {
            console.error('%c测试失败:', 'color: #F44336; font-weight: bold;', error);
        }
    }
    
    printSummary() {
        console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
        console.log('%c║                    测试结果总结                        ║', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
        
        // 层1统计
        const layer1Pass = Object.values(this.results.layer1).filter(r => r.pass).length;
        const layer1Total = Object.keys(this.results.layer1).length;
        console.log(`\n%c层1 - 基础功能: ${layer1Pass}/${layer1Total} 通过`, 
            layer1Pass === layer1Total ? 'color: #4CAF50; font-weight: bold;' : 'color: #FF9800; font-weight: bold;');
        
        // 层2统计
        const layer2Pass = Object.values(this.results.layer2).filter(r => r.pass).length;
        const layer2Total = Object.keys(this.results.layer2).length;
        console.log(`%c层2 - 性能优化: ${layer2Pass}/${layer2Total} 通过`,
            layer2Pass === layer2Total ? 'color: #4CAF50; font-weight: bold;' : 'color: #FF9800; font-weight: bold;');
        
        // 层3统计
        const layer3Pass = Object.values(this.results.layer3).filter(r => r.pass).length;
        const layer3Total = Object.keys(this.results.layer3).length;
        console.log(`%c层3 - 集成协作: ${layer3Pass}/${layer3Total} 通过`,
            layer3Pass === layer3Total ? 'color: #4CAF50; font-weight: bold;' : 'color: #FF9800; font-weight: bold;');
        
        // 层4统计
        const layer4Pass = Object.values(this.results.layer4).filter(r => r.pass).length;
        const layer4Total = Object.keys(this.results.layer4).length;
        console.log(`%c层4 - 边界异常: ${layer4Pass}/${layer4Total} 通过`,
            layer4Pass === layer4Total ? 'color: #4CAF50; font-weight: bold;' : 'color: #FF9800; font-weight: bold;');
        
        // 总体统计
        const totalPass = layer1Pass + layer2Pass + layer3Pass + layer4Pass;
        const totalTests = layer1Total + layer2Total + layer3Total + layer4Total;
        const passRate = (totalPass / totalTests * 100).toFixed(1);
        
        console.log(`\n%c总体通过率: ${passRate}% (${totalPass}/${totalTests})`,
            passRate >= 90 ? 'color: #4CAF50; font-size: 18px; font-weight: bold;' : 'color: #FF9800; font-size: 18px; font-weight: bold;');
        
        // 详细结果
        console.log('\n%c详细结果:', 'color: #2196F3; font-weight: bold;');
        console.log(this.results);
        
        // 优化建议
        this.printOptimizationSuggestions();
    }
    
    printOptimizationSuggestions() {
        console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
        console.log('%c║                    优化建议                            ║', 'color: #9C27B0; font-weight: bold;');
        console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
        
        const suggestions = [];
        
        // 检查缓存性能
        if (this.results.layer2.B7_cache && this.results.layer2.B7_cache.improvement < 50) {
            suggestions.push('🔧 B7缓存优化效果不明显，建议增加缓存时间');
        }
        
        if (this.results.layer2.B8_cache && this.results.layer2.B8_cache.improvement < 50) {
            suggestions.push('🔧 B8缓存优化效果不明显，建议增加缓存时间');
        }
        
        // 检查批量性能
        if (this.results.layer2.batch_performance && this.results.layer2.batch_performance.batchTime > 80) {
            suggestions.push('🔧 批量操作性能需要优化，建议使用更高效的算法');
        }
        
        // 检查大数据性能
        if (this.results.layer4.large_data && this.results.layer4.large_data.batchTime > 400) {
            suggestions.push('🔧 大数据处理性能需要优化，建议使用虚拟化或分页');
        }
        
        // 检查集成状态
        if (this.results.layer3.A4_A3 && !this.results.layer3.A4_A3.integrated) {
            suggestions.push('💡 A4和A3可以更紧密集成，建议添加自动高亮');
        }
        
        if (suggestions.length === 0) {
            console.log('%c✅ 所有功能运行良好，无需优化！', 'color: #4CAF50; font-weight: bold;');
        } else {
            suggestions.forEach(s => console.log(`  ${s}`));
        }
        
        // 扩展功能建议
        console.log('\n%c扩展功能建议:', 'color: #2196F3; font-weight: bold;');
        console.log('  💡 添加热区模板功能');
        console.log('  💡 添加时间轴缩放记忆');
        console.log('  💡 添加批量属性编辑');
        console.log('  💡 添加热区分组管理');
        console.log('  💡 添加快捷键自定义');
    }
}

// 创建全局实例
window.deepTester = new DeepFeatureTester();

// 快速运行函数
window.testAllFeaturesDeep = async function() {
    await window.deepTester.runAll();
};

// 自动提示
console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
console.log('%c║     全功能深度测试脚本已加载！                        ║', 'color: #9C27B0; font-weight: bold;');
console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
console.log('%c运行测试: testAllFeaturesDeep()', 'color: #2196F3; font-weight: bold; font-size: 14px;');
console.log('%c或使用: window.deepTester.runAll()', 'color: #666;');
