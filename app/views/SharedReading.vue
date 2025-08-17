<template>
  <div class="shared-reading">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>점괘를 불러오는 중...</p>
    </div>
    
    <!-- 만료된 경우 -->
    <div v-else-if="expired" class="expired-state">
      <div class="container">
        <div class="expired-content">
          <div class="expired-icon">⏰</div>
          <h2>공유 기간이 만료되었습니다</h2>
          <p>공유된 점괘는 24시간 동안만 확인 가능합니다.</p>
          <button @click="goHome" class="cta-button">
            🔮 직접 점괘 보러 가기
          </button>
        </div>
      </div>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-state">
      <div class="container">
        <div class="error-content">
          <div class="error-icon">😕</div>
          <h2>점괘를 찾을 수 없습니다</h2>
          <p>{{ error }}</p>
          <button @click="goHome" class="cta-button">
            🔮 직접 점괘 보러 가기
          </button>
        </div>
      </div>
    </div>
    
    <!-- 정상 표시 -->
    <div v-else-if="sharedData" class="reading-content">
      
      <!-- 읽기 전용 리딩 컨텐츠 -->
      <div class="container">
        <!-- 점괘 정보 표시 (인스타그램 스크린샷 최적화) -->
        <section class="reading-summary-box">
          <div class="summary-header">
            <div class="summary-title">🔮 타로 점괘 결과 <span class="summary-date">{{ formatDate(sharedData.created_at) }}</span></div>
          </div>
          
          <div class="summary-info">
            <div class="info-row">
              <span class="info-icon">🎯&nbsp;</span>
              <span class="info-text">테마: {{ getThemeDisplay() }} &nbsp;&nbsp; </span>
              <span class="info-icon">📋&nbsp;</span>
              <span class="info-text">배열법: {{ getSpreadDisplay() }}</span>
            </div>
          </div>
          
          <div class="summary-insight" v-if="getShortInterpretation()">
            <div class="insight-label">✨ 핵심 메시지</div>
            <div class="insight-text">{{ getShortInterpretation() }}</div>
          </div>

        </section>
        
        <!-- 질문 표시 (커스텀 질문이 실제로 있을 때만) -->
        <section v-if="sharedData.custom_question && sharedData.custom_question.trim()" class="custom-question-section">
          <h2>📌 질문</h2>
          <div class="custom-question-content">
            <p>{{ sharedData.custom_question }}</p>
          </div>
        </section>

        <!-- 카드 배열 표시 -->
        <section class="cards-layout-section">
          <h2>카드 배열</h2>
          
          <!-- 세븐스타 레이아웃 -->
          <div v-if="sharedData.spread_type === 'seven_star'" class="seven-star-layout">
            <div class="star-container">
              <div 
                v-for="(card, index) in parsedCards" 
                :key="index"
                :class="`star-card position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <div class="card-image-wrapper" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                    <img :src="getCardImageUrl(card)" 
                         :alt="card.nameKr || card.name" 
                         @error="onImageError" />
                  </div>
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 컵 오브 릴레이션십 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'cup_of_relationship'" class="cup-relationship-layout">
            <div class="cup-container">
              <div 
                v-for="(card, index) in parsedCards" 
                :key="index"
                :class="`cup-card position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <div class="card-image-wrapper" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                    <img :src="getCardImageUrl(card)" 
                         :alt="card.nameKr || card.name" 
                         @error="onImageError" />
                  </div>
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 켈틱 크로스 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'celtic_cross'" class="celtic-cross-layout">
            <div class="cards-container">
              <div 
                v-for="(card, index) in parsedCards" 
                :key="index"
                :class="`card-position position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <div class="card-image-wrapper" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                    <img :src="getCardImageUrl(card)" 
                         :alt="card.nameKr || card.name" 
                         @error="onImageError" />
                  </div>
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 오늘의 카드 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'daily_card' && parsedCards[0]" class="daily-card-layout">
            <div class="card-display">
              <div class="card-image" :class="{ 'is-reversed': parsedCards[0].orientation === 'reversed' }">
                <img :src="getCardImageUrl(parsedCards[0])" 
                     :alt="parsedCards[0].nameKr || parsedCards[0].name" 
                     @error="onImageError" />
              </div>
              <div class="card-name">{{ parsedCards[0].nameKr || parsedCards[0].name }}</div>
              <div class="card-orientation" :class="parsedCards[0].orientation">
                {{ parsedCards[0].orientation === 'upright' ? '정방향' : '역방향' }}
              </div>
            </div>
          </div>
          
          <!-- 기본 카드 그리드 -->
          <div v-else class="cards-grid">
            <div 
              v-for="(card, index) in parsedCards" 
              :key="index"
              class="card-display"
            >
              <div class="card-image" :class="{ 'is-reversed': card.orientation === 'reversed' }">
                <img :src="getCardImageUrl(card)" 
                     :alt="card.nameKr || card.name" 
                     @error="onImageError" />
              </div>
              <div class="card-name">{{ card.nameKr || card.name }}</div>
              <div class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </div>
            </div>
          </div>
        </section>

        <!-- 해석 표시 -->
        <section v-if="sharedData.basic_interpretation || sharedData.ai_interpretation" class="interpretation-section">
          <h2>🔮 점괘 해석</h2>
          
          <!-- 오늘의 카드의 경우 - basic_interpretation 사용 -->
          <div v-if="sharedData.spread_type === 'daily_card' && sharedData.basic_interpretation" class="daily-card-interpretation">
            <div class="formatted-content" v-html="formattedDailyInterpretation"></div>
          </div>
          
          <!-- 일반 기본 해석 (오늘의 카드가 아닌 경우) -->
          <div v-else-if="sharedData.basic_interpretation" class="basic-interpretation-content">
            <p>{{ sharedData.basic_interpretation }}</p>
          </div>
          
          <!-- AI 해석 (있는 경우) -->
          <div v-if="sharedData.ai_interpretation && sharedData.spread_type !== 'daily_card'" class="ai-interpretation-result">
            <h3>✨ 수정구슬의 신비로운 통찰</h3>
            <div class="ai-content">
              <p>{{ sharedData.ai_interpretation }}</p>
            </div>
          </div>
        </section>
      </div>
      
      <!-- CTA 섹션 -->
      <section class="cta-section">
        <div class="container">
          <h2>✨ 나도 점괘를 봐볼까요?</h2>
          <p>무료로 타로 카드를 뽑고 AI 해석을 받아보세요!</p>
          <button @click="goHome" class="primary-cta">
            🎴 무료로 시작하기
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getThemeDisplayName, getSpreadDisplayName } from '../utils/themeQuestions';
import { getCardImageFromObject } from '../utils/cardImageUtils';

const route = useRoute();
const loading = ref(true);
const error = ref('');
const expired = ref(false);
const sharedData = ref<any>(null);

// 카드 데이터 파싱
const parsedCards = computed(() => {
  if (!sharedData.value?.cards) return [];
  try {
    const cards = typeof sharedData.value.cards === 'string' 
      ? JSON.parse(sharedData.value.cards)
      : sharedData.value.cards;
    
    // 디버깅용 로그 - 더 자세히
    console.log('🎴 [SharedReading] Parsed cards:', cards);
    cards.forEach((card: any, index: number) => {
      console.log(`📌 Card ${index + 1} details:`, {
        cardNumber: card.cardNumber,
        id: card.id,
        name: card.name,
        nameKr: card.nameKr,
        orientation: card.orientation,
        expectedImage: getCardImageFromObject(card)
      });
    });
    
    return cards;
  } catch (err) {
    console.error('Failed to parse cards:', err);
    return [];
  }
});

// 오늘의 카드 해석 포맷팅
const formattedDailyInterpretation = computed(() => {
  const interpretation = sharedData.value?.basic_interpretation;
  if (!interpretation) return '';
  
  // 줄바꿈을 <br>로 변환하고 섹션 분리
  const lines = interpretation.split('\n');
  let html = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      html += '<div style="margin: 10px 0;"></div>';
    } else if (trimmed.startsWith('🔮') || trimmed.startsWith('🌊') || trimmed.startsWith('🍀') || trimmed.startsWith('💬') || trimmed.startsWith('✨')) {
      html += `<h3 class="fortune-subtitle">${trimmed}</h3>`;
    } else if (trimmed.includes('⭐')) {
      html += `<div class="star-display">${trimmed}</div>`;
    } else if (trimmed.includes(':') && (trimmed.startsWith('전체운') || trimmed.startsWith('애정운') || trimmed.startsWith('금전운') || trimmed.startsWith('건강운') || trimmed.startsWith('학업'))) {
      const [label, value] = trimmed.split(':').map(s => s.trim());
      html += `<div class="fortune-item"><span class="item-label">${label}:</span> <span class="item-value">${value}</span></div>`;
    } else if (trimmed.startsWith('💎') || trimmed.startsWith('💡') || trimmed.startsWith('⚡')) {
      html += `<div class="highlight-point">${trimmed}</div>`;
    } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      html += `<blockquote class="daily-quote">${trimmed}</blockquote>`;
    } else {
      html += `<p class="fortune-text">${trimmed}</p>`;
    }
  }
  
  return html;
});

// 카드 이미지 URL 생성 - cardImageUtils 사용
const getCardImageUrl = (card: any) => {
  return getCardImageFromObject(card);
};

// 이미지 에러 처리
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/tarot-cards/major/00-the-Fool.png';
};

// 날짜 포맷팅
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // 인스타그램 스크린샷용 간단한 형식
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
};

// 홈으로 이동
const goHome = () => {
  window.location.href = '/';
};

// 테마 표시 이름 가져오기
const getThemeDisplay = () => {
  if (!sharedData.value) return '타로 점괘';
  
  // 커스텀 질문이 실제로 있으면 커스텀 질문으로 표시
  // (theme이 'custom'이고 실제 질문이 있는 경우)
  if (sharedData.value.theme === 'custom' && sharedData.value.custom_question && sharedData.value.custom_question.trim()) {
    return '커스텀 질문';
  }
  
  // 테마와 서브테마 정보 사용
  const theme = sharedData.value.theme || 'general';
  const subTheme = sharedData.value.sub_theme || null;
  
  console.log('🎯 Theme info:', { theme, subTheme });
  
  return getThemeDisplayName(theme, subTheme);
};

// 배열법 표시 이름 가져오기
const getSpreadDisplay = () => {
  if (!sharedData.value) return '';
  return getSpreadDisplayName(sharedData.value.spread_type || '');
};

// 메인 카드만 가져오기 (최대 3장)
const getMainCards = () => {
  return parsedCards.value.slice(0, 3);
};

// 짧은 해석 가져오기 (인스타그램용) - 마무리 조언만 추출
const getShortInterpretation = () => {
  let interpretation = sharedData.value?.ai_interpretation || sharedData.value?.basic_interpretation;
  if (!interpretation) return '';
  
  // 줄 단위로 분리
  const lines = interpretation.split('\n');
  
  // 마무리 조언 섹션 찾기
  let adviceSection = '';
  let foundAdviceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 마무리 조언 섹션 시작 감지
    if (line.match(/^[✨⭐🔮💫🌟]/)) {
      // 마무리, 조언, 메시지 등의 키워드가 포함된 경우
      if (line.match(/(마무리|최종|종합|전체)\s*(조언|메시지|통찰|이야기)/i)) {
        foundAdviceSection = true;
        continue; // 제목 자체는 건너뛰기
      } else if (foundAdviceSection) {
        // 다른 섹션이 시작되면 중단
        break;
      }
    }
    
    // 마무리 조언 섹션의 내용 수집
    if (foundAdviceSection && line && !line.match(/^[✨⭐🔮💫🌟]/)) {
      adviceSection += (adviceSection ? ' ' : '') + line;
    }
  }
  
  // 마무리 조언을 찾지 못한 경우, 마지막 단락 찾기
  if (!adviceSection) {
    // 뒤에서부터 의미있는 내용 찾기
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      // 빈 줄이거나 제목으로 보이는 줄은 건너뛰기
      if (!line || line.match(/^[✨⭐🔮💫🌟]/)) {
        continue;
      }
      
      // 문장으로 끝나는 의미있는 내용을 찾으면 사용
      if (line.match(/[.!?。]$/)) {
        adviceSection = line;
        break;
      }
    }
  }
  
  // 여전히 없으면 전체 텍스트에서 추출
  if (!adviceSection) {
    const filteredLines = [];
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && 
          !trimmedLine.match(/^[✨⭐🔮💫🌟]/) && 
          !trimmedLine.match(/^(핵심|통찰|메시지|요약|정리|결론|조언)\s*[:：]/i)) {
        filteredLines.push(trimmedLine);
      }
    }
    adviceSection = filteredLines.join(' ').trim();
  }
  
  // 최대 150자로 제한
  const maxLength = 150;
  if (adviceSection.length <= maxLength) {
    return adviceSection;
  }
  
  // 문장 단위로 자르기
  const shortened = adviceSection.substring(0, maxLength);
  const lastPeriod = shortened.lastIndexOf('.');
  
  if (lastPeriod > 100) {
    return shortened.substring(0, lastPeriod + 1);
  }
  
  return shortened.trim() + '...';
};

// 데이터 로드
onMounted(async () => {
  const shareId = route.params.id;
  console.log('📝 Loading shared reading:', shareId);
  
  if (!shareId) {
    error.value = 'ID가 없습니다';
    loading.value = false;
    return;
  }
  
  // 타임아웃 설정 (10초)
  const timeout = setTimeout(() => {
    console.error('⏱️ 타임아웃');
    error.value = '데이터를 불러오는데 시간이 너무 오래 걸립니다';
    loading.value = false;
  }, 10000);
  
  try {
    // Supabase REST API 직접 호출
    const url = `https://yxywzsmggvxxujuplyly.supabase.co/rest/v1/shared_readings?id=eq.${shareId}&is_active=eq.true`;
    const response = await fetch(url, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM'
      }
    });
    
    clearTimeout(timeout);
    
    const data = await response.json();
    console.log('📊 Response:', data);
    
    if (data && data.length > 0) {
      const reading = data[0];
      
      // 만료 체크
      if (reading.expires_at) {
        const expiresAt = new Date(reading.expires_at);
        const now = new Date();
        
        if (expiresAt < now) {
          expired.value = true;
          loading.value = false;
          return;
        }
      }
      
      sharedData.value = reading;
      console.log('✅ Data loaded successfully');
      console.log('📑 [SharedReading] 불러온 데이터:', {
        id: reading.id,
        spread_type: reading.spread_type,
        has_basic_interpretation: !!reading.basic_interpretation,
        has_ai_interpretation: !!reading.ai_interpretation,
        basic_length: reading.basic_interpretation?.length || 0,
        ai_length: reading.ai_interpretation?.length || 0,
        cards_count: reading.cards?.length || 0
      });
    } else {
      error.value = '점괘를 찾을 수 없습니다';
    }
    
  } catch (err: any) {
    console.error('Error:', err);
    error.value = err.message || '데이터를 불러오는 중 오류가 발생했습니다';
    clearTimeout(timeout);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* 기본 리셋 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.shared-reading {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  padding: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(138, 92, 246, 0.2);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 만료/에러 상태 */
.expired-state,
.error-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.expired-content,
.error-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.expired-icon,
.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.expired-content h2,
.error-content h2 {
  font-size: 28px;
  margin-bottom: 16px;
  color: #FFFFFF;
}

.expired-content p,
.error-content p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

/* 요약 박스 (인스타그램 스크린샷 최적화) */
.reading-summary-box {
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border: 2px solid rgba(138, 92, 246, 0.3);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.summary-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  background: none;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.5);
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.info-icon {
  font-size: 20px;
}

.info-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.summary-question {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.question-label {
  font-size: 14px;
  color: #F59E0B;
  margin-bottom: 8px;
  font-weight: 600;
}

.question-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  font-style: italic;
}

.summary-cards {
  margin-bottom: 20px;
}

.cards-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
  font-weight: 600;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.card-number {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 20px;
}

.card-name {
  flex: 1;
  font-size: 15px;
  color: white;
  font-weight: 500;
}

.card-orientation {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
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

.more-cards {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  padding: 8px;
  text-align: center;
  font-style: italic;
}

.summary-insight {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border-left: 3px solid #A855F7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.insight-label {
  font-size: 14px;
  color: #A855F7;
  margin-bottom: 8px;
  font-weight: 600;
}

.insight-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.summary-footer {
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.app-branding {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.brand-icon {
  font-size: 20px;
}

.brand-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* 헤더 */
.share-header {
  text-align: center;
  padding: 10px;
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
}

.share-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.share-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* 섹션 스타일 */
.custom-question-section,
.cards-layout-section,
.interpretation-section {
  margin: 40px 0;
  width: 100%;
}

.custom-question-section h2,
.cards-layout-section h2,
.interpretation-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #FFFFFF;
}

.custom-question-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #A855F7;
  backdrop-filter: blur(10px);
}

/* 오늘의 카드 레이아웃 */
.daily-card-layout {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

.daily-card-layout .card-display {
  text-align: center;
}

.daily-card-layout .card-image img {
  width: 200px;
  max-width: 200px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 카드 그리드 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.card-display {
  text-align: center;
}

.card-image img {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

/* 역방향 카드 스타일 */
.card-image.is-reversed img,
.card-image-wrapper.is-reversed img {
  transform: rotate(180deg);
}

/* 카드 이미지 래퍼 스타일 */
.card-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-name {
  margin-top: 10px;
  font-weight: 600;
}

.card-orientation {
  font-size: 14px;
  margin-top: 5px;
}

.card-orientation.upright {
  color: #10B981;
}

.card-orientation.reversed {
  color: #F59E0B;
}

/* 세븐스타 레이아웃 */
.seven-star-layout {
  position: relative;
  min-height: 450px;
  margin: 20px auto;
  max-width: 600px;
}

.seven-star-layout .star-container {
  position: relative;
  height: 450px;
  width: 100%;
}

.seven-star-layout .star-card {
  position: absolute;
  width: 70px;
  height: 100px;
}

.seven-star-layout .card-mini {
  width: 100%;
  height: 100%;
  position: relative;
}

.seven-star-layout .card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.seven-star-layout .position-label {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 세븐스타 카드 위치 - 별 모양 */
.seven-star-layout .position-1 { left: calc(50% - 35px); top: 20px; }  /* 상단 중앙 */
.seven-star-layout .position-2 { left: calc(20% - 35px); top: 100px; } /* 좌측 상단 */
.seven-star-layout .position-3 { left: calc(80% - 35px); top: 100px; } /* 우측 상단 */
.seven-star-layout .position-4 { left: calc(50% - 35px); top: 180px; } /* 중앙 */
.seven-star-layout .position-5 { left: calc(20% - 35px); top: 260px; } /* 좌측 하단 */
.seven-star-layout .position-6 { left: calc(80% - 35px); top: 260px; } /* 우측 하단 */
.seven-star-layout .position-7 { left: calc(50% - 35px); top: 340px; } /* 하단 중앙 */

/* 컵 오브 릴레이션십 레이아웃 */
.cup-relationship-layout {
  position: relative;
  min-height: 800px;
  margin: 40px auto;
  max-width: 900px;
}

.cup-relationship-layout .cup-container {
  position: relative;
  height: 800px;
  width: 100%;
}

.cup-relationship-layout .cup-card {
  position: absolute;
  width: 80px;
  height: 120px;
}

.cup-relationship-layout .card-mini {
  width: 100%;
  height: 100%;
  position: relative;
}

.cup-relationship-layout .card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.cup-relationship-layout .position-label {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 컵 오브 릴레이션십 카드 위치 - 최종 버전과 동일하게 */
.cup-relationship-layout .position-1 { /* 나 - 왼쪽 아래 */
  top: 140%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-2 { /* 상대 - 오른쪽 아래 */
  top: 140%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-3 { /* 관계 기본 - 하단 중앙 */
  top: 140%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-4 { /* 관계 과거 - 왼쪽 중간 */
  top: 110%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-5 { /* 현재 상태 - 중앙 */
  top: 80%;
  left: 40%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.cup-relationship-layout .position-6 { /* 현재 외부 상황 - 오른쪽 중간 */
  top: 75%;
  left: 60%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-7 { /* 현재 나는 어떻게 생각? - 왼쪽 중상 */
  top: 68%;
  left: 10%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-8 { /* 현재 상대는 어떻게 생각? - 오른쪽 중상 */
  top: 68%;
  left: 90%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-9 { /* 미래 나는 어떻게 생각? - 왼쪽 상단 */
  top: 60%;
  left: -20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-10 { /* 미래 상대는 어떻게 생각? - 오른쪽 상단 */
  top: 60%;
  left: 120%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-11 { /* 결과 - 상단 중앙 */
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 켈틱 크로스 레이아웃 */
.celtic-cross-layout {
  position: relative;
  min-height: 600px;
  margin: 40px auto;
  max-width: 900px;
}

.celtic-cross-layout .cards-container {
  position: relative;
  height: 600px;
  width: 100%;
}

.celtic-cross-layout .card-position {
  position: absolute;
  width: 80px;
  height: 120px;
}

.celtic-cross-layout .card-mini {
  width: 100%;
  height: 100%;
  position: relative;
}

.celtic-cross-layout .card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.celtic-cross-layout .position-label {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 켈틱 크로스 카드 위치 - 원본과 동일하게 */
.celtic-cross-layout .position-1 { /* 현재상황 - 중앙 왼쪽 */
  top: 58%; /* 60% -> 80% 추가로 20% 아래로 이동 */
  left: calc(40% - 50px);
  transform: translate(-80%, 75%);
  z-index: 10;
}

.celtic-cross-layout .position-2 { /* 도전/십자가 - 중앙 오른쪽 */
  top: 52%; /* 56% -> 76% 추가로 20% 아래로 이동 */
  left: calc(40% + 50px);
  transform: translate(-105%, 50%);
  z-index: 10;
}

.celtic-cross-layout .position-3 { /* 근본 - 아래 */
  top: 78%;
  left: 40%;
  transform: translate(-90%, 115%);
}

.celtic-cross-layout .position-4 { /* 과거 - 왼쪽 */
  top: 53%;
  left: 10%;
  transform: translate(-140%, 65%);
}

.celtic-cross-layout .position-5 { /* 드러나는 모습 - 위 */
  top: 25%;
  left: 40%;
  transform: translate(-90%, 35%);
}

.celtic-cross-layout .position-6 { /* 미래 - 오른쪽 */
  top: 53%;
  left: 70%;
  transform: translate(-40%, 65%);
}

/* 오른쪽 기둥 */
.celtic-cross-layout .position-7 { /* 내가보는나 - 맨 아래 */
  top: 85%;
  left: 95%;
  transform: translate(0%, 175%);
}

.celtic-cross-layout .position-8 { /* 남이보는나 */
  top: 62%;
  left: 95%;
  transform: translate(30%, 110%);
}

.celtic-cross-layout .position-9 { /* 예상하는 결과 */
  top: 38%;
  left: 95%;
  transform: translate(0%, 50%);
}

.celtic-cross-layout .position-10 { /* 실제 결과 - 맨 위 */
  top: 15%;
  left: 95%;
  transform: translate(30%, -15%);
}

/* 해석 섹션 */
.basic-interpretation-content,
.ai-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 25px;
  border-radius: 12px;
  line-height: 1.8;
  backdrop-filter: blur(10px);
  white-space: pre-wrap;
  word-break: keep-all;
}

/* 오늘의 카드 해석 스타일 */
.daily-card-interpretation {
  background: rgba(255, 255, 255, 0.05);
  padding: 30px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.daily-card-interpretation .fortune-subtitle {
  font-size: 20px;
  font-weight: 600;
  color: #FFD700;
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.daily-card-interpretation .fortune-text {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin: 12px 0;
}

.daily-card-interpretation .fortune-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.daily-card-interpretation .item-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
}

.daily-card-interpretation .item-value {
  color: #FFD700;
  font-weight: 500;
}

.daily-card-interpretation .star-display {
  font-size: 18px;
  text-align: center;
  margin: 12px 0;
  padding: 8px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
}

.daily-card-interpretation .highlight-point {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border-left: 3px solid #A855F7;
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.7;
}

.daily-card-interpretation .daily-quote {
  font-size: 17px;
  font-style: italic;
  line-height: 1.6;
  margin: 20px 0;
  padding: 20px;
  border-left: 3px solid #FFD700;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.95);
}

.ai-interpretation-result {
  margin-top: 30px;
}

.ai-interpretation-result h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #A855F7;
}

/* CTA 섹션 */
.cta-section {
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  padding: 60px 20px;
  text-align: center;
  margin-top: 60px;
  width: 100%;
}

.cta-section h2 {
  font-size: 28px;
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

/* 버튼 스타일 */
.cta-button,
.primary-cta {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  outline: none;
}

.cta-button:hover,
.primary-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .reading-summary-box {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .summary-header {
    margin-bottom: 20px;
  }
  
  .summary-title {
    font-size: 18px;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .summary-date {
    font-size: 12px;
  }
  
  .info-row {
    padding: 10px;
  }
  
  .info-text {
    font-size: 14px;
  }
  
  .card-item {
    padding: 8px;
  }
  
  .card-name {
    font-size: 14px;
  }
  
  .insight-text {
    font-size: 14px;
  }
  
  .share-header h1 {
    font-size: 24px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .seven-star-layout {
    min-height: 350px;
  }
  
  .seven-star-layout .star-container {
    height: 350px;
    transform: scale(0.8);
    transform-origin: top center;
  }
  
  .cup-relationship-layout {
    min-height: 600px;
  }
  
  .cup-relationship-layout .cup-container {
    height: 600px;
    transform: scale(0.7);
    transform-origin: top center;
  }
  
  .celtic-cross-layout {
    min-height: 500px;
  }
  
  .celtic-cross-layout .cards-container {
    height: 500px;
    transform: scale(0.8);
    transform-origin: top center;
  }
  
  .celtic-cross-layout .card-position,
  .cup-relationship-layout .cup-card {
    width: 70px;
    height: 100px;
  }
  
  .celtic-cross-layout .position-label,
  .cup-relationship-layout .position-label {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }
  
  .cta-section h2 {
    font-size: 22px;
  }
  
  .cta-section p {
    font-size: 16px;
  }
  
  .cta-button,
  .primary-cta {
    font-size: 16px;
    padding: 14px 28px;
  }
}

@media (max-width: 480px) {
  .cup-relationship-layout .cup-container {
    transform: scale(0.6);
  }
  
  .celtic-cross-layout .cards-container {
    transform: scale(0.7);
  }
  
  .seven-star-layout .star-container {
    transform: scale(0.7);
  }
}
</style>
