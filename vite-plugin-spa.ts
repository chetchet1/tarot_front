import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // URL 파싱
        const url = req.url || '';
        
        // API 요청이나 정적 파일은 건너뛰기
        if (
          url.startsWith('/api') ||
          url.startsWith('/assets') ||
          url.includes('.') || // 파일 확장자가 있는 경우
          url.startsWith('/@') || // Vite 내부 경로
          url.startsWith('/node_modules')
        ) {
          return next();
        }
        
        // SPA 라우트 처리 - 모든 라우트를 index.html로 리다이렉션
        if (url.startsWith('/s/') || !fs.existsSync(path.join(process.cwd(), 'public', url))) {
          req.url = '/index.html';
        }
        
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        
        // API 요청이나 정적 파일은 건너뛰기
        if (
          url.startsWith('/api') ||
          url.startsWith('/assets') ||
          url.includes('.') ||
          url.startsWith('/@') ||
          url.startsWith('/node_modules')
        ) {
          return next();
        }
        
        // SPA 라우트 처리
        if (url.startsWith('/s/') || !fs.existsSync(path.join(process.cwd(), 'dist', url))) {
          req.url = '/index.html';
        }
        
        next();
      });
    }
  };
}
