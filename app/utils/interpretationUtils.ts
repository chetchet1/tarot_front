// src/utils/interpretationUtils.ts

interface SpreadPromptStructure {
  spreadType: string;
  sections: {
    emoji: string;
    title: string;
    instruction: string;
  }[];
}

// 세븐스타 전용 프롬프트 구조
const SEVEN_STAR_STRUCTURE: SpreadPromptStructure = {
  spreadType: 'seven-star',
  sections: [
    { emoji: '🌟', title: '핵심 통찰', instruction: '이 상황의 가장 중요한 메시지와 핵심 포인트를 설명하세요.' },
    { emoji: '⏰', title: '시간의 흐름', instruction: '과거, 현재, 미래의 흐름을 카드를 통해 해석하세요.' },
    { emoji: '⚠️', title: '직면한 도전', instruction: '현재 질문자가 직면한 도전과 극복해야 할 부분을 설명하세요.' },
    { emoji: '✨', title: '기회와 가능성', instruction: '카드가 보여주는 기회와 긍정적인 가능성을 설명하세요.' },
    { emoji: '🔍', title: '숨겨진 요소', instruction: '표면적으로 드러나지 않은 숨겨진 영향이나 요소를 설명하세요.' },
    { emoji: '🎯', title: '예상되는 결과', instruction: '현재 흐름대로 진행될 경우 예상되는 결과를 설명하세요.' },
    { emoji: '💡', title: '조언과 지침', instruction: '질문자가 취해야 할 구체적인 행동과 조언을 제시하세요.' }
  ]
};

// 컵 오브 릴레이션십 전용 프롬프트 구조
const CUP_OF_RELATIONSHIP_STRUCTURE: SpreadPromptStructure = {
  spreadType: 'cup-of-relationship',
  sections: [
    { emoji: '👥', title: '관계의 역학', instruction: '두 사람 사이의 에너지와 상호작용 패턴을 설명하세요.' },
    { emoji: '💖', title: '감정의 흐름', instruction: '관계에서 나타나는 감정적 흐름과 연결을 해석하세요.' },
    { emoji: '✨', title: '관계의 강점', instruction: '이 관계가 가진 긍정적인 면과 강점을 설명하세요.' },
    { emoji: '⚠️', title: '극복해야 할 도전', instruction: '관계에서 해결해야 할 문제점과 도전 과제를 설명하세요.' },
    { emoji: '🔮', title: '미래 전망', instruction: '단기(3개월)와 장기(1년) 관점에서의 관계 전망을 제시하세요.' },
    { emoji: '💡', title: '조언과 지침', instruction: '관계 개선을 위한 구체적인 조언과 실천 방안을 제시하세요.' }
  ]
};

// 스프레드 타입별 구조 매핑
const SPREAD_STRUCTURES: Record<string, SpreadPromptStructure> = {
  'seven-star': SEVEN_STAR_STRUCTURE,
  'cup-of-relationship': CUP_OF_RELATIONSHIP_STRUCTURE
};

/**
 * 강화된 프롬프트 생성 함수
 * AI가 정확한 구조로 답변하도록 더 명확한 지시사항 포함
 */
export function generateStructuredPrompt(
  spreadType: string,
  cards: any[],
  positions: string[],
  question: string
): string {
  const structure = SPREAD_STRUCTURES[spreadType];
  
  if (!structure) {
    // 기본 프롬프트 반환
    return generateBasicPrompt(cards, positions, question);
  }

  // 카드 정보 정리
  const cardInfo = cards.map((card, index) => 
    `${index + 1}. ${positions[index]}: ${card.name_ko} (${card.isReversed ? '역방향' : '정방향'})`
  ).join('\n');

  // 구조화된 프롬프트 생성
  let prompt = `
당신은 전문 타로 상담사입니다. 다음 지시사항을 반드시 따라주세요.

【질문】
${question}

【뽑은 카드】
${cardInfo}

【중요 지시사항】
아래의 정확한 구조와 형식으로 답변해 주세요. 각 섹션은 반드시 이모지와 제목으로 시작해야 합니다.

${structure.sections.map(section => `
${section.emoji} **${section.title}**
${section.instruction}
(이 섹션에서 2-3문장으로 구체적이고 실용적인 해석을 제공하세요)
`).join('\n')}

【답변 작성 규칙】
1. 반드시 위의 ${structure.sections.length}개 섹션을 모두 포함해야 합니다.
2. 각 섹션은 지정된 이모지로 시작해야 합니다.
3. 각 섹션 제목은 **굵은 글씨**로 표시해야 합니다.
4. 각 섹션은 최소 2문장, 최대 4문장으로 작성합니다.
5. 구체적이고 실용적인 조언을 포함합니다.
6. 전체적으로 일관성 있는 스토리를 만들어 주세요.

이제 위의 구조에 따라 타로 해석을 시작하세요:
`;

  return prompt;
}

/**
 * 기본 프롬프트 생성 (다른 스프레드용)
 */
function generateBasicPrompt(
  cards: any[],
  positions: string[],
  question: string
): string {
  const cardInfo = cards.map((card, index) => 
    `${index + 1}. ${positions[index]}: ${card.name_ko} (${card.isReversed ? '역방향' : '정방향'})`
  ).join('\n');

  return `
전문 타로 상담사로서 다음 질문에 대한 해석을 제공해 주세요.

질문: ${question}

뽑은 카드:
${cardInfo}

각 카드의 의미와 전체적인 메시지를 종합하여 구체적이고 실용적인 조언을 제공해 주세요.
`;
}

/**
 * AI 응답 검증 및 재구조화 함수
 * AI 응답이 구조를 따르지 않을 경우 재구조화
 */
export function validateAndRestructureResponse(
  response: string,
  spreadType: string
): string {
  const structure = SPREAD_STRUCTURES[spreadType];
  
  if (!structure) {
    return response;
  }

  // 모든 섹션이 포함되어 있는지 확인
  const missingSections = structure.sections.filter(section => 
    !response.includes(section.emoji) || !response.includes(section.title)
  );

  if (missingSections.length > 0) {
    // 응답 재구조화 시도
    return restructureResponse(response, structure);
  }

  return response;
}

/**
 * 응답 재구조화 함수
 */
function restructureResponse(
  response: string,
  structure: SpreadPromptStructure
): string {
  // 응답을 문단으로 분리
  const paragraphs = response.split('\n\n').filter(p => p.trim());
  
  // 구조화된 응답 생성
  let restructured = '';
  let paragraphIndex = 0;

  structure.sections.forEach((section, index) => {
    restructured += `${section.emoji} **${section.title}**\n`;
    
    // 원본 응답에서 관련 내용 찾기
    const relevantContent = findRelevantContent(
      paragraphs,
      section.title,
      paragraphIndex
    );
    
    if (relevantContent) {
      restructured += relevantContent + '\n\n';
      paragraphIndex++;
    } else {
      // 기본 메시지 추가
      restructured += `이 부분에 대한 구체적인 해석이 필요합니다.\n\n`;
    }
  });

  return restructured;
}

/**
 * 관련 콘텐츠 찾기 함수
 */
function findRelevantContent(
  paragraphs: string[],
  sectionTitle: string,
  startIndex: number
): string | null {
  // 키워드 기반으로 관련 문단 찾기
  const keywords = getKeywordsForSection(sectionTitle);
  
  for (let i = startIndex; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    if (keywords.some(keyword => paragraph.toLowerCase().includes(keyword))) {
      return paragraph;
    }
  }
  
  // 키워드가 없으면 순서대로 반환
  if (startIndex < paragraphs.length) {
    return paragraphs[startIndex];
  }
  
  return null;
}

/**
 * 섹션별 키워드 정의
 */
function getKeywordsForSection(sectionTitle: string): string[] {
  const keywordMap: Record<string, string[]> = {
    '핵심 통찰': ['핵심', '중요', '메시지', '의미'],
    '시간의 흐름': ['과거', '현재', '미래', '시간'],
    '직면한 도전': ['도전', '어려움', '문제', '극복'],
    '기회와 가능성': ['기회', '가능성', '긍정', '잠재'],
    '숨겨진 요소': ['숨겨진', '내면', '무의식', '잠재'],
    '예상되는 결과': ['결과', '미래', '전망', '예상'],
    '조언과 지침': ['조언', '제안', '방법', '행동'],
    '관계의 역학': ['관계', '상호', '에너지', '역학'],
    '감정의 흐름': ['감정', '느낌', '마음', '정서'],
    '관계의 강점': ['강점', '장점', '긍정', '좋은'],
    '극복해야 할 도전': ['문제', '도전', '개선', '해결'],
    '미래 전망': ['미래', '전망', '예측', '장기']
  };
  
  return keywordMap[sectionTitle] || [];
}

export { SPREAD_STRUCTURES };
