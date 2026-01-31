<template>
  <div class="email-verified">
    <div class="card">
      <div class="icon">메일</div>
      <h1>이메일 인증 완료</h1>
      <p>이제 앱으로 돌아가 로그인하실 수 있어요.</p>
      <div class="actions">
        <button class="btn btn-primary" @click="openApp">
          앱으로 열기
        </button>
        <button class="btn btn-secondary" @click="goHome">
          홈으로 이동
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
  width: 100%;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  padding-left: calc(24px + env(safe-area-inset-left));
  padding-right: calc(24px + env(safe-area-inset-right));
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  color: white;
  text-align: center;
  box-sizing: border-box;
}

.card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 28px 24px;
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  overflow: hidden;
}

.icon {
  font-size: 22px;
  margin-bottom: 12px;
  font-weight: 700;
}

h1 {
  font-size: 22px;
  margin: 0 0 10px 0;
}

p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 18px 0;
  word-break: break-word;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
</style>
