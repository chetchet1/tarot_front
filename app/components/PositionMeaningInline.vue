<template>
  <transition name="fade-slide">
    <div v-if="visible && meaning" class="position-meaning-inline">
      <div class="meaning-content">
        <div class="position-header">
          <span class="position-number">Position {{ position }}</span>
          <h3 class="position-title">{{ meaning.title }}</h3>
        </div>
        
        <p class="position-description">{{ meaning.description }}</p>
        
        <div class="keywords" v-if="meaning.keywords">
          <span class="keyword" v-for="keyword in meaning.keywords" :key="keyword">
            {{ keyword }}
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getPositionMeaning } from '@/data/spreads/positionMeanings';

interface Props {
  visible: boolean;
  spreadId: string;
  position: number;
}

const props = defineProps<Props>();

const meaning = computed(() => {
  return getPositionMeaning(props.spreadId, props.position);
});
</script>

<style scoped>
.position-meaning-inline {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.98) 0%, rgba(49, 46, 129, 0.98) 100%);
  border: 2px solid rgba(168, 85, 247, 0.5);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.meaning-content {
  max-width: 800px;
  margin: 0 auto;
}

.position-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.position-number {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #A855F7;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.position-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.position-description {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
}

.keywords {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.keyword {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 애니메이션 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .position-meaning-inline {
    padding: 15px;
    bottom: 10px;
    width: 95%;
  }
  
  .position-title {
    font-size: 20px;
  }
  
  .position-description {
    font-size: 14px;
  }
  
  .keyword {
    font-size: 12px;
    padding: 4px 10px;
  }
}
</style>
