// src/data/DataManager.js
// 数据管理器 - 导出/导入 JSON 数据，数据验证

import DataValidator from '../core/DataValidator.js';

export default class DataManager {
    constructor(game, toast) {
        this.game = game;
        this.toast = toast;
        this.setupEvents();
    }
    
    setupEvents() {
        // 监听导入事件
        this.game.events.on('data:import', (data) => {
            this.importData(data);
        });
    }
    
    /**
     * 导出数据
     */
    exportData(scene) {
        const hotspots = scene.registry.get('hotspots');
        
        return {
            version: '1.0',
            createdAt: new Date().toISOString(),
            hotspots: hotspots
        };
    }
    
    /**
     * 导入数据
     */
    importData(data) {
        const scene = this.game.scene.getScene('EditorScene');
        
        try {
            // 显示加载动画
            if (scene && scene.loadingManager) {
                scene.loadingManager.show('正在导入数据...', true);
            }
            
            // 验证数据
            DataValidator.validateImportData(data);
            
            if (!scene) {
                throw new Error('EditorScene not found');
            }
            
            const totalHotspots = data.hotspots.length;
            
            // 清空现有热区
            scene.hotspots.forEach(h => h.destroy());
            scene.hotspots = [];
            
            // 清空历史
            scene.commandManager.clear();
            
            // 导入热区（分批处理，显示进度）
            let imported = 0;
            data.hotspots.forEach((config, index) => {
                scene.addHotspot(config);
                imported++;
                
                // 更新进度
                if (scene.loadingManager) {
                    const progress = (imported / totalHotspots);
                    scene.loadingManager.updateProgress(progress);
                    scene.loadingManager.updateMessage(`正在导入 ${imported}/${totalHotspots}`);
                }
            });
            
            // 清空选择
            scene.selectionManager.clearSelection();
            
            // 隐藏加载动画
            if (scene.loadingManager) {
                scene.loadingManager.hide(() => {
                    if (this.toast) {
                        this.toast.success(`成功导入 ${totalHotspots} 个热区`);
                    }
                });
            } else if (this.toast) {
                this.toast.success(`成功导入 ${totalHotspots} 个热区`);
            }
            
        } catch (error) {
            console.error('Import failed:', error);
            
            // 隐藏加载动画
            if (scene && scene.loadingManager) {
                scene.loadingManager.hide();
            }
            
            if (this.toast) {
                this.toast.error('导入失败：' + error.message);
            }
        }
    }
}
