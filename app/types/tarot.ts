export interface TarotCard {
  id: number;
  name: string;
  name_kr: string;
  arcana: 'major' | 'minor';
  number?: number;
  suit?: 'cups' | 'wands' | 'swords' | 'pentacles';
  keywords?: {
    upright: string[];
    reversed: string[];
  };
  meanings?: {
    general: string;
    love: string;
    career: string;
    advice: string;
  };
  element?: string;
  astrology?: string;
  image_url?: string;
}

export interface DailyReading {
  id: string;
  user_id: string;
  card_id: number;
  date: string;
  orientation?: 'upright' | 'reversed';
  created_at: string;
  card?: TarotCard;
  interpretation_data?: DailyInterpretation; // 메모리에만 저장
}

export interface DailyInterpretation {
  fortuneIndex: {
    overall: number;
    love: number;
    money: number;
    health: number;
    work: number;
  };
  timeAdvice: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  luckyItems: {
    color: string;
    number: string;
    direction: string;
    activity: string;
  };
  relationshipAdvice: {
    tip: string;
    avoid: string;
    goodMeet: string;
  };
  dailyQuote: string;
  detailedFortune?: {
    mainMessage: string;
    keyPoint: string;
    caution: string;
    luckyMoment: string;
    advice: string;
  };
}
