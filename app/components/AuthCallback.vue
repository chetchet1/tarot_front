<template>
  <div class="auth-callback">
    <div class="callback-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <h2>이메일 인증 확인 중...</h2>
        <p>잠시만 기다려주세요</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h2>인증 실패</h2>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="goHome" class="primary-btn">홈으로 돌아가기</button>
          <button @click="goToLogin" class="secondary-btn">로그인 페이지로</button>
        </div>
      </div>
      
      <div v-else class="success-state">
        <div class="success-icon">✅</div>
        <h2>이메일 인증 완료!</h2>
        <p class="success-message">
          축하합니다! 이메일 인증이 성공적으로 완료되었습니다.<br>
          이제 모든 기능을 자유롭게 이용하실 수 있습니다.
        </p>
        
        <div class="instruction-box">
          <div class="instruction-icon">📱</div>
          <div class="instruction-content">
            <h3>다음 단계</h3>
            <div class="steps">
              <div class="step">
                <span class="step-number">1</span>
                <span class="step-text">이 창을 닫고 타로 앱으로 돌아가세요</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span class="step-text">이메일과 비밀번호로 로그인하세요</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span class="step-text">신비로운 타로의 세계를 탐험하세요</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="goToLogin" class="primary-btn">
            🔮 로그인하러 가기
          </button>
          <button @click="closeWindow" class="secondary-btn">
            창 닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { authService } from '../services/supabase';

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    
    const isLoading = ref(true);
    const error = ref('');

    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 정보 확인
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || '인증 중 오류가 발생했습니다');
        }

        // Supabase session 확인
        const { data: { session }, error: sessionError } = await authService.supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          // 사용자 정보 로드
          await userStore.initializeUser();
          
          // 성공 상태 표시 (자동 리다이렉트 제거)
          isLoading.value = false;
        } else {
          throw new Error('인증 세션을 찾을 수 없습니다');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        error.value = err.message || '인증 처리 중 오류가 발생했습니다';
        isLoading.value = false;
      }
    };

    const goHome = () => {
      // 플랫폼에 따라 다른 네비게이션 방식 사용
      if (typeof window !== 'undefined' && window.location) {
        // 웹 환경
        window.location.href = '/';
      } else {
        // 모바일 환경 (NativeScript)
        router.push('/');
      }
    };

    const goToLogin = () => {
      // 로그인 페이지로 이동
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/#/login';
      } else {
        router.push('/login');
      }
    };

    const closeWindow = () => {
      // 웹 브라우저에서 창 닫기 시도
      if (typeof window !== 'undefined') {
        try {
          window.close();
        } catch (e) {
          // 창을 닫을 수 없는 경우 홈으로 이동
          goHome();
        }
      }
    };

    onMounted(() => {
      handleAuthCallback();
    });

    return {
      isLoading,
      error,
      goHome,
      goToLogin,
      closeWindow
    };
  }
};
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.callback-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  color: #2d3748;
  max-width: 600px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state,
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.callback-container h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

.callback-container p {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
  line-height: 1.5;
  color: #4a5568;
}

.success-message {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2d3748;
  margin-bottom: 1rem;
}

.instruction-box {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  text-align: left;
}

.instruction-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.instruction-content {
  flex: 1;
}

.instruction-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.step-text {
  color: #4a5568;
  font-size: 15px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.secondary-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* 반응형 디자인 */
@media (max-width: 640px) {
  .auth-callback {
    padding: 1rem;
  }
  
  .callback-container {
    padding: 2rem 1.5rem;
  }
  
  .callback-container h2 {
    font-size: 1.5rem;
  }
  
  .callback-container p {
    font-size: 1rem;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
  }
  
  .error-icon,
  .success-icon {
    font-size: 3rem;
  }
  
  .instruction-box {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .instruction-icon {
    font-size: 2.5rem;
  }
  
  .action-buttons,
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
    max-width: 280px;
  }
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  .callback-container {
    background: rgba(45, 55, 72, 0.95);
    color: #e2e8f0;
  }
  
  .callback-container h2 {
    color: #e2e8f0;
  }
  
  .callback-container p {
    color: #cbd5e0;
  }
  
  .instruction-box {
    background: rgba(26, 32, 44, 0.8);
    border-color: #4a5568;
  }
  
  .instruction-content h3 {
    color: #e2e8f0;
  }
  
  .step-text {
    color: #cbd5e0;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  .primary-btn:hover,
  .secondary-btn:hover {
    transform: none;
  }
}
</style>
