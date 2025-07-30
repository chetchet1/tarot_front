<template>
  <span :class="iconClass" :aria-label="label">
    {{ getIconContent() }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'normal'
  },
  label: {
    type: String,
    default: ''
  }
});

const iconClass = computed(() => {
  const sizeClasses = {
    small: 'text-base',
    normal: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };
  return `inline-block ${sizeClasses[props.size] || sizeClasses.normal}`;
});

const getIconContent = () => {
  // 간단한 아이콘 매핑
  const icons = {
    'mdi:cards-playing': '🎴',
    'mdi:target': '🎯',
    'mdi:brain': '🧠',
    'mdi:chart-pie': '📊',
    'mdi:timeline': '📈',
    'mdi:account-heart': '💝',
    'mdi:lightbulb': '💡',
    'mdi:eye': '👁️',
    'mdi:heart': '❤️',
    'mdi:star': '⭐',
    'mdi:sparkles': '✨',
    'mdi:crystal-ball': '🔮',
    'mdi:moon': '🌙',
    'mdi:sun': '☀️',
    'mdi:cloud': '☁️',
    'mdi:water': '💧',
    'mdi:fire': '🔥',
    'mdi:leaf': '🍃',
    'mdi:earth': '🌍',
    'mdi:help-circle': '❓',
    'mdi:information': 'ℹ️',
    'mdi:alert': '⚠️',
    'mdi:check': '✅',
    'mdi:close': '❌',
    'mdi:arrow-right': '➡️',
    'mdi:arrow-left': '⬅️',
    'mdi:arrow-up': '⬆️',
    'mdi:arrow-down': '⬇️',
    'mdi:menu': '☰',
    'mdi:home': '🏠',
    'mdi:account': '👤',
    'mdi:settings': '⚙️',
    'mdi:logout': '🚪',
    'mdi:login': '🔑',
    'mdi:email': '📧',
    'mdi:lock': '🔒',
    'mdi:shield-check': '🛡️',
    'mdi:crown': '👑',
    'mdi:diamond': '💎',
    'mdi:gift': '🎁',
    'mdi:calendar': '📅',
    'mdi:clock': '🕐',
    'mdi:refresh': '🔄',
    'mdi:plus': '➕',
    'mdi:minus': '➖',
    'mdi:dice-6': '🎲',
    'mdi:book-open': '📖',
    'mdi:history': '🔙',
    'mdi:magnify': '🔍',
    'mdi:share': '📤',
    'mdi:download': '📥',
    'mdi:upload': '📤',
    'mdi:delete': '🗑️',
    'mdi:edit': '✏️',
    'mdi:content-copy': '📋',
    'mdi:link': '🔗',
    'mdi:image': '🖼️',
    'mdi:camera': '📷',
    'mdi:video': '📹',
    'mdi:music': '🎵',
    'mdi:microphone': '🎤',
    'mdi:volume-high': '🔊',
    'mdi:volume-off': '🔇',
    'mdi:wifi': '📶',
    'mdi:bluetooth': '📶',
    'mdi:battery': '🔋',
    'mdi:bell': '🔔',
    'mdi:bell-off': '🔕'
  };
  
  return icons[props.name] || '◆';
};
</script>

<style scoped>
span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
