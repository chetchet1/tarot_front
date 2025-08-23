import { TarotSpread } from '../models/tarot';

// ⚠️ 주의: 이 파일은 기본 스프레드 데이터를 포함하고 있지만,
// 가능하면 Supabase의 'tarot_spreads' 테이블에서 로드하는 것을 계횟합니다.
// 다만 스프레드 데이터는 카드 데이터에 비해 버캘이 적으므로 현재는 사용 가능합니다.

export const tarotSpreads: TarotSpread[] = [
  {
    id: "one_card",
    spreadId: "one_card",
    name: "One Card Spread",
    nameKr: "원 카드 스프레드",
    description: "오늘 하루 또는 특정 상황에 대한 간단한 조언",
    cardCount: 1,
    positions: [
      {
        position: 1,
        name: "조언",
        description: "현재 상황에 대한 가이드",
        x: 50,
        y: 50
      }
    ],
    isPremium: false,
    topics: ["general", "love", "career", "money", "health"]
  },
  {
    id: "three_card_timeline",
    spreadId: "three_card_timeline",
    name: "Past-Present-Future",
    nameKr: "과거-현재-미래",
    description: "시간의 흐름에 따른 상황 변화를 보여줍니다",
    cardCount: 3,
    positions: [
      {
        position: 1,
        name: "과거",
        description: "현재 상황에 영향을 준 과거의 요인",
        x: 20,
        y: 50
      },
      {
        position: 2,
        name: "현재",
        description: "현재의 상황과 에너지",
        x: 50,
        y: 50
      },
      {
        position: 3,
        name: "미래",
        description: "앞으로 전개될 가능성",
        x: 80,
        y: 50
      }
    ],
    isPremium: false,
    topics: ["general", "love", "career", "money", "health"]
  },
  {
    id: "seven_star",
    spreadId: "seven_star",
    name: "Seven Star",
    nameKr: "세븐 스타",
    description: "7개의 별이 당신의 운명을 밝혀주는 신비로운 배열",
    cardCount: 7,
    positions: [
      {
        position: 1,
        name: "과거의 영향",
        description: "현재에 영향을 미치는 과거의 요소",
        x: 50,
        y: 20
      },
      {
        position: 2,
        name: "현재 상황",
        description: "당신이 지금 서 있는 위치",
        x: 50,
        y: 50
      },
      {
        position: 3,
        name: "숨겨진 영향",
        description: "보이지 않는 힘과 영향",
        x: 20,
        y: 35
      },
      {
        position: 4,
        name: "의식적 욕구",
        description: "당신이 원하는 것",
        x: 80,
        y: 35
      },
      {
        position: 5,
        name: "무의식적 욕구",
        description: "당신이 진정으로 필요로 하는 것",
        x: 20,
        y: 65
      },
      {
        position: 6,
        name: "조언",
        description: "취해야 할 행동",
        x: 80,
        y: 65
      },
      {
        position: 7,
        name: "최종 결과",
        description: "예상되는 결과",
        x: 50,
        y: 80
      }
    ],
    isPremium: true,
    topics: ["general", "love", "career", "money", "health"]
  },
  {
    id: "celtic_cross",
    spreadId: "celtic_cross",
    name: "Celtic Cross",
    nameKr: "켈틱 크로스",
    description: "가장 상세하고 포괄적인 10장 카드 배열",
    cardCount: 10,
    positions: [
      {
        position: 1,
        name: "현재내면",
        description: "당신의 내면 상태와 감정",
        x: 40,
        y: 50
      },
      {
        position: 2,
        name: "현재외부",
        description: "외부 환경과 영향",
        x: 40,
        y: 50
      },
      {
        position: 3,
        name: "근본",
        description: "현재 상황의 뿌리와 기초",
        x: 40,
        y: 80
      },
      {
        position: 4,
        name: "과거",
        description: "지나간 사건과 경험",
        x: 15,
        y: 50
      },
      {
        position: 5,
        name: "드러나는 모습",
        description: "당신이 드러내는 외부적 모습",
        x: 40,
        y: 20
      },
      {
        position: 6,
        name: "미래",
        description: "앞으로 펼쳐질 가능성",
        x: 65,
        y: 50
      },
      {
        position: 7,
        name: "내가보는나",
        description: "자신에 대한 자아 인식",
        x: 85,
        y: 80
      },
      {
        position: 8,
        name: "남이보는나",
        description: "타인이 보는 나의 모습",
        x: 85,
        y: 60
      },
      {
        position: 9,
        name: "예상하는 결과",
        description: "내가 기대하고 예상하는 결과",
        x: 85,
        y: 40
      },
      {
        position: 10,
        name: "실제 결과",
        description: "실제로 일어날 가능성이 높은 결과",
        x: 85,
        y: 20
      }
    ],
    isPremium: true,
    topics: ["general", "love", "career", "money", "health"]
  },
  {
    id: "cup_of_relationship",
    spreadId: "cup_of_relationship",
    name: "Cup of Relationship",
    nameKr: "컵 오브 릴레이션십",
    description: "사랑과 관계의 깊이를 탐구하는 11장의 특별한 배열",
    cardCount: 11,
    positions: [
      {
        position: 1,
        name: "나",
        description: "나의 현재 감정과 상태",
        x: 20,
        y: 80
      },
      {
        position: 2,
        name: "상대",
        description: "상대방의 현재 감정과 상태",
        x: 80,
        y: 80
      },
      {
        position: 3,
        name: "관계 기본",
        description: "두 사람 관계의 기본적인 성향",
        x: 50,
        y: 75
      },
      {
        position: 4,
        name: "관계 과거",
        description: "과거의 관계 상태",
        x: 35,
        y: 60
      },
      {
        position: 5,
        name: "현재 느 상태",
        description: "현재 두 사람의 관계 상태",
        x: 50,
        y: 50
      },
      {
        position: 6,
        name: "현재 외부 상황",
        description: "관계에 영향을 미치는 외부 요인",
        x: 65,
        y: 60
      },
      {
        position: 7,
        name: "현재 나는 어떻게 생각?",
        description: "현재 관계에 대한 나의 생각",
        x: 25,
        y: 40
      },
      {
        position: 8,
        name: "현재 상대는 어떻게 생각?",
        description: "현재 관계에 대한 상대의 생각",
        x: 75,
        y: 40
      },
      {
        position: 9,
        name: "미래 나는 어떻게 생각?",
        description: "미래에 나는 어떻게 생각할지",
        x: 35,
        y: 20
      },
      {
        position: 10,
        name: "미래 상대는 어떻게 생각?",
        description: "미래에 상대는 어떻게 생각할지",
        x: 65,
        y: 20
      },
      {
        position: 11,
        name: "결과",
        description: "관계의 최종 결과",
        x: 50,
        y: 5
      }
    ],
    isPremium: true,
    topics: ["love"]
  }
];

// 스프레드 ID로 찾기
export const getSpreadById = (spreadId: string): TarotSpread | undefined => {
  return tarotSpreads.find(spread => spread.spreadId === spreadId);
};

// 무료 스프레드만 가져오기
export const getFreeSpreads = (): TarotSpread[] => {
  return tarotSpreads.filter(spread => !spread.isPremium);
};

// 프리미엄 스프레드만 가져오기
export const getPremiumSpreads = (): TarotSpread[] => {
  return tarotSpreads.filter(spread => spread.isPremium);
};

// 특정 주제에 사용 가능한 스프레드 가져오기
export const getSpreadsByTopic = (topic: string, relationshipStatus?: 'single' | 'couple' | null): TarotSpread[] => {
  let availableSpreads = tarotSpreads.filter(spread => spread.topics.includes(topic));
  
  // 연애 주제이고 솔로인 경우, 컵 오브 릴레이션십 제외
  if (topic === 'love' && relationshipStatus === 'single') {
    availableSpreads = availableSpreads.filter(spread => spread.spreadId !== 'cup_of_relationship');
  }
  
  return availableSpreads;
};

// Alias for backward compatibility
export const spreads = tarotSpreads;
