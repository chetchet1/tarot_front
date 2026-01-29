<template>
  <div class="card-drawing" :class="{ 
  'celtic-cross-mode': isCelticCross,
  'seven-star-mode': isSevenStar,
  'cup-relationship-mode': isCupOfRelationship,
  'special-layout-mode': hasSpecialLayout
}" @click="debugClick">
    <header class="page-header">
      <div class="header-top">
        <button class="back-button" @click="goBack">???ㅻ줈</button>
        <h1>
          移대뱶 戮묎린
          <span v-if="hasSpecialLayout" class="spread-name">
            - {{ getSpreadDisplayName() }}
          </span>
        </h1>
      </div>
      <!-- ?꾩떆 ?꾨━誘몄뾼 ?쒖떆 -->
      <div v-if="adStatus.isTemporaryPremium" class="premium-status-indicator">
        ?뙚 ?꾩떆 ?꾨━誘몄뾼 ?쒖꽦??以?        <span class="expiry-time">{{ formatExpiryTime() }}</span>
      </div>
    </header>

    <div class="container">
      <!-- 移대뱶 戮묎린 諛⑹떇 ?좏깮 -->
      <div class="draw-method-selection" v-if="!drawMethod && !isDrawing && !isComplete">
        <p class="instruction">移대뱶瑜??대뼸寃?戮묒쑝?쒓쿋?듬땲源?</p>
        <div class="method-buttons">
          <button class="method-button" @click="selectDrawMethod('random')">
            <div class="method-icon">?렡</div>
            <h3>臾댁옉?꾨줈 戮묎린</h3>
            <p>?대챸??留↔꺼 移대뱶瑜?戮묒뒿?덈떎</p>
          </button>
          <button class="method-button" @click="selectDrawMethod('manual')">
            <div class="method-icon">??/div>
            <h3>吏곸젒 戮묎린</h3>
            <p>?쇱퀜吏?移대뱶?먯꽌 吏곸젒 ?좏깮?⑸땲??/p>
          </button>
        </div>
      </div>

      <!-- 臾댁옉??戮묎린 -->
      <div class="deck-container" v-if="drawMethod === 'random' && !isDrawing && !isComplete">
        <p class="instruction">移대뱶瑜??욊퀬 ?덉뒿?덈떎...</p>
        <div class="card-back shuffling">
          ?깗
        </div>
        <button 
          class="btn btn-primary draw-button"
          @click="startDrawing"
        >
          {{ getDrawButtonText() }}
        </button>
      </div>

      <!-- 吏곸젒 ?좏깮 紐⑤뱶 -->
      <div class="manual-selection-container" v-if="drawMethod === 'manual' && !isComplete">
        <p class="instruction">
          {{ manualSelectedCards.length }}/{{ getCardCount() }}???좏깮?덉뒿?덈떎.
          <span v-if="manualSelectedCards.length > 0" class="sub-instruction">
            (?좏깮??移대뱶瑜??대┃?섎㈃ 痍⑥냼?????덉뒿?덈떎)
          </span>
          <span v-else>
            移대뱶瑜??대┃?섏뿬 ?좏깮?섏꽭??
          </span>
        </p>
        
        <!-- ?좏깮??移대뱶 ?쒖떆 -->
        <div v-if="manualSelectedCards.length > 0" class="selected-cards-preview">
          <div 
            v-for="(card, index) in manualSelectedCards" 
            :key="index" 
            class="selected-card-mini"
            @click="removeSelectedCard(index)"
            title="?대┃?섎㈃ ?좏깮 痍⑥냼"
          >
            <span class="selection-number">{{ index + 1 }}</span>
          </div>
        </div>
        
        <!-- 78??移대뱶 ?ㅽ봽?덈뱶 -->
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
              <div class="card-back-small">?깗</div>
            </div>
          </div>
        </div>
        
        <!-- ?좏깮 ?꾨즺 踰꾪듉 -->
        <button 
          class="btn btn-primary confirm-button"
          :disabled="manualSelectedCards.length !== getCardCount()"
          @click="confirmManualSelection"
        >
          移대뱶 ?좏깮 ?꾨즺
        </button>
      </div>

      <!-- 移대뱶 戮묐뒗 以?-->
      <div class="drawing-container" v-if="isDrawing">
        <p class="instruction">{{ getCardCount() }}?μ쓽 移대뱶瑜?戮묎퀬 ?덉뒿?덈떎...</p>
        <div class="card-animation">
          <div class="card-back" v-for="i in getCardCount()" :key="i" :class="`card-${i}`">
            ?깗
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- 戮묓엺 移대뱶??-->
      <div class="cards-container" v-if="isComplete && drawnCards.length > 0">
        <!-- 罹섑떛 ?щ줈???꾩슜 ?덉씠?꾩썐 -->
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
                ?댁꽍 蹂닿린
              </button>
            </template>
          </CelticCrossLayout>
        </div>
        
        <!-- ?몃툙 ?ㅽ? ?꾩슜 ?덉씠?꾩썐 -->
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
                ?댁꽍 蹂닿린
              </button>
            </template>
          </SevenStarLayout>
        </div>
        
        <!-- 而??ㅻ툕 由대젅?댁뀡???꾩슜 ?덉씠?꾩썐 -->
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
                ?댁꽍 蹂닿린
              </button>
            </template>
          </CupOfRelationshipLayout>  
        </div>
        
        <!-- ?쇰컲 移대뱶 ?덉씠?꾩썐 -->
        <div v-else>
          <p class="instruction">?뱀떊??移대뱶?낅땲??/p>
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
                  {{ card.orientation === 'upright' ? '?뺣갑?? : '??갑?? }}
                </div>
              </div>
              <div class="card-back" v-else>
                ?깗
                <p>?대┃?섏뿬 怨듦컻</p>
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
          ?댁꽍 蹂닿린
        </button>
      </div>

      <!-- 愿묎퀬 紐⑤떖 (湲고쉷 蹂寃쎌쑝濡??ъ슜?섏? ?딆쓬) -->
      <!-- <AdModal v-if="showAdModal" @close="closeAdModal" /> -->
      
      <!-- AI ?댁꽍 濡쒕뵫 ?붾㈃ -->
      <TarotLoadingScreen 
        :isVisible="isGeneratingInterpretation" 
        :progress="interpretationProgress"
      />
      
      <!-- ?곗븷 ?곹깭 ?좏깮 紐⑤떖 - ReadingSelect?먯꽌 泥섎━?섎?濡??쒓굅??-->
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
// 以묐났 ?몄텧 諛⑹?瑜??꾪빐 Interpreter?ㅼ? tarot.ts?먯꽌留??ъ슜?섎룄濡?蹂寃?- 2025.01.14
// import { ImprovedCelticCrossInterpreter } from '../utils/ImprovedCelticCrossInterpreter'; // tarot.ts?먯꽌留??ъ슜
// import { SevenStarInterpreter } from '../services/interpretation/SevenStarInterpreter'; // tarot.ts?먯꽌留??ъ슜
// import { CupOfRelationshipInterpreter } from '../services/interpretation/CupOfRelationshipInterpreter'; // tarot.ts?먯꽌留??ъ슜
import { customInterpretationService } from '../services/ai/customInterpretationService';
import { showAlert, showConfirm } from '../utils/alerts';
import { getUnifiedCardImagePath, handleUnifiedImageError } from '../utils/unifiedCardImage';
import { showRewardedAd } from '../services/admob'; // ?좊즺 諛곗뿴??媛뺤젣 ?쒖껌 愿묎퀬
import { interceptPremiumSpreadCalls, interceptAdManager } from '../utils/debugPremiumSpread'; // ?붾쾭洹??꾧뎄
import { monitorSupabaseAPICalls } from '../utils/supabaseMonitor'; // Supabase API 紐⑤땲?곕쭅

// 而댄룷?뚰듃 吏곸젒 import濡?蹂寃?// import AdModal from '../components/AdModal.vue'; // 湲고쉷 蹂寃쎌쑝濡??ъ슜?섏? ?딆쓬
import CelticCrossLayout from '../components/spreads/CelticCrossLayout.vue';
import SevenStarLayout from '../components/spreads/SevenStarLayout.vue';
import CupOfRelationshipLayout from '../components/spreads/CupOfRelationshipLayout.vue';
import TarotLoadingScreen from '../components/loading/TarotLoadingScreen.vue';
// RelationshipStatusModal ?쒓굅??- ReadingSelect?먯꽌 泥섎━
// Alert 而댄룷?뚰듃??useAlert瑜??듯빐 ?ъ슜

interface DrawnCardData {
  card: any; // TarotCard type
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();
// showAlert, showConfirm? 吏곸젒 import?댁꽌 ?ъ슜

const drawMethod = ref<'random' | 'manual' | null>(null);
const isDrawing = ref(false);
const isComplete = ref(false);
const progress = ref(0);
const drawnCards = ref<DrawnCardData[]>([]);
// const showAdModal = ref(false); // 湲고쉷 蹂寃쎌쑝濡??ъ슜?섏? ?딆쓬
const manualSelectedCards = ref<any[]>([]);
const shuffledDeck = ref<any[]>([]);
const improvedInterpretation = ref<any>(null);
const isGeneratingInterpretation = ref(false);
const interpretationProgress = ref(0);

// ?곗븷 ?곹깭 紐⑤떖 愿???곹깭 - ?쒓굅??(ReadingSelect?먯꽌 泥섎━)

const allCardsRevealed = computed(() => {
  return drawnCards.value.length > 0 && drawnCards.value.every(card => card.revealed);
});\n\n\n});\n\n// 愿묎퀬 留ㅻ땲? ?곹깭
const adManager = getAdManager();
const adStatus = ref(adManager.getStatus());

// 愿묎퀬 ?곹깭 ?낅뜲?댄듃 ?⑥닔
const updateAdStatus = () => {
  adStatus.value = adManager.getStatus();
};

// ?⑥? ?쒓컙 ?щ㎎??const formatExpiryTime = () => {
  if (!adStatus.value.temporaryPremiumExpiry) return '';
  
  const now = new Date();
  const expiry = new Date(adStatus.value.temporaryPremiumExpiry);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return '留뚮즺??;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}?쒓컙 ${minutes}遺??⑥쓬`;
  } else {
    return `${minutes}遺??⑥쓬`;
  }
};

// ?밸퀎 ?덉씠?꾩썐 ?ㅽ봽?덈뱶?몄? ?뺤씤
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

// ?ㅽ봽?덈뱶 ?쒖떆 ?대쫫 媛?몄삤湲?const getSpreadDisplayName = () => {
  if (isCelticCross.value) return '耳덊떛 ?щ줈??;
  if (isSevenStar.value) return '?몃툙 ?ㅽ?';
  if (isCupOfRelationship.value) return '而??ㅻ툕 由대젅?댁뀡??;
  return '';
};

// 移대뱶 戮묎린 踰꾪듉 ?띿뒪??const getDrawButtonText = () => {
  // 臾대즺 ?ъ슜?먮룄 愿묎퀬 ?쒖껌?쇰줈 臾댁젣??媛??  return '移대뱶 戮묎린';
};

// 移대뱶 ?대?吏 URL ?앹꽦 - ?듯빀 ?⑥닔 ?ъ슜
const getCardImageUrl = (card: any) => getUnifiedCardImagePath(card);

// 移대뱶 媛쒖닔 媛?몄삤湲?const getCardCount = () => {
  return tarotStore.selectedSpread?.cardCount || 1;
};

// ?붾쾭洹몄슜 ?대┃ ?몃뱾??const debugClick = () => {
  console.log('[CardDrawing] ?붾㈃ ?대┃??);
  console.log('[CardDrawing] drawMethod:', drawMethod.value);
  console.log('[CardDrawing] isDrawing:', isDrawing.value);
  console.log('[CardDrawing] isComplete:', isComplete.value);
  console.log('[CardDrawing] ?꾩옱 URL:', window.location.pathname);
};

// 以묐났 ?몄텧 諛⑹?瑜??꾪븳 ?뚮옒洹?- ?곷떒???좎뼵
const isProcessingResult = ref(false);

\nconst allowPageScroll = computed(() => {\n  return tarotStore.selectedSpread?.spreadId === 'three_card_timeline';\n});\n\nconst setNoScroll = (enabled: boolean) => {
  const root = document.documentElement;
  const scroll = document.querySelector('.app-scroll');
  if (!root || !document.body) return;
  root.classList.toggle('no-scroll', enabled);
  document.body.classList.toggle('no-scroll', enabled);
  if (scroll) {
    scroll.classList.toggle('no-scroll', enabled);
  }
};

// ?곹깭 珥덇린???⑥닔
const resetState = () => {
  console.log('?봽 [resetState] ?곹깭 珥덇린???쒖옉');
  console.log('?봽 [resetState] 珥덇린????isProcessingResult:', isProcessingResult.value);
  drawMethod.value = null;
  isDrawing.value = false;
  isComplete.value = false;
  progress.value = 0;
  drawnCards.value = [];
  manualSelectedCards.value = [];
  improvedInterpretation.value = null;
  isGeneratingInterpretation.value = false;
  interpretationProgress.value = 0;
  // ?곗븷 ?곹깭??ReadingSelect?먯꽌 泥섎━
  // isProcessingResult瑜??뺤떎?섍쾶 false濡??ㅼ젙
  isProcessingResult.value = false;
  // nextTick???ъ슜??DOM ?낅뜲?댄듃 ???ы솗??  nextTick(() => {
    isProcessingResult.value = false;
    console.log('?봽 [resetState] nextTick ??isProcessingResult:', isProcessingResult.value);
  });
  console.log('?봽 [resetState] 珥덇린????isProcessingResult:', isProcessingResult.value);
  console.log('?봽 [resetState] ?곹깭 珥덇린???꾨즺');
};

// 而댄룷?뚰듃 ?뚭눼 ???뚮옒洹?由ъ뀑
onBeforeUnmount(() => {
  console.log('?뵚 [onBeforeUnmount] 而댄룷?뚰듃 ?뚭눼 ??- ?뚮옒洹?由ъ뀑');
  isProcessingResult.value = false;
  isGeneratingInterpretation.value = false;
});\n\n\n});\n\n// 而댄룷?뚰듃 ?뚭눼 ???뚮옒洹?由ъ뀑
\n});\n\nwatch(allowPageScroll, (nextValue) => {\n  setNoScroll(!nextValue);\n});\n\nonUnmounted(() => {
  setNoScroll(false);
  applyPageTheme(defaultPageBg);
  console.log('?뵚 [onUnmounted] 而댄룷?뚰듃 ?뚭눼 - ?뚮옒洹?由ъ뀑');
  isProcessingResult.value = false;
  isGeneratingInterpretation.value = false;
});\n\n\n});\n\n// ?쇱슦??寃쎈줈 蹂寃?媛먯?
watch(() => router.currentRoute.value.path, (newPath, oldPath) => {
  if (oldPath && oldPath.includes('card-drawing') && !newPath.includes('card-drawing')) {
    console.log('?봽 [watch] 移대뱶 ?쒕줈???섏씠吏?먯꽌 ?좊궓 - ?뚮옒洹?由ъ뀑');
    isProcessingResult.value = false;
    isGeneratingInterpretation.value = false;
  }
});

onMounted(async () => {
  setNoScroll(!allowPageScroll.value);
  \n});\n\napplyPageTheme(pageTheme.value);
  console.log('?렣 [CardDrawing] onMounted ?쒖옉');
  console.log('?뱦 [CardDrawing] ?좏깮??二쇱젣:', tarotStore.selectedTopic);
  console.log('?뱤 [CardDrawing] ?좏깮??諛곗뿴踰?', tarotStore.selectedSpread);
  console.log('??[CardDrawing] 而ㅼ뒪? 吏덈Ц:', tarotStore.getCustomQuestion());
  console.log('?렣 [CardDrawing] ?濡쒖뭅??媛쒖닔:', tarotStore.tarotCards.length);
  console.log('?뙋 [CardDrawing] ?꾩옱 URL:', window.location.pathname);
  console.log('?뙋 [CardDrawing] ?쇱슦??寃쎈줈:', router.currentRoute.value.path);
  console.log('?뵇 [CardDrawing] ?꾩껜 ?ㅽ넗???곹깭:', {
    selectedTopic: JSON.stringify(tarotStore.selectedTopic),
    selectedSpread: JSON.stringify(tarotStore.selectedSpread),
    drawMethod: drawMethod.value,
    isDrawing: isDrawing.value,
    isComplete: isComplete.value
  });\n\n\n});\n\n// ?뚯뒪??怨꾩젙?????붾쾭洹?紐⑤뱶 ?쒖꽦??  if (userStore.currentUser?.email === 'test@example.com') {
    console.error('?뵶?뵶?뵶 ?뚯뒪??怨꾩젙 媛먯? - ?붾쾭洹?紐⑤뱶 ?쒖꽦??);
    console.error('?뵶 ?꾩옱 ?쒓컙:', new Date().toISOString());
    console.error('?뵶 spreadId:', tarotStore.selectedSpread?.spreadId);
    
    // 紐⑤뱺 紐⑤땲?곕쭅 ?쒖꽦??    try {
      monitorSupabaseAPICalls(); // Supabase API ?몄텧 紐⑤땲?곕쭅
      interceptPremiumSpreadCalls(); // 肄섏넄 濡쒓렇 異붿쟻
      interceptAdManager(); // AdManager 媛濡쒖콈湲?      
      console.error('?뵶 紐⑤땲?곕쭅 ?쒖옉 ?꾨즺');
      console.error('?뵶 移대뱶 戮묎린 ??API ?몄텧??異붿쟻?⑸땲??..');
    } catch (debugError) {
      console.error('?뵶 ?붾쾭洹?紐⑤뱶 ?쒖꽦???ㅻ쪟:', debugError);
      // ?붾쾭洹??ㅻ쪟??臾댁떆?섍퀬 怨꾩냽 吏꾪뻾
    }
  }
  
  // ?곹깭 珥덇린??  resetState();
  
  // DOM??留덉슫?몃릺?덈뒗吏 ?뺤씤
  console.log('?뵇 [CardDrawing] DOM ?뺤씤:', {
    hasRootElement: document.querySelector('.card-drawing') !== null,
    body: document.body.innerHTML.substring(0, 200)
  });\n\n\n});\n\n// ?좏깮??二쇱젣? 諛곗뿴踰뺤씠 ?놁쑝硫??좏깮 ?붾㈃?쇰줈 ?뚯븘媛湲?  if (!tarotStore.selectedTopic || !tarotStore.selectedSpread) {
    console.error('[CardDrawing] 二쇱젣 ?먮뒗 諛곗뿴踰뺤씠 ?좏깮?섏? ?딆쓬');
    console.log('[CardDrawing] ?좏깮 ?붾㈃?쇰줈 ?뚯븘媛묐땲??);
    
    // 媛꾨떒???뚮┝ 硫붿떆吏
    await showAlert({
      title: '?좏깮 ?꾩슂',
      message: '二쇱젣? 諛곗뿴踰뺤쓣 癒쇱? ?좏깮?댁＜?몄슂.'
    });\n\n\n});\n\n// ?좏깮 ?붾㈃?쇰줈 ?대룞
    router.push('/reading-select');
    return;
  }
  
  // 媛뺤젣濡??붾㈃ ?낅뜲?댄듃 ?몃━嫄?  await nextTick();
  console.log('[CardDrawing] nextTick ??- ?붾㈃???뚮뜑留곷릺?댁빞 ??);
  
  // ?섏씠吏 濡쒕뱶 ??移대뱶 ?욊린 ?좊땲硫붿씠??  setTimeout(() => {
    // 移대뱶 以鍮??꾨즺
  }, 1000);
  
  // 吏곸젒 ?좏깮???꾪븳 ???욊린
  shuffleDeck();
  
  // ?濡??ㅽ넗??珥덇린???뺤씤
  if (tarotStore.tarotCards.length === 0) {
    console.log('[CardDrawing] ?濡쒖뭅?쒓? ?놁뼱??珥덇린???쒖옉');
    await tarotStore.initialize();
    console.log('[CardDrawing] 珥덇린?????濡쒖뭅??媛쒖닔:', tarotStore.tarotCards.length);
  }
});

watch(pageTheme, (value) => {
  applyPageTheme(value);
}, { immediate: true });

const goBack = () => {
  router.go(-1);
};

// ?쒕줈??諛⑸쾿 ?좏깮
const selectDrawMethod = async (method: 'random' | 'manual') => {
  console.log('?렡 [selectDrawMethod] 諛⑸쾿 ?좏깮:', method);
  console.log('?렡 [selectDrawMethod] ?좏깮 ??isProcessingResult:', isProcessingResult.value);
  
  // ?덈줈???먭킌 ?쒖옉 ???곹깭 珥덇린??  resetState();
  
  drawMethod.value = method;
  
  if (method === 'manual') {
    // 吏곸젒 ?좏깮 紐⑤뱶瑜??꾪븳 珥덇린??    manualSelectedCards.value = [];
  }
  
  console.log('?렡 [selectDrawMethod] ?좏깮 ??isProcessingResult:', isProcessingResult.value);
};

// ???욊린
const shuffleDeck = () => {
  if (tarotStore.tarotCards.length > 0) {
    // 紐⑤뱺 移대뱶瑜?蹂듭궗?섍퀬 ?욊린
    const allCards = [...tarotStore.tarotCards];
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    shuffledDeck.value = allCards;
  }
};

// 移대뱶 ?ㅽ봽?덈뱶 ?ㅽ???(?κ렐 遺梨꾧섦 ?뺥깭)
const getCardSpreadStyle = (index: number) => {
  const totalCards = 78;
  const centerX = 50; // 以묒떖??X (?쇱꽱??
  const centerY = 75; // 以묒떖??Y (?쇱꽱?? - ???꾨줈 ?щ┝
  
  // 遺梨꾧섦 媛곷룄 怨꾩궛 - ??珥섏킌?섍쾶
  const totalAngle = 240; // ?꾩껜 ?쇱묠 媛곷룄 (240?꾨줈 利앷?)
  const startAngle = -120; // ?쒖옉 媛곷룄
  const angleStep = totalAngle / (totalCards - 1);
  const angle = startAngle + (index * angleStep);
  
  // ?쇰뵒?덉쑝濡?蹂??  const radian = (angle * Math.PI) / 180;
  
  // ??먰삎 諛곗튂瑜??꾪븳 諛섏?由?怨꾩궛
  // 媛濡?諛섏?由꾩쓣 ?몃줈蹂대떎 ?ш쾶 ?섏뿬 ??먰삎?쇰줈 留뚮벀
  const radiusX = 45; // 媛濡?諛섏?由?(?쇱꽱??
  const radiusY = 30; // ?몃줈 諛섏?由?(?쇱꽱?? - ??以꾩엫
  
  // 移대뱶 ?꾩튂 怨꾩궛 (???怨듭떇 ?ъ슜)
  const x = centerX + radiusX * Math.sin(radian);
  const y = centerY - radiusY * Math.cos(radian);
  
  // 移대뱶媛 寃뱀퀜 蹂댁씠?꾨줉 z-index 議곗젙
  const zIndex = 78 - Math.abs(index - 39); // 以묒븰???꾨줈
  
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${angle * 0.7}deg)`, // ?뚯쟾 媛곷룄瑜?以꾩엫
    transformOrigin: 'center center',
    zIndex: zIndex
  };
};

// 移대뱶 ?좏깮 ?뺤씤
const isCardSelected = (card: any) => {
  return manualSelectedCards.value.some(selected => selected.id === card.id);
};

// ?섎룞 移대뱶 ?좏깮
const selectManualCard = async (card: any) => {
  await nativeUtils.buttonTapHaptic();
  
  const isSelected = isCardSelected(card);
  const maxCards = getCardCount();
  
  if (isSelected) {
    // ?대? ?좏깮??移대뱶???좏깮 ?댁젣
    manualSelectedCards.value = manualSelectedCards.value.filter(c => c.id !== card.id);
  } else if (manualSelectedCards.value.length < maxCards) {
    // ?꾩쭅 ?좏깮 媛?ν븳 寃쎌슦
    // 臾댁옉??諛⑺뼢 寃곗젙
    const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
    manualSelectedCards.value.push({
      ...card,
      orientation
    });
  }
};

// ?좏깮??移대뱶 ?쒓굅
const removeSelectedCard = async (index: number) => {
  await nativeUtils.buttonTapHaptic();
  manualSelectedCards.value.splice(index, 1);
};

// ?섎룞 ?좏깮 ?꾨즺
const confirmManualSelection = async () => {
  console.log('?렞 [confirmManualSelection] ?쒖옉');
  
  // 諛붾줈 吏꾪뻾 (?곗븷 ?곹깭??ReadingSelect?먯꽌 ?대? 泥섎━??
  await proceedWithManualSelection();
};

// ?ㅼ젣 ?섎룞 ?좏깮 泥섎━
const proceedWithManualSelection = async () => {
  console.log('?렞 [proceedWithManualSelection] ?쒖옉');
  
  // 愿묎퀬 留ㅻ땲?瑜??듯빐 ?먭킌 ?쒖옉 媛???щ? ?뺤씤 (?ㅽ봽?덈뱶 ID ?꾨떖)
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  console.log('?렞 [confirmManualSelection] spreadId:', spreadId);
  
  // ?뚯뒪?? startReading ?몄텧 ??DB ?뺤씤
  let usageBefore;
  if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
    console.log('?㎦ [?뚯뒪?? confirmManual - startReading ?몄텧 ??DB 泥댄겕');
    usageBefore = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?㎦ [?뚯뒪?? ?몄텧 ???ъ슜 ?잛닔:', usageBefore.usedToday);
  }
  
  try {
    const canStart = await adManager.startReading(spreadId);
    console.log('?렞 [confirmManualSelection] canStart:', canStart);
    
    // ?뚯뒪?? startReading ?몄텧 ??DB ?뺤씤
    if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
      console.log('?㎦ [?뚯뒪?? confirmManual - startReading ?몄텧 ??DB 泥댄겕');
      const usageAfter = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('?㎦ [?뚯뒪?? ?몄텧 ???ъ슜 ?잛닔:', usageAfter.usedToday);
      if (usageAfter.usedToday > usageBefore.usedToday) {
        console.error('?㎦ [?뚯뒪?? ?좑툘 臾몄젣 諛쒓껄! confirmManual??startReading?먯꽌 移댁슫?멸? 利앷??덉뒿?덈떎!');
      }
    }
    
    if (!canStart) {
      console.log('?렞 [confirmManualSelection] ?먭킌瑜?蹂????놁쓬 - ?좊즺 諛곗뿴 ?쒗븳');
      // ?먭킌瑜?蹂????녿뒗 寃쎌슦 - ?좊즺 諛곗뿴 ?섎（ 1???쒗븳
      await showPremiumSpreadLimit();
      return;
    }

    await processManualSelection();
  } catch (error) {
    console.error('?렞 [confirmManualSelection] ?먮윭:', error);
    await showAlert({
      title: '?ㅻ쪟',
      message: '移대뱶 ?좏깮 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.'
    });
  }
};

// ?섎룞 ?좏깮 泥섎━
const processManualSelection = async () => {
  // ?좏깮??移대뱶濡?吏꾪뻾
  tarotStore.setTempDrawnCards(manualSelectedCards.value);
  
  drawnCards.value = manualSelectedCards.value.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));
  
  isComplete.value = true;
  
  // ?듦퀎??移댁슫??利앷? (湲고쉷 蹂寃쎌쑝濡?臾대즺 ?쒗븳 ?놁쓬)
  // userStore.incrementFreeReading();
};

const startDrawing = async () => {
  console.log('?렞 [startDrawing] ?쒖옉');
  console.log('?렞 [startDrawing] ?꾩옱 ?쒓컙:', new Date().toISOString());
  console.log('?렞 [startDrawing] ?꾩옱 user:', userStore.currentUser);
  console.log('?렞 [startDrawing] isProcessingResult:', isProcessingResult.value);
  
  // 踰꾪듉 ?대┃ ?뉙떛 ?쇰뱶諛?  await nativeUtils.buttonTapHaptic();
  
  // 諛붾줈 吏꾪뻾 (?곗븷 ?곹깭??ReadingSelect?먯꽌 ?대? 泥섎━??
  await proceedWithDrawing();
};

// ?ㅼ젣 移대뱶 戮묎린 吏꾪뻾
const proceedWithDrawing = async () => {
  
  // 愿묎퀬 留ㅻ땲?瑜??듯빐 ?먭킌 ?쒖옉 媛???щ? ?뺤씤 (?ㅽ봽?덈뱶 ID ?꾨떖)
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  console.log('?렞 [startDrawing] spreadId:', spreadId);
  console.log('?렞 [startDrawing] isPremium:', userStore.isPremium);
  console.log('?렞 [startDrawing] userEmail:', userStore.currentUser?.email);
  
  // ?뚯뒪?? startReading ?몄텧 ??DB ?뺤씤
  let usageBefore: any = null;
  if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
    console.log('?㎦ [?뚯뒪?? startReading ?몄텧 ??DB 泥댄겕');
    usageBefore = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?㎦ [?뚯뒪?? ?몄텧 ???ъ슜 ?잛닔:', usageBefore.usedToday);
  }
  
  try {
    const canStart = await adManager.startReading(spreadId);
    console.log('?렞 [startDrawing] canStart:', canStart);
    
    // ?뚯뒪?? startReading ?몄텧 ??DB ?뺤씤
    if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross' && usageBefore) {
      console.log('?㎦ [?뚯뒪?? startReading ?몄텧 ??DB 泥댄겕');
      const usageAfter = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('?㎦ [?뚯뒪?? ?몄텧 ???ъ슜 ?잛닔:', usageAfter.usedToday);
      if (usageAfter.usedToday > usageBefore.usedToday) {
        console.error('?㎦ [?뚯뒪?? ?좑툘 臾몄젣 諛쒓낚! startReading?먯꽌 移댁슫?멸? 利앷??덉뒿?덈떎!');
      }
    }
    
    if (!canStart) {
      console.log('?렞 [startDrawing] ?먭킌瑜?蹂????놁쓬 - ?좊즺 諛곗뿴 ?쒗븳');
      // ?먭킌瑜?蹂????녿뒗 寃쎌슦 - ?좊즺 諛곗뿴 ?섎（ 1???쒗븳
      await showPremiumSpreadLimit();
      return;
    }

    // 愿묎퀬 ?곹깭 ?낅뜲?댄듃
    updateAdStatus();
    
    // 移대뱶 戮묎린 吏꾪뻾
    console.log('?렞 [startDrawing] 移대뱶 戮묎린 吏꾪뻾');
    await drawCards();
  } catch (error) {
    console.error('?렞 [startDrawing] ?먮윭:', error);
    await showAlert({
      title: '?ㅻ쪟',
      message: '移대뱶 戮묎린 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.'
    });
  }
};

const drawCards = async () => {
  console.log('?렡 [drawCards] 移대뱶 戮묎린 ?쒖옉');
  isDrawing.value = true;
  progress.value = 0;

  // 移대뱶 ?쎄린 ?뉙떛 ?쇰뱶諛?  await nativeUtils.cardDrawHaptic();

  // ?꾨줈洹몃젅??諛??좊땲硫붿씠??  const progressInterval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(progressInterval);
    }
  }, 200);

  // 移대뱶 戮묎린 ?쒕??덉씠??  await new Promise(resolve => setTimeout(resolve, 2500));

  // 移대뱶 媛쒖닔 (?ㅽ봽?덈뱶???곕씪 寃곗젙)
  const cardCount = tarotStore.selectedSpread?.cardCount || 1;
  console.log('?렡 [drawCards] 移대뱶 媛쒖닔:', cardCount);
  
  // ?ㅼ젣 ?濡쒖뭅???곗씠?곗뿉???쒕뜡 ?좏깮
  const selectedCards = tarotStore.drawCards(cardCount);
  console.log('?렡 [drawCards] ?좏깮??移대뱶:', selectedCards);


  tarotStore.setTempDrawnCards(selectedCards);

  drawnCards.value = selectedCards.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));
  console.log('?렡 [drawCards] drawnCards ?ㅼ젙 ?꾨즺:', drawnCards.value);

  isDrawing.value = false;
  isComplete.value = true;
  console.log('?렡 [drawCards] 移대뱶 戮묎린 ?꾨즺, isComplete:', isComplete.value);

  // ?뚯뒪?몃? ?꾪븳 ?먮룞 移대뱶 怨듦컻 (媛쒕컻 ?섍꼍?먯꽌留?
  if (userStore.currentUser?.email === 'test@example.com') {
    console.log('?㎦ [?뚯뒪?? 2珥???紐⑤뱺 移대뱶 ?먮룞 怨듦컻');
    setTimeout(async () => {
      console.log('?㎦ [?뚯뒪?? ?먮룞 移대뱶 怨듦컻 ?ㅽ뻾');
      await revealAllCards();
      console.log('?㎦ [?뚯뒪?? ?먮룞 移대뱶 怨듦컻 ?꾨즺');
    }, 2000);
  }

  // ?듦퀎??移댁슫??利앷? (湲고쉷 蹂寃쎌쑝濡?臾대즺 ?쒗븳 ?놁쓬)
  // userStore.incrementFreeReading();
};

const revealCard = async (index: number) => {
  console.log('?깗 [revealCard] 移대뱶 怨듦컻:', index);
  // 移대뱶 怨듦컻 ?뉙떛 ?쇰뱶諛?  await nativeUtils.buttonTapHaptic();
  drawnCards.value[index].revealed = true;
  console.log('?깗 [revealCard] 移대뱶 怨듦컻 ???곹깭:', drawnCards.value[index]);
  console.log('?깗 [revealCard] ?꾩껜 移대뱶 怨듦컻 ?곹깭:', drawnCards.value.map(c => c.revealed));
  console.log('?깗 [revealCard] allCardsRevealed:', allCardsRevealed.value);
  
  // 耳덊떛 ?щ줈???댁꽍? createReading?먯꽌 ?앹꽦?섎?濡??ш린?쒕뒗 ?꾩슂?놁쓬 - 2025.01.14
};

// 紐⑤뱺 移대뱶 ?쇨큵 ?ㅼ쭛湲?const revealAllCards = async () => {
  console.log('?렚 [revealAllCards] 紐⑤뱺 移대뱶 ?ㅼ쭛湲??쒖옉');
  // ?낇떛 ?쇰뱶諛?  await nativeUtils.buttonTapHaptic();
  
  // 紐⑤뱺 移대뱶瑜??쒖감?곸쑝濡??ㅼ쭛湲?(?좊땲硫붿씠???④낵)
  for (let i = 0; i < drawnCards.value.length; i++) {
    drawnCards.value[i].revealed = true;
    console.log(`?렚 [revealAllCards] 移대뱶 ${i} 怨듦컻??);
    // 移대뱶 ?ъ씠???쎄컙???쒕젅??異붽?
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('?렚 [revealAllCards] 紐⑤뱺 移대뱶 怨듦컻 ?꾨즺');
  console.log('?렚 [revealAllCards] allCardsRevealed:', allCardsRevealed.value);
  
  // 耳덊떛 ?щ줈???댁꽍? createReading?먯꽌 ?앹꽦?섎?濡??ш린?쒕뒗 ?꾩슂?놁쓬 - 2025.01.14
};

// 耳덊떛 ?щ줈???댁꽍? tarot.ts??createReading?먯꽌 ?앹꽦?섎룄濡?蹂寃쎈맖 - 2025.01.14
// 以묐났 ?몄텧 諛⑹?瑜??꾪빐 ?쒓굅

// (?대? ?곷떒???좎뼵??

// ?댁꽍 蹂닿린 踰꾪듉 ?대┃ ?몃뱾??const handleInterpretationClick = async () => {
  console.log('?뵖 [handleInterpretationClick] 踰꾪듉 ?대┃ ??');
  console.log('?뵖 [handleInterpretationClick] ?꾩옱 ?쒓컙:', new Date().toISOString());
  console.log('?뵖 [handleInterpretationClick] isProcessingResult ?곹깭:', isProcessingResult.value);
  
  // ?대? 泥섎━ 以묒씠硫?臾댁떆 (以묐났 ?대┃ 諛⑹?)
  if (isProcessingResult.value) {
    console.log('?뵖 [handleInterpretationClick] ?대? 泥섎━ 以?- 臾댁떆');
    return;
  }
  
  // 踰꾪듉 ?대┃ ???낇떛 ?쇰뱶諛?  await nativeUtils.buttonTapHaptic();
  
  // goToResult ?⑥닔 ?몄텧 - ?붾쾭洹??뺣낫 ?꾨떖
  try {
    console.log('?뵖 [handleInterpretationClick] goToResult ?몄텧 ?쒖옉');
    await goToResult();
    console.log('?뵖 [handleInterpretationClick] goToResult ?몄텧 ?꾨즺');
  } catch (error) {
    console.error('?뵖 [handleInterpretationClick] goToResult ?먮윭:', error);
    // ?먮윭 諛쒖깮 ???뚮옒洹?由ъ뀑
    isProcessingResult.value = false;
    console.log('?뵖 [handleInterpretationClick] ?먮윭 ??isProcessingResult 由ъ뀑:', isProcessingResult.value);
    await showAlert({
      title: '?ㅻ쪟',
      message: '?댁꽍 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.'
    });
  }
};

const goToResult = async () => {
  // ?붾쾭洹몄슜 蹂???좎뼵
  let usageBeforeGoToResult: any = null;
  const testEmails = ['test@example.com', 'test@test.com'];
  const currentUserEmail = userStore.currentUser?.email?.toLowerCase() || '';
  const isTestUser = testEmails.includes(currentUserEmail) || currentUserEmail.includes('test');
  
  console.log('?렞 [goToResult] ?⑥닔 ?몄텧??');
  console.log('?렞 [goToResult] isProcessingResult:', isProcessingResult.value);
  console.log('?렞 [goToResult] allCardsRevealed:', allCardsRevealed.value);
  console.log('?렞 [goToResult] drawnCards:', drawnCards.value);
  console.log('?렞 [goToResult] ?꾩옱 ?쒓컙:', new Date().toISOString());
  console.log('?렞 [goToResult] spreadId:', tarotStore.selectedSpread?.spreadId);
  console.log('?렞 [goToResult] ?ъ슜???대찓??', userStore.currentUser?.email);
  
  // 耳덊떛 ?щ줈?ㅼ씤 寃쎌슦 ?붾쾭洹??뺣낫 ?섏쭛
  if (tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('?뵇 [?붾쾭洹? 耳덊떛 ?щ줈???ъ슜 ?잛닔 ?뺤씤 ?쒖옉');
    console.log('?뵇 [?붾쾭洹? ?ъ슜???대찓??', currentUserEmail);
    console.log('?뵇 [?붾쾭洹? ?뚯뒪??怨꾩젙 ?щ?:', isTestUser);
    try {
      usageBeforeGoToResult = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('?뵇 [?붾쾭洹? 耳덊떛 ?щ줈???꾩옱 ?ъ슜 ?잛닔:', usageBeforeGoToResult);
      
      // ?붾쾭洹??뚮엺 ?쒓굅 - 遺덊븘?뷀븳 ?뚮엺 ?쒖떆?섏? ?딆쓬
    } catch (error) {
      console.error('?뵇 [?붾쾭洹? ?먮윭:', error);
      // ?먮윭??臾댁떆?섍퀬 怨꾩냽 吏꾪뻾
    }
  }
  
  // ?대? 泥섎━ 以묒씠硫?以묐났 ?몄텧 諛⑹?
  if (isProcessingResult.value) {
    console.log('?렞 [goToResult] ?대? 泥섎━ 以?- 以묐났 ?몄텧 諛⑹?');
    return;
  }
  
  // 紐⑤뱺 移대뱶媛 怨듦컻?섏? ?딆븯?쇰㈃ 寃쎄퀬
  if (!allCardsRevealed.value) {
    console.log('?렞 [goToResult] 紐⑤뱺 移대뱶媛 怨듦컻?섏? ?딆쓬');
    await showAlert({
      title: '移대뱶 怨듦컻 ?꾩슂',
      message: '紐⑤뱺 移대뱶瑜?癒쇱? 怨듦컻?댁＜?몄슂!'
    });
    return;
  }
  
  // 泥섎━ ?쒖옉
  isProcessingResult.value = true;
  
  // ?ㅽ봽?덈뱶 ?뺣낫 媛?몄삤湲?  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  const premiumSpreads = ['celtic_cross', 'seven_star', 'cup_of_relationship'];
  const isPremiumSpread = premiumSpreads.includes(spreadId);
  const isSimpleSpread = spreadId === 'one_card' || spreadId === 'three_card_timeline';
  
  // ?뚯뒪??怨꾩젙怨??꾩떆 ?꾨━誘몄뾼 ?뺤씤 - testEmails? ?대? ?곷떒?먯꽌 ?좎뼵??  // TODO: ?ㅼ젣 ?뚯뒪?명븷 援ш? 怨꾩젙 ?대찓?쇱쓣 ?ш린??異붽??섏꽭??  const currentEmail = userStore.currentUser?.email?.toLowerCase() || '';
  const isTestAccount = testEmails.includes(currentEmail) || currentEmail.includes('test');
  const hasTempPremium = adStatus.value.isTemporaryPremium;
  
  console.log('?렞 [goToResult] 愿묎퀬 ?쒖떆 泥댄겕:', {
    isPremium: userStore.isPremium,
    isSimpleSpread,
    hasTempPremium,
    isTestAccount,
    spreadId
  });\n\n\n});\n\n// ?뚯뒪??怨꾩젙??愿묎퀬瑜?蹂????덈룄濡??ㅼ젙 (媛쒕컻 ?뚯뒪?몄슜)
  const shouldShowAd = !userStore.isPremium && !isSimpleSpread && !hasTempPremium;
  
  if (shouldShowAd) {
    console.log('?벟 [goToResult] 臾대즺 ?ъ슜??- 愿묎퀬 ?쒖떆');
    console.log('?벟 [goToResult] spreadId:', spreadId);
    console.log('?벟 [goToResult] isTestAccount:', isTestAccount);
    console.log('?벟 [goToResult] hasTempPremium:', hasTempPremium);
    
    // 愿묎퀬 ?쒖떆 ?뺤씤  
    try {
      const confirmed = await showConfirm({
        title: '愿묎퀬 ?쒖껌',
        message: '?댁꽍??蹂대젮硫?15珥?愿묎퀬瑜??쒖껌?댁빞 ?⑸땲??\n(愿묎퀬???ㅽ궢?????놁뒿?덈떎)\n\n怨꾩냽?섏떆寃좎뒿?덇퉴?'
      });
      
      console.log('?벟 [goToResult] confirm 寃곌낵:', confirmed);
      
      if (!confirmed) {
        console.log('?벟 [goToResult] ?ъ슜?먭? 痍⑥냼??);
        isProcessingResult.value = false;
        return;
      }
    } catch (error) {
      console.error('?벟 [goToResult] confirm ?먮윭:', error);
      // confirm ?먮윭 ?쒖뿉??吏꾪뻾
    }
    
    // 愿묎퀬 ?쒖떆 - 留ㅻ쾲 ?덈줈??愿묎퀬 ?몄뒪?댁뒪 ?앹꽦
    try {
      console.log('?벟 [goToResult] 愿묎퀬 ?쒖떆 ?쒖옉...');
      console.log('?벟 [goToResult] ?꾩옱 ?쒓컙:', new Date().toISOString());
      
      // adService 珥덇린???곹깭 ?ъ꽕?뺤쓣 ?꾪빐 ?쎄컙???쒕젅??異붽?
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 愿묎퀬 ?쒕퉬?ㅼ뿉??吏곸젒 媛뺤젣 ?쒖껌 愿묎퀬 ?쒖떆 (?좊즺 諛곗뿴? 由ъ썙??愿묎퀬)
      const adWatched = await showRewardedAd();
      console.log('?벟 [goToResult] 媛뺤젣 ?쒖껌 愿묎퀬 ?쒖떆 寃곌낵:', adWatched);
      console.log('?벟 [goToResult] 愿묎퀬 ?쒖떆 ???쒓컙:', new Date().toISOString());
      
      if (!adWatched) {
        console.log('?벟 [goToResult] 愿묎퀬 ?쒖껌 ?ㅽ뙣');
        await showAlert({
          title: '愿묎퀬 ?ㅻ쪟',
          message: '愿묎퀬 濡쒕뱶???ㅽ뙣?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.'
        });
        isProcessingResult.value = false;
        return;
      }
      
      // 愿묎퀬 ?쒖껌 ?깃났 ???곹깭 ?낅뜲?댄듃
      updateAdStatus();
    } catch (error) {
      console.error('?벟 [goToResult] 愿묎퀬 ?쒖떆 ?ㅻ쪟:', error);
      console.error('?벟 [goToResult] ?ㅻ쪟 ?곸꽭:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });\n\n\n});\n\n// 愿묎퀬 ?ㅻ쪟 ?쒖뿉??吏꾪뻾 (?ъ슜??寃쏀뿕 ?곗꽑)
      await showAlert({
        title: '?뚮┝',
        message: '愿묎퀬 濡쒕뱶 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?댁꽍 ?붾㈃?쇰줈 ?대룞?⑸땲??'
      });
    }
  } else if (isSimpleSpread) {
    console.log('?벟 [goToResult] 1??3??諛곗뿴 - 愿묎퀬 ?놁씠 吏꾪뻾');
  } else if (userStore.isPremium || hasTempPremium) {
    console.log('?벟 [goToResult] ?꾨━誘몄뾼/?꾩떆 ?꾨━誘몄뾼 ?ъ슜??- 愿묎퀬 ?놁씠 吏꾪뻾');
  }
  
  // ?좊즺 諛곗뿴 ?ъ슜 湲곕줉 (寃곌낵 蹂닿린 ?쒖젏?먮쭔 湲곕줉)
  
  // ?뚯뒪?? 湲곕줉 ??DB ?뺤씤
  if (userStore.currentUser?.email === 'test@example.com' && tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('?㎦ [?뚯뒪?? recordPremiumSpreadUsage ?몄텧 ??DB 泥댄겕');
    const usageBeforeRecord = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?㎦ [?뚯뒪?? 湲곕줉 ???ъ슜 ?잛닔:', usageBeforeRecord.usedToday);
  }
  
  // 臾대즺 ?ъ슜?먭? ?좊즺 諛곗뿴???ъ슜?섎뒗 寃쎌슦?먮쭔 湲곕줉
  // ?濡??ㅽ넗?댁뿉???뚮옒洹??뺤씤
  const shouldRecordUsage = tarotStore.getPremiumSpreadUsage();
  
  if (!userStore.isPremium && !hasTempPremium && isPremiumSpread && shouldRecordUsage) {
    // ?뚯뒪??怨꾩젙? 湲곕줉?섏? ?딆쓬 - ?쇱쨷 泥댄겕
    const testEmails = ['test@example.com', 'test@test.com'];
    const currentEmail = userStore.currentUser?.email?.toLowerCase() || '';
    const isDefinitelyTestAccount = testEmails.includes(currentEmail) || currentEmail.includes('test');
    
    console.log('?뱥 [goToResult] ?좊즺 諛곗뿴 ?ъ슜 湲곕줉 泥댄겕');
    console.log('?뱥 [goToResult] currentEmail:', currentEmail);
    console.log('?뱥 [goToResult] isDefinitelyTestAccount:', isDefinitelyTestAccount);
    console.log('?뱥 [goToResult] spreadId:', spreadId);
    console.log('?뱥 [goToResult] shouldRecordUsage:', shouldRecordUsage);
    
    if (!isDefinitelyTestAccount) {
      console.log('?뱥 [goToResult] ?쇰컲 ?ъ슜??- ?좊즺 諛곗뿴 ?ъ슜 湲곕줉 ?쒖옉');
      await adManager.recordPremiumSpreadUsage(spreadId);
      console.log('?뱥 [goToResult] ?좊즺 諛곗뿴 ?ъ슜 湲곕줉 ?꾨즺');
      
      // ?뚮옒洹?珥덇린??      tarotStore.clearPremiumSpreadUsage();
    } else {
      console.log('?뱥 [goToResult] ?뚯뒪??怨꾩젙 ?뺤씤??- ?좊즺 諛곗뿴 ?ъ슜 湲곕줉 嫄대꼫?');
      console.log('?뱥 [goToResult] ?뚯뒪??怨꾩젙 ?대찓??', currentEmail);
      
      // ?뚯뒪??怨꾩젙???뚮옒洹?珥덇린??      tarotStore.clearPremiumSpreadUsage();
    }
  } else {
    console.log('?뱥 [goToResult] ?좊즺 諛곗뿴 湲곕줉 議곌굔 誘몄땐議?', {
      isPremium: userStore.isPremium,
      hasTempPremium: hasTempPremium,
      isPremiumSpread: isPremiumSpread,
      spreadId: spreadId,
      email: userStore.currentUser?.email
    });
  }
  
  // 湲곕줉 ??DB ?뺤씤 (紐⑤뱺 ?ъ슜?????
  if (tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('?뵇 [?붾쾭洹? recordPremiumSpreadUsage ?몄텧 ??DB 泥댄겕');
    const usageAfterRecord = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?뵇 [?붾쾭洹? 湲곕줉 ???ъ슜 ?잛닔:', usageAfterRecord.usedToday);
    
    // goToResult ?꾩껜 ?꾪썑 鍮꾧탳 (usageBeforeGoToResult媛 ?덉쓣 ?뚮쭔)
    if (usageBeforeGoToResult) {
      const diff = usageAfterRecord.usedToday - usageBeforeGoToResult.usedToday;
      const accountType = isTestUser ? '?뚯뒪??怨꾩젙' : '?쇰컲 臾대즺 怨꾩젙';
      
      if (isTestUser) {
        // ?뚯뒪??怨꾩젙??寃쎌슦
        if (diff > 0) {
          console.error('?좑툘 踰꾧렇 諛쒓껄! ?뚯뒪??怨꾩젙?몃뜲 移댁슫?멸? 利앷??덉뒿?덈떎!');
        } else {
          console.log('???뺤긽: ?뚯뒪??怨꾩젙 移댁슫??利앷? ?놁쓬');
        }
      } else {
        // ?쇰컲 怨꾩젙??寃쎌슦
        if (diff > 0) {
          console.log('???뺤긽: ?쇰컲 怨꾩젙 移댁슫??利앷?');
          // ?ъ슜 ?꾨즺 ?뚮엺 ?쒓굅 - ?먯뿰?ㅻ윭???ъ슜??寃쏀뿕???꾪빐
        } else {
          console.log('?쨺 ?덉긽移?紐삵븳 ?곹솴: ?쇰컲 怨꾩젙?몃뜲 移댁슫??利앷? ?놁쓬');
        }
      }
    }
  }
  
  // 紐⑤뱺 諛곗뿴?먯꽌 濡쒕뵫 ?붾㈃ ?쒖떆
  isGeneratingInterpretation.value = true;
  interpretationProgress.value = 0;
  
  // ?꾨줈洹몃젅???낅뜲?댄듃 ?쒕??덉씠??  const progressInterval = setInterval(() => {
    if (interpretationProgress.value < 90) {
      interpretationProgress.value += Math.random() * 15;
    }
  }, 500);
  
  try {
    // 耳덊떛 ?щ줈?ㅼ쓽 寃쎌슦 媛쒖꽑???댁꽍???④퍡 ???    if (isCelticCross.value && improvedInterpretation.value) {
      tarotStore.setImprovedInterpretation(improvedInterpretation.value);
    }
    
    // 而ㅼ뒪? 吏덈Ц 媛?몄삤湲?    const customQuestion = tarotStore.getCustomQuestion();
    
    // 戮묓엺 移대뱶濡??먭킌 ?앹꽦
    const reading = await tarotStore.createReading(
      tarotStore.selectedSpread?.spreadId || 'one_card',
      tarotStore.selectedTopic?.id || 'general',
      customQuestion || undefined, // 而ㅼ뒪? 吏덈Ц ?꾨떖
      tarotStore.getTempDrawnCards() || undefined
    );
    
    // AI ?댁꽍 ?앹꽦 (?꾨━誘몄뾼/?뚯뒪??怨꾩젙留?
    const topic = tarotStore.selectedTopic?.id || 'general';
    const spreadId = tarotStore.selectedSpread?.spreadId || 'three_cards';
    const shouldGenerateAI = (userStore.isPremium || isTestAccount) && 
                            (customQuestion || isCelticCross.value || isSevenStar.value || isCupOfRelationship.value);
    
    if (shouldGenerateAI && reading && !reading.aiInterpretation) {
      console.log('?쨼 AI ?댁꽍 ?앹꽦 ?쒖옉');
      console.log('?쨼 議곌굔:', { 
        customQuestion: !!customQuestion, 
        isCelticCross: isCelticCross.value,
        isSevenStar: isSevenStar.value,
        isCupOfRelationship: isCupOfRelationship.value
      });
      
      try {
        // ?꾨줈洹몃젅???낅뜲?댄듃
        interpretationProgress.value = 30;
        
        // 耳덊떛 ?щ줈?ㅻ룄 tarot.ts??createReading?먯꽌 ?대? ?댁꽍 ?앹꽦??        // 以묐났 ?몄텧 ?쒓굅 - 2025.01.14
        // 耳덊떛?щ줈?ㅻ뒗 而ㅼ뒪? 吏덈Ц ?щ?? 愿怨꾩뾾???대? createReading?먯꽌 CelticCrossAIInterpreter濡?泥섎━??        if (isCelticCross.value) {
          console.log('?쨼 耳덊떛 ?щ줈??- ?대? createReading?먯꽌 ?댁꽍 ?앹꽦??);
          console.log('?쨼 而ㅼ뒪? 吏덈Ц ?щ?:', !!customQuestion);
          console.log('?쨼 湲곗〈 ?댁꽍 ?뺤씤:', {
            hasImprovedInterpretation: !!reading.improvedInterpretation,
            hasPremiumInsights: !!reading.premiumInsights,
            hasEnhancedInterpretation: !!reading.enhancedInterpretation,
            hasAiInterpretation: !!reading.aiInterpretation
          });\n\n\n});\n\n// ?대? ?앹꽦???댁꽍???덈뒗吏 ?뺤씤
          if (reading.improvedInterpretation) {
            // improvedInterpretation?먯꽌 AI ?댁꽍 異붿텧
            let aiInterpretationText = '';
            if (typeof reading.improvedInterpretation === 'object') {
              aiInterpretationText = reading.improvedInterpretation.aiInterpretation ||
                                    reading.improvedInterpretation.overallInterpretation || 
                                    reading.improvedInterpretation.summary || 
                                    reading.improvedInterpretation.overallMessage ||
                                    '?댁꽍???앹꽦?????놁뒿?덈떎.';
            } else if (typeof reading.improvedInterpretation === 'string') {
              aiInterpretationText = reading.improvedInterpretation;
            }
            reading.aiInterpretation = aiInterpretationText;
            console.log('?쨼 湲곗〈 耳덊떛 ?щ줈???댁꽍 ?ъ슜');
          } else if (reading.enhancedInterpretation?.overallMessage) {
            reading.aiInterpretation = reading.enhancedInterpretation.overallMessage;
            console.log('?쨼 湲곗〈 enhanced ?댁꽍 ?ъ슜');
          } else {
            console.log('?쨼 耳덊떛 ?щ줈???댁꽍???대? ?앹꽦?섏뼱 ?덉뼱????);
          }
        }
        // ?몃툙?ㅽ?? 而듭삤釉뚮┫?덉씠?섏떗? tarot.ts??createReading?먯꽌 ?대? ?댁꽍 ?앹꽦??        // 以묐났 ?몄텧 ?쒓굅 - 2025.01.14
        else if (isSevenStar.value || isCupOfRelationship.value) {
          console.log('?쨼 ?몃툙?ㅽ?/而듭삤釉뚮┫?덉씠?섏떗 - ?대? createReading?먯꽌 ?댁꽍 ?앹꽦??);
          console.log('?쨼 湲곗〈 ?댁꽍 ?뺤씤:', {
            hasEnhancedInterpretation: !!reading.enhancedInterpretation,
            hasPremiumInsights: !!reading.premiumInsights,
            hasAiInterpretation: !!reading.enhancedInterpretation?.aiInterpretation
          });\n\n\n});\n\n// ?대? ?앹꽦???댁꽍???덈뒗吏 ?뺤씤
          if (reading.enhancedInterpretation?.aiInterpretation) {
            reading.aiInterpretation = reading.enhancedInterpretation.aiInterpretation;
            console.log('?쨼 湲곗〈 AI ?댁꽍 ?ъ슜');
          } else if (reading.premiumInsights?.aiInterpretation) {
            reading.aiInterpretation = reading.premiumInsights.aiInterpretation;
            console.log('?쨼 湲곗〈 ?꾨━誘몄뾼 ?댁꽍 ?ъ슜');
          } else {
            console.log('?쨼 ?댁꽍???대? ?앹꽦?섏뼱 ?덉뼱????(createReading?먯꽌)');
          }
        }
        // 而ㅼ뒪? 吏덈Ц???덈뒗 寃쎌슦 customInterpretationService ?ъ슜
        // ?꾨━誘몄뾼 諛곗뿴踰?耳덊떛?щ줈?? ?몃툙?ㅽ?, 而듭삤釉뚮┫?덉씠?섏떗)? ?쒖쇅
        else if (customQuestion && !isCelticCross.value && !isSevenStar.value && !isCupOfRelationship.value) {
          console.log('?쨼 而ㅼ뒪? 吏덈Ц AI ?댁꽍 ?앹꽦');
          
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
            
            console.log('?쨼 而ㅼ뒪? 吏덈Ц AI ?댁꽍 ?깃났');
          } else {
            console.error('?쨼 而ㅼ뒪? 吏덈Ц AI ?댁꽍 ?ㅽ뙣:', interpretationResult.error);
            reading.aiInterpretation = '?댁꽍???앹꽦?????놁뒿?덈떎.';
          }
        }
        
        // ?꾨줈洹몃젅???낅뜲?댄듃
        interpretationProgress.value = 70;
        
        // reading??store???낅뜲?댄듃
        tarotStore.updateReading(reading);
      } catch (aiError) {
        console.error('?쨼 AI ?댁꽍 ?앹꽦 ?ㅽ뙣:', aiError);
        tarotStore.updateReading(reading);
      }
    }
    
    console.log('???먭킌 ?앹꽦 ?깃났:', reading.id);
    
    // ?꾨줈洹몃젅???꾨즺
    clearInterval(progressInterval);
    interpretationProgress.value = 100;
    
    // ?좎떆 ?湲????붾㈃ ?꾪솚
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 濡쒕뵫 ?붾㈃ ?④린湲?    isGeneratingInterpretation.value = false;
    
    // ?뚮옒洹?紐낇솗?섍쾶 由ъ뀑 (?섏씠吏 ?꾪솚 ??
    isProcessingResult.value = false;
    console.log('?렞 [goToResult] ?섏씠吏 ?꾪솚 ??isProcessingResult 由ъ뀑:', isProcessingResult.value);
    
    // ?먭눼 寃곌낵 ?붾㈃?쇰줈 ?대룞
    console.log('?렞 [goToResult] 寃곌낵 ?붾㈃?쇰줈 ?대룞 ?쒕룄:', `/reading-result?readingId=${reading.id}`);
    
    // nextTick???ъ슜??DOM ?낅뜲?댄듃 ???쇱슦??    await nextTick();
    
    router.push(`/reading-result?readingId=${reading.id}`);
    console.log('?렞 [goToResult] router.push ?몄텧 ?꾨즺');
  } catch (error) {
    
    // ?꾨줈洹몃젅???뺣━
    clearInterval(progressInterval);
    isGeneratingInterpretation.value = false;
    interpretationProgress.value = 0;
    
    await showAlert({
      title: '?먭킌 ?앹꽦 ?ㅽ뙣',
      message: `?먭킌 ?앹꽦???ㅽ뙣?덉뒿?덈떎: ${error.message || '?????녿뒗 ?ㅻ쪟'}`
    });
  } finally {
    // 泥섎━ ?꾨즺 ?뚮옒洹?由ъ뀑 - nextTick???ъ슜???뺤떎?섍쾶 由ъ뀑
    console.log('?렞 [goToResult] finally 釉붾줉 - isProcessingResult 由ъ뀑 ?쒖옉');
    isProcessingResult.value = false;
    await nextTick();
    isProcessingResult.value = false; // ?댁쨷 由ъ뀑?쇰줈 ?뺤떎?섍쾶
    console.log('?렞 [goToResult] finally 釉붾줉 - isProcessingResult 由ъ뀑 ?꾨즺:', isProcessingResult.value);
  }
};

// 湲고쉷 蹂寃쎌쑝濡?愿묎퀬 紐⑤떖 ?ъ슜?섏? ?딆쓬
// const closeAdModal = () => {
//   showAdModal.value = false;
//   
//   // 愿묎퀬 ?곹깭 ?낅뜲?댄듃
//   updateAdStatus();
//   
//   if (drawMethod.value === 'random') {
//     drawCards();
//   } else if (drawMethod.value === 'manual') {
//     processManualSelection();
//   }
// };

// ?대?吏 濡쒕뱶 ?먮윭 泥섎━ - ?듯빀 ?⑥닔 ?ъ슜
const onImageError = handleUnifiedImageError;

// ?ㅽ봽?덈뱶蹂??꾩튂 ?대쫫 媛?몄삤湲?const getPositionNameForSpread = (spreadId: string, index: number): string => {
  const positions = {
    'celtic_cross': [
      '?꾩옱?대㈃',
      '?꾩옱?몃?', 
      '洹쇰낯',
      '怨쇨굅',
      '?쒕윭?섎뒗 紐⑥뒿',
      '誘몃옒',
      '?닿?蹂대뒗??,
      '?⑥씠蹂대뒗??,
      '?덉긽?섎뒗 寃곌낵',
      '?ㅼ젣 寃곌낵'
    ],
    'seven_star': [
      '洹쇱썝',
      '怨쇨굅???곹뼢',
      '?꾩옱 ?곹솴',
      '?섏떇???뚮쭩',
      '臾댁쓽?앹쟻 ?꾩슂',
      '?④꺼吏??곹뼢',
      '理쒖쥌 寃곌낵'
    ],
    'cup_of_relationship': [
      '?섏쓽 留덉쓬',
      '?곷???留덉쓬',
      '怨쇨굅???몄뿰',
      '?꾩옱??愿怨?,
      '誘몃옒??媛?μ꽦',
      '愿怨꾩쓽 ?μ븷臾?,
      '?곗＜??議곗뼵'
    ],
    'three_card_timeline': [
      '怨쇨굅',
      '?꾩옱',
      '誘몃옒'
    ],
    'one_card': [
      '?듭떖 硫붿떆吏'
    ]
  };
  
  return positions[spreadId]?.[index] || `?꾩튂 ${index + 1}`;
};

// ?곗븷 ?곹깭 愿???몃뱾???쒓굅??- ReadingSelect?먯꽌 泥섎━

// ?좊즺 諛곗뿴 ?섎（ 1???쒗븳 ?덈궡
const showPremiumSpreadLimit = async () => {
  console.log('?뮫 [showPremiumSpreadLimit] ?몄텧??);
  const spreadNames = {
    'celtic_cross': '耳덊떛 ?щ줈??,
    'seven_star': '?몃툙 ?ㅽ?',
    'cup_of_relationship': '而??ㅻ툕 由대젅?댁뀡??
  };
  
  const spreadId = tarotStore.selectedSpread?.spreadId || '';
  const spreadName = spreadNames[spreadId] || '?좊즺 諛곗뿴';
  console.log('?뮫 [showPremiumSpreadLimit] spreadId:', spreadId);
  console.log('?뮫 [showPremiumSpreadLimit] spreadName:', spreadName);
  
  // ?뚯뒪??怨꾩젙?몄? ?뺤씤
  const isTestAccount = userStore.currentUser?.email === 'test@example.com';
  console.log('?뮫 [showPremiumSpreadLimit] isTestAccount:', isTestAccount);
  
  if (isTestAccount) {
    console.log('?㎦ [showPremiumSpreadLimit] ?뚯뒪??怨꾩젙 - ?좊즺 諛곗뿴 ?쒗븳 ?놁씠 吏꾪뻾');
    // ?뚯뒪??怨꾩젙? 洹몃깷 吏꾪뻾 (???⑥닔媛 ?몄텧?섎㈃ ?덈릺吏留??곸떆?쇰룄)
    await drawCards();
    return;
  }
  
  // ?ъ슜 媛?ν븳 ?쒓컙 怨꾩궛
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
  
  await showAlert({
    title: '?좊즺 諛곗뿴 ?ъ슜 ?쒗븳',
    message: `${spreadName} 諛곗뿴踰뺤? ?섎（????踰덈쭔 ?ъ슜?????덉뒿?덈떎.\n\n?ㅼ쓬 ?ъ슜 媛???쒓컙: ${hoursUntilReset}?쒓컙 ${minutesUntilReset}遺???n\n?뮕 臾대즺 諛곗뿴踰?1?? 3??? 愿묎퀬 ?쒖껌?쇰줈 臾댁젣???댁슜 媛?ν빀?덈떎!`
  });\n\n\n});\n\n// ?쎄린 ?좏깮 ?붾㈃?쇰줈 ?뚯븘媛湲?  router.push('/reading-select');
};

// 臾대즺 ?먭킌 ?곹깭 ?뺤씤 (湲고쉷 蹂寃쎌쑝濡???긽 true)
const checkFreeReadingStatus = () => {
  // 臾대즺 ?ъ슜?먮룄 愿묎퀬 ?쒖껌?쇰줈 臾댁젣??媛??  return true;
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
  /* 紐⑤컮?쇱뿉??醫뚯슦 ?쒕옒洹?諛⑹? */
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  max-width: 100vw;
  position: relative;
  /* ?곗튂 ?ㅽ겕濡?理쒖쟻??*/
  -webkit-overflow-scrolling: touch;
  /* 諛붿슫???④낵 諛⑹? */
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

/* .free-usage-indicator ?ㅽ????쒓굅 */

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
  /* 紐⑤컮?쇱뿉???덈퉬 ?쒗븳 */
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
  margin-bottom: 10px; /* ?щ갚 以꾩엫 */
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

/* 移대뱶 戮묎린 諛⑹떇 ?좏깮 */
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

/* 吏곸젒 ?좏깮 紐⑤뱶 */
.manual-selection-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.selected-cards-preview {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 10px 0; /* ?щ갚 以꾩엫 */
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
  height: 250px; /* ?믪씠 ??以꾩엫 */
  margin: 10px 0; /* ?щ갚 以꾩엫 */
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
  width: 40px; /* ?ш린 ??以꾩엫 */
  height: 60px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 1px solid rgba(255, 255, 255, 0.2); /* ?뚮몢由??먭퍡 以꾩엫 */
  border-radius: 4px; /* ?κ렐 紐⑥꽌由????묎쾶 */
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
  border-width: 2px; /* ?좏깮??移대뱶???뚮몢由?以꾩엫 */
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.spread-card.selected .card-back-small {
  color: #4C1D95; /* ?좏깮??移대뱶???꾩씠肄???蹂寃?*/
}

.spread-card.selected:hover {
  transform: translate(-50%, -50%) translateY(-20px) scale(1.2) !important;
}

.spread-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-back-small {
  font-size: 16px; /* ?꾩씠肄??ш린 ??以꾩엫 */
  color: rgba(255, 255, 255, 0.8);
}

.confirm-button {
  margin-top: 10px; /* 留덉쭊 以꾩엫 */
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
    height: 220px; /* 紐⑤컮?쇱뿉????以꾩엫 */
  }
  
  .spread-card {
    width: 30px; /* 紐⑤컮?쇱뿉?????묎쾶 */
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
  
  /* 紐⑤컮?쇱뿉???댁꽍 蹂닿린 踰꾪듉 留덉쭊 議곗젙 */
  .celtic-cross-mode .result-button,
  .seven-star-mode .result-button,
  .cup-relationship-mode .result-button {
    margin-top: 60px;
  }
}

/* 罹섑떛 ?щ줈??紐⑤뱶 ?ㅽ???*/
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

/* ?밸퀎 ?덉씠?꾩썐 而⑦뀒?대꼫 */
.seven-star-container,
.cup-relationship-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* ?몃툙 ?ㅽ? 紐⑤뱶 ?ㅽ???*/
.card-drawing.seven-star-mode {
  --page-bg: radial-gradient(ellipse at center, rgba(25, 25, 112, 0.3) 0%, transparent 70%),
              linear-gradient(180deg, #000428 0%, #004e92 100%);
  background: var(--page-bg);
}

/* 而??ㅻ툕 由대젅?댁뀡??紐⑤뱶 ?ㅽ???*/
.card-drawing.cup-relationship-mode {
  --page-bg: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #2D1B69 0%, #0F3443 100%);
  background: var(--page-bg);
}

/* 罹섑떛 ?щ줈??紐⑤뱶?먯꽌 寃곌낵 踰꾪듉 ?ㅽ???*/
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

/* 怨듯넻 ?≪뀡 踰꾪듉 ?ㅽ???*/
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




