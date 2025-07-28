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
  async initializeAdMob(): Promise<void> {
    console.log('🌐 [Web] AdMob 초기화 (모킹됨)');
  }

  async showInterstitialAd(): Promise<boolean> {
    console.log('🌐 [Web] 전면 광고 표시 (모킹됨)');
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  async showRewardedAd(): Promise<boolean> {
    console.log('🌐 [Web] 리워드 광고 표시 (모킹됨)');
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 2000);
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

      console.log('📱 [Mobile] 전면 광고 로드 중...');
      
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');

      // 광고 로드
      await AdMob.prepareInterstitial({
        adId: adMobConfig.interstitialAdId,
        isTesting: adMobConfig.testMode
      });

      // 광고 표시
      return new Promise((resolve) => {
        // 광고 닫힘 이벤트 리스너
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          console.log('📱 [Mobile] 전면 광고 닫힘');
          resolve(true);
        });

        // 광고 실패 이벤트 리스너
        AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
          console.error('📱 [Mobile] 전면 광고 로드 실패:', error);
          resolve(false);
        });

        // 광고 표시
        AdMob.showInterstitial();
      });
    } catch (error) {
      console.error('📱 [Mobile] 전면 광고 표시 실패:', error);
      return false;
    }
  }

  async showRewardedAd(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeAdMob();
      }

      console.log('📱 [Mobile] 리워드 광고 로드 중...');
      
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      // 광고 로드
      await AdMob.prepareRewardVideoAd({
        adId: adMobConfig.rewardedAdId,
        isTesting: adMobConfig.testMode
      });

      // 광고 표시
      return new Promise((resolve) => {
        let rewardEarned = false;

        // 리워드 획득 이벤트
        AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          console.log('📱 [Mobile] 리워드 광고 보상 획득:', reward);
          rewardEarned = true;
        });

        // 광고 닫힘 이벤트
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          console.log('📱 [Mobile] 리워드 광고 닫힘, 보상 획득:', rewardEarned);
          resolve(rewardEarned);
        });

        // 광고 실패 이벤트
        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
          console.error('📱 [Mobile] 리워드 광고 로드 실패:', error);
          resolve(false);
        });

        // 광고 표시
        AdMob.showRewardVideoAd();
      });
    } catch (error) {
      console.error('📱 [Mobile] 리워드 광고 표시 실패:', error);
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
