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
      <!-- 디버그 버튼 (개발용) -->
      <button 
        v-if="false" 
        @click="testLoading" 
        style="margin-left: 20px; padding: 5px 10px; background: white; color: black; border-radius: 4px;"
      >
        로딩 테스트
      </button>
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

      <!-- 이미 뽑은 경우 (광고/로딩 중이 아닐 때만 표시) -->
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

      <!-- 광고 영역 (개발 환경에서만 표시) -->
      <div v-if="showAd && false" class="ad-container">
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
      <div v-if="showInterpretation && interpretation" class="interpretation-area">
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
import { ensureTestAccountLoggedIn, isTestAccount } from '../utils/test-account';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// 상태 관리
const isLoading = ref(false);
const isCardRevealed = ref(false);
const selectedCard = ref<TarotCard | null>(null);
const todayCard = ref<DailyReading | null>(null);
const interpretation = ref<DailyInterpretation | null>(null);
const showAd = ref(false);
const adTimeRemaining = ref(15);
const adTimer = ref<number | null>(null);
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
         interpretation.value !== null;
});

// 메서드
const goBack = () => {
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
  console.log('loadTodayCard 시작');
  console.log('Supabase URL:', SUPABASE_CONFIG.url);
  console.log('User:', userStore.currentUser);
  
  // 상태 완전 초기화 - 매번 새로 시작
  isCardRevealed.value = false;
  selectedCard.value = null;
  todayCard.value = null;  // 이전 카드 정보도 초기화
  interpretation.value = null;
  showAd.value = false;
  isInterpretationLoading.value = false;
  interpretationProgress.value = 0;
  
  // 진행중인 타이머가 있으면 클리어
  if (adTimer.value) {
    clearInterval(adTimer.value);
    adTimer.value = null;
  }
  
  try {
    isLoading.value = true;
    const today = new Date().toISOString().split('T')[0];
    
    // 로그인 확인 (익명 사용자 차단) - 테스트 계정 예외 처리
    const isTestAcc = isTestAccount(userStore.currentUser?.email);
    
    if (!userStore.currentUser || (userStore.currentUser.isAnonymous && !isTestAcc)) {
      console.error('로그인되지 않은 사용자:', userStore.currentUser);
      isLoading.value = false;
      await showAlert({
        title: '로그인 필요',
        message: '오늘의 카드 기능을 사용하려면 로그인이 필요합니다.'
      });
      router.push('/');
      return;
    }
    
    // 이메일 인증 확인 (테스트 계정은 건너뛰기)
    if (!isTestAcc && !userStore.currentUser.email) {
      console.error('이메일 인증이 필요합니다');
      isLoading.value = false;
      await showAlert({
        title: '인증 필요',
        message: '이메일 인증을 완료해주세요.'
      });
      router.push('/');
      return;
    }
    
    // 테스트 계정이면 기존 데이터 삭제 후 새로 뽑기 가능하게 함
    if (isTestAcc) {
    console.log('테스트 계정 감지: 오늘의 카드 캐싱 비활성화');
    console.log('테스트 계정 프리미엄 상태:', userStore.isPremium);
    
    // 테스트 계정은 실제 Supabase user_id 사용 (현재 로그인한 사용자의 ID)
    const testUserId = userStore.currentUser?.id;
    
    if (testUserId) {
    try {
    // 먼저 조회 후 존재하면 삭제
    const { data: existingData, error: selectError } = await supabase
      .from('daily_cards')
      .select('*')
        .eq('user_id', testUserId)
        .eq('date', today)
      .maybeSingle();
      
    if (selectError) {
        console.log('테스트 계정 데이터 조회 실패:', selectError);
        } else if (existingData) {
        // 데이터가 존재하면 삭제
          const { error: deleteError } = await supabase
            .from('daily_cards')
            .delete()
            .eq('user_id', testUserId)
            .eq('date', today);
          
          if (deleteError) {
            console.log('기존 데이터 삭제 실패:', deleteError);
          } else {
            console.log('테스트 계정 기존 데이터 삭제 완료');
          }
        } else {
          console.log('삭제할 기존 데이터 없음');
        }
      } catch (err) {
        console.log('삭제 중 오류 (무시):', err);
      }
    } else {
      console.log('테스트 계정 user_id가 없음');
    }
      
      // 테스트 계정은 항상 새로 뽑기 가능하도록 설정
      todayCard.value = null;
      // 카드 뽑기 가능한 상태로 완전 초기화
      isCardRevealed.value = false;
      selectedCard.value = null;
      interpretation.value = null;
      showAd.value = false;
      isInterpretationLoading.value = false;
      interpretationProgress.value = 0;
      isLoading.value = false;
      console.log('테스트 계정 상태 초기화 완료:', {
        todayCard: todayCard.value,
        isCardRevealed: isCardRevealed.value,
        selectedCard: selectedCard.value,
        isInterpretationLoading: isInterpretationLoading.value
      });
      return; // 테스트 계정은 여기서 종료
    }
    
    // 일반 계정만 daily_cards 조회
    console.log('데이터베이스 조회 시작...');
    const { data: readingData, error: readingError } = await supabase
      .from('daily_cards')
      .select('*')
      .eq('user_id', userStore.currentUser.id)
      .eq('date', today)
      .maybeSingle();

    if (readingError) {
      console.error('daily_cards 조회 에러:', readingError);
      console.error('에러 상세:', {
        code: readingError.code,
        message: readingError.message,
        details: readingError.details,
        hint: readingError.hint
      });
      
      // 테이블이 없는 경우
      if (readingError.code === '42P01') {
        await showAlert({
          title: '설정 필요',
          message: '오늘의 카드 기능을 사용하려면 관리자에게 문의하세요.'
        });
        isLoading.value = false;
        return;
      }
      
      // 기타 오류는 무시하고 계속 진행 (새로 카드 뽑기 가능)
      console.log('daily_cards 조회 실패했지만 계속 진행');
    }
    
    console.log('readingData:', readingData);

    // 카드 정보를 별도로 가져오기 (Foreign Key Join이 안 될 경우)
    if (readingData?.card_id) {
      console.log('카드 ID로 조회 시작:', readingData.card_id);
      const { data: cardData, error: cardError } = await supabase
        .from('tarot_cards')
        .select('*')
        .eq('id', readingData.card_id)
        .single();
      
      if (cardError) {
        console.error('카드 조회 에러:', cardError);
      } else {
        console.log('카드 조회 성공:', {
          cardId: cardData.id,
          cardName: cardData.name,
          cardNameKr: cardData.name_kr,
          savedCardId: readingData.card_id,
          isMatch: cardData.id === readingData.card_id
        });
        readingData.card = cardData;
      }
    }

    if (readingData) {
      console.log('오늘의 카드 데이터:', readingData);
      todayCard.value = readingData as DailyReading;
      
      // interpretation_data 컬럼 체크 (옵셔널)
      try {
        if (readingData.interpretation_data) {
          console.log('캐싱된 해석 사용');
          interpretation.value = readingData.interpretation_data;
        } else if (readingData.card) {
          console.log('새로운 해석 생성 필요');
          await generateInterpretation(readingData.card as TarotCard);
        }
      } catch (error) {
        console.log('interpretation_data 컬럼 없음, 새로운 해석 생성');
        if (readingData.card) {
          await generateInterpretation(readingData.card as TarotCard);
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
    // 반드시 로딩 상태 해제
    console.log('로딩 상태 해제');
    isLoading.value = false;
  }
};

// 카드 뽑기
const drawCard = async () => {
  console.log('drawCard 시작 - 현재 상태:', {
    isCardRevealed: isCardRevealed.value,
    selectedCard: selectedCard.value,
    isInterpretationLoading: isInterpretationLoading.value,
    todayCard: todayCard.value
  });
  
  // 이미 오늘 카드를 뽑았는지 체크
  const isTestAcc = isTestAccount(userStore.currentUser?.email);
  
  // 테스트 계정이 아니고 오늘 이미 카드를 뽑은 경우
  if (!isTestAcc && todayCard.value) {
    console.log('오늘 이미 카드를 뽑음');
    
    // 이미 뽑은 카드 표시
    selectedCard.value = todayCard.value.card;
    
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
        await generateInterpretation(selectedCard.value);
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
        interpretation.value = generateDefaultInterpretation(selectedCard.value);
      }
    }
    return;
  }
  
  // 테스트 계정이 아니고 이미 카드가 공개된 경우
  if (!isTestAcc && isCardRevealed.value && selectedCard.value) {
    console.log('이미 카드가 공개됨');
    return;
  }
  
  // 테스트 계정이라도 로딩 중이면 리턴
  if (isInterpretationLoading.value) {
    console.log('이미 로딩 중...');
    return;
  }
  
  // 테스트 계정은 매번 상태 초기화하고 진행
  if (isTestAcc) {
    console.log('테스트 계정 - 상태 초기화 후 진행');
    isCardRevealed.value = false;
    selectedCard.value = null;
    interpretation.value = null;
    showAd.value = false;
    isInterpretationLoading.value = false;
    interpretationProgress.value = 0;
  }
  
  // isTestAcc는 이미 위에서 선언됨
  
  // 로그인 확인 (익명 사용자 차단) - 테스트 계정은 예외
  if (!userStore.currentUser || (userStore.currentUser.isAnonymous && !isTestAcc)) {
    console.error('로그인되지 않은 사용자');
    await showAlert({
      title: '로그인 필요',
      message: '카드를 뽑으려면 로그인이 필요합니다.'
    });
    router.push('/');
    return;
  }

  console.log('drawCard 시작 - 상태 확인');
  console.log('  isCardRevealed:', isCardRevealed.value);
  console.log('  selectedCard:', selectedCard.value);
  console.log('  isInterpretationLoading:', isInterpretationLoading.value);
  
  // 프리미엄 사용자에게만 AI 해석 로딩 화면 표시
  // 무료 사용자는 바로 광고로 이동
  let progressInterval: number | null = null;
  
  // isTestAcc는 이미 위에서 선언됨
  if (userStore.isPremium && !isTestAcc) {
    // 프리미엄 사용자만 로딩 화면 표시
    isInterpretationLoading.value = true;
    interpretationProgress.value = 10;
    
    console.log('isInterpretationLoading 설정됨:', isInterpretationLoading.value);
    console.log('interpretationProgress:', interpretationProgress.value);
    
    await nextTick();
    
    // 프로그레스 애니메이션 시작
    progressInterval = setInterval(() => {
      if (interpretationProgress.value < 90) {
        interpretationProgress.value += Math.random() * 15 + 5;
        console.log('progress updated:', interpretationProgress.value);
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

    console.log('선택된 카드 상세:', {
      id: card.id,
      name: card.name,
      name_kr: card.name_kr,
      arcana: card.arcana,
      suit: card.suit,
      number: card.number,
      randomIndex: randomIndex
    });
    // 카드를 아직 selectedCard에 할당하지 않음 (광고 후에 할당)
    // selectedCard.value = card;
    // 카드는 바로 뒤집지 않고 광고와 AI 해석이 완료되면 표시

    // DB에 저장
    const today = new Date().toISOString().split('T')[0];
    // isTestAcc는 이미 위에서 선언됨
    
    // 테스트 계정도 실제 user_id 사용
    const userId = userStore.currentUser?.id;
    
    if (!userId) {
      console.error('user_id가 없습니다');
      throw new Error('사용자 ID를 찾을 수 없습니다');
    }
    
    // readings 테이블에도 저장 (점괘 기록용) - 모든 사용자 대상
    // 테스트 계정도 기록은 남겨야 함
    try {
      console.log('readings 테이블에 오늘의 카드 저장 시도');
      
      // 테스트 계정인 경우 기존 데이터 삭제 후 새로 삽입
      if (isTestAcc) {
        const { error: deleteError } = await supabase
          .from('readings')
          .delete()
          .eq('user_id', userId)
          .eq('spread_id', 'daily_card')
          .eq('question', `${today} 오늘의 카드`);
        
        if (deleteError) {
          console.log('테스트 계정 기존 readings 삭제 실패 (무시):', deleteError);
        }
      }
      
      const readingData = {
        user_id: userId,
        spread_id: 'daily_card',  // spread_type이 아니라 spread_id
        topic: 'general',  // 기본 주제
        question: `${today} 오늘의 카드`,
        cards: {
          positions: [{
            position: 'daily',
            card_id: card.id,
            card_name: card.name,
            card_name_kr: card.name_kr,
            orientation: 'upright'
          }]
        },
        overall_message: `오늘의 카드: ${card.name_kr}`,
        is_premium: false,
        shared: false,
        created_at: new Date().toISOString()
      };
      
      const { data: savedReading, error: readingError } = await supabase
        .from('readings')
        .insert(readingData)
        .select('*')
        .single();
      
      if (readingError) {
        console.error('readings 테이블 저장 실패:', readingError);
        console.error('저장 시도한 데이터:', readingData);
        // 에러가 나도 계속 진행 (daily_cards는 이미 저장됨)
      } else {
        console.log('readings 테이블 저장 성공:', savedReading);
        
        // 저장된 reading ID를 보관 (나중에 해석 업데이트용)
        if (savedReading && savedReading.id) {
          todayCard.value = { ...todayCard.value, reading_id: savedReading.id } as any;
        }
      }
    } catch (error) {
      console.error('readings 테이블 저장 중 예외:', error);
      // 에러가 나도 계속 진행
    }
    
    // 중복 체크 및 저장 처리
    if (!isTestAcc) {
      // 이미 오늘 카드를 뽑았는지 먼저 확인
      const { data: existingCard, error: checkError } = await supabase
        .from('daily_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('오늘의 카드 확인 오류:', checkError);
      }
      
      if (existingCard) {
        console.log('오늘 이미 카드를 뽑았음 - 업데이트는 하지 않음');
        // 이미 카드가 있으면 저장하지 않고 그 카드 사용
        todayCard.value = existingCard;
        
        // 카드 정보가 없으면 별도 조회
        if (!existingCard.card && existingCard.card_id) {
          const { data: cardData, error: cardError } = await supabase
            .from('tarot_cards')
            .select('*')
            .eq('id', existingCard.card_id)
            .single();
          
          if (!cardError && cardData) {
            todayCard.value.card = cardData;
            selectedCard.value = cardData; // 현재 선택된 카드도 업데이트
          }
        } else {
          selectedCard.value = existingCard.card || card; // 기존 카드 또는 새로 뽑은 카드 사용
        }
      } else {
        // 새로운 카드 저장
        console.log('카드 저장 시도:', {
          user_id: userId,
          card_id: card.id,
          cardName: card.name,
          date: today
        });
        
        const { data: savedReading, error: saveError } = await supabase
          .from('daily_cards')
          .insert({
            user_id: userId,
            card_id: card.id,
            date: today,
            orientation: 'upright'
          })
          .select('*')
          .single();
        
        if (saveError) {
          console.error('카드 저장 오류:', saveError);
          // 중복 키 오류인 경우 무시하고 진행
          if (saveError.code === '23505') {
            console.log('중복 키 오류 - 이미 오늘 카드가 존재함');
            // 기존 카드 다시 조회
            const { data: existingData } = await supabase
              .from('daily_cards')
              .select('*')
              .eq('user_id', userId)
              .eq('date', today)
              .maybeSingle();
            
            if (existingData) {
              todayCard.value = existingData;
              todayCard.value.card = card;
            } else {
              // 조회도 실패하면 메모리에서만 사용
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
          } else {
            // 다른 오류인 경우 메모리에서만 사용
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
        } else {
          console.log('카드 저장 성공:', savedReading);
          savedReading.card = card;
          todayCard.value = savedReading;
        }
      }
    } else {
      // 테스트 계정은 기존 데이터 삭제 후 새로 저장
      console.log('테스트 계정: 기존 데이터 삭제 시도');
      const { error: deleteError } = await supabase
        .from('daily_cards')
        .delete()
        .eq('user_id', userId)
        .eq('date', today);
      
      if (deleteError) {
        console.log('기존 데이터 삭제 실패 (무시):', deleteError);
      } else {
        console.log('테스트 계정 기존 데이터 삭제 완료');
      }
      
      // 테스트 계정용 새로운 카드 저장
      const { data: savedReading, error: saveError } = await supabase
        .from('daily_cards')
        .insert({
          user_id: userId,
          card_id: card.id,
          date: today,
          orientation: 'upright'
        })
        .select('*')
        .single();
      
      if (saveError) {
        console.error('테스트 계정 카드 저장 오류:', saveError);
        // 저장 실패해도 메모리에서 사용
        todayCard.value = {
          id: null,
          user_id: userId,
          card_id: card.id,
          date: today,
          orientation: 'upright',
          card: card,
          created_at: new Date().toISOString()
        } as any;
      } else {
        console.log('테스트 계정 카드 저장 성공:', savedReading);
        savedReading.card = card;
        todayCard.value = savedReading;
      }
    }

    // 테스트 계정 확인 및 프리미엄 상태 확인
    console.log('테스트 계정 여부:', isTestAcc);
    console.log('프리미엄 상태:', userStore.isPremium);
    console.log('userStore.currentUser:', userStore.currentUser);
    
    // 무료 사용자는 광고 표시 (테스트 계정도 무료로 처리)
    if (!userStore.isPremium || isTestAcc) {
      console.log('무료 사용자 또는 테스트 계정 - 광고 표시 준비');
      // 광고 표시 전에 모든 UI 숨김
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      isInterpretationLoading.value = false;
      interpretationProgress.value = 0;
      isCardRevealed.value = false;
      
      // 즉시 광고 호출 (딜레이 없이) - 카드 정보 전달
      await showAdvertisement(card);
    } else {
      console.log('프리미엄 사용자 - AI 해석 직접 생성');
      // 프리미엄 사용자는 바로 카드 설정
      selectedCard.value = card;
      await generateInterpretation(card);
      // AI 해석 완료 후 프로그레스 완료 및 카드 공개
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      interpretationProgress.value = 100;
      console.log('AI 해석 완료, 로딩 화면 종료');
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

// 광고 표시 (리워드 광고 사용)
const showAdvertisement = async (card: TarotCard) => {
  console.log('광고 표시 시작');
  console.log('전달받은 카드:', card);
  console.log('현재 상태:', {
    selectedCard: selectedCard.value,
    isCardRevealed: isCardRevealed.value,
    isInterpretationLoading: isInterpretationLoading.value
  });
  
  // 카드가 아직 공개되지 않도록 확실히 함
  isCardRevealed.value = false;
  isInterpretationLoading.value = false;
  interpretationProgress.value = 0;
  // selectedCard를 아직 설정하지 않음 (광고 후에 설정)
  
  try {
    // AdMob 리워드 광고 호출
    const { showRewardedAd } = await import('../services/admob');
    
    // 광고 UI 표시
    showAd.value = true;
    adTimeRemaining.value = 15;
    
    // 광고 표시 (15초 강제 시청)
    const adWatched = await showRewardedAd();
    
    console.log('광고 시청 완료:', adWatched);
    
    // 광고 UI 숨김
    showAd.value = false;
    
    if (adWatched) {
      // 광고 시청 완료 시 AI 해석 로딩 화면 표시
      console.log('광고 시청 완료, AI 해석 시작');
      
      // 이제 카드를 selectedCard에 설정
      selectedCard.value = card;
      console.log('카드 설정 완료:', selectedCard.value);
      
      // 카드 확인
      if (!selectedCard.value) {
        console.error('선택된 카드가 없음 - 중단');
        showAd.value = false;
        isCardRevealed.value = false;
        await showAlert({
          title: '오류',
          message: '카드 정보를 찾을 수 없습니다. 다시 시도해주세요.'
        });
        return;
      }
      
      isInterpretationLoading.value = true;
      interpretationProgress.value = 10; // 초기값 설정
      
      // DOM 업데이트 보장
      await nextTick();
      
      // 프로그레스 애니메이션 시작
      let progressInterval: number | null = null;
      progressInterval = setInterval(() => {
        if (interpretationProgress.value < 90) {
          interpretationProgress.value += Math.random() * 15 + 5;
          console.log('Progress:', interpretationProgress.value);
        }
      }, 500) as unknown as number;
      
      // AI 해석 생성
      try {
        console.log('generateInterpretation 호출 전');
        await generateInterpretation(selectedCard.value);
        console.log('generateInterpretation 완료');
        console.log('interpretation.value:', interpretation.value);
        
        // AI 해석 완료 후 카드 공개
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        interpretationProgress.value = 100;
        
        // 로딩 화면을 잠시 유지 후 종료
        setTimeout(() => {
          isInterpretationLoading.value = false;
          interpretationProgress.value = 0;
          isCardRevealed.value = true;
          console.log('광고 후 카드 및 해석 공개 완료');
          console.log('최종 상태:', {
            isCardRevealed: isCardRevealed.value,
            showInterpretation: showInterpretation.value,
            interpretation: interpretation.value ? '있음' : '없음'
          });
        }, 800);
      } catch (error) {
        console.error('해석 생성 실패:', error);
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        
        // 에러 발생 시에도 기본 해석 사용
        if (selectedCard.value) {
          console.log('기본 해석 생성');
          interpretation.value = generateDefaultInterpretation(selectedCard.value);
        }
        
        // 로딩 화면 종료 및 카드 공개
        isInterpretationLoading.value = false;
        interpretationProgress.value = 0;
        isCardRevealed.value = true;
        
        console.log('에러 발생 후 최종 상태:', {
          isCardRevealed: isCardRevealed.value,
          showInterpretation: showInterpretation.value,
          interpretation: interpretation.value ? '있음' : '없음'
        });
      }
    } else {
      // 광고 시청 실패 또는 중단
      console.log('광고 시청 중단됨');
      await showAlert({
        title: '알림',
        message: '광고를 끝까지 시청해야 상세 해석을 볼 수 있습니다.'
      });
      
      // 다시 광고 보기 옵션 제공
      const retry = await showConfirm({
        title: '광고 다시 보기',
        message: '광고를 다시 시청하시겠습니까?',
        confirmText: '다시 보기',
        cancelText: '취소'
      });
      
      if (retry) {
        await showAdvertisement(card); // 재귀 호출 - 카드 전달
      } else {
        // 광고 없이 기본 해석만 표시
        selectedCard.value = card; // 카드 설정
        isCardRevealed.value = true;
        interpretation.value = generateDefaultInterpretation(card);
      }
    }
  } catch (error) {
    console.error('광고 표시 실패:', error);
    showAd.value = false;
    
    // 광고 실패 시에도 AI 해석 진행 (무료 패스)
    // 카드 설정
    selectedCard.value = card;
    
    if (!selectedCard.value) {
      console.error('선택된 카드가 없어 진행 불가');
      isCardRevealed.value = false;
      return;
    }
    
    isInterpretationLoading.value = true;
    interpretationProgress.value = 0;
    
    let progressInterval: number | null = null;
    progressInterval = setInterval(() => {
      if (interpretationProgress.value < 90) {
        interpretationProgress.value += Math.random() * 15 + 5;
      }
    }, 500) as unknown as number;
    
    try {
      await generateInterpretation(selectedCard.value);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      interpretationProgress.value = 100;
      
      setTimeout(() => {
        isInterpretationLoading.value = false;
        isCardRevealed.value = true;
        console.log('광고 실패 후 기본 해석으로 카드 공개');
      }, 500);
    } catch (genError) {
      console.error('해석 생성도 실패:', genError);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      isInterpretationLoading.value = false;
      interpretationProgress.value = 0;
      isCardRevealed.value = true;
      interpretation.value = generateDefaultInterpretation(selectedCard.value);
    }
  }
};

// AI 해석 생성
const generateInterpretation = async (card: TarotCard) => {
  try {
    console.log('AI 해석 생성 시작:', card);
    
    // 카드가 없으면 에러 처리
    if (!card) {
      console.error('generateInterpretation: 카드 정보가 없습니다');
      await showAlert({
        title: '오류',
        message: '카드 정보를 불러올 수 없습니다.'
      });
      return;
    }
    
    // Edge Function 호출하여 OpenAI 해석 생성
    const { data, error } = await supabase.functions.invoke('generate-daily-interpretation', {
      body: { 
        card,
        userId: userStore.currentUser?.id 
      }
    });

    if (error) {
      console.error('Edge Function 호출 에러:', error);
      console.error('에러 상세:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status
      });
      
      // Edge Function 오류 시 기본 해석 사용
      try {
        interpretation.value = generateDefaultInterpretation(card);
        
        // 기본 해석을 DB에 캐싱
        const today = new Date().toISOString().split('T')[0];
        try {
          const { error: updateError } = await supabase
            .from('daily_cards')
            .update({ interpretation_data: interpretation.value })
            .eq('user_id', userStore.currentUser?.id)
            .eq('date', today);
          
          if (updateError) {
            console.log('Fallback 캐싱 스킵:', updateError);
          }
        } catch (cacheError) {
          console.log('interpretation_data 컬럼 없음');
        }
      } catch (fallbackError) {
        console.error('기본 해석 생성 실패:', fallbackError);
        await showAlert({
          title: '오류', 
          message: '해석을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.'
        });
      }
      
      return;
    }

    console.log('AI 해석 결과:', data);
    
    // 응답 데이터 검증
    if (data && data.interpretation) {
      interpretation.value = data.interpretation;
      console.log('AI 해석 생성 완료');
      console.log('해석 데이터 구조:', {
        fortuneIndex: interpretation.value.fortuneIndex ? '있음' : '없음',
        timeAdvice: interpretation.value.timeAdvice ? '있음' : '없음',
        luckyItems: interpretation.value.luckyItems ? '있음' : '없음',
        relationshipAdvice: interpretation.value.relationshipAdvice ? '있음' : '없음',
        dailyQuote: interpretation.value.dailyQuote ? '있음' : '없음',
        detailedFortune: interpretation.value.detailedFortune ? '있음' : '없음'
      });
      
      // 테스트 계정은 캐싱하지 않음
      const isTestAccount = userStore.currentUser?.email === 'test@example.com';
      
      if (!isTestAccount && todayCard.value?.id) {
        // 일반 계정만 interpretation_data 컬럼에 DB 캐싱 시도
        try {
          const today = new Date().toISOString().split('T')[0];
          const { error: updateError } = await supabase
            .from('daily_cards')
            .update({ interpretation_data: data.interpretation })
            .eq('user_id', userStore.currentUser?.id)
            .eq('date', today);
          
          if (updateError) {
            console.log('interpretation_data 컬럼 없거나 업데이트 실패:', updateError);
          } else {
            console.log('해석 데이터 캐싱 성공');
            // todayCard에도 업데이트
            if (todayCard.value) {
              todayCard.value.interpretation_data = data.interpretation;
            }
          }
        } catch (cacheError) {
          console.log('DB 캐싱 스킵 (컬럼 없음)');
        }
      } else {
        console.log('테스트 계정 또는 todayCard 없음: 해석 데이터 캐싱 스킵');
      }
    } else if (data && data.error) {
      // Edge Function이 에러를 반환했지만 기본 해석도 포함한 경우
      console.warn('Edge Function 경고:', data.error);
      interpretation.value = data.interpretation || generateDefaultInterpretation(card);
    } else {
      // 예상치 못한 응답 형식
      console.error('예상치 못한 응답 형식:', data);
      interpretation.value = generateDefaultInterpretation(card);
    }

  } catch (error) {
    console.error('해석 생성 실패:', error);
    // 실패 시 기본 해석 사용
    interpretation.value = generateDefaultInterpretation(card);
    
    // 테스트 계정 확인
    const isTestAccount = userStore.currentUser?.email === 'test@example.com';
    
    if (!isTestAccount) {
      // interpretation_data 컬럼이 있는 경우만 기본 해석도 DB에 캐싱
      try {
        const today = new Date().toISOString().split('T')[0];
        const { error: updateError } = await supabase
          .from('daily_cards')
          .update({ interpretation_data: interpretation.value })
          .eq('user_id', userStore.currentUser?.id)
          .eq('date', today);
        
        if (updateError) {
          console.log('기본 해석 캐싱 스킵:', updateError?.message);
        }
      } catch (cacheError) {
        console.log('interpretation_data 컬럼 없음, 캐싱 스킵');
      }
    } else {
      console.log('테스트 계정: 기본 해석 캐싱 스킵');
    }
  }
  
  // readings 테이블에도 해석 업데이트 (점괘 기록용) - 모든 사용자 대상
  if (interpretation.value) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // todayCard에 저장된 reading_id가 있으면 사용, 없으면 조회
      let readingId = (todayCard.value as any)?.reading_id;
      
      if (!readingId) {
        // reading_id가 없으면 DB에서 조회
        const { data: existingReading } = await supabase
          .from('readings')
          .select('id')
          .eq('user_id', userStore.currentUser?.id)
          .eq('spread_id', 'daily_card')
          .eq('question', `${today} 오늘의 카드`)
          .single();
        
        readingId = existingReading?.id;
      }
      
      if (readingId) {
        // AI 해석을 overall_message에 포함
        const interpretationSummary = interpretation.value.detailedFortune?.mainMessage || 
                                     interpretation.value.dailyQuote || 
                                     `오늘의 카드: ${card.name_kr}`;
        
        const { error: updateError } = await supabase
          .from('readings')
          .update({ 
            overall_message: interpretationSummary,
            // AI 해석 데이터를 tags 필드에 저장 (주요 키워드 추출)
            tags: [
              `운세지수: ${interpretation.value.fortuneIndex.overall}/5`,
              `행운색: ${interpretation.value.luckyItems.color}`,
              `행운숫자: ${interpretation.value.luckyItems.number}`,
              card.arcana === 'major' ? '메이저아르카나' : '마이너아르카나',
              `${today.split('-')[1]}월${today.split('-')[2]}일`
            ]
          })
          .eq('id', readingId);
        
        if (updateError) {
          console.log('readings 테이블 해석 업데이트 실패:', updateError);
        } else {
          console.log('readings 테이블 해석 업데이트 성공');
        }
      } else {
        console.log('readings 테이블에 해당 레코드가 없음');
      }
    } catch (error) {
      console.error('readings 테이블 해석 업데이트 중 예외:', error);
    }
  }
};

// 카드 이미지 URL 가져오기
const getCardImageUrl = (card: TarotCard | undefined | null) => {
  if (!card) {
    console.log('카드 정보 없음, 카드 뒷면 반환');
    return CARD_BACK_BASE64;
  }
  
  // 코트 카드 판별 (DB에 court 필드가 없는 경우 이름으로 판별)
  let courtType: string | undefined = card.court;
  
  // number가 11-14인 경우 코트 카드로 판별 (DB에 코트 카드가 11-14로 저장됨)
  if (!courtType && card.arcana === 'minor' && card.number && card.number >= 11 && card.number <= 14) {
    const courtByNumber: Record<number, string> = {
      11: 'page',
      12: 'knight',
      13: 'queen',
      14: 'king'
    };
    courtType = courtByNumber[card.number];
    console.log('코트 카드 감지 (number 기반):', {
      number: card.number,
      courtType: courtType,
      name: card.name
    });
  }
  
  // 그래도 없으면 이름에서 추출
  if (!courtType && card.arcana === 'minor' && card.name) {
    // 이름에서 코트 타입 추출
    const courtNames = ['Page', 'Knight', 'Queen', 'King'];
    for (const court of courtNames) {
      if (card.name.includes(court)) {
        courtType = court.toLowerCase();
        console.log('코트 카드 감지 (이름 기반):', {
          name: card.name,
          courtType: courtType
        });
        break;
      }
    }
  }
  
  console.log('카드 정보 상세:', {
    id: card.id,
    name: card.name,
    name_kr: card.name_kr,
    arcana: card.arcana,
    number: card.number,
    suit: card.suit,
    court: card.court,
    detectedCourt: courtType,
    image_url: card.image_url,
    isCourtCard: courtType ? true : false,
    isNumberCard: card.number && card.number >= 1 && card.number <= 10
  });
  
  // 디버깅: 특정 카드 체크
  if (card.name === 'King of Cups') {
    console.warn('⚠️ King of Cups 감지!', {
      id: card.id,
      expectedId: 35,
      isCorrect: card.id === 35
    });
  }
  if (card.name === 'Queen of Pentacles') {
    console.warn('⚠️ Queen of Pentacles 감지!', {
      id: card.id,
      expectedId: 76,
      isCorrect: card.id === 76
    });
  }
  
  // DB의 image_url은 무시하고 직접 경로 생성
  // (DB에 잘못된 경로가 저장되어 있을 수 있음)
  /*
  if (card.image_url) {
    console.log('DB에 저장된 image_url 사용:', card.image_url);
    return card.image_url;
  }
  */
  
  // 카드 타입별로 이미지 경로 생성
  let imagePath = '';
  
  // 메이저 아르카나
  if (card.arcana === 'major') {
    // 카드 번호를 2자리로 패딩 (00-21)
    const cardNumber = (card.number !== undefined ? card.number : 0).toString().padStart(2, '0');
    
    console.log('메이저 카드 번호:', cardNumber);
    
    // 카드 이름 포맷팅
    let cardName = card.name;
    
    // 특수 케이스 처리 - 실제 파일명에 맞춤
    const specialCases: Record<string, string> = {
      '00': 'the-Fool',
      '01': 'The-Magician',
      '02': 'The-High-Priestess',
      '03': 'The-Empress',
      '04': 'The-Emperor',
      '05': 'The-Hierophant',
      '06': 'The-Lovers',
      '07': 'The-Chariot',
      '08': 'Strength',
      '09': 'The-Hermit',
      '10': 'Wheel-of-Fortune',  // The 없음
      '11': 'Justice',
      '12': 'The-Hanged-Man',
      '13': 'Death',
      '14': 'Temperance',
      '15': 'The-Devil',
      '16': 'The-Tower',
      '17': 'The-Star',
      '18': 'The-Moon',
      '19': 'The-Sun',
      '20': 'Judgement',
      '21': 'The-World'
    };
    
    cardName = specialCases[cardNumber] || card.name.replace(/ /g, '-');
    imagePath = `/assets/tarot-cards/major/${cardNumber}-${cardName}.png`;
    
    console.log(`메이저 카드 경로 생성: [${cardNumber}] ${card.name} -> ${imagePath}`);
    console.log('최종 경로:', imagePath);
    
    // 디버깅: 실제 이미지 로드 테스트
    const testImg = new Image();
    testImg.onload = () => console.log('✅ 메이저 이미지 로드 성공:', imagePath);
    testImg.onerror = (e) => {
      console.error('❌ 메이저 이미지 로드 실패:', imagePath);
      console.error('에러 상세:', e);
      // 대체 경로 시도
      const altPath = `assets/tarot-cards/major/${cardNumber}-${cardName}.png`;
      console.log('대체 경로 시도:', altPath);
    };
    testImg.src = imagePath;
    
    return imagePath;
  } 
  // 마이너 아르카나 - 숫자 카드 (Ace ~ Ten, number가 1-10인 경우)
  else if (card.arcana === 'minor' && card.number && card.number >= 1 && card.number <= 10) {
    // 숫자를 2자리로 패딩
    const cardNumber = card.number.toString().padStart(2, '0');
    
    // 카드 이름 포맷팅
    let cardName = '';
    if (card.number === 1) {
      cardName = `ace-of-${card.suit?.toLowerCase() || 'wands'}`;
    } else {
      const numberNames = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      cardName = `${numberNames[card.number]}-of-${card.suit?.toLowerCase() || 'wands'}`;
    }
    
    imagePath = `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    console.log(`마이너 숫자 카드 경로: ${imagePath}`);
    
    // 디버깅: 마이너 이미지 로드 테스트
    const testImg = new Image();
    testImg.onload = () => console.log('✅ 마이너 이미지 로드 성공:', imagePath);
    testImg.onerror = () => console.error('❌ 마이너 이미지 로드 실패:', imagePath);
    testImg.src = imagePath;
    
    return imagePath;
  }
  // 마이너 아르카나 - 코트 카드 (Page, Knight, Queen, King)
  else if (card.arcana === 'minor' && courtType) {
    // 코트 카드 번호 계산
    // 실제 파일명 기준:
    // Wands: 41-44 (Page, Knight, Queen, King)
    // Cups: 45-48 (Page, Knight, Queen, King)
    // Swords: 49-52 (Page, Knight, Queen, King)
    // Pentacles: 53-56 (Page, Knight, Queen, King)
    const suitOrder = ['wands', 'cups', 'swords', 'pentacles'];
    const courtOrder = ['page', 'knight', 'queen', 'king'];
    
    // suit와 court 정보를 소문자로 변환하여 비교
    const suitLower = card.suit?.toLowerCase() || 'wands';
    const courtLower = courtType.toLowerCase();
    
    console.log('코트 카드 정보:', {
      id: card.id,
      name: card.name,
      suit: card.suit,
      suitLower,
      court: courtType,
      courtLower,
      number: card.number
    });
    
    const suitIndex = suitOrder.indexOf(suitLower);
    const courtIndex = courtOrder.indexOf(courtLower);
    
    console.log('인덱스:', { suitIndex, courtIndex });
    
    // 유효성 검사
    if (suitIndex === -1 || courtIndex === -1) {
      console.error('잘못된 suit 또는 court:', { suit: suitLower, court: courtLower });
      return CARD_BACK_BASE64;
    }
    
    // 기본 번호: Wands=41, Cups=45, Swords=49, Pentacles=53
    const baseNumbers = [41, 45, 49, 53];
    const cardNumber = baseNumbers[suitIndex] + courtIndex;
    
    // 코트 카드 이름 포맷팅 - 실제 파일명과 동일하게 (대문자 시작)
    const courtName = courtType.charAt(0).toUpperCase() + courtType.slice(1).toLowerCase();
    const suitName = suitLower.charAt(0).toUpperCase() + suitLower.slice(1).toLowerCase();
    const cardName = `${courtName}-of-${suitName}`;
    
    imagePath = `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    console.log(`코트 카드 경로 생성:`, {
      card: card.name,
      cardId: card.id,
      suit: suitLower,
      court: courtLower,
      suitIndex,
      courtIndex,
      baseNumber: baseNumbers[suitIndex],
      cardNumber,
      cardName,
      finalPath: imagePath
    });
    
    // 특정 카드 경로 검증
    if (card.name === 'King of Cups' && cardNumber !== 48) {
      console.error('❌ King of Cups 경로 오류! 예상: 48-King-of-Cups.png, 실제:', imagePath);
    }
    if (card.name === 'Queen of Pentacles' && cardNumber !== 55) {
      console.error('❌ Queen of Pentacles 경로 오류! 예상: 55-Queen-of-Pentacles.png, 실제:', imagePath);
    }
    
    return imagePath;
  }
  // 기본값 (예상치 못한 경우)
  else {
    console.warn('예상치 못한 카드 타입:', card);
    const imageName = card.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    imagePath = `/assets/tarot-cards/${imageName}.png`;
    console.log('기본 경로 사용:', imagePath);
    return imagePath;
  }
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
  console.log('=== DailyCard 컴포넌트 마운트 ===');
  
  // 상태 초기화 추가
  isLoading.value = false;
  isCardRevealed.value = false;
  selectedCard.value = null;
  todayCard.value = null;
  interpretation.value = null;
  showAd.value = false;
  isInterpretationLoading.value = false;
  interpretationProgress.value = 0;
  
  console.log('현재 사용자:', userStore.currentUser);
  console.log('로그인 상태:', userStore.isLoggedIn);
  console.log('프리미엄 상태:', userStore.isPremium);
  console.log('사용자 초기화 완료 여부:', userStore.isInitialized);
  
  // 사용자 초기화가 완료될 때까지 대기
  if (!userStore.isInitialized) {
    console.log('사용자 초기화 대기 중...');
    isLoading.value = true; // 초기화 중에는 로딩 상태 유지
    
    // 최대 5초 대기
    let waitCount = 0;
    while (!userStore.isInitialized && waitCount < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }
    console.log('사용자 초기화 대기 완료, 대기 시간:', waitCount * 100, 'ms');
  }
  
  console.log('초기화 후 사용자 상태:');
  console.log('현재 사용자:', userStore.currentUser);
  console.log('로그인 상태:', userStore.isLoggedIn);
  console.log('이메일:', userStore.currentUser?.email);
  console.log('익명 여부:', userStore.currentUser?.isAnonymous);
  
  // 테스트 계정 처리
  // URL에 test 파라미터가 있거나, 현재 로그인이 없으면 테스트 계정 사용
  const urlParams = new URLSearchParams(window.location.search);
  const useTestAccount = urlParams.get('test') === 'true' || 
                         (!userStore.currentUser && urlParams.has('test'));
  
  if (useTestAccount) {
    console.log('URL 테스트 파라미터 감지 - 테스트 계정 로그인');
    await ensureTestAccountLoggedIn();
  }
  
  // 테스트 계정 특별 처리
  if (isTestAccount(userStore.currentUser?.email)) {
    console.log('테스트 계정 감지 - 특별 처리 시작');
    
    // 테스트 계정이 익명으로 처리되지 않도록 확인
    if (userStore.currentUser && userStore.currentUser.isAnonymous) {
      console.warn('테스트 계정이 익명으로 처리됨 - 수정 필요');
      userStore.currentUser.isAnonymous = false;
      userStore.currentUser.isPremium = false; // 무료 사용자로 설정
    }
    
    // 테스트 계정은 항상 무료 사용자로 설정
    if (userStore.currentUser && userStore.currentUser.isPremium !== false) {
      console.log('테스트 계정을 무료 사용자로 설정');
      userStore.currentUser.isPremium = false;
    }
  }
  
  await loadTodayCard();
});

// 기본 해석 생성 (API 실패 시 백업)
const generateDefaultInterpretation = (card: TarotCard): DailyInterpretation => {
  // 카드가 없으면 에러
  if (!card) {
    console.error('generateDefaultInterpretation: 카드 정보가 없습니다');
    throw new Error('카드 정보가 필요합니다');
  }
  
  // 메이저 아르카나와 마이너 아르카나 구분
  const isMajor = card.arcana === 'major';
  
  // 기본 운세 지수 생성 (카드 번호와 아르카나를 기반으로)
  const baseValue = isMajor ? 4 : 3;
  const variation = ((card.id || 0) % 3) - 1; // -1, 0, 1 변동
  
  // 카드 슈트별 특성 반영
  const suitCharacteristics: Record<string, any> = {
    'wands': { color: '빨간색', direction: '남쪽', element: '불' },
    'cups': { color: '파란색', direction: '서쪽', element: '물' },
    'swords': { color: '노란색', direction: '동쪽', element: '공기' },
    'pentacles': { color: '초록색', direction: '북쪽', element: '땅' },
    'major': { color: '보라색', direction: '중앙', element: '영혼' }
  };
  
  // suit가 있으면 사용, 없으면 major 기본값 사용
  const suitKey = card.suit ? card.suit.toLowerCase() : 'major';
  const suitInfo = suitCharacteristics[suitKey] || suitCharacteristics['major'];
  
  // 카드 번호에 따른 메시지 변화
  const numberMessages: Record<number, string> = {
    0: '새로운 시작과 무한한 가능성',
    1: '시작과 잠재력의 발현',
    2: '균형과 선택의 시간',
    3: '성장과 창조의 에너지',
    4: '안정과 기반 구축',
    5: '변화와 도전의 순간',
    6: '조화와 성공의 기운',
    7: '내면의 성찰과 극복',
    8: '힘과 움직임의 조화',
    9: '완성에 가까운 단계',
    10: '완성과 새로운 순환'
  };
  
  const cardNumber = card.number || 0;
  const numberMessage = numberMessages[cardNumber % 11] || '특별한 의미의 시간';
  
  // 카드별 상세 메시지 생성
  const detailedMessages: Record<string, string> = {
    'major': `메이저 아르카나 카드는 인생의 중요한 전환점과 영적 성장을 나타냅니다. 오늘은 평소보다 더 큰 관점에서 상황을 바라보고, 내면의 목소리에 귀를 기울이는 것이 중요합니다. 우주의 에너지가 당신을 특별히 보호하고 인도하는 날이니, 직관을 믿고 과감한 결정을 내려보세요.`,
    'wands': `불의 에너지를 담은 Wands는 열정과 창조력, 그리고 새로운 시작을 상징합니다. 오늘은 당신의 내면에 타오르는 열정을 행동으로 옮기기에 최적의 시기입니다. 머릿속에만 있던 아이디어를 실현시키고, 미루어왔던 프로젝트를 시작해보세요. 당신의 열정이 주변 사람들에게도 긍정적인 영향을 미칠 것입니다.`,
    'cups': `물의 에너지를 담은 Cups는 감정과 직관, 그리고 인간관계를 상징합니다. 오늘은 논리보다는 감정에 충실하고, 주변 사람들과의 정서적 교류에 집중하세요. 사랑하는 사람들과 깊은 대화를 나누거나, 예술적 활동을 통해 감정을 표현해보는 것도 좋습니다. 당신의 공감 능력이 빛을 발하는 날입니다.`,
    'swords': `공기의 에너지를 담은 Swords는 지성과 소통, 그리고 명확한 사고를 상징합니다. 오늘은 복잡한 문제를 해결하거나 중요한 결정을 내리기에 좋은 날입니다. 논리적 사고와 분석력이 뛰어난 시기이니, 계획을 세우거나 전략을 수립하는 데 시간을 투자하세요. 명확한 의사소통으로 오해를 풀 수 있는 기회도 있을 것입니다.`,
    'pentacles': `땅의 에너지를 담은 Pentacles는 물질적 안정과 실용성, 그리고 꾸준한 노력을 상징합니다. 오늘은 현실적인 목표에 집중하고, 실질적인 성과를 만들어내기에 좋은 날입니다. 재정 계획을 세우거나, 건강 관리를 시작하거나, 장기적인 투자를 고려해보세요. 당신의 노력이 구체적인 결실로 이어질 것입니다.`
  };
  
  const suitMessage = detailedMessages[suitKey] || detailedMessages['major'];
  
  return {
    fortuneIndex: {
      overall: Math.max(1, Math.min(5, baseValue + variation)),
      love: Math.max(1, Math.min(5, baseValue + ((card.id || 0) % 2))),
      money: Math.max(1, Math.min(5, baseValue - ((card.id || 0) % 2))),
      health: Math.max(1, Math.min(5, baseValue)),
      work: Math.max(1, Math.min(5, baseValue + (isMajor ? 1 : 0)))
    },
    timeAdvice: {
      morning: `${card.name_kr} 카드의 에너지로 하루를 시작하세요`,
      afternoon: `${numberMessage}을 염두에 두고 행동하세요`,
      evening: `오늘 하루를 되돌아보며 내일을 준비하세요`
    },
    luckyItems: {
      color: suitInfo.color,
      number: String((cardNumber || 7) % 10 || 10),
      direction: suitInfo.direction,
      activity: isMajor ? '명상과 성찰' : '일상의 작은 변화'
    },
    relationshipAdvice: {
      tip: `${card.name_kr}의 에너지를 활용해 소통하세요`,
      avoid: '성급한 판단과 오해는 피하세요',
      goodMeet: `${suitInfo.element}의 기운을 가진 사람`
    },
    dailyQuote: `"${card.name_kr}"가 전하는 메시지: ${numberMessage}의 시간입니다`,
    detailedFortune: {
      mainMessage: `오늘 당신에게 찾아온 ${card.name_kr} 카드는 ${numberMessage}을 상징합니다. ${suitMessage} 카드가 전하는 메시지에 귀를 기울이고, ${suitInfo.element}의 에너지를 적극적으로 활용한다면 오늘 하루가 더욱 의미 있고 풍성해질 것입니다. 우주는 항상 당신 편이며, 모든 일이 결국 당신에게 최선의 결과로 이어질 것임을 기억하세요.`,
      keyPoint: `${card.name_kr}의 핵심은 ${isMajor ? '큰 변화와 성장의 기회를 놓치지 않는 것' : '일상 속 작은 신호들을 놓치지 않고 섬세하게 관찰하는 것'}입니다. 특히 오늘은 ${numberMessage}와 관련된 상황이 발생할 수 있으니 주의 깊게 살펴보세요.`,
      caution: `과도한 기대나 성급한 판단은 피하는 것이 좋습니다. ${suitInfo.element}의 에너지가 강한 날이므로, 그 반대 성향의 에너지와 충돌할 수 있습니다. 균형을 유지하려 노력하세요.`,
      luckyMoment: `${suitInfo.direction} 방향을 바라보거나 그 방향으로 이동할 때, ${suitInfo.color}을 착용하거나 주변에서 발견할 때 행운의 순간이 찾아올 것입니다. 특히 ${cardNumber}와 관련된 시간대에 주목하세요.`,
      advice: `오늘은 ${card.name_kr}의 지혜를 따라 ${numberMessage}에 집중하는 하루를 보내세요. ${suitInfo.element}의 기운이 당신을 보호하고 인도할 것입니다. 작은 신호들을 놓치지 말고, 직관을 믿으며, 긍정적인 마음가짐을 유지한다면 예상치 못한 행운이 찾아올 수 있습니다. 우주의 메시지는 때로 예상치 못한 방식으로 전달되니, 열린 마음으로 하루를 맞이하세요.`
    }
  };
};
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
