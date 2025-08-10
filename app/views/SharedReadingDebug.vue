<template>
  <div class="shared-debug">
    <h1>Debug Component</h1>
    <p>Mounted: {{ isMounted }}</p>
    <p>Loading: {{ isLoading }}</p>
    <p>Error: {{ error }}</p>
    <p>Data: {{ data ? 'YES' : 'NO' }}</p>
    
    <button @click="loadData">Manual Load Data</button>
    <button @click="testSupabase" style="margin-left: 10px; background: orange;">Test Supabase</button>
    <button @click="testDirectFetch" style="margin-left: 10px; background: purple;">Test Direct Fetch</button>
    
    <div v-if="data" style="background: green; color: white; padding: 10px; margin-top: 20px;">
      <h2>SUCCESS! Data loaded:</h2>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import { supabase } from '../services/supabase';

console.log('🔴 SharedReadingDebug: Script setup running');

// window에 supabase 노출 (디버깅용)
(window as any).supabase = supabase;

const isMounted = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const data = ref<any>(null);

// URL에서 ID 추출
const getIdFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/\/s\/([^\/]+)/);
  return match ? match[1] : null;
};

// 데이터 로드 함수 - 직접 fetch 사용
const loadData = async () => {
  console.log('🔵 loadData called');
  isLoading.value = true;
  error.value = null;
  
  try {
    const id = getIdFromUrl();
    console.log('🔵 Extracted ID:', id);
    
    if (!id) {
      throw new Error('No ID in URL');
    }
    
    // 직접 fetch 사용
    const url = `https://yxywzsmggvxxujuplyly.supabase.co/rest/v1/shared_readings?id=eq.${id}&select=*`;
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,count=none'
    };
    
    console.log('🔵 Fetching:', url);
    const response = await fetch(url, { headers });
    console.log('🔵 Response status:', response.status);
    
    const result = await response.json();
    console.log('🔵 Response data:', result);
    
    if (result && result.length > 0) {
      console.log('🟢 Data found:', result[0]);
      data.value = result[0];
    } else {
      console.log('🟡 No data found');
      error.value = 'No data found';
    }
    
  } catch (err: any) {
    console.error('🔴 Error:', err);
    error.value = err.message || 'Unknown error';
  } finally {
    isLoading.value = false;
  }
};

// Supabase 테스트 함수
const testSupabase = () => {
  console.log('🧨 Testing Supabase...');
  console.log('🧨 Supabase object:', supabase);
  console.log('🧨 Supabase URL:', supabase.supabaseUrl);
  console.log('🧨 Has key:', !!supabase.supabaseKey);
  
  // 간단한 쿼리 테스트
  const testQuery = supabase
    .from('shared_readings')
    .select('id')
    .limit(1);
  
  console.log('🧨 Test query created:', testQuery);
  
  testQuery.then((result: any) => {
    console.log('🧨 Test query result:', result);
  }).catch((err: any) => {
    console.error('🧨 Test query error:', err);
  });
};

// 직접 fetch 테스트
const testDirectFetch = async () => {
  console.log('💜 Direct fetch test...');
  
  const url = 'https://yxywzsmggvxxujuplyly.supabase.co/rest/v1/shared_readings?id=eq.test123&select=*';
  const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eXd6c21nZ3Z4eHVqdXBseWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTk2ODUsImV4cCI6MjA2OTEzNTY4NX0.8w3JYOmbmJKdzz9H0_GfgspIfb0SfjjOvkyxPNvFVSM',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation,count=none'
  };
  
  try {
    console.log('💜 Fetching:', url);
    const response = await fetch(url, { headers });
    console.log('💜 Response status:', response.status);
    const data = await response.json();
    console.log('💜 Response data:', data);
    
    if (data && data.length > 0) {
      console.log('💜 SUCCESS! Setting data...');
      data.value = data[0];
    }
  } catch (err) {
    console.error('💜 Fetch error:', err);
  }
};

onBeforeMount(() => {
  console.log('🟡 onBeforeMount');
});

onMounted(() => {
  console.log('🟢 onMounted');
  isMounted.value = true;
  
  // 자동 로드
  loadData();
});

console.log('🔴 SharedReadingDebug: Script setup complete');
</script>

<style scoped>
.shared-debug {
  padding: 20px;
  background: #333;
  color: white;
  min-height: 300px;
}

button {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 10px;
}

pre {
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  overflow-x: auto;
}
</style>
