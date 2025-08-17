<template>
  <div class="comment-item" :class="{ 'is-reply': comment.depth === 2 }">
    <!-- 댓글 본체 -->
    <div class="comment-main">
      <div class="comment-header">
        <div class="comment-author">
          <span class="author-icon">👤</span>
          <span class="author-name">{{ comment.nickname || '익명' }}</span>
          <span v-if="isPostAuthor" class="author-badge">글쓴이</span>
        </div>
        <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
      </div>
      
      <div class="comment-content">{{ comment.content }}</div>
      
      <div class="comment-footer">
        <button 
          class="comment-action"
          :class="{ liked: hasLiked }"
          @click="toggleLike"
        >
          <span>{{ hasLiked ? '❤️' : '🤍' }}</span>
          <span>{{ comment.like_count || 0 }}</span>
        </button>
        
        <button 
          v-if="comment.depth === 1"
          class="comment-action"
          @click="toggleReply"
        >
          <span>💬</span>
          <span>답글</span>
        </button>
        
        <button 
          v-if="isMyComment"
          class="comment-action"
          @click="deleteComment"
        >
          <span>🗑️</span>
          <span>삭제</span>
        </button>
        
        <button 
          class="comment-action"
          @click="reportComment"
        >
          <span>⚠️</span>
          <span>신고</span>
        </button>
      </div>
      
      <!-- 답글 작성 폼 (1뎁스 댓글에만) -->
      <div v-if="showReplyForm && comment.depth === 1" class="reply-form">
        <textarea
          v-model="replyContent"
          class="reply-input"
          placeholder="답글을 입력하세요 (최대 200자)"
          maxlength="200"
          rows="3"
        ></textarea>
        <div class="reply-actions">
          <span class="char-count">{{ replyContent.length }}/200</span>
          <div class="reply-buttons">
            <button class="cancel-btn" @click="cancelReply">취소</button>
            <button 
              class="submit-btn"
              @click="submitReply"
              :disabled="!replyContent.trim() || isSubmitting"
            >
              {{ isSubmitting ? '등록 중...' : '등록' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 대댓글 목록 (1뎁스 댓글에만) -->
    <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
      <BoardComment
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :postAuthorId="postAuthorId"
        :currentUserId="currentUserId"
        @delete="$emit('delete', reply.id)"
        @like="$emit('like', reply.id)"
        @report="$emit('report', reply.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBoardStore } from '../store/board';
import type { BoardComment as BoardCommentType } from '../types/board';

const props = defineProps<{
  comment: BoardCommentType;
  postAuthorId: string;
  currentUserId: string;
}>();

const emit = defineEmits<{
  reply: [comment: BoardCommentType, content: string];
  delete: [commentId: string];
  like: [commentId: string];
  report: [commentId: string];
}>();

const boardStore = useBoardStore();

const showReplyForm = ref(false);
const replyContent = ref('');
const isSubmitting = ref(false);
const hasLiked = ref(false);

const isPostAuthor = computed(() => props.comment.user_id === props.postAuthorId);
const isMyComment = computed(() => props.comment.user_id === props.currentUserId);

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

// 답글 토글
const toggleReply = () => {
  showReplyForm.value = !showReplyForm.value;
  if (!showReplyForm.value) {
    replyContent.value = '';
  }
};

// 답글 취소
const cancelReply = () => {
  showReplyForm.value = false;
  replyContent.value = '';
};

// 답글 제출
const submitReply = async () => {
  if (!replyContent.value.trim() || isSubmitting.value) return;
  
  // 닉네임 확인
  if (!boardStore.profile?.nickname) {
    alert('답글을 작성하려면 먼저 닉네임을 설정해주세요.');
    return;
  }
  
  isSubmitting.value = true;
  try {
    emit('reply', props.comment, replyContent.value.trim());
    replyContent.value = '';
    showReplyForm.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

// 좋아요 토글
const toggleLike = () => {
  emit('like', props.comment.id);
  hasLiked.value = !hasLiked.value;
};

// 댓글 삭제
const deleteComment = () => {
  emit('delete', props.comment.id);
};

// 댓글 신고
const reportComment = () => {
  emit('report', props.comment.id);
};
</script>

<style scoped>
.comment-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.comment-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* 대댓글 스타일 */
.comment-item.is-reply {
  margin-left: 32px;
  background: rgba(168, 85, 247, 0.05);
  border-color: rgba(168, 85, 247, 0.15);
}

.comment-main {
  width: 100%;
}

/* 댓글 헤더 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-icon {
  font-size: 14px;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.author-badge {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.comment-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 댓글 내용 */
.comment-content {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
  margin-bottom: 12px;
}

/* 댓글 푸터 */
.comment-footer {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-action:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.comment-action.liked {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #EF4444;
}

/* 답글 작성 폼 */
.reply-form {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.reply-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 10px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  font-family: inherit;
}

.reply-input:focus {
  outline: none;
  border-color: #A855F7;
  background: rgba(255, 255, 255, 0.08);
}

.reply-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.char-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.reply-buttons {
  display: flex;
  gap: 8px;
}

.cancel-btn {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(168, 85, 247, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 대댓글 목록 */
.replies-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .comment-item {
    padding: 12px;
  }
  
  .comment-item.is-reply {
    margin-left: 20px;
  }
  
  .comment-content {
    font-size: 14px;
  }
  
  .comment-footer {
    gap: 8px;
  }
  
  .comment-action {
    font-size: 12px;
    padding: 4px 6px;
  }
}
</style>
</template>
