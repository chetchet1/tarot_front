<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="verification-modal">
          <div class="modal-header">
            <div class="icon-container">
              <div class="email-icon">메일</div>
            </div>
            <h2 class="modal-title">이메일 인증</h2>
            <button class="close-btn" @click="closeModal">×</button>
          </div>

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

              <button class="login-btn" @click="goToLogin">로그인하기</button>
            </div>

            <div v-if="resendSuccess" class="success-message">
              인증 메일이 다시 전송되었습니다.
            </div>

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

const emit = defineEmits(['close', 'go-to-login']);
const userStore = useUserStore();

const isResending = ref(false);
const resendCooldown = ref(0);
const resendSuccess = ref(false);
const errorMessage = ref('');
let cooldownTimer = null;

const adjustModalSize = () => {
  const modal = document.querySelector('.verification-modal');
  const overlay = document.querySelector('.modal-overlay');
  if (!modal || !overlay) return;

  // Use visualViewport when available: on mobile WebViews, 100vw/innerWidth can differ
  // from the actually visible viewport, which can cause horizontal clipping.
  const vv = window.visualViewport;
  const vw = Math.round(vv?.width || window.innerWidth);
  const vh = Math.round(vv?.height || window.innerHeight);
  const offsetLeft = Math.round(vv?.offsetLeft || 0);
  const offsetTop = Math.round(vv?.offsetTop || 0);

  if (vw <= 360) {
    modal.style.fontSize = '14px';
  } else if (vw <= 480) {
    modal.style.fontSize = '15px';
  } else {
    modal.style.fontSize = '16px';
  }

  overlay.style.alignItems = vh <= 600 ? 'flex-start' : 'center';
  if (vh <= 600) {
    overlay.style.paddingTop = '8px';
    overlay.style.paddingBottom = '8px';
  }

  document.documentElement.style.setProperty('--viewport-width', `${vw}px`);
  document.documentElement.style.setProperty('--viewport-height', `${vh}px`);
  document.documentElement.style.setProperty('--viewport-offset-left', `${offsetLeft}px`);
  document.documentElement.style.setProperty('--viewport-offset-top', `${offsetTop}px`);
};

const startCooldown = () => {
  resendCooldown.value = 60;
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
};

const resendEmail = async () => {
  if (isResending.value || resendCooldown.value > 0) return;

  isResending.value = true;
  errorMessage.value = '';
  resendSuccess.value = false;

  try {
    await userStore.resendVerificationEmail(props.email);
    resendSuccess.value = true;
    startCooldown();
    setTimeout(() => {
      resendSuccess.value = false;
    }, 3000);
  } catch (error) {
    errorMessage.value = '메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
    console.error('resend failed:', error);
  } finally {
    isResending.value = false;
  }
};

const goToLogin = () => {
  emit('go-to-login');
  closeModal();
};

const handleOverlayClick = () => {
  closeModal();
};

const closeModal = () => {
  emit('close');
  errorMessage.value = '';
  resendSuccess.value = false;

  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
    resendCooldown.value = 0;
  }
};

let resizeTimeout = null;
const debouncedAdjustModalSize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustModalSize, 100);
};

watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      adjustModalSize();
      window.addEventListener('resize', debouncedAdjustModalSize, { passive: true });
      window.addEventListener('orientationchange', debouncedAdjustModalSize, { passive: true });
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        visualViewport.addEventListener('resize', debouncedAdjustModalSize, { passive: true });
      }
    });
  } else {
    window.removeEventListener('resize', debouncedAdjustModalSize);
    window.removeEventListener('orientationchange', debouncedAdjustModalSize);
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.removeEventListener('resize', debouncedAdjustModalSize);
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
  }
});

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
  window.removeEventListener('resize', debouncedAdjustModalSize);
  window.removeEventListener('orientationchange', debouncedAdjustModalSize);
  const visualViewport = window.visualViewport;
  if (visualViewport) {
    visualViewport.removeEventListener('resize', debouncedAdjustModalSize);
  }
});
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  --viewport-width: 100vw;
  --viewport-height: 100vh;
  --viewport-offset-left: 0px;
  --viewport-offset-top: 0px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--viewport-width, 100vw);
  height: var(--viewport-height, 100vh);
  transform: translate(var(--viewport-offset-left, 0px), var(--viewport-offset-top, 0px));
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  width: 100%;
  max-width: 100%;
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-container {
  width: 100%;
  /* Avoid min() here: some WebViews can behave oddly and cause horizontal clipping. */
  max-width: 520px;
  max-height: calc(var(--viewport-height, 100vh) - 32px);
  margin: auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  min-width: 0;
}

.modal-header {
  position: relative;
  text-align: center;
  padding: 28px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-container {
  margin-bottom: 12px;
}

.email-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
}

.modal-content {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.verification-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
}

.verification-message {
  font-size: 15px;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.verification-message strong {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  padding: 2px 8px;
  border-radius: 4px;
  word-break: break-word;
  overflow-wrap: anywhere;
  display: inline-block;
  max-width: 100%;
}

.steps {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
  margin-right: 10px;
  flex-shrink: 0;
}

.step-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.warning-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.warning-text p {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #fef3cd;
}

.warning-text ul {
  margin: 0;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.warning-text li {
  margin-bottom: 4px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.resend-btn,
.login-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.resend-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
}

.success-message {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #bbf7d0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 10px;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
    padding-top: max(10px, env(safe-area-inset-top));
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
  }

  .modal-container {
    /* Hard width cap so the modal never exceeds the visual viewport. */
    max-width: calc(var(--viewport-width, 100vw) - 20px);
    max-height: calc(var(--viewport-height, 100vh) - 20px);
  }

  .modal-header {
    padding: 24px 16px 12px;
  }

  .modal-content {
    padding: 16px;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.98) translateY(10px);
}
</style>
