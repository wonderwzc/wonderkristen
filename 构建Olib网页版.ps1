# 将 olib-mobile 源码构建为网页版并复制到站点 olib 目录，保留本站自定义的 olib/index.html
$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$OlibSrc = Join-Path $ProjectRoot "olib-mobile-src\olib-mobile-main"
$OlibDest = Join-Path $ProjectRoot "olib"
$BuildWeb = Join-Path $OlibSrc "build\web"

if (-not (Test-Path $OlibSrc)) {
    Write-Host "错误：未找到 olib 源码目录 $OlibSrc，请先将 olib-mobile-main.zip 解压到 olib-mobile-src 下。" -ForegroundColor Red
    exit 1
}

# 检查 Flutter
$flutter = Get-Command flutter -ErrorAction SilentlyContinue
if (-not $flutter) {
    Write-Host "错误：未找到 Flutter，请先安装并加入 PATH。参见 Olib融合说明.txt" -ForegroundColor Red
    exit 1
}

$indexBackup = Join-Path $ProjectRoot "olib_index_backup.html"
if (Test-Path (Join-Path $OlibDest "index.html")) {
    Copy-Item (Join-Path $OlibDest "index.html") $indexBackup -Force
    Write-Host "已备份 olib/index.html" -ForegroundColor Green
}

Push-Location $OlibSrc
try {
    # 若无 web 目录则先添加 web 平台
    $webDir = Join-Path $OlibSrc "web"
    if (-not (Test-Path $webDir)) {
        Write-Host "为项目添加 web 平台 ..." -ForegroundColor Cyan
        & flutter create --platforms=web .
        if ($LASTEXITCODE -ne 0) { throw "flutter create web 失败" }
    }
    Write-Host "执行 flutter pub get ..." -ForegroundColor Cyan
    & flutter pub get
    if ($LASTEXITCODE -ne 0) { throw "flutter pub get 失败" }
    Write-Host "执行 flutter build web ..." -ForegroundColor Cyan
    & flutter build web
    if ($LASTEXITCODE -ne 0) { throw "flutter build web 失败" }
} finally {
    Pop-Location
}

if (-not (Test-Path $BuildWeb)) {
    Write-Host "错误：构建输出不存在 $BuildWeb" -ForegroundColor Red
    exit 1
}

# 复制 build/web 下除 index.html 外的所有内容到 olib/
Write-Host "复制构建结果到 olib/（保留原 index.html）..." -ForegroundColor Cyan
$items = Get-ChildItem $BuildWeb -Force
foreach ($item in $items) {
    $destPath = Join-Path $OlibDest $item.Name
    if ($item.Name -eq "index.html") { continue }
    if ($item.PSIsContainer) {
        if (Test-Path $destPath) { Remove-Item $destPath -Recurse -Force }
        Copy-Item $item.FullName $destPath -Recurse -Force
    } else {
        Copy-Item $item.FullName $destPath -Force
    }
}

# 恢复本站自定义的 index.html
if (Test-Path $indexBackup) {
    Copy-Item $indexBackup (Join-Path $OlibDest "index.html") -Force
    Remove-Item $indexBackup -Force
    Write-Host "已恢复本站 olib/index.html" -ForegroundColor Green
}

Write-Host "完成。请刷新站点书籍板块验证。" -ForegroundColor Green
