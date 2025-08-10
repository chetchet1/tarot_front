@echo off
echo Clearing npm cache and rebuilding...

REM Clear node_modules cache
echo Clearing node_modules...
rd /s /q node_modules\.vite 2>nul

REM Clear dist folder
echo Clearing dist...
rd /s /q dist 2>nul

REM Clear browser cache hint
echo.
echo ========================================
echo Please clear browser cache:
echo Chrome: Ctrl+Shift+Delete or F12 > Network > Disable cache
echo ========================================
echo.

REM Start dev server
echo Starting dev server...
npm run dev
