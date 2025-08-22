// 각 스프레드별 포지션 의미 정의
export const spreadPositionMeanings = {
  celtic_cross: {
    name: '켈틱 크로스',
    positions: [
      {
        position: 1,
        title: '현재 상황',
        description: '당신의 현재 상황이나 문제의 핵심을 나타냅니다. 지금 당신이 직면하고 있는 중심 이슈입니다.',
        keywords: ['현재', '핵심 문제', '중심 상황']
      },
      {
        position: 2,
        title: '도전/십자가',
        description: '당신을 가로막는 장애물이나 도전과제입니다. 극복해야 할 시련이나 상황을 방해하는 요소를 나타냅니다.',
        keywords: ['장애물', '도전', '방해 요소']
      },
      {
        position: 3,
        title: '먼 과거',
        description: '현재 상황의 뿌리가 되는 과거의 사건이나 영향입니다. 오래전부터 이어져 온 배경을 보여줍니다.',
        keywords: ['과거의 영향', '배경', '근원']
      },
      {
        position: 4,
        title: '가까운 과거',
        description: '최근에 일어난 사건이나 영향으로, 현재 상황에 직접적인 영향을 미치고 있습니다.',
        keywords: ['최근 사건', '직접적 영향', '근접 과거']
      },
      {
        position: 5,
        title: '가능한 미래',
        description: '현재의 방향이 유지된다면 펼쳐질 가능성이 있는 미래입니다. 예상되는 결과나 잠재적 발전 방향을 나타냅니다.',
        keywords: ['잠재적 미래', '가능성', '예상 결과']
      },
      {
        position: 6,
        title: '가까운 미래',
        description: '곧 일어날 일이나 단기적인 미래를 나타냅니다. 몇 주에서 몇 달 내에 펼쳐질 상황입니다.',
        keywords: ['단기 미래', '곧 일어날 일', '임박한 상황']
      },
      {
        position: 7,
        title: '당신의 접근',
        description: '이 상황에 대한 당신의 태도나 접근 방식입니다. 내면의 감정이나 상황을 대하는 자세를 보여줍니다.',
        keywords: ['태도', '접근 방식', '내면 상태']
      },
      {
        position: 8,
        title: '외부 영향',
        description: '주변 환경이나 타인이 미치는 영향입니다. 당신이 통제할 수 없는 외부 요인들을 나타냅니다.',
        keywords: ['환경', '타인의 영향', '외부 요인']
      },
      {
        position: 9,
        title: '희망과 두려움',
        description: '이 상황에 대한 당신의 희망이나 두려움입니다. 내면 깊은 곳의 바람이나 걱정을 드러냅니다.',
        keywords: ['희망', '두려움', '내적 갈등']
      },
      {
        position: 10,
        title: '최종 결과',
        description: '모든 요소를 종합한 최종적인 결과나 결론입니다. 이 여정의 도착점이나 궁극적인 메시지를 담고 있습니다.',
        keywords: ['최종 결과', '결론', '궁극적 메시지']
      }
    ]
  },
  seven_star: {
    name: '세븐 스타',
    positions: [
      {
        position: 1,
        title: '과거의 영향',
        description: '과거의 경험과 사건들이 현재에 미치는 영향을 나타냅니다. 지나온 여정의 교훈과 배경을 보여줍니다.',
        keywords: ['과거', '경험', '영향']
      },
      {
        position: 2,
        title: '현재 상황',
        description: '지금 이 순간 당신이 처한 상황과 에너지를 나타냅니다. 현재의 도전과 기회를 보여줍니다.',
        keywords: ['현재', '상황', '에너지']
      },
      {
        position: 3,
        title: '숨겨진 영향',
        description: '의식하지 못하는 내면의 요소나 숨겨진 외부 영향력을 나타냅니다. 무의식적 패턴과 보이지 않는 힘을 보여줍니다.',
        keywords: ['숨겨진', '무의식', '내면']
      },
      {
        position: 4,
        title: '의식적 욕구',
        description: '당신이 의식적으로 원하고 추구하는 것을 나타냅니다. 명확한 목표와 바람을 보여줍니다.',
        keywords: ['욕구', '목표', '의식']
      },
      {
        position: 5,
        title: '무의식적 욕구',
        description: '내면 깊은 곳의 진정한 욕구와 필요를 나타냅니다. 자신도 모르는 진짜 바람을 보여줍니다.',
        keywords: ['무의식', '진정한 욕구', '내면']
      },
      {
        position: 6,
        title: '조언',
        description: '이 상황에서 취해야 할 최선의 행동과 태도를 나타냅니다. 지혜로운 가이드를 제공합니다.',
        keywords: ['조언', '지혜', '가이드']
      },
      {
        position: 7,
        title: '최종 결과',
        description: '모든 요소를 종합한 최종적인 결과와 메시지입니다. 이 여정의 도착점을 보여줍니다.',
        keywords: ['결과', '결론', '도착점']
      }
    ]
  },
  cup_of_relationship: {
    name: '컵 오브 릴레이션십',
    positions: [
      {
        position: 1,
        title: '나',
        description: '관계에서의 당신의 본질과 에너지를 나타냅니다. 당신이 관계에 가져오는 감정과 태도를 보여줍니다.',
        keywords: ['나', '내 본질', '내 에너지']
      },
      {
        position: 2,
        title: '상대',
        description: '상대방의 본질과 에너지를 나타냅니다. 그들이 관계에 가져오는 감정과 태도를 보여줍니다.',
        keywords: ['상대방', '상대 본질', '상대 에너지']
      },
      {
        position: 3,
        title: '관계 기본',
        description: '두 사람 관계의 기초와 토대를 나타냅니다. 관계를 지탱하는 근본적인 연결을 보여줍니다.',
        keywords: ['기초', '토대', '근본']
      },
      {
        position: 4,
        title: '관계 과거',
        description: '관계의 과거와 역사를 나타냅니다. 함께 겪은 경험과 그것이 현재에 미치는 영향을 보여줍니다.',
        keywords: ['과거', '역사', '경험']
      },
      {
        position: 5,
        title: '현재 관계 상태',
        description: '현재 관계의 실제 상태와 에너지를 나타냅니다. 지금 두 사람 사이에 흐르는 감정을 보여줍니다.',
        keywords: ['현재', '관계 상태', '감정']
      },
      {
        position: 6,
        title: '현재 외부 상황',
        description: '관계에 영향을 미치는 외부 요인들을 나타냅니다. 주변 환경과 상황의 영향을 보여줍니다.',
        keywords: ['외부 영향', '환경', '상황']
      },
      {
        position: 7,
        title: '현재 나는 어떻게 생각?',
        description: '관계에 대한 당신의 현재 생각과 관점을 나타냅니다. 당신의 기대와 우려를 보여줍니다.',
        keywords: ['내 생각', '내 관점', '기대']
      },
      {
        position: 8,
        title: '현재 상대는 어떻게 생각?',
        description: '관계에 대한 상대방의 현재 생각과 관점을 나타냅니다. 상대의 기대와 우려를 보여줍니다.',
        keywords: ['상대 생각', '상대 관점', '상대 기대']
      },
      {
        position: 9,
        title: '미래 나는 어떻게 생각?',
        description: '앞으로 관계에 대한 당신의 생각이 어떻게 변화할지를 나타냅니다. 미래의 감정 변화를 보여줍니다.',
        keywords: ['미래 내 생각', '감정 변화', '전망']
      },
      {
        position: 10,
        title: '미래 상대는 어떻게 생각?',
        description: '앞으로 관계에 대한 상대방의 생각이 어떻게 변화할지를 나타냅니다. 상대의 미래 감정 변화를 보여줍니다.',
        keywords: ['미래 상대 생각', '상대 변화', '상대 전망']
      },
      {
        position: 11,
        title: '결과',
        description: '관계의 최종적인 방향과 결과를 나타냅니다. 두 사람의 미래와 관계의 도착점을 보여줍니다.',
        keywords: ['결과', '미래', '도착점']
      }
    ]
  }
};

// 포지션 의미 가져오기 헬퍼 함수
export function getPositionMeaning(spreadId: string, position: number) {
  const spread = spreadPositionMeanings[spreadId as keyof typeof spreadPositionMeanings];
  if (!spread) return null;
  
  return spread.positions.find(p => p.position === position) || null;
}
