import { CapacitorConfig } from '@capacitor/cli';

// Android 전용 설정 - 프로덕션 URL 사용
const config: CapacitorConfig = {
  appId: 'com.tarotgarden.app',
  appName: '타로의 정원',
  webDir: 'dist',
  server: {
    // Android 빌드시 Vercel URL 사용 (OAuth 리다이렉트를 위해)
    // 캐시 버스팅을 위한 타임스탬프 쿼리 파라미터 추가
    url: `https://tarot-app-psi-eight.vercel.app?v=${Date.now()}`,
    androidScheme: 'https',
    cleartext: true,
    // 캐시 헤더 설정
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
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