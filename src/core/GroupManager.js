// src/core/GroupManager.js
// 分组管理器 - 管理热区的分组、组合移动、组合缩放（遵循 Phaser 3 标准）

export default class GroupManager {
    constructor(scene) {
        this.scene = scene;
        this.groups = new Map();  // 分组集合
        this.nextGroupId = 1;
    }
    
    /**
     * 创建分组
     * @param {Array} hotspots - 热区数组
     * @returns {object} 分组对象
     */
    createGroup(hotspots) {
        if (!hotspots || hotspots.length < 2) {
            console.warn('至少需要 2 个热区才能创建分组');
            return null;
        }
        
        const group = {
            id: this.nextGroupId++,
            name: `分组 ${this.nextGroupId - 1}`,
            hotspots: [...hotspots],
            locked: false
        };
        
        // 标记热区属于该分组
        hotspots.forEach(hotspot => {
            hotspot.groupId = group.id;
        });
        
        this.groups.set(group.id, group);
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('group:created', group);
        
        return group;
    }
    
    /**
     * 解散分组
     * @param {number} groupId - 分组 ID
     */
    ungroupHotspots(groupId) {
        const group = this.groups.get(groupId);
        if (!group) return false;
        
        // 移除热区的分组标记
        group.hotspots.forEach(hotspot => {
            delete hotspot.groupId;
        });
        
        this.groups.delete(groupId);
        
        // 发送事件
        this.scene.events.emit('group:deleted', groupId);
        
        return true;
    }
    
    /**
     * 添加热区到分组
     * @param {object} hotspot - 热区对象
     * @param {number} groupId - 分组 ID
     */
    addToGroup(hotspot, groupId) {
        const group = this.groups.get(groupId);
        if (!group) return;
        
        // 从旧分组移除
        if (hotspot.groupId) {
            this.removeFromGroup(hotspot, hotspot.groupId);
        }
        
        // 添加到新分组
        hotspot.groupId = groupId;
        group.hotspots.push(hotspot);
        
        // 发送事件
        this.scene.events.emit('group:hotspotAdded', { groupId, hotspot });
    }
    
    /**
     * 从分组移除热区
     * @param {object} hotspot - 热区对象
     * @param {number} groupId - 分组 ID
     */
    removeFromGroup(hotspot, groupId) {
        const group = this.groups.get(groupId);
        if (!group) return;
        
        const index = group.hotspots.indexOf(hotspot);
        if (index !== -1) {
            group.hotspots.splice(index, 1);
            delete hotspot.groupId;
        }
        
        // 如果分组只剩 1 个热区，自动解散
        if (group.hotspots.length < 2) {
            this.ungroupHotspots(groupId);
        }
    }
    
    /**
     * 组合移动
     * @param {number} groupId - 分组 ID
     * @param {number} deltaX - X 轴偏移
     * @param {number} deltaY - Y 轴偏移
     */
    moveGroup(groupId, deltaX, deltaY) {
        const group = this.groups.get(groupId);
        if (!group || group.locked) return;
        
        group.hotspots.forEach(hotspot => {
            hotspot.x += deltaX;
            hotspot.y += deltaY;
            hotspot.config.x = hotspot.x;
            hotspot.config.y = hotspot.y;
            
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
    }
    
    /**
     * 组合缩放
     * @param {number} groupId - 分组 ID
     * @param {number} scaleX - X 轴缩放比例
     * @param {number} scaleY - Y 轴缩放比例
     * @param {object} origin - 缩放原点 {x, y}
     */
    scaleGroup(groupId, scaleX, scaleY, origin) {
        const group = this.groups.get(groupId);
        if (!group || group.locked) return;
        
        group.hotspots.forEach(hotspot => {
            // 计算相对于原点的位置
            const relX = hotspot.x - origin.x;
            const relY = hotspot.y - origin.y;
            
            // 缩放位置
            hotspot.x = origin.x + relX * scaleX;
            hotspot.y = origin.y + relY * scaleY;
            hotspot.config.x = hotspot.x;
            hotspot.config.y = hotspot.y;
            
            // 缩放尺寸
            if (hotspot.config.radius) {
                hotspot.config.radius *= Math.max(scaleX, scaleY);
            }
            if (hotspot.config.width) {
                hotspot.config.width *= scaleX;
            }
            if (hotspot.config.height) {
                hotspot.config.height *= scaleY;
            }
            if (hotspot.config.radiusX) {
                hotspot.config.radiusX *= scaleX;
            }
            if (hotspot.config.radiusY) {
                hotspot.config.radiusY *= scaleY;
            }
            
            // 更新视觉
            hotspot.updateVisual();
            
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
    }
    
    /**
     * 锁定/解锁分组
     * @param {number} groupId - 分组 ID
     * @param {boolean} locked - 是否锁定
     */
    setGroupLocked(groupId, locked) {
        const group = this.groups.get(groupId);
        if (!group) return;
        
        group.locked = locked;
        
        // 更新分组内所有热区的交互状态
        group.hotspots.forEach(hotspot => {
            if (locked) {
                hotspot.disableInteractive();
            } else {
                const hitArea = hotspot.getHitArea();
                hotspot.setInteractive(hitArea.shape, hitArea.callback);
            }
        });
        
        // 发送事件
        this.scene.events.emit('group:lockChanged', { groupId, locked });
    }
    
    /**
     * 获取所有分组
     * @returns {Array} 分组数组
     */
    getGroups() {
        return Array.from(this.groups.values());
    }
    
    /**
     * 获取分组
     * @param {number} groupId - 分组 ID
     * @returns {object} 分组对象
     */
    getGroup(groupId) {
        return this.groups.get(groupId);
    }
    
    /**
     * 获取热区所在的分组
     * @param {object} hotspot - 热区对象
     * @returns {object} 分组对象
     */
    getHotspotGroup(hotspot) {
        return this.groups.get(hotspot.groupId);
    }
    
    /**
     * 选中分组内所有热区
     * @param {number} groupId - 分组 ID
     */
    selectGroup(groupId) {
        const group = this.groups.get(groupId);
        if (!group) return;
        
        this.scene.selectionManager.clearSelection();
        group.hotspots.forEach(hotspot => {
            this.scene.selectionManager.select(hotspot, true);
        });
    }
}
