// src/core/CommandManager.js
// 命令管理器 - 实现撤销/重做功能（命令模式）

/**
 * 命令接口（所有命令必须实现 execute 和 undo）
 */
class Command {
    execute() {
        throw new Error('Command.execute() must be implemented');
    }
    
    undo() {
        throw new Error('Command.undo() must be implemented');
    }
}

/**
 * 添加热区命令
 */
class AddHotspotCommand extends Command {
    constructor(scene, config) {
        super();
        this.scene = scene;
        this.config = { ...config };  // 深拷贝
    }
    
    execute() {
        this.scene.addHotspot(this.config);
    }
    
    undo() {
        this.scene.removeHotspot(this.config.id);
    }
}

/**
 * 删除热区命令
 */
class DeleteHotspotCommand extends Command {
    constructor(scene, hotspotId) {
        super();
        this.scene = scene;
        this.hotspotId = hotspotId;
        
        // 保存热区配置（用于撤销）
        const hotspot = scene.hotspots.find(h => h.config.id === hotspotId);
        this.config = hotspot ? { ...hotspot.config } : null;
    }
    
    execute() {
        this.scene.removeHotspot(this.hotspotId);
    }
    
    undo() {
        if (this.config) {
            this.scene.addHotspot(this.config);
        }
    }
}

/**
 * 移动热区命令
 */
class MoveHotspotCommand extends Command {
    constructor(scene, hotspotId, oldPos, newPos) {
        super();
        this.scene = scene;
        this.hotspotId = hotspotId;
        this.oldPos = { ...oldPos };
        this.newPos = { ...newPos };
    }
    
    execute() {
        this.scene.moveHotspot(this.hotspotId, this.newPos.x, this.newPos.y);
    }
    
    undo() {
        this.scene.moveHotspot(this.hotspotId, this.oldPos.x, this.oldPos.y);
    }
}

/**
 * 缩放热区命令
 */
class ResizeHotspotCommand extends Command {
    constructor(scene, hotspotId, oldSize, newSize, oldPos, newPos) {
        super();
        this.scene = scene;
        this.hotspotId = hotspotId;
        this.oldSize = { ...oldSize };
        this.newSize = { ...newSize };
        this.oldPos = oldPos ? { ...oldPos } : null;
        this.newPos = newPos ? { ...newPos } : null;
    }
    
    execute() {
        this.scene.resizeHotspot(this.hotspotId, this.newSize, this.newPos);
    }
    
    undo() {
        this.scene.resizeHotspot(this.hotspotId, this.oldSize, this.oldPos);
    }
}

/**
 * 修改热区属性命令
 */
class ModifyHotspotCommand extends Command {
    constructor(scene, hotspotId, property, oldValue, newValue) {
        super();
        this.scene = scene;
        this.hotspotId = hotspotId;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    
    execute() {
        const hotspot = this.scene.hotspots.find(h => h.config.id === this.hotspotId);
        if (hotspot) {
            hotspot.config[this.property] = this.newValue;
            hotspot.updateVisual();
            this.scene.syncToRegistry();
        }
    }
    
    undo() {
        const hotspot = this.scene.hotspots.find(h => h.config.id === this.hotspotId);
        if (hotspot) {
            hotspot.config[this.property] = this.oldValue;
            hotspot.updateVisual();
            this.scene.syncToRegistry();
        }
    }
}

/**
 * 粘贴热区命令（批量添加）
 */
class PasteHotspotsCommand extends Command {
    constructor(scene, configs) {
        super();
        this.scene = scene;
        this.configs = configs.map(c => ({ ...c }));  // 深拷贝
        this.addedIds = [];
    }
    
    execute() {
        this.addedIds = [];
        this.configs.forEach(config => {
            this.scene.addHotspot(config);
            this.addedIds.push(config.id);
        });
    }
    
    undo() {
        this.addedIds.forEach(id => {
            this.scene.removeHotspot(id);
        });
    }
}

/**
 * 命令管理器
 */
export default class CommandManager {
    constructor(scene) {
        this.scene = scene;
        this.history = [];
        this.redoStack = [];
        this.maxHistory = 50;  // 限制历史记录数量
    }
    
    /**
     * 执行命令
     */
    execute(command) {
        command.execute();
        this.history.push(command);
        
        // 限制历史记录数量
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        // 清空重做栈
        this.redoStack = [];
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('history:changed', {
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
    }
    
    /**
     * 撤销
     */
    undo() {
        if (!this.canUndo()) return false;
        
        const command = this.history.pop();
        command.undo();
        this.redoStack.push(command);
        
        this.scene.events.emit('history:changed', {
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
        
        return true;
    }
    
    /**
     * 重做
     */
    redo() {
        if (!this.canRedo()) return false;
        
        const command = this.redoStack.pop();
        command.execute();
        this.history.push(command);
        
        this.scene.events.emit('history:changed', {
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
        
        return true;
    }
    
    canUndo() {
        return this.history.length > 0;
    }
    
    canRedo() {
        return this.redoStack.length > 0;
    }
    
    clear() {
        this.history = [];
        this.redoStack = [];
    }
}

// 导出命令类（供外部使用）
export { AddHotspotCommand, DeleteHotspotCommand, MoveHotspotCommand, ResizeHotspotCommand, ModifyHotspotCommand, PasteHotspotsCommand };
