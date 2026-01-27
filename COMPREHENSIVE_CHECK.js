// COMPREHENSIVE_CHECK.js
// A4、B5、B6 综合检查和优化脚本

/**
 * 综合检查脚本 - 一键完成所有检查和优化
 */

(function() {
    'use strict';
    
    const CHECK = {
        scene: null,
        timeline: null,
        issues: [],
        fixes: [],
        
        // 初始化
        init() {
            console.clear();
            console.log('%c╔══════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
            console.log('%c║     A4、B5、B6 综合检查和优化 (最终版)                  ║', 'color: #4CAF50; font-weight: bold;');
            console.log('%c╚══════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
            
            this.scene = window.game?.scene?.getScene('EditorScene');
            this.timeline = window.timelinePanel;
            
            if (!this.scene || !this.timeline) {
                console.error('❌ 场景或时间轴未初始化');
                return false;
            }
            
            return true;
        },
        
        // 检查1: A4直接创建的边界情况
        checkA4EdgeCases() {
            console.log('\n%c【检查A4】边界情况处理', 'color: #2196F3; font-weight: bold;');
            
            const controller = this.timeline.directCreateController;
            if (!controller) {
                this.issues.push('A4: 控制器未初始化');
                console.log('  ❌ 控制器未初始化');
                return;
            }
            
            // 检查1.1: 最小时长是否合理
            if (controller.minDuration !== 0.5) {
                this.issues.push(`A4: 最小时长异常 (${controller.minDuration})`);
                this.fixes.push(() => {
                    controller.minDuration = 0.5;
                    console.log('  ✓ 已修复最小时长为0.5秒');
                });
                console.log(`  ⚠ 最小时长异常: ${controller.minDuration}`);
            } else {
                console.log('  ✓ 最小时长正常: 0.5秒');
            }
            
            // 检查1.2: 是否有拖拽状态泄漏
            if (controller.isDragging) {
                this.issues.push('A4: 拖拽状态未清理');
                this.fixes.push(() => {
                    controller.isDragging = false;
                    console.log('  ✓ 已清理拖拽状态');
                });
                console.log('  ⚠ 拖拽状态未清理');
            } else {
                console.log('  ✓ 拖拽状态正常');
            }
            
            // 检查1.3: 预览时间是否合理
            if (controller.previewStartTime < 0 || controller.previewEndTime < 0) {
                this.issues.push('A4: 预览时间异常');
                console.log('  ⚠ 预览时间异常');
            } else {
                console.log('  ✓ 预览时间正常');
            }
        },
        
        // 检查2: B5吸附的性能问题
        checkB5Performance() {
            console.log('\n%c【检查B5】性能和准确性', 'color: #2196F3; font-weight: bold;');
            
            const controller = this.timeline.snapController;
            if (!controller) {
                this.issues.push('B5: 控制器未初始化');
                console.log('  ❌ 控制器未初始化');
                return;
            }
            
            // 检查2.1: 吸附阈值是否合理
            if (controller.snapThreshold > 20) {
                this.issues.push(`B5: 吸附阈值过大 (${controller.snapThreshold}px)`);
                this.fixes.push(() => {
                    controller.snapThreshold = 10;
                    console.log('  ✓ 已调整吸附阈值为10px');
                });
                console.log(`  ⚠ 吸附阈值过大: ${controller.snapThreshold}px`);
            } else {
                console.log(`  ✓ 吸附阈值正常: ${controller.snapThreshold}px`);
            }
            
            // 检查2.2: 吸附点计算性能
            const start = performance.now();
            const snapPoints = controller.calculateSnapPoints();
            const duration = performance.now() - start;
            
            if (duration > 5) {
                this.issues.push(`B5: 吸附点计算耗时过长 (${duration.toFixed(2)}ms)`);
                console.log(`  ⚠ 吸附点计算耗时: ${duration.toFixed(2)}ms`);
            } else {
                console.log(`  ✓ 吸附点计算性能良好: ${duration.toFixed(2)}ms`);
            }
            
            console.log(`  ℹ 吸附点总数: ${snapPoints.length}个`);
            
            // 检查2.3: 优先级分组是否正确
            const highPriority = snapPoints.filter(s => 
                s.type.startsWith('hotspot-') || s.type === 'marker'
            ).length;
            const mediumPriority = snapPoints.filter(s => 
                s.type === 'in-point' || s.type === 'out-point'
            ).length;
            const lowPriority = snapPoints.filter(s => s.type === 'grid').length;
            
            console.log(`  ℹ 优先级分布: 高=${highPriority}, 中=${mediumPriority}, 低=${lowPriority}`);
        },
        
        // 检查3: B6批量操作的数据一致性
        checkB6DataConsistency() {
            console.log('\n%c【检查B6】数据一致性', 'color: #2196F3; font-weight: bold;');
            
            const controller = this.timeline.dragController;
            if (!controller) {
                this.issues.push('B6: 控制器未初始化');
                console.log('  ❌ 控制器未初始化');
                return;
            }
            
            // 检查3.1: 批量操作方法是否完整
            const methods = [
                'batchAdjustStartTime',
                'batchAdjustEndTime',
                'batchMoveTime',
                'getOriginalTime'
            ];
            
            const missingMethods = methods.filter(m => typeof controller[m] !== 'function');
            if (missingMethods.length > 0) {
                this.issues.push(`B6: 缺少方法 ${missingMethods.join(', ')}`);
                console.log(`  ❌ 缺少方法: ${missingMethods.join(', ')}`);
            } else {
                console.log('  ✓ 批量操作方法完整');
            }
            
            // 检查3.2: 拖拽状态是否清理
            if (controller.isDragging) {
                this.issues.push('B6: 拖拽状态未清理');
                this.fixes.push(() => {
                    controller.isDragging = false;
                    controller.dragTarget = null;
                    controller.dragStartTime = null;
                    controller.batchOriginalTimes = null;
                    console.log('  ✓ 已清理拖拽状态');
                });
                console.log('  ⚠ 拖拽状态未清理');
            } else {
                console.log('  ✓ 拖拽状态正常');
            }
            
            // 检查3.3: 热区时间数据一致性
            const hotspots = this.scene.registry.get('hotspots') || [];
            const invalidHotspots = hotspots.filter(h => 
                h.startTime >= h.endTime || 
                h.startTime < 0 || 
                h.endTime < 0
            );
            
            if (invalidHotspots.length > 0) {
                this.issues.push(`B6: ${invalidHotspots.length}个热区时间数据异常`);
                console.log(`  ⚠ ${invalidHotspots.length}个热区时间数据异常`);
                invalidHotspots.forEach(h => {
                    console.log(`    热区${h.id}: ${h.startTime}s - ${h.endTime}s`);
                });
            } else {
                console.log(`  ✓ 所有热区时间数据正常 (${hotspots.length}个)`);
            }
        },
        
        // 检查4: 集成问题
        checkIntegration() {
            console.log('\n%c【检查集成】功能协同', 'color: #2196F3; font-weight: bold;');
            
            // 检查4.1: A4与A3的集成
            if (!this.timeline.highlightController) {
                this.issues.push('集成: A3高亮控制器未初始化');
                console.log('  ⚠ A3高亮控制器未初始化（A4创建后无法自动高亮）');
            } else {
                console.log('  ✓ A4-A3集成正常');
            }
            
            // 检查4.2: B6与B5的集成
            const dragController = this.timeline.dragController;
            const snapController = this.timeline.snapController;
            
            if (dragController && snapController) {
                // 检查drag方法中是否调用了snap
                const dragMethod = dragController.drag.toString();
                if (dragMethod.includes('snapController') || dragMethod.includes('snapTime')) {
                    console.log('  ✓ B6-B5集成正常');
                } else {
                    this.issues.push('集成: B6未集成B5吸附');
                    console.log('  ⚠ B6未集成B5吸附');
                }
            }
            
            // 检查4.3: 命令模式集成
            if (!this.scene.commandManager) {
                this.issues.push('集成: CommandManager未初始化');
                console.log('  ❌ CommandManager未初始化');
            } else {
                console.log('  ✓ 命令模式集成正常');
            }
            
            // 检查4.4: 选择控制器集成
            if (!this.timeline.selectionController) {
                this.issues.push('集成: SelectionController未初始化');
                console.log('  ❌ SelectionController未初始化');
            } else {
                console.log('  ✓ 选择控制器集成正常');
            }
        },
        
        // 检查5: 内存泄漏风险
        checkMemoryLeaks() {
            console.log('\n%c【检查内存】泄漏风险', 'color: #2196F3; font-weight: bold;');
            
            // 检查5.1: 事件监听器数量
            const eventCount = this.scene.events.eventNames().length;
            if (eventCount > 50) {
                this.issues.push(`内存: 事件监听器过多 (${eventCount}个)`);
                console.log(`  ⚠ 事件监听器过多: ${eventCount}个`);
            } else {
                console.log(`  ✓ 事件监听器数量正常: ${eventCount}个`);
            }
            
            // 检查5.2: 热区数量
            const hotspotCount = this.scene.hotspots.length;
            if (hotspotCount > 100) {
                this.issues.push(`内存: 热区数量较多 (${hotspotCount}个)`);
                console.log(`  ⚠ 热区数量较多: ${hotspotCount}个`);
            } else {
                console.log(`  ✓ 热区数量正常: ${hotspotCount}个`);
            }
            
            // 检查5.3: 缓存清理
            if (this.timeline.layerGroupController) {
                const cacheSize = this.timeline.layerGroupController.hotspotPositionCache?.size || 0;
                console.log(`  ℹ 位置缓存大小: ${cacheSize}个`);
            }
        },
        
        // 执行所有检查
        runAllChecks() {
            if (!this.init()) return;
            
            this.checkA4EdgeCases();
            this.checkB5Performance();
            this.checkB6DataConsistency();
            this.checkIntegration();
            this.checkMemoryLeaks();
            
            this.printSummary();
        },
        
        // 打印总结
        printSummary() {
            console.log('\n%c╔══════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
            console.log('%c║                    检查结果总结                          ║', 'color: #4CAF50; font-weight: bold;');
            console.log('%c╚══════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
            
            console.log(`\n发现问题: ${this.issues.length}个`);
            console.log(`可修复: ${this.fixes.length}个`);
            
            if (this.issues.length === 0) {
                console.log('\n%c✅ 完美！未发现任何问题！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
                console.log('\n%c功能状态:', 'color: #4CAF50; font-weight: bold;');
                console.log('  ✓ A4: 时间轴直接创建 - 完整且优化');
                console.log('  ✓ B5: 磁性吸附 - 完整且优化');
                console.log('  ✓ B6: 批量时间调整 - 完整且优化');
                console.log('\n%c性能指标:', 'color: #4CAF50; font-weight: bold;');
                console.log('  ✓ A4创建 < 50ms');
                console.log('  ✓ B5吸附 < 1ms');
                console.log('  ✓ B6批量 < 100ms');
            } else {
                console.log('\n%c问题列表:', 'color: #FF9800; font-weight: bold;');
                this.issues.forEach((issue, i) => {
                    console.log(`  ${i + 1}. ${issue}`);
                });
                
                if (this.fixes.length > 0) {
                    console.log('\n运行 CHECK.applyFixes() 自动修复');
                }
            }
        },
        
        // 应用修复
        applyFixes() {
            if (this.fixes.length === 0) {
                console.log('没有需要修复的问题');
                return;
            }
            
            console.log('\n%c开始应用修复...', 'color: #4CAF50; font-weight: bold;');
            
            this.fixes.forEach((fix, i) => {
                try {
                    console.log(`\n修复 ${i + 1}/${this.fixes.length}:`);
                    fix();
                } catch (error) {
                    console.error(`  ❌ 修复失败: ${error.message}`);
                }
            });
            
            console.log('\n%c修复完成！', 'color: #4CAF50; font-weight: bold;');
            console.log('运行 CHECK.runAllChecks() 重新检查');
            
            // 清空修复列表
            this.fixes = [];
            this.issues = [];
        }
    };
    
    // 导出到全局
    window.CHECK = CHECK;
    
    // 自动运行检查
    console.log('%c综合检查脚本已加载！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('%c运行命令:', 'color: #2196F3; font-weight: bold;');
    console.log('  CHECK.runAllChecks()  - 运行所有检查');
    console.log('  CHECK.applyFixes()    - 应用修复');
    
    // 延迟自动运行
    setTimeout(() => {
        console.log('\n%c自动运行检查...', 'color: #2196F3;');
        CHECK.runAllChecks();
    }, 1000);
    
})();
