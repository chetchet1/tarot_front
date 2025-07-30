<template>
  <div class="enhanced-interpretation" v-if="interpretation">
    <!-- 헤더 -->
    <div class="interpretation-header">
      <h2>{{ topic }} {{ getSpreadName() }} 해석</h2>
      <p class="subtitle">더 깊이 있는 통찰과 조언</p>
    </div>

    <!-- 전체 메시지 -->
    <div class="overall-message-section" v-if="interpretation.overallMessage">
      <div class="section-header">
        <span class="icon">✨</span>
        <h3>전체 메시지</h3>
      </div>
      <div class="message-content">
        <p>{{ interpretation.overallMessage }}</p>
      </div>
    </div>

    <!-- 카드 조합 패턴 -->
    <div class="combination-patterns-section" v-if="interpretation.combinationPatterns?.length > 0">
      <div class="section-header">
        <span class="icon">🔮</span>
        <h3>카드 조합 분석</h3>
      </div>
      <div class="patterns-grid">
        <div 
          v-for="pattern in interpretation.combinationPatterns" 
          :key="pattern.pattern_name"
          class="pattern-card"
        >
          <h4>{{ pattern.pattern_name }}</h4>
          <p class="pattern-positions">
            위치: {{ pattern.positions.join(', ') }}번
          </p>
          <p class="pattern-meaning">
            {{ pattern.topicMeaning || pattern.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- 카드 시너지 -->
    <div class="synergies-section" v-if="interpretation.synergies?.length > 0">
      <div class="section-header">
        <span class="icon">⚡</span>
        <h3>카드 시너지</h3>
      </div>
      <div class="synergies-list">
        <div 
          v-for="(synergy, index) in interpretation.synergies" 
          :key="index"
          class="synergy-item"
        >
          <div class="synergy-cards">
            <span class="card-name">{{ synergy.card1Name }}</span>
            <span class="synergy-symbol">✦</span>
            <span class="card-name">{{ synergy.card2Name }}</span>
          </div>
          <p class="synergy-description">{{ synergy.description }}</p>
          <p class="synergy-positions">
            ({{ synergy.positions[0] }}번 & {{ synergy.positions[1] }}번 위치)
          </p>
        </div>
      </div>
    </div>

    <!-- 구체적 행동 제안 -->
    <div class="action-suggestions-section" v-if="interpretation.actionSuggestions?.length > 0">
      <div class="section-header">
        <span class="icon">💫</span>
        <h3>구체적 조언</h3>
      </div>
      <div class="suggestions-grid">
        <div 
          v-for="(suggestion, index) in interpretation.actionSuggestions" 
          :key="index"
          class="suggestion-card"
        >
          <div class="suggestion-header">
            <span class="position-badge">{{ suggestion.position }}번</span>
            <span class="card-name">{{ suggestion.cardName }}</span>
          </div>
          <p class="suggestion-action">{{ suggestion.action }}</p>
          <p class="suggestion-context" v-if="suggestion.context">
            {{ suggestion.context }}
          </p>
        </div>
      </div>
    </div>

    <!-- 주제별 위치 해석 (확장 가능) -->
    <div class="position-meanings-section" v-if="showPositionMeanings && interpretation.positionMeanings?.length > 0">
      <div class="section-header" @click="togglePositionMeanings">
        <span class="icon">📍</span>
        <h3>위치별 상세 해석</h3>
        <span class="toggle-icon" :class="{ expanded: expandedPositionMeanings }">
          ▼
        </span>
      </div>
      <transition name="expand">
        <div v-if="expandedPositionMeanings" class="position-meanings-grid">
          <div 
            v-for="meaning in interpretation.positionMeanings" 
            :key="meaning.position"
            class="position-meaning-card"
          >
            <h4>{{ meaning.position }}번 위치</h4>
            <p>{{ meaning.meaning }}</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  interpretation: any;
  topic: string;
  showPositionMeanings?: boolean;
  spreadId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showPositionMeanings: false,
  spreadId: 'celtic_cross'
});

const expandedPositionMeanings = ref(false);

const togglePositionMeanings = () => {
  expandedPositionMeanings.value = !expandedPositionMeanings.value;
};

const getSpreadName = () => {
  switch (props.spreadId) {
    case 'celtic_cross':
      return '켈틱 크로스';
    case 'seven_star':
      return '세븐 스타';
    case 'cup_of_relationship':
      return '컵 오브 릴레이션십';
    default:
      return '타로';
  }
};
</script>

<style scoped>
.enhanced-interpretation {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 헤더 */
.interpretation-header {
  text-align: center;
  margin-bottom: 30px;
}

.interpretation-header h2 {
  font-size: 24px;
  color: #A855F7;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

/* 섹션 공통 스타일 */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  cursor: default;
}

.section-header .icon {
  font-size: 24px;
}

.section-header h3 {
  font-size: 18px;
  color: white;
  margin: 0;
}

.toggle-icon {
  margin-left: auto;
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.6);
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

/* 전체 메시지 섹션 */
.overall-message-section {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
}

.message-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 15px;
}

.message-content p {
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  white-space: pre-line;
}

/* 카드 조합 패턴 */
.combination-patterns-section {
  margin-bottom: 25px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.pattern-card {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
}

.pattern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

.pattern-card h4 {
  color: #A855F7;
  font-size: 16px;
  margin-bottom: 8px;
}

.pattern-positions {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.pattern-meaning {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

/* 카드 시너지 */
.synergies-section {
  margin-bottom: 25px;
}

.synergies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.synergy-item {
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 12px;
  padding: 15px;
}

.synergy-cards {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.card-name {
  font-weight: 600;
  color: #7C3AED;
}

.synergy-symbol {
  color: #FFD700;
  font-size: 20px;
}

.synergy-description {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.synergy-positions {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 구체적 행동 제안 */
.action-suggestions-section {
  margin-bottom: 25px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.suggestion-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.position-badge {
  background: rgba(255, 215, 0, 0.3);
  color: #FFD700;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.suggestion-header .card-name {
  font-size: 14px;
  color: #FFA500;
  font-weight: 600;
}

.suggestion-action {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 5px;
  font-weight: 500;
}

.suggestion-context {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* 위치별 상세 해석 */
.position-meanings-section {
  margin-bottom: 25px;
}

.position-meanings-section .section-header {
  cursor: pointer;
}

.position-meanings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.position-meaning-card {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 12px;
}

.position-meaning-card h4 {
  font-size: 14px;
  color: #818CF8;
  margin-bottom: 5px;
}

.position-meaning-card p {
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
}

/* 애니메이션 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .enhanced-interpretation {
    padding: 15px;
  }

  .interpretation-header h2 {
    font-size: 20px;
  }

  .section-header h3 {
    font-size: 16px;
  }

  .patterns-grid,
  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .position-meanings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
