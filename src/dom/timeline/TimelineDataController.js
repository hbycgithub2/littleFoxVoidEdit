// src/dom/timeline/TimelineDataController.js
// 时间轴数据控制器 - 管理时间轴数据的导出和导入

/**
 * 时间轴数据控制器
 * 职责：
 * 1. 收集时间轴所有数据
 * 2. 导出为 JSON 格式
 * 3. 导入 JSON 数据
 * 4. 数据验证和转换
 * 5. 下载/上传文件
 */
export default class TimelineDataController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 数据版本
        this.version = '1.0.0';
    }
    
    /**
     * 导出完整时间轴数据
     * @returns {object} 时间轴数据
     */
    exportData() {
        const data = {
            version: this.version,
            exportTime: new Date().toISOString(),
            
            // 视频信息
            video: {
                duration: this.timeline.videoDuration,
                currentTime: this.timeline.currentTime
            },
            
            // 时间轴设置
            timeline: {
                scale: this.timeline.scale,
                scrollY: this.timeline.virtualScrollController?.scrollY || 0
            },
            
            // 热区数据
            hotspots: this.exportHotspots(),
            
            // 图层数据
            layers: this.exportLayers(),
            
            // 标记数据
            markers: this.exportMarkers(),
            
            // 时间区域
            range: this.exportRange(),
            
            // 入点/出点
            inOutPoints: this.exportInOutPoints()
        };
        
        // 发送事件
        this.scene.events.emit('timeline:data:exported', { data });
        
        return data;
    }
    
    /**
     * 导出热区数据
     * @returns {Array} 热区数组
     */
    exportHotspots() {
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        return hotspots.map(config => ({
            id: config.id,
            shape: config.shape,
            layerId: config.layerId,
            startTime: config.startTime,
            endTime: config.endTime,
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            radius: config.radius,
            points: config.points,
            word: config.word,
            strokeColor: config.strokeColor,
            fillColor: config.fillColor,
            strokeWidth: config.strokeWidth,
            visible: config.visible,
            locked: config.locked,
            metadata: config.metadata || {}
        }));
    }
    
    /**
     * 导出图层数据
     * @returns {Array} 图层数组
     */
    exportLayers() {
        const layers = this.scene.layerManager.getLayers();
        
        return layers.map(layer => ({
            id: layer.id,
            name: layer.name,
            visible: layer.visible,
            locked: layer.locked,
            collapsed: this.timeline.layerGroupController?.isLayerCollapsed(layer.id) || false
        }));
    }
    
    /**
     * 导出标记数据
     * @returns {Array} 标记数组
     */
    exportMarkers() {
        if (!this.timeline.markerController) return [];
        
        return this.timeline.markerController.markers.map(marker => ({
            id: marker.id,
            time: marker.time,
            label: marker.label,
            color: marker.color,
            type: marker.type
        }));
    }
    
    /**
     * 导出时间区域
     * @returns {object|null} 时间区域
     */
    exportRange() {
        if (!this.timeline.rangeController) return null;
        
        const range = this.timeline.rangeController.getRange();
        if (!range) return null;
        
        return {
            start: range.start,
            end: range.end,
            duration: range.duration,
            isLooping: this.timeline.rangeController.isLooping
        };
    }
    
    /**
     * 导出入点/出点
     * @returns {object} 入点/出点
     */
    exportInOutPoints() {
        if (!this.timeline.keyboardController) return { inPoint: null, outPoint: null };
        
        return {
            inPoint: this.timeline.keyboardController.inPoint,
            outPoint: this.timeline.keyboardController.outPoint
        };
    }
    
    /**
     * 导入时间轴数据
     * @param {object} data - 时间轴数据
     * @param {object} options - 导入选项
     * @returns {boolean} 是否成功
     */
    importData(data, options = {}) {
        try {
            // 验证数据
            if (!this.validateData(data)) {
                throw new Error('数据格式无效');
            }
            
            const {
                clearExisting = true,
                importHotspots = true,
                importLayers = true,
                importMarkers = true,
                importRange = true,
                importInOutPoints = true
            } = options;
            
            // 清除现有数据
            if (clearExisting) {
                this.clearAllData();
            }
            
            // 导入图层（必须先导入图层）
            if (importLayers && data.layers) {
                this.importLayers(data.layers);
            }
            
            // 导入热区
            if (importHotspots && data.hotspots) {
                this.importHotspots(data.hotspots);
            }
            
            // 导入标记
            if (importMarkers && data.markers) {
                this.importMarkers(data.markers);
            }
            
            // 导入时间区域
            if (importRange && data.range) {
                this.importRange(data.range);
            }
            
            // 导入入点/出点
            if (importInOutPoints && data.inOutPoints) {
                this.importInOutPoints(data.inOutPoints);
            }
            
            // 恢复时间轴设置
            if (data.timeline) {
                this.timeline.scale = data.timeline.scale || 10;
                if (this.timeline.virtualScrollController && data.timeline.scrollY !== undefined) {
                    this.timeline.virtualScrollController.scrollY = data.timeline.scrollY;
                }
            }
            
            // 刷新显示
            this.timeline.render();
            
            // 发送事件
            this.scene.events.emit('timeline:data:imported', { data, options });
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            this.scene.events.emit('timeline:data:importError', { error: error.message });
            return false;
        }
    }
    
    /**
     * 验证数据格式
     * @param {object} data - 数据对象
     * @returns {boolean} 是否有效
     */
    validateData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.version) return false;
        
        // 检查必需字段
        if (data.hotspots && !Array.isArray(data.hotspots)) return false;
        if (data.layers && !Array.isArray(data.layers)) return false;
        if (data.markers && !Array.isArray(data.markers)) return false;
        
        return true;
    }
    
    /**
     * 清除所有数据
     */
    clearAllData() {
        // 清除热区
        const hotspots = [...this.scene.hotspots];
        hotspots.forEach(hotspot => hotspot.destroy());
        this.scene.registry.set('hotspots', []);
        
        // 清除标记
        if (this.timeline.markerController) {
            this.timeline.markerController.clearAllMarkers();
        }
        
        // 清除时间区域
        if (this.timeline.rangeController) {
            this.timeline.rangeController.clearRange();
        }
        
        // 清除入点/出点
        if (this.timeline.keyboardController) {
            this.timeline.keyboardController.inPoint = null;
            this.timeline.keyboardController.outPoint = null;
        }
    }
    
    /**
     * 导入图层数据
     * @param {Array} layers - 图层数组
     */
    importLayers(layers) {
        layers.forEach(layerData => {
            // 检查图层是否存在
            let layer = this.scene.layerManager.getLayer(layerData.id);
            
            if (!layer) {
                // 创建新图层
                layer = this.scene.layerManager.addLayer(layerData.name);
            }
            
            // 更新图层属性
            layer.visible = layerData.visible !== false;
            layer.locked = layerData.locked || false;
            
            // 恢复折叠状态
            if (this.timeline.layerGroupController && layerData.collapsed) {
                this.timeline.layerGroupController.collapsedLayers.set(layer.id, true);
            }
        });
    }
    
    /**
     * 导入热区数据
     * @param {Array} hotspots - 热区数组
     */
    importHotspots(hotspots) {
        hotspots.forEach(config => {
            // 确保图层存在
            let layer = this.scene.layerManager.getLayer(config.layerId);
            if (!layer) {
                layer = this.scene.layerManager.addLayer(`Layer ${config.layerId}`);
            }
            
            // 创建热区
            this.scene.createHotspot(config);
        });
    }
    
    /**
     * 导入标记数据
     * @param {Array} markers - 标记数组
     */
    importMarkers(markers) {
        if (!this.timeline.markerController) return;
        
        markers.forEach(markerData => {
            this.timeline.markerController.addMarker(
                markerData.time,
                markerData.label,
                markerData.type
            );
        });
    }
    
    /**
     * 导入时间区域
     * @param {object} range - 时间区域
     */
    importRange(range) {
        if (!this.timeline.rangeController) return;
        
        this.timeline.rangeController.setRange(range.start, range.end);
        
        if (range.isLooping) {
            this.timeline.rangeController.startLoop();
        }
    }
    
    /**
     * 导入入点/出点
     * @param {object} inOutPoints - 入点/出点
     */
    importInOutPoints(inOutPoints) {
        if (!this.timeline.keyboardController) return;
        
        if (inOutPoints.inPoint !== null) {
            this.timeline.keyboardController.inPoint = inOutPoints.inPoint;
        }
        
        if (inOutPoints.outPoint !== null) {
            this.timeline.keyboardController.outPoint = inOutPoints.outPoint;
        }
    }
    
    /**
     * 下载 JSON 文件
     * @param {string} filename - 文件名（可选）
     */
    downloadJSON(filename = null) {
        const data = this.exportData();
        const json = JSON.stringify(data, null, 2);
        
        // 生成文件名
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            filename = `timeline_${timestamp}.json`;
        }
        
        // 创建下载链接
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        // 发送事件
        this.scene.events.emit('timeline:data:downloaded', { filename, size: json.length });
    }
    
    /**
     * 上传 JSON 文件
     * @param {File} file - 文件对象
     * @param {object} options - 导入选项
     * @returns {Promise<boolean>} 是否成功
     */
    async uploadJSON(file, options = {}) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const success = this.importData(data, options);
            
            if (success) {
                this.scene.events.emit('timeline:data:uploaded', { 
                    filename: file.name, 
                    size: file.size 
                });
            }
            
            return success;
        } catch (error) {
            console.error('上传文件失败:', error);
            this.scene.events.emit('timeline:data:uploadError', { 
                error: error.message,
                filename: file.name
            });
            return false;
        }
    }
    
    /**
     * 显示文件选择对话框
     * @param {object} options - 导入选项
     */
    showFileDialog(options = {}) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const success = await this.uploadJSON(file, options);
                if (success) {
                    console.log('数据导入成功');
                } else {
                    console.error('数据导入失败');
                }
            }
        };
        
        input.click();
    }
    
    /**
     * 导出为 CSV 格式（热区数据）
     * @returns {string} CSV 字符串
     */
    exportCSV() {
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        // CSV 表头
        const headers = [
            'ID', 'Shape', 'Layer', 'Start Time', 'End Time', 'Duration',
            'X', 'Y', 'Width', 'Height', 'Word', 'Visible', 'Locked'
        ];
        
        // CSV 数据行
        const rows = hotspots.map(config => [
            config.id,
            config.shape,
            config.layerId,
            config.startTime.toFixed(2),
            config.endTime.toFixed(2),
            (config.endTime - config.startTime).toFixed(2),
            config.x || '',
            config.y || '',
            config.width || '',
            config.height || '',
            config.word || '',
            config.visible !== false ? 'Yes' : 'No',
            config.locked ? 'Yes' : 'No'
        ]);
        
        // 组合 CSV
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csv;
    }
    
    /**
     * 下载 CSV 文件
     * @param {string} filename - 文件名（可选）
     */
    downloadCSV(filename = null) {
        const csv = this.exportCSV();
        
        // 生成文件名
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            filename = `timeline_${timestamp}.csv`;
        }
        
        // 创建下载链接
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        // 发送事件
        this.scene.events.emit('timeline:data:csvDownloaded', { filename, size: csv.length });
    }
    
    /**
     * 获取数据统计信息
     * @returns {object} 统计信息
     */
    getStats() {
        const hotspots = this.scene.registry.get('hotspots') || [];
        const layers = this.scene.layerManager.getLayers();
        const markers = this.timeline.markerController?.markers || [];
        
        return {
            hotspotCount: hotspots.length,
            layerCount: layers.length,
            markerCount: markers.length,
            totalDuration: this.timeline.videoDuration,
            hasRange: this.timeline.rangeController?.getRange() !== null,
            hasInPoint: this.timeline.keyboardController?.inPoint !== null,
            hasOutPoint: this.timeline.keyboardController?.outPoint !== null
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        console.log('TimelineDataController destroyed');
    }
}
