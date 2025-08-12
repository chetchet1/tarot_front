/**
 * 각 배열법별 기본 질문 템플릿
 * 사용자가 특정 주제를 선택했을 때 사용되는 질문들
 */

export interface SpreadQuestion {
  spreadId: string;
  topic: string;
  question: string;
  subQuestions?: string[];
}

export const spreadQuestions: SpreadQuestion[] = [
  // ============ 켈틱 크로스 ============
  {
    spreadId: 'celtic_cross',
    topic: 'general',
    question: '나의 현재 상황과 앞으로의 방향은 어떻게 될까요?',
    subQuestions: [
      '현재 내가 처한 상황의 본질은 무엇인가?',
      '어떤 영향들이 나에게 작용하고 있는가?',
      '앞으로 어떤 변화가 예상되는가?',
      '내가 취해야 할 최선의 행동은 무엇인가?'
    ]
  },
  {
    spreadId: 'celtic_cross',
    topic: 'love',
    question: '나의 연애운과 인연은 어떻게 전개될까요?',
    subQuestions: [
      '현재 나의 연애 상황은 어떠한가?',
      '상대방은 나를 어떻게 생각하고 있는가?',
      '이 관계의 미래는 어떻게 될 것인가?',
      '더 나은 관계를 위해 내가 해야 할 일은?'
    ]
  },
  {
    spreadId: 'celtic_cross',
    topic: 'career',
    question: '나의 직업과 경력 발전은 어떻게 될까요?',
    subQuestions: [
      '현재 나의 직업적 위치는 어떠한가?',
      '어떤 기회와 도전이 기다리고 있는가?',
      '나의 강점과 약점은 무엇인가?',
      '성공을 위해 집중해야 할 것은?'
    ]
  },
  {
    spreadId: 'celtic_cross',
    topic: 'money',
    question: '나의 재정 상황과 금전운은 어떻게 될까요?',
    subQuestions: [
      '현재 나의 재정 상태는 어떠한가?',
      '돈과 관련된 기회가 있을까?',
      '주의해야 할 재정적 위험은?',
      '재정 안정을 위한 조언은?'
    ]
  },

  // ============ 세븐 스타 ============
  {
    spreadId: 'seven_star',
    topic: 'general',
    question: '나의 운명의 별은 어떤 메시지를 전하고 있나요?',
    subQuestions: [
      '과거에서 이어져 온 영향은 무엇인가?',
      '현재 나는 어떤 위치에 서 있는가?',
      '보이지 않는 힘들이 어떻게 작용하고 있는가?',
      '내가 의식적으로 원하는 것과 무의식적으로 필요한 것은?',
      '최종적으로 어떤 결과가 예상되는가?'
    ]
  },
  {
    spreadId: 'seven_star',
    topic: 'love',
    question: '사랑의 일곱 별이 알려주는 나의 연애 운명은?',
    subQuestions: [
      '과거 연애가 현재에 미치는 영향은?',
      '현재 나의 연애 에너지는 어떠한가?',
      '숨겨진 감정과 욕구는 무엇인가?',
      '내가 진정으로 원하는 사랑은?',
      '앞으로의 연애 운명은 어떻게 펼쳐질까?'
    ]
  },
  {
    spreadId: 'seven_star',
    topic: 'career',
    question: '일곱 개의 별이 비추는 나의 직업적 운명은?',
    subQuestions: [
      '과거 경험이 현재 커리어에 미치는 영향은?',
      '현재 나의 직업적 위치와 상태는?',
      '보이지 않는 기회와 위험은 무엇인가?',
      '내가 추구하는 목표와 진짜 필요한 것은?',
      '최종적인 직업적 성취는 어떻게 될까?'
    ]
  },
  {
    spreadId: 'seven_star',
    topic: 'money',
    question: '별들이 예언하는 나의 재물운은?',
    subQuestions: [
      '과거의 재정 습관이 현재에 미치는 영향은?',
      '현재 나의 재정 에너지는 어떠한가?',
      '숨겨진 재정적 기회나 위험은?',
      '내가 원하는 풍요와 실제 필요한 것은?',
      '미래의 재정적 결과는 어떻게 될까?'
    ]
  },

  // ============ 컵 오브 릴레이션십 ============
  {
    spreadId: 'cup_of_relationship',
    topic: 'love',
    question: '우리 관계의 진짜 모습과 미래는 어떻게 될까요?',
    subQuestions: [
      '나는 이 관계에서 어떤 상태인가?',
      '상대방은 어떤 상태인가?',
      '우리 관계의 기반은 무엇인가?',
      '과거에서 현재로 이어진 관계의 흐름은?',
      '현재 우리가 느끼는 감정들은?',
      '서로에 대한 생각과 마음은?',
      '미래에 우리는 어떻게 변화할까?',
      '최종적으로 이 관계는 어떻게 될까?'
    ]
  },

  // ============ 과거-현재-미래 ============
  {
    spreadId: 'three_card_timeline',
    topic: 'general',
    question: '시간의 흐름 속에서 나는 어떻게 변화하고 있나요?',
    subQuestions: [
      '과거에 무엇이 있었는가?',
      '현재 상황은 어떠한가?',
      '미래에는 무엇이 기다리고 있는가?'
    ]
  },
  {
    spreadId: 'three_card_timeline',
    topic: 'love',
    question: '나의 연애는 어떻게 흘러왔고 어디로 향하고 있나요?',
    subQuestions: [
      '과거의 연애 경험과 영향은?',
      '현재의 연애 상황은?',
      '앞으로의 연애 가능성은?'
    ]
  },
  {
    spreadId: 'three_card_timeline',
    topic: 'career',
    question: '나의 커리어는 어떻게 발전해왔고 어디로 가고 있나요?',
    subQuestions: [
      '과거의 직업적 경험은?',
      '현재의 직업 상황은?',
      '미래의 커리어 전망은?'
    ]
  },
  {
    spreadId: 'three_card_timeline',
    topic: 'money',
    question: '나의 재정은 어떻게 변화해왔고 앞으로 어떻게 될까요?',
    subQuestions: [
      '과거의 재정 상태는?',
      '현재의 금전 상황은?',
      '미래의 재정 전망은?'
    ]
  },

  // ============ 원 카드 ============
  {
    spreadId: 'one_card',
    topic: 'general',
    question: '오늘 나에게 필요한 메시지는 무엇인가요?',
    subQuestions: []
  },
  {
    spreadId: 'one_card',
    topic: 'love',
    question: '오늘의 연애운은 어떨까요?',
    subQuestions: []
  },
  {
    spreadId: 'one_card',
    topic: 'career',
    question: '오늘 일과 관련된 조언은?',
    subQuestions: []
  },
  {
    spreadId: 'one_card',
    topic: 'money',
    question: '오늘의 금전운은?',
    subQuestions: []
  }
];

/**
 * 특정 배열법과 주제에 맞는 질문 가져오기
 */
export function getQuestionForSpread(spreadId: string, topic: string): SpreadQuestion | undefined {
  return spreadQuestions.find(q => q.spreadId === spreadId && q.topic === topic);
}

/**
 * 배열법별 기본 질문 가져오기 (general 주제)
 */
export function getDefaultQuestion(spreadId: string): string {
  const question = spreadQuestions.find(q => q.spreadId === spreadId && q.topic === 'general');
  return question?.question || '당신의 운명은 어떻게 펼쳐질까요?';
}

/**
 * 주제별 기본 질문 템플릿
 */
export const topicQuestions: { [key: string]: string } = {
  general: '나의 현재 상황과 앞으로의 방향은?',
  love: '나의 연애운과 인연은?',
  career: '나의 직업과 경력 발전은?',
  money: '나의 재정 상황과 금전운은?',
  health: '나의 건강 상태와 주의사항은?',
  custom: '' // 커스텀은 사용자가 직접 입력
};
