<template>
  <div class="settings-page">
    <!-- 로딩 스피너 -->
    <div v-if="userStore.isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
    <!-- 헤더 -->
    <header class="header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="header-title">설정</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 사용자 정보 섹션 -->
        <section class="settings-section">
          <h2 class="section-title">계정 정보</h2>
          <div class="settings-group">
            <div class="setting-item">
              <div class="setting-label">이메일</div>
              <div class="setting-value">{{ userStore.currentUser?.email || '게스트' }}</div>
            </div>
            <div class="setting-item">
              <div class="setting-label">가입일</div>
              <div class="setting-value">{{ formatDate(userStore.currentUser?.createdAt?.toISOString()) }}</div>
            </div>
            <div class="setting-item">
              <div class="setting-label">구독 상태</div>
              <div class="setting-value">
                <span v-if="isSubscribed" class="premium-badge">✨ 프리미엄</span>
                <span v-else class="free-badge">무료</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 알림 설정 섹션 -->
        <section class="settings-section" v-if="isNative">
          <h2 class="section-title">알림 설정</h2>
          <div class="settings-group">
            <div class="setting-item toggle-item">
              <div class="setting-info">
                <div class="setting-label">일일 타로 알림</div>
                <div class="setting-description">매일 오전 9시에 일일 타로를 알려드립니다</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.dailyNotification" @change="updateSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <!-- 앱 설정 섹션 -->
        <section class="settings-section">
          <h2 class="section-title">앱 설정</h2>
          <div class="settings-group">
            <div class="setting-item toggle-item">
              <div class="setting-info">
                <div class="setting-label">진동 피드백</div>
                <div class="setting-description">카드를 뽑을 때 진동 효과</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.hapticFeedback" @change="updateSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item toggle-item">
              <div class="setting-info">
                <div class="setting-label">애니메이션 효과</div>
                <div class="setting-description">화면 전환 애니메이션</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.animations" @change="updateSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <!-- 데이터 관리 섹션 -->
        <section class="settings-section">
          <h2 class="section-title">데이터 관리</h2>
          <div class="settings-group">
            <button @click="clearHistory" class="action-button danger">
              🗑️ 히스토리 삭제
            </button>
            <button @click="exportData" class="action-button">
              📤 데이터 내보내기
            </button>
          </div>
        </section>

        <!-- 지원 섹션 -->
        <section class="settings-section">
          <h2 class="section-title">지원</h2>
          <div class="settings-group">
            <button @click="goToHelp" class="action-button">
              ❓ 도움말
            </button>
            <button @click="sendFeedback" class="action-button">
              💬 피드백 보내기
            </button>
            <button @click="rateApp" class="action-button" v-if="isNative">
              ⭐ 앱 평가하기
            </button>
          </div>
        </section>

        <!-- 계정 관리 -->
        <section class="settings-section" v-if="userStore.isLoggedIn">
          <div class="settings-group">
            <button @click="logout" class="action-button logout">
              🚪 로그아웃
            </button>
          </div>
        </section>

        <!-- 앱 정보 -->
        <div class="app-info">
          <p>타로의 정원 v1.0.0</p>
          <p class="copyright">© 2025 Tarot Garden. All rights reserved.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { NativeUtils } from '@/utils/capacitor';
import { showAlert, showConfirm } from '@/utils/alerts';
import { useSubscriptionStatus } from '@/composables/useSubscriptionStatus';
import { supabase } from '@/services/supabase';

const router = useRouter();
const userStore = useUserStore();

const { isSubscribed } = useSubscriptionStatus();

const isNative = NativeUtils.isNative;

interface AppSettings {
  dailyNotification: boolean;
  hapticFeedback: boolean;
  animations: boolean;
}

const settings = ref<AppSettings>({
  dailyNotification: false,
  hapticFeedback: true,
  animations: true,
});

onMounted(() => {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
  }
});

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const updateSettings = (): void => {
  localStorage.setItem('appSettings', JSON.stringify(settings.value));
};

const clearHistory = async (): Promise<void> => {
  const confirmed = await showConfirm({
    title: '히스토리 삭제',
    message: '모든 점괘 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
  });
  if (!confirmed) return;
  
  await NativeUtils.buttonTapHaptic();
  
  try {
    if (userStore.currentUser?.id) {
      const { error } = await supabase
        .from('reading_history')
        .delete()
        .eq('user_id', userStore.currentUser.id);
      
      if (error) throw error;
    }
    
    await showAlert({
      title: '성공',
      message: '히스토리가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    await showAlert({
      title: '오류',
      message: '히스토리 삭제 중 오류가 발생했습니다.'
    });
  }
};

const exportData = async (): Promise<void> => {
  await NativeUtils.buttonTapHaptic();
  
  try {
    let readings = [];
    
    if (userStore.currentUser?.id) {
      const { data, error } = await supabase
        .from('reading_history')
        .select(`
          *,
          cards:reading_cards(
            *,
            card:tarot_cards(*)
          )
        `)
        .eq('user_id', userStore.currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      readings = data || [];
    }
    
    const exportData = {
      user: {
        email: userStore.currentUser?.email,
        created_at: userStore.currentUser?.createdAt?.toISOString()
      },
      readings,
      exportDate: new Date().toISOString(),
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarot-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    await showAlert({
      title: '성공',
      message: '데이터가 내보내졌습니다.'
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    await showAlert({
      title: '오류',
      message: '데이터 내보내기 중 오류가 발생했습니다.'
    });
  }
};

const goToHelp = async (): Promise<void> => {
  await NativeUtils.buttonTapHaptic();
  window.open('https://tarot-garden.com/help', '_blank');
};

const sendFeedback = async (): Promise<void> => {
  await NativeUtils.buttonTapHaptic();
  window.location.href = 'mailto:support@tarot-garden.com?subject=타로의 정원 피드백';
};

const rateApp = async (): Promise<void> => {
  await NativeUtils.buttonTapHaptic();
  if (NativeUtils.platform === 'ios') {
    window.open('https://apps.apple.com/app/tarot-garden', '_blank');
  } else if (NativeUtils.platform === 'android') {
    window.open('https://play.google.com/store/apps/details?id=com.tarotgarden', '_blank');
  }
};

const logout = async (): Promise<void> => {
  const confirmed = await showConfirm({
    title: '로그아웃',
    message: '로그아웃 하시겠습니까?'
  });
  if (!confirmed) return;
  
  await NativeUtils.buttonTapHaptic();
  
  console.log('Settings: 로그아웃 시작');
  
  try {
    // 로그아웃 실행
    await userStore.logout();
    console.log('Settings: 로그아웃 완료');
    
    // 약간의 지연 후 페이지 이동 (상태 업데이트 보장)
    setTimeout(() => {
      console.log('Settings: 홈으로 이동');
      router.push('/');
    }, 100);
  } catch (error) {
    console.error('Settings: 로그아웃 오류:', error);
    // 오류가 있어도 홈으로 이동
    setTimeout(() => {
      router.push('/');
    }, 100);
  }
};

const goBack = async (): Promise<void> => {
  await NativeUtils.buttonTapHaptic();
  router.push('/');
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(45, 42, 92, 0.3);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.back-button:hover {
  opacity: 0.8;
}

.header-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
  flex: 1;
}

.header-spacer {
  width: 40px;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

/* 설정 섹션 */
.settings-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: #A855F7;
}

.settings-group {
  background: rgba(45, 42, 92, 0.6);
  border-radius: 15px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 설정 항목 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 1rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.25rem;
}

.setting-value {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.setting-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 배지 */
.premium-badge {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 600;
}

.free-badge {
  background: rgba(107, 114, 128, 0.5);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
}

/* 토글 스위치 */
.toggle-item {
  padding: 0.5rem 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(107, 114, 128, 0.5);
  transition: 0.4s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #A855F7;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* 액션 버튼 */
.action-button {
  width: 100%;
  padding: 1rem;
  background: rgba(62, 59, 110, 0.8);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-button:hover {
  background: rgba(62, 59, 110, 1);
  transform: translateY(-1px);
}

.action-button.danger {
  background: rgba(239, 68, 68, 0.8);
}

.action-button.danger:hover {
  background: rgba(239, 68, 68, 1);
}

.action-button.logout {
  background: rgba(107, 114, 128, 0.5);
}

.action-button.logout:hover {
  background: rgba(107, 114, 128, 0.7);
}

/* 앱 정보 */
.app-info {
  text-align: center;
  padding: 2rem 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.app-info p {
  margin: 0.25rem 0;
}

.copyright {
  font-size: 0.75rem;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #A855F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .settings-group {
    padding: 0.75rem;
  }
  
  .setting-item {
    padding: 0.5rem 0;
  }
  
  .action-button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
}
</style>
