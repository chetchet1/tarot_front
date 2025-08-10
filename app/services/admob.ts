// AdMob 서비스 - 실제 광고 구현
import { Platform } from '@/utils/platform';
import { TEST_MODE } from '../config/env';

// 타입 정의
interface AdMobConfig {
  appId: string;
  bannerAdId: string;
  interstitialAdId: string;
  rewardedAdId: string;
  testMode: boolean;
}

interface AdMobService {
  initializeAdMob(): Promise<void>;
  showInterstitialAd(): Promise<boolean>;
  showRewardedAd(): Promise<boolean>;
  createBannerAd(position: 'top' | 'bottom'): Promise<void>;
  hideBannerAd(): Promise<void>;
  shouldShowAds(): boolean;
}

// AdMob 설정
const adMobConfig: AdMobConfig = {
  appId: TEST_MODE ? 'ca-app-pub-3940256099942544~3347511713' : 'YOUR_REAL_APP_ID',
  bannerAdId: TEST_MODE ? 'ca-app-pub-3940256099942544/6300978111' : 'YOUR_REAL_BANNER_ID',
  interstitialAdId: TEST_MODE ? 'ca-app-pub-3940256099942544/1033173712' : 'YOUR_REAL_INTERSTITIAL_ID',
  rewardedAdId: TEST_MODE ? 'ca-app-pub-3940256099942544/5224354917' : 'YOUR_REAL_REWARDED_ID',
  testMode: TEST_MODE
};

// 웹용 모킹 클래스
class MockAdMobService implements AdMobService {
  private adShowCount = 0;
  
  async initializeAdMob(): Promise<void> {
    console.log('🌐 [Web] AdMob 초기화 (모킹됨)');
  }

  async showInterstitialAd(): Promise<boolean> {
    this.adShowCount++;
    console.log(`🌐 [Web] 전면 광고 표시 (모킹됨) - ${this.adShowCount}번째 호출`);
    console.log(`🌐 [Web] 현재 시간: ${new Date().toISOString()}`);
    
    // 매번 새로운 광고 시뮬레이션
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <h2 style="margin-bottom: 20px;">광고 시뮬레이션 #${this.adShowCount}</h2>
        <p>실제 앱에서는 여기에 광고가 표시됩니다</p>
        <p style="font-size: 18px; margin-top: 20px;">3초 후 자동으로 닫힙니다...</p>
        <div style="margin-top: 20px; font-size: 48px;">📺</div>
        <button style="
          margin-top: 30px;
          padding: 10px 20px;
          font-size: 16px;
          background: white;
          color: black;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">광고 건너뛰기</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    return new Promise(resolve => {
      let resolved = false;
      
      // 3초 후 자동으로 닫힘
      const timer = setTimeout(() => {
        if (!resolved && overlay.parentElement) {
          resolved = true;
          overlay.remove();
          console.log(`🌐 [Web] 광고 시뮬레이션 #${this.adShowCount} 종료`);
          resolve(true);
        }
      }, 3000);
      
      // 버튼 클릭으로도 닫을 수 있음
      const button = overlay.querySelector('button');
      if (button) {
        button.addEventListener('click', () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            overlay.remove();
            console.log(`🌐 [Web] 사용자가 광고 #${this.adShowCount}를 건너뛰었습니다`);
            resolve(true);
          }
        });
      }
    });
  }

  async showRewardedAd(): Promise<boolean> {
    console.log('🌐 [Web] 15초 강제 시청 광고 표시 (모킹됨)');
    console.log('🌐 [Web] 현재 시간:', new Date().toISOString());
    
    // 15초 강제 시청 광고 시뮬레이션
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    `;
    
    let timeRemaining = 15;
    let completed = false;
    let intervalId: number | null = null;
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
    
    const updateOverlay = () => {
      overlay.innerHTML = `
        <div style="text-align: center;">
          <h2 style="margin-bottom: 20px;">🎬 리워드 광고 시뮬레이션</h2>
          <p style="font-size: 24px; font-weight: bold;">15초 강제 시청 광고</p>
          <p style="font-size: 18px; margin-top: 20px; color: #ffd700;">${timeRemaining}초 남음</p>
          <div style="margin-top: 30px; font-size: 72px;">📺</div>
          <div style="margin-top: 20px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
            <p style="font-size: 16px;">실제 앱에서는 동영상 광고가 재생됩니다</p>
            <p style="font-size: 14px; margin-top: 10px; opacity: 0.8;">광고를 끝까지 시청하면 보상을 받습니다</p>
          </div>
          ${timeRemaining > 0 ? 
            `<p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">스킵 불가능 (${timeRemaining}초)</p>` : 
            `<button style="
              margin-top: 30px;
              padding: 12px 24px;
              font-size: 16px;
              background: #4CAF50;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            ">✅ 보상 받기</button>`
          }
        </div>
      `;
    };
    
    updateOverlay();
    document.body.appendChild(overlay);
    
    return new Promise(resolve => {
      // ESC 키나 백 버튼 방지
      keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && timeRemaining > 0) {
          e.preventDefault();
          console.log('🌐 [Web] 광고 중 ESC 키 차단됨');
        }
      };
      
      document.addEventListener('keydown', keydownHandler);
      
      intervalId = setInterval(() => {
        timeRemaining--;
        updateOverlay();
        
        if (timeRemaining <= 0) {
          if (intervalId) clearInterval(intervalId);
          completed = true;
          
          // 보상 받기 버튼 클릭 대기
          const button = overlay.querySelector('button');
          if (button) {
            button.addEventListener('click', () => {
              console.log('🌐 [Web] 사용자가 보상을 받았습니다');
              if (keydownHandler) {
                document.removeEventListener('keydown', keydownHandler);
              }
              overlay.remove();
              resolve(true);
            });
          }
        }
      }, 1000) as unknown as number;
      
      // MutationObserver를 사용하여 DOM 제거 감지
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            for (const node of mutation.removedNodes) {
              if (node === overlay) {
                if (keydownHandler) {
                  document.removeEventListener('keydown', keydownHandler);
                }
                if (intervalId) clearInterval(intervalId);
                observer.disconnect();
                if (!completed) {
                  console.log('🌐 [Web] 광고가 중단되었습니다');
                  resolve(false);
                }
                return;
              }
            }
          }
        }
      });
      
      // body의 자식 노드 변경 감지
      observer.observe(document.body, { childList: true });
    });
  }

  async createBannerAd(position: 'top' | 'bottom'): Promise<void> {
    console.log(`🌐 [Web] 배너 광고 생성 (${position}) (모킹됨)`);
  }

  async hideBannerAd(): Promise<void> {
    console.log('🌐 [Web] 배너 광고 숨김 (모킹됨)');
  }

  shouldShowAds(): boolean {
    return true; // 웹에서는 항상 광고 표시 (테스트용)
  }
}

// 모바일용 실제 AdMob 클래스
class RealAdMobService implements AdMobService {
  private isInitialized = false;
  private adShowCount = 0;
  private listenerMap = new Map<string, any>();

  async initializeAdMob(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('📱 [Mobile] AdMob 초기화 시작...');
      
      // Capacitor AdMob 플러그인 사용
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: adMobConfig.testMode ? ['YOUR_TEST_DEVICE_ID'] : [],
        initializeForTesting: adMobConfig.testMode
      });

      this.isInitialized = true;
      console.log('📱 [Mobile] AdMob 초기화 완료');
    } catch (error) {
      console.error('📱 [Mobile] AdMob 초기화 실패:', error);
      throw error;
    }
  }

  async showInterstitialAd(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeAdMob();
      }

      this.adShowCount++;
      console.log(`📱 [Mobile] 전면 광고 로드 중... (${this.adShowCount}번째 호출)`);
      console.log(`📱 [Mobile] 현재 시간: ${new Date().toISOString()}`);
      
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');

      // 기존 리스너 제거
      this.removeAllListeners();
      
      // 광고 로드
      await AdMob.prepareInterstitial({
        adId: adMobConfig.interstitialAdId,
        isTesting: adMobConfig.testMode
      });

      // 광고 표시
      return new Promise((resolve) => {
        let resolved = false;
        
        // 광고 닫힘 이벤트 리스너
        const dismissedListener = AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          if (!resolved) {
            resolved = true;
            console.log(`📱 [Mobile] 전면 광고 #${this.adShowCount} 닫힘`);
            this.removeAllListeners();
            resolve(true);
          }
        });
        this.listenerMap.set('dismissed', dismissedListener);

        // 광고 실패 이벤트 리스너
        const failedListener = AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
          if (!resolved) {
            resolved = true;
            console.error(`📱 [Mobile] 전면 광고 #${this.adShowCount} 로드 실패:`, error);
            this.removeAllListeners();
            resolve(false);
          }
        });
        this.listenerMap.set('failed', failedListener);

        // 광고 표시
        AdMob.showInterstitial().catch((error) => {
          if (!resolved) {
            resolved = true;
            console.error(`📱 [Mobile] 전면 광고 #${this.adShowCount} 표시 실패:`, error);
            this.removeAllListeners();
            resolve(false);
          }
        });
        
        // 타임아웃 설정 (30초)
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.warn(`📱 [Mobile] 전면 광고 #${this.adShowCount} 타임아웃`);
            this.removeAllListeners();
            resolve(true); // 타임아웃 시에도 true 반환
          }
        }, 30000);
      });
    } catch (error) {
      console.error(`📱 [Mobile] 전면 광고 #${this.adShowCount} 표시 실패:`, error);
      this.removeAllListeners();
      return false;
    }
  }
  
  private removeAllListeners(): void {
    try {
      this.listenerMap.forEach((listener) => {
        if (listener && typeof listener.remove === 'function') {
          listener.remove();
        }
      });
      this.listenerMap.clear();
    } catch (error) {
      console.error('📱 [Mobile] 리스너 제거 실패:', error);
    }
  }

  async showRewardedAd(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeAdMob();
      }

      console.log('📱 [Mobile] 15초 강제 시청 리워드 광고 로드 중...');
      console.log('📱 [Mobile] 현재 시간:', new Date().toISOString());
      
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      // 기존 리스너 제거
      this.removeAllListeners();
      
      // 광고 로드
      await AdMob.prepareRewardVideoAd({
        adId: adMobConfig.rewardedAdId,
        isTesting: adMobConfig.testMode
      });

      // 광고 표시
      return new Promise((resolve) => {
        let rewardEarned = false;
        let resolved = false;

        // 리워드 획득 이벤트 (사용자가 광고를 끝까지 시청)
        const rewardedListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          console.log('📱 [Mobile] 리워드 광고 보상 획득:', reward);
          console.log('📱 [Mobile] 15초 강제 시청 완료');
          rewardEarned = true;
        });
        this.listenerMap.set('rewarded', rewardedListener);

        // 광고 닫힘 이벤트
        const dismissedListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (!resolved) {
            resolved = true;
            console.log('📱 [Mobile] 리워드 광고 닫힘');
            console.log('📱 [Mobile] 보상 획득 여부:', rewardEarned);
            this.removeAllListeners();
            resolve(rewardEarned);
          }
        });
        this.listenerMap.set('dismissed', dismissedListener);

        // 광고 실패 이벤트
        const failedListener = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
          if (!resolved) {
            resolved = true;
            console.error('📱 [Mobile] 리워드 광고 로드 실패:', error);
            this.removeAllListeners();
            resolve(false);
          }
        });
        this.listenerMap.set('failed', failedListener);

        // 광고 표시 시작 이벤트
        const showedListener = AdMob.addListener(RewardAdPluginEvents.Showed, () => {
          console.log('📱 [Mobile] 리워드 광고 표시 시작 (15초 강제 시청)');
        });
        this.listenerMap.set('showed', showedListener);

        // 광고 표시
        AdMob.showRewardVideoAd().catch((error) => {
          if (!resolved) {
            resolved = true;
            console.error('📱 [Mobile] 리워드 광고 표시 실패:', error);
            this.removeAllListeners();
            resolve(false);
          }
        });
        
        // 타임아웃 설정 (60초 - 리워드 광고는 더 길 수 있음)
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.warn('📱 [Mobile] 리워드 광고 타임아웃');
            this.removeAllListeners();
            resolve(rewardEarned); // 타임아웃 시 현재까지의 보상 상태 반환
          }
        }, 60000);
      });
    } catch (error) {
      console.error('📱 [Mobile] 리워드 광고 표시 실패:', error);
      this.removeAllListeners();
      return false;
    }
  }

  async createBannerAd(position: 'top' | 'bottom'): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initializeAdMob();
      }

      console.log(`📱 [Mobile] 배너 광고 생성 (${position})`);
      
      const { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');

      const options: BannerAdOptions = {
        adId: adMobConfig.bannerAdId,
        adSize: BannerAdSize.BANNER,
        position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: adMobConfig.testMode
      };

      await AdMob.showBanner(options);
      console.log('📱 [Mobile] 배너 광고 표시 완료');
    } catch (error) {
      console.error('📱 [Mobile] 배너 광고 생성 실패:', error);
      throw error;
    }
  }

  async hideBannerAd(): Promise<void> {
    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.hideBanner();
      console.log('📱 [Mobile] 배너 광고 숨김 완료');
    } catch (error) {
      console.error('📱 [Mobile] 배너 광고 숨김 실패:', error);
    }
  }

  shouldShowAds(): boolean {
    return Platform.isMobile; // 모바일에서만 실제 광고 표시
  }
}

// 플랫폼에 따라 적절한 서비스 생성
const createAdMobService = (): AdMobService => {
  if (Platform.isWeb) {
    return new MockAdMobService();
  } else {
    return new RealAdMobService();
  }
};

// 싱글톤 인스턴스
const adMobService = createAdMobService();

// 외부 노출 함수들
export const initializeAdMob = () => adMobService.initializeAdMob();
export const showInterstitialAd = () => adMobService.showInterstitialAd();
export const showRewardedAd = () => adMobService.showRewardedAd();
export const createBannerAd = (position: 'top' | 'bottom') => adMobService.createBannerAd(position);
export const hideBannerAd = () => adMobService.hideBannerAd();
export const shouldShowAds = () => adMobService.shouldShowAds();

// 기본 내보내기
export default adMobService;
