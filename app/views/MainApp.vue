<template>
  <div class="main-app">
    <!-- 헤더 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">🔮 타로 카드 점집</h1>
        </div>
        
        <div class="user-section">
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
              <button @click="goToProfile" class="menu-item">
                👤 프로필 설정
              </button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// UI 상태
const showUserDropdown = ref(false);

onMounted(async () => {
  console.log('🏠 메인 앱 페이지 로드');
  
  // 사용자가 이미 로그인되어 있고 로딩이 아니면 바로 진행
  if (userStore.currentUser && !userStore.isLoading) {
    console.log('사용자 이미 로드됨, 타로 데이터 로드');
    tarotStore.loadReadings();
    tarotStore.loadDailyCard();
  } else if (!userStore.isLoading) {
    // 로딩 중이 아니면 다시 초기화 시도
    console.log('사용자 없음, 초기화 시도');
    await userStore.initializeUser();
    tarotStore.loadReadings();
    tarotStore.loadDailyCard();
  }
  
  // 외부 클릭 이벤트 리스너 추가
  document.addEventListener('click', handleClickOutside);
});

// 인사말 메시지 생성
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

// 오늘의 카드 보기
const showDailyCard = () => {
  console.log('☀️ 오늘의 카드 클릭');
  router.push('/card-drawing?spread=daily');
};

// 사용자 메뉴 토글
const toggleUserMenu = (event) => {
  showUserDropdown.value = !showUserDropdown.value;
  
  if (showUserDropdown.value) {
    // 드롭다운이 화면을 벗어나지 않도록 위치 조정
    setTimeout(() => {
      const dropdown = event.target.closest('.user-menu')?.querySelector('.user-dropdown');
      if (dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // 화면 오른쪽을 벗어나는 경우 왼쪽으로 이동
        if (rect.right > viewportWidth - 10) {
          const overflowAmount = rect.right - viewportWidth + 20;
          dropdown.style.transform = `translateX(-${overflowAmount}px)`;
        }
      }
    }, 10);
  }
};

// 로그아웃 처리
const handleLogout = async () => {
  try {
    await userStore.logout();
    showUserDropdown.value = false;
    router.push('/');
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
};

// 네비게이션 함수들
const goToProfile = () => {
  console.log('프로필 설정');
  showUserDropdown.value = false;
  // TODO: 프로필 페이지로 이동
};

const goToPremium = () => {
  console.log('프리미엄 구독');
  showUserDropdown.value = false;
  router.push('/premium');
};

// 점괘 기록 알림
const showHistoryAlert = () => {
  alert('해당 기능은 차후 업데이트 됩니다');
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event) => {
  const userMenu = event.target.closest('.user-menu');
  if (!userMenu) {
    showUserDropdown.value = false;
    // 드롭다운을 닫을 때 transform 리셋
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
      dropdown.style.transform = 'translateX(0)';
    }
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
  /* 화면 경계를 벗어나지 않도록 조정 */
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
    /* 모바일에서는 화면 끝에서 잘리지 않도록 조정 */
    right: 0;
    left: auto;
    margin-top: 12px;
    /* 최대 너비를 화면 너비로 제한 */
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
  
  /* 진짜 작은 화면에서는 드롭다운을 왼쪽으로 이동 */
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
</style>
