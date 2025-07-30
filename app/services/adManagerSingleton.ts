// AdManager 싱글톤 관리
import { AdManager } from './adManager';

let adManagerInstance: AdManager | null = null;
let isInitialized = false;

export const getAdManager = (): AdManager => {
  if (!adManagerInstance) {
    adManagerInstance = AdManager.getInstance();
  }
  
  // userStore가 아직 설정되지 않았다면 설정 시도
  if (!isInitialized) {
    try {
      // 동적으로 useUserStore import
      import('../store/user').then(({ useUserStore }) => {
        if (adManagerInstance) {
          adManagerInstance.setUserStoreGetter(() => useUserStore());
          isInitialized = true;
        }
      }).catch(error => {
        console.warn('AdManager userStore 초기화 지연:', error);
      });
    } catch (error) {
      console.warn('AdManager 초기화 오류:', error);
    }
  }
  
  return adManagerInstance;
};

export const initializeAdManager = (userStoreGetter?: () => any): void => {
  if (!adManagerInstance) {
    adManagerInstance = AdManager.getInstance();
  }
  
  if (userStoreGetter && adManagerInstance) {
    adManagerInstance.setUserStoreGetter(userStoreGetter);
    isInitialized = true;
  }
};
