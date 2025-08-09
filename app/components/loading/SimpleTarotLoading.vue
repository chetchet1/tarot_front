<template>
  <div v-if="isVisible" class="simple-loading-overlay">
    <div class="simple-loading-content">
      <!-- 수정구 아이콘 -->
      <div class="crystal-ball-icon">🔮</div>
      
      <!-- 로딩 메시지 -->
      <h2 class="loading-title">타로의 신비를 해석중...</h2>
      <p class="loading-subtitle">{{ message }}</p>
      
      <!-- 프로그레스 바 -->
      <div class="progress-wrapper">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>
      
      <!-- 애니메이션 도트 -->
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
  isVisible: boolean;
  progress?: number;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0
});

const messages = [
  "카드가 들려주는 이야기를 풀어내고 있어요",
  "우주의 메시지를 번역하고 있어요",
  "당신의 운명을 읽고 있어요",
  "신비로운 상징들을 해석하고 있어요"
];

const message = ref(messages[0]);
let messageIndex = 0;
let interval: number | null = null;

const startMessageRotation = () => {
  interval = window.setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    message.value = messages[messageIndex];
  }, 2000);
};

const stopMessageRotation = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    startMessageRotation();
  } else {
    stopMessageRotation();
  }
});

onMounted(() => {
  if (props.isVisible) {
    startMessageRotation();
  }
});
</script>

<style scoped>
.simple-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 12, 41, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.simple-loading-content {
  text-align: center;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.crystal-ball-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.6));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 40px rgba(168, 85, 247, 1));
  }
}

.loading-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.loading-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  min-height: 24px;
}

.progress-wrapper {
  margin-bottom: 24px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A855F7 0%, #7C3AED 50%, #FFD700 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .simple-loading-content {
    padding: 30px 20px;
  }
  
  .crystal-ball-icon {
    font-size: 60px;
  }
  
  .loading-title {
    font-size: 20px;
  }
  
  .loading-subtitle {
    font-size: 14px;
  }
}
</style>
