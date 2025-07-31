import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  
  // 빌드 설정
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 에셋 복사 설정
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 이미지 파일들은 원래 경로 유지
          if (assetInfo.name && /\.(png|jpe?g|gif|svg)$/i.test(assetInfo.name)) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // 정적 에셋 복사
    copyPublicDir: true,
  },
  
  // 개발 서버 설정
  server: {
    port: 8082,  // 로그에서 보인 포트와 맞춤
    host: true,
    // 정적 파일 제공
    fs: {
      allow: ['..'],
    },
  },
  
  // 최적화 설정 추가
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['@/services/ai/customInterpretationService']
  },
  
  // 경로 별칭 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
      '~': resolve(__dirname, 'app'),
      // assets 경로를 직접 매핑
      '/assets': resolve(__dirname, 'assets'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
  },
  
  // 정적 파일 디렉토리 설정 (기본 public)
  publicDir: 'public',
  
  // 에셋으로 처리할 파일 확장자
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  
  // Capacitor를 위한 base 설정
  base: './',
  
  // 환경 변수 설정
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
