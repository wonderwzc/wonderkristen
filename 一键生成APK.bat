@echo off
chcp 65001 >nul
echo ============================================
echo   克丽斯腾 - 一键生成 APK 安装包
echo ============================================
echo.

cd /d "%~dp0"

if not exist "package.json" (
    echo [错误] 未找到 package.json，请在「克丽斯腾」项目根目录运行本脚本。
    pause
    exit /b 1
)

echo [1/3] 正在复制网站文件到 www ...
call npm run cap:copy 2>nul
if errorlevel 1 (
    echo [错误] npm run cap:copy 失败，请先执行 npm install。
    pause
    exit /b 1
)

echo.
echo [2/3] 正在同步到 Android 工程 ...
call npx cap sync android 2>nul
if errorlevel 1 (
    echo [错误] cap sync 失败。
    pause
    exit /b 1
)

echo.
echo [3/3] 正在构建 APK（首次可能需 5～15 分钟）...
cd android
call gradlew.bat assembleDebug 2>nul
cd ..
if errorlevel 1 (
    echo [错误] Gradle 构建失败，请确认已安装 Android SDK 并设置 ANDROID_HOME。
    pause
    exit /b 1
)

set APK_SRC=android\app\build\outputs\apk\debug\app-debug.apk
set APK_DEST=克丽斯腾-debug.apk

if exist "%APK_SRC%" (
    echo.
    echo [完成] APK 已生成。
    copy /Y "%APK_SRC%" "%APK_DEST%" >nul 2>&1
    if exist "%APK_DEST%" (
        echo 已复制到当前目录：%APK_DEST%
        echo 可直接将此文件传到手机安装，装好即可使用。
    )
    echo.
    echo 原始位置：%APK_SRC%
    echo.
    explorer "%~dp0"
) else (
    echo [错误] 未找到 app-debug.apk，请检查 android\app\build\outputs\apk\debug\
    pause
    exit /b 1
)

pause
