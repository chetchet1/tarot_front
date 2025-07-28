import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarotgarden.app',
  appName: '타로의 정원',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
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
    }
  }
};

export default config;
