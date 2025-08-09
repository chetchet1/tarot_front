// 타로 리딩 관련 타입 정의

export interface TarotCard {
  id?: number;
  cardNumber?: number;
  name: string;
  nameKr: string;
  orientation: 'upright' | 'reversed';
  position?: {
    index: number;
    name: string;
  };
  arcana?: string;
  suit?: string;
  keywords?: any;
  meanings?: any;
}

export interface Reading {
  id?: string;
  spreadId: string;
  cards: TarotCard[];
  customQuestion?: string;
  overallMessage?: string;
  aiInterpretation?: string;
  topic?: string;
  createdAt?: Date;
  userId?: string;
}

export interface SharedReading {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  spreadType: string;
  cards: Array<{
    cardNumber: number;
    nameKr: string;
    name: string;
    orientation: 'upright' | 'reversed';
    position?: {
      index: number;
      name: string;
    };
  }>;
  customQuestion?: string;
  basicInterpretation?: string;
  aiInterpretation?: string;
  sharedBy?: string;
}
