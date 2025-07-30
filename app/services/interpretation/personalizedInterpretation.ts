// 사용자별 맞춤 해석 서비스
import { DrawnCard, Reading } from '../../models/tarot';

interface UserProfile {
  birthDate?: Date;
  zodiacSign?: string;
  lifePathNumber?: number;
  readingHistory?: Reading[];
  preferences?: {
    interpretationStyle: 'detailed' | 'concise' | 'poetic';
    focusAreas: string[];
  };
}

export class PersonalizedInterpretation {
  private userProfile: UserProfile;

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
  }

  // 맞춤형 해석 생성
  enhanceInterpretation(card: DrawnCard, context: any): any {
    const enhanced = {
      personal: this.getPersonalMessage(card),
      zodiacConnection: this.getZodiacConnection(card),
      numerological: this.getNumerologicalInsight(card),
      seasonal: this.getSeasonalMessage(card),
      lifePhase: this.getLifePhaseGuidance(card)
    };

    return enhanced;
  }

  // 개인 메시지
  private getPersonalMessage(card: DrawnCard): string {
    if (!this.userProfile.readingHistory || this.userProfile.readingHistory.length === 0) {
      return '새로운 여정을 시작하는 당신에게 이 카드는 특별한 의미를 가집니다.';
    }

    // 이전 리딩 패턴 분석
    const previousCards = this.analyzePreviousReadings();
    if (previousCards.includes(card.name)) {
      return `${card.nameKr} 카드가 다시 나타났습니다. 우주가 강조하고자 하는 메시지가 있습니다.`;
    }

    return '당신의 현재 상황에 맞는 특별한 메시지입니다.';
  }

  // 점성술 연결
  private getZodiacConnection(card: DrawnCard): string {
    if (!this.userProfile.zodiacSign) return '';

    const zodiacCardConnections = {
      'Aries': {
        'The Emperor': '양자리의 지배 카드입니다. 리더십과 개척 정신이 강조됩니다.',
        'The Tower': '급격한 변화를 통한 성장의 기회입니다.',
        'Ace of Wands': '새로운 열정과 시작의 에너지가 넘칩니다.'
      },
      'Taurus': {
        'The Hierophant': '황소자리의 지배 카드입니다. 전통과 안정성이 중요합니다.',
        'The Empress': '풍요와 창조성이 발현되는 시기입니다.',
        'King of Pentacles': '물질적 안정과 성공이 다가옵니다.'
      },
      'Gemini': {
        'The Lovers': '쌍둥이자리의 지배 카드입니다. 선택과 소통이 핵심입니다.',
        'The Magician': '다재다능함을 발휘할 때입니다.',
        'Eight of Swords': '생각의 함정에서 벗어나세요.'
      },
      // ... 나머지 별자리들
    };

    const connection = zodiacCardConnections[this.userProfile.zodiacSign]?.[card.name];
    return connection || `${this.userProfile.zodiacSign}의 에너지와 ${card.nameKr}의 조화를 탐구해보세요.`;
  }

  // 수비학적 통찰
  private getNumerologicalInsight(card: DrawnCard): string {
    if (!this.userProfile.lifePathNumber) return '';

    const lifePathMessages = {
      1: '독립적이고 개척적인 당신의 성향과 연결됩니다.',
      2: '협력과 조화를 중시하는 당신의 본질과 공명합니다.',
      3: '창조적 표현과 소통의 재능이 발현됩니다.',
      4: '안정과 실용성을 추구하는 당신의 길과 일치합니다.',
      5: '자유와 모험을 갈망하는 당신의 영혼과 조응합니다.',
      6: '책임과 보살핌의 에너지가 강화됩니다.',
      7: '영적 탐구와 내면의 지혜가 깊어집니다.',
      8: '물질적 성취와 영적 균형을 이룹니다.',
      9: '인도주의적 봉사와 완성의 에너지가 흐릅니다.',
      11: '직관과 영감의 마스터 넘버 에너지가 활성화됩니다.',
      22: '거대한 비전을 현실화하는 마스터 빌더의 힘이 깨어납니다.'
    };

    const baseMessage = lifePathMessages[this.userProfile.lifePathNumber] || '';
    
    if (card.number !== undefined && card.number === this.userProfile.lifePathNumber) {
      return `인생수 ${this.userProfile.lifePathNumber}과 같은 숫자의 카드! 운명적인 메시지입니다. ${baseMessage}`;
    }

    return baseMessage;
  }

  // 계절별 메시지
  private getSeasonalMessage(card: DrawnCard): string {
    const now = new Date();
    const month = now.getMonth();
    
    let season = '';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';

    const seasonalMessages = {
      spring: {
        'The Fool': '봄의 시작처럼 새로운 모험이 기다립니다.',
        'Ace of Wands': '봄의 생명력이 당신의 열정을 깨웁니다.',
        'Three of Cups': '봄의 축제처럼 기쁨이 넘치는 시기입니다.'
      },
      summer: {
        'The Sun': '여름 태양처럼 당신의 에너지가 빛납니다.',
        'Eight of Pentacles': '여름의 수확을 위해 열심히 일할 때입니다.',
        'The Star': '여름 밤하늘의 별처럼 희망이 빛납니다.'
      },
      autumn: {
        'Death': '가을의 낙엽처럼 자연스러운 변화의 시기입니다.',
        'Nine of Pentacles': '가을의 수확처럼 그동안의 노력이 결실을 맺습니다.',
        'The Hermit': '가을의 성찰처럼 내면을 돌아볼 때입니다.'
      },
      winter: {
        'The Hermit': '겨울의 고요함 속에서 내면의 지혜를 찾으세요.',
        'Four of Swords': '겨울의 휴식처럼 재충전이 필요합니다.',
        'The World': '한 해의 완성과 새로운 시작을 준비하세요.'
      }
    };

    return seasonalMessages[season]?.[card.name] || 
           `현재 계절의 에너지와 ${card.nameKr}의 메시지를 연결해보세요.`;
  }

  // 인생 단계별 가이드
  private getLifePhaseGuidance(card: DrawnCard): string {
    if (!this.userProfile.birthDate) return '';

    const age = this.calculateAge(this.userProfile.birthDate);
    let lifePhase = '';

    if (age < 21) lifePhase = 'youth';
    else if (age < 35) lifePhase = 'youngAdult';
    else if (age < 50) lifePhase = 'midlife';
    else if (age < 65) lifePhase = 'mature';
    else lifePhase = 'elder';

    const phaseMessages = {
      youth: '성장과 학습의 시기에 이 카드는 중요한 교훈을 제시합니다.',
      youngAdult: '인생의 기반을 다지는 시기에 방향을 제시합니다.',
      midlife: '인생의 중반기에 새로운 의미와 목적을 발견하게 합니다.',
      mature: '성숙한 지혜로 이 메시지를 받아들이세요.',
      elder: '인생의 지혜가 이 카드의 깊은 의미를 이해하게 합니다.'
    };

    return phaseMessages[lifePhase];
  }

  // 이전 리딩 분석
  private analyzePreviousReadings(): string[] {
    if (!this.userProfile.readingHistory) return [];

    const allCards: string[] = [];
    this.userProfile.readingHistory.forEach(reading => {
      reading.cards.forEach(card => {
        allCards.push(card.name);
      });
    });

    return allCards;
  }

  // 나이 계산
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

// 생명수 계산기
export class LifePathCalculator {
  static calculate(birthDate: Date): number {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    let sum = this.reduceNumber(year) + this.reduceNumber(month) + this.reduceNumber(day);
    
    // 마스터 넘버 체크
    if (sum === 11 || sum === 22 || sum === 33) {
      return sum;
    }
    
    return this.reduceNumber(sum);
  }

  private static reduceNumber(num: number): number {
    let sum = num;
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return sum;
  }
}

// 별자리 계산기
export class ZodiacCalculator {
  static getZodiacSign(birthDate: Date): string {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
  }
}

export default {
  PersonalizedInterpretation,
  LifePathCalculator,
  ZodiacCalculator
};
