<template>
  <div class="celtic-cross-layout">
    <!-- 배경 장식 -->
    <div class="layout-background">
      <div class="mystic-circle"></div>
      <div class="cross-lines"></div>
    </div>

    <!-- 카드 배치 영역 -->
    <div class="cards-container" ref="cardsContainer">
      <!-- Position 1: 현재 상황 (중앙) -->
      <div 
        class="card-position position-1"
        :class="{ 'has-card': cards[0], 'revealed': cards[0]?.revealed }"
        @click="handleCardClick(0)"
      >
        <div class="position-label">1. 현재 상황</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[0]" class="card-content">
              <div v-if="!cards[0].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- Position 2: 도전/십자가 (중앙, 위에 겹침) -->
      <div 
        class="card-position position-2"
        :class="{ 'has-card': cards[1], 'revealed': cards[1]?.revealed }"
        @click="handleCardClick(1)"
      >
        <div class="position-label">2. 도전/십자가</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[1]" class="card-content">
              <div v-if="!cards[1].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- Position 3: 먼 과거 (위) -->
      <div 
        class="card-position position-3"
        :class="{ 'has-card': cards[2], 'revealed': cards[2]?.revealed }"
        @click="handleCardClick(2)"
      >
        <div class="position-label">3. 먼 과거</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[2]" class="card-content">
              <div v-if="!cards[2].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- Position 4: 가까운 과거 (왼쪽) -->
      <div 
        class="card-position position-4"
        :class="{ 'has-card': cards[3], 'revealed': cards[3]?.revealed }"
        @click="handleCardClick(3)"
      >
        <div class="position-label">4. 가까운 과거</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[3]" class="card-content">
              <div v-if="!cards[3].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- Position 5: 가능한 미래 (오른쪽) -->
      <div 
        class="card-position position-5"
        :class="{ 'has-card': cards[4], 'revealed': cards[4]?.revealed }"
        @click="handleCardClick(4)"
      >
        <div class="position-label">5. 가능한 미래</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[4]" class="card-content">
              <div v-if="!cards[4].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- Position 6: 가까운 미래 (아래) -->
      <div 
        class="card-position position-6"
        :class="{ 'has-card': cards[5], 'revealed': cards[5]?.revealed }"
        @click="handleCardClick(5)"
      >
        <div class="position-label">6. 가까운 미래</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[5]" class="card-content">
              <div v-if="!cards[5].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- 오른쪽 기둥 (7-10번) -->
      <!-- Position 7: 당신의 접근 -->
      <div 
        class="card-position position-7"
        :class="{ 'has-card': cards[6], 'revealed': cards[6]?.revealed }"
        @click="handleCardClick(6)"
      >
        <div class="position-label">7. 당신의 접근</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[6]" class="card-content">
              <div v-if="!cards[6].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
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

      <!-- Position 8: 외부 영향 -->
      <div 
        class="card-position position-8"
        :class="{ 'has-card': cards[7], 'revealed': cards[7]?.revealed }"
        @click="handleCardClick(7)"
      >
        <div class="position-label">8. 외부 영향</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[7]" class="card-content">
              <div v-if="!cards[7].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[7].card)" 
                  :alt="cards[7].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[7].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[7].orientation">
                    {{ cards[7].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[7] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 9: 희망과 두려움 -->
      <div 
        class="card-position position-9"
        :class="{ 'has-card': cards[8], 'revealed': cards[8]?.revealed }"
        @click="handleCardClick(8)"
      >
        <div class="position-label">9. 희망과 두려움</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[8]" class="card-content">
              <div v-if="!cards[8].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[8].card)" 
                  :alt="cards[8].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[8].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[8].orientation">
                    {{ cards[8].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[8] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      <!-- Position 10: 최종 결과 -->
      <div 
        class="card-position position-10"
        :class="{ 'has-card': cards[9], 'revealed': cards[9]?.revealed }"
        @click="handleCardClick(9)"
      >
        <div class="position-label">10. 최종 결과</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[9]" class="card-content">
              <div v-if="!cards[9].revealed" class="card-back">
                <div class="card-back-design">🃏</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[9].card)" 
                  :alt="cards[9].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[9].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[9].orientation">
                    {{ cards[9].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[9] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 진행 상태 표시 -->
    <div class="progress-indicator" v-if="isDrawing">
      <p>카드를 배치하고 있습니다...</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: drawProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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

// 카드 클릭 핸들러
const handleCardClick = async (index: number) => {
  if (props.cards[index] && !props.cards[index].revealed) {
    await nativeUtils.buttonTapHaptic();
    emit('card-click', index);
  }
};

// 카드 이미지 URL 생성
const getCardImageUrl = (card: any) => {
  try {
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
            1: 'ace',
            2: 'two', 3: 'three', 4: 'four', 5: 'five',
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
    
    // 메이저 아르카나의 경우
    if (card.arcana === 'major') {
      const majorCardNames = {
        0: '00-the-Fool.png',
        1: '01-The-Magician.png',
        2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png',
        4: '04-The-Emperor.png',
        5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png',
        7: '07-The-Chariot.png',
        8: '08-Strength.png',
        9: '09-The-Hermit.png',
        10: '10-Wheel-of-Fortune.png',
        11: '11-Justice.png',
        12: '12-The-Hanged-Man.png',
        13: '13-Death.png',
        14: '14-Temperance.png',
        15: '15-The-Devil.png',
        16: '16-The-Tower.png',
        17: '17-The-Star.png',
        18: '18-The-Moon.png',
        19: '19-The-Sun.png',
        20: '20-Judgement.png',
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
.celtic-cross-layout {
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
}

.mystic-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  height: 900px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(168, 85, 247, 0.1) 0%,
    rgba(168, 85, 247, 0.05) 40%,
    transparent 70%
  );
  animation: pulse 8s ease-in-out infinite;
}

.cross-lines {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: 
    linear-gradient(to right, rgba(168, 85, 247, 0.1) 49%, transparent 49%, transparent 51%, rgba(168, 85, 247, 0.1) 51%),
    linear-gradient(to bottom, rgba(168, 85, 247, 0.1) 49%, transparent 49%, transparent 51%, rgba(168, 85, 247, 0.1) 51%);
  background-size: 100% 2px, 2px 100%;
  background-position: center;
  background-repeat: no-repeat;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
}

/* 카드 컨테이너 */
.cards-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
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

/* 중앙 카드 그룹 강조 */

.card-position:hover {
  z-index: 100;
}

/* 각 위치별 좌표 */
.position-1 { /* 현재상황 - 중앙 왼쪽 */
  top: 55%;
  left: calc(40% - 60px);
  transform: translate(-80%, -15%);
  z-index: 10;
}

.position-2 { /* 도전/십자가 - 중앙 오른쪽 */
  top: 51%;
  left: calc(40% + 60px);
  transform: translate(-105%, -35%);
  z-index: 10;
}

/* 중앙 두 카드를 위한 특별 스타일 */
.position-1 .card-slot,
.position-2 .card-slot {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.position-1.has-card .card-slot,
.position-2.has-card .card-slot {
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.6);
}

/* 중앙 카드 위치 라벨 특별 처리 */
.position-1 .position-label,
.position-2 .position-label {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
}

.position-3 { /* 먼 과거 - 위 */
  top: 21%;
  left: 40%;
  transform: translate(-90%, -10%);
}

.position-4 { /* 가까운 과거 - 왼쪽 */
  top: 53%;
  left: -5%;
  transform: translate(-140%, -25%);
}

.position-5 { /* 가능한 미래 - 오른쪽 */
  top: 53%;
  left: 85%;
  transform: translate(-40%, -25%);
}

.position-6 { /* 가까운 미래 - 아래 */
  top: 98%;
  left: 40%;
  transform: translate(-90%, -20%);
}

/* 오른쪽 기둥 */
.position-7 { /* 당신의 접근 - 맨 아래 */
  top: 85%;
  left: 95%;
  transform: translate(0%, 15%);
}

.position-8 { /* 외부 영향 */
  top: 62%;
  left: 95%;
  transform: translate(20%, -15%);
}

.position-9 { /* 희망과 두려움 */
  top: 38%;
  left: 95%;
  transform: translate(0%, -25%);
}

.position-10 { /* 최종 결과 - 맨 위 */
  top: 15%;
  left: 95%;
  transform: translate(20%, -50%);
}

/* 위치 라벨 */
.position-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
  border: 2px dashed rgba(168, 85, 247, 0.3);
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

/* Position 2를 위한 특별 스타일 - 제거 (동일한 스타일 사용) */

/* 중앙 두 카드를 감싸는 시각적 그룹 */
.cards-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 350px;
  border: 2px dashed rgba(168, 85, 247, 0.2);
  border-radius: 20px;
  pointer-events: none;
  z-index: 1;
}

.card-position.has-card .card-slot {
  border-style: solid;
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(168, 85, 247, 0.1);
}

.card-position:hover .card-slot {
  border-color: rgba(168, 85, 247, 0.8);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
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
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
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
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
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
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top-color: #A855F7;
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
  color: rgba(255, 255, 255, 0.9);
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
  background: linear-gradient(90deg, #A855F7 0%, #7C3AED 100%);
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
  .celtic-cross-layout {
    min-height: 600px;
    padding: 10px;
  }

  .cards-container {
    height: 600px;
    transform: scale(0.7);
    transform-origin: top center;
  }

  /* 모바일에서 중앙 카드 위치 조정 */
  .position-1 {
    left: calc(40% - 80px);
  }
  
  .position-2 {
    left: calc(40% + 80px);
  }
  
  /* 모바일에서 상하좌우 카드 위치 조정 */
  .position-3 {
    top: 10%;
  }
  
  .position-4 {
    left: 5%;
  }
  
  .position-5 {
    left: 75%;
  }
  
  .position-6 {
    top: 90%;
  }
  
  /* 모바일에서 오른쪽 기둥 조정 */
  .position-7 {
    top: 88%;
    left: 93%;
  }
  
  .position-8 {
    top: 64%;
    left: 93%;
  }
  
  .position-9 {
    top: 36%;
    left: 93%;
  }
  
  .position-10 {
    top: 12%;
    left: 93%;
  }
  
  .cards-container::before {
    width: 350px;
    height: 250px;
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

  .mystic-circle {
    width: 450px;
    height: 450px;
  }

  .cross-lines {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .cards-container {
    transform: scale(0.6);
  }

  /* 더 작은 화면에서 카드 위치 더 조정 */
  .position-1 {
    left: calc(40% - 60px);
  }
  
  .position-2 {
    left: calc(40% + 60px);
  }
  
  /* 더 작은 화면에서 상하좌우 카드 위치 조정 */
  .position-3 {
    top: 15%;
  }
  
  .position-4 {
    left: 10%;
  }
  
  .position-5 {
    left: 70%;
  }
  
  .position-6 {
    top: 85%;
  }
  
  /* 더 작은 화면에서 오른쪽 기둥 조정 */
  .position-7 {
    top: 88%;
    left: 92%;
  }
  
  .position-8 {
    top: 64%;
    left: 92%;
  }
  
  .position-9 {
    top: 36%;
    left: 92%;
  }
  
  .position-10 {
    top: 12%;
    left: 92%;
  }
  
  .cards-container::before {
    width: 280px;
    height: 200px;
  }
}
</style>
