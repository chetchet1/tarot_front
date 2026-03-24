<template>
  <div class="reading-result">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>점괘 해석</h1>
    </header>

    <div class="container" v-if="reading">
      <!-- 점괘 정보 표시 -->
      <section class="reading-info-section">
        <div class="reading-info-grid">
          <div class="info-item">
            <span class="info-label">테마</span>
            <span class="info-value">{{ displayTheme }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">배열법</span>
            <span class="info-value">{{ displaySpread }}</span>
          </div>
        </div>
      </section>
      
      <!-- 질문 표시 (커스텀 질문 또는 테마별 기본 질문) -->
      <section class="custom-question-section">
        <h2>📌 {{ customQuestion ? '당신의 질문' : '오늘의 질문' }}</h2>
        <div class="custom-question-content">
          <p>{{ displayQuestion }}</p>
        </div>
      </section>

      <!-- 카드 배열 이미지만 표시 -->
      <section class="cards-layout-section">
        <h2>카드 배열</h2>
        
        <!-- 세븐 스타 레이아웃 -->
        <div v-if="reading.spreadId === 'seven_star'" class="seven-star-layout">
          <div class="cards-container">
            <!-- Position 1: 핵심 (중앙) -->
            <div class="card-position star-position-1">
              <div class="card-mini" :class="reading.cards[0].orientation">
                <img :src="getCardImageUrl(reading.cards[0])" 
                     :alt="reading.cards[0].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[0].orientation === 'reversed' }" />
                <span class="position-label">1</span>
              </div>
            </div>
            
            <!-- Position 2: 도움 (위) -->
            <div class="card-position star-position-2">
              <div class="card-mini" :class="reading.cards[1].orientation">
                <img :src="getCardImageUrl(reading.cards[1])" 
                     :alt="reading.cards[1].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[1].orientation === 'reversed' }" />
                <span class="position-label">2</span>
              </div>
            </div>
            
            <!-- Position 3: 내면 (오른쪽 위) -->
            <div class="card-position star-position-3">
              <div class="card-mini" :class="reading.cards[2].orientation">
                <img :src="getCardImageUrl(reading.cards[2])" 
                     :alt="reading.cards[2].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[2].orientation === 'reversed' }" />
                <span class="position-label">3</span>
              </div>
            </div>
            
            <!-- Position 4: 예상 (오른쪽) -->
            <div class="card-position star-position-4">
              <div class="card-mini" :class="reading.cards[3].orientation">
                <img :src="getCardImageUrl(reading.cards[3])" 
                     :alt="reading.cards[3].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[3].orientation === 'reversed' }" />
                <span class="position-label">4</span>
              </div>
            </div>
            
            <!-- Position 5: 결과 (오른쪽 아래) -->
            <div class="card-position star-position-5">
              <div class="card-mini" :class="reading.cards[4].orientation">
                <img :src="getCardImageUrl(reading.cards[4])" 
                     :alt="reading.cards[4].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[4].orientation === 'reversed' }" />
                <span class="position-label">5</span>
              </div>
            </div>
            
            <!-- Position 6: 외부 (왼쪽 아래) -->
            <div class="card-position star-position-6">
              <div class="card-mini" :class="reading.cards[5].orientation">
                <img :src="getCardImageUrl(reading.cards[5])" 
                     :alt="reading.cards[5].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[5].orientation === 'reversed' }" />
                <span class="position-label">6</span>
              </div>
            </div>
            
            <!-- Position 7: 운명 (왼쪽) -->
            <div class="card-position star-position-7">
              <div class="card-mini" :class="reading.cards[6].orientation">
                <img :src="getCardImageUrl(reading.cards[6])" 
                     :alt="reading.cards[6].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[6].orientation === 'reversed' }" />
                <span class="position-label">7</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 컵 오브 릴레이션십 레이아웃 -->
        <div v-else-if="reading.spreadId === 'cup_of_relationship'" class="cup-relationship-layout">
          <div class="cards-container">
            <!-- Position 1: 나 (왼쪽 아래) -->
            <div class="card-position cup-position-1">
              <div class="card-mini" :class="reading.cards[0].orientation">
                <img :src="getCardImageUrl(reading.cards[0])" 
                     :alt="reading.cards[0].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[0].orientation === 'reversed' }" />
                <span class="position-label">1</span>
              </div>
            </div>
            
            <!-- Position 2: 상대 (오른쪽 아래) -->
            <div class="card-position cup-position-2">
              <div class="card-mini" :class="reading.cards[1].orientation">
                <img :src="getCardImageUrl(reading.cards[1])" 
                     :alt="reading.cards[1].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[1].orientation === 'reversed' }" />
                <span class="position-label">2</span>
              </div>
            </div>
            
            <!-- Position 3: 관계 기본 (하단 중앙) -->
            <div class="card-position cup-position-3">
              <div class="card-mini" :class="reading.cards[2].orientation">
                <img :src="getCardImageUrl(reading.cards[2])" 
                     :alt="reading.cards[2].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[2].orientation === 'reversed' }" />
                <span class="position-label">3</span>
              </div>
            </div>
            
            <!-- Position 4: 관계 과거 (왼쪽 중간) -->
            <div class="card-position cup-position-4">
              <div class="card-mini" :class="reading.cards[3].orientation">
                <img :src="getCardImageUrl(reading.cards[3])" 
                     :alt="reading.cards[3].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[3].orientation === 'reversed' }" />
                <span class="position-label">4</span>
              </div>
            </div>
            
            <!-- Position 5: 현재 느낌 (중앙) -->
            <div class="card-position cup-position-5">
              <div class="card-mini" :class="reading.cards[4].orientation">
                <img :src="getCardImageUrl(reading.cards[4])" 
                     :alt="reading.cards[4].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[4].orientation === 'reversed' }" />
                <span class="position-label">5</span>
              </div>
            </div>
            
            <!-- Position 6: 현재 외부 상황 (오른쪽 중간) -->
            <div class="card-position cup-position-6">
              <div class="card-mini" :class="reading.cards[5].orientation">
                <img :src="getCardImageUrl(reading.cards[5])" 
                     :alt="reading.cards[5].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[5].orientation === 'reversed' }" />
                <span class="position-label">6</span>
              </div>
            </div>
            
            <!-- Position 7: 현재 나는 어떻게 생각? (왼쪽) -->
            <div class="card-position cup-position-7">
              <div class="card-mini" :class="reading.cards[6].orientation">
                <img :src="getCardImageUrl(reading.cards[6])" 
                     :alt="reading.cards[6].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[6].orientation === 'reversed' }" />
                <span class="position-label">7</span>
              </div>
            </div>
            
            <!-- Position 8: 현재 상대는 어떻게 생각? (오른쪽) -->
            <div class="card-position cup-position-8">
              <div class="card-mini" :class="reading.cards[7].orientation">
                <img :src="getCardImageUrl(reading.cards[7])" 
                     :alt="reading.cards[7].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[7].orientation === 'reversed' }" />
                <span class="position-label">8</span>
              </div>
            </div>
            
            <!-- Position 9: 미래 나는 어떻게 생각? (왼쪽 상단) -->
            <div class="card-position cup-position-9">
              <div class="card-mini" :class="reading.cards[8].orientation">
                <img :src="getCardImageUrl(reading.cards[8])" 
                     :alt="reading.cards[8].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[8].orientation === 'reversed' }" />
                <span class="position-label">9</span>
              </div>
            </div>
            
            <!-- Position 10: 미래 상대는 어떻게 생각? (오른쪽 상단) -->
            <div class="card-position cup-position-10">
              <div class="card-mini" :class="reading.cards[9].orientation">
                <img :src="getCardImageUrl(reading.cards[9])" 
                     :alt="reading.cards[9].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[9].orientation === 'reversed' }" />
                <span class="position-label">10</span>
              </div>
            </div>
            
            <!-- Position 11: 결과 (상단 중앙) -->
            <div class="card-position cup-position-11">
              <div class="card-mini" :class="reading.cards[10].orientation">
                <img :src="getCardImageUrl(reading.cards[10])" 
                     :alt="reading.cards[10].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[10].orientation === 'reversed' }" />
                <span class="position-label">11</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 켈틱 크로스 레이아웃 -->
        <div v-else-if="reading.spreadId === 'celtic_cross'" class="celtic-cross-layout">
          <div class="cards-container">
            <!-- Position 1: 현재내면 (중앙) -->
            <div class="card-position position-1">
              <div class="card-mini" :class="reading.cards[0].orientation">
                <img :src="getCardImageUrl(reading.cards[0])" 
                     :alt="reading.cards[0].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[0].orientation === 'reversed' }" />
                <span class="position-label">1</span>
              </div>
            </div>
            
            <!-- Position 2: 현재외부 (중앙, 위에 겹침) -->
            <div class="card-position position-2">
              <div class="card-mini" :class="reading.cards[1].orientation">
                <img :src="getCardImageUrl(reading.cards[1])" 
                     :alt="reading.cards[1].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[1].orientation === 'reversed' }" />
                <span class="position-label">2</span>
              </div>
            </div>
            
            <!-- Position 3: 근본 (아래) -->
            <div class="card-position position-3">
              <div class="card-mini" :class="reading.cards[2].orientation">
                <img :src="getCardImageUrl(reading.cards[2])" 
                     :alt="reading.cards[2].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[2].orientation === 'reversed' }" />
                <span class="position-label">3</span>
              </div>
            </div>
            
            <!-- Position 4: 과거 (왼쪽) -->
            <div class="card-position position-4">
              <div class="card-mini" :class="reading.cards[3].orientation">
                <img :src="getCardImageUrl(reading.cards[3])" 
                     :alt="reading.cards[3].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[3].orientation === 'reversed' }" />
                <span class="position-label">4</span>
              </div>
            </div>
            
            <!-- Position 5: 드러나는 모습 (위) -->
            <div class="card-position position-5">
              <div class="card-mini" :class="reading.cards[4].orientation">
                <img :src="getCardImageUrl(reading.cards[4])" 
                     :alt="reading.cards[4].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[4].orientation === 'reversed' }" />
                <span class="position-label">5</span>
              </div>
            </div>
            
            <!-- Position 6: 미래 (오른쪽) -->
            <div class="card-position position-6">
              <div class="card-mini" :class="reading.cards[5].orientation">
                <img :src="getCardImageUrl(reading.cards[5])" 
                     :alt="reading.cards[5].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[5].orientation === 'reversed' }" />
                <span class="position-label">6</span>
              </div>
            </div>
            
            <!-- Position 7: 내가보는나 -->
            <div class="card-position position-7">
              <div class="card-mini" :class="reading.cards[6].orientation">
                <img :src="getCardImageUrl(reading.cards[6])" 
                     :alt="reading.cards[6].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[6].orientation === 'reversed' }" />
                <span class="position-label">7</span>
              </div>
            </div>
            
            <!-- Position 8: 남이보는나 -->
            <div class="card-position position-8">
              <div class="card-mini" :class="reading.cards[7].orientation">
                <img :src="getCardImageUrl(reading.cards[7])" 
                     :alt="reading.cards[7].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[7].orientation === 'reversed' }" />
                <span class="position-label">8</span>
              </div>
            </div>
            
            <!-- Position 9: 예상하는 결과 -->
            <div class="card-position position-9">
              <div class="card-mini" :class="reading.cards[8].orientation">
                <img :src="getCardImageUrl(reading.cards[8])" 
                     :alt="reading.cards[8].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[8].orientation === 'reversed' }" />
                <span class="position-label">9</span>
              </div>
            </div>
            
            <!-- Position 10: 실제 결과 -->
            <div class="card-position position-10">
              <div class="card-mini" :class="reading.cards[9].orientation">
                <img :src="getCardImageUrl(reading.cards[9])" 
                     :alt="reading.cards[9].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[9].orientation === 'reversed' }" />
                <span class="position-label">10</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 기본 카드 그리드 (다른 스프레드) -->
        <div v-else class="cards-grid">
          <div 
            v-for="(card, index) in reading.cards" 
            :key="index"
            class="card-display"
          >
            <div class="card-image">
              <img :src="getCardImageUrl(card)" 
                   :alt="card.nameKr || card.name" 
                   @error="onImageError" 
                   :class="{ reversed: card.orientation === 'reversed' }" />
            </div>
            <div class="card-name">{{ card.nameKr || card.name }}</div>
            <div class="card-orientation" :class="card.orientation">
              {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
            </div>
          </div>
        </div>
      </section>

      <!-- 기본 해석 (1장, 3장 배열) -->
      <section v-if="(reading.spreadId === 'one_card' || reading.spreadId === 'three_card_timeline') && reading.overallMessage" class="basic-interpretation-section">
        <h2>🔮 점괘 해석</h2>
        <div class="basic-interpretation-content">
          <p>{{ reading.overallMessage }}</p>
        </div>
        
        <!-- 각 카드별 해석 -->
        <div class="card-interpretations" v-if="reading.cards">
          <div v-for="(card, index) in reading.cards" :key="index" class="card-interpretation-item">
            <h3>
              <span class="position-name">{{ card.position?.name || getPositionName(reading.spreadId, index) }}</span>
              - {{ card.nameKr || card.name }}
            </h3>
            <p class="orientation-status" :class="card.orientation">
              {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
            </p>
            <div class="interpretation-text">
              <p v-if="card.interpretation?.basic">{{ card.interpretation.basic }}</p>
              <p v-else>{{ getCardMeaning(card, reading.topic) }}</p>
            </div>
          </div>
        </div>
        
        <!-- AI 해석 버튼 -->
        <div v-if="!reading.aiInterpretation" class="ai-interpretation-cta">
          <button 
            class="crystal-ball-button" 
            @click="userStore.isPremium ? generateAIInterpretation() : showAIInterpretationWithAd()"
          >
            <span class="crystal-icon">🔮</span>
            <span class="button-text">마법의 수정구로 깊은 통찰 보기</span>
            <span class="sparkle-effect">✨</span>
          </button>
          <p class="cta-description">카드에 숨겨진 비밀스러운 메시지를 발견해보세요</p>
        </div>
        
        <!-- AI 해석 로딩 -->
        <div v-else-if="isLoadingInterpretation" class="ai-interpretation-loading">
          <div class="loading-spinner"></div>
          <p>AI가 당신의 카드를 분석하고 있습니다...</p>
        </div>
        
        <!-- AI 해석 결과 -->
        <div v-else-if="reading.aiInterpretation" class="ai-interpretation-result">
          <h3>✨ 수정구슬의 신비로운 통찰</h3>
          <div class="ai-content">
            <p>{{ reading.aiInterpretation }}</p>
          </div>
        </div>
      </section>

      <!-- AI 해석 (프리미엄 배열법) -->
      <section v-if="(reading.spreadId === 'celtic_cross' || reading.spreadId === 'seven_star' || reading.spreadId === 'cup_of_relationship')" class="ai-interpretation-section">
        <h2>✨ 해석 전문</h2>
        
        <!-- 로딩 상태 -->
        <div v-if="isLoadingInterpretation" class="ai-loading-content">
          <div class="loading-spinner"></div>
          <p>AI가 당신의 카드를 분석하고 있습니다...</p>
        </div>
        
        <!-- 캘틱 크로스의 카테고리별 해석 -->
        <div v-else-if="reading.spreadId === 'celtic_cross' && hasCelticCategories()" class="ai-interpretation-categories">
          <!-- 핵심 메시지 -->
          <div v-if="getCelticCategory('핵심메시지')" class="category-section core-message">
            <h3>🔮 핵심 메시지</h3>
            <div class="category-content">
              <p>{{ getCelticCategory('핵심메시지') }}</p>
            </div>
          </div>
          
          <!-- 심층 분석 -->
          <div v-if="getCelticCategory('심층분석')" class="category-section deep-analysis">
            <h3>📖 심층 분석</h3>
            <div class="category-content">
              <p>{{ getCelticCategory('심층분석') }}</p>
            </div>
          </div>
          
          <!-- 실천 조언 -->
          <div v-if="getCelticCategory('실천조언')" class="category-section action-advice">
            <h3>✨ 실천 조언</h3>
            <div class="category-content">
              <p>{{ getCelticCategory('실천조언') }}</p>
            </div>
          </div>
        </div>
        
        <!-- 기존 해석 내용 (캘틱 크로스가 아니거나 카테고리가 없는 경우) -->
        <div v-else-if="getAIInterpretationText()" class="ai-interpretation-content">
          <p>{{ getAIInterpretationText() }}</p>
        </div>
        
        <!-- 무료 사용자용 AI 해석 버튼 (해석이 없는 경우) -->
        <div v-else-if="!reading.aiInterpretation && !reading.enhancedInterpretation && !reading.improvedInterpretation" class="ai-interpretation-cta">
          <button 
            class="crystal-ball-button" 
            @click="generatePremiumAIInterpretation()"
          >
            <span class="crystal-icon">🔮</span>
            <span class="button-text">AI 해석 생성하기</span>
            <span class="sparkle-effect">✨</span>
          </button>
          <p class="cta-description">카드에 숨겨진 깊은 의미를 AI가 분석합니다</p>
        </div>
        
        <!-- 해석 생성 중 에러 -->
        <div v-else class="ai-interpretation-pending">
          <p>해석을 준비 중입니다...</p>
        </div>
        
      </section>



      <!-- 액션 버튼 -->
      <section class="actions">
        <button class="btn btn-share" @click="shareReading">
          📤 결과 공유하기
        </button>
        <button class="btn btn-primary" @click="newReading">
          새로운 점괘 보기
        </button>
        <button class="btn btn-secondary" @click="goHome">
          홈으로 돌아가기
        </button>
      </section>
    </div>

    <!-- 로딩 또는 에러 상태 -->
    <div class="container" v-else>
      <div class="error-state">
        <h2>😕 점괘를 찾을 수 없습니다</h2>
        <p>점괘 데이터가 없거나 만료되었습니다.</p>
        <button class="btn btn-primary" @click="goHome">
          홈으로 돌아가기
        </button>
      </div>
    </div>
    
    <!-- AI 해석 로딩 화면 -->
    <TarotLoadingScreen 
      :isVisible="isLoadingInterpretation" 
      :progress="interpretationProgress"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTarotStore } from '../store/tarot';
import { useUserStore } from '../store/user';
import { generateAIInterpretation as generateAI } from '../services/ai/aiInterpretationHelper';
import { showConfirm, showAlert } from '../utils/alerts';
import { adService } from '../services/AdService';
import { getUnifiedCardImagePath, handleUnifiedImageError } from '../utils/unifiedCardImage';
import { useSubscriptionStatus } from '../composables/useSubscriptionStatus';
import { AIInterpretationService } from '../services/ai/AIInterpretationService';
import { logger } from '../services/debugLogger';
// 공유 기능을 위한 import
import { supabase } from '../services/supabase';
import TarotLoadingScreen from '../components/loading/TarotLoadingScreen.vue';
import type { DrawnCard } from '../models/tarot';
import { getThemeQuestion, getThemeDisplayName, getSpreadDisplayName } from '../utils/themeQuestions';

const router = useRouter();
const route = useRoute();
const tarotStore = useTarotStore();
const userStore = useUserStore();
const { isSubscribed, showAds } = useSubscriptionStatus();

const readingId = computed(() => {
  return route.query.readingId as string || route.params.readingId as string;
});

const reading = computed(() => {
  if (!readingId.value) {
    // readingId가 없으면 currentReading 사용
    console.log('[ReadingResult] readingId 없음, currentReading 사용');
    return tarotStore.currentReading;
  }
  
  // 먼저 store의 readings 배열에서 찾기
  const readingFromStore = tarotStore.getReadingById(readingId.value);
  
  // 찾아지면 사용, 없으면 currentReading 사용
  const result = readingFromStore || tarotStore.currentReading;
  
  console.log('[ReadingResult] reading computed:', {
    readingId: readingId.value,
    foundInStore: !!readingFromStore,
    currentReading: !!tarotStore.currentReading,
    hasAiInterpretation: !!result?.aiInterpretation
  });
  
  return result;
});

// 커스텀 질문 가져오기
const customQuestion = computed(() => {
  return tarotStore.getCustomQuestion();
});

// 테마와 서브테마 가져오기
const selectedTheme = computed(() => {
  return tarotStore.selectedTheme || reading.value?.topic || 'general';
});

const selectedSubTheme = computed(() => {
  // 컵 오브 릴레이션십은 항상 couple
  if (reading.value?.spreadId === 'cup_of_relationship') {
    return 'couple';
  }
  return tarotStore.getSelectedSubTheme() || null;
});

// 표시용 테마 이름
const displayTheme = computed(() => {
  return getThemeDisplayName(selectedTheme.value, selectedSubTheme.value);
});

// 표시용 배열법 이름
const displaySpread = computed(() => {
  return getSpreadDisplayName(reading.value?.spreadId || '');
});

// 표시할 질문 (커스텀 질문 또는 테마별 기본 질문)
const displayQuestion = computed(() => {
  // 컵 오브 릴레이션십인 경우 특별한 메시지 표시
  if (reading.value?.spreadId === 'cup_of_relationship') {
    return '💕 우리의 관계에 대하여';
  }
  
  if (customQuestion.value) {
    return customQuestion.value;
  }
  
  const themeQuestion = getThemeQuestion(selectedTheme.value, selectedSubTheme.value);
  return themeQuestion?.question || '오늘 나에게 필요한 메시지는 무엇일까요?';
});


// AI 해석 로딩 상태
const isLoadingInterpretation = ref(false);
const interpretationProgress = ref(0);

// 카드 이미지 URL 생성 함수 사용
const getCardImageUrl = (card: DrawnCard) => {
  // 통합 함수 사용 (DB ID 기반 정확한 매핑)
  return getUnifiedCardImagePath(card);
};
const onImageError = (event: Event) => handleUnifiedImageError(event);

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/app');
};

const newReading = () => {
  router.push('/reading-select');
};

// 공유 관련 헬퍼 함수들
const getPositionName = (spreadId: string, index: number): string => {
  const positions: Record<string, string[]> = {
    'three_card_timeline': ['과거', '현재', '미래'],
    'celtic_cross': [
      '현재 내면', '현재 외부', '근본', '과거',
      '드러나는 모습', '미래', '내가 보는 나',
      '남이 보는 나', '예상하는 결과', '실제 결과'
    ],
    'seven_star': [
      '핵심', '도움', '내면', '예상', '결과', '외부', '운명'
    ],
    'cup_of_relationship': [
      '나', '상대', '관계 기본', '관계 과거',
      '현재 느낌', '현재 외부 상황',
      '현재 나는 어떻게 생각?', '현재 상대는 어떻게 생각?',
      '미래 나는 어떻게 생각?', '미래 상대는 어떻게 생각?',
      '결과'
    ]
  };
  return positions[spreadId]?.[index] || `카드 ${index + 1}`;
};

const createShareLink = async (reading: any): Promise<string> => {
  try {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    
    // AI 해석 가져오기 - aiInterpretation 또는 enhancedInterpretation 사용
    let aiInterpretationText = null;
    
    // 먼저 aiInterpretation 확인
    if (reading.aiInterpretation) {
      aiInterpretationText = reading.aiInterpretation;
    }
    // enhancedInterpretation 확인 (세븐스타, 컵오브릴레이션십 등)
    else if (reading.enhancedInterpretation) {
      if (typeof reading.enhancedInterpretation === 'object') {
        // 객체인 경우 적절한 필드 선택
        aiInterpretationText = reading.enhancedInterpretation.aiInterpretation || 
                               reading.enhancedInterpretation.overallMessage || 
                               reading.enhancedInterpretation.summary || 
                               JSON.stringify(reading.enhancedInterpretation);
      } else if (typeof reading.enhancedInterpretation === 'string') {
        aiInterpretationText = reading.enhancedInterpretation;
      }
    }
    
    // 테마와 서브테마 정보 추가
    // 컵 오브 릴레이션십은 항상 couple
    let theme = tarotStore.selectedTheme || reading.topic || 'general';
    let subTheme = tarotStore.getSelectedSubTheme() || null;
    
    // 컵 오브 릴레이션십인 경우 강제 설정
    if (reading.spreadId === 'cup_of_relationship') {
      theme = 'love';
      subTheme = 'couple';
    }
    
    console.log('🎯 [createShareLink] Theme info:', { theme, subTheme });
    
    const shareData = {
      spread_type: reading.spreadId,
      cards: reading.cards.map((card: any) => {
        // 카드 전체 데이터 출력 (디버깅용)
        console.log('🔍 [createShareLink] Full card data:', JSON.stringify(card, null, 2));
        
        // 데이터베이스 ID 찾기 - 카드의 고유 식별자
        let dbId: number | undefined;
        
        // 1. card.id가 있고 숫자인 경우 (DB에서 온 ID)
        if (card.id !== undefined && card.id !== null) {
          dbId = typeof card.id === 'number' ? card.id : Number(card.id);
          console.log('🔍 Using card.id:', dbId);
        }
        // 2. cardNumber가 있는 경우 (이미 DB ID로 변환된 값)
        else if (card.cardNumber !== undefined && card.cardNumber !== null) {
          dbId = Number(card.cardNumber);
          console.log('🔍 Using cardNumber:', dbId);
        }
        // 3. arcana와 number로 DB ID 계산
        else if (card.arcana && card.number !== undefined) {
          if (card.arcana === 'major') {
            dbId = card.number; // 메이저: 0-21
            console.log('🔍 Major arcana - using number:', dbId);
          } else if (card.arcana === 'minor' && card.suit) {
            const suitLower = card.suit.toLowerCase();
            
            // 코트카드와 숫자 카드를 구분하여 처리
            if (card.number >= 11 && card.number <= 14) {
              // 코트카드 (Page=11, Knight=12, Queen=13, King=14)
              // 올바른 DB ID 매핑 (cups와 wands가 바뀌어 있었음을 수정)
              const courtCardOffsets: Record<string, Record<number, number>> = {
                'cups': { 11: 32, 12: 33, 13: 34, 14: 35 },      // Page of Cups = 32
                'pentacles': { 11: 36, 12: 37, 13: 38, 14: 39 },  // Page of Pentacles = 36  
                'swords': { 11: 40, 12: 41, 13: 42, 14: 43 },     // Page of Swords = 40
                'wands': { 11: 44, 12: 45, 13: 46, 14: 47 }       // Page of Wands = 44
              };
              
              if (courtCardOffsets[suitLower] && courtCardOffsets[suitLower][card.number]) {
                dbId = courtCardOffsets[suitLower][card.number];
                console.log(`🔍 Court card - suit: ${suitLower}, number: ${card.number}, DB ID: ${dbId}`);
              }
            } else {
              // 숫자 카드 (1-10)  
              const suitOffsets: Record<string, number> = {
                'cups': 22,       // Ace of Cups = 22
                'pentacles': 48,  // Ace of Pentacles = 48
                'swords': 58,     // Ace of Swords = 58
                'wands': 68       // Ace of Wands = 68
              };
              const offset = suitOffsets[suitLower];
              if (offset !== undefined) {
                dbId = offset + (card.number - 1);
                console.log(`🔍 Number card - suit: ${suitLower}, number: ${card.number}, DB ID: ${dbId}`);
              }
            }
          }
        }
        
        // DB ID를 찾지 못한 경우 기본값
        if (dbId === undefined || isNaN(dbId)) {
          console.warn('❌ Could not determine DB ID for card:', card);
          dbId = 0; // The Fool as fallback
        }
        
        console.log('🎴 Mapping card for sharing:', {
          originalCard: card,
          resolvedDbId: dbId,
          name: card.name,
          nameKr: card.nameKr,
          arcana: card.arcana,
          suit: card.suit,
          number: card.number
        });
        
        return {
          cardNumber: dbId,  // DB ID를 cardNumber 필드에 저장
          nameKr: card.nameKr || card.name_kr || '',
          name: card.name || '',
          orientation: card.orientation || 'upright',
          position: card.position
        };
      }),
      custom_question: reading.customQuestion || displayQuestion.value,
      basic_interpretation: reading.overallMessage || null,
      ai_interpretation: aiInterpretationText,
      shared_by: reading.userId || null,
      theme: theme,
      sub_theme: subTheme
    };
    
    console.log('Creating share link with data:', shareData);
    
    const { data, error } = await supabase
      .from('shared_readings')
      .insert(shareData)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating share:', error);
      throw error;
    }
    
    const shareUrl = `${baseUrl}/s/${data.id}`;
    console.log('Share URL created:', shareUrl);
    return shareUrl;
    
  } catch (error) {
    console.error('공유 링크 생성 실패:', error);
    throw error;
  }
};

const generateShareMessage = (reading: any, shareUrl: string): string => {
  let message = '🔮 타로 점괘 결과를 공유합니다\n\n';
  
  // 테마 정보 추가
  const theme = reading.topic || tarotStore.selectedTheme || 'general';
  const subTheme = tarotStore.selectedSubTheme || null;
  const themeDisplay = getThemeDisplayName(theme, subTheme);
  message += `🎯 테마: ${themeDisplay}\n`;
  
  // 배열법 정보
  const spreadDisplay = getSpreadDisplayName(reading.spreadId);
  message += `📋 배열법: ${spreadDisplay}\n\n`;
  
  // 질문 (커스텀 또는 테마별 기본 질문)
  const question = reading.customQuestion || displayQuestion.value;
  message += `❓ 질문: ${question}\n\n`;
  
  message += '🎴 뽑은 카드:\n';
  reading.cards.forEach((card: any, index: number) => {
    const position = card.position?.name || getPositionName(reading.spreadId, index);
    const orientation = card.orientation === 'reversed' ? '(역)' : '';
    message += `${index + 1}. ${position}: ${card.nameKr || card.name}${orientation}\n`;
  });
  
  // AI 해석 미리보기 추가
  const aiText = getAIInterpretationText();
  if (aiText) {
    message += '\n✨ 수정구슬의 신비로운 통찰\n';
    const preview = aiText.substring(0, 100).trim();
    message += `${preview}...\n`;
  }
  
  message += `\n👉 자세한 해석 보기\n${shareUrl}\n\n`;
  message += '🎯 나만의 타로 - 매일 무료 타로 점';
  
  return message;
};



// 공유 기능
const shareReading = async () => {
  try {
    if (!reading.value) {
      await showAlert({
        title: '알림',
        message: '공유할 점괘 정보가 없습니다.'
      });
      return;
    }

    // Reading 객체에 userId 추가
    const readingWithUser = {
      ...reading.value,
      userId: userStore.currentUser?.id || null,
      customQuestion: customQuestion.value || null
    };

    // 공유 링크 생성
    const shareUrl = await createShareLink(readingWithUser);

    // 공유 메시지 생성
    const shareMessage = generateShareMessage(
      readingWithUser,
      shareUrl
    );

    // 동적으로 shareUtils import
    const { shareWithNative, initializeShare } = await import('../utils/shareUtils');
    await initializeShare();
    
    // 네이티브 공유 실행
    const shared = await shareWithNative(
      '타로 점괘 결과',
      shareMessage,
      shareUrl
    );

    if (!shared) {
      // 클립보드 복사의 경우
      await showAlert({
        title: '공유 준비 완료',
        message: '링크가 클립보드에 복사되었습니다. 원하는 곳에 붙여넣기 하세요.'
      });
    }
  } catch (error) {
    console.error('공유 실패:', error);
    await showAlert({
      title: '공유 실패',
      message: '공유 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};


// 캘틱 크로스 카테고리별 해석 관련 헬퍼 함수들
const hasCelticCategories = () => {
  if (!reading.value || reading.value.spreadId !== 'celtic_cross') {
    return false;
  }
  
  const interpretation = reading.value.aiInterpretation || reading.value.enhancedInterpretation;
  if (!interpretation || typeof interpretation !== 'string') {
    return false;
  }
  
  // 카테고리 키워드 확인
  return interpretation.includes('핵심메시지:') || 
         interpretation.includes('심층분석:') || 
         interpretation.includes('실천조언:');
};

const getCelticCategory = (category: string) => {
  if (!reading.value) return null;
  
  const interpretation = reading.value.aiInterpretation || reading.value.enhancedInterpretation;
  if (!interpretation || typeof interpretation !== 'string') {
    return null;
  }
  
  // 카테고리별 텍스트 추출
  const lines = interpretation.split('\n');
  let inCategory = false;
  let categoryContent = [];
  const categoryPrefix = category + ':';
  
  for (const line of lines) {
    // 현재 카테고리 시작
    if (line.trim().startsWith(categoryPrefix)) {
      inCategory = true;
      const content = line.replace(categoryPrefix, '').trim();
      if (content) {
        categoryContent.push(content);
      }
      continue;
    }
    
    // 다른 카테고리 시작 (현재 카테고리 종료)
    if (inCategory && (line.includes('핵심메시지:') || 
                       line.includes('심층분석:') || 
                       line.includes('실천조언:'))) {
      break;
    }
    
    // 현재 카테고리 내용 추가
    if (inCategory && line.trim()) {
      categoryContent.push(line.trim());
    }
  }
  
  return categoryContent.length > 0 ? categoryContent.join('\n') : null;
};



// AI 해석 텍스트 가져오기 (세븐스타, 컵오브릴레이션십의 enhancedInterpretation 지원)
const getAIInterpretationText = () => {
  if (!reading.value) return null;
  
  // 먼저 aiInterpretation 확인
  if (reading.value.aiInterpretation) {
    console.log('🔍 [getAIInterpretationText] aiInterpretation 사용');
    return reading.value.aiInterpretation;
  }
  
  // enhancedInterpretation 확인 (세븐스타, 컵오브릴레이션십)
  if (reading.value.enhancedInterpretation) {
    console.log('🔍 [getAIInterpretationText] enhancedInterpretation 발견');
    
    // enhancedInterpretation이 객체인 경우
    if (typeof reading.value.enhancedInterpretation === 'object') {
      // aiInterpretation 필드가 있는 경우
      if (reading.value.enhancedInterpretation.aiInterpretation) {
        console.log('🔍 [getAIInterpretationText] enhancedInterpretation.aiInterpretation 사용');
        return reading.value.enhancedInterpretation.aiInterpretation;
      }
      // overallMessage, summary 등 다른 필드 확인
      if (reading.value.enhancedInterpretation.overallMessage) {
        console.log('🔍 [getAIInterpretationText] enhancedInterpretation.overallMessage 사용');
        return reading.value.enhancedInterpretation.overallMessage;
      }
      if (reading.value.enhancedInterpretation.summary) {
        console.log('🔍 [getAIInterpretationText] enhancedInterpretation.summary 사용');
        return reading.value.enhancedInterpretation.summary;
      }
    }
    // enhancedInterpretation이 문자열인 경우
    else if (typeof reading.value.enhancedInterpretation === 'string') {
      console.log('🔍 [getAIInterpretationText] enhancedInterpretation 문자열 사용');
      return reading.value.enhancedInterpretation;
    }
  }
  
  console.log('🔍 [getAIInterpretationText] 해석 없음');
  return null;
};

// 카드 의미 가져오기
const getCardMeaning = (card: DrawnCard, topic: string) => {
  if (card.meanings && card.meanings[topic]) {
    return card.meanings[topic][card.orientation];
  } else if (card.meanings && card.meanings.general) {
    return card.meanings.general[card.orientation];
  }
  return `${card.nameKr || card.name} 카드가 ${card.orientation === 'upright' ? '정방향' : '역방향'}으로 나왔습니다.`;
};

// 프리미엄 사용자를 위한 AI 해석 생성
const generateAIInterpretation = async () => {
  console.log('🅰️ [generateAIInterpretation] 시작');
  console.log('🅰️ reading.value:', reading.value);
  console.log('🅰️ spreadId:', reading.value?.spreadId);
  console.log('🅰️ 기존 aiInterpretation:', !!reading.value?.aiInterpretation);
  
  if (!reading.value) {
    console.log('🅰️ reading.value가 없어서 종료');
    return;
  }
  
  if (reading.value.aiInterpretation) {
    console.log('🅰️ 이미 AI 해석이 존재하여 종료');
    return;
  }
  
  isLoadingInterpretation.value = true;
  interpretationProgress.value = 0;
  
  // 프로그레스 업데이트 시뮬레이션
  const progressInterval = setInterval(() => {
    if (interpretationProgress.value < 90) {
      interpretationProgress.value += Math.random() * 15;
    }
  }, 500);
  
  try {
    console.log('🅰️ AI 해석 생성 요청 시작');
    
    // 프리미엄 배열법 여부 확인
    const isPremiumSpread = ['celtic_cross', 'seven_star', 'cup_of_relationship'].includes(reading.value.spreadId);
    console.log('🅰️ isPremiumSpread:', isPremiumSpread);
    
    const interpretationResult = await generateAI({
      reading: reading.value,
      customQuestion: tarotStore.getCustomQuestion(),
      isPremium: isPremiumSpread || userStore.isPremium, // 프리미엄 배열법은 항상 프리미엄 취급
      getPositionName,
      userId: userStore.currentUser?.id
    });
    
    console.log('🅰️ AI 해석 결과:', interpretationResult);
    
    // 프로그레스 완료
    clearInterval(progressInterval);
    interpretationProgress.value = 100;
    
    if (interpretationResult.success && interpretationResult.interpretation) {
      console.log('🅰️ AI 해석 저장 시작');
      reading.value.aiInterpretation = interpretationResult.interpretation;
      reading.value.aiInterpretationId = interpretationResult.interpretationId || null;
      tarotStore.updateReading(reading.value);
      console.log('🅰️ AI 해석 저장 완료');
      
      // DB에도 업데이트
      if (userStore.isPremium) {
        await saveReadingToDB();
      }
    } else {
      throw new Error('AI 해석 생성 실패');
    }
    
  } catch (error) {
    clearInterval(progressInterval);
    console.error('🅰️ AI 해석 생성 오류:', error);
    await showConfirm({
      title: '오류',
      message: 'AI 해석을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      confirmText: '확인',
      showCancel: false
    });
  } finally {
    // 잔시 대기 후 로딩 화면 숨기기
    await new Promise(resolve => setTimeout(resolve, 300));
    isLoadingInterpretation.value = false;
    interpretationProgress.value = 0;
    console.log('🅰️ [generateAIInterpretation] 종료');
  }
};


// 광고 시청 후 AI 해석 보기
const showAIInterpretationWithAd = async () => {
  console.log('🔮 [showAIInterpretationWithAd] 함수 시작');
  console.log('🔮 현재 시간:', new Date().toISOString());
  console.log('🔮 reading.value:', reading.value);
  console.log('🔮 readingId.value:', readingId.value);
  console.log('🔮 reading.aiInterpretation 존재?:', !!reading.value?.aiInterpretation);
  console.log('🔮 adService.isAdReady:', adService.isAdReady.value);
  console.log('🔮 adService.isLoading:', adService.isLoading.value);
  
  const currentReading = reading.value;
  const currentReadingId = readingId.value;
  const currentCustomQuestion = tarotStore.getCustomQuestion();
  
  if (!currentReading) {
    console.log('🔮 [showAIInterpretationWithAd] currentReading이 없어서 종료');
    return;
  }
  
  const confirmed = await showConfirm({
    title: '🔮 마법의 수정구슬',
    message: '광고를 시청하신 후 수정구슬이 당신만을 위한 특별한 메시지를 전해드립니다.\n계속하시겠습니까?',
    confirmText: '광고 보고 해석 받기',
    cancelText: '취소'
  });
  
  if (!confirmed) {
    console.log('🔮 [showAIInterpretationWithAd] 사용자가 취소함');
    return;
  }
  
  try {
    console.log('🔮 [showAIInterpretationWithAd] 광고 표시 시작...');
    console.log('🔮 광고 상태 - isAdReady:', adService.isAdReady.value, 'isLoading:', adService.isLoading.value);
    
    // 광고 로딩 중 표시 (모바일에서 로딩이 길 수 있음)
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'ad-loading-overlay';
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      pointer-events: all;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
    `;
    loadingOverlay.innerHTML = `
      <div style="text-align: center; pointer-events: none;">
        <div class="loading-spinner" style="
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <p style="margin-top: 20px;">광고를 불러오는 중...</p>
        <p style="font-size: 14px; opacity: 0.7; margin-top: 10px;">잠시만 기다려주세요</p>
        <p style="font-size: 12px; opacity: 0.5; margin-top: 5px;">처음에는 로딩이 조금 걸릴 수 있습니다</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    // 뒤로 가기 방지를 위한 이벤트 리스너
    const preventBack = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    loadingOverlay.addEventListener('click', preventBack);
    loadingOverlay.addEventListener('touchstart', preventBack);
    loadingOverlay.addEventListener('touchmove', preventBack);
    
    document.body.appendChild(loadingOverlay);
    document.body.style.overflow = 'hidden';
    
    // 먼저 광고를 보여줌
    const adWatched = await adService.showInterstitialAd();
    
    // 로딩 오버레이 제거
    if (loadingOverlay.parentElement) {
      document.body.removeChild(loadingOverlay);
      document.body.style.overflow = '';
    }
    
    console.log('🔮 [showAIInterpretationWithAd] 광고 시청 결과:', adWatched);
    console.log('🔮 광고 시청 후 상태 - isAdReady:', adService.isAdReady.value, 'isLoading:', adService.isLoading.value);
    
    if (!adWatched) {
      console.log('🔮 [showAIInterpretationWithAd] 광고 시청 실패로 종료');
      // 광고 로드 실패 시 사용자에게 알림
      await showAlert({
        title: '광고 로드 실패',
        message: '광고를 불러올 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
      });
      return;
    }
    
    // 광고 시청 후 로딩 화면 표시
    isLoadingInterpretation.value = true;
    interpretationProgress.value = 0;
    
    // 프로그레스 업데이트 시뮬레이션
    const progressInterval = setInterval(() => {
      if (interpretationProgress.value < 90) {
        interpretationProgress.value += Math.random() * 15;
      }
    }, 500);
    
    // AI 해석 생성
    const interpretationResult = await generateAI({
      reading: currentReading,
      customQuestion: currentCustomQuestion,
      isPremium: false,
      getPositionName,
      userId: userStore.currentUser?.id
    });
    
    // 프로그레스 완료
    clearInterval(progressInterval);
    interpretationProgress.value = 100;
    
    // 현재 페이지가 여전히 같은 reading을 보고 있는지 확인
    if (readingId.value !== currentReadingId) {
      console.warn('페이지가 변경되었습니다. AI 해석을 건너뜁니다.');
      return;
    }
    
    if (interpretationResult.success && interpretationResult.interpretation) {
      // 현재 reading이 여전히 동일한지 다시 확인
      const latestReading = tarotStore.getReadingById(currentReadingId) || tarotStore.getCurrentReading();
      if (latestReading && latestReading.id === currentReading.id) {
        latestReading.aiInterpretation = interpretationResult.interpretation;
        latestReading.aiInterpretationId = interpretationResult.interpretationId || null;
        tarotStore.updateReading(latestReading);
      }
    } else {
      throw new Error('AI 해석 생성 실패');
    }
    
  } catch (error) {
    console.error('AI 해석 생성 오류:', error);
    await showConfirm({
      title: '오류',
      message: 'AI 해석을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      confirmText: '확인',
      showCancel: false
    });
  } finally {
    // 잠시 대기 후 로딩 화면 숨기기
    await new Promise(resolve => setTimeout(resolve, 300));
    isLoadingInterpretation.value = false;
    interpretationProgress.value = 0;
  }
};

// AI 해석 재생성 함수
const regenerateAIInterpretation = async () => {
  if (!reading.value) return;
  
  // 프리미엄 배열법은 무료 사용자도 AI 해석 가능
  // 커스텀 질문은 프리미엄만 가능
  const isPremiumSpread = ['celtic_cross', 'seven_star', 'cup_of_relationship'].includes(reading.value.spreadId);
  const hasCustomQuestion = !!customQuestion.value;
  
  if (!isPremiumSpread && (!hasCustomQuestion || !userStore.isPremium)) {
    return;
  }
  
  isLoadingInterpretation.value = true;
  
  try {
    const interpretationResult = await generateAI({
      reading: reading.value,
      customQuestion: tarotStore.getCustomQuestion(),
      isPremium: true, // 이미 위에서 검증했으므로 여기서는 true로 설정
      getPositionName,
      userId: userStore.currentUser?.id
    });
    
    if (interpretationResult.success && interpretationResult.interpretation) {
      reading.value.aiInterpretation = interpretationResult.interpretation;
      reading.value.aiInterpretationId = interpretationResult.interpretationId || null;
      if (interpretationResult.probabilityAnalysis) {
        reading.value.probabilityAnalysis = interpretationResult.probabilityAnalysis;
      }
      tarotStore.updateReading(reading.value);
    } else {
      throw new Error('AI 해석 생성 실패');
    }
  } catch (error) {
    console.error('AI 해석 재생성 실패:', error);
    await showConfirm({
      title: '오류',
      message: 'AI 해석을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      confirmText: '확인',
      showCancel: false
    });
  } finally {
    isLoadingInterpretation.value = false;
  }
};

// 프리미엄 배열법용 AI 해석 생성 함수
const generatePremiumAIInterpretation = async () => {
  console.log('🔮 [generatePremiumAIInterpretation] 시작');
  console.log('🔮 spreadId:', reading.value?.spreadId);
  
  if (!reading.value) {
    console.log('🔮 reading.value가 없어서 종료');
    return;
  }
  
  const isPremiumSpread = ['celtic_cross', 'seven_star', 'cup_of_relationship'].includes(reading.value.spreadId);
  if (!isPremiumSpread) {
    console.log('🔮 프리미엄 배열법이 아니어서 종료');
    return;
  }
  
  // 이미 해석이 있는지 확인
  if (reading.value.aiInterpretation || reading.value.enhancedInterpretation) {
    console.log('🔮 이미 해석이 있어서 종료');
    return;
  }
  
  isLoadingInterpretation.value = true;
  interpretationProgress.value = 0;
  
  // 프로그레스 업데이트 시뮬레이션
  const progressInterval = setInterval(() => {
    if (interpretationProgress.value < 90) {
      interpretationProgress.value += Math.random() * 15;
    }
  }, 500);
  
  try {
    logger.log('AI 해석 생성 요청 시작 - AIInterpretationService 직접 호출');
    logger.log('spreadId: ' + reading.value.spreadId + ', topic: ' + (reading.value.topic || 'general'));
    logger.log('cards count: ' + reading.value.cards.length);

    // aiInterpretationHelper는 seven_star/cup_of_relationship을 차단하므로
    // AIInterpretationService를 직접 사용
    const aiService = new AIInterpretationService(true);
    const cardsForAI = reading.value.cards.map((card: any, index: number) => ({
      id: card.id,
      name: card.name || card.nameEn || '',
      name_kr: card.nameKr || card.name_kr || card.name || '',
      nameKr: card.nameKr || card.name_kr || card.name || '',
      orientation: card.orientation || 'upright',
      position: {
        position: index + 1,
        name: card.position?.name || getPositionName(reading.value!.spreadId, index)
      }
    }));

    logger.log('cardsForAI 생성 완료, Edge Function 호출 시작');
    const result = await aiService.generateInterpretation(
      cardsForAI,
      reading.value.topic || 'general',
      reading.value.spreadId
    );

    logger.log('AI 해석 결과: ' + (result ? 'text길이=' + (result.text?.length || 0) : 'null'));
    console.log('🔮 AI 해석 결과:', result);

    // 프로그레스 완료
    clearInterval(progressInterval);
    interpretationProgress.value = 100;

    if (result && result.text) {
      console.log('🔮 AI 해석 저장 시작');
      reading.value.aiInterpretation = result.text;
      reading.value.aiInterpretationId = result.interpretationId || null;
      tarotStore.updateReading(reading.value);
      console.log('🔮 AI 해석 저장 완료');

      // DB에도 업데이트
      if (userStore.isPremium) {
        await saveReadingToDB();
      }
    } else {
      throw new Error('AI 해석 생성 실패');
    }
    
  } catch (error) {
    clearInterval(progressInterval);
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('🔮 AI 해석 생성 오류:', errMsg, error);
    logger.log('AI 해석 생성 오류 상세: ' + errMsg);
    await showConfirm({
      title: '오류',
      message: 'AI 해석을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      confirmText: '확인',
      showCancel: false
    });
  } finally {
    // 잠시 대기 후 로딩 화면 숨기기
    await new Promise(resolve => setTimeout(resolve, 300));
    isLoadingInterpretation.value = false;
    interpretationProgress.value = 0;
    console.log('🔮 [generatePremiumAIInterpretation] 종료');
  }
};

// DB에 점괘 저장 함수
const saveReadingToDB = async () => {
  if (!reading.value || !userStore.isLoggedIn || !userStore.isPremium) {
    console.log('💾 점괘 저장 건너뛰기:', {
      hasReading: !!reading.value,
      isLoggedIn: userStore.isLoggedIn,
      isPremium: userStore.isPremium
    });
    return;
  }
  
  try {
    console.log('💾 DB에 점괘 저장 시작');
    
    // UUID 생성 함수
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    // reading.id가 UUID 형식이 아니면 새로운 UUID 생성
    let readingId = reading.value.id;
    if (readingId && !readingId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      readingId = generateUUID();
    } else if (!readingId) {
      readingId = generateUUID();
    }
    
    // 1. readings 테이블에 저장 (ai_interpretation_text 제거)
    const readingData = {
      id: readingId,
      user_id: userStore.currentUser?.id,
      spread_id: reading.value.spreadId,
      topic: selectedTheme.value === 'custom' ? 'general' : selectedTheme.value,  // custom은 general로 변환
      question: customQuestion.value || displayQuestion.value,
      cards: reading.value.cards,  // JSONB 필드이므로 그대로 저장
      overall_message: reading.value.overallMessage || null,
      is_premium: reading.value.isPremium || false,
      shared: false,
      tags: [],  // 태그 배열 (스키마에 정의됨)
      created_at: reading.value.createdAt || new Date().toISOString()
    };
    
    console.log('💾 저장할 readings 데이터:', readingData);
    
    // Supabase에 저장
    const { data: readingDataResult, error: readingError } = await supabase
      .from('readings')
      .upsert(readingData, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (readingError) {
      console.error('💾 readings 테이블 저장 실패:', readingError);
      return;
    }
    
    console.log('💾 readings 테이블 저장 성공:', readingDataResult);
    
    // 2. AI 해석이 있는 경우 ai_interpretations 테이블에 별도 저장
    let aiInterpretationText = null;
    
    // aiInterpretation 확인
    if (reading.value.aiInterpretation) {
      aiInterpretationText = reading.value.aiInterpretation;
    }
    // enhancedInterpretation 확인 (세븐스타, 컵오브릴레이션십)
    else if (reading.value.enhancedInterpretation) {
      if (typeof reading.value.enhancedInterpretation === 'string') {
        aiInterpretationText = reading.value.enhancedInterpretation;
      } else if (typeof reading.value.enhancedInterpretation === 'object') {
        const enhanced = reading.value.enhancedInterpretation as any;
        aiInterpretationText = enhanced.aiInterpretation || 
                              enhanced.overallMessage || 
                              enhanced.summary || 
                              enhanced.text ||
                              JSON.stringify(enhanced);
      }
    }
    // improvedInterpretation 확인
    else if (reading.value.improvedInterpretation) {
      if (typeof reading.value.improvedInterpretation === 'string') {
        aiInterpretationText = reading.value.improvedInterpretation;
      } else if (typeof reading.value.improvedInterpretation === 'object') {
        const improved = reading.value.improvedInterpretation as any;
        aiInterpretationText = improved.aiInterpretation || 
                              improved.overallMessage || 
                              improved.summary || 
                              improved.text ||
                              JSON.stringify(improved);
      }
    }
    
    // AI 해석이 있으면 ai_interpretations 테이블에 저장
    if (aiInterpretationText) {
      const aiInterpretationData = {
        user_id: userStore.currentUser?.id,
        reading_id: readingId,
        interpretation_text: aiInterpretationText,
        custom_question: customQuestion.value || null,
        probability_analysis: reading.value.probabilityAnalysis || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 저장할 AI 해석 데이터:', aiInterpretationData);
      
      const { data: aiData, error: aiError } = await supabase
        .from('ai_interpretations')
        .insert(aiInterpretationData)
        .select()
        .single();
      
      if (aiError) {
        console.error('💾 AI 해석 저장 실패:', aiError);
      } else {
        console.log('💾 AI 해석 저장 성공:', aiData);
        // AI 해석 ID 업데이트
        if (aiData && aiData.id) {
          reading.value.aiInterpretationId = aiData.id;
        }
      }
    }
    
  } catch (error) {
    console.error('💾 점괘 저장 중 오류:', error);
  }
};

onMounted(async () => {
  // 공유 기능 초기화 - shareReading 함수 내에서 동적으로 import하므로 여기서는 제거
  
  console.log('🎴 [ReadingResult] onMounted 시작');
  console.log('🎴 readingId:', readingId.value);
  console.log('🎴 reading:', reading.value);
  console.log('🎴 spreadId:', reading.value?.spreadId);
  console.log('🎴 aiInterpretation 존재?:', !!reading.value?.aiInterpretation);
  
  if (!reading.value && !readingId.value) {
    router.push('/app');
    return;
  }
  
  // 광고 프리로드는 이제 앱 시작 시점에 처리됨 (main.ts에서 adService.preloadAd() 호출)
  // 사용자가 테마와 배열을 선택하는 동안 광고가 백그라운드에서 로드됨
  
  // 프리미엄 사용자이면 DB에 저장
  if (userStore.isPremium && reading.value) {
    await saveReadingToDB();
  }
  
  // 프리미엄 배열법(seven_star, cup_of_relationship, celtic_cross)은 
  // 이미 CardDrawing.vue의 goToResult에서 AI 해석을 생성한 후 넘어오므로
  // 여기서는 절대 중복 생성하지 않음
  
  // AI 해석 생성 여부 결정
  // enhancedInterpretation이나 aiInterpretation이 이미 있는지 확인
  const hasInterpretation = !!(reading.value?.aiInterpretation || reading.value?.enhancedInterpretation);
  
  if (reading.value && !hasInterpretation) {
    const isPremiumSpread = ['celtic_cross', 'seven_star', 'cup_of_relationship'].includes(reading.value.spreadId);
    
    // 프리미엄 배열법: goToResult에서 생성 실패 시 여기서 재시도
    if (isPremiumSpread) {
      // 프리미엄 배열법인데 해석이 없는 경우 (Edge Function 실패 등)
      // 자동으로 재생성 시도
      console.log('🔮 [ReadingResult] 프리미엄 배열법 - 해석 없음, 자동 생성 시도');
      await generatePremiumAIInterpretation();
      return;
    } else if (customQuestion.value && userStore.isPremium) {
      // 커스텀 질문은 프리미엄만 (1장, 3장 배열에서만)
      console.log('🎴 [ReadingResult] 커스텀 질문 - AI 해석 생성');
      await generateAIInterpretation();
    } else {
      console.log('🎴 [ReadingResult] AI 해석 생성 건너뛰기', {
        spreadId: reading.value.spreadId,
        hasCustomQuestion: !!customQuestion.value,
        isPremium: userStore.isPremium
      });
    }
  } else {
    console.log('🎴 [ReadingResult] 이미 해석이 있음');
    console.log('🎴 [ReadingResult] 해석 텍스트:', getAIInterpretationText()?.substring(0, 100));
  }
});
</script>

<style scoped>
.reading-result {
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

.container {
  max-width: 800px;
  margin: 0 auto;
}

/* 커스텀 질문 섹션 */
/* 점괘 정보 섹션 */
.reading-info-section {
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
}

.reading-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: white;
  font-weight: 600;
  background: linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.custom-question-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.custom-question-section::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.custom-question-section h2 {
  color: #F59E0B;
  font-size: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.custom-question-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.custom-question-content p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 17px;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

/* 카드 배열 섹션 */
.cards-layout-section {
  margin-bottom: 40px;
}

.cards-layout-section h2 {
  color: #A855F7;
  margin-bottom: 25px;
  text-align: center;
  font-size: 24px;
}

/* 카드 그리드 (기본 스프레드) */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card-display {
  text-align: center;
}

.card-display .card-image {
  position: relative;
  width: 100%;
  max-width: 120px;
  margin: 0 auto;
}

.card-display .card-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card-display .card-image img.reversed {
  transform: rotate(180deg);
}

.card-display .card-name {
  margin-top: 10px;
  font-size: 14px;
  color: white;
  font-weight: 600;
}

.card-display .card-orientation {
  margin-top: 5px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.card-orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 세븐 스타 레이아웃 스타일 */
.seven-star-layout {
  position: relative;
  min-height: 500px;
  padding: 10px;
}

.seven-star-layout .cards-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 500px;
  margin: 0 auto;
}

/* 세븐 스타 카드 위치 */
.seven-star-layout .card-position {
  position: absolute;
  width: 80px;
  height: 120px;
  transition: all 0.3s ease;
}

.seven-star-layout .card-position:hover {
  z-index: 100;
}

.seven-star-layout .card-position:hover .card-mini {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

/* 세븐 스타 각 위치별 좌표 */
.seven-star-layout .star-position-1 { /* 핵심 - 중앙 */
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.seven-star-layout .star-position-2 { /* 도움 - 위 */
  top:45%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-3 { /* 내면 - 오른쪽 위 */
  top: 45%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-4 { /* 예상 - 오른쪽 */
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-5 { /* 결과 - 오른쪽 아래 */
  top: 85%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-6 { /* 외부 - 왼쪽 아래 */
  top: 85%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-7 { /* 운명 - 왼쪽 */
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 컵 오브 릴레이션십 레이아웃 스타일 */
.cup-relationship-layout {
  position: relative;
  min-height: 600px;
  padding: 10px;
}

.cup-relationship-layout .cards-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  height: 600px;
  margin: 0 auto;
}

/* 컵 오브 릴레이션십 카드 위치 */
.cup-relationship-layout .card-position {
  position: absolute;
  width: 80px;
  height: 120px;
  transition: all 0.3s ease;
}

.cup-relationship-layout .card-position:hover {
  z-index: 100;
}

.cup-relationship-layout .card-position:hover .card-mini {
  border-color: rgba(236, 72, 153, 0.8);
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.6);
}

/* 컵 오브 릴레이션십 각 위치별 좌표 */
.cup-relationship-layout .cup-position-1 { /* 나 - 왼쪽 아래 */
  top: 140%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-2 { /* 상대 - 오른쪽 아래 */
  top: 140%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-3 { /* 관계 기본 - 하단 중앙 */
  top: 140%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-4 { /* 관계 과거 - 왼쪽 중간 */
  top: 105%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-5 { /* 현재 상태 - 중앙 */
  top: 70%;
  left: 40%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.cup-relationship-layout .cup-position-6 { /* 현재 외부 상황 - 오른쪽 중간 */
  top: 65%;
  left: 60%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-7 { /* 현재 나는 어떻게 생각? - 왼쪽 */
  top: 58%;
  left: 10%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-8 { /* 현재 상대는 어떻게 생각? - 오른쪽 */
  top: 58%;
  left: 90%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-9 { /* 미래 나는 어떻게 생각? - 왼쪽 세번째 */
  top: 50%;
  left: -20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-10 { /* 미래 상대는 어떻게 생각? - 오른쪽 세번째 */
  top: 50%;
  left: 120%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-11 { /* 결과 - 상단 중앙 */
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 켈틱 크로스 레이아웃 스타일 */
.celtic-cross-layout {
  position: relative;
  min-height: 500px;
  padding: 10px 10px 5px 10px;
}

.celtic-cross-layout .cards-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 500px;
  margin: 0 auto;
}

/* 카드 위치 */
.celtic-cross-layout .card-position {
  position: absolute;
  width: 80px;
  height: 120px;
  transition: all 0.3s ease;
}

.celtic-cross-layout .card-position:hover {
  z-index: 100;
}

.celtic-cross-layout .card-position:hover .card-mini {
  border-color: rgba(168, 85, 247, 0.8);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
}

/* 각 위치별 좌표 - 간격을 좁혀서 조정 */
.celtic-cross-layout .position-1 { /* 현재내면 - 중앙 왼쪽 */
  top: 52%;
  left: calc(40% - 40px);
  transform: translate(-100%, 15%);
  z-index: 10;
}

.celtic-cross-layout .position-2 { /* 현재외부 - 중앙 오른쪽 */
  top: 50%;
  left: calc(40% + 40px);
  transform: translate(-70%, -5%);
  z-index: 10;
}

.celtic-cross-layout .position-3 { /* 근본 - 아래 */
  top: 78%;
  left: 40%;
  transform: translate(-90%, 45%);
}

.celtic-cross-layout .position-4 { /* 과거 - 왼쪽 */
  top: 50%;
  left: 8%;
  transform: translate(-120%, 5%);
}

.celtic-cross-layout .position-5 { /* 드러나는 모습 - 위 */
  top: 25%;
  left: 40%;
  transform: translate(-90%, -25%);
}

.celtic-cross-layout .position-6 { /* 미래 - 오른쪽 */
  top: 50%;
  left: 72%;
  transform: translate(-20%, 5%);
}

/* 오른쪽 기둥 - 간격 좁히기 */
.celtic-cross-layout .position-7 { /* 내가보는나 - 맨 아래 */
  top: 75%;
  left: 88%;
  transform: translate(50%, 90%);
}

.celtic-cross-layout .position-8 { /* 남이보는나 */
  top: 57%;
  left: 88%;
  transform: translate(70%, 40%);
}

.celtic-cross-layout .position-9 { /* 예상하는 결과 */
  top: 40%;
  left: 88%;
  transform: translate(50%, -10%);
}

.celtic-cross-layout .position-10 { /* 실제 결과 - 맨 위 */
  top: 22%;
  left: 88%;
  transform: translate(70%, -60%);
}

.card-mini {
  width: 80px;
  height: 120px;
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.card-mini img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.card-mini img.reversed {
  transform: rotate(180deg);
}

/* 역방향 카드 표시 - 점선 테두리로 변경 */
.card-mini.reversed {
  border-style: dashed;
  border-color: #EF4444;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.2);
}

/* 중요 카드 표시 (컵 오브 릴레이션십 특정 위치) */
.cup-relationship-layout .cup-position-5 .card-mini,
.cup-relationship-layout .cup-position-11 .card-mini {
  border: 3px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  position: relative;
}

/* 중요 카드 표시 아이콘 (컵 오브 릴레이션십) */
.cup-relationship-layout .cup-position-5 .card-mini::after,
.cup-relationship-layout .cup-position-11 .card-mini::after {
  content: '⭐';
  position: absolute;
  top: -10px;
  right: -10px;
  background: #FFD700;
  color: #1E1B4B;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;
}

/* 중요 카드 표시 (켈틱 크로스 특정 위치) */
.celtic-cross-layout .position-1 .card-mini,
.celtic-cross-layout .position-2 .card-mini,
.celtic-cross-layout .position-10 .card-mini {
  border: 3px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  position: relative;
}

/* 중요 카드 표시 아이콘 (켈틱 크로스) */
.celtic-cross-layout .position-1 .card-mini::after,
.celtic-cross-layout .position-2 .card-mini::after,
.celtic-cross-layout .position-10 .card-mini::after {
  content: '⭐';
  position: absolute;
  top: -10px;
  right: -10px;
  background: #FFD700;
  color: #1E1B4B;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;
}

/* 중요 카드 표시 (세븐 스타 특정 위치) */
.seven-star-layout .star-position-1 .card-mini,
.seven-star-layout .star-position-5 .card-mini {
  border: 3px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  position: relative;
}

/* 중요 카드 표시 아이콘 (세븐 스타) */
.seven-star-layout .star-position-1 .card-mini::after,
.seven-star-layout .star-position-5 .card-mini::after {
  content: '⭐';
  position: absolute;
  top: -10px;
  right: -10px;
  background: #FFD700;
  color: #1E1B4B;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;
}

.position-label {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(30, 27, 75, 0.9);
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 기본 해석 섹션 */
.basic-interpretation-section {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  position: relative;
  overflow: visible !important;
  animation: slideInUp 0.5s ease-out;
}

.basic-interpretation-section h2 {
  text-align: center;
  color: #6366F1;
  font-size: 28px;
  margin-bottom: 25px;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}

.basic-interpretation-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
}

.basic-interpretation-content p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.card-interpretations {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-interpretation-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.card-interpretation-item h3 {
  color: #6366F1;
  font-size: 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.position-name {
  color: #A5B4FC;
  font-weight: 600;
}

.orientation-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 15px;
}

.orientation-status.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.orientation-status.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.interpretation-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  font-size: 15px;
}

/* AI 해석 CTA 버튼 */
.ai-interpretation-cta {
  margin-top: 40px;
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%);
  border: 2px dashed rgba(245, 158, 11, 0.3);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.crystal-ball-button {
  background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
  position: relative;
  overflow: hidden;
}

.crystal-ball-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.5);
}

.crystal-ball-button:active {
  transform: translateY(-1px);
}

.crystal-icon {
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
}

.sparkle-effect {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 0.5;
    transform: translateY(-50%) scale(1);
  }
  50% { 
    opacity: 1;
    transform: translateY(-50%) scale(1.2);
  }
}

.cta-description {
  margin-top: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* AI 해석 결과 */
.ai-interpretation-result {
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 2px solid rgba(236, 72, 153, 0.3);
  border-radius: 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-interpretation-result h3 {
  color: #EC4899;
  font-size: 22px;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.ai-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.ai-content p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* AI 해석 로딩 */
.ai-interpretation-loading {
  margin-top: 40px;
  text-align: center;
  padding: 60px 20px;
}

.ai-interpretation-loading .loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(236, 72, 153, 0.2);
  border-top-color: #EC4899;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

.ai-interpretation-loading p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

/* AI 해석 카테고리별 섹션 */
.ai-interpretation-categories {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.category-section {
  padding: 25px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 핵심 메시지 섹션 */
.category-section.core-message {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 2px solid rgba(236, 72, 153, 0.4);
}

.category-section.core-message::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%);
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.category-section.core-message h3 {
  color: #EC4899;
  font-size: 22px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  text-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
}

/* 심층 분석 섹션 */
.category-section.deep-analysis {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%);
  border: 2px solid rgba(99, 102, 241, 0.4);
}

.category-section.deep-analysis::before {
  content: '';
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

.category-section.deep-analysis h3 {
  color: #6366F1;
  font-size: 22px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  text-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

/* 실천 조언 섹션 */
.category-section.action-advice {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 2px solid rgba(34, 197, 94, 0.4);
}

.category-section.action-advice::before {
  content: '';
  position: absolute;
  top: 50%;
  right: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.1); }
}

.category-section.action-advice h3 {
  color: #22C55E;
  font-size: 22px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  text-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
}

/* 카테고리 내용 스타일 */
.category-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.category-content p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 카테고리 섹션 호버 효과 */
.category-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.category-section.core-message:hover {
  box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);
}

.category-section.deep-analysis:hover {
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.category-section.action-advice:hover {
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
}

/* AI 해석 결과 섹션 */
.ai-interpretation-section {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: visible !important;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-interpretation-section::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.5; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
}

.ai-interpretation-section h2 {
  text-align: center;
  color: #A855F7;
  font-size: 28px;
  margin-bottom: 25px;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.ai-interpretation-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.ai-interpretation-content p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}


/* AI 해석 대기 상태 */
.ai-interpretation-pending {
  text-align: center;
  padding: 60px 20px;
  background: rgba(168, 85, 247, 0.05);
  border-radius: 12px;
  animation: pulse 2s ease-in-out infinite;
}

.ai-interpretation-pending p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

/* AI 해석이 없는 경우 */
.no-interpretation-section {
  margin: 40px 0;
}

.no-interpretation-card {
  background: rgba(168, 85, 247, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

.no-interpretation-card h2 {
  color: #A855F7;
  font-size: 28px;
  margin-bottom: 20px;
}

.no-interpretation-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.btn-premium {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  padding: 12px 30px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}

/* 액션 버튼 */
.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 공유 버튼 스타일 */
.btn-share {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-share:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

/* 에러 상태 */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  color: #EF4444;
  margin-bottom: 15px;
  font-size: 28px;
}

.error-state p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  font-size: 16px;
}

/* AI 로딩 상태 */
.ai-loading-content {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top-color: #A855F7;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ai-loading-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  /* 카테고리별 섹션 모바일 스타일 */
  .ai-interpretation-categories {
    gap: 20px;
  }
  
  .category-section {
    padding: 20px;
  }
  
  .category-section h3 {
    font-size: 20px;
    margin-bottom: 15px;
  }
  
  .category-content {
    padding: 15px;
  }
  
  .category-content p {
    font-size: 15px;
    line-height: 1.7;
  }
  
  /* 모바일에서 배경 애니메이션 크기 조정 */
  .category-section.core-message::before {
    width: 80px;
    height: 80px;
  }
  
  .category-section.deep-analysis::before {
    width: 100px;
    height: 100px;
  }
  
  .category-section.action-advice::before {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  /* 세븐 스타 모바일 스타일 */
  .seven-star-layout {
    min-height: 400px;
    padding: 5px;
  }
  
  .seven-star-layout .cards-container {
    height: 400px;
    transform: scale(0.7);
    transform-origin: top center;
  }
  
  /* 컵 오브 릴레이션십 모바일 스타일 */
  .cup-relationship-layout {
    min-height: 450px;
    padding: 5px;
  }
  
  .cup-relationship-layout .cards-container {
    height: 450px;
    transform: scale(0.65);
    transform-origin: top center;
  }
  
  /* 켈틱 크로스 모바일 스타일 */
  .celtic-cross-layout {
    min-height: 400px;
    padding: 5px;
  }
  
  .celtic-cross-layout .cards-container {
    height: 400px;
    transform: scale(0.75);
    transform-origin: top center;
  }
  
  /* 모바일에서 중앙 카드 위치 조정 */
  .celtic-cross-layout .position-1 {
    left: calc(40% - 25px);
  }
  
  .celtic-cross-layout .position-2 {
    left: calc(40% + 25px);
  }
  
  /* 모바일에서 상하좌우 카드 위치 조정 */
  .celtic-cross-layout .position-3 {
    top: 75%;
  }
  
  .celtic-cross-layout .position-4 {
    left: 12%;
  }
  
  .celtic-cross-layout .position-5 {
    top: 25%;
  }
  
  .celtic-cross-layout .position-6 {
    left: 60%;
  }
  
  /* 모바일에서 오른쪽 기둥 조정 - 간격 좁히기 */
  .celtic-cross-layout .position-7 {
    top: 72%;
    right: 5px;
    left: auto;
  }
  
  .celtic-cross-layout .position-8 {
    top: 54%;
    right: 5px;
    left: auto;
  }
  
  .celtic-cross-layout .position-9 {
    top: 36%;
    right: 5px;
    left: auto;
  }
  
  .celtic-cross-layout .position-10 {
    top: 18%;
    right: 5px;
    left: auto;
  }
  
  .ai-interpretation-section {
    margin: 30px 0;
    padding: 20px;
  }
  
  .ai-interpretation-section h2 {
    font-size: 24px;
  }
  
  .ai-interpretation-content {
    padding: 20px;
  }
  
  .ai-interpretation-content p {
    font-size: 15px;
  }
  
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
  
  /* AI 해석 버튼 모바일 */
  .ai-interpretation-cta {
    padding: 20px;
  }
  
  .crystal-ball-button {
    padding: 16px 30px;
    font-size: 16px;
  }
  
  .crystal-icon {
    font-size: 20px;
  }
  
  .cta-description {
    font-size: 13px;
  }
  
  .ai-interpretation-result {
    padding: 20px;
  }
  
  .ai-interpretation-result h3 {
    font-size: 20px;
  }
  
  .ai-content {
    padding: 15px;
  }
  
  .ai-content p {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .celtic-cross-layout .cards-container {
    transform: scale(0.65);
  }
  
  /* 더 작은 화면에서 카드 위치 더 조정 */
  .celtic-cross-layout .position-1 {
    left: calc(40% - 35px);
  }
  
  .celtic-cross-layout .position-2 {
    left: calc(40% + 35px);
  }
  
  /* 더 작은 화면에서 상하좌우 카드 위치 조정 */
  .celtic-cross-layout .position-3 {
    top: 78%;
  }
  
  .celtic-cross-layout .position-4 {
    left: 15%;
  }
  
  .celtic-cross-layout .position-5 {
    top: 22%;
  }
  
  .celtic-cross-layout .position-6 {
    left: 65%;
  }
  
  /* 더 작은 화면에서 오른쪽 기둥 조정 - 간격 더 좁히기 */
  .celtic-cross-layout .position-7 {
    top: 70%;
    right: 0;
  }
  
  .celtic-cross-layout .position-8 {
    top: 52%;
    right: 0;
  }
  
  .celtic-cross-layout .position-9 {
    top: 34%;
    right: 0;
  }
  
  .celtic-cross-layout .position-10 {
    top: 16%;
    right: 0;
  }
}
/* 공유 버튼 스타일 */
.btn-share {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-share:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}
</style>
