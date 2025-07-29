<template>
  <div class="settings-page">
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
              <div class="setting-value">{{ user?.email || '게스트' }}</div>
            </div>
            <div class="setting-item">
              <div class="setting-label">가입일</div>
              <div class="setting-value">{{ formatDate(user?.createdAt) }}</div>
            </div>
            <div class="setting-item">
              <div class="setting-label">구독 상태</div>
              <div class="setting-value">
                <span v-if="user?.isPremium" class="premium-badge">✨ 프리미엄</span>
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
        <section class="settings-section">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { NativeUtils } from '../utils/capacitor';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// computed
const user = computed(() => userStore.currentUser);
const isNative = NativeUtils.isNative;

// 설정 상태
const settings = ref({
  dailyNotification: false,
  hapticFeedback: true,
  animations: true,
});

onMounted(() => {
  // 저장된 설정 불러오기
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
  }
});

// 날짜 포맷
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 설정 업데이트
const updateSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings.value));
  
  // 햅틱 설정 적용
  if (!settings.value.hapticFeedback) {
    // 햅틱 비활성화 로직
  }
};

// 히스토리 삭제
const clearHistory = async () => {
  const confirm = window.confirm('모든 점괘 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');
  if (!confirm) return;
  
  await NativeUtils.buttonTapHaptic();
  tarotStore.clearReadings();
  alert('히스토리가 삭제되었습니다.');
};

// 데이터 내보내기
const exportData = async () => {
  await NativeUtils.buttonTapHaptic();
  
  const data = {
    user: user.value,
    readings: tarotStore.readings,
    exportDate: new Date().toISOString(),
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `tarot-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  alert('데이터가 내보내졌습니다.');
};

// 도움말
const goToHelp = async () => {
  await NativeUtils.buttonTapHaptic();
  // 도움말 페이지로 이동 또는 외부 링크
  window.open('https://tarot-garden.com/help', '_blank');
};

// 피드백 보내기
const sendFeedback = async () => {
  await NativeUtils.buttonTapHaptic();
  // 이메일 또는 피드백 폼
  window.location.href = 'mailto:support@tarot-garden.com?subject=타로의 정원 피드백';
};

// 앱 평가하기
const rateApp = async () => {
  await NativeUtils.buttonTapHaptic();
  // 앱스토어/플레이스토어로 이동
  if (NativeUtils.platform === 'ios') {
    window.open('https://apps.apple.com/app/tarot-garden', '_blank');
  } else if (NativeUtils.platform === 'android') {
    window.open('https://play.google.com/store/apps/details?id=com.tarotgarden', '_blank');
  }
};

// 로그아웃
const logout = async () => {
  const confirm = window.confirm('로그아웃 하시겠습니까?');
  if (!confirm) return;
  
  await NativeUtils.buttonTapHaptic();
  await userStore.logout();
  router.push('/');
};

// 뒤로가기
const goBack = async () => {
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
