@echo off
setlocal

pushd "%~dp0"

echo ===========================================
echo        AKGULARDA STANDALONE DEPLOY
echo ===========================================
echo.

where hugo >nul 2>nul
if errorlevel 1 (
    echo Error: Hugo was not found in PATH.
    echo Install Hugo or add it to PATH, then try again.
    echo.
    pause
    popd
    exit /b 1
)

if not exist "scripts\deploy_godaddy.ps1" (
    echo Error: scripts\deploy_godaddy.ps1 was not found.
    echo.
    pause
    popd
    exit /b 1
)

if not exist "scripts\submit_indexnow.ps1" (
    echo Error: scripts\submit_indexnow.ps1 was not found.
    echo.
    pause
    popd
    exit /b 1
)

echo [1/3] Building site with Hugo...
hugo --cleanDestinationDir
if errorlevel 1 (
    echo.
    echo Build failed. Deployment stopped.
    echo.
    pause
    popd
    exit /b 1
)

echo.
echo [2/3] Uploading changed files to FTP...
powershell -ExecutionPolicy Bypass -File "scripts\deploy_godaddy.ps1"
if errorlevel 1 (
    echo.
    echo FTP deployment failed.
    echo.
    pause
    popd
    exit /b 1
)

echo.
echo [3/3] Submitting updated URLs to IndexNow...
powershell -ExecutionPolicy Bypass -File "scripts\submit_indexnow.ps1"
if errorlevel 1 (
    echo.
    echo IndexNow submission failed.
    echo.
    pause
    popd
    exit /b 1
)

echo.
echo Deployment completed successfully.
echo.
pause

popd
endlocal
