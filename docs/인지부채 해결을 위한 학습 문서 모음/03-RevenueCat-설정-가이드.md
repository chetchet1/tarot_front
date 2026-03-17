# RevenueCat 설정 가이드

## RevenueCat 대시보드 구조

RevenueCat에서 관리해야 하는 4가지 개념이 있다.

```
앱 (App)
 └─ API Key (앱과 RevenueCat을 연결하는 열쇠)

상품 (Product)
 └─ Google Play Console의 구독 상품과 1:1 매핑

권한 (Entitlement)
 └─ 사용자가 구매하면 얻는 "권리" (예: 프리미엄)

오퍼링 (Offering)
 └─ 사용자에게 보여줄 상품 묶음 (어떤 상품을 팔지)
```

## 1. 앱 등록 (Apps)

### 경로
RevenueCat 대시보드 → 프로젝트 → Apps

### 우리 설정
- **플랫폼**: Google Play Store
- **패키지명**: `com.tarotgarden.app`
- **Service Account JSON**: 미설정 (나중에 하면 됨)

### Service Account JSON이란?
- RevenueCat이 Google Play Console에 **자동으로** 구독 상태를 확인하기 위한 인증 키
- 없어도 기본 결제는 동작함
- 있으면 서버 간 실시간 동기화 가능 (구독 취소/갱신 자동 감지)
- 나중에 설정 예정

## 2. API Key

### 우리 설정
- **Android API Key**: `goog_AgtlorzFIaDlSjLdhfuDBbUUQNL`

### 역할
- 앱 코드에서 RevenueCat SDK를 초기화할 때 사용
- 이 키로 RevenueCat이 "어떤 앱에서 온 요청인지" 식별

### 코드에서 사용되는 위치
```
app/config/env.ts → REVENUECAT_CONFIG.androidKey
app/services/RevenueCatService.ts → API_KEYS.android
```

## 3. 상품 (Products)

### 경로
RevenueCat 대시보드 → 프로젝트 → Products

### 우리 설정
- **Product ID**: `tarot_sub`
- **Store**: Google Play Store
- **Base Plan ID**: `tarot-sub`

### 중요: ID 구분
```
Google Play Console에서 만든 구독 상품 ID = tarot_sub
Google Play Console에서 만든 베이스 플랜 ID = tarot-sub (하이픈!)
RevenueCat에서 등록한 Product ID = tarot_sub (Google Play 상품 ID와 동일)
```

### RevenueCat에 상품 등록하는 법
1. RevenueCat → Products → New
2. Google Play Store 선택
3. Product ID에 `tarot_sub` 입력 (Google Play에 등록한 것과 동일)
4. Base Plan ID에 `tarot-sub` 입력

## 4. 권한 (Entitlements)

### 개념
- "사용자가 돈을 내면 무엇을 얻는가?"를 정의
- 상품과 권한은 N:1 관계 (여러 상품이 같은 권한을 줄 수 있음)

### 우리 설정
- **Entitlement ID**: `premium`
- **연결된 상품**: `tarot_sub`

### 예시
```
월간 구독 (tarot_sub) → premium 권한 부여
연간 구독 (나중에 추가) → premium 권한 부여 (같은 권한)
```

### 코드에서 확인
```typescript
// RevenueCatService.ts에서 프리미엄 확인
const customerInfo = await Purchases.getCustomerInfo();
const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
```

## 5. 오퍼링 (Offerings)

### 개념
- 사용자에게 실제로 보여줄 구독 상품 묶음
- A/B 테스트할 때 유용 (다른 가격의 오퍼링을 만들어서 비교)

### 우리 설정
- **Offering ID**: `default`
- **포함 상품**: `tarot_sub` (월간 ₩2,900)

### 코드에서 사용
```typescript
// RevenueCatService.ts
const offerings = await Purchases.getOfferings();
const currentOffering = offerings.current; // = "default" 오퍼링
const packages = currentOffering.availablePackages; // 상품 목록
```

## 6. 전체 연결 관계 다이어그램

```
Google Play Console                    RevenueCat                        앱 코드
─────────────────                    ──────────                        ────────
구독 상품: tarot_sub  ←──매핑──→   Product: tarot_sub
베이스 플랜: tarot-sub                    ↓
                                  Entitlement: premium  ←──확인──→  isPremium?
                                        ↓
                                  Offering: default    ←──조회──→  구독 화면 표시
                                        ↓
                              API Key: goog_Agtl...   ←──인증──→  SDK 초기화
```

## 7. 아직 안 한 것

### Service Account JSON 설정
- Google Cloud Console에서 서비스 계정 생성
- JSON 키 다운로드
- RevenueCat 앱 설정에 업로드
- 이걸 하면 RevenueCat이 Google Play와 실시간 동기화 가능

### Google Play 실시간 개발자 알림 (RTDN)
- Google Cloud Pub/Sub 설정
- 구독 상태 변경(갱신, 취소 등)을 실시간으로 RevenueCat에 전달
- Service Account JSON 설정 후에 진행
