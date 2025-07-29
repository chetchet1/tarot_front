<template>
  <div class="home-page">
    <!-- 헤더 -->
    <header class="header">
      <h1 class="header-title">🔮 타로의 정원</h1>
      <p class="header-subtitle">당신의 운명을 들여다보세요</p>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 오늘의 카드 섹션 -->
      <section class="daily-card-section" @click="showDailyCard">
        <h2 class="section-title">오늘의 카드</h2>
        <div class="daily-card-container">
          <div v-if="dailyCard" class="daily-card">
            <div class="card-image">{{ dailyCard.imageUrl || '🎴' }}</div>
            <p class="card-name">{{ dailyCard.nameKr }}</p>
          </div>
          <div v-else class="daily-card-placeholder">
            <div class="placeholder-icon">🎴</div>
            <p>탭하여 오늘의 카드를 뽑으세요</p>
          </div>
        </div>
      </section>

      <!-- 무료 점괘 사용 현황 (무료 사용자에게만 표시) -->
      <section v-if="!user?.isPremium" class="free-usage-section">
        <div class="usage-info">
          <span class="usage-text">오늘의 무료 점괘: {{ freeReadingsToday }}/{{ maxFreeReadingsPerDay }}</span>
          <div class="usage-progress">
            <div 
              class="usage-progress-bar"
              :style="{ width: `${(freeReadingsToday / maxFreeReadingsPerDay) * 100}%` }"
            ></div>
          </div>
        </div>
      </section>

      <!-- 메뉴 버튼들 -->
      <section class="menu-section">
        <button 
          class="menu-button primary-button"
          :class="{ disabled: !user?.isPremium && !canUseFreeReading }"
          @click="goToReading"
        >
          🎴 타로 점보기
        </button>
        
        <button class="menu-button secondary-button" @click="goToHistory">
          📚 점괘 기록
        </button>
        
        <button class="menu-button secondary-button" @click="goToCardDictionary">
          📖 타로카드 사전
        </button>
        
        <button 
          v-if="!user?.isPremium"
          class="menu-button premium-button" 
          @click="goToPremium"
        >
          ✨ 프리미엄 구독
        </button>
        
        <button class="menu-button secondary-button" @click="goToSettings">
          ⚙️ 설정
        </button>
        
        <!-- 개발용 테스트 버튼 -->
        <button 
          v-if="!user?.isPremium"
          class="menu-button test-button" 
          @click="resetFreeReadings"
        >
          🔄 무료 점괘 초기화 (테스트용)
        </button>
      </section>

      <!-- 프리미엄 프로모션 (무료 사용자에게만 표시) -->
      <section v-if="!user?.isPremium" class="promo-section">
        <h3 class="promo-title">🌟 프리미엄 혜택</h3>
        <ul class="promo-features">
          <li>• 광고 제거</li>
          <li>• 켈틱 크로스 등 고급 배열</li>
          <li>• 무제한 히스토리 저장</li>
          <li>• 점괘 결과 공유</li>
        </ul>
        <p class="promo-price">월 2,900원</p>
      </section>
    </main>

    <!-- 광고 모달 -->
    <div v-if="showAdModal" class="ad-modal" @click="closeAd">
      <div class="ad-content">
        <div class="ad-placeholder">
          <p>📺 광고</p>
          <p>5초 후 자동으로 닫힙니다...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { TarotCard } from '../models/tarot';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// reactive computed properties
const user = computed(() => userStore.currentUser);
const freeReadingsToday = computed(() => userStore.freeReadingsToday);
const maxFreeReadingsPerDay = computed(() => userStore.maxFreeReadingsPerDay);
const canUseFreeReading = computed(() => userStore.canUseFreeReading);
const dailyCard = ref<TarotCard | null>(null);
const showAdModal = ref(false);

onMounted(async () => {
  // 사용자 초기화 (이미 main.ts에서 시작되었을 수 있음)
  if (!userStore.currentUser || userStore.isLoading) {
    await userStore.initializeUser();
  }
  
  // 타로 스토어 초기화 (비동기)
  await tarotStore.initialize();
  
  tarotStore.loadReadings();
  tarotStore.loadDailyCard();
  
  // 저장된 오늘의 카드 확인
  const today = new Date().toDateString();
  const savedDaily = tarotStore.getDailyCard();
  
  if (savedDaily && savedDaily.date === today) {
    dailyCard.value = savedDaily.card;
  }
});

const showDailyCard = async () => {
  if (!dailyCard.value) {
    // 광고 표시 (무료 사용자)
    if (!user.value?.isPremium) {
      showAdModal.value = true;
      setTimeout(() => {
        showAdModal.value = false;
      }, 5000);
    }
    
    // 카드 뽑기
    const card = tarotStore.drawDailyCard();
    dailyCard.value = card;
  }
  
  // 카드 상세 보기 (임시로 알림 표시)
  alert(`${dailyCard.value.nameKr}\n\n${dailyCard.value.meanings.general.upright}`);
};

const closeAd = () => {
  showAdModal.value = false;
};

const goToReading = async () => {
  // 무료 사용자는 사용 횟수 체크
  if (!user.value?.isPremium) {
    const status = userStore.getFreeReadingStatus();
    if (!status.canUse) {
      const result = confirm(`오늘 무료 점괘 ${status.total}회를 모두 사용하셨습니다. 프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.\n\n프리미엄 보기로 이동하시겠습니까?`);
      
      if (result) {
        goToPremium();
      }
      return;
    }
  }
  
  router.push('/reading-select');
};

const goToHistory = () => router.push('/history');
const goToCardDictionary = () => router.push('/card-dictionary');
const goToPremium = () => router.push('/premium');
const goToSettings = () => router.push('/settings');

// 개발용 테스트 함수
const resetFreeReadings = () => {
  userStore.resetFreeReadings();
  alert('무료 점괘 횟수가 초기화되었습니다.');
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  padding: 0;
  overflow-x: hidden;
}

.header {
  text-align: center;
  padding: 2rem 1rem 1rem;
  background: rgba(45, 42, 92, 0.3);
  backdrop-filter: blur(10px);
}

.header-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.main-content {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.daily-card-section {
  background: rgba(45, 42, 92, 0.6);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.daily-card-section:hover {
  transform: translateY(-2px);
}

.section-title {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  margin: 0 0 1rem;
}

.daily-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background: rgba(62, 59, 110, 0.4);
  border-radius: 10px;
  padding: 1rem;
}

.daily-card {
  text-align: center;
}

.card-image {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.card-name {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.daily-card-placeholder {
  text-align: center;
  opacity: 0.6;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.free-usage-section {
  background: rgba(45, 42, 92, 0.6);
  border: 1px solid #7C3AED;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.usage-info {
  text-align: center;
}

.usage-text {
  font-size: 0.9rem;
  color: #E5E7EB;
  display: block;
  margin-bottom: 0.5rem;
}

.usage-progress {
  height: 8px;
  background: rgba(62, 59, 110, 0.6);
  border-radius: 4px;
  overflow: hidden;
}

.usage-progress-bar {
  height: 100%;
  background: #7C3AED;
  transition: width 0.3s ease;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.menu-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.menu-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #6B7280;
  color: white;
}

.primary-button {
  background: #7C3AED;
  color: white;
}

.secondary-button {
  background: rgba(62, 59, 110, 0.8);
  color: white;
}

.premium-button {
  background: linear-gradient(45deg, #7C3AED, #F59E0B);
  color: white;
  font-weight: bold;
}

.test-button {
  background: #EF4444;
  color: white;
  font-size: 0.8rem;
  padding: 0.75rem;
}

.promo-section {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid #F59E0B;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
}

.promo-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #F59E0B;
  margin: 0 0 1rem;
}

.promo-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}

.promo-features li {
  font-size: 0.9rem;
  color: #E5E7EB;
  margin-bottom: 0.25rem;
}

.promo-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #F59E0B;
  margin: 0;
}

.ad-modal {
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
}

.ad-content {
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  max-width: 300px;
  width: 90%;
}

.ad-placeholder {
  font-size: 1.1rem;
}

.ad-placeholder p {
  margin: 0.5rem 0;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .header {
    padding: 1.5rem 1rem 0.5rem;
  }
  
  .header-title {
    font-size: 1.75rem;
  }
  
  .main-content {
    padding: 0.75rem;
  }
  
  .daily-card-section {
    padding: 1rem;
  }
  
  .card-image {
    font-size: 3rem;
  }
}
</style>
