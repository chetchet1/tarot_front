<template>
  <div v-if="!userStore.isPremium" class="ad-banner-container">
    <div class="ad-banner">
      <div v-if="Platform.isWeb" class="demo-ad-banner">
        <div class="ad-content-wrapper">
          <div class="ad-icon">🔮</div>
          <div class="ad-text">
            <h4>타로의 정원 프리미엄</h4>
            <p>광고 없이 모든 기능을 무제한으로 이용하세요</p>
          </div>
          <router-link to="/premium" class="ad-cta-button">
            구독하기
          </router-link>
        </div>
        <p class="ad-label">광고</p>
      </div>
      <div v-else class="mobile-ad-banner">
        <!-- 실제 모바일 광고 배너가 표시될 영역 -->
        <div class="ad-placeholder">
          <p>광고 로딩 중...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import { Platform } from '@/utils/platform';
import { onMounted, onUnmounted } from 'vue';

const userStore = useUserStore();

// 모바일에서 실제 광고를 로드하는 로직
onMounted(() => {
  if (!Platform.isWeb && !userStore.isPremium) {
    // 실제 모바일 광고 로드 로직
    console.log('배너 광고 로드');
  }
});

onUnmounted(() => {
  if (!Platform.isWeb && !userStore.isPremium) {
    // 광고 정리 로직
    console.log('배너 광고 정리');
  }
});
</script>

<style scoped>
.ad-banner-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ad-banner {
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  position: relative;
}

/* 데모 광고 배너 (웹) */
.demo-ad-banner {
  width: 100%;
  max-width: 728px;
  margin: 0 auto;
  position: relative;
}

.ad-content-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
}

.ad-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.ad-text {
  flex: 1;
  min-width: 0;
}

.ad-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.ad-text p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.ad-cta-button {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.ad-cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.ad-label {
  position: absolute;
  top: 4px;
  left: 4px;
  margin: 0;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  border-radius: 4px;
  font-weight: 500;
}

/* 모바일 광고 배너 */
.mobile-ad-banner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .ad-banner {
    padding: 6px 12px;
  }
  
  .ad-content-wrapper {
    gap: 12px;
    padding: 10px 12px;
  }
  
  .ad-icon {
    font-size: 24px;
  }
  
  .ad-text h4 {
    font-size: 13px;
  }
  
  .ad-text p {
    font-size: 11px;
  }
  
  .ad-cta-button {
    font-size: 12px;
    padding: 6px 16px;
  }
}

@media (max-width: 480px) {
  .ad-text p {
    display: none;
  }
}
</style>