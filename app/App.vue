<template>
  <div id="app">
    <router-view />
    <!-- 프리미엄 테스트 패널 (개발/테스트용) -->
    <PremiumTestPanel v-if="showTestPanel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PremiumTestPanel from './components/PremiumTestPanel.vue';
import { oauthService } from './services/oauth';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { authService } from './services/supabase';
import { useRouter } from 'vue-router';
import './utils/authDebug'; // 디버깅 유틸리티 로드

// 개발 환경에서만 테스트 패널 표시
const showTestPanel = ref(import.meta.env.MODE !== 'production');

// 프로덕션에서도 테스트 패널을 사용하려면 아래 주석 해제
// const showTestPanel = ref(true);

const router = useRouter();

// 앱 초기화
onMounted(async () => {
  console.log('🚀 앱 초기화 시작');
  
  // 모바일 환경에서 딥링크 리스너 설정
  if (Capacitor.isNativePlatform()) {
    console.log('📱 모바일 환경 감지 - 딥링크 리스너 설정');
    
    // 앱 시작 시 OAuth 세션 확인 및 정리
    try {
      const { data: { session } } = await authService.supabase.auth.getSession();
      if (!session) {
        console.log('🧹 앱 시작: OAuth 세션 없음');
        // 로컬 스토리지에서 로그인 상태 제거
        const savedUser = localStorage.getItem('tarot_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (!userData.isAnonymous) {
            console.log('🗑️ 브라우저 세션과 불일치 - 익명 사용자로 전환');
            localStorage.removeItem('tarot_user');
          }
        }
      }
    } catch (error) {
      console.error('❌ 세션 확인 실패:', error);
    }
    
    // OAuth 딥링크 리스너 설정
    await oauthService.setupDeepLinkListener();
    
    // OAuth 성공 콜백 설정
    oauthService.setAuthSuccessCallback(async () => {
      console.log('✅ OAuth 로그인 성공 - userStore 업데이트 후 앱으로 이동');
      
      // userStore 재초기화
      const { useUserStore } = await import('./store/user');
      const userStore = useUserStore();
      await userStore.initializeUser();
      
      // 약간의 딜레이 후 라우팅
      setTimeout(() => {
        // 로그인된 사용자는 바로 앱으로
        if (userStore.currentUser && !userStore.currentUser.isAnonymous) {
          router.push('/app');
        } else {
          router.push('/');
        }
      }, 100);
    });
    
    // App URL 리스너 추가 (초기 URL 처리)
    CapacitorApp.addListener('appUrlOpen', async (data: any) => {
      console.log('🔗 Deep link opened:', data.url);
      
      // OAuth 콜백 URL인지 확인
      if (data.url && (data.url.includes('auth/callback') || data.url.includes('login-callback'))) {
        console.log('🔐 Processing OAuth callback from initial URL...');
        
        try {
          // URL에서 토큰 추출
          let access_token: string | null = null;
          let refresh_token: string | null = null;
          
          // Fragment (#) 방식 처리
          if (data.url.includes('#')) {
            const fragment = data.url.split('#')[1];
            const params = new URLSearchParams(fragment);
            access_token = params.get('access_token');
            refresh_token = params.get('refresh_token');
          }
          
          console.log('🔑 Tokens extracted:', { 
            access_token: access_token ? 'Yes' : 'No', 
            refresh_token: refresh_token ? 'Yes' : 'No' 
          });
          
          if (access_token && refresh_token) {
            console.log('🔐 Setting session with tokens...');
            
            try {
              // 세션 설정
              const { data: sessionData, error } = await authService.supabase.auth.setSession({
                access_token,
                refresh_token
              });
              
              console.log('📊 Session response:', { 
                hasData: !!sessionData, 
                hasSession: !!sessionData?.session,
                hasError: !!error,
                error: error?.message 
              });
              
              if (!error && sessionData?.session) {
                console.log('✅ Session set successfully:', sessionData.session.user?.email);
                
                // 로그인 모달 닫기를 위한 이벤트 발생
                window.dispatchEvent(new CustomEvent('oauth-success'));
                
                // userStore 초기화
                const { useUserStore } = await import('./store/user');
                const userStore = useUserStore();
                await userStore.initializeUser();
                
                console.log('👤 userStore 상태:', {
                  currentUser: userStore.currentUser,
                  isLoggedIn: userStore.isLoggedIn,
                  isAnonymous: userStore.currentUser?.isAnonymous
                });
                
                // 로그인된 사용자는 바로 앱으로
                setTimeout(() => {
                  if (userStore.currentUser && !userStore.currentUser.isAnonymous) {
                    console.log('🚀 앱으로 이동: /app');
                    router.push('/app');
                  } else {
                    console.log('🏠 홈으로 이동: /');
                    router.push('/');
                  }
                }, 500);
              } else {
                console.error('❌ Failed to set session:', error || 'No session data');
                // 에러 시에도 토스트 메시지 표시
                if (error?.message) {
                  window.dispatchEvent(new CustomEvent('oauth-error', { 
                    detail: { message: error.message } 
                  }));
                }
              }
            } catch (err) {
              console.error('❌ Exception during session setup:', err);
            }
          } else {
            console.log('⚠️ Missing tokens:', { access_token: !!access_token, refresh_token: !!refresh_token });
          }
        } catch (error) {
          console.error('❌ OAuth processing error:', error);
        }
      }
    });
    
    // 앱 재개 시 세션 복원
    CapacitorApp.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        console.log('📱 앱이 활성화됨 - 세션 확인');
        const session = await oauthService.restoreSession();
        if (session) {
          console.log('✅ 세션 복원 성공:', session.user?.email);
        }
      }
    });
  }
  
  // 웹에서만 초기 세션 확인
  if (!Capacitor.isNativePlatform()) {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        console.log('✅ 기존 세션 확인:', user.email);
      } else {
        console.log('❌ 로그인되지 않은 상태');
      }
    } catch (error) {
      console.error('❌ 세션 확인 실패:', error);
    }
  } else {
    console.log('📱 모바일 환경: 자동 세션 확인 건너뛰기');
  }
});
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
