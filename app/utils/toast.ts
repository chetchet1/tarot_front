import { ref } from 'vue';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

// 토스트 상태 관리
const toasts = ref<ToastOptions[]>([]);

// 토스트 표시 함수
export const showToast = (
  message: string, 
  type: ToastOptions['type'] = 'info',
  duration: number = 3000
) => {
  const toast: ToastOptions = {
    message,
    type,
    duration,
    position: 'bottom'
  };
  
  toasts.value.push(toast);
  
  // 자동 제거
  setTimeout(() => {
    const index = toasts.value.indexOf(toast);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }, duration);
};

// 토스트 목록 반환
export const useToast = () => {
  return {
    toasts,
    showToast
  };
};
