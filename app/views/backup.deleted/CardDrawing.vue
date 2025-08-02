<template>
  <div class="card-drawing-page">
    <!-- 헤더 -->
    <header class="header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="header-title">{{ currentSpread?.name }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 진행 상태 -->
        <div class="progress-section">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <p class="progress-text">
            {{ drawnCards.length }} / {{ currentSpread?.cardCount || 0 }}장 선택됨
          </p>
        </div>

        <!-- 현재 위치 설명 -->
        <div v-if="currentPosition" class="position-info">
          <h2 class="position-name">{{ currentPosition.name }}</h2>
          <p class="position-description">{{ currentPosition.description }}</p>
        </div>

        <!-- 카드 덱 -->
        <div class="card-deck-section">
          <div class="instruction">
            <p v-if="!isDrawing">카드를 탭하여 뽑아주세요</p>
            <p v-else>카드를 뽑는 중...</p>
          </div>

          <div class="card-deck" @click="drawCard">
            <div class="deck-cards">
              <!-- 덱 카드들 -->
              <div 
                v-for="i in 5" 
                :key="i" 
                class="deck-card"
                :style="{ 
                  transform: `translateX(${(i - 3) * 2}px) translateY(${(i - 3) * 2}px)`,
                  zIndex: i
                }"
              ></div>
            </div>
            
            <!-- 뽑는 카드 애니메이션 -->
            <transition name="card-draw">
              <div v-if="isDrawing" class="drawing-card">
                🎴
              </div>
            </transition>
          </div>
        </div>

        <!-- 뽑은 카드들 -->
        <div class="drawn-cards-section">
          <h3 class="section-title">뽑은 카드</h3>
          <div class="drawn-cards">
            <div 
              v-for="(cardInfo, index) in drawnCards" 
              :key="index"
              class="drawn-card"
            >
              <div class="card-number">{{ index + 1 }}</div>
              <div class="card-image">{{ cardInfo.card.imageUrl || '🎴' }}</div>
              <p class="card-name">{{ cardInfo.card.nameKr }}</p>
              <p class="card-position">{{ cardInfo.position.name }}</p>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="action-buttons">
          <button 
            v-if="isComplete"
            @click="showResult"
            class="result-button"
          >
            결과 보기
          </button>
        </div>
      </div>
    </main>

    <!-- 광고 모달 (무료 사용자) -->
    <AdModal 
      v-if="showAdModal" 
      @close="closeAd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { TarotCard } from '../models/tarot';
import { spreads } from '../data/spreads';
import { NativeUtils } from '../utils/capacitor';
import AdModal from '../components/AdModal.vue';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// 현재 스프레드
const currentSpread = computed(() => {
  const spreadId = tarotStore.currentSpread;
  return spreads.find(s => s.id === spreadId);
});

// 현재 위치
const currentPosition = computed(() => {
  if (!currentSpread.value) return null;
  const positionIndex = drawnCards.value.length;
  return currentSpread.value.positions[positionIndex] || null;
});

// 진행률
const progressPercentage = computed(() => {
  if (!currentSpread.value) return 0;
  return (drawnCards.value.length / currentSpread.value.cardCount) * 100;
});

// 완료 여부
const isComplete = computed(() => {
  if (!currentSpread.value) return false;
  return drawnCards.value.length >= currentSpread.value.cardCount;
});

// 상태
const drawnCards = ref<Array<{ card: TarotCard; position: any }>>([]);
const isDrawing = ref(false);
const showAdModal = ref(false);

onMounted(() => {
  // 스프레드가 선택되지 않았으면 선택 페이지로
  if (!currentSpread.value) {
    router.push('/reading-select');
  }
});

// 카드 뽑기
const drawCard = async () => {
  if (isDrawing.value || isComplete.value) return;

  // 햅틱 피드백
  await NativeUtils.cardDrawHaptic();

  isDrawing.value = true;

  // 애니메이션 대기
  setTimeout(() => {
    // 카드 뽑기
    const card = tarotStore.drawRandomCard();
    const position = currentPosition.value;

    if (card && position) {
      drawnCards.value.push({ card, position });
    }

    isDrawing.value = false;

    // 완료되면 광고 표시 (무료 사용자)
    if (isComplete.value && !userStore.currentUser?.isPremium) {
      showAdModal.value = true;
      
      // 무료 사용 횟수 증가
      userStore.incrementFreeReading();
    }
  }, 800);
};

// 결과 보기
const showResult = async () => {
  if (!isComplete.value || !currentSpread.value) return;

  // 햅틱 피드백
  await NativeUtils.buttonTapHaptic();

  // 리딩 결과 저장
  const reading = {
    spreadId: currentSpread.value.id,
    cards: drawnCards.value,
    date: new Date().toISOString(),
  };

  tarotStore.saveReading(reading);

  // 결과 페이지로 이동
  router.push('/reading-result');
};

// 광고 닫기
const closeAd = () => {
  showAdModal.value = false;
};

// 뒤로가기
const goBack = async () => {
  await NativeUtils.buttonTapHaptic();
  
  if (drawnCards.value.length > 0) {
    const confirm = window.confirm('카드 뽑기를 중단하시겠습니까?');
    if (!confirm) return;
  }
  
  router.push('/reading-select');
};
</script>

<style scoped>
.card-drawing-page {
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
  max-width: 600px;
  margin: 0 auto;
}

/* 진행 상태 */
.progress-section {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 8px;
  background: rgba(62, 59, 110, 0.6);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 위치 정보 */
.position-info {
  text-align: center;
  margin-bottom: 2rem;
}

.position-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  color: white;
}

.position-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 카드 덱 섹션 */
.card-deck-section {
  text-align: center;
  margin-bottom: 3rem;
}

.instruction {
  margin-bottom: 1.5rem;
}

.instruction p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.card-deck {
  position: relative;
  width: 120px;
  height: 180px;
  margin: 0 auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card-deck:hover {
  transform: scale(1.05);
}

.card-deck:active {
  transform: scale(0.95);
}

.deck-cards {
  position: relative;
  width: 100%;
  height: 100%;
}

.deck-card {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4C1D95 0%, #5B21B6 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 카드 뽑기 애니메이션 */
.drawing-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  animation: card-flip 0.8s ease-in-out;
}

@keyframes card-flip {
  0% {
    transform: translate(-50%, -50%) rotateY(0deg) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) rotateY(180deg) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotateY(360deg) scale(1);
    opacity: 0;
  }
}

.card-draw-enter-active,
.card-draw-leave-active {
  transition: all 0.8s ease;
}

.card-draw-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

.card-draw-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.5);
}

/* 뽑은 카드들 */
.drawn-cards-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  color: white;
}

.drawn-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.drawn-card {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  position: relative;
}

.card-number {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(168, 85, 247, 0.8);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
}

.card-image {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.card-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: white;
}

.card-position {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 액션 버튼 */
.action-buttons {
  text-align: center;
  margin-top: 2rem;
}

.result-button {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 30px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.result-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .position-name {
    font-size: 1.25rem;
  }
  
  .drawn-cards {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .card-deck {
    width: 100px;
    height: 150px;
  }
  
  .drawing-card {
    font-size: 3rem;
  }
  
  .drawn-card {
    padding: 0.75rem;
  }
  
  .card-image {
    font-size: 2.5rem;
  }
  
  .result-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .drawing-card {
    animation: none;
  }
  
  .card-deck:hover {
    transform: none;
  }
}
</style>