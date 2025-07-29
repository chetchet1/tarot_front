// 타로카드 관련 타입 정의

export type Arcana = 'major' | 'minor';
export type Suit = 'cups' | 'wands' | 'swords' | 'pentacles';
export type Orientation = 'upright' | 'reversed';
export type Topic = 'general' | 'love' | 'career' | 'money' | 'health';

export interface Keywords {
  upright: string[];
  reversed: string[];
}

export interface Meaning {
  upright: string;
  reversed: string;
}

export interface Meanings {
  general: Meaning;
  love: Meaning;
  career: Meaning;
  money: Meaning;
  health?: Meaning;
}

export interface TarotCard {
  id: number;              // 0-77
  name: string;            // 영문명
  nameKr: string;          // 한글명
  arcana: Arcana;
  number?: number;         // 카드 번호
  suit?: Suit;            // 마이너 아르카나의 경우
  keywords: Keywords;
  meanings: Meanings;
  element?: string;        // 원소 (불, 물, 공기, 흙)
  astrology?: string;      // 점성술 연관
  imageUrl: string;        // 카드 이미지 경로
}

export interface DrawnCard extends TarotCard {
  orientation: Orientation;
  position?: SpreadPosition;
  interpretation?: CardInterpretation;
}

export interface CardInterpretation {
  basic: string;
  positional: string;
  advice: string;
  keywords: string[];
}

export interface SpreadPosition {
  position: number;
  name: string;
  description: string;
  x: number;  // 화면상 X 좌표 (%)
  y: number;  // 화면상 Y 좌표 (%)
}

export interface TarotSpread {
  id: string;
  spreadId: string;
  name: string;
  nameKr: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  isPremium: boolean;
  topics: Topic[];
}

export interface Reading {
  id: string;
  userId?: string;
  spreadId: string;
  topic: Topic;
  question?: string;
  cards: DrawnCard[];
  overallMessage: string;
  createdAt: Date;
  isPremium: boolean;
  shared: boolean;
  tags?: string[];
  premiumInsights?: any; // 프리미엄 사용자를 위한 추가 인사이트
}

export interface UserStats {
  userId: string;
  totalReadings: number;
  readingsByTopic: Record<Topic, number>;
  favoriteCards: Array<{
    cardId: number;
    frequency: number;
    orientation: Orientation;
  }>;
  monthlyActivity: Array<{
    month: string;  // 'YYYY-MM'
    count: number;
  }>;
  averageCardsPerReading: number;
  lastReadingDate: Date;
}
