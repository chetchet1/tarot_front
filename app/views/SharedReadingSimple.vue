<template>
  <div class="shared-reading-simple">
    <h1 style="color: yellow;">TEST: Component Rendered!</h1>
    <h2>Simple Shared Reading Test</h2>
    <p>Current URL: {{ currentUrl }}</p>
    <p>Path ID: {{ pathId }}</p>
    <p>Component mounted: {{ mounted }}</p>
    
    <div v-if="data">
      <h2>Data Found!</h2>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
    
    <div v-else>
      <p>Loading data for ID: {{ pathId }}...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';

// 컴포넌트 생성 즉시 로그
console.log('✅ SharedReadingSimple SETUP STARTED');
console.error('✅ SharedReadingSimple SETUP STARTED (ERROR LOG)');

// 디버깅용으로 window에 노출
(window as any).supabase = supabase;
(window as any).sharedReadingSimpleLoaded = true;

const currentUrl = ref(window.location.href);
const pathId = ref('');
const mounted = ref(false);
const data = ref<any>(null);

// URL에서 ID 추출
const extractIdFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/\/s\/([^\/]+)/);
  return match ? match[1] : null;
};

onMounted(async () => {
  console.log('📍 SharedReadingSimple mounted');
  console.log('📍 Window location:', window.location);
  mounted.value = true;
  
  // URL에서 ID 추출
  const id = extractIdFromUrl();
  pathId.value = id || 'not-found';
  
  console.log('📍 Extracted ID:', id);
  console.log('📍 Supabase client available:', !!supabase);
  
  if (id) {
    try {
      console.log('📍 Starting query for:', id);
      
      // Supabase 클라이언트 확인
      console.log('📍 Supabase config:', {
        url: supabase.supabaseUrl,
        hasKey: !!supabase.supabaseKey
      });
      
      const { data: result, error } = await supabase
        .from('shared_readings')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('📍 Query completed');
      console.log('📍 Query result:', { result, error });
      
      if (error) {
        console.error('📍 Supabase error:', error);
        // 화면에 에러 표시
        data.value = { error: error.message };
      } else if (result) {
        console.log('📍 Data found:', result);
        data.value = result;
      } else {
        console.log('📍 No data found');
        data.value = { message: 'No data found' };
      }
    } catch (err: any) {
      console.error('📍 Catch error:', err);
      console.error('📍 Error stack:', err.stack);
      data.value = { error: err.message || 'Unknown error' };
    }
  } else {
    console.log('📍 No ID found in URL');
  }
  
  console.log('📍 Mount complete');
});

// 초기 로그
console.log('📍 SharedReadingSimple component loaded');
</script>

<style scoped>
.shared-reading-simple {
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
  font-size: 12px;
}
</style>
