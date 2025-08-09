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
          <button @click="goToApp" class="cta-button">
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
          
          <!-- 켈틱 크로스 레이아웃 -->
          <div v-if="sharedData.spread_type === 'celtic_cross'" class="celtic-cross-layout">
            <div class="cards-container">
              <div 
                v-for="(card, index) in sharedData.cards" 
                :key="index"
                :class="`card-position position-${index + 1}`"
              >
                <div class="card-mini" :class="card.orientation">
                  <img :src="getCardImageUrl(card)" 
                       :alt="card.nameKr" 
                       @error="onImageError"
                       :class="{ reversed: card.orientation === 'reversed' }" />
                  <span class="position-label">{{ index + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 기본 카드 그리드 -->
          <div v-else class="cards-grid">
            <div 
              v-for="(card, index) in sharedData.cards" 
              :key="index"
              class="card-display"
            >
              <div class="card-image">
                <img :src="getCardImageUrl(card)" 
                     :alt="card.nameKr" 
                     @error="onImageError"
                     :class="{ reversed: card.orientation === 'reversed' }" />
              </div>
              <div class="card-name">{{ card.nameKr }}</div>
              <div class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </div>
            </div>
          </div>
        </section>

        <!-- 해석 표시 -->
        <section v-if="sharedData.basic_interpretation || sharedData.ai_interpretation" class="interpretation-section">
          <h2>🔮 점괘 해석</h2>
          
          <!-- 기본 해석 -->
          <div v-if="sharedData.basic_interpretation" class="basic-interpretation-content">
            <p>{{ sharedData.basic_interpretation }}</p>
          </div>
          
          <!-- AI 해석 -->
          <div v-if="sharedData.ai_interpretation" class="ai-interpretation-result">
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
          <button @click="goToApp" class="primary-cta">
            🎴 무료로 시작하기
          </button>
        </div>
      </section>
    </div>
    
    <!-- 에러 상태 -->
    <div v-else class="error-state">
      <div class="container">
        <div class="error-content">
          <div class="error-icon">😕</div>
          <h2>점괘를 찾을 수 없습니다</h2>
          <p>잘못된 링크이거나 이미 삭제된 점괘입니다.</p>
          <button @click="goToApp" class="cta-button">
            🔮 직접 점괘 보러 가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../services/supabase';
import { getCardImagePath, handleImageError } from '../utils/cardUtils';

const route = useRoute();
const router = useRouter();
const shareId = route.params.id as string;

const loading = ref(true);
const expired = ref(false);
const sharedData = ref<any>(null);

// 카드 이미지 URL 생성
const getCardImageUrl = (card: any) => {
  return getCardImagePath({
    cardNumber: card.cardNumber,
    name: card.name,
    nameKr: card.nameKr,
    orientation: card.orientation
  });
};

const onImageError = (event: Event) => handleImageError(event);

// 날짜 포맷팅
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 앱으로 이동
const goToApp = () => {
  router.push('/');
};

onMounted(async () => {
  try {
    // 1. 공유 데이터 조회
    const { data, error } = await supabase
      .from('shared_readings')
      .select('*')
      .eq('id', shareId)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      console.error('공유 데이터 조회 실패:', error);
      expired.value = false; // 에러 상태로 처리
      loading.value = false;
      return;
    }
    
    // 2. 만료 체크
    if (new Date(data.expires_at) < new Date()) {
      expired.value = true;
      loading.value = false;
      return;
    }
    
    sharedData.value = data;
    
  } catch (error) {
    console.error('공유 데이터 로드 실패:', error);
    expired.value = false; // 에러 상태로 처리
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.shared-reading {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(138, 92, 246, 0.2);
  border-top-color: var(--primary-color);
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
}

.expired-content,
.error-content {
  text-align: center;
  padding: 40px;
  background: var(--bg-secondary);
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
  color: var(--text-primary);
}

.expired-content p,
.error-content p {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 30px;
}

/* 헤더 */
.share-header {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.share-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.share-info {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 섹션 스타일 */
.custom-question-section,
.cards-layout-section,
.interpretation-section {
  margin: 40px 0;
}

.custom-question-section h2,
.cards-layout-section h2,
.interpretation-section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.custom-question-content {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
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
  color: var(--success-color);
}

.card-orientation.reversed {
  color: var(--warning-color);
}

/* 켈틱 크로스 레이아웃 */
.celtic-cross-layout {
  position: relative;
  min-height: 500px;
  margin: 20px auto;
  max-width: 800px;
}

.celtic-cross-layout .cards-container {
  position: relative;
  height: 500px;
}

.celtic-cross-layout .card-position {
  position: absolute;
  width: 70px;
  height: 100px;
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
  border-radius: 4px;
}

.celtic-cross-layout .position-label {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 켈틱 크로스 위치 */
.position-1 { left: calc(50% - 70px); top: calc(50% - 50px); }
.position-2 { left: calc(50% - 35px); top: calc(50% - 50px); transform: rotate(90deg); }
.position-3 { left: calc(50% - 35px); top: calc(70%); }
.position-4 { left: calc(25%); top: calc(50% - 50px); }
.position-5 { left: calc(50% - 35px); top: calc(20%); }
.position-6 { left: calc(70%); top: calc(50% - 50px); }
.position-7 { right: 20px; top: calc(75%); }
.position-8 { right: 20px; top: calc(55%); }
.position-9 { right: 20px; top: calc(35%); }
.position-10 { right: 20px; top: calc(15%); }

/* 해석 섹션 */
.basic-interpretation-content,
.ai-content {
  background: var(--bg-secondary);
  padding: 25px;
  border-radius: 12px;
  line-height: 1.8;
}

.ai-interpretation-result {
  margin-top: 30px;
}

.ai-interpretation-result h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: var(--primary-color);
}

/* CTA 섹션 */
.cta-section {
  background: linear-gradient(135deg, rgba(138, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  padding: 60px 20px;
  text-align: center;
  margin-top: 60px;
}

.cta-section h2 {
  font-size: 28px;
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 18px;
  color: var(--text-secondary);
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
  gap: 10px;
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
  
  .celtic-cross-layout {
    min-height: 400px;
  }
  
  .celtic-cross-layout .cards-container {
    height: 400px;
    transform: scale(0.75);
    transform-origin: top center;
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
</style>
