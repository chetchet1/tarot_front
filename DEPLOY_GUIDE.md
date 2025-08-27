# 타로가든 앱 배포 가이드

## 1. 배포 전 체크리스트
- [ ] 디버그 로거 비활성화 (`debugLogger.ts`: isDebugMode = false)
- [ ] 콘솔 로그 제거 (`vite.config.ts`: drop_console = true)
- [ ] 버전 번호 업데이트
- [ ] 테스트 계정 확인

## 2. 서명 키 설정

### 2.1 키스토어 생성 (최초 1회)
```bash
keytool -genkey -v -keystore tarotgarden-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

### 2.2 keystore.properties 파일 수정
```
storePassword=실제_비밀번호
keyPassword=실제_비밀번호
keyAlias=upload
storeFile=../tarotgarden-keystore.jks
```

## 3. 빌드 프로세스

### 3.1 프론트엔드 빌드
```bash
npm run build
npx cap sync android
```

### 3.2 AAB 생성
```bash
cd android
./gradlew bundleRelease
```

### 3.3 결과물 위치
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 4. Google Play Console 업로드

1. https://play.google.com/console 접속
2. 내부 테스트 → 새 버전 만들기
3. app-release.aab 업로드
4. 버전 정보 입력
5. 검토 후 출시

## 5. 주의사항

⚠️ **절대 하지 말아야 할 것:**
- 디버그 APK를 프로덕션에 업로드
- keystore.properties를 GitHub에 커밋
- 테스트 코드가 포함된 상태로 배포

## 6. 배포 후 확인

- [ ] 앱 정상 설치 확인
- [ ] OAuth 로그인 테스트
- [ ] 광고 표시 확인 (무료 사용자)
- [ ] 구독 결제 테스트 (프리미엄)