// src/layer/LayerValidator.js
// 图层验证器 - 完全遵循 Phaser 3 官方标准

export default class LayerValidator {
    constructor(layerManager) {
        this.layerManager = layerManager;
        this.testResults = [];
    }
    
    async runFullValidation() {
        console.log('🚀 开始图层管理完整验证...');
        this.testResults = [];
        
        await this.validateCreateLayer();
        await this.validateDeleteLayer();
        await this.validateVisibility();
        await this.validateLock();
        await this.validateLayerOrder();
        await this.validateRename();
        
        return this.generateReport();
    }
    
    async validateCreateLayer() {
        const testName = '创建图层';
        const startTime = performance.now();
        
        const initialCount = this.layerManager.getLayerCount();
        const layer = this.layerManager.createLayer('测试图层');
        const afterCount = this.layerManager.getLayerCount();
        
        const passed = layer !== null && afterCount === initialCount + 1;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            initialCount,
            afterCount,
            layerId: layer?.id
        });
    }
    
    async validateDeleteLayer() {
        const testName = '删除图层';
        const startTime = performance.now();
        
        const layer = this.layerManager.createLayer('待删除图层');
        const beforeCount = this.layerManager.getLayerCount();
        const success = this.layerManager.deleteLayer(layer.id);
        const afterCount = this.layerManager.getLayerCount();
        
        const passed = success && afterCount === beforeCount - 1;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            beforeCount,
            afterCount,
            success
        });
    }
    
    async validateVisibility() {
        const testName = '图层显示/隐藏';
        const startTime = performance.now();
        
        const layer = this.layerManager.createLayer('可见性测试');
        const initialVisible = layer.visible;
        
        this.layerManager.toggleLayerVisibility(layer.id);
        const afterToggle1 = layer.visible;
        
        this.layerManager.toggleLayerVisibility(layer.id);
        const afterToggle2 = layer.visible;
        
        const passed = initialVisible !== afterToggle1 && initialVisible === afterToggle2;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            initialVisible,
            afterToggle1,
            afterToggle2
        });
    }
    
    async validateLock() {
        const testName = '图层锁定/解锁';
        const startTime = performance.now();
        
        const layer = this.layerManager.createLayer('锁定测试');
        const initialLocked = layer.locked;
        
        this.layerManager.toggleLayerLock(layer.id);
        const afterToggle1 = layer.locked;
        
        this.layerManager.toggleLayerLock(layer.id);
        const afterToggle2 = layer.locked;
        
        const passed = initialLocked !== afterToggle1 && initialLocked === afterToggle2;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            initialLocked,
            afterToggle1,
            afterToggle2
        });
    }
    
    async validateLayerOrder() {
        const testName = '图层排序（上移/下移）';
        const startTime = performance.now();
        
        const layer1 = this.layerManager.createLayer('图层1');
        const layer2 = this.layerManager.createLayer('图层2');
        
        const layers = this.layerManager.getLayers();
        const index1Before = layers.indexOf(layer1);
        const index2Before = layers.indexOf(layer2);
        
        this.layerManager.moveLayerUp(layer1.id);
        
        const layersAfter = this.layerManager.getLayers();
        const index1After = layersAfter.indexOf(layer1);
        
        const passed = index1After > index1Before;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            index1Before,
            index1After,
            orderChanged: passed
        });
    }
    
    async validateRename() {
        const testName = '图层重命名';
        const startTime = performance.now();
        
        const layer = this.layerManager.createLayer('旧名称');
        const oldName = layer.name;
        
        const success = this.layerManager.renameLayer(layer.id, '新名称');
        const newName = layer.name;
        
        const passed = success && oldName !== newName && newName === '新名称';
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            oldName,
            newName,
            success
        });
    }
    
    addTestResult(name, passed, duration, details = {}) {
        this.testResults.push({
            name,
            passed,
            duration: duration.toFixed(2),
            details,
            timestamp: Date.now()
        });
        
        const status = passed ? '✓' : '✗';
        const color = passed ? '\x1b[32m' : '\x1b[31m';
        console.log(`${color}${status} ${name}: ${duration.toFixed(2)}ms\x1b[0m`);
    }
    
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const totalDuration = this.testResults.reduce((sum, r) => 
            sum + parseFloat(r.duration), 0
        );
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                passRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
                totalDuration: totalDuration.toFixed(2) + 'ms'
            },
            tests: this.testResults
        };
        
        console.log('\n📊 图层管理测试报告:');
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests}`);
        console.log(`失败: ${failedTests}`);
        console.log(`通过率: ${report.summary.passRate}`);
        
        return report;
    }
}
