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
        title: '과거',
        description: '과거의 영향과 지나온 여정을 나타냅니다. 현재에 이르게 된 배경과 경험을 보여줍니다.',
        keywords: ['과거', '배경', '경험']
      },
      {
        position: 2,
        title: '현재',
        description: '지금 이 순간의 상황과 에너지를 나타냅니다. 당신이 서 있는 현재의 위치입니다.',
        keywords: ['현재', '지금', '현 상황']
      },
      {
        position: 3,
        title: '미래',
        description: '앞으로 펼쳐질 가능성과 방향을 나타냅니다. 예상되는 발전과 변화를 보여줍니다.',
        keywords: ['미래', '가능성', '방향']
      },
      {
        position: 4,
        title: '조언',
        description: '이 상황에서 필요한 지혜와 조언입니다. 어떻게 행동해야 할지 가이드를 제공합니다.',
        keywords: ['조언', '지혜', '행동 지침']
      },
      {
        position: 5,
        title: '주변 상황',
        description: '당신을 둘러싼 환경과 영향력을 나타냅니다. 외부 요인과 주변 사람들의 영향을 보여줍니다.',
        keywords: ['환경', '외부 영향', '주변 상황']
      },
      {
        position: 6,
        title: '희망',
        description: '당신의 희망과 바람을 나타냅니다. 내면의 욕구와 추구하는 이상을 보여줍니다.',
        keywords: ['희망', '바람', '이상']
      },
      {
        position: 7,
        title: '결과',
        description: '모든 요소를 종합한 최종 결과입니다. 이 여정의 도착점과 메시지를 담고 있습니다.',
        keywords: ['결과', '결론', '메시지']
      }
    ]
  },
  cup_of_relationship: {
    name: '컵 오브 릴레이션십',
    positions: [
      {
        position: 1,
        title: '나',
        description: '관계에서의 당신의 역할과 상태를 나타냅니다. 당신의 감정과 태도를 보여줍니다.',
        keywords: ['나', '내 감정', '내 역할']
      },
      {
        position: 2,
        title: '상대방',
        description: '상대방의 감정과 상태를 나타냅니다. 그들의 관점과 마음을 보여줍니다.',
        keywords: ['상대방', '상대 감정', '상대 관점']
      },
      {
        position: 3,
        title: '관계의 현재',
        description: '두 사람 사이의 현재 관계 상태를 나타냅니다. 관계의 질과 에너지를 보여줍니다.',
        keywords: ['관계 현재', '연결', '상호작용']
      },
      {
        position: 4,
        title: '과거의 영향',
        description: '관계에 영향을 미치는 과거의 경험과 패턴입니다. 함께한 역사와 배경을 보여줍니다.',
        keywords: ['과거', '역사', '패턴']
      },
      {
        position: 5,
        title: '도전과제',
        description: '관계에서 극복해야 할 장애물이나 과제입니다. 해결이 필요한 문제를 나타냅니다.',
        keywords: ['도전', '장애물', '과제']
      },
      {
        position: 6,
        title: '잠재력',
        description: '관계가 가진 잠재적 가능성입니다. 함께 성장할 수 있는 방향을 보여줍니다.',
        keywords: ['잠재력', '가능성', '성장']
      },
      {
        position: 7,
        title: '미래 전망',
        description: '관계의 미래 방향과 전망입니다. 앞으로의 발전 가능성을 나타냅니다.',
        keywords: ['미래', '전망', '방향']
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
