import { AIInterpretationService } from './AIInterpretationService';
import { customInterpretationService } from './customInterpretationService';
// SevenStarInterpreter와 CupOfRelationshipInterpreter는 CardDrawing.vue에서 직접 사용

export interface InterpretationRequest {
  reading: any;
  customQuestion?: string;
  isPremium: boolean;
  getPositionName: (spreadId: string, index: number) => string;
  userId?: string;
}

// 켈틱 크로스 포지션 이름
const CELTIC_CROSS_POSITIONS = [
  '현재내면',
  '현재외부', 
  '근본',
  '과거',
  '드러나는 모습',
  '미래',
  '내가보는나',
  '남이보는나',
  '예상하는 결과',
  '실제 결과'
];

/**
 * AI 해석 생성을 위한 헬퍼 함수
 */
export const generateAIInterpretation = async (request: InterpretationRequest) => {
  const { reading, customQuestion, isPremium, getPositionName, userId } = request;
  const aiService = new AIInterpretationService(isPremium);
  
  // 세븐 스타와 컵 오브 릴레이션십은 CardDrawing.vue에서 직접 Interpreter를 사용하므로
  // 여기서는 처리하지 않음 (중복 호출 방지)
  if (reading.spreadId === 'seven_star' || reading.spreadId === 'cup_of_relationship') {
    console.log('[aiInterpretationHelper] 세븐스타/컵오브릴레이션십은 CardDrawing.vue에서 직접 처리');
    return {
      success: false,
      interpretation: '특별 배열법은 별도 처리됩니다.',
      interpretationId: null
    };
  }
  
  // customQuestion이 실제로 있는 경우에만 customInterpretationService 사용
  // 빈 문자열이나 공백만 있는 경우는 제외
  const hasRealCustomQuestion = customQuestion && customQuestion.trim().length > 0;
  
  if (hasRealCustomQuestion) {
    // 커스텀 질문이 있는 경우
    const interpretationRequest = {
      readingId: reading.id,
      cards: reading.cards.map((card: any, index: number) => ({
        id: card.id,
        name: card.name || card.nameEn || '',
        nameKr: card.nameKr || card.name_kr || card.name || '',
        arcana: card.arcana || 'unknown',
        suit: card.suit || null,
        number: card.number || null,
        orientation: card.orientation || 'upright',
        position: {
          name: card.position?.name || getPositionName(reading.spreadId, index),
          description: card.position?.description || ''
        },
        meanings: card.meanings || {}
      })),
      spreadId: reading.spreadId,
      topic: reading.topic,
      customQuestion: customQuestion,
      userId: userId
    };
    
    return await customInterpretationService.generateInterpretation(interpretationRequest);
  } else {
    // 기본 해석
    const cardsForAI = reading.cards.map((card: any, index: number) => {
      // 켈틱 크로스의 경우 미리 정의된 포지션 이름 사용
      const positionName = reading.spreadId === 'celtic_cross' 
        ? (card.position?.name || CELTIC_CROSS_POSITIONS[index] || `위치 ${index + 1}`)
        : getPositionName(reading.spreadId, index);
      
      return {
        id: card.id,
        name: card.name || card.nameEn || '',
        name_kr: card.nameKr || card.name_kr || card.name || '',
        nameKr: card.nameKr || card.name_kr || card.name || '',
        arcana: card.arcana || 'unknown',
        suit: card.suit || null,
        number: card.number || null,
        orientation: card.orientation || 'upright',
        position: {
          position: index + 1,
          name: positionName
        }
      };
    });
    
    const result = await aiService.generateInterpretation(
      cardsForAI,
      reading.topic || 'general',
      reading.spreadId
    );
    
    return {
      success: result && result.text,
      interpretation: result?.text,
      interpretationId: result?.interpretationId
    };
  }
};
