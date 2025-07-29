<template>
  <div class="reading-result-page">
    <!-- 헤더 -->
    <header class="header">
      <button @click="goHome" class="back-button">
        ← 홈으로
      </button>
      <h1 class="header-title">점괘 결과</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper" v-if="currentReading">
        <!-- 스프레드 정보 -->
        <div class="spread-info">
          <h2 class="spread-name">{{ spreadInfo?.name }}</h2>
          <p class="reading-date">{{ formatDate(currentReading.date) }}</p>
        </div>

        <!-- 카드 결과들 -->
        <div class="cards-result">
          <div 
            v-for="(cardInfo, index) in currentReading.cards" 
            :key="index"
            class="card-result"
          >
            <div class="card-header">
              <span class="position-number">{{ index + 1 }}</span>
              <h3 class="position-name">{{ cardInfo.position.name }}</h3>
            </div>
            
            <div class="card-content">
              <div class="card-visual">
                <div class="card-image">{{ cardInfo.card.imageUrl || '🎴' }}</div>
                <h4 class="card-name">{{ cardInfo.card.nameKr }}</h4>
                <p class="card-name-en">{{ cardInfo.card.name }}</p>
              </div>
              
              <div class="card-interpretation">
                <p class="position-meaning">
                  <strong>이 위치의 의미:</strong> {{ cardInfo.position.description }}
                </p>
                
                <div class="card-meaning">
                  <h5>카드 해석</h5>
                  <p>{{ getCardMeaning(cardInfo.card, cardInfo.position) }}</p>
                </div>
                
                <div class="keywords">
                  <span class="keyword" v-for="keyword in cardInfo.card.keywords" :key="keyword">
                    {{ keyword }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 전체 해석 -->
        <div class="overall-interpretation">
          <h3>종합 해석</h3>
          <p>{{ getOverallInterpretation() }}</p>
        </div>

        <!-- 액션 버튼들 -->
        <div class="action-buttons">
          <button @click="shareReading" class="share-button" v-if="canShare">
            📤 공유하기
          </button>
          <button @click="saveAsImage" class="save-button">
            💾 이미지로 저장
          </button>
          <button @click="newReading" class="new-reading-button">
            🎴 새로운 점보기
          </button>
        </div>

        <!-- 프리미엄 프로모션 (무료 사용자) -->
        <div v-if="!user?.isPremium" class="premium-promo">
          <h4>🌟 더 깊은 해석을 원하시나요?</h4>
          <p>프리미엄 구독으로 전문가 수준의 상세한 해석을 받아보세요!</p>
          <button @click="goToPremium" class="premium-button">
            프리미엄 구독하기
          </button>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-else class="loading-state">
        <div class="loading-spinner">🔮</div>
        <p>점괘 결과를 불러오는 중...</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { spreads } from '../data/spreads';
import { NativeUtils } from '../utils/capacitor';
import { TarotCard } from '../models/tarot';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// computed
const user = computed(() => userStore.currentUser);
const currentReading = computed(() => tarotStore.currentReading);
const spreadInfo = computed(() => {
  if (!currentReading.value) return null;
  return spreads.find(s => s.id === currentReading.value.spreadId);
});

// 공유 가능 여부 (웹에서는 Web Share API 지원 확인)
const canShare = computed(() => {
  if (NativeUtils.isNative) return true;
  return 'share' in navigator;
});

onMounted(() => {
  // 현재 리딩이 없으면 홈으로
  if (!currentReading.value) {
    router.push('/');
  }
});

// 날짜 포맷
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 카드 의미 가져오기
const getCardMeaning = (card: TarotCard, position: any) => {
  // 포지션에 따라 다른 의미 반환
  // 여기서는 일반적인 정방향 의미를 반환
  return card.meanings.general.upright;
};

// 전체 해석 생성
const getOverallInterpretation = () => {
  if (!currentReading.value || !spreadInfo.value) return '';
  
  const cards = currentReading.value.cards;
  const spreadName = spreadInfo.value.name;
  
  // 스프레드별 종합 해석 로직
  switch (spreadInfo.value.id) {
    case 'three-card':
      return `과거의 ${cards[0].card.nameKr} 카드는 지나온 길을 보여주고, 현재의 ${cards[1].card.nameKr} 카드는 지금의 상황을, 미래의 ${cards[2].card.nameKr} 카드는 앞으로의 가능성을 제시합니다. 전체적으로 보면, 당신의 여정은 변화와 성장의 과정에 있으며, 긍정적인 방향으로 나아가고 있습니다.`;
    
    case 'five-card':
      return `현재 상황을 나타내는 ${cards[0].card.nameKr} 카드를 중심으로, 과거의 영향과 미래의 가능성, 그리고 잠재된 요소들이 복잡하게 얽혀 있습니다. 특히 ${cards[4].card.nameKr} 카드가 보여주는 최종 결과는 당신의 선택과 행동에 따라 달라질 수 있음을 시사합니다.`;
    
    default:
      return '카드들이 보여주는 전체적인 메시지는 균형과 조화를 추구하며, 내면의 지혜를 신뢰하라는 것입니다.';
  }
};

// 공유하기
const shareReading = async () => {
  await NativeUtils.buttonTapHaptic();
  
  const shareData = {
    title: '타로 점괘 결과',
    text: `${spreadInfo.value?.name} 스프레드로 본 나의 운세`,
    url: window.location.href
  };
  
  try {
    if (NativeUtils.isNative) {
      // 네이티브 공유
      // Capacitor Share Plugin 사용
    } else if (navigator.share) {
      // Web Share API
      await navigator.share(shareData);
    }
  } catch (error) {
    console.error('공유 실패:', error);
  }
};

// 이미지로 저장
const saveAsImage = async () => {
  await NativeUtils.buttonTapHaptic();
  
  // Canvas API를 사용하여 결과를 이미지로 변환
  // 구현 예정
  alert('이미지 저장 기능은 준비 중입니다.');
};

// 새로운 점보기
const newReading = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/reading-select');
};

// 홈으로
const goHome = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/');
};

// 프리미엄 페이지로
const goToPremium = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/premium');
};
</script>

<style scoped>
.reading-result-page {
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
  width: 60px;
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

/* 스프레드 정보 */
.spread-info {
  text-align: center;
  margin-bottom: 2rem;
}

.spread-name {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  color: white;
}

.reading-date {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 카드 결과 */
.cards-result {
  margin-bottom: 3rem;
}

.card-result {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.position-number {
  background: rgba(168, 85, 247, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.position-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  color: white;
}

.card-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
  align-items: start;
}

.card-visual {
  text-align: center;
}

.card-image {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.card-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: white;
}

.card-name-en {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.card-interpretation {
  flex: 1;
}

.position-meaning {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.card-meaning {
  margin-bottom: 1rem;
}

.card-meaning h5 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #A855F7;
}

.card-meaning p {
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.5);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  color: #E9D5FF;
}

/* 전체 해석 */
.overall-interpretation {
  background: rgba(168, 85, 247, 0.1);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.overall-interpretation h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem;
  color: #A855F7;
}

.overall-interpretation p {
  font-size: 1rem;
  line-height: 1.8;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.share-button,
.save-button,
.new-reading-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-button {
  background: rgba(59, 130, 246, 0.8);
  color: white;
}

.save-button {
  background: rgba(34, 197, 94, 0.8);
  color: white;
}

.new-reading-button {
  background: rgba(168, 85, 247, 0.8);
  color: white;
}

.share-button:hover,
.save-button:hover,
.new-reading-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* 프리미엄 프로모션 */
.premium-promo {
  background: rgba(245, 158, 11, 0.1);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
}

.premium-promo h4 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
  color: #F59E0B;
}

.premium-promo p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem;
}

.premium-button {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  font-size: 4rem;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .card-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .card-visual {
    margin-bottom: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .share-button,
  .save-button,
  .new-reading-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .spread-name {
    font-size: 1.5rem;
  }
  
  .card-result {
    padding: 1rem;
  }
  
  .overall-interpretation {
    padding: 1.5rem;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
}
</style>