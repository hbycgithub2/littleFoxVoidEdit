// src/phaser/timeline/ThumbnailConfig.js
// 时间轴缩略图配置 - 遵循Phaser官方配置模式

export default {
    // 功能开关
    enabled: true,                     // 主开关（启用）
    version: 'v3.0',                  // 当前版本
    fallbackToDom: true,              // 降级到DOM实现
    
    // 缩略图尺寸
    thumbnailWidth: 80,
    thumbnailHeight: 60,
    
    // 采样设置
    samplingInterval: 0.5,            // 采样间隔（秒）
    
    // 性能设置（V2.0+）
    maxCacheSize: 50,                 // 最大缓存数量
    poolSize: 20,                     // 对象池大小
    preloadMargin: 200,               // 预加载边距（像素）
    
    // 质量设置
    quality: 0.8,                     // 图片质量（0-1）
    
    // 高级特性（V3.0+）
    useWebWorker: false,              // 使用Web Worker
    enableSmartSampling: false,       // 智能关键帧采样
    enableProgressiveLoad: false,     // 渐进式加载
    
    // 调试选项
    debug: false,                     // 调试模式
    showPerformance: false            // 显示性能信息
};
