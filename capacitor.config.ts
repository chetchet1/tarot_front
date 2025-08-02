import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarotgarden.app',
  appName: '타로의 정원',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    hostname: 'localhost',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1E1B4B',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    },
    // Browser 플러그인 설정 추가 - Chrome Custom Tabs 사용
    Browser: {
      showTitle: true,
      toolbarColor: '#1E1B4B',
      presentationStyle: 'popover',
      androidChromeCustomTabsOptions: {
        showTitle: true,
        toolbarColor: '#1E1B4B',
        enableUrlBarHiding: true,
        enableDefaultShare: false
      }
    }
  }
};

export default config;