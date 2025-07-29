import { TarotSpread } from '../models/tarot';

// ⚠️ 주의: 이 파일은 기본 스프레드 데이터를 포함하고 있지만,
// 가능하면 Supabase의 'tarot_spreads' 테이블에서 로드하는 것을 계횟합니다.
// 다만 스프레드 데이터는 카드 데이터에 비해 버캘이 적으므로 현재는 사용 가능합니다.

export const tarotSpreads: TarotSpread[] = [
  {
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
    topics: ["general", "love", "career", "money"]
  },

  {
    spreadId: "celtic_cross",
    name: "Celtic Cross",
    nameKr: "켈틱 크로스",
    description: "가장 상세하고 포괄적인 10장 카드 배열",
    cardCount: 10,
    positions: [
      {
        position: 1,
        name: "현재 상황",
        description: "지금 당신이 처한 상황",
        x: 40,
        y: 50
      },
      {
        position: 2,
        name: "도전/십자가",
        description: "현재 마주하고 있는 문제나 도전",
        x: 40,
        y: 50
      },
      {
        position: 3,
        name: "먼 과거",
        description: "현재 상황의 근본 원인",
        x: 40,
        y: 20
      },
      {
        position: 4,
        name: "가까운 과거",
        description: "최근에 일어난 관련 사건",
        x: 15,
        y: 50
      },
      {
        position: 5,
        name: "가능한 미래",
        description: "가까운 미래에 일어날 수 있는 일",
        x: 65,
        y: 50
      },
      {
        position: 6,
        name: "가까운 미래",
        description: "곧 일어날 일",
        x: 40,
        y: 80
      },
      {
        position: 7,
        name: "당신의 접근",
        description: "상황에 대한 당신의 태도",
        x: 85,
        y: 80
      },
      {
        position: 8,
        name: "외부 영향",
        description: "주변 환경과 타인의 영향",
        x: 85,
        y: 60
      },
      {
        position: 9,
        name: "희망과 두려움",
        description: "당신의 기대와 걱정",
        x: 85,
        y: 40
      },
      {
        position: 10,
        name: "최종 결과",
        description: "모든 것을 고려한 최종적인 결과",
        x: 85,
        y: 20
      }
    ],
    isPremium: true,
    topics: ["general", "love", "career", "money"]
  },
  {
    spreadId: "relationship_cross",
    name: "Relationship Cross",
    nameKr: "관계 십자가",
    description: "두 사람 사이의 관계를 분석하는 5장 배열",
    cardCount: 5,
    positions: [
      {
        position: 1,
        name: "당신",
        description: "관계에서 당신의 상태",
        x: 20,
        y: 50
      },
      {
        position: 2,
        name: "상대방",
        description: "상대방의 상태",
        x: 80,
        y: 50
      },
      {
        position: 3,
        name: "관계의 현재",
        description: "현재 관계의 상태",
        x: 50,
        y: 50
      },
      {
        position: 4,
        name: "도전과제",
        description: "극복해야 할 문제",
        x: 50,
        y: 20
      },
      {
        position: 5,
        name: "잠재력",
        description: "관계의 가능성",
        x: 50,
        y: 80
      }
    ],
    isPremium: true,
    topics: ["love"]
  },
  {
    spreadId: "career_path",
    name: "Career Path",
    nameKr: "경력 경로",
    description: "직업과 경력에 대한 7장 배열",
    cardCount: 7,
    positions: [
      {
        position: 1,
        name: "현재 위치",
        description: "직업적 현재 상황",
        x: 50,
        y: 50
      },
      {
        position: 2,
        name: "강점",
        description: "당신의 직업적 강점",
        x: 25,
        y: 30
      },
      {
        position: 3,
        name: "약점",
        description: "개선이 필요한 부분",
        x: 75,
        y: 30
      },
      {
        position: 4,
        name: "기회",
        description: "다가오는 기회",
        x: 25,
        y: 70
      },
      {
        position: 5,
        name: "장애물",
        description: "극복해야 할 도전",
        x: 75,
        y: 70
      },
      {
        position: 6,
        name: "조언",
        description: "취해야 할 행동",
        x: 50,
        y: 20
      },
      {
        position: 7,
        name: "결과",
        description: "예상되는 결과",
        x: 50,
        y: 80
      }
    ],
    isPremium: true,
    topics: ["career"]
  },
  {
    spreadId: "year_ahead",
    name: "Year Ahead",
    nameKr: "한 해 전망",
    description: "앞으로 12개월을 전망하는 12장 배열",
    cardCount: 12,
    positions: Array.from({ length: 12 }, (_, i) => ({
      position: i + 1,
      name: `${i + 1}월`,
      description: `${i + 1}월의 주요 테마`,
      x: 50 + 40 * Math.cos((i * 30 - 90) * Math.PI / 180),
      y: 50 + 40 * Math.sin((i * 30 - 90) * Math.PI / 180)
    })),
    isPremium: true,
    topics: ["general"]
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
export const getSpreadsByTopic = (topic: string): TarotSpread[] => {
  return tarotSpreads.filter(spread => spread.topics.includes(topic));
};
