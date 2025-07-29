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
              <div class="card-image">
                <img :src="getCardImageUrl(card.card)" :alt="card.card.nameKr" @error="onImageError" />
              </div>
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

// 카드 이미지 URL 생성 함수
const getCardImageUrl = (card: any) => {
  try {
    // Supabase에서 오는 imageUrl이 있다면 먼저 처리
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      // 수트 폴더가 포함된 경로를 수정 (실제 파일은 minor 폴더 바로 아래에 있음)
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
      // 메이저 아르카나 파일명 대소문자 수정
      if (finalUrl.includes('/assets/tarot-cards/major/')) {
        // 소문자로 되어 있는 파일명을 실제 파일명으로 변경
        const corrections = {
          '00-the-fool.png': '00-the-Fool.png',
          '01-the-magician.png': '01-The-Magician.png',
          '02-the-high-priestess.png': '02-The-High-Priestess.png',
          '03-the-empress.png': '03-The-Empress.png',
          '04-the-emperor.png': '04-The-Emperor.png',
          '05-the-hierophant.png': '05-The-Hierophant.png',
          '06-the-lovers.png': '06-The-Lovers.png',
          '07-the-chariot.png': '07-The-Chariot.png',
          '08-strength.png': '08-Strength.png',
          '09-the-hermit.png': '09-The-Hermit.png',
          '10-wheel-of-fortune.png': '10-Wheel-of-Fortune.png',
          '11-justice.png': '11-Justice.png',
          '12-the-hanged-man.png': '12-The-Hanged-Man.png',
          '13-death.png': '13-Death.png',
          '14-temperance.png': '14-Temperance.png',
          '15-the-devil.png': '15-The-Devil.png',
          '16-the-tower.png': '16-The-Tower.png',
          '17-the-star.png': '17-The-Star.png',
          '18-the-moon.png': '18-The-Moon.png',
          '19-the-sun.png': '19-The-Sun.png',
          '20-judgement.png': '20-Judgement.png',
          '21-the-world.png': '21-The-World.png'
        };
        
        // 소문자 파일명을 올바른 대소문자 파일명으로 변경
        for (const [wrong, correct] of Object.entries(corrections)) {
          if (finalUrl.includes(wrong)) {
            finalUrl = finalUrl.replace(wrong, correct);
            break;
          }
        }
      }
      
      return finalUrl;
    }
    
    // 마이너 아르카나의 경우 수트 폴더 없이 경로 생성
    if (card.arcana === 'minor') {
      const cardNumber = String(card.number || 1).padStart(2, '0');
      let cardName;
      
      // 수트에 따라 파일명 생성
      if (card.suit) {
        if (card.number <= 10) {
          const numberNames = {
            1: 'ace',
            2: 'two', 3: 'three', 4: 'four', 5: 'five',
            6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
          };
          cardName = `${numberNames[card.number]}-of-${card.suit}`;
        } else {
          // 코트 카드들은 Supabase imageUrl을 사용해야 함 (위에서 이미 처리됨)
          const faceCards = {
            11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King'
          };
          const suitCapitalized = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
          cardName = `${faceCards[card.number]}-of-${suitCapitalized}`;
        }
      } else {
        // 기본 이름 사용
        cardName = card.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    }
    
    // 메이저 아르카나의 경우
    if (card.arcana === 'major') {
      const cardNumber = String(card.number || 0).padStart(2, '0');
      // 메이저 아르카나 파일명은 실제 파일명에 맞게 수정
      const majorCardNames = {
        0: '00-the-Fool.png',
        1: '01-The-Magician.png',
        2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png',
        4: '04-The-Emperor.png',
        5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png',
        7: '07-The-Chariot.png',
        8: '08-Strength.png',
        9: '09-The-Hermit.png',
        10: '10-Wheel-of-Fortune.png',
        11: '11-Justice.png',
        12: '12-The-Hanged-Man.png',
        13: '13-Death.png',
        14: '14-Temperance.png',
        15: '15-The-Devil.png',
        16: '16-The-Tower.png',
        17: '17-The-Star.png',
        18: '18-The-Moon.png',
        19: '19-The-Sun.png',
        20: '20-Judgement.png',
        21: '21-The-World.png'
      };
      
      const fileName = majorCardNames[card.number] || '00-the-Fool.png';
      return `/assets/tarot-cards/major/${fileName}`;
    }
    
    // 폴백 이미지 (기본 카드 이미지)
    return '/assets/tarot-cards/major/00-the-Fool.png';
  } catch (error) {
    console.error('카드 이미지 URL 생성 오류:', error);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
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
  
  // 이미지 경로 테스트
  if (tarotStore.tarotCards.length > 0) {
    const testCard = tarotStore.tarotCards[0];
    console.log('테스트 카드 데이터:', testCard);
    console.log('테스트 카드 arcana:', testCard.arcana);
    console.log('테스트 카드 number:', testCard.number);
    console.log('테스트 카드 imageUrl:', testCard.imageUrl);
    
    const testUrl = getCardImageUrl(testCard);
    console.log('테스트 카드 이미지 URL:', testUrl);
    
    // 이미지 로드 테스트
    const img = new Image();
    img.onload = () => console.log('✅ 테스트 이미지 로드 성공:', testUrl);
    img.onerror = () => console.error('❌ 테스트 이미지 로드 실패:', testUrl);
    img.src = testUrl;
  }
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

// 이미지 로드 에러 처리
const onImageError = (event: Event) => {
  if (!event || !event.target) {
    console.warn('이미지 에러 이벤트가 유효하지 않음');
    return;
  }
  
  const img = event.target as HTMLImageElement;
  if (!img) {
    console.warn('이미지 엘리먼트가 없음');
    return;
  }
  
  console.warn('이미지 로드 실패:', img.src);
  
  // 안전하게 폴백 처리
  const parentElement = img.parentElement;
  if (parentElement) {
    try {
      // 이미지를 숨기고 이모지로 대체
      img.style.display = 'none';
      
      // 이미 이모지가 추가되어 있는지 확인
      if (!parentElement.querySelector('.fallback-emoji')) {
        const fallbackEmoji = document.createElement('div');
        fallbackEmoji.className = 'fallback-emoji';
        fallbackEmoji.textContent = '🎴';
        fallbackEmoji.style.fontSize = '48px';
        fallbackEmoji.style.textAlign = 'center';
        fallbackEmoji.style.display = 'flex';
        fallbackEmoji.style.alignItems = 'center';
        fallbackEmoji.style.justifyContent = 'center';
        fallbackEmoji.style.width = '100%';
        fallbackEmoji.style.height = '100%';
        fallbackEmoji.style.position = 'absolute';
        fallbackEmoji.style.top = '0';
        fallbackEmoji.style.left = '0';
        fallbackEmoji.style.zIndex = '10';
        fallbackEmoji.style.background = 'rgba(75, 85, 99, 0.9)';
        fallbackEmoji.style.borderRadius = '6px';
        parentElement.appendChild(fallbackEmoji);
      }
    } catch (error) {
      console.error('폴백 이미지 생성 중 에러:', error);
    }
  } else {
    console.warn('이미지의 부모 엘리먼트가 없음');
  }
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
  width: 160px;
  height: 240px;
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
  justify-content: space-between;
  text-align: center;
}

.card-front {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  padding: 12px;
}

.card-image {
  width: 120px;
  height: 180px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
  background: white;
}

.card-image .fallback-emoji {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(75, 85, 99, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  border-radius: 6px;
  z-index: 10;
}

.card-front h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.2;
}

.card-number {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
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
  padding: 20px;
  justify-content: center;
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
