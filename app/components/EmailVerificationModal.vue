<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="verification-modal">
          <!-- 헤더 -->
          <div class="modal-header">
            <div class="icon-container">
              <div class="email-icon">📧</div>
            </div>
            <h2 class="modal-title">이메일 인증</h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <!-- 콘텐츠 -->
          <div class="modal-content">
            <div class="verification-info">
              <h3>회원가입이 완료되었습니다!</h3>
              <p class="verification-message">
                <strong>{{ email }}</strong>로 인증 메일을 보내드렸습니다.
              </p>
              
              <div class="steps">
                <div class="step">
                  <span class="step-number">1</span>
                  <span class="step-text">이메일 받은편지함을 확인해주세요</span>
                </div>
                <div class="step">
                  <span class="step-number">2</span>
                  <span class="step-text">인증 링크를 클릭해주세요</span>
                </div>
                <div class="step">
                  <span class="step-number">3</span>
                  <span class="step-text">앱으로 돌아와서 로그인해주세요</span>
                </div>
              </div>

              <div class="warning-box">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                  <p><strong>이메일이 보이지 않나요?</strong></p>
                  <ul>
                    <li>스팸함을 확인해보세요</li>
                    <li>이메일 주소를 정확히 입력했는지 확인해보세요</li>
                    <li>몇 분 후에 도착할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 액션 버튼들 -->
            <div class="action-buttons">
              <button 
                class="resend-btn" 
                @click="resendEmail"
                :disabled="isResending || resendCooldown > 0"
              >
                <span v-if="resendCooldown > 0">
                  다시 보내기 ({{ resendCooldown }}초)
                </span>
                <span v-else-if="isResending">
                  전송 중...
                </span>
                <span v-else>
                  인증 메일 다시 보내기
                </span>
              </button>

              <button class="login-btn" @click="goToLogin">
                로그인하기
              </button>
            </div>

            <!-- 성공 메시지 -->
            <div v-if="resendSuccess" class="success-message">
              ✅ 인증 메일이 다시 전송되었습니다!
            </div>

            <!-- 에러 메시지 -->
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onUnmounted, watch, nextTick } from 'vue';
import { useUserStore } from '../store/user';

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['close', 'go-to-login']);

// Store
const userStore = useUserStore();

// Reactive state
const isResending = ref(false);
const resendCooldown = ref(0);
const resendSuccess = ref(false);
const errorMessage = ref('');
let cooldownTimer = null;

// 화면 크기 감지 및 모달 조정
const adjustModalSize = () => {
  const modal = document.querySelector('.verification-modal');
  const overlay = document.querySelector('.modal-overlay');
  
  if (modal && overlay) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // 뷰포트 크기에 따른 동적 조정
    if (vw <= 320) {
      modal.style.fontSize = '14px';
      overlay.style.alignItems = 'flex-start';
    } else if (vw <= 480) {
      modal.style.fontSize = '15px';
      overlay.style.alignItems = 'flex-start';
    } else if (vw <= 640) {
      modal.style.fontSize = '15px';
      overlay.style.alignItems = 'flex-start';
    } else {
      modal.style.fontSize = '16px';
      overlay.style.alignItems = 'flex-start';
    }
    
    // 가로 모드 또는 낮은 화면에서 추가 조정
    if (vh <= 600) {
      overlay.style.alignItems = 'flex-start';
      overlay.style.paddingTop = '8px';
      overlay.style.paddingBottom = '8px';
    }
    
    // CSS 변수로 화면 크기 전달 (선택적 사용)
    document.documentElement.style.setProperty('--viewport-width', `${vw}px`);
    document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
  }
};

// 재전송 쿨다운 시작
const startCooldown = () => {
  resendCooldown.value = 60; // 60초 쿨다운
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
};

// 인증 메일 재전송
const resendEmail = async () => {
  if (isResending.value || resendCooldown.value > 0) return;

  isResending.value = true;
  errorMessage.value = '';
  resendSuccess.value = false;

  try {
    await userStore.resendVerificationEmail(props.email);
    resendSuccess.value = true;
    startCooldown();
    
    // 성공 메시지 3초 후 제거
    setTimeout(() => {
      resendSuccess.value = false;
    }, 3000);
  } catch (error) {
    errorMessage.value = '메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
    console.error('재전송 실패:', error);
  } finally {
    isResending.value = false;
  }
};

// 로그인 화면으로 이동
const goToLogin = () => {
  emit('go-to-login');
  closeModal();
};

// 오버레이 클릭 처리
const handleOverlayClick = () => {
  closeModal();
};

// 모달 닫기
const closeModal = () => {
  emit('close');
  
  // 상태 초기화
  errorMessage.value = '';
  resendSuccess.value = false;
  
  // 쿨다운 타이머 정리
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
    resendCooldown.value = 0;
  }
};

// 리사이즈 디바운스 함수
let resizeTimeout = null;
const debouncedAdjustModalSize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustModalSize, 100);
};

// props 변화 감지하여 모달 열릴 때 크기 조정
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    // DOM 업데이트 후 실행
    nextTick(() => {
      adjustModalSize();
      
      // 리사이즈 이벤트 리스너 추가 (디바운스 적용)
      window.addEventListener('resize', debouncedAdjustModalSize, { passive: true });
      window.addEventListener('orientationchange', debouncedAdjustModalSize, { passive: true });
      
      // iOS Safari를 위한 뷰포트 변경 감지
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        visualViewport.addEventListener('resize', debouncedAdjustModalSize, { passive: true });
      }
    });
  } else {
    // 모달이 닫힐 때 이벤트 리스너 제거
    window.removeEventListener('resize', debouncedAdjustModalSize);
    window.removeEventListener('orientationchange', debouncedAdjustModalSize);
    
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.removeEventListener('resize', debouncedAdjustModalSize);
    }
    
    // 타임아웃 정리
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
  }
});

// 컴포넌트 언마운트 시 모든 리소스 정리
onUnmounted(() => {
  // 쿨다운 타이머 정리
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  
  // 리사이즈 타임아웃 정리
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
  
  // 모든 이벤트 리스너 정리
  window.removeEventListener('resize', debouncedAdjustModalSize);
  window.removeEventListener('orientationchange', debouncedAdjustModalSize);
  
  // iOS Safari 뷰포트 이벤트 리스너 정리
  const visualViewport = window.visualViewport;
  if (visualViewport) {
    visualViewport.removeEventListener('resize', debouncedAdjustModalSize);
  }
});
</script>

<style scoped>
/* 모든 요소에 box-sizing 적용 */
*, *::before, *::after {
  box-sizing: border-box;
}

/* CSS 변수 정의 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --viewport-width: 100vw;
  --viewport-height: 100vh;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  /* 안전 영역 확보 */
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  /* 화면을 절대로 벗어나지 않도록 보장 */
  max-height: calc(100vh - 40px);
  margin: auto 0;
  /* 플렉스 컨테이너로 중앙 정렬 */
  display: flex;
  flex-direction: column;
}

.verification-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  /* 절대적 크기 제한 */
  min-width: 0;
  box-sizing: border-box;
  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.verification-modal::-webkit-scrollbar {
  width: 6px;
}

.verification-modal::-webkit-scrollbar-track {
  background: transparent;
}

.verification-modal::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.verification-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.modal-header {
  position: relative;
  text-align: center;
  padding: 40px 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-container {
  margin-bottom: 20px;
}

.email-icon {
  display: inline-block;
  font-size: 4rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  line-height: 100px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.verification-info h3 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-align: center;
  background: linear-gradient(45deg, #fff, #f0f9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.verification-message {
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.verification-message strong {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  word-break: break-all;
  overflow-wrap: anywhere;
  display: inline-block;
}

.steps {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 15px;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.warning-box {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  margin-bottom: 30px;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.warning-text p {
  margin: 0 0 10px 0;
  font-weight: 600;
  color: #fef3cd;
}

.warning-text ul {
  margin: 0;
  padding-left: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.warning-text li {
  margin-bottom: 5px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.resend-btn,
.login-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.resend-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.resend-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(238, 90, 36, 0.4);
}

.success-message {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #bbf7d0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 15px;
  animation: slideInUp 0.3s ease;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  animation: slideInUp 0.3s ease;
}

/* 반응형 디자인 - 태블릿 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
    padding-top: max(16px, env(safe-area-inset-top));
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
  
  .modal-container {
    max-width: 100%;
    max-height: calc(100vh - 32px);
  }
  
  .verification-modal {
    border-radius: 14px;
  }
  
  .modal-header {
    padding: 32px 24px 16px;
  }
  
  .modal-content {
    padding: 24px;
  }
}

/* 반응형 디자인 - 모바일 가로/세로 */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 12px;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
  
  .modal-container {
    max-height: calc(100vh - 24px);
  }
  
  .verification-modal {
    border-radius: 12px;
  }
  
  .modal-header {
    padding: 24px 20px 16px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .email-icon {
    font-size: 3rem;
    width: 80px;
    height: 80px;
    line-height: 80px;
  }
  
  .verification-info h3 {
    font-size: 20px;
  }
  
  .verification-message {
    font-size: 15px;
  }
  
  .warning-box {
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }
  
  .action-buttons {
    gap: 10px;
  }
  
  .steps {
    padding: 16px;
  }
}

/* 작은 모바일 화면 */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 8px;
    padding-top: max(8px, env(safe-area-inset-top));
    padding-bottom: max(8px, env(safe-area-inset-bottom));
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }
  
  .modal-container {
    max-height: calc(100vh - 16px);
  }
  
  .verification-modal {
    border-radius: 10px;
  }
  
  .modal-header {
    padding: 20px 16px 12px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .modal-title {
    font-size: 22px;
  }
  
  .email-icon {
    font-size: 2.5rem;
    width: 70px;
    height: 70px;
    line-height: 70px;
  }
  
  .verification-info h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .verification-message {
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .steps {
    padding: 12px;
    margin-bottom: 20px;
  }
  
  .warning-box {
    padding: 12px;
    margin-bottom: 20px;
  }
  
  .step-number {
    width: 24px;
    height: 24px;
    font-size: 12px;
    margin-right: 10px;
  }
  
  .step-text {
    font-size: 13px;
  }
  
  .action-buttons {
    gap: 8px;
  }
  
  .resend-btn,
  .login-btn {
    padding: 12px 16px;
    font-size: 15px;
  }
}

/* 초소형 화면 (최소 화면 크기) */
@media (max-width: 360px) {
  .modal-overlay {
    padding: 4px;
    padding-top: max(4px, env(safe-area-inset-top));
    padding-bottom: max(4px, env(safe-area-inset-bottom));
    padding-left: max(4px, env(safe-area-inset-left));
    padding-right: max(4px, env(safe-area-inset-right));
  }
  
  .modal-container {
    max-height: calc(100vh - 8px);
  }
  
  .verification-modal {
    border-radius: 8px;
  }
  
  .modal-header {
    padding: 16px 12px 8px;
  }
  
  .modal-content {
    padding: 12px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .email-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    line-height: 60px;
    margin-bottom: 12px;
  }
  
  .verification-info h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .verification-message {
    font-size: 13px;
    margin-bottom: 16px;
  }
  
  .steps {
    padding: 10px;
    margin-bottom: 16px;
  }
  
  .warning-box {
    padding: 10px;
    margin-bottom: 16px;
  }
  
  .step-number {
    width: 20px;
    height: 20px;
    font-size: 11px;
    margin-right: 8px;
  }
  
  .step-text {
    font-size: 12px;
  }
  
  .resend-btn,
  .login-btn {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .warning-text p {
    font-size: 13px;
  }
  
  .warning-text ul {
    font-size: 12px;
  }
  
  .close-btn {
    font-size: 20px;
    top: 12px;
    right: 12px;
  }
}

/* 극소형 화면 대응 */
@media (max-width: 320px) {
  .modal-title {
    font-size: 18px;
  }
  
  .email-icon {
    font-size: 1.8rem;
    width: 50px;
    height: 50px;
    line-height: 50px;
  }
  
  .verification-info h3 {
    font-size: 15px;
  }
}

/* 애니메이션 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 트랜지션 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-to .modal-container,
.modal-leave-from .modal-container {
  transform: scale(1) translateY(0);
}

/* 가로 모드 대응 (높이가 제한적인 경우) */
@media (max-height: 600px) and (orientation: landscape) {
  .modal-overlay {
    align-items: flex-start;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  
  .modal-container {
    max-height: calc(100vh - 16px);
  }
  
  .modal-header {
    padding: 16px 24px 8px;
  }
  
  .email-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    line-height: 60px;
    margin-bottom: 8px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .verification-info h3 {
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .steps,
  .warning-box {
    margin-bottom: 16px;
    padding: 12px;
  }
}

/* 접근성 - 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  .action-buttons button:hover {
    transform: none;
  }
  
  .success-message,
  .error-message {
    animation: none;
  }
  
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .verification-modal {
    border: 2px solid white;
  }
  
  .steps {
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .warning-box {
    border: 2px solid rgba(255, 193, 7, 0.8);
  }
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  .verification-modal {
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  }
}

/* JavaScript에서 설정한 뷰포트 변수 활용 */
.modal-overlay {
  max-height: var(--viewport-height, 100vh);
}

/* 뷰포트 반응형 계산 */
.modal-container {
  max-width: min(480px, calc(var(--viewport-width, 100vw) - 40px));
  max-height: calc(var(--viewport-height, 100vh) - 40px);
}

/* 초소형 화면에서는 더 작은 여백 */
@supports (width: min(100vw, 100px)) {
  @media (max-width: 360px) {
    .modal-container {
      max-width: calc(var(--viewport-width, 100vw) - 8px);
      max-height: calc(var(--viewport-height, 100vh) - 8px);
    }
  }
}

/* 가로 모드에서 최대 높이 제한 */
@supports (height: calc(100vh - 16px)) {
  @media (orientation: landscape) and (max-height: 600px) {
    .modal-container {
      max-height: calc(var(--viewport-height, 100vh) - 16px);
    }
  }
}

/* 모바일 브라우저 안전 영역 대응 */
@supports (padding: max(0px, env(safe-area-inset-top))) {
  .modal-overlay {
    padding-top: max(20px, var(--safe-area-inset-top));
    padding-bottom: max(20px, var(--safe-area-inset-bottom));
    padding-left: max(20px, var(--safe-area-inset-left));
    padding-right: max(20px, var(--safe-area-inset-right));
  }
  
  @media (max-width: 640px) {
    .modal-overlay {
      padding-top: max(12px, var(--safe-area-inset-top));
      padding-bottom: max(12px, var(--safe-area-inset-bottom));
      padding-left: max(12px, var(--safe-area-inset-left));
      padding-right: max(12px, var(--safe-area-inset-right));
    }
  }
  
  @media (max-width: 480px) {
    .modal-overlay {
      padding-top: max(8px, var(--safe-area-inset-top));
      padding-bottom: max(8px, var(--safe-area-inset-bottom));
      padding-left: max(8px, var(--safe-area-inset-left));
      padding-right: max(8px, var(--safe-area-inset-right));
    }
  }
  
  @media (max-width: 360px) {
    .modal-overlay {
      padding-top: max(4px, var(--safe-area-inset-top));
      padding-bottom: max(4px, var(--safe-area-inset-bottom));
      padding-left: max(4px, var(--safe-area-inset-left));
      padding-right: max(4px, var(--safe-area-inset-right));
    }
  }
}
</style>
