<template>
  <div class="celtic-cross-layout">
    <!-- 배경 장식 -->
    <div class="layout-background">
      <!-- 켈트 노트 문양 -->
      <svg class="celtic-knot" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="celticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#A855F7;stop-opacity:0.3" />
            <stop offset="50%" style="stop-color:#7C3AED;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:0.3" />
          </linearGradient>
        </defs>
        <!-- 중앙 원 -->
        <circle cx="200" cy="200" r="60" fill="none" stroke="url(#celticGradient)" stroke-width="3" opacity="0.6"/>
        <!-- 네 개의 연결된 고리 -->
        <path d="M 200 140 Q 260 140 260 200 T 200 260 Q 140 260 140 200 T 200 140" 
              fill="none" stroke="url(#celticGradient)" stroke-width="2" opacity="0.5"/>
        <path d="M 140 200 Q 140 140 200 140 T 260 200 Q 260 260 200 260 T 140 200" 
              fill="none" stroke="url(#celticGradient)" stroke-width="2" opacity="0.5"/>
        <!-- 외곽 장식 -->
        <path d="M 200 80 L 200 120 M 200 280 L 200 320 M 120 200 L 80 200 M 280 200 L 320 200" 
              stroke="url(#celticGradient)" stroke-width="3" opacity="0.4"/>
      </svg>
      
      <!-- 신비로운 십자가 -->
      <div class="mystic-cross">
        <div class="cross-vertical"></div>
        <div class="cross-horizontal"></div>
        <div class="cross-center"></div>
      </div>
      
      <!-- 빛나는 구체들 -->
      <div class="floating-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
      </div>
      
      <!-- 신비한 안개 효과 -->
      <div class="mystic-fog"></div>
    </div>

    <!-- 카드 배치 영역 -->
    <div class="cards-container" ref="cardsContainer">
      <!-- Position 1: 현재내면 (중앙) -->
      <div 
        class="card-position position-1"
        :class="{ 'has-card': cards[0], 'revealed': cards[0]?.revealed, 'selected': selectedCardIndex === 0 }"
        @click="handleCardClick(0)"
      >
        <div class="position-label">1. 현재내면</div>
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

      <!-- Position 2: 현재외부 (중앙, 위에 겹침) -->
      <div 
        class="card-position position-2"
        :class="{ 'has-card': cards[1], 'revealed': cards[1]?.revealed, 'selected': selectedCardIndex === 1 }"
        @click="handleCardClick(1)"
      >
        <div class="position-label">2. 현재외부</div>
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

      <!-- Position 3: 근본 (아래) -->
      <div 
        class="card-position position-3"
        :class="{ 'has-card': cards[2], 'revealed': cards[2]?.revealed, 'selected': selectedCardIndex === 2 }"
        @click="handleCardClick(2)"
      >
        <div class="position-label">3. 근본</div>
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

      <!-- Position 4: 과거 (왼쪽) -->
      <div 
        class="card-position position-4"
        :class="{ 'has-card': cards[3], 'revealed': cards[3]?.revealed, 'selected': selectedCardIndex === 3 }"
        @click="handleCardClick(3)"
      >
        <div class="position-label">4. 과거</div>
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

      <!-- Position 5: 드러나는 모습 (위) -->
      <div 
        class="card-position position-5"
        :class="{ 'has-card': cards[4], 'revealed': cards[4]?.revealed, 'selected': selectedCardIndex === 4 }"
        @click="handleCardClick(4)"
      >
        <div class="position-label">5. 드러나는 모습</div>
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

      <!-- Position 6: 미래 (오른쪽) -->
      <div 
        class="card-position position-6"
        :class="{ 'has-card': cards[5], 'revealed': cards[5]?.revealed, 'selected': selectedCardIndex === 5 }"
        @click="handleCardClick(5)"
      >
        <div class="position-label">6. 미래</div>
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
      <!-- Position 7: 내가보는나 -->
      <div 
        class="card-position position-7"
        :class="{ 'has-card': cards[6], 'revealed': cards[6]?.revealed, 'selected': selectedCardIndex === 6 }"
        @click="handleCardClick(6)"
      >
        <div class="position-label">7. 내가보는나</div>
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

      <!-- Position 8: 남이보는나 -->
      <div 
        class="card-position position-8"
        :class="{ 'has-card': cards[7], 'revealed': cards[7]?.revealed, 'selected': selectedCardIndex === 7 }"
        @click="handleCardClick(7)"
      >
        <div class="position-label">8. 남이보는나</div>
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

      <!-- Position 9: 예상하는 결과 -->
      <div 
        class="card-position position-9"
        :class="{ 'has-card': cards[8], 'revealed': cards[8]?.revealed, 'selected': selectedCardIndex === 8 }"
        @click="handleCardClick(8)"
      >
        <div class="position-label">9. 예상하는 결과</div>
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

      <!-- Position 10: 실제 결과 -->
      <div 
        class="card-position position-10"
        :class="{ 'has-card': cards[9], 'revealed': cards[9]?.revealed, 'selected': selectedCardIndex === 9 }"
        @click="handleCardClick(9)"
      >
        <div class="position-label">10. 실제 결과</div>
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

    <!-- 버튼 컨테이너 (일괄 뒤집기) -->
    <div class="action-buttons-container" v-if="!isDrawing">
      <button 
        v-if="hasUnrevealedCards"
        class="btn-action btn-reveal-all" 
        @click="revealAllCards"
      >
        <span class="icon">✨</span> 모든 카드 뒤집기
      </button>
      
      <!-- 부모 컴포넌트에서 전달하는 추가 버튼을 위한 슬롯 -->
      <slot name="action-button"></slot>
    </div>

    <!-- 진행 상태 표시 -->
    <div class="progress-indicator" v-if="isDrawing">
      <p>카드를 배치하고 있습니다...</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: drawProgress + '%' }"></div>
      </div>
    </div>

    
    <!-- 해석 결과 섹션 (모든 카드가 공개된 후) -->
    <div v-if="showInterpretation && interpretation && !hasUnrevealedCards" class="interpretation-section">
      <div class="interpretation-container">
        <h3>🔮 켈틱 크로스 해석</h3>
        
        <!-- 긍정적 측면 -->
        <div v-if="interpretation.positiveAspects?.length > 0" class="aspect-section positive">
          <h4>✨ 긍정적 측면</h4>
          <ul>
            <li v-for="(aspect, index) in interpretation.positiveAspects" :key="'positive-' + index">
              {{ aspect }}
            </li>
          </ul>
        </div>
        
        <!-- 부정적 측면 -->
        <div v-if="interpretation.negativeAspects?.length > 0" class="aspect-section negative">
          <h4>⚠️ 주의할 측면</h4>
          <ul>
            <li v-for="(aspect, index) in interpretation.negativeAspects" :key="'negative-' + index">
              {{ aspect }}
            </li>
          </ul>
        </div>
        
        <!-- 조언 -->
        <div v-if="interpretation.advice" class="advice-section">
          <h4>💡 조언</h4>
          <p>{{ interpretation.advice }}</p>
        </div>
        
        <!-- 핵심 테마 -->
        <div v-if="interpretation.keyThemes?.length > 0" class="themes-section">
          <h4>🎯 핵심 테마</h4>
          <div class="theme-tags">
            <span v-for="(theme, index) in interpretation.keyThemes" :key="'theme-' + index" class="theme-tag">
              {{ theme }}
            </span>
          </div>
        </div>
        
        <!-- 원소 균형 -->
        <div v-if="interpretation.elementalBalance" class="elemental-section">
          <h4>🌟 원소의 균형</h4>
          <div class="elemental-grid">
            <div class="element-item fire">
              <span class="element-icon">🔥</span>
              <span class="element-name">불</span>
              <span class="element-count">{{ interpretation.elementalBalance.fire }}</span>
            </div>
            <div class="element-item water">
              <span class="element-icon">💧</span>
              <span class="element-name">물</span>
              <span class="element-count">{{ interpretation.elementalBalance.water }}</span>
            </div>
            <div class="element-item air">
              <span class="element-icon">🌬️</span>
              <span class="element-name">공기</span>
              <span class="element-count">{{ interpretation.elementalBalance.air }}</span>
            </div>
            <div class="element-item earth">
              <span class="element-icon">🌍</span>
              <span class="element-name">땅</span>
              <span class="element-count">{{ interpretation.elementalBalance.earth }}</span>
            </div>
          </div>
          <p class="elemental-analysis">{{ interpretation.elementalBalance.analysis }}</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 포지션 의미 인라인 표시 (프리미엄 사용자용) -->
  <PositionMeaningInline
    v-if="userStore.isPremium"
    :visible="showPositionMeaning"
    :spread-id="'celtic_cross'"
    :position="selectedPosition"
    @close="showPositionMeaning = false; selectedCardIndex = null"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { nativeUtils } from '@/utils/capacitor';
import { useUserStore } from '@/store/user';
import { getUnifiedCardImagePath, handleUnifiedImageError } from '@/utils/unifiedCardImage';
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
  interpretation?: any; // 해석 결과
  showInterpretation?: boolean; // 해석 표시 여부
  topic?: string; // 운세 주제 (love, career, money, general)
}

const props = defineProps<Props>();
const emit = defineEmits(['card-click', 'reveal-all']);

const cardsContainer = ref<HTMLElement>();
const userStore = useUserStore();

// 공개되지 않은 카드가 있는지 확인
const hasUnrevealedCards = computed(() => {
  return props.cards.some(card => card && !card.revealed);
});

// 포지션 의미 표시 관련
const showPositionMeaning = ref(false);
const selectedPosition = ref(0);

// 모든 카드 뒤집기
const revealAllCards = async () => {
  await nativeUtils.buttonTapHaptic();
  emit('reveal-all');
};

// 현재 선택된 카드 인덱스 추가
const selectedCardIndex = ref<number | null>(null);

// 카드 클릭 핸들러
const handleCardClick = async (index: number) => {
  if (props.cards[index]) {
    await nativeUtils.buttonTapHaptic();
    
    // 카드가 아직 공개되지 않은 경우
    if (!props.cards[index].revealed) {
      emit('card-click', index);
    }
    
    // 선택된 카드 표시
    selectedCardIndex.value = index;
    
    // 프리미엄 사용자인 경우 포지션 의미 표시 (뒤집지 않은 카드도 클릭 시 의미 표시)
    if (userStore.isPremium) {
      console.log('[CelticCross] 프리미엄 사용자 카드 클릭:', {
        index,
        currentVisible: showPositionMeaning.value,
        currentPosition: selectedPosition.value,
        isPremium: userStore.isPremium
      });
      
      // 이미 표시 중이고 같은 카드를 다시 클릭하면 숨김
      if (showPositionMeaning.value && selectedPosition.value === index + 1) {
        showPositionMeaning.value = false;
        selectedCardIndex.value = null;
        console.log('[CelticCross] 포지션 의미 숨김');
      } else {
        selectedPosition.value = index + 1;
        showPositionMeaning.value = true;
        console.log('[CelticCross] 포지션 의미 표시:', selectedPosition.value);
      }
    }
  }
};

// 카드 이미지 URL 생성 - 통합 함수 사용
const getCardImageUrl = (card: any) => {
  return getUnifiedCardImagePath(card);
};

// 이미지 에러 핸들러 - 통합 함수 사용
const onImageError = handleUnifiedImageError;
</script>

<style scoped>
.celtic-cross-layout {
  position: relative;
  width: 100%;
  min-height: 700px; /* 전체 높이 감소 */
  padding: 10px 10px 60px 10px; /* 하단 패딩 조정 */
  /* 모바일에서 좌우 드래그 방지 */
  overflow-x: hidden;
  max-width: 100vw;
  /* 터치 스크롤 최적화 */
  -webkit-overflow-scrolling: touch;
  /* 바운스 효과 방지 */
  overscroll-behavior-x: none;
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

/* 켈트 노트 문양 */
.celtic-knot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  animation: rotate-slow 60s linear infinite;
  filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.3));
}

@keyframes rotate-slow {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 신비로운 십자가 */
.mystic-cross {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
}

.cross-vertical,
.cross-horizontal {
  position: absolute;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(168, 85, 247, 0.1) 20%,
    rgba(168, 85, 247, 0.2) 50%,
    rgba(168, 85, 247, 0.1) 80%,
    transparent 100%
  );
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
}

.cross-vertical {
  top: 0;
  left: 50%;
  width: 4px;
  height: 100%;
  transform: translateX(-50%);
  animation: pulse-vertical 4s ease-in-out infinite;
}

.cross-horizontal {
  top: 50%;
  left: 0;
  width: 100%;
  height: 4px;
  transform: translateY(-50%);
  animation: pulse-horizontal 4s ease-in-out infinite 2s;
}

.cross-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(
    circle,
    rgba(168, 85, 247, 0.3) 0%,
    rgba(168, 85, 247, 0.1) 50%,
    transparent 100%
  );
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse-vertical {
  0%, 100% { opacity: 0.3; height: 100%; }
  50% { opacity: 0.8; height: 90%; }
}

@keyframes pulse-horizontal {
  0%, 100% { opacity: 0.3; width: 100%; }
  50% { opacity: 0.8; width: 90%; }
}

/* 빛나는 구체들 */
.floating-orbs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(168, 85, 247, 0.4) 50%,
    transparent 100%
  );
  filter: blur(2px);
}

.orb-1 {
  width: 30px;
  height: 30px;
  top: 20%;
  left: 20%;
  animation: float-orb1 20s ease-in-out infinite;
}

.orb-2 {
  width: 20px;
  height: 20px;
  top: 70%;
  left: 75%;
  animation: float-orb2 25s ease-in-out infinite;
}

.orb-3 {
  width: 25px;
  height: 25px;
  top: 30%;
  left: 80%;
  animation: float-orb3 22s ease-in-out infinite;
}

.orb-4 {
  width: 15px;
  height: 15px;
  top: 75%;
  left: 25%;
  animation: float-orb4 28s ease-in-out infinite;
}

@keyframes float-orb1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  25% { transform: translate(50px, -30px) scale(1.2); opacity: 0.6; }
  50% { transform: translate(-30px, 50px) scale(0.8); opacity: 0.4; }
  75% { transform: translate(30px, 30px) scale(1.1); opacity: 0.5; }
}

@keyframes float-orb2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  33% { transform: translate(-40px, 40px) scale(1.3); opacity: 0.7; }
  66% { transform: translate(40px, -40px) scale(0.9); opacity: 0.3; }
}

@keyframes float-orb3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50% { transform: translate(-60px, -30px) scale(1.4); opacity: 0.8; }
}

@keyframes float-orb4 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
  20% { transform: translate(30px, 50px) scale(1.2); opacity: 0.5; }
  40% { transform: translate(-50px, -30px) scale(0.8); opacity: 0.6; }
  60% { transform: translate(40px, -40px) scale(1.1); opacity: 0.4; }
  80% { transform: translate(-30px, 30px) scale(0.9); opacity: 0.3; }
}

/* 신비한 안개 효과 */
.mystic-fog {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    rgba(168, 85, 247, 0.05) 40%,
    rgba(168, 85, 247, 0.1) 60%,
    transparent 100%
  );
  animation: breathe 8s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
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
  height: 600px; /* 높이 감소 */
  margin: 0 auto;
  transform: scale(0.75); /* 스케일 조정 */
  transform-origin: top center;
}

/* 카드 위치 */
.card-position {
  position: absolute;
  width: 120px;
  height: 180px;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 중앙 카드 그룹 강조 */

.card-position:hover {
  z-index: 100;
}

/* 선택된 카드 강조 효과 */
.card-position.selected {
  z-index: 101;
}

.card-position.selected .card-slot {
  border-color: #A855F7;
  border-width: 3px;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
}

/* 각 위치별 좌표 */
.position-1 { /* 현재상황 - 중앙 왼쪽 */
  top: 55%; /* 60% -> 80% 추가로 20% 아래로 이동 */
  left: calc(40% - 60px);
  transform: translate(-80%, 75%);
  z-index: 10;
}

.position-2 { /* 도전/십자가 - 중앙 오른쪽 */
  top: 51%; /* 56% -> 76% 추가로 20% 아래로 이동 */
  left: calc(40% + 60px);
  transform: translate(-105%, 50%);
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

.position-3 { /* 근본 - 아래 */
  top: 98%;
  left: 40%;
  transform: translate(-90%, 115%);
}

.position-4 { /* 과거 - 왼쪽 */
  top: 53%;
  left: -5%;
  transform: translate(-140%, 65%);
}

.position-5 { /* 드러나는 모습 - 위 */
  top: 21%;
  left: 40%;
  transform: translate(-90%, 35%);
}

.position-6 { /* 미래 - 오른쪽 */
  top: 53%;
  left: 85%;
  transform: translate(-40%, 65%);
}

/* 오른쪽 기둥 */
.position-7 { /* 내가보는나 - 맨 아래 */
  top: 85%;
  left: 95%;
  transform: translate(0%, 175%);
}

.position-8 { /* 남이보는나 */
  top: 62%;
  left: 95%;
  transform: translate(30%, 110%);
}

.position-9 { /* 예상하는 결과 */
  top: 38%;
  left: 95%;
  transform: translate(0%, 50%);
}

.position-10 { /* 실제 결과 - 맨 위 */
  top: 15%;
  left: 95%;
  transform: translate(30%, -15%);
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
  left: calc(40% - 20px);
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
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
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.6);
  border-width: 2.5px;
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
  bottom: 10px;
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
    min-height: 600px; /* 모바일 높이 조정 */
    padding: 5px 5px 50px 5px;
  }

  .cards-container {
    height: 520px;
    transform: scale(0.58); /* 비율 유지하며 조정 */
    transform-origin: top center;
  }

  /* 배경 요소 크기 조정 */
  .celtic-knot {
    width: 300px;
    height: 300px;
  }
  
  .mystic-cross {
    width: 400px;
    height: 400px;
  }
  
  .orb-1, .orb-2, .orb-3, .orb-4 {
    display: none; /* 모바일에서는 성능을 위해 숨김 */
  }
  
  /* 모바일에서 중앙 카드 위치 조정 */
  .position-1,
  .position-2 {
    left: calc(40% - 20px);
  }
  
  /* 모바일에서 상하좌우 카드 위치 조정 */
  .position-3 {
    top: 82%;
  }
  
  .position-4 {
    left: 8%;
  }
  
  .position-5 {
    top: 18%;
  }
  
  .position-6 {
    left: 65%;
  }
  
  /* 모바일에서 오른쪽 기둥 조정 */
  .position-7 {
    top: 80%;
    right: 2px;
  }
  
  .position-8 {
    top: 60%;
    right: 2px;
  }
  
  .position-9 {
    top: 40%;
    right: 2px;
  }
  
  .position-10 {
    top: 20%;
    right: 2px;
  }
  
  .cards-container::before {
    width: 160px;
    height: 160px;
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


}

@media (max-width: 480px) {
  .celtic-cross-layout {
    min-height: 550px;
  }
  
  .cards-container {
    height: 480px;
    transform: scale(0.5); /* 더 작은 화면에서 더 축소 */
  }
  
  /* 작은 화면에서 배경 요소 더 축소 */
  .celtic-knot {
    width: 250px;
    height: 250px;
  }
  
  .mystic-cross {
    width: 350px;
    height: 350px;
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
    top: 85%;
  }
  
  .position-4 {
    left: 10%;
  }
  
  .position-5 {
    top: 15%;
  }
  
  .position-6 {
    left: 70%;
  }
  
  /* 더 작은 화면에서 오른쪽 기둥 조정 */
  .position-7,
  .position-8,
  .position-9,
  .position-10 {
    right: 0;
  }
  
  .cards-container::before {
    width: 140px;
    height: 140px;
  }
}

/* 액션 버튼 컨테이너 */
.action-buttons-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 300px;
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
    bottom: 5px;
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

/* 해석 결과 섹션 */
.interpretation-section {
  margin-top: 80px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  /* 모바일에서 너비 제한 */
  max-width: calc(100vw - 20px);
  margin-left: auto;
  margin-right: auto;
}

.interpretation-section::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.interpretation-container {
  position: relative;
  z-index: 1;
}

.interpretation-container h3 {
  text-align: center;
  color: #A855F7;
  font-size: 28px;
  margin-bottom: 30px;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}

.aspect-section,
.advice-section,
.themes-section,
.elemental-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.aspect-section:hover,
.advice-section:hover,
.themes-section:hover,
.elemental-section:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.3);
}

.aspect-section.positive {
  border-left: 3px solid #22C55E;
}

.aspect-section.negative {
  border-left: 3px solid #EF4444;
}

.aspect-section h4,
.advice-section h4,
.themes-section h4,
.elemental-section h4 {
  font-size: 18px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.aspect-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aspect-section li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding-left: 25px;
  color: rgba(255, 255, 255, 0.9);
}

.aspect-section li:last-child {
  border-bottom: none;
}

.aspect-section li::before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #A855F7;
}

.advice-section p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-size: 16px;
}

.theme-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.theme-tag {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%);
  border: 1px solid rgba(168, 85, 247, 0.5);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.theme-tag:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(236, 72, 153, 0.5) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

.elemental-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.element-item {
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.element-item:hover {
  transform: translateY(-5px);
}

.element-item.fire {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.element-item.water {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.element-item.air {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.element-item.earth {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.element-icon {
  display: block;
  font-size: 32px;
  margin-bottom: 8px;
}

.element-name {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.element-count {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.elemental-analysis {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  font-size: 14px;
  padding: 10px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 8px;
}

@media (max-width: 768px) {
  .interpretation-section {
    margin-top: 60px;
    padding: 15px;
  }
  
  .interpretation-container h3 {
    font-size: 24px;
  }
  
  .elemental-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .element-icon {
    font-size: 24px;
  }
  
  .element-count {
    font-size: 20px;
  }
}

/* AI 해석 버튼 스타일 */
.btn-ai-interpretation {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.btn-ai-interpretation:hover:not(:disabled) {
  background: linear-gradient(135deg, #9333EA 0%, #6D28D9 100%);
}

.btn-ai-interpretation.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.loading-spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* AI 해석 결과 섹션 */
.ai-interpretation-section {
  margin-top: 80px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.5s ease-out;
  /* 모바일에서 너비 제한 */
  max-width: calc(100vw - 20px);
  margin-left: auto;
  margin-right: auto;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-interpretation-section::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.ai-interpretation-container {
  position: relative;
  z-index: 1;
}

.ai-interpretation-container h3 {
  text-align: center;
  color: #A855F7;
  font-size: 28px;
  margin-bottom: 25px;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.ai-interpretation-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.ai-interpretation-content p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .ai-interpretation-section {
    margin-top: 60px;
    padding: 15px;
  }
  
  .ai-interpretation-container h3 {
    font-size: 24px;
  }
  
  .ai-interpretation-content {
    padding: 20px;
  }
  
  .ai-interpretation-content p {
    font-size: 15px;
  }
}

/* 평점 시스템 스타일 */
.rating-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.rating-section h4 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  font-weight: 500;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: grayscale(100%) opacity(0.5);
  padding: 5px;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.active {
  filter: grayscale(0%) opacity(1);
  transform: scale(1.1);
  animation: starPulse 0.3s ease;
}

@keyframes starPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

.rating-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  height: 20px;
  transition: all 0.2s ease;
}

.rating-submitted {
  margin-top: 25px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 12px;
  text-align: center;
  animation: slideInUp 0.5s ease-out;
}

.rating-submitted p {
  color: #22C55E;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .star-btn {
    font-size: 28px;
  }
  
  .rating-hint {
    font-size: 13px;
  }
}
</style>
