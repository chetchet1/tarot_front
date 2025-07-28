<template>
  <Page class="page">
    <ActionBar title="타로의 정원" class="action-bar" />
    
    <ScrollView>
      <StackLayout class="home-container">
        <!-- 헤더 섹션 -->
        <StackLayout class="header-section">
          <Label text="🔮" class="app-icon" />
          <Label text="타로의 정원" class="app-title" />
          <Label text="당신의 운명을 들여다보세요" class="app-subtitle" />
        </StackLayout>

        <!-- 오늘의 카드 섹션 -->
        <StackLayout class="today-card-section" @tap="showDailyCard">
          <Label text="오늘의 카드" class="section-title" />
          <GridLayout class="daily-card-container">
            <Image 
              v-if="dailyCard"
              :src="dailyCard.imageUrl" 
              class="daily-card-image"
              stretch="aspectFit"
            />
            <Label 
              v-else
              text="탭하여 오늘의 카드를 뽑으세요"
              class="daily-card-placeholder"
            />
          </GridLayout>
        </StackLayout>

        <!-- 무료 점괘 사용 현황 (무료 사용자에게만 표시) -->
        <StackLayout v-if="!user?.isPremium" class="free-usage-section">
          <Label :text="`오늘의 무료 점괘: ${freeReadingsToday}/${maxFreeReadingsPerDay}`" class="usage-text" />
          <ProgressBar 
            :value="freeReadingsToday" 
            :maxValue="maxFreeReadingsPerDay" 
            class="usage-progress"
          />
        </StackLayout>

        <!-- 메뉴 버튼들 -->
        <StackLayout class="menu-section">
          <Button 
            text="🎴 타로 점보기" 
            @tap="goToReading"
            class="menu-button primary-button"
            :class="{ disabled: !user?.isPremium && !canUseFreeReading }"
          />
          
          <Button 
            text="📚 점괘 기록" 
            @tap="goToHistory"
            class="menu-button secondary-button"
          />
          
          <Button 
            text="📖 타로카드 사전" 
            @tap="goToCardDictionary"
            class="menu-button secondary-button"
          />
          
          <Button 
            v-if="!user?.isPremium"
            text="✨ 프리미엄 구독" 
            @tap="goToPremium"
            class="menu-button premium-button"
          />
          
          <Button 
            text="⚙️ 설정" 
            @tap="goToSettings"
            class="menu-button secondary-button"
          />
          
          <!-- 개발용 테스트 버튼 -->
          <Button 
            v-if="!user?.isPremium"
            text="🔄 무료 점괘 초기화 (테스트용)" 
            @tap="resetFreeReadings"
            class="menu-button test-button"
          />
        </StackLayout>

        <!-- 프리미엄 프로모션 (무료 사용자에게만 표시) -->
        <StackLayout v-if="!user?.isPremium" class="promo-section">
          <Label text="🌟 프리미엄 혜택" class="promo-title" />
          <Label text="• 광고 제거" class="promo-feature" />
          <Label text="• 켈틱 크로스 등 고급 배열" class="promo-feature" />
          <Label text="• 무제한 히스토리 저장" class="promo-feature" />
          <Label text="• 점괘 결과 공유" class="promo-feature" />
          <Label text="월 2,900원" class="promo-price" />
        </StackLayout>
      </StackLayout>
    </ScrollView>
    
    <!-- 프리미엄 테스트 패널 (개발용) -->
    <PremiumTestPanel />
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Frame, confirm, alert } from '@nativescript/core';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { TarotCard } from '../models/tarot';
import PremiumTestPanel from '../components/PremiumTestPanel.vue';

const userStore = useUserStore();
const tarotStore = useTarotStore();

// reactive computed properties
const user = computed(() => userStore.currentUser);
const freeReadingsToday = computed(() => userStore.freeReadingsToday);
const maxFreeReadingsPerDay = computed(() => userStore.maxFreeReadingsPerDay);
const canUseFreeReading = computed(() => userStore.canUseFreeReading);
const dailyCard = ref<TarotCard | null>(null);

onMounted(async () => {
  // 사용자 초기화
  userStore.initializeUser();
  
  // 타로 스토어 초기화 (비동기)
  await tarotStore.initialize();
  
  tarotStore.loadReadings();
  tarotStore.loadDailyCard();
  
  // 저장된 오늘의 카드 확인
  const today = new Date().toDateString();
  const savedDaily = tarotStore.getDailyCard();
  
  if (savedDaily && savedDaily.date === today) {
    dailyCard.value = savedDaily.card;
  }
});

const showDailyCard = async () => {
  if (!dailyCard.value) {
    // 광고 표시 (무료 사용자)
    if (!user.value?.isPremium) {
      // 테스트를 위해 임시로 광고 시뮬레이션
      console.log('광고 표시');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 카드 뽑기
    const card = tarotStore.drawDailyCard();
    dailyCard.value = card;
  }
  
  // 카드 상세 보기로 이동 (임시로 알림 표시)
  alert({
    title: dailyCard.value.nameKr,
    message: dailyCard.value.meanings.general.upright,
    okButtonText: '확인'
  });
};

const navigateTo = (pageName: string) => {
  const frame = Frame.topmost();
  switch(pageName) {
    case 'reading-select':
      frame.navigate({
        moduleName: 'views/ReadingSelect',
        transition: { name: 'slide' }
      });
      break;
    case 'premium':
      frame.navigate({
        moduleName: 'views/Premium',
        transition: { name: 'slide' }
      });
      break;
    default:
      // 다른 페이지들은 추후 구현
      alert({
        title: '준비 중',
        message: `${pageName} 페이지는 준비 중입니다.`,
        okButtonText: '확인'
      });
  }
};

const goToReading = async () => {
  // 무료 사용자는 사용 횟수 체크
  if (!user.value?.isPremium) {
    const status = userStore.getFreeReadingStatus();
    if (!status.canUse) {
      const result = await confirm({
        title: '무료 점괘 사용 완료',
        message: `오늘 무료 점괘 ${status.total}회를 모두 사용하셨습니다. 프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.`,
        okButtonText: '프리미엄 보기',
        cancelButtonText: '취소'
      });
      
      if (result) {
        goToPremium();
      }
      return;
    }
  }
  
  navigateTo('reading-select');
};
const goToHistory = () => navigateTo('history');
const goToCardDictionary = () => navigateTo('card-dictionary');
const goToPremium = () => navigateTo('premium');
const goToSettings = () => navigateTo('settings');

// 개발용 테스트 함수
const resetFreeReadings = () => {
  userStore.resetFreeReadings();
  alert({
    title: '초기화 완료',
    message: '무료 점괘 횟수가 초기화되었습니다.',
    okButtonText: '확인'
  });
};
</script>

<style scoped>
.page {
  background-color: #1E1B4B;
}

.action-bar {
  background-color: #2D2A5C;
  color: #FFFFFF;
}

.home-container {
  padding: 20;
}

.header-section {
  margin-bottom: 30;
  horizontal-align: center;
}

.app-icon {
  font-size: 60;
  margin-bottom: 10;
}

.app-title {
  font-size: 28;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 5;
}

.app-subtitle {
  font-size: 16;
  color: #E5E7EB;
  opacity: 0.8;
}

.today-card-section {
  margin-bottom: 30;
  padding: 20;
  background-color: #2D2A5C;
  border-radius: 15;
}

.section-title {
  font-size: 20;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 15;
  text-align: center;
}

.daily-card-container {
  height: 200;
  background-color: #3E3B6E;
  border-radius: 10;
}

.daily-card-image {
  width: 100%;
  height: 100%;
}

.daily-card-placeholder {
  color: #E5E7EB;
  text-align: center;
  vertical-align: center;
  opacity: 0.6;
}

.free-usage-section {
  margin-bottom: 20;
  padding: 15;
  background-color: #2D2A5C;
  border-radius: 10;
  border-width: 1;
  border-color: #7C3AED;
}

.usage-text {
  font-size: 14;
  color: #E5E7EB;
  text-align: center;
  margin-bottom: 10;
}

.usage-progress {
  height: 8;
  background-color: #3E3B6E;
  color: #7C3AED;
}

.menu-section {
  margin-bottom: 20;
}

.menu-button {
  margin-bottom: 12;
  height: 50;
  font-size: 16;
  border-radius: 25;
}

.menu-button.disabled {
  opacity: 0.5;
  background-color: #6B7280;
}

.test-button {
  background-color: #EF4444;
  color: #FFFFFF;
  font-size: 12;
  height: 40;
}

.primary-button {
  background-color: #7C3AED;
  color: #FFFFFF;
}

.secondary-button {
  background-color: #3E3B6E;
  color: #FFFFFF;
}

.premium-button {
  background: linear-gradient(45deg, #7C3AED, #F59E0B);
  color: #FFFFFF;
  font-weight: bold;
}

.promo-section {
  padding: 20;
  background-color: #2D2A5C;
  border-radius: 15;
  border-width: 2;
  border-color: #F59E0B;
}

.promo-title {
  font-size: 18;
  font-weight: bold;
  color: #F59E0B;
  margin-bottom: 10;
  text-align: center;
}

.promo-feature {
  font-size: 14;
  color: #E5E7EB;
  margin-bottom: 5;
}

.promo-price {
  font-size: 20;
  font-weight: bold;
  color: #F59E0B;
  text-align: center;
  margin-top: 10;
}
</style>
