// 테스트용 직접 로그인 서비스
import { supabase } from './supabase';

export const testAuthService = {
  // 테스트 계정으로 직접 로그인
  async loginAsTestUser() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test1234'  // 테스트 비밀번호
    });
    
    if (error) throw error;
    return data;
  },
  
  // 프리미엄 테스트 계정으로 로그인
  async loginAsPremiumUser() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'premium@example.com',
      password: 'premium1234'  // 프리미엄 테스트 비밀번호
    });
    
    if (error) throw error;
    return data;
  },
  
  // 관리자 계정으로 로그인
  async loginAsAdmin() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@tarotgarden.com',  // 관리자 이메일
      password: 'admin_password'  // 실제 비밀번호로 변경 필요
    });
    
    if (error) throw error;
    return data;
  }
};