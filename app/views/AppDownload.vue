<template>
  <div class="app-download-prompt">
    <div class="container">
      <!-- 헤더 -->
      <header class="header">
        <div class="logo">
          <span class="logo-icon">🔮</span>
          <span class="logo-text">타로의 정원</span>
        </div>
      </header>

      <!-- 메인 콘텐츠 -->
      <main class="main-content">
        <!-- 앱 아이콘 -->
        <div class="app-icon">
          <img src="/tarot-garden-icon.png" alt="타로의 정원" @error="onIconError">
        </div>

        <!-- 앱 정보 -->
        <div class="app-info">
          <h1>타로의 정원</h1>
          <p class="tagline">마법같은 타로 점술 앱</p>
          
          <div class="features">
            <div class="feature">
              <span class="feature-icon">🔮</span>
              <span>다양한 타로 배열법</span>
            </div>
            <div class="feature">
              <span class="feature-icon">☀️</span>
              <span>매일 오늘의 카드</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🌿</span>
              <span>익명 커뮤니티</span>
            </div>
          </div>
        </div>

        <!-- 다운로드 버튼 -->
        <div class="download-section">
          <button @click="downloadApp" class="download-button primary">
            <svg class="download-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L2 21C2 21.5523 2.44772 22 3 22L21 22C21.5523 22 22 21.5523 22 21L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ downloadButtonText }}</span>
          </button>
          
          <!-- 개발 환경에서만 표시 -->
          <button v-if="isDevelopment" @click="continueInBrowser" class="download-button secondary">
            웹에서 계속하기 (개발용)
          </button>
        </div>

        <!-- 스토어 배지 (데스크톱용) -->
        <div v-if="isDesktop" class="store-badges">
          <a href="#" 
             @click.prevent="downloadApp"
             class="store-badge">
            <!-- Google Play 배지 SVG -->
            <svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="60" rx="8" fill="#000000"/>
              <g transform="translate(20, 15)">
                <!-- Play Store Icon Simplified -->
                <path d="M0 5L15 15L0 25V5Z" fill="#48ff48" opacity="0.9"/>
                <path d="M15 15L20 12L25 15L20 18L15 15Z" fill="#ffD400" opacity="0.9"/>
                <path d="M0 25L15 15L20 18L0 30V25Z" fill="#00d4ff" opacity="0.9"/>
                <path d="M0 5L15 15L20 12L0 0V5Z" fill="#ff4848" opacity="0.9"/>
              </g>
              <text x="55" y="25" fill="white" font-family="Arial, sans-serif" font-size="11">다음에서 다운로드</text>
              <text x="55" y="42" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Google Play</text>
            </svg>
          </a>
          <!-- iOS 출시 후 추가
          <a href="https://apps.apple.com/app/id1234567890" 
             target="_blank" 
             class="store-badge">
            <svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="60" rx="8" fill="#000000"/>
              <g transform="translate(25, 18)">
                <path d="M12 2C11.5 0.8 10.3 0 9 0C7.7 0 6.5 0.8 6 2C4 2.5 2.5 4 2 6C0.8 6.5 0 7.7 0 9C0 10.3 0.8 11.5 2 12C2.5 14 4 15.5 6 16C6.5 17.2 7.7 18 9 18C10.3 18 11.5 17.2 12 16C14 15.5 15.5 14 16 12C17.2 11.5 18 10.3 18 9C18 7.7 17.2 6.5 16 6C15.5 4 14 2.5 12 2Z" fill="white"/>
              </g>
              <text x="55" y="25" fill="white" font-family="Arial, sans-serif" font-size="11">다음에서 다운로드</text>
              <text x="55" y="42" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">App Store</text>
            </svg>
          </a>
          -->
        </div>

        <!-- 공유 콘텐츠 미리보기 -->
        <div v-if="hasSharedContent" class="shared-preview">
          <p class="preview-label">🔮 친구가 공유한 타로 점괘가 있어요!</p>
          <p class="preview-hint">앱을 설치하면 더 많은 기능을 이용할 수 있습니다</p>
        </div>
      </main>

      <!-- 푸터 -->
      <footer class="footer">
        <p class="footer-text">© 2024 타로의 정원. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { detectPlatform, getAppStoreUrl } from '../utils/platformDetector';

const route = useRoute();
const router = useRouter();

// 개발 환경 체크
const isDevelopment = import.meta.env.MODE !== 'production';

// 플랫폼 정보
const platform = ref(detectPlatform());
const isDesktop = computed(() => platform.value.isDesktop);
const isAndroid = computed(() => platform.value.isAndroid);
const isIOS = computed(() => platform.value.isIOS);

// 공유 콘텐츠 여부
const hasSharedContent = computed(() => {
  // 이전 경로가 공유 페이지인지 체크
  return route.query.from === 'share' || route.query.shareId;
});

// 다운로드 버튼 텍스트
const downloadButtonText = computed(() => {
  if (isIOS.value) {
    return 'App Store에서 다운로드';
  } else if (isAndroid.value) {
    return 'Google Play에서 다운로드';
  } else {
    return '앱 다운로드';
  }
});

// 앱 다운로드
const downloadApp = () => {
  // Play Store URL (패키지명: com.tarotgarden.app)
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tarotgarden.app';
  
  // 스토어 링크로 이동
  window.open(playStoreUrl, '_blank');
};

// 웹에서 계속하기
const continueInBrowser = () => {
  // 공유 ID가 있으면 공유 페이지로, 없으면 홈으로
  if (route.query.shareId) {
    router.push(`/s/${route.query.shareId}`);
  } else {
    router.push('/');
  }
};

// 아이콘 에러 처리
const onIconError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 대체 아이콘 표시
  img.style.display = 'none';
  if (img.parentElement) {
    img.parentElement.innerHTML = '🔮';
    img.parentElement.style.fontSize = '80px';
  }
};

// 배지 에러 처리
const onBadgeError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 텍스트 링크로 대체
  const link = img.parentElement;
  if (link) {
    link.innerHTML = isAndroid.value ? 'Google Play에서 다운로드' : 'App Store에서 다운로드';
    link.classList.add('text-badge');
  }
};

// 마운트 시 플랫폼 재확인
onMounted(() => {
  platform.value = detectPlatform();
  
  // 만약 이미 앱 내부라면 홈으로 리다이렉트
  if (platform.value.isCapacitor || platform.value.isInApp) {
    router.push('/');
  }
});
</script>

<style scoped>
.app-download-prompt {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

/* 헤더 */
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

/* 메인 콘텐츠 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 40px 0;
}

/* 앱 아이콘 */
.app-icon {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 앱 정보 */
.app-info {
  text-align: center;
}

.app-info h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
}

.tagline {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

/* 기능 목록 */
.features {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.feature {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
}

.feature-icon {
  font-size: 20px;
}

/* 다운로드 섹션 */
.download-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.download-button.primary {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
}

.download-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
}

.download-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.download-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.download-icon {
  width: 24px;
  height: 24px;
}

/* 스토어 배지 */
.store-badges {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.store-badge {
  display: block;
  height: 50px;
}

.store-badge img {
  height: 100%;
  width: auto;
}

.store-badge.text-badge {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.store-badge.text-badge:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* 공유 미리보기 */
.shared-preview {
  text-align: center;
  padding: 20px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.preview-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.preview-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 푸터 */
.footer {
  padding: 20px 0;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .app-info h1 {
    font-size: 28px;
  }
  
  .tagline {
    font-size: 16px;
  }
  
  .features {
    align-items: flex-start;
    padding: 0 20px;
  }
  
  .feature {
    justify-content: flex-start;
  }
}
</style>
