/**
 * 플랫폼 감지 유틸리티 (Capacitor 지원)
 */
export const Platform = {
  /**
   * 웹 플랫폼 여부
   */
  get isWeb(): boolean {
    if (typeof (window as any).Capacitor !== 'undefined') {
      return (window as any).Capacitor.getPlatform() === 'web';
    }
    return true;
  },

  /**
   * iOS 플랫폼 여부
   */
  get isIOS(): boolean {
    if (typeof (window as any).Capacitor !== 'undefined') {
      return (window as any).Capacitor.getPlatform() === 'ios';
    }
    return false;
  },

  /**
   * Android 플랫폼 여부
   */
  get isAndroid(): boolean {
    if (typeof (window as any).Capacitor !== 'undefined') {
      return (window as any).Capacitor.getPlatform() === 'android';
    }
    return false;
  },

  /**
   * 모바일 플랫폼 여부
   */
  get isMobile(): boolean {
    return this.isIOS || this.isAndroid;
  },

  /**
   * 현재 플랫폼 이름
   */
  get name(): 'web' | 'ios' | 'android' {
    if (typeof (window as any).Capacitor !== 'undefined') {
      return (window as any).Capacitor.getPlatform() as 'web' | 'ios' | 'android';
    }
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
