// History 관련 타입 정의
export interface DrawnCard {
  id: number;
  name_kr: string;
  card_name?: string;
  meaning_upright: string;
  meaning_reverse: string;
  position?: string;
  is_reversed?: boolean;
  card_id?: number;
  image_url?: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  spread_name: string;
  topic: string;
  question?: string;
  ai_interpretation?: string;
  created_at: string;
  cards: DrawnCard[];
}

export interface ReadingCard {
  id: string;
  reading_id: string;
  card_id: number;
  position: string;
  is_reversed: boolean;
  card?: DrawnCard;
}
