// src/utils/AlignDistributeValidator.js
// 对齐分布验证器 - 完全遵循 Phaser 3 官方标准
// 功能：自动化测试、性能分析、结果验证

export default class AlignDistributeValidator {
    constructor(scene) {
        this.scene = scene;
        this.testResults = [];
        this.performanceMetrics = {};
    }
    
    /**
     * 运行完整验证测试（遵循 Phaser 标准）
     */
    runFullValidation(hotspots) {
        console.log('🚀 开始对齐分布完整验证...');
        this.testResults = [];
        
        // 测试1: 左对齐
        this.validateAlignLeft(hotspots);
        
        // 测试2: 右对齐
        this.validateAlignRight(hotspots);
        
        // 测试3: 水平居中
        this.validateAlignCenterH(hotspots);
        
        // 测试4: 顶部对齐
        this.validateAlignTop(hotspots);
        
        // 测试5: 底部对齐
        this.validateAlignBottom(hotspots);
        
        // 测试6: 垂直居中
        this.validateAlignCenterV(hotspots);
        
        // 测试7: 水平分布
        this.validateDistributeH(hotspots);
        
        // 测试8: 垂直分布
        this.validateDistributeV(hotspots);
        
        return this.generateReport();
    }
    
    /**
     * 验证左对齐（遵循 Phaser 标准）
     */
    validateAlignLeft(hotspots) {
        const testName = '左对齐';
        const startTime = performance.now();
        
        // 保存初始位置
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        // 执行对齐
        const minX = Math.min(...hotspots.map(h => h.x));
        hotspots.forEach(h => h.x = minX);
        
        // 验证结果
        const allAligned = hotspots.every(h => Math.abs(h.x - minX) < 0.01);
        const yUnchanged = hotspots.every((h, i) => 
            Math.abs(h.y - initialPositions[i].y) < 0.01
        );
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.addTestResult(testName, allAligned && yUnchanged, duration, {
            targetX: minX,
            hotspotsCount: hotspots.length,
            allAligned,
            yUnchanged
        });
        
        // 恢复位置
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证右对齐（遵循 Phaser 标准）
     */
    validateAlignRight(hotspots) {
        const testName = '右对齐';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const maxX = Math.max(...hotspots.map(h => h.x));
        hotspots.forEach(h => h.x = maxX);
        
        const allAligned = hotspots.every(h => Math.abs(h.x - maxX) < 0.01);
        const yUnchanged = hotspots.every((h, i) => 
            Math.abs(h.y - initialPositions[i].y) < 0.01
        );
        
        const endTime = performance.now();
        
        this.addTestResult(testName, allAligned && yUnchanged, endTime - startTime, {
            targetX: maxX,
            hotspotsCount: hotspots.length
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证水平居中（遵循 Phaser 标准）
     */
    validateAlignCenterH(hotspots) {
        const testName = '水平居中';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const xs = hotspots.map(h => h.x);
        const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
        hotspots.forEach(h => h.x = centerX);
        
        const allAligned = hotspots.every(h => Math.abs(h.x - centerX) < 0.01);
        
        const endTime = performance.now();
        
        this.addTestResult(testName, allAligned, endTime - startTime, {
            centerX,
            hotspotsCount: hotspots.length
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证顶部对齐（遵循 Phaser 标准）
     */
    validateAlignTop(hotspots) {
        const testName = '顶部对齐';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const minY = Math.min(...hotspots.map(h => h.y));
        hotspots.forEach(h => h.y = minY);
        
        const allAligned = hotspots.every(h => Math.abs(h.y - minY) < 0.01);
        const xUnchanged = hotspots.every((h, i) => 
            Math.abs(h.x - initialPositions[i].x) < 0.01
        );
        
        const endTime = performance.now();
        
        this.addTestResult(testName, allAligned && xUnchanged, endTime - startTime, {
            targetY: minY,
            hotspotsCount: hotspots.length
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证底部对齐（遵循 Phaser 标准）
     */
    validateAlignBottom(hotspots) {
        const testName = '底部对齐';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const maxY = Math.max(...hotspots.map(h => h.y));
        hotspots.forEach(h => h.y = maxY);
        
        const allAligned = hotspots.every(h => Math.abs(h.y - maxY) < 0.01);
        
        const endTime = performance.now();
        
        this.addTestResult(testName, allAligned, endTime - startTime, {
            targetY: maxY,
            hotspotsCount: hotspots.length
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证垂直居中（遵循 Phaser 标准）
     */
    validateAlignCenterV(hotspots) {
        const testName = '垂直居中';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const ys = hotspots.map(h => h.y);
        const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
        hotspots.forEach(h => h.y = centerY);
        
        const allAligned = hotspots.every(h => Math.abs(h.y - centerY) < 0.01);
        
        const endTime = performance.now();
        
        this.addTestResult(testName, allAligned, endTime - startTime, {
            centerY,
            hotspotsCount: hotspots.length
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证水平分布（遵循 Phaser 标准）
     */
    validateDistributeH(hotspots) {
        const testName = '水平分布';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const sorted = [...hotspots].sort((a, b) => a.x - b.x);
        const minX = sorted[0].x;
        const maxX = sorted[sorted.length - 1].x;
        const spacing = (maxX - minX) / (sorted.length - 1);
        
        sorted.forEach((h, i) => h.x = minX + spacing * i);
        
        // 验证间距均匀
        let spacingCorrect = true;
        for (let i = 1; i < sorted.length; i++) {
            const actualSpacing = sorted[i].x - sorted[i - 1].x;
            if (Math.abs(actualSpacing - spacing) > 0.01) {
                spacingCorrect = false;
                break;
            }
        }
        
        const endTime = performance.now();
        
        this.addTestResult(testName, spacingCorrect, endTime - startTime, {
            spacing,
            hotspotsCount: hotspots.length,
            range: maxX - minX
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
    }
    
    /**
     * 验证垂直分布（遵循 Phaser 标准）
     */
    validateDistributeV(hotspots) {
        const testName = '垂直分布';
        const startTime = performance.now();
        
        const initialPositions = hotspots.map(h => ({ x: h.x, y: h.y }));
        
        const sorted = [...hotspots].sort((a, b) => a.y - b.y);
        const minY = sorted[0].y;
        const maxY = sorted[sorted.length - 1].y;
        const spacing = (maxY - minY) / (sorted.length - 1);
        
        sorted.forEach((h, i) => h.y = minY + spacing * i);
        
        let spacingCorrect = true;
        for (let i = 1; i < sorted.length; i++) {
            const actualSpacing = sorted[i].y - sorted[i - 1].y;
            if (Math.abs(actualSpacing - spacing) > 0.01) {
                spacingCorrect = false;
                break;
            }
        }
        
        const endTime = performance.now();
        
        this.addTestResult(testName, spacingCorrect, endTime - startTime, {
            spacing,
            hotspotsCount: hotspots.length,
            range: maxY - minY
        });
        
        hotspots.forEach((h, i) => {
            h.x = initialPositions[i].x;
            h.y = initialPositions[i].y;
        });
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
        const avgDuration = totalDuration / totalTests;
        
        const report = {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                passRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
                totalDuration: totalDuration.toFixed(2) + 'ms',
                avgDuration: avgDuration.toFixed(2) + 'ms'
            },
            tests: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        console.log('\n📊 测试报告:');
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests}`);
        console.log(`失败: ${failedTests}`);
        console.log(`通过率: ${report.summary.passRate}`);
        console.log(`总耗时: ${report.summary.totalDuration}`);
        console.log(`平均耗时: ${report.summary.avgDuration}`);
        
        return report;
    }
    
    /**
     * 生成优化建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 性能建议
        const slowTests = this.testResults.filter(r => parseFloat(r.duration) > 5);
        if (slowTests.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: `${slowTests.length} 个测试耗时超过5ms，建议优化算法`
            });
        }
        
        // 功能建议
        recommendations.push({
            type: 'feature',
            priority: 'medium',
            message: '可添加对齐预览功能，提升用户体验'
        });
        
        recommendations.push({
            type: 'feature',
            priority: 'low',
            message: '可添加智能对齐建议，自动检测最佳对齐方式'
        });
        
        return recommendations;
    }
}
