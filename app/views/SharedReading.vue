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
      <!-- 헤더 -->
      <header class="share-header">
        <h1>🔮 공유된 타로 점괘</h1>
        <p class="share-info">
          공유일: {{ formatDate(sharedData.created_at) }}
        </p>
      </header>
      
      <!-- 읽기 전용 리딩 컨텐츠 -->
      <div class="container">
        <!-- 커스텀 질문 표시 -->
        <section v-if="sharedData.custom_question" class="custom-question-section">
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
                  <img :src="getCardImageUrl(card)" 
                       :alt="card.nameKr || card.name" 
                       @error="onImageError"
                       :class="{ reversed: card.orientation === 'reversed' }" />
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
                  <img :src="getCardImageUrl(card)" 
                       :alt="card.nameKr || card.name" 
                       @error="onImageError"
                       :class="{ reversed: card.orientation === 'reversed' }" />
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
                  <img :src="getCardImageUrl(card)" 
                       :alt="card.nameKr || card.name" 
                       @error="onImageError"
                       :class="{ reversed: card.orientation === 'reversed' }" />
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 오늘의 카드 레이아웃 -->
          <div v-else-if="sharedData.spread_type === 'daily_card' && parsedCards[0]" class="daily-card-layout">
            <div class="card-display">
              <div class="card-image">
                <img :src="getCardImageUrl(parsedCards[0])" 
                     :alt="parsedCards[0].nameKr || parsedCards[0].name" 
                     @error="onImageError"
                     :class="{ reversed: parsedCards[0].orientation === 'reversed' }" />
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
              <div class="card-image">
                <img :src="getCardImageUrl(card)" 
                     :alt="card.nameKr || card.name" 
                     @error="onImageError"
                     :class="{ reversed: card.orientation === 'reversed' }" />
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

const route = useRoute();
const loading = ref(true);
const error = ref('');
const expired = ref(false);
const sharedData = ref<any>(null);

// 카드 데이터 파싱
const parsedCards = computed(() => {
  if (!sharedData.value?.cards) return [];
  try {
    return typeof sharedData.value.cards === 'string' 
      ? JSON.parse(sharedData.value.cards)
      : sharedData.value.cards;
  } catch {
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

// 카드 이미지 URL 생성
const getCardImageUrl = (card: any) => {
  const cardNum = card.cardNumber || card.id || 0;
  
  // 메이저 아르카나 (0-21)
  if (cardNum <= 21) {
    const majorCardNames = {
      0: '00-the-Fool.png', 1: '01-The-Magician.png', 2: '02-The-High-Priestess.png',
      3: '03-The-Empress.png', 4: '04-The-Emperor.png', 5: '05-The-Hierophant.png',
      6: '06-The-Lovers.png', 7: '07-The-Chariot.png', 8: '08-Strength.png',
      9: '09-The-Hermit.png', 10: '10-Wheel-of-Fortune.png', 11: '11-Justice.png',
      12: '12-The-Hanged-Man.png', 13: '13-Death.png', 14: '14-Temperance.png',
      15: '15-The-Devil.png', 16: '16-The-Tower.png', 17: '17-The-Star.png',
      18: '18-The-Moon.png', 19: '19-The-Sun.png', 20: '20-Judgement.png',
      21: '21-The-World.png'
    };
    
    const fileName = majorCardNames[cardNum as keyof typeof majorCardNames] || '00-the-Fool.png';
    return `/assets/tarot-cards/major/${fileName}`;
  }
  
  // 마이너 아르카나 (22-77)
  // Wands: 22-35, Cups: 36-49, Swords: 50-63, Pentacles: 64-77
  const minorCardMap: Record<number, string> = {
    // Wands
    22: '01-ace-of-wands.png', 23: '02-two-of-wands.png', 24: '03-three-of-wands.png',
    25: '04-four-of-wands.png', 26: '05-five-of-wands.png', 27: '06-six-of-wands.png',
    28: '07-seven-of-wands.png', 29: '08-eight-of-wands.png', 30: '09-nine-of-wands.png',
    31: '10-ten-of-wands.png', 32: '11-Page-of-Wands.png', 33: '12-Knight-of-Wands.png',
    34: '13-Queen-of-Wands.png', 35: '14-King-of-Wands.png',
    // Cups
    36: '01-ace-of-cups.png', 37: '02-two-of-cups.png', 38: '03-three-of-cups.png',
    39: '04-four-of-cups.png', 40: '05-five-of-cups.png', 41: '06-six-of-cups.png',
    42: '07-seven-of-cups.png', 43: '08-eight-of-cups.png', 44: '09-nine-of-cups.png',
    45: '10-ten-of-cups.png', 46: '11-Page-of-Cups.png', 47: '12-Knight-of-Cups.png',
    48: '13-Queen-of-Cups.png', 49: '14-King-of-Cups.png',
    // Swords
    50: '01-ace-of-swords.png', 51: '02-two-of-swords.png', 52: '03-three-of-swords.png',
    53: '04-four-of-swords.png', 54: '05-five-of-swords.png', 55: '06-six-of-swords.png',
    56: '07-seven-of-swords.png', 57: '08-eight-of-swords.png', 58: '09-nine-of-swords.png',
    59: '10-ten-of-swords.png', 60: '11-Page-of-Swords.png', 61: '12-Knight-of-Swords.png',
    62: '13-Queen-of-Swords.png', 63: '14-King-of-Swords.png',
    // Pentacles
    64: '01-ace-of-pentacles.png', 65: '02-two-of-pentacles.png', 66: '03-three-of-pentacles.png',
    67: '04-four-of-pentacles.png', 68: '05-five-of-pentacles.png', 69: '06-six-of-pentacles.png',
    70: '07-seven-of-pentacles.png', 71: '08-eight-of-pentacles.png', 72: '09-nine-of-pentacles.png',
    73: '10-ten-of-pentacles.png', 74: '11-Page-of-Pentacles.png', 75: '12-Knight-of-Pentacles.png',
    76: '13-Queen-of-Pentacles.png', 77: '14-King-of-Pentacles.png'
  };
  
  const fileName = minorCardMap[cardNum];
  if (fileName) {
    return `/assets/tarot-cards/minor/${fileName}`;
  }
  
  // 카드 정보를 로그로 확인
  console.log('Unknown card:', card);
  
  // 폴백
  return '/assets/tarot-cards/major/00-the-Fool.png';
};

// 이미지 에러 처리
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/tarot-cards/major/00-the-Fool.png';
};

// 날짜 포맷팅
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 홈으로 이동
const goHome = () => {
  window.location.href = '/';
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

/* 헤더 */
.share-header {
  text-align: center;
  padding: 40px 20px;
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

.card-image img.reversed {
  transform: rotate(180deg);
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
  margin: 40px auto;
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
.seven-star-layout .position-2 { left: calc(30% - 35px); top: 100px; } /* 좌측 상단 */
.seven-star-layout .position-3 { left: calc(70% - 35px); top: 100px; } /* 우측 상단 */
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

/* 컵 오브 릴레이션십 카드 위치 - 원본과 동일하게 */
.cup-relationship-layout .position-1 { /* 나 - 왼쪽 아래 */
  top: 80%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-2 { /* 상대 - 오른쪽 아래 */
  top: 80%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-3 { /* 관계 기본 - 하단 중앙 */
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-4 { /* 관계 과거 - 왼쪽 중간 */
  top: 60%;
  left: 35%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-5 { /* 현재 느 상태 - 중앙 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.cup-relationship-layout .position-6 { /* 현재 외부 상황 - 오른쪽 중간 */
  top: 60%;
  left: 65%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-7 { /* 현재 나는 어떻게 생각? - 왼쪽 중상 */
  top: 40%;
  left: 25%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-8 { /* 현재 상대는 어떻게 생각? - 오른쪽 중상 */
  top: 40%;
  left: 75%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-9 { /* 미래 나는 어떻게 생각? - 왼쪽 상단 */
  top: 20%;
  left: 35%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-10 { /* 미래 상대는 어떻게 생각? - 오른쪽 상단 */
  top: 20%;
  left: 65%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .position-11 { /* 결과 - 상단 중앙 */
  top: 5%;
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
.celtic-cross-layout .position-1 { 
  left: calc(40% - 40px); 
  top: calc(50% - 60px); 
}

.celtic-cross-layout .position-2 { 
  left: calc(40% - 40px); 
  top: calc(50% - 60px); 
  transform: rotate(90deg); 
  z-index: 2;
}

.celtic-cross-layout .position-3 { 
  left: calc(40% - 40px); 
  top: calc(50% + 80px); 
}

.celtic-cross-layout .position-4 { 
  left: calc(40% - 180px); 
  top: calc(50% - 60px); 
}

.celtic-cross-layout .position-5 { 
  left: calc(40% - 40px); 
  top: calc(50% - 200px); 
}

.celtic-cross-layout .position-6 { 
  left: calc(40% + 100px); 
  top: calc(50% - 60px); 
}

.celtic-cross-layout .position-7 { 
  right: 80px; 
  bottom: 40px; 
}

.celtic-cross-layout .position-8 { 
  right: 80px; 
  bottom: calc(40px + 140px); 
}

.celtic-cross-layout .position-9 { 
  right: 80px; 
  bottom: calc(40px + 280px); 
}

.celtic-cross-layout .position-10 { 
  right: 80px; 
  bottom: calc(40px + 420px); 
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
