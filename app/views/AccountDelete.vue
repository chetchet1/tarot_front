<template>
  <div class="account-delete-page">
    <div class="container">
      <header class="header">
        <div class="logo">
          <span class="logo-icon">🔮</span>
          <span class="logo-text">타로의 정원</span>
        </div>
      </header>

      <main class="main-content">
        <h1>계정 삭제 안내</h1>
        <p class="subtitle">Account Deletion Instructions</p>

        <div class="info-card">
          <h2>계정 삭제 방법</h2>
          <ol class="steps">
            <li>타로의 정원 앱을 실행합니다</li>
            <li>우측 상단 메뉴 (☰)를 탭합니다</li>
            <li><strong>🗑️ 계정 삭제</strong>를 탭합니다</li>
            <li>탈퇴 사유를 선택합니다</li>
            <li><strong>저장 후 탈퇴</strong> 버튼을 탭하여 삭제를 확인합니다</li>
          </ol>
        </div>

        <div class="info-card">
          <h2>삭제되는 데이터</h2>
          <ul class="data-list">
            <li>계정 정보 (이메일, 프로필)</li>
            <li>점술 기록 및 저장된 카드 데이터</li>
            <li>구독 정보 및 결제 이력</li>
            <li>커뮤니티 게시글 및 댓글</li>
          </ul>
          <p class="warning">계정 삭제는 즉시 처리되며, 삭제 후에는 복구할 수 없습니다.</p>
        </div>

        <div class="info-card">
          <h2>데이터 보관 기간</h2>
          <p>계정 삭제 요청 시 모든 개인 데이터는 즉시 삭제됩니다. 단, 법적 의무에 따라 결제 관련 기록은 관련 법령에서 정한 기간 동안 보관될 수 있습니다.</p>
        </div>

        <div class="info-card">
          <h2>문의</h2>
          <p>계정 삭제와 관련하여 문의 사항이 있으시면 아래 이메일로 연락해 주세요.</p>
          <p class="contact-email">📧 chetchet28@gmail.com</p>
        </div>

        <div class="download-section">
          <button @click="openApp" class="download-button primary">
            앱에서 계정 삭제하기
          </button>
          <button @click="openPlayStore" class="download-button secondary">
            Google Play에서 설치
          </button>
        </div>
      </main>

      <footer class="footer">
        <p class="footer-text">© 2024 타로의 정원. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const openApp = () => {
  // 딥링크로 앱 열기 시도
  window.location.href = 'com.tarotgarden.app://app';
  // 앱이 없으면 Play Store로
  setTimeout(() => {
    openPlayStore();
  }, 2000);
};

const openPlayStore = () => {
  window.open('https://play.google.com/store/apps/details?id=com.tarotgarden.app', '_blank');
};
</script>

<style scoped>
.account-delete-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  padding: 20px 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: 700;
}

.logo-icon {
  font-size: 32px;
}

.main-content {
  padding: 20px 0 40px;
}

.main-content h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
}

.info-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}

.info-card h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.info-card p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
}

.steps {
  list-style: none;
  counter-reset: step;
  padding: 0;
}

.steps li {
  counter-increment: step;
  padding: 8px 0 8px 36px;
  position: relative;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
}

.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.3);
  color: #A855F7;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-list {
  list-style: none;
  padding: 0;
}

.data-list li {
  padding: 6px 0 6px 20px;
  position: relative;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.data-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #EF4444;
}

.warning {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #FCA5A5;
  font-size: 13px;
}

.contact-email {
  margin-top: 8px;
  font-size: 16px;
  color: #A855F7;
  font-weight: 500;
}

.download-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-button.primary {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.download-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
}

.download-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.download-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.footer {
  padding: 20px 0;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
