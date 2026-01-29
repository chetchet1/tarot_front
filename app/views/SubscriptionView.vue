<template>
  <div class="subscription-view">
    <!-- ?ㅻ뜑 -->
    <div class="header">
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>?꾨━誘몄뾼 援щ룆</h1>
    </div>

    <!-- ?꾩옱 援щ룆 ?곹깭 (援щ룆以묒씤 寃쎌슦) -->
    <div v-if="currentSubscription" class="current-subscription">
      <div class="status-card">
        <i class="fas fa-crown premium-icon"></i>
        <h3>?꾨━誘몄뾼 援щ룆 以?/h3>
        <p>{{ formatSubscriptionPeriod(currentSubscription) }}</p>
        <p class="expires">留뚮즺?? {{ formatDate(currentSubscription.expires_at) }}</p>
        <button 
          v-if="currentSubscription.auto_renew" 
          @click="cancelSubscription" 
          class="cancel-button"
        >
          援щ룆 痍⑥냼
        </button>
      </div>
    </div>

    <!-- ?쒗깮 ?뚭컻 -->
    <div class="benefits-section">
      <h2>?꾨━誘몄뾼 ?쒗깮</h2>
      <div class="benefits-grid">
        <div class="benefit-item">
          <i class="fas fa-ban-bug"></i>
          <h3>愿묎퀬 ?쒓굅</h3>
          <p>紐⑤뱺 愿묎퀬 ?놁씠 苡뚯쟻???ъ슜</p>
        </div>
        <div class="benefit-item">
          <i class="fas fa-infinity"></i>
          <h3>臾댁젣???댁슜</h3>
          <p>?좊즺 諛곗뿴踰?臾댁젣???ъ슜</p>
        </div>
        <div class="benefit-item">
          <i class="fas fa-robot"></i>
          <h3>AI ?댁꽍</h3>
          <p>?ъ링?곸씤 AI ?濡??댁꽍</p>
        </div>
        <div class="benefit-item">
          <i class="fas fa-chart-line"></i>
          <h3>?듦퀎 遺꾩꽍</h3>
          <p>?곸꽭???댁꽭 ?듦퀎 ?쒓났</p>
        </div>
      </div>
    </div>

    <!-- 援щ룆 ?뚮옖 (援щ룆以묒씠 ?꾨땶 寃쎌슦) -->
    <div v-if="!currentSubscription" class="plans-section">
      <h2>援щ룆 ?뚮옖 ?좏깮</h2>
      <div class="plans-container">
        <!-- ?붽컙 ?뚮옖 -->
        <div 
          class="plan-card"
          :class="{ selected: selectedPlan === 'monthly_premium' }"
          @click="selectPlan('monthly_premium')"
        >
          <h3>?붽컙 援щ룆</h3>
          <div class="price">
            <span class="amount">??,900</span>
            <span class="period">/??/span>
          </div>
          <ul class="features">
            <li>留ㅼ썡 ?먮룞 媛깆떊</li>
            <li>?몄젣??痍⑥냼 媛??/li>
            <li>紐⑤뱺 ?꾨━誘몄뾼 ?쒗깮</li>
          </ul>
        </div>

        <!-- ?곌컙 ?뚮옖 -->
        <div 
          class="plan-card recommended"
          :class="{ selected: selectedPlan === 'yearly_premium' }"
          @click="selectPlan('yearly_premium')"
        >
          <div class="badge">17% ?좎씤</div>
          <h3>?곌컙 援щ룆</h3>
          <div class="price">
            <span class="amount">??9,000</span>
            <span class="period">/??/span>
          </div>
          <p class="savings">????,083 (??,800 ?덉빟)</p>
          <ul class="features">
            <li>留ㅻ뀈 ?먮룞 媛깆떊</li>
            <li>?몄젣??痍⑥냼 媛??/li>
            <li>紐⑤뱺 ?꾨━誘몄뾼 ?쒗깮</li>
          </ul>
        </div>
      </div>

      <!-- 援щℓ 踰꾪듉 -->
      <button 
        class="purchase-button"
        :disabled="!selectedPlan || loading"
        @click="purchase"
      >
        <span v-if="loading">
          <i class="fas fa-spinner fa-spin"></i> 泥섎━ 以?..
        </span>
        <span v-else>
          援щ룆 ?쒖옉?섍린
        </span>
      </button>

      <!-- 援щℓ 蹂듭썝 -->
      <button class="restore-button" @click="restorePurchases">
        ?댁쟾 援щℓ 蹂듭썝
      </button>
    </div>

    <!-- ?쎄? 諛??덈궡 -->
    <div class="terms-section">
      <h3>援щ룆 ?덈궡</h3>
      <ul>
        <li>援щ룆? ?꾩옱 湲곌컙???앸굹湲?24?쒓컙 ?꾩뿉 痍⑥냼?섏? ?딆쑝硫??먮룞?쇰줈 媛깆떊?⑸땲??</li>
        <li>援щ룆猷뚮뒗 援щℓ ?뺤씤 ??Google Play 怨꾩젙?쇰줈 泥?뎄?⑸땲??</li>
        <li>援щ룆? Google Play ?ㅽ넗???ㅼ젙?먯꽌 愿由ы븷 ???덉뒿?덈떎.</li>
        <li>?쒖꽦 援щ룆 湲곌컙 ?숈븞? 痍⑥냼 ?쒖뿉???쒕퉬?ㅻ? 怨꾩냽 ?댁슜?????덉뒿?덈떎.</li>
      </ul>
      <div class="links">
        <a @click="showTerms">?댁슜?쎄?</a>
        <span>|</span>
        <a @click="showPrivacy">媛쒖씤?뺣낫泥섎━諛⑹묠</a>
      </div>
    </div>

    <!-- 濡쒕뵫 ?ㅻ쾭?덉씠 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { revenueCatService, type Subscription } from '@/services/RevenueCatService';
import { useAuthStore } from '@/store/auth';
import { showAlert, showConfirm } from '@/utils/alert';

// Window\uc5d0 Capacitor \ud0c0\uc785 \ucd94\uac00
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform(): boolean;
    };
  }
}

const router = useRouter();
const authStore = useAuthStore();

// ?곹깭
const currentSubscription = ref<Subscription | null>(null);
const selectedPlan = ref<string>('');
const loading = ref(false);
const products = ref<any[]>([]);

// ?쇱씠?꾩궗?댄겢
onMounted(async () => {
  await initialize();
});

// 珥덇린??const initialize = async () => {
  loading.value = true;
  try {
    // ???뚯뒪???섍꼍 泥댄겕
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
      console.log('???뚯뒪???섍꼍 - RevenueCat 珥덇린???ㅽ궢');
      
      // ?뚯뒪??怨꾩젙???꾨━誘몄뾼 ?곹깭 ?뺤씤
      const userEmail = authStore.user?.email;
      if (userEmail === 'premium@example.com') {
        // ?꾨━誘몄뾼 ?뚯뒪??怨꾩젙? ?대? 援щ룆以묒쑝濡??쒖떆
        const { useUserStore } = await import('@/store/user');
        const userStore = useUserStore();
        
        if (userStore.isPremium) {
          currentSubscription.value = {
            id: 'test-premium-subscription',
            user_id: authStore.user?.id || '',
            product_id: 'monthly_premium',
            platform: 'web-test',
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1????            price_amount: 4900,
            currency: 'KRW',
            auto_renew: true
          };
        }
      }
      
      // ?뚯뒪?몄슜 ?곹뭹 ?뺣낫
      products.value = [
        {
          id: 'monthly_premium',
          identifier: 'monthly_premium',
          priceString: '??,900',
          priceAmount: 4900,
          currency: 'KRW',
          title: '?붽컙 援щ룆',
          description: '留ㅼ썡 ?먮룞 媛깆떊',
          period: 'month'
        },
        {
          id: 'yearly_premium',
          identifier: 'yearly_premium',
          priceString: '??9,000',
          priceAmount: 49000,
          currency: 'KRW',
          title: '?곌컙 援щ룆',
          description: '留ㅻ뀈 ?먮룞 媛깆떊',
          period: 'year'
        }
      ];
    } else {
      // ?ㅼ씠?곕툕 ??- RevenueCat 珥덇린??      await revenueCatService.initialize();
      currentSubscription.value = await revenueCatService.checkSubscription();
      products.value = revenueCatService.getProducts();
    }
  } catch (error) {
    console.error('Failed to initialize:', error);
    // ???섍꼍?먯꽌???ㅻ쪟 硫붿떆吏 ?쒖떆?섏? ?딆쓬
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      await showAlert('?ㅻ쪟', '寃곗젣 ?쒕퉬??珥덇린?붿뿉 ?ㅽ뙣?덉뒿?덈떎.');
    }
  } finally {
    loading.value = false;
  }
};

// ?뚮옖 ?좏깮
const selectPlan = (planId: string) => {
  selectedPlan.value = planId;
};

// 援щℓ
const purchase = async () => {
  if (!selectedPlan.value) {
    await showAlert('?뚮┝', '援щ룆 ?뚮옖???좏깮?댁＜?몄슂.');
    return;
  }

  if (!authStore.isAuthenticated) {
    await showAlert('?뚮┝', '濡쒓렇?몄씠 ?꾩슂?⑸땲??');
    router.push('/auth/login');
    return;
  }

  // 援ш? ?뚮젅?????깅줉 ???꾩떆 鍮꾪솢?깊솕
  loading.value = true;
  
  // 寃곗젣 吏꾪뻾以??쒖떆 (1珥?
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  loading.value = false;
  await showAlert('?덈궡', '?꾩옱 寃곗젣 ?쒕퉬?ㅺ? 媛쒕컻以묒엯?덈떎.\n怨??쒕퉬?ㅻ? ?댁슜?섏떎 ???덉뒿?덈떎.');
  return;

  loading.value = true;
  
  // ???뚯뒪???섍꼍 泥섎━
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
    console.log('???뚯뒪???섍꼍 媛먯? - ?뚯뒪??寃곗젣 泥섎━');
    
    try {
      // ?뚯뒪??怨꾩젙 ?뺤씤
      const userEmail = authStore.user?.email;
      const isTestAccount = userEmail === 'test@example.com' || userEmail === 'premium@example.com';
      
      if (isTestAccount) {
        console.log('?뚯뒪??怨꾩젙 寃곗젣 ?쒕??덉씠???쒖옉');
        
        // 寃곗젣 吏꾪뻾 ?쒕??덉씠??        console.log('寃곗젣 ?곹깭 : true');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2珥??湲?        
        // userStore瑜??듯빐 ?꾨━誘몄뾼 ?곹깭 ?낅뜲?댄듃
        const { useUserStore } = await import('@/store/user');
        const userStore = useUserStore();
        
        // ?뚯뒪??怨꾩젙???꾨━誘몄뾼?쇰줈 ?낃렇?덉씠??        await userStore.upgradeToPremium();
        
        // 援щ룆 ?뺣낫 紐⑥쓽 ?앹꽦
        currentSubscription.value = {
          id: 'test-subscription-' + Date.now(),
          user_id: authStore.user?.id || '',
          product_id: selectedPlan.value,
          platform: 'web-test',
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30????          price_amount: selectedPlan.value === 'monthly_premium' ? 4900 : 49000,
          currency: 'KRW',
          auto_renew: true
        };
        
        await showAlert('?깃났', '?꾨━誘몄뾼 援щ룆???쒖꽦?붾릺?덉뒿?덈떎! (?뚯뒪??紐⑤뱶)');
        router.push('/');
      } else {
        // ?쇰컲 怨꾩젙??媛쒕컻以?硫붿떆吏 ?쒖떆
        await showAlert('?덈궡', '?꾩옱 寃곗젣 ?쒕퉬?ㅺ? 媛쒕컻以묒엯?덈떎.\n怨??쒕퉬?ㅻ? ?댁슜?섏떎 ???덉뒿?덈떎.');
      }
    } catch (error: any) {
      console.error('Test purchase failed:', error);
      // ?뚯뒪??援щℓ ?ㅽ뙣?쒖뿉??媛쒕컻以?硫붿떆吏
      await showAlert('?덈궡', '?꾩옱 寃곗젣 ?쒕퉬?ㅺ? 媛쒕컻以묒엯?덈떎.\n怨??쒕퉬?ㅻ? ?댁슜?섏떎 ???덉뒿?덈떎.');
    } finally {
      loading.value = false;
    }
    return;
  }
  
  // ?ㅼ씠?곕툕 ??寃곗젣 泥섎━
  try {
    await revenueCatService.purchase(selectedPlan.value);
    
    // 援щ룆 ?곹깭 ?덈줈怨좎묠
    currentSubscription.value = await revenueCatService.checkSubscription();
    
    // ?꾨줈???덈줈怨좎묠
    await authStore.fetchProfile();
    
    await showAlert('?깃났', '?꾨━誘몄뾼 援щ룆???쒖꽦?붾릺?덉뒿?덈떎!');
    router.push('/');
  } catch (error: any) {
    console.error('Purchase failed:', error);
    // 媛쒕컻以?硫붿떆吏濡?蹂寃?    await showAlert('?덈궡', '?꾩옱 寃곗젣 ?쒕퉬?ㅺ? 媛쒕컻以묒엯?덈떎.\n怨??쒕퉬?ㅻ? ?댁슜?섏떎 ???덉뒿?덈떎.');
  } finally {
    loading.value = false;
  }
};

// 援щℓ 蹂듭썝
const restorePurchases = async () => {
  loading.value = true;
  try {
    await revenueCatService.restorePurchases();
    
    // 援щ룆 ?곹깭 ?덈줈怨좎묠
    currentSubscription.value = await revenueCatService.checkSubscription();
    
    if (currentSubscription.value) {
      await showAlert('?깃났', '援щℓ媛 蹂듭썝?섏뿀?듬땲??');
    } else {
      await showAlert('?뚮┝', '蹂듭썝??援щℓ ?댁뿭???놁뒿?덈떎.');
    }
  } catch (error) {
    console.error('Restore failed:', error);
    // 援щℓ 蹂듭썝??媛쒕컻以?硫붿떆吏
    await showAlert('?덈궡', '?꾩옱 寃곗젣 ?쒕퉬?ㅺ? 媛쒕컻以묒엯?덈떎.\n怨??쒕퉬?ㅻ? ?댁슜?섏떎 ???덉뒿?덈떎.');
  } finally {
    loading.value = false;
  }
};

// 援щ룆 痍⑥냼
const cancelSubscription = async () => {
  const confirmed = await showConfirm(
    '援щ룆 痍⑥냼',
    '援щ룆??痍⑥냼?섏떆寃좎뒿?덇퉴? ?꾩옱 援щ룆 湲곌컙???앸궇 ?뚭퉴吏 ?쒕퉬?ㅻ? ?댁슜?????덉뒿?덈떎.'
  );

  if (!confirmed) return;

  loading.value = true;
  try {
    if (currentSubscription.value) {
      // RevenueCat? 援щ룆 愿由??섏씠吏濡??대룞
      await revenueCatService.cancelSubscription();
      
      // 援щ룆 ?곹깭???섏쨷???뱁썒?쇰줈 ?낅뜲?댄듃??      currentSubscription.value = null;
      
      // ?꾨줈???덈줈怨좎묠
      await authStore.fetchProfile();
      
      await showAlert('?꾨즺', '援щ룆??痍⑥냼?섏뿀?듬땲??');
    }
  } catch (error) {
    console.error('Cancel failed:', error);
    // 援щ룆 痍⑥냼??媛쒕컻以?硫붿떆吏
    await showAlert('?덈궡', '?꾩옱 寃곗젣 ?쒕퉬?ㅺ? 媛쒕컻以묒엯?덈떎.\n怨??쒕퉬?ㅻ? ?댁슜?섏떎 ???덉뒿?덈떎.');
  } finally {
    loading.value = false;
  }
};

// ?좎쭨 ?щ㎎
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 援щ룆 湲곌컙 ?щ㎎
const formatSubscriptionPeriod = (subscription: Subscription) => {
  if (subscription.product_id === 'monthly_premium') {
    return '?붽컙 援щ룆';
  } else if (subscription.product_id === 'yearly_premium') {
    return '?곌컙 援щ룆';
  }
  return '?꾨━誘몄뾼';
};

// ?ㅻ줈媛湲?const goBack = () => {
  router.back();
};

// ?쎄? 蹂닿린
const showTerms = () => {
  window.open('https://your-domain.com/terms', '_blank');
};

// 媛쒖씤?뺣낫泥섎━諛⑹묠 蹂닿린
const showPrivacy = () => {
  window.open('https://chetchet1.github.io/tarot-privacy-policy/', '_blank');
};
</script>

<style scoped>
.subscription-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  margin-right: 1rem;
  cursor: pointer;
}

.header h1 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

/* ?꾩옱 援щ룆 ?곹깭 */
.current-subscription {
  padding: 1rem;
}

.status-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.premium-icon {
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 1rem;
}

.status-card h3 {
  margin: 0.5rem 0;
  color: #333;
}

.status-card p {
  color: #666;
  margin: 0.5rem 0;
}

.expires {
  font-size: 0.9rem;
  color: #999;
}

.cancel-button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* ?쒗깮 ?뱀뀡 */
.benefits-section {
  padding: 2rem 1rem;
}

.benefits-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.benefit-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.benefit-item i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.benefit-item h3 {
  margin: 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.benefit-item p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* ?뚮옖 ?뱀뀡 */
.plans-section {
  padding: 2rem 1rem;
}

.plans-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.plans-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.plan-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.plan-card.selected {
  border-color: #667eea;
  transform: scale(1.02);
}

.plan-card.recommended {
  background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.plan-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.price {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.period {
  color: #999;
  margin-left: 0.5rem;
}

.savings {
  color: #4caf50;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.features {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.features li {
  color: #666;
  padding: 0.3rem 0;
  font-size: 0.9rem;
}

.features li::before {
  content: '??';
  color: #4caf50;
  font-weight: bold;
}

/* 踰꾪듉 */
.purchase-button {
  width: 100%;
  max-width: 400px;
  margin: 2rem auto 1rem;
  display: block;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.purchase-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.restore-button {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
  padding: 0.8rem;
  background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* ?쎄? ?뱀뀡 */
.terms-section {
  padding: 2rem 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.terms-section h3 {
  color: white;
  margin-bottom: 1rem;
}

.terms-section ul {
  list-style: none;
  padding: 0;
}

.terms-section li {
  color: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.terms-section li::before {
  content: '??';
}

.links {
  text-align: center;
  margin-top: 2rem;
}

.links a {
  color: white;
  text-decoration: underline;
  cursor: pointer;
  margin: 0 0.5rem;
}

.links span {
  color: rgba(255, 255, 255, 0.5);
}

/* 濡쒕뵫 ?ㅻ쾭?덉씠 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 紐⑤컮??諛섏쓳??*/
@media (max-width: 768px) {
  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
