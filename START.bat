@echo off
chcp 65001 >nul
echo ========================================
echo Little Fox Video Editor
echo ========================================
echo.
echo 正在启动本地服务器...
echo.
echo 请在浏览器中访问:
echo http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

python -m http.server 8000
