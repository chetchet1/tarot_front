<template>
  <div class="mobile-callback">
    <div class="loading-container">
      <div class="spinner"></div>
      <h2>로그인 처리 중...</h2>
      <p>앱으로 돌아가는 중입니다</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  // URL 해시에서 토큰 추출
  const hash = window.location.hash;
  
  console.log('[MobileCallback] 페이지 로드됨');
  console.log('[MobileCallback] Hash:', hash);
  
  if (hash) {
    // Deep Link로 앱 열기
    const deepLink = `com.tarotgarden.app://auth/callback${hash}`;
    console.log('[MobileCallback] Deep Link 리다이렉트:', deepLink);
    
    // 앱으로 리다이렉트
    window.location.href = deepLink;
    
    // 3초 후에도 페이지에 있으면 앱이 설치되지 않은 것
    setTimeout(() => {
      console.log('[MobileCallback] 앱이 열리지 않음 - 웹으로 처리');
      // 웹 auth callback으로 리다이렉트
      window.location.href = `/auth/callback${hash}`;
    }, 3000);
  } else {
    console.error('[MobileCallback] 토큰이 없음');
    // 홈으로 리다이렉트
    window.location.href = '/';
  }
});
</script>

<style scoped>
.mobile-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  opacity: 0.8;
}
</style>