<template>
  <div class="mobile-callback">
    <div class="container">
      <h2>로그인 완료</h2>
      <p>앱으로 돌아가는 중...</p>
      <button @click="openApp" class="open-app-btn">앱 열기</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  console.log('📱 Mobile OAuth callback 페이지 로드');
  
  // 자동으로 앱 열기 시도
  setTimeout(() => {
    openApp();
  }, 1000);
});

const openApp = () => {
  console.log('🚀 앱 열기 시도');
  // Deep link로 앱 열기
  window.location.href = 'com.tarotgarden.app://auth/success';
  
  // 3초 후 앱이 열리지 않으면 안내 메시지
  setTimeout(() => {
    console.log('⚠️ 앱이 열리지 않은 경우');
    // 사용자가 수동으로 앱으로 돌아갈 수 있도록 안내
  }, 3000);
};
</script>

<style scoped>
.mobile-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  text-align: center;
  padding: 2rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.open-app-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.open-app-btn:hover {
  transform: scale(1.05);
}
</style>