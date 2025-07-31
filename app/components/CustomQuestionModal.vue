<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>질문 입력하기</h2>
        <button class="close-button" @click="handleClose">×</button>
      </div>
      
      <div class="modal-body">
        <p class="description">
          타로 카드에게 물어보고 싶은 질문을 자유롭게 입력해주세요.
          구체적일수록 더 정확한 답변을 받을 수 있습니다.
        </p>
        
        <div class="input-container">
          <textarea
            v-model="question"
            placeholder="예: 올해 내가 계획하고 있는 프로젝트가 성공할 수 있을까요?"
            maxlength="200"
            rows="4"
            ref="textareaRef"
          ></textarea>
          <div class="char-count">{{ question.length }}/200</div>
        </div>
        
        <div class="tips">
          <p class="tip-title">💡 좋은 질문의 예시</p>
          <ul>
            <li>현재 진행 중인 연애가 잘 이어질까요?</li>
            <li>이직을 고민하고 있는데 지금이 적절한 시기일까요?</li>
            <li>새로운 사업을 시작하려는데 어떤 점을 주의해야 할까요?</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">취소</button>
        <button 
          class="btn btn-primary" 
          @click="handleConfirm"
          :disabled="!question.trim() || question.length < 10"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [question: string];
}>();

const question = ref('');
const textareaRef = ref<HTMLTextAreaElement>();

onMounted(() => {
  // 모달이 열릴 때 textarea에 포커스
  if (props.isOpen && textareaRef.value) {
    textareaRef.value.focus();
  }
});

const handleClose = () => {
  question.value = '';
  emit('close');
};

const handleConfirm = () => {
  if (question.value.trim() && question.value.length >= 10) {
    emit('confirm', question.value.trim());
    question.value = '';
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1F1B2E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #A855F7;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: white;
}

.modal-body {
  padding: 24px;
}

.description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.input-container {
  position: relative;
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-size: 16px;
  resize: none;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #A855F7;
  background: rgba(255, 255, 255, 0.08);
}

textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.tips {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.tip-title {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #A855F7;
  font-size: 14px;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.tips li:last-child {
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: #A855F7;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #9333EA;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .modal-content {
    margin: 10px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 20px;
  }
}
</style>
