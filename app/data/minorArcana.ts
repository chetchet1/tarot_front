import { TarotCard } from '../models/tarot';

// 펜타클(Pentacles) - 물질, 일, 건강, 실용성
export const pentaclesCards: TarotCard[] = [
  {
    id: 64,
    name: "Ace of Pentacles",
    nameKr: "펜타클의 에이스",
    arcana: "minor",
    number: 1,
    suit: "pentacles",
    keywords: {
      upright: ["새로운 기회", "번영", "풍요", "시작"],
      reversed: ["기회 상실", "계획 부족", "탐욕", "물질주의"]
    },
    meanings: {
      general: {
        upright: "물질적 번영과 새로운 기회가 찾아옵니다.",
        reversed: "기회를 놓치거나 물질에 너무 집착하고 있습니다."
      },
      love: {
        upright: "안정적이고 실질적인 관계가 시작됩니다.",
        reversed: "물질적 조건에만 집중하여 사랑을 놓칠 수 있습니다."
      },
      career: {
        upright: "새로운 직업이나 승진의 기회가 있습니다.",
        reversed: "직업적 기회를 놓치거나 준비가 부족합니다."
      },
      money: {
        upright: "재정적 풍요와 새로운 수입원이 생깁니다.",
        reversed: "재정 기회를 놓치거나 잘못된 투자를 할 수 있습니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/01-ace-of-pentacles.png"
  },
  {
    id: 65,
    name: "Two of Pentacles",
    nameKr: "펜타클의 2",
    arcana: "minor",
    number: 2,
    suit: "pentacles",
    keywords: {
      upright: ["균형", "적응력", "시간 관리", "우선순위"],
      reversed: ["과부하", "균형 상실", "스트레스", "혼란"]
    },
    meanings: {
      general: {
        upright: "여러 책임을 능숙하게 관리하고 균형을 유지합니다.",
        reversed: "너무 많은 일로 균형을 잃고 스트레스를 받습니다."
      },
      love: {
        upright: "사랑과 일의 균형을 잘 유지합니다.",
        reversed: "관계와 다른 책임 사이에서 균형을 잃었습니다."
      },
      career: {
        upright: "멀티태스킹을 잘하고 유연하게 대처합니다.",
        reversed: "업무 과부하로 효율성이 떨어집니다."
      },
      money: {
        upright: "재정을 유연하게 관리하고 균형을 맞춥니다.",
        reversed: "재정 관리가 혼란스럽고 균형을 잃었습니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/02-two-of-pentacles.png"
  },
  {
    id: 66,
    name: "Three of Pentacles",
    nameKr: "펜타클의 3",
    arcana: "minor",
    number: 3,
    suit: "pentacles",
    keywords: {
      upright: ["팀워크", "기술", "협력", "성장"],
      reversed: ["불화", "품질 부족", "동기 부족", "갈등"]
    },
    meanings: {
      general: {
        upright: "협력과 전문성으로 프로젝트가 성공합니다.",
        reversed: "팀워크가 부족하거나 품질이 떨어집니다."
      },
      love: {
        upright: "관계에서 함께 성장하고 건설적으로 협력합니다.",
        reversed: "관계에서 협력이 부족하거나 갈등이 있습니다."
      },
      career: {
        upright: "팀 프로젝트가 성공하고 기술이 인정받습니다.",
        reversed: "직장에서 협력이 어렵거나 인정받지 못합니다."
      },
      money: {
        upright: "공동 투자나 협력이 재정적 이익을 가져옵니다.",
        reversed: "재정적 파트너십에 문제가 있습니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/03-three-of-pentacles.png"
  },
  {
    id: 67,
    name: "Four of Pentacles",
    nameKr: "펜타클의 4",
    arcana: "minor",
    number: 4,
    suit: "pentacles",
    keywords: {
      upright: ["안정", "보수", "소유", "통제"],
      reversed: ["탐욕", "물질주의", "자기 보호", "손실 두려움"]
    },
    meanings: {
      general: {
        upright: "안정과 보안을 중시하지만 너무 경직되지 마세요.",
        reversed: "소유욕이 지나치거나 변화를 두려워합니다."
      },
      love: {
        upright: "안정적인 관계를 원하지만 소유욕을 조심하세요.",
        reversed: "관계에서 지나치게 소유욕이 강하거나 인색합니다."
      },
      career: {
        upright: "직업적 안정을 유지하지만 새로운 기회도 고려하세요.",
        reversed: "현재 위치에 너무 집착하여 성장을 놓칩니다."
      },
      money: {
        upright: "재정을 안전하게 관리하지만 너무 인색하지 마세요.",
        reversed: "돈에 대한 집착이 지나치거나 손실을 두려워합니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/04-four-of-pentacles.png"
  },
  {
    id: 68,
    name: "Five of Pentacles",
    nameKr: "펜타클의 5",
    arcana: "minor",
    number: 5,
    suit: "pentacles",
    keywords: {
      upright: ["재정 손실", "빈곤", "고립", "불안"],
      reversed: ["회복", "영적 풍요", "극복", "희망"]
    },
    meanings: {
      general: {
        upright: "물질적 어려움이나 고립감을 경험합니다.",
        reversed: "어려움에서 벗어나기 시작하고 희망을 찾습니다."
      },
      love: {
        upright: "관계에서 정서적 또는 물질적 부족을 느낍니다.",
        reversed: "관계의 어려움을 극복하고 회복됩니다."
      },
      career: {
        upright: "실직이나 직업적 어려움을 겪을 수 있습니다.",
        reversed: "직업적 어려움에서 벗어나 재기합니다."
      },
      money: {
        upright: "심각한 재정적 어려움이나 손실이 있습니다.",
        reversed: "재정 상황이 개선되기 시작합니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/05-five-of-pentacles.png"
  },
  {
    id: 69,
    name: "Six of Pentacles",
    nameKr: "펜타클의 6",
    arcana: "minor",
    number: 6,
    suit: "pentacles",
    keywords: {
      upright: ["관대함", "자선", "공정", "나눔"],
      reversed: ["이기심", "빚", "불평등", "조건부 도움"]
    },
    meanings: {
      general: {
        upright: "풍요를 나누고 공정한 교환이 이루어집니다.",
        reversed: "불공정한 교환이나 조건부 도움을 조심하세요."
      },
      love: {
        upright: "관계에서 주고받음이 균형을 이룹니다.",
        reversed: "관계에서 일방적이거나 불균형이 있습니다."
      },
      career: {
        upright: "멘토링을 주거나 받으며 공정한 대우를 받습니다.",
        reversed: "직장에서 불공정한 대우나 착취가 있을 수 있습니다."
      },
      money: {
        upright: "재정적 여유가 있어 나눌 수 있습니다.",
        reversed: "재정적 불균형이나 부채 문제가 있습니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/06-six-of-pentacles.png"
  },
  {
    id: 70,
    name: "Seven of Pentacles",
    nameKr: "펜타클의 7",
    arcana: "minor",
    number: 7,
    suit: "pentacles",
    keywords: {
      upright: ["인내", "투자", "장기 보상", "평가"],
      reversed: ["조급함", "낮은 수익", "좌절", "방향 전환"]
    },
    meanings: {
      general: {
        upright: "노력의 결과를 평가하고 인내심을 가집니다.",
        reversed: "결과에 실망하거나 방향 전환이 필요합니다."
      },
      love: {
        upright: "관계에 투자한 노력이 서서히 결실을 맺습니다.",
        reversed: "관계의 진전이 기대에 못 미칩니다."
      },
      career: {
        upright: "장기 프로젝트가 진전을 보이기 시작합니다.",
        reversed: "직업적 노력이 충분한 보상을 가져오지 못합니다."
      },
      money: {
        upright: "장기 투자가 서서히 수익을 내기 시작합니다.",
        reversed: "투자 수익이 기대에 못 미치거나 전략 변경이 필요합니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/07-seven-of-pentacles.png"
  },
  {
    id: 71,
    name: "Eight of Pentacles",
    nameKr: "펜타클의 8",
    arcana: "minor",
    number: 8,
    suit: "pentacles",
    keywords: {
      upright: ["기술 향상", "헌신", "장인정신", "교육"],
      reversed: ["완벽주의", "야망 부족", "지루함", "낮은 품질"]
    },
    meanings: {
      general: {
        upright: "기술을 연마하고 전문성을 키우는데 집중합니다.",
        reversed: "완벽주의에 빠지거나 동기가 부족합니다."
      },
      love: {
        upright: "관계를 개선하기 위해 노력하고 헌신합니다.",
        reversed: "관계에서 노력이 부족하거나 지루함을 느낍니다."
      },
      career: {
        upright: "직업 기술을 향상시키고 전문가가 됩니다.",
        reversed: "일에 대한 열정을 잃거나 품질이 떨어집니다."
      },
      money: {
        upright: "꾸준한 노력으로 재정이 안정적으로 성장합니다.",
        reversed: "재정 관리에 소홀하거나 수입이 정체됩니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/08-eight-of-pentacles.png"
  },
  {
    id: 72,
    name: "Nine of Pentacles",
    nameKr: "펜타클의 9",
    arcana: "minor",
    number: 9,
    suit: "pentacles",
    keywords: {
      upright: ["독립", "사치", "자급자족", "성취"],
      reversed: ["과시", "물질주의", "외로움", "과로"]
    },
    meanings: {
      general: {
        upright: "노력의 결실로 독립과 풍요를 즐깁니다.",
        reversed: "물질적 성공이 있지만 정서적으로 공허합니다."
      },
      love: {
        upright: "독립적이면서도 만족스러운 관계를 유지합니다.",
        reversed: "성공에도 불구하고 사랑에서 외로움을 느낍니다."
      },
      career: {
        upright: "직업적 성공과 독립을 달성했습니다.",
        reversed: "일에만 치중하여 삶의 균형을 잃었습니다."
      },
      money: {
        upright: "재정적 독립과 안정을 달성했습니다.",
        reversed: "돈은 있지만 진정한 만족을 느끼지 못합니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/09-nine-of-pentacles.png"
  },
  {
    id: 73,
    name: "Ten of Pentacles",
    nameKr: "펜타클의 10",
    arcana: "minor",
    number: 10,
    suit: "pentacles",
    keywords: {
      upright: ["유산", "가족", "장기적 성공", "전통"],
      reversed: ["가족 갈등", "재정 손실", "유산 문제", "불안정"]
    },
    meanings: {
      general: {
        upright: "장기적인 안정과 가족의 번영을 이룹니다.",
        reversed: "가족이나 유산과 관련된 문제가 있습니다."
      },
      love: {
        upright: "안정적이고 장기적인 관계나 가정을 이룹니다.",
        reversed: "가족 문제로 인해 관계가 어려워질 수 있습니다."
      },
      career: {
        upright: "장기적인 사업 성공이나 은퇴를 준비합니다.",
        reversed: "사업이나 직장의 안정성이 위협받습니다."
      },
      money: {
        upright: "세대를 걸친 재정적 안정과 풍요를 달성합니다.",
        reversed: "재정적 유산이나 장기 투자에 문제가 생깁니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/10-ten-of-pentacles.png"
  },
  {
    id: 74,
    name: "Page of Pentacles",
    nameKr: "펜타클의 시종",
    arcana: "minor",
    number: 11,
    suit: "pentacles",
    keywords: {
      upright: ["학습", "새로운 기회", "실용적", "목표 설정"],
      reversed: ["게으름", "기회 놓침", "집중력 부족", "미성숙"]
    },
    meanings: {
      general: {
        upright: "새로운 학습이나 실용적인 기회가 생깁니다.",
        reversed: "집중력이 부족하거나 기회를 놓칠 수 있습니다."
      },
      love: {
        upright: "안정적이고 실용적인 새로운 관계가 시작됩니다.",
        reversed: "관계에서 미성숙하거나 비현실적인 기대를 가집니다."
      },
      career: {
        upright: "새로운 직업 교육이나 실습 기회가 있습니다.",
        reversed: "직업적 기회를 놓치거나 준비가 부족합니다."
      },
      money: {
        upright: "새로운 수입 기회나 재정 교육의 기회가 있습니다.",
        reversed: "재정 관리에 대한 학습이 부족하거나 기회를 놓칩니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/11-page-of-pentacles.png"
  },
  {
    id: 75,
    name: "Knight of Pentacles",
    nameKr: "펜타클의 기사",
    arcana: "minor",
    number: 12,
    suit: "pentacles",
    keywords: {
      upright: ["근면", "책임감", "보수적", "신뢰"],
      reversed: ["게으름", "지루함", "완고함", "정체"]
    },
    meanings: {
      general: {
        upright: "꾸준하고 성실하게 목표를 향해 나아갑니다.",
        reversed: "진전이 너무 느리거나 융통성이 부족합니다."
      },
      love: {
        upright: "안정적이고 헌신적인 파트너가 됩니다.",
        reversed: "관계에서 지루하거나 융통성이 없을 수 있습니다."
      },
      career: {
        upright: "성실하고 꾸준한 노력으로 성과를 냅니다.",
        reversed: "업무 진전이 너무 느리거나 동기가 부족합니다."
      },
      money: {
        upright: "안전하고 보수적인 재정 관리를 합니다.",
        reversed: "재정 성장이 정체되거나 너무 보수적입니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/12-knight-of-pentacles.png"
  },
  {
    id: 76,
    name: "Queen of Pentacles",
    nameKr: "펜타클의 여왕",
    arcana: "minor",
    number: 13,
    suit: "pentacles",
    keywords: {
      upright: ["실용적", "양육", "풍요", "안정"],
      reversed: ["의존적", "질투", "물질주의", "불안정"]
    },
    meanings: {
      general: {
        upright: "실용적이고 양육적인 에너지로 풍요를 창조합니다.",
        reversed: "물질에 너무 의존하거나 불안정할 수 있습니다."
      },
      love: {
        upright: "안정적이고 양육적인 사랑을 제공합니다.",
        reversed: "관계에서 물질적인 면에만 집중할 수 있습니다."
      },
      career: {
        upright: "실용적인 접근으로 직장에서 성공합니다.",
        reversed: "직장에서 불안정하거나 물질주의적일 수 있습니다."
      },
      money: {
        upright: "재정을 현명하게 관리하고 풍요를 창조합니다.",
        reversed: "재정적 불안정이나 과도한 물질주의를 경계하세요."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/13-queen-of-pentacles.png"
  },
  {
    id: 77,
    name: "King of Pentacles",
    nameKr: "펜타클의 왕",
    arcana: "minor",
    number: 14,
    suit: "pentacles",
    keywords: {
      upright: ["부", "사업 성공", "리더십", "안정"],
      reversed: ["탐욕", "물질주의", "독재적", "부패"]
    },
    meanings: {
      general: {
        upright: "물질적 성공과 안정을 통해 리더십을 발휘합니다.",
        reversed: "물질에 대한 집착이나 부패를 경계하세요."
      },
      love: {
        upright: "안정적이고 풍요로운 관계를 제공합니다.",
        reversed: "관계에서 물질적인 것만 중시할 수 있습니다."
      },
      career: {
        upright: "사업이나 직장에서 큰 성공을 거둡니다.",
        reversed: "직장에서 독재적이거나 부패할 수 있습니다."
      },
      money: {
        upright: "재정적 제국을 건설하고 부를 창출합니다.",
        reversed: "탐욕이나 부정한 방법으로 부를 추구할 수 있습니다."
      }
    },
    element: "지구",
    imageUrl: "~/assets/tarot-cards/minor/pentacles/14-king-of-pentacles.png"
  }
];
