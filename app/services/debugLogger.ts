import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

class DebugLogger {
  private logs: string[] = [];
  private isDebugMode = true; // 광고 디버깅을 위해 임시 활성화
  private showPanelOnScreen = true; // 화면 표시 임시 활성화
  
  log(message: string, data?: any) {
    if (!this.isDebugMode) return;
    
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${message}`;
    
    // 콘솔에 출력
    console.log(`🔍 ${logEntry}`, data || '');
    
    // 로그 저장
    this.logs.push(logEntry);
    
    // 최근 100개만 유지
    if (this.logs.length > 100) {
      this.logs.shift();
    }
    
    // 모바일에서 화면 표시 (현재 비활성화)
    if (this.showPanelOnScreen && Capacitor.isNativePlatform()) {
      this.showDebugPanel(logEntry);
    }
  }
  
  // 화면 상단에 디버그 패널 표시
  private showDebugPanel(message: string) {
    let panel = document.getElementById('debug-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'debug-panel';
      panel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        color: #0f0;
        font-family: monospace;
        font-size: 10px;
        padding: 5px;
        z-index: 99999;
        max-height: 150px;
        overflow-y: auto;
        pointer-events: none;
      `;
      document.body.appendChild(panel);
    }
    
    const entry = document.createElement('div');
    entry.textContent = message;
    panel.appendChild(entry);
    
    // 최근 10개만 표시
    while (panel.children.length > 10) {
      panel.removeChild(panel.firstChild!);
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
      panel.remove(); // 패널 자체를 제거
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