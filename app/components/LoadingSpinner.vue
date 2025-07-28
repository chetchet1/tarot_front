<template>
  <div class="loading-overlay" :class="Platform.name">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Platform } from '../utils/platform';

interface Props {
  text?: string;
}

withDefaults(defineProps<Props>(), {
  text: '로딩 중...'
});
</script>

<style scoped>
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 웹에서만 fixed positioning 사용 */
.loading-overlay.web {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

/* 모바일에서는 전체 화면 overlay */
.loading-overlay.ios,
.loading-overlay.android {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.loading-content {
  text-align: center;
}

.spinner {
  margin: 0 auto 20px;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #A855F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
