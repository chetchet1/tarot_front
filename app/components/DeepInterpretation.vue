<template>
  <div v-if="!interpretation" class="empty-state">
    <p class="text-center text-white/60">심화 해석을 준비 중입니다...</p>
  </div>
  
  <div v-else class="deep-interpretation">
    <!-- 카드 조합 분석 -->
    <section v-if="interpretation.cardCombinations?.length > 0" class="mb-8">
      <h3 class="text-xl font-bold mb-4 flex items-center">
        <Icon name="mdi:cards-playing" class="mr-2" />
        카드 조합의 의미
      </h3>
      <div class="space-y-4">
        <div
          v-for="(combo, index) in interpretation.cardCombinations"
          :key="index"
          class="bg-white/5 rounded-lg p-4 border border-white/10"
        >
          <div class="flex items-center mb-2">
            <span class="text-sm font-medium text-purple-400">
              {{ combo.type === 'special' ? '특별한 조합' : 
                 combo.type === 'suit' ? '수트 조합' : 
                 combo.type === 'number' ? '숫자 관계' : '조합' }}
            </span>
          </div>
          <p class="text-white/90">{{ combo.meaning }}</p>
          <p v-if="combo.advice" class="text-sm text-white/70 mt-2 italic">
            💡 {{ combo.advice }}
          </p>
        </div>
      </div>
    </section>

    <!-- 주제별 특화 해석 -->
    <section v-if="showTopicInterpretation" class="mb-8">
      <h3 class="text-xl font-bold mb-4 flex items-center">
        <Icon name="mdi:target" class="mr-2" />
        {{ topicName }} 심화 해석
      </h3>
      <div class="grid gap-4">
        <div
          v-for="(card, index) in interpretation.cards || []"
          :key="index"
          v-if="card?.interpretation?.detailed"
          class="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4"
        >
          <h4 class="font-semibold mb-2">{{ card.nameKr }}</h4>
          <div class="space-y-2 text-sm">
            <p v-if="card.interpretation.detailed">
              <span class="text-purple-400">상세:</span> {{ card.interpretation.detailed }}
            </p>
            <p v-if="card.interpretation.practical">
              <span class="text-blue-400">실용적 조언:</span> {{ card.interpretation.practical }}
            </p>
            <p v-if="card.interpretation.spiritual">
              <span class="text-indigo-400">영적 메시지:</span> {{ card.interpretation.spiritual }}
            </p>
            <p v-if="card.interpretation.timing">
              <span class="text-green-400">시기:</span> {{ card.interpretation.timing }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI 심층 분석 (프리미엄) -->
    <section v-if="isPremium && interpretation.deepInterpretation" class="mb-8">
      <h3 class="text-xl font-bold mb-4 flex items-center">
        <Icon name="mdi:brain" class="mr-2" />
        AI 심층 분석
      </h3>
      
      <!-- 다층적 해석 -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-3">다층적 해석</h4>
        <div class="space-y-4">
          <!-- 심리적 층위 -->
          <div v-if="interpretation.deepInterpretation.layers?.psychological" class="bg-blue-900/20 rounded-lg p-4">
            <h5 class="font-medium text-blue-400 mb-2">심리적 통찰</h5>
            <div class="space-y-2 text-sm">
              <p v-if="interpretation.deepInterpretation.layers.psychological.consciousPatterns?.length">
                <span class="text-blue-300">의식적 패턴:</span>
                {{ interpretation.deepInterpretation.layers.psychological.consciousPatterns.join(', ') }}
              </p>
              <p v-if="interpretation.deepInterpretation.layers.psychological.unconsciousPatterns?.length">
                <span class="text-blue-300">무의식적 패턴:</span>
                {{ interpretation.deepInterpretation.layers.psychological.unconsciousPatterns.join(', ') }}
              </p>
              <p v-if="interpretation.deepInterpretation.layers.psychological.growthOpportunities?.length">
                <span class="text-green-300">성장 기회:</span>
                {{ interpretation.deepInterpretation.layers.psychological.growthOpportunities.join(', ') }}
              </p>
            </div>
          </div>

          <!-- 영적 층위 -->
          <div v-if="interpretation.deepInterpretation.layers?.spiritual" class="bg-purple-900/20 rounded-lg p-4">
            <h5 class="font-medium text-purple-400 mb-2">영적 메시지</h5>
            <div class="space-y-2 text-sm">
              <p v-if="interpretation.deepInterpretation.layers.spiritual.soulLessons?.length">
                <span class="text-purple-300">영혼의 교훈:</span>
                {{ interpretation.deepInterpretation.layers.spiritual.soulLessons[0] }}
              </p>
              <p v-if="interpretation.deepInterpretation.layers.spiritual.spiritualGifts?.length">
                <span class="text-purple-300">영적 재능:</span>
                {{ interpretation.deepInterpretation.layers.spiritual.spiritualGifts.join(', ') }}
              </p>
              <p v-if="interpretation.deepInterpretation.layers.spiritual.chakraActivations?.length">
                <span class="text-purple-300">차크라 활성화:</span>
                {{ interpretation.deepInterpretation.layers.spiritual.chakraActivations.join(', ') }}
              </p>
            </div>
          </div>

          <!-- 그림자 작업 -->
          <div v-if="interpretation.deepInterpretation.layers?.shadow" class="bg-gray-900/20 rounded-lg p-4">
            <h5 class="font-medium text-gray-400 mb-2">그림자 작업</h5>
            <div class="space-y-2 text-sm">
              <div v-for="(aspect, idx) in interpretation.deepInterpretation.layers.shadow.hiddenAspects" :key="idx">
                <p class="text-gray-300">{{ aspect.card }}: {{ aspect.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 종합 통찰 -->
      <div v-if="interpretation.deepInterpretation.synthesis" class="mb-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-4">
        <h4 class="text-lg font-semibold mb-2">종합 통찰</h4>
        <p class="text-white/90 whitespace-pre-line">{{ interpretation.deepInterpretation.synthesis }}</p>
      </div>

      <!-- 핵심 인사이트 -->
      <div v-if="interpretation.deepInterpretation.keyInsights?.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3">핵심 인사이트</h4>
        <div class="grid gap-3">
          <div
            v-for="(insight, index) in interpretation.deepInterpretation.keyInsights"
            :key="index"
            class="flex items-center bg-white/5 rounded-lg p-3"
          >
            <span class="text-2xl mr-3">{{ getInsightEmoji(insight) }}</span>
            <span class="text-white/90">{{ insight }}</span>
          </div>
        </div>
      </div>

      <!-- 실행 계획 -->
      <div v-if="interpretation.deepInterpretation.actionPlan" class="mb-6">
        <h4 class="text-lg font-semibold mb-3">실행 계획</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-if="interpretation.deepInterpretation.actionPlan.immediate?.length" class="bg-red-900/20 rounded-lg p-4">
            <h5 class="font-medium text-red-400 mb-2">즉시 실행 (24-48시간)</h5>
            <ul class="space-y-1 text-sm">
              <li v-for="(action, idx) in interpretation.deepInterpretation.actionPlan.immediate" :key="idx" class="flex items-start">
                <span class="text-red-400 mr-2">•</span>
                <span>{{ action }}</span>
              </li>
            </ul>
          </div>
          <div v-if="interpretation.deepInterpretation.actionPlan.weekly?.length" class="bg-orange-900/20 rounded-lg p-4">
            <h5 class="font-medium text-orange-400 mb-2">주간 실행</h5>
            <ul class="space-y-1 text-sm">
              <li v-for="(action, idx) in interpretation.deepInterpretation.actionPlan.weekly" :key="idx" class="flex items-start">
                <span class="text-orange-400 mr-2">•</span>
                <span>{{ action }}</span>
              </li>
            </ul>
          </div>
          <div v-if="interpretation.deepInterpretation.actionPlan.monthly?.length" class="bg-yellow-900/20 rounded-lg p-4">
            <h5 class="font-medium text-yellow-400 mb-2">월간 실행</h5>
            <ul class="space-y-1 text-sm">
              <li v-for="(action, idx) in interpretation.deepInterpretation.actionPlan.monthly" :key="idx" class="flex items-start">
                <span class="text-yellow-400 mr-2">•</span>
                <span>{{ action }}</span>
              </li>
            </ul>
          </div>
          <div v-if="interpretation.deepInterpretation.actionPlan.quarterly?.length" class="bg-green-900/20 rounded-lg p-4">
            <h5 class="font-medium text-green-400 mb-2">분기별 실행</h5>
            <ul class="space-y-1 text-sm">
              <li v-for="(action, idx) in interpretation.deepInterpretation.actionPlan.quarterly" :key="idx" class="flex items-start">
                <span class="text-green-400 mr-2">•</span>
                <span>{{ action }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 확언 -->
      <div v-if="interpretation.deepInterpretation.affirmations?.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3">오늘의 확언</h4>
        <div class="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-lg p-4">
          <div class="space-y-2">
            <p
              v-for="(affirmation, index) in interpretation.deepInterpretation.affirmations"
              :key="index"
              class="text-center text-white/90 italic"
            >
              "{{ affirmation }}"
            </p>
          </div>
        </div>
      </div>

      <!-- 저널 프롬프트 -->
      <div v-if="interpretation.deepInterpretation.journalPrompts?.length" class="mb-6">
        <h4 class="text-lg font-semibold mb-3">성찰을 위한 질문</h4>
        <div class="bg-indigo-900/20 rounded-lg p-4">
          <ol class="space-y-2 text-sm">
            <li
              v-for="(prompt, index) in interpretation.deepInterpretation.journalPrompts.slice(0, 5)"
              :key="index"
              class="flex"
            >
              <span class="text-indigo-400 mr-2">{{ index + 1 }}.</span>
              <span>{{ prompt }}</span>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 확률적 분석 -->
    <section v-if="interpretation.probabilityAnalysis" class="mb-8">
      <h3 class="text-xl font-bold mb-4 flex items-center">
        <Icon name="mdi:chart-pie" class="mr-2" />
        결과 예측 분석
      </h3>
      <div class="bg-white/5 rounded-lg p-4">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-400">{{ interpretation.probabilityAnalysis.successProbability }}%</div>
            <div class="text-sm text-white/70">성공 확률</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-400">{{ interpretation.probabilityAnalysis.challengeProbability }}%</div>
            <div class="text-sm text-white/70">도전 확률</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-yellow-400">{{ interpretation.probabilityAnalysis.uncertaintyLevel }}%</div>
            <div class="text-sm text-white/70">불확실성</div>
          </div>
        </div>
        <div class="border-t border-white/10 pt-4">
          <p class="text-white/90">
            <Icon name="mdi:lightbulb" class="text-yellow-400 mr-2" />
            {{ interpretation.probabilityAnalysis.recommendation }}
          </p>
        </div>
      </div>
    </section>

    <!-- 시간대별 분석 (켈틱 크로스) -->
    <section v-if="interpretation.timelineAnalysis" class="mb-8">
      <h3 class="text-xl font-bold mb-4 flex items-center">
        <Icon name="mdi:timeline" class="mr-2" />
        시간의 흐름 분석
      </h3>
      <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4">
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-blue-400 mb-1">과거의 영향</h4>
            <p class="text-sm text-white/80">{{ interpretation.timelineAnalysis.past.energy }} 에너지가 지배적이었습니다.</p>
          </div>
          <div>
            <h4 class="font-medium text-purple-400 mb-1">현재 상황</h4>
            <p class="text-sm text-white/80">{{ interpretation.timelineAnalysis.present.energy }} 에너지가 작용하고 있습니다.</p>
          </div>
          <div>
            <h4 class="font-medium text-pink-400 mb-1">미래 전망</h4>
            <p class="text-sm text-white/80">{{ interpretation.timelineAnalysis.future.energy }} 에너지로 전환될 것으로 보입니다.</p>
          </div>
          <div class="border-t border-white/10 pt-3 mt-3">
            <p class="text-white/90">{{ interpretation.timelineAnalysis.flow }}</p>
            <p class="text-sm text-white/70 mt-1 italic">💡 {{ interpretation.timelineAnalysis.advice }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 개인화된 메시지 -->
    <section v-if="hasPersonalizedContent" class="mb-8">
      <h3 class="text-xl font-bold mb-4 flex items-center">
        <Icon name="mdi:account-heart" class="mr-2" />
        당신을 위한 특별한 메시지
      </h3>
      <div class="space-y-4">
        <div
          v-for="(card, index) in personalizedCards"
          :key="index"
          class="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4"
        >
          <h4 class="font-semibold mb-2">{{ card.nameKr }}</h4>
          <div class="space-y-2 text-sm">
            <p v-if="card.interpretation?.personalized?.personal">
              <span class="text-purple-400">개인 메시지:</span> {{ card.interpretation.personalized.personal }}
            </p>
            <p v-if="card.interpretation?.personalized?.zodiacConnection">
              <span class="text-blue-400">별자리 연결:</span> {{ card.interpretation.personalized.zodiacConnection }}
            </p>
            <p v-if="card.interpretation?.personalized?.numerological">
              <span class="text-green-400">수비학:</span> {{ card.interpretation.personalized.numerological }}
            </p>
            <p v-if="card.interpretation?.personalized?.seasonal">
              <span class="text-yellow-400">계절 메시지:</span> {{ card.interpretation.personalized.seasonal }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '~/store/user';
import Icon from '~/components/Icon.vue';

const props = defineProps({
  interpretation: {
    type: Object,
    required: true
  },
  topic: {
    type: String,
    required: true
  }
});

const userStore = useUserStore();

const isPremium = computed(() => userStore.isPremium);

const topicName = computed(() => {
  const topics = {
    general: '일반',
    love: '사랑',
    career: '직업',
    money: '재정',
    health: '건강'
  };
  return topics[props.topic] || '일반';
});

const showTopicInterpretation = computed(() => {
  return props.interpretation?.cards?.some(card => 
    card?.interpretation?.detailed || 
    card?.interpretation?.practical || 
    card?.interpretation?.spiritual
  ) || false;
});

const hasPersonalizedContent = computed(() => {
  return props.interpretation?.cards?.some(card => 
    card?.interpretation?.personalized
  ) || false;
});

const personalizedCards = computed(() => {
  return props.interpretation?.cards?.filter(card => 
    card?.interpretation?.personalized
  ) || [];
});

const getInsightEmoji = (insight) => {
  if (insight.includes('전환점')) return '🌟';
  if (insight.includes('감정')) return '💧';
  if (insight.includes('열정')) return '🔥';
  if (insight.includes('사고')) return '⚔️';
  if (insight.includes('현실')) return '🪙';
  if (insight.includes('내면')) return '🔄';
  return '✨';
};
</script>

<style scoped>
.deep-interpretation {
  @apply space-y-8;
}

.deep-interpretation h3 {
  @apply text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400;
}
</style>
