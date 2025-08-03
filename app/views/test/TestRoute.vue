<template>
  <div class="test-route">
    <h1>라우터 테스트 페이지</h1>
    <button @click="goToCardDrawing">카드 뽑기로 이동</button>
    <div>
      <h2>현재 상태</h2>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTarotStore } from '../../store/tarot';

const router = useRouter();
const tarotStore = useTarotStore();

const debugInfo = computed(() => {
  return JSON.stringify({
    currentRoute: router.currentRoute.value.path,
    tarotStore: {
      selectedTopic: tarotStore.selectedTopic,
      selectedSpread: tarotStore.selectedSpread
    }
  }, null, 2);
});

const goToCardDrawing = async () => {
  // 테스트 데이터 설정
  tarotStore.setSelectedTopic({ id: 'test', name: '테스트 주제' });
  tarotStore.setSelectedSpread({ spreadId: 'test_spread', name: '테스트 배열' });
  
  console.log('Test: 카드 뽑기 페이지로 이동 시도');
  await router.push('/card-drawing');
  console.log('Test: 이동 완료?', router.currentRoute.value.path);
};
</script>

<style scoped>
.test-route {
  padding: 20px;
}
pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
}
</style>
