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
import { App as CapacitorApp } from '@capacitor/app';
import { useUserStore } from './store/user';
import { oauthService } from './services/oauth';
import { revenueCatService } from './services/RevenueCatService';
import { updateChecker } from './services/updateChecker';
import { supabase } from './services/supabase';
import { logger } from './services/debugLogger';
import './styles/main.scss';

const route = useRoute();
const userStore = useUserStore();

console.log('🚀 App.vue initialized:', {
  href: window.location.href,
  isNative: Capacitor?.isNativePlatform ? Capacitor.isNativePlatform() : false,
  hasCapacitor: typeof Capacitor !== 'undefined'
});

onMounted(async () => {
  // 기존 디버그 패널 제거
  logger.removeDebugPanel();
  
  console.log('🚀 [App.vue] App mounted');
  console.log('📍 [App.vue] Current route:', {
    path: route.path,
    name: route.name,
    params: route.params
  });
  console.log('🔗 [App.vue] Current URL:', window.location.href);
  console.log('🔗 [App.vue] URL Hash:', window.location.hash);
  
  // URL Fragment에서 OAuth 토큰 확인 (localhost에서 OAuth 콜백 처리)
  console.log('🔗 [App.vue] 현재 URL 해시:', window.location.hash);
  
  // /auth/callback 경로나 access_token이 있는 경우
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('/auth/callback'))) {
    console.log('🔑 [App.vue] OAuth 토큰 또는 콜백 감지!');
    console.log('🔑 [App.vue] 전체 해시:', window.location.hash);
    
    try {
      let accessToken = null;
      let refreshToken = null;
      
      // URL 해시 파싱
      const hashContent = window.location.hash.substring(1); // # 제거
      console.log('🔎 [App.vue] 파싱할 내용:', hashContent);
      
      // /auth/callback#access_token=... 형태인 경우
      if (hashContent.includes('/auth/callback#')) {
        const tokenPart = hashContent.split('#')[1];
        const params = new URLSearchParams(tokenPart);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
        console.log('📌 [App.vue] 콜백 경로에서 토큰 추출 (방법1)');
      } 
      // /auth/callback?access_token=... 형태인 경우
      else if (hashContent.includes('/auth/callback?')) {
        const tokenPart = hashContent.split('?')[1];
        const params = new URLSearchParams(tokenPart);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
        console.log('📌 [App.vue] 콜백 경로에서 토큰 추출 (방법2)');
        console.log('📌 [App.vue] 콜백 경로에서 토큰 추출 (방법2)');
      }
      // #access_token=... 직접 형태인 경우
      else if (hashContent.includes('access_token=')) {
        const params = new URLSearchParams(hashContent);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
        console.log('📌 [App.vue] 직접 토큰 추출 (방법3)');
        console.log('📌 [App.vue] 직접 토큰 추출 (방법3)');
      }
      
      console.log('🔐 [App.vue] 토큰 추출 결과:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length
      });
      
      if (accessToken && refreshToken) {
        console.log('🔄 [App.vue] OAuth 세션 설정 시작...');
        
        // 세션 설정
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (!error && data.session) {
          console.log('✅ [App.vue] OAuth 세션 설정 성공!');
          console.log('✅ [App.vue] 로그인 사용자:', data.session.user?.email);
          
          // URL fragment 제거 (깔끔하게)
          window.history.replaceState(null, '', window.location.origin + window.location.pathname);
          
          // 사용자 스토어 업데이트
          await userStore.initializeUser();
          
          // OAuth 성공 이벤트 발생
          const event = new CustomEvent('oauth-success');
          window.dispatchEvent(event);
          
          console.log('🎉 [App.vue] OAuth 로그인 완전 성공!');
          return;
        } else {
          console.error('❌ [App.vue] 세션 설정 실패:', error);
          console.error('❌ [App.vue] 에러 세부사항:', error?.message);
        }
      } else {
        console.log('⚠️ [App.vue] 토큰이 없거나 불완전함');
      }
    } catch (error) {
      console.error('❌ [App.vue] OAuth 토큰 처리 중 예외:', error);
      console.error('❌ [App.vue] 에러 스택:', error.stack);
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
      
      // 앱 포커스 이벤트 리스너 추가 (OAuth 후 앱으로 돌아왔을 때)
      CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          console.log('👀 [App.vue] 앱 포커스 받음 - 세션 확인');
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('✅ [App.vue] 포커스 후 세션 확인:', session.user?.email);
            // 사용자 스토어 업데이트
            if (!userStore.user || userStore.user.email !== session.user?.email) {
              await userStore.initializeUser();
              const event = new CustomEvent('oauth-success');
              window.dispatchEvent(event);
            }
          }
        }
      });
      
      // 앱 업데이트 체크 (비동기로 실행)
      updateChecker.checkForUpdate().catch(error => {
        console.error('⚠️ Update check failed:', error);
      });
      
      // RevenueCat 초기화 비활성화 (API 키 없음)
      // TODO: 프로덕션 배포 시 RevenueCat API 키 설정 후 활성화
      // try {
      //   await revenueCatService.initialize();
      //   console.log('✅ RevenueCat initialized');
      // } catch (error) {
      //   console.error('⚠️ RevenueCat initialization failed:', error);
      // }
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
