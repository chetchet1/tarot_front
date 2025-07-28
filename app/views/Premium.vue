<template>
  <Page class="page">
    <ActionBar title="프리미엄 구독" class="action-bar">
      <NavigationButton text="뒤로" @tap="$router.back()" />
    </ActionBar>
    
    <ScrollView>
      <StackLayout class="container">
        <!-- 헤더 -->
        <StackLayout class="header-section">
          <Label text="✨" class="premium-icon" />
          <Label text="타로의 정원 프리미엄" class="premium-title" />
          <Label text="더 깊고 풍부한 타로 경험을 즐기세요" class="premium-subtitle" />
        </StackLayout>

        <!-- 혜택 목록 -->
        <StackLayout class="benefits-section">
          <Label text="프리미엄 혜택" class="section-title" />
          
          <GridLayout 
            v-for="benefit in benefits" 
            :key="benefit.id"
            class="benefit-item"
            columns="auto, *"
          >
            <Label :text="benefit.icon" col="0" class="benefit-icon" />
            <StackLayout col="1" class="benefit-content">
              <Label :text="benefit.title" class="benefit-title" />
              <Label :text="benefit.description" class="benefit-description" textWrap="true" />
            </StackLayout>
          </GridLayout>
        </StackLayout>

        <!-- 구독 플랜 -->
        <StackLayout class="plans-section">
          <Label text="구독 플랜 선택" class="section-title" />
          
          <StackLayout 
            v-for="plan in subscriptionPlans" 
            :key="plan.id"
            class="plan-card"
            :class="{ selected: selectedPlan === plan.id }"
            @tap="selectPlan(plan.id)"
          >
            <GridLayout columns="*, auto" rows="auto, auto, auto">
              <Label :text="plan.name" class="plan-name" row="0" col="0" />
              <Label 
                v-if="plan.badge" 
                :text="plan.badge" 
                class="plan-badge" 
                row="0" col="1" 
              />
              <Label :text="plan.price" class="plan-price" row="1" col="0" />
              <Label :text="plan.period" class="plan-period" row="1" col="1" />
              <Label 
                v-if="plan.savings" 
                :text="plan.savings" 
                class="plan-savings" 
                row="2" col="0" colSpan="2" 
              />
            </GridLayout>
          </StackLayout>
        </StackLayout>

        <!-- 구독 버튼 -->
        <Button 
          :text="subscribeButtonText"
          @tap="subscribe"
          class="subscribe-button"
          :isEnabled="selectedPlan && !isLoading"
        />

        <!-- 복원 버튼 -->
        <Button 
          text="구매 내역 복원"
          @tap="restorePurchases"
          class="restore-button"
          :isEnabled="!isLoading"
        />

        <!-- 약관 -->
        <StackLayout class="terms-section">
          <Label class="terms-text" textWrap="true">
            <FormattedString>
              <Span text="구독 시 " />
              <Span text="이용약관" class="link" @tap="showTerms" />
              <Span text=" 및 " />
              <Span text="개인정보 처리방침" class="link" @tap="showPrivacy" />
              <Span text="에 동의하는 것으로 간주됩니다." />
            </FormattedString>
          </Label>
          <Label 
            text="구독은 현재 기간이 끝나기 24시간 전까지 취소하지 않으면 자동으로 갱신됩니다." 
            class="terms-text" 
            textWrap="true"
          />
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from '@nativescript-vue/router';
import { useUserStore } from '../store/user';
import { 
  getOfferings, 
  purchaseSubscription, 
  restoreSubscription,
  formatPrice 
} from '../services/purchases';
import { Utils } from '@nativescript/core';

const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(false);
const selectedPlan = ref<string | null>(null);
const offerings = ref<any[]>([]);

const benefits = [
  {
    id: 1,
    icon: '🚫',
    title: '광고 제거',
    description: '모든 광고가 제거되어 깔끔한 환경에서 타로를 즐기세요'
  },
  {
    id: 2,
    icon: '🔮',
    title: '고급 배열법',
    description: '켈틱 크로스, 관계 십자가 등 프리미엄 배열법 이용'
  },
  {
    id: 3,
    icon: '💾',
    title: '무제한 히스토리',
    description: '모든 점괘를 무제한으로 저장하고 언제든 다시 확인'
  },
  {
    id: 4,
    icon: '📤',
    title: '결과 공유',
    description: '점괘 결과를 이미지나 텍스트로 친구들과 공유'
  },
  {
    id: 5,
    icon: '🎨',
    title: '특별한 카드 디자인',
    description: '프리미엄 전용 아름다운 타로카드 디자인'
  },
  {
    id: 6,
    icon: '💬',
    title: '우선 지원',
    description: '문의사항에 대한 빠른 답변과 우선 지원'
  }
];

const subscriptionPlans = computed(() => {
  return [
    {
      id: 'monthly',
      name: '월간 구독',
      price: '₩2,900',
      period: '/월',
      badge: null,
      savings: null
    },
    {
      id: 'yearly',
      name: '연간 구독',
      price: '₩29,900',
      period: '/년',
      badge: '인기',
      savings: '17% 할인 (월 ₩2,492)'
    }
  ];
});

const subscribeButtonText = computed(() => {
  if (!selectedPlan.value) return '플랜을 선택하세요';
  if (isLoading.value) return '처리 중...';
  
  const plan = subscriptionPlans.value.find(p => p.id === selectedPlan.value);
  return `${plan?.price} 구독 시작하기`;
});

const selectPlan = (planId: string) => {
  selectedPlan.value = planId;
};

const subscribe = async () => {
  if (!selectedPlan.value || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    // RevenueCat 상품 찾기
    const offering = offerings.value.find(o => o.identifier === 'default');
    const packageToP
 = offering?.availablePackages.find(
      p => p.identifier === selectedPlan.value
    );
    
    if (!packageToPurchase) {
      throw new Error('Selected package not found');
    }
    
    // 구매 진행
    const result = await purchaseSubscription(packageToPurchase);
    
    if (result.success) {
      // 성공 메시지 표시
      await alert({
        title: '구독 완료!',
        message: '프리미엄 구독이 활성화되었습니다. 모든 혜택을 즐기세요!',
        okButtonText: '확인'
      });
      
      // 홈으로 이동
      router.push({ name: 'home' });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Subscription failed:', error);
    await alert({
      title: '구독 실패',
      message: '구독 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
      okButtonText: '확인'
    });
  } finally {
    isLoading.value = false;
  }
};

const restorePurchases = async () => {
  isLoading.value = true;
  
  try {
    const result = await restoreSubscription();
    
    if (result.success) {
      await alert({
        title: '복원 완료',
        message: '구매 내역이 복원되었습니다.',
        okButtonText: '확인'
      });
      router.push({ name: 'home' });
    } else {
      await alert({
        title: '복원할 구매 내역 없음',
        message: '복원할 구매 내역이 없습니다.',
        okButtonText: '확인'
      });
    }
  } catch (error) {
    console.error('Restore failed:', error);
    await alert({
      title: '복원 실패',
      message: '구매 내역 복원에 실패했습니다.',
      okButtonText: '확인'
    });
  } finally {
    isLoading.value = false;
  }
};

const showTerms = () => {
  Utils.openUrl('https://tarotgarden.app/terms');
};

const showPrivacy = () => {
  Utils.openUrl('https://tarotgarden.app/privacy');
};

onMounted(async () => {
  // 구독 상품 로드
  try {
    offerings.value = await getOfferings();
  } catch (error) {
    console.error('Failed to load offerings:', error);
  }
});
</script>

<style scoped>
.page {
  background-color: #1E1B4B;
}

.action-bar {
  background-color: #2D2A5C;
  color: #FFFFFF;
}

.container {
  padding: 20;
}

.header-section {
  align-items: center;
  margin-bottom: 30;
  padding: 20;
  background: linear-gradient(135deg, #7C3AED, #F59E0B);
  border-radius: 20;
}

.premium-icon {
  font-size: 60;
  margin-bottom: 10;
}

.premium-title {
  font-size: 24;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 5;
}

.premium-subtitle {
  font-size: 16;
  color: #FFFFFF;
  opacity: 0.9;
  text-align: center;
}

.benefits-section {
  margin-bottom: 30;
}

.section-title {
  font-size: 20;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 15;
}

.benefit-item {
  margin-bottom: 15;
  padding: 15;
  background-color: #3E3B6E;
  border-radius: 10;
}

.benefit-icon {
  font-size: 24;
  margin-right: 15;
}

.benefit-content {
  justify-content: center;
}

.benefit-title {
  font-size: 16;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 3;
}

.benefit-description {
  font-size: 14;
  color: #E5E7EB;
  opacity: 0.8;
}

.plans-section {
  margin-bottom: 20;
}

.plan-card {
  padding: 20;
  margin-bottom: 15;
  background-color: #3E3B6E;
  border-radius: 15;
  border-width: 2;
  border-color: transparent;
}

.plan-card.selected {
  border-color: #F59E0B;
  background-color: #4C489D;
}

.plan-name {
  font-size: 18;
  font-weight: bold;
  color: #FFFFFF;
}

.plan-badge {
  background-color: #F59E0B;
  color: #1E1B4B;
  padding: 4 8;
  border-radius: 12;
  font-size: 12;
  font-weight: bold;
}

.plan-price {
  font-size: 24;
  font-weight: bold;
  color: #F59E0B;
  margin-top: 5;
}

.plan-period {
  font-size: 16;
  color: #E5E7EB;
  opacity: 0.8;
  margin-top: 5;
}

.plan-savings {
  font-size: 14;
  color: #10B981;
  margin-top: 5;
}

.subscribe-button {
  background: linear-gradient(45deg, #7C3AED, #F59E0B);
  color: #FFFFFF;
  font-size: 18;
  font-weight: bold;
  padding: 15;
  border-radius: 25;
  margin-bottom: 10;
}

.subscribe-button:disabled {
  opacity: 0.5;
}

.restore-button {
  background-color: transparent;
  color: #7C3AED;
  font-size: 16;
  padding: 10;
  margin-bottom: 20;
}

.terms-section {
  padding: 20;
  background-color: #2D2A5C;
  border-radius: 10;
}

.terms-text {
  font-size: 12;
  color: #E5E7EB;
  opacity: 0.8;
  text-align: center;
  margin-bottom: 10;
}

.link {
  color: #7C3AED;
  text-decoration: underline;
}
</style>
