/**
 * 무료 사용자의 유료 배열 사용을 추적하는 유틸리티
 * DB 기반으로 변경됨
 */

import { supabase } from '../services/supabase';

const PREMIUM_SPREADS = ['celtic_cross', 'seven_star', 'cup_of_relationship'];

export interface PremiumSpreadUsage {
  id?: string;
  userId: string;
  spreadId: string;
  usedAt: string;
}

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 현재 사용자 ID 가져오기
 */
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * 오늘 유료 배열을 사용했는지 확인
 */
export async function hasUsedPremiumSpreadToday(): Promise<boolean> {
  console.log('📊 [hasUsedPremiumSpreadToday] 호출됨');
  try {
    // 현재 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const userEmail = user?.email;
    console.log('📊 [hasUsedPremiumSpreadToday] userId:', userId, 'email:', userEmail);
    
    // 테스트 계정은 항상 false 반환 (제한 없음)
    if (userEmail === 'test@example.com') {
      console.log('📊 [hasUsedPremiumSpreadToday] 테스트 계정 - 제한 없음');
      return false;
    }
    
    if (!userId) {
      console.warn('사용자 ID를 찾을 수 없습니다.');
      return false;
    }

    const today = getCurrentDate();
    console.log('📊 [hasUsedPremiumSpreadToday] today:', today);
    
    // DB에서 오늘 사용 기록 확인 (used_date 필드 사용)
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('id, spread_id')
      .eq('user_id', userId)
      .eq('used_date', today);

    console.log('📊 [hasUsedPremiumSpreadToday] DB 결과:', { data, error });

    if (error && error.code !== 'PGRST116') { // PGRST116: 결과 없음
      console.error('유료 배열 사용 확인 오류:', error);
      return false;
    }

    const result = !!(data && data.length > 0);
    console.log('📊 [hasUsedPremiumSpreadToday] 결과:', result);
    return result;
  } catch (error) {
    console.error('유료 배열 사용 확인 중 오류:', error);
    return false;
  }
}

/**
 * 특정 스프레드가 유료 배열인지 확인
 */
export function isPremiumSpread(spreadId: string): boolean {
  return PREMIUM_SPREADS.includes(spreadId);
}

/**
 * 무료 사용자가 유료 배열을 사용할 수 있는지 확인
 */
export async function canUsePremiumSpread(spreadId: string, isPremiumUser: boolean): Promise<boolean> {
  // 프리미엄 사용자는 항상 사용 가능
  if (isPremiumUser) {
    return true;
  }
  
  // 테스트 계정 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email === 'test@example.com') {
    console.log('📊 [canUsePremiumSpread] 테스트 계정 - 모든 배열 사용 가능');
    return true;
  }
  
  // 유료 배열이 아니면 사용 가능
  if (!isPremiumSpread(spreadId)) {
    return true;
  }
  
  // 오늘 이미 사용했으면 사용 불가
  const hasUsed = await hasUsedPremiumSpreadToday();
  return !hasUsed;
}

/**
 * 유료 배열 사용 기록
 */
export async function recordPremiumSpreadUsage(spreadId: string): Promise<void> {
  console.log('📝 [recordPremiumSpreadUsage] 호출됨, spreadId:', spreadId);
  console.log('📝 [recordPremiumSpreadUsage] 호출 시간:', new Date().toISOString());
  console.log('📝 [recordPremiumSpreadUsage] 호출 스택:', new Error().stack?.split('\n').slice(1, 4).join('\n'));
  
  if (!isPremiumSpread(spreadId)) {
    console.log('📝 [recordPremiumSpreadUsage] 유료 배열이 아님 - 기록 건너뜀');
    return;
  }

  try {
    // 현재 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const userEmail = user?.email;
    console.log('📝 [recordPremiumSpreadUsage] userId:', userId, 'email:', userEmail);
    
    // 테스트 계정은 기록하지 않음 - 강화된 체크
    const testEmails = ['test@example.com', 'test@test.com'];
    const emailLower = userEmail?.toLowerCase() || '';
    if (testEmails.includes(emailLower) || emailLower.includes('test')) {
      console.warn('📝 [recordPremiumSpreadUsage] 테스트 계정 감지 - 사용 기록 건너뜀');
      console.warn('📝 [recordPremiumSpreadUsage] 이메일:', userEmail);
      console.warn('📝 [recordPremiumSpreadUsage] 호출 스택:', new Error().stack?.split('\n').slice(1, 5).join('\n'));
      return;
    }
    
    if (!userId) {
      console.error('📝 [recordPremiumSpreadUsage] 사용자 ID를 찾을 수 없습니다.');
      return;
    }

    // DB에 사용 기록 저장
    const now = new Date();
    const usedDate = getCurrentDate();
    console.log('📝 [recordPremiumSpreadUsage] DB에 저장할 데이터:', {
      user_id: userId,
      spread_id: spreadId,
      used_at: now.toISOString(),
      used_date: usedDate
    });
    
    const { error } = await supabase
      .from('premium_spread_usage')
      .insert({
        user_id: userId,
        spread_id: spreadId,
        used_at: now.toISOString(),
        used_date: usedDate
      });

    if (error) {
      console.error('📝 [recordPremiumSpreadUsage] DB 저장 오류:', error);
    } else {
      console.log('📝 [recordPremiumSpreadUsage] DB 저장 성공!');
    }
  } catch (error) {
    console.error('📝 [recordPremiumSpreadUsage] 예외 발생:', error);
  }
}

/**
 * 오늘 사용한 유료 배열 ID 가져오기
 */
export async function getUsedPremiumSpreadToday(): Promise<string | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const today = getCurrentDate();
    
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('spread_id')
      .eq('user_id', userId)
      .eq('used_date', today);

    if (error && error.code !== 'PGRST116') {
      console.error('사용한 유료 배열 조회 오류:', error);
      return null;
    }

    return (data && data.length > 0) ? data[0].spread_id : null;
  } catch (error) {
    console.error('사용한 유료 배열 조회 중 오류:', error);
    return null;
  }
}

/**
 * 특정 스프레드의 오늘 사용 횟수 가져오기 (디버그용)
 */
export async function getPremiumSpreadUsageToday(spreadId: string): Promise<number> {
  console.log('📊 [getPremiumSpreadUsageToday] 호출됨:', spreadId);
  try {
    const userId = await getCurrentUserId();
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email;
    console.log('📊 [getPremiumSpreadUsageToday] userId:', userId, 'email:', userEmail);
    
    // 테스트 계정은 항상 0 반환 (제한 없음)
    if (userEmail === 'test@example.com') {
      console.log('📊 [getPremiumSpreadUsageToday] 테스트 계정 - 0 반환');
      return 0;
    }
    
    if (!userId) {
      console.log('📊 [getPremiumSpreadUsageToday] userId 없음 - 0 반환');
      return 0;
    }

    const today = getCurrentDate();
    console.log('📊 [getPremiumSpreadUsageToday] today:', today);
    
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('id')
      .eq('user_id', userId)
      .eq('spread_id', spreadId)
      .eq('used_date', today);

    console.log('📊 [getPremiumSpreadUsageToday] DB 결과:', { data, error });

    if (error && error.code !== 'PGRST116') {
      console.error('📊 [getPremiumSpreadUsageToday] 오류:', error);
      return 0;
    }

    const count = data ? data.length : 0;
    console.log('📊 [getPremiumSpreadUsageToday] 사용 횟수:', count);
    return count;
  } catch (error) {
    console.error('📊 [getPremiumSpreadUsageToday] 예외 발생:', error);
    return 0;
  }
}

/**
 * 무료 사용자를 위한 안내 메시지 생성
 */
export async function getFreeUserMessage(): Promise<string> {
  const hasUsed = await hasUsedPremiumSpreadToday();
  
  if (hasUsed) {
    const usedSpread = await getUsedPremiumSpreadToday();
    const spreadName = getSpreadDisplayName(usedSpread);
    return `오늘의 무료 유료 배열을 이미 사용하셨습니다. (${spreadName})\n내일 다시 이용하시거나 프리미엄으로 업그레이드하세요.`;
  }
  
  return '유료 배열(켈틱 크로스, 세븐스타, 컵 오브 릴레이션쉽)은 하루 1회 무료로 이용 가능합니다.';
}

/**
 * 스프레드 ID를 표시 이름으로 변환
 */
function getSpreadDisplayName(spreadId: string | null): string {
  const spreadNames: Record<string, string> = {
    'celtic_cross': '켈틱 크로스',
    'seven_star': '세븐스타',
    'cup_of_relationship': '컵 오브 릴레이션쉽'
  };
  
  return spreadId ? (spreadNames[spreadId] || spreadId) : '';
}

/**
 * 남은 시간 계산 (자정까지)
 */
export function getTimeUntilReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}
