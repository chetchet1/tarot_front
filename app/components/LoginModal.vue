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

        <button 
          class="social-btn kakao-btn" 
          @click="handleKakaoLogin"
          :disabled="isLoading"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" class="social-icon">
            <path fill="#3C1E1E" d="M24 4C12.95 4 4 11.15 4 20c0 5.62 3.58 10.54 9 13.41-.4 1.48-1.44 5.35-1.64 6.19-.25 1.05.39 1.03.82.75.34-.22 5.39-3.68 7.59-5.19 1.38.19 2.79.29 4.23.29 11.05 0 20-7.15 20-16C44 11.15 35.05 4 24 4z"/>
          </svg>
          카카오로 {{ isLoginMode ? '로그인' : '회원가입' }}
          <span class="coming-soon">준비중</span>
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
          <button @click="showForgotPassword = true" class="link-btn">
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>

      <!-- 비밀번호 재설정 모달 -->
      <div v-if="showForgotPassword" class="forgot-password-modal">
        <div class="modal-overlay" @click="showForgotPassword = false"></div>
        <div class="modal-content">
          <h3>비밀번호 재설정</h3>
          <p>가입하신 이메일로 재설정 링크를 보내드립니다.</p>
          
          <form @submit.prevent="handlePasswordReset">
            <input
              v-model="resetEmail"
              type="email"
              placeholder="이메일을 입력하세요"
              required
            />
            <div class="button-group">
              <button type="button" @click="showForgotPassword = false">취소</button>
              <button type="submit" :disabled="isLoading">전송</button>
            </div>
          </form>
        </div>
      </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useUserStore } from '../store/user';
import { showAlert, showConfirm } from '../utils/alerts';

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
          // 로그인
          await userStore.login(formData.value.email, formData.value.password);
          
          // 로그인 성공 메시지
          successMessage.value = '로그인 성공! 잠시만 기다려주세요...';
          
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
          
          // 이메일 인증 모달 표시 이벤트 발생
          emit('show-email-verification', formData.value.email);
          
          // 로그인 모달 닫기
          closeModal();
        }
      } catch (error) {
        errorMessage.value = getErrorMessage(error.message);
      } finally {
        isLoading.value = false;
      }
    };

    // Google 로그인 처리
    const handleGoogleLogin = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      
      let handleOAuthSuccess;
      let handleOAuthError;
      let timeoutId;
      
      try {
        // OAuth 성공/실패 이벤트 리스너 등록
        handleOAuthSuccess = async () => {
          console.log('🎉 OAuth success event received!');
          successMessage.value = '로그인 성공! 잠시만 기다려주세요...';
          isLoading.value = false;
          
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
          console.error('🔴 OAuth error event:', event.detail);
          errorMessage.value = event.detail?.message || 'Google 로그인 중 오류가 발생했습니다.';
          isLoading.value = false;
          
          // 타임아웃 클리어
          if (timeoutId) clearTimeout(timeoutId);
          
          // 리스너 정리
          window.removeEventListener('oauth-success', handleOAuthSuccess);
          window.removeEventListener('oauth-error', handleOAuthError);
        };
        
        window.addEventListener('oauth-success', handleOAuthSuccess);
        window.addEventListener('oauth-error', handleOAuthError);
        
        // Google 로그인 시작
        await userStore.signInWithGoogle();
        
        // 타임아웃 설정 (30초 후 자동으로 로딩 해제)
        timeoutId = setTimeout(() => {
          if (isLoading.value) {
            console.log('⏰ OAuth timeout - resetting loading state');
            isLoading.value = false;
            errorMessage.value = '로그인 시간이 초과되었습니다. 다시 시도해주세요.';
            
            // 리스너 정리
            window.removeEventListener('oauth-success', handleOAuthSuccess);
            window.removeEventListener('oauth-error', handleOAuthError);
          }
        }, 30000);
        
      } catch (error) {
        console.error('Google 로그인 에러:', error);
        errorMessage.value = 'Google 로그인 중 오류가 발생했습니다.';
        isLoading.value = false;
        
        // 리스너 정리
        if (handleOAuthSuccess) window.removeEventListener('oauth-success', handleOAuthSuccess);
        if (handleOAuthError) window.removeEventListener('oauth-error', handleOAuthError);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // 카카오 로그인 처리 (준비중)
    const handleKakaoLogin = async () => {
      await showAlert({
        title: '서비스 준비중',
        message: '카카오 로그인은 앱 출시 이후 연동될 예정입니다.\n구글 로그인을 이용해 주세요.'
      });
    };

    // 비밀번호 재설정
    const handlePasswordReset = async () => {
      if (!resetEmail.value) return;

      isLoading.value = true;
      try {
        await userStore.resetPassword(resetEmail.value);
        successMessage.value = '비밀번호 재설정 이메일이 전송되었습니다.';
        showForgotPassword.value = false;
        resetEmail.value = '';
      } catch (error) {
        errorMessage.value = getErrorMessage(error.message);
      } finally {
        isLoading.value = false;
      }
    };

    // 에러 메시지 변환
    const getErrorMessage = (error) => {
      const errorMessages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
        'User already registered': '이미 가입된 이메일입니다',
        'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
        'Invalid email': '올바른 이메일 형식이 아닙니다'
      };
      
      return errorMessages[error] || '오류가 발생했습니다. 다시 시도해주세요.';
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
      formData,
      errors,
      handleEmailAuth,
      handleGoogleLogin,
      handleKakaoLogin,
      handlePasswordReset,
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

.kakao-btn {
  background: #FEE500;
  color: #000000D9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.kakao-btn:hover:not(:disabled) {
  background: #FDD835;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.social-icon {
  flex-shrink: 0;
}

.coming-soon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-weight: 400;
}

.google-btn .coming-soon {
  background: rgba(0, 0, 0, 0.08);
  color: #666;
}

.kakao-btn .coming-soon {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
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

.forgot-password-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  color: white;
  position: relative;
  z-index: 1;
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

/* 반응형 디자인 */
@media (max-width: 640px) {
  .login-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
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
