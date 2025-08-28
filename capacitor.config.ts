import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarotgarden.app',
  appName: '타로의 정원',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // 로컬 빌드 사용 (dist 폴더) - URL 제거
    // url 설정을 제거하여 로컬 파일을 사용하도록 함
    allowNavigation: [
      'https://yxywzsmggvxxujuplyly.supabase.co',
      'https://*.supabase.co',
      'https://tarot-app-psi-eight.vercel.app',
      'https://*.vercel.app',
      'https://accounts.google.com',
      'https://*.google.com'
    ]
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