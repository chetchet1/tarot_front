# 타로의 정원 - Android 빌드 설정 완벽 가이드

## 🎯 초보자를 위한 Android 빌드 이해하기

### 📍 설정 파일 위치
**모든 빌드 설정이 담긴 파일:**
```
E:\tarot-app\frontend\android\app\build.gradle
```

### 🔍 디버그 vs 릴리즈 차이점

| 구분 | 디버그 빌드 (개발용) | 릴리즈 빌드 (배포용) |
|------|----------------------|----------------------|
| **앱 ID** | `com.tarotgarden.app.debug` | `com.tarotgarden.app` |
| **파일명** | `app-DEBUG-DO-NOT-UPLOAD-1.0.1-DEBUG.apk` | `app-release.aab` |
| **Play Store** | ❌ 업로드 불가 | ✅ 업로드 가능 |
| **동시 설치** | 릴리즈 앱과 함께 설치 가능 | - |
| **서명** | 자동 테스트 키 | 키스토어 필요 |

## 🚨 이미 설정된 보안 장치들

### 1️⃣ 파일명 자동 구분 (build.gradle 33-43번 줄)
```gradle
applicationVariants.all { variant ->
    variant.outputs.all { output ->
        if (variant.buildType.name == "debug") {
            // 디버그는 경고 파일명
            outputFileName = "app-DEBUG-DO-NOT-UPLOAD-${variant.versionName}.apk"
        } else if (variant.buildType.name == "release") {
            // 릴리즈는 정상 파일명
            outputFileName = "tarot-garden-release-${variant.versionName}.apk"
        }
    }
}
```

### 2️⃣ 앱 ID 자동 구분 (build.gradle 24-29번 줄)
```gradle
debug {
    applicationIdSuffix ".debug"  // 앱 ID 끝에 .debug 추가
    versionNameSuffix "-DEBUG"    // 버전명에 -DEBUG 추가
    debuggable true
}
```

## 🖥️ Android Studio에서 확인하는 방법

### Step 1: Android Studio 열기
```bash
npx cap open android
```

### Step 2: build.gradle 파일 찾기
1. 왼쪽 Project 패널에서
2. `Android` 뷰 선택 (상단 드롭다운)
3. `app` 폴더 확장
4. `build.gradle` 더블클릭

### Step 3: Build Variant 선택
1. **방법 1**: 상단 메뉴 `Build` → `Select Build Variant`
2. **방법 2**: 왼쪽 하단 `Build Variants` 탭 클릭
3. `debug` 또는 `release` 선택

### Step 4: 빌드 결과 확인
- **디버그 APK 위치**: 
  ```
  android\app\build\outputs\apk\debug\
  ```
- **릴리즈 AAB 위치**: 
  ```
  android\app\build\outputs\bundle\release\
  ```

## 📝 릴리즈 빌드 생성 방법

### 1. 키스토어 확인 (이미 E: 드라이브에 있음)

**❗ 중요**: 키스토어는 이미 E: 드라이브에 생성되어 있습니다.
- 키스토어를 새로 만들지 마세요
- 기존 키스토어를 계속 사용하세요
- 분실하면 앱 업데이트가 불가능합니다

### 2. 키스토어 설정 파일 생성

`android/keystore.properties` 파일 생성:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=tarot-garden
storeFile=tarot-garden-release.keystore
```

⚠️ **중요**: 이 파일을 .gitignore에 추가하세요!

### 3. build.gradle 수정

`android/app/build.gradle` 파일 수정:

```gradle
apply plugin: 'com.android.application'

// 키스토어 설정 로드
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "com.tarotgarden.app"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.tarotgarden.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 2  // 버전 코드 증가
        versionName "1.0.1"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true  // 난독화 활성화
            shrinkResources true  // 리소스 축소
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
        debug {
            debuggable true
        }
    }
}
```

### 4. ProGuard 규칙 추가

`android/app/proguard-rules.pro` 파일에 추가:

```proguard
# Capacitor 관련
-keep class com.getcapacitor.** { *; }
-keep class com.ionicframework.** { *; }

# Supabase 관련
-keep class io.supabase.** { *; }

# RevenueCat 관련
-keep class com.revenuecat.** { *; }

# AdMob 관련
-keep class com.google.android.gms.ads.** { *; }

# 웹뷰 관련
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
```

### 5. AAB (Android App Bundle) 생성

```bash
# 프론트엔드 빌드
npm run build:cap

# Android 동기화
npx cap sync android

# Android Studio에서 AAB 생성
npx cap open android
```

**Android Studio에서:**
1. Build → Generate Signed Bundle / APK 선택
2. Android App Bundle 선택
3. 키스토어 정보 입력
4. release 선택
5. Build

### 6. 생성된 AAB 위치

```
android/app/build/outputs/bundle/release/app-release.aab
```

## 🔧 버전 관리

### 버전 코드 증가 규칙
- 모든 업로드마다 versionCode 증가 필요
- 예: 1 → 2 → 3 → ...

### 버전 이름 규칙
- 사용자에게 표시되는 버전
- 예: "1.0.0" → "1.0.1" → "1.1.0"

## 🛠️ 문제 해결 도구

### 빌드 타입 확인 스크립트
```bash
# 실행하면 현재 빌드 파일들을 확인
check-build-type.bat
```

### 릴리즈 빌드 생성 스크립트
```bash
# 단계별로 안내하며 릴리즈 빌드 생성
build-release.bat
```

### 업로드 전 체크 스크립트
```bash
# Play Console 업로드 전 마지막 확인
check-release.bat
```

## ✅ 체크리스트

- [ ] 키스토어 생성 및 안전한 보관
- [ ] keystore.properties 파일 생성
- [ ] .gitignore에 keystore 파일들 추가
- [ ] build.gradle 서명 설정 추가
- [ ] versionCode 증가
- [ ] ProGuard 규칙 설정
- [ ] AAB 파일 생성
- [ ] Google Play Console 업로드

## 🚀 업로드 전 테스트

```bash
# 릴리즈 APK 설치 테스트
adb install android/app/build/outputs/apk/release/app-release.apk
```

## 📌 주의사항

1. **키스토어 백업**: 키스토어 파일과 비밀번호는 반드시 안전하게 백업하세요. 분실 시 앱 업데이트가 불가능합니다.

2. **버전 코드**: 한 번 업로드한 버전 코드는 재사용할 수 없습니다.

3. **테스트**: 릴리즈 빌드를 실제 기기에서 충분히 테스트하세요.

4. **난독화**: ProGuard 활성화 후 앱이 정상 작동하는지 확인하세요.