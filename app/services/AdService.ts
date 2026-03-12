import { ref } from 'vue';
import { TEST_MODE } from '../config/env';

class AdService {
  private initialized = false;
  private initializing = false; // 초기화 진행 중 플래그
  private isFirstLoad = true; // 첫 번째 광고 로드 여부
  private initRetryCount = 0; // 초기화 재시도 횟수
  private maxInitRetries = 3; // 최대 재시도 횟수
  private isTestMode = TEST_MODE; // 환경변수에서 테스트 모드 설정
  
  // 광고 ID (실제 AdMob ID)
  private adIds = {
    android: {
      interstitial: 'ca-app-pub-2235114588891951/8801597247',
      rewarded: 'ca-app-pub-2235114588891951/3895774984',
      banner: 'ca-app-pub-2235114588891951/4358809412'
    },
    ios: {
      interstitial: 'ca-app-pub-3940256099942544/4411468910', // iOS 미사용 (테스트 ID 유지)
      rewarded: 'ca-app-pub-3940256099942544/1712485313', // iOS 미사용 (테스트 ID 유지)
      banner: 'ca-app-pub-3940256099942544/2934735716' // iOS 미사용 (테스트 ID 유지)
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
  
  async initialize(forceRetry = false) {
    // 이미 초기화되었고 강제 재시도가 아니면 리턴
    if (this.initialized && !forceRetry) return true;
    
    // 초기화 진행 중이면 대기
    if (this.initializing && !forceRetry) {
      console.log('⏳ 초기화 진행 중... 대기');
      // 최대 5초 대기
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.initializing) break;
      }
      return this.initialized;
    }
    
    this.initializing = true;
    
    try {
      const platform = this.getPlatform();
      
      // 웹 환경에서는 초기화하지 않음
      if (platform === 'web') {
        console.log('광고는 웹에서 지원되지 않습니다.');
        this.initialized = true;
        this.initializing = false;
        return true;
      }
      
      // Capacitor AdMob이 있는 경우에만 초기화
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        // 초기화 시도 (타임아웃 설정)
        const initPromise = AdMob.initialize({
          requestTrackingAuthorization: true,
          initializeForTesting: this.isTestMode,
        });
        
        // 타임아웃 설정 (첫 시도는 더 긴 타임아웃)
        const timeout = this.isFirstLoad ? 15000 : 10000;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('초기화 타임아웃')), timeout);
        });
        
        await Promise.race([initPromise, timeoutPromise]);
        
        console.log('🎯 AdMob 초기화 - 테스트 모드:', this.isTestMode);
        console.log('🎯 빌드 모드:', import.meta.env.MODE);
        console.log('🎯 플랫폼:', platform);
        
        this.initialized = true;
        this.initializing = false;
        this.initRetryCount = 0;
        console.log('✅ AdMob 초기화 완료');
        
        // 광고 이벤트 리스너 설정
        this.setupEventListeners();
        return true;
      }
      
      this.initialized = false;
      this.initializing = false;
      return false;
      
    } catch (error: any) {
      console.error('AdMob 초기화 실패:', error);
      this.initializing = false;
      
      // 재시도 로직
      if (this.initRetryCount < this.maxInitRetries) {
        this.initRetryCount++;
        console.log(`🔄 초기화 재시도 ${this.initRetryCount}/${this.maxInitRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        return await this.initialize(true);
      }
      
      // 최대 재시도 횟수 초과 시 실패로 처리
      this.initialized = false;
      return false;
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
        console.error('광고 로드 실패 상세:', {
          code: error.code,
          message: error.message,
          testMode: this.isTestMode,
          platform: this.getPlatform()
        });
        this.isAdReady.value = false;
        this.isLoading.value = false;
      });
      
      AdMob.addListener('onAdOpened', () => {
        console.log('전면 광고 표시됨');
      });
      
      AdMob.addListener('onAdClosed', () => {
        console.log('전면 광고 닫힘');
        this.isAdReady.value = false;
        this.isLoading.value = false;
      });
      
    } catch (error) {
      console.error('이벤트 리스너 설정 실패:', error);
    }
  }
  
  async preloadAd(): Promise<boolean> {
    try {
      console.log('🚀 광고 프리로드 시작');
      
      // 초기화가 안 되어 있으면 초기화
      if (!this.initialized) {
        console.log('🔧 광고 시스템 초기화 중...');
        const initSuccess = await this.initialize();
        if (!initSuccess) {
          console.warn('⚠️ 프리로드 초기화 실패');
          return false;
        }
      }
      
      const platform = this.getPlatform();
      
      // 웹 환경에서는 프리로드 스킵
      if (platform === 'web') {
        console.log('웹 환경: 광고 프리로드 스킵');
        return true;
      }
      
      // Capacitor AdMob이 있는 경우에만 프리로드
      if (typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.Plugins?.AdMob) {
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        const options = {
          adId: platform === 'ios' 
            ? this.adIds.ios.interstitial 
            : this.adIds.android.interstitial,
          isTesting: this.isTestMode
        };
        
        console.log('📡 광고 프리로드 옵션:', options);
        
        // 프리로드는 백그라운드에서 진행되므로 타임아웃 없이 진행
        AdMob.prepareInterstitial(options).then(() => {
          console.log('✅ 광고 프리로드 성공');
          this.isAdReady.value = true;
          this.isFirstLoad = false; // 프리로드가 성공하면 첫 로드 플래그 해제
        }).catch((error: any) => {
          console.warn('⚠️ 광고 프리로드 실패:', error);
        });
        
        // 프리로드는 비동기로 진행되도록 즉시 true 반환
        return true;
      }
      
      return true;
      
    } catch (error) {
      console.error('광고 프리로드 오류:', error);
      return false;
    }
  }

  async loadInterstitialAd(): Promise<boolean> {
    // 첫 번째 로드인 경우 특별 처리
    if (this.isFirstLoad) {
      console.log('🚀 첫 번째 광고 로드 시도');
      
      // 초기화 확인 및 재시도
      if (!this.initialized) {
        console.log('🔧 광고 시스템 초기화 중...');
        const initSuccess = await this.initialize();
        if (!initSuccess) {
          console.warn('⚠️ 초기화 실패 - 재시도');
          // 한 번 더 시도
          await new Promise(resolve => setTimeout(resolve, 500));
          const retrySuccess = await this.initialize(true);
          if (!retrySuccess) {
            console.error('❌ 초기화 최종 실패');
            this.isFirstLoad = false;
            return false;
          }
        }
      }
      
      // 첫 로드 시 추가 대기 시간
      await new Promise(resolve => setTimeout(resolve, 500));
    } else if (!this.initialized) {
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        return false;
      }
    }
    
    // 이미 로딩 중이면 기다림
    if (this.isLoading.value) {
      console.log('🔄 이미 광고 로딩 중...');
      // 로딩 완료 대기 (최대 5초)
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.isLoading.value) break;
      }
      return this.isAdReady.value;
    }
    
    // 광고가 준비되었더라도 매번 새로 로드
    this.isAdReady.value = false;
    
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
        
        console.log('📡 광고 로드 옵션:', {
          ...options,
          buildMode: import.meta.env.MODE,
          actualTestMode: this.isTestMode,
          platform: platform
        });
        
        // 타임아웃 설정 (첫 로드는 10초, 이후는 8초)
        const timeout = this.isFirstLoad ? 10000 : 8000;
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.warn(`⏱️ 광고 로드 타임아웃 (${timeout}ms)`);
            this.isLoading.value = false;
            resolve(false);
          }, timeout);
        });
        
        const loadPromise = AdMob.prepareInterstitial(options).then(() => {
          console.log('✅ 광고 로드 성공');
          this.isAdReady.value = true;
          this.isLoading.value = false;
          return true;
        });
        
        // 타임아웃과 로드 중 먼저 완료되는 것 반환
        const result = await Promise.race([loadPromise, timeoutPromise]);
        
        // 타임아웃이 발생했고 첫 로드인 경우 재시도
        if (!result && this.isFirstLoad) {
          console.warn('🔄 첫 광고 로드 실패 - 재시도');
          this.isAdReady.value = false;
          this.isLoading.value = false;
          
          // 1초 대기 후 재시도
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // prepareInterstitial 한 번 더 시도
          try {
            this.isLoading.value = true;
            await AdMob.prepareInterstitial(options);
            console.log('✅ 재시도 광고 로드 성공');
            this.isAdReady.value = true;
            this.isLoading.value = false;
            this.isFirstLoad = false; // 첫 로드 완료
            return true;
          } catch (retryError) {
            console.error('❌ 재시도도 실패:', retryError);
            this.isLoading.value = false;
            this.isFirstLoad = false;
            return false;
          }
        }
        
        // 타임아웃이 발생했다면 상태 초기화
        if (!result) {
          this.isAdReady.value = false;
          console.warn('⏱️ 광고 로드 타임아웃으로 인한 상태 초기화');
        } else if (result && this.isFirstLoad) {
          this.isFirstLoad = false; // 첫 로드 성공
        }
        
        return result;
      }
      
      return false;
      
    } catch (error: any) {
      console.error('전면 광고 로드 실패:', error.message || error);
      this.isLoading.value = false;
      
      // 네트워크 에러인 경우 특별 처리
      if (error.message?.includes('Network error')) {
        console.warn('🌐 네트워크 연결을 확인해주세요');
      }
      
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
        // 초기화가 되지 않았으면 먼저 초기화
        if (!this.initialized) {
          console.log('📺 광고 서비스 초기화 필요 - 초기화 시작');
          await this.initialize();
          // 초기화 후 잠시 대기 (AdMob SDK가 준비되도록)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const AdMob = (window as any).Capacitor.Plugins.AdMob;
        
        // 매번 새로운 광고를 로드하도록 강제
        // 기존 광고 상태를 초기화
        this.isAdReady.value = false;
        
        console.log('📺 광고 로드 시도...');
        
        // 재시도 로직 추가 (첫 로드는 3번, 이후는 2번 시도)
        const maxAttempts = this.isFirstLoad ? 3 : 2;
        let loaded = false;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`📺 광고 로드 시도 ${attempt}/${maxAttempts}`);
          loaded = await this.loadInterstitialAd();
          
          if (loaded) {
            console.log(`✅ 광고 로드 성공 (${attempt}번째 시도)`);
            break;
          } else if (attempt < maxAttempts) {
            console.log(`⚠️ 광고 로드 실패 - 재시도 중...`);
            // 재시도 전 잠시 대기 (첫 로드는 더 긴 대기)
            const waitTime = this.isFirstLoad ? 1500 : 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        if (!loaded) {
          console.warn('⚠️ 광고 로드 최종 실패 - 광고 없이 진행');
          // 광고 로드 실패해도 계속 진행 (사용자 경험 우선)
          return true;
        }
        
        // 광고 표시 시도
        try {
          await AdMob.showInterstitial();
          // 광고가 표시된 후에는 반드시 상태를 초기화
          this.isAdReady.value = false;
          return true;
        } catch (showError) {
          console.warn('⚠️ 광고 표시 실패:', showError);
          // 광고 표시 실패 시에도 상태 초기화
          this.isAdReady.value = false;
          // 광고 표시 실패해도 true 반환
          return true;
        }
      }
      
      // AdMob이 없으면 시뮬레이션
      console.log('AdMob을 사용할 수 없어 시뮬레이션 모드로 실행');
      return true;
      
    } catch (error) {
      console.error('전면 광고 표시 실패:', error);
      // 오류가 나도 상태 초기화하고 true 반환 (사용자 경험을 위해)
      this.isAdReady.value = false;
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
        
        // 초기화 확인
        if (!this.initialized) {
          console.log('📺 리워드 광고 - 초기화 필요');
          await this.initialize();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const options = {
          adId: platform === 'ios' 
            ? this.adIds.ios.rewarded 
            : this.adIds.android.rewarded,
          isTesting: this.isTestMode
        };
        
        console.log('📺 리워드 광고 옵션:', {
          ...options,
          buildMode: import.meta.env.MODE,
          actualTestMode: this.isTestMode,
          platform: platform
        });
        
        await AdMob.prepareRewardVideoAd(options);
        const reward = await AdMob.showRewardVideoAd();
        
        if (reward && reward.type && reward.amount > 0) {
          console.log(`리워드 획득: ${reward.type} x ${reward.amount}`);
          return true;
        }
      }
      
      return true; // 시뮬레이션 모드에서도 true 반환
      
    } catch (error: any) {
      console.error('리워드 광고 실패:', error);
      console.error('리워드 광고 실패 상세:', {
        code: error.code,
        message: error.message,
        testMode: this.isTestMode,
        platform: this.getPlatform()
      });
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
