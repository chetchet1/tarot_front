<template>
  <div class="main-app">
    <!-- 헤더 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">🔮 타로의 정원</h1>
        </div>
        
        <div class="user-section">
          <!-- 테스트 버튼 (개발/테스트용) -->
          <button 
            v-if="showTestButton"
            class="test-mode-btn"
            @click="toggleTestPanel"
            :class="{ active: isTestPanelOpen }"
          >
            🧪
          </button>
          
          <div class="user-info">
            <span class="welcome-text">{{ getGreetingMessage() }}</span>
            <span v-if="userStore.isPremium" class="premium-badge">Premium</span>
          </div>
          
          <div class="user-menu" @click="toggleUserMenu($event)">
            <div class="user-avatar">
              <img v-if="userStore.currentUser?.avatarUrl" 
                   :src="userStore.currentUser.avatarUrl" 
                   :alt="userStore.currentUser.name"
                   class="avatar-image" />
              <div v-else class="avatar-placeholder">
                {{ userStore.currentUser?.name?.charAt(0) || 'U' }}
              </div>
            </div>
            
            <div v-if="showUserDropdown" class="user-dropdown">
              <button @click="goToPremium" class="menu-item">
                💎 프리미엄 구독
              </button>
              <div class="menu-divider"></div>
              <button @click="handleLogout" class="menu-item">
                🚪 로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <div v-if="userStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>타로 카드를 준비하고 있습니다...</p>
      </div>
      
      <div v-else class="app-content">
        <div class="welcome-section">
          <h2>{{ getGreetingMessage() }}</h2>
          <p class="subtitle">오늘의 운세를 확인해보세요</p>
        </div>
        
        <!-- 메인 메뉴 -->
        <div class="main-menu">
          <router-link to="/reading-select" class="menu-card">
            <div class="menu-icon">🔮</div>
            <div class="menu-content">
              <h3>타로 점 보기</h3>
              <p>카드가 전하는 메시지를 들어보세요</p>
            </div>
          </router-link>

          <div class="menu-card" @click="showDailyCard">
            <div class="menu-icon">☀️</div>
            <div class="menu-content">
              <h3>오늘의 카드</h3>
              <p>오늘 하루를 위한 특별한 메시지</p>
            </div>
          </div>

          <div class="menu-card" @click="showHistoryAlert">
            <div class="menu-icon">📚</div>
            <div class="menu-content">
              <h3>점괘 기록</h3>
              <p>지난 점괘들을 다시 확인해보세요</p>
            </div>
          </div>

          <router-link to="/board" class="menu-card">
            <div class="menu-icon">🌿</div>
            <div class="menu-content">
              <h3>비밀의 정원</h3>
              <p>익명으로 소통하는 커뮤니티</p>
            </div>
          </router-link>

          <router-link to="/events" class="menu-card">
            <div class="menu-icon">🎉</div>
            <div class="menu-content">
              <h3>이벤트</h3>
              <p>진행 중인 이벤트에 참여하세요</p>
            </div>
          </router-link>

          <router-link v-if="!userStore.isPremium" to="/premium" class="menu-card premium-card">
            <div class="menu-icon">👑</div>
            <div class="menu-content">
              <h3>프리미엄 구독</h3>
              <p>광고 없이 모든 기능을 이용하세요</p>
            </div>
          </router-link>
        </div>
      </div>
    </main>
    
    <!-- 버전 정보 표시 (하단 고정) -->
    <div class="version-info">
      v{{ appVersion }} (Build {{ buildVersion }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { showAlert, showConfirm } from '../utils/alerts';
import { nativeUtils } from '../utils/capacitor';
import packageInfo from '../../package.json';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// UI 상태
const showUserDropdown = ref(false);
const showTestButton = ref(import.meta.env.MODE !== 'production');
const isTestPanelOpen = ref(false);
const showTestMenu = ref(false);

// 버전 정보
const appVersion = ref(packageInfo.version || '1.0.0');
const buildVersion = ref('dev-1'); // Android 빌드 버전 - android/version.properties와 동기화

// 뒤로가기 버튼 처리
let lastBackPressTime = 0;

// 테스트 계정 확인
const isTestAccount = computed(() => {
  return userStore.currentUser?.email === 'test@example.com' || 
         userStore.currentUser?.email === 'premium@example.com';
});

const toggleTestPanel = () => {
  isTestPanelOpen.value = !isTestPanelOpen.value;
  window.dispatchEvent(new CustomEvent('toggle-test-panel'));
};

// 뒤로가기 버튼 핸들러
const handleBackButton = async () => {
  const currentTime = Date.now();
  
  // 2초 이내에 다시 누르면 앱 종료
  if (currentTime - lastBackPressTime < 2000) {
    await nativeUtils.exitApp();
  } else {
    // 첫 번째 누름 - 토스트 메시지 표시
    lastBackPressTime = currentTime;
    await nativeUtils.showToast('한번 더 누르면 앱이 종료됩니다', 'short');
  }
};

onMounted(async () => {
  // 메인 앱 페이지 로드
  
  if (userStore.currentUser && !userStore.isLoading) {
    // 사용자 이미 로드됨, 타로 데이터 로드
    tarotStore.loadReadings();
    tarotStore.loadDailyCard();
  } else if (!userStore.isLoading) {
    // 사용자 없음, 초기화 시도
    await userStore.initializeUser();
    tarotStore.loadReadings();
    tarotStore.loadDailyCard();
  }
  
  document.addEventListener('click', handleClickOutside);
  
  // 네이티브 앱인 경우 뒤로가기 버튼 리스너 설정
  nativeUtils.setupBackButtonListener(handleBackButton);
});

onUnmounted(() => {
  // 뒤로가기 버튼 리스너 제거
  nativeUtils.removeBackButtonListener();
  document.removeEventListener('click', handleClickOutside);
});

const getGreetingMessage = () => {
  const hour = new Date().getHours();
  const name = userStore.currentUser?.name || '고객';
  
  if (hour < 12) {
    return `좋은 아침이에요, ${name}님! ☀️`;
  } else if (hour < 18) {
    return `안녕하세요, ${name}님! 🌤️`;
  } else {
    return `좋은 저녁이에요, ${name}님! 🌙`;
  }
};

const showDailyCard = async () => {
  console.log('☀️ 오늘의 카드 클릭됨!');
  console.log('유료 여부:', userStore.isPremium);
  console.log('사용자:', userStore.currentUser?.email);
  
  // 오늘의 카드 페이지로 이동
  router.push('/daily-card');
};

const toggleUserMenu = (event: MouseEvent) => {
  showUserDropdown.value = !showUserDropdown.value;
  
  if (showUserDropdown.value) {
    setTimeout(() => {
      const dropdown = (event.target as HTMLElement).closest('.user-menu')?.querySelector<HTMLElement>('.user-dropdown');
      if (dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (rect.right > viewportWidth - 10) {
          const overflowAmount = rect.right - viewportWidth + 20;
          dropdown.style.transform = `translateX(-${overflowAmount}px)`;
        }
      }
    }, 10);
  }
};

const handleLogout = async () => {
  console.log('로그아웃 핸들러 실행');
  
  try {
    // 드롭다운 먼저 닫기
    showUserDropdown.value = false;
    
    // 로그아웃 실행
    await userStore.logout();
    
    // 약간의 지연 후 페이지 이동 (상태 업데이트 보장)
    setTimeout(() => {
      console.log('로그아웃 후 홈으로 이동');
      router.push('/');
    }, 100);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    // 에러가 있어도 홈으로 이동
    setTimeout(() => {
      router.push('/');
    }, 100);
  }
};


const goToPremium = () => {
  console.log('프리미엄 구독');
  showUserDropdown.value = false;
  router.push('/premium');
};

const showHistoryAlert = async () => {
  // 프리미엄 사용자 체크
  if (!userStore.isPremium) {
    const confirmed = await showConfirm({
      title: '프리미엄 전용 기능',
      message: '점괘 기록 보관은 프리미엄 구독자만 이용 가능합니다.\n\n프리미엄 구독 시 1년간 점괘를 안전하게 보관할 수 있습니다.',
      confirmText: '프리미엄 구독하기',
      cancelText: '닫기'
    });
    
    // 사용자가 '프리미엄 구독하기' 버튼을 클릭한 경우
    if (confirmed) {
      console.log('프리미엄 페이지로 이동');
      router.push('/premium');
    }
    return;
  }
  
  // 프리미엄 사용자는 기록 페이지로 이동
  router.push('/history');
};

const handleClickOutside = (event: MouseEvent) => {
  const userMenu = (event.target as HTMLElement).closest('.user-menu');
  if (!userMenu) {
    showUserDropdown.value = false;
    const dropdown = document.querySelector<HTMLElement>('.user-dropdown');
    if (dropdown) {
      dropdown.style.transform = 'translateX(0)';
    }
  }
};

// 테스트 메뉴 토글
const toggleTestMenu = () => {
  showTestMenu.value = !showTestMenu.value;
};

// 무료로 리셋
const resetToFree = async () => {
  try {
    console.log('🧪 테스트 계정 무료 리셋');
    const { profileService } = await import('../services/supabase');
    await profileService.updatePremiumStatus(
      userStore.currentUser?.id || '',
      false
    );
    await userStore.refreshPremiumStatus();
    await showAlert({
      title: '리셋 완료',
      message: '테스트 계정이 무료 상태로 되돌아갔습니다.'
    });
    showTestMenu.value = false;
  } catch (error) {
    console.error('리셋 실패:', error);
    await showAlert({
      title: '오류',
      message: '리셋 중 오류가 발생했습니다.'
    });
  }
};

// 프리미엄으로 업그레이드
const upgradeToPremium = async () => {
  try {
    console.log('🧪 테스트 계정 프리미엄 전환');
    const { profileService } = await import('../services/supabase');
    await profileService.updatePremiumStatus(
      userStore.currentUser?.id || '',
      true
    );
    await userStore.refreshPremiumStatus();
    await showAlert({
      title: '전환 완료',
      message: '테스트 계정이 프리미엄 상태가 되었습니다.'
    });
    showTestMenu.value = false;
  } catch (error) {
    console.error('프리미엄 전환 실패:', error);
    await showAlert({
      title: '오류',
      message: '전환 중 오류가 발생했습니다.'
    });
  }
};
</script>

<style scoped>
.main-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 헤더 */
.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.welcome-text {
  font-weight: 600;
  font-size: 16px;
}

.premium-badge {
  background: linear-gradient(135deg, #ffd700, #ffb347);
  color: #333;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

/* 테스트 모드 버튼 */
.test-mode-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.test-mode-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.test-mode-btn.active {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  transition: border-color 0.3s ease;
}

.user-avatar:hover {
  border-color: rgba(255, 255, 255, 0.6);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: white;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 180px;
  max-width: 250px;
  overflow: hidden;
  z-index: 1000;
  transform: translateX(0);
}

.menu-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(168, 85, 247, 0.1);
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.app-content {
  text-align: center;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-section h2 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 메인 메뉴 */
.main-menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.menu-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
}

.menu-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.menu-icon {
  font-size: 40px;
  width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
}

.menu-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.menu-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
}

.premium-card {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.premium-card:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
    gap: 12px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .user-info {
    display: none;
  }
  
  .test-mode-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .main-content {
    padding: 24px 16px;
  }
  
  .welcome-section h2 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .main-menu {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .menu-card {
    padding: 20px;
    gap: 16px;
  }
  
  .menu-icon {
    font-size: 32px;
    width: 50px;
  }
  
  .menu-content h3 {
    font-size: 18px;
  }
  
  .user-dropdown {
    right: 0;
    left: auto;
    margin-top: 12px;
    max-width: calc(100vw - 32px);
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .welcome-section h2 {
    font-size: 24px;
  }
  
  .menu-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .menu-icon {
    width: auto;
  }
  
  .user-dropdown {
    right: -20px;
    max-width: calc(100vw - 20px);
    min-width: 180px;
  }
}

/* 다크모드 최적화 */
@media (prefers-color-scheme: dark) {
  .user-dropdown {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .menu-item {
    color: white;
  }
  
  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .menu-divider {
    background: rgba(255, 255, 255, 0.2);
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  .menu-card:hover {
    transform: none;
  }
}

/* 포커스 표시 */
button:focus,
.menu-card:focus {
  outline: 2px solid rgba(168, 85, 247, 0.8);
  outline-offset: 2px;
}

/* 테스트 계정 플로팅 버튼 */
.test-floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 999;
}

.test-floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 165, 0, 0.5);
}

/* 테스트 메뉴 패널 */
.test-menu-panel {
  position: fixed;
  bottom: 90px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 998;
  min-width: 200px;
}

.test-menu-panel h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.test-menu-panel p {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #666;
}

.test-menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.test-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
  color: white;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.premium-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
  color: white;
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* 모바일 반응형 */
@media (max-width: 640px) {
  .test-floating-button {
    width: 50px;
    height: 50px;
    font-size: 24px;
    bottom: 15px;
    right: 15px;
  }
  
  .test-menu-panel {
    bottom: 75px;
    right: 15px;
    left: 15px;
    min-width: auto;
  }
}

/* 버전 정보 스타일 */
.version-info {
  position: fixed;
  bottom: 5px;
  right: 10px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 10;
  font-family: monospace;
}
</style>
