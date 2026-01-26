// src/dom/timeline/TimelineMenuHandler.js
// 时间轴菜单处理器 - 管理时间轴的右键菜单

/**
 * 时间轴菜单处理器
 * 职责：
 * 1. 处理右键菜单显示
 * 2. 生成不同场景的菜单项
 * 3. 处理菜单操作
 */
export default class TimelineMenuHandler {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
    }
    
    /**
     * 显示时间区域右键菜单
     * @param {number} clientX - 鼠标 X 坐标
     * @param {number} clientY - 鼠标 Y 坐标
     */
    showRangeMenu(clientX, clientY) {
        const range = this.timeline.rangeController.getRange();
        if (!range) return;
        
        const hotspotCount = this.timeline.rangeController.getHotspotCountInRange();
        
        const menuItems = [
            {
                label: `循环播放 (L)`,
                icon: this.timeline.rangeController.isLooping ? '⏸️' : '▶️',
                action: () => this.timeline.rangeController.toggleLoop()
            },
            {
                label: '跳转到开始',
                icon: '⏮️',
                action: () => this.timeline.rangeController.seekToRangeStart()
            },
            {
                label: '跳转到结束',
                icon: '⏭️',
                action: () => this.timeline.rangeController.seekToRangeEnd()
            },
            { type: 'separator' },
            {
                label: '导出区域数据',
                icon: '💾',
                action: () => this.exportRangeData()
            },
            {
                label: `删除区域内热区 (${hotspotCount}个)`,
                icon: '🗑️',
                disabled: hotspotCount === 0,
                action: () => this.deleteHotspotsInRange(hotspotCount)
            },
            { type: 'separator' },
            {
                label: '清除区域选择 (Esc)',
                icon: '❌',
                action: () => this.timeline.rangeController.clearRange()
            }
        ];
        
        this.timeline.contextMenu.showCustomMenu(clientX, clientY, menuItems);
    }
    
    /**
     * 显示空白区域右键菜单
     * @param {number} clientX - 鼠标 X 坐标
     * @param {number} clientY - 鼠标 Y 坐标
     */
    showBlankMenu(clientX, clientY) {
        const stats = this.timeline.dataController.getStats();
        
        const menuItems = [
            {
                label: '导出时间轴数据',
                icon: '💾',
                children: [
                    {
                        label: '导出为 JSON',
                        action: () => this.timeline.dataController.downloadJSON()
                    },
                    {
                        label: '导出为 CSV',
                        action: () => this.timeline.dataController.downloadCSV()
                    }
                ]
            },
            {
                label: '导入时间轴数据',
                icon: '📂',
                action: () => this.timeline.dataController.showFileDialog()
            },
            { type: 'separator' },
            {
                label: '音频波形',
                icon: '🎵',
                children: this.getWaveformMenuItems()
            },
            {
                label: '视频帧预览',
                icon: '🎬',
                children: this.getFramePreviewMenuItems()
            },
            { type: 'separator' },
            {
                label: '数据统计',
                icon: 'ℹ️',
                action: () => this.showStats(stats)
            }
        ];
        
        this.timeline.contextMenu.showCustomMenu(clientX, clientY, menuItems);
    }
    
    /**
     * 获取波形菜单项
     * @returns {Array} 菜单项数组
     */
    getWaveformMenuItems() {
        const items = [];
        
        if (this.timeline.waveformController.enabled) {
            items.push({
                label: '隐藏波形',
                action: () => this.timeline.waveformController.setEnabled(false)
            });
            items.push({
                label: '清除波形数据',
                action: () => {
                    if (confirm('确定要清除波形数据吗？')) {
                        this.timeline.waveformController.clearWaveform();
                    }
                }
            });
            items.push({
                label: '导出波形数据',
                action: () => this.exportWaveformData()
            });
        } else {
            items.push({
                label: '显示波形',
                disabled: !this.timeline.waveformController.waveformRenderer.waveformData,
                action: () => this.timeline.waveformController.setEnabled(true)
            });
            items.push({
                label: '加载音频文件',
                action: () => this.loadAudioFile()
            });
            items.push({
                label: '从视频提取音频',
                action: () => this.extractAudioFromVideo()
            });
        }
        
        return items;
    }
    
    /**
     * 获取帧预览菜单项
     * @returns {Array} 菜单项数组
     */
    getFramePreviewMenuItems() {
        const items = [];
        
        if (this.timeline.framePreviewController.enabled) {
            items.push({
                label: '禁用帧预览',
                action: () => this.timeline.framePreviewController.setEnabled(false)
            });
        } else {
            items.push({
                label: '启用帧预览',
                action: () => this.timeline.framePreviewController.setEnabled(true)
            });
        }
        
        items.push({
            label: '清除帧缓存',
            action: () => {
                this.timeline.framePreviewController.clearCache();
                alert('帧缓存已清除');
            }
        });
        
        items.push({
            label: '预加载可见区域',
            action: () => this.preloadVisibleFrames()
        });
        
        items.push({
            label: '缓存统计',
            action: () => this.showFrameCacheStats()
        });
        
        return items;
    }
    
    /**
     * 预加载可见区域的帧
     */
    async preloadVisibleFrames() {
        const duration = this.timeline.videoDuration;
        const visibleDuration = this.timeline.canvas.width / this.timeline.scale;
        const endTime = Math.min(duration, visibleDuration);
        
        alert('开始预加载帧，请稍候...');
        
        await this.timeline.framePreviewController.preloadFrames(0, endTime, 1);
        
        alert('预加载完成！');
    }
    
    /**
     * 显示帧缓存统计
     */
    showFrameCacheStats() {
        const stats = this.timeline.framePreviewController.getCacheStats();
        const info = [
            `缓存帧数: ${stats.size}/${stats.maxSize}`,
            `缓存间隔: ${stats.cacheInterval}秒`,
            `预览尺寸: ${this.timeline.framePreviewController.previewWidth}x${this.timeline.framePreviewController.previewHeight}`
        ].join('\n');
        alert(info);
    }
    
    /**
     * 导出区域数据
     */
    exportRangeData() {
        const data = this.timeline.rangeController.exportRange();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `range_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * 删除区域内热区
     * @param {number} count - 热区数量
     */
    deleteHotspotsInRange(count) {
        if (confirm(`确定要删除区域内的 ${count} 个热区吗？`)) {
            this.timeline.rangeController.deleteHotspotsInRange();
        }
    }
    
    /**
     * 显示统计信息
     * @param {object} stats - 统计数据
     */
    showStats(stats) {
        const info = [
            `热区数量: ${stats.hotspotCount}`,
            `图层数量: ${stats.layerCount}`,
            `标记数量: ${stats.markerCount}`,
            `视频时长: ${stats.totalDuration.toFixed(2)}s`,
            `时间区域: ${stats.hasRange ? '已设置' : '未设置'}`,
            `入点: ${stats.hasInPoint ? '已设置' : '未设置'}`,
            `出点: ${stats.hasOutPoint ? '已设置' : '未设置'}`
        ].join('\n');
        alert(info);
    }
    
    /**
     * 加载音频文件
     */
    loadAudioFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*,video/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                await this.timeline.waveformController.loadFromArrayBuffer(arrayBuffer);
            }
        };
        
        input.click();
    }
    
    /**
     * 从视频提取音频
     */
    extractAudioFromVideo() {
        alert('从视频提取音频功能需要视频 URL。\n请在加载视频时自动提取音频，或手动上传音频文件。');
    }
    
    /**
     * 导出波形数据
     */
    exportWaveformData() {
        const data = this.timeline.waveformController.exportData();
        if (!data) {
            alert('没有波形数据可导出');
            return;
        }
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waveform_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        console.log('TimelineMenuHandler destroyed');
    }
}
