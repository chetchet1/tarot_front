/**
 * 앱 업데이트 체크 서비스
 */

import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { supabase } from './supabase';
import { showConfirm } from '../utils/alerts';

// 버전 정보는 동적으로 가져옴
let CURRENT_VERSION = '1.0.2'; // 기볳5값
let CURRENT_VERSION_CODE = 36; // 기볳5값

interface AppVersion {
  id?: string;
  version_name: string;
  version_code: number;
  is_required: boolean;
  update_message: string;
  play_store_url: string;
  created_at?: string;
}

class UpdateChecker {
  private playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tarotgarden.app';
  
  /**
   * 앱 업데이트 체크
   */
  async checkForUpdate(): Promise<void> {
    // 웹 환경에서는 체크하지 않음
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    
    try {
      // 현재 앱 버전 정보 가져오기
      const currentAppInfo = await this.getCurrentVersion();
      const currentVersionCode = currentAppInfo.build;
      
      console.log('🔄 업데이트 체크 시작:', {
        currentVersion: currentAppInfo.version,
        currentBuild: currentVersionCode
      });
      
      // Supabase에서 최신 버전 정보 가져오기
      const latestVersion = await this.getLatestVersion();
      
      if (!latestVersion) {
        console.log('⚠️ 최신 버전 정보 없음');
        return;
      }
      
      console.log('🆕 최신 버전 정보:', {
        latestVersion: latestVersion.version_name,
        latestCode: latestVersion.version_code
      });
      
      // 버전 비교
      if (latestVersion.version_code > currentVersionCode) {
        console.log('✨ 새 버전 발견!');
        await this.showUpdateDialog(latestVersion, currentAppInfo);
      } else {
        console.log('✅ 최신 버전 사용 중');
      }
    } catch (error) {
      console.error('업데이트 체크 실패:', error);
      // 업데이트 체크 실패는 무시 (앱 사용에 영향 없음)
    }
  }
  
  /**
   * Supabase에서 최신 버전 정보 가져오기
   */
  private async getLatestVersion(): Promise<AppVersion | null> {
    try {
      // app_versions 테이블에서 최신 버전 정보 조회
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('version_code', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // 404는 테이블이 없거나 권한이 없는 경우 - 조용히 무시
        if (error.code === 'PGRST200' || error.code === '42P01' || error.message?.includes('404')) {
          console.log('버전 테이블 없음 - 업데이트 체크 스킵');
        } else {
          console.error('버전 정보 조회 실패:', error);
        }
        return null;
      }
      
      return data as AppVersion;
    } catch (error) {
      console.error('버전 정보 조회 실패:', error);
      return null;
    }
  }
  
  /**
   * 업데이트 다이얼로그 표시
   */
  private async showUpdateDialog(version: AppVersion, currentInfo: { version: string, build: number }): Promise<void> {
    const message = version.update_message || '새로운 버전이 출시되었습니다. 업데이트하시겠습니까?';
    
    if (version.is_required) {
      // 필수 업데이트
      await showConfirm({
        title: '🔄 필수 업데이트',
        message: `${message}\n\n현재 버전: ${currentInfo.version} (${currentInfo.build})\n최신 버전: ${version.version_name} (${version.version_code})`,
        confirmText: '업데이트',
        cancelText: '종료',
        onCancel: () => {
          // 앱 종료
          App.exitApp();
        }
      }).then(confirmed => {
        if (confirmed) {
          this.openPlayStore();
        } else {
          // 취소 시 앱 종료
          App.exitApp();
        }
      });
    } else {
      // 선택적 업데이트
      const confirmed = await showConfirm({
        title: '🆕 업데이트 가능',
        message: `${message}\n\n현재 버전: ${currentInfo.version} (${currentInfo.build})\n최신 버전: ${version.version_name} (${version.version_code})`,
        confirmText: '업데이트',
        cancelText: '나중에'
      });
      
      if (confirmed) {
        this.openPlayStore();
      }
    }
  }
  
  /**
   * Play Store 열기
   */
  private async openPlayStore(): Promise<void> {
    try {
      await Browser.open({ url: this.playStoreUrl });
    } catch (error) {
      console.error('Play Store 열기 실패:', error);
    }
  }
  
  /**
   * 현재 앱 버전 정보 가져오기
   */
  async getCurrentVersion(): Promise<{ version: string, build: number }> {
    try {
      const info = await App.getInfo();
      return {
        version: info.version,
        build: parseInt(info.build)
      };
    } catch (error) {
      return {
        version: CURRENT_VERSION,
        build: CURRENT_VERSION_CODE
      };
    }
  }
}

// 싱글톤 인스턴스
export const updateChecker = new UpdateChecker();