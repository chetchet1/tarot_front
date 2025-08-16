<template>
  <div class="premium">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>프리미엄 구독</h1>
    </header>

    <div class="container">
      <div class="hero-section">
        <div class="premium-icon">👑</div>
        <h2>타로의 정원 프리미엄</h2>
        <p class="hero-subtitle">광고 없는 깨끗한 환경에서<br>모든 타로 기능을 무제한으로 이용하세요</p>
      </div>

      <div class="features-section">
        <h3>프리미엄 혜택</h3>
        <div class="features-grid">
          <div class="feature-card card" v-for="(benefit, key) in benefits" :key="key">
            <div class="feature-icon">{{ benefit.icon }}</div>
            <h4>{{ benefit.title }}</h4>
            <p>{{ benefit.description }}</p>
          </div>
        </div>
      </div>

      <div class="pricing-section">
        <h3>요금제</h3>
        <div class="pricing-grid">
          <div class="pricing-card card" 
               v-for="(product, key) in SUBSCRIPTION_PRODUCTS" 
               :key="key"
               :class="{ featured: key === 'yearly' }">
            <div class="best-value" v-if="key === 'yearly'">가장 인기</div>
            <div class="plan-header">
              <h4>{{ key === 'monthly' ? '월간 구독' : '연간 구독' }}</h4>
              <div class="price">
                <span v-if="key === 'yearly'" class="original-price">{{ formatPrice(SUBSCRIPTION_PRODUCTS.monthly.price * 12) }}</span>
                <span class="amount">{{ formatPrice(product.price) }}</span>
                <span class="period">/{{ key === 'monthly' ? '월' : '년' }}</span>
              </div>
              <div v-if="key === 'yearly'" class="savings">{{ calculateDiscount() }}% 할인!</div>
            </div>
            <ul class="plan-features">
              <li>✅ 모든 프리미엄 혜택</li>
              <li>✅ 광고 제거</li>
              <li>✅ 무제한 점괘</li>
              <li v-if="key === 'yearly'">✅ {{ calculateDiscount() }}% 할인 혜택</li>
              <li v-else>✅ 언제든지 해지 가능</li>
            </ul>
            <button class="btn btn-primary subscribe-btn" 
                    :class="{ featured: key === 'yearly' }"
                    @click="selectPlan(key)"
                    :disabled="isLoading">
              {{ key === 'monthly' ? '월간 구독하기' : '연간 구독하기' }}
              <span v-if="key === 'yearly'"> ({{ calculateDiscount() }}% 할인)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 결제 방법 선택 모달 -->
      <div v-if="showPaymentModal" class="payment-modal" @click="closePaymentModal">
        <div class="payment-content" @click.stop>
          <h3>결제 방법 선택</h3>
          <div class="selected-plan">
            <p><strong>{{ selectedPlan === 'monthly' ? '월간 구독' : '연간 구독' }}</strong></p>
            <p class="plan-price">{{ formatPrice(SUBSCRIPTION_PRODUCTS[selectedPlan].price) }}</p>
          </div>
          
          <div class="payment-methods">
            <div v-for="(method, key) in PAYMENT_METHODS" 
                 :key="key"
                 class="payment-method"
                 :class="{ selected: selectedPaymentMethod === key }"
                 @click="selectedPaymentMethod = key">
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
            </div>
          </div>
          
          <div class="payment-actions">
            <button class="btn btn-secondary" @click="closePaymentModal">취소</button>
            <button class="btn btn-primary" 
                    @click="processPurchase"
                    :disabled="!selectedPaymentMethod || isLoading">
              {{ isLoading ? '결제 진행 중...' : '결제하기' }}
            </button>
          </div>
        </div>
      </div>

      <div class="current-status" v-if="userStore.isAuthenticated">
        <div class="status-card card">
          <h3>현재 상태</h3>
          <div v-if="userStore.isPremium" class="premium-status">
            <div class="status-icon">👑</div>
            <p><strong>프리미엄 회원</strong></p>
            <p>모든 기능을 무제한으로 이용하고 계십니다!</p>
            <div class="subscription-info" v-if="userStore.currentSubscription">
              <p>구독 만료일: {{ formatDate(userStore.currentSubscription.endDate) }}</p>
              <button class="btn btn-outline" @click="manageSub">구독 관리</button>
            </div>
          </div>
          <div v-else class="free-status">
            <div class="status-icon">🆓</div>
            <p><strong>무료 회원</strong></p>
            <p>오늘 무료 점괘: {{ userStore.freeReadingsToday }}/{{ userStore.maxFreeReadingsPerDay }}</p>
          </div>
        </div>
      </div>

      <div class="faq-section">
        <h3>자주 묻는 질문</h3>
        <div class="faq-list">
          <div class="faq-item card" v-for="faq in faqs" :key="faq.id">
            <h4>{{ faq.question }}</h4>
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { 
  SUBSCRIPTION_PRODUCTS, 
  PAYMENT_METHODS, 
  purchaseSubscription,
  formatPrice, 
  calculateDiscount
} from '@/services/purchasesWeb';
import { showAlert, showConfirm } from '@/utils/alerts';
import type { SubscriptionBenefit, FAQ } from '@/types/premium';

const router = useRouter();
const userStore = useUserStore();
// 상태 관리
const isLoading = ref(false);
const showPaymentModal = ref(false);
const selectedPlan = ref<'monthly' | 'yearly'>('monthly');
const selectedPaymentMethod = ref<string>('');

// 혜택 정보
const benefits = computed<Record<string, SubscriptionBenefit>>(() => ({
  removeAds: {
    icon: '🚫',
    title: '광고 제거',
    description: '모든 광고가 제거되어 집중해서 점괘를 볼 수 있습니다'
  },
  unlimitedReadings: {
    icon: '🔮',
    title: '무제한 점괘',
    description: '하루 제한 없이 원하는 만큼 타로 점을 볼 수 있습니다'
  },
  premiumSpreads: {
    icon: '⭐',
    title: '모든 스프레드',
    description: '켈틱 크로스, 관계 스프레드 등 모든 배열법을 이용할 수 있습니다'
  },
  detailedInterpretation: {
    icon: '📚',
    title: '상세한 해석',
    description: '더욱 자세하고 개인화된 카드 해석을 제공합니다'
  },
  unlimitedHistory: {
    icon: '💾',
    title: '점괘 저장',
    description: '모든 점괘 기록이 자동으로 저장되어 언제든 다시 볼 수 있습니다'
  },
  prioritySupport: {
    icon: '🎯',
    title: '맞춤 추천',
    description: '당신의 성향에 맞는 개인화된 타로 가이드를 제공합니다'
  }
}));

const faqs: FAQ[] = [
  {
    id: 1,
    question: '구독은 언제든지 해지할 수 있나요?',
    answer: '네, 언제든지 해지할 수 있습니다. 해지하시면 다음 결제일부터 요금이 청구되지 않습니다.'
  },
  {
    id: 2,
    question: '무료 버전과 프리미엄의 차이점은 무엇인가요?',
    answer: '무료 버전은 하루 3회 제한과 광고가 있지만, 프리미엄은 무제한 이용과 광고 제거, 추가 스프레드를 제공합니다.'
  },
  {
    id: 3,
    question: '결제는 어떻게 이루어지나요?',
    answer: '안전한 온라인 결제 시스템을 통해 신용카드나 계좌이체로 결제하실 수 있습니다.'
  },
  {
    id: 4,
    question: '환불이 가능한가요?',
    answer: '서비스 이용 후 7일 이내에 문의하시면 전액 환불해드립니다.'
  }
];

// 메서드들
const goBack = () => {
  router.go(-1);
};

const selectPlan = (plan: 'monthly' | 'yearly') => {
  selectedPlan.value = plan;
  selectedPaymentMethod.value = '';
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  selectedPaymentMethod.value = '';
};

const processPurchase = async () => {
  if (!selectedPaymentMethod.value) return;
  
  try {
    isLoading.value = true;
    
    const result = await purchaseSubscription(
      selectedPlan.value, 
      selectedPaymentMethod.value
    );
    
    if (result.success) {
      await showAlert({
        title: '구독 완료',
        message: '구독이 완료되었습니다! 🎉'
      });
      closePaymentModal();
      await userStore.loadUserProfile();
    } else {
      await showAlert({
        title: '결제 실패',
        message: '결제에 실패했습니다. 다시 시도해주세요.'
      });
      console.error('Purchase failed:', result.error);
    }
  } catch (error) {
    console.error('Purchase error:', error);
    await showAlert({
      title: '오류',
      message: '결제 중 오류가 발생했습니다.'
    });
  } finally {
    isLoading.value = false;
  }
};

const manageSub = async () => {
  const result = await showConfirm({
    title: '구독 관리',
    message: '구독을 취소하시겠습니까?\n\n⚠️ 경고: 구독 취소 시 모든 기록이 즉시 삭제됩니다!',
    confirmText: '구독 취소',
    cancelText: '돌아가기'
  });
  
  if (result) {
    try {
      isLoading.value = true;
      await userStore.cancelSubscription();
      await showAlert({
        title: '구독 취소 완료',
        message: '구독이 취소되고 모든 기록이 삭제되었습니다.'
      });
      
      // 프리미엄 상태 새로고침
      await userStore.refreshPremiumStatus();
    } catch (error) {
      console.error('구독 취소 실패:', error);
      await showAlert({
        title: '오류',
        message: '구독 취소에 실패했습니다. 다시 시도해주세요.'
      });
    } finally {
      isLoading.value = false;
    }
  }
};

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.premium {
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 50px;
}

.premium-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.hero-section h2 {
  font-size: 32px;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #A855F7 0%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.features-section,
.pricing-section,
.faq-section {
  margin-bottom: 50px;
}

.features-section h3,
.pricing-section h3,
.faq-section h3 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
  color: #A855F7;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 25px;
  text-align: center;
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 15px;
}

.feature-card h4 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #A855F7;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.pricing-card {
  padding: 30px;
  text-align: center;
  position: relative;
}

.pricing-card.featured {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.3);
}

.best-value {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #A855F7 0%, #F59E0B 100%);
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.plan-header h4 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #A855F7;
}

.price {
  margin-bottom: 10px;
}

.original-price {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin-right: 10px;
}

.amount {
  font-size: 36px;
  font-weight: 700;
  color: #A855F7;
}

.period {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.savings {
  color: #F59E0B;
  font-weight: 600;
  margin-bottom: 20px;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
}

.plan-features li {
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.subscribe-btn {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  margin-top: 20px;
}

.subscribe-btn.featured {
  background: linear-gradient(135deg, #A855F7 0%, #F59E0B 100%);
  box-shadow: 0 8px 30px rgba(168, 85, 247, 0.4);
}

.current-status {
  margin-bottom: 50px;
}

.status-card {
  padding: 30px;
  text-align: center;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.premium-status {
  color: #F59E0B;
}

.free-status {
  color: rgba(255, 255, 255, 0.7);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.faq-item {
  padding: 20px;
  text-align: left;
}

.faq-item h4 {
  color: #A855F7;
  margin-bottom: 10px;
}

.faq-item p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* 결제 모달 스타일 */
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.payment-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.payment-content h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #A855F7;
}

.selected-plan {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  margin-bottom: 25px;
}

.plan-price {
  font-size: 20px;
  font-weight: 600;
  color: #A855F7;
}

.payment-methods {
  margin-bottom: 25px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(168, 85, 247, 0.3);
}

.payment-method.selected {
  background: rgba(168, 85, 247, 0.1);
  border-color: #A855F7;
}

.method-icon {
  font-size: 20px;
}

.method-name {
  font-size: 16px;
  font-weight: 500;
}

.payment-actions {
  display: flex;
  gap: 15px;
}

.payment-actions .btn {
  flex: 1;
  padding: 12px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.subscription-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-outline {
  background: transparent;
  border: 1px solid #A855F7;
  color: #A855F7;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-outline:hover {
  background: rgba(168, 85, 247, 0.1);
}

@media (max-width: 768px) {
  .features-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-section h2 {
    font-size: 24px;
  }
  
  .premium-icon {
    font-size: 48px;
  }
}
</style>
