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
                {{ formatDate(reading.date) }}
              </div>
              <div class="reading-topic" :class="reading.topic">
                {{ getTopicName(reading.topic) }}
              </div>
            </div>
            
            <div class="reading-content">
              <h3>{{ reading.spreadName }}</h3>
              <p class="reading-summary">{{ reading.summary }}</p>
              
              <div class="cards-preview">
                <div 
                  v-for="card in reading.cards.slice(0, 3)" 
                  :key="card.id"
                  class="mini-card"
                  :class="card.orientation"
                >
                  🃏
                </div>
                <span v-if="reading.cards.length > 3" class="more-cards">
                  +{{ reading.cards.length - 3 }}
                </span>
              </div>
            </div>
            
            <div class="reading-footer">
              <span class="card-count">{{ reading.cards.length }}장</span>
              <span class="accuracy" v-if="reading.accuracy">
                정확도: {{ reading.accuracy }}%
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
            <h2>{{ selectedReading.spreadName }}</h2>
            <button class="close-button" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="reading-info">
              <div class="info-row">
                <strong>날짜:</strong> {{ formatDateTime(selectedReading.date) }}
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
                    <div class="card-image">🃏</div>
                    <div class="card-orientation" :class="card.orientation">
                      {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
                    </div>
                  </div>
                  <div class="card-details">
                    <h5>{{ card.position || `카드 ${index + 1}` }}</h5>
                    <p class="card-name">{{ card.nameKr }}</p>
                    <p class="card-meaning">{{ card.interpretation }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="interpretation-section">
              <h4>종합 해석</h4>
              <p class="full-interpretation">{{ selectedReading.fullInterpretation }}</p>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import LoginModal from '@/components/LoginModal.vue';

interface ReadingCard {
  id: number;
  nameKr: string;
  orientation: 'upright' | 'reversed';
  position?: string;
  interpretation: string;
}

interface Reading {
  id: string;
  date: Date;
  topic: string;
  spreadName: string;
  question?: string;
  cards: ReadingCard[];
  summary: string;
  fullInterpretation: string;
  accuracy?: number;
}

const router = useRouter();
const userStore = useUserStore();
const showLogin = ref(false);
const selectedFilter = ref('all');
const selectedReading = ref<Reading | null>(null);
const currentPage = ref(1);
const itemsPerPage = 6;

// 임시 점괘 기록 데이터 (실제로는 백엔드에서 가져옴)
const readings = ref<Reading[]>([
  {
    id: '1',
    date: new Date('2024-07-25'),
    topic: 'love',
    spreadName: '세 장 뽑기',
    question: '현재 연애 상황은?',
    cards: [
      {
        id: 1,
        nameKr: '바보',
        orientation: 'upright',
        position: '과거',
        interpretation: '새로운 시작과 순수한 마음으로 사랑을 시작했습니다.'
      },
      {
        id: 2,
        nameKr: '연인',
        orientation: 'upright',
        position: '현재',
        interpretation: '현재 관계에서 깊은 유대감과 조화를 경험하고 있습니다.'
      },
      {
        id: 3,
        nameKr: '별',
        orientation: 'upright',
        position: '미래',
        interpretation: '희망과 치유가 가득한 밝은 미래가 기다리고 있습니다.'
      }
    ],
    summary: '과거의 순수한 시작이 현재의 조화로운 관계로 이어지고, 미래에는 더욱 희망적인 발전이 예상됩니다.',
    fullInterpretation: '당신의 연애는 매우 긍정적인 방향으로 흘러가고 있습니다. 바보 카드는 관계의 시작이 순수하고 진실했음을 나타내며, 연인 카드는 현재 서로에 대한 깊은 이해와 사랑이 있음을 보여줍니다. 별 카드는 미래에 대한 희망과 치유, 그리고 영적인 성장을 암시합니다.',
    accuracy: 85
  },
  {
    id: '2',
    date: new Date('2024-07-20'),
    topic: 'career',
    spreadName: '한 장 뽑기',
    cards: [
      {
        id: 64,
        nameKr: '펜타클의 에이스',
        orientation: 'upright',
        interpretation: '새로운 직업적 기회와 물질적 풍요가 찾아올 것입니다.'
      }
    ],
    summary: '새로운 직업적 기회가 다가오고 있으며, 물질적 성공의 가능성이 높습니다.',
    fullInterpretation: '펜타클의 에이스는 새로운 직업적 기회, 승진, 또는 사업의 성공을 나타냅니다. 이는 당신의 노력이 곧 구체적인 결과로 나타날 것임을 의미합니다.',
    accuracy: 92
  }
]);

const filteredReadings = computed(() => {
  let filtered = readings.value;
  
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(reading => reading.topic === selectedFilter.value);
  }
  
  // 날짜순 정렬 (최신순)
  filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (date: Date) => {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openReading = (reading: Reading) => {
  selectedReading.value = reading;
};

const closeModal = () => {
  selectedReading.value = null;
};

const changePage = (page: number) => {
  currentPage.value = page;
};
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
  width: 20px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.mini-card.upright {
  color: #22C55E;
}

.mini-card.reversed {
  color: #EF4444;
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
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
}

.card-orientation {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.card-orientation.upright {
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
