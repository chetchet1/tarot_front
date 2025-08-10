<template>
  <div class="shared-reading-test">
    <h1>공유 페이지 테스트</h1>
    <p>Share ID: {{ shareId }}</p>
    <p>Loading: {{ loading }}</p>
    
    <div v-if="loading">
      로딩 중...
    </div>
    
    <div v-else-if="error">
      에러 발생: {{ error }}
    </div>
    
    <div v-else-if="sharedData">
      <h2>데이터 로드 성공!</h2>
      <pre>{{ JSON.stringify(sharedData, null, 2) }}</pre>
    </div>
    
    <div v-else>
      데이터 없음
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../services/supabase';

const route = useRoute();
const shareId = route.params.id as string;

const loading = ref(true);
const error = ref<string | null>(null);
const sharedData = ref<any>(null);

console.log('🎭 [SharedReading Test] Component created:', {
  shareId,
  route: route.path
});

onMounted(async () => {
  console.log('🎭 [SharedReading Test] Mounted - Loading data for:', shareId);
  
  try {
    if (!shareId) {
      throw new Error('No share ID provided');
    }
    
    const { data, error: supabaseError } = await supabase
      .from('shared_readings')
      .select('*')
      .eq('id', shareId)
      .single();
    
    console.log('🎭 [SharedReading Test] Query result:', { data, error: supabaseError });
    
    if (supabaseError) {
      throw supabaseError;
    }
    
    sharedData.value = data;
    
  } catch (err: any) {
    console.error('🎭 [SharedReading Test] Error:', err);
    error.value = err.message || 'Unknown error';
  } finally {
    loading.value = false;
    console.log('🎭 [SharedReading Test] Final state:', {
      loading: loading.value,
      hasData: !!sharedData.value,
      hasError: !!error.value
    });
  }
});
</script>

<style scoped>
.shared-reading-test {
  padding: 20px;
  background: #1a1a2e;
  color: white;
  min-height: 100vh;
}

h1 {
  color: #8b5cf6;
}

pre {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
</style>
