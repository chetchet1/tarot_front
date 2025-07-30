<template>
  <div class="cup-of-relationship-layout">
    <!-- 배경 장식 -->
    <div class="layout-background">
      <!-- 컵 모양 배경 -->
      <div class="cup-shape">
        <svg viewBox="0 0 200 200" preserveAspectRatio="none">
          <!-- 컵 모양 -->
          <path d="M50 30 Q50 10, 70 10 L130 10 Q150 10, 150 30 L140 120 Q140 140, 120 150 L80 150 Q60 140, 60 120 Z" 
                fill="none" 
                stroke="rgba(236, 72, 153, 0.3)" 
                stroke-width="2"/>
          <!-- 하트 장식 -->
          <path d="M100 60 C100 50, 85 40, 75 50 C65 40, 50 50, 50 60 C50 80, 100 110, 100 110 C100 110, 150 80, 150 60 C150 50, 135 40, 125 50 C115 40, 100 50, 100 60 Z" 
                fill="rgba(236, 72, 153, 0.2)" 
                stroke="rgba(236, 72, 153, 0.4)" 
                stroke-width="1"/>
        </svg>
      </div>
      
      <!-- 떠다니는 하트들 -->
      <div class="floating-hearts">
        <div class="heart" v-for="i in 15" :key="i" :style="getHeartStyle(i)">💕</div>
      </div>
      
      <!-- 물결 효과 -->
      <div class="ripples">
        <div class="ripple" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 2}s` }"></div>
      </div>
    </div>

    <!-- 카드 배치 영역 -->
    <div class="cards-container" ref="cardsContainer">
      <!-- Position 1: 나 (왼쪽 아래) -->
      <div 
        class="card-position position-1"
        :class="{ 'has-card': cards[0], 'revealed': cards[0]?.revealed }"
        @click="handleCardClick(0)"
      >
        <div class="position-label">1. 나</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[0]" class="card-content">
              <div v-if="!cards[0].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 2: 상대 (오른쪽 아래) -->
      <div 
        class="card-position position-2"
        :class="{ 'has-card': cards[1], 'revealed': cards[1]?.revealed }"
        @click="handleCardClick(1)"
      >
        <div class="position-label">2. 상대</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[1]" class="card-content">
              <div v-if="!cards[1].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 3: 관계 기본 (하단 중앙) -->
      <div 
        class="card-position position-3"
        :class="{ 'has-card': cards[2], 'revealed': cards[2]?.revealed }"
        @click="handleCardClick(2)"
      >
        <div class="position-label">3. 관계 기본</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[2]" class="card-content">
              <div v-if="!cards[2].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 4: 관계 과거 (왼쪽 중간) -->
      <div 
        class="card-position position-4"
        :class="{ 'has-card': cards[3], 'revealed': cards[3]?.revealed }"
        @click="handleCardClick(3)"
      >
        <div class="position-label">4. 관계 과거</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[3]" class="card-content">
              <div v-if="!cards[3].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 5: 현재 느 상태 (중앙) -->
      <div 
        class="card-position position-5"
        :class="{ 'has-card': cards[4], 'revealed': cards[4]?.revealed }"
        @click="handleCardClick(4)"
      >
        <div class="position-label">5. 현재 느 상태</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[4]" class="card-content">
              <div v-if="!cards[4].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 6: 현재 외부 상황 (오른쪽 중간) -->
      <div 
        class="card-position position-6"
        :class="{ 'has-card': cards[5], 'revealed': cards[5]?.revealed }"
        @click="handleCardClick(5)"
      >
        <div class="position-label">6. 현재 외부 상황</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[5]" class="card-content">
              <div v-if="!cards[5].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 7: 현재 나는 어떻게 생각? (왼쪽) -->
      <div 
        class="card-position position-7"
        :class="{ 'has-card': cards[6], 'revealed': cards[6]?.revealed }"
        @click="handleCardClick(6)"
      >
        <div class="position-label">7. 현재 나는 어떻게 생각?</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[6]" class="card-content">
              <div v-if="!cards[6].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 8: 현재 상대는 어떻게 생각? (오른쪽) -->
      <div 
        class="card-position position-8"
        :class="{ 'has-card': cards[7], 'revealed': cards[7]?.revealed }"
        @click="handleCardClick(7)"
      >
        <div class="position-label">8. 현재 상대는 어떻게 생각?</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[7]" class="card-content">
              <div v-if="!cards[7].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 9: 미래 나는 어떻게 생각? (왼쪽 상단) -->
      <div 
        class="card-position position-9"
        :class="{ 'has-card': cards[8], 'revealed': cards[8]?.revealed }"
        @click="handleCardClick(8)"
      >
        <div class="position-label">9. 미래 나는 어떻게 생각?</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[8]" class="card-content">
              <div v-if="!cards[8].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 10: 미래 상대는 어떻게 생각? (오른쪽 상단) -->
      <div 
        class="card-position position-10"
        :class="{ 'has-card': cards[9], 'revealed': cards[9]?.revealed }"
        @click="handleCardClick(9)"
      >
        <div class="position-label">10. 미래 상대는 어떻게 생각?</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[9]" class="card-content">
              <div v-if="!cards[9].revealed" class="card-back">
                <div class="card-back-design">💝</div>
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

      <!-- Position 11: 결과 (상단 중앙) -->
      <div 
        class="card-position position-11"
        :class="{ 'has-card': cards[10], 'revealed': cards[10]?.revealed }"
        @click="handleCardClick(10)"
      >
        <div class="position-label">11. 결과</div>
        <div class="card-slot">
          <transition name="card-flip">
            <div v-if="cards[10]" class="card-content">
              <div v-if="!cards[10].revealed" class="card-back">
                <div class="card-back-design">💝</div>
                <p class="click-hint">클릭하여 공개</p>
              </div>
              <div v-else class="card-front">
                <img 
                  :src="getCardImageUrl(cards[10].card)" 
                  :alt="cards[10].card.nameKr"
                  @error="onImageError"
                />
                <div class="card-info">
                  <h4>{{ cards[10].card.nameKr }}</h4>
                  <span class="orientation" :class="cards[10].orientation">
                    {{ cards[10].orientation === 'upright' ? '정방향' : '역방향' }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
          <div v-if="!cards[10] && isDrawing" class="card-placeholder">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 버튼 컨테이너 (일괄 뒤집기 + 슬롯) -->
    <div class="action-buttons-container" v-if="!isDrawing">
      <button 
        v-if="hasUnrevealedCards"
        class="btn-action btn-reveal-all" 
        @click="revealAllCards"
      >
        <span class="icon">✨</span> 모든 카드 뒤집기
      </button>
      <div v-else class="button-placeholder"></div>
      
      <!-- 부모 컴포넌트에서 전달하는 추가 버튼을 위한 슬롯 -->
      <slot name="action-button"></slot>
    </div>

    <!-- 진행 상태 표시 -->
    <div class="progress-indicator" v-if="isDrawing">
      <p>사랑의 에너지가 카드를 통해 흐르고 있습니다...</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: drawProgress + '%' }"></div>
      </div>
    </div>
  </div>
  
  <!-- 포지션 의미 인라인 표시 (프리미엄 사용자용) -->
  <PositionMeaningInline
    v-if="userStore.isPremium"
    :visible="showPositionMeaning"
    :spread-id="'cup_of_relationship'"
    :position="selectedPosition"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { nativeUtils } from '@/utils/capacitor';
import { useUserStore } from '@/store/user';
import PositionMeaningInline from '@/components/PositionMeaningInline.vue';

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
const emit = defineEmits(['card-click', 'reveal-all']);
const userStore = useUserStore();

// 공개되지 않은 카드가 있는지 확인
const hasUnrevealedCards = computed(() => {
  return props.cards.some(card => card && !card.revealed);
});

// 포지션 의미 표시 관련
const showPositionMeaning = ref(false);
const selectedPosition = ref(0);

const cardsContainer = ref<HTMLElement>();

// 떠다니는 하트 스타일 생성
const getHeartStyle = (index: number) => {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const delay = Math.random() * 10;
  const duration = 10 + Math.random() * 10;
  const size = 0.5 + Math.random() * 1;
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    fontSize: `${size}em`
  };
};

// 모든 카드 뒤집기
const revealAllCards = async () => {
  await nativeUtils.buttonTapHaptic();
  emit('reveal-all');
};

// 카드 클릭 핸들러
const handleCardClick = async (index: number) => {
  if (props.cards[index] && !props.cards[index].revealed) {
    await nativeUtils.buttonTapHaptic();
    emit('card-click', index);
    
    // 프리미엄 사용자인 경우 카드 공개 후 포지션 의미 표시
    if (userStore.isPremium) {
      selectedPosition.value = index + 1;
      showPositionMeaning.value = true;
    }
  }
};

// 카드 이미지 URL 생성 (다른 레이아웃과 동일)
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
.cup-of-relationship-layout {
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
  background: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
}

.cup-shape {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  max-width: 400px;
  opacity: 0.5;
}

.cup-shape svg {
  width: 100%;
  height: auto;
}

/* 떠다니는 하트들 */
.floating-hearts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.heart {
  position: absolute;
  opacity: 0;
  animation: floatHeart 15s linear infinite;
}

@keyframes floatHeart {
  0% {
    opacity: 0;
    transform: translateY(100vh) rotate(0deg);
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) rotate(360deg);
  }
}

/* 물결 효과 */
.ripples {
  position: absolute;
  top: 85%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 100px;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 30px;
  border: 2px solid rgba(236, 72, 153, 0.3);
  border-radius: 50%;
  opacity: 0;
  animation: rippleEffect 6s infinite;
}

@keyframes rippleEffect {
  0% {
    width: 100px;
    height: 30px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 90px;
    opacity: 0;
  }
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

/* 각 위치별 좌표 - 이미지에 맞게 수정 */
.position-1 { /* 나 - 왼쪽 아래 */
  top: 80%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.position-2 { /* 상대 - 오른쪽 아래 */
  top: 80%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.position-3 { /* 관계 기본 - 하단 중앙 */
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.position-4 { /* 관계 과거 - 왼쪽 중간 */
  top: 60%;
  left: 35%;
  transform: translate(-50%, -50%);
}

.position-5 { /* 현재 느 상태 - 중앙 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.position-6 { /* 현재 외부 상황 - 오른쪽 중간 */
  top: 60%;
  left: 65%;
  transform: translate(-50%, -50%);
}

.position-7 { /* 현재 나는 어떻게 생각? - 왼쫍먼저 나란 */
  top: 40%;
  left: 25%;
  transform: translate(-50%, -50%);
}

.position-8 { /* 현재 상대는 어떻게 생각? - 오른쫍먼저 나란 */
  top: 40%;
  left: 75%;
  transform: translate(-50%, -50%);
}

.position-9 { /* 미래 나는 어떻게 생각? - 왼쫍먼저세번째 */
  top: 20%;
  left: 35%;
  transform: translate(-50%, -50%);
}

.position-10 { /* 미래 상대는 어떻게 생각? - 오른쫍세번째 */
  top: 20%;
  left: 65%;
  transform: translate(-50%, -50%);
}

.position-11 { /* 결과 - 상단 중앙 */
  top: 5%;
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
  color: rgba(236, 72, 153, 0.9);
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
  border: 2px dashed rgba(236, 72, 153, 0.3);
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
  border-color: rgba(236, 72, 153, 0.5);
  background: rgba(236, 72, 153, 0.05);
}

.card-position:hover .card-slot {
  border-color: rgba(236, 72, 153, 0.8);
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
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
  background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
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
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.click-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
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
  border: 3px solid rgba(236, 72, 153, 0.2);
  border-top-color: #EC4899;
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
  color: rgba(236, 72, 153, 0.9);
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
  background: linear-gradient(90deg, #EC4899 0%, #BE185D 100%);
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
  .cup-of-relationship-layout {
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

  .heart {
    font-size: 0.8em;
  }
}

@media (max-width: 480px) {
  .cards-container {
    transform: scale(0.6);
  }
}

/* 액션 버튼 컨테이너 */
.action-buttons-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
}

.button-placeholder {
  width: 180px;
  height: 48px;
}

.btn-action {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  min-width: 180px;
  justify-content: center;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

.btn-action .icon {
  font-size: 20px;
}

@media (max-width: 768px) {
  .action-buttons-container {
    bottom: 10px;
    gap: 10px;
    max-width: 100%;
    padding: 0 10px;
  }
  
  .btn-action {
    font-size: 14px;
    padding: 10px 16px;
    min-width: 140px;
  }
  
  .button-placeholder {
    width: 140px;
    height: 40px;
  }
}
</style>
