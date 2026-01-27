// FIX_A4_B5_B6_ISSUES.js
// A4、B5、B6 问题检测和自动修复脚本

/**
 * 问题检测和修复脚本
 * 
 * 功能：
 * 1. 检测常见问题
 * 2. 自动修复已知问题
 * 3. 提供修复建议
 * 4. 验证修复结果
 */

// ============================================
// 问题检测
// ============================================

function detectIssues() {
    console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #F44336; font-weight: bold;');
    console.log('%c║          A4、B5、B6 问题检测和修复                     ║', 'color: #F44336; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #F44336; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    const issues = [];
    
    // 问题1: 控制器未初始化
    console.log('\n%c【检测1】控制器初始化状态', 'color: #2196F3; font-weight: bold;');
    
    if (!timeline) {
        issues.push({
            id: 'timeline_not_init',
            severity: 'critical',
            message: 'TimelinePanel未初始化',
            fix: null
        });
        console.log('  ❌ TimelinePanel未初始化');
    } else {
        console.log('  ✓ TimelinePanel已初始化');
        
        if (!timeline.directCreateController) {
            issues.push({
                id: 'a4_not_init',
                severity: 'critical',
                message: 'A4: DirectCreateController未初始化',
                fix: 'fixA4Init'
            });
            console.log('  ❌ A4: DirectCreateController未初始化');
        } else {
            console.log('  ✓ A4: DirectCreateController已初始化');
        }
        
        if (!timeline.snapController) {
            issues.push({
                id: 'b5_not_init',
                severity: 'critical',
                message: 'B5: SnapController未初始化',
                fix: 'fixB5Init'
            });
            console.log('  ❌ B5: SnapController未初始化');
        } else {
            console.log('  ✓ B5: SnapController已初始化');
        }
        
        if (!timeline.dragController) {
            issues.push({
                id: 'b6_not_init',
                severity: 'critical',
                message: 'B6: DragController未初始化',
                fix: 'fixB6Init'
            });
            console.log('  ❌ B6: DragController未初始化');
        } else {
            console.log('  ✓ B6: DragController已初始化');
        }
    }
    
    // 问题2: A4最小时长检查
    console.log('\n%c【检测2】A4最小时长设置', 'color: #2196F3; font-weight: bold;');
    
    if (timeline && timeline.directCreateController) {
        const minDuration = timeline.directCreateController.minDuration;
        if (minDuration < 0.5) {
            issues.push({
                id: 'a4_min_duration',
                severity: 'warning',
                message: `A4: 最小时长过小 (${minDuration}秒)`,
                fix: 'fixA4MinDuration'
            });
            console.log(`  ⚠ 最小时长过小: ${minDuration}秒`);
        } else {
            console.log(`  ✓ 最小时长正常: ${minDuration}秒`);
        }
    }
    
    // 问题3: B5吸附阈值
    console.log('\n%c【检测3】B5吸附阈值设置', 'color: #2196F3; font-weight: bold;');
    
    if (timeline && timeline.snapController) {
        const threshold = timeline.snapController.snapThreshold;
        if (threshold > 20) {
            issues.push({
                id: 'b5_threshold_high',
                severity: 'warning',
                message: `B5: 吸附阈值过大 (${threshold}px)`,
                fix: 'fixB5Threshold'
            });
            console.log(`  ⚠ 吸附阈值过大: ${threshold}px`);
        } else if (threshold < 5) {
            issues.push({
                id: 'b5_threshold_low',
                severity: 'info',
                message: `B5: 吸附阈值较小 (${threshold}px)`,
                fix: 'fixB5Threshold'
            });
            console.log(`  ℹ 吸附阈值较小: ${threshold}px`);
        } else {
            console.log(`  ✓ 吸附阈值正常: ${threshold}px`);
        }
    }
    
    // 问题4: B6批量操作边界检查
    console.log('\n%c【检测4】B6边界检查逻辑', 'color: #2196F3; font-weight: bold;');
    
    if (timeline && timeline.dragController) {
        // 检查是否有批量操作方法
        const hasBatchMethods = 
            typeof timeline.dragController.batchAdjustStartTime === 'function' &&
            typeof timeline.dragController.batchAdjustEndTime === 'function' &&
            typeof timeline.dragController.batchMoveTime === 'function';
        
        if (!hasBatchMethods) {
            issues.push({
                id: 'b6_batch_methods',
                severity: 'critical',
                message: 'B6: 批量操作方法缺失',
                fix: null
            });
            console.log('  ❌ 批量操作方法缺失');
        } else {
            console.log('  ✓ 批量操作方法完整');
        }
    }
    
    // 问题5: 性能监控
    console.log('\n%c【检测5】性能监控状态', 'color: #2196F3; font-weight: bold;');
    
    if (!scene.timelinePerformanceMonitor) {
        issues.push({
            id: 'perf_monitor_missing',
            severity: 'warning',
            message: '性能监控器未初始化',
            fix: null
        });
        console.log('  ⚠ 性能监控器未初始化');
    } else {
        console.log('  ✓ 性能监控器已初始化');
        if (!scene.timelinePerformanceMonitor.enabled) {
            console.log('  ℹ 性能监控未启用（开发时可启用）');
        }
    }
    
    // 问题6: 事件监听泄漏
    console.log('\n%c【检测6】事件监听器检查', 'color: #2196F3; font-weight: bold;');
    
    const eventCount = scene.events.eventNames().length;
    if (eventCount > 50) {
        issues.push({
            id: 'event_leak',
            severity: 'warning',
            message: `事件监听器过多 (${eventCount}个)`,
            fix: null
        });
        console.log(`  ⚠ 事件监听器过多: ${eventCount}个`);
    } else {
        console.log(`  ✓ 事件监听器数量正常: ${eventCount}个`);
    }
    
    // 问题7: 热区数量检查
    console.log('\n%c【检测7】热区数量检查', 'color: #2196F3; font-weight: bold;');
    
    const hotspotCount = scene.hotspots.length;
    if (hotspotCount > 100) {
        issues.push({
            id: 'hotspot_count_high',
            severity: 'warning',
            message: `热区数量较多 (${hotspotCount}个)，可能影响性能`,
            fix: null
        });
        console.log(`  ⚠ 热区数量较多: ${hotspotCount}个`);
    } else {
        console.log(`  ✓ 热区数量正常: ${hotspotCount}个`);
    }
    
    // 问题8: A3高亮集成检查
    console.log('\n%c【检测8】A3高亮集成检查', 'color: #2196F3; font-weight: bold;');
    
    if (timeline && !timeline.highlightController) {
        issues.push({
            id: 'a3_not_integrated',
            severity: 'warning',
            message: 'A3: HighlightController未初始化，A4创建后无法自动高亮',
            fix: null
        });
        console.log('  ⚠ A3: HighlightController未初始化');
    } else {
        console.log('  ✓ A3: HighlightController已初始化');
    }
    
    // 问题9: 命令模式检查
    console.log('\n%c【检测9】命令模式检查', 'color: #2196F3; font-weight: bold;');
    
    if (!scene.commandManager) {
        issues.push({
            id: 'command_manager_missing',
            severity: 'critical',
            message: 'CommandManager未初始化，无法撤销/重做',
            fix: null
        });
        console.log('  ❌ CommandManager未初始化');
    } else {
        console.log('  ✓ CommandManager已初始化');
        console.log(`    历史记录: ${scene.commandManager.history.length}条`);
        console.log(`    重做栈: ${scene.commandManager.redoStack.length}条`);
    }
    
    // 总结
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #F44336; font-weight: bold;');
    console.log('%c║                    检测结果总结                        ║', 'color: #F44336; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #F44336; font-weight: bold;');
    
    const critical = issues.filter(i => i.severity === 'critical').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const info = issues.filter(i => i.severity === 'info').length;
    
    console.log(`\n发现问题: ${issues.length}个`);
    console.log(`  严重: ${critical}个`);
    console.log(`  警告: ${warnings}个`);
    console.log(`  提示: ${info}个`);
    
    if (issues.length === 0) {
        console.log('\n%c✅ 未发现问题，功能正常！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    } else {
        console.log('\n%c⚠️ 发现问题，建议修复', 'color: #FF9800; font-size: 16px; font-weight: bold;');
        console.log('\n运行 fixIssues() 自动修复可修复的问题');
    }
    
    return issues;
}

// ============================================
// 自动修复
// ============================================

function fixIssues() {
    console.log('\n%c开始自动修复...', 'color: #4CAF50; font-weight: bold;');
    
    const issues = detectIssues();
    const fixableIssues = issues.filter(i => i.fix !== null);
    
    if (fixableIssues.length === 0) {
        console.log('\n%c没有可自动修复的问题', 'color: #2196F3;');
        return;
    }
    
    console.log(`\n找到 ${fixableIssues.length} 个可修复的问题`);
    
    fixableIssues.forEach(issue => {
        console.log(`\n修复: ${issue.message}`);
        
        try {
            switch (issue.fix) {
                case 'fixA4MinDuration':
                    fixA4MinDuration();
                    break;
                case 'fixB5Threshold':
                    fixB5Threshold();
                    break;
                default:
                    console.log('  ⚠ 未找到修复方法');
            }
        } catch (error) {
            console.error(`  ❌ 修复失败: ${error.message}`);
        }
    });
    
    console.log('\n%c修复完成！', 'color: #4CAF50; font-weight: bold;');
    console.log('运行 detectIssues() 重新检测');
}

// ============================================
// 具体修复方法
// ============================================

function fixA4MinDuration() {
    const timeline = window.timelinePanel;
    if (timeline && timeline.directCreateController) {
        timeline.directCreateController.minDuration = 0.5;
        console.log('  ✓ 已设置最小时长为0.5秒');
    }
}

function fixB5Threshold() {
    const timeline = window.timelinePanel;
    if (timeline && timeline.snapController) {
        timeline.snapController.snapThreshold = 10;
        console.log('  ✓ 已设置吸附阈值为10px');
    }
}

// ============================================
// 功能验证
// ============================================

async function verifyFunctionality() {
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
    console.log('%c║                    功能验证测试                        ║', 'color: #9C27B0; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
    
    const scene = window.game.scene.getScene('EditorScene');
    const timeline = window.timelinePanel;
    const results = [];
    
    // 验证1: A4创建功能
    console.log('\n%c【验证1】A4创建功能', 'color: #2196F3; font-weight: bold;');
    try {
        const beforeCount = scene.hotspots.length;
        timeline.directCreateController.handleMouseDown(100, 50, true);
        timeline.directCreateController.handleMouseMove(300, 50);
        timeline.directCreateController.handleMouseUp();
        await sleep(100);
        const afterCount = scene.hotspots.length;
        
        if (afterCount > beforeCount) {
            console.log('  ✓ A4创建功能正常');
            results.push({ name: 'A4创建', passed: true });
        } else {
            console.log('  ❌ A4创建功能异常');
            results.push({ name: 'A4创建', passed: false });
        }
    } catch (error) {
        console.log(`  ❌ A4创建测试失败: ${error.message}`);
        results.push({ name: 'A4创建', passed: false });
    }
    
    // 验证2: B5吸附功能
    console.log('\n%c【验证2】B5吸附功能', 'color: #2196F3; font-weight: bold;');
    try {
        timeline.snapController.setEnabled(true);
        const time = 5.08;
        const snapped = timeline.snapController.snapTime(time);
        
        if (Math.abs(snapped - 5.0) < 0.1) {
            console.log(`  ✓ B5吸附功能正常 (${time} -> ${snapped})`);
            results.push({ name: 'B5吸附', passed: true });
        } else {
            console.log(`  ❌ B5吸附功能异常 (${time} -> ${snapped})`);
            results.push({ name: 'B5吸附', passed: false });
        }
    } catch (error) {
        console.log(`  ❌ B5吸附测试失败: ${error.message}`);
        results.push({ name: 'B5吸附', passed: false });
    }
    
    // 验证3: B6批量操作
    console.log('\n%c【验证3】B6批量操作', 'color: #2196F3; font-weight: bold;');
    try {
        if (scene.hotspots.length >= 2) {
            timeline.selectionController.clearSelection();
            scene.hotspots.slice(0, 2).forEach(h => {
                timeline.selectionController.selectedIds.add(h.config.id);
            });
            
            const count = timeline.selectionController.getSelectionCount();
            if (count === 2) {
                console.log('  ✓ B6批量选择功能正常');
                results.push({ name: 'B6批量', passed: true });
            } else {
                console.log('  ❌ B6批量选择功能异常');
                results.push({ name: 'B6批量', passed: false });
            }
        } else {
            console.log('  ⚠ 热区数量不足，跳过测试');
            results.push({ name: 'B6批量', passed: null });
        }
    } catch (error) {
        console.log(`  ❌ B6批量测试失败: ${error.message}`);
        results.push({ name: 'B6批量', passed: false });
    }
    
    // 总结
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold;');
    console.log('%c║                    验证结果总结                        ║', 'color: #9C27B0; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold;');
    
    const passed = results.filter(r => r.passed === true).length;
    const failed = results.filter(r => r.passed === false).length;
    const skipped = results.filter(r => r.passed === null).length;
    
    console.log(`\n通过: ${passed}/${results.length}`);
    console.log(`失败: ${failed}/${results.length}`);
    console.log(`跳过: ${skipped}/${results.length}`);
    
    if (failed === 0) {
        console.log('\n%c✅ 所有功能验证通过！', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    } else {
        console.log('\n%c⚠️ 部分功能验证失败', 'color: #FF9800; font-size: 16px; font-weight: bold;');
    }
    
    return results;
}

// ============================================
// 工具函数
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 导出函数
// ============================================

window.fixA4B5B6 = {
    detect: detectIssues,
    fix: fixIssues,
    verify: verifyFunctionality
};

// 自动运行提示
console.log('%c问题检测和修复脚本已加载！', 'color: #F44336; font-size: 16px; font-weight: bold;');
console.log('%c运行命令:', 'color: #2196F3; font-weight: bold;');
console.log('  fixA4B5B6.detect()  - 检测问题');
console.log('  fixA4B5B6.fix()     - 自动修复');
console.log('  fixA4B5B6.verify()  - 验证功能');
