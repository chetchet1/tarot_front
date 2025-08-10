<template>
  <div class="shared-reading">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>점괘를 불러오는 중...</p>
    </div>
    
    <!-- 만료된 경우 -->
    <div v-else-if="expired" class="expired-state">
      <div class="container">
        <div class="expired-content">
          <div class="expired-icon">⏰</div>
          <h2>공유 기간이 만료되었습니다</h2>
          <p>공유된 점괘는 24시간 동안만 확인 가능합니다.</p>
          <button @click="goToApp" class="cta-button">
            🔮 직접 점괘 보러 가기
          </button>
        </div>
      </div>
    </div>
    
    <!-- 정상 표시 -->
    <div v-else-if="sharedData" class="reading-content">
      <!-- 헤더 -->
      <header class="share-header">
        <h1>🔮 공유된 타로 점괘</h1>
        <p class="share-info">
          공유일: {{ formatDate(sharedData.created_at) }}
        </p>
      </header>
      
      <!-- 읽기 전용 리딩 컨텐츠 -->
      <div class="container">
        <!-- 커스텀 질문 표시 -->
        <section v-if="sharedData.custom_question" class="custom-question-section">
          <h2>📌 질문</h2>
          <div class="custom-question-content">
            <p>{{ sharedData.custom_question }}</p>
          </div>
        </section>

        <!-- 카드 배열 표시 -->
        <section class="cards-layout-section">
          <h2>카드 배열</h2>
          
          <!-- 켈틱 크로스 레이아웃 -->
          <div v-if="sharedData.spread_type === 'celtic_cross'" class="celtic-cross-layout">
            <div class="cards-container">
              <div 
                v-for="(card, index) in sharedData.cards" 
                :key="index"
                :class="`card-position position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <img :src="getCardImageUrl(card)" 
                       :alt="card.nameKr" 
                       @error="onImageError"
                       :class="{ reversed: card.orientation === 'reversed' }" />
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 오늘의 카드 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'daily_card'" class="daily-card-layout">
          <div class="card-display">
            <div class="card-image">
              <img :src="getCardImageUrl(sharedData.cards[0])" 
                   :alt="sharedData.cards[0].nameKr" 
                   @error="onImageError"
                   :class="{ reversed: sharedData.cards[0].orientation === 'reversed' }" />
            </div>
            <div class="card-name">{{ sharedData.cards[0].nameKr }}</div>
            <div class="card-orientation" :class="sharedData.cards[0].orientation">
              {{ sharedData.cards[0].orientation === 'upright' ? '정방향' : '역방향' }}
            </div>
          </div>
        </div>
        
        <!-- 기본 카드 그리드 -->
        <div v-else class="cards-grid">
            <div 
              v-for="(card, index) in sharedData.cards" 
              :key="index"
              class="card-display"
            >
              <div class="card-image">
                <img :src="getCardImageUrl(card)" 
                     :alt="card.nameKr" 
                     @error="onImageError"
                     :class="{ reversed: card.orientation === 'reversed' }" />
              </div>
              <div class="card-name">{{ card.nameKr }}</div>
              <div class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </div>
            </div>
          </div>
        </section>

        <!-- 해석 표시 -->
        <section v-if="sharedData.basic_interpretation || sharedData.ai_interpretation" class="interpretation-section">
          <h2>🔮 점괘 해석</h2>
          
          <!-- 기본 해석 -->
          <div v-if="sharedData.basic_interpretation" class="basic-interpretation-content">
            <p>{{ sharedData.basic_interpretation }}</p>
          </div>
          
          <!-- AI 해석 -->
          <div v-if="sharedData.ai_interpretation" class="ai-interpretation-result">
          <h3>✨ 수정구슬의 신비로운 통찰</h3>
          <div class="ai-content">
          <!-- 오늘의 카드의 경우 -->
            <div v-if="sharedData.spread_type === 'daily_card'">
              <!-- 파싱된 해석이 있는 경우 -->
              <div v-if="parsedDailyInterpretation">
                <!-- 운세 지수 -->
              <div class="fortune-section">
                <h4>📊 오늘의 운세 지수</h4>
                <div class="fortune-grid">
                  <div v-for="(value, key) in parsedDailyInterpretation.fortuneIndex" :key="key" class="fortune-item">
                    <span class="fortune-label">{{ getFortuneLabel(key) }}</span>
                    <div class="star-rating">
                      <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= value }">⭐</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 상세 운세 -->
              <div v-if="parsedDailyInterpretation.detailedFortune" class="detailed-section">
                <h4>🔮 상세 운세</h4>
                <p>{{ parsedDailyInterpretation.detailedFortune.mainMessage }}</p>
                <div class="advice-box">
                  <p><strong>💫 핵심 포인트:</strong> {{ parsedDailyInterpretation.detailedFortune.keyPoint }}</p>
                  <p><strong>⚡ 주의할 점:</strong> {{ parsedDailyInterpretation.detailedFortune.caution }}</p>
                  <p><strong>🌟 행운의 순간:</strong> {{ parsedDailyInterpretation.detailedFortune.luckyMoment }}</p>
                </div>
              </div>
              
              <!-- 행운 아이템 -->
              <div v-if="parsedDailyInterpretation.luckyItems" class="lucky-section">
                <h4>🍀 오늘의 행운 아이템</h4>
                <div class="lucky-grid">
                  <div class="lucky-item">
                    <span class="lucky-label">색상</span>
                    <span class="lucky-value">{{ parsedDailyInterpretation.luckyItems.color }}</span>
                  </div>
                  <div class="lucky-item">
                    <span class="lucky-label">숫자</span>
                    <span class="lucky-value">{{ parsedDailyInterpretation.luckyItems.number }}</span>
                  </div>
                  <div class="lucky-item">
                    <span class="lucky-label">방향</span>
                    <span class="lucky-value">{{ parsedDailyInterpretation.luckyItems.direction }}</span>
                  </div>
                  <div class="lucky-item">
                    <span class="lucky-label">활동</span>
                    <span class="lucky-value">{{ parsedDailyInterpretation.luckyItems.activity }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 오늘의 격언 -->
              <div v-if="parsedDailyInterpretation.dailyQuote" class="quote-section">
                <h4>💬 오늘의 격언</h4>
                <blockquote class="daily-quote">
                  "{{ parsedDailyInterpretation.dailyQuote }}"
                </blockquote>
              </div>
              </div>
              
              <!-- 파싱 실패 시 원본 텍스트 표시 -->
              <div v-else class="fallback-interpretation">
                <p>{{ sharedData.ai_interpretation }}</p>
              </div>
            </div>
            
            <!-- 일반 해석 (오늘의 카드가 아닌 경우) -->
            <p v-else>{{ sharedData.ai_interpretation }}</p>
          </div>
        </div>
        </section>
      </div>
      
      <!-- CTA 섹션 -->
      <section class="cta-section">
        <div class="container">
          <h2>✨ 나도 점괘를 봐볼까요?</h2>
          <p>무료로 타로 카드를 뽑고 AI 해석을 받아보세요!</p>
          <button @click="goToApp" class="primary-cta">
            🎴 무료로 시작하기
          </button>
        </div>
      </section>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else class="error-state">
      <div class="container">
        <div class="error-content">
          <div class="error-icon">😕</div>
          <h2>점괘를 찾을 수 없습니다</h2>
          <p>잘못된 링크이거나 이미 삭제된 점괘입니다.</p>
          <button @click="goToApp" class="cta-button">
            🔮 직접 점괘 보러 가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../services/supabase';
import { getCardImagePath, handleImageError } from '../utils/cardUtils';

const route = useRoute();
const router = useRouter();
const shareId = route.params.id as string;

const loading = ref(true);
const expired = ref(false);
const sharedData = ref<any>(null);

console.log('🎭 [SharedReading Component] Created with shareId:', shareId);
console.log('🎭 [SharedReading Component] Full route:', {
  path: route.path,
  params: route.params,
  query: route.query
});

// 컴포넌트가 생성되었음을 전역 객체에 저장 (디버그용)
if (typeof window !== 'undefined') {
  (window as any).__SHARED_READING_LOADED__ = true;
  (window as any).__SHARED_READING_ID__ = shareId;
}

onBeforeMount(() => {
  console.log('🎭 [SharedReading] onBeforeMount - shareId:', shareId);
});

// 오늘의 카드 AI 해석 파싱
const parsedDailyInterpretation = computed(() => {
  if (sharedData.value?.spread_type === 'daily_card' && sharedData.value?.ai_interpretation) {
    try {
      console.log('🔍 AI 해석 데이터 타입:', typeof sharedData.value.ai_interpretation);
      
      // JSON 문자열인 경우 파싱
      if (typeof sharedData.value.ai_interpretation === 'string') {
        const trimmed = sharedData.value.ai_interpretation.trim();
        
        // JSON 형태인지 확인 ({}로 시작하고 끝나는지)
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            console.log('✅ JSON 파싱 성공');
            
            // 파싱된 객체가 올바른 구조를 가지고 있는지 확인
            if (parsed && typeof parsed === 'object' && 
                (parsed.fortuneIndex || parsed.detailedFortune || parsed.luckyItems)) {
              return parsed;
            } else {
              console.warn('⚠️ 파싱된 객체가 예상된 구조가 아님:', Object.keys(parsed));
              return null;
            }
          } catch (parseError) {
            console.error('❌ JSON 파싱 실패:', parseError);
            console.error('❌ 파싱 실패한 데이터 첫 200자:', trimmed.substring(0, 200));
            return null;
          }
        } else {
          // JSON이 아닌 일반 텍스트
          console.log('ℹ️ JSON 형태가 아닌 일반 텍스트');
          return null;
        }
      }
      
      // 이미 객체인 경우 그대로 반환
      console.log('✅ 이미 객체 형태');
      return sharedData.value.ai_interpretation;
    } catch (error) {
      console.error('❌ 오늘의 카드 해석 처리 중 오류:', error);
      return null;
    }
  }
  return null;
});

// 운세 라벨 가져오기
const getFortuneLabel = (key: string) => {
  const labels: Record<string, string> = {
    overall: '전체운',
    love: '애정운',
    money: '금전운',
    health: '건강운',
    work: '학업/업무운'
  };
  return labels[key] || key;
};

// 카드 이미지 URL 생성 (cardNumber 기반)
const getCardImageUrl = (card: any) => {
  // cardNumber로 메이저/마이너 판별
  const cardNum = card.cardNumber || 0;
  
  // 메이저 아르카나 (0-21)
  if (cardNum <= 21) {
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
    
    const fileName = majorCardNames[cardNum as keyof typeof majorCardNames] || '00-the-Fool.png';
    return `/assets/tarot-cards/major/${fileName}`;
  }
  
  // 마이너 아르카나 (22-77)
  // Wands: 22-35, Cups: 36-49, Swords: 50-63, Pentacles: 64-77
  const minorCardMap: Record<number, string> = {
    // Wands
    22: '01-ace-of-wands.png', 23: '02-two-of-wands.png', 24: '03-three-of-wands.png',
    25: '04-four-of-wands.png', 26: '05-five-of-wands.png', 27: '06-six-of-wands.png',
    28: '07-seven-of-wands.png', 29: '08-eight-of-wands.png', 30: '09-nine-of-wands.png',
    31: '10-ten-of-wands.png', 32: '11-Page-of-Wands.png', 33: '12-Knight-of-Wands.png',
    34: '13-Queen-of-Wands.png', 35: '14-King-of-Wands.png',
    // Cups
    36: '01-ace-of-cups.png', 37: '02-two-of-cups.png', 38: '03-three-of-cups.png',
    39: '04-four-of-cups.png', 40: '05-five-of-cups.png', 41: '06-six-of-cups.png',
    42: '07-seven-of-cups.png', 43: '08-eight-of-cups.png', 44: '09-nine-of-cups.png',
    45: '10-ten-of-cups.png', 46: '11-Page-of-Cups.png', 47: '12-Knight-of-Cups.png',
    48: '13-Queen-of-Cups.png', 49: '14-King-of-Cups.png',
    // Swords
    50: '01-ace-of-swords.png', 51: '02-two-of-swords.png', 52: '03-three-of-swords.png',
    53: '04-four-of-swords.png', 54: '05-five-of-swords.png', 55: '06-six-of-swords.png',
    56: '07-seven-of-swords.png', 57: '08-eight-of-swords.png', 58: '09-nine-of-swords.png',
    59: '10-ten-of-swords.png', 60: '11-Page-of-Swords.png', 61: '12-Knight-of-Swords.png',
    62: '13-Queen-of-Swords.png', 63: '14-King-of-Swords.png',
    // Pentacles
    64: '01-ace-of-pentacles.png', 65: '02-two-of-pentacles.png', 66: '03-three-of-pentacles.png',
    67: '04-four-of-pentacles.png', 68: '05-five-of-pentacles.png', 69: '06-six-of-pentacles.png',
    70: '07-seven-of-pentacles.png', 71: '08-eight-of-pentacles.png', 72: '09-nine-of-pentacles.png',
    73: '10-ten-of-pentacles.png', 74: '11-Page-of-Pentacles.png', 75: '12-Knight-of-Pentacles.png',
    76: '13-Queen-of-Pentacles.png', 77: '14-King-of-Pentacles.png'
  };
  
  const fileName = minorCardMap[cardNum];
  if (fileName) {
    return `/assets/tarot-cards/minor/${fileName}`;
  }
  
  // 폴백
  return '/assets/tarot-cards/major/00-the-Fool.png';
};

const onImageError = (event: Event) => handleImageError(event);

// 날짜 포맷팅
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 앱으로 이동
const goToApp = () => {
  router.push('/');
};

onMounted(async () => {
  console.log('🔍 [SharedReading] 공유 링크 접속:', shareId);
  
  try {
    // 1. shareId 유효성 체크
    if (!shareId) {
      console.error('❌ [SharedReading] shareId 없음');
      expired.value = false;
      loading.value = false;
      return;
    }
    
    console.log('📋 [SharedReading] 공유 데이터 조회 시작...');
    
    // 2. 공유 데이터 조회
    const { data, error } = await supabase
      .from('shared_readings')
      .select('*')
      .eq('id', shareId)
      .eq('is_active', true)
      .single();
    
    console.log('📋 [SharedReading] 조회 결과:', { data, error });
    
    if (error) {
      console.error('❌ [SharedReading] 공유 데이터 조회 실패:', error);
      expired.value = false; // 에러 상태로 처리
      loading.value = false;
      return;
    }
    
    if (!data) {
      console.error('❌ [SharedReading] 데이터 없음');
      expired.value = false; // 에러 상태로 처리  
      loading.value = false;
      return;
    }
    
    // 3. 만료 체크
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    console.log('⏰ [SharedReading] 만료 체크:', {
      expiresAt: expiresAt.toISOString(),
      now: now.toISOString(),
      isExpired: expiresAt < now
    });
    
    if (expiresAt < now) {
      expired.value = true;
      loading.value = false;
      return;
    }
    
    // 4. cards 데이터 파싱 (JSON 문자열인 경우 처리)
    if (typeof data.cards === 'string') {
      try {
        data.cards = JSON.parse(data.cards);
      } catch (e) {
        console.error('❌ [SharedReading] cards 파싱 실패:', e);
      }
    }
    
    // 5. 오늘의 카드의 AI 해석 디버그
    if (data.spread_type === 'daily_card' && data.ai_interpretation) {
      console.log('🔍 [SharedReading] 오늘의 카드 AI 해석 데이터:');
      console.log('  - 타입:', typeof data.ai_interpretation);
      console.log('  - 길이:', data.ai_interpretation.length);
      console.log('  - 처음 100자:', data.ai_interpretation.substring(0, 100));
      
      // JSON인지 확인
      if (typeof data.ai_interpretation === 'string') {
        const firstChar = data.ai_interpretation.trim()[0];
        const lastChar = data.ai_interpretation.trim()[data.ai_interpretation.trim().length - 1];
        console.log('  - 첫 문자:', firstChar);
        console.log('  - 마지막 문자:', lastChar);
        console.log('  - JSON 형태 가능성:', firstChar === '{' && lastChar === '}');
      }
    }
    
    console.log('✅ [SharedReading] 데이터 로드 성공:', {
      id: data.id,
      spreadType: data.spread_type,
      cardsCount: data.cards?.length || 0
    });
    
    sharedData.value = data;
    
  } catch (error) {
    console.error('❌ [SharedReading] 예상치 못한 오류:', error);
    expired.value = false; // 에러 상태로 처리
  } finally {
    loading.value = false;
    console.log('🏁 [SharedReading] 로딩 완료:', {
      loading: loading.value,
      expired: expired.value,
      hasData: !!sharedData.value
    });
  }
});
</script>

<style scoped>
.shared-reading {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(138, 92, 246, 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 만료/에러 상태 */
.expired-state,
.error-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expired-content,
.error-content {
  text-align: center;
  padding: 40px;
  background: var(--bg-secondary);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.expired-icon,
.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.expired-content h2,
.error-content h2 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.expired-content p,
.error-content p {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

/* 헤더 */
.share-header {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.share-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.share-info {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 섹션 스타일 */
.custom-question-section,
.cards-layout-section,
.interpretation-section {
  margin: 40px 0;
}

.custom-question-section h2,
.cards-layout-section h2,
.interpretation-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.custom-question-content {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

/* 오늘의 카드 레이아웃 */
.daily-card-layout {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.daily-card-layout .card-display {
  text-align: center;
}

.daily-card-layout .card-image img {
  width: 200px;
  max-width: 200px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 카드 그리드 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.card-display {
  text-align: center;
}

.card-image img {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.card-image img.reversed {
  transform: rotate(180deg);
}

.card-name {
  margin-top: 10px;
  font-weight: 600;
}

.card-orientation {
  font-size: 14px;
  margin-top: 5px;
}

.card-orientation.upright {
  color: var(--success-color);
}

.card-orientation.reversed {
  color: var(--warning-color);
}

/* 켈틱 크로스 레이아웃 */
.celtic-cross-layout {
  position: relative;
  min-height: 500px;
  margin: 20px auto;
  max-width: 800px;
}

.celtic-cross-layout .cards-container {
  position: relative;
  height: 500px;
}

.celtic-cross-layout .card-position {
  position: absolute;
  width: 70px;
  height: 100px;
}

.celtic-cross-layout .card-mini {
  width: 100%;
  height: 100%;
  position: relative;
}

.celtic-cross-layout .card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.celtic-cross-layout .position-label {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 켈틱 크로스 위치 */
.position-1 { left: calc(50% - 70px); top: calc(50% - 50px); }
.position-2 { left: calc(50% - 35px); top: calc(50% - 50px); transform: rotate(90deg); }
.position-3 { left: calc(50% - 35px); top: calc(70%); }
.position-4 { left: calc(25%); top: calc(50% - 50px); }
.position-5 { left: calc(50% - 35px); top: calc(20%); }
.position-6 { left: calc(70%); top: calc(50% - 50px); }
.position-7 { right: 20px; top: calc(75%); }
.position-8 { right: 20px; top: calc(55%); }
.position-9 { right: 20px; top: calc(35%); }
.position-10 { right: 20px; top: calc(15%); }

/* 해석 섹션 */
.basic-interpretation-content,
.ai-content {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  line-height: 1.8;
}

.ai-interpretation-result {
  margin-top: 30px;
}

.ai-interpretation-result h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: var(--primary-color);
}

/* 오늘의 카드 스타일 */
.fortune-section,
.detailed-section,
.lucky-section,
.quote-section {
  margin-top: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.fortune-section h4,
.detailed-section h4,
.lucky-section h4,
.quote-section h4 {
  font-size: 18px;
  margin-bottom: 15px;
  color: var(--primary-color);
}

.fortune-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.fortune-item {
  text-align: center;
}

.fortune-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 2px;
}

.star {
  font-size: 16px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.advice-box {
  margin-top: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.advice-box p {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.6;
}

.advice-box strong {
  color: var(--primary-color);
}

.lucky-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 15px;
}

.lucky-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.lucky-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.lucky-value {
  font-weight: 600;
  color: #FFD700;
}

.daily-quote {
  font-size: 16px;
  font-style: italic;
  line-height: 1.6;
  margin: 15px 0 0;
  padding: 15px;
  border-left: 3px solid var(--primary-color);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

/* 파싱 실패 시 폴백 스타일 */
.fallback-interpretation {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 15px;
}

/* CTA 섹션 */
.cta-section {
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  padding: 60px 20px;
  text-align: center;
  margin-top: 60px;
}

.cta-section h2 {
  font-size: 28px;
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

/* 버튼 스타일 */
.cta-button,
.primary-cta {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cta-button:hover,
.primary-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .share-header h1 {
    font-size: 24px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .celtic-cross-layout {
    min-height: 400px;
  }
  
  .celtic-cross-layout .cards-container {
    height: 400px;
    transform: scale(0.75);
    transform-origin: top center;
  }
  
  .cta-section h2 {
    font-size: 22px;
  }
  
  .cta-section p {
    font-size: 16px;
  }
  
  .cta-button,
  .primary-cta {
    font-size: 16px;
    padding: 14px 28px;
  }
}
</style>
