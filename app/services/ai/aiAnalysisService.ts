import { TarotReading } from '@/models/TarotReading';
import { tarotDatabase } from '@/services/tarotDatabase';

export interface AIAnalysisResult {
  depthAnalysis: {
    psychological: string;
    spiritual: string;
    shadow: string;
  };
  synthesis: string;
  keyInsights: string[];
  actionPlan: {
    immediate: string[];
    weekly: string[];
    monthly: string[];
  };
  affirmations: string[];
  probabilities?: {
    success: number;
    challenge: number;
    transformation: number;
  };
}

export class AIAnalysisService {
  // 프리미엄 사용자를 위한 AI 심층 분석
  async generateDeepAnalysis(reading: TarotReading): Promise<AIAnalysisResult> {
    try {
      // 카드 정보 수집
      const cardsInfo = await this.collectCardsInfo(reading);
      
      // 스프레드 정보
      const spreadInfo = await tarotDatabase.getSpread(reading.spreadId);
      
      // 주제 정보
      const topicInfo = await tarotDatabase.getTopic(reading.topicId);
      
      // AI 분석 생성 (실제로는 API 호출이나 로컬 AI 모델 사용)
      // 현재는 규칙 기반 분석으로 구현
      const analysis = this.performRuleBasedAnalysis(
        cardsInfo,
        spreadInfo,
        topicInfo,
        reading
      );
      
      return analysis;
    } catch (error) {
      console.error('AI 분석 생성 실패:', error);
      throw error;
    }
  }
  
  private async collectCardsInfo(reading: TarotReading) {
    const cardsInfo = [];
    for (const card of reading.cards) {
      const fullCardInfo = await tarotDatabase.getCard(card.id);
      cardsInfo.push({
        ...fullCardInfo,
        orientation: card.orientation,
        position: card.position
      });
    }
    return cardsInfo;
  }
  
  private performRuleBasedAnalysis(
    cards: any[],
    spread: any,
    topic: any,
    reading: TarotReading
  ): AIAnalysisResult {
    // 심층 분석 레이어
    const depthAnalysis = {
      psychological: this.analyzePsychologicalLayer(cards, topic),
      spiritual: this.analyzeSpiritualLayer(cards, topic),
      shadow: this.analyzeShadowLayer(cards, topic)
    };
    
    // 종합 통찰
    const synthesis = this.synthesizeInsights(cards, depthAnalysis, topic);
    
    // 핵심 인사이트
    const keyInsights = this.extractKeyInsights(cards, topic);
    
    // 실행 계획
    const actionPlan = this.createActionPlan(cards, topic, keyInsights);
    
    // 확언
    const affirmations = this.generateAffirmations(cards, topic);
    
    // 확률 계산 (선택적)
    const probabilities = this.calculateProbabilities(cards);
    
    return {
      depthAnalysis,
      synthesis,
      keyInsights,
      actionPlan,
      affirmations,
      probabilities
    };
  }
  
  private analyzePsychologicalLayer(cards: any[], topic: any): string {
    // 심리적 패턴 분석
    const majorCards = cards.filter(c => c.arcana === 'major');
    const courtCards = cards.filter(c => c.arcana === 'minor' && c.number > 10);
    
    let analysis = '';
    
    if (majorCards.length > 0) {
      analysis += '당신의 무의식은 중요한 전환점을 맞이하고 있습니다. ';
    }
    
    if (courtCards.length > 0) {
      analysis += '인간관계나 자아 정체성과 관련된 심리적 도전이 있습니다. ';
    }
    
    // 슈트별 분석
    const suitCounts = this.countSuits(cards);
    if (suitCounts.cups > 2) {
      analysis += '감정적 처리와 직관력이 현재 상황의 핵심입니다. ';
    }
    if (suitCounts.swords > 2) {
      analysis += '사고 패턴과 의사소통 방식을 재검토할 필요가 있습니다. ';
    }
    
    return analysis || '현재 심리 상태는 안정적이며, 내적 균형을 유지하고 있습니다.';
  }
  
  private analyzeSpiritualLayer(cards: any[], topic: any): string {
    const spiritualCards = ['The High Priestess', 'The Hermit', 'The Hanged Man', 'The Star', 'The Moon'];
    const hasSpiritual = cards.some(c => spiritualCards.includes(c.name));
    
    if (hasSpiritual) {
      return '영적 각성의 시기입니다. 내면의 목소리에 귀 기울이고, 직관을 신뢰하세요. 명상이나 성찰의 시간이 도움이 될 것입니다.';
    }
    
    return '일상적 차원을 넘어선 더 큰 의미를 찾고자 하는 욕구가 있습니다. 삶의 목적과 방향성에 대해 깊이 생각해보세요.';
  }
  
  private analyzeShadowLayer(cards: any[], topic: any): string {
    const shadowCards = ['The Devil', 'The Tower', 'Death', 'The Moon'];
    const reversedCards = cards.filter(c => c.orientation === 'reversed');
    
    let shadow = '';
    
    if (cards.some(c => shadowCards.includes(c.name))) {
      shadow += '억압된 감정이나 부인하고 있던 진실과 마주할 시기입니다. ';
    }
    
    if (reversedCards.length > cards.length / 2) {
      shadow += '내적 저항이나 차단된 에너지가 있습니다. ';
    }
    
    return shadow || '그림자 측면이 통합되고 있으며, 자아의 완전성을 향해 나아가고 있습니다.';
  }
  
  private synthesizeInsights(cards: any[], depthAnalysis: any, topic: any): string {
    const overallEnergy = this.calculateOverallEnergy(cards);
    
    let synthesis = `전체적으로 ${overallEnergy} 에너지가 흐르고 있습니다. `;
    synthesis += `심리적으로는 ${depthAnalysis.psychological.split('.')[0]}. `;
    synthesis += `영적 차원에서는 성장과 확장의 기회가 있으며, `;
    synthesis += `그림자 작업을 통해 더 온전한 자신이 될 수 있습니다.`;
    
    return synthesis;
  }
  
  private extractKeyInsights(cards: any[], topic: any): string[] {
    const insights = [];
    
    // 메이저 아르카나 기반 인사이트
    const majorCards = cards.filter(c => c.arcana === 'major');
    if (majorCards.length > 0) {
      insights.push(`주요 인생 레슨: ${majorCards[0].nameKr}가 시사하는 변화를 수용하세요`);
    }
    
    // 패턴 기반 인사이트
    const suitCounts = this.countSuits(cards);
    const dominantSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominantSuit[1] > 1) {
      const suitMeanings = {
        wands: '열정과 창의성',
        cups: '감정과 관계',
        swords: '사고와 의사소통',
        pentacles: '물질과 실현'
      };
      insights.push(`${suitMeanings[dominantSuit[0]]}에 집중하세요`);
    }
    
    // 방향성 기반 인사이트
    const reversedCount = cards.filter(c => c.orientation === 'reversed').length;
    if (reversedCount > cards.length / 2) {
      insights.push('내적 성찰과 재정렬이 필요한 시기입니다');
    } else {
      insights.push('외적 행동과 실천에 유리한 시기입니다');
    }
    
    return insights;
  }
  
  private createActionPlan(cards: any[], topic: any, insights: string[]): any {
    return {
      immediate: [
        '오늘 10분간 조용히 명상하며 카드의 메시지를 내면화하세요',
        '가장 강렬하게 와닿은 카드를 일기에 기록하고 느낌을 적어보세요',
        '한 가지 작은 행동으로 변화를 시작하세요'
      ],
      weekly: [
        '매일 아침 오늘의 의도를 설정하는 시간을 가지세요',
        '주요 카드의 상징을 일상에서 발견하고 기록하세요',
        '신뢰할 수 있는 사람과 당신의 통찰을 나누세요'
      ],
      monthly: [
        '이번 달의 진전 상황을 되돌아보고 기록하세요',
        '새로운 습관이나 루틴을 하나 확립하세요',
        '다음 단계의 성장을 위한 구체적 목표를 설정하세요'
      ]
    };
  }
  
  private generateAffirmations(cards: any[], topic: any): string[] {
    const affirmations = [
      '나는 내 삶의 주인공이며, 모든 변화를 환영합니다',
      '나는 직관을 신뢰하고 내면의 지혜를 따릅니다',
      '나는 도전을 성장의 기회로 받아들입니다'
    ];
    
    // 주요 카드에 따른 특별 확언
    const firstCard = cards[0];
    if (firstCard.arcana === 'major') {
      affirmations.push(`나는 ${firstCard.nameKr}의 에너지와 하나가 됩니다`);
    }
    
    return affirmations;
  }
  
  private calculateProbabilities(cards: any[]): any {
    // 간단한 확률 계산 로직
    const positiveCards = cards.filter(c => c.orientation === 'upright').length;
    const totalCards = cards.length;
    const positiveRatio = positiveCards / totalCards;
    
    return {
      success: Math.round(positiveRatio * 100),
      challenge: Math.round((1 - positiveRatio) * 50 + 20),
      transformation: Math.round(Math.random() * 30 + 60)
    };
  }
  
  private countSuits(cards: any[]): any {
    const counts = { wands: 0, cups: 0, swords: 0, pentacles: 0 };
    cards.forEach(card => {
      if (card.suit && counts[card.suit] !== undefined) {
        counts[card.suit]++;
      }
    });
    return counts;
  }
  
  private calculateOverallEnergy(cards: any[]): string {
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    const reversedCount = cards.filter(c => c.orientation === 'reversed').length;
    
    if (majorCount > cards.length / 2) {
      return '강력하고 변혁적인';
    } else if (reversedCount > cards.length / 2) {
      return '내적 성찰과 재조정의';
    } else {
      return '균형잡힌 성장의';
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
