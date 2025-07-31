<template>
  <div class="card-drawing" :class="{ 
  'celtic-cross-mode': isCelticCross,
  'seven-star-mode': isSevenStar,
  'cup-relationship-mode': isCupOfRelationship,
  'special-layout-mode': hasSpecialLayout
}">
    <header class="page-header">
      <div class="header-top">
        <button class="back-button" @click="goBack">← 뒤로</button>
        <h1>
          카드 뽑기
          <span v-if="hasSpecialLayout" class="spread-name">
            - {{ getSpreadDisplayName() }}
          </span>
        </h1>
      </div>
      <div v-if="!userStore.isPremium && !adStatus.isTemporaryPremium" class="free-usage-indicator">
        무료 사용: {{ adStatus.dailyReadingCount }}/{{ adStatus.remainingReadings >= 0 ? adStatus.dailyReadingCount + adStatus.remainingReadings : '∞' }}
        <span v-if="adStatus.bonusReadings > 0" class="bonus-indicator">
          (+{{ adStatus.bonusReadings }} 보너스)
        </span>
      </div>
      <div v-else-if="adStatus.isTemporaryPremium" class="premium-status-indicator">
        🌟 임시 프리미엄 활성화 중
        <span class="expiry-time">{{ formatExpiryTime() }}</span>
      </div>
    </header>

    <div class="container">
      <!-- 카드 뽑기 방식 선택 -->
      <div class="draw-method-selection" v-if="!drawMethod && !isDrawing && !isComplete">
        <p class="instruction">카드를 어떻게 뽑으시겠습니까?</p>
        <div class="method-buttons">
          <button class="method-button" @click="selectDrawMethod('random')">
            <div class="method-icon">🎲</div>
            <h3>무작위로 뽑기</h3>
            <p>운명에 맡겨 카드를 뽑습니다</p>
          </button>
          <button class="method-button" @click="selectDrawMethod('manual')">
            <div class="method-icon">✋</div>
            <h3>직접 뽑기</h3>
            <p>펼쳐진 카드에서 직접 선택합니다</p>
          </button>
        </div>
      </div>

      <!-- 무작위 뽑기 -->
      <div class="deck-container" v-if="drawMethod === 'random' && !isDrawing && !isComplete">
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

      <!-- 직접 선택 모드 -->
      <div class="manual-selection-container" v-if="drawMethod === 'manual' && !isComplete">
        <p class="instruction">
          {{ manualSelectedCards.length }}/{{ getCardCount() }}장 선택했습니다.
          <span v-if="manualSelectedCards.length > 0" class="sub-instruction">
            (선택한 카드를 클릭하면 취소할 수 있습니다)
          </span>
          <span v-else>
            카드를 클릭하여 선택하세요.
          </span>
        </p>
        
        <!-- 선택된 카드 표시 -->
        <div v-if="manualSelectedCards.length > 0" class="selected-cards-preview">
          <div 
            v-for="(card, index) in manualSelectedCards" 
            :key="index" 
            class="selected-card-mini"
            @click="removeSelectedCard(index)"
            title="클릭하면 선택 취소"
          >
            <span class="selection-number">{{ index + 1 }}</span>
          </div>
        </div>
        
        <!-- 78장 카드 스프레드 -->
        <div class="card-spread-container">
          <div class="spread-background"></div>
          <div class="card-spread">
            <div 
              v-for="(card, index) in shuffledDeck" 
              :key="index"
              class="spread-card"
              :class="{ 
                'selected': isCardSelected(card),
                'disabled': manualSelectedCards.length >= getCardCount() && !isCardSelected(card)
              }"
              :style="getCardSpreadStyle(index)"
              @click="selectManualCard(card)"
            >
              <div class="card-back-small">🃏</div>
            </div>
          </div>
        </div>
        
        <!-- 선택 완료 버튼 -->
        <button 
          class="btn btn-primary confirm-button"
          :disabled="manualSelectedCards.length !== getCardCount()"
          @click="confirmManualSelection"
        >
          카드 선택 완료
        </button>
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
        <!-- 캘틱 크로스 전용 레이아웃 -->
        <div v-if="isCelticCross" class="celtic-cross-container">

          <CelticCrossLayout 
            :cards="drawnCards"
            :isDrawing="false"
            :drawProgress="100"
            :showInterpretation="allCardsRevealed"
            @card-click="revealCard"
            @reveal-all="revealAllCards"
          >
            <template #action-button>
              <button 
                class="btn-action btn-result"
                @click="goToResult"
                :disabled="!allCardsRevealed"
              >
                해석 보기
              </button>
            </template>
          </CelticCrossLayout>
        </div>
        
        <!-- 세븐 스타 전용 레이아웃 -->
        <div v-else-if="isSevenStar" class="seven-star-container">

          <SevenStarLayout 
            :cards="drawnCards"
            :isDrawing="false"
            :drawProgress="100"
            @card-click="revealCard"
            @reveal-all="revealAllCards"
          >
            <template #action-button>
              <button 
                class="btn-action btn-result"
                @click="goToResult"
                :disabled="!allCardsRevealed"
              >
                해석 보기
              </button>
            </template>
          </SevenStarLayout>
        </div>
        
        <!-- 컵 오브 릴레이션십 전용 레이아웃 -->
        <div v-else-if="isCupOfRelationship" class="cup-relationship-container">

          <CupOfRelationshipLayout 
            :cards="drawnCards"
            :isDrawing="false"
            :drawProgress="100"
            @card-click="revealCard"
            @reveal-all="revealAllCards"
          >
            <template #action-button>
              <button 
                class="btn-action btn-result"
                @click="goToResult"
                :disabled="!allCardsRevealed"
              >
                해석 보기
              </button>
            </template>
          </CupOfRelationshipLayout>  
        </div>
        
        <!-- 일반 카드 레이아웃 -->
        <div v-else>
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
        </div>


        
        <button 
          v-if="!hasSpecialLayout"
          class="btn btn-primary result-button"
          @click="goToResult"
          :disabled="!allCardsRevealed"
        >
          해석 보기
        </button>
      </div>

      <!-- 광고 모달 (무료 사용자용) -->
      <AdModal v-if="showAdModal" @close="closeAdModal" />
      
      <!-- AI 해석 로딩 화면 -->
      <TarotLoadingScreen 
        :isVisible="isGeneratingInterpretation" 
        :progress="interpretationProgress"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { useTarotStore } from '@/store/tarot';
import { nativeUtils } from '@/utils/capacitor';
import { getAdManager } from '@/services/adManagerSingleton';
import { ImprovedCelticCrossInterpreter } from '@/utils/ImprovedCelticCrossInterpreter';
import { customInterpretationService } from '@/services/ai/customInterpretationService';
import { AIInterpretationService } from '@/services/ai/AIInterpretationService';

// 컴포넌트 직접 import로 변경
import AdModal from '@/components/AdModal.vue';
import CelticCrossLayout from '@/components/spreads/CelticCrossLayout.vue';
import SevenStarLayout from '@/components/spreads/SevenStarLayout.vue';
import CupOfRelationshipLayout from '@/components/spreads/CupOfRelationshipLayout.vue';
import TarotLoadingScreen from '@/components/loading/TarotLoadingScreen.vue';

interface DrawnCardData {
  card: any; // TarotCard type
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const drawMethod = ref<'random' | 'manual' | null>(null);
const isDrawing = ref(false);
const isComplete = ref(false);
const progress = ref(0);
const drawnCards = ref<DrawnCardData[]>([]);
const showAdModal = ref(false);
const manualSelectedCards = ref<any[]>([]);
const shuffledDeck = ref<any[]>([]);
const improvedInterpretation = ref<any>(null);
const isGeneratingInterpretation = ref(false);
const interpretationProgress = ref(0);

const allCardsRevealed = computed(() => {
  return drawnCards.value.length > 0 && drawnCards.value.every(card => card.revealed);
});

// 광고 매니저 상태
const adManager = getAdManager();
const adStatus = ref(adManager.getStatus());

// 광고 상태 업데이트 함수
const updateAdStatus = () => {
  adStatus.value = adManager.getStatus();
};

// 남은 시간 포맷팅
const formatExpiryTime = () => {
  if (!adStatus.value.temporaryPremiumExpiry) return '';
  
  const now = new Date();
  const expiry = new Date(adStatus.value.temporaryPremiumExpiry);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return '만료됨';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  } else {
    return `${minutes}분 남음`;
  }
};

// 특별 레이아웃 스프레드인지 확인
const isCelticCross = computed(() => {
  return tarotStore.selectedSpread?.spreadId === 'celtic_cross';
});

const isSevenStar = computed(() => {
  return tarotStore.selectedSpread?.spreadId === 'seven_star';
});

const isCupOfRelationship = computed(() => {
  return tarotStore.selectedSpread?.spreadId === 'cup_of_relationship';
});

const hasSpecialLayout = computed(() => {
  return isCelticCross.value || isSevenStar.value || isCupOfRelationship.value;
});

// 스프레드 표시 이름 가져오기
const getSpreadDisplayName = () => {
  if (isCelticCross.value) return '켈틱 크로스';
  if (isSevenStar.value) return '세븐 스타';
  if (isCupOfRelationship.value) return '컵 오브 릴레이션십';
  return '';
};

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
  
  // 직접 선택을 위한 덱 섞기
  shuffleDeck();
  
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

// 드로우 방법 선택
const selectDrawMethod = (method: 'random' | 'manual') => {
  drawMethod.value = method;
  
  if (method === 'manual') {
    // 직접 선택 모드를 위한 초기화
    manualSelectedCards.value = [];
  }
};

// 덱 섞기
const shuffleDeck = () => {
  if (tarotStore.tarotCards.length > 0) {
    // 모든 카드를 복사하고 섞기
    const allCards = [...tarotStore.tarotCards];
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    shuffledDeck.value = allCards;
  }
};

// 카드 스프레드 스타일 (둥근 부채꼴 형태)
const getCardSpreadStyle = (index: number) => {
  const totalCards = 78;
  const centerX = 50; // 중심점 X (퍼센트)
  const centerY = 75; // 중심점 Y (퍼센트) - 더 위로 올림
  
  // 부채꼴 각도 계산 - 더 촘촘하게
  const totalAngle = 240; // 전체 펼침 각도 (240도로 증가)
  const startAngle = -120; // 시작 각도
  const angleStep = totalAngle / (totalCards - 1);
  const angle = startAngle + (index * angleStep);
  
  // 라디안으로 변환
  const radian = (angle * Math.PI) / 180;
  
  // 타원형 배치를 위한 반지름 계산
  // 가로 반지름을 세로보다 크게 하여 타원형으로 만듦
  const radiusX = 45; // 가로 반지름 (퍼센트)
  const radiusY = 30; // 세로 반지름 (퍼센트) - 더 줄임
  
  // 카드 위치 계산 (타원 공식 사용)
  const x = centerX + radiusX * Math.sin(radian);
  const y = centerY - radiusY * Math.cos(radian);
  
  // 카드가 겹쳐 보이도록 z-index 조정
  const zIndex = 78 - Math.abs(index - 39); // 중앙이 위로
  
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${angle * 0.7}deg)`, // 회전 각도를 줄임
    transformOrigin: 'center center',
    zIndex: zIndex
  };
};

// 카드 선택 확인
const isCardSelected = (card: any) => {
  return manualSelectedCards.value.some(selected => selected.id === card.id);
};

// 수동 카드 선택
const selectManualCard = async (card: any) => {
  await nativeUtils.buttonTapHaptic();
  
  const isSelected = isCardSelected(card);
  const maxCards = getCardCount();
  
  if (isSelected) {
    // 이미 선택된 카드는 선택 해제
    manualSelectedCards.value = manualSelectedCards.value.filter(c => c.id !== card.id);
  } else if (manualSelectedCards.value.length < maxCards) {
    // 아직 선택 가능한 경우
    // 무작위 방향 결정
    const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
    manualSelectedCards.value.push({
      ...card,
      orientation
    });
  }
};

// 선택된 카드 제거
const removeSelectedCard = async (index: number) => {
  await nativeUtils.buttonTapHaptic();
  manualSelectedCards.value.splice(index, 1);
};

// 수동 선택 완료
const confirmManualSelection = async () => {
  // 무료 사용자 체크
  if (!userStore.isPremium && !userStore.canUseFreeReading) {
    alert(`오늘의 무료 점괘 회수를 모두 사용했습니다. (${userStore.freeReadingsToday}/${userStore.maxFreeReadingsPerDay})\n\n프리미엄으로 업그레이드하면 무제한 이용할 수 있습니다.`);
    router.push('/premium');
    return;
  }

  if (!userStore.isPremium) {
    showAdModal.value = true;
    return;
  }

  await processManualSelection();
};

// 수동 선택 처리
const processManualSelection = async () => {
  // 선택된 카드로 진행
  tarotStore.setTempDrawnCards(manualSelectedCards.value);
  
  drawnCards.value = manualSelectedCards.value.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));
  
  isComplete.value = true;
  
  // 무료 사용자 카운트 증가
  userStore.incrementFreeReading();
};

const startDrawing = async () => {
  // 버튼 클릭 햇틱 피드백
  await nativeUtils.buttonTapHaptic();
  
  // 광고 매니저를 통해 점괘 시작 가능 여부 확인
  const canStart = await adManager.startReading();
  
  if (!canStart) {
    // 점괘를 볼 수 없는 경우
    const status = adManager.getStatus();
    if (status.remainingReadings === 0) {
      // 무료 횟수 소진 - 옵션 표시
      showFreeUsageOptions();
    }
    return;
  }

  // 광고 상태 업데이트
  updateAdStatus();
  
  // 카드 뽑기 진행
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
  
  // 켈틱 크로스인 경우, 모든 카드가 공개되면 해석 생성
  if (isCelticCross.value && allCardsRevealed.value && !improvedInterpretation.value) {
    generateCelticCrossInterpretation();
  }
};

// 모든 카드 일괄 뒤집기
const revealAllCards = async () => {
  // 햅틱 피드백
  await nativeUtils.buttonTapHaptic();
  
  // 모든 카드를 순차적으로 뒤집기 (애니메이션 효과)
  for (let i = 0; i < drawnCards.value.length; i++) {
    drawnCards.value[i].revealed = true;
    // 카드 사이에 약간의 딜레이 추가
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 켈틱 크로스인 경우 해석 생성
  if (isCelticCross.value && !improvedInterpretation.value) {
    generateCelticCrossInterpretation();
  }
};

// 켈틱 크로스 해석 생성
const generateCelticCrossInterpretation = async () => {
  if (!isCelticCross.value || drawnCards.value.length !== 10) return;
  
  try {
    // 인스턴스 먼저 생성
    const interpreter = new ImprovedCelticCrossInterpreter();
    
    // cardsData를 먼저 준비
    const cardsData = drawnCards.value.map((drawn, index) => ({
      position: index,
      card: drawn.card,
      orientation: drawn.orientation,
      positionName: interpreter.getPositionName(index)
    }));
    
    // generateInterpretation 메서드로 해석 생성
    const interpretation = await interpreter.generateInterpretation(cardsData);
    improvedInterpretation.value = interpretation;
    
    // tarotStore에도 저장
    tarotStore.setImprovedInterpretation(interpretation);
  } catch (error) {
    console.error('켈틱 크로스 해석 생성 오류:', error);
  }
};

const goToResult = async () => {
  console.log('🎯 goToResult 함수 호출됨');
  console.log('- 모든 카드 공개 여부:', allCardsRevealed.value);
  console.log('- 뽑힌 카드 수:', drawnCards.value.length);
  console.log('- 선택된 스프레드:', tarotStore.selectedSpread?.spreadId);
  
  // 모든 카드가 공개되지 않았으면 경고
  if (!allCardsRevealed.value) {
    alert('모든 카드를 먼저 공개해주세요!');
    return;
  }
  
  // 로딩 화면 표시
  isGeneratingInterpretation.value = true;
  interpretationProgress.value = 0;
  
  // 프로그레스 업데이트 시뮬레이션
  const progressInterval = setInterval(() => {
    if (interpretationProgress.value < 90) {
      interpretationProgress.value += Math.random() * 15;
    }
  }, 500);
  
  try {
    // 켈틱 크로스의 경우 개선된 해석을 함께 저장
    if (isCelticCross.value && improvedInterpretation.value) {
      tarotStore.setImprovedInterpretation(improvedInterpretation.value);
    }
    
    // 뽑힌 카드로 점괴 생성
    const reading = await tarotStore.createReading(
      tarotStore.selectedSpread?.spreadId || 'one_card',
      tarotStore.selectedTopic?.id || 'general',
      undefined, // 질문은 선택사항
      tarotStore.getTempDrawnCards() || undefined
    );
    
    // 커스텀 질문이 있는 경우 AI 해석 생성
    const customQuestion = tarotStore.getCustomQuestion();
    if (userStore.isPremium && customQuestion && reading) {
      try {
        // 프로그레스 업데이트
        interpretationProgress.value = 30;
        
        // 커스텀 AI 해석 요청
        const interpretationRequest = {
          readingId: reading.id,
          cards: reading.cards.map((card: any, index: number) => ({
            id: card.id,
            name: card.name || card.nameEn || '',
            nameKr: card.nameKr || card.name_kr || card.name || '',
            arcana: card.arcana || 'unknown',
            suit: card.suit || null,
            number: card.number || null,
            orientation: card.orientation || 'upright',
            position: {
              name: card.position?.name || `위치 ${index + 1}`,
              description: card.position?.description || ''
            },
            meanings: card.meanings || {}
          })),
          spreadId: tarotStore.selectedSpread?.spreadId || 'three_cards',
          topic: tarotStore.selectedTopic?.id || 'general',
          customQuestion: customQuestion,
          userId: userStore.user?.id
        };

        const interpretationResult = await customInterpretationService.generateInterpretation(interpretationRequest);
        
        // 프로그레스 업데이트
        interpretationProgress.value = 70;
        
        if (interpretationResult.success && interpretationResult.interpretation) {
          console.log('🤖 커스텀 AI 해석 생성 성공!');
          console.log('- 해석 길이:', interpretationResult.interpretation.length);
          console.log('- 해석 처음 200자:', interpretationResult.interpretation.substring(0, 200));
          console.log('- 해석 마지막 200자:', interpretationResult.interpretation.substring(interpretationResult.interpretation.length - 200));
          console.log('- 전체 해석:', interpretationResult.interpretation);
          
          // AI 해석을 reading에 추가
          reading.aiInterpretation = interpretationResult.interpretation;
          reading.aiInterpretationId = interpretationResult.interpretationId || null;
          
          // 확률 분석도 추가
          if (interpretationResult.probabilityAnalysis) {
            reading.probabilityAnalysis = interpretationResult.probabilityAnalysis;
          }
        }
        
        // reading을 store에 업데이트
        tarotStore.updateReading(reading);
      } catch (aiError) {
        console.error('커스텀 AI 해석 생성 실패:', aiError);
      }
    }
    // 프리미엄 사용자인 경우 켈틱 크로스 AI 해석 생성 (커스텀 질문이 없는 경우)
    else if (userStore.isPremium && isCelticCross.value && reading && !customQuestion) {
      try {
        // 프로그레스 업데이트
        interpretationProgress.value = 30;
        
        // AI 해석 서비스 인스턴스 생성
        const aiService = new AIInterpretationService(userStore.isPremium);
        
        // AI 해석 생성을 위한 카드 데이터 준비
        const cardsForAI = reading.cards.map((card: any, index: number) => ({
          id: card.id,
          name: card.name || card.nameEn || '',
          name_kr: card.nameKr || card.name_kr || card.name || '',
          nameKr: card.nameKr || card.name_kr || card.name || '',
          arcana: card.arcana || 'unknown',
          suit: card.suit || null,
          number: card.number || null,
          orientation: card.orientation || 'upright',
          position: {
            position: index + 1,
            name: card.position?.name || [
              '현재내면',
              '현재외부', 
              '근본',
              '과거',
              '드러나는 모습',
              '미래',
              '내가보는나',
              '남이보는나',
              '예상하는 결과',
              '실제 결과'
            ][index] || `위치 ${index + 1}`
          }
        }));
        
        // AI 해석 생성
        const result = await aiService.generateInterpretation(
          cardsForAI,
          tarotStore.selectedTopic?.id || 'love', // 선택된 주제 사용
          'celtic_cross'
        );
        
        // 프로그레스 업데이트
        interpretationProgress.value = 70;
        
        if (result && result.text) {
          console.log('🤖 켈틱 크로스 AI 해석 생성 성공!');
          console.log('- 해석 길이:', result.text.length);
          console.log('- 해석 처음 200자:', result.text.substring(0, 200));
          console.log('- 해석 마지막 200자:', result.text.substring(result.text.length - 200));
          console.log('- 전체 해석:', result.text);
          
          // AI 해석을 reading에 추가
          reading.aiInterpretation = result.text;
          reading.aiInterpretationId = result.interpretationId || null;
        }
        
        // reading을 store에 업데이트
        tarotStore.updateReading(reading);
      } catch (aiError) {
        console.error('AI 해석 생성 실패:', aiError);
      }
    }
    
    console.log('✅ 점괘 생성 성공:', reading.id);
    
    // 프로그레스 완료
    clearInterval(progressInterval);
    interpretationProgress.value = 100;
    
    // 잠시 대기 후 화면 전환
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 로딩 화면 숨기기
    isGeneratingInterpretation.value = false;
    
    // 점괴 결과 화면으로 이동
    router.push(`/reading-result?readingId=${reading.id}`);
  } catch (error) {
    console.error('❌ 점괴 생성 실패:', error);
    
    // 프로그레스 정리
    clearInterval(progressInterval);
    isGeneratingInterpretation.value = false;
    interpretationProgress.value = 0;
    
    alert(`점괘 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
  }
};

const closeAdModal = () => {
  showAdModal.value = false;
  
  if (drawMethod.value === 'random') {
    drawCards();
  } else if (drawMethod.value === 'manual') {
    processManualSelection();
  }
};

// 이미지 로드 에러 처리
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

// 무료 사용자 옵션 표시
const showFreeUsageOptions = () => {
  // TODO: 모달로 더 예쁨게 만들기
  const options = [
    '1. 프리미엄으로 업그레이드하기',
    '2. 리워드 광고 시청하고 추가 횟수 받기',
    '3. 24시간 임시 프리미엄 활성화'
  ];
  
  const choice = confirm(`오늘의 무료 점괘를 모두 사용했습니다.\n\n${options.join('\n')}\n\n계속하시겠습니까?`);
  
  if (choice) {
    // TODO: 옵션 선택 화면 보여주기
    router.push('/premium');
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
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.spread-name {
  color: #FFD700;
  font-size: 20px;
  font-weight: 600;
}

.free-usage-indicator {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #A855F7;
  font-weight: 600;
  align-self: flex-end;
  margin-left: auto;
}

.premium-status-indicator {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%);
  border: 1px solid rgba(255, 215, 0, 0.4);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #FFD700;
  font-weight: 600;
  align-self: flex-end;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.expiry-time {
  font-size: 11px;
  color: rgba(255, 215, 0, 0.8);
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
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px; /* 여백 줄임 */
}

.sub-instruction {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-top: 4px;
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

/* 카드 뽑기 방식 선택 */
.draw-method-selection {
  text-align: center;
}

.method-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.method-button {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  max-width: 200px;
}

.method-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #A855F7;
  transform: translateY(-5px);
}

.method-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.method-button h3 {
  font-size: 18px;
  color: white;
  margin-bottom: 10px;
}

.method-button p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 직접 선택 모드 */
.manual-selection-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.selected-cards-preview {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 10px 0; /* 여백 줄임 */
}

.selected-card-mini {
  width: 40px;
  height: 60px;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: 2px solid white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-card-mini:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.selection-number {
  font-weight: bold;
  color: white;
  font-size: 16px;
}

.card-spread-container {
  width: 100%;
  max-width: 100%;
  height: 250px; /* 높이 더 줄임 */
  margin: 10px 0; /* 여백 줄임 */
  position: relative;
  overflow: hidden;
}

.spread-background {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 200px;
  background: radial-gradient(ellipse at center bottom, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.card-spread {
  position: relative;
  width: 100%;
  height: 100%;
}

.spread-card {
  width: 40px; /* 크기 더 줄임 */
  height: 60px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 1px solid rgba(255, 255, 255, 0.2); /* 테두리 두께 줄임 */
  border-radius: 4px; /* 둥근 모서리 더 작게 */
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.spread-card:hover:not(.disabled) {
  transform: translate(-50%, -50%) translateY(-20px) scale(1.2) !important;
  border-color: rgba(255, 255, 255, 0.5);
  z-index: 1000 !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.spread-card.selected {
  border-color: #FFD700;
  border-width: 2px; /* 선택된 카드도 테두리 줄임 */
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.spread-card.selected .card-back-small {
  color: #4C1D95; /* 선택된 카드의 아이콘 색 변경 */
}

.spread-card.selected:hover {
  transform: translate(-50%, -50%) translateY(-20px) scale(1.2) !important;
}

.spread-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-back-small {
  font-size: 16px; /* 아이콘 크기 더 줄임 */
  color: rgba(255, 255, 255, 0.8);
}

.confirm-button {
  margin-top: 10px; /* 마진 줄임 */
}

@media (max-width: 768px) {
  .header-top {
    flex-wrap: wrap;
  }
  
  .header-top h1 {
    flex: 1;
  }
  
  .free-usage-indicator,
  .premium-status-indicator {
    width: 100%;
    text-align: center;
    margin-top: 8px;
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
  
  .method-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .card-spread-container {
    height: 220px; /* 모바일에서 더 줄임 */
  }
  
  .spread-card {
    width: 30px; /* 모바일에서 더 작게 */
    height: 45px;
  }
  
  .manual-selection-container {
    padding-top: 0;
  }
  
  .instruction {
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .card-back-small {
    font-size: 12px;
  }
  
  /* 모바일에서 해석 보기 버튼 마진 조정 */
  .celtic-cross-mode .result-button,
  .seven-star-mode .result-button,
  .cup-relationship-mode .result-button {
    margin-top: 60px;
  }
}

/* 캘틱 크로스 모드 스타일 */
.card-drawing.celtic-cross-mode {
  background: radial-gradient(ellipse at center, rgba(88, 28, 135, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #0F0C29 0%, #24243e 100%);
}

.celtic-cross-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.premium-instruction {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 30px;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* 특별 레이아웃 컨테이너 */
.seven-star-container,
.cup-relationship-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 세븐 스타 모드 스타일 */
.card-drawing.seven-star-mode {
  background: radial-gradient(ellipse at center, rgba(25, 25, 112, 0.3) 0%, transparent 70%),
              linear-gradient(180deg, #000428 0%, #004e92 100%);
}

/* 컵 오브 릴레이션십 모드 스타일 */
.card-drawing.cup-relationship-mode {
  background: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #2D1B69 0%, #0F3443 100%);
}

/* 캘틱 크로스 모드에서 결과 버튼 스타일 */
.celtic-cross-mode .result-button,
.seven-star-mode .result-button,
.cup-relationship-mode .result-button {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  font-weight: 700;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  margin-top: 80px;
}

.celtic-cross-mode .result-button:hover:not(:disabled),
.seven-star-mode .result-button:hover:not(:disabled),
.cup-relationship-mode .result-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
}

.celtic-cross-mode .result-button:disabled,
.seven-star-mode .result-button:disabled,
.cup-relationship-mode .result-button:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  box-shadow: none;
}

/* 공통 액션 버튼 스타일 */
.btn-action {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  min-width: 180px;
  justify-content: center;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

.btn-action:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-action .icon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .btn-action {
    font-size: 14px;
    padding: 10px 16px;
    min-width: 140px;
  }
}

</style>
