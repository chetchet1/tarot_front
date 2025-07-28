<template>
  <div class="tarot-dictionary">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>타로카드 사전</h1>
    </header>

    <div class="container">
      <div class="search-section">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="카드 이름으로 검색하세요..."
            class="search-input"
          />
          <button class="search-button">🔍</button>
        </div>
        
        <div class="filter-tabs">
          <button 
            v-for="filter in filters" 
            :key="filter.id"
            class="filter-tab"
            :class="{ active: activeFilter === filter.id }"
            @click="setFilter(filter.id)"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <div class="cards-grid">
        <div 
          v-for="card in filteredCards" 
          :key="card.id"
          class="card-item card"
          @click="selectCard(card)"
        >
          <div class="card-image">
            <div class="card-placeholder">🃏</div>
          </div>
          <div class="card-info">
            <h3>{{ card.nameKr }}</h3>
            <p class="card-name-en">{{ card.name }}</p>
            <div class="card-meta">
              <span class="arcana-type" :class="card.arcana">
                {{ card.arcana === 'major' ? '메이저' : '마이너' }}
              </span>
              <span v-if="card.suit" class="suit">{{ getSuitName(card.suit) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 카드 상세 모달 -->
      <div v-if="selectedCard" class="modal-backdrop" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedCard.nameKr }}</h2>
            <button class="close-button" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="card-visual">
              <div class="card-image-large">🃏</div>
              <div class="card-basic-info">
                <p><strong>영문명:</strong> {{ selectedCard.name }}</p>
                <p><strong>분류:</strong> {{ selectedCard.arcana === 'major' ? '메이저 아르카나' : '마이너 아르카나' }}</p>
                <p v-if="selectedCard.suit"><strong>수트:</strong> {{ getSuitName(selectedCard.suit) }}</p>
                <p v-if="selectedCard.number"><strong>번호:</strong> {{ selectedCard.number }}</p>
              </div>
            </div>
            
            <div class="card-meanings" v-if="selectedCard.keywords">
              <div class="meaning-section">
                <h4>🔮 정방향 키워드</h4>
                <div class="keywords">
                  <span 
                    v-for="keyword in selectedCard.keywords.upright" 
                    :key="keyword"
                    class="keyword upright"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
              
              <div class="meaning-section">
                <h4>🔄 역방향 키워드</h4>
                <div class="keywords">
                  <span 
                    v-for="keyword in selectedCard.keywords.reversed" 
                    :key="keyword"
                    class="keyword reversed"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detailed-meanings" v-if="selectedCard.meanings">
              <h4>📖 의미 해석</h4>
              <div class="meaning-tabs">
                <button 
                  v-for="category in meaningCategories" 
                  :key="category.id"
                  class="meaning-tab"
                  :class="{ active: activeMeaningTab === category.id }"
                  @click="setMeaningTab(category.id)"
                >
                  {{ category.name }}
                </button>
              </div>
              
              <div class="meaning-content" v-if="selectedCard.meanings[activeMeaningTab as keyof typeof selectedCard.meanings]">
                <div class="meaning-orientation">
                  <h5>정방향</h5>
                  <p>{{ (selectedCard.meanings[activeMeaningTab as keyof typeof selectedCard.meanings] as any)?.upright }}</p>
                </div>
                <div class="meaning-orientation">
                  <h5>역방향</h5>
                  <p>{{ (selectedCard.meanings[activeMeaningTab as keyof typeof selectedCard.meanings] as any)?.reversed }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// 임시 카드 데이터 (실제로는 allTarotCards에서 가져옴)
const mockCards = [
  {
    id: 0,
    name: "The Fool",
    nameKr: "바보",
    arcana: "major",
    number: 0,
    keywords: {
      upright: ["새로운 시작", "순수함", "자발성", "신선함"],
      reversed: ["무모함", "어리석음", "경솔함", "위험"]
    },
    meanings: {
      general: {
        upright: "새로운 시작과 모험의 기회가 다가오고 있습니다.",
        reversed: "무모한 행동을 조심하고 신중하게 생각하세요."
      },
      love: {
        upright: "순수한 사랑이나 새로운 만남이 기다리고 있습니다.",
        reversed: "사랑에서 성급한 판단을 내리지 마세요."
      }
    }
  },
  {
    id: 1,
    name: "The Magician",
    nameKr: "마법사",
    arcana: "major",
    number: 1,
    keywords: {
      upright: ["의지력", "집중", "실행력", "창조"],
      reversed: ["능력 부족", "집중력 분산", "조작", "속임수"]
    },
    meanings: {
      general: {
        upright: "당신의 의지와 능력으로 목표를 달성할 수 있습니다.",
        reversed: "능력을 과신하지 말고 겸손하게 행동하세요."
      }
    }
  },
  {
    id: 64,
    name: "Ace of Pentacles",
    nameKr: "펜타클의 에이스",
    arcana: "minor",
    suit: "pentacles",
    number: 1,
    keywords: {
      upright: ["새로운 기회", "번영", "풍요", "시작"],
      reversed: ["기회 상실", "계획 부족", "탐욕", "물질주의"]
    },
    meanings: {
      general: {
        upright: "물질적 번영과 새로운 기회가 찾아옵니다.",
        reversed: "기회를 놓치거나 물질에 너무 집착하고 있습니다."
      }
    }
  }
];

const router = useRouter();
const searchQuery = ref('');
const activeFilter = ref('all');
const selectedCard = ref<any>(null);
const activeMeaningTab = ref('general');

const filters = [
  { id: 'all', name: '전체' },
  { id: 'major', name: '메이저 아르카나' },
  { id: 'minor', name: '마이너 아르카나' },
  { id: 'cups', name: '컵' },
  { id: 'wands', name: '완드' },
  { id: 'swords', name: '소드' },
  { id: 'pentacles', name: '펜타클' }
];

const meaningCategories = [
  { id: 'general', name: '종합' },
  { id: 'love', name: '연애' },
  { id: 'career', name: '직업' },
  { id: 'money', name: '금전' }
];

const filteredCards = computed(() => {
  let filtered = mockCards;
  
  // 검색어 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(card => 
      card.nameKr.toLowerCase().includes(query) ||
      card.name.toLowerCase().includes(query)
    );
  }
  
  // 카테고리 필터
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'major' || activeFilter.value === 'minor') {
      filtered = filtered.filter(card => card.arcana === activeFilter.value);
    } else {
      filtered = filtered.filter(card => card.suit === activeFilter.value);
    }
  }
  
  return filtered;
});

const goBack = () => {
  router.go(-1);
};

const setFilter = (filterId: string) => {
  activeFilter.value = filterId;
};

const setMeaningTab = (tabId: string) => {
  activeMeaningTab.value = tabId;
};

const selectCard = (card: any) => {
  selectedCard.value = card;
  activeMeaningTab.value = 'general';
};

const closeModal = () => {
  selectedCard.value = null;
};

const getSuitName = (suit: string) => {
  const suitNames: Record<string, string> = {
    cups: '컵 (감정)',
    wands: '완드 (행동)',
    swords: '소드 (사고)',
    pentacles: '펜타클 (물질)'
  };
  return suitNames[suit] || suit;
};
</script>

<style scoped>
.tarot-dictionary {
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-button {
  padding: 12px 16px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.filter-tab:hover,
.filter-tab.active {
  background: rgba(168, 85, 247, 0.3);
  border-color: #A855F7;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.card-item {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
}

.card-image {
  text-align: center;
  margin-bottom: 15px;
}

.card-placeholder {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.6);
}

.card-info h3 {
  font-size: 18px;
  margin-bottom: 5px;
  color: #A855F7;
}

.card-name-en {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.card-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.arcana-type,
.suit {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.arcana-type.major {
  background: rgba(168, 85, 247, 0.2);
  color: #A855F7;
}

.arcana-type.minor {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.suit {
  background: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

/* 모달 스타일 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: #A855F7;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 30px;
}

.card-visual {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;
}

.card-image-large {
  font-size: 80px;
  color: rgba(255, 255, 255, 0.6);
}

.card-basic-info p {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.meaning-section {
  margin-bottom: 25px;
}

.meaning-section h4 {
  color: #A855F7;
  margin-bottom: 15px;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.keyword.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.keyword.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.meaning-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meaning-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.meaning-tab:hover,
.meaning-tab.active {
  background: rgba(168, 85, 247, 0.3);
  border-color: #A855F7;
}

.meaning-orientation {
  margin-bottom: 20px;
}

.meaning-orientation h5 {
  color: #A855F7;
  margin-bottom: 8px;
}

.meaning-orientation p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .card-visual {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style>
