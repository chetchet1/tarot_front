<template>
  <div class="reading-select">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>타로 점보기</h1>
    </header>

    <div class="container">
      <!-- 주제 선택 -->
      <section class="section">
        <h2 class="section-title">점보고 싶은 주제를 선택하세요</h2>
        <div class="topic-grid">
          <div 
            v-for="topic in topics" 
            :key="topic.id"
            class="topic-card card"
            :class="{ 
              selected: selectedTopic === topic.id,
              premium: topic.id === 'custom' && !userStore.isPremium
            }"
            @click="selectTopic(topic.id)"
          >
            <div class="topic-icon">{{ topic.icon }}</div>
            <h3>
              {{ topic.name }}
              <span v-if="topic.id === 'custom'" class="premium-badge">👑</span>
            </h3>
            <p v-if="topic.id === 'custom' && customQuestion">
              {{ customQuestion }}
            </p>
            <p v-else>{{ topic.description }}</p>
          </div>
        </div>
      </section>

      <!-- 스프레드 선택 -->
      <section class="section">
        <h2 class="section-title">카드 배열법을 선택하세요</h2>
        <div v-if="selectedTopic === 'custom'" class="custom-notice">
          <p>💫 커스텀 질문에는 가장 상세한 답변을 제공하는 켈틱 크로스 배열법을 사용합니다.</p>
        </div>
        
        <!-- 무료 사용자 유료 배열 안내 -->
        <div v-if="!userStore.isPremium" class="premium-spread-notice">
          <p class="notice-text">
            <span class="icon">ℹ️</span>
            {{ getFreeUserMessage() }}
          </p>
          <p v-if="hasUsedPremiumSpreadToday()" class="reset-time">
            다음 무료 이용: {{ getTimeUntilReset() }} 후
          </p>
        </div>
        <div class="spread-grid">
          <div 
            v-for="spread in spreads" 
            :key="spread.id"
            class="spread-card card"
            :class="{ 
              selected: selectedSpread === spread.id,
              premium: spread.isPremium && !userStore.isPremium,
              updating: spread.id === 'seven_star' || spread.id === 'cup_of_relationship'
            }"
            @click="selectSpread(spread)"
          >
            <div class="spread-header">
              <h3>{{ spread.name }}</h3>
              <span v-if="spread.isPremium && !userStore.isPremium" class="premium-badge">👑</span>
            </div>
            <p class="spread-description">{{ spread.description }}</p>
            <div class="spread-info">
              <span class="card-count">카드 {{ spread.cardCount }}장</span>
              <span class="difficulty" :class="spread.difficulty">
                {{ getDifficultyText(spread.difficulty) }}
              </span>
            </div>
            <div v-if="spread.isPremium && !userStore.isPremium && !canUsePremiumSpread(spread.id, userStore.isPremium)" class="premium-overlay">
              <p>오늘 이미 사용</p>
            </div>
            <div v-else-if="spread.isPremium && !userStore.isPremium && canUsePremiumSpread(spread.id, userStore.isPremium)" class="free-badge">
              <span>오늘 1회 무료</span>
            </div>
            <div v-else-if="spread.id === 'seven_star' || spread.id === 'cup_of_relationship'" class="updating-overlay">
              <p>🔄 업데이트 중</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 선택 요약 -->
      <section class="selection-summary" v-if="selectedTopic && selectedSpread">
        <div class="summary-card card">
          <h3>선택하신 점괘</h3>
          <div class="summary-details">
            <div class="summary-item">
              <strong>주제:</strong> {{ getTopicName(selectedTopic) }}
            </div>
            <div class="summary-item">
              <strong>배열법:</strong> {{ getSpreadName(selectedSpread) }}
            </div>
            <div class="summary-item">
              <strong>카드 수:</strong> {{ getSpreadCardCount(selectedSpread) }}장
            </div>
          </div>
        </div>
      </section>

      <!-- 시작 버튼 -->
      <div class="action-section">
        <button 
          class="btn btn-primary start-button"
          :disabled="!canStartReading"
          @click="startReading"
        >
          {{ getStartButtonText() }}
        </button>
        
        <div v-if="!userStore.isPremium" class="free-usage-info">
          <p>{{ userStore.currentUser?.isAnonymous ? '익명 사용자' : '무료 사용자' }}</p>
          <router-link to="/premium" class="premium-link">
            프리미엄으로 업그레이드하고 무제한 이용하기
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 질문 입력 모달 -->
    <CustomQuestionModal
      v-if="showQuestionModal"
      :is-open="showQuestionModal"
      @close="handleQuestionCancel"
      @confirm="handleQuestionConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { getSpreadsByTopic, getSpreadById } from '../data/spreads';
import CustomQuestionModal from '../components/CustomQuestionModal.vue';
import { 
  canUsePremiumSpread, 
  recordPremiumSpreadUsage,
  hasUsedPremiumSpreadToday,
  getFreeUserMessage,
  getTimeUntilReset,
  isPremiumSpread
} from '../utils/premiumSpreadTracker';

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Spread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
}

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const selectedTopic = ref<string>('');
const selectedSpread = ref<string>('');
const showQuestionModal = ref(false);
const customQuestion = ref<string>('');

// 주제 목록
const topics = computed<Topic[]>(() => {
  const baseTopics = [
    {
      id: 'love',
      name: '연애/사랑',
      description: '연인, 짝사랑, 이별 등 사랑에 관한 고민',
      icon: '💕'
    },
    {
      id: 'career',
      name: '직업/진로',
      description: '취업, 이직, 승진, 사업 등 일에 관한 고민',
      icon: '💼'
    },
    {
      id: 'money',
      name: '금전/재물',
      description: '투자, 재정관리, 금전운 등 돈에 관한 고민',
      icon: '💰'
    },
    {
      id: 'health',
      name: '건강/관계',
      description: '건강, 인간관계, 가족 등에 관한 고민',
      icon: '🌿'
    },
    {
      id: 'general',
      name: '종합운세',
      description: '전반적인 운세와 앞으로의 길잡이',
      icon: '🔮'
    }
  ];

  // 프리미엄 사용자만 커스텀 질문 추가
  if (userStore.isPremium) {
    baseTopics.push({
      id: 'custom',
      name: '질문 직접 입력',
      description: '구체적인 질문을 직접 입력해서 물어보세요',
      icon: '✍️'
    });
  }

  return baseTopics;
});

// 스프레드 목록 (동적 생성)
const spreads = computed(() => {
  if (!selectedTopic.value) return [];
  
  // 커스텀 질문인 경우 켈틱 크로스만 표시
  if (selectedTopic.value === 'custom') {
    const celticCross = getSpreadById('celtic_cross');
    if (celticCross) {
      return [{
        id: celticCross.spreadId,
        name: celticCross.nameKr,
        description: celticCross.description,
        cardCount: celticCross.cardCount,
        difficulty: 'hard',
        isPremium: celticCross.isPremium
      }];
    }
    return [];
  }
  
  // 일반 주제인 경우 기존 로직 사용
  return getSpreadsByTopic(selectedTopic.value).map(spread => ({
    id: spread.spreadId,
    name: spread.nameKr,
    description: spread.description,
    cardCount: spread.cardCount,
    difficulty: spread.cardCount <= 1 ? 'easy' : spread.cardCount <= 3 ? 'medium' : 'hard',
    isPremium: spread.isPremium
  }));
});

const canStartReading = computed(() => {
  if (!selectedTopic.value || !selectedSpread.value) return false;
  
  // 세븐스타와 릴레이션십 배열법은 업데이트 중
  if (selectedSpread.value === 'seven_star' || selectedSpread.value === 'cup_of_relationship') {
    return false;
  }
  
  // 커스텀 질문인 경우 켈틱 크로스만 확인
  if (selectedTopic.value === 'custom') {
    const spread = getSpreadById(selectedSpread.value);
    if (!spread) return false;
    
    // 프리미엄 스프레드인데 프리미엄이 아닌 경우
    if (spread.isPremium && !userStore.isPremium) return false;
    
    return true;
  }
  
  // 일반 주제인 경우 기존 로직 사용
  const spread = getSpreadsByTopic(selectedTopic.value).find(s => s.spreadId === selectedSpread.value);
  if (!spread) return false;
  
  // 프리미엄 스프레드인데 프리미엄이 아닌 경우
  if (spread.isPremium && !userStore.isPremium) {
    // 무료 사용자의 유료 배열 사용 가능 여부 확인
    return canUsePremiumSpread(selectedSpread.value, userStore.isPremium);
  }
  
  return true;
});

const selectTopic = (topicId: string) => {
  if (topicId === 'custom') {
    if (!userStore.isPremium) {
      router.push('/premium');
      return;
    }
    showQuestionModal.value = true;
  } else {
    selectedTopic.value = topicId;
    customQuestion.value = '';
  }
};

const handleQuestionConfirm = (question: string) => {
  customQuestion.value = question;
  selectedTopic.value = 'custom';
  showQuestionModal.value = false;
};

const handleQuestionCancel = () => {
  showQuestionModal.value = false;
  if (selectedTopic.value === 'custom' && !customQuestion.value) {
    selectedTopic.value = '';
  }
};

const selectSpread = (spread: Spread) => {
  // 세븐스타와 릴레이션쉽 배열법 확인
  if (spread.id === 'seven_star' || spread.id === 'cup_of_relationship') {
    alert(`${spread.name} 배열법은 현재 업데이트 중입니다!\n\n빠른 시일 내에 서비스를 재개할 예정입니다.`);
    return;
  }
  
  if (spread.isPremium && !userStore.isPremium) {
    // 무료 사용자가 유료 배열을 사용할 수 있는지 확인
    if (!canUsePremiumSpread(spread.id, userStore.isPremium)) {
      alert(`오늘의 무료 유료 배열을 이미 사용하셨습니다.\n\n프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.`);
      return;
    }
  }
  selectedSpread.value = spread.id;
};

const getTopicName = (topicId: string) => {
  if (topicId === 'custom' && customQuestion.value) {
    return `질문: ${customQuestion.value.substring(0, 30)}${customQuestion.value.length > 30 ? '...' : ''}`;
  }
  return topics.value.find(t => t.id === topicId)?.name || '';
};

const getSpreadName = (spreadId: string) => {
  // 커스텀 질문인 경우 직접 스프레드 찾기
  if (selectedTopic.value === 'custom') {
    const spread = getSpreadById(spreadId);
    return spread?.nameKr || '';
  }
  
  // 일반 주제인 경우 기존 로직 사용
  const spread = getSpreadsByTopic(selectedTopic.value || 'general').find(s => s.spreadId === spreadId);
  return spread?.nameKr || '';
};

const getSpreadCardCount = (spreadId: string) => {
  // 커스텀 질문인 경우 직접 스프레드 찾기
  if (selectedTopic.value === 'custom') {
    const spread = getSpreadById(spreadId);
    return spread?.cardCount || 0;
  }
  
  // 일반 주제인 경우 기존 로직 사용
  const spread = getSpreadsByTopic(selectedTopic.value || 'general').find(s => s.spreadId === spreadId);
  return spread?.cardCount || 0;
};

const getDifficultyText = (difficulty: string) => {
  const difficultyMap = {
    easy: '초급',
    medium: '중급',
    hard: '고급'
  };
  return difficultyMap[difficulty as keyof typeof difficultyMap] || '';
};

const getStartButtonText = () => {
  if (!selectedTopic.value || !selectedSpread.value) {
    return '주제와 배열법을 선택하세요';
  }
  
  const spread = spreads.value.find(s => s.id === selectedSpread.value);
  if (spread?.isPremium && !userStore.isPremium) {
    if (!canUsePremiumSpread(selectedSpread.value, userStore.isPremium)) {
      return '오늘 이미 사용 (내일 다시 이용 가능)';
    }
    return '오늘 1회 무료로 시작하기';
  }
  
  return '카드 뽑기 시작';
};

const startReading = async () => {
  if (!canStartReading.value) return;
  
  // 세븐스타와 릴레이션쉽 배열법 확인
  if (selectedSpread.value === 'seven_star' || selectedSpread.value === 'cup_of_relationship') {
    const spreadName = getSpreadName(selectedSpread.value);
    alert(`${spreadName} 배열법은 현재 업데이트 중입니다!\n\n빠른 시일 내에 서비스를 재개할 예정입니다.`);
    return;
  }
  
  const selectedTopicData = topics.value.find(t => t.id === selectedTopic.value);
  let selectedSpreadData;
  
  // 커스텀 질문인 경우 직접 스프레드 찾기
  if (selectedTopic.value === 'custom') {
    selectedSpreadData = getSpreadById(selectedSpread.value);
  } else {
    selectedSpreadData = getSpreadsByTopic(selectedTopic.value).find(s => s.spreadId === selectedSpread.value);
  }
  
  if (selectedTopicData && selectedSpreadData) {
    try {
      // 무료 사용자가 유료 배열을 사용하는 경우 기록
      if (!userStore.isPremium && isPremiumSpread(selectedSpread.value)) {
        recordPremiumSpreadUsage(selectedSpread.value);
      }
      
      // 선택 정보를 스토어에 저장
      tarotStore.setSelectedTopic(selectedTopicData);
      tarotStore.setSelectedSpread(selectedSpreadData);
      
      // 커스텀 질문이 있다면 저장
      if (selectedTopic.value === 'custom' && customQuestion.value) {
        tarotStore.setCustomQuestion(customQuestion.value);
      } else {
        tarotStore.setCustomQuestion('');
      }
      
      console.log('선택된 주제:', selectedTopicData);
      console.log('선택된 스프레드:', selectedSpreadData);
      console.log('커스텀 질문:', customQuestion.value);
      
      // 카드 뽑기 페이지로 이동
      await router.push('/card-drawing');
    } catch (error) {
      console.error('라우팅 오류:', error);
      // 페이지 새로고침으로 대체
      window.location.href = '/card-drawing';
    }
  }
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.reading-select {
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

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  color: #A855F7;
}

.topic-grid,
.spread-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.topic-card,
.spread-card {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.topic-card:hover,
.spread-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
}

.topic-card.selected,
.spread-card.selected {
  background: rgba(168, 85, 247, 0.2);
  border-color: #A855F7;
}

.topic-icon {
  font-size: 32px;
  text-align: center;
  margin-bottom: 15px;
}

.topic-card h3,
.spread-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
}

.topic-card p,
.spread-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  line-height: 1.4;
}

.spread-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.spread-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size: 12px;
}

.card-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.difficulty {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.difficulty.easy {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.difficulty.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

.difficulty.hard {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.spread-card.premium {
  opacity: 0.7;
}

.spread-card.updating {
  opacity: 0.6;
  cursor: not-allowed;
}

.premium-overlay,
.updating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  backdrop-filter: blur(5px);
}

.premium-overlay p {
  color: #F59E0B;
  font-weight: 600;
}

.updating-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.updating-overlay p {
  color: #94A3B8;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.selection-summary {
  margin-bottom: 30px;
}

.summary-card {
  padding: 20px;
  text-align: center;
}

.summary-card h3 {
  margin-bottom: 15px;
  color: #A855F7;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  font-size: 14px;
}

.action-section {
  text-align: center;
}

.start-button {
  padding: 15px 30px;
  font-size: 18px;
  margin-bottom: 20px;
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.free-usage-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 12px;
  font-size: 14px;
}

.free-usage-info p {
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.premium-link {
  color: #F59E0B;
  text-decoration: none;
  font-weight: 600;
}

.premium-link:hover {
  text-decoration: underline;
}

.custom-notice {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.custom-notice p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
}

/* 무료 사용자 유료 배열 안내 */
.premium-spread-notice {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.premium-spread-notice .notice-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
}

.premium-spread-notice .icon {
  font-size: 18px;
}

.premium-spread-notice .reset-time {
  margin-top: 8px;
  color: #F59E0B;
  font-weight: 600;
  font-size: 13px;
}

/* 무료 사용 가능 배지 */
.free-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #10B981, #34D399);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; box-shadow: 0 2px 12px rgba(16, 185, 129, 0.5); }
}

/* 프리미엄 배지 강조 */
.premium-badge {
  display: inline-block;
  margin-left: 4px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@media (max-width: 768px) {
  .topic-grid,
  .spread-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-details {
    text-align: left;
  }
}
</style>
