<template>
  <div id="app">
    <!-- 공유 페이지 -->
    <SharedReadingView v-if="isSharedPage" />
    <!-- 일반 라우터 뷰 -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { useUserStore } from './store/user';
import { oauthService } from './services/oauth';
import SharedReadingView from './views/SharedReadingView.vue';
import './styles/main.scss';

const route = useRoute();
const userStore = useUserStore();

// 초기 경로 확인
const initialPath = window.location.pathname;
const isSharedPage = ref(initialPath.startsWith('/s/'));
const currentPath = ref(initialPath);

console.log('🚀 App.vue initialized:', {
  initialPath,
  isSharedPage: isSharedPage.value,
  href: window.location.href,
  isNative: Capacitor.isNativePlatform()
});

onMounted(async () => {
  console.log('🚀 App mounted');
  console.log('📍 Current route:', {
    path: route.path,
    name: route.name,
    params: route.params
  });
  
  // 공유 페이지는 사용자 초기화 건너뛰기
  if (isSharedPage.value) {
    console.log('🔗 Shared page detected - skipping user initialization');
    return;
  }
  
  try {
    // OAuth 리스너 설정 (네이티브 앱에서만)
    if (Capacitor.isNativePlatform()) {
      await oauthService.setupDeepLinkListener();
    }
    
    // 사용자 초기화 (공유 페이지가 아닌 경우만)
    await userStore.initializeUser();
    
  } catch (error) {
    console.error('❌ App initialization error:', error);
  }
});
</script>

<style lang="scss">
// 기본 앱 스타일
#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>
