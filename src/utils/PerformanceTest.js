// src/utils/PerformanceTest.js
// 性能测试工具 - 测试大量热区的性能

export default class PerformanceTest {
    constructor(scene) {
        this.scene = scene;
        this.testResults = {
            fps: [],
            memory: [],
            renderTime: [],
            hotspotCount: 0
        };
    }
    
    /**
     * 创建测试热区
     * @param {number} count - 热区数量
     */
    createTestHotspots(count = 50) {
        console.log(`开始创建 ${count} 个测试热区...`);
        
        const shapes = ['circle', 'rect', 'ellipse', 'polygon'];
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        
        for (let i = 0; i < count; i++) {
            const shape = shapes[i % shapes.length];
            const x = Math.random() * (width - 200) + 100;
            const y = Math.random() * (height - 200) + 100;
            
            const config = {
                id: Date.now() + i,
                shape: shape,
                x: x,
                y: y,
                color: '#00ff00',
                strokeWidth: 3,
                word: `Test${i}`,
                startTime: 0,
                endTime: 999
            };
            
            // 根据形状添加特定属性
            if (shape === 'circle') {
                config.radius = 30 + Math.random() * 40;
            } else if (shape === 'rect') {
                config.width = 50 + Math.random() * 100;
                config.height = 50 + Math.random() * 100;
            } else if (shape === 'ellipse') {
                config.radiusX = 30 + Math.random() * 50;
                config.radiusY = 30 + Math.random() * 50;
            } else if (shape === 'polygon') {
                const sides = 3 + Math.floor(Math.random() * 5);
                config.points = this.generatePolygonPoints(sides, 40);
            }
            
            this.scene.addHotspot(config);
        }
        
        this.testResults.hotspotCount = count;
        console.log(`✅ 已创建 ${count} 个测试热区`);
    }
    
    /**
     * 生成多边形顶点
     */
    generatePolygonPoints(sides, radius) {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        return points;
    }
    
    /**
     * 开始性能监控
     * @param {number} duration - 监控时长（秒）
     */
    startMonitoring(duration = 10) {
        console.log(`开始性能监控（${duration} 秒）...`);
        
        const startTime = Date.now();
        let frameCount = 0;
        let lastTime = startTime;
        
        const monitor = () => {
            const now = Date.now();
            const elapsed = (now - startTime) / 1000;
            
            if (elapsed >= duration) {
                this.stopMonitoring();
                return;
            }
            
            // 计算 FPS
            frameCount++;
            if (now - lastTime >= 1000) {
                const fps = frameCount;
                this.testResults.fps.push(fps);
                frameCount = 0;
                lastTime = now;
                
                // 记录内存（如果可用）
                if (performance.memory) {
                    const memoryMB = performance.memory.usedJSHeapSize / 1048576;
                    this.testResults.memory.push(memoryMB);
                }
                
                console.log(`FPS: ${fps}, 热区数: ${this.scene.hotspots.length}`);
            }
            
            requestAnimationFrame(monitor);
        };
        
        this.monitoringActive = true;
        monitor();
    }
    
    /**
     * 停止监控并输出结果
     */
    stopMonitoring() {
        this.monitoringActive = false;
        
        const avgFps = this.testResults.fps.reduce((a, b) => a + b, 0) / this.testResults.fps.length;
        const minFps = Math.min(...this.testResults.fps);
        const maxFps = Math.max(...this.testResults.fps);
        
        console.log('\n=== 性能测试结果 ===');
        console.log(`热区数量: ${this.testResults.hotspotCount}`);
        console.log(`平均 FPS: ${avgFps.toFixed(2)}`);
        console.log(`最低 FPS: ${minFps}`);
        console.log(`最高 FPS: ${maxFps}`);
        
        if (this.testResults.memory.length > 0) {
            const avgMemory = this.testResults.memory.reduce((a, b) => a + b, 0) / this.testResults.memory.length;
            console.log(`平均内存: ${avgMemory.toFixed(2)} MB`);
        }
        
        // 性能评估
        if (avgFps >= 55) {
            console.log('✅ 性能优秀 (>= 55 FPS)');
        } else if (avgFps >= 45) {
            console.log('⚠️ 性能良好 (45-55 FPS)');
        } else if (avgFps >= 30) {
            console.log('⚠️ 性能一般 (30-45 FPS)');
        } else {
            console.log('❌ 性能不足 (< 30 FPS)');
        }
        
        return this.testResults;
    }
    
    /**
     * 清理测试热区
     */
    cleanup() {
        console.log('清理测试热区...');
        const hotspots = [...this.scene.hotspots];
        hotspots.forEach(hotspot => {
            this.scene.removeHotspot(hotspot.config.id);
        });
        console.log('✅ 清理完成');
    }
    
    /**
     * 运行完整测试
     */
    async runFullTest() {
        console.log('\n=== 开始完整性能测试 ===\n');
        
        // 测试 1: 50 个热区
        console.log('--- 测试 1: 50 个热区 ---');
        this.createTestHotspots(50);
        await this.wait(2000);
        this.startMonitoring(5);
        await this.wait(6000);
        this.cleanup();
        
        await this.wait(2000);
        
        // 测试 2: 100 个热区
        console.log('\n--- 测试 2: 100 个热区 ---');
        this.testResults = { fps: [], memory: [], renderTime: [], hotspotCount: 0 };
        this.createTestHotspots(100);
        await this.wait(2000);
        this.startMonitoring(5);
        await this.wait(6000);
        this.cleanup();
        
        console.log('\n=== 性能测试完成 ===\n');
    }
    
    /**
     * 等待指定时间
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
