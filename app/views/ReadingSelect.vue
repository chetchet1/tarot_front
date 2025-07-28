<template>
  <Page class="page">
    <ActionBar title="타로 점보기" class="action-bar">
      <NavigationButton text="뒤로" @tap="$router.back()" />
    </ActionBar>
    
    <ScrollView>
      <StackLayout class="container">
        <!-- 주제 선택 -->
        <StackLayout class="section">
          <Label text="무엇이 궁금하신가요?" class="section-title" />
          <FlexboxLayout class="topic-grid">
            <StackLayout 
              v-for="topic in topics" 
              :key="topic.id"
              class="topic-card"
              :class="{ selected: selectedTopic === topic.id }"
              @tap="selectTopic(topic.id)"
            >
              <Label :text="topic.icon" class="topic-icon" />
              <Label :text="topic.name" class="topic-name" />
            </StackLayout>
          </FlexboxLayout>
        </StackLayout>

        <!-- 질문 입력 (선택사항) -->
        <StackLayout class="section" v-if="selectedTopic">
          <Label text="구체적인 질문이 있으신가요? (선택사항)" class="section-subtitle" />
          <TextView 
            v-model="question"
            hint="예: 이번 달에 좋은 일이 있을까요?"
            class="question-input"
            returnKeyType="done"
          />
        </StackLayout>

        <!-- 배열법 선택 -->
        <StackLayout class="section" v-if="selectedTopic">
          <Label text="배열법을 선택하세요" class="section-title" />
          <StackLayout 
            v-for="spread in availableSpreads" 
            :key="spread.spreadId"
            class="spread-card"
            :class="{ selected: selectedSpread === spread.spreadId }"
            @tap="selectSpread(spread.spreadId)"
          >
            <GridLayout columns="*, auto" rows="auto, auto">
              <Label :text="spread.nameKr" class="spread-name" row="0" col="0" />
              <Label 
                v-if="spread.isPremium && !isPremium" 
                text="프리미엄" 
                class="premium-badge" 
                row="0" col="1" 
              />
              <Label :text="spread.description" class="spread-description" row="1" col="0" colSpan="2" />
              <Label :text="`${spread.cardCount}장`" class="spread-count" row="1" col="1" />
            </GridLayout>
          </StackLayout>
        </StackLayout>

        <!-- 카드 뽑기 버튼 -->
        <Button 
          v-if="selectedTopic && selectedSpread"
          text="카드 뽑기"
          @tap="startReading"
          class="start-button"
          :isEnabled="!isLoading"
        />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from '@nativescript-vue/router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { getSpreadsByTopic } from '../data/spreads';
import { Topic } from '../models/tarot';
import { showAd } from '../services/admob';
import { confirm, alert } from '@nativescript/core';

const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const isPremium = computed(() => userStore.isPremium);
const isLoading = ref(false);

const topics = [
  { id: 'general', name: '일반', icon: '🔮' },
  { id: 'love', name: '연애', icon: '❤️' },
  { id: 'career', name: '진로', icon: '💼' },
  { id: 'money', name: '금전', icon: '💰' },
  { id: 'health', name: '건강', icon: '🌿' }
];

const selectedTopic = ref<Topic | null>(null);
const selectedSpread = ref<string | null>(null);
const question = ref('');

const availableSpreads = computed(() => {
  if (!selectedTopic.value) return [];
  
  let spreads = getSpreadsByTopic(selectedTopic.value);
  
  // 무료 사용자는 프리미엄 배열법 필터링
  if (!isPremium.value) {
    // 프리미엄 배열법도 보여주되 선택은 못하게 함
    return spreads;
  }
  
  return spreads;
});

const selectTopic = (topicId: Topic) => {
  selectedTopic.value = topicId;
  selectedSpread.value = null; // 주제 변경시 배열법 초기화
};

const selectSpread = (spreadId: string) => {
  const spread = availableSpreads.value.find(s => s.spreadId === spreadId);
  
  if (spread?.isPremium && !isPremium.value) {
    // 프리미엄 구독 유도
    router.push({ name: 'premium' });
    return;
  }
  
  selectedSpread.value = spreadId;
};

const startReading = async () => {
  if (!selectedTopic.value || !selectedSpread.value) return;
  
  // 무료 사용자는 사용 횟수 체크
  if (!isPremium.value) {
    const status = userStore.getFreeReadingStatus();
    if (!status.canUse) {
      // 무료 사용 횟수 초과
      const result = await confirm({
        title: '무료 점괘 사용 완료',
        message: `오늘 무료 점괘 ${status.total}회를 모두 사용하셨습니다. 프리미엄으로 업그레이드하시면 무제한으로 이용하실 수 있습니다.`,
        okButtonText: '프리미엄 보기',
        cancelButtonText: '취소'
      });
      
      if (result) {
        router.push({ name: 'premium' });
      }
      return;
    }
  }
  
  isLoading.value = true;
  
  try {
    // 무료 사용자는 광고 표시
    if (!isPremium.value) {
      await showAd();
    }
    
    // 점괘 생성
    const reading = await tarotStore.createReading(
      selectedSpread.value,
      selectedTopic.value,
      question.value || undefined
    );
    
    // 무료 점괘 사용 카운트 증가
    if (!isPremium.value) {
      userStore.incrementFreeReading();
    }
    
    // 바로 결과 화면으로 이동 (카드 뽑기 과정 생략)
    router.push({
      name: 'reading-result',
      params: { readingId: reading.id }
    });
  } catch (error) {
    console.error('Failed to start reading:', error);
    alert({
      title: '오류',
      message: '점괘를 생성하는데 실패했습니다. 다시 시도해주세요.',
      okButtonText: '확인'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.page {
  background-color: #1E1B4B;
}

.action-bar {
  background-color: #2D2A5C;
  color: #FFFFFF;
}

.container {
  padding: 20;
}

.section {
  margin-bottom: 25;
}

.section-title {
  font-size: 20;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 15;
}

.section-subtitle {
  font-size: 16;
  color: #E5E7EB;
  margin-bottom: 10;
  opacity: 0.8;
}

.topic-grid {
  flex-wrap: wrap;
  justify-content: space-between;
}

.topic-card {
  width: 30%;
  padding: 15;
  margin-bottom: 10;
  background-color: #3E3B6E;
  border-radius: 15;
  align-items: center;
}

.topic-card.selected {
  background-color: #7C3AED;
  border-width: 2;
  border-color: #F59E0B;
}

.topic-icon {
  font-size: 30;
  margin-bottom: 5;
}

.topic-name {
  font-size: 14;
  color: #FFFFFF;
  text-align: center;
}

.question-input {
  background-color: #3E3B6E;
  color: #FFFFFF;
  padding: 15;
  border-radius: 10;
  font-size: 16;
  height: 100;
  placeholder-color: #9CA3AF;
}

.spread-card {
  padding: 15;
  margin-bottom: 10;
  background-color: #3E3B6E;
  border-radius: 10;
  border-width: 2;
  border-color: transparent;
}

.spread-card.selected {
  border-color: #7C3AED;
  background-color: #4C489D;
}

.spread-name {
  font-size: 16;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 5;
}

.spread-description {
  font-size: 14;
  color: #E5E7EB;
  opacity: 0.8;
}

.spread-count {
  font-size: 12;
  color: #F59E0B;
  margin-left: 10;
}

.premium-badge {
  background-color: #F59E0B;
  color: #1E1B4B;
  padding: 4 8;
  border-radius: 12;
  font-size: 12;
  font-weight: bold;
}

.start-button {
  background-color: #7C3AED;
  color: #FFFFFF;
  font-size: 18;
  font-weight: bold;
  padding: 15;
  border-radius: 25;
  margin-top: 20;
}

.start-button:disabled {
  opacity: 0.5;
}
</style>
