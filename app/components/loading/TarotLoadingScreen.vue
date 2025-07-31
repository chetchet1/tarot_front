<template>
  <transition name="fade" @enter="onEnter" @leave="onLeave">
    <div v-if="isVisible" class="loading-overlay">
      <div class="loading-content">
        <!-- 신비로운 카드 애니메이션 -->
        <div class="cards-animation">
          <div class="floating-card card-1">🌙</div>
          <div class="floating-card card-2">⭐</div>
          <div class="floating-card card-3">✨</div>
          <div class="floating-card card-4">🔮</div>
          <div class="floating-card card-5">☀️</div>
        </div>
        
        <!-- 메인 로딩 아이콘 -->
        <div class="loading-icon-wrapper">
          <div class="loading-icon">
            <div class="crystal-ball">🔮</div>
            <div class="magic-circle"></div>
            <div class="sparkles">
              <span class="sparkle s1">✨</span>
              <span class="sparkle s2">✨</span>
              <span class="sparkle s3">✨</span>
              <span class="sparkle s4">✨</span>
            </div>
          </div>
        </div>
        
        <!-- 감성적인 문구들 -->
        <div class="loading-messages">
          <transition name="message-fade" mode="out-in">
            <p :key="currentMessageIndex" class="loading-message">
              {{ currentMessage }}
            </p>
          </transition>
          <p class="sub-message">잠시만 기다려주세요...</p>
        </div>
        
        <!-- 프로그레스 바 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            <div class="progress-glow"></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  isVisible: boolean;
  progress?: number;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0
});

const emit = defineEmits<{
  'animation-complete': [];
}>();

// 감성적인 로딩 메시지들
const messages = [
  "타로의 정원에서 당신의 운명을 읽고 있어요",
  "우주의 메시지를 해석하고 있어요",
  "카드가 들려주는 이야기를 풀어내고 있어요",
  "신비로운 상징들이 당신에게 전하는 메시지를 번역하고 있어요",
  "운명의 실타래를 하나씩 풀어가고 있어요",
  "별들이 그리는 당신의 이야기를 읽고 있어요",
  "시간과 공간을 넘어 당신에게 전해질 메시지를 준비하고 있어요",
  "고대의 지혜가 현재의 당신에게 속삭이고 있어요"
];

const currentMessageIndex = ref(0);
const messageInterval = ref<number | null>(null);

const currentMessage = computed(() => messages[currentMessageIndex.value]);

// 메시지 순환
const startMessageRotation = () => {
  messageInterval.value = window.setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, 3000);
};

const stopMessageRotation = () => {
  if (messageInterval.value) {
    clearInterval(messageInterval.value);
    messageInterval.value = null;
  }
};

// 애니메이션 이벤트 핸들러
const onEnter = (el: Element) => {
  // 진입 애니메이션 시작
  startMessageRotation();
};

const onLeave = (el: Element) => {
  // 종료 애니메이션
  stopMessageRotation();
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

onUnmounted(() => {
  stopMessageRotation();
});
</script>

<style scoped>
/* 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 12, 41, 0.98);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 로딩 콘텐츠 컨테이너 */
.loading-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;
  width: 90%;
}

/* 플로팅 카드 애니메이션 */
.cards-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-card {
  position: absolute;
  font-size: 40px;
  opacity: 0.3;
  animation: float-around 20s infinite;
}

.card-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 18s;
}

.card-2 {
  top: 20%;
  right: 15%;
  animation-delay: 3s;
  animation-duration: 22s;
}

.card-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 6s;
  animation-duration: 20s;
}

.card-4 {
  bottom: 20%;
  right: 25%;
  animation-delay: 9s;
  animation-duration: 24s;
}

.card-5 {
  top: 50%;
  left: 50%;
  animation-delay: 12s;
  animation-duration: 19s;
}

@keyframes float-around {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(100px, -50px) rotate(90deg);
  }
  50% {
    transform: translate(-50px, 100px) rotate(180deg);
  }
  75% {
    transform: translate(-100px, -30px) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

/* 메인 로딩 아이콘 */
.loading-icon-wrapper {
  position: relative;
  margin: 60px auto 40px;
  width: 120px;
  height: 120px;
}

.loading-icon {
  position: relative;
  width: 100%;
  height: 100%;
}

.crystal-ball {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 60px;
  z-index: 2;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    filter: drop-shadow(0 0 40px rgba(168, 85, 247, 1));
  }
}

.magic-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(168, 85, 247, 0.3);
  border-radius: 50%;
  animation: rotate-slow 10s linear infinite;
}

.magic-circle::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border: 2px dashed rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: rotate-reverse 15s linear infinite;
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rotate-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

/* 반짝이는 별 */
.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sparkle {
  position: absolute;
  font-size: 20px;
  animation: sparkle 3s ease-in-out infinite;
}

.s1 {
  top: -10px;
  left: 50%;
  animation-delay: 0s;
}

.s2 {
  top: 50%;
  right: -10px;
  animation-delay: 0.75s;
}

.s3 {
  bottom: -10px;
  left: 50%;
  animation-delay: 1.5s;
}

.s4 {
  top: 50%;
  left: -10px;
  animation-delay: 2.25s;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

/* 로딩 메시지 */
.loading-messages {
  margin-bottom: 40px;
}

.loading-message {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
  line-height: 1.5;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}

.sub-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 메시지 페이드 트랜지션 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.5s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 프로그레스 바 */
.progress-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A855F7 0%, #7C3AED 50%, #FFD700 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: glow-move 2s linear infinite;
}

@keyframes glow-move {
  0% {
    transform: translateX(-200px);
  }
  100% {
    transform: translateX(500px);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .loading-content {
    padding: 30px 20px;
  }
  
  .floating-card {
    font-size: 30px;
  }
  
  .loading-icon-wrapper {
    width: 100px;
    height: 100px;
    margin: 40px auto 30px;
  }
  
  .crystal-ball {
    font-size: 50px;
  }
  
  .loading-message {
    font-size: 18px;
  }
  
  .sub-message {
    font-size: 14px;
  }
  
  .sparkle {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .loading-message {
    font-size: 16px;
  }
  
  .crystal-ball {
    font-size: 40px;
  }
  
  .loading-icon-wrapper {
    width: 80px;
    height: 80px;
  }
}
</style>
