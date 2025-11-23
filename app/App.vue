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

// 프로덕션 빌드 - 콘솔 로그 비활성화

onMounted(() => {
  // 기존 디버그 패널 제거
  logger.removeDebugPanel();

  // URL Fragment에서 OAuth 토큰 처리
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('/auth/callback'))) {
    // ... (기존 OAuth 처리 로직은 그대로 유지)
    // 이 부분은 웹 환경 콜백이므로 즉시 처리되어야 함
    (async () => {
      try {
        let accessToken = null;
        let refreshToken = null;
        const hashContent = window.location.hash.substring(1);
        
        if (hashContent.includes('/auth/callback#')) {
          const tokenPart = hashContent.split('#')[1];
          const params = new URLSearchParams(tokenPart);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
        } else if (hashContent.includes('/auth/callback?')) {
          const tokenPart = hashContent.split('?')[1];
          const params = new URLSearchParams(tokenPart);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
        } else if (hashContent.includes('access_token=')) {
          const params = new URLSearchParams(hashContent);
          accessToken = params.get('access_token');
          refreshToken = params.get('refresh_token');
        }

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (!error && data.session) {
            window.history.replaceState(null, '', window.location.origin + window.location.pathname);
            await userStore.initializeUser();
            window.dispatchEvent(new CustomEvent('oauth-success'));
          }
        }
      } catch (error) {
        console.error('OAuth 토큰 처리 중 예외:', error);
      }
    })();
    return; // OAuth 콜백 처리 후 다른 초기화 로직 중단
  }

  // 공유 페이지는 초기화 건너뛰기
  if (route.path.startsWith('/s/')) {
    return;
  }

  // 네이티브 앱 초기화 로직 (비동기, 논블로킹으로 처리)
  if (Capacitor.isNativePlatform()) {
    // 딥링크 리스너 설정
    oauthService.setupDeepLinkListener().catch(err => console.error('OAuth 리스너 설정 실패:', err));

    // 앱 상태 변경 리스너
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && (!userStore.user || userStore.user.email !== session.user?.email)) {
            userStore.initializeUser().then(() => {
              window.dispatchEvent(new CustomEvent('oauth-success'));
            });
          }
        });
      }
    });

    // 앱 업데이트 체크 (임시 비활성화)
    // updateChecker.checkForUpdate().catch(err => console.error('업데이트 체크 실패:', err));
  }

  // 사용자 초기화 (가장 중요한 부분, UI 렌더링을 막지 않음)
  userStore.initializeUser().catch(err => {
    console.error('사용자 초기화 실패:', err);
    // 여기서 실패 시 에러 화면을 보여주는 등의 처리를 할 수 있음
  });
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
