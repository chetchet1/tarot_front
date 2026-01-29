<template>
  <div class="main-app">
    <!-- ?ㅻ뜑 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">?뵰 ?濡쒖쓽 ?뺤썝</h1>
        </div>
        
        <div class="user-section">
          <!-- ?뚯뒪??踰꾪듉 (媛쒕컻/?뚯뒪?몄슜) -->
          <button 
            v-if="showTestButton"
            class="test-mode-btn"
            @click="toggleTestPanel"
            :class="{ active: isTestPanelOpen }"
          >
            ?㎦
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
                ?뭿 ?꾨━誘몄뾼 援щ룆
              </button>
              <button v-if="userStore.isLoggedIn" @click="handleDeleteAccount" class="menu-item danger">
                ??? ?怨꾩젙 ??젣
              </button>
              <div class="menu-divider"></div>
              <button @click="handleLogout" class="menu-item">
                ?슞 濡쒓렇?꾩썐
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 硫붿씤 肄섑뀗痢?-->
    <main class="main-content">
      <div v-if="userStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>?濡?移대뱶瑜?以鍮꾪븯怨??덉뒿?덈떎...</p>
      </div>
      
      <div v-else class="app-content">
        <div class="welcome-section">
          <h2>{{ getGreetingMessage() }}</h2>
          <p class="subtitle">?ㅻ뒛???댁꽭瑜??뺤씤?대낫?몄슂</p>
        </div>
        
        <!-- 硫붿씤 硫붾돱 -->
        <div class="main-menu">
          <router-link to="/reading-select" class="menu-card">
            <div class="menu-icon">?뵰</div>
            <div class="menu-content">
              <h3>?濡???蹂닿린</h3>
              <p>移대뱶媛 ?꾪븯??硫붿떆吏瑜??ㅼ뼱蹂댁꽭??/p>
            </div>
          </router-link>

          <div class="menu-card" @click="showDailyCard">
            <div class="menu-icon">?截?/div>
            <div class="menu-content">
              <h3>?ㅻ뒛??移대뱶</h3>
              <p>?ㅻ뒛 ?섎（瑜??꾪븳 ?밸퀎??硫붿떆吏</p>
            </div>
          </div>

          <div class="menu-card" @click="showHistoryAlert">
            <div class="menu-icon">?뱴</div>
            <div class="menu-content">
              <h3>?먭킌 湲곕줉</h3>
              <p>吏???먭킌?ㅼ쓣 ?ㅼ떆 ?뺤씤?대낫?몄슂</p>
            </div>
          </div>

          <router-link to="/board" class="menu-card">
            <div class="menu-icon">?뙼</div>
            <div class="menu-content">
              <h3>鍮꾨????뺤썝</h3>
              <p>?듬챸?쇰줈 ?뚰넻?섎뒗 而ㅻ??덊떚</p>
            </div>
          </router-link>

          <router-link to="/events" class="menu-card">
            <div class="menu-icon">?럦</div>
            <div class="menu-content">
              <h3>?대깽??/h3>
              <p>吏꾪뻾 以묒씤 ?대깽?몄뿉 李몄뿬?섏꽭??/p>
            </div>
          </router-link>

          <router-link v-if="!userStore.isPremium" to="/premium" class="menu-card premium-card">
            <div class="menu-icon">?몣</div>
            <div class="menu-content">
              <h3>?꾨━誘몄뾼 援щ룆</h3>
              <p>愿묎퀬 ?놁씠 紐⑤뱺 湲곕뒫???댁슜?섏꽭??/p>
            </div>
          </router-link>
        </div>
      </div>
    </main>
    
    <!-- 踰꾩쟾 ?뺣낫 ?쒖떆 (?섎떒 怨좎젙) -->
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
const DELETE_ACCOUNT_URL = 'https://chetchet1.github.io/tarot-privacy-policy/delete-account.html';

// UI ?곹깭
const showUserDropdown = ref(false);
const showTestButton = ref(import.meta.env.MODE !== 'production');
const isTestPanelOpen = ref(false);
const showTestMenu = ref(false);

// 踰꾩쟾 ?뺣낫
const appVersion = ref(packageInfo.version || '1.0.0');
const buildVersion = ref('06940001'); // Android 鍮뚮뱶 踰꾩쟾 - android/version.properties? ?숆린??
// ?ㅻ줈媛湲?踰꾪듉 泥섎━
let lastBackPressTime = 0;

// ?뚯뒪??怨꾩젙 ?뺤씤
const isTestAccount = computed(() => {
  return userStore.currentUser?.email === 'test@example.com' || 
         userStore.currentUser?.email === 'premium@example.com';
});

const toggleTestPanel = () => {
  isTestPanelOpen.value = !isTestPanelOpen.value;
  window.dispatchEvent(new CustomEvent('toggle-test-panel'));
};

// ?ㅻ줈媛湲?踰꾪듉 ?몃뱾??const handleBackButton = async () => {
  const currentTime = Date.now();
  
  // 2珥??대궡???ㅼ떆 ?꾨Ⅴ硫???醫낅즺
  if (currentTime - lastBackPressTime < 2000) {
    await nativeUtils.exitApp();
  } else {
    // 泥?踰덉㎏ ?꾨쫫 - ?좎뒪??硫붿떆吏 ?쒖떆
    lastBackPressTime = currentTime;
    await nativeUtils.showToast('?쒕쾲 ???꾨Ⅴ硫??깆씠 醫낅즺?⑸땲??, 'short');
  }
};

onMounted(async () => {
  // 硫붿씤 ???섏씠吏 濡쒕뱶
  
  if (userStore.currentUser && !userStore.isLoading) {
    // ?ъ슜???대? 濡쒕뱶?? ?濡??곗씠??濡쒕뱶
    tarotStore.loadReadings();
    tarotStore.loadDailyCard();
  } else if (!userStore.isLoading) {
    // ?ъ슜???놁쓬, 珥덇린???쒕룄
    await userStore.initializeUser();
    tarotStore.loadReadings();
    tarotStore.loadDailyCard();
  }
  
  document.addEventListener('click', handleClickOutside);
  
  // ?ㅼ씠?곕툕 ?깆씤 寃쎌슦 ?ㅻ줈媛湲?踰꾪듉 由ъ뒪???ㅼ젙
  nativeUtils.setupBackButtonListener(handleBackButton);
});

onUnmounted(() => {
  // ?ㅻ줈媛湲?踰꾪듉 由ъ뒪???쒓굅
  nativeUtils.removeBackButtonListener();
  document.removeEventListener('click', handleClickOutside);
});

const getGreetingMessage = () => {
  const hour = new Date().getHours();
  const name = userStore.currentUser?.name || '怨좉컼';
  
  if (hour < 12) {
    return `醫뗭? ?꾩묠?댁뿉?? ${name}?? ?截?;
  } else if (hour < 18) {
    return `?덈뀞?섏꽭?? ${name}?? ?뙟截?;
  } else {
    return `醫뗭? ??곸씠?먯슂, ${name}?? ?뙔`;
  }
};

const showDailyCard = async () => {
  console.log('?截??ㅻ뒛??移대뱶 ?대┃??');
  console.log('?좊즺 ?щ?:', userStore.isPremium);
  console.log('?ъ슜??', userStore.currentUser?.email);
  
  // ?ㅻ뒛??移대뱶 ?섏씠吏濡??대룞
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
  console.log('濡쒓렇?꾩썐 ?몃뱾???ㅽ뻾');
  
  try {
    // ?쒕∼?ㅼ슫 癒쇱? ?リ린
    showUserDropdown.value = false;
    
    // 濡쒓렇?꾩썐 ?ㅽ뻾
    await userStore.logout();
    
    // ?쎄컙??吏?????섏씠吏 ?대룞 (?곹깭 ?낅뜲?댄듃 蹂댁옣)
    setTimeout(() => {
      console.log('濡쒓렇?꾩썐 ???덉쑝濡??대룞');
      router.push('/');
    }, 100);
  } catch (error) {
    console.error('濡쒓렇?꾩썐 ?ㅽ뙣:', error);
    // ?먮윭媛 ?덉뼱???덉쑝濡??대룞
    setTimeout(() => {
      router.push('/');
    }, 100);
  }
};


const openExternalUrl = (url: string) => {
  try {
    window.open(url, '_blank', 'noopener');
  } catch (error) {
    window.location.href = url;
  }
};

const handleDeleteAccount = async () => {
  showUserDropdown.value = false;
  const confirmed = await showConfirm({
    title: '?怨꾩젙 ??젣',
    message: '?怨꾩젙 ??젣 ?붿껌 ?섏씠吏濡??대룞?⑸땲??.\n?붿껌 ?완료 ????蹂닿?媛 ?댁떎?쒗븯怨??뚯븘?댁삤기 어렵습니다.\n援щ룆 ?⑦뎅???ㅽ넗?? 정책에 따릅니다.\n계속하시겠습니까?',
    confirmText: '?탈퇴',
    cancelText: '?취소'
  });

  if (!confirmed) return;

  await showAlert({
    title: '?삭제 요청',
    message: '?삭제 요청 페이지로 이동합니다. 안내에 따라 요청을 완료해주세요.'
  });

  openExternalUrl(DELETE_ACCOUNT_URL);

  try {
    await userStore.logout();
  } finally {
    router.push('/');
  }
};
const goToPremium = \(\) => \{
  console.log('?꾨━誘몄뾼 援щ룆');
  showUserDropdown.value = false;
  router.push('/premium');
};

const showHistoryAlert = async () => {
  // ?꾨━誘몄뾼 ?ъ슜??泥댄겕
  if (!userStore.isPremium) {
    const confirmed = await showConfirm({
      title: '?꾨━誘몄뾼 ?꾩슜 湲곕뒫',
      message: '?먭킌 湲곕줉 蹂닿?? ?꾨━誘몄뾼 援щ룆?먮쭔 ?댁슜 媛?ν빀?덈떎.\n\n?꾨━誘몄뾼 援щ룆 ??1?꾧컙 ?먭킌瑜??덉쟾?섍쾶 蹂닿??????덉뒿?덈떎.',
      confirmText: '?꾨━誘몄뾼 援щ룆?섍린',
      cancelText: '?リ린'
    });
    
    // ?ъ슜?먭? '?꾨━誘몄뾼 援щ룆?섍린' 踰꾪듉???대┃??寃쎌슦
    if (confirmed) {
      console.log('?꾨━誘몄뾼 ?섏씠吏濡??대룞');
      router.push('/premium');
    }
    return;
  }
  
  // ?꾨━誘몄뾼 ?ъ슜?먮뒗 湲곕줉 ?섏씠吏濡??대룞
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

// ?뚯뒪??硫붾돱 ?좉?
const toggleTestMenu = () => {
  showTestMenu.value = !showTestMenu.value;
};

// 臾대즺濡?由ъ뀑
const resetToFree = async () => {
  try {
    console.log('?㎦ ?뚯뒪??怨꾩젙 臾대즺 由ъ뀑');
    const { profileService } = await import('../services/supabase');
    await profileService.updatePremiumStatus(
      userStore.currentUser?.id || '',
      false
    );
    await userStore.refreshPremiumStatus();
    await showAlert({
      title: '由ъ뀑 ?꾨즺',
      message: '?뚯뒪??怨꾩젙??臾대즺 ?곹깭濡??섎룎?꾧컮?듬땲??'
    });
    showTestMenu.value = false;
  } catch (error) {
    console.error('由ъ뀑 ?ㅽ뙣:', error);
    await showAlert({
      title: '?ㅻ쪟',
      message: '由ъ뀑 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.'
    });
  }
};

// ?꾨━誘몄뾼?쇰줈 ?낃렇?덉씠??const upgradeToPremium = async () => {
  try {
    console.log('?㎦ ?뚯뒪??怨꾩젙 ?꾨━誘몄뾼 ?꾪솚');
    const { profileService } = await import('../services/supabase');
    await profileService.updatePremiumStatus(
      userStore.currentUser?.id || '',
      true
    );
    await userStore.refreshPremiumStatus();
    await showAlert({
      title: '?꾪솚 ?꾨즺',
      message: '?뚯뒪??怨꾩젙???꾨━誘몄뾼 ?곹깭媛 ?섏뿀?듬땲??'
    });
    showTestMenu.value = false;
  } catch (error) {
    console.error('?꾨━誘몄뾼 ?꾪솚 ?ㅽ뙣:', error);
    await showAlert({
      title: '?ㅻ쪟',
      message: '?꾪솚 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.'
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
  padding: 0 env(safe-area-inset-right) 0 env(safe-area-inset-left);
}

/* ?ㅻ뜑 */
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

/* ?뚯뒪??紐⑤뱶 踰꾪듉 */
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


.menu-item.danger {
  color: #b91c1c;
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}
.menu-item:hover {
  background: rgba(168, 85, 247, 0.1);
}

.menu-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

/* 硫붿씤 肄섑뀗痢?*/
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  padding-bottom: 40px;
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

/* 硫붿씤 硫붾돱 */
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

/* 諛섏쓳???붿옄??*/
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

/* ?ㅽ겕紐⑤뱶 理쒖쟻??*/
@media (prefers-color-scheme: dark) {
  .user-dropdown {
    background: rgba(30, 30, 30, 0.95);
  }
  
  .menu-item {
    color: white;
  }
  
  
.menu-item.danger {
  color: #b91c1c;
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}
.menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .menu-divider {
    background: rgba(255, 255, 255, 0.2);
  }
}

/* ?묎렐??*/
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  .menu-card:hover {
    transform: none;
  }
}

/* ?ъ빱???쒖떆 */
button:focus,
.menu-card:focus {
  outline: 2px solid rgba(168, 85, 247, 0.8);
  outline-offset: 2px;
}

/* ?뚯뒪??怨꾩젙 ?뚮줈??踰꾪듉 */
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

/* ?뚯뒪??硫붾돱 ?⑤꼸 */
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

/* 紐⑤컮??諛섏쓳??*/
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

/* 踰꾩쟾 ?뺣낫 ?ㅽ???*/
.version-info {
  position: fixed;
  bottom: max(4px, env(safe-area-inset-bottom));
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

