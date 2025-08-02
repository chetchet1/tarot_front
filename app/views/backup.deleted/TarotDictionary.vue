<template>
  <div class="dictionary-page">
    <!-- 헤더 -->
    <header class="header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="header-title">타로카드 사전</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 검색 바 -->
        <div class="search-section">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="카드 이름으로 검색..."
            class="search-input"
          />
        </div>

        <!-- 카테고리 탭 -->
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.id"
            @click="selectedCategory = category.id"
            class="category-tab"
            :class="{ active: selectedCategory === category.id }"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- 카드 목록 -->
        <div class="cards-grid">
          <div 
            v-for="card in filteredCards" 
            :key="card.id"
            class="card-item"
            @click="selectCard(card)"
          >
            <div class="card-image">{{ card.imageUrl || '🎴' }}</div>
            <h3 class="card-name">{{ card.nameKr }}</h3>
            <p class="card-name-en">{{ card.name }}</p>
            <div class="card-keywords">
              <span v-for="keyword in card.keywords.slice(0, 3)" :key="keyword" class="keyword">
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 카드 상세 모달 -->
    <div v-if="selectedCard" class="card-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button @click="closeModal" class="close-button">×</button>
        
        <div class="modal-header">
          <div class="modal-card-image">{{ selectedCard.imageUrl || '🎴' }}</div>
          <div class="modal-card-info">
            <h2 class="modal-card-name">{{ selectedCard.nameKr }}</h2>
            <p class="modal-card-name-en">{{ selectedCard.name }}</p>
            <p class="modal-card-number">{{ getRomanNumeral(selectedCard.number) }}</p>
          </div>
        </div>
        
        <div class="modal-body">
          <!-- 키워드 -->
          <div class="section">
            <h3>키워드</h3>
            <div class="keywords-list">
              <span v-for="keyword in selectedCard.keywords" :key="keyword" class="modal-keyword">
                {{ keyword }}
              </span>
            </div>
          </div>
          
          <!-- 일반 의미 -->
          <div class="section">
            <h3>일반적 의미</h3>
            <div class="meanings">
              <div class="meaning-item">
                <h4>정방향</h4>
                <p>{{ selectedCard.meanings.general.upright }}</p>
              </div>
              <div class="meaning-item">
                <h4>역방향</h4>
                <p>{{ selectedCard.meanings.general.reversed }}</p>
              </div>
            </div>
          </div>
          
          <!-- 사랑 관련 의미 -->
          <div class="section">
            <h3>사랑과 관계</h3>
            <div class="meanings">
              <div class="meaning-item">
                <h4>정방향</h4>
                <p>{{ selectedCard.meanings.love.upright }}</p>
              </div>
              <div class="meaning-item">
                <h4>역방향</h4>
                <p>{{ selectedCard.meanings.love.reversed }}</p>
              </div>
            </div>
          </div>
          
          <!-- 일/경력 관련 의미 -->
          <div class="section">
            <h3>일과 경력</h3>
            <div class="meanings">
              <div class="meaning-item">
                <h4>정방향</h4>
                <p>{{ selectedCard.meanings.career.upright }}</p>
              </div>
              <div class="meaning-item">
                <h4>역방향</h4>
                <p>{{ selectedCard.meanings.career.reversed }}</p>
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
import { useTarotStore } from '../store/tarot';
import { TarotCard } from '../models/tarot';
import { NativeUtils } from '../utils/capacitor';

const router = useRouter();
const tarotStore = useTarotStore();

// 상태
const searchQuery = ref('');
const selectedCategory = ref('all');
const selectedCard = ref<TarotCard | null>(null);

// 카테고리
const categories = [
  { id: 'all', name: '전체' },
  { id: 'major', name: '메이저 아르카나' },
  { id: 'wands', name: '완드' },
  { id: 'cups', name: '컵' },
  { id: 'swords', name: '소드' },
  { id: 'pentacles', name: '펜타클' },
];

// 필터링된 카드 목록
const filteredCards = computed(() => {
  let cards = tarotStore.allCards;
  
  // 카테고리 필터
  if (selectedCategory.value !== 'all') {
    if (selectedCategory.value === 'major') {
      cards = cards.filter(card => card.type === 'major');
    } else {
      cards = cards.filter(card => card.suit === selectedCategory.value);
    }
  }
  
  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    cards = cards.filter(card => 
      card.nameKr.toLowerCase().includes(query) ||
      card.name.toLowerCase().includes(query) ||
      card.keywords.some(k => k.toLowerCase().includes(query))
    );
  }
  
  return cards;
});

// 로마 숫자 변환
const getRomanNumeral = (num: number | undefined) => {
  if (!num) return '';
  const romanNumerals = [
    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'
  ];
  return romanNumerals[num] || num.toString();
};

// 카드 선택
const selectCard = async (card: TarotCard) => {
  await NativeUtils.buttonTapHaptic();
  selectedCard.value = card;
};

// 모달 닫기
const closeModal = () => {
  selectedCard.value = null;
};

// 뒤로가기
const goBack = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/');
};
</script>

<style scoped>
.dictionary-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(45, 42, 92, 0.3);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.back-button:hover {
  opacity: 0.8;
}

.header-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
  flex: 1;
}

.header-spacer {
  width: 40px;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 검색 섹션 */
.search-section {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 1rem;
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(45, 42, 92, 0.8);
}

/* 카테고리 탭 */
.category-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.category-tab {
  padding: 0.5rem 1rem;
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover {
  border-color: rgba(168, 85, 247, 0.3);
  color: white;
}

.category-tab.active {
  background: rgba(168, 85, 247, 0.8);
  border-color: rgba(168, 85, 247, 0.8);
  color: white;
}

/* 카드 그리드 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.card-item {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-item:hover {
  transform: translateY(-5px);
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-image {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.card-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: white;
}

.card-name-en {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.75rem;
}

.card-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
}

.keyword {
  font-size: 0.625rem;
  background: rgba(168, 85, 247, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  color: #E9D5FF;
}

/* 카드 상세 모달 */
.card-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  overflow-y: auto;
}

.modal-content {
  background: #1E1B4B;
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: center;
}

.modal-card-image {
  font-size: 6rem;
}

.modal-card-info {
  flex: 1;
}

.modal-card-name {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
  color: white;
}

.modal-card-name-en {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem;
}

.modal-card-number {
  font-size: 1rem;
  color: #A855F7;
  margin: 0;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 1rem;
  color: #A855F7;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modal-keyword {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.5);
  padding: 0.375rem 0.875rem;
  border-radius: 15px;
  font-size: 0.875rem;
  color: #E9D5FF;
}

.meanings {
  display: grid;
  gap: 1.5rem;
}

.meaning-item h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.meaning-item p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .modal-header {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .category-tabs {
    gap: 0.375rem;
  }
  
  .category-tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .card-item {
    padding: 1rem;
  }
  
  .card-image {
    font-size: 3rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
}
</style>
