<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click="handleBackdropClick"
    >
      <div
        class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all"
        :class="alertClass"
        @click.stop
      >
        <!-- Icon -->
        <div class="p-6 pb-4">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full" :class="iconBgClass">
            <div v-html="iconSvg" :class="iconClass"></div>
          </div>
          
          <!-- Title -->
          <h3 v-if="title" class="mb-2 text-lg font-semibold text-center text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          
          <!-- Message -->
          <p class="text-sm text-center text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {{ message }}
          </p>
        </div>
        
        <!-- Actions -->
        <div class="flex border-t border-gray-200 dark:border-gray-700">
          <button
            v-if="showCancel"
            @click="handleCancel"
            class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'border-r border-gray-200 dark:border-gray-700': showConfirm }"
          >
            {{ cancelText }}
          </button>
          <button
            v-if="showConfirm"
            @click="handleConfirm"
            class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
            :class="confirmButtonClass"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
// Heroicons를 SVG로 직접 구현

export type AlertType = 'success' | 'warning' | 'error' | 'info';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String as () => AlertType,
    default: 'info'
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  showConfirm: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const alertClass = computed(() => {
  // 타입별 추가 클래스가 필요한 경우 여기에 추가
  return '';
});

const iconSvg = computed(() => {
  switch (props.type) {
    case 'success':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>`;
    case 'error':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>`;
  }
});

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900';
    case 'error':
      return 'bg-red-100 dark:bg-red-900';
    default:
      return 'bg-blue-100 dark:bg-blue-900';
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-blue-600 dark:text-blue-400';
  }
});

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20';
    case 'error':
      return 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20';
    default:
      return 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20';
  }
});

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleCancel();
  }
};
</script>
