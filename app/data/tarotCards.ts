import { TarotCard } from '../models/tarot';
import { supabase } from '../services/supabase';

// ⚠️ 중요: 모든 카드 데이터는 Supabase에서 로드됩니다.
// 하드코딩된 카드 데이터는 사용하지 않습니다.
let cachedCards: TarotCard[] = [];
let cardsLoaded = false;

// Supabase에서 모든 타로카드 로드
export const loadAllCards = async (): Promise<TarotCard[]> => {
  if (cardsLoaded && cachedCards.length > 0) {
    return cachedCards;
  }

  try {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .order('id');

    if (error) {
      console.error('카드 로드 오류:', error);
      return [];
    }

    // 데이터 변환
    cachedCards = data?.map(card => ({
      id: card.id,
      name: card.name,
      nameKr: card.name_kr,
      arcana: card.arcana,
      number: card.number,
      suit: card.suit,
      keywords: card.keywords,
      meanings: card.meanings,
      element: card.element,
      astrology: card.astrology,
      imageUrl: card.image_url
    })) || [];

    cardsLoaded = true;
    return cachedCards;
  } catch (error) {
    console.error('카드 로드 실패:', error);
    return [];
  }
};

// 모든 타로카드 (Supabase에서 로드)
export const getAllTarotCards = async (): Promise<TarotCard[]> => {
  return await loadAllCards();
};

// 카드 ID로 카드 찾기
export const getCardById = async (id: number): Promise<TarotCard | undefined> => {
  const cards = await loadAllCards();
  return cards.find(card => card.id === id);
};

// 카드 이름으로 카드 찾기
export const getCardByName = async (name: string): Promise<TarotCard | undefined> => {
  const cards = await loadAllCards();
  return cards.find(card => 
    card.name.toLowerCase() === name.toLowerCase() ||
    card.nameKr === name
  );
};

// 메이저 아르카나만 가져오기
export const getMajorArcana = async (): Promise<TarotCard[]> => {
  const cards = await loadAllCards();
  return cards.filter(card => card.arcana === 'major');
};

// 마이너 아르카나만 가져오기
export const getMinorArcana = async (): Promise<TarotCard[]> => {
  const cards = await loadAllCards();
  return cards.filter(card => card.arcana === 'minor');
};

// 특정 수트의 카드만 가져오기
export const getCardsBySuit = async (suit: 'cups' | 'wands' | 'swords' | 'pentacles'): Promise<TarotCard[]> => {
  const cards = await loadAllCards();
  return cards.filter(card => card.suit === suit);
};

// 랜덤 카드 선택
export const getRandomCards = async (count: number, excludeIds: number[] = []): Promise<TarotCard[]> => {
  const cards = await loadAllCards();
  const availableCards = cards.filter(card => !excludeIds.includes(card.id));
  const shuffled = [...availableCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 캐시 초기화 (필요시 사용)
export const resetCardCache = (): void => {
  cachedCards = [];
  cardsLoaded = false;
};
