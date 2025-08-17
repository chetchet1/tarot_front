<template>
  <div class="post-detail">
    <!-- 헤더 -->
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h1 class="header-title">게시글</h1>
      <div class="header-actions">
        <button v-if="isAuthor" class="edit-btn" @click="editPost">
          <span>✏️</span>
        </button>
        <button v-if="isAuthor" class="delete-btn" @click="deletePost">
          <span>🗑️</span>
        </button>
      </div>
    </header>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>게시글을 불러오는 중...</p>
    </div>

    <!-- 게시글 내용 -->
    <article v-else-if="post" class="post-content">
      <!-- 게시글 정보 -->
      <div class="post-info">
        <div class="post-category">{{ getCategoryLabel(post.category) }}</div>
        <h2 class="post-title">{{ post.title }}</h2>
        <div class="post-meta">
          <div class="author-info">
            <span class="author-icon">👤</span>
            <span class="author-name">{{ post.nickname || '익명' }}</span>
          </div>
          <div class="post-time">{{ formatDate(post.created_at) }}</div>
        </div>
        <div class="post-stats">
          <span class="stat-item">
            <span class="stat-icon">👁️</span>
            조회 {{ post.view_count || 0 }}
          </span>
          <span class="stat-item">
            <span class="stat-icon">💬</span>
            댓글 {{ post.comment_count || 0 }}
          </span>
          <span class="stat-item">
            <span class="stat-icon">❤️</span>
            좋아요 {{ post.like_count || 0 }}
          </span>
        </div>
      </div>

      <!-- 게시글 본문 -->
      <div class="post-body">
        <div class="post-text" v-html="sanitizedContent"></div>
        
        <!-- 점괘 공유 (있는 경우) -->
        <div v-if="sharedReading" class="shared-reading">
          <h3 class="reading-title">🔮 첨부된 타로 점괘</h3>
          <div class="reading-preview">
            <div class="reading-info">
              <span class="reading-spread">{{ getSpreadLabel(sharedReading.spread_type) }}</span>
              <span class="reading-date">{{ formatDate(sharedReading.created_at) }}</span>
            </div>
            <div v-if="sharedReading.custom_question" class="reading-question">
              <strong>질문:</strong> {{ sharedReading.custom_question }}
            </div>
            <div class="reading-cards-images">
              <div v-for="(card, index) in getCardImages(sharedReading)" :key="index" class="card-image-preview">
                <img :src="card.image" 
                     :alt="card.name" 
                     :class="{ 'is-reversed': card.orientation === 'reversed' }"
                     @error="onCardImageError" />
                <span class="card-name-mini">{{ card.name }}</span>
              </div>
            </div>
            <button class="reading-detail-btn" @click="openReadingModal">
              점괘 자세히 보기 →
            </button>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="post-actions">
        <button 
          class="action-btn"
          :class="{ liked: hasLiked }"
          @click="toggleLike"
        >
          <span class="action-icon">{{ hasLiked ? '❤️' : '🤍' }}</span>
          <span class="action-text">좋아요 {{ post.like_count || 0 }}</span>
        </button>
        <button class="action-btn" @click="reportPost">
          <span class="action-icon">⚠️</span>
          <span class="action-text">신고</span>
        </button>
      </div>
    </article>

    <!-- 댓글 섹션 -->
    <section v-if="post" class="comments-section">
      <h3 class="comments-title">💬 댓글 {{ comments.length }}</h3>
      
      <!-- 댓글 작성 -->
      <div class="comment-write">
        <textarea
          v-model="newComment"
          class="comment-input"
          placeholder="댓글을 입력하세요 (최대 200자)"
          maxlength="200"
          rows="3"
        ></textarea>
        <div class="comment-actions">
          <span class="char-count">{{ newComment.length }}/200</span>
          <button 
            class="submit-btn"
            @click="submitComment"
            :disabled="!newComment.trim() || isSubmitting"
          >
            {{ isSubmitting ? '등록 중...' : '등록' }}
          </button>
        </div>
      </div>

      <!-- 댓글 목록 -->
      <div class="comments-list">
        <BoardComment
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :postAuthorId="post.user_id"
          :currentUserId="currentUserId"
          @reply="onReply"
          @delete="onDeleteComment"
          @like="onLikeComment"
          @report="onReportComment"
        />
      </div>

      <div v-if="comments.length === 0" class="no-comments">
        <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
      </div>
    </section>

    <!-- 광고 배너 (무료 사용자용) -->
    <div v-if="showAd" class="ad-banner">
      <!-- AdMob 배너 광고 영역 -->
      <div id="board-detail-ad" class="ad-container"></div>
    </div>
    
    <!-- 점괘 상세보기 모달 -->
    <SharedReadingModal
      :isOpen="showReadingModal"
      :readingId="sharedReading?.id || null"
      @close="closeReadingModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '../store/board';
import { useUserStore } from '../store/user';
import { supabase } from '../services/supabase';
import { showAlert, showConfirm } from '../utils/alerts';
import { getCardImageFromObject } from '../utils/cardImageUtils';
// BoardComment 컴포넌트는 동적으로 import
import { defineAsyncComponent } from 'vue';
const BoardComment = defineAsyncComponent(() => import('../components/BoardComment.vue'));
const SharedReadingModal = defineAsyncComponent(() => import('../components/SharedReadingModal.vue'));
// import DOMPurify from 'dompurify'; // 임시로 비활성화
import type { BoardPost, BoardComment as BoardCommentType } from '../types/board';

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const userStore = useUserStore();

const post = ref<BoardPost | null>(null);
const comments = ref<BoardCommentType[]>([]);
const newComment = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);
const hasLiked = ref(false);
const sharedReading = ref<any>(null);
const showReadingModal = ref(false);

const postId = computed(() => route.params.id as string);
const currentUserId = computed(() => userStore.currentUser?.id || '');
const isAuthor = computed(() => post.value?.user_id === currentUserId.value);
const showAd = computed(() => !userStore.isPremium);

// HTML 컨텐츠 정화 - 간단한 방법으로 대체
const sanitizedContent = computed(() => {
  if (!post.value) return '';
  // DOMPurify 대신 기본 HTML 이스케이핑 사용
  const escaped = post.value.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
  return escaped;
});

// 카테고리 라벨
const getCategoryLabel = (category: string) => {
  const categories: Record<string, string> = {
    general: '💬 일반',
    love: '💝 연애',
    career: '💼 직업',
    daily: '🌅 일상',
    question: '❓ 질문'
  };
  return categories[category] || '일반';
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

// 스프레드 타입 라벨
const getSpreadLabel = (spreadType: string) => {
  const labels: Record<string, string> = {
    'single': '1장 카드',
    'three-cards': '3장 카드',
    'celtic-cross': '켈틱 크로스',
    'horseshoe': '호스슈',
    'hexagram': '헥사그램',
    'relationship': '관계의 컵',
    'year-ahead': '한 해 전망',
    'daily': '오늘의 카드'
  };
  return labels[spreadType] || spreadType;
};

// 카드 이미지 미리보기 (최대 4장)
const getCardImages = (reading: any) => {
  if (!reading || !reading.cards) return [];
  
  // cards가 이미 객체 배열인 경우와 JSON 문자열인 경우 처리
  let cards = reading.cards;
  if (typeof cards === 'string') {
    try {
      cards = JSON.parse(cards);
    } catch (e) {
      console.error('카드 데이터 파싱 실패:', e);
      return [];
    }
  }
  
  const preview = [];
  const maxCards = 4; // 최대 4장까지 표시
  
  for (let i = 0; i < Math.min(cards.length, maxCards); i++) {
    const card = cards[i];
    if (typeof card === 'object') {
      preview.push({
        image: getCardImageFromObject(card),
        name: card.nameKr || card.name || `카드 ${i + 1}`,
        orientation: card.orientation || 'upright'
      });
    }
  }
  
  return preview;
};

// 카드 이미지 에러 처리
const onCardImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/tarot-cards/major/00-the-Fool.png';
};

// 게시글 불러오기
const loadPost = async () => {
  isLoading.value = true;
  try {
    const data = await boardStore.loadPost(postId.value);
    post.value = data;
    
    // 조회수 증가는 loadPost 내부에서 처리됨
    
    // 좋아요 상태 확인
    hasLiked.value = boardStore.userLikedPosts.has(postId.value);
    
    // 첨부된 점괘 불러오기
    if (data.shared_reading_id) {
      await loadSharedReading(data.shared_reading_id);
    }
    
    // 댓글 불러오기
    await loadComments();
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: '게시글을 불러오는데 실패했습니다.',
      confirmText: '확인'
    });
    router.back();
  } finally {
    isLoading.value = false;
  }
};

// 점괘 상세보기 모달 열기
const openReadingModal = () => {
  if (!sharedReading.value) {
    console.error('[BoardPostDetail] sharedReading 데이터 없음');
    return;
  }
  console.log('[BoardPostDetail] Opening modal with reading:', {
    id: sharedReading.value.id,
    spread_type: sharedReading.value.spread_type,
    has_cards: !!sharedReading.value.cards
  });
  showReadingModal.value = true;
};

// 점괘 상세보기 모달 닫기
const closeReadingModal = () => {
  showReadingModal.value = false;
};

// 공유된 점괘 불러오기
const loadSharedReading = async (readingId: string) => {
  try {
    console.log('[BoardPostDetail] 공유 점괘 로드 시작:', readingId);
    
    // shared_readings 테이블에서 데이터 가져오기
    const { data, error } = await supabase
      .from('shared_readings')
      .select('*')
      .eq('id', readingId)
      .single();
    
    if (error) {
      console.error('[BoardPostDetail] Supabase 에러:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('[BoardPostDetail] 공유 점괘 데이터 없음');
      sharedReading.value = null;
      return;
    }
    
    sharedReading.value = data;
    console.log('[BoardPostDetail] 공유 점괘 로드 성공:', {
      id: data.id,
      ai_interpretation: data.ai_interpretation,
      spread_type: data.spread_type,
      created_at: data.created_at,
      hasCards: !!data.cards
    });
  } catch (error) {
    console.error('[BoardPostDetail] 공유 점괘 로드 실패:', error);
    sharedReading.value = null;
  }
};

// 댓글 불러오기
const loadComments = async () => {
  try {
    await boardStore.loadComments(postId.value);
    comments.value = boardStore.currentComments;
  } catch (error) {
    console.error('댓글 로드 실패:', error);
  }
};

// 댓글 작성
const submitComment = async () => {
  if (!newComment.value.trim() || isSubmitting.value) return;
  
  // 닉네임 확인
  if (!boardStore.currentNickname) {
    await showAlert({
      title: '⚠️ 닉네임 설정 필요',
      message: '댓글을 작성하려면 먼저 닉네임을 설정해주세요.',
      confirmText: '확인'
    });
    router.push('/board');
    return;
  }
  
  isSubmitting.value = true;
  try {
    await boardStore.createComment(
      postId.value,
      newComment.value.trim()
      // parent_id는 없으므로 전달하지 않음
    );
    
    newComment.value = '';
    await loadComments();
    
    // 댓글 수 업데이트
    if (post.value) {
      post.value.comment_count = (post.value.comment_count || 0) + 1;
    }
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: '댓글 작성에 실패했습니다.',
      confirmText: '확인'
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 대댓글 작성
const onReply = async (parentComment: BoardCommentType, content: string) => {
  try {
    await boardStore.createComment(
      postId.value,
      content,
      parentComment.id  // parent_id로 전달
    );
    
    await loadComments();
    
    // 댓글 수 업데이트
    if (post.value) {
      post.value.comment_count = (post.value.comment_count || 0) + 1;
    }
  } catch (error) {
    console.error('대댓글 작성 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: '대댓글 작성에 실패했습니다.',
      confirmText: '확인'
    });
  }
};

// 댓글 삭제
const onDeleteComment = async (commentId: string) => {
  const confirmed = await showConfirm({
    title: '댓글 삭제',
    message: '정말 이 댓글을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소'
  });
  
  if (!confirmed) return;
  
  try {
    await boardStore.deleteComment(commentId, postId.value);
    await loadComments();
    
    // 댓글 수 업데이트
    if (post.value) {
      post.value.comment_count = Math.max((post.value.comment_count || 0) - 1, 0);
    }
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: '댓글 삭제에 실패했습니다.',
      confirmText: '확인'
    });
  }
};

// 댓글 좋아요
const onLikeComment = async (commentId: string) => {
  try {
    await boardStore.toggleLike(commentId, 'comment');
    await loadComments();
  } catch (error) {
    console.error('댓글 좋아요 실패:', error);
  }
};

// 댓글 신고
const onReportComment = async (commentId: string) => {
  await showAlert({
    title: '🚨 신고',
    message: '신고가 접수되었습니다. 검토 후 조치하겠습니다.',
    confirmText: '확인'
  });
};

// 게시글 좋아요
const toggleLike = async () => {
  try {
    const liked = await boardStore.toggleLike(postId.value, 'post');
    hasLiked.value = liked;
    
    if (post.value) {
      post.value.like_count = (post.value.like_count || 0) + (hasLiked.value ? 1 : -1);
    }
  } catch (error) {
    console.error('좋아요 실패:', error);
  }
};

// 게시글 수정
const editPost = () => {
  router.push(`/board/edit/${postId.value}`);
};

// 게시글 삭제
const deletePost = async () => {
  const confirmed = await showConfirm({
    title: '게시글 삭제',
    message: '정말 이 게시글을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소'
  });
  
  if (!confirmed) return;
  
  try {
    await boardStore.deletePost(postId.value);
    await showAlert({
      title: '✅ 삭제 완료',
      message: '게시글이 삭제되었습니다.',
      confirmText: '확인'
    });
    router.push('/board');
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: '게시글 삭제에 실패했습니다.',
      confirmText: '확인'
    });
  }
};

// 게시글 신고
const reportPost = async () => {
  await showAlert({
    title: '🚨 신고',
    message: '신고가 접수되었습니다. 검토 후 조치하겠습니다.',
    confirmText: '확인'
  });
};

// 뒤로가기
const goBack = () => {
  router.push('/board');
};

onMounted(async () => {
  // 프로필 초기화
  await boardStore.checkProfile();
  // 게시글 로드
  await loadPost();
});
</script>

<style scoped>
.post-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  padding-bottom: 80px;
}

/* 헤더 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.edit-btn:hover, .delete-btn:hover {
  background: rgba(255, 255, 255, 0.1);
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

/* 게시글 내용 */
.post-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.post-info {
  margin-bottom: 24px;
}

.post-category {
  display: inline-block;
  font-size: 14px;
  color: #A855F7;
  font-weight: 500;
  margin-bottom: 12px;
}

.post-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-icon {
  font-size: 16px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
}

.post-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.post-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 게시글 본문 */
.post-body {
  /* 박스 스타일 제거 - 배경에 직접 표시 */
  padding: 20px 0;
  margin-bottom: 24px;
}

.post-text {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
}

.shared-reading {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reading-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #A855F7;
}

.reading-preview {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 20px;
}

.reading-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.reading-spread {
  font-weight: 600;
  color: white;
}

.reading-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.reading-question {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.5;
}

.reading-cards-images {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding: 8px 0;
}

.card-image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 60px;
}

.card-image-preview img {
  width: 60px;
  height: 85px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.card-image-preview img.is-reversed {
  transform: rotate(180deg);
}

.card-image-preview:hover img {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

.card-image-preview img.is-reversed:hover {
  transform: rotate(180deg) translateY(-2px) scale(1.05);
}

.card-name-mini {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reading-detail-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reading-detail-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

/* 액션 버튼 */
.post-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.liked {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.action-icon {
  font-size: 16px;
}

/* 댓글 섹션 */
.comments-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.comments-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 댓글 작성 */
.comment-write {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.comment-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  font-family: inherit;
}

.comment-input:focus {
  outline: none;
  border-color: #A855F7;
  background: rgba(255, 255, 255, 0.08);
}

.comment-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.submit-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 댓글 목록 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

/* 광고 배너 */
.ad-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  padding: 8px;
  z-index: 100;
}

.ad-container {
  width: 320px;
  height: 50px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

@media (max-width: 768px) {
  .post-content,
  .comments-section {
    padding: 16px;
  }
  
  .post-title {
    font-size: 20px;
  }
  
  .post-body {
    padding: 16px 0;
  }
}
</style>
