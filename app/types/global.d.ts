// Capacitor 관련 타입 정의
interface Window {
  Capacitor?: {
    Plugins: {
      Haptics: {
        impact(options: { style: 'heavy' | 'medium' | 'light' }): Promise<void>;
        notification(options: { type: 'success' | 'warning' | 'error' }): Promise<void>;
        selectionStart(): Promise<void>;
        selectionChanged(): Promise<void>;
        selectionEnd(): Promise<void>;
      };
    };
  };
}
