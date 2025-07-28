import { TarotCard } from '../models/tarot';
import { majorArcanaCards } from './majorArcana';
import { pentaclesCards } from './minorArcana';
// import { cupsCards, wandsCards, swordsCards, pentaclesCards } from './minorArcana';

// 임시: 다른 수트 카드들 (나중에 추가 예정)
const cupsCards: TarotCard[] = [];
const wandsCards: TarotCard[] = [];
const swordsCards: TarotCard[] = [];

// 모든 타로카드 (현재는 메이저 아르카나 + 펜타클만)
export const allTarotCards: TarotCard[] = [
  ...majorArcanaCards,
  ...pentaclesCards,
  // ...cupsCards,
  // ...wandsCards,
  // ...swordsCards,
];

// 카드 ID로 카드 찾기
export const getCardById = (id: number): TarotCard | undefined => {
  return allTarotCards.find(card => card.id === id);
};

// 카드 이름으로 카드 찾기
export const getCardByName = (name: string): TarotCard | undefined => {
  return allTarotCards.find(card => 
    card.name.toLowerCase() === name.toLowerCase() ||
    card.nameKr === name
  );
};

// 메이저 아르카나만 가져오기
export const getMajorArcana = (): TarotCard[] => {
  return allTarotCards.filter(card => card.arcana === 'major');
};

// 마이너 아르카나만 가져오기
export const getMinorArcana = (): TarotCard[] => {
  return allTarotCards.filter(card => card.arcana === 'minor');
};

// 특정 수트의 카드만 가져오기
export const getCardsBySuit = (suit: 'cups' | 'wands' | 'swords' | 'pentacles'): TarotCard[] => {
  return allTarotCards.filter(card => card.suit === suit);
};

// 랜덤 카드 선택
export const getRandomCards = (count: number, excludeIds: number[] = []): TarotCard[] => {
  const availableCards = allTarotCards.filter(card => !excludeIds.includes(card.id));
  const shuffled = [...availableCards].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
