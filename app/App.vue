<template>
  <div id="app">
    <!-- Vue Router를 통한 정상 라우팅 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { useUserStore } from './store/user';
import { oauthService } from './services/oauth';
import './styles/main.scss';

const route = useRoute();
const userStore = useUserStore();

console.log('🚀 App.vue initialized:', {
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
  
  // 공유 페이지는 사용자 초기화 건너뛰기 (라우트 기반으로 확인)
  if (route.path.startsWith('/s/')) {
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
