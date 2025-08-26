<template>
  <div class="oauth-bridge">
    <div class="loading-container">
      <div class="spinner"></div>
      <h2>로그인 처리 중...</h2>
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { supabase } from '../services/supabase';

const statusMessage = ref('잠시만 기다려주세요...');

onMounted(async () => {
  console.log('🌉 OAuth Bridge 페이지 진입');
  console.log('현재 URL:', window.location.href);
  
  try {
    // URL에서 토큰 추출 (hash 또는 query string)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    const access_token = hashParams.get('access_token') || queryParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');
    const error = hashParams.get('error') || queryParams.get('error');
    
    console.log('토큰 확인:', { 
      hasAccessToken: !!access_token, 
      hasRefreshToken: !!refresh_token,
      error 
    });
    
    if (error) {
      statusMessage.value = '로그인 중 오류가 발생했습니다.';
      console.error('OAuth 에러:', error);
      
      // 3초 후 앱으로 돌아가기
      setTimeout(() => {
        window.location.href = 'com.tarotgarden.app://auth/error';
      }, 3000);
      return;
    }
    
    if (access_token && refresh_token) {
      statusMessage.value = '로그인 성공! 앱으로 돌아갑니다...';
      
      // 세션 설정
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });
      
      if (sessionError) {
        console.error('세션 설정 실패:', sessionError);
        statusMessage.value = '세션 설정 실패. 다시 시도해주세요.';
        setTimeout(() => {
          window.location.href = 'com.tarotgarden.app://auth/error';
        }, 3000);
        return;
      }
      
      console.log('✅ 세션 설정 성공:', data.user?.email);
      
      // 앱으로 돌아가기 (토큰 포함)
      const appUrl = `com.tarotgarden.app://auth/callback#access_token=${access_token}&refresh_token=${refresh_token}`;
      console.log('앱으로 리다이렉트:', appUrl);
      
      // 먼저 앱 열기 시도
      window.location.href = appUrl;
      
      // 2초 후에도 페이지에 있다면 대체 방법 시도
      setTimeout(() => {
        // 대체 방법 1: intent URL 사용 (Android)
        const intentUrl = `intent://auth/callback#access_token=${access_token}&refresh_token=${refresh_token}#Intent;scheme=com.tarotgarden.app;package=com.tarotgarden.app;end`;
        window.location.href = intentUrl;
      }, 2000);
      
      // 5초 후에도 페이지에 있다면 안내 메시지
      setTimeout(() => {
        statusMessage.value = '앱으로 돌아갈 수 없습니다. 앱을 직접 실행해주세요.';
      }, 5000);
      
    } else {
      // 토큰이 없는 경우 - Supabase 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ 기존 세션 발견:', session.user?.email);
        statusMessage.value = '로그인 성공! 앱으로 돌아갑니다...';
        
        // 세션의 토큰으로 앱 열기
        const appUrl = `com.tarotgarden.app://auth/callback#access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
        window.location.href = appUrl;
      } else {
        statusMessage.value = '로그인 정보를 찾을 수 없습니다.';
        setTimeout(() => {
          window.location.href = 'com.tarotgarden.app://auth/error';
        }, 3000);
      }
    }
    
  } catch (error) {
    console.error('OAuth Bridge 처리 실패:', error);
    statusMessage.value = '오류가 발생했습니다. 앱으로 돌아갑니다...';
    setTimeout(() => {
      window.location.href = 'com.tarotgarden.app://auth/error';
    }, 3000);
  }
});
</script>

<style scoped>
.oauth-bridge {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
}

.loading-container {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  max-width: 300px;
  margin: 0 auto;
}
</style>