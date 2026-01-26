// src/utils/DirtyFlag.js
// 脏标记系统 - 性能优化（遵循 Phaser 3 标准）

/**
 * 脏标记管理器
 * 用于优化渲染，只在数据变化时重绘
 */
export default class DirtyFlag {
    constructor() {
        this.flags = new Map();
    }
    
    /**
     * 标记为脏
     * @param {string} key - 标记键
     */
    markDirty(key) {
        this.flags.set(key, true);
    }
    
    /**
     * 检查是否为脏
     * @param {string} key - 标记键
     * @returns {boolean}
     */
    isDirty(key) {
        return this.flags.get(key) === true;
    }
    
    /**
     * 清除脏标记
     * @param {string} key - 标记键
     */
    clean(key) {
        this.flags.set(key, false);
    }
    
    /**
     * 清除所有脏标记
     */
    cleanAll() {
        this.flags.clear();
    }
    
    /**
     * 获取所有脏标记的键
     * @returns {string[]}
     */
    getDirtyKeys() {
        const dirtyKeys = [];
        this.flags.forEach((value, key) => {
            if (value === true) {
                dirtyKeys.push(key);
            }
        });
        return dirtyKeys;
    }
}
