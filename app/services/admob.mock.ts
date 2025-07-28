// 테스트용 광고 모의 서비스
export const initializeAdMob = () => {
  console.log('Mock AdMob initialized');
};

export const showAd = async (): Promise<void> => {
  console.log('Mock ad shown');
  // 2초 딜레이로 광고 시뮬레이션
  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
};

export const showInterstitialAd = async (): Promise<boolean> => {
  console.log('Mock interstitial ad shown');
  return true;
};

export const createBannerAd = (options?: any) => {
  console.log('Mock banner ad created');
  return {
    load: async () => {},
    show: async () => {}
  };
};

export const shouldShowAds = (isPremium: boolean): boolean => {
  return !isPremium;
};
