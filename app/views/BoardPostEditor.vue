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
          @input="onContentInput"
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
        
        <div class="reading-attach-section">
          <!-- 선택된 점괘 표시 -->
          <div v-if="selectedReading" class="selected-reading">
            <div class="selected-reading-info">
              <span class="selected-badge">{{ getSpreadLabel(selectedReading.spread_type) }}</span>
              <span class="selected-date">{{ formatDate(selectedReading.created_at) }}</span>
              <button class="remove-btn" @click="removeSelectedReading">
                <span>✕</span>
              </button>
            </div>
            <div v-if="selectedReading.question" class="selected-question">
              <span class="question-icon">❓</span>
              <span class="question-text">{{ selectedReading.question }}</span>
            </div>
          </div>

          <!-- 선택 버튼 -->
          <button 
            v-else
            class="select-reading-btn"
            @click="showReadingModal = true"
          >
            <span class="btn-icon">📖</span>
            <span class="btn-text">내 점괘 기록에서 선택</span>
          </button>
          
          <p class="select-help">내 점괘 기록에서 선택하여 함께 공유할 수 있습니다.</p>
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

    <!-- 점괘 선택 모달 -->
    <ReadingSelectModal
      :visible="showReadingModal"
      @close="showReadingModal = false"
      @select="onReadingModalSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '../store/board';
import { useUserStore } from '../store/user';
import { supabase } from '../services/supabase';
import { showAlert, showConfirm } from '../utils/alerts';
// 컴포넌트는 동적으로 import
import { defineAsyncComponent } from 'vue';
const BoardNicknameModal = defineAsyncComponent(() => import('../components/BoardNicknameModal.vue'));
const ReadingSelectModal = defineAsyncComponent(() => import('../components/ReadingSelectModal.vue'));
import type { BoardCategory } from '../types/board';
// import BadWordsFilter from 'bad-words'; // 임시로 비활성화

const route = useRoute();
const router = useRouter();
const boardStore = useBoardStore();
const userStore = useUserStore();

// 욕설 필터 - 임시로 비활성화
// const filter = new BadWordsFilter();

const showNicknameModal = ref(false);
const showReadingModal = ref(false);
const isSubmitting = ref(false);
const selectedReading = ref<any>(null);

const isEditMode = computed(() => !!route.params.id);
const postId = computed(() => route.params.id as string);

const form = reactive({
  category: 'general' as BoardCategory,
  title: '',
  content: '',
  shared_reading_id: null as string | null
});

const categories = [
  { value: 'general' as BoardCategory, label: '💬 일반' },
  { value: 'love' as BoardCategory, label: '💝 연애' },
  { value: 'career' as BoardCategory, label: '💼 직업' },
  { value: 'daily' as BoardCategory, label: '🌅 일상' },
  { value: 'question' as BoardCategory, label: '❓ 질문' }
];

const canSubmit = computed(() => {
  const titleLength = form.title?.trim().length || 0;
  const contentLength = form.content?.trim().length || 0;
  
  console.log('[canSubmit] 제목 길이:', titleLength, '내용 길이:', contentLength);
  console.log('[canSubmit] 제출 가능:', titleLength >= 1 && contentLength >= 1);
  
  return titleLength >= 1 && contentLength >= 1;
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

// 스프레드 타입 라벨
const getSpreadLabel = (spreadType: string) => {
  const labels: Record<string, string> = {
    // 기본 스프레드
    'one_card': '1장 카드',
    'single': '1장 카드',
    'three_card_timeline': '3장 타임라인',
    'three-cards': '3장 카드',
    'celtic_cross': '켈틱 크로스',
    'celtic-cross': '켈틱 크로스',
    'seven_star': '세븐 스타',
    'cup_of_relationship': '관계의 컵',
    'relationship': '관계의 컵',
    'horseshoe': '호스슈',
    'hexagram': '헥사그램',
    'year-ahead': '한 해 전망',
    'daily': '오늘의 카드'
  };
  return labels[spreadType] || spreadType;
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
  //   post.title === form.title || 
  //   post.content === form.content
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
  if (checkBadWords(form.title) || checkBadWords(form.content)) {
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
    // 입력값 확인
    console.log('[게시글 제출] form:', form);
    console.log('[게시글 제출] form.content:', form.content);
    console.log('[게시글 제출] form.content.trim():', form.content.trim());
    
    const postData = {
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      shared_reading_id: form.shared_reading_id || null
    };
    
    console.log('[게시글 제출] postData:', JSON.stringify(postData));
    console.log('[게시글 제출] content 길이:', postData.content.length);
    
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
  if (form.title.trim() || form.content.trim()) {
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

// 선택된 점괘 제거
const removeSelectedReading = () => {
  selectedReading.value = null;
  form.shared_reading_id = null;
};

// 모달에서 점괘 선택
const onReadingModalSelected = async (reading: any) => {
  selectedReading.value = reading;
  await processSelectedReading(reading);
};

// 점괘 선택 처리
const processSelectedReading = async (reading: any) => {
  if (!reading) {
    form.shared_reading_id = null;
    return;
  }
  
  // 이미 공유된 점괘인 경우 그대로 사용
  if (reading.is_from_shared) {
    form.shared_reading_id = reading.id;
    return;
  }
  
  // readings 테이블에서 온 데이터인 경우 shared_readings에 생성해야 함
  if (reading.is_from_readings) {
    try {
      // 먼저 readings 테이블에서 전체 데이터 가져오기
      const { data: fullReading, error: readingError } = await supabase
        .from('readings')
        .select('*')
        .eq('id', reading.id)
        .single();
      
      if (readingError) throw readingError;
      
      // AI 해석 데이터 가져오기
      let aiInterpretation = null;
      let basicInterpretation = fullReading.overall_message || '';
      
      console.log('[점괘 공유] 해석 데이터 조회 시작');
      console.log('[점괘 공유] reading_id:', reading.id);
      console.log('[점괘 공유] user_id:', userStore.currentUser?.id);
      
      // 1. ai_interpretations 테이블에서 AI 해석 조회
      const { data: aiData, error: aiError } = await supabase
        .from('ai_interpretations')
        .select('interpretation_text, created_at')
        .eq('reading_id', reading.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      console.log('[점괘 공유] AI 해석 쿼리 결과:', {
        found: aiData && aiData.length > 0,
        error: aiError
      });
      
      if (!aiError && aiData && aiData.length > 0 && aiData[0].interpretation_text) {
        aiInterpretation = aiData[0].interpretation_text;
        console.log('[점괘 공유] AI 해석 발견 - 길이:', aiInterpretation.length);
      }
      
      // 2. AI 해석이 없고 기본 해석도 충분하지 않은 경우, 상세 정보 생성
      if (!aiInterpretation) {
        console.log('[점괘 공유] AI 해석 없음 - 상세 해석 생성 시작');
        
        const cards = fullReading.cards || [];
        let detailedInterpretation = '';
        
        // 질문 추가
        if (fullReading.question) {
          detailedInterpretation += `📌 **질문**\n${fullReading.question}\n\n`;
        }
        
        // 기본 해석 추가
        if (basicInterpretation) {
          detailedInterpretation += `✨ **전체 해석**\n${basicInterpretation}\n\n`;
        }
        
        // 카드 정보 추가
        if (cards.length > 0) {
          // 카드 상세 정보 가져오기
          const cardIds = cards.map((c: any) => c.cardNumber || c.id || c.card_id).filter(Boolean);
          console.log('[점괘 공유] 카드 ID 목록:', cardIds);
          
          let cardDetails: any[] = [];
          if (cardIds.length > 0) {
            const { data: cardData, error: cardError } = await supabase
              .from('tarot_cards')
              .select('id, name, name_kr, keywords, meanings, element, astrology')
              .in('id', cardIds);
            
            if (!cardError && cardData) {
              cardDetails = cardData;
              console.log('[점괘 공유] 카드 상세 정보 조회 성공:', cardDetails.length);
            }
          }
          
          detailedInterpretation += `🎴 **뽑은 카드 (${cards.length}장)**\n\n`;
          
          cards.forEach((card: any, index: number) => {
            const cardId = card.cardNumber || card.id || card.card_id;
            const cardDetail = cardDetails.find((cd: any) => cd.id === cardId);
            const cardName = card.nameKr || card.name_kr || card.name || 
                            cardDetail?.name_kr || cardDetail?.name || `카드 ${index + 1}`;
            const orientation = card.orientation === 'reversed' ? '역방향' : '정방향';
            const positionName = card.position?.name || card.positionName || '';
            
            // 카드 제목
            detailedInterpretation += `**${index + 1}. ${cardName}**`;
            if (positionName) {
              detailedInterpretation += ` - ${positionName}`;
            }
            detailedInterpretation += ` (${orientation})\n`;
            
            // 키워드 추가
            if (cardDetail?.keywords) {
              const keywordKey = orientation === '정방향' ? 'upright' : 'reversed';
              const keywords = cardDetail.keywords[keywordKey] || [];
              if (keywords.length > 0) {
                detailedInterpretation += `• 키워드: ${keywords.slice(0, 5).join(', ')}\n`;
              }
            }
            
            // 기본 의미 추가 (짧게)
            if (cardDetail?.meanings) {
              const meaningKey = orientation === '정방향' ? 'upright' : 'reversed';
              const meaning = cardDetail.meanings[meaningKey];
              if (meaning) {
                const shortMeaning = meaning.length > 150 ? 
                  meaning.substring(0, 150) + '...' : meaning;
                detailedInterpretation += `• ${shortMeaning}\n`;
              }
            }
            
            // 원소/점성술 정보 (있는 경우)
            if (cardDetail?.element || cardDetail?.astrology) {
              const additionalInfo = [];
              if (cardDetail.element) additionalInfo.push(`원소: ${cardDetail.element}`);
              if (cardDetail.astrology) additionalInfo.push(`점성술: ${cardDetail.astrology}`);
              if (additionalInfo.length > 0) {
                detailedInterpretation += `• ${additionalInfo.join(', ')}\n`;
              }
            }
            
            detailedInterpretation += '\n';
          });
        }
        
        // 생성된 상세 해석 사용
        if (detailedInterpretation.trim()) {
          // AI 해석이 없으면 상세 정보를 AI 해석란에 저장
          aiInterpretation = detailedInterpretation;
          console.log('[점괘 공유] 상세 해석 생성 완료 - 길이:', aiInterpretation.length);
        } else if (basicInterpretation) {
          // 상세 정보도 생성 실패하면 기본 해석이라도 사용
          aiInterpretation = basicInterpretation;
          console.log('[점괘 공유] 기본 해석 사용');
        }
      }
      
      // spread_type 변환 (spread_id를 shared_readings 형식으로)
      const convertSpreadType = (spreadId: string): string => {
        const spreadMap: Record<string, string> = {
          'three-cards': 'three_card_timeline',
          'celtic-cross': 'celtic_cross',
          'seven-star': 'seven_star',
          'cup-of-relationship': 'cup_of_relationship',
          'relationship': 'cup_of_relationship',
          'horseshoe': 'horseshoe',
          'hexagram': 'hexagram',
          'year-ahead': 'year_ahead',
          'daily': 'daily_card',
          'single': 'one_card',
          'one-card': 'one_card'
        };
        return spreadMap[spreadId] || spreadId.replace(/-/g, '_');
      };
      
      // shared_readings에 생성
      const sharedId = Math.random().toString(36).substring(2, 10); // 8자리 랜덤 ID
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료
      
      // 저장할 데이터 준비
      const sharedData = {
        id: sharedId,
        spread_type: convertSpreadType(fullReading.spread_id || 'three-cards'),
        cards: fullReading.cards,
        custom_question: fullReading.question || null,
        basic_interpretation: basicInterpretation || null,
        ai_interpretation: aiInterpretation || null,
        shared_by: userStore.currentUser?.id,
        is_active: true,
        expires_at: expiresAt.toISOString()
      };
      
      console.log('[점괘 공유] 저장할 데이터:', {
        id: sharedData.id,
        spread_type: sharedData.spread_type,
        cards_count: sharedData.cards?.length || 0,
        has_question: !!sharedData.custom_question,
        has_basic: !!sharedData.basic_interpretation,
        has_ai: !!sharedData.ai_interpretation,
        basic_length: sharedData.basic_interpretation?.length || 0,
        ai_length: sharedData.ai_interpretation?.length || 0
      });
      
      const { data: sharedReading, error: sharedError } = await supabase
        .from('shared_readings')
        .insert(sharedData)
        .select()
        .single();
      
      if (sharedError) {
        console.error('[점괘 공유] 저장 실패:', sharedError);
        throw sharedError;
      }
      
      form.shared_reading_id = sharedId;
      console.log('[점괘 공유] 공유 점괘 생성 성공:', {
        id: sharedId,
        basic_saved: !!sharedReading.basic_interpretation,
        ai_saved: !!sharedReading.ai_interpretation
      });
      
      // 공유 점괘 생성 완료 알림
      await showAlert({
        title: '✅ 점괘 첨부 완료',
        message: '공유된 점괘는 1달 후 게시판에서 자동 삭제됩니다.',
        confirmText: '확인'
      });
    } catch (error) {
      console.error('점괘 공유 생성 실패:', error);
      await showAlert({
        title: '⚠️ 오류',
        message: '점괘 공유에 실패했습니다. 다시 시도해주세요.',
        confirmText: '확인'
      });
      selectedReading.value = null;
      form.shared_reading_id = null;
    }
  }
};

// 내용 입력 시 디버깅
const onContentInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  console.log('[내용 입력] 현재 값:', target.value);
  console.log('[내용 입력] form.content:', form.content);
};



// 수정 모드일 때 기존 데이터 불러오기
const loadExistingPost = async () => {
  if (!isEditMode.value) return;
  
  try {
    const post = await boardStore.loadPost(postId.value);
    
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
    Object.assign(form, {
      category: post.category,
      title: post.title,
      content: post.content,
      shared_reading_id: post.shared_reading_id || null
    });
    
    // 공유 점괘가 있는 경우 로드
    if (post.shared_reading_id) {
      // shared_readings에서 점괘 정보 가져오기
      const { data: sharedReading } = await supabase
        .from('shared_readings')
        .select('*')
        .eq('id', post.shared_reading_id)
        .single();
      
      if (sharedReading) {
        selectedReading.value = {
          id: sharedReading.id,
          spread_type: sharedReading.spread_type,
          created_at: sharedReading.created_at,
          question: sharedReading.custom_question,
          cards: sharedReading.cards,
          is_from_shared: true
        };
      }
    }
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

/* 점괘 첨부 섹션 */
.reading-attach-section {
  margin-top: 8px;
}

/* 선택된 점괘 표시 */
.selected-reading {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.selected-reading-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.selected-badge {
  padding: 4px 10px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 8px;
  color: #A855F7;
  font-size: 12px;
  font-weight: 600;
}

.selected-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  flex: 1;
}

.remove-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  color: white;
}

.selected-question {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.question-icon {
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

.question-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.4;
}

/* 점괘 선택 버튼 */
.select-reading-btn {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.select-reading-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.4);
  color: white;
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-weight: 500;
}

.select-help {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
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
