/**
 * 테마별 기본 질문 정의
 */

export interface ThemeQuestion {
  theme: string;
  subTheme?: string;
  question: string;
  emoji: string;
}

// 테마별 기본 질문 맵
export const themeQuestions: Record<string, ThemeQuestion> = {
  'love_single': {
    theme: '연애',
    subTheme: '솔로',
    question: '나에게도 사랑이 찾아올까요? 운명의 상대는 언제 만날 수 있을까요?',
    emoji: '💝'
  },
  'love_couple': {
    theme: '연애',
    subTheme: '커플',
    question: '우리의 사랑은 어떻게 발전할까요? 서로에게 어떤 의미일까요?',
    emoji: '💑'
  },
  'love': {
    theme: '연애',
    question: '나의 연애운은 어떨까요?',
    emoji: '💝'
  },
  'money': {
    theme: '재물',
    question: '나의 금전운과 재물운은 어떻게 될까요? 경제적 안정을 찾을 수 있을까요?',
    emoji: '💰'
  },
  'health': {
    theme: '건강',
    question: '나의 건강 상태는 어떨까요? 주의해야 할 부분이 있을까요?',
    emoji: '🌿'
  },
  'career': {
    theme: '직업',
    question: '나의 커리어는 어떻게 발전할까요? 직장에서의 성공 가능성은?',
    emoji: '💼'
  },
  'study': {
    theme: '학업',
    question: '나의 학업 성취도는 어떨까요? 시험과 학습에서 좋은 결과를 얻을 수 있을까요?',
    emoji: '📚'
  },
  'general': {
    theme: '일반',
    question: '오늘 나에게 필요한 메시지는 무엇일까요?',
    emoji: '🔮'
  }
};

/**
 * 테마와 서브테마로 기본 질문 가져오기
 */
export function getThemeQuestion(theme: string, subTheme?: string): ThemeQuestion | null {
  // 서브테마가 있는 경우 먼저 확인
  if (subTheme) {
    const key = `${theme}_${subTheme}`;
    if (themeQuestions[key]) {
      return themeQuestions[key];
    }
  }
  
  // 테마만으로 확인
  if (themeQuestions[theme]) {
    return themeQuestions[theme];
  }
  
  // 기본값
  return themeQuestions.general;
}

/**
 * 테마 표시 이름 가져오기
 */
export function getThemeDisplayName(theme: string, subTheme?: string): string {
  const themeNames: Record<string, string> = {
    'love': '연애운',
    'money': '재물운',
    'health': '건강운',
    'career': '직업운',
    'study': '학업운',
    'general': '종합운'
  };
  
  let displayName = themeNames[theme] || '타로 점괘';
  
  return displayName;
}

/**
 * 스프레드 표시 이름 가져오기
 */
export function getSpreadDisplayName(spreadId: string): string {
  const spreadNames: Record<string, string> = {
    'one_card': '원 카드 리딩',
    'three_card_timeline': '시간의 흐름',
    'celtic_cross': '켈틱 크로스',
    'seven_star': '세븐 스타',
    'cup_of_relationship': '관계의 컵',
    'daily_card': '오늘의 카드'
  };
  
  return spreadNames[spreadId] || spreadId;
}
