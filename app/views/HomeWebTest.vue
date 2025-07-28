<template>
  <div class="home-test">
    <h1>타로 앱 테스트</h1>
    
    <div class="debug-info">
      <h3>디버그 정보:</h3>
      <p>showLogin: {{ showLogin }}</p>
      <p>userStore.isLoggedIn: {{ userStore.isLoggedIn }}</p>
      <p>currentUser: {{ userStore.currentUser?.email || '없음' }}</p>
    </div>

    <div class="test-buttons">
      <button @click="testClick" class="test-btn">
        테스트 클릭
      </button>
      
      <button @click="showLoginModal" class="test-btn">
        로그인 모달 열기
      </button>
      
      <button @click="toggleShowLogin" class="test-btn">
        showLogin 토글
      </button>
    </div>

    <!-- 로그인 모달 -->
    <LoginModal 
      :isVisible="showLogin" 
      @close="showLogin = false" 
      @success="handleLoginSuccess"
    />
    
    <!-- 간단한 모달 테스트 -->
    <div v-if="showLogin" class="simple-modal">
      <div class="modal-backdrop" @click="showLogin = false">
        <div class="modal-content" @click.stop>
          <h2>테스트 모달</h2>
          <p>showLogin이 true일 때 이 모달이 표시됩니다.</p>
          <button @click="showLogin = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '../store/user';
import LoginModal from '../components/LoginModal.vue';

const userStore = useUserStore();
const showLogin = ref(false);

onMounted(() => {
  console.log('HomeWebTest 마운트됨');
  console.log('초기 showLogin 값:', showLogin.value);
});

// showLogin 값 변화 감지
watch(showLogin, (newVal, oldVal) => {
  console.log(`showLogin 변경: ${oldVal} -> ${newVal}`);
});

const testClick = () => {
  console.log('테스트 클릭 버튼 클릭됨');
  alert('버튼이 정상적으로 작동합니다!');
};

const showLoginModal = () => {
  console.log('로그인 모달 열기 클릭됨');
  console.log('클릭 전 showLogin 값:', showLogin.value);
  showLogin.value = true;
  console.log('클릭 후 showLogin 값:', showLogin.value);
};

const toggleShowLogin = () => {
  console.log('토글 버튼 클릭됨');
  showLogin.value = !showLogin.value;
  console.log('토글 후 showLogin 값:', showLogin.value);
};

const handleLoginSuccess = (type: string) => {
  console.log(`로그인 성공: ${type}`);
  showLogin.value = false;
};
</script>

<style scoped>
.home-test {
  padding: 2rem;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  min-height: 100vh;
  color: white;
}

.debug-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.test-buttons {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.test-btn {
  padding: 1rem 2rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.test-btn:hover {
  background: #4f46e5;
}

.simple-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  color: black;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.modal-content button {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
