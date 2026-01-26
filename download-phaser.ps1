# 下载 Phaser 3 库

Write-Output "正在下载 Phaser 3.60.0..."

$url = "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js"
$output = "lib/phaser.min.js"

# 创建 lib 目录
if (!(Test-Path "lib")) {
    New-Item -ItemType Directory -Path "lib" | Out-Null
}

try {
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Output "✅ Phaser 库下载成功: $output"
    Write-Output "文件大小: $((Get-Item $output).Length / 1KB) KB"
} catch {
    Write-Output "❌ 下载失败: $_"
    Write-Output ""
    Write-Output "请手动下载 Phaser 库："
    Write-Output "1. 访问: https://phaser.io/download/stable"
    Write-Output "2. 下载 phaser.min.js"
    Write-Output "3. 放到 lib/ 目录"
}
