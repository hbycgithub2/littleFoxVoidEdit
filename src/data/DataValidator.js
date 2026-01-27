// src/data/DataValidator.js
// 数据验证器 - 完全遵循 Phaser 3 官方标准

export default class DataValidator {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.testResults = [];
    }
    
    /**
     * 运行完整验证
     */
    async runFullValidation() {
        console.log('🚀 开始数据管理完整验证...');
        this.testResults = [];
        
        await this.validateExportJSON();
        await this.validateImportJSON();
        await this.validateDataValidation();
        await this.validateErrorHandling();
        await this.validateDataIntegrity();
        
        return this.generateReport();
    }
    
    /**
     * 验证导出 JSON
     */
    async validateExportJSON() {
        const testName = '导出 JSON';
        const startTime = performance.now();
        
        // 创建测试数据
        const testHotspots = this.createTestHotspots(5);
        
        // 导出
        const result = this.dataManager.exportJSON(testHotspots, {
            title: '测试项目',
            author: '测试用户'
        });
        
        const passed = result.success && result.data && result.hotspotCount === 5;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            success: result.success,
            hotspotCount: result.hotspotCount,
            size: result.size
        });
    }
    
    /**
     * 验证导入 JSON
     */
    async validateImportJSON() {
        const testName = '导入 JSON';
        const startTime = performance.now();
        
        // 创建测试 JSON
        const testData = this.createTestJSON();
        const jsonString = JSON.stringify(testData);
        
        // 导入
        const result = this.dataManager.importJSON(jsonString);
        
        const passed = result.success && result.hotspots.length === testData.hotspots.length;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            success: result.success,
            hotspotCount: result.hotspots?.length || 0
        });
    }
    
    /**
     * 验证数据验证
     */
    async validateDataValidation() {
        const testName = '数据验证';
        const startTime = performance.now();
        
        // 测试有效数据
        const validData = this.createTestJSON();
        const validResult = this.dataManager.validateImportData(validData);
        
        // 测试无效数据
        const invalidData = { invalid: true };
        const invalidResult = this.dataManager.validateImportData(invalidData);
        
        const passed = validResult === true && invalidResult === false;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            validResult,
            invalidResult
        });
    }
    
    /**
     * 验证错误处理
     */
    async validateErrorHandling() {
        const testName = '错误提示';
        const startTime = performance.now();
        
        // 清除旧错误
        this.dataManager.clearErrors();
        
        // 触发错误
        const result = this.dataManager.importJSON('invalid json');
        
        const hasErrors = this.dataManager.getErrors().length > 0;
        const passed = !result.success && hasErrors;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            errorCount: this.dataManager.getErrors().length,
            hasErrors
        });
    }
    
    /**
     * 验证数据完整性
     */
    async validateDataIntegrity() {
        const testName = '数据完整性';
        const startTime = performance.now();
        
        // 创建完整数据
        const completeData = this.createTestJSON();
        const completeCheck = this.dataManager.checkDataIntegrity(completeData);
        
        // 创建不完整数据
        const incompleteData = { version: '1.0.0' };
        const incompleteCheck = this.dataManager.checkDataIntegrity(incompleteData);
        
        const passed = completeCheck.valid === true && incompleteCheck.valid === false;
        const duration = performance.now() - startTime;
        
        this.addTestResult(testName, passed, duration, {
            completeValid: completeCheck.valid,
            incompleteValid: incompleteCheck.valid
        });
    }
    
    /**
     * 创建测试热区
     */
    createTestHotspots(count) {
        const hotspots = [];
        for (let i = 0; i < count; i++) {
            hotspots.push({
                config: {
                    id: `hotspot_${i}`,
                    type: 'rect',
                    width: 100,
                    height: 80,
                    color: '#00ff00',
                    strokeWidth: 3,
                    startTime: i * 5,
                    endTime: (i + 1) * 5,
                    action: {},
                    metadata: {}
                },
                x: 100 + i * 150,
                y: 100
            });
        }
        return hotspots;
    }
    
    /**
     * 创建测试 JSON
     */
    createTestJSON() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            metadata: {
                title: '测试项目',
                author: '测试用户'
            },
            hotspots: [
                { id: 'h1', type: 'rect', x: 100, y: 100, width: 100, height: 80 },
                { id: 'h2', type: 'rect', x: 250, y: 150, width: 100, height: 80 },
                { id: 'h3', type: 'rect', x: 400, y: 200, width: 100, height: 80 }
            ],
            stats: {
                totalHotspots: 3
            }
        };
    }
    
    /**
     * 添加测试结果
     */
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
    
    /**
     * 生成测试报告
     */
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
        
        console.log('\n📊 数据管理测试报告:');
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests}`);
        console.log(`失败: ${failedTests}`);
        console.log(`通过率: ${report.summary.passRate}`);
        
        return report;
    }
}
