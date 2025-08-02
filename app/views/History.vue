<template>
  <div class="history">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>점괘 기록</h1>
    </header>

    <div class="container">
      <div v-if="!userStore.isAuthenticated" class="login-prompt">
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
            <select v-model="selectedFilter" class="filter-select">
              <option value="all">전체</option>
              <option value="love">연애/사랑</option>
              <option value="career">직업/진로</option>
              <option value="money">금전/재물</option>
              <option value="general">종합운세</option>
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
                  v-for="(card, idx) in reading.cards.slice(0, 3)" 
                  :key="idx"
                  class="mini-card"
                  :class="{ reversed: isReversedCard(card) }"
                >
                  <img 
                    :src="getMiniCardImage(card)" 
                    :alt="card.card_name"
                    @error="handleImageError"
                  />
                </div>
                <span v-if="reading.cards.length > 3" class="more-cards">
                  +{{ reading.cards.length - 3 }}
                </span>
              </div>
            </div>
            
            <div class="reading-footer">
              <span class="card-count">{{ reading.cards.length }}장</span>
              <span v-if="reading.spread_name === '켈틱 크로스'" class="premium-badge">
                👑 프리미엄
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
              <div class="drawn-cards">
                <div 
                  v-for="(card, index) in selectedReading.cards" 
                  :key="index"
                  class="drawn-card"
                >
                  <div class="card-visual">
                    <img 
                      :src="getCardImagePath(card)" 
                      :alt="card.card_name"
                      class="card-image"
                      :class="{ reversed: isReversedCard(card) }"
                      @error="handleImageError"
                    />
                    <div class="card-orientation" :class="{ reversed: isReversedCard(card) }">
                      {{ isReversedCard(card) ? '역방향' : '정방향' }}
                    </div>
                  </div>
                  <div class="card-details">
                    <h5>{{ card.position || `카드 ${index + 1}` }}</h5>
                    <p class="card-name">{{ card.card_name }}</p>
                    <p class="card-meaning">
                      {{ isReversedCard(card) ? card.meaning_reverse : card.meaning_upright }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="selectedReading.ai_interpretation" class="interpretation-section">
              <h4>AI 종합 해석</h4>
              <p class="full-interpretation">{{ selectedReading.ai_interpretation }}</p>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { supabase } from '@/services/supabase';
import LoginModal from '@/components/LoginModal.vue';
import { getCardImagePath, isReversedCard, handleImageError } from '@/utils/cardUtils';
import type { ReadingHistory, DrawnCard } from '@/types/history';

const router = useRouter();
const userStore = useUserStore();
const showLogin = ref(false);
const selectedFilter = ref('all');
const selectedReading = ref<ReadingHistory | null>(null);
const currentPage = ref(1);
const itemsPerPage = 6;
const readings = ref<ReadingHistory[]>([]);
const loading = ref(false);

const filteredReadings = computed(() => {
  let filtered = readings.value;
  
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(reading => reading.topic === selectedFilter.value);
  }
  
  // 날짜순 정렬 (최신순)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // 페이지네이션
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  const filtered = readings.value.filter(reading => 
    selectedFilter.value === 'all' || reading.topic === selectedFilter.value
  );
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

const getMiniCardImage = (card: DrawnCard): string => {
  return getCardImagePath(card);
};

const getSummary = (reading: ReadingHistory): string => {
  if (reading.ai_interpretation) {
    // AI 해석의 첫 100자 정도를 요약으로 사용
    return reading.ai_interpretation.substring(0, 100) + '...';
  }
  return '카드 해석이 저장되어 있습니다.';
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
  if (!userStore.user?.id) return;
  
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('reading_history')
      .select(`
        *,
        cards:reading_cards(
          *,
          card:tarot_cards(*)
        )
      `)
      .eq('user_id', userStore.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // 데이터 구조 변환
    readings.value = (data || []).map(reading => ({
      ...reading,
      cards: reading.cards.map((rc: any) => ({
        ...rc.card,
        position: rc.position,
        card_name: rc.card.name_kr,
        is_reversed: rc.is_reversed
      }))
    }));
  } catch (error) {
    console.error('Error fetching readings:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchReadings();
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
}

.section-header h2 {
  color: #A855F7;
  margin: 0;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
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

.drawn-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawn-card {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.card-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.card-image {
  width: 60px;
  height: 90px;
  object-fit: contain;
  border-radius: 4px;
}

.card-image.reversed {
  transform: rotate(180deg);
}

.card-orientation {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.card-details {
  flex: 1;
}

.card-details h5 {
  color: #A855F7;
  margin-bottom: 5px;
  font-size: 14px;
}

.card-name {
  font-weight: 600;
  margin-bottom: 8px;
}

.card-meaning {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
}

.full-interpretation {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  white-space: pre-wrap;
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
  
  .drawn-card {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style>
