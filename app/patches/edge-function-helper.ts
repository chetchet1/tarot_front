import { supabase } from '../services/supabase';

interface RetryOptions {
  maxAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Edge Function 호출 헬퍼 (재시도 로직 포함)
 */
export async function invokeEdgeFunctionWithRetry(
  functionName: string,
  body: any,
  options: RetryOptions = {}
): Promise<any> {
  const {
    maxAttempts = 3,
    retryDelay = 2000,
    timeout = 55000 // 55초 (Edge Function 타임아웃보다 약간 짧게)
  } = options;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 Edge Function "${functionName}" 호출 시도 ${attempt}/${maxAttempts}`);
      
      // 타임아웃 Promise 생성
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Edge Function 타임아웃 (${timeout/1000}초)`));
        }, timeout);
      });

      // Edge Function 호출 Promise
      const functionPromise = supabase.functions.invoke(functionName, { body });

      // 타임아웃과 함께 실행
      const result = await Promise.race([functionPromise, timeoutPromise]);
      
      // 에러 체크
      if ((result as any).error) {
        throw (result as any).error;
      }

      console.log(`✅ Edge Function "${functionName}" 호출 성공`);
      return result;

    } catch (error: any) {
      lastError = error;
      console.error(`❌ Edge Function "${functionName}" 호출 실패 (시도 ${attempt}/${maxAttempts}):`, error);

      // 특정 에러는 재시도하지 않음
      if (error.message?.includes('Invalid') || 
          error.message?.includes('not found') ||
          error.message?.includes('Unauthorized')) {
        console.log('재시도 불가능한 에러, 중단');
        break;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < maxAttempts) {
        console.log(`⏳ ${retryDelay/1000}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // 모든 시도 실패
  console.error('🚫 Edge Function 호출 최종 실패');
  throw lastError || new Error('Edge Function 호출 실패');
}

/**
 * 기본 해석 생성 헬퍼
 */
export function generateFallbackInterpretation(card: any): any {
  const cardNumber = card.number || 0;
  const isDay = cardNumber % 2 === 0;
  const fortuneBase = 3 + (cardNumber % 3);
  
  return {
    fortuneIndex: {
      overall: Math.min(5, fortuneBase),
      love: Math.min(5, fortuneBase + (isDay ? 1 : -1)),
      money: Math.min(5, fortuneBase - 1),
      health: Math.min(5, fortuneBase + 1),
      work: Math.min(5, fortuneBase)
    },
    timeAdvice: {
      morning: isDay ? "활기찬 아침을 시작하세요." : "차분한 마음으로 하루를 시작하세요.",
      afternoon: "집중력이 높아지는 시간입니다.",
      evening: isDay ? "편안한 휴식을 취하세요." : "내일을 위한 준비를 하세요."
    },
    luckyItems: {
      color: ["빨강", "파랑", "노랑", "초록", "보라"][cardNumber % 5],
      number: ((cardNumber % 9) + 1).toString(),
      direction: ["동", "서", "남", "북"][cardNumber % 4] + "쪽",
      activity: isDay ? "가벼운 운동" : "독서나 명상"
    },
    relationshipAdvice: {
      tip: `${card.name_kr}의 에너지를 활용해 소통하세요.`,
      avoid: "성급한 판단이나 결정",
      goodMeet: "진실된 마음을 가진 사람"
    },
    dailyQuote: `${card.name_kr}가 전하는 메시지를 마음에 새기세요.`,
    detailedFortune: {
      mainMessage: `오늘 ${card.name_kr} 카드는 당신에게 특별한 메시지를 전합니다. 이 카드가 나타내는 에너지와 의미를 잘 이해하고 활용한다면, 오늘 하루가 더욱 의미 있고 풍요로워질 것입니다. 카드의 상징과 메시지에 귀 기울이며, 긍정적인 마음가짐으로 하루를 보내세요.`,
      keyPoint: `${card.name_kr}의 핵심은 ${card.arcana === 'major' ? '큰 변화와 성장의 기회' : '일상 속 작은 신호들'}를 놓치지 않는 것입니다. 오늘은 특별히 주의 깊게 주변을 관찰하세요.`,
      caution: `과도한 기대나 성급한 판단은 피하는 것이 좋습니다. ${card.name_kr}의 에너지가 강한 날이므로, 균형을 유지하려 노력하세요.`,
      luckyMoment: `오늘의 행운은 예상치 못한 순간에 찾아올 것입니다. 열린 마음으로 모든 가능성을 받아들이세요.`,
      advice: `${card.name_kr}의 지혜를 따라 오늘 하루를 보내세요. 작은 신호들을 놓치지 말고, 직관을 믿으며, 긍정적인 마음가짐을 유지한다면 좋은 결과가 있을 것입니다.`
    }
  };
}
