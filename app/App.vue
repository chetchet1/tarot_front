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
import { revenueCatService } from './services/RevenueCatService';
import { updateChecker } from './services/updateChecker';
import { supabase } from './services/supabase';
import './styles/main.scss';

const route = useRoute();
const userStore = useUserStore();

console.log('🚀 App.vue initialized:', {
  href: window.location.href,
  isNative: Capacitor?.isNativePlatform ? Capacitor.isNativePlatform() : false,
  hasCapacitor: typeof Capacitor !== 'undefined'
});

onMounted(async () => {
  console.log('🚀 [App.vue] App mounted');
  console.log('📍 [App.vue] Current route:', {
    path: route.path,
    name: route.name,
    params: route.params
  });
  console.log('🔗 [App.vue] Current URL:', window.location.href);
  console.log('🔗 [App.vue] URL Hash:', window.location.hash);
  
  // URL Fragment에서 OAuth 토큰 확인
  if (window.location.hash && window.location.hash.includes('access_token')) {
    console.log('🔑 [App.vue] OAuth tokens detected in URL fragment');
    
    try {
      // Fragment에서 토큰 추출
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      console.log('🔐 [App.vue] Tokens found:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });
      
      if (accessToken && refreshToken) {
        console.log('🔄 [App.vue] Setting OAuth session from URL fragment');
        
        // 세션 설정
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (!error && data.session) {
          console.log('✅ [App.vue] OAuth session set successfully:', data.session.user?.email);
          
          // URL fragment 제거
          window.history.replaceState(null, '', window.location.pathname);
          
          // 사용자 스토어 업데이트
          await userStore.initializeUser();
          
          // OAuth 성공 이벤트 발생
          const event = new CustomEvent('oauth-success');
          window.dispatchEvent(event);
          
          console.log('🎉 [App.vue] OAuth login completed');
          return;
        } else {
          console.error('❌ [App.vue] Failed to set session:', error);
        }
      }
    } catch (error) {
      console.error('❌ [App.vue] Failed to process OAuth tokens from URL:', error);
    }
  }
  
  // 공유 페이지는 사용자 초기화 건너뛰기 (라우트 기반으로 확인)
  if (route.path.startsWith('/s/')) {
    console.log('🔗 [App.vue] Shared page detected - skipping user initialization');
    return;
  }
  
  try {
    // OAuth 리스너 설정 (네이티브 앱에서만)
    console.log('🎯 [App.vue] Capacitor 확인:', {
      hasCapacitor: typeof Capacitor !== 'undefined',
      isNativePlatform: Capacitor?.isNativePlatform ? Capacitor.isNativePlatform() : false
    });
    
    if (Capacitor?.isNativePlatform && Capacitor.isNativePlatform()) {
      console.log('📱 [App.vue] Native platform 감지 - OAuth 리스너 설정 시작');
      await oauthService.setupDeepLinkListener();
      console.log('✅ [App.vue] OAuth 리스너 설정 완료');
      
      // 앱 업데이트 체크 (비동기로 실행)
      updateChecker.checkForUpdate().catch(error => {
        console.error('⚠️ Update check failed:', error);
      });
      
      // RevenueCat 초기화 (네이티브 앱에서만)
      try {
        await revenueCatService.initialize();
        console.log('✅ RevenueCat initialized');
      } catch (error) {
        console.error('⚠️ RevenueCat initialization failed:', error);
        // RevenueCat 초기화 실패해도 앱은 계속 실행
      }
    }
    
    // 사용자 초기화 (공유 페이지가 아닌 경우만)
    console.log('👤 [App.vue] 사용자 초기화 시작');
    await userStore.initializeUser();
    console.log('✅ [App.vue] 사용자 초기화 완료');
    
  } catch (error) {
    console.error('❌ [App.vue] App initialization error:', error);
    console.error('❌ [App.vue] Error stack:', error.stack);
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
