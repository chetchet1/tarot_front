import { supabase } from '../supabase';

const PREMIUM_SPREADS = ['celtic_cross', 'seven_star', 'cup_of_relationship'];
const TEST_ACCOUNT_EMAIL = 'test@example.com';

interface PremiumSpreadUsage {
  id?: string;
  user_id: string;
  spread_id: string;
  used_at: string;
  created_at?: string;
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
 * 특정 스프레드가 유료 배열인지 확인
 */
export function isPremiumSpread(spreadId: string): boolean {
  return PREMIUM_SPREADS.includes(spreadId);
}

/**
 * 사용자가 오늘 유료 배열을 사용했는지 확인
 */
export async function hasUsedPremiumSpreadToday(userId: string): Promise<boolean> {
  try {
    // userId가 없으면 false 반환
    if (!userId) {
      return false;
    }
    
    const today = getCurrentDate();
    
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('id, spread_id')
      .eq('user_id', userId)
      .gte('used_at', `${today}T00:00:00`)
      .lt('used_at', `${today}T23:59:59`)
      .maybeSingle(); // single() 대신 maybeSingle() 사용
    
    if (error) {
      // 406 에러는 무시하고 false 반환 (권한 없음)
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        console.warn('Premium spread usage check skipped - user might be anonymous');
        return false;
      }
      // 42P01 에러 (테이블 없음)도 무시
      if (error.code === '42P01') {
        console.warn('Premium spread usage table not found');
        return false;
      }
      console.error('Error checking premium spread usage:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking premium spread usage:', error);
    return false;
  }
}

/**
 * 오늘 사용한 유료 배열 정보 가져오기
 */
export async function getTodayUsedPremiumSpread(userId: string): Promise<string | null> {
  try {
    if (!userId) {
      return null;
    }
    
    const today = getCurrentDate();
    
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('spread_id')
      .eq('user_id', userId)
      .gte('used_at', `${today}T00:00:00`)
      .lt('used_at', `${today}T23:59:59`)
      .maybeSingle();
    
    if (error) {
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        return null;
      }
      // 42P01 에러 (테이블 없음)도 무시
      if (error.code === '42P01') {
        return null;
      }
      console.error('Error getting today used spread:', error);
      return null;
    }
    
    return data?.spread_id || null;
  } catch (error) {
    console.error('Error getting today used spread:', error);
    return null;
  }
}

/**
 * 무료 사용자가 유료 배열을 사용할 수 있는지 확인
 */
export async function canUsePremiumSpread(
  spreadId: string, 
  isPremiumUser: boolean, 
  userId: string,
  userEmail?: string
): Promise<boolean> {
  // 프리미엄 사용자는 항상 사용 가능
  if (isPremiumUser) {
    return true;
  }
  
  // 유료 배열이 아니면 사용 가능
  if (!isPremiumSpread(spreadId)) {
    return true;
  }
  
  // 테스트 계정은 항상 사용 가능
  if (userEmail === TEST_ACCOUNT_EMAIL) {
    return true;
  }
  
  // 오늘 이미 사용했으면 사용 불가
  const hasUsedToday = await hasUsedPremiumSpreadToday(userId);
  return !hasUsedToday;
}

/**
 * 유료 배열 사용 기록
 */
export async function recordPremiumSpreadUsage(
  spreadId: string, 
  userId: string,
  userEmail?: string
): Promise<void> {
  if (!isPremiumSpread(spreadId)) {
    return;
  }
  
  // userId가 없으면 기록하지 않음
  if (!userId) {
    console.warn('Cannot record premium spread usage without userId');
    return;
  }
  
  // 테스트 계정은 기록하지 않음
  if (userEmail === TEST_ACCOUNT_EMAIL) {
    console.log('Test account - skipping premium spread usage recording');
    return;
  }
  
  try {
    const now = new Date();
    const { error } = await supabase
      .from('premium_spread_usage')
      .insert({
        user_id: userId,
        spread_id: spreadId,
        used_at: now.toISOString()
      });
    
    if (error) {
      // 406 에러는 무시 (권한 없음)
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        console.warn('Cannot record premium spread usage - insufficient permissions');
        return;
      }
      // 42P01 에러 (테이블 없음)도 무시
      if (error.code === '42P01') {
        console.warn('Premium spread usage table not found');
        return;
      }
      console.error('Error recording premium spread usage:', error);
    }
  } catch (error) {
    console.error('Error recording premium spread usage:', error);
  }
}

/**
 * 무료 사용자를 위한 안내 메시지 생성
 */
export async function getFreeUserMessage(userId: string): Promise<string> {
  const hasUsedToday = await hasUsedPremiumSpreadToday(userId);
  
  if (hasUsedToday) {
    const usedSpread = await getTodayUsedPremiumSpread(userId);
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

/**
 * 테스트 계정인지 확인
 */
export function isTestAccount(email?: string): boolean {
  return email === TEST_ACCOUNT_EMAIL;
}
