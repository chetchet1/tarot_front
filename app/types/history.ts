// History 관련 타입 정의
export interface DrawnCard {
  id?: number;
  cardNumber?: number;
  name?: string;
  name_kr?: string;
  nameKr?: string;
  card_name?: string;
  meaning_upright?: string;
  meaning_reverse?: string;
  position?: string | { index: number; name: string };
  orientation?: 'upright' | 'reversed';
  is_reversed?: boolean;
  card_id?: number;
  image_url?: string;
  imageUrl?: string;
  arcana?: string;
  suit?: string;
  number?: number;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  spread_id?: string;
  spread_name: string;
  spread_type?: string;
  topic: string;
  question?: string;
  ai_interpretation?: string | Record<string, any>;
  ai_interpretation_text?: string;
  enhanced_interpretation?: string | Record<string, any>;
  overall_message?: string;
  created_at: string;
  cards: DrawnCard[];
  is_premium?: boolean;
  shared?: boolean;
  tags?: string[];
}

export interface ReadingCard {
  id: string;
  reading_id: string;
  card_id: number;
  position: string;
  is_reversed: boolean;
  card?: DrawnCard;
}
