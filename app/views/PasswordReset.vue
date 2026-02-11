<template>
  <div class="password-reset-page">
    <div class="reset-container">
      <div class="reset-card">
        <!-- 헤더 -->
        <div class="reset-header">
          <h1 class="reset-title">🔐 비밀번호 재설정</h1>
          <p class="reset-subtitle">새로운 비밀번호를 입력해주세요</p>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 성공 메시지 -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- 비밀번호 입력 폼 -->
        <form v-if="!isComplete && !isLoading && !hasError" @submit.prevent="handlePasswordReset" class="reset-form">
          <div class="form-group">
            <label for="password">새 비밀번호</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="8자 이상, 영문, 숫자, 특수문자 포함"
                :class="{ 'error': passwordError }"
                required
                @input="validatePassword"
              />
              <button 
                type="button" 
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <div class="password-input-wrapper">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="비밀번호를 다시 입력하세요"
                :class="{ 'error': confirmPasswordError }"
                required
                @input="validateConfirmPassword"
              />
              <button 
                type="button" 
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!isValidForm || isProcessing"
          >
            {{ isProcessing ? '처리 중...' : '비밀번호 변경' }}
          </button>
        </form>

        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>잠시만 기다려주세요...</p>
        </div>

        <!-- 완료 상태 -->
        <div v-if="isComplete" class="complete-container">
          <div class="complete-icon">✅</div>
          <h2>비밀번호가 성공적으로 변경되었습니다!</h2>
          
          <!-- 웹 환경: 앱 안내 -->
          <div v-if="isWebEnvironment" class="web-guide">
            <p class="guide-message">
              타로의 정원 앱에서 새로운 비밀번호로 로그인해주세요.
            </p>
            <div class="app-buttons">
              <button @click="openApp" class="app-btn primary">
                🎴 타로의 정원 앱 열기
              </button>
              <button @click="goToPlayStore" class="app-btn secondary">
                📱 Google Play Store에서 설치
              </button>
            </div>
          </div>
          
          <!-- 앱 환경: 로그인 페이지로 -->
          <div v-else>
            <p>{{ countdown }}초 후 로그인 페이지로 이동합니다.</p>
            <button @click="goToLogin" class="login-btn">
              지금 로그인하기
            </button>
          </div>
        </div>

        <!-- 오류 상태 -->
        <div v-if="hasError && !isLoading && !isComplete" class="error-container">
          <div class="error-icon">❌</div>
          <h2>재설정 링크가 유효하지 않습니다</h2>
          <p>링크가 만료되었거나 잘못되었습니다.</p>
          <button @click="requestNewLink" class="request-btn">
            새 링크 요청하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { detectPlatform } from '../utils/platformDetector';
import { Capacitor } from '@capacitor/core';

const router = useRouter();
const route = useRoute();

// 상태 관리
const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(true);
const isProcessing = ref(false);
const isComplete = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const countdown = ref(3);
let countdownTimer: number | null = null;

// 플랫폼 감지
const platform = detectPlatform();
const isWebEnvironment = ref(!platform.isCapacitor && !platform.isInApp);

// 유효성 검사
const validatePassword = () => {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!newPassword.value) {
    passwordError.value = '비밀번호를 입력해주세요';
    return false;
  }
  
  if (!passwordRegex.test(newPassword.value)) {
    passwordError.value = '8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다';
    return false;
  }
  
  passwordError.value = '';
  return true;
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = '비밀번호 확인을 입력해주세요';
    return false;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    confirmPasswordError.value = '비밀번호가 일치하지 않습니다';
    return false;
  }
  
  confirmPasswordError.value = '';
  return true;
};

const isValidForm = computed(() => {
  return newPassword.value && 
         confirmPassword.value && 
         !passwordError.value && 
         !confirmPasswordError.value &&
         newPassword.value === confirmPassword.value;
});

// 페이지 로드 시 토큰 확인
onMounted(async () => {
  console.log('🔐 비밀번호 재설정 페이지 로드');
  
  try {
    // URL에서 토큰 추출
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const getQueryValue = (key: string) => {
      const v = (route.query as Record<string, unknown>)[key];
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
      return null;
    };
    const access_token = hashParams.get('access_token') || getQueryValue('access_token');
    const type = (hashParams.get('type') || getQueryValue('type') || '').toLowerCase();
    
    console.log('📍 URL 파라미터:', {
      hash: window.location.hash,
      access_token: access_token ? '존재함' : '없음',
      type
    });
    
    if (type === 'recovery' && access_token) {
      // Mobile web: try to open the native app for password reset (fallback to web UI if not installed).
      const isMobileWeb =
        !Capacitor.isNativePlatform() && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobileWeb) {
        const triedKey = 'tarot_reset_deeplink_tried';
        const alreadyTried = sessionStorage.getItem(triedKey) === '1';
        if (!alreadyTried) {
          sessionStorage.setItem(triedKey, '1');
          const deepLink = `com.tarotgarden.app://auth/reset-password${window.location.hash || ''}`;
          console.log('📱 모바일 웹 - 앱 딥링크 시도:', deepLink);
          window.location.href = deepLink;
        }
      }
      console.log('✅ 유효한 재설정 토큰 확인됨');
      isLoading.value = false;
      hasError.value = false;
      
      // 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('세션 상태:', session ? '있음' : '없음');
      
    } else {
      // confirm-flow: token_hash was verified on our domain, so there may be no hash tokens here.
      const { data: { session } } = await supabase.auth.getSession();
      if (type === 'recovery' && session) {
        console.log('✅ recovery 세션 확인됨 (confirm-flow)');
        isLoading.value = false;
        hasError.value = false;
        return;
      }
      console.error('❌ 재설정 토큰이 없거나 유효하지 않음');
      hasError.value = true;
      isLoading.value = false;
      errorMessage.value = '유효하지 않은 재설정 링크입니다.';
    }
  } catch (error) {
    console.error('❌ 토큰 확인 중 오류:', error);
    hasError.value = true;
    isLoading.value = false;
    errorMessage.value = '재설정 링크 확인 중 오류가 발생했습니다.';
  }
});

// 비밀번호 재설정 처리
const handlePasswordReset = async () => {
  console.log('🔄 비밀번호 재설정 시작');
  
  // 유효성 검사
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();
  
  if (!isPasswordValid || !isConfirmValid) {
    console.log('❌ 유효성 검사 실패');
    return;
  }
  
  isProcessing.value = true;
  errorMessage.value = '';
  
  try {
    // 비밀번호 업데이트
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword.value
    });
    
    if (error) {
      console.error('❌ 비밀번호 변경 실패:', error);
      errorMessage.value = error.message || '비밀번호 변경에 실패했습니다.';
      isProcessing.value = false;
      return;
    }
    
    console.log('✅ 비밀번호 변경 성공');
    successMessage.value = '비밀번호가 성공적으로 변경되었습니다!';
    isComplete.value = true;
    
    // 로그아웃 처리
    await supabase.auth.signOut();
    
    // 웹 환경이 아니면 카운트다운 시작
    if (!isWebEnvironment.value) {
      startCountdown();
    }
    
  } catch (error) {
    console.error('❌ 비밀번호 재설정 오류:', error);
    errorMessage.value = '비밀번호 변경 중 오류가 발생했습니다.';
  } finally {
    isProcessing.value = false;
  }
};

// 카운트다운 시작
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      goToLogin();
    }
  }, 1000);
};

// 로그인 페이지로 이동
const goToLogin = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  router.push('/');
};

// 새 링크 요청
const requestNewLink = () => {
  if (isWebEnvironment.value) {
    // 웹에서는 앱 다운로드 페이지로
    window.location.href = 'https://play.google.com/store/apps/details?id=com.tarotgarden.app';
  } else {
    router.push('/');
  }
};

// 앱 열기 시도 (딥링크)
const openApp = () => {
  console.log('🚀 앱 열기 시도');
  
  // 딥링크로 앱 열기 시도
  const appScheme = `com.tarotgarden.app://auth/reset-password${window.location.hash || ''}`;
  const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.tarotgarden.app';
  
  // 앱 열기 시도
  window.location.href = appScheme;
  
  // 2초 후 앱이 열리지 않으면 Play Store로 이동
  setTimeout(() => {
    if (document.hasFocus()) {
      console.log('🔄 앱이 설치되지 않음, Play Store로 이동');
      window.location.href = fallbackUrl;
    }
  }, 2000);
};

// Play Store로 이동
const goToPlayStore = () => {
  console.log('📱 Play Store로 이동');
  window.location.href = 'https://play.google.com/store/apps/details?id=com.tarotgarden.app';
};

// 컴포넌트 정리
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.password-reset-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reset-container {
  width: 100%;
  max-width: 450px;
}

.reset-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.reset-header {
  text-align: center;
  margin-bottom: 30px;
}

.reset-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.reset-subtitle {
  font-size: 16px;
  color: #666;
}

.reset-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-group input {
  width: 100%;
  padding: 12px;
  padding-right: 45px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  transition: opacity 0.3s;
}

.password-toggle:hover {
  opacity: 0.7;
}

.field-error {
  display: block;
  margin-top: 5px;
  font-size: 13px;
  color: #ef4444;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message,
.success-message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.success-message {
  background-color: #d1fae5;
  color: #059669;
  border: 1px solid #6ee7b7;
}

.loading-container,
.complete-container,
.error-container {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.complete-icon,
.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.complete-container h2,
.error-container h2 {
  font-size: 22px;
  color: #333;
  margin-bottom: 10px;
}

.complete-container p,
.error-container p {
  color: #666;
  margin-bottom: 20px;
}

.login-btn,
.request-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 웹 환경 앱 안내 */
.web-guide {
  padding: 20px;
}

.guide-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.app-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 320px;
  margin: 0 auto;
}

.app-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.app-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.app-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.app-btn.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.app-btn.secondary:hover {
  background: #f0f4ff;
  transform: translateY(-1px);
}

.login-btn:hover,
.request-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .reset-card {
    padding: 30px 20px;
  }
  
  .reset-title {
    font-size: 24px;
  }
  
  .reset-subtitle {
    font-size: 14px;
  }
}
</style>
