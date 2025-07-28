import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  TarotCard, 
  DrawnCard, 
  Reading, 
  Orientation,
  Topic,
  TarotSpread
} from '../models/tarot';
import { useUserStore } from './user';
import { tarotService, spreadService } from '../services/supabase';
import { tarotSpreads } from '../data/spreads';

interface DailyCard {
  date: string;
  card: TarotCard;
  orientation: Orientation;
}

export const useTarotStore = defineStore('tarot', () => {
  const userStore = useUserStore();
  
  // State
  const readings = ref<Reading[]>([]);
  const dailyCard = ref<DailyCard | null>(null);
  const currentReading = ref<Reading | null>(null);
  const vibrationEnabled = ref(true);
  const isLoading = ref(false);
  const tarotCards = ref<TarotCard[]>([]);
  const spreads = ref<TarotSpread[]>([]);
  const selectedTopic = ref<any>(null);
  const selectedSpread = ref<any>(null);

  // 로컬 스토리지 관련 함수들
  const saveReadingsToStorage = () => {
    try {
      localStorage.setItem('tarot_readings', JSON.stringify(readings.value));
    } catch (error) {
      console.warn('Failed to save readings:', error);
    }
  };

  const loadReadingsFromStorage = () => {
    try {
      const saved = localStorage.getItem('tarot_readings');
      if (saved) {
        readings.value = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load readings:', error);
    }
  };

  const saveDailyCardLocal = () => {
    try {
      if (dailyCard.value) {
        localStorage.setItem('tarot_daily_card', JSON.stringify(dailyCard.value));
      }
    } catch (error) {
      console.warn('Failed to save daily card:', error);
    }
  };

  const loadDailyCardFromStorage = () => {
    try {
      const saved = localStorage.getItem('tarot_daily_card');
      if (saved) {
        dailyCard.value = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load daily card:', error);
    }
  };

  // Supabase에서 타로카드 데이터 로드
  const loadTarotCards = async () => {
    try {
      console.log('타로카드 데이터 로드 시작...');
      isLoading.value = true;
      
      const cards = await tarotService.getAllCards();
      
      if (cards && cards.length > 0) {
        // Supabase 데이터를 TarotCard 형식으로 변환
        tarotCards.value = cards.map(card => ({
          id: card.id,
          name: card.name,
          nameKr: card.name_kr,
          arcana: card.arcana,
          number: card.number,
          keywords: typeof card.keywords === 'string' ? JSON.parse(card.keywords) : card.keywords,
          meanings: typeof card.meanings === 'string' ? JSON.parse(card.meanings) : card.meanings,
          element: card.element,
          astrology: card.astrology,
          imageUrl: card.image_url
        }));
        
        console.log(`타로카드 로드 성공: ${tarotCards.value.length}장`);
      } else {
        console.warn('타로카드 데이터가 비어있음, 기본 데이터 사용');
        initializeFallbackCards();
      }
    } catch (error) {
      console.error('타로카드 로드 실패:', error);
      console.log('기본 데이터로 대체');
      initializeFallbackCards();
    } finally {
      isLoading.value = false;
    }
  };

  // 기본 타로카드 데이터 (Supabase 연결 실패 시 사용)
  const initializeFallbackCards = () => {
    tarotCards.value = [
      {
        id: 0,
        name: 'The Fool',
        nameKr: '바보',
        arcana: 'major',
        number: 0,
        keywords: {
          upright: ['새로운 시작', '모험', '순수함', '자유로움'],
          reversed: ['무모함', '부주의', '미성숙', '방향성 상실']
        },
        meanings: {
          general: {
            upright: '새로운 모험을 시작할 준비가 되었습니다.',
            reversed: '성급한 결정을 내리지 마세요.'
          },
          love: {
            upright: '새로운 만남이나 관계의 시작을 의미합니다.',
            reversed: '관계에서 신중함이 필요합니다.'
          },
          career: {
            upright: '새로운 직업이나 프로젝트 시작에 좋은 시기입니다.',
            reversed: '현재 상황을 더 분석하고 계획을 세우세요.'
          },
          money: {
            upright: '새로운 투자 기회가 있을 수 있습니다.',
            reversed: '안정적인 재정 관리에 집중하세요.'
          }
        },
        element: '공기',
        astrology: '천왕성',
        imageUrl: '/assets/tarot-cards/major/00-the-fool.png'
      },
      {
        id: 1,
        name: 'The Magician',
        nameKr: '마법사',
        arcana: 'major',
        number: 1,
        keywords: {
          upright: ['의지력', '창조력', '재능', '능력', '집중'],
          reversed: ['조작', '속임수', '재능 낭비', '계획 부족']
        },
        meanings: {
          general: {
            upright: '원하는 것을 이룰 수 있는 모든 능력을 가지고 있습니다.',
            reversed: '재능을 제대로 활용하지 못하고 있습니다.'
          },
          love: {
            upright: '매력적인 시기입니다. 자신감을 가지세요.',
            reversed: '관계에서 진실하지 못한 면이 있을 수 있습니다.'
          },
          career: {
            upright: '능력을 발휘할 좋은 기회입니다.',
            reversed: '구체적인 계획을 세우세요.'
          },
          money: {
            upright: '재정적 기회를 잘 활용할 수 있습니다.',
            reversed: '충동적인 지출을 피하세요.'
          }
        },
        element: '공기',
        astrology: '수성',
        imageUrl: '/assets/tarot-cards/major/01-the-magician.png'
      },
      {
        id: 2,
        name: 'The High Priestess',
        nameKr: '여교황',
        arcana: 'major',
        number: 2,
        keywords: {
          upright: ['직감', '신비', '내면의 지혜', '잠재의식'],
          reversed: ['직감 무시', '혼란', '비밀', '내면 갈등']
        },
        meanings: {
          general: {
            upright: '내면의 목소리에 귀 기울이고 직감을 믿으세요.',
            reversed: '혼란스러운 상황에서 명확함을 찾아야 합니다.'
          },
          love: {
            upright: '깊은 감정과 영적 연결이 중요한 시기입니다.',
            reversed: '감정적 혼란이나 소통 부족이 있을 수 있습니다.'
          },
          career: {
            upright: '직감에 의존하여 올바른 결정을 내릴 수 있습니다.',
            reversed: '정보 부족이나 불분명한 상황에 주의하세요.'
          },
          money: {
            upright: '신중한 판단으로 재정 관리를 하세요.',
            reversed: '숨겨진 비용이나 예상치 못한 지출에 주의하세요.'
          }
        },
        element: '물',
        astrology: '달',
        imageUrl: '/assets/tarot-cards/major/02-the-high-priestess.png'
      },
      {
        id: 3,
        name: 'The Empress',
        nameKr: '여황제',
        arcana: 'major',
        number: 3,
        keywords: {
          upright: ['풍요', '창조성', '어머니성', '자연'],
          reversed: ['의존성', '창조적 막힘', '과보호', '불임']
        },
        meanings: {
          general: {
            upright: '풍요롭고 창조적인 에너지가 흐르는 시기입니다.',
            reversed: '창조성이 막히거나 과도한 의존성이 문제가 될 수 있습니다.'
          },
          love: {
            upright: '따뜻하고 사랑이 넘치는 관계를 경험할 수 있습니다.',
            reversed: '질투나 과도한 보호욕이 관계를 해칠 수 있습니다.'
          },
          career: {
            upright: '창조적인 프로젝트나 협력이 성공적으로 진행됩니다.',
            reversed: '창의성 부족이나 협업 문제가 있을 수 있습니다.'
          },
          money: {
            upright: '재정적 안정과 풍요를 경험할 수 있습니다.',
            reversed: '과도한 지출이나 재정 관리 부족에 주의하세요.'
          }
        },
        element: '지구',
        astrology: '금성',
        imageUrl: '/assets/tarot-cards/major/03-the-empress.png'
      },
      {
        id: 4,
        name: 'The Emperor',
        nameKr: '황제',
        arcana: 'major',
        number: 4,
        keywords: {
          upright: ['권위', '안정', '구조', '리더십'],
          reversed: ['독재', '경직성', '권위 남용', '불안정']
        },
        meanings: {
          general: {
            upright: '안정된 구조와 리더십으로 목표를 달성할 수 있습니다.',
            reversed: '지나친 통제욕이나 경직된 사고가 문제가 될 수 있습니다.'
          },
          love: {
            upright: '안정적이고 신뢰할 수 있는 관계를 구축할 수 있습니다.',
            reversed: '관계에서 지배욕이나 통제가 문제가 될 수 있습니다.'
          },
          career: {
            upright: '리더십을 발휘하여 조직을 이끌 수 있는 시기입니다.',
            reversed: '권위주의적 태도나 융통성 부족이 문제가 될 수 있습니다.'
          },
          money: {
            upright: '체계적인 재정 관리로 안정을 이룰 수 있습니다.',
            reversed: '과도한 통제나 경직된 예산 관리에 주의하세요.'
          }
        },
        element: '불',
        astrology: '양자리',
        imageUrl: '/assets/tarot-cards/major/04-the-emperor.png'
      },
      {
        id: 5,
        name: 'The Hierophant',
        nameKr: '교황',
        arcana: 'major',
        number: 5,
        keywords: {
          upright: ['전통', '교육', '영성', '제도'],
          reversed: ['반항', '비전통', '자유 추구', '제도 거부']
        },
        meanings: {
          general: {
            upright: '전통적인 방법과 기존 제도를 따르는 것이 도움이 됩니다.',
            reversed: '기존 방식에서 벗어나 새로운 길을 찾아야 할 때입니다.'
          },
          love: {
            upright: '전통적인 가치와 약속이 중요한 관계입니다.',
            reversed: '관습에 얽매이지 말고 자유로운 사랑을 추구하세요.'
          },
          career: {
            upright: '멘토나 스승에게서 배우며 전문성을 키우는 시기입니다.',
            reversed: '기존 방식에 의문을 제기하고 혁신을 추구하세요.'
          },
          money: {
            upright: '전통적이고 안전한 투자 방법을 선택하세요.',
            reversed: '새로운 투자 기회를 탐색해볼 수 있습니다.'
          }
        },
        element: '지구',
        astrology: '황소자리',
        imageUrl: '/assets/tarot-cards/major/05-the-hierophant.png'
      }
    ];
    
    console.log('기본 카드 데이터 초기화 완료:', tarotCards.value.length + '장');
  };

  // 카드 뽑기 함수
  const getRandomCards = (count: number): TarotCard[] => {
    console.log(`카드 뽑기 요청: ${count}장, 사용 가능한 카드: ${tarotCards.value.length}장`);
    
    if (tarotCards.value.length === 0) {
      console.error('사용 가능한 카드가 없습니다!');
      return [];
    }
    
    if (count > tarotCards.value.length) {
      console.warn(`요청된 카드 수(${count})가 사용 가능한 카드 수(${tarotCards.value.length})보다 많습니다.`);
    }
    
    const shuffled = [...tarotCards.value].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, count);
    
    console.log('선택된 카드들:', selectedCards.map(c => c.nameKr));
    return selectedCards;
  };

  // 스프레드 찾기
  const getSpreadById = (spreadId: string): TarotSpread | undefined => {
    return spreads.value.find(spread => spread.spreadId === spreadId);
  };

  // 오늘의 카드 뽑기
  const drawDailyCard = async (): Promise<TarotCard> => {
    const today = new Date().toDateString();
    
    // 이미 오늘 카드를 뽑았는지 확인
    if (dailyCard.value && dailyCard.value.date === today) {
      return dailyCard.value.card;
    }

    try {
      // 새로운 카드 뽑기
      const cards = getRandomCards(1);
      const card = cards[0];
      const orientation: Orientation = Math.random() < 0.5 ? 'upright' : 'reversed';
      
      dailyCard.value = {
        date: today,
        card,
        orientation
      };

      // 로컬 저장
      saveDailyCardLocal();
      
      return card;
    } catch (error) {
      console.error('일일 카드 뽑기 실패:', error);
      
      // Fallback
      const cards = getRandomCards(1);
      const card = cards[0];
      const orientation: Orientation = Math.random() < 0.5 ? 'upright' : 'reversed';
      
      dailyCard.value = {
        date: today,
        card,
        orientation
      };
      
      saveDailyCardLocal();
      return card;
    }
  };

  // 카드 뽑기 (정/역방향 포함)
  const drawCards = (count: number): DrawnCard[] => {
    const cards = getRandomCards(count);
    
    return cards.map(card => ({
      ...card,
      orientation: Math.random() < 0.5 ? 'upright' : 'reversed'
    } as DrawnCard));
  };

  // 점괘 생성
  const createReading = async (
    spreadId: string, 
    topic: Topic, 
    question?: string
  ): Promise<Reading> => {
    try {
      isLoading.value = true;
      console.log('점괘 생성 시작:', { spreadId, topic, question });
      
      const spread = getSpreadById(spreadId);
      if (!spread) {
        throw new Error('Invalid spread ID: ' + spreadId);
      }
      
      console.log('선택된 스프레드:', spread);
      console.log('사용 가능한 카드 수:', tarotCards.value.length);

      const cards = drawCards(spread.cardCount);
      console.log('뽑은 카드들:', cards);
      
      // 각 카드에 포지션 할당
      const cardsWithPositions = cards.map((card, index) => {
        const interpretation = generateInterpretation(card, spread.positions[index], topic);
        console.log(`카드 ${index + 1} 해석:`, interpretation);
        
        return {
          ...card,
          position: spread.positions[index],
          interpretation
        };
      });

      const reading: Reading = {
        id: `reading_${Date.now()}`,
        userId: userStore.currentUser?.id,
        spreadId,
        topic,
        question,
        cards: cardsWithPositions,
        overallMessage: generateOverallMessage(cardsWithPositions, spread, topic),
        createdAt: new Date(),
        isPremium: spread.isPremium,
        shared: false
      };
      
      console.log('생성된 점괘:', reading);

      // 로컬 저장
      saveReading(reading);
      currentReading.value = reading;
      
      return reading;
    } catch (error) {
      console.error('점괘 생성 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 카드 해석 생성
  const generateInterpretation = (
    card: DrawnCard, 
    position: any, 
    topic: Topic
  ) => {
    const meaning = card.meanings[topic]?.[card.orientation] || 
                   card.meanings.general[card.orientation];
    
    return {
      basic: meaning,
      positional: `${position.name}에서 이 카드는: ${meaning}`,
      advice: generateAdvice(card, topic),
      keywords: card.keywords[card.orientation]
    };
  };

  // 조언 생성
  const generateAdvice = (card: DrawnCard, topic: Topic): string => {
    const adviceTemplates = {
      upright: [
        "이 카드의 긍정적인 에너지를 활용하세요.",
        "지금이 행동할 때입니다.",
        "자신감을 가지고 앞으로 나아가세요."
      ],
      reversed: [
        "내면을 돌아보고 균형을 찾으세요.",
        "조금 더 신중하게 접근하세요.",
        "다른 관점에서 상황을 바라보세요."
      ]
    };

    const templates = adviceTemplates[card.orientation];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  // 전체 메시지 생성
  const generateOverallMessage = (
    cards: DrawnCard[], 
    spread: TarotSpread, 
    topic: Topic
  ): string => {
    // 긍정적인 카드 수 계산
    const positiveCount = cards.filter(c => c.orientation === 'upright').length;
    const ratio = positiveCount / cards.length;

    if (ratio > 0.7) {
      return "전반적으로 매우 긍정적인 에너지가 흐르고 있습니다. 자신감을 가지고 목표를 향해 나아가세요.";
    } else if (ratio > 0.5) {
      return "균형 잡힌 에너지가 나타나고 있습니다. 신중하면서도 적극적인 자세가 필요합니다.";
    } else if (ratio > 0.3) {
      return "도전이 있지만 극복할 수 있는 힘이 있습니다. 인내심을 가지고 노력하세요.";
    } else {
      return "어려운 시기일 수 있지만, 이는 성장의 기회입니다. 내면의 힘을 믿으세요.";
    }
  };

  // 점괘 저장 (로컬)
  const saveReading = (reading: Reading) => {
    readings.value.unshift(reading);
    
    // 무료 사용자는 최근 10개만 저장
    if (!userStore.isPremium && readings.value.length > 10) {
      readings.value = readings.value.slice(0, 10);
    }
    
    // 로컬 저장
    saveReadingsToStorage();
  };

  // 점괘 목록 로드
  const loadReadings = async () => {
    try {
      loadReadingsFromStorage();
    } catch (error) {
      console.error('점괘 로드 실패:', error);
    }
  };

  // 점괘 삭제
  const deleteReading = async (readingId: string) => {
    try {
      readings.value = readings.value.filter(r => r.id !== readingId);
      saveReadingsToStorage();
    } catch (error) {
      console.error('점괘 삭제 실패:', error);
      throw error;
    }
  };

  // 초기화
  const initialize = async () => {
    try {
      // 타로카드 데이터 로드 (비동기)
      await loadTarotCards();
      
      // 스프레드 데이터 초기화 (비동기)
      await initializeSpreads();
      
      // 로컬 데이터 로드
      loadReadingsFromStorage();
      loadDailyCardFromStorage();
    } catch (error) {
      console.error('타로 스토어 초기화 실패:', error);
    }
  };
  
  // 스프레드 데이터 초기화
  const initializeSpreads = async () => {
    try {
      console.log('스프레드 데이터 로드 시작...');
      
      // Supabase에서 스프레드 데이터 로드 시도
      const supabaseSpreads = await spreadService.getAllSpreads();
      
      if (supabaseSpreads && supabaseSpreads.length > 0) {
        // Supabase 데이터를 TarotSpread 형식으로 변환
        spreads.value = supabaseSpreads.map(spread => ({
          spreadId: spread.spread_id,
          name: spread.name,
          nameKr: spread.name_kr,
          description: spread.description,
          cardCount: spread.card_count,
          positions: spread.positions,
          isPremium: spread.is_premium,
          topics: spread.topics
        }));
        
        console.log('Supabase에서 스프레드 로드 성공:', spreads.value.length + '개');
      } else {
        console.warn('Supabase 스프레드 데이터가 비어있음, 기본 데이터 사용');
        spreads.value = tarotSpreads;
      }
    } catch (error) {
      console.error('스프레드 로드 실패:', error);
      console.log('기본 데이터로 대체');
      spreads.value = tarotSpreads;
    }
    
    console.log('스프레드 초기화 완료:', spreads.value.length + '개');
    console.log('사용 가능한 스프레드:', spreads.value.map(s => s.nameKr));
  };

  // 오늘의 카드 로드 (더 완전한 버전)
  const loadDailyCard = async () => {
    try {
      // 먼저 로엄 저장소에서 로드
      loadDailyCardFromStorage();
      
      const today = new Date().toDateString();
      
      // 오늘 날짜의 카드가 없다면 새로 띠기
      if (!dailyCard.value || dailyCard.value.date !== today) {
        console.log('오늘의 새 카드를 띠을 예정');
        // 카드가 로드되어 있는지 확인
        if (tarotCards.value.length === 0) {
          console.log('카드 데이터가 없음, 먼저 로드');
          await loadTarotCards();
        }
        
        // 새로운 일일 카드 띠기
        await drawDailyCard();
      }
    } catch (error) {
      console.error('오늘의 카드 로드 실패:', error);
    }
  };

  // Getters
  const getDailyCard = () => dailyCard.value;
  const getReadings = () => readings.value;
  const getCurrentReading = () => currentReading.value;
  const getReadingById = (id: string) => readings.value.find(r => r.id === id);

  // Setters
  const setSelectedTopic = (topic: any) => {
    selectedTopic.value = topic;
  };

  const setSelectedSpread = (spread: any) => {
    selectedSpread.value = spread;
  };

  return {
    readings,
    dailyCard,
    currentReading,
    vibrationEnabled,
    isLoading,
    tarotCards,
    spreads,
    selectedTopic,
    selectedSpread,
    initialize,
    loadTarotCards,
    drawDailyCard,
    drawCards,
    createReading,
    loadReadings,
    deleteReading,
    loadDailyCard,
    loadDailyCardFromStorage,
    getDailyCard,
    getReadings,
    getCurrentReading,
    getReadingById,
    setSelectedTopic,
    setSelectedSpread
  };
});
