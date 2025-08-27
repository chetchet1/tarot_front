# 올바른 AAB 빌드 프로세스

## 🚨 중요: 이전 문제점
- capacitor.config.android.ts에서 `url: 'https://tarot-app-psi-eight.vercel.app'`로 설정되어 있어서
- AAB 파일이 로컬 빌드가 아닌 Vercel 서버의 내용을 보여주고 있었음
- 그래서 아무리 로컬 빌드를 해도 앱에 반영되지 않았음

## ✅ 올바른 빌드 순서

### 1. 코드 수정 후 커밋
```bash
git add -A
git commit -m "커밋 메시지"
git push origin dev
```

### 2. 로컬 빌드 (중요!)
```bash
# 캐시 정리
rm -rf dist node_modules/.vite

# 빌드
npm run build:cap
```

### 3. Android 빌드 캐시 정리
```bash
# Android Studio에서:
# Build > Clean Project
# Build > Rebuild Project

# 또는 명령어로:
cd android
./gradlew clean
cd ..
```

### 4. Capacitor 동기화
```bash
npx cap sync android --configuration=production
```

### 5. Android Studio에서 AAB 빌드
1. Android Studio 열기
2. Build > Clean Project
3. Build > Generate Signed Bundle / APK
4. Android App Bundle (AAB) 선택
5. 서명 키 입력
6. Release 빌드 타입 선택
7. 빌드 완료

## 📋 체크리스트
- [ ] capacitor.config.android.ts에 `url` 설정이 없는지 확인 (로컬 빌드용)
- [ ] dist 폴더가 최신 빌드로 업데이트되었는지 확인
- [ ] android/app/src/main/assets/public 폴더가 업데이트되었는지 확인
- [ ] 버전 코드가 증가했는지 확인 (android/version.properties)
- [ ] 빌드 후 APK로 직접 테스트해보기

## 🔍 디버깅 팁
1. **버전 확인**: 앱 실행 후 메인화면 우측 하단의 버전 정보 확인
2. **Chrome DevTools**: chrome://inspect에서 WebView 디버깅
3. **로그 확인**: Android Studio Logcat에서 로그 확인

## ⚠️ OAuth 관련 주의사항
- 로컬 빌드 시 OAuth 리다이렉트 URL이 앱 스킴(com.tarotgarden.app://)을 사용해야 함
- Supabase 대시보드에서 리다이렉트 URL 설정 확인 필요

## 📅 2025-08-27 수정사항
- capacitor.config.android.ts의 `url` 설정 제거 (로컬 빌드 사용)
- OAuth 리다이렉트 URL을 앱 스킴으로 변경
- 빌드 캐시 문제 해결을 위한 해시 기반 파일명 적용