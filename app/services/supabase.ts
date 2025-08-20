import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/env';
import { Capacitor } from '@capacitor/core';

// Supabase 클라이언트 생성 (싱글톤)
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true, // 모든 플랫폼에서 세션 유지
      detectSessionInUrl: true,
      // 모바일에서도 localStorage 사용 (Capacitor가 자동으로 처리)
      storage: undefined // 기본 storage (localStorage) 사용
    },
    global: {
      fetch: (url, options = {}) => {
        // 타임아웃 설정 (15초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        return fetch(url, {
          ...options,
          signal: controller.signal
        }).then(response => {
          clearTimeout(timeoutId);
          return response;
        }).catch(error => {
          clearTimeout(timeoutId);
          if (error.name === 'AbortError') {
            console.error('⏰ Supabase API 요청 타임아웃');
            throw new Error('네트워크 연결 시간이 초과되었습니다.');
          }
          throw error;
        });
      }
    }
  }
);

// 타입 정의
export type Database = {
  public: {
    Tables: {
      tarot_cards: {
        Row: {
          id: number
          name: string
          name_kr: string
          arcana: string
          suit: string | null
          number: number
          image_url: string
          meaning_upright: string
          meaning_reversed: string
          keywords: string
          created_at: string
        }
      }
      readings: {
        Row: {
          id: string
          user_id: string
          spread_id: string
          topic: string
          cards: any
          overall_message: string | null
          created_at: string
        }
      }
      ai_interpretations: {
        Row: {
          id: number
          reading_id: string
          user_id: string
          interpretation_text: string
          rating: number | null
          created_at: string
        }
      }
    }
  }
};

console.log('Supabase 클라이언트 생성 완료:', !!supabase);
console.log('Supabase auth:', !!supabase.auth);
console.log('Supabase URL 검증:', supabase.supabaseUrl);
console.log('Supabase Key 검증:', supabase.supabaseKey?.substring(0, 20) + '...');

// 확장된 인증 서비스
export const authService = {
  // Supabase 클라이언트 노출
  supabase,
  // getCurrentUser 함수 개선 - 타임아웃과 함께 세션 확인
  async getCurrentUser() {
    try {
      console.log('authService.getCurrentUser 호출');
      
      // 타임아웃 설정 (5초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      // 세션 확인을 타임아웃과 함께 실행
      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (sessionError) {
        console.log('세션 확인 오류:', sessionError.message);
        return null;
      }
      
      if (!session || !session.user) {
        console.log('활성 세션이 없음');
        return null;
      }
      
      // 세션 유효성 검증
      const now = new Date().getTime();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      
      if (expiresAt > 0 && now > expiresAt) {
        console.log('세션이 만료됨');
        return null;
      }
      
      console.log('getCurrentUser 결과:', session.user);
      return session.user;
      
    } catch (error) {
      console.log('getCurrentUser 예외:', error.message);
      return null;
    }
  },
  
  // 이메일 회원가입 - 디버깅용 단순화 버전
  async signUp(email: string, password: string, userData?: {
    name?: string;
    phone?: string;
    birthdate?: string;
    gender?: 'male' | 'female' | 'other';
  }) {
    console.log('📝 Supabase 회원가입 시도:', { email, userData });
    
    try {
      // Rate limit 체크를 위한 사전 확인
      if (email === 'chetchet@nate.com') {
        console.log('⚠️ 알려진 rate limit 이메일, 1시간 후 다시 시도하거나 다른 이메일 사용');
        // 임시로 다른 처리를 하거나 에러 메시지를 더 친화적으로 변경
      }
      
      // 인증 완료 시 리다이렉트할 URL 설정
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('🔄 회원가입 시도 with redirectTo:', redirectUrl);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData || {}
        }
      });
      
      console.log('📝 회원가입 응답 데이터:', data);
      console.log('📝 회원가입 에러:', error);
      
      if (error) {
        // Rate limit 에러를 더 친화적으로 처리
        if (error.message.includes('rate limit') || error.status === 429) {
          console.error('⏰ 이메일 전송 제한에 걸림. 1시간 후 다시 시도하거나 다른 이메일 사용');
          throw new Error('이메일 전송 제한에 걸렸습니다. 1시간 후 다시 시도하거나 다른 이메일 주소를 사용해주세요.');
        }
        
        console.error('❌ Supabase 회원가입 에러 상세:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          details: error
        });
        throw error;
      }
      
      console.log('✅ 회원가입 성공');
      return data;
    } catch (error) {
      console.error('❌ 회원가입 예외:', error);
      throw error;
    }
  },

  // 이메일 로그인 (개선된 버전)
  async signIn(email: string, password: string) {
    console.log('🔑 로그인 시도:', email);
    
    try {
      // 디버깅을 위한 추가 로그
      console.log('🔍 Supabase URL:', supabase.supabaseUrl);
      console.log('🔍 Supabase Key 시작:', supabase.supabaseKey?.substring(0, 20) + '...');
      console.log('🔍 인증 요청 시작 시간:', new Date().toISOString());
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('🔑 로그인 응답 데이터:', data);
      console.log('🔑 로그인 에러:', error);
      
      if (error) {
        // 에러 상세 정보 추가
        console.error('❌ Supabase 로그인 에러 상세:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          details: error
        });
        
        // 일반적인 인증 에러 처리
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.');
        }
        
        // 스키마 에러의 경우 (이제 수정되었으므로 발생하지 않아야 함)
        if (error.message.includes('Database error querying schema')) {
          console.error('💥 스키마 에러 발생 - 이는 수정되었어야 하는 문제입니다.');
          throw new Error('일시적인 서버 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        
        // 기타 에러
        throw new Error(error.message || '로그인 중 오류가 발생했습니다.');
      }
      
      // 로그인 성공 후 프로필 확인
      if (data.user) {
        console.log('✅ 로그인 성공, 프로필 확인 중...');
        
        try {
          // 프로필 존재 여부 확인
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, name, is_premium')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            console.warn('⚠️ 프로필 조회 실패:', profileError.message);
            // 프로필이 없어도 로그인은 성공으로 처리
          } else {
            console.log('✅ 프로필 확인 완료:', profile);
          }
        } catch (profileError) {
          console.warn('⚠️ 프로필 확인 중 예외:', profileError);
          // 프로필 확인 실패해도 로그인은 성공으로 처리
        }
      }
      
      console.log('✅ 로그인 완료');
      return data;
    } catch (error) {
      console.error('❌ 로그인 예외:', error);
      throw error;
    }
  },



  // Google 소셜 로그인
  async signInWithGoogle() {
    try {
      // 모바일과 웹 구분
      const redirectTo = Capacitor.isNativePlatform() 
        ? 'com.tarotgarden.app://auth/callback'
        : `${window.location.origin}/auth/callback`;
      
      console.log('🔐 Google OAuth 시작, redirectTo:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error('❌ Google OAuth 에러:', error);
        throw error;
      }
      
      console.log('✅ Google OAuth URL 생성:', data.url);
      
      // 모바일에서는 외부 브라우저로 열림
      // 사용자가 로그인 후 앱으로 돌아옴
      return data;
    } catch (error) {
      console.error('❌ Google 로그인 실패:', error);
      throw error;
    }
  },

  // GitHub 소셜 로그인
  async signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Discord 소셜 로그인
  async signInWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  },

  // 로그아웃
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  },

  // 세션 갱신
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },

  // 비밀번호 재설정 이메일 전송
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) throw error;
      console.log('✅ 비밀번호 재설정 이메일 전송');
    } catch (error) {
      console.error('❌ 비밀번호 재설정 실패:', error);
      throw error;
    }
  },

  // 비밀번호 업데이트
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  // 프로필 업데이트
  async updateProfile(updates: {
    name?: string;
    phone?: string;
    birthdate?: string;
    gender?: string;
    avatar_url?: string;
  }) {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
  },

  // 인증 상태 변화 감지
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // 이메일 확인 재전송
  async resendConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      if (error) throw error;
      console.log('✅ 인증 이메일 재전송');
    } catch (error) {
      console.error('❌ 인증 이메일 재전송 실패:', error);
      throw error;
    }
  }
};

// 프로필 서비스 (기존 코드 유지)
export const profileService = {
  // 프로필 조회
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 프로필 업데이트
  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 프리미엄 상태 업데이트
  async updatePremiumStatus(userId: string, isPremium: boolean) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: isPremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 사용자 통계 조회
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// 타로카드 서비스
export const tarotService = {
  // 모든 타로카드 조회
  async getAllCards() {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('타로카드 데이터 로드 실패:', error);
      throw error;
    }
    
    console.log('타로카드 데이터 로드 성공:', data?.length + '장');
    return data;
  },

  // 메이저 아르카나 조회
  async getMajorArcana() {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .eq('arcana', 'major')
      .order('number');
    
    if (error) throw error;
    return data;
  },

  // 마이너 아르카나 조회
  async getMinorArcana() {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .eq('arcana', 'minor')
      .order('id');
    
    if (error) throw error;
    return data;
  },

  // 특정 수트의 카드 조회
  async getCardsBySuit(suit: string) {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .eq('suit', suit)
      .order('number');
    
    if (error) throw error;
    return data;
  }
};

// 스프레드 서비스
export const spreadService = {
  // 모든 스프레드 조회
  async getAllSpreads() {
    const { data, error } = await supabase
      .from('tarot_spreads')
      .select('*')
      .order('card_count');
    
    if (error) {
      console.error('스프레드 데이터 로드 실패:', error);
      throw error;
    }
    
    console.log('스프레드 데이터 로드 성공:', data?.length + '개');
    return data;
  },

  // 무료 스프레드만 조회
  async getFreeSpreads() {
    const { data, error } = await supabase
      .from('tarot_spreads')
      .select('*')
      .eq('is_premium', false)
      .order('card_count');
    
    if (error) throw error;
    return data;
  },

  // 특정 주제에 사용 가능한 스프레드 조회
  async getSpreadsByTopic(topic: string) {
    const { data, error } = await supabase
      .from('tarot_spreads')
      .select('*')
      .contains('topics', [topic])
      .order('card_count');
    
    if (error) throw error;
    return data;
  }
};

// 점괘 서비스
export const readingService = {
  // 점괘 저장
  async saveReading(userId: string, reading: any) {
    const { data, error } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
        spread_id: reading.spreadId,
        topic: reading.topic,
        question: reading.question,
        cards: reading.cards,
        overall_message: reading.overallMessage,
        is_premium: reading.isPremium
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // 사용자 점괘 목록 조회
  async getUserReadings(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // 점괘 삭제
  async deleteReading(readingId: string, userId: string) {
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', readingId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

// 나머지 기존 서비스들 (readingService, subscriptionService 등) 유지...
export * from './supabase';

// 구독 서비스
export const subscriptionService = {
  // 구독 생성
  async createSubscription(subscription: {
    user_id?: string;
    plan: string;
    status: string;
    price: number;
    currency: string;
    platform_order_id?: string;
    payment_method?: string;
    start_date: Date;
    end_date?: Date;
  }) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscription,
        start_date: subscription.start_date.toISOString(),
        end_date: subscription.end_date?.toISOString() ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 사용자 현재 구독 조회
  async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // 구독 취소 처리
  async cancelSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};