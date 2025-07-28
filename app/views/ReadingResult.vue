<template>
  <Page class="page">
    <ActionBar title="점괘 결과" class="action-bar">
      <ActionItem text="공유" ios.position="right" @tap="shareReading" v-if="isPremium" />
    </ActionBar>
    
    <ScrollView>
      <StackLayout class="container">
        <!-- 전체 메시지 -->
        <StackLayout class="overall-message-section">
          <Label text="전체 메시지" class="section-title" />
          <Label :text="reading.overallMessage" class="overall-message" textWrap="true" />
        </StackLayout>

        <!-- 카드 결과 -->
        <StackLayout v-for="(card, index) in reading.cards" :key="index" class="card-section">
          <Label :text="`${card.position.name}`" class="position-name" />
          
          <GridLayout columns="120, *" class="card-content">
            <!-- 카드 이미지 -->
            <StackLayout col="0" class="card-image-container">
              <Image 
                :src="getCardImageUrl(card)" 
                class="card-image"
                :class="{ reversed: card.orientation === 'reversed' }"
                stretch="aspectFit"
              />
              <Label 
                :text="card.orientation === 'reversed' ? '역방향' : '정방향'" 
                class="orientation-label"
              />
            </StackLayout>
            
            <!-- 카드 해석 -->
            <StackLayout col="1" class="card-interpretation">
              <Label :text="card.nameKr || card.name" class="card-name" />
              <Label 
                :text="getCardKeywords(card)" 
                class="card-keywords" 
                textWrap="true"
              />
              <Label 
                :text="getCardMeaning(card)" 
                class="card-meaning" 
                textWrap="true"
              />
              <Label 
                :text="card.interpretation?.advice || '이 카드의 에너지를 받아들이세요.'" 
                class="card-advice" 
                textWrap="true"
              />
            </StackLayout>
          </GridLayout>
        </StackLayout>

        <!-- 액션 버튼들 -->
        <StackLayout class="action-buttons">
          <Button 
            text="새로운 점괘 보기" 
            @tap="newReading"
            class="primary-button"
          />
          <Button 
            text="홈으로" 
            @tap="goHome"
            class="secondary-button"
          />
        </StackLayout>

        <!-- 광고 배너 (무료 사용자) -->
        <StackLayout v-if="!isPremium" class="ad-container">
          <!-- AdMob 배너 광고 -->
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from '@nativescript-vue/router';
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { Share } from '@nativescript/core';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const tarotStore = useTarotStore();

const readingId = route.params.readingId as string;
const reading = computed(() => tarotStore.getReadingById(readingId));
const isPremium = computed(() => userStore.isPremium);

// 카드 이미지 URL 가져오기
const getCardImageUrl = (card: any): string => {
  return card.imageUrl || card.image_url || '/assets/tarot-cards/default-card.png';
};

// 카드 키워드 가져오기
const getCardKeywords = (card: any): string => {
  if (card.keywords && card.keywords[card.orientation]) {
    return card.keywords[card.orientation].join(', ');
  }
  return '카드 키워드';
};

// 카드 의미 가져오기
const getCardMeaning = (card: any): string => {
  // interpretation이 있으면 사용
  if (card.interpretation && card.interpretation.basic) {
    return card.interpretation.basic;
  }
  
  // meanings에서 주제에 맞는 의미 찾기
  if (card.meanings && reading.value) {
    const topic = reading.value.topic || 'general';
    const topicMeaning = card.meanings[topic];
    if (topicMeaning && topicMeaning[card.orientation]) {
      return topicMeaning[card.orientation];
    }
    
    // general 의미로 폴백
    if (card.meanings.general && card.meanings.general[card.orientation]) {
      return card.meanings.general[card.orientation];
    }
  }
  
  return '이 카드가 당신에게 전하는 메시지를 느껴보세요.';
};

const shareReading = async () => {
  if (!reading.value || !isPremium.value) return;

  // 공유 텍스트 생성
  let shareText = `🔮 타로의 정원 - 점괘 결과\n\n`;
  shareText += `주제: ${getTopicName(reading.value.topic)}\n`;
  if (reading.value.question) {
    shareText += `질문: ${reading.value.question}\n`;
  }
  shareText += `\n전체 메시지:\n${reading.value.overallMessage}\n\n`;
  
  reading.value.cards.forEach((card) => {
    shareText += `${card.position.name}: ${card.nameKr} (${card.orientation === 'reversed' ? '역방향' : '정방향'})\n`;
    shareText += `${card.interpretation.basic}\n\n`;
  });

  // 공유하기
  await Share.shareText(shareText, "타로 점괘 결과");
};

const getTopicName = (topic: string): string => {
  const topics: Record<string, string> = {
    general: '일반',
    love: '연애',
    career: '진로',
    money: '금전',
    health: '건강'
  };
  return topics[topic] || topic;
};

const newReading = () => {
  router.push({ name: 'reading-select' });
};

const goHome = () => {
  router.push({ name: 'home' });
};

onMounted(() => {
  if (!reading.value) {
    router.push({ name: 'home' });
  }
});
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

.overall-message-section {
  background-color: #2D2A5C;
  padding: 20;
  border-radius: 15;
  margin-bottom: 20;
}

.section-title {
  font-size: 18;
  font-weight: bold;
  color: #F59E0B;
  margin-bottom: 10;
}

.overall-message {
  font-size: 16;
  color: #FFFFFF;
  line-height: 24;
}

.card-section {
  background-color: #3E3B6E;
  padding: 15;
  border-radius: 10;
  margin-bottom: 15;
}

.position-name {
  font-size: 16;
  font-weight: bold;
  color: #F59E0B;
  margin-bottom: 10;
}

.card-content {
  margin-top: 10;
}

.card-image-container {
  align-items: center;
}

.card-image {
  width: 100;
  height: 150;
  margin-bottom: 5;
}

.card-image.reversed {
  transform: rotate(180);
}

.orientation-label {
  font-size: 12;
  color: #E5E7EB;
  opacity: 0.8;
}

.card-interpretation {
  padding-left: 15;
}

.card-name {
  font-size: 18;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 5;
}

.card-keywords {
  font-size: 14;
  color: #F59E0B;
  margin-bottom: 10;
  font-style: italic;
}

.card-meaning {
  font-size: 14;
  color: #E5E7EB;
  line-height: 20;
  margin-bottom: 10;
}

.card-advice {
  font-size: 14;
  color: #7C3AED;
  line-height: 20;
  font-style: italic;
}

.action-buttons {
  margin-top: 30;
  margin-bottom: 20;
}

.primary-button {
  background-color: #7C3AED;
  color: #FFFFFF;
  font-size: 16;
  font-weight: bold;
  padding: 15;
  border-radius: 25;
  margin-bottom: 10;
}

.secondary-button {
  background-color: #3E3B6E;
  color: #FFFFFF;
  font-size: 16;
  padding: 15;
  border-radius: 25;
}

.ad-container {
  margin-top: 20;
  height: 60;
  background-color: #2D2A5C;
  border-radius: 10;
}
</style>
