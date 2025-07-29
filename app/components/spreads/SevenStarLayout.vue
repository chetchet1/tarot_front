<template>
  <div class="seven-star-layout">
    <!-- 배경 장식 -->
    <div class="layout-background">
      <div class="star-constellation">
        <!-- 7개의 별 연결선 -->
        <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <!-- 별자리 연결선 -->
          <line x1="50" y1="20" x2="20" y2="35" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="20" y1="35" x2="20" y2="65" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="20" y1="65" x2="50" y2="80" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="50" y1="80" x2="80" y2="65" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="80" y1="65" x2="80" y2="35" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="80" y1="35" x2="50" y2="20" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="50" y1="20" x2="50" y2="50" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
          <line x1="50" y1="50" x2="50" y2="80" stroke="rgba(255, 215, 0, 0.3)" stroke-width="0.5"/>
        </svg>
        
        <!-- 별들 -->
        <div class="star" v-for="i in 7" :key="i" :class="`star-${i}`">
          <span class="star-icon">⭐</span>
        </div>
      </div>
      
      <!-- 반짝이는 별들 배경 -->
      <div class="sparkles">
        <div class="sparkle" v-for="i in 20" :key="i" :style="getSparkleStyle(i)">✨</div>
      </div>
    </div>

    <!-- 카드 배치 영역 -->
    <div class="cards-container" ref="cardsContainer">
      <!-- Position 1: 과거의 영향 (상단) -->
      <div 
        class="card-position position-1"
        :class="{ 'has-card': cards[0], 'revealed': cards[0]?.revealed }"
        @click="handleCardClick(0)"
      >
        <div class="position-label">1. 과거의 영향</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[0]" class="card-content">
              <div v-if="!cards[0].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[0].card)" 
                  :alt="cards[0].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[0].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[0].orientation">
                    {{ cards[0].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[0] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 2: 현재 상황 (중앙) -->
      <div 
        class="card-position position-2"
        :class="{ 'has-card': cards[1], 'revealed': cards[1]?.revealed }"
        @click="handleCardClick(1)"
      >
        <div class="position-label">2. 현재 상황</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[1]" class="card-content">
              <div v-if="!cards[1].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[1].card)" 
                  :alt="cards[1].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[1].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[1].orientation">
                    {{ cards[1].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[1] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 3: 숨겨진 영향 (왼쪽 위) -->
      <div 
        class="card-position position-3"
        :class="{ 'has-card': cards[2], 'revealed': cards[2]?.revealed }"
        @click="handleCardClick(2)"
      >
        <div class="position-label">3. 숨겨진 영향</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[2]" class="card-content">
              <div v-if="!cards[2].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[2].card)" 
                  :alt="cards[2].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[2].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[2].orientation">
                    {{ cards[2].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[2] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 4: 의식적 욕구 (오른쪽 위) -->
      <div 
        class="card-position position-4"
        :class="{ 'has-card': cards[3], 'revealed': cards[3]?.revealed }"
        @click="handleCardClick(3)"
      >
        <div class="position-label">4. 의식적 욕구</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[3]" class="card-content">
              <div v-if="!cards[3].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[3].card)" 
                  :alt="cards[3].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[3].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[3].orientation">
                    {{ cards[3].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[3] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 5: 무의식적 욕구 (왼쪽 아래) -->
      <div 
        class="card-position position-5"
        :class="{ 'has-card': cards[4], 'revealed': cards[4]?.revealed }"
        @click="handleCardClick(4)"
      >
        <div class="position-label">5. 무의식적 욕구</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[4]" class="card-content">
              <div v-if="!cards[4].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[4].card)" 
                  :alt="cards[4].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[4].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[4].orientation">
                    {{ cards[4].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[4] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 6: 조언 (오른쪽 아래) -->
      <div 
        class="card-position position-6"
        :class="{ 'has-card': cards[5], 'revealed': cards[5]?.revealed }"
        @click="handleCardClick(5)"
      >
        <div class="position-label">6. 조언</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[5]" class="card-content">
              <div v-if="!cards[5].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[5].card)" 
                  :alt="cards[5].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[5].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[5].orientation">
                    {{ cards[5].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[5] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 7: 최종 결과 (하단) -->
      <div 
        class="card-position position-7"
        :class="{ 'has-card': cards[6], 'revealed': cards[6]?.revealed }"
        @click="handleCardClick(6)"
      >
        <div class="position-label">7. 최종 결과</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[6]" class="card-content">
              <div v-if="!cards[6].revealed" class="card-back">
                <div class="card-back-design">🌟</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[6].card)" 
                  :alt="cards[6].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[6].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[6].orientation">
                    {{ cards[6].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[6] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 진행 상태 표시 -->
    <div class="progress-indicator" v-if="isDrawing">
      <p>별들이 당신의 운명을 읽고 있습니다...</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: drawProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { nativeUtils } from '@/utils/capacitor';

interface CardData {
  card: any;
  orientation: 'upright' | 'reversed';
  revealed: boolean;
}

interface Props {
  cards: CardData[];
  isDrawing: boolean;
  drawProgress: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['card-click']);

const cardsContainer = ref<HTMLElement>();

// 반짝이는 별 스타일 생성
const getSparkleStyle = (index: number) => {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = 3 + Math.random() * 4;
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};

// 카드 클릭 핸들러
const handleCardClick = async (index: number) => {
  if (props.cards[index] && !props.cards[index].revealed) {
    await nativeUtils.buttonTapHaptic();
    emit('card-click', index);
  }
};

// 카드 이미지 URL 생성 (CelticCrossLayout과 동일)
const getCardImageUrl = (card: any) => {
  try {
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
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

// 이미지 에러 핸들러
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  
  const parentElement = img.parentElement;
  if (parentElement && !parentElement.querySelector('.fallback-emoji')) {
    const fallbackEmoji = document.createElement('div');
    fallbackEmoji.className = 'fallback-emoji';
    fallbackEmoji.textContent = '🎴';
    parentElement.appendChild(fallbackEmoji);
  }
};
</script>

<style scoped>
.seven-star-layout {
  position: relative;
  width: 100%;
  min-height: 800px;
  padding: 20px;
}

/* 배경 장식 */
.layout-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(ellipse at center, rgba(25, 25, 112, 0.3) 0%, transparent 70%);
}

.star-constellation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  max-width: 900px;
  max-height: 800px;
}

.constellation-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  animation: twinkle 3s ease-in-out infinite;
}

.star-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
}

.star-1 { top: 20%; left: 50%; transform: translate(-50%, -50%); animation-delay: 0s; }
.star-2 { top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 0.5s; }
.star-3 { top: 35%; left: 20%; transform: translate(-50%, -50%); animation-delay: 1s; }
.star-4 { top: 35%; left: 80%; transform: translate(-50%, -50%); animation-delay: 1.5s; }
.star-5 { top: 65%; left: 20%; transform: translate(-50%, -50%); animation-delay: 2s; }
.star-6 { top: 65%; left: 80%; transform: translate(-50%, -50%); animation-delay: 2.5s; }
.star-7 { top: 80%; left: 50%; transform: translate(-50%, -50%); animation-delay: 3s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

/* 반짝이는 별들 */
.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sparkle {
  position: absolute;
  font-size: 12px;
  opacity: 0;
  animation: sparkle 5s linear infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}

/* 카드 컨테이너 */
.cards-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 800px;
  margin: 0 auto;
}

/* 카드 위치 */
.card-position {
  position: absolute;
  width: 120px;
  height: 180px;
  transition: all 0.3s ease;
}

.card-position:hover {
  z-index: 100;
}

/* 각 위치별 좌표 */
.position-1 { /* 과거의 영향 - 상단 */
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.position-2 { /* 현재 상황 - 중앙 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.position-3 { /* 숨겨진 영향 - 왼쪽 위 */
  top: 35%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.position-4 { /* 의식적 욕구 - 오른쪽 위 */
  top: 35%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.position-5 { /* 무의식적 욕구 - 왼쪽 아래 */
  top: 65%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.position-6 { /* 조언 - 오른쪽 아래 */
  top: 65%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.position-7 { /* 최종 결과 - 하단 */
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 위치 라벨 */
.position-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 215, 0, 0.8);
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 8px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-position:hover .position-label,
.card-position.has-card .position-label {
  opacity: 1;
}

/* 카드 슬롯 */
.card-slot {
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-position.has-card .card-slot {
  border-style: solid;
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(255, 215, 0, 0.05);
}

.card-position:hover .card-slot {
  border-color: rgba(255, 215, 0, 0.8);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
}

/* 카드 콘텐츠 */
.card-content {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

/* 카드 뒷면 */
.card-back {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1E3A8A 0%, #312E81 100%);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
}

.card-back-design {
  font-size: 48px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.click-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

/* 카드 앞면 */
.card-front {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.card-front img {
  width: 100%;
  height: 140px;
  object-fit: contain;
  border-radius: 6px;
  background: white;
}

.card-info {
  text-align: center;
  width: 100%;
}

.card-info h4 {
  font-size: 12px;
  margin: 4px 0;
  color: white;
  font-weight: 600;
  line-height: 1.2;
}

.orientation {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
}

.orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 플레이스홀더 */
.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 215, 0, 0.2);
  border-top-color: #FFD700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 진행 표시기 */
.progress-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.progress-indicator p {
  margin-bottom: 10px;
  color: rgba(255, 215, 0, 0.9);
  font-size: 14px;
}

.progress-bar {
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
  transition: width 0.3s ease;
}

/* 이미지 폴백 */
.fallback-emoji {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 140px;
  background: rgba(75, 85, 99, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  border-radius: 6px;
}

/* 카드 플립 애니메이션 */
.card-flip-enter-active,
.card-flip-leave-active {
  transition: all 0.6s;
}

.card-flip-enter-from {
  transform: rotateY(180deg);
  opacity: 0;
}

.card-flip-leave-to {
  transform: rotateY(-180deg);
  opacity: 0;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .seven-star-layout {
    min-height: 600px;
    padding: 10px;
  }

  .cards-container {
    height: 600px;
    transform: scale(0.7);
    transform-origin: top center;
  }

  .card-position {
    width: 100px;
    height: 150px;
  }

  .position-label {
    font-size: 10px;
    top: -20px;
  }

  .card-back-design {
    font-size: 36px;
  }

  .card-info h4 {
    font-size: 11px;
  }

  .orientation {
    font-size: 9px;
  }

  .star-icon {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .cards-container {
    transform: scale(0.6);
  }
}
</style>
