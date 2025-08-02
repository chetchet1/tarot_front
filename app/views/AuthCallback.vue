<template>
  <div class="auth-callback">
    <div class="loading-container">
      <div class="spinner"></div>
      <h2>로그인 처리 중...</h2>
      <p>잠시만 기다려주세요</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/supabase';
import { oauthService } from '../services/oauth';
import { useUserStore } from '../store/user';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  console.log('🔐 OAuth 콜백 페이지 진입');
  console.log('현재 URL:', window.location.href);
  
  try {
    // 모바일 환경인지 확인
    if (Capacitor.isNativePlatform()) {
      console.log('📱 모바일 환경 감지 - 딥링크로 처리됨');
      // 모바일에서는 App.vue의 딥링크 리스너가 처리하므로
      // 여기서는 단순히 로딩 화면만 표시
      return;
    }
    
    // 웹 환경에서만 해시에서 토큰 추출
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');
    const error = hashParams.get('error');
    const error_description = hashParams.get('error_description');
    
    if (error) {
      console.error('❌ OAuth 에러:', error, error_description);
      await router.push({
        path: '/login',
        query: { error: error_description || '로그인 중 오류가 발생했습니다.' }
      });
      return;
    }
    
    if (access_token && refresh_token) {
      console.log('✅ 토큰 발견 - 세션 설정 중...');
      
      // 세션 설정
      await oauthService.setSession(access_token, refresh_token);
      
      // 사용자 정보 초기화
      await userStore.initializeUser();
      
      console.log('✅ 로그인 완료 - 홈으로 이동');
      await router.push('/home');
    } else {
      console.log('⚠️ 토큰이 없음 - 로그인 페이지로 이동');
      await router.push('/login');
    }
  } catch (error) {
    console.error('❌ 콜백 처리 실패:', error);
    await router.push({
      path: '/login',
      query: { error: '로그인 처리 중 오류가 발생했습니다.' }
    });
  }
});
</script>

<style scoped>
.auth-callback {
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
}
</style>
