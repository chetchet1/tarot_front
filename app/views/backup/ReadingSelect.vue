<template>
  <div class="reading-select-page">
    <!-- 헤더 -->
    <header class="header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="header-title">타로 점보기</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper">
        <h2 class="section-title">어떤 점괘를 보시겠습니까?</h2>
        
        <!-- 스프레드 목록 -->
        <div class="spread-list">
          <div 
            v-for="spread in availableSpreads" 
            :key="spread.id"
            class="spread-card"
            :class="{ 
              'premium': spread.isPremium && !user?.isPremium,
              'disabled': spread.isPremium && !user?.isPremium 
            }"
            @click="selectSpread(spread)"
          >
            <div class="spread-header">
              <h3 class="spread-name">{{ spread.name }}</h3>
              <span v-if="spread.isPremium" class="premium-badge">
                {{ user?.isPremium ? '✨' : '🔒 프리미엄' }}
              </span>
            </div>
            
            <p class="spread-description">{{ spread.description }}</p>
            
            <div class="spread-info">
              <span class="card-count">
                <span class="icon">🎴</span> {{ spread.cardCount }}장
              </span>
              <span class="duration">
                <span class="icon">⏱️</span> {{ spread.duration }}
              </span>
            </div>
            
            <!-- 스프레드 레이아웃 미리보기 -->
            <div class="spread-preview">
              <div 
                v-for="position in spread.positions" 
                :key="position.id"
                class="preview-card"
                :style="getPreviewCardStyle(position, spread.positions.length)"
              >
                {{ position.id }}
              </div>
            </div>
          </div>
        </div>

        <!-- 프리미엄 안내 (무료 사용자에게만 표시) -->
        <div v-if="!user?.isPremium" class="premium-notice">
          <h3>🌟 더 많은 스프레드를 원하시나요?</h3>
          <p>프리미엄 구독으로 켈틱 크로스 등 고급 스프레드를 이용해보세요!</p>
          <button @click="goToPremium" class="premium-cta-button">
            프리미엄 구독하기
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { spreads } from '../data/spreads';
import { NativeUtils } from '../utils/capacitor';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const user = computed(() => userStore.currentUser);

// 사용 가능한 스프레드 목록
const availableSpreads = computed(() => {
  return spreads.map(spread => ({
    ...spread,
    duration: spread.cardCount <= 3 ? '5-10분' : spread.cardCount <= 5 ? '10-15분' : '20-30분'
  }));
});

// 스프레드 선택
const selectSpread = async (spread: any) => {
  // 햅틱 피드백
  await NativeUtils.buttonTapHaptic();
  
  // 프리미엄 스프레드 체크
  if (spread.isPremium && !user.value?.isPremium) {
    const result = confirm('이 스프레드는 프리미엄 사용자만 이용할 수 있습니다.\n프리미엄으로 업그레이드하시겠습니까?');
    
    if (result) {
      goToPremium();
    }
    return;
  }
  
  // 무료 사용자 횟수 체크
  if (!user.value?.isPremium) {
    const status = userStore.getFreeReadingStatus();
    if (!status.canUse) {
      const result = confirm(`오늘 무료 점괘 ${status.total}회를 모두 사용하셨습니다.\n프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.\n\n프리미엄 보기로 이동하시겠습니까?`);
      
      if (result) {
        goToPremium();
      }
      return;
    }
  }
  
  // 스프레드 설정하고 카드 뽑기 페이지로 이동
  tarotStore.setCurrentSpread(spread.id);
  router.push('/card-drawing');
};

// 미리보기 카드 스타일 계산
const getPreviewCardStyle = (position: any, totalCards: number) => {
  // 카드 수에 따라 레이아웃 조정
  const baseSize = totalCards <= 3 ? 40 : totalCards <= 5 ? 35 : 30;
  const spacing = totalCards <= 3 ? 50 : totalCards <= 5 ? 40 : 35;
  
  // 포지션 인덱스에 따라 위치 계산
  const index = position.id - 1;
  const row = Math.floor(index / 3);
  const col = index % 3;
  
  return {
    width: `${baseSize}px`,
    height: `${baseSize * 1.4}px`,
    position: 'absolute',
    left: `${50 + (col - 1) * spacing}%`,
    top: `${50 + row * spacing}%`,
    transform: 'translate(-50%, -50%)',
    fontSize: '12px'
  };
};

// 뒤로가기
const goBack = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/');
};

// 프리미엄 페이지로 이동
const goToPremium = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/premium');
};
</script>

<style scoped>
.reading-select-page {
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

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

/* 스프레드 리스트 */
.spread-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.spread-card {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 250px;
}

.spread-card:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(168, 85, 247, 0.5);
}

.spread-card.premium {
  border-color: rgba(245, 158, 11, 0.5);
}

.spread-card.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.spread-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  color: white;
}

.premium-badge {
  font-size: 0.875rem;
  color: #F59E0B;
  font-weight: 500;
}

.spread-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.spread-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-count,
.duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.icon {
  font-size: 1rem;
}

/* 스프레드 미리보기 */
.spread-preview {
  position: relative;
  height: 120px;
  margin-top: 1rem;
}

.preview-card {
  background: rgba(62, 59, 110, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* 프리미엄 안내 */
.premium-notice {
  background: rgba(245, 158, 11, 0.1);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  margin-top: 2rem;
}

.premium-notice h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #F59E0B;
}

.premium-notice p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.premium-cta-button {
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

.premium-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .spread-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section-title {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .spread-card {
    padding: 1rem;
    min-height: 220px;
  }
  
  .spread-name {
    font-size: 1.1rem;
  }
  
  .spread-preview {
    height: 100px;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .spread-card:hover {
    transform: none;
  }
}
</style>