import { invokeEdgeFunctionWithRetry, generateFallbackInterpretation } from '../patches/edge-function-helper';
import type { TarotCard, DailyInterpretation } from '../types/tarot';
import { supabase } from './supabase';
import { useUserStore } from '../store/user';

/**
 * 개선된 AI 해석 생성 서비스
 */
export async function generateInterpretationSafe(
  card: TarotCard,
  userId?: string
): Promise<DailyInterpretation> {
  try {
    console.log('🤖 AI 해석 생성 시작:', card.name_kr);
    
    // Edge Function 호출 (재시도 포함)
    const { data } = await invokeEdgeFunctionWithRetry(
      'generate-daily-interpretation',
      { 
        card,
        userId: userId || useUserStore().currentUser?.id 
      },
      {
        maxAttempts: 2,      // 최대 2번 시도
        retryDelay: 3000,    // 3초 대기 후 재시도
        timeout: 50000       // 50초 타임아웃
      }
    );

    // 응답 검증
    if (data?.interpretation) {
      console.log('✅ AI 해석 생성 성공');
      return data.interpretation;
    }

    // 응답이 없으면 기본 해석 사용
    console.warn('⚠️ AI 응답이 비어있음, 기본 해석 사용');
    return generateFallbackInterpretation(card);

  } catch (error: any) {
    console.error('❌ AI 해석 생성 실패:', error);
    
    // 에러 타입에 따른 처리
    if (error.message?.includes('타임아웃')) {
      console.log('⏱️ 타임아웃 발생, 기본 해석으로 대체');
    } else if (error.message?.includes('네트워크')) {
      console.log('🌐 네트워크 오류, 기본 해석으로 대체');
    } else {
      console.log('🔧 일반 오류, 기본 해석으로 대체');
    }
    
    // 어떤 에러든 기본 해석 반환 (사용자 경험 우선)
    return generateFallbackInterpretation(card);
  }
}

/**
 * daily_cards 테이블에 해석 캐싱 (선택적)
 */
export async function cacheInterpretation(
  interpretation: DailyInterpretation,
  userId: string,
  date: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('daily_cards')
      .update({ interpretation_data: interpretation })
      .eq('user_id', userId)
      .eq('date', date);
    
    if (error) {
      console.warn('해석 캐싱 실패:', error);
      // 캐싱 실패는 무시 (중요하지 않음)
    } else {
      console.log('✅ 해석 캐싱 성공');
    }
  } catch (error) {
    console.warn('해석 캐싱 예외:', error);
    // 캐싱 실패는 무시
  }
}
