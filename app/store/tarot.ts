import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  TarotCard, 
  DrawnCard, 
  Reading, 
  Orientation,
  Topic,
  TarotSpread,
  Reading as TarotReading
} from '../models/tarot';
import { useUserStore } from './user';
import { tarotService, spreadService } from '../services/supabase';
import { tarotSpreads } from '../data/spreads';
import { generateEnhancedInterpretation, generateCelticCrossInterpretation, CelticCrossInterpreter } from '../services/premiumInterpretation';
import { CardCombinationAnalyzer, TopicSpecificInterpretation } from '../services/interpretation/cardCombinations';
import { PersonalizedInterpretation, LifePathCalculator, ZodiacCalculator } from '../services/interpretation/personalizedInterpretation';
import { AIInterpretationEnhancer, ProbabilityInterpreter } from '../services/interpretation/aiEnhancer';
import { DeepInterpretationService } from '../services/premium/deepInterpretation';
import { EnhancedCelticCrossInterpreter } from '../services/interpretation/EnhancedCelticCrossInterpreter.js';
import { EnhancedSevenStarInterpreter } from '../services/interpretation/EnhancedSevenStarInterpreter.js';
import { EnhancedCupOfRelationshipInterpreter } from '../services/interpretation/EnhancedCupOfRelationshipInterpreter.js';

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
  const tempDrawnCards = ref<DrawnCard[] | null>(null);
  const customQuestion = ref<string>('');  // 커스텀 질문 저장

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

  const setTempDrawnCards = (cards: DrawnCard[] | null) => {
    tempDrawnCards.value = cards;
  };

  const getTempDrawnCards = () => tempDrawnCards.value;
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
    question?: string,
    overrideCards?: DrawnCard[]
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

      const cards = overrideCards && overrideCards.length > 0
        ? overrideCards
        : (tempDrawnCards.value && tempDrawnCards.value.length === spread.cardCount
            ? tempDrawnCards.value
            : drawCards(spread.cardCount));
      console.log('뽑은 카드들:', cards);
      
      // 각 카드에 포지션 할당
      const cardsWithPositions = cards.map((card, index) => {
        return {
          ...card,
          position: spread.positions[index]
        };
      });

      // 해석 생성 - 다층적 분석 시스템 적용
      let interpretation: any;
      
      // 1. 기본 해석 생성
      if (spreadId === 'celtic_cross' && userStore.isPremium) {
        // 프리미엄 사용자는 향상된 켈틱 크로스 해석기 사용
        const enhancedInterpreter = new EnhancedCelticCrossInterpreter(topic, cardsWithPositions);
        const enhancedInterpretation = await enhancedInterpreter.generateInterpretation();
        
        interpretation = {
          cards: cardsWithPositions.map((card, index) => {
            const positionMeaning = enhancedInterpretation.positionMeanings?.find(pm => pm.position === index + 1);
            return {
              ...card,
              interpretation: {
                basic: positionMeaning?.meaning || `${card.position.name}에서 ${card.nameKr}`,
                advice: enhancedInterpretation.actionSuggestions?.find(as => as.position === index + 1)?.action || ''
              }
            };
          }),
          overallMessage: enhancedInterpretation.overallMessage,
          enhancedInterpretation: enhancedInterpretation,
          premiumInsights: {
            combinationPatterns: enhancedInterpretation.combinationPatterns,
            synergies: enhancedInterpretation.synergies,
            actionSuggestions: enhancedInterpretation.actionSuggestions,
            positionMeanings: enhancedInterpretation.positionMeanings
          }
        };
      } else if (spreadId === 'celtic_cross') {
        // 무료 사용자는 기존 켈틱 크로스 해석기 사용
        const celticInterpreter = new CelticCrossInterpreter(cardsWithPositions, topic);
        const celticInterpretation = await celticInterpreter.generateInterpretation();
        
        interpretation = {
          cards: cardsWithPositions.map((card, index) => ({
            ...card,
            interpretation: {
              basic: celticInterpretation.positions[index].meaning,
              advice: celticInterpretation.advice
            }
          })),
          overallMessage: celticInterpretation.overallPattern,
          premiumInsights: {
            relationships: celticInterpretation.relationships || [],
            elementAnalysis: celticInterpretation.elementAnalysis || [],
            timelineAnalysis: celticInterpretation.timelineAnalysis || {},
            keywords: celticInterpretation.keywords || []
          }
        };
      } else if (spreadId === 'seven_star' && userStore.isPremium) {
        // 프리미엄 사용자는 향상된 세븐 스타 해석기 사용
        const sevenStarInterpreter = new EnhancedSevenStarInterpreter(topic, cardsWithPositions);
        const sevenStarInterpretation = await sevenStarInterpreter.generateInterpretation();
        
        interpretation = {
          cards: cardsWithPositions.map((card, index) => {
            const positionMeaning = sevenStarInterpretation.positionMeanings?.find(pm => pm.position === index + 1);
            return {
              ...card,
              interpretation: {
                basic: positionMeaning?.meaning || `${card.position.name}에서 ${card.nameKr}`,
                advice: sevenStarInterpretation.actionSuggestions?.find(as => as.position === index + 1)?.action || ''
              }
            };
          }),
          overallMessage: sevenStarInterpretation.overallMessage,
          enhancedInterpretation: sevenStarInterpretation,
          premiumInsights: {
            combinationPatterns: sevenStarInterpretation.combinationPatterns,
            synergies: sevenStarInterpretation.synergies,
            actionSuggestions: sevenStarInterpretation.actionSuggestions,
            positionMeanings: sevenStarInterpretation.positionMeanings
          }
        };
      } else if (spreadId === 'cup_of_relationship' && userStore.isPremium) {
        // 프리미엄 사용자는 향상된 컵 오브 릴레이션십 해석기 사용
        const cupInterpreter = new EnhancedCupOfRelationshipInterpreter(topic, cardsWithPositions);
        const cupInterpretation = await cupInterpreter.generateInterpretation();
        
        interpretation = {
          cards: cardsWithPositions.map((card, index) => {
            const positionMeaning = cupInterpretation.positionMeanings?.find(pm => pm.position === index + 1);
            return {
              ...card,
              interpretation: {
                basic: positionMeaning?.meaning || `${card.position.name}에서 ${card.nameKr}`,
                advice: cupInterpretation.actionSuggestions?.find(as => as.position === index + 1)?.action || ''
              }
            };
          }),
          overallMessage: cupInterpretation.overallMessage,
          enhancedInterpretation: cupInterpretation,
          premiumInsights: {
            combinationPatterns: cupInterpretation.combinationPatterns,
            synergies: cupInterpretation.synergies,
            actionSuggestions: cupInterpretation.actionSuggestions,
            positionMeanings: cupInterpretation.positionMeanings
          }
        };
      } else {
        // 기존 해석 생성 로직
        interpretation = generateEnhancedInterpretation(
          cardsWithPositions,
          spread,
          topic,
          userStore.isPremium
        );
      }

      // 2. 카드 조합 분석 추가 (프리미엄)
      let cardCombinations = [];
      let cardPattern = null;
      
      if (userStore.isPremium) {
        cardCombinations = DeepInterpretationService.analyzeCardCombinations(cardsWithPositions);
        cardPattern = DeepInterpretationService.analyzeCardPattern(cardsWithPositions);
      }
      
      // 3. 주제별 특화 해석 추가
      const enhancedCards = cardsWithPositions.map((card, index) => {
        const enhanced = TopicSpecificInterpretation.enhanceInterpretation(
          card,
          topic,
          spread.positions[index]
        );
        return {
          ...card,
          interpretation: {
            ...card.interpretation,
            ...enhanced
          }
        };
      });
      
      // 4. AI 기반 심층 해석 (프리미엄)
      let deepInterpretation = null;
      let probabilityAnalysis = null;
      
      if (userStore.isPremium) {
        // 새로운 심층 해석 서비스 사용
        const tempReading: TarotReading = {
          id: `temp_${Date.now()}`,
          userId: userStore.currentUser?.id,
          spreadId,
          topic,
          question,
          cards: cardsWithPositions,
          overallMessage: '',
          createdAt: new Date(),
          isPremium: true,
          shared: false
        };
        
        deepInterpretation = DeepInterpretationService.generateDeepInterpretation(tempReading);
        
        // 확률적 분석
        probabilityAnalysis = DeepInterpretationService.generateProbabilityAnalysis(
          cardsWithPositions,
          topic
        );
      }
      
      // 6. 시간대별 분석 (켈틱 크로스인 경우)
      let timelineAnalysis = null;
      if (spreadId === 'celtic_cross') {
        const pastCards = [cardsWithPositions[2], cardsWithPositions[3]];
        const presentCard = cardsWithPositions[0];
        const futureCards = [cardsWithPositions[4], cardsWithPositions[5]];
        
        timelineAnalysis = CardCombinationAnalyzer.analyzeTimelineInfluence(
          pastCards,
          presentCard,
          futureCards
        );
      }
      
      // 7. 모든 분석 결과 통합
      interpretation = {
        ...interpretation,
        cards: enhancedCards,
        cardCombinations,
        cardPattern,
        deepInterpretation,
        probabilityAnalysis,
        timelineAnalysis,
        // 프리미엄 전용 추가 통찰
        premiumInsights: userStore.isPremium ? {
          ...interpretation.premiumInsights,
          deepLayers: deepInterpretation?.layers,
          synthesis: deepInterpretation?.synthesis,
          keyInsights: deepInterpretation?.keyInsights,
          actionPlan: deepInterpretation?.actionPlan,
          affirmations: deepInterpretation?.affirmations,
          journalPrompts: deepInterpretation?.journalPrompts,
          cardCombinations,
          cardPattern,
          probabilityAnalysis,
          timelineAnalysis
        } : undefined
      };

      // 8. 개인화된 해석 추가 (사용자 프로필이 있는 경우)
      if (userStore.currentUser?.birthDate) {
        const userProfile = {
          birthDate: new Date(userStore.currentUser.birthDate),
          zodiacSign: ZodiacCalculator.getZodiacSign(new Date(userStore.currentUser.birthDate)),
          lifePathNumber: LifePathCalculator.calculate(new Date(userStore.currentUser.birthDate)),
          readingHistory: readings.value
        };
        
        const personalizedInterpreter = new PersonalizedInterpretation(userProfile);
        
        interpretation.cards = interpretation.cards.map(card => {
          const personalized = personalizedInterpreter.enhanceInterpretation(card, { spread, topic });
          return {
            ...card,
            interpretation: {
              ...card.interpretation,
              personalized
            }
          };
        });
      }

      // AI 해석은 CardDrawing 컴포넌트에서 한 번만 생성하도록 변경
      // (중복 호출 방지)

      const reading: Reading = {
        id: `reading_${Date.now()}`,
        userId: userStore.currentUser?.id,
        spreadId,
        topic,
        question,
        cards: interpretation.cards || cardsWithPositions,
        overallMessage: interpretation.overallMessage || generateOverallMessage(cardsWithPositions, spread, topic),
        createdAt: new Date(),
        isPremium: spread.isPremium,
        shared: false,
        // 프리미엄 분석 데이터 모두 포함
        premiumInsights: interpretation.premiumInsights,
        cardCombinations: userStore.isPremium ? cardCombinations : undefined,
        cardPattern: userStore.isPremium ? cardPattern : undefined,
        deepInterpretation: userStore.isPremium ? deepInterpretation : undefined,
        probabilityAnalysis: userStore.isPremium ? probabilityAnalysis : undefined,
        timelineAnalysis: userStore.isPremium ? timelineAnalysis : undefined,
        // 향상된 해석 데이터 추가
        enhancedInterpretation: interpretation.enhancedInterpretation,
        // 개선된 해석 데이터 추가 (켈틱 크로스)
        improvedInterpretation: improvedInterpretation.value
      };

      console.log('생성된 점괘:', reading);
      console.log('개선된 해석 저장 상태:', {
        improvedInterpretationFromRef: improvedInterpretation.value,
        enhancedInterpretationFromInterpretation: interpretation.enhancedInterpretation,
        readingImprovedInterpretation: reading.improvedInterpretation,
        readingEnhancedInterpretation: reading.enhancedInterpretation
      });

      // 로컬 저장
      saveReading(reading);
      currentReading.value = reading;

      // 무료 사용자 카운트 증가
      if (!userStore.isPremium) {
        userStore.incrementFreeReadingCount();
      }

      // 임시 카드 초기화
      tempDrawnCards.value = null;

      console.log('점괘 생성 완료:', reading.id);
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

  // 캘틱 크로스 전체 메시지 생성
  const generateCelticCrossMessage = (
    cards: DrawnCard[],
    topic: Topic
  ): string => {
    // 10장의 카드 해석
    const present = cards[0]; // 현재 상황
    const challenge = cards[1]; // 도전/십자가
    const distantPast = cards[2]; // 먼 과거
    const recentPast = cards[3]; // 가까운 과거
    const possibleFuture = cards[4]; // 가능한 미래
    const nearFuture = cards[5]; // 가까운 미래
    const yourApproach = cards[6]; // 당신의 접근
    const externalInfluences = cards[7]; // 외부 영향
    const hopesAndFears = cards[8]; // 희망과 두려움
    const finalOutcome = cards[9]; // 최종 결과

    let message = [];
    
    // 현재 상황과 도전 분석
    if (present.arcana === 'major') {
      message.push(`현재 당신은 ${present.nameKr} 카드가 나타내는 중요한 인생의 전환점에 서 있습니다`);
    } else {
      message.push(`현재 당신의 상황은 ${present.orientation === 'upright' ? '긍정적이고 안정적' : '약간의 불균형과 도전이 있는'}입니다`);
    }
    
    // 도전 분석
    if (challenge.orientation === 'reversed') {
      message.push(`하지만 ${challenge.nameKr} 카드가 나타내듯 내면의 갈등이나 어려움을 극복해야 합니다`);
    } else {
      message.push(`${challenge.nameKr} 카드가 보여주는 도전을 긍정적으로 받아들이면 성장의 기회가 될 것입니다`);
    }
    
    // 과거와 현재의 연결
    if (distantPast.arcana === 'major' || recentPast.arcana === 'major') {
      message.push(`과거의 중요한 사건들이 현재까지 영향을 미치고 있습니다`);
    }
    
    // 미래 전망
    if (possibleFuture.orientation === 'upright' && nearFuture.orientation === 'upright') {
      message.push(`미래는 매우 밝고 희망적입니다`);
    } else if (possibleFuture.orientation === 'reversed' && nearFuture.orientation === 'reversed') {
      message.push(`미래에 주의가 필요하지만, 이는 성장의 기회가 될 것입니다`);
    } else {
      message.push(`미래는 변화와 기회로 가득할 것입니다`);
    }
    
    // 접근 방법 조언
    if (yourApproach.orientation === 'upright') {
      message.push(`당신의 접근 방법은 올바른 방향으로 가고 있습니다`);
    } else {
      message.push(`접근 방식을 다시 고려해볼 필요가 있습니다`);
    }
    
    // 최종 결과 강조
    if (finalOutcome.arcana === 'major') {
      message.push(`최종적으로 ${finalOutcome.nameKr} 카드가 예시하는 중요한 변화가 기다리고 있습니다`);
    } else if (finalOutcome.orientation === 'upright') {
      message.push(`최종적으로 긍정적인 결과를 얻게 될 것입니다`);
    } else {
      message.push(`결과는 예상과 다를 수 있지만, 이 또한 학습과 성장의 기회가 될 것입니다`);
    }
    
    // 주제별 추가 메시지
    switch (topic) {
      case 'love':
        message.push(`사랑과 관계에서 ${hopesAndFears.nameKr} 카드가 나타내는 감정을 잘 다루는 것이 중요합니다`);
        break;
      case 'career':
        message.push(`경력에서 ${externalInfluences.nameKr} 카드가 보여주는 외부 요인들을 잘 활용하세요`);
        break;
      case 'money':
        message.push(`재정적으로 안정을 위해서는 신중한 계획과 실행이 필요합니다`);
        break;
      case 'health':
        message.push(`건강과 웰빙을 위해 내면과 외면의 균형을 유지하세요`);
        break;
      default:
        message.push(`전반적인 삶의 흐름을 이해하고 받아들이세요`);
    }
    
    return message.join('. ') + '.';
  };

  // 세븐 스타 전체 메시지 생성
  const generateSevenStarMessage = (
    cards: DrawnCard[],
    topic: Topic
  ): string => {
    // 7장의 카드 해석
    const pastInfluence = cards[0]; // 과거의 영향
    const currentSituation = cards[1]; // 현재 상황
    const hiddenInfluence = cards[2]; // 숨겨진 영향
    const consciousDesire = cards[3]; // 의식적 욕구
    const unconsciousNeed = cards[4]; // 무의식적 욕구
    const advice = cards[5]; // 조언
    const outcome = cards[6]; // 최종 결과

    let message = [];
    
    // 현재 상황 분석
    if (currentSituation.arcana === 'major') {
      message.push(`현재 당신은 ${currentSituation.nameKr} 카드가 나타내는 중요한 시기에 있습니다`);
    } else {
      message.push(`현재 ${currentSituation.orientation === 'upright' ? '안정적이고 조화로운' : '도전이 필요한'} 상황에 놓여 있습니다`);
    }
    
    // 과거와 숨겨진 영향
    if (pastInfluence.orientation === 'reversed' || hiddenInfluence.orientation === 'reversed') {
      message.push(`과거의 미해결된 문제나 숨겨진 요인들이 영향을 미치고 있습니다`);
    }
    
    // 욕구의 불일치 확인
    if (consciousDesire.suit !== unconsciousNeed.suit && consciousDesire.arcana === 'minor' && unconsciousNeed.arcana === 'minor') {
      message.push(`의식적으로 원하는 것과 진정으로 필요한 것 사이에 차이가 있습니다`);
    }
    
    // 조언 강조
    if (advice.arcana === 'major') {
      message.push(`${advice.nameKr} 카드가 제시하는 중요한 교훈을 따르세요`);
    } else {
      message.push(`${advice.orientation === 'upright' ? '긍정적이고 적극적인' : '신중하고 조심스러운'} 접근이 필요합니다`);
    }
    
    // 최종 결과
    if (outcome.orientation === 'upright') {
      message.push(`최종적으로 긍정적인 결과와 성장을 경험하게 될 것입니다`);
    } else {
      message.push(`예상과 다른 결과일 수 있지만, 이는 더 큰 깨달음으로 이어질 것입니다`);
    }
    
    // 주제별 추가 메시지
    switch (topic) {
      case 'love':
        message.push(`사랑에서는 진정한 마음의 소리에 귀 기울이는 것이 중요합니다`);
        break;
      case 'career':
        message.push(`경력에서는 숨겨진 재능과 기회를 발견할 수 있습니다`);
        break;
      case 'money':
        message.push(`재정적으로는 균형잡힌 관점과 장기적 계획이 필요합니다`);
        break;
      default:
        message.push(`별들이 당신의 길을 밝게 비추고 있습니다`);
    }
    
    return message.join('. ') + '.';
  };

  // 컵 오브 릴레이션십 전체 메시지 생성
  const generateCupOfRelationshipMessage = (
    cards: DrawnCard[],
    topic: Topic
  ): string => {
    // 7장의 카드 해석
    const yourFeelings = cards[0]; // 당신의 감정
    const theirFeelings = cards[1]; // 상대의 감정
    const foundation = cards[2]; // 관계의 기반
    const communication = cards[3]; // 소통의 상태
    const intimacy = cards[4]; // 친밀감
    const obstacles = cards[5]; // 장애물
    const future = cards[6]; // 관계의 미래

    let message = [];
    
    // 감정 상태 분석
    if (yourFeelings.orientation === theirFeelings.orientation) {
      message.push(`두 사람의 감정이 ${yourFeelings.orientation === 'upright' ? '서로 조화롭게 흐르고' : '비슷한 어려움을 겪고'} 있습니다`);
    } else {
      message.push(`두 사람의 감정 상태에 차이가 있어 이해와 소통이 필요합니다`);
    }
    
    // 관계의 기반
    if (foundation.arcana === 'major') {
      message.push(`이 관계는 ${foundation.nameKr} 카드가 나타내는 깊은 의미와 운명적 연결을 가지고 있습니다`);
    }
    
    // 소통과 친밀감
    if (communication.orientation === 'upright' && intimacy.orientation === 'upright') {
      message.push(`소통과 친밀감이 잘 유지되고 있어 관계가 건강합니다`);
    } else {
      message.push(`소통이나 친밀감에서 개선이 필요한 부분이 있습니다`);
    }
    
    // 장애물 분석
    if (obstacles.arcana === 'major') {
      message.push(`${obstacles.nameKr} 카드가 나타내는 중요한 도전을 함께 극복해야 합니다`);
    } else if (obstacles.orientation === 'reversed') {
      message.push(`내면의 두려움이나 과거의 상처가 관계에 영향을 미치고 있습니다`);
    }
    
    // 미래 전망
    if (future.orientation === 'upright') {
      message.push(`이 관계는 밝고 희망적인 미래로 나아가고 있습니다`);
    } else {
      message.push(`관계의 미래를 위해 현재의 문제들을 진지하게 다루어야 합니다`);
    }
    
    // 사랑 주제이므로 추가 메시지
    message.push(`사랑은 두 사람이 함께 만들어가는 여정임을 기억하세요`);
    
    return message.join('. ') + '.';
  };

  // 전체 메시지 생성 (개선된 버전)
  const generateOverallMessage = (
    cards: DrawnCard[], 
    spread: TarotSpread, 
    topic: Topic
  ): string => {
    // 캘틱 크로스 스프레드인 경우 특별한 메시지 생성
    if (spread.spreadId === 'celtic_cross') {
      return generateCelticCrossMessage(cards, topic);
    }
    // 긍정적인 카드 수 계산
    const positiveCount = cards.filter(c => c.orientation === 'upright').length;
    const ratio = positiveCount / cards.length;
    
    // 메이저 아르카나 카드 확인
    const majorCards = cards.filter(c => c.arcana === 'major');
    const hasMajorCards = majorCards.length > 0;
    
    // 각 포지션별 카드 해석
    let positionAnalysis = [];
    
    // 3장 스프레드의 경우 (과거-현재-미래)
    if (spread.cardCount === 3) {
      const past = cards[0];
      const present = cards[1];
      const future = cards[2];
      
      // 과거 카드 분석
      if (past.orientation === 'reversed') {
        positionAnalysis.push("과거에 어려움이 있었지만");
      } else {
        positionAnalysis.push("과거의 경험이 현재에 긍정적인 영향을 주고 있으며");
      }
      
      // 현재 카드 분석
      if (present.arcana === 'major') {
        positionAnalysis.push("현재 중요한 전환점에 있습니다");
      } else if (present.orientation === 'upright') {
        positionAnalysis.push("현재 상황은 안정적이고 긍정적입니다");
      } else {
        positionAnalysis.push("현재 약간의 도전에 직면해 있습니다");
      }
      
      // 미래 카드 분석
      if (future.orientation === 'upright') {
        if (future.arcana === 'major') {
          positionAnalysis.push("앞으로 큰 변화와 발전이 기다리고 있습니다");
        } else {
          positionAnalysis.push("미래는 밝고 희망적입니다");
        }
      } else {
        positionAnalysis.push("미래에 주의가 필요한 부분이 있으니 신중하게 접근하세요");
      }
    }
    
    // 주제별 메시지
    let topicMessage = "";
    switch (topic) {
      case 'love':
        if (ratio > 0.6) {
          topicMessage = " 사랑과 관계에서 긍정적인 에너지가 흐르고 있습니다.";
        } else {
          topicMessage = " 관계에서 조금 더 소통과 이해가 필요합니다.";
        }
        break;
      case 'career':
        if (ratio > 0.6) {
          topicMessage = " 경력과 직업에서 성공의 기회가 다가오고 있습니다.";
        } else {
          topicMessage = " 직업적 성장을 위해 노력과 인내가 필요한 시기입니다.";
        }
        break;
      case 'money':
        if (hasMajorCards) {
          topicMessage = " 재정적으로 중요한 변화가 예상됩니다.";
        } else if (ratio > 0.5) {
          topicMessage = " 재정 상태가 개선될 것으로 보입니다.";
        } else {
          topicMessage = " 재정 관리에 더 신경을 써야 할 때입니다.";
        }
        break;
      case 'health':
        if (ratio > 0.7) {
          topicMessage = " 건강과 활력이 좋은 상태입니다.";
        } else {
          topicMessage = " 건강 관리에 더 주의를 기울이세요.";
        }
        break;
      default:
        topicMessage = "";
    }
    
    // 메시지 조합
    let finalMessage = positionAnalysis.join(", ");
    if (finalMessage) {
      finalMessage += ".";
    }
    
    finalMessage += topicMessage;
    
    // 메이저 카드가 많은 경우 추가 메시지
    if (majorCards.length >= 2) {
      finalMessage += " 인생의 중요한 전환점에 와 있으니 신중하게 결정하세요.";
    }
    
    // 마무리 메시지
    if (ratio > 0.7) {
      finalMessage += " 전반적으로 매우 긍정적인 흐름이 보입니다.";
    } else if (ratio < 0.3) {
      finalMessage += " 어려움이 있더라도 이것은 성장의 기회임을 기억하세요.";
    }
    
    return finalMessage;
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
  
  // 커스텀 질문 관련 함수
  const setCustomQuestion = (question: string) => {
    customQuestion.value = question;
  };
  
  const getCustomQuestion = () => customQuestion.value;
  
  const clearCustomQuestion = () => {
    customQuestion.value = '';
  };
  
  // 개선된 해석 저장 (켈틱 크로스 등)
  const improvedInterpretation = ref<any>(null);
  
  const setImprovedInterpretation = (interpretation: any) => {
    improvedInterpretation.value = interpretation;
  };
  
  const getImprovedInterpretation = () => improvedInterpretation.value;
  
  const clearImprovedInterpretation = () => {
    improvedInterpretation.value = null;
  };
  
  // reading 업데이트 함수 추가
  const updateReading = (reading: Reading) => {
    const index = readings.value.findIndex(r => r.id === reading.id);
    if (index !== -1) {
      readings.value[index] = reading;
      saveReadingsToStorage();
    }
    currentReading.value = reading;
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
    improvedInterpretation,
    customQuestion,
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
    setSelectedSpread,
    setCustomQuestion,
    getCustomQuestion,
    clearCustomQuestion,
    setTempDrawnCards,
    getTempDrawnCards,
    setImprovedInterpretation,
    getImprovedInterpretation,
    clearImprovedInterpretation,
    updateReading
  };
});
