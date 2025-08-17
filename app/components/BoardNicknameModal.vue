<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">✨ 닉네임 설정</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-body">
        <p class="modal-description">
          비밀의 정원에서 사용할 닉네임을 설정해주세요.<br>
          다른 사용자에게 표시되는 이름입니다.
        </p>
        
        <div class="input-group">
          <input
            v-model="nickname"
            type="text"
            class="nickname-input"
            placeholder="닉네임을 입력하세요 (2-10자)"
            maxlength="10"
            @input="validateNickname"
            @keyup.enter="saveNickname"
          />
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-else-if="nickname.length > 0" class="char-count">
            {{ nickname.length }}/10
          </div>
        </div>
        
        <div class="info-section">
          <p class="info-text">
            📌 닉네임 규칙:
          </p>
          <ul class="rules-list">
            <li>2자 이상 10자 이하</li>
            <li>한글, 영문, 숫자, 언더스코어(_) 사용 가능</li>
            <li>공백 및 특수문자 사용 불가</li>
            <li>다른 사용자와 중복 불가</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn-secondary" 
          @click="closeModal"
        >
          취소
        </button>
        <button 
          class="btn-primary" 
          @click="saveNickname"
          :disabled="!isValid || isLoading"
        >
          {{ isLoading ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBoardStore } from '../store/board';
import { showAlert } from '../utils/alerts';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  saved: [nickname: string];
}>();

const boardStore = useBoardStore();

const nickname = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const isVisible = computed(() => props.visible);

const isValid = computed(() => {
  return nickname.value.length >= 2 && 
         nickname.value.length <= 10 && 
         !errorMessage.value;
});

// 닉네임 유효성 검사
const validateNickname = () => {
  const value = nickname.value;
  
  console.log('[닉네임 검증] 입력값:', value, '길이:', value.length);
  
  if (value.length === 0) {
    errorMessage.value = '';
    return;
  }
  
  if (value.length < 2) {
    errorMessage.value = '닉네임은 2자 이상이어야 합니다';
    console.log('[닉네임 검증] 길이 부족');
    return;
  }
  
  // 특수문자 검사 (한글, 영문, 숫자, 언더스코어만 허용)
  const nicknameRegex = /^[가-힣a-zA-Z0-9_]+$/;
  if (!nicknameRegex.test(value)) {
    errorMessage.value = '한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다';
    console.log('[닉네임 검증] 특수문자 포함');
    return;
  }
  
  // 금지 단어 검사 - 완전 일치만 검사하도록 수정
  const bannedWords = ['admin', 'administrator', '관리자', '운영자'];
  const lowerValue = value.toLowerCase();
  
  // 완전 일치 검사로 변경
  if (bannedWords.some(word => lowerValue === word.toLowerCase())) {
    errorMessage.value = '사용할 수 없는 닉네임입니다';
    console.log('[닉네임 검증] 금지 단어 완전 일치:', value);
    return;
  }
  
  // 부분 문자열 포함 검사는 더 엄격하게 (선택적)
  // 예: "관리" 단독으로는 괜찮지만 "관리자"는 안됨
  const strictBannedWords = ['관리자', '운영자', 'admin'];
  for (const word of strictBannedWords) {
    if (lowerValue === word.toLowerCase()) {
      errorMessage.value = '사용할 수 없는 닉네임입니다';
      console.log('[닉네임 검증] 엄격한 금지 단어:', value);
      return;
    }
  }
  
  console.log('[닉네임 검증] 통과');
  errorMessage.value = '';
};

// 닉네임 저장
const saveNickname = async () => {
  if (!isValid.value || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    // 닉네임 중복 확인 및 저장
    const success = await boardStore.setNickname(nickname.value);
    
    if (success) {
      await showAlert({
        title: '✅ 설정 완료',
        message: `닉네임이 "${nickname.value}"로 설정되었습니다.`,
        confirmText: '확인'
      });
      
      emit('saved', nickname.value);
      closeModal();
    } else {
      errorMessage.value = '이미 사용 중인 닉네임입니다';
    }
  } catch (error) {
    console.error('닉네임 저장 실패:', error);
    errorMessage.value = '닉네임 설정에 실패했습니다. 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
  }
};

// 모달 닫기
const closeModal = () => {
  nickname.value = '';
  errorMessage.value = '';
  emit('close');
};

// 모달이 열릴 때마다 현재 닉네임 가져오기
watch(isVisible, async (newVal) => {
  if (newVal && boardStore.profile?.nickname) {
    nickname.value = boardStore.profile.nickname;
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: #1E1B4B;
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #A855F7;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 24px;
}

.nickname-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
}

.nickname-input:focus {
  outline: none;
  border-color: #A855F7;
  background: rgba(255, 255, 255, 0.08);
}

.nickname-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.error-message {
  color: #EF4444;
  font-size: 14px;
  margin-top: 8px;
}

.char-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-top: 8px;
  text-align: right;
}

.info-section {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-text {
  color: #A855F7;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules-list li {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.8;
  padding-left: 16px;
  position: relative;
}

.rules-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #A855F7;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
