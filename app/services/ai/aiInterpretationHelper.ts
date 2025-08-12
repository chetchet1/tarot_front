import { AIInterpretationService } from './AIInterpretationService';
import { customInterpretationService } from './customInterpretationService';
import { EnhancedSevenStarInterpreter } from '../../utils/interpreters/EnhancedSevenStarInterpreter';
import { EnhancedCupOfRelationshipInterpreter } from '../../utils/interpreters/EnhancedCupOfRelationshipInterpreter';

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
  
  // 세븐 스타와 컵 오브 릴레이션십은 Enhanced Interpreter 사용
  if (reading.spreadId === 'seven_star') {
    const interpreter = new EnhancedSevenStarInterpreter();
    
    // 카드 데이터 준비
    const cardsForAI = reading.cards.map((card: any, index: number) => {
      const sevenStarPositions = [
        '핵심', '도움', '내면', '예상', '결과', '외부', '운명'
      ];
      const positionName = sevenStarPositions[index] || `위치 ${index + 1}`;
      
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
        },
        meanings: card.meanings || {}
      };
    });
    
    // 구조화된 프롬프트 생성
    const structuredPrompt = interpreter.generateStructuredPromptForAI(
      cardsForAI,
      reading.topic || 'general',
      customQuestion
    );
    
    // AI 서비스 호출 (구조화된 프롬프트 사용)
    const result = await aiService.generateInterpretationWithPrompt(
      structuredPrompt,
      cardsForAI,
      reading.topic || 'general',
      reading.spreadId
    );
    
    // 응답 검증
    if (result && result.text) {
      const validatedResponse = interpreter.validateAIResponse(result.text);
      return {
        success: true,
        interpretation: validatedResponse,
        interpretationId: result?.interpretationId
      };
    }
    
    return {
      success: false,
      interpretation: '해석을 생성할 수 없습니다. 다시 시도해주세요.',
      interpretationId: null
    };
  }
  
  if (reading.spreadId === 'cup_of_relationship') {
    const interpreter = new EnhancedCupOfRelationshipInterpreter();
    
    // 카드 데이터 준비
    const cardsForAI = reading.cards.map((card: any, index: number) => {
      const cupPositions = [
        '나', '상대', '관계 기본', '관계 과거',
        '현재 느낌', '현재 외부 상황',
        '현재 나는 어떻게 생각?', '현재 상대는 어떻게 생각?',
        '미래 나는 어떻게 생각?', '미래 상대는 어떻게 생각?',
        '결과'
      ];
      const positionName = cupPositions[index] || `위치 ${index + 1}`;
      
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
        },
        meanings: card.meanings || {}
      };
    });
    
    // 구조화된 프롬프트 생성
    const structuredPrompt = interpreter.generateStructuredPromptForAI(
      cardsForAI,
      reading.topic || 'general',
      customQuestion
    );
    
    // AI 서비스 호출 (구조화된 프롬프트 사용)
    const result = await aiService.generateInterpretationWithPrompt(
      structuredPrompt,
      cardsForAI,
      reading.topic || 'general',
      reading.spreadId
    );
    
    // 응답 검증
    if (result && result.text) {
      const validatedResponse = interpreter.validateAIResponse(result.text);
      return {
        success: true,
        interpretation: validatedResponse,
        interpretationId: result?.interpretationId
      };
    }
    
    return {
      success: false,
      interpretation: '해석을 생성할 수 없습니다. 다시 시도해주세요.',
      interpretationId: null
    };
  }
  
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
