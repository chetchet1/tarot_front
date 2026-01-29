<template>
  <div class="card-drawing" :class="{ 
  'celtic-cross-mode': isCelticCross,
  'seven-star-mode': isSevenStar,
  'cup-relationship-mode': isCupOfRelationship,
  'special-layout-mode': hasSpecialLayout
}" @click="debugClick">
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
      <!-- 임시 프리미엄 표시 -->
      <div v-if="adStatus.isTemporaryPremium" class="premium-status-indicator">
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
        >
          {{ getDrawButtonText() }}
        </button>
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
                @click="handleInterpretationClick"
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
                @click="handleInterpretationClick"
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
                @click="handleInterpretationClick"
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

      <!-- 광고 모달 (기획 변경으로 사용하지 않음) -->
      <!-- <AdModal v-if="showAdModal" @close="closeAdModal" /> -->
      
      <!-- AI 해석 로딩 화면 -->
      <TarotLoadingScreen 
        :isVisible="isGeneratingInterpretation" 
        :progress="interpretationProgress"
      />
      
      <!-- 연애 상태 선택 모달 - ReadingSelect에서 처리하므로 제거됨 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount, defineAsyncComponent, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { nativeUtils } from '../utils/capacitor';
import { getAdManager } from '../services/adManagerSingleton';
// 중복 호출 방지를 위해 Interpreter들은 tarot.ts에서만 사용하도록 변경 - 2025.01.14
// import { ImprovedCelticCrossInterpreter } from '../utils/ImprovedCelticCrossInterpreter'; // tarot.ts에서만 사용
// import { SevenStarInterpreter } from '../services/interpretation/SevenStarInterpreter'; // tarot.ts에서만 사용
// import { CupOfRelationshipInterpreter } from '../services/interpretation/CupOfRelationshipInterpreter'; // tarot.ts에서만 사용
import { customInterpretationService } from '../services/ai/customInterpretationService';
import { showAlert, showConfirm } from '../utils/alerts';
import { getUnifiedCardImagePath, handleUnifiedImageError } from '../utils/unifiedCardImage';
import { showRewardedAd } from '../services/admob'; // 유료 배열용 강제 시청 광고
import { interceptPremiumSpreadCalls, interceptAdManager } from '../utils/debugPremiumSpread'; // 디버그 도구
import { monitorSupabaseAPICalls } from '../utils/supabaseMonitor'; // Supabase API 모니터링

// 컴포넌트 직접 import로 변경
// import AdModal from '../components/AdModal.vue'; // 기획 변경으로 사용하지 않음
import CelticCrossLayout from '../components/spreads/CelticCrossLayout.vue';
import SevenStarLayout from '../components/spreads/SevenStarLayout.vue';
import CupOfRelationshipLayout from '../components/spreads/CupOfRelationshipLayout.vue';
import TarotLoadingScreen from '../components/loading/TarotLoadingScreen.vue';
// RelationshipStatusModal 제거됨 - ReadingSelect에서 처리
// Alert 컴포넌트는 useAlert를 통해 사용

interface DrawnCardData {
  card: any; // TarotCard type
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();
// showAlert, showConfirm은 직접 import해서 사용

const drawMethod = ref<'random' | 'manual' | null>(null);
const isDrawing = ref(false);
const isComplete = ref(false);
const progress = ref(0);
const drawnCards = ref<DrawnCardData[]>([]);
// const showAdModal = ref(false); // 기획 변경으로 사용하지 않음
const manualSelectedCards = ref<any[]>([]);
const shuffledDeck = ref<any[]>([]);
const improvedInterpretation = ref<any>(null);
const isGeneratingInterpretation = ref(false);
const interpretationProgress = ref(0);

// 연애 상태 모달 관련 상태 - 제거됨 (ReadingSelect에서 처리)

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

const defaultPageBg = 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)';
const pageTheme = computed(() => {
  if (isCelticCross.value) {
    return 'radial-gradient(ellipse at center, rgba(88, 28, 135, 0.2) 0%, transparent 70%), linear-gradient(180deg, #0F0C29 0%, #24243e 100%)';
  }
  if (isSevenStar.value) {
    return 'radial-gradient(ellipse at center, rgba(25, 25, 112, 0.3) 0%, transparent 70%), linear-gradient(180deg, #000428 0%, #004e92 100%)';
  }
  if (isCupOfRelationship.value) {
    return 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%), linear-gradient(180deg, #2D1B69 0%, #0F3443 100%)';
  }
  return defaultPageBg;
});

const applyPageTheme = (value: string) => {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--page-bg', value);
};

// 스프레드 표시 이름 가져오기
const getSpreadDisplayName = () => {
  if (isCelticCross.value) return '켈틱 크로스';
  if (isSevenStar.value) return '세븐 스타';
  if (isCupOfRelationship.value) return '컵 오브 릴레이션십';
  return '';
};

// 카드 뽑기 버튼 텍스트
const getDrawButtonText = () => {
  // 무료 사용자도 광고 시청으로 무제한 가능
  return '카드 뽑기';
};

// 카드 이미지 URL 생성 - 통합 함수 사용
const getCardImageUrl = (card: any) => getUnifiedCardImagePath(card);

// 카드 개수 가져오기
const getCardCount = () => {
  return tarotStore.selectedSpread?.cardCount || 1;
};

// 디버그용 클릭 핸들러
const debugClick = () => {
  console.log('[CardDrawing] 화면 클릭됨');
  console.log('[CardDrawing] drawMethod:', drawMethod.value);
  console.log('[CardDrawing] isDrawing:', isDrawing.value);
  console.log('[CardDrawing] isComplete:', isComplete.value);
  console.log('[CardDrawing] 현재 URL:', window.location.pathname);
};

// 중복 호출 방지를 위한 플래그 - 상단에 선언
const isProcessingResult = ref(false);

const allowPageScroll = computed(() => {
  return tarotStore.selectedSpread?.spreadId === 'three_card_timeline';
});

const setNoScroll = (enabled: boolean) => {
  const root = document.documentElement;
  const scroll = document.querySelector('.app-scroll');
  if (!root || !document.body) return;
  root.classList.toggle('no-scroll', enabled);
  document.body.classList.toggle('no-scroll', enabled);
  if (scroll) {
    scroll.classList.toggle('no-scroll', enabled);
  }
};

// 상태 초기화 함수
const resetState = () => {
  console.log('🔄 [resetState] 상태 초기화 시작');
  console.log('🔄 [resetState] 초기화 전 isProcessingResult:', isProcessingResult.value);
  drawMethod.value = null;
  isDrawing.value = false;
  isComplete.value = false;
  progress.value = 0;
  drawnCards.value = [];
  manualSelectedCards.value = [];
  improvedInterpretation.value = null;
  isGeneratingInterpretation.value = false;
  interpretationProgress.value = 0;
  // 연애 상태는 ReadingSelect에서 처리
  // isProcessingResult를 확실하게 false로 설정
  isProcessingResult.value = false;
  // nextTick을 사용해 DOM 업데이트 후 재확인
  nextTick(() => {
    isProcessingResult.value = false;
    console.log('🔄 [resetState] nextTick 후 isProcessingResult:', isProcessingResult.value);
  });
  console.log('🔄 [resetState] 초기화 후 isProcessingResult:', isProcessingResult.value);
  console.log('🔄 [resetState] 상태 초기화 완료');
};

// 컴포넌트 파괴 전 플래그 리셋
onBeforeUnmount(() => {
  console.log('🔚 [onBeforeUnmount] 컴포넌트 파괴 전 - 플래그 리셋');
  isProcessingResult.value = false;
  isGeneratingInterpretation.value = false;
});

// 컴포넌트 파괴 시 플래그 리셋
onUnmounted(() => {
  setNoScroll(false);
  applyPageTheme(defaultPageBg);
  console.log('🔚 [onUnmounted] 컴포넌트 파괴 - 플래그 리셋');
  isProcessingResult.value = false;
  isGeneratingInterpretation.value = false;
});

// 라우터 경로 변경 감지
watch(() => router.currentRoute.value.path, (newPath, oldPath) => {
  if (oldPath && oldPath.includes('card-drawing') && !newPath.includes('card-drawing')) {
    console.log('🔄 [watch] 카드 드로잉 페이지에서 떠남 - 플래그 리셋');
    isProcessingResult.value = false;
    isGeneratingInterpretation.value = false;
  }
});

onMounted(async () => {
  setNoScroll(!allowPageScroll.value);
  applyPageTheme(pageTheme.value);
  console.log('🎴 [CardDrawing] onMounted 시작');
  console.log('📌 [CardDrawing] 선택된 주제:', tarotStore.selectedTopic);
  console.log('📊 [CardDrawing] 선택된 배열법:', tarotStore.selectedSpread);
  console.log('❓ [CardDrawing] 커스텀 질문:', tarotStore.getCustomQuestion());
  console.log('🎴 [CardDrawing] 타로카드 개수:', tarotStore.tarotCards.length);
  console.log('🌐 [CardDrawing] 현재 URL:', window.location.pathname);
  console.log('🌐 [CardDrawing] 라우터 경로:', router.currentRoute.value.path);
  console.log('🔍 [CardDrawing] 전체 스토어 상태:', {
    selectedTopic: JSON.stringify(tarotStore.selectedTopic),
    selectedSpread: JSON.stringify(tarotStore.selectedSpread),
    drawMethod: drawMethod.value,
    isDrawing: isDrawing.value,
    isComplete: isComplete.value
  });
  
  // 테스트 계정일 때 디버그 모드 활성화
  if (userStore.currentUser?.email === 'test@example.com') {
    console.error('🔴🔴🔴 테스트 계정 감지 - 디버그 모드 활성화');
    console.error('🔴 현재 시간:', new Date().toISOString());
    console.error('🔴 spreadId:', tarotStore.selectedSpread?.spreadId);
    
    // 모든 모니터링 활성화
    try {
      monitorSupabaseAPICalls(); // Supabase API 호출 모니터링
      interceptPremiumSpreadCalls(); // 콘솔 로그 추적
      interceptAdManager(); // AdManager 가로채기
      
      console.error('🔴 모니터링 시작 완료');
      console.error('🔴 카드 뽑기 전 API 호출을 추적합니다...');
    } catch (debugError) {
      console.error('🔴 디버그 모드 활성화 오류:', debugError);
      // 디버그 오류는 무시하고 계속 진행
    }
  }
  
  // 상태 초기화
  resetState();
  
  // DOM이 마운트되었는지 확인
  console.log('🔍 [CardDrawing] DOM 확인:', {
    hasRootElement: document.querySelector('.card-drawing') !== null,
    body: document.body.innerHTML.substring(0, 200)
  });
  
  // 선택된 주제와 배열법이 없으면 선택 화면으로 돌아가기
  if (!tarotStore.selectedTopic || !tarotStore.selectedSpread) {
    console.error('[CardDrawing] 주제 또는 배열법이 선택되지 않음');
    console.log('[CardDrawing] 선택 화면으로 돌아갑니다');
    
    // 간단한 알림 메시지
    await showAlert({
      title: '선택 필요',
      message: '주제와 배열법을 먼저 선택해주세요.'
    });
    
    // 선택 화면으로 이동
    router.push('/reading-select');
    return;
  }
  
  // 강제로 화면 업데이트 트리거
  await nextTick();
  console.log('[CardDrawing] nextTick 후 - 화면이 렌더링되어야 함');
  
  // 페이지 로드 시 카드 섞기 애니메이션
  setTimeout(() => {
    // 카드 준비 완료
  }, 1000);
  
  // 직접 선택을 위한 덱 섞기
  shuffleDeck();
  
  // 타로 스토어 초기화 확인
  if (tarotStore.tarotCards.length === 0) {
    console.log('[CardDrawing] 타로카드가 없어서 초기화 시작');
    await tarotStore.initialize();
    console.log('[CardDrawing] 초기화 후 타로카드 개수:', tarotStore.tarotCards.length);
  }
});

watch(allowPageScroll, (nextValue) => {
  setNoScroll(!nextValue);
});

watch(pageTheme, (value) => {
  applyPageTheme(value);
}, { immediate: true });

const goBack = () => {
  router.go(-1);
};

// 드로우 방법 선택
const selectDrawMethod = async (method: 'random' | 'manual') => {
  console.log('🎲 [selectDrawMethod] 방법 선택:', method);
  console.log('🎲 [selectDrawMethod] 선택 전 isProcessingResult:', isProcessingResult.value);
  
  // 새로운 점괘 시작 시 상태 초기화
  resetState();
  
  drawMethod.value = method;
  
  if (method === 'manual') {
    // 직접 선택 모드를 위한 초기화
    manualSelectedCards.value = [];
  }
  
  console.log('🎲 [selectDrawMethod] 선택 후 isProcessingResult:', isProcessingResult.value);
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
  console.log('🎯 [confirmManualSelection] 시작');
  
  // 바로 진행 (연애 상태는 ReadingSelect에서 이미 처리됨)
  await proceedWithManualSelection();
};

// 실제 수동 선택 처리
const proceedWithManualSelection = async () => {
  console.log('🎯 [proceedWithManualSelection] 시작');
  
  // 광고 매니저를 통해 점괘 시작 가능 여부 확인 (스프레드 ID 전달)
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  console.log('🎯 [confirmManualSelection] spreadId:', spreadId);
  
  // 테스트: startReading 호출 전 DB 확인
  let usageBefore;
  if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
    console.log('🧪 [테스트] confirmManual - startReading 호출 전 DB 체크');
    usageBefore = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('🧪 [테스트] 호출 전 사용 횟수:', usageBefore.usedToday);
  }
  
  try {
    const canStart = await adManager.startReading(spreadId);
    console.log('🎯 [confirmManualSelection] canStart:', canStart);
    
    // 테스트: startReading 호출 후 DB 확인
    if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
      console.log('🧪 [테스트] confirmManual - startReading 호출 후 DB 체크');
      const usageAfter = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('🧪 [테스트] 호출 후 사용 횟수:', usageAfter.usedToday);
      if (usageAfter.usedToday > usageBefore.usedToday) {
        console.error('🧪 [테스트] ⚠️ 문제 발견! confirmManual의 startReading에서 카운트가 증가했습니다!');
      }
    }
    
    if (!canStart) {
      console.log('🎯 [confirmManualSelection] 점괘를 볼 수 없음 - 유료 배열 제한');
      // 점괘를 볼 수 없는 경우 - 유료 배열 하루 1회 제한
      await showPremiumSpreadLimit();
      return;
    }

    await processManualSelection();
  } catch (error) {
    console.error('🎯 [confirmManualSelection] 에러:', error);
    await showAlert({
      title: '오류',
      message: '카드 선택 중 오류가 발생했습니다. 다시 시도해주세요.'
    });
  }
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
  
  // 통계용 카운트 증가 (기획 변경으로 무료 제한 없음)
  // userStore.incrementFreeReading();
};

const startDrawing = async () => {
  console.log('🎯 [startDrawing] 시작');
  console.log('🎯 [startDrawing] 현재 시간:', new Date().toISOString());
  console.log('🎯 [startDrawing] 현재 user:', userStore.currentUser);
  console.log('🎯 [startDrawing] isProcessingResult:', isProcessingResult.value);
  
  // 버튼 클릭 햇틱 피드백
  await nativeUtils.buttonTapHaptic();
  
  // 바로 진행 (연애 상태는 ReadingSelect에서 이미 처리됨)
  await proceedWithDrawing();
};

// 실제 카드 뽑기 진행
const proceedWithDrawing = async () => {
  
  // 광고 매니저를 통해 점괘 시작 가능 여부 확인 (스프레드 ID 전달)
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  console.log('🎯 [startDrawing] spreadId:', spreadId);
  console.log('🎯 [startDrawing] isPremium:', userStore.isPremium);
  console.log('🎯 [startDrawing] userEmail:', userStore.currentUser?.email);
  
  // 테스트: startReading 호출 전 DB 확인
  let usageBefore: any = null;
  if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
    console.log('🧪 [테스트] startReading 호출 전 DB 체크');
    usageBefore = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('🧪 [테스트] 호출 전 사용 횟수:', usageBefore.usedToday);
  }
  
  try {
    const canStart = await adManager.startReading(spreadId);
    console.log('🎯 [startDrawing] canStart:', canStart);
    
    // 테스트: startReading 호출 후 DB 확인
    if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross' && usageBefore) {
      console.log('🧪 [테스트] startReading 호출 후 DB 체크');
      const usageAfter = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('🧪 [테스트] 호출 후 사용 횟수:', usageAfter.usedToday);
      if (usageAfter.usedToday > usageBefore.usedToday) {
        console.error('🧪 [테스트] ⚠️ 문제 발곬! startReading에서 카운트가 증가했습니다!');
      }
    }
    
    if (!canStart) {
      console.log('🎯 [startDrawing] 점괘를 볼 수 없음 - 유료 배열 제한');
      // 점괘를 볼 수 없는 경우 - 유료 배열 하루 1회 제한
      await showPremiumSpreadLimit();
      return;
    }

    // 광고 상태 업데이트
    updateAdStatus();
    
    // 카드 뽑기 진행
    console.log('🎯 [startDrawing] 카드 뽑기 진행');
    await drawCards();
  } catch (error) {
    console.error('🎯 [startDrawing] 에러:', error);
    await showAlert({
      title: '오류',
      message: '카드 뽑기 중 오류가 발생했습니다. 다시 시도해주세요.'
    });
  }
};

const drawCards = async () => {
  console.log('🎲 [drawCards] 카드 뽑기 시작');
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
  console.log('🎲 [drawCards] 카드 개수:', cardCount);
  
  // 실제 타로카드 데이터에서 랜덤 선택
  const selectedCards = tarotStore.drawCards(cardCount);
  console.log('🎲 [drawCards] 선택된 카드:', selectedCards);


  tarotStore.setTempDrawnCards(selectedCards);

  drawnCards.value = selectedCards.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));
  console.log('🎲 [drawCards] drawnCards 설정 완료:', drawnCards.value);

  isDrawing.value = false;
  isComplete.value = true;
  console.log('🎲 [drawCards] 카드 뽑기 완료, isComplete:', isComplete.value);

  // 테스트를 위한 자동 카드 공개 (개발 환경에서만)
  if (userStore.currentUser?.email === 'test@example.com') {
    console.log('🧪 [테스트] 2초 후 모든 카드 자동 공개');
    setTimeout(async () => {
      console.log('🧪 [테스트] 자동 카드 공개 실행');
      await revealAllCards();
      console.log('🧪 [테스트] 자동 카드 공개 완료');
    }, 2000);
  }

  // 통계용 카운트 증가 (기획 변경으로 무료 제한 없음)
  // userStore.incrementFreeReading();
};

const revealCard = async (index: number) => {
  console.log('🃏 [revealCard] 카드 공개:', index);
  // 카드 공개 햇틱 피드백
  await nativeUtils.buttonTapHaptic();
  drawnCards.value[index].revealed = true;
  console.log('🃏 [revealCard] 카드 공개 후 상태:', drawnCards.value[index]);
  console.log('🃏 [revealCard] 전체 카드 공개 상태:', drawnCards.value.map(c => c.revealed));
  console.log('🃏 [revealCard] allCardsRevealed:', allCardsRevealed.value);
  
  // 켈틱 크로스 해석은 createReading에서 생성되므로 여기서는 필요없음 - 2025.01.14
};

// 모든 카드 일괄 뒤집기
const revealAllCards = async () => {
  console.log('🎭 [revealAllCards] 모든 카드 뒤집기 시작');
  // 햅틱 피드백
  await nativeUtils.buttonTapHaptic();
  
  // 모든 카드를 순차적으로 뒤집기 (애니메이션 효과)
  for (let i = 0; i < drawnCards.value.length; i++) {
    drawnCards.value[i].revealed = true;
    console.log(`🎭 [revealAllCards] 카드 ${i} 공개됨`);
    // 카드 사이에 약간의 딜레이 추가
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('🎭 [revealAllCards] 모든 카드 공개 완료');
  console.log('🎭 [revealAllCards] allCardsRevealed:', allCardsRevealed.value);
  
  // 켈틱 크로스 해석은 createReading에서 생성되므로 여기서는 필요없음 - 2025.01.14
};

// 켈틱 크로스 해석은 tarot.ts의 createReading에서 생성하도록 변경됨 - 2025.01.14
// 중복 호출 방지를 위해 제거

// (이미 상단에 선언됨)

// 해석 보기 버튼 클릭 핸들러
const handleInterpretationClick = async () => {
  console.log('🔘 [handleInterpretationClick] 버튼 클릭 됨!');
  console.log('🔘 [handleInterpretationClick] 현재 시간:', new Date().toISOString());
  console.log('🔘 [handleInterpretationClick] isProcessingResult 상태:', isProcessingResult.value);
  
  // 이미 처리 중이면 무시 (중복 클릭 방지)
  if (isProcessingResult.value) {
    console.log('🔘 [handleInterpretationClick] 이미 처리 중 - 무시');
    return;
  }
  
  // 버튼 클릭 시 햅틱 피드백
  await nativeUtils.buttonTapHaptic();
  
  // goToResult 함수 호출 - 디버그 정보 전달
  try {
    console.log('🔘 [handleInterpretationClick] goToResult 호출 시작');
    await goToResult();
    console.log('🔘 [handleInterpretationClick] goToResult 호출 완료');
  } catch (error) {
    console.error('🔘 [handleInterpretationClick] goToResult 에러:', error);
    // 에러 발생 시 플래그 리셋
    isProcessingResult.value = false;
    console.log('🔘 [handleInterpretationClick] 에러 후 isProcessingResult 리셋:', isProcessingResult.value);
    await showAlert({
      title: '오류',
      message: '해석 처리 중 오류가 발생했습니다.'
    });
  }
};

const goToResult = async () => {
  // 디버그용 변수 선언
  let usageBeforeGoToResult: any = null;
  const testEmails = ['test@example.com', 'test@test.com'];
  const currentUserEmail = userStore.currentUser?.email?.toLowerCase() || '';
  const isTestUser = testEmails.includes(currentUserEmail) || currentUserEmail.includes('test');
  
  console.log('🎯 [goToResult] 함수 호출됨!');
  console.log('🎯 [goToResult] isProcessingResult:', isProcessingResult.value);
  console.log('🎯 [goToResult] allCardsRevealed:', allCardsRevealed.value);
  console.log('🎯 [goToResult] drawnCards:', drawnCards.value);
  console.log('🎯 [goToResult] 현재 시간:', new Date().toISOString());
  console.log('🎯 [goToResult] spreadId:', tarotStore.selectedSpread?.spreadId);
  console.log('🎯 [goToResult] 사용자 이메일:', userStore.currentUser?.email);
  
  // 켈틱 크로스인 경우 디버그 정보 수집
  if (tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('🔍 [디버그] 켈틱 크로스 사용 횟수 확인 시작');
    console.log('🔍 [디버그] 사용자 이메일:', currentUserEmail);
    console.log('🔍 [디버그] 테스트 계정 여부:', isTestUser);
    try {
      usageBeforeGoToResult = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('🔍 [디버그] 켈틱 크로스 현재 사용 횟수:', usageBeforeGoToResult);
      
      // 디버그 알람 제거 - 불필요한 알람 표시하지 않음
    } catch (error) {
      console.error('🔍 [디버그] 에러:', error);
      // 에러는 무시하고 계속 진행
    }
  }
  
  // 이미 처리 중이면 중복 호출 방지
  if (isProcessingResult.value) {
    console.log('🎯 [goToResult] 이미 처리 중 - 중복 호출 방지');
    return;
  }
  
  // 모든 카드가 공개되지 않았으면 경고
  if (!allCardsRevealed.value) {
    console.log('🎯 [goToResult] 모든 카드가 공개되지 않음');
    await showAlert({
      title: '카드 공개 필요',
      message: '모든 카드를 먼저 공개해주세요!'
    });
    return;
  }
  
  // 처리 시작
  isProcessingResult.value = true;
  
  // 스프레드 정보 가져오기
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  const premiumSpreads = ['celtic_cross', 'seven_star', 'cup_of_relationship'];
  const isPremiumSpread = premiumSpreads.includes(spreadId);
  const isSimpleSpread = spreadId === 'one_card' || spreadId === 'three_card_timeline';
  
  // 테스트 계정과 임시 프리미엄 확인 - testEmails은 이미 상단에서 선언됨
  // TODO: 실제 테스트할 구글 계정 이메일을 여기에 추가하세요
  const currentEmail = userStore.currentUser?.email?.toLowerCase() || '';
  const isTestAccount = testEmails.includes(currentEmail) || currentEmail.includes('test');
  const hasTempPremium = adStatus.value.isTemporaryPremium;
  
  console.log('🎯 [goToResult] 광고 표시 체크:', {
    isPremium: userStore.isPremium,
    isSimpleSpread,
    hasTempPremium,
    isTestAccount,
    spreadId
  });
  
  // 테스트 계정도 광고를 볼 수 있도록 설정 (개발 테스트용)
  const shouldShowAd = !userStore.isPremium && !isSimpleSpread && !hasTempPremium;
  
  if (shouldShowAd) {
    console.log('📺 [goToResult] 무료 사용자 - 광고 표시');
    console.log('📺 [goToResult] spreadId:', spreadId);
    console.log('📺 [goToResult] isTestAccount:', isTestAccount);
    console.log('📺 [goToResult] hasTempPremium:', hasTempPremium);
    
    // 광고 표시 확인  
    try {
      const confirmed = await showConfirm({
        title: '광고 시청',
        message: '해석을 보려면 15초 광고를 시청해야 합니다.\n(광고는 스킵할 수 없습니다)\n\n계속하시겠습니까?'
      });
      
      console.log('📺 [goToResult] confirm 결과:', confirmed);
      
      if (!confirmed) {
        console.log('📺 [goToResult] 사용자가 취소함');
        isProcessingResult.value = false;
        return;
      }
    } catch (error) {
      console.error('📺 [goToResult] confirm 에러:', error);
      // confirm 에러 시에도 진행
    }
    
    // 광고 표시 - 매번 새로운 광고 인스턴스 생성
    try {
      console.log('📺 [goToResult] 광고 표시 시작...');
      console.log('📺 [goToResult] 현재 시간:', new Date().toISOString());
      
      // adService 초기화 상태 재설정을 위해 약간의 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 광고 서비스에서 직접 강제 시청 광고 표시 (유료 배열은 리워드 광고)
      const adWatched = await showRewardedAd();
      console.log('📺 [goToResult] 강제 시청 광고 표시 결과:', adWatched);
      console.log('📺 [goToResult] 광고 표시 후 시간:', new Date().toISOString());
      
      if (!adWatched) {
        console.log('📺 [goToResult] 광고 시청 실패');
        await showAlert({
          title: '광고 오류',
          message: '광고 로드에 실패했습니다. 다시 시도해주세요.'
        });
        isProcessingResult.value = false;
        return;
      }
      
      // 광고 시청 성공 시 상태 업데이트
      updateAdStatus();
    } catch (error) {
      console.error('📺 [goToResult] 광고 표시 오류:', error);
      console.error('📺 [goToResult] 오류 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // 광고 오류 시에도 진행 (사용자 경험 우선)
      await showAlert({
        title: '알림',
        message: '광고 로드 중 오류가 발생했습니다. 해석 화면으로 이동합니다.'
      });
    }
  } else if (isSimpleSpread) {
    console.log('📺 [goToResult] 1장/3장 배열 - 광고 없이 진행');
  } else if (userStore.isPremium || hasTempPremium) {
    console.log('📺 [goToResult] 프리미엄/임시 프리미엄 사용자 - 광고 없이 진행');
  }
  
  // 유료 배열 사용 기록 (결과 보기 시점에만 기록)
  
  // 테스트: 기록 전 DB 확인
  if (userStore.currentUser?.email === 'test@example.com' && tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('🧪 [테스트] recordPremiumSpreadUsage 호출 전 DB 체크');
    const usageBeforeRecord = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('🧪 [테스트] 기록 전 사용 횟수:', usageBeforeRecord.usedToday);
  }
  
  // 무료 사용자가 유료 배열을 사용하는 경우에만 기록
  // 타로 스토어에서 플래그 확인
  const shouldRecordUsage = tarotStore.getPremiumSpreadUsage();
  
  if (!userStore.isPremium && !hasTempPremium && isPremiumSpread && shouldRecordUsage) {
    // 테스트 계정은 기록하지 않음 - 삼중 체크
    const testEmails = ['test@example.com', 'test@test.com'];
    const currentEmail = userStore.currentUser?.email?.toLowerCase() || '';
    const isDefinitelyTestAccount = testEmails.includes(currentEmail) || currentEmail.includes('test');
    
    console.log('📋 [goToResult] 유료 배열 사용 기록 체크');
    console.log('📋 [goToResult] currentEmail:', currentEmail);
    console.log('📋 [goToResult] isDefinitelyTestAccount:', isDefinitelyTestAccount);
    console.log('📋 [goToResult] spreadId:', spreadId);
    console.log('📋 [goToResult] shouldRecordUsage:', shouldRecordUsage);
    
    if (!isDefinitelyTestAccount) {
      console.log('📋 [goToResult] 일반 사용자 - 유료 배열 사용 기록 시작');
      await adManager.recordPremiumSpreadUsage(spreadId);
      console.log('📋 [goToResult] 유료 배열 사용 기록 완료');
      
      // 플래그 초기화
      tarotStore.clearPremiumSpreadUsage();
    } else {
      console.log('📋 [goToResult] 테스트 계정 확인됨 - 유료 배열 사용 기록 건너뜀');
      console.log('📋 [goToResult] 테스트 계정 이메일:', currentEmail);
      
      // 테스트 계정도 플래그 초기화
      tarotStore.clearPremiumSpreadUsage();
    }
  } else {
    console.log('📋 [goToResult] 유료 배열 기록 조건 미충족:', {
      isPremium: userStore.isPremium,
      hasTempPremium: hasTempPremium,
      isPremiumSpread: isPremiumSpread,
      spreadId: spreadId,
      email: userStore.currentUser?.email
    });
  }
  
  // 기록 후 DB 확인 (모든 사용자 대상)
  if (tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('🔍 [디버그] recordPremiumSpreadUsage 호출 후 DB 체크');
    const usageAfterRecord = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('🔍 [디버그] 기록 후 사용 횟수:', usageAfterRecord.usedToday);
    
    // goToResult 전체 전후 비교 (usageBeforeGoToResult가 있을 때만)
    if (usageBeforeGoToResult) {
      const diff = usageAfterRecord.usedToday - usageBeforeGoToResult.usedToday;
      const accountType = isTestUser ? '테스트 계정' : '일반 무료 계정';
      
      if (isTestUser) {
        // 테스트 계정인 경우
        if (diff > 0) {
          console.error('⚠️ 버그 발견! 테스트 계정인데 카운트가 증가했습니다!');
        } else {
          console.log('✅ 정상: 테스트 계정 카운트 증가 없음');
        }
      } else {
        // 일반 계정인 경우
        if (diff > 0) {
          console.log('✅ 정상: 일반 계정 카운트 증가');
          // 사용 완료 알람 제거 - 자연스러운 사용자 경험을 위해
        } else {
          console.log('🤔 예상치 못한 상황: 일반 계정인데 카운트 증가 없음');
        }
      }
    }
  }
  
  // 모든 배열에서 로딩 화면 표시
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
    
    // 커스텀 질문 가져오기
    const customQuestion = tarotStore.getCustomQuestion();
    
    // 뽑힌 카드로 점괘 생성
    const reading = await tarotStore.createReading(
      tarotStore.selectedSpread?.spreadId || 'one_card',
      tarotStore.selectedTopic?.id || 'general',
      customQuestion || undefined, // 커스텀 질문 전달
      tarotStore.getTempDrawnCards() || undefined
    );
    
    // AI 해석 생성 (프리미엄/테스트 계정만)
    const topic = tarotStore.selectedTopic?.id || 'general';
    const spreadId = tarotStore.selectedSpread?.spreadId || 'three_cards';
    const shouldGenerateAI = (userStore.isPremium || isTestAccount) && 
                            (customQuestion || isCelticCross.value || isSevenStar.value || isCupOfRelationship.value);
    
    if (shouldGenerateAI && reading && !reading.aiInterpretation) {
      console.log('🤖 AI 해석 생성 시작');
      console.log('🤖 조건:', { 
        customQuestion: !!customQuestion, 
        isCelticCross: isCelticCross.value,
        isSevenStar: isSevenStar.value,
        isCupOfRelationship: isCupOfRelationship.value
      });
      
      try {
        // 프로그레스 업데이트
        interpretationProgress.value = 30;
        
        // 켈틱 크로스도 tarot.ts의 createReading에서 이미 해석 생성됨
        // 중복 호출 제거 - 2025.01.14
        // 켈틱크로스는 커스텀 질문 여부와 관계없이 이미 createReading에서 CelticCrossAIInterpreter로 처리됨
        if (isCelticCross.value) {
          console.log('🤖 켈틱 크로스 - 이미 createReading에서 해석 생성됨');
          console.log('🤖 커스텀 질문 여부:', !!customQuestion);
          console.log('🤖 기존 해석 확인:', {
            hasImprovedInterpretation: !!reading.improvedInterpretation,
            hasPremiumInsights: !!reading.premiumInsights,
            hasEnhancedInterpretation: !!reading.enhancedInterpretation,
            hasAiInterpretation: !!reading.aiInterpretation
          });
          
          // 이미 생성된 해석이 있는지 확인
          if (reading.improvedInterpretation) {
            // improvedInterpretation에서 AI 해석 추출
            let aiInterpretationText = '';
            if (typeof reading.improvedInterpretation === 'object') {
              aiInterpretationText = reading.improvedInterpretation.aiInterpretation ||
                                    reading.improvedInterpretation.overallInterpretation || 
                                    reading.improvedInterpretation.summary || 
                                    reading.improvedInterpretation.overallMessage ||
                                    '해석을 생성할 수 없습니다.';
            } else if (typeof reading.improvedInterpretation === 'string') {
              aiInterpretationText = reading.improvedInterpretation;
            }
            reading.aiInterpretation = aiInterpretationText;
            console.log('🤖 기존 켈틱 크로스 해석 사용');
          } else if (reading.enhancedInterpretation?.overallMessage) {
            reading.aiInterpretation = reading.enhancedInterpretation.overallMessage;
            console.log('🤖 기존 enhanced 해석 사용');
          } else {
            console.log('🤖 켈틱 크로스 해석이 이미 생성되어 있어야 함');
          }
        }
        // 세븐스타와 컵오브릴레이션십은 tarot.ts의 createReading에서 이미 해석 생성됨
        // 중복 호출 제거 - 2025.01.14
        else if (isSevenStar.value || isCupOfRelationship.value) {
          console.log('🤖 세븐스타/컵오브릴레이션십 - 이미 createReading에서 해석 생성됨');
          console.log('🤖 기존 해석 확인:', {
            hasEnhancedInterpretation: !!reading.enhancedInterpretation,
            hasPremiumInsights: !!reading.premiumInsights,
            hasAiInterpretation: !!reading.enhancedInterpretation?.aiInterpretation
          });
          
          // 이미 생성된 해석이 있는지 확인
          if (reading.enhancedInterpretation?.aiInterpretation) {
            reading.aiInterpretation = reading.enhancedInterpretation.aiInterpretation;
            console.log('🤖 기존 AI 해석 사용');
          } else if (reading.premiumInsights?.aiInterpretation) {
            reading.aiInterpretation = reading.premiumInsights.aiInterpretation;
            console.log('🤖 기존 프리미엄 해석 사용');
          } else {
            console.log('🤖 해석이 이미 생성되어 있어야 함 (createReading에서)');
          }
        }
        // 커스텀 질문이 있는 경우 customInterpretationService 사용
        // 프리미엄 배열법(켈틱크로스, 세븐스타, 컵오브릴레이션십)은 제외
        else if (customQuestion && !isCelticCross.value && !isSevenStar.value && !isCupOfRelationship.value) {
          console.log('🤖 커스텀 질문 AI 해석 생성');
          
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
                name: getPositionNameForSpread(spreadId, index),
                description: ''
              },
              meanings: card.meanings || {}
            })),
            spreadId: spreadId,
            topic: topic,
            customQuestion: customQuestion,
            userId: userStore.currentUser?.id,
            relationshipStatus: (topic === 'love') ? tarotStore.relationshipStatus : undefined
          };

          const interpretationResult = await customInterpretationService.generateInterpretation(interpretationRequest);
          
          if (interpretationResult.success && interpretationResult.interpretation) {
            reading.aiInterpretation = interpretationResult.interpretation;
            reading.aiInterpretationId = interpretationResult.interpretationId || null;
            
            if (interpretationResult.probabilityAnalysis) {
              reading.probabilityAnalysis = interpretationResult.probabilityAnalysis;
            }
            
            console.log('🤖 커스텀 질문 AI 해석 성공');
          } else {
            console.error('🤖 커스텀 질문 AI 해석 실패:', interpretationResult.error);
            reading.aiInterpretation = '해석을 생성할 수 없습니다.';
          }
        }
        
        // 프로그레스 업데이트
        interpretationProgress.value = 70;
        
        // reading을 store에 업데이트
        tarotStore.updateReading(reading);
      } catch (aiError) {
        console.error('🤖 AI 해석 생성 실패:', aiError);
        tarotStore.updateReading(reading);
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
    
    // 플래그 명확하게 리셋 (페이지 전환 전)
    isProcessingResult.value = false;
    console.log('🎯 [goToResult] 페이지 전환 전 isProcessingResult 리셋:', isProcessingResult.value);
    
    // 점괴 결과 화면으로 이동
    console.log('🎯 [goToResult] 결과 화면으로 이동 시도:', `/reading-result?readingId=${reading.id}`);
    
    // nextTick을 사용해 DOM 업데이트 후 라우팅
    await nextTick();
    
    router.push(`/reading-result?readingId=${reading.id}`);
    console.log('🎯 [goToResult] router.push 호출 완료');
  } catch (error) {
    
    // 프로그레스 정리
    clearInterval(progressInterval);
    isGeneratingInterpretation.value = false;
    interpretationProgress.value = 0;
    
    await showAlert({
      title: '점괘 생성 실패',
      message: `점괘 생성에 실패했습니다: ${error.message || '알 수 없는 오류'}`
    });
  } finally {
    // 처리 완료 플래그 리셋 - nextTick을 사용해 확실하게 리셋
    console.log('🎯 [goToResult] finally 블록 - isProcessingResult 리셋 시작');
    isProcessingResult.value = false;
    await nextTick();
    isProcessingResult.value = false; // 이중 리셋으로 확실하게
    console.log('🎯 [goToResult] finally 블록 - isProcessingResult 리셋 완료:', isProcessingResult.value);
  }
};

// 기획 변경으로 광고 모달 사용하지 않음
// const closeAdModal = () => {
//   showAdModal.value = false;
//   
//   // 광고 상태 업데이트
//   updateAdStatus();
//   
//   if (drawMethod.value === 'random') {
//     drawCards();
//   } else if (drawMethod.value === 'manual') {
//     processManualSelection();
//   }
// };

// 이미지 로드 에러 처리 - 통합 함수 사용
const onImageError = handleUnifiedImageError;

// 스프레드별 위치 이름 가져오기
const getPositionNameForSpread = (spreadId: string, index: number): string => {
  const positions = {
    'celtic_cross': [
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
    ],
    'seven_star': [
      '근원',
      '과거의 영향',
      '현재 상황',
      '의식적 소망',
      '무의식적 필요',
      '숨겨진 영향',
      '최종 결과'
    ],
    'cup_of_relationship': [
      '나의 마음',
      '상대의 마음',
      '과거의 인연',
      '현재의 관계',
      '미래의 가능성',
      '관계의 장애물',
      '우주의 조언'
    ],
    'three_card_timeline': [
      '과거',
      '현재',
      '미래'
    ],
    'one_card': [
      '핵심 메시지'
    ]
  };
  
  return positions[spreadId]?.[index] || `위치 ${index + 1}`;
};

// 연애 상태 관련 핸들러 제거됨 - ReadingSelect에서 처리

// 유료 배열 하루 1회 제한 안내
const showPremiumSpreadLimit = async () => {
  console.log('💵 [showPremiumSpreadLimit] 호출됨');
  const spreadNames = {
    'celtic_cross': '켈틱 크로스',
    'seven_star': '세븐 스타',
    'cup_of_relationship': '컵 오브 릴레이션십'
  };
  
  const spreadId = tarotStore.selectedSpread?.spreadId || '';
  const spreadName = spreadNames[spreadId] || '유료 배열';
  console.log('💵 [showPremiumSpreadLimit] spreadId:', spreadId);
  console.log('💵 [showPremiumSpreadLimit] spreadName:', spreadName);
  
  // 테스트 계정인지 확인
  const isTestAccount = userStore.currentUser?.email === 'test@example.com';
  console.log('💵 [showPremiumSpreadLimit] isTestAccount:', isTestAccount);
  
  if (isTestAccount) {
    console.log('🧪 [showPremiumSpreadLimit] 테스트 계정 - 유료 배열 제한 없이 진행');
    // 테스트 계정은 그냥 진행 (이 함수가 호출되면 안되지만 혁시라도)
    await drawCards();
    return;
  }
  
  // 사용 가능한 시간 계산
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
  
  await showAlert({
    title: '유료 배열 사용 제한',
    message: `${spreadName} 배열법은 하루에 한 번만 사용할 수 있습니다.\n\n다음 사용 가능 시간: ${hoursUntilReset}시간 ${minutesUntilReset}분 후\n\n💡 무료 배열법(1장, 3장)은 광고 시청으로 무제한 이용 가능합니다!`
  });
  
  // 읽기 선택 화면으로 돌아가기
  router.push('/reading-select');
};

// 무료 점괘 상태 확인 (기획 변경으로 항상 true)
const checkFreeReadingStatus = () => {
  // 무료 사용자도 광고 시청으로 무제한 가능
  return true;
};
</script>

<style scoped>
.card-drawing {
  height: 100dvh;
  min-height: 100dvh;
  padding: 20px;
  padding-top: 20px;
  padding-bottom: calc(20px + var(--app-safe-bottom));
  --page-bg: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  background: var(--page-bg);
  /* 모바일에서 좌우 드래그 방지 */
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  max-width: 100vw;
  position: relative;
  /* 터치 스크롤 최적화 */
  -webkit-overflow-scrolling: touch;
  /* 바운스 효과 방지 */
  overscroll-behavior: none;
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

/* .free-usage-indicator 스타일 제거 */

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
  /* 모바일에서 너비 제한 */
  width: 100%;
  overflow-x: hidden;
  position: relative;
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
  width: 190px;
  height: 170px;
}

.card-animation .card-back {
  position: absolute;
  width: 96px;
  height: 144px;
  font-size: 30px;
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
    width: 145px;
  }
  
  .card-animation .card-back {
    width: 76px;
    height: 114px;
    font-size: 22px;
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
  --page-bg: radial-gradient(ellipse at center, rgba(88, 28, 135, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #0F0C29 0%, #24243e 100%);
  background: var(--page-bg);
}

.celtic-cross-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
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
  position: relative;
}

/* 세븐 스타 모드 스타일 */
.card-drawing.seven-star-mode {
  --page-bg: radial-gradient(ellipse at center, rgba(25, 25, 112, 0.3) 0%, transparent 70%),
              linear-gradient(180deg, #000428 0%, #004e92 100%);
  background: var(--page-bg);
}

/* 컵 오브 릴레이션십 모드 스타일 */
.card-drawing.cup-relationship-mode {
  --page-bg: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #2D1B69 0%, #0F3443 100%);
  background: var(--page-bg);
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
