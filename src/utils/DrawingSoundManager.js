// src/utils/DrawingSoundManager.js
// 绘制音效管理器 - 遵循 Phaser 3 官方标准

export default class DrawingSoundManager {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false; // 默认关闭音效
        this.audioContext = null;
        
        // 初始化 Web Audio API
        this.initAudio();
    }
    
    /**
     * 初始化音频
     */
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支持');
        }
    }
    
    /**
     * 播放完成音效
     */
    playCompleteSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 成功音效：上升音调
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(783.99, this.audioContext.currentTime + 0.1); // G5
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    /**
     * 播放取消音效
     */
    playCancelSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 取消音效：下降音调
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(261.63, this.audioContext.currentTime + 0.1); // C4
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    /**
     * 播放点击音效
     */
    playClickSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 点击音效：短促音
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    /**
     * 启用音效
     */
    enable() {
        this.enabled = true;
        console.log('🔊 绘制音效已启用');
    }
    
    /**
     * 禁用音效
     */
    disable() {
        this.enabled = false;
        console.log('🔇 绘制音效已禁用');
    }
    
    /**
     * 切换音效
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`${this.enabled ? '🔊' : '🔇'} 绘制音效: ${this.enabled ? '开启' : '关闭'}`);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}
