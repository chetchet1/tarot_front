<template>
  <div class="post-editor">
    <!-- 헤더 -->
    <header class="editor-header">
      <button class="back-btn" @click="cancelEdit">
        <span class="back-icon">←</span>
      </button>
      <h1 class="header-title">{{ isEditMode ? '게시글 수정' : '새 글 작성' }}</h1>
      <button 
        class="submit-header-btn"
        @click="submitPost"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? '저장 중...' : '완료' }}
      </button>
    </header>

    <!-- 에디터 본문 -->
    <div class="editor-content">
      <!-- 카테고리 선택 -->
      <div class="form-group">
        <label class="form-label">카테고리</label>
        <div class="category-select">
          <button
            v-for="category in categories"
            :key="category.value"
            class="category-option"
            :class="{ active: form.category === category.value }"
            @click="form.category = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <!-- 제목 입력 -->
      <div class="form-group">
        <label class="form-label">제목</label>
        <input
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="제목을 입력하세요 (최대 50자)"
          maxlength="50"
        />
        <div class="input-info">
          <span class="char-count">{{ form.title.length }}/50</span>
        </div>
      </div>

      <!-- 내용 입력 -->
      <div class="form-group">
        <label class="form-label">내용</label>
        <textarea
          v-model="form.content"
          class="form-textarea"
          placeholder="내용을 입력하세요 (최대 1000자)"
          maxlength="1000"
          rows="12"
        ></textarea>
        <div class="input-info">
          <span class="char-count">{{ form.content.length }}/1000</span>
        </div>
      </div>

      <!-- 점괘 공유 옵션 -->
      <div class="form-group">
        <label class="form-label">
          <span>🔮 타로 점괘 첨부</span>
          <span class="label-sub">(선택사항)</span>
        </label>
        
        <div v-if="sharedReadings.length > 0" class="reading-select">
          <select 
            v-model="form.shared_reading_id"
            class="form-select"
          >
            <option value="">선택 안함</option>
            <option 
              v-for="reading in sharedReadings" 
              :key="reading.id"
              :value="reading.id"
            >
              {{ reading.spread_type }} - {{ formatDate(reading.created_at) }}
            </option>
          </select>
        </div>
        
        <div v-else class="no-readings">
          <p>공유 가능한 점괘가 없습니다.</p>
          <p class="sub-text">타로 점을 본 후 공유 설정을 하면 여기에 표시됩니다.</p>
        </div>
      </div>

      <!-- 작성자 정보 -->
      <div class="form-group">
        <label class="form-label">작성자</label>
        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-name">{{ boardStore.profile?.nickname || '익명' }}</span>
          <button class="change-nickname-btn" @click="showNicknameModal = true">
            닉네임 변경
          </button>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="editor-footer">
      <button class="cancel-btn" @click="cancelEdit">취소</button>
      <button 
        class="submit-btn"
        @click="submitPost"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? '저장 중...' : (isEditMode ? '수정하기' : '등록하기') }}
      </button>
    </div>

    <!-- 닉네임 설정 모달 -->
    <BoardNicknameModal
      :visible="showNicknameModal"
      @close="showNicknameModal = false"
      @saved="onNicknameSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '../store/board';
// import { useReadingStore } from '../store/reading'; // reading store가 없음
import { showAlert, showConfirm } from '../utils/alerts';
// BoardNicknameModal 컴포넌트는 동적으로 import
import { defineAsyncComponent } from 'vue';
const BoardNicknameModal = defineAsyncComponent(() => import('../components/BoardNicknameModal.vue'));
import type { BoardCategory } from '../types/board';
// import BadWordsFilter from 'bad-words'; // 임시로 비활성화

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
// const readingStore = useReadingStore();

// 욕설 필터 - 임시로 비활성화
// const filter = new BadWordsFilter();

const showNicknameModal = ref(false);
const isSubmitting = ref(false);
const sharedReadings = ref<any[]>([]);

const isEditMode = computed(() => !!route.params.id);
const postId = computed(() => route.params.id as string);

const form = ref({
  category: 'general' as BoardCategory,
  title: '',
  content: '',
  shared_reading_id: ''
});

const categories = [
  { value: 'general' as BoardCategory, label: '💬 일반' },
  { value: 'love' as BoardCategory, label: '💝 연애' },
  { value: 'career' as BoardCategory, label: '💼 직업' },
  { value: 'daily' as BoardCategory, label: '🌅 일상' },
  { value: 'question' as BoardCategory, label: '❓ 질문' }
];

const canSubmit = computed(() => {
  return form.value.title.trim().length >= 2 &&
         form.value.content.trim().length >= 10;
});

// 날짜 포맷
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 욕설 검사 - 간단한 필터로 대체
const checkBadWords = (text: string): boolean => {
  // 간단한 욕설 필터 (나중에 더 정교한 필터로 교체 가능)
  const badWords = ['시발', '씨발', '개새끼', '병신', '지랄', '좆', '닥쳐'];
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word));
};

// 도배 검사 (5분 내 동일 내용)
const checkSpam = async (): Promise<boolean> => {
  // 임시로 비활성화 - 나중에 boardService에 메소드 추가 필요
  // const recentPosts = await boardStore.fetchUserRecentPosts(5); // 5분 이내
  // return recentPosts.some(post => 
  //   post.title === form.value.title || 
  //   post.content === form.value.content
  // );
  return false; // 임시로 항상 false 반환
};

// 게시글 제출
const submitPost = async () => {
  if (!canSubmit.value || isSubmitting.value) return;
  
  // 닉네임 확인
  if (!boardStore.profile?.nickname) {
    showNicknameModal.value = true;
    return;
  }
  
  // 욕설 검사
  if (checkBadWords(form.value.title) || checkBadWords(form.value.content)) {
    await showAlert({
      title: '⚠️ 부적절한 내용',
      message: '욕설이나 비속어가 포함되어 있습니다. 수정해주세요.',
      confirmText: '확인'
    });
    return;
  }
  
  // 도배 검사 (신규 작성시만)
  if (!isEditMode.value) {
    const isSpam = await checkSpam();
    if (isSpam) {
      await showAlert({
        title: '⚠️ 도배 방지',
        message: '5분 이내에 동일한 내용의 글을 작성할 수 없습니다.',
        confirmText: '확인'
      });
      return;
    }
  }
  
  isSubmitting.value = true;
  
  try {
    const postData = {
      category: form.value.category,
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      shared_reading_id: form.value.shared_reading_id || null
    };
    
    if (isEditMode.value) {
      // 수정
      await boardStore.updatePost(postId.value, postData);
      await showAlert({
        title: '✅ 수정 완료',
        message: '게시글이 수정되었습니다.',
        confirmText: '확인'
      });
      router.push(`/board/post/${postId.value}`);
    } else {
      // 신규 작성
      const newPost = await boardStore.createPost(postData);
      await showAlert({
        title: '✅ 작성 완료',
        message: '게시글이 등록되었습니다.',
        confirmText: '확인'
      });
      router.push(`/board/post/${newPost.id}`);
    }
  } catch (error) {
    console.error('게시글 저장 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: isEditMode.value ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.',
      confirmText: '확인'
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 작성 취소
const cancelEdit = async () => {
  if (form.value.title.trim() || form.value.content.trim()) {
    const confirmed = await showConfirm({
      title: '작성 취소',
      message: '작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?',
      confirmText: '취소하기',
      cancelText: '계속 작성'
    });
    
    if (!confirmed) return;
  }
  
  if (isEditMode.value) {
    router.push(`/board/post/${postId.value}`);
  } else {
    router.push('/board');
  }
};

// 닉네임 저장 완료
const onNicknameSaved = () => {
  showNicknameModal.value = false;
};

// 공유 가능한 점괘 불러오기
const loadSharedReadings = async () => {
  // 임시로 비활성화 - reading store 구현 필요
  // try {
  //   const readings = await readingStore.fetchSharedReadings();
  //   sharedReadings.value = readings;
  // } catch (error) {
  //   console.error('점괘 목록 로드 실패:', error);
  // }
  sharedReadings.value = []; // 임시로 빈 배열
};

// 수정 모드일 때 기존 데이터 불러오기
const loadExistingPost = async () => {
  if (!isEditMode.value) return;
  
  try {
    const post = await boardStore.fetchPost(postId.value);
    
    // 작성자 확인
    const currentUser = boardStore.profile?.user_id;
    if (post.user_id !== currentUser) {
      await showAlert({
        title: '⚠️ 권한 없음',
        message: '다른 사용자의 게시글은 수정할 수 없습니다.',
        confirmText: '확인'
      });
      router.push(`/board/post/${postId.value}`);
      return;
    }
    
    // 폼 데이터 설정
    form.value = {
      category: post.category,
      title: post.title,
      content: post.content,
      shared_reading_id: post.shared_reading_id || ''
    };
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    await showAlert({
      title: '⚠️ 오류',
      message: '게시글을 불러오는데 실패했습니다.',
      confirmText: '확인'
    });
    router.push('/board');
  }
};

onMounted(async () => {
  // 프로필 확인
  await boardStore.checkProfile();
  
  // 닉네임이 없으면 설정 모달 표시
  if (!boardStore.profile?.nickname) {
    showNicknameModal.value = true;
  }
  
  // 공유 가능한 점괘 불러오기
  await loadSharedReadings();
  
  // 수정 모드면 기존 데이터 불러오기
  await loadExistingPost();
});
</script>

<style scoped>
.post-editor {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.editor-header {
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

.submit-header-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-header-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.submit-header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 에디터 컨텐츠 */
.editor-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

/* 폼 그룹 */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: white;
}

.label-sub {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
}

/* 카테고리 선택 */
.category-select {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-option {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-option.active {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  border-color: transparent;
  color: white;
}

/* 입력 필드 */
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #A855F7;
  background: rgba(255, 255, 255, 0.08);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
  line-height: 1.6;
}

.form-select {
  cursor: pointer;
}

.form-select option {
  background: #1E1B4B;
  color: white;
}

/* 입력 정보 */
.input-info {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.char-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* 점괘 선택 */
.reading-select {
  margin-top: 8px;
}

.no-readings {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
}

.no-readings p {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.sub-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 작성자 정보 */
.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.author-icon {
  font-size: 20px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
}

.change-nickname-btn {
  padding: 6px 12px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 6px;
  color: #A855F7;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.change-nickname-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.6);
}

/* 하단 버튼 */
.editor-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submit-btn {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .editor-header {
    padding: 12px 16px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .editor-content {
    padding: 16px;
  }
  
  .form-textarea {
    min-height: 150px;
  }
  
  .editor-footer {
    padding: 16px;
  }
  
  .cancel-btn,
  .submit-btn {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
