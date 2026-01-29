<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="login-modal">
          <!-- 헤더 -->
          <div class="modal-header">
            <h2 class="modal-title">{{ isLoginMode ? '로그인' : '회원가입' }}</h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 성공 메시지 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- 소셜 로그인 버튼들 -->
      <div class="social-login-section">
        <button 
          class="social-btn google-btn" 
          @click="handleGoogleLogin"
          :disabled="isLoading"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" class="social-icon">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Google로 {{ isLoginMode ? '로그인' : '회원가입' }}
        </button>
      </div>

      <!-- 구분선 -->
      <div class="divider">
        <span>또는</span>
      </div>

      <!-- 이메일 로그인/회원가입 폼 -->
      <form @submit.prevent="handleEmailAuth" class="email-form">
        <!-- 이름 (회원가입시만) -->
        <div v-if="!isLoginMode" class="form-group">
          <label for="name">이름</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="이름을 입력하세요"
            :class="{ 'error': errors.name }"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <!-- 이메일 -->
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="이메일을 입력하세요"
            :class="{ 'error': errors.email }"
            required
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="password-input">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="비밀번호를 입력하세요"
              :class="{ 'error': errors.password }"
              required
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          <div v-if="!isLoginMode" class="password-hint">
            8자 이상, 영문, 숫자, 특수문자 포함
          </div>
        </div>

        <!-- 비밀번호 확인 (회원가입시만) -->
        <div v-if="!isLoginMode" class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            :class="{ 'error': errors.confirmPassword }"
            required
          />
          <span v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</span>
        </div>

        <!-- 약관 동의 (회원가입시만) -->
        <div v-if="!isLoginMode" class="terms-section">
          <label class="checkbox-option">
            <input 
              type="checkbox" 
              v-model="formData.agreeTerms"
              :class="{ 'error': errors.agreeTerms }"
              required
            />
            <span>서비스 이용약관 및 개인정보처리방침에 동의합니다</span>
          </label>
          <span v-if="errors.agreeTerms" class="field-error">{{ errors.agreeTerms }}</span>
        </div>

        <!-- 제출 버튼 -->
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading">처리중...</span>
          <span v-else>{{ isLoginMode ? '로그인' : '회원가입' }}</span>
        </button>
      </form>

      <!-- 하단 링크들 -->
      <div class="modal-footer">
        <div class="mode-switch">
          <span v-if="isLoginMode">
            계정이 없으신가요?
            <button @click="toggleMode" class="link-btn">회원가입</button>
          </span>
          <span v-else>
            이미 계정이 있으신가요?
            <button @click="toggleMode" class="link-btn">로그인</button>
          </span>
        </div>

        <div v-if="isLoginMode" class="forgot-password">
          <button @click="handleForgotPasswordClick" class="link-btn">
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>

        </div>
      </div>
    </div>
  </Transition>

  <!-- 비밀번호 재설정 모달 (별도) -->
  <Transition name="modal">
    <div v-if="showForgotPassword" class="modal-overlay" @click="closeForgotPassword">
      <div class="modal-container" @click.stop>
        <div class="forgot-password-modal-content">
          <div class="modal-header">
            <h2 class="modal-title">비밀번호 재설정</h2>
            <button class="close-btn" @click="closeForgotPassword">✕</button>
          </div>
          
          <div class="modal-body">
            <p class="reset-description">
              가입하신 이메일 주소를 입력하시면<br>
              비밀번호 재설정 링크를 보내드립니다.
            </p>
            
            <div v-if="resetMessage" :class="resetMessageType === 'success' ? 'success-message' : 'error-message'">
              {{ resetMessage }}
            </div>
            
            <form @submit.prevent="handlePasswordReset">
              <div class="form-group">
                <input
                  v-model="resetEmail"
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  class="reset-email-input"
                  required
                  :disabled="isResetLoading"
                />
              </div>
              
              <div class="reset-button-group">
                <button 
                  type="button" 
                  class="btn btn-cancel"
                  @click="closeForgotPassword"
                  :disabled="isResetLoading"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isResetLoading || !resetEmail"
                >
                  {{ isResetLoading ? '전송 중...' : '재설정 링크 전송' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../store/user';
import { showAlert, showConfirm } from '../utils/alerts';
import { logger } from '../services/debugLogger';
import { Capacitor } from '@capacitor/core';

export default {
  name: 'LoginModal',
  components: {
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    initialMode: {
      type: String,
      default: 'login'
    }
  },
  emits: ['close', 'success', 'show-email-verification'],
  setup(props, { emit }) {
    const userStore = useUserStore();
    
    console.log('LoginModal setup 호출됨');
    console.log('props.isVisible:', props.isVisible);
    
    // props.isVisible 변화 감지
    watch(() => props.isVisible, (newVal, oldVal) => {
      console.log(`🎠 LoginModal isVisible 변경: ${oldVal} -> ${newVal}`);
    }, { immediate: true });
    
    // 상태 관리
    const isLoginMode = ref(props.initialMode === 'login');
    const isLoading = ref(false);
    const showPassword = ref(false);
    const showForgotPassword = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const resetEmail = ref('');
    const isResetLoading = ref(false);
    const resetMessage = ref('');
    const resetMessageType = ref('error');
    const isOAuthInProgress = ref(false);
    let visibilityChangeHandler = null;
    let appStateHandler = null;
    let appStateListener = null;

    // 폼 데이터
    const formData = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    });

    // 에러 상태
    const errors = ref({});

    // 폼 검증
    const validateForm = () => {
      errors.value = {};

      // 이메일 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.value.email)) {
        errors.value.email = '올바른 이메일 형식이 아닙니다';
      }

      // 회원가입시 추가 검증
      if (!isLoginMode.value) {
        if (!formData.value.name.trim()) {
          errors.value.name = '이름을 입력해주세요';
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.value.password)) {
          errors.value.password = '8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다';
        }

        if (formData.value.password !== formData.value.confirmPassword) {
          errors.value.confirmPassword = '비밀번호가 일치하지 않습니다';
        }

        if (!formData.value.agreeTerms) {
          errors.value.agreeTerms = '서비스 이용약관에 동의해주세요';
        }
      }

      return Object.keys(errors.value).length === 0;
    };

    // 이메일 인증 처리
    const handleEmailAuth = async () => {
      if (!validateForm()) return;

      isLoading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        if (isLoginMode.value) {
          // 로그인 시작 메시지 표시
          console.log('로그인 시도:', formData.value.email);
          successMessage.value = '로그인 중입니다...';
          
          await userStore.login(formData.value.email, formData.value.password);
          
          // 로그인 성공 메시지
          console.log('로그인 성공, 모달 닫기');
          successMessage.value = '로그인 성공! 잠시만 기다려주세요...';
          
          // 즉시 로딩 해제
          isLoading.value = false;
          
          // 로그인 성공 후 처리
          setTimeout(() => {
            emit('success', 'login');
            closeModal();
          }, 500);
        } else {
          // 회원가입
          await userStore.signUp(
            formData.value.email, 
            formData.value.password,
            { name: formData.value.name }
          );
          
          // 즉시 로딩 해제
          isLoading.value = false;
          
          // 이메일 인증 모달 표시 이벤트 발생
          emit('show-email-verification', formData.value.email);
          
          // 로그인 모달 닫기
          closeModal();
        }
      } catch (error) {
        console.error('인증 오류:', error);
        isLoading.value = false;
        successMessage.value = ''; // 성공 메시지 클리어
        errorMessage.value = getErrorMessage(error.message || error);
      }
    };

    // Google 로그인 처리
    const handleGoogleLogin = async () => {
      logger.log('[LoginModal] Google 로그인 버튼 클릭 - BUILD 20250828-01');
      isLoading.value = true;
      isOAuthInProgress.value = true;
      errorMessage.value = '';
      
      let handleOAuthSuccess;
      let handleOAuthError;
      let timeoutId;
      
      try {
        
        // OAuth 성공/실패 이벤트 리스너 등록
        handleOAuthSuccess = async () => {
          
          console.log('🎉 [LoginModal] oauth-success 이벤트 수신!');
          console.log('🎉 [LoginModal] 이벤트 수신 시각:', new Date().toISOString());
          successMessage.value = '로그인 성공! 잠시만 기다려주세요...';
          isLoading.value = false;
          isOAuthInProgress.value = false;
          
          // 타임아웃 클리어
          if (timeoutId) clearTimeout(timeoutId);
          
          // 리스너 정리
          window.removeEventListener('oauth-success', handleOAuthSuccess);
          window.removeEventListener('oauth-error', handleOAuthError);
          
          // userStore 상태 업데이트
          try {
            await userStore.initializeUser();
            console.log('✅ userStore 재초기화 완료');
          } catch (error) {
            console.error('❌ userStore 재초기화 실패:', error);
          }
          
          setTimeout(() => {
            emit('success', 'oauth');
            closeModal();
          }, 500);
        };
        
        handleOAuthError = (event) => {
          
          console.error('🔴 [LoginModal] oauth-error 이벤트 수신:', event.detail);
          console.error('🔴 [LoginModal] 이벤트 수신 시각:', new Date().toISOString());
          errorMessage.value = event.detail?.message || 'Google 로그인 중 오류가 발생했습니다.';
          isLoading.value = false;
          isOAuthInProgress.value = false;
          
          // 타임아웃 클리어
          if (timeoutId) clearTimeout(timeoutId);
          
          // 리스너 정리
          window.removeEventListener('oauth-success', handleOAuthSuccess);
          window.removeEventListener('oauth-error', handleOAuthError);
        };
        
        console.log('👂 [LoginModal] OAuth 이벤트 리스너 등록');
        window.addEventListener('oauth-success', handleOAuthSuccess);
        window.addEventListener('oauth-error', handleOAuthError);
        console.log('✅ [LoginModal] 이벤트 리스너 등록 완료');
        
        // 현재 등록된 리스너 수 확인 (디버깅용)
        const listeners = window.getEventListeners ? window.getEventListeners(window) : 'getEventListeners not available';
        console.log('📊 [LoginModal] 현재 window 이벤트 리스너:', listeners);
        
        // Google 로그인 시작
        console.log('🚀 [LoginModal] userStore.signInWithGoogle() 호출');
        await userStore.signInWithGoogle();
        console.log('✅ [LoginModal] userStore.signInWithGoogle() 완료');
        
        // 타임아웃 설정 (35초 - OAuth 세션 재시도 시간 고려)
        console.log('⏱️ [LoginModal] 35초 타임아웃 설정');
        
        timeoutId = setTimeout(() => {
          if (isLoading.value) {
            
            console.log('⏰ [LoginModal] OAuth 타임아웃 발생 - 로딩 상태 리셋');
            isLoading.value = false;
            isOAuthInProgress.value = false;
            errorMessage.value = '로그인 시간이 초과되었습니다. 다시 시도해주세요.';
            
            // 리스너 정리
            window.removeEventListener('oauth-success', handleOAuthSuccess);
            window.removeEventListener('oauth-error', handleOAuthError);
          }
        }, 35000);
        
      } catch (error) {
        
        console.error('❌ [LoginModal] Google 로그인 에러:', error);
        console.error('❌ [LoginModal] 에러 상세:', error.stack);
        errorMessage.value = 'Google 로그인 중 오류가 발생했습니다.';
        isLoading.value = false;
        isOAuthInProgress.value = false;
        
        // 리스너 정리
        if (handleOAuthSuccess) window.removeEventListener('oauth-success', handleOAuthSuccess);
        if (handleOAuthError) window.removeEventListener('oauth-error', handleOAuthError);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    const resetOAuthIfCancelled = async () => {
      if (!isOAuthInProgress.value) return;
      try {
        await userStore.initializeUser();
      } catch (error) {
        console.error('❌ [LoginModal] 사용자 상태 갱신 실패:', error);
      }
      if (!userStore.currentUser) {
        isLoading.value = false;
        isOAuthInProgress.value = false;
        errorMessage.value = '로그인이 취소되었습니다. 다시 시도해주세요.';
      }
    };

    onMounted(async () => {
      visibilityChangeHandler = () => {
        if (!document.hidden) {
          resetOAuthIfCancelled();
        }
      };
      document.addEventListener('visibilitychange', visibilityChangeHandler);
      if (Capacitor.isNativePlatform()) {
        try {
          const { App } = await import('@capacitor/app');
          appStateHandler = (state) => {
            if (state.isActive) {
              resetOAuthIfCancelled();
            }
          };
          appStateListener = App.addListener('appStateChange', appStateHandler);
        } catch (error) {
          console.warn('앱 상태 리스너 등록 실패:', error);
        }
      }
    });

    onUnmounted(async () => {
      if (visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
      }
      if (appStateListener) {
        try {
          await appStateListener.remove();
        } catch (error) {
          console.warn('앱 상태 리스너 해제 실패:', error);
        }
      }
    });


    // 비밀번호 찾기 버튼 클릭
    const handleForgotPasswordClick = () => {
      console.log('비밀번호 찾기 클릭');
      showForgotPassword.value = true;
      resetMessage.value = '';
      resetEmail.value = '';
    };

    // 비밀번호 재설정 모달 닫기
    const closeForgotPassword = () => {
      showForgotPassword.value = false;
      resetMessage.value = '';
      resetEmail.value = '';
      isResetLoading.value = false;
    };

    // 비밀번호 재설정
    const handlePasswordReset = async () => {
      if (!resetEmail.value) return;

      isResetLoading.value = true;
      resetMessage.value = '';
      
      try {
        await userStore.resetPassword(resetEmail.value);
        resetMessage.value = '비밀번호 재설정 이메일을 전송했습니다. 이메일을 확인해주세요.';
        resetMessageType.value = 'success';
        
        // 3초 후 모달 자동 닫기
        setTimeout(() => {
          closeForgotPassword();
        }, 3000);
      } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        resetMessage.value = error.message || '비밀번호 재설정 중 오류가 발생했습니다.';
        resetMessageType.value = 'error';
      } finally {
        isResetLoading.value = false;
      }
    };

    // 에러 메시지 변환
    const getErrorMessage = (error) => {
      const errorMessages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
        '이메일 또는 비밀번호가 올바르지 않습니다.': '이메일 또는 비밀번호가 올바르지 않습니다',
        '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.': '이메일 인증이 필요합니다',
        'User already registered': '이미 가입된 이메일입니다',
        'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
        'Invalid email': '올바른 이메일 형식이 아닙니다',
        '일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.': '서버 오류가 발생했습니다'
      };
      
      // 부분 문자열 매칭
      for (const [key, value] of Object.entries(errorMessages)) {
        if (error?.includes(key)) {
          return value;
        }
      }
      
      return '오류가 발생했습니다. 다시 시도해주세요.';
    };

    // 오버레이 클릭 처리
    const handleOverlayClick = () => {
      console.log('LoginModal 오버레이 클릭');
      closeModal();
    };

    // 모드 전환
    const toggleMode = () => {
      isLoginMode.value = !isLoginMode.value;
      errorMessage.value = '';
      successMessage.value = '';
      errors.value = {};
      
      // 폼 초기화 (이메일 제외)
      const email = formData.value.email;
      formData.value = {
        name: '',
        email: email,
        password: '',
        confirmPassword: '',
        agreeTerms: false
      };
    };

    // 모달 닫기
    const closeModal = () => {
      emit('close');
      
      // 상태 초기화
      errorMessage.value = '';
      successMessage.value = '';
      errors.value = {};
      showForgotPassword.value = false;
      
      // 폼 초기화
      formData.value = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      };
    };

    // 초기 모드 변경 감지
    watch(() => props.initialMode, (newMode) => {
      isLoginMode.value = newMode === 'login';
    });

    return {
      isLoginMode,
      isLoading,
      showPassword,
      showForgotPassword,
      errorMessage,
      successMessage,
      resetEmail,
      isResetLoading,
      resetMessage,
      resetMessageType,
      formData,
      errors,
      handleEmailAuth,
      handleGoogleLogin,
      handlePasswordReset,
      handleForgotPasswordClick,
      closeForgotPassword,
      toggleMode,
      closeModal,
      handleOverlayClick
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
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

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fecaca;
  padding: 12px 20px;
  margin: 20px 30px;
  border-radius: 10px;
  font-size: 14px;
}

.success-message {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #bbf7d0;
  padding: 12px 20px;
  margin: 20px 30px;
  border-radius: 10px;
  font-size: 14px;
}

.social-login-section {
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-btn {
  background: white;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.google-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}


.social-icon {
  flex-shrink: 0;
}


.divider {
  text-align: center;
  padding: 20px 30px;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 30px;
  right: 30px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.divider span {
  background: inherit;
  padding: 0 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.email-form {
  padding: 0 30px 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
}

.field-error {
  display: block;
  color: #fecaca;
  font-size: 12px;
  margin-top: 4px;
}

.password-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.terms-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.4;
}

.checkbox-option input[type="checkbox"] {
  margin: 0;
  accent-color: white;
  flex-shrink: 0;
  margin-top: 2px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  margin-top: 25px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(238, 90, 36, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.modal-footer {
  padding: 20px 30px 30px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mode-switch {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.link-btn {
  background: none;
  border: none;
  color: white;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.link-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.forgot-password {
  font-size: 13px;
}

/* 비밀번호 재설정 모달 스타일 */
.forgot-password-modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  color: white;
}

.modal-body {
  padding: 20px 30px 30px;
}

.reset-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 25px;
}

.reset-email-input {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
}

.reset-email-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.reset-email-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  outline: none;
}

.reset-email-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button-group {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.reset-button-group .btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button-group .btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reset-button-group .btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.reset-button-group .btn-primary {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
}

.reset-button-group .btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(238, 90, 36, 0.4);
}

.reset-button-group .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 20px;
}

.modal-content p {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.modal-content input {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
}

.modal-content input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.button-group button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.button-group button[type="button"] {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.button-group button[type="submit"] {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.button-group button:hover {
  transform: translateY(-1px);
}

/* 디버깅 정보 스타일 - 강제 표시 */
.debug-info {
  background: rgba(255, 0, 0, 0.2) !important;
  border: 2px solid red !important;
  padding: 10px 15px !important;
  margin-top: 10px !important;
  border-radius: 0 0 15px 15px !important;
  max-height: 150px !important;
  overflow-y: auto !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.debug-title {
  color: #ffd700;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  font-family: monospace;
}

.debug-content {
  font-size: 10px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.debug-log {
  margin: 2px 0;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  word-break: break-all;
}

/* 반응형 디자인 */
@media (max-width: 640px) {
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .modal-container {
    position: relative;
    width: calc(100% - 40px);
    max-width: 480px;
    max-height: calc(100vh - 40px);
    max-height: calc(100dvh - 40px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .login-modal {
    width: 100%;
    max-height: 100%;
    overflow-y: auto;
    margin: 0;
  }
  
  .modal-header,
  .social-login-section,
  .email-form,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .modal-title {
    font-size: 24px;
  }
  
  .button-group {
    flex-direction: column;
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
</style>
