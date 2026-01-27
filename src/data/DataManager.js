// src/data/DataManager.js
// 数据管理器 - 完全遵循 Phaser 3 官方标准
// 功能：导出/导入JSON、数据验证、错误处理、完整性检查

export default class DataManager {
    constructor(scene) {
        this.scene = scene;
        this.version = '1.0.0';
        this.errors = [];
    }
    
    /**
     * 导出 JSON（遵循 Phaser 标准）
     */
    exportJSON(hotspots, metadata = {}) {
        try {
            this.errors = [];
            
            const data = {
                version: this.version,
                timestamp: Date.now(),
                metadata: {
                    title: metadata.title || 'Untitled',
                    author: metadata.author || 'Unknown',
                    description: metadata.description || '',
                    ...metadata
                },
                hotspots: hotspots.map(h => this.serializeHotspot(h)),
                stats: {
                    totalHotspots: hotspots.length,
                    exportDate: new Date().toISOString()
                }
            };
            
            // 验证数据
            if (!this.validateExportData(data)) {
                throw new Error('数据验证失败');
            }
            
            const json = JSON.stringify(data, null, 2);
            console.log(`✓ 导出成功: ${hotspots.length} 个热区`);
            
            return {
                success: true,
                data: json,
                size: new Blob([json]).size,
                hotspotCount: hotspots.length
            };
            
        } catch (error) {
            console.error('❌ 导出失败:', error);
            this.errors.push({
                type: 'export',
                message: error.message,
                timestamp: Date.now()
            });
            
            return {
                success: false,
                error: error.message,
                errors: this.errors
            };
        }
    }
    
    /**
     * 序列化热区（遵循 Phaser 标准）
     */
    serializeHotspot(hotspot) {
        return {
            id: hotspot.config?.id || hotspot.getData('id'),
            type: hotspot.config?.type || 'rect',
            x: hotspot.x,
            y: hotspot.y,
            width: hotspot.config?.width || 100,
            height: hotspot.config?.height || 80,
            color: hotspot.config?.color || '#00ff00',
            strokeWidth: hotspot.config?.strokeWidth || 3,
            startTime: hotspot.config?.startTime || 0,
            endTime: hotspot.config?.endTime || 60,
            action: hotspot.config?.action || {},
            metadata: hotspot.config?.metadata || {}
        };
    }
    
    /**
     * 导入 JSON（遵循 Phaser 标准）
     */
    importJSON(jsonString) {
        try {
            this.errors = [];
            
            // 解析 JSON
            const data = JSON.parse(jsonString);
            
            // 验证数据
            if (!this.validateImportData(data)) {
                throw new Error('数据格式无效');
            }
            
            // 检查版本兼容性
            if (!this.checkVersionCompatibility(data.version)) {
                console.warn('⚠️ 版本不兼容，尝试转换...');
            }
            
            // 反序列化热区
            const hotspots = data.hotspots.map(h => this.deserializeHotspot(h));
            
            console.log(`✓ 导入成功: ${hotspots.length} 个热区`);
            
            return {
                success: true,
                hotspots: hotspots,
                metadata: data.metadata,
                stats: data.stats,
                version: data.version
            };
            
        } catch (error) {
            console.error('❌ 导入失败:', error);
            this.errors.push({
                type: 'import',
                message: error.message,
                timestamp: Date.now()
            });
            
            return {
                success: false,
                error: error.message,
                errors: this.errors
            };
        }
    }
    
    /**
     * 反序列化热区（遵循 Phaser 标准）
     */
    deserializeHotspot(data) {
        return {
            config: {
                id: data.id,
                type: data.type,
                width: data.width,
                height: data.height,
                color: data.color,
                strokeWidth: data.strokeWidth,
                startTime: data.startTime,
                endTime: data.endTime,
                action: data.action,
                metadata: data.metadata
            },
            x: data.x,
            y: data.y
        };
    }
    
    /**
     * 验证导出数据（遵循 Phaser 标准）
     */
    validateExportData(data) {
        const checks = [
            { test: () => data.version, message: '缺少版本信息' },
            { test: () => data.hotspots, message: '缺少热区数据' },
            { test: () => Array.isArray(data.hotspots), message: '热区数据格式错误' },
            { test: () => data.metadata, message: '缺少元数据' }
        ];
        
        for (const check of checks) {
            if (!check.test()) {
                this.errors.push({
                    type: 'validation',
                    message: check.message,
                    timestamp: Date.now()
                });
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 验证导入数据（遵循 Phaser 标准）
     */
    validateImportData(data) {
        const checks = [
            { test: () => data !== null, message: '数据为空' },
            { test: () => typeof data === 'object', message: '数据类型错误' },
            { test: () => data.version, message: '缺少版本信息' },
            { test: () => data.hotspots, message: '缺少热区数据' },
            { test: () => Array.isArray(data.hotspots), message: '热区数据不是数组' }
        ];
        
        for (const check of checks) {
            if (!check.test()) {
                this.errors.push({
                    type: 'validation',
                    message: check.message,
                    timestamp: Date.now()
                });
                return false;
            }
        }
        
        // 验证每个热区
        for (let i = 0; i < data.hotspots.length; i++) {
            if (!this.validateHotspot(data.hotspots[i], i)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 验证单个热区（遵循 Phaser 标准）
     */
    validateHotspot(hotspot, index) {
        const required = ['id', 'type', 'x', 'y'];
        
        for (const field of required) {
            if (hotspot[field] === undefined) {
                this.errors.push({
                    type: 'validation',
                    message: `热区 ${index}: 缺少必需字段 "${field}"`,
                    timestamp: Date.now()
                });
                return false;
            }
        }
        
        // 验证数值范围
        if (typeof hotspot.x !== 'number' || typeof hotspot.y !== 'number') {
            this.errors.push({
                type: 'validation',
                message: `热区 ${index}: 坐标必须是数字`,
                timestamp: Date.now()
            });
            return false;
        }
        
        return true;
    }
    
    /**
     * 检查版本兼容性
     */
    checkVersionCompatibility(version) {
        const [major] = version.split('.');
        const [currentMajor] = this.version.split('.');
        
        return major === currentMajor;
    }
    
    /**
     * 检查数据完整性（遵循 Phaser 标准）
     */
    checkDataIntegrity(data) {
        const checks = {
            hasVersion: !!data.version,
            hasHotspots: !!data.hotspots,
            hotspotsIsArray: Array.isArray(data.hotspots),
            hasMetadata: !!data.metadata,
            allHotspotsValid: true
        };
        
        // 检查每个热区的完整性
        if (checks.hotspotsIsArray) {
            for (const hotspot of data.hotspots) {
                if (!this.validateHotspot(hotspot, 0)) {
                    checks.allHotspotsValid = false;
                    break;
                }
            }
        }
        
        const isValid = Object.values(checks).every(v => v === true);
        
        return {
            valid: isValid,
            checks: checks,
            errors: this.errors
        };
    }
    
    /**
     * 下载 JSON 文件（遵循 Phaser 标准）
     */
    downloadJSON(jsonString, filename = 'hotspots.json') {
        try {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log(`✓ 文件已下载: ${filename}`);
            return true;
            
        } catch (error) {
            console.error('❌ 下载失败:', error);
            return false;
        }
    }
    
    /**
     * 从文件读取 JSON（遵循 Phaser 标准）
     */
    readJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const result = this.importJSON(e.target.result);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * 获取错误列表
     */
    getErrors() {
        return this.errors;
    }
    
    /**
     * 清除错误
     */
    clearErrors() {
        this.errors = [];
    }
    
    /**
     * 生成数据报告
     */
    generateReport(data) {
        return {
            version: data.version,
            hotspotCount: data.hotspots?.length || 0,
            metadata: data.metadata,
            integrity: this.checkDataIntegrity(data),
            size: JSON.stringify(data).length,
            timestamp: data.timestamp
        };
    }
}
