<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal-content daily-card-modal" @click.stop>
      <!-- 헤더 -->
      <div class="modal-header">
        <h2>오늘의 카드</h2>
        <button class="close-button" @click="$emit('close')">✕</button>
      </div>
      
      <!-- 날짜 표시 -->
      <div class="date-display">
        {{ formatDate(props.reading.created_at) }}
      </div>
      
      <!-- 카드 표시 -->
      <div class="card-display">
        <img 
          :src="getCardImagePath(cardInfo)" 
          :alt="cardInfo?.nameKr || cardInfo?.name_kr"
          class="card-image"
          :class="{ reversed: cardInfo?.is_reversed }"
        />
        <h3 class="card-name">{{ cardInfo?.nameKr || cardInfo?.name_kr }}</h3>
        <p class="card-subtitle">{{ cardInfo?.name }}</p>
        <div class="card-orientation" :class="{ reversed: cardInfo?.is_reversed }">
          {{ cardInfo?.is_reversed ? '역방향' : '정방향' }}
        </div>
      </div>
      
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>해석을 불러오는 중...</p>
      </div>
      
      <!-- 해석 영역 -->
      <div v-else-if="interpretationData" class="interpretation-area">
        <!-- 운세 지수 -->
        <div class="fortune-section">
          <h3 class="section-title">📊 오늘의 운세 지수</h3>
          <div class="fortune-grid">
            <div v-for="(value, key) in interpretationData.fortuneIndex" :key="key" class="fortune-item">
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
              <p class="time-text">{{ interpretationData.timeAdvice.morning }}</p>
            </div>
            <div class="time-item">
              <span class="time-label">오후 (12:00-18:00)</span>
              <p class="time-text">{{ interpretationData.timeAdvice.afternoon }}</p>
            </div>
            <div class="time-item">
              <span class="time-label">저녁 (18:00-24:00)</span>
              <p class="time-text">{{ interpretationData.timeAdvice.evening }}</p>
            </div>
          </div>
        </div>

        <!-- 행운 아이템 -->
        <div class="lucky-section">
          <h3 class="section-title">🍀 오늘의 행운 아이템</h3>
          <div class="lucky-grid">
            <div class="lucky-item">
              <span class="lucky-label">색상</span>
              <span class="lucky-value">{{ interpretationData.luckyItems.color }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">숫자</span>
              <span class="lucky-value">{{ interpretationData.luckyItems.number }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">방향</span>
              <span class="lucky-value">{{ interpretationData.luckyItems.direction }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">활동</span>
              <span class="lucky-value">{{ interpretationData.luckyItems.activity }}</span>
            </div>
          </div>
        </div>

        <!-- 인간관계 조언 -->
        <div class="relationship-section">
          <h3 class="section-title">👥 인간관계 조언</h3>
          <div class="relationship-content">
            <p><strong>대인관계 팁:</strong> {{ interpretationData.relationshipAdvice.tip }}</p>
            <p><strong>피해야 할 상황:</strong> {{ interpretationData.relationshipAdvice.avoid }}</p>
            <p><strong>만나면 좋은 사람:</strong> {{ interpretationData.relationshipAdvice.goodMeet }}</p>
          </div>
        </div>

        <!-- 오늘의 격언 -->
        <div class="quote-section">
          <h3 class="section-title">💬 오늘의 격언</h3>
          <blockquote class="daily-quote">
            "{{ interpretationData.dailyQuote }}"
          </blockquote>
        </div>

        <!-- 상세 운세 -->
        <div class="detailed-fortune-section">
          <h3 class="section-title">🔮 오늘의 상세 운세</h3>
          <div class="detailed-fortune-content">
            <p class="fortune-main-text">{{ interpretationData.detailedFortune?.mainMessage }}</p>
            <div class="fortune-aspects">
              <div class="fortune-aspect">
                <h4>💫 오늘의 핵심 포인트</h4>
                <p>{{ interpretationData.detailedFortune?.keyPoint }}</p>
              </div>
              <div class="fortune-aspect">
                <h4>⚡ 주의할 점</h4>
                <p>{{ interpretationData.detailedFortune?.caution }}</p>
              </div>
              <div class="fortune-aspect">
                <h4>🌟 행운의 순간</h4>
                <p>{{ interpretationData.detailedFortune?.luckyMoment }}</p>
              </div>
            </div>
            <div class="fortune-advice">
              <p class="advice-text">{{ interpretationData.detailedFortune?.advice }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 해석이 없는 경우 -->
      <div v-else-if="!isLoading" class="no-interpretation">
        <p>상세 해석 정보가 저장되지 않았습니다.</p>
        <p class="simple-interpretation" v-if="props.reading.overall_message">
          {{ props.reading.overall_message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';

const props = defineProps({
  reading: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const interpretationData = ref<any>(null);
const isLoading = ref(false);

// 카드 정보 추출
const cardInfo = computed(() => {
  if (props.reading.cards && props.reading.cards.length > 0) {
    const card = props.reading.cards[0];
    // 카드 정보 정규화 (다양한 형식 지원)
    return {
      ...card,
      nameKr: card.nameKr || card.name_kr,
      name: card.name,
      is_reversed: card.is_reversed || card.orientation === 'reversed'
    };
  }
  return null;
});

// 날짜 포맷
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
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

// 카드 이미지 경로 생성
const getCardImagePath = (card: any) => {
  if (!card) return '/assets/card-back.png';
  
  // 카드 번호가 있는 경우 (0-77)
  if (card.cardNumber !== undefined) {
    const cardId = card.cardNumber;
    
    // 메이저 아르카나 (0-21)
    if (cardId <= 21) {
      const majorNames = [
        'the-Fool', 'The-Magician', 'The-High-Priestess', 'The-Empress',
        'The-Emperor', 'The-Hierophant', 'The-Lovers', 'The-Chariot',
        'Strength', 'The-Hermit', 'Wheel-of-Fortune', 'Justice',
        'The-Hanged-Man', 'Death', 'Temperance', 'The-Devil',
        'The-Tower', 'The-Star', 'The-Moon', 'The-Sun',
        'Judgement', 'The-World'
      ];
      const cardNumber = cardId.toString().padStart(2, '0');
      return `/assets/tarot-cards/major/${cardNumber}-${majorNames[cardId]}.png`;
    }
    
    // 마이너 아르카나 - 기존 로직 사용
    // Wands: 22-35, Cups: 36-49, Swords: 50-63, Pentacles: 64-77
    let suit = '';
    let number = 0;
    
    if (cardId >= 22 && cardId <= 35) {
      suit = 'wands';
      number = cardId - 21; // 1-14
    } else if (cardId >= 36 && cardId <= 49) {
      suit = 'cups';
      number = cardId - 35; // 1-14
    } else if (cardId >= 50 && cardId <= 63) {
      suit = 'swords';
      number = cardId - 49; // 1-14
    } else if (cardId >= 64 && cardId <= 77) {
      suit = 'pentacles';
      number = cardId - 63; // 1-14
    }
    
    // 숫자 카드 (1-10)
    if (number >= 1 && number <= 10) {
      const numberNames = ['', 'ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      const cardNumber = number.toString().padStart(2, '0');
      const cardName = `${numberNames[number]}-of-${suit}`;
      return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    }
    
    // 코트 카드 (11-14)
    if (number >= 11 && number <= 14) {
      const courtNames = ['', '', '', '', '', '', '', '', '', '', '', 'page', 'knight', 'queen', 'king'];
      const courtName = courtNames[number];
      const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);
      
      // 코트 카드 번호 계산
      const suitOrder = ['wands', 'cups', 'swords', 'pentacles'];
      const courtOrder = ['page', 'knight', 'queen', 'king'];
      const suitIndex = suitOrder.indexOf(suit);
      const courtIndex = courtOrder.indexOf(courtName);
      const baseNumbers = [41, 45, 49, 53];
      const fileNumber = baseNumbers[suitIndex] + courtIndex;
      
      return `/assets/tarot-cards/minor/${fileNumber}-${courtName.charAt(0).toUpperCase() + courtName.slice(1)}-of-${suitName}.png`;
    }
  }
  
  // 기본값
  return '/assets/card-back.png';
};

// daily_cards 테이블에서 interpretation_data 조회
const loadInterpretationData = async () => {
  if (!props.reading.user_id || !props.reading.created_at) return;
  
  isLoading.value = true;
  try {
    // created_at 날짜로 daily_cards 조회
    const readingDate = new Date(props.reading.created_at).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_cards')
      .select('interpretation_data')
      .eq('user_id', props.reading.user_id)
      .eq('date', readingDate)
      .maybeSingle();
    
    if (error) {
      console.error('interpretation_data 조회 실패:', error);
      return;
    }
    
    if (data?.interpretation_data) {
      interpretationData.value = data.interpretation_data;
      console.log('해석 데이터 로드 성공');
    } else {
      console.log('저장된 해석 데이터 없음');
    }
  } catch (error) {
    console.error('해석 데이터 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadInterpretationData();
});
</script>

<style scoped>
/* 모달 배경 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* 모달 콘텐츠 */
.modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 날짜 표시 */
.date-display {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  padding: 16px;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.1);
}

/* 카드 표시 */
.card-display {
  text-align: center;
  padding: 30px 20px;
}

.card-image {
  width: 180px;
  height: 270px;
  object-fit: contain;
  background-color: #f8f8f8;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.card-image.reversed {
  transform: rotate(180deg);
}

.card-name {
  font-size: 22px;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
}

.card-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.card-orientation {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 해석 영역 */
.interpretation-area {
  padding: 0 20px 30px;
}

/* 각 섹션 공통 스타일 */
.fortune-section,
.time-section,
.lucky-section,
.relationship-section,
.quote-section,
.detailed-fortune-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  color: white;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* 운세 지수 */
.fortune-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.fortune-item {
  text-align: center;
}

.fortune-label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 3px;
}

.star {
  font-size: 14px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

/* 시간대별 조언 */
.time-advice {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.time-item {
  text-align: left;
}

.time-label {
  font-weight: 600;
  color: #FFD700;
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.time-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

/* 행운 아이템 */
.lucky-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.lucky-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.lucky-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.lucky-value {
  font-weight: 600;
  color: #FFD700;
  font-size: 13px;
}

/* 인간관계 조언 */
.relationship-content p {
  margin: 0 0 10px 0;
  font-size: 13px;
  line-height: 1.5;
}

.relationship-content p:last-child {
  margin-bottom: 0;
}

.relationship-content strong {
  color: #FFD700;
}

/* 오늘의 격언 */
.daily-quote {
  font-size: 16px;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  padding: 16px;
  border-left: 3px solid #FFD700;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

/* 상세 운세 */
.detailed-fortune-content {
  color: rgba(255, 255, 255, 0.9);
}

.fortune-main-text {
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.95);
}

.fortune-aspects {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.fortune-aspect {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 14px;
}

.fortune-aspect h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #FFD700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.fortune-aspect p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

.fortune-advice {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 14px;
  border-left: 3px solid #FFD700;
}

.advice-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

/* 해석 없음 */
.no-interpretation {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.simple-interpretation {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    margin: 10px;
  }
  
  .fortune-grid {
    grid-template-columns: 1fr;
  }
  
  .lucky-grid {
    grid-template-columns: 1fr;
  }
  
  .card-image {
    width: 160px;
    height: 240px;
  }
}

/* 스크롤바 스타일 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>
