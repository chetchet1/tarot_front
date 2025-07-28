// 플랫폼별 ApplicationSettings 대체재

// 웹 환경용 localStorage 기반 구현
export const WebApplicationSettings = {
  getString(key: string, defaultValue: string = ''): string {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setBoolean(key: string, value: boolean): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },

  getNumber(key: string, defaultValue: number = 0): number {
    try {
      const value = localStorage.getItem(key);
      return value ? parseFloat(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setNumber(key: string, value: number): void {
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }
};

// 모바일 환경용 (실제 NativeScript)
let NativeApplicationSettings: any = null;
try {
  // 동적 import로 NativeScript 모듈 로드 시도
  if (typeof window === 'undefined') {
    NativeApplicationSettings = require('@nativescript/core').ApplicationSettings;
  }
} catch (error) {
  // 웹 환경에서는 무시
}

// 플랫폼 감지
export const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const isMobile = !isWeb;

// 통합 ApplicationSettings 인터페이스
export const ApplicationSettings = isMobile && NativeApplicationSettings 
  ? NativeApplicationSettings 
  : WebApplicationSettings;

export default ApplicationSettings;
