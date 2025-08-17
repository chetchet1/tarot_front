<template>
  <div class="board-main">
    <!-- 헤더 -->
    <header class="board-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="board-title">🌿 비밀의 정원</h1>
      <div class="header-right">
        <button class="write-btn" @click="createNewPost">
          <span class="write-icon">✍️</span>
        </button>
      </div>
    </header>

    <!-- 닉네임 설정 모달 -->
    <BoardNicknameModal
      :visible="showNicknameModal"
      @close="showNicknameModal = false"
      @saved="onNicknameSaved"
    />

    <!-- 카테고리 탭 -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.value"
        class="category-tab"
        :class="{ active: selectedCategory === category.value }"
        @click="selectCategory(category.value)"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- 게시글 목록 -->
    <div class="board-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>게시글을 불러오는 중...</p>
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>아직 게시글이 없습니다</h3>
        <p>첫 번째 글을 작성해보세요!</p>
        <button class="create-post-btn" @click="createNewPost">
          글쓰기
        </button>
      </div>

      <div v-else class="posts-list">
        <article
          v-for="post in posts"
          :key="post.id"
          class="post-item"
          @click="viewPost(post.id)"
        >
          <div class="post-header">
            <span class="post-category">{{ getCategoryLabel(post.category) }}</span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
          
          <h3 class="post-title">{{ post.title }}</h3>
          
          <p class="post-preview">{{ getPreview(post.content) }}</p>
          
          <div class="post-footer">
            <div class="post-author">
              <span class="author-icon">👤</span>
              <span class="author-name">{{ post.nickname || '익명' }}</span>
            </div>
            
            <div class="post-stats">
              <span class="stat-item">
                <span class="stat-icon">👁️</span>
                {{ post.view_count || 0 }}
              </span>
              <span class="stat-item">
                <span class="stat-icon">💬</span>
                {{ post.comment_count || 0 }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          이전
        </button>
        
        <span class="page-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBoardStore } from '../store/board';
import { showAlert } from '../utils/alerts';
import BoardNicknameModal from '../components/BoardNicknameModal.vue';
import type { BoardCategory, BoardPost } from '../types/board';

const router = useRouter();
const boardStore = useBoardStore();

const showNicknameModal = ref(false);
const isLoading = ref(false);
const selectedCategory = ref<BoardCategory>('general');
const currentPage = ref(1);
const postsPerPage = 10;

const categories = [
  { value: 'general' as BoardCategory, label: '💬 일반' },
  { value: 'love' as BoardCategory, label: '💝 연애' },
  { value: 'career' as BoardCategory, label: '💼 직업' },
  { value: 'daily' as BoardCategory, label: '🌅 일상' },
  { value: 'question' as BoardCategory, label: '❓ 질문' }
];

const posts = computed(() => boardStore.posts);
const totalPages = computed(() => Math.ceil(boardStore.totalCount / postsPerPage));

// 카테고리 라벨 가져오기
const getCategoryLabel = (category: BoardCategory) => {
  const cat = categories.find(c => c.value === category);
  return cat ? cat.label : '일반';
};

// 날짜 포맷
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

// 미리보기 텍스트 생성
const getPreview = (content: string) => {
  const maxLength = 100;
  const plainText = content.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

// 게시글 목록 불러오기
const loadPosts = async () => {
  console.log('[BoardMain] loadPosts 시작', {
    currentPage: currentPage.value,
    selectedCategory: selectedCategory.value
  });
  
  isLoading.value = true;
  try {
    // boardStore에 현재 페이지와 카테고리 설정
    boardStore.currentPage = currentPage.value;
    boardStore.currentCategory = selectedCategory.value;
    
    console.log('[BoardMain] boardStore.loadPosts 호출 전');
    await boardStore.loadPosts(true); // forceRefresh를 true로 설정
    console.log('[BoardMain] boardStore.loadPosts 완료', {
      posts: boardStore.posts.length,
      totalCount: boardStore.totalCount
    });
  } catch (error) {
    console.error('[BoardMain] 게시글 로드 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: `게시글을 불러오는데 실패했습니다.\n${error.message || '알 수 없는 오류'}`,
      confirmText: '확인'
    });
  } finally {
    isLoading.value = false;
    console.log('[BoardMain] loadPosts 종료');
  }
};

// 카테고리 선택
const selectCategory = (category: BoardCategory) => {
  selectedCategory.value = category;
  currentPage.value = 1;
  boardStore.currentPage = 1;
  boardStore.currentCategory = category;
  loadPosts();
};

// 페이지 변경
const changePage = (page: number) => {
  currentPage.value = page;
  boardStore.currentPage = page;
  loadPosts();
};

// 게시글 보기
const viewPost = (postId: string) => {
  router.push(`/board/post/${postId}`);
};

// 새 게시글 작성
const createNewPost = async () => {
  // 닉네임 확인
  if (!boardStore.profile?.nickname) {
    showNicknameModal.value = true;
    return;
  }
  
  router.push('/board/write');
};

// 닉네임 저장 완료
const onNicknameSaved = () => {
  showNicknameModal.value = false;
  router.push('/board/write');
};

// 뒤로가기
const goBack = () => {
  router.push('/app');
};

// 초기화
onMounted(async () => {
  console.log('[BoardMain] onMounted 시작');
  
  try {
    // 프로필 확인
    console.log('[BoardMain] 프로필 확인 시작');
    await boardStore.checkProfile();
    console.log('[BoardMain] 프로필 확인 완료', boardStore.profile);
    
    // 게시글 로드
    console.log('[BoardMain] 게시글 로드 시작');
    await loadPosts();
    console.log('[BoardMain] 게시글 로드 완료');
  } catch (error) {
    console.error('[BoardMain] onMounted 오류:', error);
  }
  
  console.log('[BoardMain] onMounted 종료');
});

// 카테고리 변경 감지
watch(selectedCategory, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.board-main {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
}

/* 헤더 */
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.board-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.write-btn {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.write-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

/* 카테고리 탭 */
.category-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.15);
}

.category-tab.active {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border-color: transparent;
  color: white;
}

/* 컨텐츠 영역 */
.board-content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(168, 85, 247, 0.2);
  border-top-color: #A855F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: white;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

.create-post-btn {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: none;
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

/* 게시글 목록 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-category {
  font-size: 14px;
  color: #A855F7;
  font-weight: 500;
}

.post-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.post-preview {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-icon {
  font-size: 14px;
}

.author-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.post-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-icon {
  font-size: 14px;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 20px 0;
}

.page-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .board-header {
    padding: 12px 16px;
  }
  
  .board-title {
    font-size: 20px;
  }
  
  .board-content {
    padding: 16px;
  }
  
  .post-item {
    padding: 16px;
  }
  
  .post-title {
    font-size: 16px;
  }
}
</style>
