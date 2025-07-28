<template>
  <div class="reading-result">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>점괘 해석</h1>
    </header>

    <div class="container" v-if="reading">
      <!-- 전체 메시지 -->
      <section class="overall-message">
        <h2>🔮 전체 메시지</h2>
        <p>{{ reading.overallMessage }}</p>
      </section>

      <!-- 카드 해석 -->
      <section class="cards-section">
        <h2>📜 카드 해석</h2>
        <div class="cards-grid">
          <div 
            v-for="(card, index) in reading.cards" 
            :key="index"
            class="card-result"
          >
            <div class="card-header">
              <h3>{{ card.position.name }}</h3>
              <span class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </span>
            </div>
            
            <div class="card-content">
              <div class="card-image">
                <div class="card-placeholder" :class="card.orientation">
                  🃏
                </div>
              </div>
              
              <div class="card-info">
                <h4>{{ card.nameKr || card.name }}</h4>
                <p class="card-keywords">
                  <strong>키워드:</strong> 
                  {{ getCardKeywords(card) }}
                </p>
                <p class="card-meaning">{{ getCardMeaning(card) }}</p>
                <p class="card-advice" v-if="card.interpretation?.advice">
                  <strong>조언:</strong> {{ card.interpretation.advice }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 액션 버튼 -->
      <section class="actions">
        <button class="btn btn-primary" @click="newReading">
          새로운 점괘 보기
        </button>
        <button class="btn btn-secondary" @click="goHome">
          홈으로 돌아가기
        </button>
      </section>
    </div>

    <!-- 로딩 또는 에러 상태 -->
    <div class="container" v-else>
      <div class="error-state">
        <h2>😕 점괘를 찾을 수 없습니다</h2>
        <p>점괘 데이터가 없거나 만료되었습니다.</p>
        <button class="btn btn-primary" @click="goHome">
          홈으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTarotStore } from '../store/tarot';

const router = useRouter();
const route = useRoute();
const tarotStore = useTarotStore();

const readingId = computed(() => {
  return route.query.readingId as string || route.params.readingId as string;
});

const reading = computed(() => {
  if (!readingId.value) return null;
  return tarotStore.getReadingById(readingId.value) || tarotStore.getCurrentReading();
});

// 카드 키워드 가져오기
const getCardKeywords = (card: any): string => {
  if (card.keywords && card.keywords[card.orientation]) {
    return card.keywords[card.orientation].join(', ');
  }
  return '카드 키워드';
};

// 카드 의미 가져오기
const getCardMeaning = (card: any): string => {
  // interpretation이 있으면 사용
  if (card.interpretation && card.interpretation.basic) {
    return card.interpretation.basic;
  }
  
  // meanings에서 주제에 맞는 의미 찾기
  if (card.meanings && reading.value) {
    const topic = reading.value.topic || 'general';
    const topicMeaning = card.meanings[topic];
    if (topicMeaning && topicMeaning[card.orientation]) {
      return topicMeaning[card.orientation];
    }
    
    // general 의미로 폴백
    if (card.meanings.general && card.meanings.general[card.orientation]) {
      return card.meanings.general[card.orientation];
    }
  }
  
  return '이 카드가 당신에게 전하는 메시지를 느껴보세요.';
};

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/');
};

const newReading = () => {
  router.push('/reading-select');
};

onMounted(() => {
  console.log('ReadingResult 마운트됨');
  console.log('readingId:', readingId.value);
  console.log('reading:', reading.value);
  
  if (!reading.value && !readingId.value) {
    console.warn('점괘 데이터가 없습니다. 홈으로 리다이렉트');
    router.push('/');
  }
});
</script>

<style scoped>
.reading-result {
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

.overall-message {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.overall-message h2 {
  color: #A855F7;
  margin-bottom: 20px;
  font-size: 24px;
}

.overall-message p {
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.cards-section {
  margin-bottom: 40px;
}

.cards-section h2 {
  color: #A855F7;
  margin-bottom: 25px;
  text-align: center;
  font-size: 24px;
}

.cards-grid {
  display: grid;
  gap: 25px;
}

.card-result {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
}

.card-result:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  color: #F59E0B;
  margin: 0;
  font-size: 18px;
}

.card-orientation {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.card-orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.card-content {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  align-items: start;
}

.card-image {
  display: flex;
  justify-content: center;
}

.card-placeholder {
  width: 80px;
  height: 120px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
}

.card-placeholder.reversed {
  transform: rotate(180deg);
}

.card-info h4 {
  color: white;
  margin-bottom: 10px;
  font-size: 20px;
}

.card-keywords {
  color: #F59E0B;
  margin-bottom: 15px;
  font-size: 14px;
}

.card-meaning {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 16px;
}

.card-advice {
  color: #A855F7;
  font-style: italic;
  line-height: 1.5;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  color: #EF4444;
  margin-bottom: 15px;
  font-size: 28px;
}

.error-state p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .card-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 15px;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
}
</style>
