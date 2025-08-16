<template>
  <div class="history">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>점괘 기록</h1>
    </header>

    <div class="container">
      <div v-if="!userStore.isLoggedIn" class="login-prompt">
        <div class="prompt-card card">
          <div class="prompt-icon">🔒</div>
          <h2>로그인이 필요합니다</h2>
          <p>점괘 기록을 보려면 먼저 로그인해주세요.</p>
          <button class="btn btn-primary" @click="showLogin = true">
            로그인하기
          </button>
        </div>
      </div>

      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>점괘 기록을 불러오는 중...</p>
      </div>

      <div v-else-if="readings.length === 0" class="empty-state">
        <div class="empty-card card">
          <div class="empty-icon">📚</div>
          <h2>아직 점괘 기록이 없습니다</h2>
          <p>첫 번째 타로 점을 봐보세요!</p>
          <router-link to="/reading-select" class="btn btn-primary">
            타로 점보기
          </router-link>
        </div>
      </div>

      <div v-else class="readings-section">
        <div class="section-header">
          <h2>내 점괘 기록</h2>
          <div class="filters">
            <select v-model="selectedDateFilter" class="filter-select">
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="3months">최근 3개월</option>
              <option value="6months">최근 6개월</option>
              <option value="year">올해</option>
            </select>
            <select v-model="selectedTopicFilter" class="filter-select">
              <option value="all">모든 주제</option>
              <option value="love">연애/사랑</option>
              <option value="career">직업/진로</option>
              <option value="money">금전/재물</option>
              <option value="general">종합운세</option>
            </select>
            <select v-model="selectedSpreadFilter" class="filter-select">
              <option value="all">모든 배열</option>
              <option value="daily_card">오늘의 카드</option>
              <option value="one_card">한 장 리딩</option>
              <option value="three_card_timeline">세 장 타임라인</option>
              <option value="celtic_cross">켈틱 크로스</option>
              <option value="seven_star">세븐스타</option>
              <option value="cup_of_relationship">컵 오브 릴레이션십</option>
            </select>
          </div>
        </div>

        <div class="readings-grid">
          <div 
            v-for="reading in filteredReadings" 
            :key="reading.id"
            class="reading-card card"
            @click="openReading(reading)"
          >
            <div class="reading-header">
              <div class="reading-date">
                {{ formatDate(reading.created_at) }}
              </div>
              <div class="reading-topic" :class="reading.topic">
                {{ getTopicName(reading.topic) }}
              </div>
            </div>
            
            <div class="reading-content">
              <h3>{{ reading.spread_name }}</h3>
              <p class="reading-summary">{{ getSummary(reading) }}</p>
              
              <div class="cards-preview">
                <div 
                  v-for="(card, idx) in getReadingCards(reading).slice(0, 3)" 
                  :key="idx"
                  class="mini-card"
                  :class="{ reversed: isReversedCard(card) }"
                >
                  <img 
                    :src="getMiniCardImage(card)" 
                    :alt="getCardName(card)"
                    @error="handleImageError"
                  />
                </div>
                <span v-if="getReadingCards(reading).length > 3" class="more-cards">
                  +{{ getReadingCards(reading).length - 3 }}
                </span>
              </div>
            </div>
            
            <div class="reading-footer">
              <span class="card-count">{{ getReadingCards(reading).length }}장</span>
              <span v-if="reading.spread_name === '켈틱 크로스'" class="premium-badge">
                👑 프리미엄
              </span>
              <span v-if="reading.spread_type === 'daily_card'" class="daily-badge">
                ☀️ 오늘의 카드
              </span>
            </div>
          </div>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <button 
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            이전
          </button>
          
          <span class="page-info">
            {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 점괘 상세 모달 -->
      <div v-if="selectedReading" class="modal-backdrop" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedReading.spread_name }}</h2>
            <button class="close-button" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="reading-info">
              <div class="info-row">
                <strong>날짜:</strong> {{ formatDateTime(selectedReading.created_at) }}
              </div>
              <div class="info-row">
                <strong>주제:</strong> {{ getTopicName(selectedReading.topic) }}
              </div>
              <div class="info-row">
                <strong>질문:</strong> {{ selectedReading.question || '일반적인 운세' }}
              </div>
            </div>
            
            <div class="cards-section">
              <h4>뽑힌 카드들</h4>
              <SpreadLayout
                :spread-id="selectedReading.spread_id"
                :spread-type="selectedReading.spread_type"
                :cards="selectedReading.cards"
              />
            </div>
            
            <div v-if="getFullInterpretation(selectedReading)" class="interpretation-section">
              <h4>AI 종합 해석</h4>
              <p class="full-interpretation">{{ getFullInterpretation(selectedReading) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 로그인 모달 -->
      <LoginModal v-if="showLogin" @close="showLogin = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { supabase } from '@/services/supabase';
import LoginModal from '@/components/LoginModal.vue';
import SpreadLayout from '@/components/history/SpreadLayout.vue';
import { getCardImagePath, isReversedCard, handleImageError } from '@/utils/cardUtils';
import { showAlert } from '@/utils/alerts';
import type { ReadingHistory, DrawnCard } from '@/types/history';

const router = useRouter();
const userStore = useUserStore();
const showLogin = ref(false);
const selectedTopicFilter = ref('all');
const selectedSpreadFilter = ref('all');
const selectedDateFilter = ref('all');
const selectedReading = ref<ReadingHistory | null>(null);
const currentPage = ref(1);
const itemsPerPage = 6;
const readings = ref<ReadingHistory[]>([]);
const loading = ref(false);

const filteredReadings = computed(() => {
  let filtered = readings.value;
  
  // 날짜 필터 적용
  if (selectedDateFilter.value !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    filtered = filtered.filter(reading => {
      const readingDate = new Date(reading.created_at);
      
      switch(selectedDateFilter.value) {
        case 'today':
          return readingDate >= today;
        case 'week':
          return readingDate >= startOfWeek;
        case 'month':
          return readingDate >= startOfMonth;
        case '3months':
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return readingDate >= threeMonthsAgo;
        case '6months':
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return readingDate >= sixMonthsAgo;
        case 'year':
          return readingDate >= startOfYear;
        default:
          return true;
      }
    });
  }
  
  // 주제 필터 적용
  if (selectedTopicFilter.value !== 'all') {
    filtered = filtered.filter(reading => reading.topic === selectedTopicFilter.value);
  }
  
  // 배열 필터 적용
  if (selectedSpreadFilter.value !== 'all') {
    filtered = filtered.filter(reading => {
      // spread_type이 daily_card인 경우 처리
      if (selectedSpreadFilter.value === 'daily_card') {
        return reading.spread_type === 'daily_card' || reading.spread_id === 'daily_card';
      }
      // 일반 spread_id 비교
      return reading.spread_id === selectedSpreadFilter.value;
    });
  }
  
  // 날짜순 정렬 (최신순)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // 페이지네이션
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  let filtered = readings.value;
  
  // 날짜 필터 적용 (filteredReadings와 동일한 로직)
  if (selectedDateFilter.value !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    filtered = filtered.filter(reading => {
      const readingDate = new Date(reading.created_at);
      
      switch(selectedDateFilter.value) {
        case 'today':
          return readingDate >= today;
        case 'week':
          return readingDate >= startOfWeek;
        case 'month':
          return readingDate >= startOfMonth;
        case '3months':
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return readingDate >= threeMonthsAgo;
        case '6months':
          const sixMonthsAgo = new Date(now);
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return readingDate >= sixMonthsAgo;
        case 'year':
          return readingDate >= startOfYear;
        default:
          return true;
      }
    });
  }
  
  // 주제 필터 적용
  if (selectedTopicFilter.value !== 'all') {
    filtered = filtered.filter(reading => reading.topic === selectedTopicFilter.value);
  }
  
  // 배열 필터 적용
  if (selectedSpreadFilter.value !== 'all') {
    filtered = filtered.filter(reading => {
      if (selectedSpreadFilter.value === 'daily_card') {
        return reading.spread_type === 'daily_card' || reading.spread_id === 'daily_card';
      }
      return reading.spread_id === selectedSpreadFilter.value;
    });
  }
  
  return Math.ceil(filtered.length / itemsPerPage);
});

const goBack = () => {
  router.go(-1);
};

const getTopicName = (topic: string) => {
  const topicNames: Record<string, string> = {
    love: '연애/사랑',
    career: '직업/진로',
    money: '금전/재물',
    health: '건강/관계',
    general: '종합운세'
  };
  return topicNames[topic] || topic;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getMiniCardImage = (card: any): string => {
  // 카드가 객체인 경우와 ID인 경우 처리
  if (typeof card === 'object') {
    if (card.imageUrl) {
      return card.imageUrl;
    }
    // card_id로 이미지 경로 생성
    if (card.id !== undefined) {
      const cardNumber = String(card.id).padStart(2, '0');
      if (card.id <= 21) {
        // 메이저 아르카나
        return `/assets/tarot-cards/major/${cardNumber}-${card.name?.toLowerCase().replace(/\s+/g, '-') || 'card'}.png`;
      } else {
        // 마이너 아르카나 - 예시
        return `/assets/tarot-cards/minor/${cardNumber}-${card.name?.toLowerCase().replace(/\s+/g, '-') || 'card'}.png`;
      }
    }
  }
  return '/assets/tarot-cards/back.jpg'; // 기본 이미지
};

const getCardName = (card: any): string => {
  if (typeof card === 'object') {
    return card.nameKr || card.name_kr || card.card_name || card.name || '카드';
  }
  return '카드';
};

// 스프레드별 포지션 이름 가져오기
const getPositionNameForSpread = (spreadId: string, index: number): string => {
  const positions: Record<string, string[]> = {
    'one_card': ['현재 상황'],
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

const getReadingCards = (reading: ReadingHistory): any[] => {
  // reading.cards가 배열인지 확인
  if (Array.isArray(reading.cards)) {
    return reading.cards;
  }
  // 객체인 경우 배열로 변환
  if (reading.cards && typeof reading.cards === 'object') {
    return [reading.cards];
  }
  return [];
};

const getSummary = (reading: ReadingHistory): string => {
  // 오늘의 카드인 경우
  if (reading.spread_type === 'daily_card') {
    return reading.question || '오늘 하루의 운세를 보았습니다.';
  }
  
  const interpretation = getFullInterpretation(reading);
  if (interpretation) {
    // AI 해석의 첫 100자 정도를 요약으로 사용
    return interpretation.substring(0, 100) + '...';
  }
  return '카드 해석이 저장되어 있습니다.';
};

// AI 해석 전문 가져오기 함수
const getFullInterpretation = (reading: ReadingHistory): string | null => {
  // 1. ai_interpretation_text 확인 (DB에서 가져온 AI 해석)
  if (reading.ai_interpretation_text) {
    return reading.ai_interpretation_text;
  }
  
  // 2. overall_message 필드 확인 (기본 해석)
  if (reading.overall_message) {
    return reading.overall_message;
  }
  
  return null;
};

const openReading = (reading: ReadingHistory) => {
  selectedReading.value = reading;
};

const closeModal = () => {
  selectedReading.value = null;
};

const changePage = (page: number) => {
  currentPage.value = page;
};

const fetchReadings = async () => {
  if (!userStore.currentUser?.id) {
    return;
  }
  
  // 프리미엄 사용자가 아니면 읽기 차단
  if (!userStore.isPremium) {
    readings.value = [];
    return;
  }
  
  loading.value = true;
  try {
    // 1년 전 날짜 계산
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // readings 테이블과 ai_interpretations 조인해서 가져오기
    const { data, error } = await supabase
      .from('readings')
      .select(`
        *,
        ai_interpretations!ai_interpretations_reading_id_fkey (
          interpretation_text,
          custom_question,
          probability_analysis
        )
      `)
      .eq('user_id', userStore.currentUser.id)
      .gte('created_at', oneYearAgo.toISOString()) // 1년 이내 기록만
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // 데이터 구조 변환
    readings.value = (data || []).map(reading => {
      // AI 해석 병합
      let aiInterpretationText = null;
      if (reading.ai_interpretations && reading.ai_interpretations.length > 0) {
        // 가장 최근 AI 해석 사용
        aiInterpretationText = reading.ai_interpretations[0].interpretation_text;
      }
      
      // spread_type이 'daily_card'인 경우 특별 처리
      if (reading.spread_type === 'daily_card' || reading.spread_id === 'daily_card') {
        return {
          ...reading,
          spread_id: 'daily_card',  // spread_id 통일
          spread_type: 'daily_card',  // spread_type도 유지
          spread_name: '오늘의 카드',
          topic: reading.topic || 'general',
          cards: reading.cards || [],
          ai_interpretation_text: aiInterpretationText
        };
      }
      
      // spread_id를 인간 친화적인 이름으로 변환
      const spreadNames: Record<string, string> = {
        'one_card': '한 장 리딩',
        'three_card_timeline': '세 장 타임라인',
        'celtic_cross': '켈틱 크로스',
        'seven_star': '세븐스타',
        'cup_of_relationship': '컵 오브 릴레이션십'
      };
      
      // 일반 점괘 처리
      return {
        ...reading,
        spread_name: spreadNames[reading.spread_id] || reading.spread_id || reading.spread_type || '일반 점괘',
        cards: reading.cards || [],
        ai_interpretation_text: aiInterpretationText
      };
    });
    
    // 1년 지난 기록 자동 삭제 (백그라운드에서 실행)
    cleanupOldReadings();
  } catch (error) {
    console.error('Error fetching readings:', error);
  } finally {
    loading.value = false;
  }
};

// 1년 지난 기록 삭제 함수
const cleanupOldReadings = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('user_id', userStore.currentUser?.id)
      .lt('created_at', oneYearAgo.toISOString());
    
    if (error) {
      console.error('Error cleaning up old readings:', error);
    }
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
};

onMounted(async () => {
  // 로그인 체크
  if (!userStore.isLoggedIn) {
    return;
  }
  
  // 프리미엄 사용자 체크
  if (!userStore.isPremium) {
    await showAlert({
      title: '프리미엄 전용 기능',
      message: '점괘 기록 보관은 프리미엄 구독자만 이용 가능합니다.\n\n프리미엄 구독 시 1년간 점괘를 안전하게 보관할 수 있습니다.',
      confirmText: '프리미엄 구독하기',
      cancelText: '돌아가기',
      onConfirm: () => {
        router.push('/premium');
      },
      onCancel: () => {
        router.push('/app');
      }
    });
    return;
  }
  
  // 프리미엄 사용자만 기록 불러오기
  fetchReadings();
});

// 필터 변경 시 페이지 리셋
watch([selectedTopicFilter, selectedSpreadFilter, selectedDateFilter], () => {
  currentPage.value = 1;
});

// 프리미엄 상태 변경 감지
watch(() => userStore.isPremium, (isPremium) => {
  if (!isPremium) {
    // 프리미엄 해지 시 기록 페이지에서 나가기
    showAlert({
      title: '프리미엄 구독 해지',
      message: '프리미엄 구독이 해지되어 기록을 볼 수 없습니다.',
      confirmText: '확인',
      onConfirm: () => {
        router.push('/app');
      }
    });
  }
});
</script>

<style scoped>
.history {
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
  max-width: 1000px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #A855F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-prompt,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.prompt-card,
.empty-card {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}

.prompt-icon,
.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.prompt-card h2,
.empty-card h2 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #A855F7;
}

.prompt-card p,
.empty-card p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 25px;
  line-height: 1.5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-header h2 {
  color: #A855F7;
  margin: 0;
  flex-shrink: 0;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  min-width: 120px;
  max-width: 180px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.filter-select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(168, 85, 247, 0.5);
}

.filter-select:focus {
  outline: none;
  border-color: #A855F7;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
}

.filter-select option {
  background: #1E1B4B;
  color: white;
}

.readings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.reading-card {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reading-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
}

.reading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reading-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.reading-topic {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.reading-topic.love {
  background: rgba(236, 72, 153, 0.2);
  color: #EC4899;
}

.reading-topic.career {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.reading-topic.money {
  background: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

.reading-topic.general {
  background: rgba(168, 85, 247, 0.2);
  color: #A855F7;
}

.reading-content h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #A855F7;
}

.reading-summary {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 15px;
}

.cards-preview {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
}

.mini-card {
  width: 30px;
  height: 45px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.mini-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-card.reversed img {
  transform: rotate(180deg);
}

.more-cards {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 5px;
}

.reading-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
  gap: 10px;
}

.premium-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.daily-badge {
  background: linear-gradient(135deg, #FDB813 0%, #FFEB3B 100%);
  color: #1E1B4B;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(253, 184, 19, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255, 255, 255, 0.7);
}

/* 모달 스타일 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: #A855F7;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 30px;
}

.reading-info {
  margin-bottom: 30px;
}

.info-row {
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.cards-section,
.interpretation-section {
  margin-bottom: 30px;
}

.cards-section h4,
.interpretation-section h4 {
  color: #A855F7;
  margin-bottom: 20px;
}

/* 카드 섹션 스타일은 SpreadLayout 컴포넌트에서 처리함 */

.full-interpretation {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 1024px) {
  .filter-select {
    min-width: 110px;
    max-width: 150px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .readings-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .section-header h2 {
    text-align: center;
  }
  
  .filters {
    justify-content: center;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 5px;
    -webkit-overflow-scrolling: touch;
  }
  
  .filter-select {
    font-size: 13px;
    padding: 7px 10px;
    min-width: 90px;
    max-width: 120px;
    flex: 1 1 auto;
  }
  
  .cards-layout-simple {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 15px;
  }
  
  .card-image {
    width: 70px;
    height: 105px;
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style>
