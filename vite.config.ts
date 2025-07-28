import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  
  // 빌드 설정
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  // 개발 서버 설정
  server: {
    port: 8080,
    host: true,
  },
  
  // 경로 별칭 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
      '~': resolve(__dirname, 'app'),
    },
  },
  
  // Capacitor를 위한 base 설정
  base: './',
  
  // 환경 변수 설정
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
