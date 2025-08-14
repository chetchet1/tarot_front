<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-container">
      <div class="modal-header">
        <h2>연애 상태를 선택해주세요</h2>
      </div>
      
      <div class="modal-body">
        <p class="modal-description">
          더 정확한 타로 해석을 위해<br>
          현재 연애 상태를 알려주세요
        </p>
        
        <div class="status-options">
          <button 
            class="status-button"
            :class="{ selected: selectedStatus === 'single' }"
            @click="selectStatus('single')"
          >
            <div class="status-icon">💝</div>
            <div class="status-text">
              <h3>솔로</h3>
              <p>연애를 하고 있지 않아요</p>
            </div>
          </button>
          
          <button 
            class="status-button"
            :class="{ selected: selectedStatus === 'couple' }"
            @click="selectStatus('couple')"
          >
            <div class="status-icon">💑</div>
            <div class="status-text">
              <h3>커플</h3>
              <p>연애 중이에요</p>
            </div>
          </button>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleCancel">
          취소
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="!selectedStatus"
          @click="handleConfirm"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [status: 'single' | 'couple'];
}>();

const selectedStatus = ref<'single' | 'couple' | null>(null);

const selectStatus = (status: 'single' | 'couple') => {
  selectedStatus.value = status;
};

const handleCancel = () => {
  selectedStatus.value = null;
  emit('close');
};

const handleConfirm = () => {
  if (selectedStatus.value) {
    emit('confirm', selectedStatus.value);
    selectedStatus.value = null;
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.status-options {
  display: flex;
  gap: 16px;
}

.status-button {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.status-button:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.status-button.selected {
  background: rgba(168, 85, 247, 0.2);
  border-color: #A855F7;
}

.status-icon {
  font-size: 48px;
  line-height: 1;
}

.status-text {
  text-align: center;
}

.status-text h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.status-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #9333EA, #6B21A8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .status-options {
    flex-direction: column;
  }
  
  .modal-container {
    margin: 0 10px;
  }
}
</style>
