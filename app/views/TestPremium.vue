<template>
  <div class="test-premium">
    <h1>프리미엄 상태 테스트</h1>
    
    <div class="user-info">
      <h2>현재 사용자 정보</h2>
      <p>로그인 상태: {{ userStore.isLoggedIn ? '로그인됨' : '익명' }}</p>
      <p>프리미엄 상태: {{ userStore.isPremium ? '프리미엄' : '무료' }}</p>
      <p>사용자 ID: {{ userStore.currentUser?.id || '없음' }}</p>
      <p>이메일: {{ userStore.currentUser?.email || '없음' }}</p>
    </div>
    
    <div class="premium-actions">
      <h2>프리미엄 테스트</h2>
      <button @click="upgradeToPremium" class="btn btn-primary">
        프리미엄 업그레이드
      </button>
      <button @click="downgradeToPremium" class="btn btn-secondary">
        프리미엄 다운그레이드 (테스트용)
      </button>
      <button @click="cancelSubscription" class="btn btn-danger">
        구독 취소 (기록 삭제)
      </button>
      <button @click="refreshPremiumStatus" class="btn btn-info">
        프리미엄 상태 새로고침
      </button>
    </div>
    
    <div class="reading-test">
      <h2>리딩 테스트</h2>
      <button @click="createTestReading" class="btn btn-success">
        테스트 리딩 생성
      </button>
    </div>
    
    <div v-if="testReading" class="test-result">
      <h2>테스트 리딩 결과</h2>
      <pre>{{ JSON.stringify(testReading, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';

const userStore = useUserStore();
const tarotStore = useTarotStore();

const testReading = ref(null);

const upgradeToPremium = async () => {
  await userStore.upgradeToPremium();
  alert('프리미엄으로 업그레이드되었습니다!');
};

const downgradeToPremium = async () => {
  await userStore.downgradeToPremium();
  alert('프리미엄이 해제되었습니다! (테스트용 - 기록은 유지됨)');
};

const cancelSubscription = async () => {
  if (confirm('정말로 구독을 취소하시겠습니까?\n\n경고: 모든 기록이 즉시 삭제됩니다!')) {
    try {
      await userStore.cancelSubscription();
      alert('구독이 취소되고 모든 기록이 삭제되었습니다.');
    } catch (error) {
      console.error('구독 취소 실패:', error);
      alert('구독 취소에 실패했습니다.');
    }
  }
};

const refreshPremiumStatus = async () => {
  const status = await userStore.refreshPremiumStatus();
  alert(`프리미엄 상태: ${status ? '프리미엄' : '무료'}`);
};

const createTestReading = async () => {
  try {
    const reading = await tarotStore.createReading('celtic_cross', 'general', '테스트 질문');
    testReading.value = reading;
    console.log('생성된 리딩:', reading);
    
    // 프리미엄 분석 데이터 확인
    console.log('프리미엄 인사이트:', reading.premiumInsights);
    console.log('카드 조합:', reading.cardCombinations);
    console.log('심층 해석:', reading.deepInterpretation);
    console.log('확률 분석:', reading.probabilityAnalysis);
  } catch (error) {
    console.error('리딩 생성 실패:', error);
    alert('리딩 생성 실패!');
  }
};
</script>

<style scoped>
.test-premium {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.user-info, .premium-actions, .reading-test, .test-result {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 0.9;
}

.btn-primary {
  background: #4CAF50;
}

.btn-secondary {
  background: #6B7280;
}

.btn-danger {
  background: #f44336;
}

.btn-info {
  background: #3B82F6;
}

.btn-success {
  background: #10B981;
}

pre {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}

h1 {
  color: #A855F7;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #E5E7EB;
  margin-bottom: 15px;
}

p {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.8);
}
</style>
