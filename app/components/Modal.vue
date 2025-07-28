<template>
  <Transition name="modal">
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script>
import { watch } from 'vue';

export default {
  name: 'Modal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    console.log('Modal setup 호출됨, isVisible:', props.isVisible);
    
    const handleOverlayClick = () => {
      console.log('Modal 오버레이 클릭');
      if (props.closeOnOverlay) {
        emit('close');
      }
    };

    // ESC 키로 모달 닫기
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && props.isVisible) {
        console.log('ESC 키로 모달 닫기');
        emit('close');
      }
    };

    watch(() => props.isVisible, (isVisible, oldValue) => {
      console.log(`🎭 Modal isVisible 변경: ${oldValue} -> ${isVisible}`);
      if (isVisible) {
        console.log('모달 열리는 중...');
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
      } else {
        console.log('모달 닫히는 중...');
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      }
    }, { immediate: true });

    return {
      handleOverlayClick
    };
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
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 트랜지션 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-to .modal-container,
.modal-leave-from .modal-container {
  transform: scale(1) translateY(0);
}
</style>
