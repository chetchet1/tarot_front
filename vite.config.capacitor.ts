import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'error-handler',
      configureServer(server) {
        server.middlewares.use((err, req, res, next) => {
          if (err && req.url?.includes('.vue')) {
            console.error('=== Vue file request error ===');
            console.error('URL:', req.url);
            console.error('Error:', err);
            console.error('Stack:', err.stack);
            console.error('============================');
            // 에러를 그대로 전달하여 정상적인 처리 경로로
            next(err);
            return;
          }
          next(err);
        });
      }
    }
  ],
  
  // 빌드 설정 - 캐시 무효화 강화
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 캐시 버스팅을 위한 타임스탬프 추가
    rollupOptions: {
      output: {
        // 모든 파일에 해시 추가하여 캐시 무효화
        entryFileNames: `[name]-[hash].js`,
        chunkFileNames: `[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          // 이미지 파일들도 해시 포함
          if (assetInfo.name && /\.(png|jpe?g|gif|svg)$/i.test(assetInfo.name)) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // 정적 에셋 복사
    copyPublicDir: true,
    // 소스맵 생성 (디버깅용)
    sourcemap: true,
    // 매니페스트 파일 생성
    manifest: true,
  },
  
  // 개발 서버 설정
  server: {
    port: 8082,
    host: 'localhost',
    strictPort: true,
    // HMR 설정 - 완전히 비활성화
    hmr: false,
    // CORS 설정
    cors: true,
    // 정적 파일 제공
    fs: {
      strict: false,
      allow: ['..'],
    },
    // 웹소켓 연결 시간 초과 방지
    watch: {
      usePolling: false,
      interval: 100,
    },
    // 프록시는 사용하지 않음 (Supabase 클라이언트가 직접 API 호출)
  },
  
  // 최적화 설정 추가
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@capacitor/core'],
    exclude: ['@/services/ai/customInterpretationService'],
    esbuildOptions: {
      target: 'esnext'
    }
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
  
  // Capacitor를 위한 base 설정 (상대 경로)
  base: './',
  
  // 환경 변수 설정
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
});
