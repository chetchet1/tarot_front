<template>
  <div class="reading-select">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>타로 점보기</h1>
      <span class="header-spacer" aria-hidden="true"></span>
    </header>

    <div class="container">
      <!-- 모바일: 단계별 진행 -->
      <div class="mobile-view">
        <!-- 주제 선택됨 & 배열법 미선택 -->
        <div v-if="selectedTopic && !selectedSpread" class="mobile-selected-topic">
          <div class="selected-info-card card">
            <div class="selected-info-header">
              <span class="selected-label">선택한 주제</span>
              <button class="change-btn" @click="resetSelection">변경</button>
            </div>
            <div class="selected-content">
              <h3>{{ getTopicName(selectedTopic) }}</h3>
              <p v-if="selectedTopic === 'custom' && customQuestion">
                {{ customQuestion }}
              </p>
            </div>
          </div>
        </div>

        <!-- 주제 & 배열법 모두 선택됨 -->
        <div v-else-if="selectedTopic && selectedSpread" class="mobile-all-selected">
          <div class="selected-info-card card">
            <div class="selected-info-header">
              <span class="selected-label">선택하신 점괘</span>
            </div>
            <div class="selected-content">
              <div class="selection-item">
                <span class="item-label">주제:</span>
                <span class="item-value">{{ getTopicName(selectedTopic) }}</span>
              </div>
              <div class="selection-item">
                <span class="item-label">배열법:</span>
                <span class="item-value">{{ getSpreadName(selectedSpread) }}</span>
              </div>
              <div class="selection-item">
                <span class="item-label">카드 수:</span>
                <span class="item-value">{{ getSpreadCardCount(selectedSpread) }}장</span>
              </div>
            </div>
            <div class="mobile-actions">
              <button class="btn btn-secondary" @click="resetSelection">다시 선택</button>
              <button 
                class="btn btn-primary"
                :disabled="!canStartReading"
                @click="startReading"
              >
                {{ getStartButtonText() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PC: 기존 레이아웃 유지 -->
      <div class="desktop-view">
        <!-- 주제 선택 -->
        <section class="section" v-show="!selectedTopic || !isMobile">
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
      <section class="section" v-show="selectedTopic && (!selectedSpread || !isMobile)">
        <h2 class="section-title">카드 배열법을 선택하세요</h2>
        
        <!-- 무료 사용자 유료 배열 안내 -->
        <div v-if="!userStore.isPremium && userStore.currentUser?.email !== 'test@example.com'" class="premium-spread-notice">
          <p class="notice-text">
            <span class="icon">ℹ️</span>
            {{ freeUserMessage || '유료 배열(켈틱 크로스, 세븐스타, 컵 오브 릴레이션쉽)은 하루 1회 무료로 이용 가능합니다.' }}
          </p>
          <p v-if="hasPremiumUsageToday" class="reset-time">
            다음 무료 이용: {{ getTimeUntilReset() }} 후
          </p>
        </div>
        
        <!-- 테스트 계정 안내 -->
        <div v-if="!userStore.isPremium && userStore.currentUser?.email === 'test@example.com'" class="test-account-notice">
          <p class="notice-text">
            <span class="icon">🧪</span>
            테스트 계정으로 접속하셨습니다. 모든 배열법을 무제한 사용할 수 있습니다.
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
              'seven-star': spread.id === 'seven_star',
              'celtic-cross': spread.id === 'celtic_cross',
              'cup-relationship': spread.id === 'cup_of_relationship'
            }"
            @click="selectSpread(spread)"
          >
            <div class="spread-header">
              <h3>
                {{ spread.name }}
                <span v-if="spread.id === 'cup_of_relationship'" class="relationship-badge">💕 연애/커플 전용</span>
              </h3>
              <span v-if="spread.isPremium && !userStore.isPremium" class="premium-badge">👑</span>
            </div>
            <p class="spread-description">{{ spread.description }}</p>
            <div class="spread-info">
              <span class="card-count">카드 {{ spread.cardCount }}장</span>
              <span class="difficulty" :class="spread.difficulty">
                {{ getDifficultyText(spread.difficulty) }}
              </span>
            </div>
            <div v-if="spread.isPremium && !userStore.isPremium && hasPremiumUsageToday && userStore.currentUser?.email !== 'test@example.com'" class="premium-overlay">
              <p>오늘 이미 사용</p>
            </div>
            <div v-else-if="spread.isPremium && !userStore.isPremium && !hasPremiumUsageToday && userStore.currentUser?.email !== 'test@example.com'" class="free-badge">
              <span>오늘 1회 무료</span>
            </div>
            <div v-else-if="spread.isPremium && !userStore.isPremium && userStore.currentUser?.email === 'test@example.com'" class="test-badge">
              <span>테스트 계정</span>
            </div>

          </div>
        </div>
      </section>

      <!-- 선택 요약 (PC에서만) -->
      <section class="selection-summary" v-if="selectedTopic && selectedSpread && !isMobile">
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

      <!-- 시작 버튼 (PC에서만) -->
      <div class="action-section" v-show="!isMobile">
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
    </div>
    
    <!-- 질문 입력 모달 -->
    <CustomQuestionModal
      v-if="showQuestionModal"
      :is-open="showQuestionModal"
      @close="handleQuestionCancel"
      @confirm="handleQuestionConfirm"
    />
    
    <!-- 연애 상태 선택 모달 -->
    <RelationshipStatusModal
      v-if="showRelationshipModal"
      :is-open="showRelationshipModal"
      @close="handleRelationshipCancel"
      @confirm="handleRelationshipConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { getSpreadsByTopic, getSpreadById } from '../data/spreads';
import CustomQuestionModal from '../components/CustomQuestionModal.vue';
import RelationshipStatusModal from '../components/RelationshipStatusModal.vue';
import { showAlert, showConfirm } from '../utils/alerts';
import { 
  canUsePremiumSpread, 
  recordPremiumSpreadUsage,
  hasUsedPremiumSpreadToday,
  getFreeUserMessage,
  getTimeUntilReset,
  isPremiumSpread,
  isTestAccount
} from '../services/premium/premiumSpreadService';

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
const route = useRoute();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const selectedTopic = ref<string>('');
const selectedSpread = ref<string>('');
const showQuestionModal = ref(false);
const showRelationshipModal = ref(false);
const customQuestion = ref<string>('');
const isMobile = ref(false);
const isCheckingPremiumUsage = ref(false);
const hasPremiumUsageToday = ref(false);
const freeUserMessage = ref('');
const isStarting = ref(false); // 중복 클릭 방지를 위한 변수

// 화면 크기 감지
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 프리미엄 사용 상태 체크 함수
const checkPremiumUsageStatus = async (forceRefresh = false) => {
  console.log('[checkPremiumUsageStatus] 시작', {
    user: userStore.currentUser?.email,
    isPremium: userStore.isPremium,
    isAnonymous: userStore.currentUser?.isAnonymous,
    userId: userStore.currentUser?.id,
    forceRefresh,
    현재시간: new Date().toISOString()
  });
  
  // 초기값 설정
  const previousValue = hasPremiumUsageToday.value;
  
  // 테스트 계정이면 유료 배열 사용 여부 체크 생략
  const isTestAccount = userStore.currentUser?.email === 'test@example.com';
  
  // 프리미엄 사용자인 경우
  if (userStore.isPremium) {
    console.log('[checkPremiumUsageStatus] 프리미엄 사용자 - 체크 불필요');
    hasPremiumUsageToday.value = false; // 프리미엄 사용자는 제한 없음
    freeUserMessage.value = '';
    return;
  }
  
  // 테스트 계정의 경우 특별 메시지 설정
  if (isTestAccount) {
    console.log('[checkPremiumUsageStatus] 테스트 계정 처리');
    hasPremiumUsageToday.value = false; // 테스트 계정은 항상 사용 가능한 것처럼 표시
    freeUserMessage.value = '테스트 계정 - 유료 배열을 무제한 이용 가능';
    return;
  }
  
  // 사용자 정보가 없는 경우
  if (!userStore.currentUser) {
    console.log('[checkPremiumUsageStatus] 사용자 정보 없음');
    hasPremiumUsageToday.value = false;
    freeUserMessage.value = '';
    return;
  }
  
  isCheckingPremiumUsage.value = true;
  
  try {
    // 로그인한 사용자의 경우
    if (!userStore.currentUser.isAnonymous) {
      console.log('[checkPremiumUsageStatus] 로그인 사용자 체크 시작');
      console.log('[checkPremiumUsageStatus] DB에서 확인 중...');
      
      // 캐시를 무시하고 항상 최신 데이터 가져오기
      const hasUsed = await hasUsedPremiumSpreadToday(userStore.currentUser.id);
      console.log('[checkPremiumUsageStatus] DB 결과 - hasUsed:', hasUsed);
      
      hasPremiumUsageToday.value = hasUsed;
      freeUserMessage.value = await getFreeUserMessage(userStore.currentUser.id);
      
      console.log('[checkPremiumUsageStatus] 업데이트 완료:', {
        이전값: previousValue,
        새값: hasUsed,
        메시지: freeUserMessage.value
      });
    }
    // 익명 사용자의 경우
    else {
      console.log('[checkPremiumUsageStatus] 익명 사용자 체크 시작');
      console.log('[checkPremiumUsageStatus] 로컬 스토리지에서 확인 중...');
      
      const { hasUsedPremiumSpreadToday: hasUsedLocal, getFreeUserMessage: getMessageLocal } = await import('../utils/premiumSpreadTracker');
      const hasUsed = await hasUsedLocal();
      console.log('[checkPremiumUsageStatus] 로컬 스토리지 결과 - hasUsed:', hasUsed);
      
      hasPremiumUsageToday.value = hasUsed;
      freeUserMessage.value = getMessageLocal();
      
      console.log('[checkPremiumUsageStatus] 업데이트 완료:', {
        이전값: previousValue, 
        새값: hasUsed,
        메시지: freeUserMessage.value
      });
    }
  } catch (error) {
    console.error('[checkPremiumUsageStatus] 오류 발생:', error);
    // 오류 발생 시 안전한 기본값 설정
    hasPremiumUsageToday.value = false;
    freeUserMessage.value = '';
  } finally {
    isCheckingPremiumUsage.value = false;
    console.log('[checkPremiumUsageStatus] 완료 - 최종 hasPremiumUsageToday:', hasPremiumUsageToday.value);
  }
};

// 페이지가 포커스를 받을 때마다 상태 체크
const handleVisibilityChange = async () => {
  if (!document.hidden) {
    console.log('[handleVisibilityChange] 페이지 포커스 - 강제 갱신');
    await checkPremiumUsageStatus(true);
  }
};

onMounted(async () => {
  document.querySelector('.app-scroll')?.classList.add('scroll-locked');
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // 초기 프리미엄 사용 상태 체크
  console.log('[onMounted] 초기 체크');
  await checkPremiumUsageStatus(true);
  
  // 페이지 포커스 이벤트 리스너 추가
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.querySelector('.app-scroll')?.classList.remove('scroll-locked');
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

// 컴포넌트가 다시 활성화될 때 (keep-alive에서 복원될 때)
onActivated(async () => {
  console.log('[onActivated] 컴포넌트 활성화 - 강제 갱신');
  await checkPremiumUsageStatus(true);
});

// 라우트 변경 감지 - 페이지로 돌아올 때 상태 재체크
watch(() => route.path, async (newPath) => {
  if (newPath === '/reading-select') {
    console.log('[watch route] 페이지로 돌아옴 - 강제 갱신');
    await checkPremiumUsageStatus(true);
  }
}, { immediate: false });

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
  
  // 커스텀 질문인 경우 프리미엄 배열법들 표시
  if (selectedTopic.value === 'custom') {
    const premiumSpreads = ['seven_star', 'celtic_cross'];  // 세븐스타를 먼저, 컵 오브 릴레이션쉽 제외
    const availableSpreads = [];
    
    for (const spreadId of premiumSpreads) {
      const spread = getSpreadById(spreadId);
      if (spread) {
        availableSpreads.push({
          id: spread.spreadId,
          name: spread.nameKr,
          description: spread.description,
          cardCount: spread.cardCount,
          difficulty: 'hard',
          isPremium: spread.isPremium
        });
      }
    }
    
    return availableSpreads;
  }
  
  // 연애 주제인 경우 연애 상태를 고려하여 스프레드 필터링
  const relationshipStatus = selectedTopic.value === 'love' ? tarotStore.getRelationshipStatus() : null;
  
  // 일반 주제인 경우 기존 로직 사용 (연애 상태 매개변수 추가)
  return getSpreadsByTopic(selectedTopic.value, relationshipStatus).map(spread => ({
    id: spread.spreadId,
    name: spread.nameKr,
    description: spread.description,
    cardCount: spread.cardCount,
    difficulty: spread.cardCount <= 1 ? 'easy' : spread.cardCount <= 3 ? 'medium' : 'hard',
    isPremium: spread.isPremium
  }));
});

const canStartReading = computed(() => {
  console.log('[CanStartReading] 계산 시작', {
    selectedTopic: selectedTopic.value,
    selectedSpread: selectedSpread.value,
    isPremium: userStore.isPremium,
    hasPremiumUsageToday: hasPremiumUsageToday.value,
    isAnonymous: userStore.currentUser?.isAnonymous,
    userId: userStore.currentUser?.id
  });
  
  if (!selectedTopic.value || !selectedSpread.value) {
    console.log('[CanStartReading] 주제나 배열법 미선택');
    return false;
  }
  

  
  // 커스텀 질문인 경우 켈틱 크로스만 확인
  if (selectedTopic.value === 'custom') {
    const spread = getSpreadById(selectedSpread.value);
    if (!spread) {
      console.log('[CanStartReading] 커스텀 - 스프레드 없음');
      return false;
    }
    
    // 프리미엄 스프레드인데 프리미엄이 아닌 경우
    if (spread.isPremium && !userStore.isPremium) {
      console.log('[CanStartReading] 커스텀 - 프리미엄 필요');
      return false;
    }
    
    return true;
  }
  
  // 일반 주제인 경우 기존 로직 사용
  const spread = getSpreadsByTopic(selectedTopic.value).find(s => s.spreadId === selectedSpread.value);
  if (!spread) {
    console.log('[CanStartReading] 일반 - 스프레드 없음');
    return false;
  }
  
  // 프리미엄 스프레드인데 프리미엄이 아닌 경우
  if (spread.isPremium && !userStore.isPremium) {
    // 테스트 계정은 항상 사용 가능
    if (userStore.currentUser?.email === 'test@example.com') {
      console.log('[CanStartReading] 테스트 계정 - 항상 허용');
      return true;
    }
    
    // 무료 사용자의 유료 배열 사용 가능 여부 확인
    const canStart = !hasPremiumUsageToday.value;
    console.log('[CanStartReading] 프리미엄 스프레드 체크', {
      isPremium: spread.isPremium,
      userIsPremium: userStore.isPremium,
      hasPremiumUsageToday: hasPremiumUsageToday.value,
      canStart,
      spreadId: spread.spreadId,
      spreadName: spread.nameKr
    });
    return canStart;
  }
  
  console.log('[CanStartReading] 통과 - true 반환');
  return true;
});

const selectTopic = (topicId: string) => {
  if (topicId === 'custom') {
    if (!userStore.isPremium) {
      router.push('/premium');
      return;
    }
    showQuestionModal.value = true;
  } else if (topicId === 'love') {
    // 연애 카테고리 선택 시 바로 솔로/커플 모달 표시
    selectedTopic.value = topicId;
    customQuestion.value = '';
    showRelationshipModal.value = true;
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

const handleRelationshipConfirm = (status: 'single' | 'couple') => {
  console.log('[RelationshipModal] 연애 상태 선택:', status);
  tarotStore.setRelationshipStatus(status);
  showRelationshipModal.value = false;
  
  // 상태 저장 후 배열법 선택을 기다림
};

const handleRelationshipCancel = () => {
  console.log('[RelationshipModal] 취소');
  showRelationshipModal.value = false;
  
  // 연애 카테고리 선택도 취소
  selectedTopic.value = '';
  
  // 연애 상태도 초기화
  tarotStore.clearRelationshipStatus();
  
  isStarting.value = false;
};

const selectSpread = async (spread: Spread) => {
  
  // 커스텀 질문 + 컵 오브 릴레이션십 선택 시 확인
  if (selectedTopic.value === 'custom' && spread.id === 'cup_of_relationship') {
    const confirmResult = await showConfirm({
      title: '확인',
      message: '컵 오브 릴레이션십은 관계를 위한 배열법입니다.\n\n생각해둔 상대가 없다면 이 배열은 의미없는 선택이 될 것입니다.\n\n계속하시겠습니까?',
      confirmText: '확인',
      cancelText: '취소'
    });
    
    if (!confirmResult) {
      return; // 취소 시 선택하지 않음
    }
  }
  
  if (spread.isPremium && !userStore.isPremium) {
    // 테스트 계정 확인
    if (userStore.currentUser && !userStore.currentUser.isAnonymous && 
        userStore.currentUser.email === 'test@example.com') {
      // 테스트 계정은 체크하지 않고 바로 선택 가능
      selectedSpread.value = spread.id;
      return;
    }
    
    // 익명 사용자의 경우 로컬 스토리지 체크
    if (userStore.currentUser?.isAnonymous) {
      const { canUsePremiumSpread: canUseLocal } = await import('../utils/premiumSpreadTracker');
      if (!canUseLocal(spread.id, userStore.isPremium)) {
        await showAlert({
          title: '일일 무료 이용 완료',
          message: `오늘의 무료 유료 배열을 이미 사용하셨습니다.\n\n프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.`
        });
        return;
      }
    } 
    // 로그인한 사용자의 경우 DB 체크
    else if (userStore.currentUser) {
      const canUse = await canUsePremiumSpread(
        spread.id, 
        userStore.isPremium, 
        userStore.currentUser.id,
        userStore.currentUser.email
      );
      
      if (!canUse) {
        await showAlert({
          title: '일일 무료 이용 완료',
          message: `오늘의 무료 유료 배열을 이미 사용하셨습니다.\n\n프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.`
        });
        return;
      }
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
    // 테스트 계정
    if (userStore.currentUser?.email === 'test@example.com') {
      return '카드 뽑기 시작 (테스트)';
    }
    
    if (hasPremiumUsageToday.value) {
      return '오늘 이미 사용 (내일 다시 이용 가능)';
    }
    return '오늘 1회 무료로 시작하기';
  }
  
  return '카드 뽑기 시작';
};

// 카드 뽑기 페이지로 이동하는 함수 (모달 후 혹은 직접 호출)
const proceedToCardDrawing = async () => {
  console.log('[ProceedToCardDrawing] 카드 뽑기 페이지로 이동 시작');
  
  const selectedTopicData = topics.value.find(t => t.id === selectedTopic.value);
  let selectedSpreadData;
  
  // 커스텀 질문인 경우 직접 스프레드 찾기
  if (selectedTopic.value === 'custom') {
    selectedSpreadData = getSpreadById(selectedSpread.value);
  } else {
    selectedSpreadData = getSpreadsByTopic(selectedTopic.value).find(s => s.spreadId === selectedSpread.value);
  }
  
  // 컵 오브 릴레이션십인 경우 subTheme을 'couple'로 설정
  if (selectedSpread.value === 'cup_of_relationship') {
    tarotStore.setSelectedSubTheme('couple');
    console.log('[ProceedToCardDrawing] 컵 오브 릴레이션십 - subTheme을 couple로 설정');
  } else {
    // 다른 배열법은 subTheme 초기화
    tarotStore.setSelectedSubTheme(null);
  }
  
  console.log('[ProceedToCardDrawing] 선택된 데이터', {
    selectedTopicData,
    selectedSpreadData,
    relationshipStatus: tarotStore.getRelationshipStatus(),
    subTheme: tarotStore.getSelectedSubTheme()
  });
  
  if (!selectedTopicData || !selectedSpreadData) {
    console.error('[ProceedToCardDrawing] 선택된 데이터가 없음');
    await showAlert({
      title: '오류',
      message: '주제나 배열법이 올바르게 선택되지 않았습니다.'
    });
    isStarting.value = false;
    return;
  }
  
  try {
    // 테스트 계정 확인 (로그인한 사용자만)
    if (userStore.currentUser && !userStore.currentUser.isAnonymous && 
        userStore.currentUser.email === 'test@example.com' && 
        !userStore.isPremium && isPremiumSpread(selectedSpread.value)) {
      // 테스트 계정은 매번 확인 메시지 표시
      const hasUsed = await hasUsedPremiumSpreadToday(userStore.currentUser.id);
      const message = hasUsed 
        ? '테스트 계정이시군요!\n\n정상적으로는 하루 1회만 사용 가능하지만,\n개발 테스트를 위해 허용합니다.\n\n계속하시겠습니까?'
        : '테스트 계정으로 유료 배열을 사용합니다.\n\n테스트 목적으로 무제한 사용 가능합니다.\n\n계속하시겠습니까?';
      
      const confirmResult = await showConfirm({
        title: '🧪 테스트 계정 확인',
        message: message,
        confirmText: '계속하기',
        cancelText: '취소'
      });
      
      if (!confirmResult) {
        isStarting.value = false;
        return;
      }
    }
    
    // 무료 사용자가 유료 배열을 사용하는 경우 - 기록은 결과 보기 시점으로 이동
    if (!userStore.isPremium && isPremiumSpread(selectedSpread.value)) {
      console.log('[ProceedToCardDrawing] 무료 사용자가 유료 배열 선택', {
        spreadId: selectedSpread.value,
        isAnonymous: userStore.currentUser?.isAnonymous,
        userId: userStore.currentUser?.id,
        message: '실제 카운트는 해석 보기 시점에 기록됩니다'
      });
      
      // 테스트 계정이 아닌 경우 플래그 설정
      if (userStore.currentUser?.email !== 'test@example.com') {
        // 타로 스토어에 유료 배열 사용 플래그 저장
        tarotStore.setPremiumSpreadUsage(true);
      }
    }
    
    // 선택 정보를 스토어에 저장
    console.log('[ProceedToCardDrawing] 스토어에 정보 저장 시작');
    
    // 타로 스토어에 선택 정보 저장 시도
    try {
      tarotStore.setSelectedTopic(selectedTopicData);
      console.log('[ProceedToCardDrawing] 주제 저장 완료', tarotStore.selectedTopic);
    } catch (error) {
      console.error('[ProceedToCardDrawing] 주제 저장 오류:', error);
      await showAlert({
        title: '오류',
        message: '주제 저장 중 오류가 발생했습니다.'
      });
      isStarting.value = false;
      return;
    }
    
    try {
      tarotStore.setSelectedSpread(selectedSpreadData);
      console.log('[ProceedToCardDrawing] 배열법 저장 완료', tarotStore.selectedSpread);
    } catch (error) {
      console.error('[ProceedToCardDrawing] 배열법 저장 오류:', error);
      await showAlert({
        title: '오류',
        message: '배열법 저장 중 오류가 발생했습니다.'
      });
      isStarting.value = false;
      return;
    }
    
    // 커스텀 질문이 있다면 저장
    if (selectedTopic.value === 'custom' && customQuestion.value) {
      tarotStore.setCustomQuestion(customQuestion.value);
    } else {
      tarotStore.setCustomQuestion('');
    }
    console.log('[ProceedToCardDrawing] 커스텀 질문 저장 완료');
    
    // 이동 전 디버그 로그
    console.log('[ProceedToCardDrawing] 라우터 이동 전 상태 확인', {
      routerReady: router.isReady,
      currentRoute: router.currentRoute.value.path,
      targetRoute: '/card-drawing',
      relationshipStatus: tarotStore.getRelationshipStatus()
    });
    
    // 카드 뽑기 페이지로 이동
    console.log('[ProceedToCardDrawing] 카드 뽑기 페이지로 이동 시도');
    console.log('[ProceedToCardDrawing] 현재 경로:', router.currentRoute.value.path);
    console.log('[ProceedToCardDrawing] 스토어 상태 최종 확인:', {
      selectedTopic: tarotStore.selectedTopic,
      selectedSpread: tarotStore.selectedSpread,
      customQuestion: tarotStore.customQuestion,
      relationshipStatus: tarotStore.getRelationshipStatus()
    });
    
    // 스토어 업데이트가 완료될 때까지 짧은 대기
    await nextTick();
    
    // 단순하게 push로만 시도
    console.log('[ProceedToCardDrawing] 카드 뽑기 페이지로 이동');
    router.push('/card-drawing');
  } catch (error) {
    console.error('[ProceedToCardDrawing] 오류 발생:', error);
    await showAlert({
      title: '오류',
      message: `카드 뽑기 페이지로 이동 중 오류가 발생했습니다: ${error.message}`
    });
  } finally {
    // 버튼 상태 초기화
    isStarting.value = false;
  }
};

const startReading = async () => {
  // 중복 클릭 방지
  if (isStarting.value) {
    console.log('[StartReading] 이미 진행 중');
    return;
  }
  
  isStarting.value = true;
  
  console.log('[StartReading] 시작 - 바로 카드뽑기로 이동', {
    selectedTopic: selectedTopic.value,
    selectedSpread: selectedSpread.value,
    relationshipStatus: tarotStore.getRelationshipStatus()
  });
  
  // 바로 카드뽑기 페이지로 이동
  proceedToCardDrawing();

};

const goBack = () => {
  router.go(-1);
};

// 선택 초기화
const resetSelection = () => {
  selectedTopic.value = '';
  selectedSpread.value = '';
  customQuestion.value = '';
};
</script>

<style scoped>
.reading-select {
  min-height: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  --page-bg: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  background: var(--page-bg);
  overflow: hidden;
}

.page-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 0 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 50;
  background: linear-gradient(180deg, rgba(30, 27, 75, 0.98) 0%, rgba(30, 27, 75, 0.94) 70%, rgba(30, 27, 75, 0.0) 100%);
  backdrop-filter: blur(10px);
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

.header-spacer {
  width: 72px;
  height: 1px;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
  justify-self: center;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: max(8px, var(--app-safe-bottom));
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.topic-card,
.spread-card {
  padding: 18px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 16px;
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

/* 세븐스타 배열법 스타일 */
.spread-card.seven-star {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(59, 130, 246, 0.05));
  border: 2px solid rgba(56, 189, 248, 0.2);
  position: relative;
  overflow: hidden;
}

.spread-card.seven-star::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(90deg, #38BDF8, #3B82F6, #38BDF8);
  border-radius: 16px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.spread-card.seven-star:hover::before {
  opacity: 0.3;
  animation: shimmer 3s linear infinite;
}

.spread-card.seven-star:hover {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.1));
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);
}

.spread-card.seven-star.selected {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.2));
  border-color: #38BDF8;
}

/* 켈틱 크로스 배열법 스타일 */
.spread-card.celtic-cross {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(91, 33, 182, 0.05));
  border: 2px solid rgba(124, 58, 237, 0.2);
  position: relative;
  overflow: hidden;
}

.spread-card.celtic-cross::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(90deg, #7C3AED, #5B21B6, #7C3AED);
  border-radius: 16px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.spread-card.celtic-cross:hover::before {
  opacity: 0.3;
  animation: shimmer 3s linear infinite;
}

.spread-card.celtic-cross:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(91, 33, 182, 0.1));
  border-color: rgba(124, 58, 237, 0.4);
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.2);
}

.spread-card.celtic-cross.selected {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(91, 33, 182, 0.2));
  border-color: #7C3AED;
}

/* 컵 오브 릴레이션쉽 배열법 스타일 */
.spread-card.cup-relationship {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(251, 146, 60, 0.05));
  border: 2px solid rgba(236, 72, 153, 0.2);
  position: relative;
  overflow: hidden;
}

.spread-card.cup-relationship::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(90deg, #EC4899, #FB923C, #EC4899);
  border-radius: 16px;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.spread-card.cup-relationship:hover::before {
  opacity: 0.3;
  animation: shimmer 3s linear infinite;
}

.spread-card.cup-relationship:hover {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(251, 146, 60, 0.1));
  border-color: rgba(236, 72, 153, 0.4);
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.2);
}

.spread-card.cup-relationship.selected {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(251, 146, 60, 0.2));
  border-color: #EC4899;
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

.topic-card p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  line-height: 1.4;
}

.spread-description {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  line-height: 1.5;
  margin: 12px 0;
  font-weight: 400;
}

/* 각 배열법별 설명 강조 */
.spread-card.seven-star .spread-description {
  color: rgba(147, 197, 253, 0.95);
}

.spread-card.celtic-cross .spread-description {
  color: rgba(196, 181, 253, 0.95);
}

.spread-card.cup-relationship .spread-description {
  color: rgba(251, 207, 232, 0.95);
}

.spread-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.spread-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

/* 연애/커플 전용 배지 */
.relationship-badge {
  display: inline-block;
  background: linear-gradient(135deg, #EC4899, #F472B6);
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
  animation: pulse-pink 2s ease-in-out infinite;
}

@keyframes pulse-pink {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; box-shadow: 0 2px 12px rgba(236, 72, 153, 0.5); }
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

/* 테스트 계정 안내 */
.test-account-notice {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.test-account-notice .notice-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.6;
}

.test-account-notice .icon {
  font-size: 18px;
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

/* 테스트 계정 배지 */
.test-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  animation: pulse 1.5s ease-in-out infinite;
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

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* 모바일/데스크탑 뷰 분리 */
.mobile-view {
  display: none;
}

.desktop-view {
  display: block;
}

/* 모바일 전용 스타일 */
.mobile-selected-topic,
.mobile-all-selected {
  margin-bottom: 20px;
}

.selected-info-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.selected-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.change-btn {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #A855F7;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-btn:hover {
  background: rgba(168, 85, 247, 0.3);
}

.selected-content {
  text-align: left;
}

.selected-content h3 {
  font-size: 18px;
  margin-bottom: 4px;
  color: white;
  font-weight: 600;
}

.selected-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.selection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.selection-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.item-value {
  font-size: 16px;
  color: white;
  font-weight: 600;
}

.mobile-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.mobile-actions .btn {
  flex: 1;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.mobile-actions .btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.mobile-actions .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mobile-actions .btn-primary {
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  border: none;
  color: white;
}

.mobile-actions .btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #9333EA, #6B21A8);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
}

.mobile-actions .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .reading-select {
  min-height: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  --page-bg: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  background: var(--page-bg);
  overflow: hidden;
}

  .container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: max(8px, var(--app-safe-bottom));
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

  .reading-select {
  min-height: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  --page-bg: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  background: var(--page-bg);
  overflow: hidden;
}

  .container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: max(8px, var(--app-safe-bottom));
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

  /* 모바일에서만 표시 */
  .mobile-view {
    display: block;
  }
  
  .desktop-view {
    display: block;
  }
  
  /* 기존 모바일 스타일 */
  .topic-grid,
.spread-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
  
  .summary-details {
    text-align: left;
  }
}
</style>



