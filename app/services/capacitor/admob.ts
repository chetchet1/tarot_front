// Capacitor AdMob 플러그인 연동
import { AdMob, AdOptions, RewardAdOptions, AdLoadInfo, InterstitialAdPluginEvents, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// 광고 ID 설정 (테스트용)
const AD_IDS = {
  // Android 테스트 ID
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  },
  // iOS 테스트 ID
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313'
  }
};

// 현재 플랫폼에 맞는 광고 ID 가져오기
const getAdId = (type: 'banner' | 'interstitial' | 'rewarded'): string => {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') {
    return AD_IDS.ios[type];
  }
  return AD_IDS.android[type];
};

// AdMob 초기화
export const initializeAdMob = async (): Promise<void> => {
  try {
    // 웹에서는 AdMob을 사용할 수 없음
    if (Capacitor.getPlatform() === 'web') {
      console.log('AdMob은 웹에서 지원되지 않습니다.');
      return;
    }

    await AdMob.initialize({
      testingDevices: ['YOUR_DEVICE_ID'], // 테스트 기기 ID (선택사항)
      initializeForTesting: true, // 테스트 모드
    });

    console.log('✅ AdMob 초기화 완료');
  } catch (error) {
    console.error('❌ AdMob 초기화 실패:', error);
  }
};

// 전면 광고 표시
export const showInterstitialAd = async (): Promise<boolean> => {
  try {
    // 웹에서는 모의 광고 표시
    if (Capacitor.getPlatform() === 'web') {
      console.log('🌐 웹 환경: 모의 광고 표시');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      return true;
    }

    const options: AdOptions = {
      adId: getAdId('interstitial'),
    };

    // 광고 로드
    await AdMob.prepareInterstitial(options);
    
    // 광고 표시
    await AdMob.showInterstitial();
    
    console.log('✅ 전면 광고 표시 완료');
    return true;
  } catch (error) {
    console.error('❌ 전면 광고 표시 실패:', error);
    return false;
  }
};

// 리워드 광고 표시
export const showRewardedAd = async (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      // 웹에서는 모의 광고 표시
      if (Capacitor.getPlatform() === 'web') {
        console.log('🌐 웹 환경: 모의 리워드 광고 표시');
        
        // 모의 광고 UI 표시
        const mockAd = document.createElement('div');
        mockAd.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        mockAd.innerHTML = `
          <div style="text-align: center; max-width: 300px;">
            <h2 style="font-size: 24px; margin-bottom: 20px;">🎬 광고 시청 중...</h2>
            <p style="font-size: 16px; margin-bottom: 30px;">실제 앱에서는 여기에 광고가 표시됩니다</p>
            <div style="font-size: 48px; margin-bottom: 20px;">
              <span id="countdown">5</span>
            </div>
            <button id="skipBtn" style="
              padding: 10px 20px;
              background: #666;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              cursor: not-allowed;
              opacity: 0.5;
            " disabled>광고 건너뛰기</button>
          </div>
        `;
        
        document.body.appendChild(mockAd);
        
        // 카운트다운
        let countdown = 5;
        const countdownEl = mockAd.querySelector('#countdown') as HTMLElement;
        const skipBtn = mockAd.querySelector('#skipBtn') as HTMLButtonElement;
        
        const timer = setInterval(() => {
          countdown--;
          if (countdownEl) countdownEl.textContent = String(countdown);
          
          if (countdown <= 0) {
            clearInterval(timer);
            if (skipBtn) {
              skipBtn.textContent = '보상 받기';
              skipBtn.style.background = '#4CAF50';
              skipBtn.style.cursor = 'pointer';
              skipBtn.style.opacity = '1';
              skipBtn.disabled = false;
              
              skipBtn.onclick = () => {
                document.body.removeChild(mockAd);
                resolve(true);
              };
            }
          }
        }, 1000);
        
        return;
      }

      const options: RewardAdOptions = {
        adId: getAdId('rewarded'),
      };

      // 리워드 이벤트 리스너 등록
      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('✅ 리워드 광고 시청 완료:', reward);
        resolve(true);
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('❌ 리워드 광고 건너뜀');
        resolve(false);
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
        console.error('❌ 리워드 광고 표시 실패');
        resolve(false);
      });

      // 광고 로드
      await AdMob.prepareRewardVideoAd(options);
      
      // 광고 표시
      await AdMob.showRewardVideoAd();
    } catch (error) {
      console.error('❌ 리워드 광고 처리 실패:', error);
      resolve(false);
    }
  });
};

// 배너 광고 표시
export const showBannerAd = async (): Promise<void> => {
  try {
    // 웹에서는 배너 광고 미지원
    if (Capacitor.getPlatform() === 'web') {
      console.log('🌐 웹 환경: 배너 광고 미지원');
      return;
    }

    const options: AdOptions = {
      adId: getAdId('banner'),
      adSize: 'BANNER',
      position: 'BOTTOM',
    };

    await AdMob.showBanner(options);
    console.log('✅ 배너 광고 표시');
  } catch (error) {
    console.error('❌ 배너 광고 표시 실패:', error);
  }
};

// 배너 광고 숨기기
export const hideBannerAd = async (): Promise<void> => {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    
    await AdMob.hideBanner();
    console.log('✅ 배너 광고 숨김');
  } catch (error) {
    console.error('❌ 배너 광고 숨기기 실패:', error);
  }
};

// 배너 광고 제거
export const removeBannerAd = async (): Promise<void> => {
  try {
    if (Capacitor.getPlatform() === 'web') return;
    
    await AdMob.removeBanner();
    console.log('✅ 배너 광고 제거');
  } catch (error) {
    console.error('❌ 배너 광고 제거 실패:', error);
  }
};
