import { TarotCard } from '../models/tarot';

export const majorArcanaCards: TarotCard[] = [
  {
    id: 0,
    name: "The Fool",
    nameKr: "바보",
    arcana: "major",
    number: 0,
    keywords: {
      upright: ["새로운 시작", "모험", "순수함", "자유로움"],
      reversed: ["무모함", "부주의", "미성숙", "방향성 상실"]
    },
    meanings: {
      general: {
        upright: "새로운 모험을 시작할 준비가 되었습니다. 순수한 마음으로 도전하면 좋은 결과를 얻을 수 있습니다.",
        reversed: "성급한 결정을 내리지 마세요. 충분한 준비와 계획이 필요한 시점입니다."
      },
      love: {
        upright: "새로운 만남이나 관계의 시작을 의미합니다. 열린 마음으로 상대방을 받아들이세요.",
        reversed: "관계에서 신중함이 필요합니다. 감정에만 의존하지 말고 현실적으로 생각해보세요."
      },
      career: {
        upright: "새로운 직업이나 프로젝트 시작에 좋은 시기입니다. 두려워하지 말고 도전하세요.",
        reversed: "현재 상황을 더 분석하고 계획을 세운 후 움직이는 것이 좋겠습니다."
      },
      money: {
        upright: "새로운 투자 기회가 있을 수 있습니다. 하지만 신중한 판단이 필요합니다.",
        reversed: "무모한 투자는 피하고, 안정적인 재정 관리에 집중하세요."
      }
    },
    element: "공기",
    astrology: "천왕성",
    imageUrl: "~/assets/tarot-cards/major/00-the-fool.png"
  },
  {
    id: 1,
    name: "The Magician",
    nameKr: "마법사",
    arcana: "major",
    number: 1,
    keywords: {
      upright: ["의지력", "창조력", "재능", "능력", "집중"],
      reversed: ["조작", "속임수", "재능 낭비", "계획 부족"]
    },
    meanings: {
      general: {
        upright: "당신은 원하는 것을 이룰 수 있는 모든 도구와 능력을 가지고 있습니다. 집중하고 행동하세요.",
        reversed: "재능을 제대로 활용하지 못하고 있습니다. 목표를 명확히 하고 계획을 세우세요."
      },
      love: {
        upright: "매력적인 시기입니다. 자신감을 가지고 원하는 관계를 만들어갈 수 있습니다.",
        reversed: "관계에서 진실하지 못한 면이 있을 수 있습니다. 솔직한 소통이 필요합니다."
      },
      career: {
        upright: "능력을 발휘할 좋은 기회입니다. 자신감을 가지고 목표를 향해 나아가세요.",
        reversed: "능력은 있지만 방향성이 부족합니다. 구체적인 계획을 세우세요."
      },
      money: {
        upright: "재정적 기회를 잘 활용할 수 있는 시기입니다. 현명한 결정을 내리세요.",
        reversed: "재정 관리에 더 신경 써야 합니다. 충동적인 지출을 피하세요."
      }
    },
    element: "공기",
    astrology: "수성",
    imageUrl: "~/assets/tarot-cards/major/01-the-magician.png"
  },
  {
    id: 2,
    name: "The High Priestess",
    nameKr: "여사제",
    arcana: "major",
    number: 2,
    keywords: {
      upright: ["직관", "신비", "잠재의식", "내면의 목소리"],
      reversed: ["숨겨진 것", "혼란", "불신", "표면적 지식"]
    },
    meanings: {
      general: {
        upright: "내면의 목소리에 귀 기울이세요. 직관이 올바른 길로 인도할 것입니다.",
        reversed: "중요한 정보가 숨겨져 있을 수 있습니다. 더 깊이 파고들어 진실을 찾으세요."
      },
      love: {
        upright: "감정의 깊이를 탐구하는 시기입니다. 서두르지 말고 천천히 관계를 발전시키세요.",
        reversed: "관계에서 소통 부족이 문제가 될 수 있습니다. 감정을 숨기지 마세요."
      },
      career: {
        upright: "직관을 따르면 좋은 결과가 있을 것입니다. 내면의 지혜를 신뢰하세요.",
        reversed: "더 많은 정보가 필요합니다. 성급한 결정은 피하세요."
      },
      money: {
        upright: "재정 상황을 깊이 분석할 필요가 있습니다. 숨겨진 기회를 찾으세요.",
        reversed: "재정 정보를 더 투명하게 관리하세요. 숨겨진 비용에 주의하세요."
      }
    },
    element: "물",
    astrology: "달",
    imageUrl: "~/assets/tarot-cards/major/02-the-high-priestess.png"
  },
  {
    id: 3,
    name: "The Empress",
    nameKr: "여황제",
    arcana: "major",
    number: 3,
    keywords: {
      upright: ["풍요", "모성", "창조", "자연", "아름다움"],
      reversed: ["창조력 부족", "의존", "과보호", "불임"]
    },
    meanings: {
      general: {
        upright: "풍요롭고 창조적인 시기입니다. 아이디어가 결실을 맺을 것입니다.",
        reversed: "자기 관리에 더 신경 쓰세요. 창조력을 회복할 시간이 필요합니다."
      },
      love: {
        upright: "사랑이 꽃피는 시기입니다. 관계가 깊어지고 풍요로워질 것입니다.",
        reversed: "관계에서 지나친 의존이나 질투를 경계하세요. 균형이 필요합니다."
      },
      career: {
        upright: "창의적인 프로젝트에 좋은 시기입니다. 아이디어를 실현시키세요.",
        reversed: "업무에서 동기부여가 부족할 수 있습니다. 재충전이 필요합니다."
      },
      money: {
        upright: "재정적 풍요가 예상됩니다. 투자의 결실을 볼 수 있습니다.",
        reversed: "과소비를 주의하세요. 재정 계획을 재검토할 필요가 있습니다."
      }
    },
    element: "지구",
    astrology: "금성",
    imageUrl: "~/assets/tarot-cards/major/03-the-empress.png"
  },
  {
    id: 4,
    name: "The Emperor",
    nameKr: "황제",
    arcana: "major",
    number: 4,
    keywords: {
      upright: ["권위", "구조", "통제", "아버지상", "안정"],
      reversed: ["독재", "경직", "통제력 상실", "미성숙"]
    },
    meanings: {
      general: {
        upright: "리더십을 발휘할 시기입니다. 체계적으로 계획하고 실행하세요.",
        reversed: "지나친 통제욕을 버리세요. 유연성이 필요한 상황입니다."
      },
      love: {
        upright: "안정적인 관계를 구축할 수 있습니다. 책임감 있는 태도가 중요합니다.",
        reversed: "관계에서 지배적이거나 경직된 태도를 조심하세요."
      },
      career: {
        upright: "리더십 위치에 오를 기회입니다. 권위를 현명하게 사용하세요.",
        reversed: "직장에서 권위에 도전받을 수 있습니다. 협력적인 자세가 필요합니다."
      },
      money: {
        upright: "재정을 체계적으로 관리하면 안정을 찾을 수 있습니다.",
        reversed: "재정 통제력을 잃을 수 있습니다. 예산을 재검토하세요."
      }
    },
    element: "불",
    astrology: "양자리",
    imageUrl: "~/assets/tarot-cards/major/04-the-emperor.png"
  },
  {
    id: 5,
    name: "The Hierophant",
    nameKr: "교황",
    arcana: "major",
    number: 5,
    keywords: {
      upright: ["전통", "교육", "믿음", "순응", "도덕"],
      reversed: ["반항", "비전통", "자유사상", "도전"]
    },
    meanings: {
      general: {
        upright: "전통적인 방법과 지혜를 따르면 좋은 결과를 얻을 수 있습니다.",
        reversed: "기존의 방식에 도전할 때입니다. 자신만의 길을 찾으세요."
      },
      love: {
        upright: "전통적인 관계나 결혼을 생각하는 시기일 수 있습니다.",
        reversed: "관계에서 자유로운 형태를 추구할 수 있습니다. 고정관념을 버리세요."
      },
      career: {
        upright: "멘토를 찾거나 전통적인 방법을 배우면 도움이 됩니다.",
        reversed: "혁신적인 접근이 필요합니다. 틀을 깨는 사고를 하세요."
      },
      money: {
        upright: "안전하고 전통적인 투자가 좋습니다. 전문가의 조언을 구하세요.",
        reversed: "새로운 재정 전략을 시도해볼 때입니다. 다양성을 추구하세요."
      }
    },
    element: "지구",
    astrology: "황소자리",
    imageUrl: "~/assets/tarot-cards/major/05-the-hierophant.png"
  },
  {
    id: 6,
    name: "The Lovers",
    nameKr: "연인들",
    arcana: "major",
    number: 6,
    keywords: {
      upright: ["사랑", "조화", "관계", "가치관", "선택"],
      reversed: ["불화", "가치관 충돌", "불균형", "잘못된 선택"]
    },
    meanings: {
      general: {
        upright: "중요한 선택을 해야 할 시기입니다. 마음이 이끄는 대로 따르세요.",
        reversed: "내적 갈등이나 관계의 불화를 해결해야 합니다."
      },
      love: {
        upright: "사랑이 깊어지거나 새로운 사랑이 시작될 수 있습니다.",
        reversed: "관계에서 소통 문제나 가치관 차이를 극복해야 합니다."
      },
      career: {
        upright: "일에서 파트너십이 중요합니다. 협력하면 좋은 결과를 얻습니다.",
        reversed: "직장에서 갈등이 있을 수 있습니다. 타협점을 찾으세요."
      },
      money: {
        upright: "재정적 파트너십이나 공동 투자가 유리할 수 있습니다.",
        reversed: "재정 문제로 인한 갈등을 조심하세요. 투명한 소통이 필요합니다."
      }
    },
    element: "공기",
    astrology: "쌍둥이자리",
    imageUrl: "~/assets/tarot-cards/major/06-the-lovers.png"
  },
  {
    id: 7,
    name: "The Chariot",
    nameKr: "전차",
    arcana: "major",
    number: 7,
    keywords: {
      upright: ["승리", "의지력", "통제", "결단력", "성공"],
      reversed: ["방향 상실", "통제력 부족", "공격성", "장애물"]
    },
    meanings: {
      general: {
        upright: "목표를 향해 전진할 때입니다. 의지력으로 승리를 쟁취하세요.",
        reversed: "방향을 재설정할 필요가 있습니다. 무모한 전진은 위험합니다."
      },
      love: {
        upright: "관계에서 주도권을 잡고 원하는 방향으로 이끌 수 있습니다.",
        reversed: "관계에서 지나친 통제나 공격성을 조심하세요."
      },
      career: {
        upright: "경력에서 큰 전진이 있을 것입니다. 자신감을 가지세요.",
        reversed: "목표를 재검토하고 전략을 수정할 필요가 있습니다."
      },
      money: {
        upright: "재정 목표를 달성할 수 있습니다. 계획대로 추진하세요.",
        reversed: "재정 계획이 틀어질 수 있습니다. 유연하게 대처하세요."
      }
    },
    element: "물",
    astrology: "게자리",
    imageUrl: "~/assets/tarot-cards/major/07-the-chariot.png"
  },
  {
    id: 8,
    name: "Strength",
    nameKr: "힘",
    arcana: "major",
    number: 8,
    keywords: {
      upright: ["내면의 힘", "용기", "인내", "자제력", "연민"],
      reversed: ["자기 의심", "약함", "조급함", "통제력 상실"]
    },
    meanings: {
      general: {
        upright: "내면의 힘으로 어려움을 극복할 수 있습니다. 인내심을 가지세요.",
        reversed: "자신감을 회복할 필요가 있습니다. 자기 자신을 믿으세요."
      },
      love: {
        upright: "사랑으로 관계의 어려움을 극복할 수 있습니다. 인내심이 필요합니다.",
        reversed: "관계에서 자신감 부족이나 의존성을 극복해야 합니다."
      },
      career: {
        upright: "어려운 과제도 인내심으로 해결할 수 있습니다. 포기하지 마세요.",
        reversed: "업무 스트레스로 지쳐있을 수 있습니다. 휴식이 필요합니다."
      },
      money: {
        upright: "재정적 어려움을 인내심으로 극복할 수 있습니다.",
        reversed: "재정 관리에 대한 자제력을 키워야 합니다."
      }
    },
    element: "불",
    astrology: "사자자리",
    imageUrl: "~/assets/tarot-cards/major/08-strength.png"
  },
  {
    id: 9,
    name: "The Hermit",
    nameKr: "은둔자",
    arcana: "major",
    number: 9,
    keywords: {
      upright: ["내면 탐구", "지혜", "고독", "안내", "성찰"],
      reversed: ["고립", "외로움", "철수", "반사회적"]
    },
    meanings: {
      general: {
        upright: "내면을 들여다보고 진정한 답을 찾을 시기입니다. 성찰이 필요합니다.",
        reversed: "지나친 고립은 피하세요. 다른 사람과의 연결이 필요합니다."
      },
      love: {
        upright: "혼자만의 시간이 필요하거나 관계를 되돌아볼 시기입니다.",
        reversed: "외로움을 느낄 수 있습니다. 마음을 열고 소통하세요."
      },
      career: {
        upright: "독립적으로 일하거나 전문성을 기를 좋은 시기입니다.",
        reversed: "팀워크가 부족할 수 있습니다. 협력의 중요성을 인식하세요."
      },
      money: {
        upright: "재정 상황을 신중히 검토하고 현명한 결정을 내리세요.",
        reversed: "재정 조언을 구하는 것이 좋습니다. 혼자 결정하지 마세요."
      }
    },
    element: "지구",
    astrology: "처녀자리",
    imageUrl: "~/assets/tarot-cards/major/09-the-hermit.png"
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    nameKr: "운명의 수레바퀴",
    arcana: "major",
    number: 10,
    keywords: {
      upright: ["행운", "변화", "사이클", "운명", "전환점"],
      reversed: ["불운", "통제력 부족", "나쁜 타이밍", "저항"]
    },
    meanings: {
      general: {
        upright: "운명의 바퀴가 당신에게 유리하게 돌고 있습니다. 기회를 잡으세요.",
        reversed: "일시적인 어려움이 있을 수 있습니다. 이 또한 지나갈 것입니다."
      },
      love: {
        upright: "관계에 긍정적인 변화가 일어날 것입니다. 운명적인 만남이 있을 수 있습니다.",
        reversed: "관계의 어려운 시기일 수 있습니다. 인내심을 가지세요."
      },
      career: {
        upright: "경력에 중요한 전환점이 올 것입니다. 새로운 기회를 잡으세요.",
        reversed: "일시적인 정체기입니다. 준비하고 기다리세요."
      },
      money: {
        upright: "재정 운이 좋아질 것입니다. 투자 기회를 잘 활용하세요.",
        reversed: "재정적으로 어려운 시기일 수 있습니다. 신중하게 관리하세요."
      }
    },
    element: "불",
    astrology: "목성",
    imageUrl: "~/assets/tarot-cards/major/10-wheel-of-fortune.png"
  },
  {
    id: 11,
    name: "Justice",
    nameKr: "정의",
    arcana: "major",
    number: 11,
    keywords: {
      upright: ["공정", "진실", "인과", "법", "균형"],
      reversed: ["불공정", "부정직", "책임 회피", "편견"]
    },
    meanings: {
      general: {
        upright: "공정한 결과를 얻을 것입니다. 진실이 밝혀지고 정의가 실현됩니다.",
        reversed: "불공정한 상황에 직면할 수 있습니다. 자신의 행동을 돌아보세요."
      },
      love: {
        upright: "관계에서 균형과 공정함이 중요합니다. 서로를 존중하세요.",
        reversed: "관계에서 불균형이나 불공정함을 느낄 수 있습니다."
      },
      career: {
        upright: "노력한 만큼 정당한 대가를 받을 것입니다. 공정한 평가를 받습니다.",
        reversed: "직장에서 불공정한 대우를 받을 수 있습니다. 권리를 주장하세요."
      },
      money: {
        upright: "재정적으로 균형을 찾을 수 있습니다. 공정한 거래를 하세요.",
        reversed: "재정적 분쟁이나 불공정한 거래를 조심하세요."
      }
    },
    element: "공기",
    astrology: "천칭자리",
    imageUrl: "~/assets/tarot-cards/major/11-justice.png"
  },
  {
    id: 12,
    name: "The Hanged Man",
    nameKr: "매달린 사람",
    arcana: "major",
    number: 12,
    keywords: {
      upright: ["희생", "관점 전환", "보류", "명상", "새로운 시각"],
      reversed: ["지연", "저항", "정체", "희생 거부"]
    },
    meanings: {
      general: {
        upright: "다른 관점에서 상황을 바라보세요. 희생이 필요할 수 있지만 가치가 있습니다.",
        reversed: "변화를 거부하고 있습니다. 새로운 관점을 받아들이세요."
      },
      love: {
        upright: "관계를 다른 각도에서 보면 해답을 찾을 수 있습니다.",
        reversed: "관계에서 희생만 하고 있다면 균형을 찾으세요."
      },
      career: {
        upright: "잠시 멈추고 상황을 재평가하세요. 새로운 접근이 필요합니다.",
        reversed: "경력이 정체되어 있습니다. 변화를 두려워하지 마세요."
      },
      money: {
        upright: "단기적 손실이 장기적 이익으로 이어질 수 있습니다.",
        reversed: "재정적 정체에서 벗어나기 위한 새로운 전략이 필요합니다."
      }
    },
    element: "물",
    astrology: "해왕성",
    imageUrl: "~/assets/tarot-cards/major/12-the-hanged-man.png"
  },
  {
    id: 13,
    name: "Death",
    nameKr: "죽음",
    arcana: "major",
    number: 13,
    keywords: {
      upright: ["변화", "끝", "전환", "재생", "새로운 시작"],
      reversed: ["변화 거부", "정체", "두려움", "반복"]
    },
    meanings: {
      general: {
        upright: "큰 변화의 시기입니다. 낡은 것을 버리고 새로운 것을 받아들이세요.",
        reversed: "필요한 변화를 거부하고 있습니다. 과거를 놓아주세요."
      },
      love: {
        upright: "관계의 한 단계가 끝나고 새로운 단계가 시작됩니다.",
        reversed: "끝난 관계에 매달리지 마세요. 새로운 시작을 받아들이세요."
      },
      career: {
        upright: "경력의 전환점입니다. 새로운 방향으로 나아갈 준비를 하세요.",
        reversed: "변화가 필요한데도 현재 상황에 안주하고 있습니다."
      },
      money: {
        upright: "재정 전략의 전면적인 변화가 필요합니다.",
        reversed: "오래된 재정 습관을 버리지 못하고 있습니다."
      }
    },
    element: "물",
    astrology: "전갈자리",
    imageUrl: "~/assets/tarot-cards/major/13-death.png"
  },
  {
    id: 14,
    name: "Temperance",
    nameKr: "절제",
    arcana: "major",
    number: 14,
    keywords: {
      upright: ["균형", "조화", "인내", "중용", "치유"],
      reversed: ["불균형", "과도함", "조급함", "갈등"]
    },
    meanings: {
      general: {
        upright: "균형과 조화를 통해 목표를 달성할 수 있습니다. 인내심을 가지세요.",
        reversed: "삶의 균형이 깨져 있습니다. 중용을 찾으세요."
      },
      love: {
        upright: "관계에서 조화와 균형을 찾을 수 있습니다. 서로를 이해하세요.",
        reversed: "관계에서 극단적인 감정이나 행동을 조심하세요."
      },
      career: {
        upright: "일과 삶의 균형을 잘 유지하면 성공할 수 있습니다.",
        reversed: "일에 너무 치우쳐 있거나 소홀히 하고 있습니다."
      },
      money: {
        upright: "재정을 균형있게 관리하면 안정을 찾을 수 있습니다.",
        reversed: "과소비나 지나친 절약 모두 피하세요."
      }
    },
    element: "불",
    astrology: "궁수자리",
    imageUrl: "~/assets/tarot-cards/major/14-temperance.png"
  },
  {
    id: 15,
    name: "The Devil",
    nameKr: "악마",
    arcana: "major",
    number: 15,
    keywords: {
      upright: ["속박", "유혹", "물질주의", "중독", "두려움"],
      reversed: ["해방", "극복", "자유", "각성"]
    },
    meanings: {
      general: {
        upright: "무언가에 속박되어 있습니다. 당신을 가두는 것이 무엇인지 인식하세요.",
        reversed: "속박에서 벗어날 준비가 되었습니다. 자유를 향해 나아가세요."
      },
      love: {
        upright: "건강하지 못한 관계나 집착에 주의하세요.",
        reversed: "해로운 관계 패턴에서 벗어나고 있습니다."
      },
      career: {
        upright: "일에 너무 매여 있거나 건강하지 못한 환경에 있을 수 있습니다.",
        reversed: "직장의 부정적인 상황에서 벗어날 수 있습니다."
      },
      money: {
        upright: "물질에 대한 집착이나 재정적 속박에 주의하세요.",
        reversed: "재정적 자유를 향해 나아가고 있습니다."
      }
    },
    element: "지구",
    astrology: "염소자리",
    imageUrl: "~/assets/tarot-cards/major/15-the-devil.png"
  },
  {
    id: 16,
    name: "The Tower",
    nameKr: "탑",
    arcana: "major",
    number: 16,
    keywords: {
      upright: ["파괴", "혼란", "갑작스런 변화", "계시", "해방"],
      reversed: ["재난 회피", "변화 지연", "두려움", "저항"]
    },
    meanings: {
      general: {
        upright: "갑작스럽고 파괴적인 변화가 일어나지만, 이는 필요한 변화입니다.",
        reversed: "다가오는 변화를 피하려 하지만, 결국 직면해야 합니다."
      },
      love: {
        upright: "관계에 충격적인 변화가 있을 수 있습니다. 진실이 드러납니다.",
        reversed: "관계의 문제를 계속 피하면 더 큰 문제가 될 수 있습니다."
      },
      career: {
        upright: "직장에서 갑작스러운 변화나 구조조정이 있을 수 있습니다.",
        reversed: "피할 수 없는 변화가 다가오고 있습니다. 준비하세요."
      },
      money: {
        upright: "재정적 충격이 있을 수 있습니다. 비상금을 준비하세요.",
        reversed: "재정 위기를 겨우 피했지만 주의가 필요합니다."
      }
    },
    element: "불",
    astrology: "화성",
    imageUrl: "~/assets/tarot-cards/major/16-the-tower.png"
  },
  {
    id: 17,
    name: "The Star",
    nameKr: "별",
    arcana: "major",
    number: 17,
    keywords: {
      upright: ["희망", "영감", "평온", "재생", "치유"],
      reversed: ["절망", "신념 부족", "실망", "부정적 사고"]
    },
    meanings: {
      general: {
        upright: "희망을 잃지 마세요. 어려움 뒤에 평화와 치유가 찾아옵니다.",
        reversed: "희망을 잃었을 수 있지만, 다시 빛을 찾을 수 있습니다."
      },
      love: {
        upright: "사랑에 대한 희망과 믿음을 가지세요. 좋은 일이 일어날 것입니다.",
        reversed: "사랑에 대한 실망을 극복하고 다시 마음을 열어야 합니다."
      },
      career: {
        upright: "경력에 새로운 희망과 기회가 찾아옵니다. 꿈을 추구하세요.",
        reversed: "직업적 목표에 대한 확신이 부족합니다. 비전을 재정립하세요."
      },
      money: {
        upright: "재정 상황이 개선될 것입니다. 긍정적인 전망을 가지세요.",
        reversed: "재정적 어려움으로 좌절하지 마세요. 희망을 잃지 마세요."
      }
    },
    element: "공기",
    astrology: "물병자리",
    imageUrl: "~/assets/tarot-cards/major/17-the-star.png"
  },
  {
    id: 18,
    name: "The Moon",
    nameKr: "달",
    arcana: "major",
    number: 18,
    keywords: {
      upright: ["환상", "두려움", "불안", "잠재의식", "직관"],
      reversed: ["혼란 해소", "두려움 극복", "진실 발견", "명확성"]
    },
    meanings: {
      general: {
        upright: "모든 것이 보이는 그대로는 아닙니다. 직관을 따르되 주의하세요.",
        reversed: "혼란이 걷히고 진실이 드러나고 있습니다."
      },
      love: {
        upright: "관계에서 숨겨진 것이 있거나 오해가 있을 수 있습니다.",
        reversed: "관계의 오해가 풀리고 진실이 밝혀집니다."
      },
      career: {
        upright: "직장에서 명확하지 않은 상황이 있습니다. 섣불리 판단하지 마세요.",
        reversed: "업무 상황이 명확해지고 방향을 찾을 수 있습니다."
      },
      money: {
        upright: "재정 상황이 불명확합니다. 숨겨진 비용에 주의하세요.",
        reversed: "재정 상황에 대한 명확한 이해를 얻게 됩니다."
      }
    },
    element: "물",
    astrology: "물고기자리",
    imageUrl: "~/assets/tarot-cards/major/18-the-moon.png"
  },
  {
    id: 19,
    name: "The Sun",
    nameKr: "태양",
    arcana: "major",
    number: 19,
    keywords: {
      upright: ["성공", "기쁨", "행복", "활력", "긍정"],
      reversed: ["일시적 좌절", "낙관주의 부족", "우울", "지연된 성공"]
    },
    meanings: {
      general: {
        upright: "밝고 행복한 시기입니다. 성공과 기쁨이 당신을 기다립니다.",
        reversed: "일시적인 어려움이 있지만 곧 햇살이 비칠 것입니다."
      },
      love: {
        upright: "사랑이 꽃피는 행복한 시기입니다. 관계가 밝고 즐겁습니다.",
        reversed: "관계에서 일시적인 어려움이 있지만 극복할 수 있습니다."
      },
      career: {
        upright: "경력에서 큰 성공을 거둘 것입니다. 인정받고 승진할 수 있습니다.",
        reversed: "성공이 지연되고 있지만 포기하지 마세요."
      },
      money: {
        upright: "재정적으로 풍요로운 시기입니다. 번영을 즐기세요.",
        reversed: "재정적 어려움이 일시적입니다. 긍정적인 태도를 유지하세요."
      }
    },
    element: "불",
    astrology: "태양",
    imageUrl: "~/assets/tarot-cards/major/19-the-sun.png"
  },
  {
    id: 20,
    name: "Judgement",
    nameKr: "심판",
    arcana: "major",
    number: 20,
    keywords: {
      upright: ["재생", "결정", "용서", "재평가", "각성"],
      reversed: ["자기 비판", "결정 회피", "과거 집착", "용서 못함"]
    },
    meanings: {
      general: {
        upright: "인생의 중요한 결정을 내릴 시기입니다. 과거를 정리하고 새롭게 시작하세요.",
        reversed: "자신을 너무 가혹하게 판단하지 마세요. 과거를 용서하세요."
      },
      love: {
        upright: "관계에서 중요한 결정을 내려야 합니다. 진실한 마음을 따르세요.",
        reversed: "과거의 상처를 놓아주고 용서해야 합니다."
      },
      career: {
        upright: "경력의 전환점입니다. 소명을 따라 결정하세요.",
        reversed: "직업적 결정을 미루지 마세요. 자신을 믿으세요."
      },
      money: {
        upright: "재정 상황을 전면 재평가하고 새로운 시작을 하세요.",
        reversed: "과거의 재정적 실수에 얽매이지 말고 앞으로 나아가세요."
      }
    },
    element: "불",
    astrology: "명왕성",
    imageUrl: "~/assets/tarot-cards/major/20-judgement.png"
  },
  {
    id: 21,
    name: "The World",
    nameKr: "세계",
    arcana: "major",
    number: 21,
    keywords: {
      upright: ["완성", "성취", "여행", "성공", "충족감"],
      reversed: ["미완성", "지연", "부족함", "목표 미달성"]
    },
    meanings: {
      general: {
        upright: "큰 성취와 완성의 시기입니다. 당신의 목표를 달성했습니다.",
        reversed: "거의 목표에 도달했지만 마지막 단계가 남아 있습니다."
      },
      love: {
        upright: "관계가 완전하고 충족된 상태입니다. 행복을 즐기세요.",
        reversed: "관계에서 무언가 부족함을 느낍니다. 소통하세요."
      },
      career: {
        upright: "경력의 정점에 도달했습니다. 성취를 축하하세요.",
        reversed: "목표에 거의 도달했지만 마지막 노력이 필요합니다."
      },
      money: {
        upright: "재정적 목표를 달성했습니다. 안정과 풍요를 즐기세요.",
        reversed: "재정 목표 달성이 지연되고 있지만 포기하지 마세요."
      }
    },
    element: "지구",
    astrology: "토성",
    imageUrl: "~/assets/tarot-cards/major/21-the-world.png"
  }
];
