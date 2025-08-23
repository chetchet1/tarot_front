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
          v-for="(post, index) in posts"
          :key="post.id"
          class="post-item"
          :class="{
            'notice-post': post.is_notice,
            'event-post': post.is_event_post
          }"
          @click="viewPost(post.id)"
        >
          <span class="post-number">{{ getPostNumber(index) }}</span>
          
          <div class="post-left">
            <div class="post-header">
              <span v-if="post.is_notice" class="special-badge notice-badge">📢 공지</span>
              <span v-else-if="post.is_event_post" class="special-badge event-badge">🎉 이벤트</span>
              <span v-else class="post-category">{{ getCategoryLabel(post.category) }}</span>
              <h3 class="post-title">{{ post.title }}</h3>
            </div>
            
            <div class="post-info">
              <span class="author-name">{{ post.nickname || '익명' }}</span>
              <span class="info-separator">·</span>
              <span class="post-date">{{ formatDate(post.created_at) }}</span>
            </div>
          </div>
          
          <div class="post-right">
            <span class="stat-item">
              <span class="stat-icon">👁️</span>
              {{ post.view_count || 0 }}
            </span>
            <span class="stat-item">
              <span class="stat-icon">💬</span>
              {{ post.comment_count || 0 }}
            </span>
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
    
    <!-- 배너 광고 (프리미엄 사용자 제외) -->
    <AdBanner />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBoardStore } from '../store/board';
import { useUserStore } from '../store/user';
import { showAlert } from '../utils/alerts';
import BoardNicknameModal from '../components/BoardNicknameModal.vue';
import AdBanner from '../components/AdBanner.vue';
import type { BoardCategory, BoardPost } from '../types/board';

const router = useRouter();
const boardStore = useBoardStore();

const showNicknameModal = ref(false);
const isLoading = ref(false);
const selectedCategory = ref<string>('all');
const currentPage = ref(1);
const postsPerPage = 10;

const categories = [
  { value: 'all', label: '📋 전체' },
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

// 게시글 번호 계산
const getPostNumber = (index: number) => {
  // 전체 게시글 수에서 현재 페이지와 인덱스를 고려하여 번호 계산
  // 최신글이 높은 번호를 가지도록 역순으로 계산
  const totalCount = boardStore.totalCount;
  const startNumber = totalCount - ((currentPage.value - 1) * postsPerPage);
  return startNumber - index;
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

// 미리보기 텍스트 생성 (더 이상 사용하지 않음)
// const getPreview = (content: string) => {
//   const maxLength = 100;
//   const plainText = content.replace(/<[^>]*>/g, '');
//   if (plainText.length <= maxLength) return plainText;
//   return plainText.substring(0, maxLength) + '...';
// };

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
    boardStore.currentCategory = selectedCategory.value === 'all' ? '' : selectedCategory.value;
    
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
const selectCategory = (category: string) => {
  selectedCategory.value = category;
  currentPage.value = 1;
  boardStore.currentPage = 1;
  boardStore.currentCategory = category === 'all' ? '' : category;
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
    // 현재 사용자 정보 확인
    const userStore = useUserStore();
    console.log('[BoardMain] 현재 사용자:', {
      id: userStore.currentUser?.id,
      email: userStore.currentUser?.email,
      isAdmin: userStore.isAdmin,
      isPremium: userStore.isPremium
    });
    
    // 관리자 계정인 경우 직접 테이블 조회 테스트
    if (userStore.isAdmin) {
      console.log('[BoardMain] 관리자 계정 감지, 직접 테이블 조회 테스트');
      try {
        const { supabase } = await import('../services/supabase');
        
        // board_posts 테이블 직접 조회
        const { data: testPosts, error: testError } = await supabase
          .from('board_posts')
          .select('*')
          .eq('is_deleted', false)
          .limit(5);
        
        console.log('[BoardMain] 관리자 직접 조회 결과:', {
          posts: testPosts,
          error: testError,
          postsCount: testPosts?.length || 0
        });
        
        // board_profiles 테이블 확인
        const { data: adminProfile, error: profileError } = await supabase
          .from('board_profiles')
          .select('*')
          .eq('user_id', userStore.currentUser.id)
          .maybeSingle();
        
        console.log('[BoardMain] 관리자 프로필 확인:', {
          profile: adminProfile,
          error: profileError
        });
      } catch (testError) {
        console.error('[BoardMain] 관리자 테스트 조회 실패:', testError);
      }
    }
    
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
  padding-bottom: 80px; /* 배너 광고 공간 확보 */
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
  gap: 1px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.post-item {
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 게시글 번호 */
.post-number {
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
}

.post-item:last-child {
  border-bottom: none;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* 공지사항 게시글 */
.post-item.notice-post {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  margin-bottom: 8px;
}

.post-item.notice-post:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.4);
}

/* 이벤트 게시글 */
.post-item.event-post {
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.3);
  border-radius: 8px;
  margin-bottom: 8px;
}

.post-item.event-post:hover {
  background: rgba(236, 72, 153, 0.15);
  border-color: rgba(236, 72, 153, 0.4);
}

/* 특별 배지 */
.special-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
}

.notice-badge {
  background: rgba(168, 85, 247, 0.2);
  color: #C084FC;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.event-badge {
  background: rgba(236, 72, 153, 0.2);
  color: #F472B6;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

/* 게시글 왼쪽 영역 (카테고리, 제목, 작성자) */
.post-left {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.post-category {
  font-size: 12px;
  color: #A855F7;
  font-weight: 500;
  padding: 2px 6px;
  background: rgba(168, 85, 247, 0.15);
  border-radius: 4px;
  white-space: nowrap;
}

.post-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 게시글 하단 정보 */
.post-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.author-name {
  color: rgba(255, 255, 255, 0.6);
}

.info-separator {
  color: rgba(255, 255, 255, 0.3);
}

/* 게시글 오른쪽 영역 (통계) */
.post-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.stat-icon {
  font-size: 13px;
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
    padding: 10px 12px;
  }
  
  .post-number {
    min-width: 32px;
    font-size: 13px;
  }
  
  .post-title {
    font-size: 14px;
  }
  
  .post-right {
    gap: 12px;
  }
  
  .stat-item {
    font-size: 12px;
  }
}
</style>
