import { supabase } from '../supabase';
import { logger } from '../debugLogger';

export interface AIInterpretationRequest {
  card?: any;
  position?: any;
  topic: string;
  spreadType: string;
  allCards?: any[];
  interpretationType: 'single' | 'overall';
}

export class AIInterpretationService {
  private isPremium: boolean;
  private cache: Map<string, { interpretation: string; timestamp: number }> = new Map();
  private CACHE_DURATION = 1000 * 60 * 60; // 1시간
  
  constructor(isPremium: boolean) {
    this.isPremium = isPremium;
  }
  
  // 단일 카드 해석
  async getSingleCardInterpretation(
    card: any,
    position: any,
    topic: string,
    spreadType: string,
    allCards: any[]
  ): Promise<string> {
    if (!this.isPremium) {
      // 무료 사용자는 기본 템플릿 해석 반환
      return this.getTemplateInterpretation(card, position, topic);
    }
    
    // 캐시 확인
    const cacheKey = this.generateCacheKey({
      card,
      position,
      topic,
      spreadType,
      interpretationType: 'single'
    });
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Supabase Edge Function 호출
      console.log('🚀 [generateInterpretation] Edge Function 호출 시작:', {
        cardsCount: cards.length,
        topic,
        spreadType,
        isPremium: this.isPremium
      });
      
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          card,
          position,
          topic,
          spreadType,
          allCards,
          userId: (await supabase.auth.getUser()).data.user?.id,
          isPremium: this.isPremium,
          interpretationType: 'single'
        }
      });
      
      if (error) throw error;
      
      // 마크다운 헤더(#, ##, ### 등) 모두 제거
      const interpretation = data.interpretation.replace(/#{1,6}\s*/g, '');
      this.setCache(cacheKey, interpretation);
      
      return interpretation;
    } catch (error) {
      console.error('AI 해석 실패:', error);
      // 폴백: 템플릿 해석 반환
      return this.getTemplateInterpretation(card, position, topic);
    }
  }
  
  // 전체 해석
  async getOverallInterpretation(
    cards: any[],
    topic: string,
    spreadType: string
  ): Promise<string> {
    if (!this.isPremium) {
      // 무료 사용자는 기본 템플릿 해석 반환
      return this.getTemplateOverallInterpretation(cards, topic, spreadType);
    }
    
    // 캐시 확인
    const cacheKey = this.generateCacheKey({
      allCards: cards,
      topic,
      spreadType,
      interpretationType: 'overall'
    });
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          allCards: cards,
          topic,
          spreadType,
          userId: (await supabase.auth.getUser()).data.user?.id,
          isPremium: this.isPremium,
          interpretationType: 'overall'
        }
      });
      
      if (error) throw error;
      
      // 마크다운 헤더(#, ##, ### 등) 모두 제거
      const interpretation = data.interpretation.replace(/#{1,6}\s*/g, '');
      this.setCache(cacheKey, interpretation);
      
      return interpretation;
    } catch (error) {
      console.error('AI 전체 해석 실패:', error);
      // 폴백: 템플릿 해석 반환
      return this.getTemplateOverallInterpretation(cards, topic, spreadType);
    }
  }
  
  /**
   * 구조화된 프롬프트를 사용한 AI 해석 생성
   */
  async generateInterpretationWithPrompt(
    structuredPrompt: string,
    cards: any[],
    topic: string,
    spreadType: string
  ): Promise<{ text: string; interpretationId?: string }> {
    try {
      console.log('🤖 [generateInterpretationWithPrompt] 시작');
      console.log('🤖 spreadType:', spreadType);
      console.log('🤖 cards count:', cards.length);
      
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          customPrompt: structuredPrompt,  // customPrompt로 변경
          cards: cards,  // allCards 대신 cards 사용
          topic,
          spreadType,
          userId: (await supabase.auth.getUser()).data.user?.id,
          isPremium: this.isPremium
        }
      });
      
      if (error) {
        console.error('🤖 Edge Function 오류:', error);
        throw error;
      }
      
      console.log('🤖 Edge Function 응답:', data);
      
      // 마크다운 헤더 제거
      const interpretation = data.interpretation?.replace(/#{1,6}\s*/g, '') || data.text || '';
      
      return {
        text: interpretation,
        interpretationId: data.interpretationId
      };
    } catch (error) {
      console.error('🤖 AI 해석 생성 실패:', error);
      
      // 폴백: 기본 해석 반환
      return {
        text: this.getTemplateOverallInterpretation(cards, topic, spreadType),
        interpretationId: undefined
      };
    }
  }
  
  // 캐시 키 생성
  private generateCacheKey(params: any): string {
    const parts = [];
    
    if (params.card) {
      parts.push(`card:${params.card.id}_${params.card.orientation}`);
    }
    if (params.position) {
      parts.push(`pos:${params.position.position}`);
    }
    if (params.allCards) {
      const cardKeys = params.allCards
        .map(c => `${c.id}_${c.orientation}_${c.position.position}`)
        .sort()
        .join('|');
      parts.push(`cards:${cardKeys}`);
    }
    parts.push(`topic:${params.topic}`);
    parts.push(`spread:${params.spreadType}`);
    parts.push(`type:${params.interpretationType}`);
    
    return parts.join('_');
  }
  
  // 캐시에서 가져오기
  private getFromCache(key: string): string | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.interpretation;
    }
    return null;
  }
  
  // 캐시에 저장
  private setCache(key: string, interpretation: string): void {
    this.cache.set(key, {
      interpretation,
      timestamp: Date.now()
    });
    
    // 캐시 크기 제한 (최대 100개)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  // 템플릿 기반 단일 카드 해석 (폴백)
  private getTemplateInterpretation(card: any, position: any, topic: string): string {
    const topicMessages = {
      love: {
        upright: '긍정적인 에너지가 사랑의 길을 밝혀주고 있습니다.',
        reversed: '관계에서 성찰과 인내가 필요한 시기입니다.'
      },
      career: {
        upright: '업무에서 좋은 성과와 발전이 예상됩니다.',
        reversed: '직업적 도전을 통해 성장할 기회가 있습니다.'
      },
      money: {
        upright: '재정적 안정과 풍요가 다가오고 있습니다.',
        reversed: '신중한 재정 관리가 필요한 시기입니다.'
      },
      general: {
        upright: '전반적으로 긍정적인 흐름이 이어지고 있습니다.',
        reversed: '내면의 성찰을 통해 새로운 방향을 찾을 시기입니다.'
      }
    };
    
    const message = topicMessages[topic]?.[card.orientation] || topicMessages.general[card.orientation];
    return `${position.name}에서 ${message}`;
  }
  
  // 켈틱 크로스 전체 해석
  async getInterpretation(
    spreadType: string,
    topic: string,
    cards: Array<{
      position: string;
      cardName: string;
      orientation: string;
    }>
  ): Promise<string> {
    if (!this.isPremium) {
      return this.getTemplateOverallInterpretation(cards as any[], topic, spreadType);
    }
    
    try {
      // Edge Function에 맞는 형식으로 카드 데이터 변환
      const formattedCards = cards.map((card, index) => ({
        id: index,
        name_kr: card.cardName,
        nameKr: card.cardName,
        orientation: card.orientation,
        position: {
          position: index + 1,
          name: card.position
        }
      }));
      
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          cards: formattedCards,
          topic,
          spreadType: 'celtic_cross',
          userId: (await supabase.auth.getUser()).data.user?.id,
          isPremium: this.isPremium
        }
      });
      
      if (error) throw error;
      
      // 마크다운 헤더(#, ##, ### 등) 모두 제거
      return data.interpretation.replace(/#{1,6}\s*/g, '');
    } catch (error) {
      console.error('AI 켈틱 크로스 해석 실패:', error);
      // 폴백: 템플릿 해석 반환
      return this.getCelticCrossTemplateInterpretation(cards, topic);
    }
  }
  
  // 켈틱 크로스 템플릿 해석
  private getCelticCrossTemplateInterpretation(
    cards: Array<{
      position: string;
      cardName: string;
      orientation: string;
    }>,
    topic: string
  ): string {
    const topicMessages = {
      '연애운': {
        intro: '사랑의 길에서',
        ending: '진실한 마음으로 접근하면 좋은 결과가 있을 것입니다.'
      },
      '직업운': {
        intro: '커리어의 길에서',
        ending: '꿒준한 노력과 전략적 사고가 성공의 열쇠입니다.'
      },
      '금전운': {
        intro: '재정적 경로에서',
        ending: '신중한 계획과 관리가 풍요를 가져다 줄 것입니다.'
      },
      '종합운': {
        intro: '삶의 여정에서',
        ending: '균형을 찾고 내면의 지혜를 발휘하면 좋은 결과가 있을 것입니다.'
      }
    };
    
    const message = topicMessages[topic] || topicMessages['종합운'];
    
    return `${message.intro} 현재 당신은 중요한 전환점에 서 있습니다.
    
현재 상황에서는 ${cards[0].cardName} 카드가 나타내듯이 내면의 에너지가 중요하게 작용하고 있습니다.

과거의 ${cards[3].cardName}에서 현재의 ${cards[0].cardName}로 이어지는 흐름은, 미래의 ${cards[5].cardName}로 향하고 있습니다.

${message.ending}`;
  }
  
  // 템플릿 기반 전체 해석 (폴백)
  private getTemplateOverallInterpretation(cards: any[], topic: string, spreadType: string): string {
    const uprightCount = cards.filter(c => c.orientation === 'upright').length;
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    
    let interpretation = '';
    
    // 전반적인 에너지
    if (uprightCount > cards.length / 2) {
      interpretation += '전반적으로 긍정적인 에너지가 우세한 시기입니다. ';
    } else {
      interpretation += '도전과 성장의 시기를 겪고 있습니다. ';
    }
    
    // 주제별 메시지
    const topicMessages = {
      love: '사랑에 있어서는 진실한 마음과 인내가 중요합니다.',
      career: '커리어에서는 꾸준한 노력과 전략적 사고가 필요합니다.',
      money: '재정적으로는 신중한 계획과 관리가 요구됩니다.',
      general: '삶의 다양한 영역에서 균형을 찾아가는 것이 중요합니다.'
    };
    
    interpretation += topicMessages[topic] || topicMessages.general;
    
    // 메이저 카드가 많을 때
    if (majorCount >= cards.length / 2) {
      interpretation += ' 특히 지금은 인생의 중요한 전환점에 있으니, 우주의 메시지에 귀 기울이세요.';
    }
    
    return interpretation;
  }
  
  // 평점 제출
  async submitRating(interpretationId: string, rating: number, editedInterpretation?: string): Promise<void> {
    try {
      console.log('평점 제출 시작:', { interpretationId, rating });
      
      // AI 해석 테이블에 직접 평점 업데이트
      const { data: updateData, error: updateError } = await supabase
        .from('ai_interpretations')
        .update({ 
          rating: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', interpretationId)
        .select();
      
      if (updateError) {
        console.error('평점 업데이트 오류:', updateError);
        
        // Edge Function으로 폴백
        const { data, error } = await supabase.functions.invoke('submit-feedback', {
          body: {
            interpretationId,
            rating,
            userId: (await supabase.auth.getUser()).data.user?.id,
            editedInterpretation
          }
        });
        
        if (error) throw error;
        console.log('Edge Function을 통한 평점 제출 성공:', data);
      } else {
        console.log('평점 업데이트 성공:', updateData);
      }
    } catch (error) {
      console.error('평점 제출 실패:', error);
      throw error;
    }
  }

  
  // AI 해석 생성 메서드 (스트리밍 방식)
  async generateInterpretation(
    cards: any[],
    topic: string,
    spreadType: string
  ): Promise<{ text: string; interpretationId?: string }> {
    try {
      // 캐시 확인
      const cacheKey = this.generateCacheKey({
        allCards: cards,
        topic,
        spreadType,
        interpretationType: 'overall'
      });

      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { text: cached };
      }

      logger.log(`Edge Function 스트리밍 호출: cards=${cards.length}, topic=${topic}, spread=${spreadType}`);

      // 스트리밍 fetch 호출 (180초 타임아웃)
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yxywzsmggvxxujuplyly.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/generate-interpretation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify({
              cards,
              topic,
              spreadType,
              userId: (await supabase.auth.getUser()).data.user?.id,
              isPremium: this.isPremium
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          logger.log('Edge Function HTTP 에러: ' + response.status);
          throw new Error('Edge Function 오류: ' + response.status);
        }

        // 스트리밍 응답 수신
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let interpretation = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const cleanChunk = chunk.replace(/\n?\[DONE\]\n?/g, '');
          if (cleanChunk) {
            interpretation += cleanChunk;
          }
        }

        logger.log('스트리밍 수신 완료: ' + interpretation.length + '자');

        // 마크다운 헤더(#, ##, ### 등) 모두 제거
        interpretation = interpretation.replace(/#{1,6}\s*/g, '');
        this.setCache(cacheKey, interpretation);

        return { text: interpretation };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('AI 해석 생성 실패:', error);
      const premiumSpreads = ['celtic_cross', 'seven_star', 'cup_of_relationship'];
      if (premiumSpreads.includes(spreadType)) {
        throw error;
      }
      return {
        text: this.getTemplateOverallInterpretation(cards, topic, spreadType)
      };
    }
  }
}
