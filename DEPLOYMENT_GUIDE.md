# 배포 가이드 - 환경별 설정

## 📋 개요

이 가이드는 개발 환경과 프로덕션 환경을 분리하여 관리하는 방법을 설명합니다.
- **개발 환경**: 웹과 모바일 모두 접속 가능 (테스트 편의성)
- **프로덕션 환경**: 모바일만 접속 가능 (웹 접속 차단)

## 🔧 환경 변수 설정

### 1. 로컬 개발 환경 (.env)

`.env` 파일은 로컬 개발 시 사용됩니다.

```env
# 플랫폼 체크 비활성화 (웹 접속 허용)
VITE_PLATFORM_CHECK_ENABLED=false
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### 2. 프로덕션 환경 (.env.production)

`.env.production` 파일은 빌드 시 사용됩니다.

```env
# 플랫폼 체크 활성화 (모바일만 허용)
VITE_PLATFORM_CHECK_ENABLED=true
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

## 🚀 Vercel 배포 설정

### 1. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

1. **프로젝트 선택** → **Settings** → **Environment Variables**

2. **필수 환경 변수 추가**:

```bash
# Supabase 설정 (실제 값으로 교체)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 플랫폼 체크 설정 (프로덕션)
VITE_PLATFORM_CHECK_ENABLED=true
VITE_PLATFORM_CHECK_MESSAGE=이 앱은 모바일 기기에서만 이용 가능합니다.

# 앱 환경
VITE_APP_ENV=production
VITE_DEBUG_MODE=false

# 앱 URL
VITE_APP_URL=https://your-app.vercel.app
VITE_APP_PRODUCTION_URL=https://your-app.vercel.app

# AdMob 설정 (실제 ID로 교체)
VITE_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxx
VITE_ADMOB_IOS_APP_ID=ca-app-pub-xxxxx
# ... 기타 AdMob ID들

# RevenueCat 설정 (실제 키로 교체)
VITE_REVENUECAT_ANDROID_KEY=your_key
VITE_REVENUECAT_IOS_KEY=your_key
```

### 2. 환경별 변수 설정

Vercel에서는 환경별로 다른 값을 설정할 수 있습니다:

- **Production**: 실제 서비스용 설정
- **Preview**: PR 미리보기용 설정 (선택사항)
- **Development**: 개발 브랜치용 설정 (선택사항)

Preview 환경에서 테스트를 원한다면:
```bash
# Preview 환경에서만
VITE_PLATFORM_CHECK_ENABLED=false  # 웹 접속 허용
```

## 📱 플랫폼 체크 동작 방식

### 허용된 경로

다음 경로는 웹에서도 접속 가능합니다:
- `/share/*` - 점괘 공유 페이지
- `/reading/*` - 공유된 점괘 보기 페이지

### 차단 화면

웹에서 접속 시 다음과 같은 안내 화면이 표시됩니다:
- 모바일 전용 앱 안내 메시지
- 앱 스토어 다운로드 링크 (추후 연결)
- 디버그 정보 (개발 모드에서만)

## 🧪 테스트 방법

### 1. 로컬 개발 환경

```bash
# 개발 서버 실행 (웹 접속 가능)
npm run dev
```

### 2. 프로덕션 빌드 테스트

```bash
# 프로덕션 빌드
npm run build

# 프리뷰 서버 실행
npm run preview
```

프리뷰 서버에서는 프로덕션 환경 변수가 적용되어 웹 접속이 차단됩니다.

### 3. 임시로 웹 접속 허용

테스트가 필요한 경우 `.env.production` 파일을 임시로 수정:

```env
# 임시로 웹 접속 허용
VITE_PLATFORM_CHECK_ENABLED=false
```

**⚠️ 주의: 테스트 후 반드시 `true`로 되돌려야 합니다!**

## 📝 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env.production` 파일의 플랫폼 체크가 `true`인가?
- [ ] Vercel 환경 변수가 모두 설정되었는가?
- [ ] 공유 페이지는 웹에서 정상 접속되는가?
- [ ] 메인 앱은 웹에서 차단되는가?

## 🔍 트러블슈팅

### 문제: 프로덕션에서도 웹 접속이 가능함

**해결책**:
1. Vercel 환경 변수 확인: `VITE_PLATFORM_CHECK_ENABLED=true`
2. 빌드 로그 확인: 환경 변수가 제대로 적용되었는지 확인
3. 캐시 클리어: Vercel에서 재배포

### 문제: 공유 페이지도 차단됨

**해결책**:
1. `platformCheck.ts`의 `allowedPaths` 배열 확인
2. 공유 페이지 경로가 포함되어 있는지 확인

### 문제: 로컬에서 모바일 테스트가 어려움

**해결책**:
1. ngrok 사용: `ngrok http 8082`
2. 로컬 네트워크 사용: 같은 Wi-Fi에서 IP 주소로 접속

## 📞 지원

문제가 있거나 도움이 필요한 경우:
1. 이슈 생성: GitHub Issues
2. 문서 참고: `/docs` 폴더