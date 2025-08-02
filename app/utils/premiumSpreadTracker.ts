/**
 * 무료 사용자의 유료 배열 사용을 추적하는 유틸리티
 */

const STORAGE_KEY = 'tarot_premium_spread_usage';
const PREMIUM_SPREADS = ['celtic_cross', 'seven_star', 'cup_of_relationship'];

export interface PremiumSpreadUsage {
  date: string; // YYYY-MM-DD 형식
  usedSpread?: string; // 사용한 유료 배열 ID
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
 * 저장된 사용 정보 가져오기
 */
function getUsageData(): PremiumSpreadUsage | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const usage = JSON.parse(data) as PremiumSpreadUsage;
    
    // 날짜가 오늘과 다르면 초기화
    if (usage.date !== getCurrentDate()) {
      return null;
    }
    
    return usage;
  } catch (error) {
    console.error('Error reading premium spread usage:', error);
    return null;
  }
}

/**
 * 사용 정보 저장
 */
function saveUsageData(spreadId: string): void {
  const usage: PremiumSpreadUsage = {
    date: getCurrentDate(),
    usedSpread: spreadId
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('Error saving premium spread usage:', error);
  }
}

/**
 * 오늘 유료 배열을 사용했는지 확인
 */
export function hasUsedPremiumSpreadToday(): boolean {
  const usage = getUsageData();
  return usage !== null && usage.usedSpread !== undefined;
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
export function canUsePremiumSpread(spreadId: string, isPremiumUser: boolean): boolean {
  // 프리미엄 사용자는 항상 사용 가능
  if (isPremiumUser) {
    return true;
  }
  
  // 유료 배열이 아니면 사용 가능
  if (!isPremiumSpread(spreadId)) {
    return true;
  }
  
  // 오늘 이미 사용했으면 사용 불가
  return !hasUsedPremiumSpreadToday();
}

/**
 * 유료 배열 사용 기록
 */
export function recordPremiumSpreadUsage(spreadId: string): void {
  if (isPremiumSpread(spreadId)) {
    saveUsageData(spreadId);
  }
}

/**
 * 오늘 사용한 유료 배열 ID 가져오기
 */
export function getUsedPremiumSpreadToday(): string | null {
  const usage = getUsageData();
  return usage?.usedSpread || null;
}

/**
 * 무료 사용자를 위한 안내 메시지 생성
 */
export function getFreeUserMessage(): string {
  if (hasUsedPremiumSpreadToday()) {
    const usedSpread = getUsedPremiumSpreadToday();
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
