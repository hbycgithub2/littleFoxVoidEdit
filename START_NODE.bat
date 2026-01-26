@echo off
chcp 65001 >nul
echo ========================================
echo Little Fox Video Editor (Node.js)
echo ========================================
echo.
echo 正在启动 Node.js 服务器...
echo.
echo 请在浏览器中访问:
echo http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

node server.js
