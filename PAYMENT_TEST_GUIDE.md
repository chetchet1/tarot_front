# 결제 시스템 테스트 가이드

## 📌 현재 구현 상태

### ✅ 완료된 부분
- 결제 UI (Premium.vue)
- 결제 플로우 기본 구조 (purchasesWeb.ts)
- 테스트 계정 처리 로직
- 개발 모드 모의 결제

### ⚠️ 미구현 부분
- 실제 결제 게이트웨이 연동 (Toss Payments, Stripe 등)
- 결제 검증 백엔드 API
- 구독 갱신 자동화
- 결제 실패 재시도
- 영수증 발행

## 🧪 테스트 방법

### 1. 개발 모드 테스트 (현재 가능)

#### 1.1 일반 계정 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:8082
```

1. 일반 계정으로 로그인
2. Premium 페이지 이동
3. 월간/연간 구독 선택
4. 결제 수단 선택 (아무거나)
5. "결제하기" 클릭
6. 개발 모드에서는 2초 후 자동 승인

#### 1.2 테스트 계정 자동 승인
- `test@example.com`: 무료 테스트 계정 - 결제 시 항상 성공
- `premium@example.com`: 프리미엄 테스트 계정 - 결제 시 항상 성공

### 2. 콘솔 디버깅

브라우저 개발자 도구(F12) 콘솔에서 확인할 수 있는 로그:

```javascript
// 결제 시작
💳 결제 시작
💳 선택한 플랜: monthly
💳 선택한 결제 수단: card

// 결제 진행
🌐 [Web] 구독 구매 시작: monthly, 결제수단: card
🌐 [Web] 개발 모드 - 결제 모킹
🌐 [Web] 테스트 계정 결제 - 자동 승인

// 결제 완료
🌐 [Web] 구독 구매 성공
💳 결제 결과: {success: true}
```

### 3. 에러 상황 테스트

#### 3.1 결제 수단 미선택
- 결제 수단을 선택하지 않고 "결제하기" 클릭
- 에러 메시지: "결제 수단을 선택해주세요"

#### 3.2 네트워크 오류 시뮬레이션
```javascript
// 콘솔에서 실행
window.DEBUG_PAYMENT_FAIL = true;
```

## 🚀 프로덕션 구현 필요 사항

### 1. 결제 게이트웨이 선택

#### 옵션 1: Toss Payments (한국)
```javascript
// 1. Toss Payments 가입 및 API 키 발급
// 2. purchasesWeb.ts의 loadPaymentSDK() 수정
private async loadPaymentSDK(): Promise<void> {
  const script = document.createElement('script');
  script.src = 'https://js.tosspayments.com/v1/payment';
  // ...
}

// 3. processPayment() 실제 구현
const tossPayments = new TossPayments('YOUR_CLIENT_KEY');
const result = await tossPayments.requestPayment(method, data);
```

#### 옵션 2: Stripe (글로벌)
```javascript
// 1. Stripe 가입 및 API 키 발급
// 2. npm install @stripe/stripe-js
// 3. Stripe Elements 구현
```

### 2. 백엔드 API 구현

```sql
-- Supabase에 필요한 테이블 (subscriptions)
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan VARCHAR(50),
  status VARCHAR(50),
  price INTEGER,
  currency VARCHAR(10),
  platform_order_id VARCHAR(255),
  payment_method VARCHAR(50),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 결제 검증 Edge Function

```javascript
// supabase/functions/verify-payment/index.ts
export async function verifyPayment(orderId: string) {
  // 1. 결제 게이트웨이 API로 실제 결제 확인
  // 2. DB에 구독 정보 저장
  // 3. 사용자 프리미엄 상태 업데이트
}
```

## 📝 체크리스트

### 테스트 시나리오
- [ ] 월간 구독 결제
- [ ] 연간 구독 결제
- [ ] 각 결제 수단별 테스트
- [ ] 결제 취소
- [ ] 구독 복원
- [ ] 프리미엄 상태 확인

### 구현 우선순위
1. **Phase 1** (현재): 모의 결제로 UI/UX 테스트
2. **Phase 2**: Toss Payments 테스트 모드 연동
3. **Phase 3**: 실제 결제 및 검증 시스템
4. **Phase 4**: 구독 관리 (갱신, 취소, 환불)

## 🔧 트러블슈팅

### 문제: "결제하기" 버튼 클릭 시 반응 없음

**원인 가능성:**
1. import 경로 오류
2. purchaseSubscription 함수 미정의
3. JavaScript 에러

**해결 방법:**
1. 브라우저 콘솔(F12) 확인
2. 네트워크 탭에서 API 호출 확인
3. 소스 탭에서 브레이크포인트 설정

### 문제: 결제 후 프리미엄 상태 미반영

**해결 방법:**
```javascript
// 수동으로 프리미엄 상태 새로고침
await userStore.refreshPremiumStatus();
```

## 📞 추가 지원

- 결제 게이트웨이 선택 상담 필요
- 백엔드 구현 지원 필요
- 보안 검토 필요

---

**현재 상태**: 개발 모드 모의 결제만 가능  
**다음 단계**: 결제 게이트웨이 선택 및 연동