<template>
  <div class="home">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">🔮 타로의 정원</h1>
          <p class="tagline">신비로운 타로의 세계에 오신 것을 환영합니다</p>
        </div>
        
        <div class="auth-buttons">
          <button @click="showLoginModal('login')" class="btn btn-login">
            로그인
          </button>
          <button @click="showLoginModal('signup')" class="btn btn-signup">
            회원가입
          </button>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <!-- 히어로 섹션 -->
      <section class="hero-section">
        <div class="hero-content">
          <h2 class="hero-title">
            당신의 운명을 <br>
            <span class="highlight">타로 카드</span>로 확인하세요
          </h2>
          <p class="hero-description">
            전문가가 해석한 정확한 타로 리딩으로<br>
            인생의 방향을 찾아보세요
          </p>
          
          <div class="hero-cta">
            <button @click="showLoginModal('signup')" class="cta-button">
              ✨ 지금 시작하기
            </button>
            <p class="cta-note">무료 회원가입 후 바로 이용 가능</p>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="floating-cards">
            <div class="card-item">🌟</div>
            <div class="card-item">🔮</div>
            <div class="card-item">✨</div>
            <div class="card-item">🌙</div>
            <div class="card-item">☀️</div>
          </div>
        </div>
      </section>

      <!-- 특징 섹션 -->
      <section class="features-section">
        <h3 class="section-title">타로의 정원의 특별함</h3>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h4>정확한 해석</h4>
            <p>전문가가 작성한 정확하고 깊이 있는 타로 카드 해석</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h4>언제 어디서나</h4>
            <p>모바일에서 언제든지 편리하게 타로 점을 체험</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎴</div>
            <h4>다양한 스프레드</h4>
            <p>3장, 5장, 켈틱 크로스 등 다양한 카드 배열</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h4>기록 보관</h4>
            <p>모든 점괘 결과를 안전하게 저장하고 관리</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 로그인/회원가입 모달 -->
    <LoginModal 
      :isVisible="loginModalVisible"
      :initialMode="loginModalMode"
      @close="closeLoginModal"
      @success="handleLoginSuccess"
      @show-email-verification="showEmailVerification"
    />

    <!-- 이메일 인증 모달 -->
    <EmailVerificationModal
      :isVisible="emailVerificationVisible"
      :email="verificationEmail"
      @close="closeEmailVerification"
      @go-to-login="goToLoginFromVerification"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import LoginModal from '../components/LoginModal.vue';
import EmailVerificationModal from '../components/EmailVerificationModal.vue';

const router = useRouter();
const userStore = useUserStore();

// 모달 상태
const loginModalVisible = ref(false);
const loginModalMode = ref('login');
const emailVerificationVisible = ref(false);
const verificationEmail = ref('');

onMounted(async () => {
  console.log('🏠 홈 페이지 초기화');
  
  // 사용자 초기화
  await userStore.initializeUser();
  
  // 로그인된 사용자는 메인 앱으로 리다이렉트
  if (userStore.isLoggedIn) {
    console.log('✅ 로그인된 사용자 감지, 메인 앱으로 이동');
    router.push('/app');
  }
});

// 로그인 모달 표시
const showLoginModal = (mode = 'login') => {
  console.log('🚪 로그인 모달 열기:', mode);
  loginModalMode.value = mode;
  loginModalVisible.value = true;
};

// 로그인 모달 닫기
const closeLoginModal = () => {
  console.log('🚪 로그인 모달 닫기');
  loginModalVisible.value = false;
};

// 로그인 성공 처리
const handleLoginSuccess = (type) => {
  console.log('✅ 로그인 성공:', type);
  closeLoginModal();
  
  // 로그인 성공 시 메인 앱으로 이동
  router.push('/app');
};

// 이메일 인증 모달 표시
const showEmailVerification = (email) => {
  console.log('📧 이메일 인증 모달 표시:', email);
  verificationEmail.value = email;
  emailVerificationVisible.value = true;
};

// 이메일 인증 모달 닫기
const closeEmailVerification = () => {
  console.log('📧 이메일 인증 모달 닫기');
  emailVerificationVisible.value = false;
  verificationEmail.value = '';
};

// 인증 모달에서 로그인으로 이동
const goToLoginFromVerification = () => {
  closeEmailVerification();
  showLoginModal('login');
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 헤더 */
.header {
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.logo-section {
  flex: 1;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  min-width: 80px;
}

.btn-login {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-login:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-signup {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-signup:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 히어로 섹션 */
.hero-section {
  padding: 60px 0;
  text-align: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  color: white;
}

.highlight {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 20px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.hero-cta {
  margin-bottom: 40px;
}

.cta-button {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%);
  color: white;
  border: none;
  padding: 18px 36px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
  margin-bottom: 12px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
}

.cta-note {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.hero-visual {
  margin-top: 40px;
}

.floating-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.card-item {
  width: 60px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 6s ease-in-out infinite;
}

.card-item:nth-child(1) { animation-delay: 0s; }
.card-item:nth-child(2) { animation-delay: 1.2s; }
.card-item:nth-child(3) { animation-delay: 2.4s; }
.card-item:nth-child(4) { animation-delay: 3.6s; }
.card-item:nth-child(5) { animation-delay: 4.8s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 특징 섹션 */
.features-section {
  padding: 60px 0;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 50px;
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h4 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: white;
}

.feature-card p {
  font-size: 16px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .tagline {
    font-size: 14px;
  }
  
  .auth-buttons {
    justify-content: center;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-description {
    font-size: 18px;
  }
  
  .cta-button {
    padding: 16px 32px;
    font-size: 16px;
  }
  
  .floating-cards {
    gap: 12px;
  }
  
  .card-item {
    width: 50px;
    height: 70px;
    font-size: 20px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0 16px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .hero-section {
    padding: 40px 0;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .auth-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .card-item {
    animation: none;
  }
  
  .btn:hover,
  .cta-button:hover {
    transform: none;
  }
}
</style>
