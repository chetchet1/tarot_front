<template>
  <div class="shared-reading-view">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>점괘를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>오류가 발생했습니다</h2>
      <p>{{ error }}</p>
      <button @click="goToApp" class="cta-button">
        🔮 타로 앱으로 가기
      </button>
    </div>

    <!-- 데이터 없음 -->
    <div v-else-if="!sharedData" class="not-found-container">
      <div class="not-found-icon">❓</div>
      <h2>점괘를 찾을 수 없습니다</h2>
      <p>공유 링크가 만료되었거나 존재하지 않습니다.</p>
      <button @click="goToApp" class="cta-button">
        🔮 직접 점괘 보러 가기
      </button>
    </div>

    <!-- 공유된 점괘 표시 -->
    <div v-else class="reading-container">
      <div class="header">
        <h1>🔮 공유된 타로 점괘</h1>
        <p class="subtitle">{{ sharedData.custom_question || '타로 점괘 결과' }}</p>
      </div>

      <!-- 카드 표시 -->
      <div class="cards-section">
        <h2>뽑힌 카드</h2>
        <div class="cards-grid">
          <div v-for="(card, index) in parsedCards" :key="index" class="card-item">
            <div class="card-position">{{ card.position?.name || `카드 ${index + 1}` }}</div>
            <div class="card-name">{{ card.nameKr || card.name }}</div>
            <div class="card-orientation">{{ card.orientation === 'reversed' ? '역방향' : '정방향' }}</div>
          </div>
        </div>
      </div>

      <!-- 해석 표시 -->
      <div v-if="sharedData.basic_interpretation || sharedData.ai_interpretation" class="interpretation-section">
        <h2>📖 해석</h2>
        <div class="interpretation-content">
          <p v-if="sharedData.basic_interpretation">{{ sharedData.basic_interpretation }}</p>
          <p v-if="sharedData.ai_interpretation" class="ai-interpretation">{{ sharedData.ai_interpretation }}</p>
        </div>
      </div>

      <!-- CTA 버튼 -->
      <div class="cta-section">
        <button @click="goToApp" class="cta-button primary">
          🔮 나도 점괘 보러 가기
        </button>
        <p class="cta-text">무료로 타로 점괘를 확인해보세요!</p>
      </div>

      <!-- 만료 시간 표시 -->
      <div v-if="sharedData.expires_at" class="expire-info">
        <small>이 공유 링크는 {{ formatExpireDate(sharedData.expires_at) }}까지 유효합니다.</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 상태 관리
const loading = ref(true);
const error = ref<string | null>(null);
const sharedData = ref<any>(null);

// URL에서 ID 추출
const getIdFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/\/s\/([^\/]+)/);
  return match ? match[1] : null;
};

// 카드 데이터 파싱
const parsedCards = computed(() => {
  if (!sharedData.value?.cards) return [];
  try {
    return typeof sharedData.value.cards === 'string' 
      ? JSON.parse(sharedData.value.cards)
      : sharedData.value.cards;
  } catch {
    return [];
  }
});

// 데이터 로드 (직접 fetch 사용)
const loadSharedReading = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const id = getIdFromUrl();
    console.log('Loading shared reading:', id);
    
    if (!id) {
      throw new Error('공유 ID가 없습니다');
    }
    
    // Supabase REST API 직접 호출
    const url = `https://yxywzsmggvxxujuplyly.supabase.co/rest/v1/shared_readings?id=eq.${id}&select=*`;
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM'
    };
    
    const response = await fetch(url, { headers });
    const result = await response.json();
    
    if (result && result.length > 0) {
      const data = result[0];
      
      // 만료 확인
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('이 공유 링크는 만료되었습니다');
      }
      
      // 비활성화 확인
      if (data.is_active === false) {
        throw new Error('이 공유 링크는 비활성화되었습니다');
      }
      
      sharedData.value = data;
    } else {
      throw new Error('점괘를 찾을 수 없습니다');
    }
    
  } catch (err: any) {
    console.error('Error loading shared reading:', err);
    error.value = err.message || '알 수 없는 오류가 발생했습니다';
  } finally {
    loading.value = false;
  }
};

// 앱으로 이동
const goToApp = () => {
  // 홈으로 이동
  window.location.href = '/';
};

// 만료 날짜 포맷
const formatExpireDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadSharedReading();
});
</script>

<style scoped lang="scss">
.shared-reading-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .error-icon,
  .not-found-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }
}

.reading-container {
  max-width: 800px;
  margin: 0 auto;
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    
    h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  }
  
  .cards-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    
    h2 {
      margin-bottom: 20px;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      
      .card-item {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        
        .card-position {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 5px;
        }
        
        .card-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .card-orientation {
          font-size: 0.85rem;
          opacity: 0.9;
        }
      }
    }
  }
  
  .interpretation-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    
    h2 {
      margin-bottom: 15px;
    }
    
    .interpretation-content {
      line-height: 1.6;
      
      p {
        margin-bottom: 15px;
        
        &.ai-interpretation {
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
  
  .cta-section {
    text-align: center;
    padding: 30px 0;
    
    .cta-text {
      margin-top: 10px;
      opacity: 0.9;
    }
  }
  
  .expire-info {
    text-align: center;
    opacity: 0.7;
    font-size: 0.85rem;
    margin-top: 20px;
  }
}

.cta-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  &.primary {
    background: white;
    color: #667eea;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
