<template>
  <transition name="slide-up">
    <div v-if="visible" class="position-meaning-overlay">
      <div class="meaning-card">
        <button class="close-button" @click="$emit('close')">
          <span>✕</span>
        </button>
        
        <div class="position-number">Position {{ position }}</div>
        
        <h3 class="position-title">{{ meaning?.title }}</h3>
        
        <p class="position-description">{{ meaning?.description }}</p>
        
        <div class="keywords" v-if="meaning?.keywords">
          <span class="keyword" v-for="keyword in meaning.keywords" :key="keyword">
            {{ keyword }}
          </span>
        </div>
        
        <div class="card-preview" v-if="card">
          <img :src="getCardImageUrl(card)" :alt="card.nameKr" />
          <h4>{{ card.nameKr }}</h4>
          <span class="orientation" :class="orientation">
            {{ orientation === 'upright' ? '정방향' : '역방향' }}
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getPositionMeaning } from '@/data/spreads/positionMeanings';
import { getUnifiedCardImagePath } from '@/utils/unifiedCardImage';

interface Props {
  visible: boolean;
  spreadId: string;
  position: number;
  card?: any;
  orientation?: 'upright' | 'reversed';
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const meaning = computed(() => {
  return getPositionMeaning(props.spreadId, props.position);
});

// 카드 이미지 URL 생성 - 통합 카드 이미지 함수 사용
const getCardImageUrl = (card: any) => {
  if (!card) return '';
  return getUnifiedCardImagePath(card);
};
</script>

<style scoped>
.position-meaning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.meaning-card {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border: 2px solid rgba(168, 85, 247, 0.5);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 18px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.position-number {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #A855F7;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 15px;
}

.position-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 15px;
  color: white;
  text-align: center;
}

.position-description {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  text-align: center;
}

.keywords {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

.keyword {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.card-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  margin-top: 20px;
}

.card-preview img {
  width: 80px;
  height: 120px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 10px;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card-preview h4 {
  font-size: 16px;
  margin-bottom: 5px;
  color: white;
}

.orientation {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 애니메이션 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .meaning-card {
    padding: 20px;
  }
  
  .position-title {
    font-size: 24px;
  }
  
  .position-description {
    font-size: 14px;
  }
  
  .card-preview img {
    width: 60px;
    height: 90px;
  }
}
</style>
