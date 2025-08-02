import { AIInterpretationService } from './AIInterpretationService';
import { customInterpretationService } from './customInterpretationService';

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
  
  if (customQuestion) {
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
