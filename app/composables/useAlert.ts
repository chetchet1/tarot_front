import { ref, h, render, VNode } from 'vue';
import Alert from '@/components/common/Alert.vue';

export type AlertOptions = {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
};

export function useAlert() {
  const show = (options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const visible = ref(true);

      const handleConfirm = () => {
        visible.value = false;
        setTimeout(() => {
          render(null, container);
          document.body.removeChild(container);
          resolve(true);
        }, 200);
      };

      const handleCancel = () => {
        visible.value = false;
        setTimeout(() => {
          render(null, container);
          document.body.removeChild(container);
          resolve(false);
        }, 200);
      };

      const vnode = h(Alert, {
        ...options,
        visible: visible.value,
        showConfirm: true,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        onClose: handleCancel
      });

      render(vnode, container);
    });
  };

  return {
    // 기본 알림
    alert: (message: string, title?: string) => 
      show({ type: 'info', message, title }),
    
    // 성공 알림
    success: (message: string, title?: string) => 
      show({ type: 'success', message, title }),
    
    // 경고 알림
    warning: (message: string, title?: string) => 
      show({ type: 'warning', message, title }),
    
    // 에러 알림
    error: (message: string, title?: string) => 
      show({ type: 'error', message, title }),
    
    // 확인 대화상자
    confirm: (message: string, title?: string) => 
      show({ 
        type: 'info', 
        message, 
        title, 
        showCancel: true,
        confirmText: '확인',
        cancelText: '취소'
      })
  };
}
