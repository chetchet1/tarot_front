import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

class DebugLogger {
  private logs: string[] = [];
  private isDebugMode = true; // 수정 완료까지 디버깅 활성화 유지
  private showPanelOnScreen = true; // 화면 표시 활성화 유지
  private isMinimized = false;

  log(message: string, data?: any) {
    if (!this.isDebugMode) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;

    // 콘솔에 출력
    console.log(`🔍 ${logEntry}`, data || '');

    // 로그 저장
    this.logs.push(logEntry);

    // 최근 200개만 유지
    if (this.logs.length > 200) {
      this.logs.shift();
    }

    // 모바일에서 화면 표시
    if (this.showPanelOnScreen && Capacitor.isNativePlatform()) {
      this.showDebugPanel(logEntry);
    }
  }

  // 화면에 디버그 패널 표시 - 최소화/최대화 가능
  private showDebugPanel(message: string) {
    let panel = document.getElementById('debug-panel');
    let content = document.getElementById('debug-panel-content');

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'debug-panel';
      panel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.92);
        color: #0f0;
        font-family: monospace;
        font-size: 10px;
        z-index: 99999;
        transition: max-height 0.2s;
      `;

      // 헤더 (토글 버튼)
      const header = document.createElement('div');
      header.id = 'debug-panel-header';
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        background: rgba(80, 0, 180, 0.9);
        color: white;
        font-size: 11px;
        pointer-events: auto;
        cursor: pointer;
        user-select: none;
      `;
      header.innerHTML = '<span>DEBUG LOG</span><span id="debug-toggle-btn">[최소화]</span>';
      header.addEventListener('click', () => this.togglePanel());
      panel.appendChild(header);

      // 콘텐츠 영역
      content = document.createElement('div');
      content.id = 'debug-panel-content';
      content.style.cssText = `
        max-height: 40vh;
        overflow-y: auto;
        padding: 4px 8px;
        pointer-events: auto;
      `;
      panel.appendChild(content);

      document.body.appendChild(panel);
    }

    if (!content) {
      content = document.getElementById('debug-panel-content');
    }

    if (content && !this.isMinimized) {
      const entry = document.createElement('div');
      entry.style.cssText = 'padding: 1px 0; border-bottom: 1px solid rgba(0,255,0,0.1);';
      entry.textContent = message;
      content.appendChild(entry);

      // 최근 30개만 표시
      while (content.children.length > 30) {
        content.removeChild(content.firstChild!);
      }

      // 자동 스크롤
      content.scrollTop = content.scrollHeight;
    }
  }

  // 패널 최소화/최대화 토글
  private togglePanel() {
    this.isMinimized = !this.isMinimized;
    const content = document.getElementById('debug-panel-content');
    const btn = document.getElementById('debug-toggle-btn');

    if (content) {
      content.style.display = this.isMinimized ? 'none' : 'block';
    }
    if (btn) {
      btn.textContent = this.isMinimized ? '[최대화]' : '[최소화]';
    }
  }

  // 로그 전체 가져오기
  getLogs(): string[] {
    return [...this.logs];
  }

  // 로그 클리어
  clear() {
    this.logs = [];
    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.remove();
    }
  }

  // 디버그 패널 제거 (초기화용)
  removeDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.remove();
    }
  }

  // Supabase에 중요 로그 전송 (선택적)
  async sendCriticalLog(message: string, error?: any) {
    try {
      await supabase.from('debug_logs').insert({
        message,
        error: error ? JSON.stringify(error) : null,
        platform: Capacitor.getPlatform(),
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to send log:', e);
    }
  }
}

export const logger = new DebugLogger();
