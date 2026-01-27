// src/utils/TimelinePerformanceMonitor.js
// 时间轴性能监控工具 - 完全遵循 Phaser 3 官方标准

/**
 * 时间轴性能监控器
 * 用于检测A4、B5、B6功能的性能瓶颈
 */
export default class TimelinePerformanceMonitor {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        
        // 性能指标
        this.metrics = {
            a4: {
                createCount: 0,
                avgCreateTime: 0,
                maxCreateTime: 0,
                totalCreateTime: 0
            },
            b5: {
                snapCount: 0,
                avgSnapTime: 0,
                maxSnapTime: 0,
                totalSnapTime: 0
            },
            b6: {
                batchCount: 0,
                avgBatchTime: 0,
                maxBatchTime: 0,
                totalBatchTime: 0,
                maxBatchSize: 0
            }
        };
        
        // 性能阈值（毫秒）
        this.thresholds = {
            create: 50,    // A4创建应 < 50ms
            snap: 1,       // B5吸附应 < 1ms
            batch: 5       // B6批量应 < 5ms
        };
        
        this.setupMonitoring();
    }
    
    /**
     * 设置监控
     */
    setupMonitoring() {
        // 监听A4创建事件
        this.scene.events.on('hotspot:added', () => {
            if (this.enabled && this.currentA4Start) {
                const duration = performance.now() - this.currentA4Start;
                this.recordA4Create(duration);
                this.currentA4Start = null;
            }
        });
        
        // 监听B5吸附事件
        this.scene.events.on('timeline:snap:active', () => {
            if (this.enabled && this.currentB5Start) {
                const duration = performance.now() - this.currentB5Start;
                this.recordB5Snap(duration);
                this.currentB5Start = null;
            }
        });
    }
    
    /**
     * 启用监控
     */
    enable() {
        this.enabled = true;
        console.log('📊 性能监控已启用');
    }
    
    /**
     * 禁用监控
     */
    disable() {
        this.enabled = false;
        console.log('📊 性能监控已禁用');
    }
    
    /**
     * 开始A4创建计时
     */
    startA4Create() {
        if (this.enabled) {
            this.currentA4Start = performance.now();
        }
    }
    
    /**
     * 记录A4创建性能
     */
    recordA4Create(duration) {
        const m = this.metrics.a4;
        m.createCount++;
        m.totalCreateTime += duration;
        m.avgCreateTime = m.totalCreateTime / m.createCount;
        m.maxCreateTime = Math.max(m.maxCreateTime, duration);
        
        if (duration > this.thresholds.create) {
            console.warn(`⚠️ A4创建耗时过长: ${duration.toFixed(2)}ms (阈值: ${this.thresholds.create}ms)`);
        }
    }
    
    /**
     * 开始B5吸附计时
     */
    startB5Snap() {
        if (this.enabled) {
            this.currentB5Start = performance.now();
        }
    }
    
    /**
     * 记录B5吸附性能
     */
    recordB5Snap(duration) {
        const m = this.metrics.b5;
        m.snapCount++;
        m.totalSnapTime += duration;
        m.avgSnapTime = m.totalSnapTime / m.snapCount;
        m.maxSnapTime = Math.max(m.maxSnapTime, duration);
        
        if (duration > this.thresholds.snap) {
            console.warn(`⚠️ B5吸附耗时过长: ${duration.toFixed(2)}ms (阈值: ${this.thresholds.snap}ms)`);
        }
    }
    
    /**
     * 记录B6批量操作性能
     */
    recordB6Batch(duration, batchSize) {
        if (!this.enabled) return;
        
        const m = this.metrics.b6;
        m.batchCount++;
        m.totalBatchTime += duration;
        m.avgBatchTime = m.totalBatchTime / m.batchCount;
        m.maxBatchTime = Math.max(m.maxBatchTime, duration);
        m.maxBatchSize = Math.max(m.maxBatchSize, batchSize);
        
        if (duration > this.thresholds.batch) {
            console.warn(`⚠️ B6批量操作耗时过长: ${duration.toFixed(2)}ms (阈值: ${this.thresholds.batch}ms, 数量: ${batchSize})`);
        }
    }
    
    /**
     * 获取性能报告
     */
    getReport() {
        return {
            a4: {
                ...this.metrics.a4,
                status: this.metrics.a4.maxCreateTime < this.thresholds.create ? '✅' : '⚠️'
            },
            b5: {
                ...this.metrics.b5,
                status: this.metrics.b5.maxSnapTime < this.thresholds.snap ? '✅' : '⚠️'
            },
            b6: {
                ...this.metrics.b6,
                status: this.metrics.b6.maxBatchTime < this.thresholds.batch ? '✅' : '⚠️'
            }
        };
    }
    
    /**
     * 打印性能报告
     */
    printReport() {
        const report = this.getReport();
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📊 时间轴性能报告');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
        
        console.log(`${report.a4.status} A4: 时间轴直接创建`);
        console.log(`   操作次数: ${report.a4.createCount}`);
        console.log(`   平均耗时: ${report.a4.avgCreateTime.toFixed(2)}ms`);
        console.log(`   最大耗时: ${report.a4.maxCreateTime.toFixed(2)}ms`);
        console.log(`   阈值: ${this.thresholds.create}ms`);
        console.log('');
        
        console.log(`${report.b5.status} B5: 磁性吸附`);
        console.log(`   操作次数: ${report.b5.snapCount}`);
        console.log(`   平均耗时: ${report.b5.avgSnapTime.toFixed(3)}ms`);
        console.log(`   最大耗时: ${report.b5.maxSnapTime.toFixed(3)}ms`);
        console.log(`   阈值: ${this.thresholds.snap}ms`);
        console.log('');
        
        console.log(`${report.b6.status} B6: 批量调整`);
        console.log(`   操作次数: ${report.b6.batchCount}`);
        console.log(`   平均耗时: ${report.b6.avgBatchTime.toFixed(2)}ms`);
        console.log(`   最大耗时: ${report.b6.maxBatchTime.toFixed(2)}ms`);
        console.log(`   最大批量: ${report.b6.maxBatchSize}个`);
        console.log(`   阈值: ${this.thresholds.batch}ms`);
        console.log('');
        
        console.log('═══════════════════════════════════════════════════════════');
    }
    
    /**
     * 重置统计
     */
    reset() {
        this.metrics = {
            a4: {
                createCount: 0,
                avgCreateTime: 0,
                maxCreateTime: 0,
                totalCreateTime: 0
            },
            b5: {
                snapCount: 0,
                avgSnapTime: 0,
                maxSnapTime: 0,
                totalSnapTime: 0
            },
            b6: {
                batchCount: 0,
                avgBatchTime: 0,
                maxBatchTime: 0,
                totalBatchTime: 0,
                maxBatchSize: 0
            }
        };
        console.log('📊 性能统计已重置');
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.enabled = false;
        this.scene.events.off('hotspot:added');
        this.scene.events.off('timeline:snap:active');
    }
}
