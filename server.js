// server.js
// 简单的 Node.js 静态文件服务器

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8001;

// MIME 类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // 解析 URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // 获取文件扩展名
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 检查文件是否存在
    fs.stat(filePath, (error, stat) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
            return;
        }

        // 对于视频文件，支持 Range 请求
        if (extname === '.mp4' || extname === '.webm' || extname === '.ogg') {
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                // 解析 Range 头: "bytes=start-end"
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;

                // 创建读取流
                const stream = fs.createReadStream(filePath, { start, end });

                // 发送 206 Partial Content 响应
                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                });

                stream.pipe(res);
            } else {
                // 没有 Range 请求，发送完整文件
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes',
                });

                fs.createReadStream(filePath).pipe(res);
            }
        } else {
            // 非视频文件，使用原来的方式
            fs.readFile(filePath, (error, content) => {
                if (error) {
                    res.writeHead(500);
                    res.end('Server Error: ' + error.code);
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('Little Fox Video Editor');
    console.log('========================================');
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
    console.log('========================================');
});
