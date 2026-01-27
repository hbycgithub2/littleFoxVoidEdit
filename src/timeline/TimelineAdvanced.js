// src/timeline/TimelineAdvanced.js
// 时间轴高级功能 - 完全遵循 Phaser 3 官方标准
// 功能：缩略图预览、音频波形、虚拟滚动、图层分组

export default class TimelineAdvanced {
    constructor(scene, timeline) {
        this.scene = scene;
        this.timeline = timeline;
        this.thumbnails = [];
        this.waveform = null;
        this.layerGroups = new Map();
        this.virtualScroll = { offset: 0, visibleRange: [0, 100] };
    }
    
    /**
     * 添加缩略图预览（遵循 Phaser 标准）
     */
    addThumbnail(time, texture, width = 60, height = 40) {
        const x = time * this.timeline.config.pixelsPerSecond;
        const y = this.timeline.config.height - height - 5;
        
        const thumbnail = this.scene.add.container(x, y);
        
        // 缩略图图片
        const image = this.scene.add.rectangle(0, 0, width, height, 0x333333);
        thumbnail.add(image);
        
        // 边框
        const border = this.scene.add.graphics();
        border.lineStyle(2, 0x4CAF50);
        border.strokeRect(-width/2, -height/2, width, height);
        thumbnail.add(border);
        
        // 时间标签
        const label = this.scene.add.text(0, height/2 + 10, 
            this.timeline.formatTime(time), {
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 3, y: 2 }
        });
        label.setOrigin(0.5, 0);
        thumbnail.add(label);
        
        // 悬停预览
        image.setInteractive();
        image.on('pointerover', () => {
            border.clear();
            border.lineStyle(3, 0xffff00);
            border.strokeRect(-width/2, -height/2, width, height);
            this.showThumbnailPreview(time, x, y);
        });
        
        image.on('pointerout', () => {
            border.clear();
            border.lineStyle(2, 0x4CAF50);
            border.strokeRect(-width/2, -height/2, width, height);
            this.hideThumbnailPreview();
        });
        
        image.on('pointerdown', () => {
            this.timeline.seekTo(time);
        });
        
        this.timeline.container.add(thumbnail);
        this.thumbnails.push(thumbnail);
        
        return thumbnail;
    }
    
    /**
     * 显示缩略图大预览
     */
    showThumbnailPreview(time, x, y) {
        this.hideThumbnailPreview();
        
        this.thumbnailPreview = this.scene.add.container(x, y - 120);
        this.thumbnailPreview.setDepth(2000);
        
        // 大预览图
        const bg = this.scene.add.rectangle(0, 0, 160, 90, 0x1a1a1a);
        this.thumbnailPreview.add(bg);
        
        const border = this.scene.add.graphics();
        border.lineStyle(3, 0xffff00);
        border.strokeRect(-80, -45, 160, 90);
        this.thumbnailPreview.add(border);
        
        const text = this.scene.add.text(0, 0, 
            `预览: ${this.timeline.formatTime(time)}`, {
            fontSize: '12px',
            color: '#ffff00'
        });
        text.setOrigin(0.5);
        this.thumbnailPreview.add(text);
    }
    
    hideThumbnailPreview() {
        if (this.thumbnailPreview) {
            this.thumbnailPreview.destroy();
            this.thumbnailPreview = null;
        }
    }
    
    /**
     * 创建音频波形（遵循 Phaser 标准）
     */
    createWaveform(audioData, color = 0x4CAF50) {
        if (this.waveform) {
            this.waveform.destroy();
        }
        
        this.waveform = this.scene.add.graphics();
        this.waveform.lineStyle(1, color, 0.6);
        
        const waveHeight = 20;
        const waveY = this.timeline.config.height - 30;
        const samples = audioData.length;
        const step = this.timeline.config.width / samples;
        
        // 绘制波形
        for (let i = 0; i < samples; i++) {
            const x = i * step;
            const amplitude = audioData[i] * waveHeight;
            this.waveform.lineBetween(x, waveY, x, waveY - amplitude);
        }
        
        this.timeline.container.add(this.waveform);
        
        console.log('✓ 音频波形已创建');
    }
    
    /**
     * 生成模拟音频数据
     */
    generateMockAudioData(samples = 800) {
        const data = [];
        for (let i = 0; i < samples; i++) {
            // 模拟音频波形
            const value = Math.abs(Math.sin(i * 0.1) * Math.random());
            data.push(value);
        }
        return data;
    }
    
    /**
     * 创建图层分组（遵循 Phaser 标准）
     */
    createLayerGroup(groupId, name, y, collapsed = false) {
        const group = {
            id: groupId,
            name: name,
            y: y,
            collapsed: collapsed,
            tracks: [],
            container: null
        };
        
        // 创建分组头部
        const header = this.scene.add.container(0, y);
        
        // 背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRect(0, 0, this.timeline.config.width, 25);
        header.add(bg);
        
        // 折叠/展开按钮
        const toggleBtn = this.scene.add.text(10, 12, collapsed ? '▶' : '▼', {
            fontSize: '12px',
            color: '#ffffff'
        });
        toggleBtn.setOrigin(0, 0.5);
        toggleBtn.setInteractive();
        toggleBtn.on('pointerdown', () => {
            this.toggleLayerGroup(groupId);
        });
        header.add(toggleBtn);
        
        // 分组名称
        const nameText = this.scene.add.text(30, 12, name, {
            fontSize: '13px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        nameText.setOrigin(0, 0.5);
        header.add(nameText);
        
        // 轨道数量
        const countText = this.scene.add.text(this.timeline.config.width - 10, 12, 
            `0 轨道`, {
            fontSize: '11px',
            color: '#888888'
        });
        countText.setOrigin(1, 0.5);
        header.add(countText);
        
        group.container = header;
        group.toggleBtn = toggleBtn;
        group.countText = countText;
        
        this.timeline.container.add(header);
        this.layerGroups.set(groupId, group);
        
        return group;
    }
    
    /**
     * 切换图层分组折叠状态
     */
    toggleLayerGroup(groupId) {
        const group = this.layerGroups.get(groupId);
        if (!group) return;
        
        group.collapsed = !group.collapsed;
        group.toggleBtn.setText(group.collapsed ? '▶' : '▼');
        
        // 显示/隐藏轨道
        group.tracks.forEach(track => {
            track.setVisible(!group.collapsed);
        });
        
        console.log(`${group.collapsed ? '折叠' : '展开'} 图层组: ${group.name}`);
    }
    
    /**
     * 添加轨道到分组
     */
    addTrackToGroup(groupId, track) {
        const group = this.layerGroups.get(groupId);
        if (!group) return;
        
        group.tracks.push(track);
        group.countText.setText(`${group.tracks.length} 轨道`);
        
        if (group.collapsed) {
            track.setVisible(false);
        }
    }
    
    /**
     * 虚拟滚动 - 只渲染可见区域（遵循 Phaser 标准）
     */
    enableVirtualScroll(totalItems, itemHeight = 25) {
        this.virtualScroll.totalItems = totalItems;
        this.virtualScroll.itemHeight = itemHeight;
        this.virtualScroll.visibleCount = Math.ceil(
            this.timeline.config.height / itemHeight
        );
        
        console.log(`✓ 虚拟滚动已启用: ${totalItems} 项`);
    }
    
    /**
     * 更新虚拟滚动偏移
     */
    updateVirtualScroll(scrollY) {
        this.virtualScroll.offset = scrollY;
        
        const startIndex = Math.floor(scrollY / this.virtualScroll.itemHeight);
        const endIndex = startIndex + this.virtualScroll.visibleCount;
        
        this.virtualScroll.visibleRange = [startIndex, endIndex];
        
        // 只渲染可见范围内的项目
        this.renderVisibleItems();
    }
    
    /**
     * 渲染可见项目
     */
    renderVisibleItems() {
        const [start, end] = this.virtualScroll.visibleRange;
        
        // 隐藏不可见的轨道
        this.timeline.tracks.forEach((track, index) => {
            const visible = index >= start && index < end;
            track.setVisible(visible);
        });
    }
    
    /**
     * 添加时间范围选择（遵循 Phaser 标准）
     */
    createRangeSelection() {
        this.rangeSelection = {
            start: null,
            end: null,
            graphics: null
        };
        
        let isDragging = false;
        let startX = 0;
        
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.y > this.timeline.config.y + 30 && 
                pointer.y < this.timeline.config.y + this.timeline.config.height) {
                isDragging = true;
                startX = pointer.x - this.timeline.config.x;
                this.rangeSelection.start = startX / this.timeline.config.pixelsPerSecond;
            }
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (isDragging) {
                const endX = pointer.x - this.timeline.config.x;
                this.drawRangeSelection(startX, endX);
            }
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            if (isDragging) {
                isDragging = false;
                const endX = pointer.x - this.timeline.config.x;
                this.rangeSelection.end = endX / this.timeline.config.pixelsPerSecond;
                
                console.log(`✓ 选择范围: ${this.timeline.formatTime(this.rangeSelection.start)} - ${this.timeline.formatTime(this.rangeSelection.end)}`);
            }
        });
    }
    
    /**
     * 绘制范围选择
     */
    drawRangeSelection(startX, endX) {
        if (this.rangeSelection.graphics) {
            this.rangeSelection.graphics.destroy();
        }
        
        this.rangeSelection.graphics = this.scene.add.graphics();
        this.rangeSelection.graphics.fillStyle(0x4CAF50, 0.2);
        this.rangeSelection.graphics.fillRect(
            Math.min(startX, endX),
            30,
            Math.abs(endX - startX),
            this.timeline.config.height - 30
        );
        this.rangeSelection.graphics.setDepth(999);
        
        this.timeline.container.add(this.rangeSelection.graphics);
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.thumbnails.forEach(t => t.destroy());
        if (this.waveform) this.waveform.destroy();
        if (this.thumbnailPreview) this.thumbnailPreview.destroy();
        if (this.rangeSelection.graphics) this.rangeSelection.graphics.destroy();
        this.layerGroups.clear();
    }
}
