<template>
  <transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <!-- 헤더 -->
        <div class="modal-header">
          <h2 class="modal-title">📖 내 점괘 기록에서 선택</h2>
          <button class="close-btn" @click="close">
            <span>✕</span>
          </button>
        </div>

        <!-- 필터 -->
        <div class="filter-section">
          <!-- 날짜 필터 -->
          <div class="filter-group">
            <label class="filter-label">📅 기간</label>
            <select v-model="filters.dateRange" class="filter-select">
              <option value="all">전체</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
              <option value="three-months">최근 3개월</option>
            </select>
          </div>

          <!-- 배열법 필터 -->
          <div class="filter-group">
            <label class="filter-label">🎴 배열법</label>
            <select v-model="filters.spreadType" class="filter-select">
              <option value="all">전체</option>
              <option value="one_card">1장 카드</option>
              <option value="three_card_timeline">3장 타임라인</option>
              <option value="celtic_cross">켈틱 크로스</option>
              <option value="seven_star">세븐 스타</option>
              <option value="cup_of_relationship">관계의 컵</option>
              <option value="horseshoe">호스슈</option>
              <option value="hexagram">헥사그램</option>
              <option value="year_ahead">한 해 전망</option>
              <option value="daily">오늘의 카드</option>
            </select>
          </div>

          <!-- 테마 필터 -->
          <div class="filter-group">
            <label class="filter-label">🔮 테마</label>
            <select v-model="filters.theme" class="filter-select">
              <option value="all">전체</option>
              <option value="love">💝 연애</option>
              <option value="career">💼 직업</option>
              <option value="general">🌟 일반</option>
              <option value="daily">📅 일상</option>
              <option value="health">🏥 건강</option>
              <option value="money">💰 재물</option>
              <option value="study">📚 학업</option>
              <option value="travel">✈️ 여행</option>
            </select>
          </div>
        </div>

        <!-- 점괘 목록 -->
        <div class="readings-list">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>점괘 기록을 불러오는 중...</p>
          </div>

          <div v-else-if="filteredReadings.length === 0" class="empty-state">
            <p class="empty-icon">📭</p>
            <p class="empty-text">조건에 맞는 점괘가 없습니다</p>
            <p class="empty-sub">다른 필터를 선택해보세요</p>
          </div>

          <div v-else class="readings-grid">
            <div 
              v-for="reading in filteredReadings" 
              :key="reading.id"
              class="reading-card"
              :class="{ selected: selectedReading?.id === reading.id }"
              @click="selectReading(reading)"
            >
              <!-- 선택 체크 -->
              <div class="selection-indicator">
                <span v-if="selectedReading?.id === reading.id" class="check-icon">✓</span>
              </div>

              <!-- 점괘 정보 -->
              <div class="reading-info">
                <div class="reading-header">
                  <span class="spread-badge">{{ getSpreadLabel(reading.spread_type) }}</span>
                  <span class="date-text">{{ formatShortDate(reading.created_at) }}</span>
                </div>

                <div v-if="reading.question" class="reading-question">
                  <span class="question-icon">❓</span>
                  <span class="question-text">{{ truncateText(reading.question, 50) }}</span>
                </div>

                <div v-if="reading.theme" class="reading-theme">
                  <span class="theme-badge">{{ getThemeLabel(reading.theme) }}</span>
                </div>

                <div class="reading-footer">
                  <span class="card-count">🎴 {{ reading.cards?.length || 0 }}장</span>
                  <span v-if="reading.is_from_shared" class="shared-badge">공유됨</span>
                  <span v-if="reading.has_interpretation" class="interpretation-badge">해석 있음</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 더보기 버튼 -->
          <div v-if="hasMore && !loading" class="load-more">
            <button class="load-more-btn" @click="loadMore">
              더 많은 점괘 보기
            </button>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="modal-footer">
          <button class="cancel-btn" @click="close">취소</button>
          <button 
            class="confirm-btn" 
            @click="confirmSelection"
            :disabled="!selectedReading"
          >
            {{ selectedReading ? '이 점괘 선택' : '점괘를 선택해주세요' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUserStore } from '../store/user';
import { supabase } from '../services/supabase';

// Props & Emits
const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  select: [reading: any];
}>();

const userStore = useUserStore();

// State
const loading = ref(false);
const readings = ref<any[]>([]);
const selectedReading = ref<any>(null);
const page = ref(1);
const pageSize = 20;
const hasMore = ref(true);

// 필터
const filters = ref({
  dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'three-months',
  spreadType: 'all',
  theme: 'all'
});

// 필터링된 점괘 목록
const filteredReadings = computed(() => {
  let filtered = [...readings.value];

  // 날짜 필터
  if (filters.value.dateRange !== 'all') {
    const now = new Date();
    let startDate: Date;

    switch (filters.value.dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'three-months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    filtered = filtered.filter(r => new Date(r.created_at) >= startDate);
  }

  // 배열법 필터
  if (filters.value.spreadType !== 'all') {
    filtered = filtered.filter(r => {
      const spreadType = normalizeSpreadType(r.spread_type || r.spread_id);
      return spreadType === filters.value.spreadType;
    });
  }

  // 테마 필터
  if (filters.value.theme !== 'all') {
    filtered = filtered.filter(r => r.theme === filters.value.theme);
  }

  return filtered;
});

// 스프레드 타입 정규화
const normalizeSpreadType = (type: string): string => {
  const map: Record<string, string> = {
    'three-cards': 'three_card_timeline',
    'celtic-cross': 'celtic_cross',
    'seven-star': 'seven_star',
    'cup-of-relationship': 'cup_of_relationship',
    'relationship': 'cup_of_relationship',
    'horseshoe': 'horseshoe',
    'hexagram': 'hexagram',
    'year-ahead': 'year_ahead',
    'daily': 'daily',
    'single': 'one_card',
    'one-card': 'one_card',
    'one_card': 'one_card',
    'three_card_timeline': 'three_card_timeline',
    'celtic_cross': 'celtic_cross',
    'seven_star': 'seven_star',
    'cup_of_relationship': 'cup_of_relationship',
    'year_ahead': 'year_ahead',
    'daily_card': 'daily'
  };
  return map[type] || type;
};

// 스프레드 라벨
const getSpreadLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'one_card': '1장',
    'three_card_timeline': '3장',
    'celtic_cross': '켈틱',
    'seven_star': '세븐스타',
    'cup_of_relationship': '관계의컵',
    'horseshoe': '호스슈',
    'hexagram': '헥사그램',
    'year_ahead': '연간전망',
    'daily': '오늘카드'
  };
  const normalized = normalizeSpreadType(type);
  return labels[normalized] || type;
};

// 테마 라벨
const getThemeLabel = (theme: string): string => {
  const labels: Record<string, string> = {
    'love': '💝 연애',
    'career': '💼 직업',
    'general': '🌟 일반',
    'daily': '📅 일상',
    'health': '🏥 건강',
    'money': '💰 재물',
    'study': '📚 학업',
    'travel': '✈️ 여행'
  };
  return labels[theme] || theme;
};

// 날짜 포맷 (짧게)
const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? '방금' : `${minutes}분 전`;
    }
    return `${hours}시간 전`;
  } else if (days === 1) {
    return '어제';
  } else if (days < 7) {
    return `${days}일 전`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)}주 전`;
  } else if (days < 365) {
    return `${Math.floor(days / 30)}개월 전`;
  } else {
    return `${Math.floor(days / 365)}년 전`;
  }
};

// 텍스트 자르기
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// 점괘 선택
const selectReading = (reading: any) => {
  selectedReading.value = reading;
};

// 선택 확인
const confirmSelection = () => {
  if (selectedReading.value) {
    emit('select', selectedReading.value);
    close();
  }
};

// 모달 닫기
const close = () => {
  emit('close');
};

// 오버레이 클릭 처리
const handleOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    close();
  }
};

// 점괘 불러오기
const loadReadings = async (reset = false) => {
  if (!userStore.currentUser || loading.value) return;

  loading.value = true;
  if (reset) {
    page.value = 1;
    readings.value = [];
    hasMore.value = true;
  }

  try {
    // readings 테이블에서 데이터 가져오기
    const { data: readingsData, error: readingsError } = await supabase
      .from('readings')
      .select('*')
      .eq('user_id', userStore.currentUser.id)
      .order('created_at', { ascending: false })
      .range((page.value - 1) * pageSize, page.value * pageSize - 1);

    if (readingsError) throw readingsError;

    // shared_readings에서 이미 공유된 점괘도 가져오기
    const { data: sharedData, error: sharedError } = await supabase
      .from('shared_readings')
      .select('*')
      .eq('shared_by', userStore.currentUser.id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (sharedError) {
      console.warn('공유 점괘 조회 실패:', sharedError);
    }

    // AI 해석 여부 확인
    const readingIds = (readingsData || []).map(r => r.id);
    let aiInterpretations: any[] = [];
    
    if (readingIds.length > 0) {
      const { data: aiData } = await supabase
        .from('ai_interpretations')
        .select('reading_id')
        .in('reading_id', readingIds);
      
      aiInterpretations = aiData || [];
    }

    // 데이터 포맷팅
    const formattedReadings = (readingsData || []).map(reading => ({
      ...reading,
      spread_type: normalizeSpreadType(reading.spread_id || 'three-cards'),
      theme: reading.theme || extractThemeFromQuestion(reading.question),
      is_from_readings: true,
      has_interpretation: aiInterpretations.some(ai => ai.reading_id === reading.id) || 
                         !!reading.overall_message
    }));

    // 공유된 점괘 포맷팅
    const formattedShared = (sharedData || []).map(shared => ({
      id: shared.id,
      spread_type: normalizeSpreadType(shared.spread_type),
      created_at: shared.created_at,
      question: shared.custom_question,
      cards: shared.cards,
      theme: shared.theme || extractThemeFromQuestion(shared.custom_question),
      is_from_shared: true,
      has_interpretation: !!shared.ai_interpretation || !!shared.basic_interpretation
    }));

    // 결과 합치기
    if (reset) {
      readings.value = [...formattedReadings, ...formattedShared];
    } else {
      readings.value = [...readings.value, ...formattedReadings];
    }

    // 더 있는지 확인
    hasMore.value = readingsData?.length === pageSize;
  } catch (error) {
    console.error('점괘 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

// 질문에서 테마 추출
const extractThemeFromQuestion = (question: string | null): string => {
  if (!question) return 'general';
  
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('연애') || lowerQuestion.includes('사랑') || 
      lowerQuestion.includes('연인') || lowerQuestion.includes('짝사랑')) {
    return 'love';
  }
  if (lowerQuestion.includes('직업') || lowerQuestion.includes('일') || 
      lowerQuestion.includes('취업') || lowerQuestion.includes('승진')) {
    return 'career';
  }
  if (lowerQuestion.includes('돈') || lowerQuestion.includes('재물') || 
      lowerQuestion.includes('투자') || lowerQuestion.includes('부동산')) {
    return 'money';
  }
  if (lowerQuestion.includes('건강') || lowerQuestion.includes('병') || 
      lowerQuestion.includes('치료')) {
    return 'health';
  }
  if (lowerQuestion.includes('학업') || lowerQuestion.includes('공부') || 
      lowerQuestion.includes('시험') || lowerQuestion.includes('대학')) {
    return 'study';
  }
  if (lowerQuestion.includes('여행') || lowerQuestion.includes('이동') || 
      lowerQuestion.includes('이사')) {
    return 'travel';
  }
  
  return 'general';
};

// 더보기
const loadMore = () => {
  page.value++;
  loadReadings();
};

// 모달이 열릴 때마다 데이터 새로고침
watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedReading.value = null;
    loadReadings(true);
  }
});

// 필터 변경 시 리셋
watch(filters, () => {
  page.value = 1;
}, { deep: true });
</script>

<style scoped>
.modal-overlay {
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

.modal-container {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* 헤더 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

/* 필터 섹션 */
.filter-section {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-group {
  flex: 1;
  min-width: 0;
}

.filter-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #A855F7;
  background: rgba(255, 255, 255, 0.08);
}

.filter-select option {
  background: #1E1B4B;
  color: white;
}

/* 점괘 목록 */
.readings-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #A855F7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.empty-state p {
  margin: 12px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.empty-icon {
  font-size: 48px;
  margin: 0 0 16px 0;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px !important;
  color: white !important;
  margin: 0 0 8px 0 !important;
}

.empty-sub {
  font-size: 14px !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 점괘 그리드 */
.readings-grid {
  display: grid;
  gap: 12px;
}

.reading-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.reading-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.reading-card.selected {
  background: rgba(168, 85, 247, 0.1);
  border-color: #A855F7;
}

.selection-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reading-card.selected .selection-indicator {
  background: #A855F7;
  border-color: #A855F7;
}

.check-icon {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.reading-info {
  padding-right: 36px;
}

.reading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.spread-badge {
  padding: 4px 10px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  color: #A855F7;
  font-size: 12px;
  font-weight: 600;
}

.date-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.reading-question {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.question-icon {
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.question-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.4;
}

.reading-theme {
  margin-bottom: 12px;
}

.theme-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.reading-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.card-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shared-badge,
.interpretation-badge {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 11px;
}

.shared-badge {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.interpretation-badge {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

/* 더보기 */
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* 하단 버튼 */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.confirm-btn {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 모달 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .filter-section {
    flex-direction: column;
    gap: 8px;
  }

  .readings-list {
    padding: 16px;
  }

  .reading-info {
    padding-right: 32px;
  }
}
</style>
