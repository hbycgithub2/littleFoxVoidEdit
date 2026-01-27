// RUN_ALL_TESTS.js
// 一键运行所有测试的快捷脚本

async function runAllTests() {
    console.clear();
    console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #9C27B0; font-weight: bold; font-size: 18px;');
    console.log('%c║          一键运行所有功能测试                          ║', 'color: #9C27B0; font-weight: bold; font-size: 18px;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #9C27B0; font-weight: bold; font-size: 18px;');
    
    const tests = [
        { name: 'A1-A3基础测试', func: 'testA1A2A3', file: 'TEST_A1_A2_A3.js' },
        { name: 'A4测试', func: 'testA4', file: 'TEST_A4.js' },
        { name: 'B5测试', func: 'testB5', file: 'TEST_B5.js' },
        { name: 'B6测试', func: 'testB6', file: 'TEST_B6.js' },
        { name: 'B7测试', func: 'testB7', file: 'TEST_B7.js' },
        { name: 'B8测试', func: 'testB8', file: 'TEST_B8.js' },
        { name: 'B7+B8深度测试', func: 'testB7B8Deep', file: 'TEST_B7_B8_DEEP.js' },
        { name: '全功能深度测试', func: 'testAllFeaturesDeep', file: 'TEST_ALL_FEATURES_DEEP.js' }
    ];
    
    console.log('\n%c可用测试列表:', 'color: #2196F3; font-weight: bold; font-size: 14px;');
    tests.forEach((test, index) => {
        const available = typeof window[test.func] === 'function';
        const status = available ? '✓' : '❌';
        console.log(`  ${index + 1}. ${status} ${test.name} - ${test.func}()`);
    });
    
    console.log('\n%c快速运行命令:', 'color: #4CAF50; font-weight: bold;');
    console.log('  runQuickTest()     - 快速测试（A1-A4, B5-B8基础）');
    console.log('  runDeepTest()      - 深度测试（4层验证）');
    console.log('  runPerformanceTest() - 性能测试');
    console.log('  runIntegrationTest() - 集成测试');
}

// 快速测试
async function runQuickTest() {
    console.clear();
    console.log('%c快速测试开始...', 'color: #2196F3; font-weight: bold; font-size: 16px;');
    
    const results = [];
    
    // A1-A3
    if (typeof testA1A2A3 !== 'undefined') {
        console.log('\n%c【1/8】A1-A3测试', 'color: #4CAF50; font-weight: bold;');
        try {
            await testA1A2A3.full();
            results.push({ name: 'A1-A3', pass: true });
        } catch (e) {
            results.push({ name: 'A1-A3', pass: false, error: e.message });
        }
    }
    
    // A4
    if (typeof testA4 !== 'undefined') {
        console.log('\n%c【2/8】A4测试', 'color: #4CAF50; font-weight: bold;');
        try {
            await testA4.full();
            results.push({ name: 'A4', pass: true });
        } catch (e) {
            results.push({ name: 'A4', pass: false, error: e.message });
        }
    }
    
    // B5
    if (typeof testB5 !== 'undefined') {
        console.log('\n%c【3/8】B5测试', 'color: #4CAF50; font-weight: bold;');
        try {
            await testB5.full();
            results.push({ name: 'B5', pass: true });
        } catch (e) {
            results.push({ name: 'B5', pass: false, error: e.message });
        }
    }
    
    // B6
    if (typeof testB6 !== 'undefined') {
        console.log('\n%c【4/8】B6测试', 'color: #4CAF50; font-weight: bold;');
        try {
            await testB6.full();
            results.push({ name: 'B6', pass: true });
        } catch (e) {
            results.push({ name: 'B6', pass: false, error: e.message });
        }
    }
    
    // B7
    if (typeof testB7 !== 'undefined') {
        console.log('\n%c【5/8】B7测试', 'color: #4CAF50; font-weight: bold;');
        try {
            await testB7.full();
            results.push({ name: 'B7', pass: true });
        } catch (e) {
            results.push({ name: 'B7', pass: false, error: e.message });
        }
    }
    
    // B8
    if (typeof testB8 !== 'undefined') {
        console.log('\n%c【6/8】B8测试', 'color: #4CAF50; font-weight: bold;');
        try {
            await testB8.full();
            results.push({ name: 'B8', pass: true });
        } catch (e) {
            results.push({ name: 'B8', pass: false, error: e.message });
        }
    }
    
    printQuickResults(results);
}

// 深度测试
async function runDeepTest() {
    console.clear();
    console.log('%c深度测试开始...', 'color: #9C27B0; font-weight: bold; font-size: 16px;');
    
    if (typeof testAllFeaturesDeep !== 'undefined') {
        await testAllFeaturesDeep();
    } else {
        console.error('❌ 深度测试脚本未加载');
    }
}

// 性能测试
async function runPerformanceTest() {
    console.clear();
    console.log('%c性能测试开始...', 'color: #FF9800; font-weight: bold; font-size: 16px;');
    
    if (typeof window.deepTester !== 'undefined') {
        await window.deepTester.init();
        await window.deepTester.testLayer2();
    } else {
        console.error('❌ 性能测试脚本未加载');
    }
}

// 集成测试
async function runIntegrationTest() {
    console.clear();
    console.log('%c集成测试开始...', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    
    if (typeof window.deepTester !== 'undefined') {
        await window.deepTester.init();
        await window.deepTester.testLayer3();
    } else {
        console.error('❌ 集成测试脚本未加载');
    }
}

// 打印快速测试结果
function printQuickResults(results) {
    console.log('\n%c╔════════════════════════════════════════════════════════╗', 'color: #4CAF50; font-weight: bold;');
    console.log('%c║                  快速测试结果                          ║', 'color: #4CAF50; font-weight: bold;');
    console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4CAF50; font-weight: bold;');
    
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    const rate = (passed / total * 100).toFixed(1);
    
    console.log(`\n%c通过率: ${rate}% (${passed}/${total})`,
        rate >= 90 ? 'color: #4CAF50; font-size: 16px; font-weight: bold;' : 'color: #FF9800; font-size: 16px; font-weight: bold;');
    
    console.log('\n详细结果:');
    results.forEach(r => {
        const status = r.pass ? '✓' : '❌';
        const color = r.pass ? '#4CAF50' : '#F44336';
        console.log(`%c  ${status} ${r.name}`, `color: ${color}; font-weight: bold;`);
        if (!r.pass && r.error) {
            console.log(`    错误: ${r.error}`);
        }
    });
}

// 自动运行
runAllTests();

// 导出函数
window.runAllTests = runAllTests;
window.runQuickTest = runQuickTest;
window.runDeepTest = runDeepTest;
window.runPerformanceTest = runPerformanceTest;
window.runIntegrationTest = runIntegrationTest;
