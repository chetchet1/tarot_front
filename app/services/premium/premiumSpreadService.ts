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
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간 기준)
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 로컬 시간을 ISO 문자열로 변환 (시간대 보정)
 */
function getLocalISOString(date: Date): string {
  // 로컬 시간대 오프셋 가져오기 (분 단위)
  const offset = date.getTimezoneOffset();
  // 로컬 시간으로 조정된 Date 객체 생성
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  // ISO 형식으로 변환하되 Z를 제거하여 로컬 시간처럼 처리
  return localDate.toISOString().replace('Z', '');
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
  console.log('🔍 [DB] hasUsedPremiumSpreadToday 체크 시작:', userId);
  console.log('🔍 [DB] 호출 시간:', new Date().toISOString());
  
  try {
    // userId가 없으면 false 반환
    if (!userId) {
      console.log('🔍 [DB] userId 없음 - false 반환');
      return false;
    }
    
    const today = getCurrentDate();
    const now = new Date();
    
    // 로컬 시간 기준 오늘의 시작과 끝을 구한 후 UTC로 변환
    const localStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const localEndOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // UTC 시간으로 변환
    const utcStart = localStartOfDay.toISOString();
    const utcEnd = localEndOfDay.toISOString();
    
    console.log('🔍 [DB] 오늘 날짜:', today);
    console.log('🔍 [DB] 조회 범위 (UTC):', {
      utcStart: utcStart,
      utcEnd: utcEnd,
      localStart: localStartOfDay.toLocaleString(),
      localEnd: localEndOfDay.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // UTC 시간으로 조회
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('id, spread_id, used_at')
      .eq('user_id', userId)
      .gte('used_at', utcStart)
      .lte('used_at', utcEnd)
      .maybeSingle();
    
    if (error) {
      // 406 에러는 무시하고 false 반환 (권한 없음)
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        console.warn('🔍 [DB] Premium spread usage check skipped - user might be anonymous');
        return false;
      }
      // 42P01 에러 (테이블 없음)도 무시
      if (error.code === '42P01') {
        console.warn('🔍 [DB] Premium spread usage table not found');
        return false;
      }
      console.error('🔍 [DB] Error checking premium spread usage:', error);
      return false;
    }
    
    const result = !!data;
    console.log('🔍 [DB] 조회 결과:', {
      found: result,
      spread: data?.spread_id,
      usedAt: data?.used_at,
      currentTime: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('🔍 [DB] Error checking premium spread usage:', error);
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
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // UTC로 통일
    const utcStart = startOfDay.toISOString();
    const utcEnd = endOfDay.toISOString();
    
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .select('spread_id')
      .eq('user_id', userId)
      .gte('used_at', utcStart)
      .lte('used_at', utcEnd)
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
  console.log('📝 [DB] recordPremiumSpreadUsage 시작:', { spreadId, userId, userEmail });
  
  if (!isPremiumSpread(spreadId)) {
    console.log('📝 [DB] 유료 배열이 아님 - 기록 건너뜀');
    return;
  }
  
  // userId가 없으면 기록하지 않음
  if (!userId) {
    console.warn('📝 [DB] Cannot record premium spread usage without userId');
    return;
  }
  
  // 테스트 계정은 기록하지 않음
  if (userEmail === TEST_ACCOUNT_EMAIL) {
    console.log('📝 [DB] Test account - skipping premium spread usage recording');
    return;
  }
  
  try {
    const now = new Date();
    // UTC로 통일하여 저장
    const utcISOString = now.toISOString();
    
    console.log('📝 [DB] DB에 저장 시도:', {
      user_id: userId,
      spread_id: spreadId,
      used_at: utcISOString,
      local_time: now.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    const { data, error } = await supabase
      .from('premium_spread_usage')
      .insert({
        user_id: userId,
        spread_id: spreadId,
        used_at: utcISOString  // UTC로 저장
      })
      .select();
    
    if (error) {
      // 406 에러는 무시 (권한 없음)
      if (error.code === '406' || error.message?.includes('Not Acceptable')) {
        console.warn('📝 [DB] Cannot record premium spread usage - insufficient permissions');
        return;
      }
      // 42P01 에러 (테이블 없음)도 무시
      if (error.code === '42P01') {
        console.warn('📝 [DB] Premium spread usage table not found');
        return;
      }
      console.error('📝 [DB] Error recording premium spread usage:', error);
    } else {
      console.log('📝 [DB] 저장 성공!', data);
      
      // 저장 후 즉시 확인
      console.log('🔍 [DB] 저장 확인을 위해 다시 조회...');
      const verifyResult = await hasUsedPremiumSpreadToday(userId);
      console.log('✅ [DB] 저장 후 확인 결과:', verifyResult ? '성공적으로 저장됨' : '⚠️ 저장 확인 실패');
    }
  } catch (error) {
    console.error('📝 [DB] Error recording premium spread usage:', error);
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
