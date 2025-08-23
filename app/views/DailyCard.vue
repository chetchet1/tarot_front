<template>
  <div class="daily-card-container">
    <!-- AI 해석 로딩 화면 -->
    <SimpleTarotLoading 
      :is-visible="isInterpretationLoading"
      :progress="interpretationProgress"
    />
    <!-- 헤더 -->
    <header class="daily-header">
      <button @click="goBack" class="back-button">
        <span class="back-icon">←</span>
      </button>
      <h1 class="page-title">오늘의 카드</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 날짜 표시 -->
    <div class="date-display">
      {{ formatDate(currentDate) }}
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="content-wrapper">

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>오늘의 메시지를 준비하고 있습니다...</p>
      </div>

      <!-- 카드 표시 영역 -->
      <div v-else-if="!hasDrawnToday && !showAd && !isInterpretationLoading" class="card-area">
        <!-- 카드 뒷면 (클릭 가능) -->
        <div 
          v-if="!isCardRevealed" 
          class="card-back"
          @click="drawCard"
        >
          <div class="card-pattern"></div>
          <p class="card-instruction">카드를 클릭하여 오늘의 메시지를 확인하세요</p>
        </div>

        <!-- 카드 앞면 -->
        <div v-else class="card-front">
          <img 
            :src="getCardImageUrl(selectedCard)" 
            :alt="selectedCard?.name_kr"
            class="card-image"
            @error="handleImageError"
          />
          <h2 class="card-name">{{ selectedCard?.name_kr }}</h2>
          <p class="card-subtitle">{{ selectedCard?.name }}</p>
        </div>
      </div>

      <!-- 이미 뽑은 경우 (광고와 로딩 중이 아닐 때만 표시) -->
      <div v-else-if="hasDrawnToday && !showAd && !isInterpretationLoading" class="card-area">
        <div class="card-front">
          <img 
            :src="getCardImageUrl(todayCard?.card)" 
            :alt="todayCard?.card?.name_kr"
            class="card-image"
            @error="handleImageError"
          />
          <h2 class="card-name">{{ todayCard?.card?.name_kr }}</h2>
          <p class="card-subtitle">{{ todayCard?.card?.name }}</p>
        </div>
      </div>

      <!-- 광고 영역 -->
      <div v-if="showAd" class="ad-container">
        <div class="ad-overlay">
          <div class="ad-content">
            <div class="ad-timer">{{ adTimeRemaining }}초 남음</div>
            <div class="ad-placeholder">
              [광고 영역 - {{ adTimeRemaining }}초]
            </div>
          </div>
        </div>
      </div>

      <!-- 해석 표시 영역 -->
      <div v-if="showInterpretation" class="interpretation-area">
        <!-- 운세 지수 -->
        <div class="fortune-section">
          <h3 class="section-title">📊 오늘의 운세 지수</h3>
          <div class="fortune-grid">
            <div v-for="(value, key) in interpretation.fortuneIndex" :key="key" class="fortune-item">
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
              <p class="time-text">{{ interpretation.timeAdvice.morning }}</p>
            </div>
            <div class="time-item">
              <span class="time-label">오후 (12:00-18:00)</span>
              <p class="time-text">{{ interpretation.timeAdvice.afternoon }}</p>
            </div>
            <div class="time-item">
              <span class="time-label">저녁 (18:00-24:00)</span>
              <p class="time-text">{{ interpretation.timeAdvice.evening }}</p>
            </div>
          </div>
        </div>

        <!-- 행운 아이템 -->
        <div class="lucky-section">
          <h3 class="section-title">🍀 오늘의 행운 아이템</h3>
          <div class="lucky-grid">
            <div class="lucky-item">
              <span class="lucky-label">색상</span>
              <span class="lucky-value">{{ interpretation.luckyItems.color }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">숫자</span>
              <span class="lucky-value">{{ interpretation.luckyItems.number }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">방향</span>
              <span class="lucky-value">{{ interpretation.luckyItems.direction }}</span>
            </div>
            <div class="lucky-item">
              <span class="lucky-label">활동</span>
              <span class="lucky-value">{{ interpretation.luckyItems.activity }}</span>
            </div>
          </div>
        </div>

        <!-- 인간관계 조언 -->
        <div class="relationship-section">
          <h3 class="section-title">👥 인간관계 조언</h3>
          <div class="relationship-content">
            <p><strong>대인관계 팁:</strong> {{ interpretation.relationshipAdvice.tip }}</p>
            <p><strong>피해야 할 상황:</strong> {{ interpretation.relationshipAdvice.avoid }}</p>
            <p><strong>만나면 좋은 사람:</strong> {{ interpretation.relationshipAdvice.goodMeet }}</p>
          </div>
        </div>

        <!-- 오늘의 격언 -->
        <div class="quote-section">
          <h3 class="section-title">💬 오늘의 격언</h3>
          <blockquote class="daily-quote">
            "{{ interpretation.dailyQuote }}"
          </blockquote>
        </div>

        <!-- 오늘의 상세 운세 -->
        <div class="detailed-fortune-section">
          <h3 class="section-title">🔮 오늘의 상세 운세</h3>
          <div class="detailed-fortune-content">
            <div class="card-reference">
              <span class="card-badge">{{ selectedCard?.name_kr || todayCard?.card?.name_kr }}</span>
              카드가 전하는 메시지
            </div>
            <p class="fortune-main-text">{{ interpretation.detailedFortune?.mainMessage }}</p>
            <div class="fortune-aspects">
              <div class="fortune-aspect">
                <h4>💫 오늘의 핵심 포인트</h4>
                <p>{{ interpretation.detailedFortune?.keyPoint }}</p>
              </div>
              <div class="fortune-aspect">
                <h4>⚡ 주의할 점</h4>
                <p>{{ interpretation.detailedFortune?.caution }}</p>
              </div>
              <div class="fortune-aspect">
                <h4>🌟 행운의 순간</h4>
                <p>{{ interpretation.detailedFortune?.luckyMoment }}</p>
              </div>
            </div>
            <div class="fortune-advice">
              <p class="advice-text">{{ interpretation.detailedFortune?.advice }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 공유 버튼 -->
      <div v-if="showInterpretation" class="action-buttons">
        <button @click="shareCard" class="share-button">
          📤 공유하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { supabase } from '../services/supabase';
import { SUPABASE_CONFIG } from '../config/env';
import { showAlert, showConfirm } from '../utils/alerts';
import { CARD_BACK_BASE64 } from '../assets/card-back';
// import TarotLoadingScreen from '../components/loading/TarotLoadingScreen.vue';
import SimpleTarotLoading from '../components/loading/SimpleTarotLoading.vue';
import { shareService } from '../services/ShareService';
import type { TarotCard, DailyReading, DailyInterpretation } from '../types/tarot';
import { ensureTestAccountLoggedIn } from '../utils/test-account';
import { useTestAccountStatus } from '../composables/useTestAccountStatus';
import { useAdvertisement } from '../composables/useAdvertisement';
import { TarotInterpretationService } from '../services/tarotInterpretationService';
import { saveDailyCardWithReading } from '../services/dailyCardService';
import { getUnifiedCardImagePath } from '../utils/unifiedCardImage';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// 테스트 계정 상태 가져오기 (이메일을 computed로 전달)
const userEmail = computed(() => userStore.currentUser?.email);
const { isTest: isTestAcc, isPremiumTest: isPremiumTestAcc } = useTestAccountStatus(userEmail);

// 광고 컴포저블 사용
const { showAd, adTimeRemaining, showAdvertisement, resetAdState } = useAdvertisement();

// 상태 관리
const isLoading = ref(false);
const isCardRevealed = ref(false);
const selectedCard = ref<TarotCard | null>(null);
const todayCard = ref<DailyReading | null>(null);
const interpretation = ref<DailyInterpretation | null>(null);
const currentDate = new Date();
const isInterpretationLoading = ref(false);
const interpretationProgress = ref(0);

// 계산된 속성
const hasDrawnToday = computed(() => {
  return todayCard.value !== null;
});

const showInterpretation = computed(() => {
  return (hasDrawnToday.value || isCardRevealed.value) && 
         !showAd.value && 
         !isInterpretationLoading.value &&
         interpretation.value !== null;
});

// 상태 초기화 함수
const initializeState = () => {
  isLoading.value = false;
  isCardRevealed.value = false;
  selectedCard.value = null;
  todayCard.value = null;
  interpretation.value = null;
  isInterpretationLoading.value = false;
  interpretationProgress.value = 0;
  
  // 광고 상태 초기화
  resetAdState();
};

// 표준화된 에러 처리 함수
const handleError = async (error: any, context: string, showUserAlert: boolean = true) => {
  console.error(`[${context}] 에러:`, error);
  
  if (showUserAlert) {
    await showAlert({
      title: '오류',
      message: '작업 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
};

// 메서드
const goBack = async () => {
  // 프리미엄 상태 새로고침 후 이동
  await userStore.refreshPremiumStatus();
  router.push('/app');
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
};



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

// 오늘의 카드 불러오기
const loadTodayCard = async () => {
  // 상태 초기화 (todayCard는 조회 후 설정되므로 여기서는 제외)
  initializeState();
  todayCard.value = null; // loadTodayCard에서만 todayCard 초기화
  
  try {
    isLoading.value = true;
    const today = new Date().toISOString().split('T')[0];
    
    // 로그인 확인
    if (!userStore.currentUser) {
      isLoading.value = false;
      await showAlert({
        title: '로그인 필요',
        message: '오늘의 카드 기능을 사용하려면 로그인이 필요합니다.'
      });
      router.push('/');
      return;
    }
    
    // 이메일 인증 확인 (테스트 계정은 건너뛰기)
    if (!isTestAcc.value && !userStore.currentUser.email) {
      isLoading.value = false;
      await showAlert({
        title: '인증 필요',
        message: '이메일 인증을 완료해주세요.'
      });
      router.push('/');
      return;
    }
    
    // 프리미엄 테스트 계정은 캐싱 건너뛰기 (항상 새로운 카드 뽑기 가능)
    if (isPremiumTestAcc.value) {
      console.log('프리미엄 테스트 계정 - 캐싱 건너뛰기');
      todayCard.value = null;
      isCardRevealed.value = false;
      selectedCard.value = null;
      isLoading.value = false;
      return;
    }
    
    // daily_cards 조회 (일반 사용자만)
    const { data: readingData, error: readingError } = await supabase
      .from('daily_cards')
      .select('*')
      .eq('user_id', userStore.currentUser.id)
      .eq('date', today)
      .maybeSingle();

    if (readingError) {
      console.error('daily_cards 조회 에러:', readingError);
      
      // 테이블이 없는 경우
      if (readingError.code === '42P01') {
        await showAlert({
          title: '설정 필요',
          message: '오늘의 카드 기능을 사용하려면 관리자에게 문의하세요.'
        });
        isLoading.value = false;
        return;
      }
      // 기타 오류는 무시하고 계속 진행
    }

    // 카드 정보를 별도로 가져오기 (Foreign Key Join이 안 될 경우)
    if (readingData?.card_id) {
      const { data: cardData, error: cardError } = await supabase
        .from('tarot_cards')
        .select('*')
        .eq('id', readingData.card_id)
        .single();
      
      if (!cardError && cardData) {
        readingData.card = cardData;
      }
    }

    if (readingData) {
      todayCard.value = readingData as DailyReading;
      
      // 카드가 이미 뽑혀있으므로 공개 상태로 설정
      isCardRevealed.value = true;
      
      // interpretation_data 컬럼 체크 (옵셔널)
      try {
        if (readingData.interpretation_data) {
          interpretation.value = readingData.interpretation_data;
        } else if (readingData.card) {
          interpretation.value = await TarotInterpretationService.generateInterpretation(
            readingData.card as TarotCard,
            userStore.currentUser?.id
          );
        }
      } catch (error) {
        if (readingData.card) {
          interpretation.value = await TarotInterpretationService.generateInterpretation(
            readingData.card as TarotCard,
            userStore.currentUser?.id
          );
        }
      }
    }
  } catch (error) {
    console.error('오늘의 카드 로드 실패:', error);
    // 에러 발생 시 기본값 설정
    todayCard.value = null;
    isCardRevealed.value = false;
    selectedCard.value = null;
  } finally {
    isLoading.value = false;
  }
};

// 카드 뽑기
const drawCard = async () => {
  // 프리미엄 테스트 계정은 항상 새로운 카드 뽑기 가능
  if (isPremiumTestAcc.value) {
    // 상태 초기화하여 새로운 카드 뽑기 준비
    todayCard.value = null;
    isCardRevealed.value = false;
    selectedCard.value = null;
    interpretation.value = null;
  }
  
  // 프리미엄 테스트 계정이 아니고 오늘 이미 카드를 뽑은 경우
  if (!isPremiumTestAcc.value && todayCard.value) {
    
    // 이미 뽑은 카드 표시
    selectedCard.value = todayCard.value.card;
    
    // readings 테이블 동기화는 권한 문제로 스킵
    
    // 해석이 있으면 표시
    if (todayCard.value.interpretation_data) {
      interpretation.value = todayCard.value.interpretation_data;
      isCardRevealed.value = true;
    } else if (selectedCard.value) {
      // 해석이 없으면 생성
      isInterpretationLoading.value = true;
      interpretationProgress.value = 10;
      
      let progressInterval: number | null = null;
      progressInterval = setInterval(() => {
        if (interpretationProgress.value < 90) {
          interpretationProgress.value += Math.random() * 15 + 5;
        }
      }, 500) as unknown as number;
      
      try {
        interpretation.value = await TarotInterpretationService.generateInterpretation(
          selectedCard.value,
          userStore.currentUser?.id
        );
        if (progressInterval) clearInterval(progressInterval);
        interpretationProgress.value = 100;
        setTimeout(() => {
          isInterpretationLoading.value = false;
          isCardRevealed.value = true;
        }, 500);
      } catch (error) {
        console.error('해석 생성 실패:', error);
        if (progressInterval) clearInterval(progressInterval);
        isInterpretationLoading.value = false;
        isCardRevealed.value = true;
        interpretation.value = TarotInterpretationService.generateDefaultInterpretation(selectedCard.value);
      }
    }
    return;
  }
  
  // 프리미엄 테스트 계정이 아니고 이미 카드가 공개된 경우
  if (!isPremiumTestAcc.value && isCardRevealed.value && selectedCard.value) {
    return;
  }
  
  // 테스트 계정이라도 로딩 중이면 리턴
  if (isInterpretationLoading.value) {
    return;
  }
  
  // 로그인 확인
  if (!userStore.currentUser) {
    console.error('로그인되지 않은 사용자');
    await showAlert({
      title: '로그인 필요',
      message: '카드를 뽑으려면 로그인이 필요합니다.'
    });
    router.push('/');
    return;
  }

  
  // 프리미엄 사용자에게만 AI 해석 로딩 화면 표시
  // 무료 사용자는 바로 광고로 이동
  let progressInterval: number | null = null;
  
  // 로딩 화면을 보여줘야 할 사용자 확인 (프리미엄 사용자 또는 프리미엄 테스트 계정)
  const shouldShowLoading = userStore.isPremium || isPremiumTestAcc;
  
  if (shouldShowLoading) {
    isInterpretationLoading.value = true;
    interpretationProgress.value = 10;
    
    await nextTick();
    
    // 프로그레스 애니메이션 시작
    progressInterval = setInterval(() => {
      if (interpretationProgress.value < 90) {
        interpretationProgress.value += Math.random() * 15 + 5;
      }
    }, 500) as unknown as number;
  }
  
  try {
    // isLoading을 false로 유지 (전체 페이지 로딩이 아닌 AI 해석 로딩만 표시)
    // isLoading.value = true;
    // 먼저 모든 카드 개수 확인
    const { count, error: countError } = await supabase
      .from('tarot_cards')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // 랜덤으로 카드 선택 (실제 카드 개수 기준)
    const totalCards = count || 78;
    const randomIndex = Math.floor(Math.random() * totalCards);
    
    // 랜덤 인덱스에 해당하는 카드 선택
    const { data: cards, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .range(randomIndex, randomIndex);
    
    if (error) throw error;
    if (!cards || cards.length === 0) throw new Error('카드를 찾을 수 없습니다');
    
    const card = cards[0];
    
    // 카드가 정상적으로 선택되었는지 확인 (id가 0일 수도 있음 - The Fool)
    if (!card || (card.id === undefined || card.id === null)) {
      console.error('카드 선택 실패 - 카드 정보:', card);
      throw new Error('카드를 선택할 수 없습니다');
    }

    // 카드를 아직 selectedCard에 할당하지 않음 (광고 후에 할당)
    // selectedCard.value = card;
    // 카드는 바로 뒤집지 않고 광고와 AI 해석이 완료되면 표시

    // DB에 저장
    const today = new Date().toISOString().split('T')[0];
    // isTestAcc는 이미 위에서 선언됨
    
    // 테스트 계정도 실제 user_id 사용
    const userId = userStore.currentUser?.id;
    
    // Supabase 세션 확인
    const { data: sessionData } = await supabase.auth.getSession();
    
    // 세션이 없는 경우 처리
    if (!sessionData?.session) {
      console.error('Supabase 세션이 없습니다. 재로그인 필요.');
      
      // 테스트 계정인 경우 재로그인 시도
      if (isTestAcc.value) {
        const { ensureTestAccountLoggedIn } = await import('../utils/test-account');
        await ensureTestAccountLoggedIn();
        
        // 재로그인 후 다시 세션 확인
        const { data: newSessionData } = await supabase.auth.getSession();
        if (!newSessionData?.session) {
          throw new Error('테스트 계정 재로그인 실패');
        }
      } else {
        // 일반 사용자는 로그인 화면으로 이동
        await showAlert({
          title: '로그인 필요',
          message: '세션이 만료되었습니다. 다시 로그인해주세요.'
        });
        router.push('/');
        return;
      }
    }
    
    if (!userId) {
      console.error('user_id가 없습니다:', userStore.currentUser);
      throw new Error('사용자 ID를 찾을 수 없습니다');
    }
    
    
    // saveDailyCardWithReading 함수를 사용하여 daily_cards에 저장
    // readings 테이블 저장은 현재 권한 문제로 스킵
    
    // 모든 사용자(프리미엄 테스트 계정 포함) DB에 저장
    const savedData = await saveDailyCardWithReading(
      userId,
      card,
      today,
      isPremiumTestAcc.value  // 프리미엄 테스트 계정 여부 전달
    );
    
    if (savedData) {
      todayCard.value = savedData;
    } else {
      // 저장 실패 시 메모리에서만 사용
      todayCard.value = {
        id: null,
        user_id: userId,
        card_id: card.id,
        date: today,
        orientation: 'upright',
        card: card,
        created_at: new Date().toISOString()
      } as any;
    }

    
    // 프리미엄 테스트 계정은 강제로 프리미엄 처리
    const shouldShowAd = isPremiumTestAcc.value ? false : !userStore.isPremium;
    
    // 무료 사용자는 광고 표시 (무료 테스트 계정도 광고 표시)
    if (shouldShowAd) {
    // 광고 표시 전에 카드는 선택하되 공개하지 않음
    selectedCard.value = card;
    isCardRevealed.value = false;
    
    // 진행중인 프로그레스 인터벌 정리
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    
    // 광고 표시
    const adInterpretation = await showAdvertisement(
      card,
      (card) => TarotInterpretationService.generateInterpretation(card, userStore.currentUser?.id),
      (revealed) => { isCardRevealed.value = revealed; },
      (loading) => { isInterpretationLoading.value = loading; },
      (progress) => { interpretationProgress.value = progress; }
    );
    
    // 광고 후 해석 설정
    if (adInterpretation) {
      interpretation.value = adInterpretation;
    } else {
      // 광고 실패 또는 기본 해석 요청 시
      interpretation.value = TarotInterpretationService.generateDefaultInterpretation(card);
    }
    } else {
      // 프리미엄 사용자는 바로 카드 설정
      selectedCard.value = card;
      interpretation.value = await TarotInterpretationService.generateInterpretation(
        card,
        userStore.currentUser?.id
      );
      
      // AI 해석 완료 후 프로그레스 완료 및 카드 공개
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      interpretationProgress.value = 100;
      setTimeout(() => {
        isInterpretationLoading.value = false;
        isCardRevealed.value = true;
      }, 500);
    }
  } catch (error) {
    console.error('카드 뽑기 실패:', error);
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    isInterpretationLoading.value = false;
    interpretationProgress.value = 0;
    isCardRevealed.value = false;
    selectedCard.value = null;
    await showAlert({
      title: '오류',
      message: '카드를 뽑는 중 문제가 발생했습니다.'
    });
  }
};





// 카드 이미지 URL 가져오기
// 카드 이미지 URL 생성 - 통합 카드 이미지 함수 사용
const getCardImageUrl = (card: TarotCard | undefined | null) => {
  if (!card) {
    return CARD_BACK_BASE64;
  }
  return getUnifiedCardImagePath(card);
};

// 이미지 로드 에러 처리
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  // 카드 뒷면 이미지로 대체
  target.src = CARD_BACK_BASE64;
};

// 카드 공유
const shareCard = async () => {
  try {
    // 공유할 카드와 해석 확인
    const card = selectedCard.value || todayCard.value?.card;
    if (!card || !interpretation.value) {
      await showAlert({
        title: '알림',
        message: '공유할 카드 정보가 없습니다.'
      });
      return;
    }

    console.log('📤 [DailyCard] 공유 시작');
    console.log('📤 [DailyCard] interpretation 타입:', typeof interpretation.value);
    console.log('📤 [DailyCard] interpretation 키:', interpretation.value ? Object.keys(interpretation.value) : 'null');

    // 공유 링크 생성
    const shareUrl = await shareService.createDailyCardShareLink({
      card: card,
      interpretation: interpretation.value,
      date: new Date()
    });

    // 공유 메시지 생성
    const shareMessage = shareService.generateDailyCardShareMessage(
      card,
      interpretation.value,
      shareUrl
    );

    // 네이티브 공유 실행
    const shared = await shareService.shareWithNative(
      '오늘의 타로 카드',
      shareMessage,
      shareUrl
    );

    if (shared) {
      console.log('공유 완료');
      // 공유 성공 시 별도 알림 없음 (이미 시스템에서 처리)
    } else {
      // 클립보드에 복사된 경우
      await showAlert({
        title: '공유 링크 복사됨',
        message: '링크가 클립보드에 복사되었습니다.'
      });
    }
  } catch (error) {
    console.error('공유 실패:', error);
    
    if (error instanceof Error && error.message === 'CLIPBOARD_COPY') {
      // 클립보드 복사 성공
      await showAlert({
        title: '링크 복사 완료',
        message: '공유 링크가 클립보드에 복사되었습니다.'
      });
    } else {
      await showAlert({
        title: '공유 실패',
        message: '공유 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
  }
};

// 컴포넌트 마운트 시 오늘의 카드 로드
onMounted(async () => {
  // 상태 초기화
  initializeState();
  
  // 사용자 초기화가 완료될 때까지 대기
  if (!userStore.isInitialized) {
    isLoading.value = true; // 초기화 중에는 로딩 상태 유지
    
    // 최대 5초 대기
    let waitCount = 0;
    while (!userStore.isInitialized && waitCount < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }
  }
  
  // 테스트 계정 처리
  // URL에 test 파라미터가 있거나, 현재 로그인이 없으면 테스트 계정 사용
  const urlParams = new URLSearchParams(window.location.search);
  const useTestAccount = urlParams.get('test') === 'true' || 
                         (!userStore.currentUser && urlParams.has('test'));
  
  if (useTestAccount) {
    await ensureTestAccountLoggedIn();
  }
  
  await loadTodayCard();
});

</script>

<style scoped>
/* 컨테이너 */
.daily-card-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 헤더 */
.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* 날짜 표시 */
.date-display {
  text-align: center;
  padding: 12px 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

/* 콘텐츠 래퍼 */
.content-wrapper {
  padding: 32px 20px;
  max-width: 600px;
  margin: 0 auto;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 카드 영역 */
.card-area {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.card-back {
  width: 200px;
  height: 300px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-back:hover:not(.disabled) {
  transform: translateY(-5px);
}

.card-back.disabled {
  cursor: default;
  opacity: 0.7;
  pointer-events: none;
}

.card-pattern {
  width: 80%;
  height: 60%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-instruction {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 0 20px;
}

.card-front {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;  /* 전체 너비 사용 */
}

.card-image {
  width: 200px;
  height: 300px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  object-fit: contain;  /* cover에서 contain으로 변경 - 이미지 전체가 보이도록 */
  background-color: #f8f8f8;  /* 여백 부분 배경색 */
  display: block;
  margin: 0 auto;  /* 중앙 정렬 */
}

.card-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.card-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 광고 컨테이너 */
.ad-container {
  margin: 40px 0;
}

.ad-overlay {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 24px;
}

.ad-content {
  text-align: center;
}

.ad-notice {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 600;
}

.ad-timer {
  font-size: 24px;
  font-weight: 700;
  color: #FFD700;
  margin-bottom: 20px;
}

.ad-placeholder {
  background: #f0f0f0;
  height: 250px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

/* 해석 영역 */
.interpretation-area {
  margin-top: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 운세 지수 */
.fortune-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.fortune-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.fortune-item {
  text-align: center;
}

.fortune-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.star {
  font-size: 16px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

/* 시간대별 조언 */
.time-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.time-advice {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-item {
  text-align: left;
}

.time-label {
  font-weight: 600;
  color: #FFD700;
  display: block;
  margin-bottom: 8px;
}

.time-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 행운 아이템 */
.lucky-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.lucky-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.lucky-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.lucky-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.lucky-value {
  font-weight: 600;
  color: #FFD700;
}

/* 인간관계 조언 */
.relationship-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.relationship-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
}

.relationship-content strong {
  color: #FFD700;
}

/* 오늘의 격언 */
.quote-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.daily-quote {
  font-size: 18px;
  font-style: italic;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  border-left: 4px solid #FFD700;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

/* 상세 운세 섹션 */
.detailed-fortune-section {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.detailed-fortune-content {
  color: rgba(255, 255, 255, 0.9);
}

.card-reference {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.card-badge {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
}

.fortune-main-text {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.95);
}

.fortune-aspects {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.fortune-aspect {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.fortune-aspect h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #FFD700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.fortune-aspect p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.fortune-advice {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  border-left: 3px solid #FFD700;
}

.advice-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 액션 버튼 */
.action-buttons {
  margin-top: 40px;
  text-align: center;
}

.share-button {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.share-button:hover {
  transform: translateY(-2px);
}

/* 반응형 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 0 16px 32px;
  }
  
  .fortune-grid {
    grid-template-columns: 1fr;
  }
  
  .lucky-grid {
    grid-template-columns: 1fr;
  }
  
  .card-image {
    width: 180px;  /* 너비 약간 증가 */
    height: 270px;  /* 높이 약간 증가 */
    object-fit: contain;
    background-color: #f8f8f8;
  }
}
</style>
