# 🔮 타로의 정원 - Capacitor 모바일 앱

Vue.js 웹앱을 Capacitor로 네이티브 모바일 앱으로 변환한 프로젝트입니다.

## 🚀 빠른 시작

### 1. 의존성 설치 및 Capacitor 설정
```bash
# Windows
setup-capacitor.bat

# Linux/Mac
./setup-capacitor.sh
```

### 2. 수동 설정 (단계별)
```bash
# 의존성 설치
npm install

# Capacitor 초기화
npx cap init "타로의 정원" "com.tarotgarden.app" --web-dir=dist

# 플랫폼 추가
npx cap add android
npx cap add ios

# 웹 빌드
npm run web:build

# 네이티브 동기화
npx cap sync
```

## 📱 개발 및 실행

### 웹 개발
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run web:build
```

### 모바일 앱 실행
```bash
# Android 실행
npm run cap:run:android

# iOS 실행 (macOS만 가능)
npm run cap:run:ios

# Android Studio 열기
npm run cap:open:android

# Xcode 열기 (macOS만 가능)
npm run cap:open:ios
```

### 변경사항 동기화
```bash
# 웹 빌드 후 네이티브 동기화
npm run cap:sync
```

## 🛠️ 개발 환경 요구사항

### 공통
- Node.js 18+
- npm 또는 yarn

### Android
- Android Studio
- Android SDK (API 24+)
- Java 11+

### iOS (macOS만)
- Xcode 14+
- iOS 13+
- CocoaPods

## 📁 프로젝트 구조

```
frontend/
├── app/                    # Vue.js 웹앱 소스
│   ├── components/         # Vue 컴포넌트
│   ├── views/             # 페이지 컴포넌트
│   ├── store/             # Pinia 상태관리
│   ├── utils/             # 유틸리티
│   │   ├── platformWeb.ts # 웹 플랫폼 유틸
│   │   └── capacitor.ts   # Capacitor 네이티브 기능
│   └── styles/            # 스타일시트
├── dist/                  # 빌드된 웹앱 (Capacitor 읽기용)
├── android/               # Android 네이티브 프로젝트
├── ios/                   # iOS 네이티브 프로젝트
├── capacitor.config.ts    # Capacitor 설정
└── vite.config.ts         # Vite 빌드 설정
```

## 🔧 네이티브 기능

### 현재 구현된 기능
- **햅틱 피드백**: 카드 뽑기, 버튼 클릭시 진동
- **상태바 스타일**: 다크 테마에 맞는 상태바
- **키보드 관리**: 키보드 숨기기 기능
- **스플래시 스크린**: 앱 시작시 로딩 화면

### 사용 예시
```typescript
import { nativeUtils } from './utils/capacitor';

// 햅틱 피드백
await nativeUtils.cardDrawHaptic();    // 카드 뽑기
await nativeUtils.buttonTapHaptic();   // 버튼 클릭
await nativeUtils.importantActionHaptic(); // 중요한 액션

// 키보드 숨기기
await nativeUtils.hideKeyboard();
```

## 📋 주요 NPM 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 웹 개발 서버 실행 |
| `npm run web:build` | 웹앱 빌드 |
| `npm run cap:sync` | 웹 빌드 + 네이티브 동기화 |
| `npm run cap:run:android` | Android 앱 실행 |
| `npm run cap:run:ios` | iOS 앱 실행 |
| `npm run cap:open:android` | Android Studio 열기 |
| `npm run cap:open:ios` | Xcode 열기 |

## 🔄 개발 워크플로우

1. **웹에서 개발**: `npm run dev`로 웹 브라우저에서 개발
2. **네이티브 테스트**: 변경사항을 `npm run cap:sync`로 동기화
3. **모바일 실행**: `npm run cap:run:android` 또는 `cap:run:ios`로 실기기 테스트

## 🏪 배포

### Android (Google Play Store)
```bash
# AAB 파일 생성
npm run web:build
npx cap sync android
npx cap run android --prod
# Android Studio에서 Build > Generate Signed Bundle/APK
```

### iOS (App Store)
```bash
# iOS 앱 빌드
npm run web:build
npx cap sync ios
npx cap run ios --prod
# Xcode에서 Archive > Distribute App
```

### PWA (웹)
```bash
# 웹 빌드
npm run web:build
# dist 폴더를 웹 서버에 배포
```

## 🆘 문제 해결

### 공통 문제
- **빌드 실패**: `npm run clean` 후 재시도
- **네이티브 동기화 문제**: `npx cap sync --force`

### Android 문제
- **SDK 경로 문제**: Android Studio에서 SDK 경로 확인
- **Gradle 오류**: `cd android && ./gradlew clean`

### iOS 문제
- **CocoaPods 오류**: `cd ios && pod install --repo-update`
- **서명 문제**: Xcode에서 개발자 계정 설정

## 📱 테스트된 환경

- **Android**: API 24+ (Android 7.0+)
- **iOS**: iOS 13.0+
- **웹 브라우저**: Chrome, Safari, Firefox, Edge

---

✨ **하나의 Vue.js 코드베이스로 웹, Android, iOS 모두 지원하는 크로스 플랫폼 타로 앱!**
