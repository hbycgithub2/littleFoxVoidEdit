// src/phaser/utils/EnvironmentChecker.js
// 环境检查工具 - 验证Phaser和浏览器兼容性

export default class EnvironmentChecker {
    static check() {
        const results = {
            phaser: this.checkPhaser(),
            canvas: this.checkCanvas(),
            video: this.checkVideo(),
            webgl: this.checkWebGL()
        };
        
        console.log('🔍 环境检查结果:', results);
        return results;
    }
    
    static checkPhaser() {
        const version = typeof Phaser !== 'undefined' ? Phaser.VERSION : null;
        const isValid = version && parseFloat(version) >= 3.55;
        return {
            available: !!version,
            version: version,
            valid: isValid,
            message: isValid ? '✅ Phaser版本符合要求' : '❌ Phaser版本过低或未找到'
        };
    }
    
    static checkCanvas() {
        const canvas = document.createElement('canvas');
        const hasCanvas = !!(canvas.getContext && canvas.getContext('2d'));
        return {
            available: hasCanvas,
            message: hasCanvas ? '✅ Canvas API可用' : '❌ Canvas API不可用'
        };
    }
    
    static checkVideo() {
        const video = document.createElement('video');
        const hasVideo = !!video.canPlayType;
        return {
            available: hasVideo,
            message: hasVideo ? '✅ Video API可用' : '❌ Video API不可用'
        };
    }
    
    static checkWebGL() {
        const canvas = document.createElement('canvas');
        const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        return {
            available: hasWebGL,
            message: hasWebGL ? '✅ WebGL可用' : '⚠️ WebGL不可用（将使用Canvas渲染）'
        };
    }
}
