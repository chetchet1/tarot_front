// 개선된 광고 매니저
import { ref, computed } from 'vue';
import { showInterstitialAd, showRewardedAd } from './admob';
import type { Store } from 'pinia';

export interface AdConfig {
  freeReadingLimit: number; // 무료 사용자 일일 점괘 제한
  adFrequency: number; // 몇 번째 점괘마다 광고 표시
  rewardedAdBonus: number; // 리워드 광고 시청 시 추가 점괘 횟수
  temporaryPremiumHours: number; // 리워드 광고 시청 시 프리미엄 시간
}

export class AdManager {
  private static instance: AdManager | null = null;
  private userStore: any = null; // lazy initialization을 위해 any 타입 사용
  private userStoreGetter: (() => any) | null = null; // userStore를 가져오는 함수
  
  // 광고 설정
  private config: AdConfig = {
    freeReadingLimit: 3, // 무료 사용자는 하루 3회
    adFrequency: 2, // 2번째 점괘마다 광고
    rewardedAdBonus: 2, // 리워드 광고 시청 시 2회 추가
    temporaryPremiumHours: 24 // 리워드 광고 시청 시 24시간 프리미엄
  };

  // 상태 관리
  private dailyReadingCount = ref(0);
  private lastReadingDate = ref<string>('');
  private bonusReadings = ref(0);
  private temporaryPremiumExpiry = ref<Date | null>(null);
  private lastAdShownAt = ref(0);

  private constructor() {
    // userStore는 나중에 초기화
    this.loadState();
    this.checkDailyReset();
  }

  // userStore getter - lazy initialization
  private getUserStore() {
    if (!this.userStore && this.userStoreGetter) {
      try {
        this.userStore = this.userStoreGetter();
      } catch (error) {
        console.warn('userStore 초기화 실패:', error);
      }
    }
    
    // userStore가 없으면 기본값 반환
    if (!this.userStore) {
      return { 
        isPremium: false,
        canUseFreeReading: true,
        incrementFreeReading: () => {},
        user: null // user 속성 추가
      };
    }
    
    return this.userStore;
  }

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  // userStore getter 함수 설정
  setUserStoreGetter(getter: () => any) {
    this.userStoreGetter = getter;
    this.userStore = null; // 재설정 시 초기화
  }

  // 상태 저장/로드
  private saveState() {
    try {
      const state = {
        dailyReadingCount: this.dailyReadingCount.value,
        lastReadingDate: this.lastReadingDate.value,
        bonusReadings: this.bonusReadings.value,
        temporaryPremiumExpiry: this.temporaryPremiumExpiry.value?.toISOString(),
        lastAdShownAt: this.lastAdShownAt.value
      };
      localStorage.setItem('adManagerState', JSON.stringify(state));
    } catch (error) {
      console.error('광고 매니저 상태 저장 실패:', error);
    }
  }

  private loadState() {
    try {
      const saved = localStorage.getItem('adManagerState');
      if (saved) {
        const state = JSON.parse(saved);
        this.dailyReadingCount.value = state.dailyReadingCount || 0;
        this.lastReadingDate.value = state.lastReadingDate || '';
        this.bonusReadings.value = state.bonusReadings || 0;
        this.temporaryPremiumExpiry.value = state.temporaryPremiumExpiry 
          ? new Date(state.temporaryPremiumExpiry) 
          : null;
        this.lastAdShownAt.value = state.lastAdShownAt || 0;
      }
    } catch (error) {
      console.error('광고 매니저 상태 로드 실패:', error);
    }
  }

  // 일일 리셋 체크
  private checkDailyReset() {
    const today = new Date().toDateString();
    if (this.lastReadingDate.value !== today) {
      this.dailyReadingCount.value = 0;
      this.bonusReadings.value = 0;
      this.lastReadingDate.value = today;
      this.saveState();
    }
  }

  // 임시 프리미엄 상태 확인
  private isTemporaryPremium(): boolean {
    if (!this.temporaryPremiumExpiry.value) return false;
    
    const now = new Date();
    if (now < this.temporaryPremiumExpiry.value) {
      return true;
    } else {
      this.temporaryPremiumExpiry.value = null;
      this.saveState();
      return false;
    }
  }

  // 점괘를 볼 수 있는지 확인
  canDoReading(): boolean {
    // 프리미엄 사용자는 무제한
    if (this.getUserStore().isPremium || this.isTemporaryPremium()) {
      return true;
    }

    // 무료 사용자는 광고 시청으로 무제한 가능
    // 기획에 따라 1장/3장은 광고만 보면 무제한
    return true;
  }

  // 남은 점괘 횟수
  getRemainingReadings(): number {
    if (this.getUserStore().isPremium || this.isTemporaryPremium()) {
      return -1; // 무제한
    }

    // 무료 사용자도 광고 시청으로 무제한
    return -1;
  }

  // 광고를 표시해야 하는지 확인
  private shouldShowAd(spreadId?: string): boolean {
    // 프리미엄 사용자는 광고 없음
    if (this.getUserStore().isPremium || this.isTemporaryPremium()) {
      return false;
    }

    // 1장/3장 배열은 광고 표시
    const simpleSpreadIds = ['one_card', 'three_card_timeline'];
    if (spreadId && simpleSpreadIds.includes(spreadId)) {
      return false; // 1장/3장은 광고 없음
    }

    // 그 외 배열은 광고 표시 필요
    return true;
  }

  // 점괘 시작 시 호출 (스프레드 ID를 받아서 처리)
  async startReading(spreadId?: string): Promise<boolean> {
    console.log('🔍 [AdManager.startReading] 시작, spreadId:', spreadId);
    
    // 프리미엄 사용자는 광고 없이 바로 진행
    const isPremium = this.getUserStore().isPremium;
    const isTempPremium = this.isTemporaryPremium();
    console.log('🔍 [AdManager.startReading] isPremium:', isPremium, 'isTempPremium:', isTempPremium);
    
    if (isPremium || isTempPremium) {
      console.log('🔍 [AdManager.startReading] 프리미엄 사용자 - 바로 진행');
      return true;
    }
    
    // 테스트 계정 확인 (유료 배열 제한에만 적용)
    const userEmail = this.getUserStore().user?.email;
    const isTestAccount = userEmail === 'test@example.com';
    console.log('🔍 [AdManager.startReading] userEmail:', userEmail, 'isTestAccount:', isTestAccount);

    // 유료 배열 확인
    const premiumSpreads = ['celtic_cross', 'seven_star', 'cup_of_relationship'];
    const isPremiumSpread = spreadId && premiumSpreads.includes(spreadId);
    console.log('🔍 [AdManager.startReading] isPremiumSpread:', isPremiumSpread);

    if (isPremiumSpread) {
      // 테스트 계정은 유료 배열 제한 없음
      if (isTestAccount) {
        console.log('🔍 [AdManager.startReading] 테스트 계정 - 유료 배열 제한 없음');
        // 테스트 계정은 제한 없이 진행
        // 테스트를 위한 알림 표시
        setTimeout(async () => {
          const { showAlert } = await import('../utils/alerts');
          await showAlert({
            title: '🧪 테스트 계정',
            message: '테스트 계정은 유료 배열을 무제한 사용할 수 있습니다.'
          });
        }, 100);
        return true;
      } else {
        // 유료 배열인 경우, 오늘 사용 여부 확인
        console.log('🔍 [AdManager.startReading] 유료 배열 사용 여부 확인 중...');
        const { hasUsedPremiumSpreadToday } = await import('../utils/premiumSpreadTracker');
        const hasUsed = await hasUsedPremiumSpreadToday();
        console.log('🔍 [AdManager.startReading] hasUsed:', hasUsed);
        
        if (hasUsed) {
          console.log('🔍 [AdManager.startReading] 이미 사용했음 - false 반환');
          // 이미 사용했으면 점괘 불가
          return false;
        }
      }
    }

    // 무료 사용자는 광고 없이 진행 (광고는 해석 보기 시점에 표시)
    // 점괘 카운트 증가 (통계용)
    this.dailyReadingCount.value++;
    this.saveState();
    return true;
  }

  // 유료 배열 사용 기록 (결과를 볼 때 호출)
  async recordPremiumSpreadUsage(spreadId: string): Promise<void> {
    console.log('🔍 [AdManager.recordPremiumSpreadUsage] 유료 배열 사용 기록:', spreadId);
    const { recordPremiumSpreadUsage } = await import('../utils/premiumSpreadTracker');
    await recordPremiumSpreadUsage(spreadId);
  }

  // 일반 광고 표시
  private async showAd(): Promise<boolean> {
    try {
      console.log('📢 광고 표시 중...');
      const result = await showInterstitialAd();
      
      if (result) {
        this.lastAdShownAt.value = this.dailyReadingCount.value;
        this.saveState();
      }
      
      return result;
    } catch (error) {
      console.error('광고 표시 실패:', error);
      return true; // 광고 실패 시에도 점괘는 허용
    }
  }

  // 리워드 광고 표시
  async showRewardedAdForBonus(): Promise<boolean> {
    try {
      console.log('🎁 리워드 광고 표시 중...');
      const result = await showRewardedAd();
      
      if (result) {
        // 보너스 점괘 추가
        this.bonusReadings.value += this.config.rewardedAdBonus;
        this.saveState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('리워드 광고 표시 실패:', error);
      return false;
    }
  }

  // 리워드 광고로 임시 프리미엄 획득
  async showRewardedAdForPremium(): Promise<boolean> {
    try {
      console.log('👑 프리미엄 리워드 광고 표시 중...');
      const result = await showRewardedAd();
      
      if (result) {
        // 임시 프리미엄 활성화
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + this.config.temporaryPremiumHours);
        this.temporaryPremiumExpiry.value = expiry;
        this.saveState();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('프리미엄 리워드 광고 표시 실패:', error);
      return false;
    }
  }

  // 상태 정보 가져오기
  getStatus() {
    return {
      isPremium: this.getUserStore().isPremium,
      isTemporaryPremium: this.isTemporaryPremium(),
      temporaryPremiumExpiry: this.temporaryPremiumExpiry.value,
      dailyReadingCount: this.dailyReadingCount.value,
      remainingReadings: this.getRemainingReadings(),
      bonusReadings: this.bonusReadings.value,
      canDoReading: this.canDoReading()
    };
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<AdConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// AdManager는 adManagerSingleton.ts에서 관리됨
// 직접 export하지 않음
