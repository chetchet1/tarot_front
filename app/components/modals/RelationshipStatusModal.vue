<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-content">
          <div class="modal-header">
            <h2>연애 상태 선택</h2>
            <button class="close-button" @click="handleCancel">×</button>
          </div>
          
          <div class="modal-body">
            <p class="description">
              현재 연애 상태를 선택해주세요.<br>
              더욱 정확한 타로 해석을 제공해드립니다.
            </p>
            
            <div class="status-buttons">
              <button 
                class="status-button single"
                @click="selectStatus('single')"
              >
                <div class="status-icon">💝</div>
                <h3>솔로</h3>
                <p>연인을 찾고 있어요</p>
              </button>
              
              <button 
                class="status-button couple"
                @click="selectStatus('couple')"
              >
                <div class="status-icon">💑</div>
                <h3>커플</h3>
                <p>연인이 있어요</p>
              </button>
            </div>
            
            <div class="tip">
              💡 선택한 상태에 따라 맞춤형 조언을 제공합니다
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { nativeUtils } from '@/utils/capacitor';

interface Props {
  isVisible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['select', 'cancel']);

const selectStatus = async (status: 'single' | 'couple') => {
  await nativeUtils.buttonTapHaptic();
  emit('select', status);
};

const handleCancel = async () => {
  await nativeUtils.buttonTapHaptic();
  emit('cancel');
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
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: modal-slide-up 0.3s ease-out;
}

@keyframes modal-slide-up {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.close-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 30px 24px;
}

.description {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.status-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.status-button {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.status-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.status-button.single:hover {
  background: rgba(236, 72, 153, 0.2);
  border-color: #EC4899;
}

.status-button.couple:hover {
  background: rgba(251, 113, 133, 0.2);
  border-color: #FB7185;
}

.status-icon {
  font-size: 48px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.status-button h3 {
  font-size: 20px;
  color: white;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.status-button p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.tip {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: rgba(255, 215, 0, 0.9);
  text-align: center;
}

/* 모달 애니메이션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-content {
  transform: scale(0.9);
}

.modal-fade-leave-to .modal-content {
  transform: scale(0.9);
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
    margin: 0 10px;
  }
  
  .modal-header h2 {
    font-size: 20px;
  }
  
  .status-buttons {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-button {
    padding: 20px;
  }
  
  .description {
    font-size: 14px;
  }
}
</style>
