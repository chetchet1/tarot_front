<template>
  <div class="spread-layout" :class="spreadClass">
    <!-- 켈틱 크로스 레이아웃 -->
    <div v-if="spreadId === 'celtic_cross'" class="celtic-cross-layout">
      <div 
        v-for="(card, index) in cards.slice(0, 10)" 
        :key="index"
        :class="`card-position position-${index + 1}`"
      >
        <div class="card-wrapper">
          <img 
            :src="getUnifiedCardImagePath(card)" 
            :alt="getCardName(card)"
            class="card-image"
            :class="{ reversed: isCardReversed(card) }"
            @error="handleUnifiedImageError"
          />
          <div class="card-info">
            <div class="position-label">{{ getPositionName(index) }}</div>
            <div class="card-name">{{ getCardName(card) }}</div>
            <div class="card-orientation" :class="{ reversed: isCardReversed(card) }">
              {{ isCardReversed(card) ? '역방향' : '정방향' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 세븐 스타 레이아웃 -->
    <div v-else-if="spreadId === 'seven_star'" class="seven-star-layout">
      <div 
        v-for="(card, index) in cards.slice(0, 7)" 
        :key="index"
        :class="`card-position star-position-${index + 1}`"
      >
        <div class="card-wrapper">
          <img 
            :src="getUnifiedCardImagePath(card)" 
            :alt="getCardName(card)"
            class="card-image"
            :class="{ reversed: isCardReversed(card) }"
            @error="handleUnifiedImageError"
          />
          <div class="card-info">
            <div class="position-label">{{ getPositionName(index) }}</div>
            <div class="card-name">{{ getCardName(card) }}</div>
            <div class="card-orientation" :class="{ reversed: isCardReversed(card) }">
              {{ isCardReversed(card) ? '역방향' : '정방향' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 컵 오브 릴레이션십 레이아웃 -->
    <div v-else-if="spreadId === 'cup_of_relationship'" class="cup-relationship-layout">
      <div 
        v-for="(card, index) in cards.slice(0, 11)" 
        :key="index"
        :class="`card-position cup-position-${index + 1}`"
      >
        <div class="card-wrapper">
          <img 
            :src="getUnifiedCardImagePath(card)" 
            :alt="getCardName(card)"
            class="card-image"
            :class="{ reversed: isCardReversed(card) }"
            @error="handleUnifiedImageError"
          />
          <div class="card-info">
            <div class="position-label">{{ getPositionName(index) }}</div>
            <div class="card-name">{{ getCardName(card) }}</div>
            <div class="card-orientation" :class="{ reversed: isCardReversed(card) }">
              {{ isCardReversed(card) ? '역방향' : '정방향' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 3장 타임라인 레이아웃 -->
    <div v-else-if="spreadId === 'three_card_timeline'" class="timeline-layout">
      <div 
        v-for="(card, index) in cards.slice(0, 3)" 
        :key="index"
        :class="`card-position timeline-position-${index + 1}`"
      >
        <div class="card-wrapper">
          <img 
            :src="getUnifiedCardImagePath(card)" 
            :alt="getCardName(card)"
            class="card-image"
            :class="{ reversed: isCardReversed(card) }"
            @error="handleUnifiedImageError"
          />
          <div class="card-info">
            <div class="position-label">{{ getPositionName(index) }}</div>
            <div class="card-name">{{ getCardName(card) }}</div>
            <div class="card-orientation" :class="{ reversed: isCardReversed(card) }">
              {{ isCardReversed(card) ? '역방향' : '정방향' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 1장 레이아웃 -->
    <div v-else-if="(spreadId === 'one_card' || spreadType === 'daily_card') && cards && cards.length > 0" class="single-layout">
      <div class="card-position single-position">
        <div class="card-wrapper">
          <img 
            :src="getUnifiedCardImagePath(cards[0])" 
            :alt="getCardName(cards[0])"
            class="card-image"
            :class="{ reversed: isCardReversed(cards[0]) }"
            @error="handleUnifiedImageError"
          />
          <div class="card-info">
            <div class="position-label">
              {{ spreadType === 'daily_card' ? '오늘의 카드' : '현재 상황' }}
            </div>
            <div class="card-name">{{ getCardName(cards[0]) }}</div>
            <div class="card-orientation" :class="{ reversed: isCardReversed(cards[0]) }">
              {{ isCardReversed(cards[0]) ? '역방향' : '정방향' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 기본 그리드 레이아웃 -->
    <div v-else class="grid-layout">
      <div 
        v-for="(card, index) in cards" 
        :key="index"
        class="card-position"
      >
        <div class="card-wrapper">
          <img 
            :src="getUnifiedCardImagePath(card)" 
            :alt="getCardName(card)"
            class="card-image"
            :class="{ reversed: isCardReversed(card) }"
            @error="handleUnifiedImageError"
          />
          <div class="card-info">
            <div class="position-label">카드 {{ index + 1 }}</div>
            <div class="card-name">{{ getCardName(card) }}</div>
            <div class="card-orientation" :class="{ reversed: isCardReversed(card) }">
              {{ isCardReversed(card) ? '역방향' : '정방향' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getUnifiedCardImagePath, isCardReversed, handleUnifiedImageError } from '@/utils/unifiedCardImage';

interface Props {
  spreadId?: string;
  spreadType?: string;
  cards: any[];
}

const props = defineProps<Props>();

const spreadClass = computed(() => {
  if (props.spreadType === 'daily_card') return 'daily-card-spread';
  return `${props.spreadId}-spread`;
});

const getCardName = (card: any): string => {
  if (!card) return '카드';
  return card?.nameKr || card?.name_kr || card?.card_name || card?.name || '카드';
};

const getPositionName = (index: number): string => {
  const positions: Record<string, string[]> = {
    'celtic_cross': [
      '현재 내면', '현재 외부', '근본', '과거',
      '드러나는 모습', '미래', '내가 보는 나',
      '남이 보는 나', '예상하는 결과', '실제 결과'
    ],
    'seven_star': [
      '핵심', '도움', '내면', '예상', '결과', '외부', '운명'
    ],
    'cup_of_relationship': [
      '나', '상대', '관계 기본', '관계 과거',
      '현재 느낌', '현재 외부 상황',
      '현재 나는 어떻게 생각?', '현재 상대는 어떻게 생각?',
      '미래 나는 어떻게 생각?', '미래 상대는 어떻게 생각?',
      '결과'
    ],
    'three_card_timeline': ['과거', '현재', '미래'],
    'one_card': ['현재 상황']
  };
  
  return positions[props.spreadId || '']?.[index] || `카드 ${index + 1}`;
};
</script>

<style scoped>
.spread-layout {
  width: 100%;
  min-height: 400px;
  position: relative;
  padding: 20px;
}

/* 카드 기본 스타일 */
.card-position {
  position: absolute;
  transition: all 0.3s ease;
}

.card-wrapper {
  text-align: center;
}

.card-image {
  width: 80px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid rgba(168, 85, 247, 0.3);
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.card-image.reversed {
  transform: rotate(180deg);
}

.card-position:hover .card-image {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
}

.card-position:hover .card-image.reversed {
  transform: rotate(180deg) scale(1.1);
}

.card-info {
  margin-top: 8px;
}

.position-label {
  font-size: 11px;
  color: #A855F7;
  font-weight: 600;
  margin-bottom: 2px;
}

.card-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 2px;
}

.card-orientation {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 켈틱 크로스 레이아웃 - 유료배열과 동일 */
.celtic-cross-layout {
  position: relative;
  width: 100%;
  min-height: 500px;
  scale: 0.7;
}

/* 켈틱 크로스 카드 위치 - top -45% 적용 */
.celtic-cross-layout .position-1 { /* 현재상황 - 중앙 왼쪽 */
  top: 18%; /* 58% - 45% */
  left: calc(40% - 40px);
  transform: translate(-80%, 75%);
  z-index: 10;
}

.celtic-cross-layout .position-2 { /* 도전/십자가 - 중앙 오른쪽 */
  top: 12%; /* 52% - 45% */
  left: calc(40% + 40px);
  transform: translate(-105%, 50%);
  z-index: 10;
}

.celtic-cross-layout .position-3 { /* 근본 - 아래 */
  top: 38%; /* 78% - 45% */
  left: 40%;
  transform: translate(-90%, 115%);
}

.celtic-cross-layout .position-4 { /* 과거 - 왼쪽 */
  top: 13%; /* 53% - 45% */
  left: 10%;
  transform: translate(-140%, 65%);
}

.celtic-cross-layout .position-5 { /* 드러나는 모습 - 위 */
  top: -15%; /* 25% - 45% */
  left: 40%;
  transform: translate(-90%, 35%);
}

.celtic-cross-layout .position-6 { /* 미래 - 오른쪽 */
  top: 13%; /* 53% - 45% */
  left: 70%;
  transform: translate(-40%, 65%);
}

/* 오른쪽 기둥 */
.celtic-cross-layout .position-7 { /* 내가보는나 - 맨 아래 */
  top: 30%; /* 70% - 45% */
  left: 95%;
  transform: translate(0%, 175%);
}

.celtic-cross-layout .position-8 { /* 남이보는나 */
  top: 15%; /* 55% - 45% */
  left: 95%;
  transform: translate(30%, 110%);
}

.celtic-cross-layout .position-9 { /* 예상하는 결과 */
  top: -2%; /* 38% - 45% */
  left: 95%;
  transform: translate(0%, 50%);
}

.celtic-cross-layout .position-10 { /* 실제 결과 - 맨 위 */
  top: -15%; /* 25% - 45% */
  left: 95%;
  transform: translate(30%, -15%);
}

/* 세븐 스타 레이아웃 - 유료배열과 동일하게 */
.seven-star-layout {
  position: relative;
  width: 100%;
  min-height: 500px;
}

.seven-star-layout .star-position-1 { /* 과거의 영향 - 상단 중앙 */
  top: 0%;
  left: 50%;
  transform: translateX(-50%);
}

.seven-star-layout .star-position-2 { /* 현재 상황 - 중앙 */
  top: 35%;
  left: 20%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.seven-star-layout .star-position-3 { /* 숨겨진 영향 - 좌측 상단 */
  top: 35%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-4 { /* 의식적 욕구 - 우측 상단 */
  top: 37%;
  left: 50%;
  transform: translateX(-50%);
}

.seven-star-layout .star-position-5 { /* 무의식적 욕구 - 좌측 하단 */
  top: 70%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-6 { /* 조언 - 우측 하단 */
  top: 70%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.seven-star-layout .star-position-7 { /* 최종 결과 - 하단 중앙 */
  bottom: -5%;
  left: 50%;
  transform: translateX(-50%);
}

/* 컵 오브 릴레이션십 레이아웃 - 유료배열과 동일 */
.cup-relationship-layout {
  position: relative;
  width: 100%;
  min-height: 550px;
  scale: 0.75;
}

/* 컵 오브 릴레이션십 카드 위치 - top 값 모두 40% 내려서 조정 */
.cup-relationship-layout .cup-position-1 { /* 나 - 왼쪽 아래 */
  top: 100%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-2 { /* 상대 - 오른쪽 아래 */
  top: 100%;
  left: 20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-3 { /* 관계 기본 - 하단 중앙 */
  top: 100%;
  left: 80%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-4 { /* 관계 과거 - 왼쪽 중간 */
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-5 { /* 현재 상태 - 중앙 */
  top: 40%;
  left: 40%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.cup-relationship-layout .cup-position-6 { /* 현재 외부 상황 - 오른쪽 중간 */
  top: 35%;
  left: 60%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-7 { /* 현재 나는 어떻게 생각? - 왼쪽 */
  top: 28%;
  left: 10%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-8 { /* 현재 상대는 어떻게 생각? - 오른쪽 */
  top: 28%;
  left: 90%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-9 { /* 미래 나는 어떻게 생각? - 왼쪽 상단 */
  top: 20%;
  left: -20%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-10 { /* 미래 상대는 어떻게 생각? - 오른쪽 상단 */
  top: 20%;
  left: 120%;
  transform: translate(-50%, -50%);
}

.cup-relationship-layout .cup-position-11 { /* 결과 - 상단 중앙 */
  top: 5%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 3장 타임라인 레이아웃 */
.timeline-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  min-height: 250px;
}

.timeline-layout .card-position {
  position: relative;
}

/* 1장 레이아웃 */
.single-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
}

.single-layout .card-position {
  position: relative;
  top: 60px;
  scale: 1.8;
}

.single-layout .card-image {
  width: 100px;
  height: 150px;
}

/* 그리드 레이아웃 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-layout .card-position {
  position: relative;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .card-image {
    width: 60px;
    height: 90px;
  }
  
  .single-layout .card-image {
    width: 80px;
    height: 120px;
  }
  
  .position-label {
    font-size: 10px;
  }
  
  .card-name {
    font-size: 11px;
  }
  
  .card-orientation {
    font-size: 9px;
  }
}
</style>
