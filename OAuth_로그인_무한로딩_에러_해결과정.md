# OAuth 로그인 무한로딩 에러 해결과정

## 📋 문제 상황
- **현상**: 관리자 로그인 → 로그아웃 → 구글 로그인 시 무한 로딩
- **환경**: 구글 플레이 배포 앱 (Android AAB)
- **기간**: 2025-08-26 ~ 2025-08-27

## 🔍 근본 원인 분석

### 1차 원인: OAuth 세션 충돌
- 관리자(이메일) 로그인과 구글 OAuth 간 세션 정리 불완전
- 리스너 중복 등록 문제

### 2차 원인: 빌드 설정 오류 (진짜 문제)
- **Capacitor 설정에 Vercel URL 하드코딩**
- AAB 파일이 로컬 빌드가 아닌 Vercel 서버를 보고 있었음
- 아무리 수정해도 앱에 반영되지 않았던 이유

## 🚫 실패한 시도들 (2025-08-26 ~ 08-27)

### OAuth 관련 수정 (효과 없었음 - 빌드가 반영 안 되고 있었기 때문)
1. OAuth 리스너 재등록 로직 추가
2. 세션 재시도 시간 30초로 증가
3. 싱글톤 패턴 적용
4. Deep Link 리스너 최적화
5. 세션 강제 정리 로직 추가
6. signOut scope를 'global'로 변경

### 착각했던 부분
- 코드를 계속 수정했지만 실제로는 **Vercel의 오래된 버전**을 보고 있었음
- 버전 정보 표시 코드를 추가했는데도 안 나타난 것이 힌트였음

## ✅ 실제 해결 과정 (2025-08-27)

### 1. 문제 발견
```typescript
// capacitor.config.ts
server: {
  url: 'https://tarot-app-psi-eight.vercel.app',  // ❌ 이것이 문제!
}
```

### 2. 설정 파일 중복 문제
- `capacitor.config.ts` (기본)
- `capacitor.config.android.ts` (Android 전용) - 불필요한 중복
- `android/assets/capacitor.config.json` (자동 생성)

**문제점**: 
- 두 개의 config 파일이 동기화되지 않음
- 어떤 명령어가 어떤 설정을 사용하는지 불명확

### 3. 해결책
1. **모든 Capacitor 설정에서 URL 제거**
   ```typescript
   server: {
     // url 설정 제거 - 로컬 빌드 사용
     androidScheme: 'https',
     cleartext: true,
   }
   ```

2. **설정 파일 정리**
   - `capacitor.config.android.ts` 삭제
   - `capacitor.config.ts` 하나만 사용
   - package.json 스크립트 단순화

3. **WebView 캐시 비활성화**
   ```java
   // MainActivity.java
   webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
   webView.clearCache(true);
   ```

4. **올바른 동기화**
   ```bash
   npx cap sync  # 이걸 안 해서 Android assets가 업데이트 안 됨
   ```

## 📝 올바른 빌드 프로세스

### 1. 코드 수정 후
```bash
git add -A
git commit -m "메시지"
git push origin dev
```

### 2. 로컬 빌드
```bash
# 캐시 완전 정리
rm -rf dist node_modules/.vite android/app/build android/.gradle

# 빌드
npm run build:cap

# Capacitor 동기화 (중요!)
npx cap sync
```

### 3. Android Studio
1. Build → Clean Project
2. Build → Generate Signed Bundle
3. AAB 선택 → 서명 → Release 빌드

## ⚠️ 주의사항

### Capacitor 설정
- **절대 URL 하드코딩하지 말 것**
- 로컬 빌드는 `webDir: 'dist'`만 설정하면 됨
- `android/assets/capacitor.config.json`은 자동 생성 파일 (직접 수정 X)

### OAuth 설정
- 리다이렉트 URL: `com.tarotgarden.app://auth/mobile-callback`
- Supabase 대시보드에도 동일하게 설정 필요

### 빌드 확인
- 메인화면 우측 하단 버전 정보 확인
- Chrome DevTools (chrome://inspect)로 디버깅

## 📊 교훈

### 1. 빌드 설정이 최우선
- 아무리 코드를 수정해도 빌드가 반영 안 되면 의미 없음
- 버전 정보 같은 간단한 확인 장치 필요

### 2. 설정 파일 단순화
- 플랫폼별 설정이 동일하다면 파일 하나로 통합
- 중복 설정은 혼란만 가중

### 3. 문제 해결 순서
1. 빌드가 제대로 반영되는지 확인
2. 실제 문제 해결
3. 불필요한 복잡성 제거

## 🔧 현재 상태 (2025-08-27)
- ✅ 로컬 빌드 정상 작동
- ✅ 설정 파일 단일화
- ✅ OAuth 로그인 문제 해결 가능한 상태
- ✅ 버전 정보 표시 (v1.0.0 | Build 100)

---

**다음 대화에서 참조**: 이 문서만 보면 전체 상황 파악 가능