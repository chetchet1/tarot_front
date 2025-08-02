import { createApp, h } from 'vue';

interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

interface ConfirmResult {
  isConfirmed: boolean;
}

// Alert 컴포넌트
const AlertComponent = {
  props: {
    title: String,
    message: String,
    confirmText: { type: String, default: '확인' },
    cancelText: { type: String, default: '취소' },
    showCancel: { type: Boolean, default: true }
  },
  emits: ['confirm', 'cancel'],
  setup(props: any, { emit }: any) {
    const handleConfirm = () => {
      emit('confirm');
    };

    const handleCancel = () => {
      emit('cancel');
    };

    return () => h('div', {
      class: 'alert-overlay',
      onClick: handleCancel
    }, [
      h('div', {
        class: 'alert-container',
        onClick: (e: Event) => e.stopPropagation()
      }, [
        h('div', { class: 'alert-content' }, [
          h('h2', { class: 'alert-title' }, props.title),
          h('p', { class: 'alert-message' }, props.message),
          h('div', { class: 'alert-buttons' }, [
            props.showCancel && h('button', {
              class: 'alert-button alert-button-cancel',
              onClick: handleCancel
            }, props.cancelText),
            h('button', {
              class: 'alert-button alert-button-confirm',
              onClick: handleConfirm
            }, props.confirmText)
          ])
        ])
      ])
    ]);
  }
};

// 스타일을 동적으로 추가
const addAlertStyles = () => {
  if (document.getElementById('alert-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'alert-styles';
  style.textContent = `
    .alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }
    
    .alert-container {
      background: #1E1B4B;
      border: 2px solid rgba(168, 85, 247, 0.3);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease-out;
    }
    
    .alert-content {
      text-align: center;
    }
    
    .alert-title {
      color: #A855F7;
      font-size: 24px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    .alert-message {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
      white-space: pre-line;
    }
    
    .alert-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    
    .alert-button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 100px;
    }
    
    .alert-button-confirm {
      background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
      color: white;
    }
    
    .alert-button-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
    }
    
    .alert-button-cancel {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .alert-button-cancel:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
  `;
  document.head.appendChild(style);
};

// Alert 표시 함수
export const showAlert = (options: AlertOptions): Promise<void> => {
  return new Promise((resolve) => {
    addAlertStyles();
    
    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
    
    const app = createApp({
      render() {
        return h(AlertComponent, {
          ...options,
          showCancel: false,
          onConfirm: () => {
            app.unmount();
            document.body.removeChild(mountPoint);
            resolve();
          },
          onCancel: () => {
            app.unmount();
            document.body.removeChild(mountPoint);
            resolve();
          }
        });
      }
    });
    
    app.mount(mountPoint);
  });
};

// Confirm 표시 함수
export const showConfirm = (options: AlertOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    addAlertStyles();
    
    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
    
    const app = createApp({
      render() {
        return h(AlertComponent, {
          ...options,
          showCancel: options.showCancel !== false,
          onConfirm: () => {
            app.unmount();
            document.body.removeChild(mountPoint);
            resolve(true);
          },
          onCancel: () => {
            app.unmount();
            document.body.removeChild(mountPoint);
            resolve(false);
          }
        });
      }
    });
    
    app.mount(mountPoint);
  });
};

// Toast 메시지 (간단한 알림)
export const showToast = (message: string, duration: number = 3000) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 27, 75, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    border: 1px solid rgba(168, 85, 247, 0.3);
    z-index: 10001;
    animation: toastSlideIn 0.3s ease-out;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, 20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    @keyframes toastSlideOut {
      from {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      to {
        opacity: 0;
        transform: translate(-50%, 20px);
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
      document.head.removeChild(style);
    }, 300);
  }, duration);
};
