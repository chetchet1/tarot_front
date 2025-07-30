<template>
  <div class="interpretation-display" v-if="interpretation">
    <!-- 전체 메시지 섹션 -->
    <div class="overall-message-section" v-if="interpretation.overallMessage">
      <h3 class="section-title">
        <span class="icon">✨</span> 전체 메시지
      </h3>
      <div class="message-card overall-message">
        <p>{{ interpretation.overallMessage }}</p>
      </div>
    </div>

    <!-- 카드 조합 패턴 섹션 -->
    <div class="patterns-section" v-if="interpretation.patterns && interpretation.patterns.length > 0">
      <h3 class="section-title">
        <span class="icon">🔮</span> 주요 패턴 분석
      </h3>
      <div class="patterns-grid">
        <div 
          v-for="(pattern, index) in interpretation.patterns" 
          :key="index"
          class="pattern-card"
          :class="`pattern-${pattern.type}`"
        >
          <div class="pattern-header">
            <span class="pattern-icon">{{ getPatternIcon(pattern.type) }}</span>
            <h4>{{ pattern.name }}</h4>
          </div>
          <p class="pattern-description">{{ pattern.description }}</p>
          <div class="pattern-cards">
            <span 
              v-for="(card, idx) in pattern.cards" 
              :key="idx"
              class="card-badge"
            >
              {{ card }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 구체적 행동 제안 섹션 -->
    <div class="suggestions-section" v-if="interpretation.suggestions && interpretation.suggestions.length > 0">
      <h3 class="section-title">
        <span class="icon">💡</span> 구체적 행동 제안
      </h3>
      <div class="suggestions-list">
        <transition-group name="suggestion-list" tag="div">
          <div 
            v-for="(suggestion, index) in interpretation.suggestions" 
            :key="`suggestion-${index}`"
            class="suggestion-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="suggestion-number">{{ index + 1 }}</div>
            <div class="suggestion-content">
              <h4>{{ suggestion.action }}</h4>
              <p>{{ suggestion.context }}</p>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 카드 시너지 섹션 -->
    <div class="synergies-section" v-if="interpretation.synergies && interpretation.synergies.length > 0">
      <h3 class="section-title">
        <span class="icon">🌟</span> 카드 시너지
      </h3>
      <div class="synergies-grid">
        <div 
          v-for="(synergy, index) in interpretation.synergies" 
          :key="index"
          class="synergy-card"
          :class="`synergy-${synergy.type}`"
        >
          <div class="synergy-header">
            <span class="synergy-type">{{ getSynergyTypeName(synergy.type) }}</span>
          </div>
          <div class="synergy-cards">
            <span class="card-name">{{ synergy.card1 }}</span>
            <span class="synergy-symbol">↔️</span>
            <span class="card-name">{{ synergy.card2 }}</span>
          </div>
          <p class="synergy-description">{{ synergy.description }}</p>
        </div>
      </div>
    </div>

    <!-- 특별 메시지 섹션 (주제별) -->
    <div class="special-message-section" v-if="interpretation.specialMessage">
      <div class="special-message-card">
        <h3>
          <span class="icon">{{ getTopicIcon(topic) }}</span> 
          {{ getTopicTitle(topic) }}
        </h3>
        <div class="special-message-content">
          <p>{{ interpretation.specialMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  interpretation: any;
  topic: string;
}

const props = defineProps<Props>();

// 패턴 타입별 아이콘
const getPatternIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'self_perception_gap': '👤',
    'relationship_flow': '💑',
    'obstacle_resolution': '🚧',
    'resource_management': '💰',
    'energy_flow': '⚡',
    'decision_making': '⚖️',
    'communication': '💬',
    'growth_pattern': '🌱'
  };
  return icons[type] || '📊';
};

// 시너지 타입 이름
const getSynergyTypeName = (type: string): string => {
  const names: Record<string, string> = {
    'harmonious': '조화',
    'challenging': '도전',
    'transformative': '변화',
    'supportive': '지원',
    'dynamic': '역동'
  };
  return names[type] || type;
};

// 주제별 아이콘
const getTopicIcon = (topic: string): string => {
  const icons: Record<string, string> = {
    'love': '💕',
    'career': '💼',
    'money': '💰',
    'general': '🔮'
  };
  return icons[topic] || '✨';
};

// 주제별 타이틀
const getTopicTitle = (topic: string): string => {
  const titles: Record<string, string> = {
    'love': '연애운 특별 메시지',
    'career': '직업운 특별 메시지',
    'money': '금전운 특별 메시지',
    'general': '종합 특별 메시지'
  };
  return titles[topic] || '특별 메시지';
};
</script>

<style scoped>
.interpretation-display {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 섹션 타이틀 */
.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #A855F7;
}

.section-title .icon {
  font-size: 24px;
}

/* 전체 메시지 */
.overall-message-section {
  margin-bottom: 32px;
}

.message-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.overall-message {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.message-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

/* 패턴 섹션 */
.patterns-section {
  margin-bottom: 32px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.pattern-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.pattern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.3);
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pattern-icon {
  font-size: 24px;
}

.pattern-header h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #A855F7;
}

.pattern-description {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.pattern-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-badge {
  background: rgba(168, 85, 247, 0.2);
  color: #A855F7;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 행동 제안 섹션 */
.suggestions-section {
  margin-bottom: 32px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  animation: slideIn 0.5s ease-out both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.suggestion-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.suggestion-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #FFD700;
}

.suggestion-content p {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 시너지 섹션 */
.synergies-section {
  margin-bottom: 32px;
}

.synergies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.synergy-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.synergy-header {
  margin-bottom: 12px;
}

.synergy-type {
  background: rgba(168, 85, 247, 0.2);
  color: #A855F7;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.synergy-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-name {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.synergy-symbol {
  font-size: 20px;
}

.synergy-description {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
}

/* 특별 메시지 섹션 */
.special-message-section {
  margin-top: 32px;
}

.special-message-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.special-message-card h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.special-message-content {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

/* 타입별 색상 변형 */
.synergy-harmonious {
  border-color: rgba(34, 197, 94, 0.4);
}

.synergy-harmonious .synergy-type {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.synergy-challenging {
  border-color: rgba(239, 68, 68, 0.4);
}

.synergy-challenging .synergy-type {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.synergy-transformative {
  border-color: rgba(255, 215, 0, 0.4);
}

.synergy-transformative .synergy-type {
  background: rgba(255, 215, 0, 0.2);
  color: #FFD700;
}

/* 애니메이션 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .interpretation-display {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .patterns-grid,
  .synergies-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-item {
    flex-direction: column;
    text-align: center;
  }

  .suggestion-number {
    margin: 0 auto;
  }
}
</style>
</template>
