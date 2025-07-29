<template>
  <div class="premium-test-panel" v-if="showPanel">
    <div class="panel-header">
      <h3>🧪 프리미엄 테스트 패널</h3>
      <button class="close-btn" @click="togglePanel">×</button>
    </div>
    
    <div class="panel-content">
      <div class="user-info">
        <p><strong>사용자:</strong> {{ userInfo }}</p>
        <p><strong>현재 상태:</strong> 
          <span :class="{ premium: isPremium, free: !isPremium }">
            {{ isPremium ? '🌟 프리미엄' : '📱 무료' }}
          </span>
        </p>
      </div>
      
      <div class="actions">
        <button 
          class="btn premium-btn" 
          @click="upgradeToPremium"
          :disabled="isPremium"
        >
          ⬆️ 프리미엄 업그레이드
        </button>
        
        <button 
          class="btn downgrade-btn" 
          @click="downgradeToFree"
          :disabled="!isPremium"
        >
          ⬇️ 무료로 다운그레이드
        </button>
        
        <button 
          class="btn refresh-btn" 
          @click="refreshStatus"
        >
          🔄 상태 새로고침
        </button>
      </div>
      
      <div class="free-readings-info" v-if="!isPremium">
        <h4>무료 점괘 현황</h4>
        <div class="reading-stats">
          <p>오늘 사용: {{ freeReadingStatus.used }} / {{ freeReadingStatus.total }}</p>
          <p>남은 횟수: {{ freeReadingStatus.remaining }}</p>
          <button class="btn reset-btn" @click="resetFreeReadings">
            🔄 무료 횟수 리셋
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const showPanel = ref(false);

const isPremium = computed(() => userStore.isPremium);
const currentUser = computed(() => userStore.currentUser);

const userInfo = computed(() => {
  if (!currentUser.value) return '미확인';
  if (currentUser.value.isAnonymous) return '익명 사용자';
  return `${currentUser.value.email} (${currentUser.value.name})`;
});

const freeReadingStatus = computed(() => userStore.getFreeReadingStatus());

const togglePanel = () => {
  showPanel.value = !showPanel.value;
};

// MainApp에서 보낸 이벤트 수신
window.addEventListener('toggle-test-panel', () => {
  showPanel.value = !showPanel.value;
});

const upgradeToPremium = async () => {
  try {
    await userStore.upgradeToPremium();
    alert('프리미엄으로 업그레이드되었습니다! 🌟');
  } catch (error) {
    alert('업그레이드 실패: ' + error);
  }
};

const downgradeToFree = async () => {
  try {
    await userStore.downgradeToPremium();
    alert('무료 계정으로 다운그레이드되었습니다! 📱');
  } catch (error) {
    alert('다운그레이드 실패: ' + error);
  }
};

const refreshStatus = async () => {
  try {
    await userStore.refreshPremiumStatus();
    alert('상태가 새로고침되었습니다! 🔄');
  } catch (error) {
    alert('새로고침 실패: ' + error);
  }
};

const resetFreeReadings = () => {
  userStore.resetFreeReadings();
  alert('무료 점괘 횟수가 리셋되었습니다! 🔄');
};

// 개발 환경에서만 표시
onMounted(() => {
  // 프로덕션에서는 숨김
  if (import.meta.env.MODE === 'production') {
    // 숨김 처리하지만 완전히 제거하지는 않음 (테스트용)
  }
});
</script>

<style scoped>
.premium-test-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(20, 20, 30, 0.95);
  border: 1px solid #444;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  z-index: 9999;
  font-size: 14px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #444;
  color: #fff;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-content {
  padding: 16px;
}

.user-info {
  margin-bottom: 16px;
  color: #ccc;
}

.user-info p {
  margin: 4px 0;
}

.premium {
  color: #ffd700;
  font-weight: bold;
}

.free {
  color: #999;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.premium-btn {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
}

.premium-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.downgrade-btn {
  background: #666;
  color: #fff;
}

.downgrade-btn:hover:not(:disabled) {
  background: #777;
}

.refresh-btn {
  background: #4CAF50;
  color: #fff;
}

.refresh-btn:hover {
  background: #45a049;
}

.reset-btn {
  background: #f44336;
  color: #fff;
  font-size: 11px;
  padding: 6px 10px;
}

.reset-btn:hover {
  background: #da190b;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.free-readings-info {
  border-top: 1px solid #444;
  padding-top: 16px;
  color: #ccc;
}

.free-readings-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #fff;
}

.reading-stats p {
  margin: 4px 0;
  font-size: 12px;
}



/* 모바일 대응 */
@media (max-width: 768px) {
  .premium-test-panel {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>
