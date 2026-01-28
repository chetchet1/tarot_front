<template>
  <div class="card-drawing" :class="{ 
  'celtic-cross-mode': isCelticCross,
  'seven-star-mode': isSevenStar,
  'cup-relationship-mode': isCupOfRelationship,
  'special-layout-mode': hasSpecialLayout
}" @click="debugClick">
    <header class="page-header">
      <div class="header-top">
        <button class="back-button" @click="goBack">???¤ë¡œ</button>
        <h1>
          ì¹´ë“œ ë½‘ê¸°
          <span v-if="hasSpecialLayout" class="spread-name">
            - {{ getSpreadDisplayName() }}
          </span>
        </h1>
      </div>
      <!-- ?„ì‹œ ?„ë¦¬ë¯¸ì—„ ?œì‹œ -->
      <div v-if="adStatus.isTemporaryPremium" class="premium-status-indicator">
        ?ŒŸ ?„ì‹œ ?„ë¦¬ë¯¸ì—„ ?œì„±??ì¤?        <span class="expiry-time">{{ formatExpiryTime() }}</span>
      </div>
    </header>

    <div class="container">
      <!-- ì¹´ë“œ ë½‘ê¸° ë°©ì‹ ? íƒ -->
      <div class="draw-method-selection" v-if="!drawMethod && !isDrawing && !isComplete">
        <p class="instruction">ì¹´ë“œë¥??´ë–»ê²?ë½‘ìœ¼?œê² ?µë‹ˆê¹?</p>
        <div class="method-buttons">
          <button class="method-button" @click="selectDrawMethod('random')">
            <div class="method-icon">?²</div>
            <h3>ë¬´ì‘?„ë¡œ ë½‘ê¸°</h3>
            <p>?´ëª…??ë§¡ê²¨ ì¹´ë“œë¥?ë½‘ìŠµ?ˆë‹¤</p>
          </button>
          <button class="method-button" @click="selectDrawMethod('manual')">
            <div class="method-icon">Manual</div>
            <h3>ì§ì ‘ ë½‘ê¸°</h3>
            <p>Select cards manually.</p>
          </button>
        </div>
      </div>

      <!-- ë¬´ì‘??ë½‘ê¸° -->
      <div class="deck-container" v-if="drawMethod === 'random' && !isDrawing && !isComplete">
        <p class="instruction">ì¹´ë“œë¥??ê³  ?ˆìŠµ?ˆë‹¤...</p>
        <div class="card-back shuffling">
          ?ƒ
        </div>
        <button 
          class="btn btn-primary draw-button"
          @click="startDrawing"
        >
          {{ getDrawButtonText() }}
        </button>
      </div>

      <!-- ì§ì ‘ ? íƒ ëª¨ë“œ -->
      <div class="manual-selection-container" v-if="drawMethod === 'manual' && !isComplete">
        <p class="instruction">
          {{ manualSelectedCards.length }}/{{ getCardCount() }}??? íƒ?ˆìŠµ?ˆë‹¤.
          <span v-if="manualSelectedCards.length > 0" class="sub-instruction">
            (? íƒ??ì¹´ë“œë¥??´ë¦­?˜ë©´ ì·¨ì†Œ?????ˆìŠµ?ˆë‹¤)
          </span>
          <span v-else>
            ì¹´ë“œë¥??´ë¦­?˜ì—¬ ? íƒ?˜ì„¸??
          </span>
        </p>
        
        <!-- ? íƒ??ì¹´ë“œ ?œì‹œ -->
        <div v-if="manualSelectedCards.length > 0" class="selected-cards-preview">
          <div 
            v-for="(card, index) in manualSelectedCards" 
            :key="index" 
            class="selected-card-mini"
            @click="removeSelectedCard(index)"
            title="?´ë¦­?˜ë©´ ? íƒ ì·¨ì†Œ"
          >
            <span class="selection-number">{{ index + 1 }}</span>
          </div>
        </div>
        
        <!-- 78??ì¹´ë“œ ?¤í”„?ˆë“œ -->
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
              <div class="card-back-small">?ƒ</div>
            </div>
          </div>
        </div>
        
        <!-- ? íƒ ?„ë£Œ ë²„íŠ¼ -->
        <button 
          class="btn btn-primary confirm-button"
          :disabled="manualSelectedCards.length !== getCardCount()"
          @click="confirmManualSelection"
        >
          ì¹´ë“œ ? íƒ ?„ë£Œ
        </button>
      </div>

      <!-- ì¹´ë“œ ë½‘ëŠ” ì¤?-->
      <div class="drawing-container" v-if="isDrawing">
        <p class="instruction">{{ getCardCount() }}?¥ì˜ ì¹´ë“œë¥?ë½‘ê³  ?ˆìŠµ?ˆë‹¤...</p>
        <div class="card-animation">
          <div class="card-back" v-for="i in getCardCount()" :key="i" :class="`card-${i}`">
            ?ƒ
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- ë½‘íŒ ì¹´ë“œ??-->
      <div class="cards-container" v-if="isComplete && drawnCards.length > 0">
        <!-- ìº˜í‹± ?¬ë¡œ???„ìš© ?ˆì´?„ì›ƒ -->
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
                ?´ì„ ë³´ê¸°
              </button>
            </template>
          </CelticCrossLayout>
        </div>
        
        <!-- ?¸ë¸ ?¤í? ?„ìš© ?ˆì´?„ì›ƒ -->
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
                ?´ì„ ë³´ê¸°
              </button>
            </template>
          </SevenStarLayout>
        </div>
        
        <!-- ì»??¤ë¸Œ ë¦´ë ˆ?´ì…˜???„ìš© ?ˆì´?„ì›ƒ -->
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
                ?´ì„ ë³´ê¸°
              </button>
            </template>
          </CupOfRelationshipLayout>  
        </div>
        
        <!-- ?¼ë°˜ ì¹´ë“œ ?ˆì´?„ì›ƒ -->
        <div v-else>
          <p class="instruction">Your drawn cards.</p>
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
                  {{ card.orientation === 'upright' ? 'Upright' : 'Reversed' }}
                </div>
              </div>
              <div class="card-back" v-else>
                ?ƒ
                <p>?´ë¦­?˜ì—¬ ê³µê°œ</p>
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
          ?´ì„ ë³´ê¸°
        </button>
      </div>

      <!-- ê´‘ê³  ëª¨ë‹¬ (ê¸°íš ë³€ê²½ìœ¼ë¡??¬ìš©?˜ì? ?ŠìŒ) -->
      <!-- <AdModal v-if="showAdModal" @close="closeAdModal" /> -->
      
      <!-- AI ?´ì„ ë¡œë”© ?”ë©´ -->
      <TarotLoadingScreen 
        :isVisible="isGeneratingInterpretation" 
        :progress="interpretationProgress"
      />
      
      <!-- ?°ì•  ?íƒœ ? íƒ ëª¨ë‹¬ - ReadingSelect?ì„œ ì²˜ë¦¬?˜ë?ë¡??œê±°??-->
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
// ì¤‘ë³µ ?¸ì¶œ ë°©ì?ë¥??„í•´ Interpreter?¤ì? tarot.ts?ì„œë§??¬ìš©?˜ë„ë¡?ë³€ê²?- 2025.01.14
// import { ImprovedCelticCrossInterpreter } from '../utils/ImprovedCelticCrossInterpreter'; // tarot.ts?ì„œë§??¬ìš©
// import { SevenStarInterpreter } from '../services/interpretation/SevenStarInterpreter'; // tarot.ts?ì„œë§??¬ìš©
// import { CupOfRelationshipInterpreter } from '../services/interpretation/CupOfRelationshipInterpreter'; // tarot.ts?ì„œë§??¬ìš©
import { customInterpretationService } from '../services/ai/customInterpretationService';
import { showAlert, showConfirm } from '../utils/alerts';
import { getUnifiedCardImagePath, handleUnifiedImageError } from '../utils/unifiedCardImage';
import { showRewardedAd } from '../services/admob'; // ? ë£Œ ë°°ì—´??ê°•ì œ ?œì²­ ê´‘ê³ 
import { interceptPremiumSpreadCalls, interceptAdManager } from '../utils/debugPremiumSpread'; // ?”ë²„ê·??„êµ¬
import { monitorSupabaseAPICalls } from '../utils/supabaseMonitor'; // Supabase API ëª¨ë‹ˆ?°ë§

// ì»´í¬?ŒíŠ¸ ì§ì ‘ importë¡?ë³€ê²?// import AdModal from '../components/AdModal.vue'; // ê¸°íš ë³€ê²½ìœ¼ë¡??¬ìš©?˜ì? ?ŠìŒ
import CelticCrossLayout from '../components/spreads/CelticCrossLayout.vue';
import SevenStarLayout from '../components/spreads/SevenStarLayout.vue';
import CupOfRelationshipLayout from '../components/spreads/CupOfRelationshipLayout.vue';
import TarotLoadingScreen from '../components/loading/TarotLoadingScreen.vue';
// RelationshipStatusModal ?œê±°??- ReadingSelect?ì„œ ì²˜ë¦¬
// Alert ì»´í¬?ŒíŠ¸??useAlertë¥??µí•´ ?¬ìš©

interface DrawnCardData {
  card: any; // TarotCard type
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();
// showAlert, showConfirm?€ ì§ì ‘ import?´ì„œ ?¬ìš©

const drawMethod = ref<'random' | 'manual' | null>(null);
const isDrawing = ref(false);
const isComplete = ref(false);
const progress = ref(0);
const drawnCards = ref<DrawnCardData[]>([]);
// const showAdModal = ref(false); // ê¸°íš ë³€ê²½ìœ¼ë¡??¬ìš©?˜ì? ?ŠìŒ
const manualSelectedCards = ref<any[]>([]);
const shuffledDeck = ref<any[]>([]);
const improvedInterpretation = ref<any>(null);
const isGeneratingInterpretation = ref(false);
const interpretationProgress = ref(0);

// ?°ì•  ?íƒœ ëª¨ë‹¬ ê´€???íƒœ - ?œê±°??(ReadingSelect?ì„œ ì²˜ë¦¬)

const allCardsRevealed = computed(() => {
  return drawnCards.value.length > 0 && drawnCards.value.every(card => card.revealed);
});

// ê´‘ê³  ë§¤ë‹ˆ?€ ?íƒœ
const adManager = getAdManager();
const adStatus = ref(adManager.getStatus());

// ê´‘ê³  ?íƒœ ?…ë°?´íŠ¸ ?¨ìˆ˜
const updateAdStatus = () => {
  adStatus.value = adManager.getStatus();
};

// Expiry time formatting
const formatExpiryTime = () => {
  if (!adStatus.value.temporaryPremiumExpiry) return '';

  const now = new Date();
  const expiry = new Date(adStatus.value.temporaryPremiumExpiry);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// ?¹ë³„ ?ˆì´?„ì›ƒ ?¤í”„?ˆë“œ?¸ì? ?•ì¸
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

// Spread display name
const getSpreadDisplayName = () => {
  if (isCelticCross.value) return 'Celtic Cross';
  if (isSevenStar.value) return 'Seven Star';
  if (isCupOfRelationship.value) return 'Cup of Relationship';
  return '';
};

// Draw button text
const getDrawButtonText = () => {
  return 'Draw Cards';
};

// ì¹´ë“œ ?´ë?ì§€ URL ?ì„± - ?µí•© ?¨ìˆ˜ ?¬ìš©
const getCardImageUrl = (card: any) => getUnifiedCardImagePath(card);

// Card count
const getCardCount = () => {
  return tarotStore.selectedSpread?.cardCount || 1;
};

// Debug click handler
const debugClick = () => {
  console.log('[CardDrawing] screen tap');
  console.log('[CardDrawing] drawMethod:', drawMethod.value);
  console.log('[CardDrawing] isDrawing:', isDrawing.value);
  console.log('[CardDrawing] isComplete:', isComplete.value);
  console.log('[CardDrawing] path:', window.location.pathname);
};

// ì¤‘ë³µ ?¸ì¶œ ë°©ì?ë¥??„í•œ ?Œë˜ê·?- ?ë‹¨??? ì–¸
const isProcessingResult = ref(false);

const setNoScroll = (enabled: boolean) => {
  const root = document.documentElement;
  if (!root || !document.body) return;
  root.classList.toggle('no-scroll', enabled);
  document.body.classList.toggle('no-scroll', enabled);
};

// ?íƒœ ì´ˆê¸°???¨ìˆ˜
const resetState = () => {
  console.log('?”„ [resetState] ?íƒœ ì´ˆê¸°???œì‘');
  console.log('?”„ [resetState] ì´ˆê¸°????isProcessingResult:', isProcessingResult.value);
  drawMethod.value = null;
  isDrawing.value = false;
  isComplete.value = false;
  progress.value = 0;
  drawnCards.value = [];
  manualSelectedCards.value = [];
  improvedInterpretation.value = null;
  isGeneratingInterpretation.value = false;
  interpretationProgress.value = 0;
  // ?°ì•  ?íƒœ??ReadingSelect?ì„œ ì²˜ë¦¬
  // isProcessingResultë¥??•ì‹¤?˜ê²Œ falseë¡??¤ì •
  isProcessingResult.value = false;
  // nextTick???¬ìš©??DOM ?…ë°?´íŠ¸ ???¬í™•??  nextTick(() => {
    isProcessingResult.value = false;
    console.log('?”„ [resetState] nextTick ??isProcessingResult:', isProcessingResult.value);
  });
  console.log('?”„ [resetState] ì´ˆê¸°????isProcessingResult:', isProcessingResult.value);
  console.log('?”„ [resetState] ?íƒœ ì´ˆê¸°???„ë£Œ');
};

// ì»´í¬?ŒíŠ¸ ?Œê´´ ???Œë˜ê·?ë¦¬ì…‹
onBeforeUnmount(() => {
  console.log('?”š [onBeforeUnmount] ì»´í¬?ŒíŠ¸ ?Œê´´ ??- ?Œë˜ê·?ë¦¬ì…‹');
  isProcessingResult.value = false;
  isGeneratingInterpretation.value = false;
});

// ì»´í¬?ŒíŠ¸ ?Œê´´ ???Œë˜ê·?ë¦¬ì…‹
onUnmounted(() => {
  setNoScroll(false);
  console.log('?”š [onUnmounted] ì»´í¬?ŒíŠ¸ ?Œê´´ - ?Œë˜ê·?ë¦¬ì…‹');
  isProcessingResult.value = false;
  isGeneratingInterpretation.value = false;
});

// ?¼ìš°??ê²½ë¡œ ë³€ê²?ê°ì?
watch(() => router.currentRoute.value.path, (newPath, oldPath) => {
  if (oldPath && oldPath.includes('card-drawing') && !newPath.includes('card-drawing')) {
    console.log('?”„ [watch] ì¹´ë“œ ?œë¡œ???˜ì´ì§€?ì„œ ? ë‚¨ - ?Œë˜ê·?ë¦¬ì…‹');
    isProcessingResult.value = false;
    isGeneratingInterpretation.value = false;
  }
});

onMounted(async () => {
  setNoScroll(true);
  console.log('?´ [CardDrawing] onMounted ?œì‘');
  console.log('?“Œ [CardDrawing] ? íƒ??ì£¼ì œ:', tarotStore.selectedTopic);
  console.log('?“Š [CardDrawing] ? íƒ??ë°°ì—´ë²?', tarotStore.selectedSpread);
  console.log('??[CardDrawing] ì»¤ìŠ¤?€ ì§ˆë¬¸:', tarotStore.getCustomQuestion());
  console.log('?´ [CardDrawing] ?€ë¡œì¹´??ê°œìˆ˜:', tarotStore.tarotCards.length);
  console.log('?Œ [CardDrawing] ?„ì¬ URL:', window.location.pathname);
  console.log('?Œ [CardDrawing] ?¼ìš°??ê²½ë¡œ:', router.currentRoute.value.path);
  console.log('?” [CardDrawing] ?„ì²´ ?¤í† ???íƒœ:', {
    selectedTopic: JSON.stringify(tarotStore.selectedTopic),
    selectedSpread: JSON.stringify(tarotStore.selectedSpread),
    drawMethod: drawMethod.value,
    isDrawing: isDrawing.value,
    isComplete: isComplete.value
  });
  
  // ?ŒìŠ¤??ê³„ì •?????”ë²„ê·?ëª¨ë“œ ?œì„±??  if (userStore.currentUser?.email === 'test@example.com') {
    console.error('?”´?”´?”´ ?ŒìŠ¤??ê³„ì • ê°ì? - ?”ë²„ê·?ëª¨ë“œ ?œì„±??);
    console.error('?”´ ?„ì¬ ?œê°„:', new Date().toISOString());
    console.error('?”´ spreadId:', tarotStore.selectedSpread?.spreadId);
    
    // ëª¨ë“  ëª¨ë‹ˆ?°ë§ ?œì„±??    try {
      monitorSupabaseAPICalls(); // Supabase API ?¸ì¶œ ëª¨ë‹ˆ?°ë§
      interceptPremiumSpreadCalls(); // ì½˜ì†” ë¡œê·¸ ì¶”ì 
      interceptAdManager(); // AdManager ê°€ë¡œì±„ê¸?      
      console.error('?”´ ëª¨ë‹ˆ?°ë§ ?œì‘ ?„ë£Œ');
      console.error('?”´ ì¹´ë“œ ë½‘ê¸° ??API ?¸ì¶œ??ì¶”ì ?©ë‹ˆ??..');
    } catch (debugError) {
      console.error('?”´ ?”ë²„ê·?ëª¨ë“œ ?œì„±???¤ë¥˜:', debugError);
      // ?”ë²„ê·??¤ë¥˜??ë¬´ì‹œ?˜ê³  ê³„ì† ì§„í–‰
    }
  }
  
  // ?íƒœ ì´ˆê¸°??  resetState();
  
  // DOM??ë§ˆìš´?¸ë˜?ˆëŠ”ì§€ ?•ì¸
  console.log('?” [CardDrawing] DOM ?•ì¸:', {
    hasRootElement: document.querySelector('.card-drawing') !== null,
    body: document.body.innerHTML.substring(0, 200)
  });
  
  // ? íƒ??ì£¼ì œ?€ ë°°ì—´ë²•ì´ ?†ìœ¼ë©?? íƒ ?”ë©´?¼ë¡œ ?Œì•„ê°€ê¸?  if (!tarotStore.selectedTopic || !tarotStore.selectedSpread) {
    console.error('[CardDrawing] ì£¼ì œ ?ëŠ” ë°°ì—´ë²•ì´ ? íƒ?˜ì? ?ŠìŒ');
    console.log('[CardDrawing] ? íƒ ?”ë©´?¼ë¡œ ?Œì•„ê°‘ë‹ˆ??);
    
    // ê°„ë‹¨???Œë¦¼ ë©”ì‹œì§€
    await showAlert({
      title: '? íƒ ?„ìš”',
      message: 'ì£¼ì œ?€ ë°°ì—´ë²•ì„ ë¨¼ì? ? íƒ?´ì£¼?¸ìš”.'
    });
    
    // ? íƒ ?”ë©´?¼ë¡œ ?´ë™
    router.push('/reading-select');
    return;
  }
  
  // ê°•ì œë¡??”ë©´ ?…ë°?´íŠ¸ ?¸ë¦¬ê±?  await nextTick();
  console.log('[CardDrawing] nextTick ??- ?”ë©´???Œë”ë§ë˜?´ì•¼ ??);
  
  // ?˜ì´ì§€ ë¡œë“œ ??ì¹´ë“œ ?ê¸° ? ë‹ˆë©”ì´??  setTimeout(() => {
    // ì¹´ë“œ ì¤€ë¹??„ë£Œ
  }, 1000);
  
  // ì§ì ‘ ? íƒ???„í•œ ???ê¸°
  shuffleDeck();
  
  // ?€ë¡??¤í† ??ì´ˆê¸°???•ì¸
  if (tarotStore.tarotCards.length === 0) {
    console.log('[CardDrawing] ?€ë¡œì¹´?œê? ?†ì–´??ì´ˆê¸°???œì‘');
    await tarotStore.initialize();
    console.log('[CardDrawing] ì´ˆê¸°?????€ë¡œì¹´??ê°œìˆ˜:', tarotStore.tarotCards.length);
  }
});

const goBack = () => {
  router.go(-1);
};

// ?œë¡œ??ë°©ë²• ? íƒ
const selectDrawMethod = async (method: 'random' | 'manual') => {
  console.log('?² [selectDrawMethod] ë°©ë²• ? íƒ:', method);
  console.log('?² [selectDrawMethod] ? íƒ ??isProcessingResult:', isProcessingResult.value);
  
  // ?ˆë¡œ???ê´˜ ?œì‘ ???íƒœ ì´ˆê¸°??  resetState();
  
  drawMethod.value = method;
  
  if (method === 'manual') {
    // ì§ì ‘ ? íƒ ëª¨ë“œë¥??„í•œ ì´ˆê¸°??    manualSelectedCards.value = [];
  }
  
  console.log('?² [selectDrawMethod] ? íƒ ??isProcessingResult:', isProcessingResult.value);
};

// ???ê¸°
const shuffleDeck = () => {
  if (tarotStore.tarotCards.length > 0) {
    // ëª¨ë“  ì¹´ë“œë¥?ë³µì‚¬?˜ê³  ?ê¸°
    const allCards = [...tarotStore.tarotCards];
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    shuffledDeck.value = allCards;
  }
};

// ì¹´ë“œ ?¤í”„?ˆë“œ ?¤í???(?¥ê·¼ ë¶€ì±„ê¼´ ?•íƒœ)
const getCardSpreadStyle = (index: number) => {
  const totalCards = 78;
  const centerX = 50; // ì¤‘ì‹¬??X (?¼ì„¼??
  const centerY = 75; // ì¤‘ì‹¬??Y (?¼ì„¼?? - ???„ë¡œ ?¬ë¦¼
  
  // ë¶€ì±„ê¼´ ê°ë„ ê³„ì‚° - ??ì´˜ì´˜?˜ê²Œ
  const totalAngle = 240; // ?„ì²´ ?¼ì¹¨ ê°ë„ (240?„ë¡œ ì¦ê?)
  const startAngle = -120; // ?œì‘ ê°ë„
  const angleStep = totalAngle / (totalCards - 1);
  const angle = startAngle + (index * angleStep);
  
  // ?¼ë””?ˆìœ¼ë¡?ë³€??  const radian = (angle * Math.PI) / 180;
  
  // ?€?í˜• ë°°ì¹˜ë¥??„í•œ ë°˜ì?ë¦?ê³„ì‚°
  // ê°€ë¡?ë°˜ì?ë¦„ì„ ?¸ë¡œë³´ë‹¤ ?¬ê²Œ ?˜ì—¬ ?€?í˜•?¼ë¡œ ë§Œë“¦
  const radiusX = 45; // ê°€ë¡?ë°˜ì?ë¦?(?¼ì„¼??
  const radiusY = 30; // ?¸ë¡œ ë°˜ì?ë¦?(?¼ì„¼?? - ??ì¤„ì„
  
  // ì¹´ë“œ ?„ì¹˜ ê³„ì‚° (?€??ê³µì‹ ?¬ìš©)
  const x = centerX + radiusX * Math.sin(radian);
  const y = centerY - radiusY * Math.cos(radian);
  
  // ì¹´ë“œê°€ ê²¹ì³ ë³´ì´?„ë¡ z-index ì¡°ì •
  const zIndex = 78 - Math.abs(index - 39); // ì¤‘ì•™???„ë¡œ
  
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${angle * 0.7}deg)`, // ?Œì „ ê°ë„ë¥?ì¤„ì„
    transformOrigin: 'center center',
    zIndex: zIndex
  };
};

// ì¹´ë“œ ? íƒ ?•ì¸
const isCardSelected = (card: any) => {
  return manualSelectedCards.value.some(selected => selected.id === card.id);
};

// ?˜ë™ ì¹´ë“œ ? íƒ
const selectManualCard = async (card: any) => {
  await nativeUtils.buttonTapHaptic();
  
  const isSelected = isCardSelected(card);
  const maxCards = getCardCount();
  
  if (isSelected) {
    // ?´ë? ? íƒ??ì¹´ë“œ??? íƒ ?´ì œ
    manualSelectedCards.value = manualSelectedCards.value.filter(c => c.id !== card.id);
  } else if (manualSelectedCards.value.length < maxCards) {
    // ?„ì§ ? íƒ ê°€?¥í•œ ê²½ìš°
    // ë¬´ì‘??ë°©í–¥ ê²°ì •
    const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
    manualSelectedCards.value.push({
      ...card,
      orientation
    });
  }
};

// ? íƒ??ì¹´ë“œ ?œê±°
const removeSelectedCard = async (index: number) => {
  await nativeUtils.buttonTapHaptic();
  manualSelectedCards.value.splice(index, 1);
};

// ?˜ë™ ? íƒ ?„ë£Œ
const confirmManualSelection = async () => {
  console.log('?¯ [confirmManualSelection] ?œì‘');
  
  // ë°”ë¡œ ì§„í–‰ (?°ì•  ?íƒœ??ReadingSelect?ì„œ ?´ë? ì²˜ë¦¬??
  await proceedWithManualSelection();
};

// ?¤ì œ ?˜ë™ ? íƒ ì²˜ë¦¬
const proceedWithManualSelection = async () => {
  console.log('?¯ [proceedWithManualSelection] ?œì‘');
  
  // ê´‘ê³  ë§¤ë‹ˆ?€ë¥??µí•´ ?ê´˜ ?œì‘ ê°€???¬ë? ?•ì¸ (?¤í”„?ˆë“œ ID ?„ë‹¬)
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  console.log('?¯ [confirmManualSelection] spreadId:', spreadId);
  
  // ?ŒìŠ¤?? startReading ?¸ì¶œ ??DB ?•ì¸
  let usageBefore;
  if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
    console.log('?§ª [?ŒìŠ¤?? confirmManual - startReading ?¸ì¶œ ??DB ì²´í¬');
    usageBefore = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?§ª [?ŒìŠ¤?? ?¸ì¶œ ???¬ìš© ?Ÿìˆ˜:', usageBefore.usedToday);
  }
  
  try {
    const canStart = await adManager.startReading(spreadId);
    console.log('?¯ [confirmManualSelection] canStart:', canStart);
    
    // ?ŒìŠ¤?? startReading ?¸ì¶œ ??DB ?•ì¸
    if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
      console.log('?§ª [?ŒìŠ¤?? confirmManual - startReading ?¸ì¶œ ??DB ì²´í¬');
      const usageAfter = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('?§ª [?ŒìŠ¤?? ?¸ì¶œ ???¬ìš© ?Ÿìˆ˜:', usageAfter.usedToday);
      if (usageAfter.usedToday > usageBefore.usedToday) {
        console.error('?§ª [?ŒìŠ¤?? ? ï¸ ë¬¸ì œ ë°œê²¬! confirmManual??startReading?ì„œ ì¹´ìš´?¸ê? ì¦ê??ˆìŠµ?ˆë‹¤!');
      }
    }
    
    if (!canStart) {
      console.log('?¯ [confirmManualSelection] ?ê´˜ë¥?ë³????†ìŒ - ? ë£Œ ë°°ì—´ ?œí•œ');
      // ?ê´˜ë¥?ë³????†ëŠ” ê²½ìš° - ? ë£Œ ë°°ì—´ ?˜ë£¨ 1???œí•œ
      await showPremiumSpreadLimit();
      return;
    }

    await processManualSelection();
  } catch (error) {
    console.error('?¯ [confirmManualSelection] ?ëŸ¬:', error);
    await showAlert({
      title: '?¤ë¥˜',
      message: 'ì¹´ë“œ ? íƒ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤. ?¤ì‹œ ?œë„?´ì£¼?¸ìš”.'
    });
  }
};

// ?˜ë™ ? íƒ ì²˜ë¦¬
const processManualSelection = async () => {
  // ? íƒ??ì¹´ë“œë¡?ì§„í–‰
  tarotStore.setTempDrawnCards(manualSelectedCards.value);
  
  drawnCards.value = manualSelectedCards.value.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));
  
  isComplete.value = true;
  
  // ?µê³„??ì¹´ìš´??ì¦ê? (ê¸°íš ë³€ê²½ìœ¼ë¡?ë¬´ë£Œ ?œí•œ ?†ìŒ)
  // userStore.incrementFreeReading();
};

const startDrawing = async () => {
  console.log('?¯ [startDrawing] ?œì‘');
  console.log('?¯ [startDrawing] ?„ì¬ ?œê°„:', new Date().toISOString());
  console.log('?¯ [startDrawing] ?„ì¬ user:', userStore.currentUser);
  console.log('?¯ [startDrawing] isProcessingResult:', isProcessingResult.value);
  
  // ë²„íŠ¼ ?´ë¦­ ?‡í‹± ?¼ë“œë°?  await nativeUtils.buttonTapHaptic();
  
  // ë°”ë¡œ ì§„í–‰ (?°ì•  ?íƒœ??ReadingSelect?ì„œ ?´ë? ì²˜ë¦¬??
  await proceedWithDrawing();
};

// ?¤ì œ ì¹´ë“œ ë½‘ê¸° ì§„í–‰
const proceedWithDrawing = async () => {
  
  // ê´‘ê³  ë§¤ë‹ˆ?€ë¥??µí•´ ?ê´˜ ?œì‘ ê°€???¬ë? ?•ì¸ (?¤í”„?ˆë“œ ID ?„ë‹¬)
  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  console.log('?¯ [startDrawing] spreadId:', spreadId);
  console.log('?¯ [startDrawing] isPremium:', userStore.isPremium);
  console.log('?¯ [startDrawing] userEmail:', userStore.currentUser?.email);
  
  // ?ŒìŠ¤?? startReading ?¸ì¶œ ??DB ?•ì¸
  let usageBefore: any = null;
  if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross') {
    console.log('?§ª [?ŒìŠ¤?? startReading ?¸ì¶œ ??DB ì²´í¬');
    usageBefore = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?§ª [?ŒìŠ¤?? ?¸ì¶œ ???¬ìš© ?Ÿìˆ˜:', usageBefore.usedToday);
  }
  
  try {
    const canStart = await adManager.startReading(spreadId);
    console.log('?¯ [startDrawing] canStart:', canStart);
    
    // ?ŒìŠ¤?? startReading ?¸ì¶œ ??DB ?•ì¸
    if (userStore.currentUser?.email === 'test@example.com' && spreadId === 'celtic_cross' && usageBefore) {
      console.log('?§ª [?ŒìŠ¤?? startReading ?¸ì¶œ ??DB ì²´í¬');
      const usageAfter = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('?§ª [?ŒìŠ¤?? ?¸ì¶œ ???¬ìš© ?Ÿìˆ˜:', usageAfter.usedToday);
      if (usageAfter.usedToday > usageBefore.usedToday) {
        console.error('?§ª [?ŒìŠ¤?? ? ï¸ ë¬¸ì œ ë°œê³¬! startReading?ì„œ ì¹´ìš´?¸ê? ì¦ê??ˆìŠµ?ˆë‹¤!');
      }
    }
    
    if (!canStart) {
      console.log('?¯ [startDrawing] ?ê´˜ë¥?ë³????†ìŒ - ? ë£Œ ë°°ì—´ ?œí•œ');
      // ?ê´˜ë¥?ë³????†ëŠ” ê²½ìš° - ? ë£Œ ë°°ì—´ ?˜ë£¨ 1???œí•œ
      await showPremiumSpreadLimit();
      return;
    }

    // ê´‘ê³  ?íƒœ ?…ë°?´íŠ¸
    updateAdStatus();
    
    // ì¹´ë“œ ë½‘ê¸° ì§„í–‰
    console.log('?¯ [startDrawing] ì¹´ë“œ ë½‘ê¸° ì§„í–‰');
    await drawCards();
  } catch (error) {
    console.error('?¯ [startDrawing] ?ëŸ¬:', error);
    await showAlert({
      title: '?¤ë¥˜',
      message: 'ì¹´ë“œ ë½‘ê¸° ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤. ?¤ì‹œ ?œë„?´ì£¼?¸ìš”.'
    });
  }
};

const drawCards = async () => {
  console.log('?² [drawCards] ì¹´ë“œ ë½‘ê¸° ?œì‘');
  isDrawing.value = true;
  progress.value = 0;

  // ì¹´ë“œ ?½ê¸° ?‡í‹± ?¼ë“œë°?  await nativeUtils.cardDrawHaptic();

  // ?„ë¡œê·¸ë ˆ??ë°?? ë‹ˆë©”ì´??  const progressInterval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 100) {
      clearInterval(progressInterval);
    }
  }, 200);

  // ì¹´ë“œ ë½‘ê¸° ?œë??ˆì´??  await new Promise(resolve => setTimeout(resolve, 2500));

  // ì¹´ë“œ ê°œìˆ˜ (?¤í”„?ˆë“œ???°ë¼ ê²°ì •)
  const cardCount = tarotStore.selectedSpread?.cardCount || 1;
  console.log('?² [drawCards] ì¹´ë“œ ê°œìˆ˜:', cardCount);
  
  // ?¤ì œ ?€ë¡œì¹´???°ì´?°ì—???œë¤ ? íƒ
  const selectedCards = tarotStore.drawCards(cardCount);
  console.log('?² [drawCards] ? íƒ??ì¹´ë“œ:', selectedCards);


  tarotStore.setTempDrawnCards(selectedCards);

  drawnCards.value = selectedCards.map(card => ({
    card,
    orientation: card.orientation,
    revealed: false
  }));
  console.log('?² [drawCards] drawnCards ?¤ì • ?„ë£Œ:', drawnCards.value);

  isDrawing.value = false;
  isComplete.value = true;
  console.log('?² [drawCards] ì¹´ë“œ ë½‘ê¸° ?„ë£Œ, isComplete:', isComplete.value);

  // ?ŒìŠ¤?¸ë? ?„í•œ ?ë™ ì¹´ë“œ ê³µê°œ (ê°œë°œ ?˜ê²½?ì„œë§?
  if (userStore.currentUser?.email === 'test@example.com') {
    console.log('?§ª [?ŒìŠ¤?? 2ì´???ëª¨ë“  ì¹´ë“œ ?ë™ ê³µê°œ');
    setTimeout(async () => {
      console.log('?§ª [?ŒìŠ¤?? ?ë™ ì¹´ë“œ ê³µê°œ ?¤í–‰');
      await revealAllCards();
      console.log('?§ª [?ŒìŠ¤?? ?ë™ ì¹´ë“œ ê³µê°œ ?„ë£Œ');
    }, 2000);
  }

  // ?µê³„??ì¹´ìš´??ì¦ê? (ê¸°íš ë³€ê²½ìœ¼ë¡?ë¬´ë£Œ ?œí•œ ?†ìŒ)
  // userStore.incrementFreeReading();
};

const revealCard = async (index: number) => {
  console.log('?ƒ [revealCard] ì¹´ë“œ ê³µê°œ:', index);
  // ì¹´ë“œ ê³µê°œ ?‡í‹± ?¼ë“œë°?  await nativeUtils.buttonTapHaptic();
  drawnCards.value[index].revealed = true;
  console.log('?ƒ [revealCard] ì¹´ë“œ ê³µê°œ ???íƒœ:', drawnCards.value[index]);
  console.log('?ƒ [revealCard] ?„ì²´ ì¹´ë“œ ê³µê°œ ?íƒœ:', drawnCards.value.map(c => c.revealed));
  console.log('?ƒ [revealCard] allCardsRevealed:', allCardsRevealed.value);
  
  // ì¼ˆí‹± ?¬ë¡œ???´ì„?€ createReading?ì„œ ?ì„±?˜ë?ë¡??¬ê¸°?œëŠ” ?„ìš”?†ìŒ - 2025.01.14
};

// ëª¨ë“  ì¹´ë“œ ?¼ê´„ ?¤ì§‘ê¸?const revealAllCards = async () => {
  console.log('?­ [revealAllCards] ëª¨ë“  ì¹´ë“œ ?¤ì§‘ê¸??œì‘');
  // ?…í‹± ?¼ë“œë°?  await nativeUtils.buttonTapHaptic();
  
  // ëª¨ë“  ì¹´ë“œë¥??œì°¨?ìœ¼ë¡??¤ì§‘ê¸?(? ë‹ˆë©”ì´???¨ê³¼)
  for (let i = 0; i < drawnCards.value.length; i++) {
    drawnCards.value[i].revealed = true;
    console.log(`?­ [revealAllCards] ì¹´ë“œ ${i} ê³µê°œ??);
    // ì¹´ë“œ ?¬ì´???½ê°„???œë ˆ??ì¶”ê?
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('?­ [revealAllCards] ëª¨ë“  ì¹´ë“œ ê³µê°œ ?„ë£Œ');
  console.log('?­ [revealAllCards] allCardsRevealed:', allCardsRevealed.value);
  
  // ì¼ˆí‹± ?¬ë¡œ???´ì„?€ createReading?ì„œ ?ì„±?˜ë?ë¡??¬ê¸°?œëŠ” ?„ìš”?†ìŒ - 2025.01.14
};

// ì¼ˆí‹± ?¬ë¡œ???´ì„?€ tarot.ts??createReading?ì„œ ?ì„±?˜ë„ë¡?ë³€ê²½ë¨ - 2025.01.14
// ì¤‘ë³µ ?¸ì¶œ ë°©ì?ë¥??„í•´ ?œê±°

// (?´ë? ?ë‹¨??? ì–¸??

// ?´ì„ ë³´ê¸° ë²„íŠ¼ ?´ë¦­ ?¸ë“¤??const handleInterpretationClick = async () => {
  console.log('?”˜ [handleInterpretationClick] ë²„íŠ¼ ?´ë¦­ ??');
  console.log('?”˜ [handleInterpretationClick] ?„ì¬ ?œê°„:', new Date().toISOString());
  console.log('?”˜ [handleInterpretationClick] isProcessingResult ?íƒœ:', isProcessingResult.value);
  
  // ?´ë? ì²˜ë¦¬ ì¤‘ì´ë©?ë¬´ì‹œ (ì¤‘ë³µ ?´ë¦­ ë°©ì?)
  if (isProcessingResult.value) {
    console.log('?”˜ [handleInterpretationClick] ?´ë? ì²˜ë¦¬ ì¤?- ë¬´ì‹œ');
    return;
  }
  
  // ë²„íŠ¼ ?´ë¦­ ???…í‹± ?¼ë“œë°?  await nativeUtils.buttonTapHaptic();
  
  // goToResult ?¨ìˆ˜ ?¸ì¶œ - ?”ë²„ê·??•ë³´ ?„ë‹¬
  try {
    console.log('?”˜ [handleInterpretationClick] goToResult ?¸ì¶œ ?œì‘');
    await goToResult();
    console.log('?”˜ [handleInterpretationClick] goToResult ?¸ì¶œ ?„ë£Œ');
  } catch (error) {
    console.error('?”˜ [handleInterpretationClick] goToResult ?ëŸ¬:', error);
    // ?ëŸ¬ ë°œìƒ ???Œë˜ê·?ë¦¬ì…‹
    isProcessingResult.value = false;
    console.log('?”˜ [handleInterpretationClick] ?ëŸ¬ ??isProcessingResult ë¦¬ì…‹:', isProcessingResult.value);
    await showAlert({
      title: '?¤ë¥˜',
      message: '?´ì„ ì²˜ë¦¬ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.'
    });
  }
};

const goToResult = async () => {
  // ?”ë²„ê·¸ìš© ë³€??? ì–¸
  let usageBeforeGoToResult: any = null;
  const testEmails = ['test@example.com', 'test@test.com'];
  const currentUserEmail = userStore.currentUser?.email?.toLowerCase() || '';
  const isTestUser = testEmails.includes(currentUserEmail) || currentUserEmail.includes('test');
  
  console.log('?¯ [goToResult] ?¨ìˆ˜ ?¸ì¶œ??');
  console.log('?¯ [goToResult] isProcessingResult:', isProcessingResult.value);
  console.log('?¯ [goToResult] allCardsRevealed:', allCardsRevealed.value);
  console.log('?¯ [goToResult] drawnCards:', drawnCards.value);
  console.log('?¯ [goToResult] ?„ì¬ ?œê°„:', new Date().toISOString());
  console.log('?¯ [goToResult] spreadId:', tarotStore.selectedSpread?.spreadId);
  console.log('?¯ [goToResult] ?¬ìš©???´ë©”??', userStore.currentUser?.email);
  
  // ì¼ˆí‹± ?¬ë¡œ?¤ì¸ ê²½ìš° ?”ë²„ê·??•ë³´ ?˜ì§‘
  if (tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('?” [?”ë²„ê·? ì¼ˆí‹± ?¬ë¡œ???¬ìš© ?Ÿìˆ˜ ?•ì¸ ?œì‘');
    console.log('?” [?”ë²„ê·? ?¬ìš©???´ë©”??', currentUserEmail);
    console.log('?” [?”ë²„ê·? ?ŒìŠ¤??ê³„ì • ?¬ë?:', isTestUser);
    try {
      usageBeforeGoToResult = await adManager.checkPremiumSpreadUsage('celtic_cross');
      console.log('?” [?”ë²„ê·? ì¼ˆí‹± ?¬ë¡œ???„ì¬ ?¬ìš© ?Ÿìˆ˜:', usageBeforeGoToResult);
      
      // ?”ë²„ê·??ŒëŒ ?œê±° - ë¶ˆí•„?”í•œ ?ŒëŒ ?œì‹œ?˜ì? ?ŠìŒ
    } catch (error) {
      console.error('?” [?”ë²„ê·? ?ëŸ¬:', error);
      // ?ëŸ¬??ë¬´ì‹œ?˜ê³  ê³„ì† ì§„í–‰
    }
  }
  
  // ?´ë? ì²˜ë¦¬ ì¤‘ì´ë©?ì¤‘ë³µ ?¸ì¶œ ë°©ì?
  if (isProcessingResult.value) {
    console.log('?¯ [goToResult] ?´ë? ì²˜ë¦¬ ì¤?- ì¤‘ë³µ ?¸ì¶œ ë°©ì?');
    return;
  }
  
  // ëª¨ë“  ì¹´ë“œê°€ ê³µê°œ?˜ì? ?Šì•˜?¼ë©´ ê²½ê³ 
  if (!allCardsRevealed.value) {
    console.log('?¯ [goToResult] ëª¨ë“  ì¹´ë“œê°€ ê³µê°œ?˜ì? ?ŠìŒ');
    await showAlert({
      title: 'ì¹´ë“œ ê³µê°œ ?„ìš”',
      message: 'ëª¨ë“  ì¹´ë“œë¥?ë¨¼ì? ê³µê°œ?´ì£¼?¸ìš”!'
    });
    return;
  }
  
  // ì²˜ë¦¬ ?œì‘
  isProcessingResult.value = true;
  
  // ?¤í”„?ˆë“œ ?•ë³´ ê°€?¸ì˜¤ê¸?  const spreadId = tarotStore.selectedSpread?.spreadId || 'one_card';
  const premiumSpreads = ['celtic_cross', 'seven_star', 'cup_of_relationship'];
  const isPremiumSpread = premiumSpreads.includes(spreadId);
  const isSimpleSpread = spreadId === 'one_card' || spreadId === 'three_card_timeline';
  
  // ?ŒìŠ¤??ê³„ì •ê³??„ì‹œ ?„ë¦¬ë¯¸ì—„ ?•ì¸ - testEmails?€ ?´ë? ?ë‹¨?ì„œ ? ì–¸??  // TODO: ?¤ì œ ?ŒìŠ¤?¸í•  êµ¬ê? ê³„ì • ?´ë©”?¼ì„ ?¬ê¸°??ì¶”ê??˜ì„¸??  const currentEmail = userStore.currentUser?.email?.toLowerCase() || '';
  const isTestAccount = testEmails.includes(currentEmail) || currentEmail.includes('test');
  const hasTempPremium = adStatus.value.isTemporaryPremium;
  
  console.log('?¯ [goToResult] ê´‘ê³  ?œì‹œ ì²´í¬:', {
    isPremium: userStore.isPremium,
    isSimpleSpread,
    hasTempPremium,
    isTestAccount,
    spreadId
  });
  
  // ?ŒìŠ¤??ê³„ì •??ê´‘ê³ ë¥?ë³????ˆë„ë¡??¤ì • (ê°œë°œ ?ŒìŠ¤?¸ìš©)
  const shouldShowAd = !userStore.isPremium && !isSimpleSpread && !hasTempPremium;
  
  if (shouldShowAd) {
    console.log('?“º [goToResult] ë¬´ë£Œ ?¬ìš©??- ê´‘ê³  ?œì‹œ');
    console.log('?“º [goToResult] spreadId:', spreadId);
    console.log('?“º [goToResult] isTestAccount:', isTestAccount);
    console.log('?“º [goToResult] hasTempPremium:', hasTempPremium);
    
    // ê´‘ê³  ?œì‹œ ?•ì¸  
    try {
      const confirmed = await showConfirm({
        title: 'ê´‘ê³  ?œì²­',
        message: '?´ì„??ë³´ë ¤ë©?15ì´?ê´‘ê³ ë¥??œì²­?´ì•¼ ?©ë‹ˆ??\n(ê´‘ê³ ???¤í‚µ?????†ìŠµ?ˆë‹¤)\n\nê³„ì†?˜ì‹œê² ìŠµ?ˆê¹Œ?'
      });
      
      console.log('?“º [goToResult] confirm ê²°ê³¼:', confirmed);
      
      if (!confirmed) {
        console.log('?“º [goToResult] ?¬ìš©?ê? ì·¨ì†Œ??);
        isProcessingResult.value = false;
        return;
      }
    } catch (error) {
      console.error('?“º [goToResult] confirm ?ëŸ¬:', error);
      // confirm ?ëŸ¬ ?œì—??ì§„í–‰
    }
    
    // ê´‘ê³  ?œì‹œ - ë§¤ë²ˆ ?ˆë¡œ??ê´‘ê³  ?¸ìŠ¤?´ìŠ¤ ?ì„±
    try {
      console.log('?“º [goToResult] ê´‘ê³  ?œì‹œ ?œì‘...');
      console.log('?“º [goToResult] ?„ì¬ ?œê°„:', new Date().toISOString());
      
      // adService ì´ˆê¸°???íƒœ ?¬ì„¤?•ì„ ?„í•´ ?½ê°„???œë ˆ??ì¶”ê?
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ê´‘ê³  ?œë¹„?¤ì—??ì§ì ‘ ê°•ì œ ?œì²­ ê´‘ê³  ?œì‹œ (? ë£Œ ë°°ì—´?€ ë¦¬ì›Œ??ê´‘ê³ )
      const adWatched = await showRewardedAd();
      console.log('?“º [goToResult] ê°•ì œ ?œì²­ ê´‘ê³  ?œì‹œ ê²°ê³¼:', adWatched);
      console.log('?“º [goToResult] ê´‘ê³  ?œì‹œ ???œê°„:', new Date().toISOString());
      
      if (!adWatched) {
        console.log('?“º [goToResult] ê´‘ê³  ?œì²­ ?¤íŒ¨');
        await showAlert({
          title: 'ê´‘ê³  ?¤ë¥˜',
          message: 'ê´‘ê³  ë¡œë“œ???¤íŒ¨?ˆìŠµ?ˆë‹¤. ?¤ì‹œ ?œë„?´ì£¼?¸ìš”.'
        });
        isProcessingResult.value = false;
        return;
      }
      
      // ê´‘ê³  ?œì²­ ?±ê³µ ???íƒœ ?…ë°?´íŠ¸
      updateAdStatus();
    } catch (error) {
      console.error('?“º [goToResult] ê´‘ê³  ?œì‹œ ?¤ë¥˜:', error);
      console.error('?“º [goToResult] ?¤ë¥˜ ?ì„¸:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // ê´‘ê³  ?¤ë¥˜ ?œì—??ì§„í–‰ (?¬ìš©??ê²½í—˜ ?°ì„ )
      await showAlert({
        title: '?Œë¦¼',
        message: 'ê´‘ê³  ë¡œë“œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤. ?´ì„ ?”ë©´?¼ë¡œ ?´ë™?©ë‹ˆ??'
      });
    }
  } else if (isSimpleSpread) {
    console.log('?“º [goToResult] 1??3??ë°°ì—´ - ê´‘ê³  ?†ì´ ì§„í–‰');
  } else if (userStore.isPremium || hasTempPremium) {
    console.log('?“º [goToResult] ?„ë¦¬ë¯¸ì—„/?„ì‹œ ?„ë¦¬ë¯¸ì—„ ?¬ìš©??- ê´‘ê³  ?†ì´ ì§„í–‰');
  }
  
  // ? ë£Œ ë°°ì—´ ?¬ìš© ê¸°ë¡ (ê²°ê³¼ ë³´ê¸° ?œì ?ë§Œ ê¸°ë¡)
  
  // ?ŒìŠ¤?? ê¸°ë¡ ??DB ?•ì¸
  if (userStore.currentUser?.email === 'test@example.com' && tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('?§ª [?ŒìŠ¤?? recordPremiumSpreadUsage ?¸ì¶œ ??DB ì²´í¬');
    const usageBeforeRecord = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?§ª [?ŒìŠ¤?? ê¸°ë¡ ???¬ìš© ?Ÿìˆ˜:', usageBeforeRecord.usedToday);
  }
  
  // ë¬´ë£Œ ?¬ìš©?ê? ? ë£Œ ë°°ì—´???¬ìš©?˜ëŠ” ê²½ìš°?ë§Œ ê¸°ë¡
  // ?€ë¡??¤í† ?´ì—???Œë˜ê·??•ì¸
  const shouldRecordUsage = tarotStore.getPremiumSpreadUsage();
  
  if (!userStore.isPremium && !hasTempPremium && isPremiumSpread && shouldRecordUsage) {
    // ?ŒìŠ¤??ê³„ì •?€ ê¸°ë¡?˜ì? ?ŠìŒ - ?¼ì¤‘ ì²´í¬
    const testEmails = ['test@example.com', 'test@test.com'];
    const currentEmail = userStore.currentUser?.email?.toLowerCase() || '';
    const isDefinitelyTestAccount = testEmails.includes(currentEmail) || currentEmail.includes('test');
    
    console.log('?“‹ [goToResult] ? ë£Œ ë°°ì—´ ?¬ìš© ê¸°ë¡ ì²´í¬');
    console.log('?“‹ [goToResult] currentEmail:', currentEmail);
    console.log('?“‹ [goToResult] isDefinitelyTestAccount:', isDefinitelyTestAccount);
    console.log('?“‹ [goToResult] spreadId:', spreadId);
    console.log('?“‹ [goToResult] shouldRecordUsage:', shouldRecordUsage);
    
    if (!isDefinitelyTestAccount) {
      console.log('?“‹ [goToResult] ?¼ë°˜ ?¬ìš©??- ? ë£Œ ë°°ì—´ ?¬ìš© ê¸°ë¡ ?œì‘');
      await adManager.recordPremiumSpreadUsage(spreadId);
      console.log('?“‹ [goToResult] ? ë£Œ ë°°ì—´ ?¬ìš© ê¸°ë¡ ?„ë£Œ');
      
      // ?Œë˜ê·?ì´ˆê¸°??      tarotStore.clearPremiumSpreadUsage();
    } else {
      console.log('?“‹ [goToResult] ?ŒìŠ¤??ê³„ì • ?•ì¸??- ? ë£Œ ë°°ì—´ ?¬ìš© ê¸°ë¡ ê±´ë„ˆ?€');
      console.log('?“‹ [goToResult] ?ŒìŠ¤??ê³„ì • ?´ë©”??', currentEmail);
      
      // ?ŒìŠ¤??ê³„ì •???Œë˜ê·?ì´ˆê¸°??      tarotStore.clearPremiumSpreadUsage();
    }
  } else {
    console.log('?“‹ [goToResult] ? ë£Œ ë°°ì—´ ê¸°ë¡ ì¡°ê±´ ë¯¸ì¶©ì¡?', {
      isPremium: userStore.isPremium,
      hasTempPremium: hasTempPremium,
      isPremiumSpread: isPremiumSpread,
      spreadId: spreadId,
      email: userStore.currentUser?.email
    });
  }
  
  // ê¸°ë¡ ??DB ?•ì¸ (ëª¨ë“  ?¬ìš©???€??
  if (tarotStore.selectedSpread?.spreadId === 'celtic_cross') {
    console.log('?” [?”ë²„ê·? recordPremiumSpreadUsage ?¸ì¶œ ??DB ì²´í¬');
    const usageAfterRecord = await adManager.checkPremiumSpreadUsage('celtic_cross');
    console.log('?” [?”ë²„ê·? ê¸°ë¡ ???¬ìš© ?Ÿìˆ˜:', usageAfterRecord.usedToday);
    
    // goToResult ?„ì²´ ?„í›„ ë¹„êµ (usageBeforeGoToResultê°€ ?ˆì„ ?Œë§Œ)
    if (usageBeforeGoToResult) {
      const diff = usageAfterRecord.usedToday - usageBeforeGoToResult.usedToday;
      const accountType = isTestUser ? '?ŒìŠ¤??ê³„ì •' : '?¼ë°˜ ë¬´ë£Œ ê³„ì •';
      
      if (isTestUser) {
        // ?ŒìŠ¤??ê³„ì •??ê²½ìš°
        if (diff > 0) {
          console.error('? ï¸ ë²„ê·¸ ë°œê²¬! ?ŒìŠ¤??ê³„ì •?¸ë° ì¹´ìš´?¸ê? ì¦ê??ˆìŠµ?ˆë‹¤!');
        } else {
          console.log('???•ìƒ: ?ŒìŠ¤??ê³„ì • ì¹´ìš´??ì¦ê? ?†ìŒ');
        }
      } else {
        // ?¼ë°˜ ê³„ì •??ê²½ìš°
        if (diff > 0) {
          console.log('???•ìƒ: ?¼ë°˜ ê³„ì • ì¹´ìš´??ì¦ê?');
          // ?¬ìš© ?„ë£Œ ?ŒëŒ ?œê±° - ?ì—°?¤ëŸ¬???¬ìš©??ê²½í—˜???„í•´
        } else {
          console.log('?¤” ?ˆìƒì¹?ëª»í•œ ?í™©: ?¼ë°˜ ê³„ì •?¸ë° ì¹´ìš´??ì¦ê? ?†ìŒ');
        }
      }
    }
  }
  
  // ëª¨ë“  ë°°ì—´?ì„œ ë¡œë”© ?”ë©´ ?œì‹œ
  isGeneratingInterpretation.value = true;
  interpretationProgress.value = 0;
  
  // ?„ë¡œê·¸ë ˆ???…ë°?´íŠ¸ ?œë??ˆì´??  const progressInterval = setInterval(() => {
    if (interpretationProgress.value < 90) {
      interpretationProgress.value += Math.random() * 15;
    }
  }, 500);
  
  try {
    // ì¼ˆí‹± ?¬ë¡œ?¤ì˜ ê²½ìš° ê°œì„ ???´ì„???¨ê»˜ ?€??    if (isCelticCross.value && improvedInterpretation.value) {
      tarotStore.setImprovedInterpretation(improvedInterpretation.value);
    }
    
    // ì»¤ìŠ¤?€ ì§ˆë¬¸ ê°€?¸ì˜¤ê¸?    const customQuestion = tarotStore.getCustomQuestion();
    
    // ë½‘íŒ ì¹´ë“œë¡??ê´˜ ?ì„±
    const reading = await tarotStore.createReading(
      tarotStore.selectedSpread?.spreadId || 'one_card',
      tarotStore.selectedTopic?.id || 'general',
      customQuestion || undefined, // ì»¤ìŠ¤?€ ì§ˆë¬¸ ?„ë‹¬
      tarotStore.getTempDrawnCards() || undefined
    );
    
    // AI ?´ì„ ?ì„± (?„ë¦¬ë¯¸ì—„/?ŒìŠ¤??ê³„ì •ë§?
    const topic = tarotStore.selectedTopic?.id || 'general';
    const spreadId = tarotStore.selectedSpread?.spreadId || 'three_cards';
    const shouldGenerateAI = (userStore.isPremium || isTestAccount) && 
                            (customQuestion || isCelticCross.value || isSevenStar.value || isCupOfRelationship.value);
    
    if (shouldGenerateAI && reading && !reading.aiInterpretation) {
      console.log('?¤– AI ?´ì„ ?ì„± ?œì‘');
      console.log('?¤– ì¡°ê±´:', { 
        customQuestion: !!customQuestion, 
        isCelticCross: isCelticCross.value,
        isSevenStar: isSevenStar.value,
        isCupOfRelationship: isCupOfRelationship.value
      });
      
      try {
        // ?„ë¡œê·¸ë ˆ???…ë°?´íŠ¸
        interpretationProgress.value = 30;
        
        // ì¼ˆí‹± ?¬ë¡œ?¤ë„ tarot.ts??createReading?ì„œ ?´ë? ?´ì„ ?ì„±??        // ì¤‘ë³µ ?¸ì¶œ ?œê±° - 2025.01.14
        // ì¼ˆí‹±?¬ë¡œ?¤ëŠ” ì»¤ìŠ¤?€ ì§ˆë¬¸ ?¬ë??€ ê´€ê³„ì—†???´ë? createReading?ì„œ CelticCrossAIInterpreterë¡?ì²˜ë¦¬??        if (isCelticCross.value) {
          console.log('?¤– ì¼ˆí‹± ?¬ë¡œ??- ?´ë? createReading?ì„œ ?´ì„ ?ì„±??);
          console.log('?¤– ì»¤ìŠ¤?€ ì§ˆë¬¸ ?¬ë?:', !!customQuestion);
          console.log('?¤– ê¸°ì¡´ ?´ì„ ?•ì¸:', {
            hasImprovedInterpretation: !!reading.improvedInterpretation,
            hasPremiumInsights: !!reading.premiumInsights,
            hasEnhancedInterpretation: !!reading.enhancedInterpretation,
            hasAiInterpretation: !!reading.aiInterpretation
          });
          
          // ?´ë? ?ì„±???´ì„???ˆëŠ”ì§€ ?•ì¸
          if (reading.improvedInterpretation) {
            // improvedInterpretation?ì„œ AI ?´ì„ ì¶”ì¶œ
            let aiInterpretationText = '';
            if (typeof reading.improvedInterpretation === 'object') {
              aiInterpretationText = reading.improvedInterpretation.aiInterpretation ||
                                    reading.improvedInterpretation.overallInterpretation || 
                                    reading.improvedInterpretation.summary || 
                                    reading.improvedInterpretation.overallMessage ||
                                    '?´ì„???ì„±?????†ìŠµ?ˆë‹¤.';
            } else if (typeof reading.improvedInterpretation === 'string') {
              aiInterpretationText = reading.improvedInterpretation;
            }
            reading.aiInterpretation = aiInterpretationText;
            console.log('?¤– ê¸°ì¡´ ì¼ˆí‹± ?¬ë¡œ???´ì„ ?¬ìš©');
          } else if (reading.enhancedInterpretation?.overallMessage) {
            reading.aiInterpretation = reading.enhancedInterpretation.overallMessage;
            console.log('?¤– ê¸°ì¡´ enhanced ?´ì„ ?¬ìš©');
          } else {
            console.log('?¤– ì¼ˆí‹± ?¬ë¡œ???´ì„???´ë? ?ì„±?˜ì–´ ?ˆì–´????);
          }
        }
        // ?¸ë¸?¤í??€ ì»µì˜¤ë¸Œë¦´?ˆì´?˜ì‹­?€ tarot.ts??createReading?ì„œ ?´ë? ?´ì„ ?ì„±??        // ì¤‘ë³µ ?¸ì¶œ ?œê±° - 2025.01.14
        else if (isSevenStar.value || isCupOfRelationship.value) {
          console.log('?¤– ?¸ë¸?¤í?/ì»µì˜¤ë¸Œë¦´?ˆì´?˜ì‹­ - ?´ë? createReading?ì„œ ?´ì„ ?ì„±??);
          console.log('?¤– ê¸°ì¡´ ?´ì„ ?•ì¸:', {
            hasEnhancedInterpretation: !!reading.enhancedInterpretation,
            hasPremiumInsights: !!reading.premiumInsights,
            hasAiInterpretation: !!reading.enhancedInterpretation?.aiInterpretation
          });
          
          // ?´ë? ?ì„±???´ì„???ˆëŠ”ì§€ ?•ì¸
          if (reading.enhancedInterpretation?.aiInterpretation) {
            reading.aiInterpretation = reading.enhancedInterpretation.aiInterpretation;
            console.log('?¤– ê¸°ì¡´ AI ?´ì„ ?¬ìš©');
          } else if (reading.premiumInsights?.aiInterpretation) {
            reading.aiInterpretation = reading.premiumInsights.aiInterpretation;
            console.log('?¤– ê¸°ì¡´ ?„ë¦¬ë¯¸ì—„ ?´ì„ ?¬ìš©');
          } else {
            console.log('?¤– ?´ì„???´ë? ?ì„±?˜ì–´ ?ˆì–´????(createReading?ì„œ)');
          }
        }
        // ì»¤ìŠ¤?€ ì§ˆë¬¸???ˆëŠ” ê²½ìš° customInterpretationService ?¬ìš©
        // ?„ë¦¬ë¯¸ì—„ ë°°ì—´ë²?ì¼ˆí‹±?¬ë¡œ?? ?¸ë¸?¤í?, ì»µì˜¤ë¸Œë¦´?ˆì´?˜ì‹­)?€ ?œì™¸
        else if (customQuestion && !isCelticCross.value && !isSevenStar.value && !isCupOfRelationship.value) {
          console.log('?¤– ì»¤ìŠ¤?€ ì§ˆë¬¸ AI ?´ì„ ?ì„±');
          
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
            
            console.log('?¤– ì»¤ìŠ¤?€ ì§ˆë¬¸ AI ?´ì„ ?±ê³µ');
          } else {
            console.error('?¤– ì»¤ìŠ¤?€ ì§ˆë¬¸ AI ?´ì„ ?¤íŒ¨:', interpretationResult.error);
            reading.aiInterpretation = '?´ì„???ì„±?????†ìŠµ?ˆë‹¤.';
          }
        }
        
        // ?„ë¡œê·¸ë ˆ???…ë°?´íŠ¸
        interpretationProgress.value = 70;
        
        // reading??store???…ë°?´íŠ¸
        tarotStore.updateReading(reading);
      } catch (aiError) {
        console.error('?¤– AI ?´ì„ ?ì„± ?¤íŒ¨:', aiError);
        tarotStore.updateReading(reading);
      }
    }
    
    console.log('???ê´˜ ?ì„± ?±ê³µ:', reading.id);
    
    // ?„ë¡œê·¸ë ˆ???„ë£Œ
    clearInterval(progressInterval);
    interpretationProgress.value = 100;
    
    // ? ì‹œ ?€ê¸????”ë©´ ?„í™˜
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ë¡œë”© ?”ë©´ ?¨ê¸°ê¸?    isGeneratingInterpretation.value = false;
    
    // ?Œë˜ê·?ëª…í™•?˜ê²Œ ë¦¬ì…‹ (?˜ì´ì§€ ?„í™˜ ??
    isProcessingResult.value = false;
    console.log('?¯ [goToResult] ?˜ì´ì§€ ?„í™˜ ??isProcessingResult ë¦¬ì…‹:', isProcessingResult.value);
    
    // ?ê´´ ê²°ê³¼ ?”ë©´?¼ë¡œ ?´ë™
    console.log('?¯ [goToResult] ê²°ê³¼ ?”ë©´?¼ë¡œ ?´ë™ ?œë„:', `/reading-result?readingId=${reading.id}`);
    
    // nextTick???¬ìš©??DOM ?…ë°?´íŠ¸ ???¼ìš°??    await nextTick();
    
    router.push(`/reading-result?readingId=${reading.id}`);
    console.log('?¯ [goToResult] router.push ?¸ì¶œ ?„ë£Œ');
  } catch (error) {
    
    // ?„ë¡œê·¸ë ˆ???•ë¦¬
    clearInterval(progressInterval);
    isGeneratingInterpretation.value = false;
    interpretationProgress.value = 0;
    
    await showAlert({
      title: '?ê´˜ ?ì„± ?¤íŒ¨',
      message: `?ê´˜ ?ì„±???¤íŒ¨?ˆìŠµ?ˆë‹¤: ${error.message || '?????†ëŠ” ?¤ë¥˜'}`
    });
  } finally {
    // ì²˜ë¦¬ ?„ë£Œ ?Œë˜ê·?ë¦¬ì…‹ - nextTick???¬ìš©???•ì‹¤?˜ê²Œ ë¦¬ì…‹
    console.log('?¯ [goToResult] finally ë¸”ë¡ - isProcessingResult ë¦¬ì…‹ ?œì‘');
    isProcessingResult.value = false;
    await nextTick();
    isProcessingResult.value = false; // ?´ì¤‘ ë¦¬ì…‹?¼ë¡œ ?•ì‹¤?˜ê²Œ
    console.log('?¯ [goToResult] finally ë¸”ë¡ - isProcessingResult ë¦¬ì…‹ ?„ë£Œ:', isProcessingResult.value);
  }
};

// ê¸°íš ë³€ê²½ìœ¼ë¡?ê´‘ê³  ëª¨ë‹¬ ?¬ìš©?˜ì? ?ŠìŒ
// const closeAdModal = () => {
//   showAdModal.value = false;
//   
//   // ê´‘ê³  ?íƒœ ?…ë°?´íŠ¸
//   updateAdStatus();
//   
//   if (drawMethod.value === 'random') {
//     drawCards();
//   } else if (drawMethod.value === 'manual') {
//     processManualSelection();
//   }
// };

// ?´ë?ì§€ ë¡œë“œ ?ëŸ¬ ì²˜ë¦¬ - ?µí•© ?¨ìˆ˜ ?¬ìš©
const onImageError = handleUnifiedImageError;

// ?¤í”„?ˆë“œë³??„ì¹˜ ?´ë¦„ ê°€?¸ì˜¤ê¸?const getPositionNameForSpread = (spreadId: string, index: number): string => {
  const positions = {
    'celtic_cross': [
      '?„ì¬?´ë©´',
      '?„ì¬?¸ë?', 
      'ê·¼ë³¸',
      'ê³¼ê±°',
      '?œëŸ¬?˜ëŠ” ëª¨ìŠµ',
      'ë¯¸ë˜',
      '?´ê?ë³´ëŠ”??,
      '?¨ì´ë³´ëŠ”??,
      '?ˆìƒ?˜ëŠ” ê²°ê³¼',
      '?¤ì œ ê²°ê³¼'
    ],
    'seven_star': [
      'ê·¼ì›',
      'ê³¼ê±°???í–¥',
      '?„ì¬ ?í™©',
      '?˜ì‹???Œë§',
      'ë¬´ì˜?ì  ?„ìš”',
      '?¨ê²¨ì§??í–¥',
      'ìµœì¢… ê²°ê³¼'
    ],
    'cup_of_relationship': [
      '?˜ì˜ ë§ˆìŒ',
      '?ë???ë§ˆìŒ',
      'ê³¼ê±°???¸ì—°',
      '?„ì¬??ê´€ê³?,
      'ë¯¸ë˜??ê°€?¥ì„±',
      'ê´€ê³„ì˜ ?¥ì• ë¬?,
      '?°ì£¼??ì¡°ì–¸'
    ],
    'three_card_timeline': [
      'ê³¼ê±°',
      '?„ì¬',
      'ë¯¸ë˜'
    ],
    'one_card': [
      '?µì‹¬ ë©”ì‹œì§€'
    ]
  };
  
  return positions[spreadId]?.[index] || `?„ì¹˜ ${index + 1}`;
};

// ?°ì•  ?íƒœ ê´€???¸ë“¤???œê±°??- ReadingSelect?ì„œ ì²˜ë¦¬

// ? ë£Œ ë°°ì—´ ?˜ë£¨ 1???œí•œ ?ˆë‚´
const showPremiumSpreadLimit = async () => {
  console.log('?’µ [showPremiumSpreadLimit] ?¸ì¶œ??);
  const spreadNames = {
    'celtic_cross': 'ì¼ˆí‹± ?¬ë¡œ??,
    'seven_star': '?¸ë¸ ?¤í?',
    'cup_of_relationship': 'ì»??¤ë¸Œ ë¦´ë ˆ?´ì…˜??
  };
  
  const spreadId = tarotStore.selectedSpread?.spreadId || '';
  const spreadName = spreadNames[spreadId] || '? ë£Œ ë°°ì—´';
  console.log('?’µ [showPremiumSpreadLimit] spreadId:', spreadId);
  console.log('?’µ [showPremiumSpreadLimit] spreadName:', spreadName);
  
  // ?ŒìŠ¤??ê³„ì •?¸ì? ?•ì¸
  const isTestAccount = userStore.currentUser?.email === 'test@example.com';
  console.log('?’µ [showPremiumSpreadLimit] isTestAccount:', isTestAccount);
  
  if (isTestAccount) {
    console.log('?§ª [showPremiumSpreadLimit] ?ŒìŠ¤??ê³„ì • - ? ë£Œ ë°°ì—´ ?œí•œ ?†ì´ ì§„í–‰');
    // ?ŒìŠ¤??ê³„ì •?€ ê·¸ëƒ¥ ì§„í–‰ (???¨ìˆ˜ê°€ ?¸ì¶œ?˜ë©´ ?ˆë˜ì§€ë§??ì‹œ?¼ë„)
    await drawCards();
    return;
  }
  
  // ?¬ìš© ê°€?¥í•œ ?œê°„ ê³„ì‚°
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
  
  await showAlert({
    title: '? ë£Œ ë°°ì—´ ?¬ìš© ?œí•œ',
    message: `${spreadName} ë°°ì—´ë²•ì? ?˜ë£¨????ë²ˆë§Œ ?¬ìš©?????ˆìŠµ?ˆë‹¤.\n\n?¤ìŒ ?¬ìš© ê°€???œê°„: ${hoursUntilReset}?œê°„ ${minutesUntilReset}ë¶???n\n?’¡ ë¬´ë£Œ ë°°ì—´ë²?1?? 3???€ ê´‘ê³  ?œì²­?¼ë¡œ ë¬´ì œ???´ìš© ê°€?¥í•©?ˆë‹¤!`
  });
  
  // ?½ê¸° ? íƒ ?”ë©´?¼ë¡œ ?Œì•„ê°€ê¸?  router.push('/reading-select');
};

// ë¬´ë£Œ ?ê´˜ ?íƒœ ?•ì¸ (ê¸°íš ë³€ê²½ìœ¼ë¡???ƒ true)
const checkFreeReadingStatus = () => {
  // ë¬´ë£Œ ?¬ìš©?ë„ ê´‘ê³  ?œì²­?¼ë¡œ ë¬´ì œ??ê°€??  return true;
};
</script>

<style scoped>
.card-drawing {
  height: 100dvh;
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top));
  padding-bottom: calc(20px + var(--app-safe-bottom));
  /* ëª¨ë°”?¼ì—??ì¢Œìš° ?œë˜ê·?ë°©ì? */
  overflow-x: hidden;
  overflow-y: hidden;
  width: 100%;
  max-width: 100vw;
  position: relative;
  /* ?°ì¹˜ ?¤í¬ë¡?ìµœì ??*/
  -webkit-overflow-scrolling: touch;
  /* ë°”ìš´???¨ê³¼ ë°©ì? */
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

/* .free-usage-indicator ?¤í????œê±° */

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
  /* ëª¨ë°”?¼ì—???ˆë¹„ ?œí•œ */
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
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
  margin-bottom: 10px; /* ?¬ë°± ì¤„ì„ */
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
  padding-top: calc(20px + env(safe-area-inset-top));
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
  padding-top: calc(20px + env(safe-area-inset-top));
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

/* ì¹´ë“œ ë½‘ê¸° ë°©ì‹ ? íƒ */
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

/* ì§ì ‘ ? íƒ ëª¨ë“œ */
.manual-selection-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.selected-cards-preview {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 10px 0; /* ?¬ë°± ì¤„ì„ */
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
  height: 250px; /* ?’ì´ ??ì¤„ì„ */
  margin: 10px 0; /* ?¬ë°± ì¤„ì„ */
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
  width: 40px; /* ?¬ê¸° ??ì¤„ì„ */
  height: 60px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 1px solid rgba(255, 255, 255, 0.2); /* ?Œë‘ë¦??ê»˜ ì¤„ì„ */
  border-radius: 4px; /* ?¥ê·¼ ëª¨ì„œë¦????‘ê²Œ */
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
  border-width: 2px; /* ? íƒ??ì¹´ë“œ???Œë‘ë¦?ì¤„ì„ */
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.spread-card.selected .card-back-small {
  color: #4C1D95; /* ? íƒ??ì¹´ë“œ???„ì´ì½???ë³€ê²?*/
}

.spread-card.selected:hover {
  transform: translate(-50%, -50%) translateY(-20px) scale(1.2) !important;
}

.spread-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-back-small {
  font-size: 16px; /* ?„ì´ì½??¬ê¸° ??ì¤„ì„ */
  color: rgba(255, 255, 255, 0.8);
}

.confirm-button {
  margin-top: 10px; /* ë§ˆì§„ ì¤„ì„ */
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
    height: 220px; /* ëª¨ë°”?¼ì—????ì¤„ì„ */
  }
  
  .spread-card {
    width: 30px; /* ëª¨ë°”?¼ì—?????‘ê²Œ */
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
  
  /* ëª¨ë°”?¼ì—???´ì„ ë³´ê¸° ë²„íŠ¼ ë§ˆì§„ ì¡°ì • */
  .celtic-cross-mode .result-button,
  .seven-star-mode .result-button,
  .cup-relationship-mode .result-button {
    margin-top: 60px;
  }
}

/* ìº˜í‹± ?¬ë¡œ??ëª¨ë“œ ?¤í???*/
.card-drawing.celtic-cross-mode {
  background: radial-gradient(ellipse at center, rgba(88, 28, 135, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #0F0C29 0%, #24243e 100%);
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

/* ?¹ë³„ ?ˆì´?„ì›ƒ ì»¨í…Œ?´ë„ˆ */
.seven-star-container,
.cup-relationship-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* ?¸ë¸ ?¤í? ëª¨ë“œ ?¤í???*/
.card-drawing.seven-star-mode {
  background: radial-gradient(ellipse at center, rgba(25, 25, 112, 0.3) 0%, transparent 70%),
              linear-gradient(180deg, #000428 0%, #004e92 100%);
}

/* ì»??¤ë¸Œ ë¦´ë ˆ?´ì…˜??ëª¨ë“œ ?¤í???*/
.card-drawing.cup-relationship-mode {
  background: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 70%),
              linear-gradient(180deg, #2D1B69 0%, #0F3443 100%);
}

/* ìº˜í‹± ?¬ë¡œ??ëª¨ë“œ?ì„œ ê²°ê³¼ ë²„íŠ¼ ?¤í???*/
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

/* ê³µí†µ ?¡ì…˜ ë²„íŠ¼ ?¤í???*/
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









