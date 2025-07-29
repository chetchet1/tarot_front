<template>
  <div class="premium-page">
    <!-- 헤더 -->
    <header class="header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="header-title">프리미엄 구독</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 프리미엄 혜택 -->
        <section class="benefits-section">
          <h2 class="section-title">✨ 프리미엄으로 더 깊은 통찰을 얻으세요</h2>
          
          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon">🚫</div>
              <h3>광고 제거</h3>
              <p>방해받지 않고 타로에 집중할 수 있습니다</p>
            </div>
            
            <div class="benefit-card">
              <div class="benefit-icon">🎴</div>
              <h3>고급 스프레드</h3>
              <p>켈틱 크로스, 관계 스프레드 등 전문가용 배열</p>
            </div>
            
            <div class="benefit-card">
              <div class="benefit-icon">♾️</div>
              <h3>무제한 점괘</h3>
              <p>하루 제한 없이 원하는 만큼 타로를 볼 수 있습니다</p>
            </div>
            
            <div class="benefit-card">
              <div class="benefit-icon">📚</div>
              <h3>무제한 히스토리</h3>
              <p>모든 점괘 기록을 영구 보관하고 분석</p>
            </div>
            
            <div class="benefit-card">
              <div class="benefit-icon">🔍</div>
              <h3>상세한 해석</h3>
              <p>전문가 수준의 깊이 있는 카드 해석</p>
            </div>
            
            <div class="benefit-card">
              <div class="benefit-icon">📤</div>
              <h3>공유 기능</h3>
              <p>점괘 결과를 이미지로 저장하고 공유</p>
            </div>
          </div>
        </section>

        <!-- 가격 플랜 -->
        <section class="pricing-section">
          <div class="price-card" :class="{ active: selectedPlan === 'monthly' }" @click="selectPlan('monthly')">
            <div class="price-header">
              <h3>월간 구독</h3>
              <div class="price">
                <span class="currency">₩</span>
                <span class="amount">2,900</span>
                <span class="period">/월</span>
              </div>
            </div>
            <p class="price-description">언제든지 취소 가능</p>
          </div>
          
          <div class="price-card popular" :class="{ active: selectedPlan === 'yearly' }" @click="selectPlan('yearly')">
            <div class="popular-badge">인기</div>
            <div class="price-header">
              <h3>연간 구독</h3>
              <div class="price">
                <span class="currency">₩</span>
                <span class="amount">19,900</span>
                <span class="period">/년</span>
              </div>
            </div>
            <p class="price-description">
              <span class="discount">42% 할인</span> • 월 ₩1,658
            </p>
          </div>
        </section>

        <!-- 구독 버튼 -->
        <div class="subscribe-section">
          <button @click="subscribe" class="subscribe-button" :disabled="isProcessing">
            <span v-if="!isProcessing">
              {{ selectedPlan === 'monthly' ? '월 ₩2,900으로 구독하기' : '연 ₩19,900으로 구독하기' }}
            </span>
            <span v-else>처리 중...</span>
          </button>
          
          <p class="terms">
            구독하면 <a href="#" @click.prevent="showTerms">이용약관</a>과 
            <a href="#" @click.prevent="showPrivacy">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        <!-- FAQ -->
        <section class="faq-section">
          <h2 class="section-title">자주 묻는 질문</h2>
          
          <div class="faq-list">
            <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
              <button @click="toggleFaq(index)" class="faq-question">
                <span>{{ faq.question }}</span>
                <span class="faq-arrow" :class="{ open: openFaq === index }">▼</span>
              </button>
              <div v-if="openFaq === index" class="faq-answer">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </section>

        <!-- 복원 구매 -->
        <div class="restore-section" v-if="isNative">
          <button @click="restorePurchases" class="restore-button">
            이전 구매 복원
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { NativeUtils } from '../utils/capacitor';

const router = useRouter();
const userStore = useUserStore();

// 상태
const selectedPlan = ref<'monthly' | 'yearly'>('yearly');
const isProcessing = ref(false);
const openFaq = ref<number | null>(null);
const isNative = NativeUtils.isNative;

// FAQ 데이터
const faqs = [
  {
    question: '구독은 언제든지 취소할 수 있나요?',
    answer: '네, 언제든지 취소할 수 있습니다. 취소해도 구독 기간이 끝날 때까지 프리미엄 기능을 사용할 수 있습니다.'
  },
  {
    question: '무료 체험 기간이 있나요?',
    answer: '현재는 무료 체험을 제공하지 않지만, 무료 사용자도 하루 3회까지 기본 스프레드를 이용할 수 있습니다.'
  },
  {
    question: '결제 수단은 무엇을 지원하나요?',
    answer: '앱스토어와 구글 플레이스토어에서 지원하는 모든 결제 수단을 사용할 수 있습니다.'
  },
  {
    question: '구독을 해지하면 데이터가 삭제되나요?',
    answer: '아니요, 모든 데이터는 안전하게 보관됩니다. 다시 구독하시면 이전 데이터를 그대로 사용할 수 있습니다.'
  }
];

// 플랜 선택
const selectPlan = (plan: 'monthly' | 'yearly') => {
  selectedPlan.value = plan;
};

// 구독하기
const subscribe = async () => {
  if (isProcessing.value) return;
  
  await NativeUtils.buttonTapHaptic();
  isProcessing.value = true;
  
  try {
    if (isNative) {
      // 네이티브 인앱 구매
      // RevenueCat 또는 Capacitor Purchase plugin 사용
      console.log('네이티브 구매 시작:', selectedPlan.value);
    } else {
      // 웹 결제 (Stripe, PayPal 등)
      console.log('웹 결제 시작:', selectedPlan.value);
    }
    
    // 임시 테스트 코드
    setTimeout(() => {
      userStore.setPremium(true);
      alert('프리미엄 구독이 완료되었습니다! 🎉');
      router.push('/');
    }, 2000);
    
  } catch (error) {
    console.error('구독 실패:', error);
    alert('구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isProcessing.value = false;
  }
};

// FAQ 토글
const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};

// 이용약관
const showTerms = () => {
  window.open('https://tarot-garden.com/terms', '_blank');
};

// 개인정보처리방침
const showPrivacy = () => {
  window.open('https://tarot-garden.com/privacy', '_blank');
};

// 구매 복원
const restorePurchases = async () => {
  await NativeUtils.buttonTapHaptic();
  
  try {
    // RevenueCat 또는 Capacitor Purchase plugin으로 구매 복원
    console.log('구매 복원 시작');
    alert('구매 복원이 완료되었습니다.');
  } catch (error) {
    console.error('구매 복원 실패:', error);
    alert('구매 복원에 실패했습니다. 다시 시도해주세요.');
  }
};

// 뒤로가기
const goBack = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/');
};
</script>

<style scoped>
.premium-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(45, 42, 92, 0.3);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.back-button:hover {
  opacity: 0.8;
}

.header-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
  flex: 1;
}

.header-spacer {
  width: 40px;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

/* 혜택 섹션 */
.benefits-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin: 0 0 2rem;
  color: white;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.benefit-card {
  background: rgba(45, 42, 92, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  border-color: rgba(168, 85, 247, 0.5);
}

.benefit-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.benefit-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: white;
}

.benefit-card p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* 가격 섹션 */
.pricing-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.price-card {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.price-card:hover {
  border-color: rgba(168, 85, 247, 0.5);
}

.price-card.active {
  border-color: #A855F7;
  background: rgba(168, 85, 247, 0.1);
}

.price-card.popular {
  border-color: rgba(245, 158, 11, 0.5);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  padding: 0.25rem 1rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 600;
}

.price-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  text-align: center;
  color: white;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.currency {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
}

.amount {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
}

.period {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.price-description {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.discount {
  color: #10B981;
  font-weight: 600;
}

/* 구독 섹션 */
.subscribe-section {
  text-align: center;
  margin-bottom: 3rem;
}

.subscribe-button {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
}

.subscribe-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
}

.subscribe-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.terms {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.terms a {
  color: #A855F7;
  text-decoration: underline;
}

/* FAQ 섹션 */
.faq-section {
  margin-bottom: 2rem;
}

.faq-list {
  background: rgba(45, 42, 92, 0.4);
  border-radius: 15px;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  width: 100%;
  padding: 1.25rem;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
}

.faq-question:hover {
  background: rgba(255, 255, 255, 0.05);
}

.faq-arrow {
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.faq-arrow.open {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1.25rem 1.25rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* 복원 섹션 */
.restore-section {
  text-align: center;
  padding: 2rem 0;
}

.restore-button {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restore-button:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .pricing-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .benefit-card {
    padding: 1rem;
  }
  
  .benefit-icon {
    font-size: 2rem;
  }
  
  .price-card {
    padding: 1.5rem;
  }
  
  .amount {
    font-size: 2rem;
  }
}
</style>
