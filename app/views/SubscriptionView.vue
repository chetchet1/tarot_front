<template>
  <div class="subscription-view">
    <!-- 헤더 -->
    <div class="header">
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>프리미엄 구독</h1>
    </div>

    <!-- 현재 구독 상태 (구독중인 경우) -->
    <div v-if="currentSubscription" class="current-subscription">
      <div class="status-card">
        <i class="fas fa-crown premium-icon"></i>
        <h3>프리미엄 구독 중</h3>
        <p>{{ formatSubscriptionPeriod(currentSubscription) }}</p>
        <p class="expires">만료일: {{ formatDate(currentSubscription.expires_at) }}</p>
        <button 
          v-if="currentSubscription.auto_renew" 
          @click="cancelSubscription" 
          class="cancel-button"
        >
          구독 취소
        </button>
      </div>
    </div>

    <!-- 혜택 소개 -->
    <div class="benefits-section">
      <h2>프리미엄 혜택</h2>
      <div class="benefits-grid">
        <div class="benefit-item">
          <i class="fas fa-ban-bug"></i>
          <h3>광고 제거</h3>
          <p>모든 광고 없이 쾌적한 사용</p>
        </div>
        <div class="benefit-item">
          <i class="fas fa-infinity"></i>
          <h3>무제한 이용</h3>
          <p>유료 배열법 무제한 사용</p>
        </div>
        <div class="benefit-item">
          <i class="fas fa-robot"></i>
          <h3>AI 해석</h3>
          <p>심층적인 AI 타로 해석</p>
        </div>
        <div class="benefit-item">
          <i class="fas fa-chart-line"></i>
          <h3>통계 분석</h3>
          <p>상세한 운세 통계 제공</p>
        </div>
      </div>
    </div>

    <!-- 구독 플랜 (구독중이 아닌 경우) -->
    <div v-if="!currentSubscription" class="plans-section">
      <h2>구독 플랜 선택</h2>
      <div class="plans-container">
        <!-- 월간 플랜 -->
        <div 
          class="plan-card"
          :class="{ selected: selectedPlan === 'monthly_premium' }"
          @click="selectPlan('monthly_premium')"
        >
          <h3>월간 구독</h3>
          <div class="price">
            <span class="amount">₩4,900</span>
            <span class="period">/월</span>
          </div>
          <ul class="features">
            <li>매월 자동 갱신</li>
            <li>언제든 취소 가능</li>
            <li>모든 프리미엄 혜택</li>
          </ul>
        </div>

        <!-- 연간 플랜 -->
        <div 
          class="plan-card recommended"
          :class="{ selected: selectedPlan === 'yearly_premium' }"
          @click="selectPlan('yearly_premium')"
        >
          <div class="badge">17% 할인</div>
          <h3>연간 구독</h3>
          <div class="price">
            <span class="amount">₩49,000</span>
            <span class="period">/년</span>
          </div>
          <p class="savings">월 ₩4,083 (₩9,800 절약)</p>
          <ul class="features">
            <li>매년 자동 갱신</li>
            <li>언제든 취소 가능</li>
            <li>모든 프리미엄 혜택</li>
          </ul>
        </div>
      </div>

      <!-- 구매 버튼 -->
      <button 
        class="purchase-button"
        :disabled="!selectedPlan || loading"
        @click="purchase"
      >
        <span v-if="loading">
          <i class="fas fa-spinner fa-spin"></i> 처리 중...
        </span>
        <span v-else>
          구독 시작하기
        </span>
      </button>

      <!-- 구매 복원 -->
      <button class="restore-button" @click="restorePurchases">
        이전 구매 복원
      </button>
    </div>

    <!-- 약관 및 안내 -->
    <div class="terms-section">
      <h3>구독 안내</h3>
      <ul>
        <li>구독은 현재 기간이 끝나기 24시간 전에 취소하지 않으면 자동으로 갱신됩니다.</li>
        <li>구독료는 구매 확인 시 Google Play 계정으로 청구됩니다.</li>
        <li>구독은 Google Play 스토어 설정에서 관리할 수 있습니다.</li>
        <li>활성 구독 기간 동안은 취소 시에도 서비스를 계속 이용할 수 있습니다.</li>
      </ul>
      <div class="links">
        <a @click="showTerms">이용약관</a>
        <span>|</span>
        <a @click="showPrivacy">개인정보처리방침</a>
      </div>
    </div>

    <!-- 로딩 오버레이 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { revenueCatService, type Subscription } from '@/services/RevenueCatService';
import { useAuthStore } from '@/store/auth';
import { showAlert, showConfirm } from '@/utils/alert';

// Window\uc5d0 Capacitor \ud0c0\uc785 \ucd94\uac00
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform(): boolean;
    };
  }
}

const router = useRouter();
const authStore = useAuthStore();

// 상태
const currentSubscription = ref<Subscription | null>(null);
const selectedPlan = ref<string>('');
const loading = ref(false);
const products = ref<any[]>([]);

// 라이프사이클
onMounted(async () => {
  await initialize();
});

// 초기화
const initialize = async () => {
  loading.value = true;
  try {
    // 웹 테스트 환경 체크
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
      console.log('웹 테스트 환경 - RevenueCat 초기화 스킵');
      
      // 테스트 계정의 프리미엄 상태 확인
      const userEmail = authStore.user?.email;
      if (userEmail === 'premium@example.com') {
        // 프리미엄 테스트 계정은 이미 구독중으로 표시
        const { useUserStore } = await import('@/store/user');
        const userStore = useUserStore();
        
        if (userStore.isPremium) {
          currentSubscription.value = {
            id: 'test-premium-subscription',
            user_id: authStore.user?.id || '',
            product_id: 'monthly_premium',
            platform: 'web-test',
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후
            price_amount: 4900,
            currency: 'KRW',
            auto_renew: true
          };
        }
      }
      
      // 테스트용 상품 정보
      products.value = [
        {
          id: 'monthly_premium',
          identifier: 'monthly_premium',
          priceString: '₩4,900',
          priceAmount: 4900,
          currency: 'KRW',
          title: '월간 구독',
          description: '매월 자동 갱신',
          period: 'month'
        },
        {
          id: 'yearly_premium',
          identifier: 'yearly_premium',
          priceString: '₩49,000',
          priceAmount: 49000,
          currency: 'KRW',
          title: '연간 구독',
          description: '매년 자동 갱신',
          period: 'year'
        }
      ];
    } else {
      // 네이티브 앱 - RevenueCat 초기화
      await revenueCatService.initialize();
      currentSubscription.value = await revenueCatService.checkSubscription();
      products.value = revenueCatService.getProducts();
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
    // 웹 환경에서는 오류 메시지 표시하지 않음
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      await showAlert('오류', '결제 서비스 초기화에 실패했습니다.');
    }
  } finally {
    loading.value = false;
  }
};

// 플랜 선택
const selectPlan = (planId: string) => {
  selectedPlan.value = planId;
};

// 구매
const purchase = async () => {
  if (!selectedPlan.value) {
    await showAlert('알림', '구독 플랜을 선택해주세요.');
    return;
  }

  if (!authStore.isAuthenticated) {
    await showAlert('알림', '로그인이 필요합니다.');
    router.push('/auth/login');
    return;
  }

  // 구글 플레이 앱 등록 전 임시 비활성화
  await showAlert('알림', '준비중입니다.');
  return;

  loading.value = true;
  
  // 웹 테스트 환경 처리
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
    console.log('웹 테스트 환경 감지 - 테스트 결제 처리');
    
    try {
      // 테스트 계정 확인
      const userEmail = authStore.user?.email;
      const isTestAccount = userEmail === 'test@example.com' || userEmail === 'premium@example.com';
      
      if (isTestAccount) {
        console.log('테스트 계정 결제 시뮬레이션 시작');
        
        // 결제 진행 시뮬레이션
        console.log('결제 상태 : true');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
        
        // userStore를 통해 프리미엄 상태 업데이트
        const { useUserStore } = await import('@/store/user');
        const userStore = useUserStore();
        
        // 테스트 계정을 프리미엄으로 업그레이드
        await userStore.upgradeToPremium();
        
        // 구독 정보 모의 생성
        currentSubscription.value = {
          id: 'test-subscription-' + Date.now(),
          user_id: authStore.user?.id || '',
          product_id: selectedPlan.value,
          platform: 'web-test',
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
          price_amount: selectedPlan.value === 'monthly_premium' ? 4900 : 49000,
          currency: 'KRW',
          auto_renew: true
        };
        
        await showAlert('성공', '프리미엄 구독이 활성화되었습니다! (테스트 모드)');
        router.push('/');
      } else {
        await showAlert('알림', '웹 브라우저에서는 실제 결제가 지원되지 않습니다. 모바일 앱을 사용해주세요.');
      }
    } catch (error: any) {
      console.error('Test purchase failed:', error);
      await showAlert('오류', error.message || '테스트 구매 중 오류가 발생했습니다.');
    } finally {
      loading.value = false;
    }
    return;
  }
  
  // 네이티브 앱 결제 처리
  try {
    await revenueCatService.purchase(selectedPlan.value);
    
    // 구독 상태 새로고침
    currentSubscription.value = await revenueCatService.checkSubscription();
    
    // 프로필 새로고침
    await authStore.fetchProfile();
    
    await showAlert('성공', '프리미엄 구독이 활성화되었습니다!');
    router.push('/');
  } catch (error: any) {
    console.error('Purchase failed:', error);
    await showAlert('오류', error.message || '구매 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

// 구매 복원
const restorePurchases = async () => {
  loading.value = true;
  try {
    await revenueCatService.restorePurchases();
    
    // 구독 상태 새로고침
    currentSubscription.value = await revenueCatService.checkSubscription();
    
    if (currentSubscription.value) {
      await showAlert('성공', '구매가 복원되었습니다.');
    } else {
      await showAlert('알림', '복원할 구매 내역이 없습니다.');
    }
  } catch (error) {
    console.error('Restore failed:', error);
    await showAlert('오류', '구매 복원에 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// 구독 취소
const cancelSubscription = async () => {
  const confirmed = await showConfirm(
    '구독 취소',
    '구독을 취소하시겠습니까? 현재 구독 기간이 끝날 때까지 서비스를 이용할 수 있습니다.'
  );

  if (!confirmed) return;

  loading.value = true;
  try {
    if (currentSubscription.value) {
      // RevenueCat은 구독 관리 페이지로 이동
      await revenueCatService.cancelSubscription();
      
      // 구독 상태는 나중에 웹훅으로 업데이트됨
      currentSubscription.value = null;
      
      // 프로필 새로고침
      await authStore.fetchProfile();
      
      await showAlert('완료', '구독이 취소되었습니다.');
    }
  } catch (error) {
    console.error('Cancel failed:', error);
    await showAlert('오류', '구독 취소에 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// 날짜 포맷
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 구독 기간 포맷
const formatSubscriptionPeriod = (subscription: Subscription) => {
  if (subscription.product_id === 'monthly_premium') {
    return '월간 구독';
  } else if (subscription.product_id === 'yearly_premium') {
    return '연간 구독';
  }
  return '프리미엄';
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 약관 보기
const showTerms = () => {
  window.open('https://your-domain.com/terms', '_blank');
};

// 개인정보처리방침 보기
const showPrivacy = () => {
  window.open('https://your-domain.com/privacy', '_blank');
};
</script>

<style scoped>
.subscription-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  margin-right: 1rem;
  cursor: pointer;
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

/* 현재 구독 상태 */
.current-subscription {
  padding: 1rem;
}

.status-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.premium-icon {
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 1rem;
}

.status-card h3 {
  margin: 0.5rem 0;
  color: #333;
}

.status-card p {
  color: #666;
  margin: 0.5rem 0;
}

.expires {
  font-size: 0.9rem;
  color: #999;
}

.cancel-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* 혜택 섹션 */
.benefits-section {
  padding: 2rem 1rem;
}

.benefits-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.benefit-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.benefit-item i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.benefit-item h3 {
  margin: 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.benefit-item p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* 플랜 섹션 */
.plans-section {
  padding: 2rem 1rem;
}

.plans-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.plans-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.plan-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.plan-card.selected {
  border-color: #667eea;
  transform: scale(1.02);
}

.plan-card.recommended {
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.plan-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.price {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.period {
  color: #999;
  margin-left: 0.5rem;
}

.savings {
  color: #4caf50;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.features {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.features li {
  color: #666;
  padding: 0.3rem 0;
  font-size: 0.9rem;
}

.features li::before {
  content: '✓ ';
  color: #4caf50;
  font-weight: bold;
}

/* 버튼 */
.purchase-button {
  width: 100%;
  max-width: 400px;
  margin: 2rem auto 1rem;
  display: block;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.purchase-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.restore-button {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
  padding: 0.8rem;
  background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* 약관 섹션 */
.terms-section {
  padding: 2rem 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.terms-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.terms-section ul {
  list-style: none;
  padding: 0;
}

.terms-section li {
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.terms-section li::before {
  content: '• ';
}

.links {
  text-align: center;
  margin-top: 2rem;
}

.links a {
  color: white;
  text-decoration: underline;
  cursor: pointer;
  margin: 0 0.5rem;
}

.links span {
  color: rgba(255, 255, 255, 0.5);
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>