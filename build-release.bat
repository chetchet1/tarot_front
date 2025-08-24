@echo off
echo ========================================
echo   타로의 정원 릴리즈 빌드 스크립트
echo ========================================
echo.

echo [1/4] 프론트엔드 빌드 중...
call npm run build:cap
if %errorlevel% neq 0 (
    echo 프론트엔드 빌드 실패!
    pause
    exit /b 1
)

echo.
echo [2/4] Capacitor 동기화 중...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Capacitor 동기화 실패!
    pause
    exit /b 1
)

echo.
echo [3/4] 디버그 APK 제거 중...
if exist "android\app\build\outputs\apk\debug\*.apk" (
    del /Q "android\app\build\outputs\apk\debug\*.apk"
    echo 디버그 APK 파일들이 삭제되었습니다.
)

echo.
echo [4/4] Android Studio 열기...
echo.
echo ========================================
echo   !!! 중요 !!! 릴리즈 빌드만 생성하세요 !!!
echo ========================================
echo.
echo   Android Studio에서 수행할 작업:
echo ========================================
echo 1. Build → Generate Signed Bundle / APK 선택
echo 2. ★ Android App Bundle 선택 (APK 아님!)
echo 3. 키스토어 정보 입력:
echo    - Key store path: E:\에 있는 키스토어 선택
echo    - Key store password: 키스토어 비밀번호
echo    - Key alias: 사용하던 alias
echo    - Key password: 키 비밀번호
echo 4. Next 클릭
echo 5. ★ Build Variants: release 선택 (debug 아님!)
echo 6. Signature Versions: V1, V2 모두 체크
echo 7. Finish 클릭
echo.
echo AAB 파일 생성 위치:
echo android\app\build\outputs\bundle\release\app-release.aab
echo.
echo ※ 주의: 디버그 APK는 Google Play에 업로드 불가!
echo ========================================
echo.

call npx cap open android

echo.
echo [5/5] 빌드 완료 대기 중...
echo Android Studio에서 빌드가 완료되면 이 창을 닫으세요.
pause