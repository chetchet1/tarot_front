<template>
  <div class="card-drawing">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>카드 뽑기</h1>
      <div v-if="!userStore.isPremium" class="free-usage-indicator">
        무료 사용: {{ userStore.freeReadingsToday }}/{{ userStore.maxFreeReadingsPerDay }}
      </div>
    </header>

    <div class="container">
      <!-- 카드 덱 -->
      <div class="deck-container" v-if="!isDrawing && !isComplete">
        <p class="instruction">카드를 섞고 있습니다...</p>
        <div class="card-back shuffling">
          🃏
        </div>
        <button 
          class="btn btn-primary draw-button"
          @click="startDrawing"
          :disabled="!userStore.isPremium && !userStore.canUseFreeReading"
        >
          {{ getDrawButtonText() }}
        </button>
        
        <!-- 무료 사용자 안내 -->
        <div v-if="!userStore.isPremium && !userStore.canUseFreeReading" class="free-limit-notice">
          <p>오늘의 무료 점괘를 모두 사용했습니다.</p>
          <button class="btn btn-premium" @click="router.push('/premium')">
            프리미엄으로 무제한 이용하기
          </button>
        </div>
      </div>

      <!-- 카드 뽑는 중 -->
      <div class="drawing-container" v-if="isDrawing">
        <p class="instruction">{{ getCardCount() }}장의 카드를 뽑고 있습니다...</p>
        <div class="card-animation">
          <div class="card-back" v-for="i in getCardCount()" :key="i" :class="`card-${i}`">
            🃏
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- 뽑힌 카드들 -->
      <div class="cards-container" v-if="isComplete && drawnCards.length > 0">
        <p class="instruction">당신의 카드입니다</p>
        <div class="drawn-cards">
          <div 
            v-for="(card, index) in drawnCards" 
            :key="index"
            class="drawn-card"
            :class="{ revealed: card.revealed }"
            @click="revealCard(index)"
          >
            <div class="card-front" v-if="card.revealed">
              <h3>{{ card.card.nameKr }}</h3>
              <p class="card-number">{{ card.card.name }}</p>
              <div class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </div>
            </div>
            <div class="card-back" v-else>
              🃏
              <p>클릭하여 공개</p>
            </div>
          </div>
        </div>

        <button 
          class="btn btn-primary result-button"
          @click="goToResult"
          :disabled="!allCardsRevealed"
        >
          해석 보기
        </button>
      </div>

      <!-- 광고 모달 (무료 사용자용) -->
      <AdModal v-if="showAdModal" @close="closeAdModal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { useTarotStore } from '@/store/tarot';
import { nativeUtils } from '@/utils/capacitor';

// AdModal을 동적 import로 변경
const AdModal = defineAsyncComponent(() => import('@/components/AdModal.vue'));

interface DrawnCardData {
  card: any; // TarotCard type
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const isDrawing = ref(false);
const isComplete = ref(false);
const progress = ref(0);
const drawnCards = ref<DrawnCardData[]>([]);
const showAdModal = ref(false);

const allCardsRevealed = computed(() => {
  return drawnCards.value.length > 0 && drawnCards.value.every(card => card.revealed);
});

// 카드 뽑기 버튼 텍스트
const getDrawButtonText = () => {
  if (!userStore.isPremium && !userStore.canUseFreeReading) {
    return '무료 횟수 소진';
  }
  return '카드 뽑기';
};

// 카드 개수 가져오기
const getCardCount = () => {
  return tarotStore.selectedSpread?.cardCount || 1;
};

onMounted(async () => {
  // 페이지 로드 시 카드 섞기 애니메이션
  setTimeout(() => {
    // 카드 준비 완료
  }, 1000);
  
  // 타로 스토어 초기화 확인
  if (tarotStore.tarotCards.length === 0) {
    console.log('카드 데이터가 비어있음, 초기화 시작');
    await tarotStore.initialize();
  }
  
  console.log('사용 가능한 카드 수:', tarotStore.tarotCards.length);
  console.log('선택된 스프레드:', tarotStore.selectedSpread);
});

const goBack = () => {
  router.go(-1);
};

const startDrawing = async () => {
  // 버튼 클릭 햇틱 피드백
  await nativeUtils.buttonTapHaptic();
  
  // 무료 사용자 체크
  if (!userStore.isPremium && !userStore.canUseFreeReading) {
    alert(`오늘의 무료 점괘 횟수를 모두 사용했습니다. (${userStore.freeReadingsToday}/${userStore.maxFreeReadingsPerDay})\n\n프리미엄으로 업그레이드하면 무제한 이용할 수 있습니다.`);
    router.push('/premium');
    return;
  }

  if (!userStore.isPremium) {
    showAdModal.value = true;
    return;
  }

  await drawCards();
};

const drawCards = async () => {
  isDrawing.value = true;
  progress.value = 0;

  // 카드 뛽기 햇틱 피드백
  await nativeUtils.cardDrawHaptic();

  // 프로그레스 바 애니메이션
  const progressInterval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(progressInterval);
    }
  }, 200);

  // 카드 뽑기 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 2500));

  // 카드 개수 (스프레드에 따라 결정)
  const cardCount = tarotStore.selectedSpread?.cardCount || 1;
  
  // 실제 타로카드 데이터에서 랜덤 선택
  const selectedCards = tarotStore.drawCards(cardCount);
  
  console.log('뽑힌 카드들:', selectedCards);

  tarotStore.setTempDrawnCards(selectedCards);

  drawnCards.value = selectedCards.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));

  isDrawing.value = false;
  isComplete.value = true;

  // 무료 사용자 카운트 증가
  userStore.incrementFreeReading();
};

const revealCard = async (index: number) => {
  // 카드 공개 햇틱 피드백
  await nativeUtils.buttonTapHaptic();
  drawnCards.value[index].revealed = true;
};

const goToResult = async () => {
  try {
    // 뽑힌 카드로 점괴 생성
    const reading = await tarotStore.createReading(
      tarotStore.selectedSpread?.spreadId || 'one_card',
      tarotStore.selectedTopic?.id || 'general',
      undefined, // 질문은 선택사항
      tarotStore.getTempDrawnCards() || undefined
    );
    
    // 점괴 결과 화면으로 이동
    router.push(`/reading-result?readingId=${reading.id}`);
  } catch (error) {
    console.error('점괴 생성 실패:', error);
    alert('점괴 생성에 실패했습니다. 다시 시도해주세요.');
  }
};

const closeAdModal = () => {
  showAdModal.value = false;
  drawCards();
};
</script>

<style scoped>
.card-drawing {
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
  position: relative;
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

.free-usage-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #A855F7;
  font-weight: 600;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.deck-container,
.drawing-container,
.cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.instruction {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.card-back {
  width: 120px;
  height: 180px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.shuffling {
  animation: shuffle 2s infinite;
}

@keyframes shuffle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.05); }
  75% { transform: rotate(5deg) scale(0.95); }
}

.draw-button {
  padding: 15px 30px;
  font-size: 18px;
}

.draw-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
}

.free-limit-notice {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.free-limit-notice p {
  color: #fecaca;
  margin-bottom: 15px;
  font-size: 16px;
}

.btn-premium {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.card-animation {
  position: relative;
  width: 200px;
  height: 180px;
}

.card-animation .card-back {
  position: absolute;
  width: 100px;
  height: 150px;
  font-size: 32px;
}

.card-1 { animation: card-float-1 2s infinite; }
.card-2 { animation: card-float-2 2s infinite 0.3s; }
.card-3 { animation: card-float-3 2s infinite 0.6s; }
.card-4 { animation: card-float-4 2s infinite 0.9s; }
.card-5 { animation: card-float-5 2s infinite 1.2s; }
.card-6 { animation: card-float-6 2s infinite 1.5s; }
.card-7 { animation: card-float-7 2s infinite 1.8s; }
.card-8 { animation: card-float-8 2s infinite 2.1s; }
.card-9 { animation: card-float-9 2s infinite 2.4s; }
.card-10 { animation: card-float-10 2s infinite 2.7s; }

@keyframes card-float-1 {
  0%, 100% { transform: translateX(-20px) translateY(0px) rotate(-10deg); }
  50% { transform: translateX(-20px) translateY(-20px) rotate(-10deg); }
}

@keyframes card-float-2 {
  0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
  50% { transform: translateX(0px) translateY(-30px) rotate(0deg); }
}

@keyframes card-float-3 {
  0%, 100% { transform: translateX(20px) translateY(0px) rotate(10deg); }
  50% { transform: translateX(20px) translateY(-20px) rotate(10deg); }
}

@keyframes card-float-4 {
  0%, 100% { transform: translateX(-30px) translateY(0px) rotate(-5deg); }
  50% { transform: translateX(-30px) translateY(-25px) rotate(-5deg); }
}

@keyframes card-float-5 {
  0%, 100% { transform: translateX(30px) translateY(0px) rotate(5deg); }
  50% { transform: translateX(30px) translateY(-25px) rotate(5deg); }
}

@keyframes card-float-6 {
  0%, 100% { transform: translateX(-10px) translateY(0px) rotate(-15deg); }
  50% { transform: translateX(-10px) translateY(-35px) rotate(-15deg); }
}

@keyframes card-float-7 {
  0%, 100% { transform: translateX(10px) translateY(0px) rotate(15deg); }
  50% { transform: translateX(10px) translateY(-35px) rotate(15deg); }
}

@keyframes card-float-8 {
  0%, 100% { transform: translateX(-40px) translateY(0px) rotate(-8deg); }
  50% { transform: translateX(-40px) translateY(-18px) rotate(-8deg); }
}

@keyframes card-float-9 {
  0%, 100% { transform: translateX(40px) translateY(0px) rotate(8deg); }
  50% { transform: translateX(40px) translateY(-18px) rotate(8deg); }
}

@keyframes card-float-10 {
  0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
  50% { transform: translateX(0px) translateY(-40px) rotate(0deg); }
}

.progress-bar {
  width: 300px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #A855F7 0%, #7C3AED 100%);
  transition: width 0.3s ease;
}

.drawn-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.drawn-card {
  width: 140px;
  height: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  perspective: 1000px;
}

.drawn-card:hover {
  transform: translateY(-10px);
}

.card-front,
.card-back {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  text-align: center;
}

.card-front {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
}

.card-front h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.card-number {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.card-orientation {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.card-orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.card-back {
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 32px;
}

.card-back p {
  font-size: 12px;
  margin-top: 10px;
}

.result-button {
  padding: 15px 30px;
  font-size: 18px;
}

.result-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .free-usage-indicator {
    position: static;
    transform: none;
    align-self: flex-end;
  }
  
  .drawn-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .card-animation {
    width: 150px;
  }
  
  .card-animation .card-back {
    width: 80px;
    height: 120px;
    font-size: 24px;
  }
}
</style>
