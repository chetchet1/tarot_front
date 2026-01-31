# 버전 관리 및 배포 가이드

## 🔢 현재 버전 정보
- **Version Name**: 1.0.2
- **Version Code**: 37+ (자동 증가 - 빌드마다 +1)
- **패키지명**: com.tarotgarden.app
- **빌드 시스템**: VERSION_CODE 자동 증가

## 📱 테스터 업데이트 문제 해결

### 문제 상황
- Google Play Console에서 새 버전을 배포해도 기존 설치자들이 업데이트를 받지 못하는 문제

### 해결 방법

#### 1. 빌드 전 버전 업데이트
```bash
# build.gradle 파일에서 versionName만 수정
android/app/build.gradle
versionName "1.0.3"  # 새 버전 번호

# VERSION_CODE는 빌드 시 자동 증가
# 현재 version.properties: 36 → 다음 빌드 시 37
```

#### 2. 테스터가 업데이트 받는 방법

**방법 1: Play Store에서 수동 업데이트**
1. Google Play Store 앱 열기
2. 프로필 아이콘 탭
3. "앱 및 기기 관리" 선택
4. "업데이트 가능" 탭에서 타로의 정원 찾기
5. "업데이트" 버튼 클릭

**방법 2: 앱 재설치**
1. 기존 앱 삭제
2. Play Console 테스트 링크 재접속
3. 새로 설치

**방법 3: Play Store 캐시 초기화**
1. 설정 > 앱 > Google Play Store
2. 저장공간 > 캐시 삭제
3. Play Store 재시작
4. 업데이트 확인

## 🚀 새 버전 빌드 및 배포

### 1. 버전 코드 (자동 처리)
```bash
# version.properties는 빌드 시 자동 증가
# 수동 수정 불필요!
# 현재 값 확인: cat android/version.properties
```

### 2. 버전 이름 변경
```bash
# android/app/build.gradle 수정
versionName "1.0.3"  # 사용자에게 표시될 버전
```

### 3. 앱 내 버전 정보 (자동 가져옴)
```typescript
// updateChecker.ts는 App.getInfo()로 자동 가져옴
// 수동 업데이트 불필요!
// 실행 시 콘솔에 버전 정보 출력됨
```

### 4. 빌드 실행

#### 디버그 빌드
```bash
cd android
./gradlew assembleDebug
# 출력: android/app/build/outputs/apk/debug/app-debug.apk
```

#### 릴리즈 빌드 (AAB)
```bash
cd android
./gradlew bundleRelease
# 출력: android/app/build/outputs/bundle/release/app-release.aab
```

### 5. 빌드 확인
```bash
# APK 정보 확인
aapt dump badging app-debug.apk | grep version

# 예상 출력:
# versionCode='37'
# versionName='1.0.3'
```

### 6. Google Play Console 업로드
1. [Google Play Console](https://play.google.com/console) 접속
2. 타로의 정원 앱 선택
3. 테스트 > 내부 테스트 (또는 비공개 테스트)
4. 새 버전 만들기
5. AAB 파일 업로드
6. 버전 이름과 코드 확인
7. 출시 노트 작성
8. 검토 후 출시

## 🔄 자동 업데이트 체크 기능

### 작동 방식
1. 앱 실행 시 자동으로 최신 버전 체크
2. Supabase `app_versions` 테이블에서 최신 버전 정보 조회
3. 현재 버전보다 높은 버전이 있으면 업데이트 알림

### Supabase 테이블 설정
```sql
-- app_versions 테이블 생성 (이미 있으면 생략)
CREATE TABLE IF NOT EXISTS app_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version_name VARCHAR(20) NOT NULL,
  version_code INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT false,
  update_message TEXT,
  play_store_url TEXT DEFAULT 'https://play.google.com/store/apps/details?id=com.tarotgarden.app',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 새 버전 정보 추가
INSERT INTO app_versions (version_name, version_code, is_required, update_message)
VALUES ('1.0.3', 37, false, '새로운 기능이 추가되었습니다!');
```

## ⚠️ 주의사항

### 버전 코드 관리
- **자동 증가 시스템**: 빌드할 때마다 VERSION_CODE가 1씩 자동 증가
- **테스트 빌드 주의**: 테스트 빌드도 VERSION_CODE를 증가시킴
- **기록 관리**: version.properties에 마지막 빌드 버전 자동 저장

### 테스트 트랙 관리
- 내부 테스트: 최대 100명
- 비공개 테스트: 이메일 목록 관리 필요
- 공개 테스트: 누구나 참여 가능

### 배포 후 확인
1. 테스터에게 업데이트 알림 전송
2. Play Console에서 배포 상태 확인
3. 실제 디바이스에서 업데이트 테스트

## 📝 버전 히스토리

| 버전 | 버전 코드 | 출시일 | 주요 변경사항 |
|------|----------|--------|--------------|
| 1.0.0 | 1-28 | 2025.08.24 | 초기 출시 |
| 1.0.1 | 29-35 | 2025.08.24 | 버그 수정 |
| 1.0.2 | 36 | 2025.08.25 | 공유 기능 개선, 업데이트 체크 추가 |

## 🆘 문제 해결

### "앱이 설치되지 않았습니다" 오류
- 기존 앱 삭제 후 재설치
- 서명 키가 다른 경우 발생

### 업데이트가 보이지 않음
1. Play Store 캐시 삭제
2. 계정 동기화 확인
3. 테스트 트랙 가입 확인

### 업데이트 체크 안 됨
- Supabase app_versions 테이블에 최신 버전 정보 업데이트 필요
- 앱 실행 시 콘솔에서 버전 정보 확인 가능 (🔄 업데이트 체크)

---

📌 **중요**: 버전 코드는 자동 증가! versionName만 수동으로 관리하면 됨!