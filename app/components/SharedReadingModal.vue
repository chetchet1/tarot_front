<template>
  <div v-if="isOpen" class="modal-overlay" @click="onClose" @touchmove.prevent>
    <div class="modal-container" @click.stop @touchmove.stop>
      <!-- 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">🔮 타로 점괘 상세보기</h2>
        <button class="close-btn" @click="onClose">
          <span>✕</span>
        </button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>점괘를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <!-- 오늘의 카드 전용 레이아웃 -->
      <div v-else-if="sharedData && sharedData.spread_type === 'daily_card'" class="modal-content daily-card-content">
        <!-- 날짜 표시 -->
        <div class="date-display">
          {{ formatDate(sharedData.created_at) }}
        </div>
        
        <!-- 카드 표시 -->
        <div class="card-display">
          <img 
            :src="getCardImageUrl(parsedCards[0])" 
            :alt="parsedCards[0]?.nameKr || parsedCards[0]?.name"
            class="card-image"
            :class="{ reversed: parsedCards[0]?.orientation === 'reversed' }"
            @error="onImageError"
          />
          <h3 class="card-name">{{ parsedCards[0]?.nameKr || parsedCards[0]?.name }}</h3>
          <p class="card-subtitle">{{ parsedCards[0]?.name }}</p>
          <div class="card-orientation" :class="{ reversed: parsedCards[0]?.orientation === 'reversed' }">
            {{ parsedCards[0]?.orientation === 'reversed' ? '역방향' : '정방향' }}
          </div>
        </div>
        
        <!-- 오늘의 카드 해석 -->
        <div v-if="dailyInterpretationData" class="interpretation-area">
          <!-- 운세 지수 -->
          <div class="fortune-section">
            <h3 class="section-title">📊 오늘의 운세 지수</h3>
            <div class="fortune-grid">
              <div v-for="(value, key) in dailyInterpretationData.fortuneIndex" :key="key" class="fortune-item">
                <span class="fortune-label">{{ getFortuneLabel(key) }}</span>
                <div class="star-rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= value }">⭐</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 시간대별 조언 -->
          <div class="time-section">
            <h3 class="section-title">⏰ 시간대별 조언</h3>
            <div class="time-advice">
              <div class="time-item">
                <span class="time-label">오전 (06:00-12:00)</span>
                <p class="time-text">{{ dailyInterpretationData.timeAdvice.morning }}</p>
              </div>
              <div class="time-item">
                <span class="time-label">오후 (12:00-18:00)</span>
                <p class="time-text">{{ dailyInterpretationData.timeAdvice.afternoon }}</p>
              </div>
              <div class="time-item">
                <span class="time-label">저녁 (18:00-24:00)</span>
                <p class="time-text">{{ dailyInterpretationData.timeAdvice.evening }}</p>
              </div>
            </div>
          </div>

          <!-- 행운 아이템 -->
          <div class="lucky-section">
            <h3 class="section-title">🍀 오늘의 행운 아이템</h3>
            <div class="lucky-grid">
              <div class="lucky-item">
                <span class="lucky-label">색상</span>
                <span class="lucky-value">{{ dailyInterpretationData.luckyItems.color }}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">숫자</span>
                <span class="lucky-value">{{ dailyInterpretationData.luckyItems.number }}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">방향</span>
                <span class="lucky-value">{{ dailyInterpretationData.luckyItems.direction }}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">활동</span>
                <span class="lucky-value">{{ dailyInterpretationData.luckyItems.activity }}</span>
              </div>
            </div>
          </div>

          <!-- 인간관계 조언 -->
          <div class="relationship-section">
            <h3 class="section-title">👥 인간관계 조언</h3>
            <div class="relationship-content">
              <p><strong>대인관계 팁:</strong> {{ dailyInterpretationData.relationshipAdvice.tip }}</p>
              <p><strong>피해야 할 상황:</strong> {{ dailyInterpretationData.relationshipAdvice.avoid }}</p>
              <p><strong>만나면 좋은 사람:</strong> {{ dailyInterpretationData.relationshipAdvice.goodMeet }}</p>
            </div>
          </div>

          <!-- 오늘의 격언 -->
          <div class="quote-section">
            <h3 class="section-title">💬 오늘의 격언</h3>
            <blockquote class="daily-quote">
              "{{ dailyInterpretationData.dailyQuote }}"
            </blockquote>
          </div>

          <!-- 상세 운세 -->
          <div class="detailed-fortune-section">
            <h3 class="section-title">🔮 오늘의 상세 운세</h3>
            <div class="detailed-fortune-content">
              <p class="fortune-main-text">{{ dailyInterpretationData.detailedFortune?.mainMessage }}</p>
              <div class="fortune-aspects">
                <div class="fortune-aspect">
                  <h4>💫 오늘의 핵심 포인트</h4>
                  <p>{{ dailyInterpretationData.detailedFortune?.keyPoint }}</p>
                </div>
                <div class="fortune-aspect">
                  <h4>⚡ 주의할 점</h4>
                  <p>{{ dailyInterpretationData.detailedFortune?.caution }}</p>
                </div>
                <div class="fortune-aspect">
                  <h4>🌟 행운의 순간</h4>
                  <p>{{ dailyInterpretationData.detailedFortune?.luckyMoment }}</p>
                </div>
              </div>
              <div class="fortune-advice">
                <p class="advice-text">{{ dailyInterpretationData.detailedFortune?.advice }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 해석이 없는 경우 (오늘의 카드) -->
        <div v-else class="no-interpretation">
          <div class="interpretation-fallback">
            <h3 class="section-title">🔮 오늘의 카드 해석</h3>
            <p v-if="sharedData.basic_interpretation">{{ sharedData.basic_interpretation }}</p>
            <p v-else-if="sharedData.ai_interpretation && typeof sharedData.ai_interpretation === 'string'">{{ sharedData.ai_interpretation }}</p>
            <p v-else>상세 해석 정보가 저장되지 않았습니다.</p>
          </div>
        </div>
      </div>
      
      <!-- 일반 점괘 레이아웃 -->
      <div v-else-if="sharedData" class="modal-content">
        <!-- 점괘 정보 -->
        <section class="reading-info-section">
          <div class="info-row">
            <span class="info-label">📅 날짜:</span>
            <span class="info-value">{{ formatDate(sharedData.created_at) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🎯 테마:</span>
            <span class="info-value">{{ getThemeDisplay() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📋 배열법:</span>
            <span class="info-value">{{ getSpreadDisplay() }}</span>
          </div>
        </section>

        <!-- 질문 표시 -->
        <section v-if="sharedData.custom_question && sharedData.custom_question.trim()" class="question-section">
          <h3>📌 질문</h3>
          <div class="question-content">
            {{ sharedData.custom_question }}
          </div>
        </section>

        <!-- 카드 배열 -->
        <section class="cards-section">
          <h3>카드 배열</h3>
          
          <!-- 세븐스타 레이아웃 -->
          <div v-if="sharedData.spread_type === 'seven_star'" class="seven-star-layout">
            <div class="star-container">
              <div 
                v-for="(card, index) in parsedCards" 
                :key="index"
                :class="`star-card position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <div class="card-image-wrapper" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                    <img :src="getCardImageUrl(card)" 
                         :alt="card.nameKr || card.name" 
                         @error="onImageError" />
                  </div>
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 컵 오브 릴레이션십 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'cup_of_relationship'" class="cup-relationship-layout">
            <div class="cup-container">
              <div 
                v-for="(card, index) in parsedCards" 
                :key="index"
                :class="`cup-card position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <div class="card-image-wrapper" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                    <img :src="getCardImageUrl(card)" 
                         :alt="card.nameKr || card.name" 
                         @error="onImageError" />
                  </div>
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 켈틱 크로스 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'celtic_cross'" class="celtic-cross-layout">
            <div class="cards-container">
              <div 
                v-for="(card, index) in parsedCards" 
                :key="index"
                :class="`card-position position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <div class="card-image-wrapper" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                    <img :src="getCardImageUrl(card)" 
                         :alt="card.nameKr || card.name" 
                         @error="onImageError" />
                  </div>
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 기본 카드 그리드 -->
          <div v-else class="cards-grid">
            <div 
              v-for="(card, index) in parsedCards" 
              :key="index"
              class="card-item"
            >
              <div class="card-image" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                <img :src="getCardImageUrl(card)" 
                     :alt="card.nameKr || card.name" 
                     @error="onImageError" />
              </div>
              <div class="card-name">{{ card.nameKr || card.name }}</div>
              <div class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </div>
            </div>
          </div>
        </section>

        <!-- 해석 표시 -->
        <section v-if="sharedData.basic_interpretation || sharedData.ai_interpretation" class="interpretation-section">
          <h3>🔮 점괘 해석</h3>
          
          <!-- 기본 해석 -->
          <div v-if="sharedData.basic_interpretation" class="basic-interpretation">
            <p>{{ sharedData.basic_interpretation }}</p>
          </div>
          
          <!-- AI 해석 -->
          <div v-if="sharedData.ai_interpretation" class="ai-interpretation">
            <h4>✨ 수정구슬의 신비로운 통찰</h4>
            <p>{{ sharedData.ai_interpretation }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { supabase } from '../services/supabase';
import { getThemeDisplayName, getSpreadDisplayName } from '../utils/themeQuestions';
import { getCardImageFromObject } from '../utils/cardImageUtils';

const props = defineProps<{
  isOpen: boolean;
  readingId: string | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const loading = ref(false);
const error = ref('');
const sharedData = ref<any>(null);
const dailyInterpretationData = ref<any>(null);

// 카드 데이터 파싱
const parsedCards = computed(() => {
  if (!sharedData.value?.cards) return [];
  try {
    const cards = typeof sharedData.value.cards === 'string' 
      ? JSON.parse(sharedData.value.cards)
      : sharedData.value.cards;
    return cards;
  } catch (err) {
    console.error('Failed to parse cards:', err);
    return [];
  }
});

// 카드 이미지 URL 생성
const getCardImageUrl = (card: any) => {
  return getCardImageFromObject(card);
};

// 이미지 에러 처리
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/tarot-cards/major/00-the-Fool.png';
};

// 날짜 포맷팅
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

// 테마 표시 이름
const getThemeDisplay = () => {
  if (!sharedData.value) return '';
  
  if (sharedData.value.theme === 'custom' && sharedData.value.custom_question?.trim()) {
    return '커스텀 질문';
  }
  
  const theme = sharedData.value.theme || 'general';
  const subTheme = sharedData.value.sub_theme || null;
  return getThemeDisplayName(theme, subTheme);
};

// 배열법 표시 이름
const getSpreadDisplay = () => {
  if (!sharedData.value) return '';
  return getSpreadDisplayName(sharedData.value.spread_type || '');
};

// 운세 라벨
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

// 오늘의 카드 해석 데이터 파싱
const parseDailyInterpretation = () => {
  if (!sharedData.value || sharedData.value.spread_type !== 'daily_card') {
    dailyInterpretationData.value = null;
    return;
  }
  
  // ai_interpretation에서 JSON 데이터 추출 시도
  if (sharedData.value.ai_interpretation) {
    try {
      let interpretationData = sharedData.value.ai_interpretation;
      
      // 이미 객체인 경우 (DB에서 JSONB로 저장된 경우)
      if (typeof interpretationData === 'object' && interpretationData !== null) {
        dailyInterpretationData.value = interpretationData;
        console.log('[SharedReadingModal] Interpretation is already an object');
        return;
      }
      
      // 문자열인 경우 JSON 파싱 시도
      if (typeof interpretationData === 'string') {
        // JSON 문자열인지 확인
        if (interpretationData.trim().startsWith('{')) {
          dailyInterpretationData.value = JSON.parse(interpretationData);
          console.log('[SharedReadingModal] Successfully parsed JSON string');
          return;
        }
        
        // 일반 텍스트인 경우 (구버전 호환)
        console.log('[SharedReadingModal] Plain text interpretation, creating default structure');
        dailyInterpretationData.value = {
          fortuneIndex: {
            overall: 3,
            love: 3,
            money: 3,
            health: 3,
            work: 3
          },
          timeAdvice: {
            morning: '오전에는 신중하게 행동하세요.',
            afternoon: '오후에는 적극적으로 움직이세요.',
            evening: '저녁에는 휴식을 취하세요.'
          },
          luckyItems: {
            color: '파란색',
            number: '7',
            direction: '동쪽',
            activity: '산책'
          },
          relationshipAdvice: {
            tip: '상대방의 말을 경청하세요.',
            avoid: '충동적인 결정',
            goodMeet: '긍정적인 사람'
          },
          dailyQuote: '오늘은 새로운 시작의 날입니다.',
          detailedFortune: {
            mainMessage: interpretationData,
            keyPoint: '긍정적인 마음가짐을 유지하세요.',
            caution: '서두르지 마세요.',
            luckyMoment: '오후 3시경',
            advice: '차분하게 하루를 보내세요.'
          }
        };
      }
    } catch (err) {
      console.error('[SharedReadingModal] Failed to parse daily interpretation:', err);
      dailyInterpretationData.value = null;
    }
  } else {
    console.log('[SharedReadingModal] No ai_interpretation data');
    dailyInterpretationData.value = null;
  }
};

// 모달 닫기
const onClose = () => {
  emit('close');
};

// 데이터 로드
const loadSharedReading = async (readingId: string) => {
  console.log('[SharedReadingModal] Starting to load reading:', readingId);
  loading.value = true;
  error.value = '';
  sharedData.value = null;
  
  try {
    const { data, error: supabaseError } = await supabase
      .from('shared_readings')
      .select('*')
      .eq('id', readingId)
      .single();
    
    console.log('[SharedReadingModal] Supabase response:', { data, error: supabaseError });
    
    if (supabaseError) throw supabaseError;
    if (!data) throw new Error('점괘를 찾을 수 없습니다');
    
    sharedData.value = data;
    console.log('[SharedReadingModal] Data loaded successfully:', {
      id: data.id,
      spread_type: data.spread_type,
      has_cards: !!data.cards,
      has_interpretation: !!data.ai_interpretation || !!data.basic_interpretation,
      ai_interpretation_type: typeof data.ai_interpretation,
      ai_interpretation_preview: data.ai_interpretation ? 
        (typeof data.ai_interpretation === 'string' ? 
          data.ai_interpretation.substring(0, 100) + '...' : 
          'Object with keys: ' + Object.keys(data.ai_interpretation).join(', ')) : 
        'null'
    });
    
    // 오늘의 카드인 경우 daily_cards 테이블에서 interpretation_data 가져오기
    if (data.spread_type === 'daily_card' && data.shared_by) {
      console.log('🎴 [SharedReadingModal] 오늘의 카드 - daily_cards에서 interpretation_data 조회 시작');
      
      // custom_question에서 날짜 추출 (두 가지 형식 지원)
      let date = null;
      
      // ISO 형식: "2025-08-20 오늘의 카드"
      const isoMatch = data.custom_question?.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) {
        date = isoMatch[1];
        console.log('📅 ISO 형식 날짜 추출:', date);
      } else {
        // 한글 형식: "2025년 8월 20일의 오늘의 카드"
        const koreanMatch = data.custom_question?.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
        if (koreanMatch) {
          const year = koreanMatch[1];
          const month = koreanMatch[2].padStart(2, '0');
          const day = koreanMatch[3].padStart(2, '0');
          date = `${year}-${month}-${day}`;
          console.log('📅 한글 형식 날짜 추출:', date);
        }
      }
      
      if (date) {
        try {
          // daily_cards 테이블에서 interpretation_data 조회
          const { data: dailyCardData, error: dailyCardError } = await supabase
            .from('daily_cards')
            .select('interpretation_data')
            .eq('user_id', data.shared_by)
            .eq('date', date)
            .single();
          
          console.log('📊 daily_cards 조회 결과:', dailyCardData);
          
          if (dailyCardData?.interpretation_data) {
            // interpretation_data로 ai_interpretation 교체
            sharedData.value.ai_interpretation = dailyCardData.interpretation_data;
            console.log('✅ daily_cards의 interpretation_data로 교체 완료');
          } else {
            console.log('⚠️ daily_cards에서 interpretation_data를 찾을 수 없음');
          }
        } catch (err) {
          console.error('❌ daily_cards 조회 실패:', err);
        }
      }
      
      // 파싱 실행
      parseDailyInterpretation();
      console.log('[SharedReadingModal] Parsed daily interpretation:', dailyInterpretationData.value);
    } else if (data.spread_type === 'daily_card') {
      // shared_by가 없는 경우 기존 로직 실행
      parseDailyInterpretation();
      console.log('[SharedReadingModal] Parsed daily interpretation:', dailyInterpretationData.value);
    }
  } catch (err: any) {
    console.error('[SharedReadingModal] Failed to load shared reading:', err);
    error.value = err.message || '점괘를 불러오는데 실패했습니다';
  } finally {
    loading.value = false;
  }
};

// readingId 변경 감지
watch(() => props.readingId, (newId) => {
  if (newId && props.isOpen) {
    console.log('[SharedReadingModal] Loading reading with ID:', newId);
    loadSharedReading(newId);
  }
}, { immediate: true });

// isOpen 변경 감지
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.readingId) {
    console.log('[SharedReadingModal] Modal opened with reading ID:', props.readingId);
    loadSharedReading(props.readingId);
  }
}, { immediate: true });
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  touch-action: none;
}

.modal-container {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 20px;
  max-width: 900px;
  width: calc(100% - 40px);
  max-height: 85vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  z-index: 10;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

/* 로딩/에러 상태 */
.loading-state,
.error-state {
  padding: 40px;
  text-align: center;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top-color: #A855F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 오늘의 카드 전용 스타일 */
.daily-card-content .date-display {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
  font-size: 14px;
}

.daily-card-content .card-display {
  text-align: center;
  margin-bottom: 30px;
}

.daily-card-content .card-image {
  width: 200px;
  height: 300px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin: 0 auto 20px;
  display: block;
}

.daily-card-content .card-image.reversed {
  transform: rotate(180deg);
}

.daily-card-content .card-name {
  font-size: 24px;
  color: #A855F7;
  margin-bottom: 8px;
}

.daily-card-content .card-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.daily-card-content .card-orientation {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.daily-card-content .card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 운세 지수 */
.section-title {
  color: #A855F7;
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 600;
}

.fortune-section {
  margin-bottom: 30px;
}

.fortune-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
}

.fortune-item {
  text-align: center;
}

.fortune-label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-size: 14px;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.star {
  font-size: 16px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

/* 시간대별 조언 */
.time-section {
  margin-bottom: 30px;
}

.time-advice {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
}

.time-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.time-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.time-label {
  display: block;
  color: #A855F7;
  font-weight: 600;
  margin-bottom: 8px;
}

.time-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

/* 행운 아이템 */
.lucky-section {
  margin-bottom: 30px;
}

.lucky-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
}

.lucky-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lucky-label {
  color: rgba(255, 255, 255, 0.7);
  min-width: 60px;
}

.lucky-value {
  color: #FFD700;
  font-weight: 600;
}

/* 인간관계 조언 */
.relationship-section {
  margin-bottom: 30px;
}

.relationship-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
}

.relationship-content p {
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.relationship-content p:last-child {
  margin-bottom: 0;
}

.relationship-content strong {
  color: #A855F7;
}

/* 오늘의 격언 */
.quote-section {
  margin-bottom: 30px;
}

.daily-quote {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(255, 215, 0, 0.1));
  border-left: 3px solid #FFD700;
  padding: 20px;
  border-radius: 8px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin: 0;
}

/* 상세 운세 */
.detailed-fortune-section {
  margin-bottom: 30px;
}

.detailed-fortune-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
}

.fortune-main-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin-bottom: 20px;
}

.fortune-aspects {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.fortune-aspect {
  background: rgba(168, 85, 247, 0.05);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #A855F7;
}

.fortune-aspect h4 {
  color: #FFD700;
  font-size: 16px;
  margin-bottom: 8px;
}

.fortune-aspect p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

.fortune-advice {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(168, 85, 247, 0.1));
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.advice-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
}

/* 해석이 없는 경우 */
.no-interpretation {
  margin-top: 20px;
}

.interpretation-fallback {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
}

/* 섹션 스타일 */
.reading-info-section,
.question-section,
.cards-section,
.interpretation-section {
  margin-bottom: 30px;
}

.reading-info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  color: white;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  min-width: 80px;
  color: rgba(255, 255, 255, 0.7);
}

.info-value {
  color: white;
}

h3 {
  color: #A855F7;
  font-size: 20px;
  margin-bottom: 16px;
}

h4 {
  color: #FFD700;
  font-size: 18px;
  margin-bottom: 12px;
}

.question-content {
  background: rgba(168, 85, 247, 0.1);
  border-left: 3px solid #A855F7;
  padding: 16px;
  border-radius: 8px;
  color: white;
  line-height: 1.6;
}

/* 카드 그리드 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.card-item {
  text-align: center;
}

.card-image {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 8px;
  scale: 0.6;
}

.card-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.card-image.is-reversed img {
  transform: rotate(180deg);
}

.card-name {
  font-size: 14px;
  color: white;
  margin-bottom: 4px;
}

.card-orientation {
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

/* 특수 레이아웃들 - SharedReading.vue에서 복사 */
/* 세븐스타 레이아웃 */
.seven-star-layout {
  position: relative;
  min-height: 350px;
  margin: 20px auto;
  overflow: hidden;
}

.seven-star-layout .star-container {
  position: relative;
  height: 350px;
  width: 100%;
  max-width: 100%;
}

.seven-star-layout .star-card {
  position: absolute;
  width: 60px;
  height: 85px;
}

.seven-star-layout .card-mini {
  width: 100%;
  height: 100%;
  position: relative;
}

.seven-star-layout .card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.seven-star-layout .position-label {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* 세븐스타 카드 위치 */
.seven-star-layout .position-1 { left: calc(50% - 30px); top: 10px; }
.seven-star-layout .position-2 { left: calc(25% - 30px); top: 70px; }
.seven-star-layout .position-3 { left: calc(75% - 30px); top: 70px; }
.seven-star-layout .position-4 { left: calc(50% - 30px); top: 130px; }
.seven-star-layout .position-5 { left: calc(25% - 30px); top: 190px; }
.seven-star-layout .position-6 { left: calc(75% - 30px); top: 190px; }
.seven-star-layout .position-7 { left: calc(50% - 30px); top: 250px; }

/* 컵 오브 릴레이션십 레이아웃 */
.cup-relationship-layout {
  position: relative;
  min-height: 500px;
  margin: 20px auto;
  overflow: hidden;
}

.cup-relationship-layout .cup-container {
  position: relative;
  height: 500px;
  width: 100%;
  max-width: 100%;
}

.cup-relationship-layout .cup-card {
  position: absolute;
  width: 60px;
  height: 85px;
}

.cup-relationship-layout .card-mini {
  width: 100%;
  height: 100%;
  position: relative;
}

.cup-relationship-layout .card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.cup-relationship-layout .position-label {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* 컵 오브 릴레이션십 카드 위치 */
.cup-relationship-layout .position-1 { top: 400px; left: 20%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-2 { top: 400px; left: 80%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-3 { top: 380px; left: 50%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-4 { top: 300px; left: 35%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-5 { top: 250px; left: 50%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-6 { top: 300px; left: 65%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-7 { top: 180px; left: 25%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-8 { top: 180px; left: 75%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-9 { top: 100px; left: 35%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-10 { top: 100px; left: 65%; transform: translate(-50%, -50%); }
.cup-relationship-layout .position-11 { top: 30px; left: 50%; transform: translate(-50%, -50%); }

/* 켈틱 크로스 레이아웃 */
.celtic-cross-layout {
  position: relative;
  min-height: 400px;
  margin: 20px auto;
  overflow: hidden;
}

.celtic-cross-layout .cards-container {
  position: relative;
  height: 400px;
  width: 100%;
  max-width: 100%;
}

.celtic-cross-layout .card-position {
  position: absolute;
  width: 60px;
  height: 85px;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.celtic-cross-layout .position-label {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* 켈틱 크로스 카드 위치 */
.celtic-cross-layout .position-1 { left: calc(30% - 30px); top: calc(50% - 42px); }
.celtic-cross-layout .position-2 { 
  left: calc(30% - 30px); 
  top: calc(50% - 42px); 
  transform: rotate(90deg); 
  z-index: 2;
}
.celtic-cross-layout .position-3 { left: calc(30% - 30px); top: calc(50% + 50px); }
.celtic-cross-layout .position-4 { left: calc(30% - 100px); top: calc(50% - 42px); }
.celtic-cross-layout .position-5 { left: calc(30% - 30px); top: calc(50% - 134px); }
.celtic-cross-layout .position-6 { left: calc(30% + 40px); top: calc(50% - 42px); }
.celtic-cross-layout .position-7 { right: 40px; bottom: 20px; }
.celtic-cross-layout .position-8 { right: 40px; bottom: calc(20px + 95px); }
.celtic-cross-layout .position-9 { right: 40px; bottom: calc(20px + 190px); }
.celtic-cross-layout .position-10 { right: 40px; bottom: calc(20px + 285px); }

.celtic-cross-layout .position-2 .card-image-wrapper.is-reversed img {
  transform: rotate(180deg);
}

.card-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-image-wrapper.is-reversed img {
  transform: rotate(180deg);
}

/* 해석 섹션 */
.basic-interpretation,
.ai-interpretation {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  color: white;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: keep-all;
}

.ai-interpretation {
  background: rgba(168, 85, 247, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.2);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .modal-container {
    max-height: 90vh;
    height: 90vh;
    width: 100%;
    border-radius: 20px 20px 0 0;
    max-width: 100%;
    margin: 0;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .seven-star-layout {
    min-height: 240px;
  }
  
  .seven-star-layout .star-container {
    height: 240px;
    transform: scale(0.6);
    transform-origin: center center;
  }
  
  .cup-relationship-layout {
    min-height: 350px;
  }
  
  .cup-relationship-layout .cup-container {
    height: 350px;
    transform: scale(0.55);
    transform-origin: center center;
  }
  
  .celtic-cross-layout {
    min-height: 280px;
  }
  
  .celtic-cross-layout .cards-container {
    height: 280px;
    transform: scale(0.6);
    transform-origin: center center;
  }
  
  /* 카드 위치 모바일 조정 */
  .celtic-cross-layout .position-7,
  .celtic-cross-layout .position-8,
  .celtic-cross-layout .position-9,
  .celtic-cross-layout .position-10 {
    right: 20px;
  }
}
</style>
