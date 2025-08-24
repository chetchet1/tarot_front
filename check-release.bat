@echo off
echo ========================================
echo   릴리즈 파일 체크 스크립트
echo ========================================
echo.

echo 디버그 APK 확인 중...
echo ------------------------
if exist "android\app\build\outputs\apk\debug\*.apk" (
    echo [경고] 디버그 APK가 발견되었습니다:
    dir /B "android\app\build\outputs\apk\debug\*.apk"
    echo.
    echo ※ 이 파일들은 Google Play에 업로드하면 안 됩니다!
) else (
    echo ✓ 디버그 APK 없음 (좋음)
)

echo.
echo 릴리즈 AAB 확인 중...
echo ------------------------
if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    echo ✓ 릴리즈 AAB 발견:
    dir "android\app\build\outputs\bundle\release\app-release.aab" | findstr aab
    echo.
    echo 이 파일을 Google Play Console에 업로드하세요.
) else (
    echo × 릴리즈 AAB가 없습니다.
    echo Android Studio에서 Generate Signed Bundle을 실행하세요.
)

echo.
echo 릴리즈 APK 확인 중...
echo ------------------------
if exist "android\app\build\outputs\apk\release\*.apk" (
    echo ○ 릴리즈 APK 발견:
    dir /B "android\app\build\outputs\apk\release\*.apk"
    echo.
    echo ※ APK보다는 AAB를 업로드하는 것이 권장됩니다.
) else (
    echo ○ 릴리즈 APK 없음
)

echo.
echo ========================================
echo   업로드 전 체크리스트:
echo ========================================
echo [ ] 버전 코드가 증가했는가? (현재: versionCode 2)
echo [ ] 릴리즈 AAB 파일이 생성되었는가?
echo [ ] 키스토어로 서명되었는가?
echo [ ] 디버그 APK를 실수로 선택하지 않았는가?
echo ========================================
echo.
pause