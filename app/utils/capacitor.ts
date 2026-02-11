// Capacitor 네이티브 기능 유틸리티
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Toast } from '@capacitor/toast';
import { App } from '@capacitor/app';

/**
 * 플랫폼 및 네이티브 기능 유틸리티
 */
export class NativeUtils {
  private static backButtonHandle: any | null = null;
  /**
   * 현재 플랫폼이 네이티브인지 확인
   */
  static get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * 현재 플랫폼이 웹인지 확인
   */
  static get isWeb(): boolean {
    return !Capacitor.isNativePlatform();
  }

  /**
   * 플랫폼 이름 가져오기
   */
  static get platform(): string {
    return Capacitor.getPlatform();
  }

  /**
   * 햅틱 피드백 재생
   */
  static async playHaptic(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.isNative) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * 카드 뽑기 시 햅틱 피드백
   */
  static async cardDrawHaptic(): Promise<void> {
    await this.playHaptic('medium');
  }

  /**
   * 버튼 클릭 시 햅틱 피드백
   */
  static async buttonTapHaptic(): Promise<void> {
    await this.playHaptic('light');
  }

  /**
   * 중요한 액션 시 햅틱 피드백
   */
  static async importantActionHaptic(): Promise<void> {
    await this.playHaptic('heavy');
  }

  /**
   * 상태바 스타일 설정
   */
  static async setStatusBarStyle(isDark = true): Promise<void> {
    if (!this.isNative) return;

    try {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });
    } catch (error) {
      console.warn('Status bar style not available:', error);
    }
  }

  /**
   * 키보드 숨기기
   */
  static async hideKeyboard(): Promise<void> {
    if (!this.isNative) return;

    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Keyboard hide not available:', error);
    }
  }

  /**
   * 앱 초기화 시 네이티브 설정
   */
  static async initializeApp(): Promise<void> {
    if (!this.isNative) return;

    try {
      // 상태바 스타일 설정
      await this.setStatusBarStyle(true);

      console.log('Native app initialized successfully');
    } catch (error) {
      console.warn('Native initialization failed:', error);
    }
  }

  /**
   * 앱 정보 가져오기
   */
  static async getAppInfo(): Promise<{
    name: string;
    id: string;
    build: string;
    version: string;
  } | null> {
    if (!this.isNative) return null;

    try {
      const { App } = await import('@capacitor/app');
      return await App.getInfo();
    } catch (error) {
      console.warn('App info not available:', error);
      return null;
    }
  }

  /**
   * 딥링크 처리를 위한 URL 리스너 설정
   */
  static setupUrlListener(callback: (url: string) => void): void {
    if (!this.isNative) return;

    import('@capacitor/app').then(({ App }) => {
      App.addListener('appUrlOpen', (event) => {
        callback(event.url);
      });
    }).catch(error => {
      console.warn('URL listener setup failed:', error);
    });
  }

  /**
   * 앱 상태 변화 리스너 설정
   */
  static setupAppStateListener(
    onActive: () => void,
    onInactive: () => void
  ): void {
    if (!this.isNative) return;

    import('@capacitor/app').then(({ App }) => {
      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          onActive();
        } else {
          onInactive();
        }
      });
    }).catch(error => {
      console.warn('App state listener setup failed:', error);
    });
  }

  /**
   * Toast 메시지 표시
   */
  static async showToast(message: string, duration: 'short' | 'long' = 'short'): Promise<void> {
    if (!this.isNative) {
      console.log('Toast (Web):', message);
      return;
    }

    try {
      await Toast.show({
        text: message,
        duration: duration,
        position: 'bottom'
      });
    } catch (error) {
      console.warn('Toast not available:', error);
    }
  }

  /**
   * 앱 종료
   */
  static async exitApp(): Promise<void> {
    if (!this.isNative) {
      console.log('Exit app called on web platform');
      return;
    }

    try {
      await App.exitApp();
    } catch (error) {
      console.warn('Exit app not available:', error);
    }
  }

  /**
   * 뒤로가기 버튼 리스너 설정
   */
  static setupBackButtonListener(callback: () => void): void {
    if (!this.isNative) return;

    try {
      this.backButtonHandle?.remove?.();
    } catch {
      // ignore
    }
    this.backButtonHandle = App.addListener('backButton', callback);
  }

  /**
   * 뒤로가기 버튼 리스너 제거
   */
  static removeBackButtonListener(): void {
    if (!this.isNative) return;

    try {
      this.backButtonHandle?.remove?.();
    } catch {
      // ignore
    }
    this.backButtonHandle = null;

    // removeAllListeners를 사용하면 OAuth 리스너도 제거되므로
    // backButton 리스너만 제거해야 함
    // 하지만 Capacitor App 플러그인은 특정 리스너만 제거하는 API가 없음
    // 따라서 일단 비워두고 OAuth 리스너는 따로 관리
    console.log('🔙 [NativeUtils] backButton 리스너 제거 (다른 리스너는 유지)');
  }
}

// 웹에서 사용할 수 있는 Mock 함수들
export const webMockUtils = {
  playHaptic: () => Promise.resolve(),
  cardDrawHaptic: () => Promise.resolve(),
  buttonTapHaptic: () => Promise.resolve(),
  importantActionHaptic: () => Promise.resolve(),
  setStatusBarStyle: () => Promise.resolve(),
  hideKeyboard: () => Promise.resolve(),
  initializeApp: () => Promise.resolve(),
  showToast: (message: string) => { console.log('Toast:', message); return Promise.resolve(); },
  exitApp: () => { console.log('Exit app called on web'); return Promise.resolve(); },
  setupBackButtonListener: () => {},
  removeBackButtonListener: () => {},
};

// 플랫폼에 따라 적절한 유틸리티 export
export const nativeUtils = NativeUtils.isNative ? NativeUtils : webMockUtils;
