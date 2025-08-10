/**
 * 테스트 설정 관리
 * 개발 중 특정 계정을 테스트 계정으로 처리하기 위한 설정
 */

export class TestConfig {
  private static TEST_MODE_KEY = 'tarot_test_mode';
  private static TEST_ACCOUNTS_KEY = 'tarot_test_accounts';
  
  /**
   * 테스트 모드 활성화/비활성화
   */
  static setTestMode(enabled: boolean): void {
    if (enabled) {
      localStorage.setItem(this.TEST_MODE_KEY, 'true');
      console.log('🧪 테스트 모드 활성화됨');
    } else {
      localStorage.removeItem(this.TEST_MODE_KEY);
      console.log('🧪 테스트 모드 비활성화됨');
    }
  }
  
  /**
   * 테스트 모드 상태 확인
   */
  static isTestMode(): boolean {
    return localStorage.getItem(this.TEST_MODE_KEY) === 'true';
  }
  
  /**
   * 현재 사용자가 테스트 계정인지 확인
   */
  static isTestAccount(email: string | undefined): boolean {
    if (!email) return false;
    
    const emailLower = email.toLowerCase();
    
    // 하드코딩된 테스트 계정
    const hardcodedTestAccounts = [
      'test@example.com',
      'test@test.com'
    ];
    
    if (hardcodedTestAccounts.includes(emailLower)) {
      return true;
    }
    
    // 테스트 모드가 활성화된 경우 모든 계정을 테스트 계정으로 처리
    if (this.isTestMode()) {
      console.log('🧪 테스트 모드 활성화 - 모든 계정이 테스트 계정으로 처리됩니다');
      return true;
    }
    
    // 이메일에 'test'가 포함된 경우
    if (emailLower.includes('test')) {
      return true;
    }
    
    // 로컬 스토리지에 저장된 추가 테스트 계정 확인
    const additionalTestAccounts = this.getAdditionalTestAccounts();
    return additionalTestAccounts.includes(emailLower);
  }
  
  /**
   * 추가 테스트 계정 목록 가져오기
   */
  static getAdditionalTestAccounts(): string[] {
    const saved = localStorage.getItem(this.TEST_ACCOUNTS_KEY);
    if (!saved) return [];
    
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  
  /**
   * 테스트 계정 추가
   */
  static addTestAccount(email: string): void {
    const accounts = this.getAdditionalTestAccounts();
    const emailLower = email.toLowerCase();
    
    if (!accounts.includes(emailLower)) {
      accounts.push(emailLower);
      localStorage.setItem(this.TEST_ACCOUNTS_KEY, JSON.stringify(accounts));
      console.log(`🧪 테스트 계정 추가됨: ${emailLower}`);
    }
  }
  
  /**
   * 테스트 계정 제거
   */
  static removeTestAccount(email: string): void {
    const accounts = this.getAdditionalTestAccounts();
    const emailLower = email.toLowerCase();
    const index = accounts.indexOf(emailLower);
    
    if (index > -1) {
      accounts.splice(index, 1);
      localStorage.setItem(this.TEST_ACCOUNTS_KEY, JSON.stringify(accounts));
      console.log(`🧪 테스트 계정 제거됨: ${emailLower}`);
    }
  }
  
  /**
   * 모든 테스트 설정 초기화
   */
  static clearTestSettings(): void {
    localStorage.removeItem(this.TEST_MODE_KEY);
    localStorage.removeItem(this.TEST_ACCOUNTS_KEY);
    console.log('🧪 모든 테스트 설정이 초기화되었습니다');
  }
}

// 전역 객체에 테스트 도구 노출 (개발 콘솔에서 사용 가능)
if (typeof window !== 'undefined') {
  (window as any).TestConfig = TestConfig;
  console.log('💡 테스트 설정 사용법:');
  console.log('   TestConfig.setTestMode(true)  - 테스트 모드 활성화 (모든 계정이 테스트 계정)');
  console.log('   TestConfig.setTestMode(false) - 테스트 모드 비활성화');
  console.log('   TestConfig.addTestAccount("email@gmail.com") - 특정 계정을 테스트 계정으로 추가');
  console.log('   TestConfig.removeTestAccount("email@gmail.com") - 테스트 계정에서 제거');
}
