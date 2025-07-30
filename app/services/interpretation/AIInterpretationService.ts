import { supabase } from '@/lib/supabase';

interface Card {
  id: number;
  name: string;
  nameKr: string;
  arcana: string;
  number: number;
  suit?: string;
  imageUrl?: string;
}

interface CardWithPosition {
  card: Card;
  orientation: 'upright' | 'reversed';
  position: {
    position: number;
    name: string;
    nameKr: string;
  };
}

interface InterpretationResult {
  text: string;
  interpretationId?: string;
  cached?: boolean;
  error?: string;
}

export class AIInterpretationService {
  private isPremium: boolean;
  
  constructor(isPremium: boolean) {
    this.isPremium = isPremium;
  }
  
  async generateInterpretation(
    cards: CardWithPosition[], 
    topic: string, 
    spreadType: string
  ): Promise<InterpretationResult> {
    if (!this.isPremium) {
      // 무료 사용자는 템플릿 해석
      return this.generateTemplateInterpretation(cards, topic);
    }
    
    try {
      // Supabase Edge Function 호출
      const { data, error } = await supabase.functions.invoke('generate-interpretation', {
        body: {
          cards: cards.map(c => ({
            id: c.card.id,
            name: c.card.name,
            nameKr: c.card.nameKr,
            arcana: c.card.arcana,
            number: c.card.number,
            suit: c.card.suit,
            orientation: c.orientation,
            position: c.position
          })),
          topic,
          spreadType,
          userId: (await supabase.auth.getUser()).data.user?.id,
          isPremium: this.isPremium
        }
      });
      
      if (error) {
        console.error('Edge Function 오류:', error);
        // 오류 발생 시 템플릿 해석으로 폴백
        return this.generateTemplateInterpretation(cards, topic);
      }
      
      return {
        text: data.interpretation,
        interpretationId: data.interpretationId,
        cached: data.cached
      };
    } catch (error) {
      console.error('AI 해석 실패:', error);
      // 폴백: 템플릿 해석
      return this.generateTemplateInterpretation(cards, topic);
    }
  }
  
  // 템플릿 기반 해석 (폴백용)
  private generateTemplateInterpretation(cards: CardWithPosition[], topic: string): InterpretationResult {
    const topicKr = {
      love: '연애운',
      career: '직업운',
      money: '금전운',
      general: '종합운'
    }[topic] || '종합운';
    
    let interpretation = `🔮 ${topicKr} 해석\n\n`;
    
    // 켈틱 크로스 특별 해석
    if (cards.length === 10) {
      interpretation += this.generateCelticCrossTemplate(cards, topic);
    } else {
      // 기본 해석
      cards.forEach((card, index) => {
        interpretation += `${index + 1}. ${card.position.nameKr}: ${card.card.nameKr} (${card.orientation === 'upright' ? '정방향' : '역방향'})\n`;
        interpretation += `→ ${this.getBasicMeaning(card.card, card.orientation, topic)}\n\n`;
      });
    }
    
    return { text: interpretation };
  }
  
  private generateCelticCrossTemplate(cards: CardWithPosition[], topic: string): string {
    let template = '';
    
    // 현재 상황 분석
    template += '【현재 상황】\n';
    template += `${cards[0].card.nameKr}(${cards[0].orientation === 'upright' ? '정방향' : '역방향'})과 `;
    template += `${cards[1].card.nameKr}(${cards[1].orientation === 'upright' ? '정방향' : '역방향'})가 나타내듯이, `;
    template += `현재 당신은 ${this.getContextualMeaning(cards[0].card, cards[0].orientation, topic)}의 상황에 있으며, `;
    template += `${this.getContextualMeaning(cards[1].card, cards[1].orientation, topic)}의 도전에 직면해 있습니다.\n\n`;
    
    // 과거와 미래
    template += '【시간의 흐름】\n';
    template += `과거(${cards[3].card.nameKr})로부터 이어진 ${this.getContextualMeaning(cards[3].card, cards[3].orientation, topic)}의 영향이 `;
    template += `미래(${cards[5].card.nameKr})의 ${this.getContextualMeaning(cards[5].card, cards[5].orientation, topic)}로 이어질 것으로 보입니다.\n\n`;
    
    // 내면과 외면
    template += '【내면과 외면의 조화】\n';
    template += `당신의 내면(${cards[6].card.nameKr})은 ${this.getContextualMeaning(cards[6].card, cards[6].orientation, topic)}를 나타내고 있으며, `;
    template += `주변 사람들(${cards[7].card.nameKr})은 당신을 ${this.getContextualMeaning(cards[7].card, cards[7].orientation, topic)}로 보고 있습니다.\n\n`;
    
    // 결과
    template += '【예상되는 결과】\n';
    template += `최종적으로 ${cards[9].card.nameKr}(${cards[9].orientation === 'upright' ? '정방향' : '역방향'})가 시사하는 `;
    template += `${this.getContextualMeaning(cards[9].card, cards[9].orientation, topic)}의 결과가 예상됩니다.\n\n`;
    
    // 조언
    template += '【조언】\n';
    template += this.generateAdvice(cards, topic);
    
    return template;
  }
  
  private getBasicMeaning(card: Card, orientation: string, topic: string): string {
    // 카드별 기본 의미 (실제로는 데이터베이스에서 가져와야 함)
    const meanings = {
      'The Fool': { upright: '새로운 시작', reversed: '무모함' },
      'The Magician': { upright: '능력 발휘', reversed: '재능 낭비' },
      // ... 더 많은 카드 의미
    };
    
    return meanings[card.name]?.[orientation] || '변화의 시기';
  }
  
  private getContextualMeaning(card: Card, orientation: string, topic: string): string {
    // 주제별 맥락적 의미
    const contextualMeanings = {
      love: {
        'The Fool': { upright: '새로운 만남의 기회', reversed: '성급한 결정' },
        // ...
      },
      career: {
        'The Fool': { upright: '새로운 도전', reversed: '준비 부족' },
        // ...
      }
    };
    
    return contextualMeanings[topic]?.[card.name]?.[orientation] || this.getBasicMeaning(card, orientation, topic);
  }
  
  private generateAdvice(cards: CardWithPosition[], topic: string): string {
    // 카드 조합에 따른 조언 생성
    const majorCount = cards.filter(c => c.card.arcana === 'major').length;
    const reversedCount = cards.filter(c => c.orientation === 'reversed').length;
    
    let advice = '';
    
    if (majorCount >= 5) {
      advice += '중요한 인생의 전환점에 있습니다. 신중하되 과감한 결정이 필요합니다. ';
    }
    
    if (reversedCount >= 5) {
      advice += '현재 많은 도전과 장애물이 있지만, 이는 성장의 기회입니다. ';
    }
    
    // 주제별 조언
    switch (topic) {
      case 'love':
        advice += '마음을 열고 진솔한 소통을 시도해보세요.';
        break;
      case 'career':
        advice += '목표를 명확히 하고 단계별 계획을 세워보세요.';
        break;
      case 'money':
        advice += '장기적인 관점에서 재정 계획을 수립하세요.';
        break;
      default:
        advice += '내면의 목소리에 귀 기울이고 균형을 찾아가세요.';
    }
    
    return advice;
  }
  
  // 평점 제출
  async submitRating(interpretationId: string, rating: number, feedback?: string): Promise<void> {
    try {
      await supabase.functions.invoke('submit-rating', {
        body: {
          interpretationId,
          rating,
          feedback,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });
    } catch (error) {
      console.error('평점 제출 실패:', error);
    }
  }
}
