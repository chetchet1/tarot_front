<template>
  <Page class="page" @loaded="onPageLoaded">
    <ActionBar title="카드 뽑기" class="action-bar" />
    
    <GridLayout class="container">
      <!-- 카드 덱 -->
      <StackLayout class="deck-container" v-if="!isDrawing && !isComplete">
        <Label text="카드를 섞고 있습니다..." class="instruction" />
        <Image 
          src="~/assets/card-back.png" 
          class="card-back shuffling"
          stretch="aspectFit"
        />
        <Button 
          text="카드 뽑기"
          @tap="startDrawing"
          class="draw-button"
          v-if="isShuffled"
        />
      </StackLayout>

      <!-- 카드 뽑기 진행 중 -->
      <StackLayout class="drawing-container" v-if="isDrawing">
        <Label 
          :text="`${currentCardIndex + 1} / ${totalCards} 번째 카드`" 
          class="progress-label" 
        />
        <FlexboxLayout class="cards-grid">
          <Image 
            v-for="index in totalCards"
            :key="index"
            src="~/assets/card-back.png"
            class="card-slot"
            :class="{ 'can-tap': index === currentCardIndex + 1, 'selected': index <= currentCardIndex }"
            @tap="drawCard(index)"
            stretch="aspectFit"
          />
        </FlexboxLayout>
        <Label 
          text="카드를 탭하여 선택하세요" 
          class="instruction"
          v-if="currentCardIndex < totalCards"
        />
      </StackLayout>

      <!-- 카드 뽑기 완료 -->
      <StackLayout class="complete-container" v-if="isComplete">
        <Label text="카드 선택이 완료되었습니다!" class="complete-message" />
        <ActivityIndicator busy="true" class="loading" />
        <Label text="해석을 준비하고 있습니다..." class="loading-text" />
      </StackLayout>
    </GridLayout>
  </Page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from '@nativescript-vue/router';
import { useTarotStore } from '../store/tarot';
import { Animation } from '@nativescript/core';

const route = useRoute();
const router = useRouter();
const tarotStore = useTarotStore();

const readingId = route.params.readingId as string;
const reading = tarotStore.getReadingById(readingId);

const isShuffled = ref(false);
const isDrawing = ref(false);
const isComplete = ref(false);
const currentCardIndex = ref(0);
const totalCards = reading?.cards.length || 0;
const drawnCards = ref<number[]>([]);

const onPageLoaded = () => {
  // 셔플 애니메이션 시작
  setTimeout(() => {
    isShuffled.value = true;
  }, 2000);
};

const startDrawing = () => {
  isDrawing.value = true;
};

const drawCard = async (index: number) => {
  if (index !== currentCardIndex.value + 1) return;
  if (drawnCards.value.includes(index)) return;

  // 카드 선택 효과
  drawnCards.value.push(index);
  currentCardIndex.value++;

  // 진동 피드백
  if (tarotStore.vibrationEnabled) {
    // Vibration API 사용
  }

  // 모든 카드를 뽑았는지 확인
  if (currentCardIndex.value >= totalCards) {
    isComplete.value = true;
    isDrawing.value = false;

    // 결과 화면으로 이동
    setTimeout(() => {
      router.push({
        name: 'reading-result',
        params: { readingId }
      });
    }, 2000);
  }
};

onMounted(() => {
  if (!reading) {
    router.back();
  }
});
</script>

<style scoped>
@keyframes shuffle {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(5deg) scale(1.05); }
  50% { transform: rotate(-5deg) scale(1.05); }
  75% { transform: rotate(5deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); }
}

.page {
  background-color: #1E1B4B;
}

.action-bar {
  background-color: #2D2A5C;
  color: #FFFFFF;
}

.container {
  padding: 20;
  vertical-align: center;
  horizontal-align: center;
}

.deck-container {
  align-items: center;
}

.instruction {
  font-size: 18;
  color: #E5E7EB;
  text-align: center;
  margin-bottom: 30;
}

.card-back {
  width: 200;
  height: 300;
  margin-bottom: 30;
}

.card-back.shuffling {
  animation-name: shuffle;
  animation-duration: 1s;
  animation-iteration-count: 2;
}

.draw-button {
  background-color: #7C3AED;
  color: #FFFFFF;
  font-size: 18;
  font-weight: bold;
  padding: 15 30;
  border-radius: 25;
}

.drawing-container {
  align-items: center;
  width: 100%;
}

.progress-label {
  font-size: 20;
  font-weight: bold;
  color: #F59E0B;
  margin-bottom: 30;
}

.cards-grid {
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.card-slot {
  width: 80;
  height: 120;
  margin: 10;
  opacity: 0.5;
  border-radius: 10;
}

.card-slot.can-tap {
  opacity: 1;
  border-width: 2;
  border-color: #7C3AED;
  transform: scale(1.1);
}

.card-slot.selected {
  opacity: 1;
  border-width: 2;
  border-color: #F59E0B;
}

.complete-container {
  align-items: center;
}

.complete-message {
  font-size: 24;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 30;
  text-align: center;
}

.loading {
  color: #7C3AED;
  margin-bottom: 20;
}

.loading-text {
  font-size: 16;
  color: #E5E7EB;
  opacity: 0.8;
}
</style>
