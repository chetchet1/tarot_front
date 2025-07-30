// 개발/테스트용 Mock AI 서비스
export class MockAIService {
  static async generateMockInterpretation(cards: any[], topic: string): Promise<string> {
    const topicKr = {
      love: '연애운',
      career: '직업운',
      money: '금전운',
      general: '종합운'
    }[topic] || '종합운'

    // 카드 위치별 의미
    const positions = [
      '현재내면', '현재외부', '근본', '과거', '드러나는 모습',
      '미래', '내가보는나', '남이보는나', '예상하는 결과', '실제 결과'
    ]

    // 템플릿 기반 해석 생성
    let interpretation = `🔮 ${topicKr} 켈틱 크로스 해석\n\n`
    
    interpretation += `현재 당신의 ${topicKr}을 둘러싼 에너지가 복잡하게 얽혀 있는 모습입니다.\n\n`
    
    // 과거-현재-미래 흐름
    interpretation += `【과거의 영향】\n`
    interpretation += `지나온 시간 동안 당신은 많은 도전과 성장을 경험했습니다. `
    interpretation += `${cards[3]?.orientation === 'upright' ? '긍정적인' : '어려운'} 경험들이 현재의 당신을 만들어냈네요.\n\n`
    
    interpretation += `【현재 상황】\n`
    interpretation += `지금은 ${cards[0]?.orientation === 'upright' ? '안정적이고 조화로운' : '변화와 도전이 필요한'} 시기입니다. `
    interpretation += `내면과 외부 환경 사이에서 균형을 찾아가는 과정이 중요합니다.\n\n`
    
    interpretation += `【미래 전망】\n`
    interpretation += `앞으로 ${cards[5]?.orientation === 'upright' ? '희망적인 변화와 발전' : '신중한 접근이 필요한 상황'}이 예상됩니다. `
    interpretation += `당신의 선택과 행동이 결과를 만들어갈 것입니다.\n\n`
    
    // 조언
    interpretation += `【조언】\n`
    if (topic === 'love') {
      interpretation += `사랑은 서로를 이해하고 받아들이는 과정입니다. 진실한 마음으로 소통하며, 인내심을 가지고 관계를 가꾸어 나가세요.`
    } else if (topic === 'career') {
      interpretation += `목표를 향한 꾸준한 노력이 결실을 맺을 시기가 다가오고 있습니다. 자신감을 가지고 도전하되, 주변의 조언도 귀담아 들으세요.`
    } else if (topic === 'money') {
      interpretation += `재정적 안정을 위해서는 계획적인 관리가 필요합니다. 충동적인 결정보다는 장기적인 관점에서 판단하세요.`
    } else {
      interpretation += `인생의 모든 순간이 성장의 기회입니다. 현재에 충실하며 미래를 준비하는 지혜로운 태도가 필요합니다.`
    }
    
    interpretation += `\n\n✨ 기억하세요, 운명은 정해진 것이 아니라 당신이 만들어가는 것입니다.`
    
    return interpretation
  }
}
