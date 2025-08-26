import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
  ],
  
  // 빌드 설정
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 모듈 포맷 설정
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // 에셋 파일명 설정
        assetFileNames: (assetInfo) => {
          // 이미지 파일들은 원래 경로 유지
          if (assetInfo.name && /\.(png|jpe?g|gif|svg)$/i.test(assetInfo.name)) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // 청크 파일명 설정
        chunkFileNames: 'js/[name]-[hash].js',
        // 엔트리 파일명 설정
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // 정적 에셋 복사
    copyPublicDir: true,
    // 소스맵 생성 (프로덕션에서는 false)
    sourcemap: false,
    // 최소화 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 디버깅을 위해 임시로 콘솔 유지
        drop_debugger: true,
      },
    },
  },
  
  // 개발 서버 설정
  server: {
    port: 8082,
    host: 'localhost',
    strictPort: true,
    cors: true,
    fs: {
      strict: false,
      allow: ['..'],
    },
    // SPA fallback 설정 추가
    middlewareMode: false,
    hmr: true,
  },
  
  // 프리뷰 서버 설정 (빌드된 앱을 테스트할 때)
  preview: {
    port: 8082,
    host: 'localhost',
  },
  
  // 최적화 설정
  optimizeDeps: {
    include: [
      'vue', 
      'vue-router', 
      'pinia', 
      '@capacitor/core',
      '@supabase/supabase-js'
    ],
    exclude: [
      '@/services/ai/customInterpretationService'
    ],
    esbuildOptions: {
      target: 'esnext'
    },
    // 게시판 관련 컴포넌트들을 미리 처리
    entries: [
      'app/views/BoardMain.vue',
      'app/views/BoardPostDetail.vue',
      'app/views/BoardPostEditor.vue'
    ]
  },
  
  // 경로 별칭 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
      '~': resolve(__dirname, 'app'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
  },
  
  // 정적 파일 디렉토리 설정
  publicDir: 'public',
  
  // 에셋으로 처리할 파일 확장자
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  
  // 웹 배포를 위한 base 설정 (Vercel은 절대 경로 사용)
  base: '/',
  
  // 환경 변수 설정
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
