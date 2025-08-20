import { supabase } from './supabase';
import type { TarotCard, DailyInterpretation } from '../types/tarot';

/**
 * 타로 해석 서비스
 * AI 해석 생성 및 기본 해석 생성을 담당
 */
export class TarotInterpretationService {
  /**
   * AI 해석 생성
   * @param card 타로 카드
   * @param userId 사용자 ID
   * @returns 해석 결과 또는 null (실패 시)
   */
  static async generateAIInterpretation(card: TarotCard, userId?: string): Promise<DailyInterpretation | null> {
    try {
      // 카드가 없으면 에러 처리
      if (!card) {
        console.error('generateAIInterpretation: 카드 정보가 없습니다');
        return null;
      }
      
      // Edge Function 호출하여 OpenAI 해석 생성
      const { data, error } = await supabase.functions.invoke('generate-daily-interpretation', {
        body: { 
          card,
          userId 
        }
      });

      if (error) {
        console.error('Edge Function 호출 에러:', error);
        return null;
      }

      // 응답 데이터 검증
      if (data && data.interpretation) {
        return data.interpretation;
      } else if (data && data.error) {
        // Edge Function이 에러를 반환했지만 기본 해석도 포함한 경우
        return data.interpretation || null;
      } else {
        // 예상치 못한 응답 형식
        return null;
      }

    } catch (error) {
      console.error('AI 해석 생성 실패:', error);
      return null;
    }
  }

  /**
   * 기본 해석 생성 (API 실패 시 백업용)
   * @param card 타로 카드
   * @returns 기본 해석
   */
  static generateDefaultInterpretation(card: TarotCard): DailyInterpretation {
    // 카드가 없으면 에러
    if (!card) {
      console.error('generateDefaultInterpretation: 카드 정보가 없습니다');
      throw new Error('카드 정보가 필요합니다');
    }
    
    // 메이저 아르카나와 마이너 아르카나 구분
    const isMajor = card.arcana === 'major';
    
    // 기본 운세 지수 생성 (카드 번호와 아르카나를 기반으로)
    const baseValue = isMajor ? 4 : 3;
    const variation = ((card.id || 0) % 3) - 1; // -1, 0, 1 변동
    
    // 카드 슈트별 특성 반영
    const suitCharacteristics: Record<string, any> = {
      'wands': { color: '빨간색', direction: '남쪽', element: '불' },
      'cups': { color: '파란색', direction: '서쪽', element: '물' },
      'swords': { color: '노란색', direction: '동쪽', element: '공기' },
      'pentacles': { color: '초록색', direction: '북쪽', element: '땅' },
      'major': { color: '보라색', direction: '중앙', element: '영혼' }
    };
    
    // suit가 있으면 사용, 없으면 major 기본값 사용
    const suitKey = card.suit ? card.suit.toLowerCase() : 'major';
    const suitInfo = suitCharacteristics[suitKey] || suitCharacteristics['major'];
    
    // 카드 번호에 따른 메시지 변화
    const numberMessages: Record<number, string> = {
      0: '새로운 시작과 무한한 가능성',
      1: '시작과 잠재력의 발현',
      2: '균형과 선택의 시간',
      3: '성장과 창조의 에너지',
      4: '안정과 기반 구축',
      5: '변화와 도전의 순간',
      6: '조화와 성공의 기운',
      7: '내면의 성찰과 극복',
      8: '힘과 움직임의 조화',
      9: '완성에 가까운 단계',
      10: '완성과 새로운 순환'
    };
    
    const cardNumber = card.number || 0;
    const numberMessage = numberMessages[cardNumber % 11] || '특별한 의미의 시간';
    
    // 카드별 상세 메시지 생성
    const detailedMessages: Record<string, string> = {
      'major': `메이저 아르카나 카드는 인생의 중요한 전환점과 영적 성장을 나타냅니다. 오늘은 평소보다 더 큰 관점에서 상황을 바라보고, 내면의 목소리에 귀를 기울이는 것이 중요합니다. 우주의 에너지가 당신을 특별히 보호하고 인도하는 날이니, 직관을 믿고 과감한 결정을 내려보세요.`,
      'wands': `불의 에너지를 담은 Wands는 열정과 창조력, 그리고 새로운 시작을 상징합니다. 오늘은 당신의 내면에 타오르는 열정을 행동으로 옮기기에 최적의 시기입니다. 머릿속에만 있던 아이디어를 실현시키고, 미루어왔던 프로젝트를 시작해보세요. 당신의 열정이 주변 사람들에게도 긍정적인 영향을 미칠 것입니다.`,
      'cups': `물의 에너지를 담은 Cups는 감정과 직관, 그리고 인간관계를 상징합니다. 오늘은 논리보다는 감정에 충실하고, 주변 사람들과의 정서적 교류에 집중하세요. 사랑하는 사람들과 깊은 대화를 나누거나, 예술적 활동을 통해 감정을 표현해보는 것도 좋습니다. 당신의 공감 능력이 빛을 발하는 날입니다.`,
      'swords': `공기의 에너지를 담은 Swords는 지성과 소통, 그리고 명확한 사고를 상징합니다. 오늘은 복잡한 문제를 해결하거나 중요한 결정을 내리기에 좋은 날입니다. 논리적 사고와 분석력이 뛰어난 시기이니, 계획을 세우거나 전략을 수립하는 데 시간을 투자하세요. 명확한 의사소통으로 오해를 풀 수 있는 기회도 있을 것입니다.`,
      'pentacles': `땅의 에너지를 담은 Pentacles는 물질적 안정과 실용성, 그리고 꾸준한 노력을 상징합니다. 오늘은 현실적인 목표에 집중하고, 실질적인 성과를 만들어내기에 좋은 날입니다. 재정 계획을 세우거나, 건강 관리를 시작하거나, 장기적인 투자를 고려해보세요. 당신의 노력이 구체적인 결실로 이어질 것입니다.`
    };
    
    const suitMessage = detailedMessages[suitKey] || detailedMessages['major'];
    
    return {
      fortuneIndex: {
        overall: Math.max(1, Math.min(5, baseValue + variation)),
        love: Math.max(1, Math.min(5, baseValue + ((card.id || 0) % 2))),
        money: Math.max(1, Math.min(5, baseValue - ((card.id || 0) % 2))),
        health: Math.max(1, Math.min(5, baseValue)),
        work: Math.max(1, Math.min(5, baseValue + (isMajor ? 1 : 0)))
      },
      timeAdvice: {
        morning: `${card.name_kr} 카드의 에너지로 하루를 시작하세요`,
        afternoon: `${numberMessage}을 염두에 두고 행동하세요`,
        evening: `오늘 하루를 되돌아보며 내일을 준비하세요`
      },
      luckyItems: {
        color: suitInfo.color,
        number: String((cardNumber || 7) % 10 || 10),
        direction: suitInfo.direction,
        activity: isMajor ? '명상과 성찰' : '일상의 작은 변화'
      },
      relationshipAdvice: {
        tip: `${card.name_kr}의 에너지를 활용해 소통하세요`,
        avoid: '성급한 판단과 오해는 피하세요',
        goodMeet: `${suitInfo.element}의 기운을 가진 사람`
      },
      dailyQuote: `"${card.name_kr}"가 전하는 메시지: ${numberMessage}의 시간입니다`,
      detailedFortune: {
        mainMessage: `오늘 당신에게 찾아온 ${card.name_kr} 카드는 ${numberMessage}을 상징합니다. ${suitMessage} 카드가 전하는 메시지에 귀를 기울이고, ${suitInfo.element}의 에너지를 적극적으로 활용한다면 오늘 하루가 더욱 의미 있고 풍성해질 것입니다. 우주는 항상 당신 편이며, 모든 일이 결국 당신에게 최선의 결과로 이어질 것임을 기억하세요.`,
        keyPoint: `${card.name_kr}의 핵심은 ${isMajor ? '큰 변화와 성장의 기회를 놓치지 않는 것' : '일상 속 작은 신호들을 놓치지 않고 섬세하게 관찰하는 것'}입니다. 특히 오늘은 ${numberMessage}와 관련된 상황이 발생할 수 있으니 주의 깊게 살펴보세요.`,
        caution: `과도한 기대나 성급한 판단은 피하는 것이 좋습니다. ${suitInfo.element}의 에너지가 강한 날이므로, 그 반대 성향의 에너지와 충돌할 수 있습니다. 균형을 유지하려 노력하세요.`,
        luckyMoment: `${suitInfo.direction} 방향을 바라보거나 그 방향으로 이동할 때, ${suitInfo.color}을 착용하거나 주변에서 발견할 때 행운의 순간이 찾아올 것입니다. 특히 ${cardNumber}와 관련된 시간대에 주목하세요.`,
        advice: `오늘은 ${card.name_kr}의 지혜를 따라 ${numberMessage}에 집중하는 하루를 보내세요. ${suitInfo.element}의 기운이 당신을 보호하고 인도할 것입니다. 작은 신호들을 놓치지 말고, 직관을 믿으며, 긍정적인 마음가짐을 유지한다면 예상치 못한 행운이 찾아올 수 있습니다. 우주의 메시지는 때로 예상치 못한 방식으로 전달되니, 열린 마음으로 하루를 맞이하세요.`
      }
    };
  }

  /**
   * daily_cards 테이블에 해석 데이터 저장
   * @param interpretationData 해석 데이터
   * @param userId 사용자 ID
   * @returns 저장 성공 여부
   */
  static async saveDailyCardInterpretation(interpretationData: DailyInterpretation, userId: string): Promise<boolean> {
    if (!userId) {
      return false;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('daily_cards')
        .update({ interpretation_data: interpretationData })
        .eq('user_id', userId)
        .eq('date', today);
      
      if (error) {
        console.error('interpretation_data 저장 실패:', error);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('saveDailyCardInterpretation 예외:', error);
      return false;
    }
  }

  /**
   * AI 해석 생성 (AI 실패 시 기본 해석으로 대체)
   * @param card 타로 카드
   * @param userId 사용자 ID (옵션)
   * @returns 해석 결과
   */
  static async generateInterpretation(card: TarotCard, userId?: string): Promise<DailyInterpretation> {
    try {
      // AI 해석 시도
      const aiInterpretation = await this.generateAIInterpretation(card, userId);
      
      if (aiInterpretation) {
        // AI 해석이 성공하면 DB에 저장하고 반환
        if (userId) {
          await this.saveDailyCardInterpretation(aiInterpretation, userId);
        }
        return aiInterpretation;
      } else {
        // AI 해석 실패 시 기본 해석 사용
        const defaultInterpretation = this.generateDefaultInterpretation(card);
        
        // 기본 해석도 DB에 저장
        if (userId) {
          await this.saveDailyCardInterpretation(defaultInterpretation, userId);
        }
        
        return defaultInterpretation;
      }
    } catch (error) {
      console.error('해석 생성 실패:', error);
      
      // 실패 시 기본 해석 사용
      const defaultInterpretation = this.generateDefaultInterpretation(card);
      
      // 기본 해석 저장
      if (userId) {
        await this.saveDailyCardInterpretation(defaultInterpretation, userId);
      }
      
      return defaultInterpretation;
    }
  }
}