@echo off
echo ========================================
echo   빌드 타입별 차이점 확인 스크립트
echo ========================================
echo.

echo [디버그 APK 확인]
if exist "android\app\build\outputs\apk\debug\*.apk" (
    echo 📁 디버그 APK 위치:
    echo    android\app\build\outputs\apk\debug\
    echo.
    echo 📝 파일명:
    dir /B "android\app\build\outputs\apk\debug\*.apk" 2>nul
    echo.
    echo ⚠️  특징:
    echo    - 파일명에 "DEBUG-DO-NOT-UPLOAD" 포함
    echo    - 앱 ID: com.tarotgarden.app.debug
    echo    - Play Store 업로드 불가
) else (
    echo ❌ 디버그 APK 없음
)

echo.
echo ========================================
echo.

echo [릴리즈 AAB 확인]
if exist "android\app\build\outputs\bundle\release\*.aab" (
    echo 📁 릴리즈 AAB 위치:
    echo    android\app\build\outputs\bundle\release\
    echo.
    echo 📝 파일명:
    dir /B "android\app\build\outputs\bundle\release\*.aab" 2>nul
    echo.
    echo ✅ 특징:
    echo    - 앱 ID: com.tarotgarden.app (정상)
    echo    - Play Store 업로드 가능
    echo    - 서명된 정식 버전
) else (
    echo ❌ 릴리즈 AAB 없음
)

echo.
echo ========================================
echo.

echo [현재 설정된 버전 정보]
echo 📌 버전명: 1.0.1
echo 📌 버전코드: 2
echo.

echo 💡 Android Studio에서 빌드 타입 변경:
echo    Build → Select Build Variant → debug/release 선택
echo.

pause