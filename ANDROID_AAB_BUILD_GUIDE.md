# 🎯 Android Studio에서 릴리즈 AAB 생성 완벽 가이드

## 📝 시작하기 전 체크리스트
- ✅ 키스토어 위치: **E:/keystore** (확인됨)
- ✅ Android Studio 설치 완료
- ✅ 프로젝트 경로: `E:\tarot-app\frontend`

---

## 📋 Step 1: 프론트엔드 빌드 및 동기화

### 1-1. 명령 프롬프트 열기
```bash
cd E:\tarot-app\frontend
```

### 1-2. 프론트엔드 빌드
```bash
npm run build:cap
```
⚠️ **중요**: 이 명령어가 완료될 때까지 기다리세요 (2-3분 소요)

### 1-3. Capacitor 동기화
```bash
npx cap sync android
```
⚠️ **중요**: Android 코드와 동기화됩니다 (1-2분 소요)

---

## 📋 Step 2: Android Studio 열기

### 2-1. Android Studio 실행
```bash
npx cap open android
```
또는 Android Studio 직접 실행 후:
- **File → Open**
- `E:\tarot-app\frontend\android` 폴더 선택

### 2-2. 프로젝트 로딩 대기
- Gradle sync가 자동으로 시작됩니다
- 우측 하단 진행바가 완료될 때까지 기다리세요 (2-5분)

---

## 🔴 Step 3: Build Variant 설정 (매우 중요!)

### 3-1. Build Variant 패널 열기
**방법 1**: 
- Android Studio 왼쪽 하단 세로 탭에서 **"Build Variants"** 클릭

**방법 2**:
- 상단 메뉴 **Build → Select Build Variant**

### 3-2. Release 선택
Build Variants 창에서:
```
Module: app
Active Build Variant: [debug ▼] ← 클릭하여 release로 변경
```

⚠️ **반드시 확인**:
- **debug** → **release** 로 변경
- 변경 후 자동으로 프로젝트가 다시 빌드됩니다

---

## 📋 Step 4: AAB 파일 생성

### 4-1. 서명된 번들 생성 시작
상단 메뉴에서:
**Build → Generate Signed Bundle / APK...**

### 4-2. Android App Bundle 선택
![선택화면]
```
⦿ Android App Bundle  ← 이것 선택!
○ APK
```
**Next** 클릭

### 4-3. 키스토어 정보 입력

#### Module 선택
```
Module: android.app
```

#### Key store 설정
```
Key store path: [Choose Existing...] 클릭
→ E:\keystore 파일 선택
```

#### 비밀번호 입력
```
Key store password: [키스토어 생성시 설정한 비밀번호]
□ Remember passwords (선택사항)
```

#### Key 정보
```
Key alias: [▼] 드롭다운에서 선택 또는 직접 입력
Key password: [키 비밀번호]
```

**Next** 클릭

### 4-4. 빌드 설정

#### Destination Folder
```
기본값 유지: E:\tarot-app\frontend\android\app
```

#### Build Variants
```
☑ release  ← 반드시 체크!
☐ debug    ← 체크 해제!
```

#### Signature Versions
```
☑ V1 (Jar Signature)
☑ V2 (Full APK Signature)
```

**Finish** 클릭

---

## 📋 Step 5: 빌드 진행 및 확인

### 5-1. 빌드 진행 상황
- Android Studio 하단 **Build** 탭에서 진행 상황 확인
- 약 2-5분 소요

### 5-2. 빌드 성공 확인
빌드 완료시 우측 하단 알림:
```
Generate Signed Bundle
APK(s) generated successfully for module 'android.app' with 1 build variant:
Build variant 'release': locate or analyze the APK.
```

**locate** 링크 클릭시 파일 위치로 이동

### 5-3. AAB 파일 위치
```
E:\tarot-app\frontend\android\app\release\app-release.aab
```

---

## ✅ Step 6: 최종 확인

### 6-1. 파일 확인
Windows 탐색기에서:
```
E:\tarot-app\frontend\android\app\release\
```

다음 파일이 있어야 함:
- ✅ **app-release.aab** (Play Store 업로드용)
- ✅ app-release.aab.SHA1
- ✅ app-release.aab.SHA256  
- ✅ app-release.aab.SHA512

### 6-2. 파일 크기 확인
- app-release.aab: 약 20-40MB (정상)
- 1MB 미만이면 빌드 오류

---

## ⚠️ 자주 발생하는 문제와 해결법

### 문제 1: "debug" APK 경고
**원인**: Build Variant가 debug로 설정됨
**해결**: Step 3에서 반드시 **release** 선택

### 문제 2: 키스토어를 찾을 수 없음
**원인**: 경로 오류
**해결**: E:\keystore 파일 직접 선택

### 문제 3: 빌드 실패
**원인**: 프론트엔드 빌드 누락
**해결**: Step 1 다시 실행

### 문제 4: AAB 파일이 생성되지 않음
**원인**: APK 선택함
**해결**: Step 4-2에서 **Android App Bundle** 선택

---

## 🚀 Google Play Console 업로드

### 1. Play Console 접속
https://play.google.com/console

### 2. 앱 선택 → 프로덕션 → 새 버전 만들기

### 3. App Bundle 업로드
`app-release.aab` 파일 드래그 앤 드롭

### 4. 버전 정보 입력
- 버전 이름: 1.0.1
- 출시 노트 작성

### 5. 검토 및 출시

---

## 📌 체크리스트 요약

업로드 전 최종 확인:
- [ ] npm run build:cap 실행됨
- [ ] npx cap sync android 실행됨  
- [ ] Build Variant: **release** 선택됨
- [ ] Android App Bundle 선택됨 (APK 아님)
- [ ] 키스토어: E:\keystore 사용
- [ ] app-release.aab 파일 생성됨
- [ ] 파일 크기 20MB 이상

---

## 💡 팁

1. **매번 빌드 전**:
   - 항상 `npm run build:cap` 먼저 실행
   - Build Variant 확인

2. **키스토어 백업**:
   - E:\keystore 파일 안전한 곳에 백업
   - 비밀번호도 함께 보관

3. **버전 관리**:
   - 매 업로드마다 versionCode 증가
   - build.gradle에서 수정

---

작성일: 2025-08-24