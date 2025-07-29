<template>
  <div class="history-page">
    <!-- 헤더 -->
    <header class="header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="header-title">점괘 기록</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 통계 섹션 -->
        <div class="stats-section">
          <div class="stat-card">
            <div class="stat-value">{{ totalReadings }}</div>
            <div class="stat-label">전체 점괘</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ thisMonthReadings }}</div>
            <div class="stat-label">이번 달</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ favoriteCard }}</div>
            <div class="stat-label">자주 나온 카드</div>
          </div>
        </div>

        <!-- 기록 목록 -->
        <div class="readings-list" v-if="readings.length > 0">
          <div 
            v-for="reading in sortedReadings" 
            :key="reading.id"
            class="reading-item"
            @click="viewReading(reading)"
          >
            <div class="reading-header">
              <h3 class="reading-spread">{{ getSpreadName(reading.spreadId) }}</h3>
              <span class="reading-date">{{ formatDate(reading.date) }}</span>
            </div>
            
            <div class="reading-cards">
              <div 
                v-for="(cardInfo, index) in reading.cards.slice(0, 3)" 
                :key="index"
                class="mini-card"
              >
                <span class="mini-card-emoji">{{ cardInfo.card.imageUrl || '🎴' }}</span>
                <span class="mini-card-name">{{ cardInfo.card.nameKr }}</span>
              </div>
              <div v-if="reading.cards.length > 3" class="more-cards">
                +{{ reading.cards.length - 3 }}
              </div>
            </div>
            
            <div class="reading-preview">
              {{ getReadingPreview(reading) }}
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>아직 점괘 기록이 없습니다</h3>
          <p>타로 점을 보고 나면 여기에 기록이 저장됩니다.</p>
          <button @click="goToReading" class="start-reading-button">
            첫 타로 점보기
          </button>
        </div>

        <!-- 프리미엄 안내 (무료 사용자) -->
        <div v-if="!user?.isPremium && readings.length >= 5" class="premium-notice">
          <h4>🌟 더 많은 기록을 저장하세요</h4>
          <p>프리미엄 구독으로 무제한 히스토리를 저장할 수 있습니다.</p>
          <button @click="goToPremium" class="premium-button">
            프리미엄 구독하기
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { spreads } from '../data/spreads';
import { NativeUtils } from '../utils/capacitor';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

// computed
const user = computed(() => userStore.currentUser);
const readings = computed(() => tarotStore.readings);
const sortedReadings = computed(() => {
  return [...readings.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// 통계
const totalReadings = computed(() => readings.value.length);
const thisMonthReadings = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return readings.value.filter(reading => {
    const readingDate = new Date(reading.date);
    return readingDate.getMonth() === currentMonth && 
           readingDate.getFullYear() === currentYear;
  }).length;
});

const favoriteCard = computed(() => {
  if (readings.value.length === 0) return '-';
  
  // 모든 카드 집계
  const cardCounts: Record<string, number> = {};
  readings.value.forEach(reading => {
    reading.cards.forEach(cardInfo => {
      const cardName = cardInfo.card.nameKr;
      cardCounts[cardName] = (cardCounts[cardName] || 0) + 1;
    });
  });
  
  // 가장 많이 나온 카드 찾기
  let maxCount = 0;
  let favoriteCardName = '';
  
  Object.entries(cardCounts).forEach(([cardName, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteCardName = cardName;
    }
  });
  
  return favoriteCardName || '-';
});

// 스프레드 이름 가져오기
const getSpreadName = (spreadId: string) => {
  const spread = spreads.find(s => s.id === spreadId);
  return spread?.name || '알 수 없는 스프레드';
};

// 날짜 포맷
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  }
};

// 리딩 미리보기 텍스트
const getReadingPreview = (reading: any) => {
  const cards = reading.cards.map((c: any) => c.card.nameKr).join(', ');
  return `${cards}`;
};

// 리딩 상세 보기
const viewReading = async (reading: any) => {
  await NativeUtils.buttonTapHaptic();
  
  // 선택한 리딩을 현재 리딩으로 설정
  tarotStore.setCurrentReading(reading);
  
  // 결과 페이지로 이동
  router.push('/reading-result');
};

// 새로운 점보기
const goToReading = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/reading-select');
};

// 뒤로가기
const goBack = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/');
};

// 프리미엄 페이지로
const goToPremium = async () => {
  await NativeUtils.buttonTapHaptic();
  router.push('/premium');
};
</script>

<style scoped>
.history-page {
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
  max-width: 800px;
  margin: 0 auto;
}

/* 통계 섹션 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(45, 42, 92, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #A855F7;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 리딩 목록 */
.readings-list {
  margin-bottom: 2rem;
}

.reading-item {
  background: rgba(45, 42, 92, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reading-item:hover {
  transform: translateY(-2px);
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.reading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reading-spread {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.reading-date {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.reading-cards {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.mini-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(62, 59, 110, 0.4);
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.mini-card-emoji {
  font-size: 1.25rem;
}

.mini-card-name {
  color: rgba(255, 255, 255, 0.9);
}

.more-cards {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  padding: 0.5rem;
}

.reading-preview {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  color: white;
}

.empty-state p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem;
}

.start-reading-button {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-reading-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(168, 85, 247, 0.4);
}

/* 프리미엄 안내 */
.premium-notice {
  background: rgba(245, 158, 11, 0.1);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  margin-top: 2rem;
}

.premium-notice h4 {
  font-size: 1.125rem;
  margin: 0 0 0.5rem;
  color: #F59E0B;
}

.premium-notice p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem;
}

.premium-button {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .reading-cards {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }
  
  .stats-section {
    gap: 0.5rem;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .reading-item {
    padding: 1rem;
  }
  
  .mini-card {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }
  
  .mini-card-emoji {
    font-size: 1rem;
  }
}
</style>
