# OAuth 로그인 문제 해결 시도 로그

## 문제 상황
- **현상**: 관리자 로그인 → 로그아웃 → 구글 로그인 시 무한 로딩
- **환경**: 구글 배포 앱 (Android)
- **시작일**: 2025-08-26

## 시도한 해결책들

### 2025-08-26
1. ✅ Vercel URL 수정
2. ✅ Capacitor 서버 URL 설정
3. ✅ 중간 리다이렉트 페이지 구현
4. ✅ OAuth 리스너 재등록 디버깅
5. ✅ 세션 재시도 시간 증가 (30초)

### 2025-08-27
1. ✅ OAuth 리스너 강제 재등록 추가
2. ✅ 로그아웃 시 리스너 정리 로직 추가
3. ✅ OAuth 서비스 싱글톤 패턴 적용 (BUILD 20250827-03)
4. ✅ 메인화면 버전 표시 추가
5. ✅ 로그인 모달 디버깅 정보 추가
6. ✅ Deep Link 리스너 관리 최적화 (BUILD 20250827-06)
7. ✅ Home.vue에 버전 정보 추가
8. ✅ 세션 강제 정리 추가 (BUILD 20250827-07)
9. ✅ **빌드 캐시 문제 해결** (BUILD 20250827-08)
   - 버전 정보 강제 표시 (CSS important 추가)
   - 빌드 설정에 해시 기반 캐시 버스팅 추가
   - Capacitor 설정에 타임스탬프 쿼리 파라미터 추가
   - 빌드 캐시 완전 정리 후 재빌드

## 핵심 발견사항
1. **리스너 중복 문제**: 같은 이벤트 리스너가 여러 번 등록되어 충돌
2. **세션 정리 타이밍**: 로그아웃 직후 바로 로그인하면 세션 정리가 불완전
3. **모바일 특수성**: Capacitor Deep Link 리스너가 제대로 정리되지 않음

## 2025-08-27 최종 수정 (BUILD 20250827-09)

### 주요 변경사항
1. **빌드 캐시 무효화 강화**
   - Vite 빌드 설정에 해시 기반 캐시 버스팅 추가
   - Capacitor URL에 타임스탬프 쿼리 파라미터 추가
   - 버전 정보 CSS에 !important 추가로 강제 표시

2. **OAuth 세션 관리 개선**
   - 관리자 로그인 세션 감지 로직 추가
   - signOut scope를 'global'로 변경
   - 세션 정리 후 500ms 대기 시간 추가
   - prompt를 'consent'로 변경 (항상 새 인증 강제)
   - Browser 리스너 정리 로직 추가

3. **디버깅 정보 강화**
   - Home.vue 버전 정보에 배포 시간 추가
   - LoginModal 디버깅 영역 CSS 강제 표시
   - 빌드 버전 100으로 업데이트

## 다음 확인 사항
- 빌드 후 실제 앱에서 버전 정보가 표시되는지 확인
- 관리자 로그아웃 → 구글 로그인 시퀀스 테스트
- 크롬 개발자 도구에서 로그 확인

## 2025-08-27 최종 문제 해결 (BUILD 20250827-10)

### 🎯 **진짜 문제였던 것**
1. **`capacitor.config.ts` (기본 설정)에도 Vercel URL 하드코딩**
   - `capacitor.config.android.ts`만 수정하고 기본 config는 수정 안 함
   
2. **Android assets의 `capacitor.config.json`이 업데이트 안 됨**
   - 설정 수정 후 `npx cap sync` 실행 안 함
   - Android 프로젝트에 여전히 Vercel URL이 남아있었음

### ✅ **해결 방법**
1. 모든 capacitor config 파일에서 URL 제거
2. MainActivity에 WebView 캐시 비활성화 코드 추가
3. `npx cap sync` 실행하여 Android 프로젝트에 반영

### 📝 **올바른 빌드 순서**
```bash
1. rm -rf dist node_modules/.vite android/app/build
2. npm run build:cap
3. npx cap sync
4. Android Studio에서 Clean Project → AAB 빌드
```