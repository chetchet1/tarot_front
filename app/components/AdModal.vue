<template>
  <div class="modal-backdrop" @click="close">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">광고 시청</h2>
      
      <div class="ad-container">
        <div class="ad-placeholder">
          <div class="ad-content" v-if="Platform.isWeb">
            <div class="demo-ad">
              <h3>타로의 정원 프리미엄</h3>
              <p>광고 없이 무제한 점괘</p>
              <div class="demo-ad-cta">지금 가입하기</div>
            </div>
            <p class="ad-info">데스크톱 테스트 모드에서는 데모 광고가 표시됩니다</p>
          </div>
          <div class="mobile-ad" v-else>
            <p>모바일 광고가 로딩 중입니다</p>
            <div class="loading-spinner"></div>
          </div>
          <p class="ad-timer">{{ countdown }}초 후에 닫을 수 있습니다</p>
        </div>
      </div>

      <div class="modal-actions">
        <button 
          class="btn btn-primary" 
          @click="close"
          :disabled="countdown > 0"
        >
          {{ countdown > 0 ? `${countdown}초 대기` : '계속하기' }}
        </button>
      </div>

      <div class="premium-hint">
        <p>광고 없이 이용하고 싶으신가요?</p>
        <router-link v-if="Platform.isWeb" to="/premium" class="premium-link">
          프리미엄 구독하기
        </router-link>
        <span v-else class="premium-link" @click="navigateToPremium">
          프리미엄 구독하기
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '@/store/user';
import { Platform } from '@/utils/platform';
import { showInterstitialAd } from '@/services/admob';

const emit = defineEmits(['close']);
const userStore = useUserStore();

const countdown = ref(5); // 5초 대기
let timer: number;

onMounted(async () => {
  // 모바일에서는 실제 광고 로드
  if (Platform.isMobile) {
    try {
      const adShown = await showInterstitialAd();
      if (adShown) {
        console.log('📱 전면 광고 표시 성공');
      } else {
        console.log('📱 전면 광고 표시 실패, 카운트다운 진행');
      }
    } catch (error) {
      console.error('📱 광고 로드 실패:', error);
    }
  }

  // 카운트다운 시작
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const close = () => {
  if (countdown.value === 0) {
    userStore.incrementFreeReading();
    emit('close');
  }
};

// 모바일에서 프리미엄 페이지로 네비게이션
const navigateToPremium = () => {
  if (Platform.isMobile) {
    // TODO: NativeScript/Capacitor 네비게이션 구현
    console.log('Navigate to premium page');
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #A855F7;
}

.ad-container {
  margin: 20px 0;
}

.ad-placeholder {
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.demo-ad {
  background: linear-gradient(135deg, #A855F7 0%, #F59E0B 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  width: 100%;
  max-width: 300px;
}

.demo-ad h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: white;
}

.demo-ad p {
  font-size: 14px;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.9);
}

.demo-ad-cta {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-ad-cta:hover {
  background: rgba(255, 255, 255, 0.3);
}

.mobile-ad {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(168, 85, 247, 0.1);
  border-left: 4px solid #A855F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ad-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.ad-timer {
  font-size: 18px;
  font-weight: 600;
  color: #A855F7;
}

.modal-actions {
  margin: 30px 0 20px;
  text-align: center;
}

.btn {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.premium-hint {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.premium-hint p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.premium-link {
  color: #F59E0B;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.premium-link:hover {
  text-decoration: underline;
  color: #FBBF24;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 20px;
    padding: 20px;
  }
  
  .ad-placeholder {
    min-height: 200px;
  }
  
  .demo-ad {
    max-width: 250px;
  }
}
</style>
