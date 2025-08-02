<template>
  <div class="reading-result">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>점괘 해석</h1>
    </header>

    <div class="container" v-if="reading">
      <!-- 커스텀 질문 표시 -->
      <section v-if="customQuestion" class="custom-question-section">
        <h2>📌 당신의 질문</h2>
        <div class="custom-question-content">
          <p>{{ customQuestion }}</p>
        </div>
      </section>

      <!-- 카드 배열 이미지만 표시 -->
      <section class="cards-layout-section">
        <h2>카드 배열</h2>
        
        <!-- 켈틱 크로스 레이아웃 -->
        <div v-if="reading.spreadId === 'celtic_cross'" class="celtic-cross-layout">
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

      <!-- AI 해석 (프리미엄 사용자 + 켈틱 크로스) -->
      <section v-if="userStore.isPremium && reading.spreadId === 'celtic_cross' && (reading.aiInterpretation || isLoadingInterpretation)" class="ai-interpretation-section">
        <h2>해석 전문</h2>
        
        <!-- 로딩 상태 -->
        <div v-if="isLoadingInterpretation" class="ai-loading-content">
          <div class="loading-spinner"></div>
          <p>AI가 당신의 카드를 분석하고 있습니다...</p>
        </div>
        
        <!-- 해석 내용 -->
        <div v-else class="ai-interpretation-content">
          <p>{{ reading.aiInterpretation }}</p>
        </div>
        
        <!-- 평점 시스템 -->
        <div class="rating-section" v-if="reading.aiInterpretationId && !userRating">
          <h4>이 해석이 도움이 되셨나요?</h4>
          <div class="star-rating">
            <button 
              v-for="i in 5" 
              :key="i"
              @click="submitRating(i)"
              class="star-btn"
              :class="{ active: hoverRating >= i || selectedRating >= i }"
              @mouseenter="hoverRating = i"
              @mouseleave="hoverRating = 0"
            >
              ⭐
            </button>
          </div>
          <p class="rating-hint">{{ getRatingHint() }}</p>
        </div>
        
        <!-- 평점 제출 후 메시지 -->
        <div class="rating-submitted" v-if="userRating">
          <p>✅ 소중한 피드백 감사합니다!</p>
        </div>
      </section>

      <!-- 프리미엄 업그레이드 안내 (켈틱 크로스가 아닌 경우) -->
      <section v-if="reading.spreadId !== 'one_card' && reading.spreadId !== 'three_card_timeline' && (!userStore.isPremium || reading.spreadId !== 'celtic_cross' || !reading.aiInterpretation)" class="no-interpretation-section">
        <div class="no-interpretation-card">
          <h2>🔮 AI 타로 해석</h2>
          <p>AI 타로 해석은 프리미엄 회원님께 켈틱 크로스 배열법에서만 제공됩니다.</p>
          <button class="btn btn-premium" @click="router.push('/premium')">
            프리미엄으로 업그레이드
          </button>
        </div>
      </section>

      <!-- 액션 버튼 -->
      <section class="actions">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTarotStore } from '../store/tarot';
import { useUserStore } from '../store/user';
import { AIInterpretationService } from '../services/ai/AIInterpretationService';
import { customInterpretationService } from '../services/ai/customInterpretationService';
import { showConfirm } from '../utils/alerts';
import { adService } from '../services/AdService';

const router = useRouter();
const route = useRoute();
const tarotStore = useTarotStore();
const userStore = useUserStore();

const readingId = computed(() => {
  return route.query.readingId as string || route.params.readingId as string;
});

const reading = computed(() => {
  if (!readingId.value) return null;
  return tarotStore.getReadingById(readingId.value) || tarotStore.getCurrentReading();
});

// 커스텀 질문 가져오기
const customQuestion = computed(() => {
  return tarotStore.getCustomQuestion();
});

// 평점 관련 상태
const hoverRating = ref(0);
const selectedRating = ref(0);
const userRating = ref(0);

// AI 해석 로딩 상태
const isLoadingInterpretation = ref(false);

// 카드 이미지 URL 생성 함수
const getCardImageUrl = (card: any) => {
  try {
    // Supabase에서 오는 imageUrl이 있다면 먼저 처리
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      // 수트 폴더가 포함된 경로를 수정
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
      // 메이저 아르카나 파일명 대소문자 수정
      if (finalUrl.includes('/assets/tarot-cards/major/')) {
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
        
        for (const [wrong, correct] of Object.entries(corrections)) {
          if (finalUrl.includes(wrong)) {
            finalUrl = finalUrl.replace(wrong, correct);
            break;
          }
        }
      }
      
      return finalUrl;
    }
    
    // 마이너 아르카나의 경우
    if (card.arcana === 'minor') {
      const cardNumber = String(card.number || 1).padStart(2, '0');
      let cardName;
      
      if (card.suit) {
        if (card.number <= 10) {
          const numberNames = {
            1: 'ace', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
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
        cardName = card.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    }
    
    // 메이저 아르카나의 경우
    if (card.arcana === 'major') {
      const majorCardNames = {
        0: '00-the-Fool.png', 1: '01-The-Magician.png', 2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png', 4: '04-The-Emperor.png', 5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png', 7: '07-The-Chariot.png', 8: '08-Strength.png',
        9: '09-The-Hermit.png', 10: '10-Wheel-of-Fortune.png', 11: '11-Justice.png',
        12: '12-The-Hanged-Man.png', 13: '13-Death.png', 14: '14-Temperance.png',
        15: '15-The-Devil.png', 16: '16-The-Tower.png', 17: '17-The-Star.png',
        18: '18-The-Moon.png', 19: '19-The-Sun.png', 20: '20-Judgement.png',
        21: '21-The-World.png'
      };
      
      const fileName = majorCardNames[card.number] || '00-the-Fool.png';
      return `/assets/tarot-cards/major/${fileName}`;
    }
    
    return '/assets/tarot-cards/major/00-the-Fool.png';
  } catch (error) {
    console.error('카드 이미지 URL 생성 오류:', error);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
};

// 이미지 로드 에러 처리
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img && img.parentElement) {
    img.style.display = 'none';
    if (!img.parentElement.querySelector('.fallback-emoji')) {
      const fallbackEmoji = document.createElement('div');
      fallbackEmoji.className = 'fallback-emoji';
      fallbackEmoji.textContent = '🎴';
      fallbackEmoji.style.cssText = `
        font-size: 48px; text-align: center; display: flex;
        align-items: center; justify-content: center;
        width: 100%; height: 100%; position: absolute;
        top: 0; left: 0; background: rgba(75, 85, 99, 0.9);
        border-radius: 6px; z-index: 10;
      `;
      img.parentElement.appendChild(fallbackEmoji);
    }
  }
};

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/app');
};

const newReading = () => {
  router.push('/reading-select');
};

// 평점 제출
const submitRating = async (rating: number) => {
  console.log('스타 클릭됨:', rating);
  console.log('현재 reading 데이터:', reading.value);
  console.log('aiInterpretationId:', reading.value?.aiInterpretationId);
  console.log('현재 userRating:', userRating.value);
  
  if (!reading.value?.aiInterpretationId || userRating.value > 0) {
    console.log('평점 제출 조건 미충족');
    return;
  }
  
  selectedRating.value = rating;
  userRating.value = rating;
  
  try {
    console.log('평점 제출 시작...');
    const aiService = new AIInterpretationService(userStore.isPremium);
    await aiService.submitRating(reading.value.aiInterpretationId, rating);
    console.log('평점 제출 성공:', rating);
  } catch (error) {
    console.error('평점 제출 오류:', error);
    // 오류 발생 시에도 UI는 업데이트된 상태로 유지
  }
};

// 평점 힌트 텍스트
const getRatingHint = () => {
  const rating = hoverRating.value || selectedRating.value;
  if (rating === 0) return '별점을 클릭해주세요';
  if (rating === 1) return '전혀 도움이 되지 않았어요';
  if (rating === 2) return '별로 도움이 되지 않았어요';
  if (rating === 3) return '보통이에요';
  if (rating === 4) return '도움이 되었어요';
  if (rating === 5) return '매우 도움이 되었어요!';
  return '';
};

// 포지션 이름 가져오기
const getPositionName = (spreadId: string, index: number) => {
  if (spreadId === 'one_card') {
    return '조언';
  } else if (spreadId === 'three_card_timeline') {
    const positions = ['과거', '현재', '미래'];
    return positions[index] || '';
  }
  return '';
};

// 카드 의미 가져오기
const getCardMeaning = (card: any, topic: string) => {
  if (card.meanings && card.meanings[topic]) {
    return card.meanings[topic][card.orientation];
  } else if (card.meanings && card.meanings.general) {
    return card.meanings.general[card.orientation];
  }
  return `${card.nameKr || card.name} 카드가 ${card.orientation === 'upright' ? '정방향' : '역방향'}으로 나왔습니다.`;
};

// 프리미엄 사용자를 위한 AI 해석 생성
const generateAIInterpretation = async () => {
  console.log('🔮 AI 심층 해석 생성 (프리미엄)');
  
  if (!reading.value || reading.value.aiInterpretation) return;
  
  isLoadingInterpretation.value = true;
  
  try {
    const customQuestion = tarotStore.getCustomQuestion();
    const aiService = new AIInterpretationService(true); // 프리미엄 사용자
      
    let interpretationResult;
      
    if (customQuestion) {
      // 커스텀 질문이 있는 경우
      const interpretationRequest = {
        readingId: reading.value.id,
        cards: reading.value.cards.map((card: any, index: number) => ({
          id: card.id,
          name: card.name || card.nameEn || '',
          nameKr: card.nameKr || card.name_kr || card.name || '',
          arcana: card.arcana || 'unknown',
          suit: card.suit || null,
          number: card.number || null,
          orientation: card.orientation || 'upright',
          position: {
            name: card.position?.name || getPositionName(reading.value.spreadId, index),
            description: card.position?.description || ''
          },
          meanings: card.meanings || {}
        })),
        spreadId: reading.value.spreadId,
        topic: reading.value.topic,
        customQuestion: customQuestion,
        userId: userStore.user?.id
      };
      
      interpretationResult = await customInterpretationService.generateInterpretation(interpretationRequest);
    } else {
      // 기본 해석 (1장/3장)
      const cardsForAI = reading.value.cards.map((card: any, index: number) => ({
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
          name: getPositionName(reading.value.spreadId, index)
        }
      }));
      
      const result = await aiService.generateInterpretation(
        cardsForAI,
        reading.value.topic || 'general',
        reading.value.spreadId
      );
        
      interpretationResult = {
        success: result && result.text,
        interpretation: result?.text,
        interpretationId: result?.interpretationId
      };
    }
    
    if (interpretationResult.success && interpretationResult.interpretation) {
      reading.value.aiInterpretation = interpretationResult.interpretation;
      reading.value.aiInterpretationId = interpretationResult.interpretationId || null;
      tarotStore.updateReading(reading.value);
      console.log('✅ AI 해석 생성 완료');
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
    isLoadingInterpretation.value = false;
  }
};


// 광고 시청 후 AI 해석 보기
const showAIInterpretationWithAd = async () => {
  console.log('🔮 수정구슬로 더 깊이 보기 클릭');
  
  // 현재 reading을 캐시에 저장
  const currentReading = reading.value;
  const currentReadingId = readingId.value;
  const currentCustomQuestion = tarotStore.getCustomQuestion();
  
  if (!currentReading) {
    console.error('현재 읽기가 없습니다');
    return;
  }
  
  const confirmed = await showConfirm({
    title: '🔮 마법의 수정구슬',
    message: '광고를 시청하신 후 수정구슬이 당신만을 위한 특별한 메시지를 전해드립니다.\n계속하시겠습니까?',
    confirmText: '광고 보고 해석 받기',
    cancelText: '취소'
  });
  
  if (!confirmed) return;
  
  try {
    // AI 해석 생성을 미리 시작 (비동기)
    const aiService = new AIInterpretationService(false); // 무료 사용자
    
    // AI 해석 Promise 생성 (광고와 동시 진행)
    const aiInterpretationPromise = (async () => {
      console.log('🤖 AI 해석 미리 생성 시작...');
    
      let interpretationResult;
    
      if (currentCustomQuestion) {
        // 커스텀 질문이 있는 경우
        const interpretationRequest = {
          readingId: currentReading.id,
          cards: currentReading.cards.map((card: any, index: number) => ({
            id: card.id,
            name: card.name || card.nameEn || '',
            nameKr: card.nameKr || card.name_kr || card.name || '',
            arcana: card.arcana || 'unknown',
            suit: card.suit || null,
            number: card.number || null,
            orientation: card.orientation || 'upright',
            position: {
              name: card.position?.name || getPositionName(currentReading.spreadId, index),
              description: card.position?.description || ''
            },
            meanings: card.meanings || {}
          })),
          spreadId: currentReading.spreadId,
          topic: currentReading.topic,
          customQuestion: currentCustomQuestion,
          userId: userStore.user?.id
        };
        
        interpretationResult = await customInterpretationService.generateInterpretation(interpretationRequest);
      } else {
        // 기본 해석 (1장/3장)
        const cardsForAI = currentReading.cards.map((card: any, index: number) => ({
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
            name: getPositionName(currentReading.spreadId, index)
          }
        }));
        
        const result = await aiService.generateInterpretation(
          cardsForAI,
          currentReading.topic || 'general',
          currentReading.spreadId
        );
        
        interpretationResult = {
          success: result && result.text,
          interpretation: result?.text,
          interpretationId: result?.interpretationId
        };
      }
      
      return interpretationResult;
    })();
    
    // 광고 시청과 AI 해석 생성을 동시에 진행
    console.log('📺 광고 시청 시작...');
    const [adWatched, interpretationResult] = await Promise.all([
      adService.showInterstitialAd(),
      aiInterpretationPromise
    ]);
    
    if (!adWatched) {
      console.log('광고 시청이 완료되지 않았습니다.');
      return;
    }
    
    console.log('✅ 광고 시청 완료');
    
    // 현재 페이지가 여전히 같은 reading을 보고 있는지 확인
    if (readingId.value !== currentReadingId) {
      console.warn('페이지가 변경되었습니다. AI 해석을 건너뜁니다.');
      return;
    }
    
    // 로딩 화면 표시 (광고 후 잠시 보여주기)
    isLoadingInterpretation.value = true;
    
    // 최소 로딩 시간 보장 (사용자 경험 향상)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (interpretationResult.success && interpretationResult.interpretation) {
      // 현재 reading이 여전히 동일한지 다시 확인
      const latestReading = tarotStore.getReadingById(currentReadingId) || tarotStore.getCurrentReading();
      if (latestReading && latestReading.id === currentReading.id) {
        latestReading.aiInterpretation = interpretationResult.interpretation;
        latestReading.aiInterpretationId = interpretationResult.interpretationId || null;
        tarotStore.updateReading(latestReading);
        console.log('✅ AI 해석 표시 완료');
      } else {
        console.warn('Reading이 변경되었습니다. AI 해석을 건너뜁니다.');
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
    isLoadingInterpretation.value = false;
  }
};

// AI 해석 재생성 함수
const regenerateAIInterpretation = async () => {
  if (!reading.value || !userStore.isPremium) return;
  
  console.log('🔄 AI 해석 재생성 시작...');
  isLoadingInterpretation.value = true;
  
  try {
    const customQuestion = tarotStore.getCustomQuestion();
    const aiService = new AIInterpretationService(userStore.isPremium);
    
    if (customQuestion) {
      // 커스텀 질문이 있는 경우
      const interpretationRequest = {
        readingId: reading.value.id,
        cards: reading.value.cards.map((card: any, index: number) => ({
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
        spreadId: reading.value.spreadId,
        topic: reading.value.topic,
        customQuestion: customQuestion,
        userId: userStore.user?.id
      };

      const interpretationResult = await customInterpretationService.generateInterpretation(interpretationRequest);
      
      if (interpretationResult.success && interpretationResult.interpretation) {
        reading.value.aiInterpretation = interpretationResult.interpretation;
        reading.value.aiInterpretationId = interpretationResult.interpretationId || null;
        if (interpretationResult.probabilityAnalysis) {
          reading.value.probabilityAnalysis = interpretationResult.probabilityAnalysis;
        }
        tarotStore.updateReading(reading.value);
      }
    } else if (reading.value.spreadId === 'celtic_cross') {
      // 켈틱 크로스 해석
      const cardsForAI = reading.value.cards.map((card: any, index: number) => ({
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
      
      const result = await aiService.generateInterpretation(
        cardsForAI,
        reading.value.topic || 'love',
        'celtic_cross'
      );
      
      if (result && result.text) {
        reading.value.aiInterpretation = result.text;
        reading.value.aiInterpretationId = result.interpretationId || null;
        tarotStore.updateReading(reading.value);
      }
    }
  } catch (error) {
    console.error('AI 해석 재생성 실패:', error);
  } finally {
    isLoadingInterpretation.value = false;
  }
};

onMounted(async () => {
  console.log('ReadingResult 마운트됨');
  console.log('readingId:', readingId.value);
  console.log('reading:', reading.value);
  console.log('프리미엄 상태:', userStore.isPremium);
  console.log('스프레드 ID:', reading.value?.spreadId);
  console.log('커스텀 질문:', customQuestion.value);
  
  if (!reading.value && !readingId.value) {
    console.warn('점괘 데이터가 없습니다. 홈으로 리다이렉트');
    router.push('/app');
    return;
  }
  
  // AI 해석이 있는지 확인
  if (reading.value && reading.value.aiInterpretation) {
    console.log('========== AI 해석 디버깅 ==========');
    console.log('AI 해석 전체 길이:', reading.value.aiInterpretation.length);
    console.log('AI 해석 처음 100자:', reading.value.aiInterpretation.substring(0, 100));
    console.log('AI 해석 ID:', reading.value.aiInterpretationId);
    console.log('===================================');
  } else if (reading.value && userStore.isPremium && 
           (reading.value.spreadId === 'celtic_cross' || customQuestion.value)) {
    // 프리미엄 사용자이고 켈틱 크로스이거나 커스텀 질문이 있는데 AI 해석이 없는 경우
    console.log('🤖 AI 해석이 없어서 재생성 시도...');
    await regenerateAIInterpretation();
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
  transform: scale(1.05);
  z-index: 100;
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

.card-mini.reversed {
  border-color: #DC2626;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
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

/* 평점 시스템 스타일 */
.rating-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.rating-section h4 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  font-weight: 500;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: grayscale(100%) opacity(0.5);
  padding: 5px;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.active {
  filter: grayscale(0%) opacity(1);
  transform: scale(1.1);
  animation: starPulse 0.3s ease;
}

@keyframes starPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

.rating-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  height: 20px;
  transition: all 0.2s ease;
}

.rating-submitted {
  margin-top: 25px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 12px;
  text-align: center;
  animation: slideInUp 0.5s ease-out;
}

.rating-submitted p {
  color: #22C55E;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
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
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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
  
  .star-btn {
    font-size: 28px;
  }
  
  .rating-hint {
    font-size: 13px;
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
</style>
