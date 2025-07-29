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
        
        <!-- 켈틱 크로스 특별 레이아웃 -->
        <div v-if="reading.spreadId === 'celtic_cross'" class="celtic-cross-layout">
          <div class="celtic-cross-container">
            <!-- 중앙 크로스 -->
            <div class="celtic-center">
              <div class="celtic-card position-1" @click="showCardDetail(0)">
                <div class="card-mini" :class="reading.cards[0].orientation">
                  <span class="position-label">1</span>
                  <span class="card-name">{{ reading.cards[0].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-2 cross-card" @click="showCardDetail(1)">
                <div class="card-mini" :class="reading.cards[1].orientation">
                  <span class="position-label">2</span>
                  <span class="card-name">{{ reading.cards[1].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-3" @click="showCardDetail(2)">
                <div class="card-mini" :class="reading.cards[2].orientation">
                  <span class="position-label">3</span>
                  <span class="card-name">{{ reading.cards[2].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-4" @click="showCardDetail(3)">
                <div class="card-mini" :class="reading.cards[3].orientation">
                  <span class="position-label">4</span>
                  <span class="card-name">{{ reading.cards[3].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-5" @click="showCardDetail(4)">
                <div class="card-mini" :class="reading.cards[4].orientation">
                  <span class="position-label">5</span>
                  <span class="card-name">{{ reading.cards[4].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-6" @click="showCardDetail(5)">
                <div class="card-mini" :class="reading.cards[5].orientation">
                  <span class="position-label">6</span>
                  <span class="card-name">{{ reading.cards[5].nameKr }}</span>
                </div>
              </div>
            </div>
            
            <!-- 오른쪽 직선 -->
            <div class="celtic-staff">
              <div class="celtic-card position-7" @click="showCardDetail(6)">
                <div class="card-mini" :class="reading.cards[6].orientation">
                  <span class="position-label">7</span>
                  <span class="card-name">{{ reading.cards[6].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-8" @click="showCardDetail(7)">
                <div class="card-mini" :class="reading.cards[7].orientation">
                  <span class="position-label">8</span>
                  <span class="card-name">{{ reading.cards[7].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-9" @click="showCardDetail(8)">
                <div class="card-mini" :class="reading.cards[8].orientation">
                  <span class="position-label">9</span>
                  <span class="card-name">{{ reading.cards[8].nameKr }}</span>
                </div>
              </div>
              <div class="celtic-card position-10" @click="showCardDetail(9)">
                <div class="card-mini" :class="reading.cards[9].orientation">
                  <span class="position-label">10</span>
                  <span class="card-name">{{ reading.cards[9].nameKr }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 선택된 카드 상세 정보 -->
          <div v-if="selectedCardIndex !== null" class="selected-card-detail">
            <div class="card-detail-header">
              <h3>{{ reading.cards[selectedCardIndex].position.name }}</h3>
              <button @click="selectedCardIndex = null" class="close-detail">×</button>
            </div>
            <div class="card-detail-content">
              <div class="card-image">
                <img :src="getCardImageUrl(reading.cards[selectedCardIndex])" 
                     :alt="reading.cards[selectedCardIndex].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[selectedCardIndex].orientation === 'reversed' }" />
              </div>
              <h4>{{ reading.cards[selectedCardIndex].nameKr || reading.cards[selectedCardIndex].name }}</h4>
              <span class="card-orientation" :class="reading.cards[selectedCardIndex].orientation">
                {{ reading.cards[selectedCardIndex].orientation === 'upright' ? '정방향' : '역방향' }}
              </span>
              <p class="position-meaning">
                <strong>포지션 의미:</strong> {{ reading.cards[selectedCardIndex].position.description }}
              </p>
              <p class="card-meaning">{{ getCardMeaning(reading.cards[selectedCardIndex]) }}</p>
              <p class="card-advice" v-if="reading.cards[selectedCardIndex].interpretation?.advice">
                <strong>조언:</strong> {{ reading.cards[selectedCardIndex].interpretation.advice }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- 기존 카드 그리드 (다른 스프레드) -->
        <div v-else class="cards-grid">
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
                <img :src="getCardImageUrl(card)" :alt="card.nameKr || card.name" @error="onImageError" 
                     :class="{ reversed: card.orientation === 'reversed' }" />
              </div>
              
              <div class="card-info">
                <h4>{{ card.nameKr || card.name }}</h4>
                <p class="card-meaning">{{ getCardMeaning(card) }}</p>
                <p class="card-advice" v-if="card.interpretation?.advice">
                  <strong>조언:</strong> {{ card.interpretation.advice }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 프리미엄 인사이트 (프리미엄 사용자만) -->
      <section v-if="reading.premiumInsights" class="premium-insights">
        <h2>✨ 프리미엄 인사이트</h2>
        
        <!-- 영혼의 교훈 -->
        <div v-if="reading.premiumInsights.soulLesson" class="insight-card">
          <h3>🌟 영혼의 교훈</h3>
          <p>{{ reading.premiumInsights.soulLesson }}</p>
        </div>
        
        <!-- 카르마적 부채 -->
        <div v-if="reading.premiumInsights.karmicDebt" class="insight-card">
          <h3>♾️ 카르마적 과제</h3>
          <p>{{ reading.premiumInsights.karmicDebt }}</p>
        </div>
        
        <!-- 영적 선물 -->
        <div v-if="reading.premiumInsights.spiritualGifts" class="insight-card">
          <h3>🎁 영적 선물</h3>
          <p>{{ reading.premiumInsights.spiritualGifts }}</p>
        </div>
        
        <!-- 그림자 작업 -->
        <div v-if="reading.premiumInsights.shadowWork" class="insight-card">
          <h3>🌙 그림자 작업</h3>
          <p>{{ reading.premiumInsights.shadowWork }}</p>
        </div>
        
        <!-- 타임라인 -->
        <div v-if="reading.premiumInsights.timeline" class="insight-card">
          <h3>⏰ 예상 타임라인</h3>
          <p>{{ reading.premiumInsights.timeline }}</p>
        </div>
        
        <!-- 행동 단계 -->
        <div v-if="reading.premiumInsights.actionSteps" class="insight-card">
          <h3>🚩 구체적인 행동 단계</h3>
          <ul>
            <li v-for="(step, index) in reading.premiumInsights.actionSteps" :key="index">
              {{ step }}
            </li>
          </ul>
        </div>
        
        <!-- 우주적 지침 (세븐 스타) -->
        <div v-if="reading.premiumInsights.stellarAlignment" class="insight-card cosmic-guidance">
          <h3>🌌 우주의 정렬</h3>
          <p>{{ reading.premiumInsights.stellarAlignment }}</p>
        </div>
        
        <div v-if="reading.premiumInsights.cosmicTiming" class="insight-card cosmic-guidance">
          <h3>✨ 우주적 타이밍</h3>
          <p>{{ reading.premiumInsights.cosmicTiming }}</p>
        </div>
        
        <!-- 관계 조언 (컵 오브 릴레이션십) -->
        <div v-if="reading.premiumInsights.communicationTips" class="insight-card love-guidance">
          <h3>💬 소통 팁</h3>
          <p>{{ reading.premiumInsights.communicationTips }}</p>
        </div>
        
        <div v-if="reading.premiumInsights.intimacyGuidance" class="insight-card love-guidance">
          <h3>💕 친밀감 가이드</h3>
          <p>{{ reading.premiumInsights.intimacyGuidance }}</p>
        </div>
        
        <div v-if="reading.premiumInsights.soulContractInsights" class="insight-card love-guidance">
          <h3>🔗 영혼의 계약</h3>
          <p>{{ reading.premiumInsights.soulContractInsights }}</p>
        </div>
      </section>
      
      <!-- 무료 사용자를 위한 프리미엄 홍보 -->
      <section v-else-if="!userStore.isPremium && (reading.spreadId === 'celtic_cross' || reading.spreadId === 'seven_star' || reading.spreadId === 'cup_of_relationship')" class="premium-cta">
        <h3>🌟 더 깊은 통찰을 원하시나요?</h3>
        <p>프리미엄 회원이 되시면 다음과 같은 특별한 해석을 받으실 수 있습니다:</p>
        <ul>
          <li>✨ 영혼의 교훈과 카르마적 통찰</li>
          <li>🌌 우주적 타이밍과 에너지 분석</li>
          <li>🔮 크리스탈 추천과 차크라 밸런싱</li>
          <li>🌙 그림자 작업과 영적 성장 가이드</li>
          <li>⏰ 구체적인 타임라인과 행동 단계</li>
        </ul>
        <button class="btn btn-premium" @click="router.push('/premium')">
          프리미엄으로 업그레이드
        </button>
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
import { useUserStore } from '../store/user';

const router = useRouter();
const route = useRoute();
const tarotStore = useTarotStore();
const userStore = useUserStore();

const readingId = computed(() => {
  return route.query.readingId as string || route.params.readingId as string;
});

const reading = computed(() => {
  if (!readingId.value) return null;
  return tarotStore.getReadingById(readingId.value) || tarotStore.getCurrentReading();
});

// 켈틱 크로스에서 선택된 카드 인덱스
const selectedCardIndex = ref<number | null>(null);

// 카드 상세 정보 표시
const showCardDetail = (index: number) => {
  selectedCardIndex.value = index;
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

// 카드 이미지 URL 생성 함수
const getCardImageUrl = (card: any) => {
  try {
    // Supabase에서 오는 imageUrl이 있다면 먼저 처리
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      // 수트 폴더가 포함된 경로를 수정
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
      // 메이저 아르카나 파일명 대소문자 수정
      if (finalUrl.includes('/assets/tarot-cards/major/')) {
        const corrections = {
          '00-the-fool.png': '00-the-Fool.png',
          '01-the-magician.png': '01-The-Magician.png',
          '02-the-high-priestess.png': '02-The-High-Priestess.png',
          '03-the-empress.png': '03-The-Empress.png',
          '04-the-emperor.png': '04-The-Emperor.png',
          '05-the-hierophant.png': '05-The-Hierophant.png',
          '06-the-lovers.png': '06-The-Lovers.png',
          '07-the-chariot.png': '07-The-Chariot.png',
          '08-strength.png': '08-Strength.png',
          '09-the-hermit.png': '09-The-Hermit.png',
          '10-wheel-of-fortune.png': '10-Wheel-of-Fortune.png',
          '11-justice.png': '11-Justice.png',
          '12-the-hanged-man.png': '12-The-Hanged-Man.png',
          '13-death.png': '13-Death.png',
          '14-temperance.png': '14-Temperance.png',
          '15-the-devil.png': '15-The-Devil.png',
          '16-the-tower.png': '16-The-Tower.png',
          '17-the-star.png': '17-The-Star.png',
          '18-the-moon.png': '18-The-Moon.png',
          '19-the-sun.png': '19-The-Sun.png',
          '20-judgement.png': '20-Judgement.png',
          '21-the-world.png': '21-The-World.png'
        };
        
        for (const [wrong, correct] of Object.entries(corrections)) {
          if (finalUrl.includes(wrong)) {
            finalUrl = finalUrl.replace(wrong, correct);
            break;
          }
        }
      }
      
      return finalUrl;
    }
    
    // 마이너 아르카나의 경우
    if (card.arcana === 'minor') {
      const cardNumber = String(card.number || 1).padStart(2, '0');
      let cardName;
      
      if (card.suit) {
        if (card.number <= 10) {
          const numberNames = {
            1: 'ace', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
            6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
          };
          cardName = `${numberNames[card.number]}-of-${card.suit}`;
        } else {
          // 코트 카드들은 Supabase imageUrl을 사용해야 함 (위에서 이미 처리됨)
          const faceCards = {
            11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King'
          };
          const suitCapitalized = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
          cardName = `${faceCards[card.number]}-of-${suitCapitalized}`;
        }
      } else {
        cardName = card.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    }
    
    // 메이저 아르카나의 경우
    if (card.arcana === 'major') {
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
      
      const fileName = majorCardNames[card.number] || '00-the-Fool.png';
      return `/assets/tarot-cards/major/${fileName}`;
    }
    
    return '/assets/tarot-cards/major/00-the-Fool.png';
  } catch (error) {
    console.error('카드 이미지 URL 생성 오류:', error);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
};

// 이미지 로드 에러 처리
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img && img.parentElement) {
    img.style.display = 'none';
    if (!img.parentElement.querySelector('.fallback-emoji')) {
      const fallbackEmoji = document.createElement('div');
      fallbackEmoji.className = 'fallback-emoji';
      fallbackEmoji.textContent = '🎤';
      fallbackEmoji.style.cssText = `
        font-size: 48px; text-align: center; display: flex;
        align-items: center; justify-content: center;
        width: 100%; height: 100%; position: absolute;
        top: 0; left: 0; background: rgba(75, 85, 99, 0.9);
        border-radius: 6px; z-index: 10;
      `;
      img.parentElement.appendChild(fallbackEmoji);
    }
  }
};

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/app');
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
    router.push('/app');
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
  position: relative;
}

.card-image img {
  width: 80px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.card-image img.reversed {
  transform: rotate(180deg);
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

/* 켈틱 크로스 레이아웃 스타일 */
.celtic-cross-layout {
  position: relative;
  min-height: 500px;
}

.celtic-cross-container {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin: 40px 0;
}

.celtic-center {
  position: relative;
  width: 300px;
  height: 400px;
}

.celtic-staff {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 400px;
}

.celtic-card {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
}

.celtic-card:hover {
  transform: scale(1.1);
  z-index: 10;
}

/* 켈틱 크로스 카드 위치 */
.celtic-card.position-1 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.celtic-card.position-2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(90deg);
  z-index: 3;
}

.celtic-card.position-3 {
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
}

.celtic-card.position-4 {
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
}

.celtic-card.position-5 {
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
}

.celtic-card.position-6 {
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
}

.celtic-staff .celtic-card {
  position: relative;
  margin-bottom: 10px;
}

.card-mini {
  width: 60px;
  height: 90px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  text-align: center;
  padding: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card-mini.reversed {
  background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
}

.position-label {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #FFD700;
}

.card-name {
  font-size: 10px;
  line-height: 1.2;
}

/* 선택된 카드 상세 정보 */
.selected-card-detail {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(168, 85, 247, 0.5);
  border-radius: 16px;
  padding: 25px;
  margin-top: 40px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-detail-header h3 {
  color: #FFD700;
  font-size: 22px;
  margin: 0;
}

.close-detail {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-detail:hover {
  color: white;
}

.card-detail-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  align-items: start;
}

.card-detail-content .card-image {
  width: 120px;
  height: 180px;
}

.card-detail-content .card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-detail-content h4 {
  color: white;
  font-size: 20px;
  margin-bottom: 10px;
}

.position-meaning {
  background: rgba(168, 85, 247, 0.1);
  border-left: 3px solid #A855F7;
  padding: 10px 15px;
  margin: 15px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 프리미엄 인사이트 섹션 */
.premium-insights {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.premium-insights::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.premium-insights h2 {
  text-align: center;
  color: #FFD700;
  font-size: 28px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.insight-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.insight-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.insight-card h3 {
  color: #A855F7;
  font-size: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.insight-card p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-size: 16px;
}

.insight-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insight-card ul li {
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding-left: 25px;
}

.insight-card ul li:last-child {
  border-bottom: none;
}

.insight-card ul li::before {
  content: '★';
  position: absolute;
  left: 0;
  color: #FFD700;
}

/* 특별한 인사이트 카드 스타일 */
.cosmic-guidance {
  background: linear-gradient(135deg, rgba(25, 25, 112, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
  border-color: rgba(255, 215, 0, 0.3);
}

.cosmic-guidance h3 {
  color: #FFD700;
}

.love-guidance {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
  border-color: rgba(236, 72, 153, 0.3);
}

.love-guidance h3 {
  color: #EC4899;
}

/* 프리미엄 없을 때 CTA */
.premium-cta {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  text-align: center;
  padding: 30px;
  border-radius: 20px;
  margin: 40px 0;
}

.premium-cta h3 {
  font-size: 24px;
  margin-bottom: 15px;
}

.premium-cta p {
  margin-bottom: 20px;
  font-size: 16px;
}

.premium-cta .btn {
  background: #1E1B4B;
  color: #FFD700;
  font-weight: 700;
}

.premium-cta ul {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
  display: inline-block;
}

.premium-cta ul li {
  padding: 8px 0;
  position: relative;
  padding-left: 30px;
}

.premium-cta ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
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
  
  /* 켈틱 크로스 모바일 스타일 */
  .celtic-cross-container {
    flex-direction: column;
    gap: 40px;
    align-items: center;
  }
  
  .celtic-center {
    transform: scale(0.8);
  }
  
  .celtic-staff {
    flex-direction: row;
    width: 100%;
    height: auto;
    justify-content: space-around;
  }
  
  .card-detail-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .premium-insights {
    padding: 20px;
  }
  
  .insight-card h3 {
    font-size: 18px;
  }
  
  .insight-card p {
    font-size: 14px;
  }
}
</style>
