<template>
  <div class="event-detail-container">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>이벤트 정보를 불러오는 중...</p>
    </div>

    <!-- 이벤트 상세 -->
    <div v-else-if="event" class="event-detail">
      <!-- 뒤로가기 버튼 -->
      <button @click="goBack" class="back-button">
        <Icon name="arrow-left" />
        이벤트 목록
      </button>

      <!-- 이벤트 헤더 -->
      <div class="event-header">
        <div v-if="event.image_url" class="event-banner">
          <img :src="event.image_url" :alt="event.title" />
        </div>
        
        <div class="event-info">
          <div class="event-title-row">
            <h1 class="event-title">{{ event.title }}</h1>
            <span :class="['event-type', `type-${event.event_type}`]">
              {{ getEventTypeLabel(event.event_type) }}
            </span>
          </div>
          
          <p class="event-description">{{ event.description }}</p>
          
          <div class="event-meta">
            <div class="meta-item">
              <Icon name="calendar" />
              <span>{{ formatPeriod(event.start_date, event.end_date) }}</span>
            </div>
            <div class="meta-item">
              <Icon name="trophy" />
              <span>최대 {{ event.max_winners }}명 당첨</span>
            </div>
            <div v-if="daysRemaining >= 0" class="meta-item">
              <Icon name="clock" />
              <span>{{ daysRemaining }}일 남음</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 참여 조건 -->
      <div class="condition-section">
        <h2>📋 참여 조건</h2>
        <div class="condition-content">
          <div v-if="event.event_type === 'auto'" class="auto-condition">
            <Icon name="lightning" class="auto-icon" />
            <div>
              <h3>자동 응모 조건</h3>
              <p>{{ getConditionDescription() }}</p>
            </div>
          </div>
          
          <div v-if="event.event_type === 'hybrid'" class="bonus-condition">
            <Icon name="plus-circle" class="bonus-icon" />
            <div>
              <h3>보너스 응모</h3>
              <p>{{ getBonusDescription() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 내 참여 현황 -->
      <div v-if="userParticipations.length > 0" class="my-participation">
        <h2>🎯 내 참여 현황</h2>
        <div class="participation-list">
          <div v-for="participation in userParticipations" :key="participation.id" class="participation-item">
            <div class="participation-date">
              {{ formatDate(participation.participation_date) }}
            </div>
            <div class="participation-method">
              <span v-if="participation.auto_qualified" class="method-badge auto">
                자동 응모
              </span>
              <span v-else class="method-badge bonus">
                보너스 응모
              </span>
            </div>
            <div class="participation-entries">
              응모권 {{ participation.bonus_entries }}개
            </div>
          </div>
        </div>
        <div class="total-entries">
          <strong>총 응모권:</strong> {{ totalEntries }}개
        </div>
      </div>

      <!-- 참여하기 버튼 (수동 이벤트) -->
      <div v-if="event.event_type === 'manual' && !hasParticipatedToday" class="action-section">
        <button @click="participateManually" class="participate-button">
          이벤트 참여하기
        </button>
      </div>

      <!-- 보너스 응모 버튼 (하이브리드 이벤트) -->
      <div v-if="event.event_type === 'hybrid'" class="action-section">
        <button @click="addBonusEntry" class="bonus-button">
          <Icon name="plus" />
          보너스 응모권 받기
        </button>
        <p class="action-hint">게시판에 인증글을 작성하면 응모권을 추가로 받을 수 있습니다!</p>
      </div>

      <!-- 자동 응모 안내 -->
      <div v-if="event.event_type === 'auto' && !hasParticipatedToday" class="auto-entry-notice">
        <Icon name="info-circle" />
        <p>조건을 충족하면 자동으로 응모됩니다. 별도의 참여 신청이 필요하지 않습니다.</p>
      </div>

      <!-- 이미 참여한 경우 -->
      <div v-if="hasParticipatedToday" class="already-participated">
        <Icon name="check-circle" class="check-icon" />
        <p>오늘 이미 참여하셨습니다! 내일 다시 참여해주세요.</p>
      </div>

      <!-- 당첨자 발표 -->
      <div v-if="winners.length > 0" class="winners-section">
        <h2>🏆 당첨자 발표</h2>
        <div class="winners-list">
          <div v-for="winner in winners" :key="winner.id" class="winner-item">
            <div class="winner-info">
              <span class="winner-rank">{{ winner.rank }}</span>
              <span class="winner-name">{{ maskUserId(winner.user_id) }}</span>
            </div>
            <div class="winner-prize">
              {{ winner.coupon?.value || '미정' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이벤트를 찾을 수 없음 -->
    <div v-else class="not-found">
      <Icon name="alert-circle" class="alert-icon" />
      <h2>이벤트를 찾을 수 없습니다</h2>
      <button @click="goBack" class="back-button-center">
        이벤트 목록으로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { eventService, type Event } from '../services/EventService';
import { supabase } from '../services/supabase';
import { Icon } from '@iconify/vue';
import { showAlert } from '../composables/useCustomAlert';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const event = ref<Event | null>(null);
const userParticipations = ref<any[]>([]);
const winners = ref<any[]>([]);

// 총 응모권 수
const totalEntries = computed(() => {
  return userParticipations.value.reduce((sum, p) => sum + p.bonus_entries, 0);
});

// 오늘 참여 여부
const hasParticipatedToday = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return userParticipations.value.some(p => 
    p.participation_date === today
  );
});

// 남은 일수 계산
const daysRemaining = computed(() => {
  if (!event.value) return -1;
  
  const end = new Date(event.value.end_date);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diff);
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

// 조건 설명 생성
const getConditionDescription = () => {
  if (!event.value) return '';
  
  const condition = event.value.condition_data;
  
  switch (event.value.condition_type) {
    case 'specific_card':
      return `오늘의 카드에서 "${condition.card_name}" 카드가 나오면 자동 응모됩니다.`;
    case 'lucky_color_match':
      return `오늘의 행운 색상이 "${condition.target_color}"이면 자동 응모됩니다.`;
    case 'lucky_number':
      return `오늘의 행운 숫자가 "${condition.target_number}"이면 자동 응모됩니다.`;
    case 'consecutive_days':
      return `${condition.target_days}일 연속으로 오늘의 카드를 뽑으면 자동 응모됩니다.`;
    case 'specific_card_in_spread':
      return `타로 점술에서 "${condition.card_name}" 카드가 나오면 자동 응모됩니다.`;
    case 'premium_spread_use':
      return `${condition.spread_type} 배열법을 사용하면 자동 응모됩니다.`;
    default:
      return '특정 조건을 충족하면 자동으로 응모됩니다.';
  }
};

// 보너스 설명 생성
const getBonusDescription = () => {
  if (!event.value) return '';
  
  const condition = event.value.condition_data;
  
  if (condition.bonus_method === 'post_screenshot') {
    return '게시판에 스크린샷을 인증하면 응모권을 추가로 받을 수 있습니다.';
  } else if (condition.bonus_method === 'color_proof') {
    return `${condition.target_color} 색상 아이템 사진을 게시판에 올리면 응모권 ${condition.bonus_multiplier}배!`;
  } else {
    return '게시판에 인증글을 작성하면 추가 응모권을 받을 수 있습니다.';
  }
};

// 날짜 포맷
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  });
};

// 기간 포맷
const formatPeriod = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString('ko-KR')} ~ ${end.toLocaleDateString('ko-KR')}`;
};

// 사용자 ID 마스킹
const maskUserId = (userId: string) => {
  // 이메일이면 마스킹
  if (userId.includes('@')) {
    const [name, domain] = userId.split('@');
    const masked = name.substring(0, 3) + '***';
    return `${masked}@${domain}`;
  }
  // UUID면 앞 8자리만 표시
  return userId.substring(0, 8) + '***';
};

// 뒤로가기
const goBack = () => {
  router.push('/events');
};

// 수동 참여
const participateManually = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await showAlert({
        title: '로그인 필요',
        message: '이벤트 참여를 위해 로그인이 필요합니다.'
      });
      return;
    }

    // 수동 참여 처리
    const success = await eventService.addBonusEntry(
      user.id,
      event.value!.id,
      { method: 'manual', timestamp: new Date().toISOString() }
    );

    if (success) {
      await showAlert({
        title: '참여 완료!',
        message: '이벤트에 성공적으로 참여하셨습니다.'
      });
      
      // 참여 내역 새로고침
      await loadUserParticipations(user.id);
    }
  } catch (error) {
    console.error('참여 실패:', error);
    await showAlert({
      title: '참여 실패',
      message: '이벤트 참여 중 오류가 발생했습니다.'
    });
  }
};

// 보너스 응모
const addBonusEntry = async () => {
  // 게시판 작성 페이지로 이동
  router.push({
    path: '/board/write',
    query: { 
      event_id: event.value!.id,
      type: 'event'
    }
  });
};

// 데이터 로드
const loadData = async () => {
  isLoading.value = true;
  
  try {
    const eventId = route.params.id as string;
    
    // 이벤트 정보 조회
    event.value = await eventService.getEventById(eventId);
    
    if (event.value) {
      // 로그인한 사용자의 참여 내역 조회
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserParticipations(user.id);
      }
      
      // 당첨자 조회
      await loadWinners();
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  } finally {
    isLoading.value = false;
  }
};

// 사용자 참여 내역 로드
const loadUserParticipations = async (userId: string) => {
  const allParticipations = await eventService.getUserParticipations(userId);
  userParticipations.value = allParticipations.filter(
    p => p.event_id === event.value!.id
  );
};

// 당첨자 로드
const loadWinners = async () => {
  if (!event.value) return;
  
  const { data, error } = await supabase
    .from('event_winners')
    .select(`
      *,
      coupon:coupons(*)
    `)
    .eq('event_id', event.value.id)
    .order('won_at', { ascending: false });

  if (!error && data) {
    winners.value = data.map((w, index) => ({
      ...w,
      rank: index + 1
    }));
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.event-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
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

/* 뒤로가기 버튼 */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.back-button:hover {
  background: #f5f5f5;
}

/* 이벤트 헤더 */
.event-header {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.event-banner {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.event-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-info {
  padding: 25px;
}

.event-title-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.event-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.event-type {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
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
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 14px;
}

/* 참여 조건 */
.condition-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.condition-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.condition-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auto-condition,
.bonus-condition {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.auto-icon {
  font-size: 24px;
  color: #1976d2;
}

.bonus-icon {
  font-size: 24px;
  color: #388e3c;
}

.auto-condition h3,
.bonus-condition h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.auto-condition p,
.bonus-condition p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

/* 내 참여 현황 */
.my-participation {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.my-participation h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.participation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.participation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.participation-date {
  font-size: 14px;
  color: #666;
}

.method-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.method-badge.auto {
  background: #e3f2fd;
  color: #1976d2;
}

.method-badge.bonus {
  background: #fff3e0;
  color: #f57c00;
}

.participation-entries {
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
}

.total-entries {
  padding: 10px;
  background: #f5f3ff;
  border-radius: 6px;
  text-align: center;
  color: #667eea;
}

/* 액션 섹션 */
.action-section {
  text-align: center;
  margin: 30px 0;
}

.participate-button,
.bonus-button {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.participate-button:hover,
.bonus-button:hover {
  background: #5a67d8;
}

.bonus-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-hint {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}

/* 자동 응모 안내 */
.auto-entry-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
  margin: 20px 0;
}

.auto-entry-notice p {
  margin: 0;
  color: #1976d2;
  font-size: 14px;
  line-height: 1.5;
}

/* 이미 참여한 경우 */
.already-participated {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #e8f5e9;
  border-radius: 8px;
  margin: 20px 0;
}

.check-icon {
  font-size: 20px;
  color: #4caf50;
}

.already-participated p {
  margin: 0;
  color: #388e3c;
  font-size: 14px;
}

/* 당첨자 발표 */
.winners-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-top: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.winners-section h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.winners-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.winner-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.winner-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.winner-rank {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
}

.winner-name {
  font-size: 14px;
  color: #666;
}

.winner-prize {
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
}

/* 찾을 수 없음 */
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.alert-icon {
  font-size: 64px;
  color: #ff9800;
  margin-bottom: 20px;
}

.not-found h2 {
  font-size: 24px;
  color: #666;
  margin-bottom: 20px;
}

.back-button-center {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.back-button-center:hover {
  background: #5a67d8;
}

/* 반응형 */
@media (max-width: 768px) {
  .event-banner {
    height: 200px;
  }
  
  .event-title {
    font-size: 24px;
  }
  
  .event-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .participation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>