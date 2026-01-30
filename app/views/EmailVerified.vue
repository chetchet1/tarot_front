<template>
  <div class="email-verified">
    <div class="card">
      <div class="icon">✅</div>
      <h1>이메일 인증 완료</h1>
      <p>이제 앱으로 돌아가 로그인할 수 있어요.</p>
      <div class="actions">
        <button class="btn btn-primary" @click="openApp">
          앱 열기
        </button>
        <button class="btn btn-secondary" @click="goHome">
          웹 홈으로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const openApp = () => {
  window.location.href = 'com.tarotgarden.app://auth/callback';
};

const goHome = () => {
  window.location.href = '/';
};
</script>

<style scoped>
.email-verified {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  text-align: center;
}

.card {
  width: min(420px, 100%);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 28px 24px;
  backdrop-filter: blur(10px);
}

.icon {
  font-size: 40px;
  margin-bottom: 12px;
}

h1 {
  font-size: 22px;
  margin: 0 0 10px 0;
}

p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 18px 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
