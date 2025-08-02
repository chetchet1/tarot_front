import { ref } from 'vue';

class AdService {
  private initialized = false;
  private isTestMode = true; // 개발 중에는 테스트 모드
  
  // 광고 ID (나중에 실제 ID로 교체)
  private adIds = {
    android: {
      interstitial: 'ca-app-pub-3940256099942544/1033173712', // 테스트 ID
      rewarded: 'ca-app-pub-3940256099942544/5224354917', // 테스트 ID
      banner: 'ca-app-pub-3940256099942544/6300978111' // 테스트 ID
    },
    ios: {
      interstitial: 'ca-app-pub-3940256099942544/4411468910', // 테스트 ID
      rewarded: 'ca-app-pub-3940256099942544/1712485313', // 테스트 ID
      banner: 'ca-app-pub-3940256099942544/2934735716' // 테스트 ID
    }
  };
  
  // 광고 상태
  public isLoading = ref(false);
  public isAdReady = ref(false);
  
  // 플랫폼 확인
  private getPlatform(): 'web' | 'ios' | 'android' {
    // Capacitor가 있고 native 환경이면 Capacitor 사용
    if (typeof (window as any).Capacitor !== 'undefined') {
      const platform = (window as any).Capacitor.getPlatform();
      return platform as 'web' | 'ios' | 'android';
    }
    
    // 그렇지 않으면 웹
    return 'web';
  }
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      const platform = this.getPlatform();
      
      // 웹 환경에서는 초기화하지 않음
      if (platform === 'web') {
        console.log('광고는 웹에서 지원되지 않습니다.');
        this.initialized = true;
        return;
      }
      
      // Capacitor AdMob이 있는 경우에만 초기화
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        await AdMob.initialize({
          requestTrackingAuthorization: true,
          testingDevices: this.isTestMode ? ['YOUR_TEST_DEVICE_ID'] : [],
          initializeForTesting: this.isTestMode,
        });
        
        this.initialized = true;
        console.log('AdMob 초기화 완료');
        
        // 광고 이벤트 리스너 설정
        this.setupEventListeners();
      }
      
    } catch (error) {
      console.error('AdMob 초기화 실패:', error);
      this.initialized = true; // 오류가 나도 초기화된 것으로 처리
    }
  }
  
  private setupEventListeners() {
    try {
      if (typeof (window as any).Capacitor === 'undefined' || !(window as any).Capacitor.Plugins?.AdMob) {
        return;
      }
      
      const AdMob = (window as any).Capacitor.Plugins.AdMob;
      
      AdMob.addListener('onAdLoaded', (info: any) => {
        console.log('전면 광고 로드 완료');
        this.isAdReady.value = true;
        this.isLoading.value = false;
      });
      
      AdMob.addListener('onAdFailedToLoad', (error: any) => {
        console.error('전면 광고 로드 실패:', error);
        this.isAdReady.value = false;
        this.isLoading.value = false;
      });
      
      AdMob.addListener('onAdOpened', () => {
        console.log('전면 광고 표시됨');
      });
      
      AdMob.addListener('onAdClosed', () => {
        console.log('전면 광고 닫힘');
        this.isAdReady.value = false;
      });
      
    } catch (error) {
      console.error('이벤트 리스너 설정 실패:', error);
    }
  }
  
  async loadInterstitialAd(): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (this.isLoading.value || this.isAdReady.value) {
      return this.isAdReady.value;
    }
    
    try {
      const platform = this.getPlatform();
      
      // 웹에서는 광고를 로드하지 않음
      if (platform === 'web') {
        console.log('웹 환경에서 광고 시뮬레이션');
        return true;
      }
      
      // Capacitor AdMob이 있는 경우에만 로드
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        this.isLoading.value = true;
        
        const options = {
          adId: platform === 'ios' 
            ? this.adIds.ios.interstitial 
            : this.adIds.android.interstitial,
          isTesting: this.isTestMode
        };
        
        await AdMob.prepareInterstitial(options);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('전면 광고 로드 실패:', error);
      this.isLoading.value = false;
      return false;
    }
  }
  
  async showInterstitialAd(): Promise<boolean> {
    try {
      const platform = this.getPlatform();
      
      // 웹 환경에서는 광고 시뮬레이션
      if (platform === 'web') {
        console.log('웹 환경: 광고 시뮬레이션 (5초)');
        
        // 광고 시뮬레이션을 위한 오버레이 표시
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        `;
        overlay.innerHTML = `
          <div style="text-align: center;">
            <h2 style="margin-bottom: 20px;">광고 시뮬레이션</h2>
            <p>실제 앱에서는 여기에 광고가 표시됩니다</p>
            <p style="font-size: 18px; margin-top: 20px;">5초 후 자동으로 닫힙니다...</p>
            <div style="margin-top: 20px; font-size: 48px;">🔮</div>
          </div>
        `;
        document.body.appendChild(overlay);
        
        // 5초 후 오버레이 제거
        await new Promise(resolve => setTimeout(resolve, 5000));
        document.body.removeChild(overlay);
        
        return true;
      }
      
      // Capacitor AdMob이 있는 경우
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        // 광고가 준비되지 않았다면 먼저 로드
        if (!this.isAdReady.value) {
          const loaded = await this.loadInterstitialAd();
          if (!loaded) return false;
        }
        
        // 광고 표시
        await AdMob.showInterstitial();
        return true;
      }
      
      // AdMob이 없으면 시뮬레이션
      console.log('AdMob을 사용할 수 없어 시뮬레이션 모드로 실행');
      return true;
      
    } catch (error) {
      console.error('전면 광고 표시 실패:', error);
      // 오류가 나도 true 반환 (사용자 경험을 위해)
      return true;
    }
  }
  
  async showRewardedAd(): Promise<boolean> {
    try {
      const platform = this.getPlatform();
      
      // 웹 환경에서는 광고 시뮬레이션
      if (platform === 'web') {
        console.log('웹 환경: 리워드 광고 시뮬레이션');
        return true;
      }
      
      // Capacitor AdMob이 있는 경우
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        const options = {
          adId: platform === 'ios' 
            ? this.adIds.ios.rewarded 
            : this.adIds.android.rewarded,
          isTesting: this.isTestMode
        };
        
        await AdMob.prepareRewardVideoAd(options);
        const reward = await AdMob.showRewardVideoAd();
        
        if (reward && reward.type && reward.amount > 0) {
          console.log(`리워드 획득: ${reward.type} x ${reward.amount}`);
          return true;
        }
      }
      
      return true; // 시뮬레이션 모드에서도 true 반환
      
    } catch (error) {
      console.error('리워드 광고 실패:', error);
      return true; // 오류가 나도 true 반환
    }
  }
  
  async showBannerAd(position: 'top' | 'bottom' = 'bottom'): Promise<void> {
    try {
      const platform = this.getPlatform();
      
      // 웹 환경에서는 배너를 표시하지 않음
      if (platform === 'web') {
        console.log('웹 환경: 배너 광고 미지원');
        return;
      }
      
      // Capacitor AdMob이 있는 경우
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        const options = {
          adId: platform === 'ios' 
            ? this.adIds.ios.banner 
            : this.adIds.android.banner,
          isTesting: this.isTestMode,
          position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
          margin: 0
        };
        
        await AdMob.showBanner(options);
        console.log('배너 광고 표시');
      }
      
    } catch (error) {
      console.error('배너 광고 표시 실패:', error);
    }
  }
  
  async hideBannerAd(): Promise<void> {
    try {
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        await AdMob.hideBanner();
        console.log('배너 광고 숨김');
      }
    } catch (error) {
      console.error('배너 광고 숨김 실패:', error);
    }
  }
  
  async removeBannerAd(): Promise<void> {
    try {
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        await AdMob.removeBanner();
        console.log('배너 광고 제거');
      }
    } catch (error) {
      console.error('배너 광고 제거 실패:', error);
    }
  }
  
  // 프로덕션 모드로 전환
  setProductionMode(androidInterstitialId: string, iosInterstitialId: string) {
    this.isTestMode = false;
    this.adIds.android.interstitial = androidInterstitialId;
    this.adIds.ios.interstitial = iosInterstitialId;
  }
}

export const adService = new AdService();
