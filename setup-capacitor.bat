@echo off
echo 🚀 타로의 정원 - Capacitor 설정
echo ================================

cd /d "%~dp0"

echo 📦 의존성 설치 중...
call npm install

echo.
echo 🔧 Capacitor 초기화 중...
call npx cap init "타로의 정원" "com.tarotgarden.app" --web-dir=dist

echo.
echo 📱 Android 플랫폼 추가 중...
call npx cap add android

echo.
echo 🍎 iOS 플랫폼 추가 중...
call npx cap add ios

echo.
echo 🌐 웹 빌드 중...
call npm run web:build

echo.
echo 🔄 Capacitor 동기화 중...
call npx cap sync

echo.
echo ✅ Capacitor 설정 완료!
echo.
echo 다음 명령어로 앱을 실행할 수 있습니다:
echo   npm run cap:run:android  (Android 실행)
echo   npm run cap:run:ios      (iOS 실행)
echo   npm run cap:open:android (Android Studio 열기)
echo   npm run cap:open:ios     (Xcode 열기)

pause
