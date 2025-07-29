@echo off
echo Copying assets to public folder...

:: Create public directory if it doesn't exist
if not exist "public" mkdir "public"

:: Create public/assets directory if it doesn't exist  
if not exist "public\assets" mkdir "public\assets"

:: Copy all files from assets to public/assets
xcopy "assets\*" "public\assets\" /E /I /Y

echo.
echo ✅ Assets copied successfully!
echo.
echo Files are now available at:
echo - public/assets/tarot-cards/major/
echo - public/assets/tarot-cards/minor/
echo.
pause