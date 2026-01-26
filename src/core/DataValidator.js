// src/core/DataValidator.js
// 数据验证器 - 验证热区数据的完整性和正确性

export default class DataValidator {
    /**
     * 验证热区配置
     * @param {object} config - 热区配置
     * @param {boolean} autoFix - 是否自动修复错误（默认 false）
     * @returns {object} { valid: boolean, errors: [], fixed: object }
     */
    static validateHotspot(config, autoFix = false) {
        const errors = [];
        const fixed = autoFix ? { ...config } : null;
        
        // 必填字段验证
        const required = ['id', 'shape', 'x', 'y', 'startTime', 'endTime'];
        for (const field of required) {
            if (config[field] === undefined || config[field] === null) {
                errors.push(`Missing required field: ${field}`);
                
                // 自动修复：提供默认值
                if (autoFix && fixed) {
                    if (field === 'id') fixed.id = Date.now();
                    if (field === 'shape') fixed.shape = 'circle';
                    if (field === 'x') fixed.x = 0;
                    if (field === 'y') fixed.y = 0;
                    if (field === 'startTime') fixed.startTime = 0;
                    if (field === 'endTime') fixed.endTime = 5;
                }
            }
        }
        
        // 类型验证
        if (config.id !== undefined && typeof config.id !== 'number') {
            errors.push('id must be a number');
            if (autoFix && fixed) fixed.id = parseInt(config.id) || Date.now();
        }
        
        if (config.shape !== undefined && typeof config.shape !== 'string') {
            errors.push('shape must be a string');
            if (autoFix && fixed) fixed.shape = 'circle';
        }
        
        // 坐标验证（合理范围：-10000 到 10000）
        if (config.x !== undefined) {
            if (typeof config.x !== 'number' || isNaN(config.x)) {
                errors.push('x must be a valid number');
                if (autoFix && fixed) fixed.x = 0;
            } else if (config.x < -10000 || config.x > 10000) {
                errors.push('x must be between -10000 and 10000');
                if (autoFix && fixed) fixed.x = Math.max(-10000, Math.min(10000, config.x));
            }
        }
        
        if (config.y !== undefined) {
            if (typeof config.y !== 'number' || isNaN(config.y)) {
                errors.push('y must be a valid number');
                if (autoFix && fixed) fixed.y = 0;
            } else if (config.y < -10000 || config.y > 10000) {
                errors.push('y must be between -10000 and 10000');
                if (autoFix && fixed) fixed.y = Math.max(-10000, Math.min(10000, config.y));
            }
        }
        
        // 时间验证
        if (config.startTime !== undefined) {
            if (typeof config.startTime !== 'number' || isNaN(config.startTime)) {
                errors.push('startTime must be a valid number');
                if (autoFix && fixed) fixed.startTime = 0;
            } else if (config.startTime < 0) {
                errors.push('startTime must be >= 0');
                if (autoFix && fixed) fixed.startTime = 0;
            }
        }
        
        if (config.endTime !== undefined) {
            if (typeof config.endTime !== 'number' || isNaN(config.endTime)) {
                errors.push('endTime must be a valid number');
                if (autoFix && fixed) fixed.endTime = (config.startTime || 0) + 5;
            } else if (config.endTime <= (config.startTime || 0)) {
                errors.push('endTime must be > startTime');
                if (autoFix && fixed) fixed.endTime = (config.startTime || 0) + 5;
            }
        }
        
        // 形状特定验证
        if (config.shape === 'circle') {
            if (!config.radius || config.radius <= 0) {
                errors.push('Circle hotspot requires radius > 0');
                if (autoFix && fixed) fixed.radius = 50;
            } else if (config.radius > 1000) {
                errors.push('Circle radius must be <= 1000');
                if (autoFix && fixed) fixed.radius = 1000;
            }
        }
        
        if (config.shape === 'rect') {
            if (!config.width || config.width <= 0) {
                errors.push('Rect hotspot requires width > 0');
                if (autoFix && fixed) fixed.width = 100;
            } else if (config.width > 2000) {
                errors.push('Rect width must be <= 2000');
                if (autoFix && fixed) fixed.width = 2000;
            }
            
            if (!config.height || config.height <= 0) {
                errors.push('Rect hotspot requires height > 0');
                if (autoFix && fixed) fixed.height = 100;
            } else if (config.height > 2000) {
                errors.push('Rect height must be <= 2000');
                if (autoFix && fixed) fixed.height = 2000;
            }
        }
        
        if (config.shape === 'ellipse') {
            if (!config.radiusX || config.radiusX <= 0) {
                errors.push('Ellipse hotspot requires radiusX > 0');
                if (autoFix && fixed) fixed.radiusX = 50;
            } else if (config.radiusX > 1000) {
                errors.push('Ellipse radiusX must be <= 1000');
                if (autoFix && fixed) fixed.radiusX = 1000;
            }
            
            if (!config.radiusY || config.radiusY <= 0) {
                errors.push('Ellipse hotspot requires radiusY > 0');
                if (autoFix && fixed) fixed.radiusY = 50;
            } else if (config.radiusY > 1000) {
                errors.push('Ellipse radiusY must be <= 1000');
                if (autoFix && fixed) fixed.radiusY = 1000;
            }
        }
        
        if (config.shape === 'polygon') {
            if (!config.points || !Array.isArray(config.points)) {
                errors.push('Polygon hotspot requires points array');
                if (autoFix && fixed) fixed.points = [{x: 0, y: 0}, {x: 50, y: 0}, {x: 25, y: 50}];
            } else if (config.points.length < 3) {
                errors.push('Polygon hotspot requires at least 3 points');
                if (autoFix && fixed) fixed.points = [{x: 0, y: 0}, {x: 50, y: 0}, {x: 25, y: 50}];
            } else {
                // 验证每个顶点
                config.points.forEach((point, index) => {
                    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
                        errors.push(`Polygon point ${index} must have valid x and y coordinates`);
                    }
                });
            }
        }
        
        // 颜色验证（可选字段）
        if (config.color !== undefined) {
            const colorRegex = /^#[0-9A-Fa-f]{6}$/;
            if (!colorRegex.test(config.color)) {
                errors.push('color must be a valid hex color (e.g., #00ff00)');
                if (autoFix && fixed) fixed.color = '#00ff00';
            }
        }
        
        // 线宽验证（可选字段）
        if (config.strokeWidth !== undefined) {
            if (typeof config.strokeWidth !== 'number' || config.strokeWidth < 1 || config.strokeWidth > 20) {
                errors.push('strokeWidth must be between 1 and 20');
                if (autoFix && fixed) fixed.strokeWidth = 3;
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            fixed: fixed
        };
    }
    
    /**
     * 验证导入数据
     * @param {object} data - 导入的数据
     * @param {boolean} autoFix - 是否自动修复错误
     * @returns {object} { valid: boolean, errors: [], fixed: object }
     */
    static validateImportData(data, autoFix = false) {
        const errors = [];
        const fixed = autoFix ? { ...data, hotspots: [] } : null;
        
        if (!data || typeof data !== 'object') {
            errors.push('Invalid data format: must be an object');
            return { valid: false, errors: errors, fixed: null };
        }
        
        if (!data.hotspots || !Array.isArray(data.hotspots)) {
            errors.push('Invalid data format: missing hotspots array');
            if (autoFix && fixed) fixed.hotspots = [];
            return { valid: false, errors: errors, fixed: fixed };
        }
        
        // 验证每个热区
        data.hotspots.forEach((hotspot, index) => {
            const result = this.validateHotspot(hotspot, autoFix);
            if (!result.valid) {
                errors.push(`Hotspot ${index}: ${result.errors.join(', ')}`);
            }
            if (autoFix && fixed && result.fixed) {
                fixed.hotspots.push(result.fixed);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors: errors,
            fixed: fixed
        };
    }
    
    /**
     * 快速验证（抛出异常）
     * 用于向后兼容
     */
    static validate(config) {
        const result = this.validateHotspot(config, false);
        if (!result.valid) {
            throw new Error(`Hotspot validation failed:\n${result.errors.join('\n')}`);
        }
        return true;
    }
}
