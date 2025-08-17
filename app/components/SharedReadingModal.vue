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

      <!-- 정상 표시 -->
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
      has_interpretation: !!data.ai_interpretation || !!data.basic_interpretation
    });
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
