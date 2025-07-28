/**
 * 웹 전용 플랫폼 감지 유틸리티
 */
export const Platform = {
  /**
   * 웹 플랫폼 여부 (항상 true)
   */
  get isWeb(): boolean {
    return true;
  },

  /**
   * iOS 플랫폼 여부 (웹에서는 항상 false)
   */
  get isIOS(): boolean {
    return false;
  },

  /**
   * Android 플랫폼 여부 (웹에서는 항상 false)
   */
  get isAndroid(): boolean {
    return false;
  },

  /**
   * 모바일 플랫폼 여부 (웹에서는 항상 false)
   */
  get isMobile(): boolean {
    return false;
  },

  /**
   * 현재 플랫폼 이름 (웹에서는 항상 'web')
   */
  get name(): 'web' | 'ios' | 'android' {
    return 'web';
  }
};

/**
 * 플랫폼별 코드 실행 헬퍼
 */
export const platformSwitch = <T>(cases: {
  web?: () => T;
  ios?: () => T;
  android?: () => T;
  mobile?: () => T;
  default?: () => T;
}): T | undefined => {
  if (cases.web) {
    return cases.web();
  }
  
  if (cases.default) {
    return cases.default();
  }
  
  return undefined;
};

/**
 * 플랫폼별 클래스명 생성
 */
export const platformClass = (baseClass: string, platformClasses?: {
  web?: string;
  ios?: string;
  android?: string;
  mobile?: string;
}): string => {
  let classes = [baseClass];
  
  if (platformClasses?.web) {
    classes.push(platformClasses.web);
  }
  
  return classes.join(' ');
};
