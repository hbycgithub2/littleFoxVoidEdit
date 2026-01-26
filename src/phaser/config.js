// src/phaser/config.js
// Phaser 3 游戏配置（完全遵循官方标准）

import EditorScene from './scenes/EditorScene.js';

export default {
    type: Phaser.AUTO,
    parent: 'phaserContainer',
    width: 800,
    height: 600,
    transparent: true,              // 完全透明（关键！）
    scene: [EditorScene],           // 只使用 EditorScene
    scale: {
        mode: Phaser.Scale.NONE,    // 手动控制尺寸
        autoCenter: Phaser.Scale.NO_CENTER
    },
    input: {
        activePointers: 3,          // 支持多点触控
        windowEvents: false         // 关键！不监听 window 事件，避免拦截视频控制条
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: false
    },
    physics: {
        default: false              // 不需要物理引擎
    },
    backgroundColor: 'transparent'
};
