<template>
  <div class="event-list-container">
    <!-- 헤더 -->
    <header class="event-header-bar">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="header-title">🎉 진행 중인 이벤트</h1>
      <div class="header-spacer"></div>
    </header>
    
    <!-- 이벤트 참여 요약 -->
    <div v-if="userParticipations.length > 0" class="participation-summary">
      <h3>내 참여 현황</h3>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">참여 이벤트</span>
          <span class="stat-value">{{ userParticipations.length }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">총 응모권</span>
          <span class="stat-value">{{ totalEntries }}개</span>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>이벤트를 불러오는 중...</p>
    </div>

    <!-- 이벤트 목록 -->
    <div v-else-if="activeEvents.length > 0" class="events-grid">
      <div 
        v-for="event in activeEvents" 
        :key="event.id"
        class="event-card"
        @click="goToEventDetail(event.id)"
      >
        <!-- 이벤트 배너 이미지 -->
        <div v-if="event.image_url" class="event-image">
          <img :src="event.image_url" :alt="event.title" />
        </div>
        
        <!-- 이벤트 정보 -->
        <div class="event-content">
          <div class="event-header">
            <h2 class="event-title">{{ event.title }}</h2>
            <span :class="['event-type', `type-${event.event_type}`]">
              {{ getEventTypeLabel(event.event_type) }}
            </span>
          </div>
          
          <p class="event-description">{{ event.description }}</p>
          
          <!-- 이벤트 기간 -->
          <div class="event-period">
            <span>📅 {{ formatDate(event.start_date) }} ~ {{ formatDate(event.end_date) }}</span>
          </div>
          
          <!-- 참여 상태 -->
          <div v-if="isParticipated(event.id)" class="participation-status">
            <span>✅ 참여 완료 ({{ getParticipationCount(event.id) }}회)</span>
          </div>
          
          <!-- 자동 응모 표시 -->
          <div v-if="event.event_type === 'auto'" class="auto-entry-badge">
            <span>⚡ 조건 충족 시 자동 응모</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 이벤트가 없을 때 -->
    <div v-else class="empty-state">
      <span class="empty-icon">📆</span>
      <h3>현재 진행 중인 이벤트가 없습니다</h3>
      <p>새로운 이벤트를 준비 중이니 조금만 기다려주세요!</p>
    </div>

    <!-- 당첨 내역 -->
    <div v-if="userWinnings.length > 0" class="winnings-section">
      <h2>🏆 당첨 내역</h2>
      <div class="winnings-list">
        <div v-for="winning in userWinnings" :key="winning.id" class="winning-item">
          <div class="winning-info">
            <h4>{{ winning.event.title }}</h4>
            <p class="winning-date">{{ formatDate(winning.won_at) }} 당첨</p>
          </div>
          <div class="winning-reward">
            <span v-if="winning.coupon" class="coupon-value">
              {{ winning.coupon.value }}
            </span>
            <button 
              v-if="!winning.is_claimed && winning.coupon"
              @click="claimReward(winning.id)"
              class="claim-button"
            >
              수령하기
            </button>
            <span v-else-if="winning.is_claimed" class="claimed-badge">
              수령 완료
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { eventService, type Event } from '../services/EventService';
import { supabase } from '../services/supabase';
import { showAlert } from '../utils/alerts';

const router = useRouter();
const isLoading = ref(true);
const activeEvents = ref<Event[]>([]);
const userParticipations = ref<any[]>([]);
const userWinnings = ref<any[]>([]);

// 뒤로가기
const goBack = () => {
  router.back();
};

// 총 응모권 수 계산
const totalEntries = computed(() => {
  return userParticipations.value.reduce((sum, p) => sum + p.bonus_entries, 0);
});

// 이벤트 타입 라벨
const getEventTypeLabel = (type: string) => {
  switch (type) {
    case 'auto': return '자동 응모';
    case 'manual': return '수동 참여';
    case 'hybrid': return '자동+보너스';
    default: return type;
  }
};

// 날짜 포맷
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric'
  });
};

// 참여 여부 확인
const isParticipated = (eventId: string) => {
  return userParticipations.value.some(p => p.event_id === eventId);
};

// 참여 횟수 조회
const getParticipationCount = (eventId: string) => {
  return userParticipations.value
    .filter(p => p.event_id === eventId)
    .length;
};

// 이벤트 상세 페이지로 이동
const goToEventDetail = (eventId: string) => {
  router.push(`/events/${eventId}`);
};

// 보상 수령
const claimReward = async (winningId: string) => {
  try {
    const { error } = await supabase
      .from('event_winners')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString()
      })
      .eq('id', winningId);

    if (!error) {
      // 당첨 내역 새로고침
      await loadUserWinnings();
      
      // 성공 메시지 표시
      await showAlert({
        title: '수령 완료',
        message: '쿠폰이 성공적으로 수령되었습니다!'
      });
    }
  } catch (error) {
    console.error('보상 수령 실패:', error);
  }
};

// 데이터 로드
const loadData = async () => {
  isLoading.value = true;
  
  try {
    // 활성 이벤트 조회
    activeEvents.value = await eventService.getActiveEvents();
    
    // 로그인한 사용자의 참여 내역 조회
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await Promise.all([
        loadUserParticipations(user.id),
        loadUserWinnings()
      ]);
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

// 사용자 참여 내역 로드
const loadUserParticipations = async (userId: string) => {
  userParticipations.value = await eventService.getUserParticipations(userId);
};

// 사용자 당첨 내역 로드
const loadUserWinnings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userWinnings.value = await eventService.getUserWinnings(user.id);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.event-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  min-height: 100vh;
}

/* 헤더 */
.event-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(15, 10, 40, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-spacer {
  width: 40px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

/* 참여 요약 */
.participation-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 20px 30px;
}

.participation-summary h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.summary-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 이벤트 그리드 */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 0 20px;
}

.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-content {
  padding: 20px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.event-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.event-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.event-type.type-auto {
  background: #e3f2fd;
  color: #1976d2;
}

.event-type.type-manual {
  background: #f3e5f5;
  color: #7b1fa2;
}

.event-type.type-hybrid {
  background: #e8f5e9;
  color: #388e3c;
}

.event-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.event-period {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
}

.participation-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #4caf50;
  font-size: 14px;
  font-weight: 500;
}


.auto-entry-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff3e0;
  color: #f57c00;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 12px;
  margin-top: 10px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 20px;
  display: block;
}

.empty-state h3 {
  font-size: 20px;
  color: #666;
  margin-bottom: 10px;
}

.empty-state p {
  color: #999;
  font-size: 14px;
}

/* 당첨 내역 */
.winnings-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #eee;
}

.winnings-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
}

.winnings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.winning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.winning-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.winning-date {
  color: #999;
  font-size: 14px;
}

.winning-reward {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coupon-value {
  font-weight: bold;
  color: #667eea;
}

.claim-button {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.claim-button:hover {
  background: #5a67d8;
}

.claimed-badge {
  padding: 4px 8px;
  background: #e8f5e9;
  color: #4caf50;
  border-radius: 4px;
  font-size: 14px;
}

/* 반응형 */
@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-stats {
    justify-content: space-around;
  }
}
</style>