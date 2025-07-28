<template>
  <div id="app">
    <router-view />
    <!-- 프리미엄 테스트 패널 (개발/테스트용) -->
    <PremiumTestPanel v-if="showTestPanel" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PremiumTestPanel from './components/PremiumTestPanel.vue';

// 개발 환경에서만 테스트 패널 표시
const showTestPanel = ref(import.meta.env.MODE !== 'production');

// 프로덕션에서도 테스트 패널을 사용하려면 아래 주석 해제
// const showTestPanel = ref(true);
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  min-height: 100vh;
  color: #FFFFFF;
}
</style>
