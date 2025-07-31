<template>
  <div class="reading-result">
    <header class="page-header">
      <button class="back-button" @click="goBack">← 뒤로</button>
      <h1>점괘 해석</h1>
    </header>

    <div class="container" v-if="reading">
      <!-- 커스텀 질문 표시 -->
      <section v-if="customQuestion" class="custom-question-section">
        <h2>📌 당신의 질문</h2>
        <div class="custom-question-content">
          <p>{{ customQuestion }}</p>
        </div>
      </section>

      <!-- AI 해석 (프리미엄 사용자 + 켈틱 크로스) -->
      <section v-if="userStore.isPremium && reading.spreadId === 'celtic_cross' && reading.aiInterpretation" class="ai-interpretation-section">
        <h2>🤖 AI 타로 해석</h2>
        <div class="ai-interpretation-content">
          <p>{{ reading.aiInterpretation }}</p>
        </div>
        
        <!-- 평점 시스템 -->
        <div class="rating-section" v-if="reading.aiInterpretationId && !userRating">
          <h4>이 해석이 도움이 되셨나요?</h4>
          <div class="star-rating">
            <button 
              v-for="i in 5" 
              :key="i"
              @click="submitRating(i)"
              class="star-btn"
              :class="{ active: hoverRating >= i || selectedRating >= i }"
              @mouseenter="hoverRating = i"
              @mouseleave="hoverRating = 0"
            >
              ⭐
            </button>
          </div>
          <p class="rating-hint">{{ getRatingHint() }}</p>
        </div>
        
        <!-- 평점 제출 후 메시지 -->
        <div class="rating-submitted" v-if="userRating">
          <p>✅ 소중한 피드백 감사합니다!</p>
        </div>
      </section>

      <!-- 카드 해석 (AI 해석이 없거나 프리미엄이 아닌 경우) -->
      <section v-if="!userStore.isPremium || reading.spreadId !== 'celtic_cross' || !reading.aiInterpretation" class="cards-section">
        <h2>📜 카드 해석</h2>
        
        <!-- 켈틱 크로스 특별 레이아웃 -->
        <div v-if="reading.spreadId === 'celtic_cross'" class="celtic-cross-layout">
          <div class="cards-container">
            <!-- Position 1: 현재내면 (중앙) -->
            <div class="card-position position-1" @click="showCardDetail(0)">
              <div class="card-mini" :class="reading.cards[0].orientation">
                <img :src="getCardImageUrl(reading.cards[0])" 
                     :alt="reading.cards[0].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[0].orientation === 'reversed' }" />
                <span class="position-label">1</span>
              </div>
            </div>
            
            <!-- Position 2: 현재외부 (중앙, 위에 겹침) -->
            <div class="card-position position-2" @click="showCardDetail(1)">
              <div class="card-mini" :class="reading.cards[1].orientation">
                <img :src="getCardImageUrl(reading.cards[1])" 
                     :alt="reading.cards[1].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[1].orientation === 'reversed' }" />
                <span class="position-label">2</span>
              </div>
            </div>
            
            <!-- Position 3: 근본 (아래) -->
            <div class="card-position position-3" @click="showCardDetail(2)">
              <div class="card-mini" :class="reading.cards[2].orientation">
                <img :src="getCardImageUrl(reading.cards[2])" 
                     :alt="reading.cards[2].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[2].orientation === 'reversed' }" />
                <span class="position-label">3</span>
              </div>
            </div>
            
            <!-- Position 4: 과거 (왼쪽) -->
            <div class="card-position position-4" @click="showCardDetail(3)">
              <div class="card-mini" :class="reading.cards[3].orientation">
                <img :src="getCardImageUrl(reading.cards[3])" 
                     :alt="reading.cards[3].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[3].orientation === 'reversed' }" />
                <span class="position-label">4</span>
              </div>
            </div>
            
            <!-- Position 5: 드러나는 모습 (위) -->
            <div class="card-position position-5" @click="showCardDetail(4)">
              <div class="card-mini" :class="reading.cards[4].orientation">
                <img :src="getCardImageUrl(reading.cards[4])" 
                     :alt="reading.cards[4].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[4].orientation === 'reversed' }" />
                <span class="position-label">5</span>
              </div>
            </div>
            
            <!-- Position 6: 미래 (오른쪽) -->
            <div class="card-position position-6" @click="showCardDetail(5)">
              <div class="card-mini" :class="reading.cards[5].orientation">
                <img :src="getCardImageUrl(reading.cards[5])" 
                     :alt="reading.cards[5].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[5].orientation === 'reversed' }" />
                <span class="position-label">6</span>
              </div>
            </div>
            
            <!-- Position 7: 내가보는나 -->
            <div class="card-position position-7" @click="showCardDetail(6)">
              <div class="card-mini" :class="reading.cards[6].orientation">
                <img :src="getCardImageUrl(reading.cards[6])" 
                     :alt="reading.cards[6].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[6].orientation === 'reversed' }" />
                <span class="position-label">7</span>
              </div>
            </div>
            
            <!-- Position 8: 남이보는나 -->
            <div class="card-position position-8" @click="showCardDetail(7)">
              <div class="card-mini" :class="reading.cards[7].orientation">
                <img :src="getCardImageUrl(reading.cards[7])" 
                     :alt="reading.cards[7].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[7].orientation === 'reversed' }" />
                <span class="position-label">8</span>
              </div>
            </div>
            
            <!-- Position 9: 예상하는 결과 -->
            <div class="card-position position-9" @click="showCardDetail(8)">
              <div class="card-mini" :class="reading.cards[8].orientation">
                <img :src="getCardImageUrl(reading.cards[8])" 
                     :alt="reading.cards[8].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[8].orientation === 'reversed' }" />
                <span class="position-label">9</span>
              </div>
            </div>
            
            <!-- Position 10: 실제 결과 -->
            <div class="card-position position-10" @click="showCardDetail(9)">
              <div class="card-mini" :class="reading.cards[9].orientation">
                <img :src="getCardImageUrl(reading.cards[9])" 
                     :alt="reading.cards[9].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[9].orientation === 'reversed' }" />
                <span class="position-label">10</span>
              </div>
            </div>
          </div>
          
          <!-- 선택된 카드 상세 정보 -->
          <div v-if="selectedCardIndex !== null" class="selected-card-detail">
            <div class="card-detail-header">
              <h3>{{ reading.cards[selectedCardIndex].position.name }}</h3>
              <button @click="selectedCardIndex = null" class="close-detail">×</button>
            </div>
            <div class="card-detail-content">
              <div class="card-image">
                <img :src="getCardImageUrl(reading.cards[selectedCardIndex])" 
                     :alt="reading.cards[selectedCardIndex].nameKr" 
                     @error="onImageError" 
                     :class="{ reversed: reading.cards[selectedCardIndex].orientation === 'reversed' }" />
              </div>
              <h4>{{ reading.cards[selectedCardIndex].nameKr || reading.cards[selectedCardIndex].name }}</h4>
              <span class="card-orientation" :class="reading.cards[selectedCardIndex].orientation">
                {{ reading.cards[selectedCardIndex].orientation === 'upright' ? '정방향' : '역방향' }}
              </span>
              <p class="position-meaning">
                <strong>포지션 의미:</strong> {{ reading.cards[selectedCardIndex].position.description }}
              </p>
              <p class="card-meaning">{{ getCardMeaning(reading.cards[selectedCardIndex]) }}</p>
              <p class="card-advice" v-if="reading.cards[selectedCardIndex].interpretation?.advice">
                <strong>조언:</strong> {{ reading.cards[selectedCardIndex].interpretation.advice }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- 기존 카드 그리드 (다른 스프레드) -->
        <div v-else class="cards-grid">
          <div 
            v-for="(card, index) in reading.cards" 
            :key="index"
            class="card-result"
          >
            <div class="card-header">
              <h3>{{ card.position.name }}</h3>
              <span class="card-orientation" :class="card.orientation">
                {{ card.orientation === 'upright' ? '정방향' : '역방향' }}
              </span>
            </div>
            
            <div class="card-content">
              <div class="card-image">
                <img :src="getCardImageUrl(card)" :alt="card.nameKr || card.name" @error="onImageError" 
                     :class="{ reversed: card.orientation === 'reversed' }" />
              </div>
              
              <div class="card-info">
              <h4>{{ card?.nameKr || card?.name || '알 수 없는 카드' }}</h4>
              <p class="card-meaning">{{ getCardMeaning(card) }}</p>
              <p class="card-advice" v-if="card?.interpretation?.advice">
              <strong>조언:</strong> {{ card.interpretation.advice }}
              </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 프리미엄 사용자를 위한 고급 분석 -->
      <section v-if="userStore.isPremium && reading.spreadId === 'celtic_cross' && (reading.cardCombinations || reading.deepInterpretation || reading.probabilityAnalysis || reading.cardPattern)" class="premium-analysis">
        <h2>🌟 프리미엄 AI 심층 분석</h2>
        
        <!-- 카드 조합 분석 -->
        <div v-if="reading.cardCombinations?.length > 0" class="analysis-section card-combinations">
          <h3>🔗 카드 조합의 의미</h3>
          <div class="combination-list">
            <div v-for="(combo, index) in reading.cardCombinations" :key="index" class="combination-item">
              <div class="combo-header">
                <span class="type-badge" :class="combo.type">
                  {{ combo.type === 'special' ? '✨ 특별한 조합' : 
                     combo.type === 'suit' ? '🎴 수트 조합' : 
                     combo.type === 'number' ? '🔢 숫자 관계' : 
                     combo.type === 'element' ? '🌟 원소 조합' : '🔗 조합' }}
                </span>
              </div>
              <p class="combo-meaning">{{ combo.meaning }}</p>
              <p v-if="combo.advice" class="combo-advice">
                <span class="advice-icon">💡</span> {{ combo.advice }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- 카드 패턴 분석 -->
        <div v-if="reading.cardPattern" class="analysis-section card-pattern">
          <h3>🎯 전체 카드 패턴</h3>
          <div class="pattern-content">
            <p class="pattern-name">{{ reading.cardPattern.name }}</p>
            <p class="pattern-description">{{ reading.cardPattern.description }}</p>
            <p v-if="reading.cardPattern.implication" class="pattern-implication">
              <strong>의미:</strong> {{ reading.cardPattern.implication }}
            </p>
          </div>
        </div>
        
        <!-- 확률적 분석 -->
        <div v-if="reading.probabilityAnalysis" class="analysis-section probability-analysis">
          <h3>📊 결과 예측 분석</h3>
          <div class="probability-content">
            <div class="probability-grid">
              <div class="probability-item success">
                <div class="probability-value">{{ reading.probabilityAnalysis.successProbability }}%</div>
                <div class="probability-label">성공 확률</div>
                <div class="probability-reason" v-if="reading.probabilityAnalysis.successReason">
                  {{ reading.probabilityAnalysis.successReason }}
                </div>
              </div>
              <div class="probability-item challenge">
                <div class="probability-value">{{ reading.probabilityAnalysis.challengeProbability }}%</div>
                <div class="probability-label">도전 확률</div>
                <div class="probability-reason" v-if="reading.probabilityAnalysis.challengeReason">
                  {{ reading.probabilityAnalysis.challengeReason }}
                </div>
              </div>
              <div class="probability-item uncertainty">
                <div class="probability-value">{{ reading.probabilityAnalysis.uncertaintyLevel }}%</div>
                <div class="probability-label">불확실성</div>
                <div class="probability-reason" v-if="reading.probabilityAnalysis.uncertaintyReason">
                  {{ reading.probabilityAnalysis.uncertaintyReason }}
                </div>
              </div>
            </div>
            <div class="probability-recommendation">
              <span class="rec-icon">💡</span>
              {{ reading.probabilityAnalysis.recommendation }}
            </div>
          </div>
        </div>
        
        <!-- AI 심층 해석 -->
        <div v-if="reading.deepInterpretation" class="analysis-section deep-interpretation">
          <h3>🧠 AI 심층 해석</h3>
          
          <!-- 다층적 분석 -->
          <div v-if="reading.deepInterpretation.layers" class="layers-analysis">
            <h4>다층적 분석</h4>
            
            <!-- 심리적 층위 -->
            <div v-if="reading.deepInterpretation.layers.psychological" class="layer-item psychological">
              <h5>심리적 통찰</h5>
              <div class="layer-content">
                <p v-if="reading.deepInterpretation.layers.psychological.consciousPatterns?.length">
                  <strong>의식적 패턴:</strong> {{ reading.deepInterpretation.layers.psychological.consciousPatterns.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.psychological.unconsciousPatterns?.length">
                  <strong>무의식적 패턴:</strong> {{ reading.deepInterpretation.layers.psychological.unconsciousPatterns.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.psychological.growthOpportunities?.length">
                  <strong>성장 기회:</strong> {{ reading.deepInterpretation.layers.psychological.growthOpportunities.join(', ') }}
                </p>
              </div>
            </div>
            
            <!-- 영적 층위 -->
            <div v-if="reading.deepInterpretation.layers.spiritual" class="layer-item spiritual">
              <h5>영적 메시지</h5>
              <div class="layer-content">
                <p v-if="reading.deepInterpretation.layers.spiritual.soulLessons?.length">
                  <strong>영혼의 교훈:</strong> {{ reading.deepInterpretation.layers.spiritual.soulLessons.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.spiritual.spiritualGifts?.length">
                  <strong>영적 재능:</strong> {{ reading.deepInterpretation.layers.spiritual.spiritualGifts.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.spiritual.chakraActivations?.length">
                  <strong>차크라 활성화:</strong> {{ reading.deepInterpretation.layers.spiritual.chakraActivations.join(', ') }}
                </p>
              </div>
            </div>
            
            <!-- 그림자 작업 -->
            <div v-if="reading.deepInterpretation.layers.shadow" class="layer-item shadow">
              <h5>그림자 작업</h5>
              <div class="layer-content">
                <div v-for="(aspect, idx) in reading.deepInterpretation.layers.shadow.hiddenAspects" :key="idx" class="shadow-aspect">
                  <p><strong>{{ aspect.card }}:</strong> {{ aspect.message }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 종합 통찰 -->
          <div v-if="reading.deepInterpretation.synthesis" class="synthesis">
            <h4>종합 통찰</h4>
            <p>{{ reading.deepInterpretation.synthesis }}</p>
          </div>
          
          <!-- 핵심 인사이트 -->
          <div v-if="reading.deepInterpretation.keyInsights?.length" class="key-insights">
            <h4>핵심 인사이트</h4>
            <div class="insights-grid">
              <div v-for="(insight, index) in reading.deepInterpretation.keyInsights" :key="index" class="insight-item">
                <span class="insight-emoji">{{ getInsightEmoji(insight) }}</span>
                <span class="insight-text">{{ insight }}</span>
              </div>
            </div>
          </div>
          
          <!-- 실행 계획 -->
          <div v-if="reading.deepInterpretation.actionPlan" class="action-plan">
            <h4>실행 계획</h4>
            <div class="action-timeline">
              <div v-if="reading.deepInterpretation.actionPlan.immediate?.length" class="action-phase immediate">
                <h5>즉시 실행 (24-48시간)</h5>
                <ul>
                  <li v-for="(action, idx) in reading.deepInterpretation.actionPlan.immediate" :key="idx">
                    {{ action }}
                  </li>
                </ul>
              </div>
              <div v-if="reading.deepInterpretation.actionPlan.weekly?.length" class="action-phase weekly">
                <h5>주간 실행</h5>
                <ul>
                  <li v-for="(action, idx) in reading.deepInterpretation.actionPlan.weekly" :key="idx">
                    {{ action }}
                  </li>
                </ul>
              </div>
              <div v-if="reading.deepInterpretation.actionPlan.monthly?.length" class="action-phase monthly">
                <h5>월간 실행</h5>
                <ul>
                  <li v-for="(action, idx) in reading.deepInterpretation.actionPlan.monthly" :key="idx">
                    {{ action }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- 확언 -->
          <div v-if="reading.deepInterpretation.affirmations?.length" class="affirmations">
            <h4>오늘의 확언</h4>
            <div class="affirmation-list">
              <p v-for="(affirmation, index) in reading.deepInterpretation.affirmations" :key="index" class="affirmation-item">
                "{{ affirmation }}"
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 향상된 해석 (프리미엄) -->
      <EnhancedInterpretation
        v-if="userStore.isPremium && reading.spreadId === 'celtic_cross' && (reading.enhancedInterpretation || reading.improvedInterpretation)"
        :interpretation="reading.enhancedInterpretation || reading.improvedInterpretation"
        :topic="reading.topic || 'general'"
        :show-position-meanings="true"
        :spread-id="reading.spreadId"
      />

      <!-- 켈틱 크로스 전용 해석 섹션 (프리미엄) -->
      <section v-if="userStore.isPremium && reading.spreadId === 'celtic_cross' && reading.premiumInsights" class="celtic-cross-insights">
        <h2>🔮 켈틱 크로스 심층 해석</h2>
        
        <!-- 카드 관계 분석 -->
        <div v-if="reading.premiumInsights.relationships" class="insight-card relationships">
          <h3>🔗 카드 간의 관계</h3>
          <ul>
            <li v-for="(relationship, index) in reading.premiumInsights.relationships" :key="index">
              {{ relationship }}
            </li>
          </ul>
        </div>
        
        <!-- 원소 분석 -->
        <div v-if="reading.premiumInsights.elementAnalysis && reading.premiumInsights.elementAnalysis.length > 0" class="insight-card elements">
          <h3>🌟 원소의 균형</h3>
          <ul>
            <li v-for="(element, index) in reading.premiumInsights.elementAnalysis" :key="index">
              {{ element }}
            </li>
          </ul>
        </div>
        
        <!-- 시간의 흐름 분석 -->
        <div v-if="reading.premiumInsights.timelineAnalysis" class="insight-card timeline">
          <h3>⏳ 시간의 흐름</h3>
          <div v-if="typeof reading.premiumInsights.timelineAnalysis === 'object'">
            <p v-if="reading.premiumInsights.timelineAnalysis.past">
              <strong>과거:</strong> {{ reading.premiumInsights.timelineAnalysis.past.energy || reading.premiumInsights.timelineAnalysis.past }}
            </p>
            <p v-if="reading.premiumInsights.timelineAnalysis.present">
              <strong>현재:</strong> {{ reading.premiumInsights.timelineAnalysis.present.energy || reading.premiumInsights.timelineAnalysis.present }}
            </p>
            <p v-if="reading.premiumInsights.timelineAnalysis.future">
              <strong>미래:</strong> {{ reading.premiumInsights.timelineAnalysis.future.energy || reading.premiumInsights.timelineAnalysis.future }}
            </p>
            <p v-if="reading.premiumInsights.timelineAnalysis.flow">{{ reading.premiumInsights.timelineAnalysis.flow }}</p>
            <p v-if="reading.premiumInsights.timelineAnalysis.advice" class="text-sm italic">💡 {{ reading.premiumInsights.timelineAnalysis.advice }}</p>
          </div>
          <p v-else>{{ reading.premiumInsights.timelineAnalysis }}</p>
        </div>
        
        <!-- 핵심 키워드 -->
        <div v-if="reading.premiumInsights.keywords" class="insight-card keywords">
          <h3>🔑 핵심 키워드</h3>
          <div class="keyword-tags">
            <span v-for="keyword in reading.premiumInsights.keywords" :key="keyword" class="keyword-tag">
              {{ keyword }}
            </span>
          </div>
        </div>
      </section>
      <!-- 기타 스프레드를 위한 프리미엄 분석 (seven_star, cup_of_relationship) -->
      <section v-if="userStore.isPremium && reading.spreadId !== 'celtic_cross' && (reading.cardCombinations || reading.deepInterpretation || reading.probabilityAnalysis || reading.cardPattern)" class="premium-analysis">
        <h2>🌟 프리미엄 AI 심층 분석</h2>
        
        <!-- 카드 조합 분석 -->
        <div v-if="reading.cardCombinations?.length > 0" class="analysis-section card-combinations">
          <h3>🔗 카드 조합의 의미</h3>
          <div class="combination-list">
            <div v-for="(combo, index) in reading.cardCombinations" :key="index" class="combination-item">
              <div class="combo-header">
                <span class="type-badge" :class="combo.type">
                  {{ combo.type === 'special' ? '✨ 특별한 조합' : 
                     combo.type === 'suit' ? '🎴 수트 조합' : 
                     combo.type === 'number' ? '🔢 숫자 관계' : 
                     combo.type === 'element' ? '🌟 원소 조합' : '🔗 조합' }}
                </span>
              </div>
              <p class="combo-meaning">{{ combo.meaning }}</p>
              <p v-if="combo.advice" class="combo-advice">
                <span class="advice-icon">💡</span> {{ combo.advice }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- 카드 패턴 분석 -->
        <div v-if="reading.cardPattern" class="analysis-section card-pattern">
          <h3>🎯 전체 카드 패턴</h3>
          <div class="pattern-content">
            <p class="pattern-name">{{ reading.cardPattern.name }}</p>
            <p class="pattern-description">{{ reading.cardPattern.description }}</p>
            <p v-if="reading.cardPattern.implication" class="pattern-implication">
              <strong>의미:</strong> {{ reading.cardPattern.implication }}
            </p>
          </div>
        </div>
        
        <!-- 확률적 분석 -->
        <div v-if="reading.probabilityAnalysis" class="analysis-section probability-analysis">
          <h3>📊 결과 예측 분석</h3>
          <div class="probability-content">
            <div class="probability-grid">
              <div class="probability-item success">
                <div class="probability-value">{{ reading.probabilityAnalysis.successProbability }}%</div>
                <div class="probability-label">성공 확률</div>
              </div>
              <div class="probability-item challenge">
                <div class="probability-value">{{ reading.probabilityAnalysis.challengeProbability }}%</div>
                <div class="probability-label">도전 확률</div>
              </div>
              <div class="probability-item uncertainty">
                <div class="probability-value">{{ reading.probabilityAnalysis.uncertaintyLevel }}%</div>
                <div class="probability-label">불확실성</div>
              </div>
            </div>
            <div class="probability-recommendation">
              <span class="rec-icon">💡</span>
              {{ reading.probabilityAnalysis.recommendation }}
            </div>
          </div>
        </div>
        
        <!-- AI 심층 해석 -->
        <div v-if="reading.deepInterpretation" class="analysis-section deep-interpretation">
          <h3>🧠 AI 심층 해석</h3>
          
          <!-- 다층적 분석 -->
          <div v-if="reading.deepInterpretation.layers" class="layers-analysis">
            <h4>다층적 분석</h4>
            
            <!-- 심리적 층위 -->
            <div v-if="reading.deepInterpretation.layers.psychological" class="layer-item psychological">
              <h5>심리적 통찰</h5>
              <div class="layer-content">
                <p v-if="reading.deepInterpretation.layers.psychological.consciousPatterns?.length">
                  <strong>의식적 패턴:</strong> {{ reading.deepInterpretation.layers.psychological.consciousPatterns.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.psychological.unconsciousPatterns?.length">
                  <strong>무의식적 패턴:</strong> {{ reading.deepInterpretation.layers.psychological.unconsciousPatterns.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.psychological.growthOpportunities?.length">
                  <strong>성장 기회:</strong> {{ reading.deepInterpretation.layers.psychological.growthOpportunities.join(', ') }}
                </p>
              </div>
            </div>
            
            <!-- 영적 층위 -->
            <div v-if="reading.deepInterpretation.layers.spiritual" class="layer-item spiritual">
              <h5>영적 메시지</h5>
              <div class="layer-content">
                <p v-if="reading.deepInterpretation.layers.spiritual.soulLessons?.length">
                  <strong>영혼의 교훈:</strong> {{ reading.deepInterpretation.layers.spiritual.soulLessons.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.spiritual.spiritualGifts?.length">
                  <strong>영적 재능:</strong> {{ reading.deepInterpretation.layers.spiritual.spiritualGifts.join(', ') }}
                </p>
                <p v-if="reading.deepInterpretation.layers.spiritual.chakraActivations?.length">
                  <strong>차크라 활성화:</strong> {{ reading.deepInterpretation.layers.spiritual.chakraActivations.join(', ') }}
                </p>
              </div>
            </div>
            
            <!-- 그림자 작업 -->
            <div v-if="reading.deepInterpretation.layers.shadow" class="layer-item shadow">
              <h5>그림자 작업</h5>
              <div class="layer-content">
                <div v-for="(aspect, idx) in reading.deepInterpretation.layers.shadow.hiddenAspects" :key="idx" class="shadow-aspect">
                  <p><strong>{{ aspect.card }}:</strong> {{ aspect.message }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 종합 통찰 -->
          <div v-if="reading.deepInterpretation.synthesis" class="synthesis">
            <h4>종합 통찰</h4>
            <p>{{ reading.deepInterpretation.synthesis }}</p>
          </div>
          
          <!-- 핵심 인사이트 -->
          <div v-if="reading.deepInterpretation.keyInsights?.length" class="key-insights">
            <h4>핵심 인사이트</h4>
            <div class="insights-grid">
              <div v-for="(insight, index) in reading.deepInterpretation.keyInsights" :key="index" class="insight-item">
                <span class="insight-emoji">{{ getInsightEmoji(insight) }}</span>
                <span class="insight-text">{{ insight }}</span>
              </div>
            </div>
          </div>
          
          <!-- 실행 계획 -->
          <div v-if="reading.deepInterpretation.actionPlan" class="action-plan">
            <h4>실행 계획</h4>
            <div class="action-timeline">
              <div v-if="reading.deepInterpretation.actionPlan.immediate?.length" class="action-phase immediate">
                <h5>즉시 실행 (24-48시간)</h5>
                <ul>
                  <li v-for="(action, idx) in reading.deepInterpretation.actionPlan.immediate" :key="idx">
                    {{ action }}
                  </li>
                </ul>
              </div>
              <div v-if="reading.deepInterpretation.actionPlan.weekly?.length" class="action-phase weekly">
                <h5>주간 실행</h5>
                <ul>
                  <li v-for="(action, idx) in reading.deepInterpretation.actionPlan.weekly" :key="idx">
                    {{ action }}
                  </li>
                </ul>
              </div>
              <div v-if="reading.deepInterpretation.actionPlan.monthly?.length" class="action-phase monthly">
                <h5>월간 실행</h5>
                <ul>
                  <li v-for="(action, idx) in reading.deepInterpretation.actionPlan.monthly" :key="idx">
                    {{ action }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- 확언 -->
          <div v-if="reading.deepInterpretation.affirmations?.length" class="affirmations">
            <h4>오늘의 확언</h4>
            <div class="affirmation-list">
              <p v-for="(affirmation, index) in reading.deepInterpretation.affirmations" :key="index" class="affirmation-item">
                "{{ affirmation }}"
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 향상된 해석 (프리미엄 - seven_star, cup_of_relationship) -->
      <EnhancedInterpretation
        v-if="userStore.isPremium && (reading.spreadId === 'seven_star' || reading.spreadId === 'cup_of_relationship') && (reading.enhancedInterpretation || reading.improvedInterpretation)"
        :interpretation="reading.enhancedInterpretation || reading.improvedInterpretation"
        :topic="reading.topic || 'general'"
        :show-position-meanings="true"
        :spread-id="reading.spreadId"
      />
      
      <!-- 프리미엄 인사이트 (프리미엄 사용자만 - 기타 스프레드) -->
      <section v-if="reading.premiumInsights && reading.spreadId !== 'celtic_cross' && userStore.isPremium" class="premium-insights">
        <h2>✨ 프리미엄 인사이트</h2>
        
        <!-- 영혼의 교훈 -->
        <div v-if="reading.premiumInsights.soulLesson" class="insight-card">
          <h3>🌟 영혼의 교훈</h3>
          <p>{{ reading.premiumInsights.soulLesson }}</p>
        </div>
        
        <!-- 카르마적 부채 -->
        <div v-if="reading.premiumInsights.karmicDebt" class="insight-card">
          <h3>♾️ 카르마적 과제</h3>
          <p>{{ reading.premiumInsights.karmicDebt }}</p>
        </div>
        
        <!-- 영적 선물 -->
        <div v-if="reading.premiumInsights.spiritualGifts" class="insight-card">
          <h3>🎁 영적 선물</h3>
          <p>{{ reading.premiumInsights.spiritualGifts }}</p>
        </div>
        
        <!-- 그림자 작업 -->
        <div v-if="reading.premiumInsights.shadowWork" class="insight-card">
          <h3>🌙 그림자 작업</h3>
          <p>{{ reading.premiumInsights.shadowWork }}</p>
        </div>
        
        <!-- 타임라인 -->
        <div v-if="reading.premiumInsights.timeline" class="insight-card">
          <h3>⏰ 예상 타임라인</h3>
          <p>{{ reading.premiumInsights.timeline }}</p>
        </div>
        
        <!-- 행동 단계 -->
        <div v-if="reading.premiumInsights.actionSteps" class="insight-card">
          <h3>🚩 구체적인 행동 단계</h3>
          <ul>
            <li v-for="(step, index) in reading.premiumInsights.actionSteps" :key="index">
              {{ step }}
            </li>
          </ul>
        </div>
        
        <!-- 우주적 지침 (세븐 스타) -->
        <div v-if="reading.premiumInsights.stellarAlignment" class="insight-card cosmic-guidance">
          <h3>🌌 우주의 정렬</h3>
          <p>{{ reading.premiumInsights.stellarAlignment }}</p>
        </div>
        
        <div v-if="reading.premiumInsights.cosmicTiming" class="insight-card cosmic-guidance">
          <h3>✨ 우주적 타이밍</h3>
          <p>{{ reading.premiumInsights.cosmicTiming }}</p>
        </div>
        
        <!-- 관계 조언 (컵 오브 릴레이션십) -->
        <div v-if="reading.premiumInsights.communicationTips" class="insight-card love-guidance">
          <h3>💬 소통 팁</h3>
          <p>{{ reading.premiumInsights.communicationTips }}</p>
        </div>
        
        <div v-if="reading.premiumInsights.intimacyGuidance" class="insight-card love-guidance">
          <h3>💕 친밀감 가이드</h3>
          <p>{{ reading.premiumInsights.intimacyGuidance }}</p>
        </div>
        
        <div v-if="reading.premiumInsights.soulContractInsights" class="insight-card love-guidance">
          <h3>🔗 영혼의 계약</h3>
          <p>{{ reading.premiumInsights.soulContractInsights }}</p>
        </div>
      </section>
      
      <!-- 무료 사용자를 위한 기본 해석 (켈틱 크로스) -->
      <section v-if="!userStore.isPremium && reading.spreadId === 'celtic_cross'" class="basic-celtic-insights">
        <h2>🌟 기본 해석</h2>
        <div class="basic-insight-card">
          <h3>🔗 주요 패턴</h3>
          <p>{{ getBasicPattern() }}</p>
        </div>
        <div class="basic-insight-card">
          <h3>✨ 조언</h3>
          <p>{{ getBasicAdvice() }}</p>
        </div>
      </section>
      
      <!-- 무료 사용자를 위한 프리미엄 홍보 -->
      <section v-if="!userStore.isPremium && (reading.spreadId === 'celtic_cross' || reading.spreadId === 'seven_star' || reading.spreadId === 'cup_of_relationship')" class="premium-cta">
        <h3>🌟 더 깊은 통찰을 원하시나요?</h3>
        <p>프리미엄 회원이 되시면 다음과 같은 특별한 해석을 받으실 수 있습니다:</p>
        <ul>
          <li>🤖 AI 기반 다층적 분석 및 심리적 통찰</li>
          <li>🎯 성공 확률 및 도전 예측 분석</li>
          <li>🔗 카드 조합의 특별한 의미 해석</li>
          <li>🌱 단계별 실행 계획과 확언</li>
          <li>✨ 영혼의 교훈과 카르마적 통찰</li>
          <li>🌙 그림자 작업과 영적 성장 가이드</li>
        </ul>
        <button class="btn btn-premium" @click="router.push('/premium')">
          프리미엄으로 업그레이드
        </button>
      </section>

      <!-- 액션 버튼 -->
      <section class="actions">
        <button class="btn btn-primary" @click="newReading">
          새로운 점괘 보기
        </button>
        <button class="btn btn-secondary" @click="goHome">
          홈으로 돌아가기
        </button>
      </section>
    </div>

    <!-- 로딩 또는 에러 상태 -->
    <div class="container" v-else>
      <div class="error-state">
        <h2>😕 점괘를 찾을 수 없습니다</h2>
        <p>점괘 데이터가 없거나 만료되었습니다.</p>
        <button class="btn btn-primary" @click="goHome">
          홈으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTarotStore } from '../store/tarot';
import { useUserStore } from '../store/user';
import { aiAnalysisService, AIAnalysisResult } from '../services/ai/aiAnalysisService';
import EnhancedInterpretation from '../components/interpretation/EnhancedInterpretation.vue';
import { AIInterpretationService } from '../services/ai/AIInterpretationService';

const router = useRouter();
const route = useRoute();
const tarotStore = useTarotStore();
const userStore = useUserStore();

const readingId = computed(() => {
  return route.query.readingId as string || route.params.readingId as string;
});

const reading = computed(() => {
  if (!readingId.value) return null;
  return tarotStore.getReadingById(readingId.value) || tarotStore.getCurrentReading();
});

// 커스텀 질문 가져오기
const customQuestion = computed(() => {
  return tarotStore.getCustomQuestion();
});

// 켈틱 크로스에서 선택된 카드 인덱스
const selectedCardIndex = ref<number | null>(null);

// AI 분석 관련
const aiAnalysis = ref<AIAnalysisResult | null>(null);
const isLoadingAI = ref(false);
const showAIAnalysis = ref(false);

// 평점 관련 상태
const hoverRating = ref(0);
const selectedRating = ref(0);
const userRating = ref(0);

// 향상된 켈틱 크로스 해석은 reading 객체에 포함됨

// 카드 상세 정보 표시
const showCardDetail = (index: number) => {
  selectedCardIndex.value = index;
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

// 카드 이미지 URL 생성 함수
const getCardImageUrl = (card: any) => {
  try {
    // Supabase에서 오는 imageUrl이 있다면 먼저 처리
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      // 수트 폴더가 포함된 경로를 수정
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
      // 메이저 아르카나 파일명 대소문자 수정
      if (finalUrl.includes('/assets/tarot-cards/major/')) {
        const corrections = {
          '00-the-fool.png': '00-the-Fool.png',
          '01-the-magician.png': '01-The-Magician.png',
          '02-the-high-priestess.png': '02-The-High-Priestess.png',
          '03-the-empress.png': '03-The-Empress.png',
          '04-the-emperor.png': '04-The-Emperor.png',
          '05-the-hierophant.png': '05-The-Hierophant.png',
          '06-the-lovers.png': '06-The-Lovers.png',
          '07-the-chariot.png': '07-The-Chariot.png',
          '08-strength.png': '08-Strength.png',
          '09-the-hermit.png': '09-The-Hermit.png',
          '10-wheel-of-fortune.png': '10-Wheel-of-Fortune.png',
          '11-justice.png': '11-Justice.png',
          '12-the-hanged-man.png': '12-The-Hanged-Man.png',
          '13-death.png': '13-Death.png',
          '14-temperance.png': '14-Temperance.png',
          '15-the-devil.png': '15-The-Devil.png',
          '16-the-tower.png': '16-The-Tower.png',
          '17-the-star.png': '17-The-Star.png',
          '18-the-moon.png': '18-The-Moon.png',
          '19-the-sun.png': '19-The-Sun.png',
          '20-judgement.png': '20-Judgement.png',
          '21-the-world.png': '21-The-World.png'
        };
        
        for (const [wrong, correct] of Object.entries(corrections)) {
          if (finalUrl.includes(wrong)) {
            finalUrl = finalUrl.replace(wrong, correct);
            break;
          }
        }
      }
      
      return finalUrl;
    }
    
    // 마이너 아르카나의 경우
    if (card.arcana === 'minor') {
      const cardNumber = String(card.number || 1).padStart(2, '0');
      let cardName;
      
      if (card.suit) {
        if (card.number <= 10) {
          const numberNames = {
            1: 'ace', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
            6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
          };
          cardName = `${numberNames[card.number]}-of-${card.suit}`;
        } else {
          // 코트 카드들은 Supabase imageUrl을 사용해야 함 (위에서 이미 처리됨)
          const faceCards = {
            11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King'
          };
          const suitCapitalized = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
          cardName = `${faceCards[card.number]}-of-${suitCapitalized}`;
        }
      } else {
        cardName = card.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      return `/assets/tarot-cards/minor/${cardNumber}-${cardName}.png`;
    }
    
    // 메이저 아르카나의 경우
    if (card.arcana === 'major') {
      const majorCardNames = {
        0: '00-the-Fool.png', 1: '01-The-Magician.png', 2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png', 4: '04-The-Emperor.png', 5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png', 7: '07-The-Chariot.png', 8: '08-Strength.png',
        9: '09-The-Hermit.png', 10: '10-Wheel-of-Fortune.png', 11: '11-Justice.png',
        12: '12-The-Hanged-Man.png', 13: '13-Death.png', 14: '14-Temperance.png',
        15: '15-The-Devil.png', 16: '16-The-Tower.png', 17: '17-The-Star.png',
        18: '18-The-Moon.png', 19: '19-The-Sun.png', 20: '20-Judgement.png',
        21: '21-The-World.png'
      };
      
      const fileName = majorCardNames[card.number] || '00-the-Fool.png';
      return `/assets/tarot-cards/major/${fileName}`;
    }
    
    return '/assets/tarot-cards/major/00-the-Fool.png';
  } catch (error) {
    console.error('카드 이미지 URL 생성 오류:', error);
    return '/assets/tarot-cards/major/00-the-Fool.png';
  }
};

// 이미지 로드 에러 처리
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img && img.parentElement) {
    img.style.display = 'none';
    if (!img.parentElement.querySelector('.fallback-emoji')) {
      const fallbackEmoji = document.createElement('div');
      fallbackEmoji.className = 'fallback-emoji';
      fallbackEmoji.textContent = '🎤';
      fallbackEmoji.style.cssText = `
        font-size: 48px; text-align: center; display: flex;
        align-items: center; justify-content: center;
        width: 100%; height: 100%; position: absolute;
        top: 0; left: 0; background: rgba(75, 85, 99, 0.9);
        border-radius: 6px; z-index: 10;
      `;
      img.parentElement.appendChild(fallbackEmoji);
    }
  }
};

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/app');
};

const newReading = () => {
  router.push('/reading-select');
};

// 기본 패턴 분석
const getBasicPattern = () => {
  if (!reading.value) return '';
  
  const cards = reading.value.cards;
  const uprightCount = cards.filter(c => c.orientation === 'upright').length;
  const majorCount = cards.filter(c => c.arcana === 'major').length;
  
  if (uprightCount >= 7) {
    return '전반적으로 긍정적인 에너지가 우세합니다. 현재의 방향을 유지하면서 기회를 최대한 활용하세요.';
  } else if (uprightCount <= 3) {
    return '도전적인 시기를 격고 있습니다. 하지만 이는 성장을 위한 필수적인 과정입니다.';
  } else if (majorCount >= 6) {
    return '중요한 인생의 전환점에 있습니다. 우주의 메시지에 귀 기울이고 큰 그림을 보세요.';
  } else {
    return '균형과 조화가 필요한 시기입니다. 각 측면을 통합하여 전진하세요.';
  }
};

// 기본 조언
const getBasicAdvice = () => {
  if (!reading.value) return '';
  
  const present = reading.value.cards[0]; // 현재 내면
  const challenge = reading.value.cards[1]; // 현재 외부
  const outcome = reading.value.cards[9]; // 실제 결과
  
  let advice = [];
  
  if (present.orientation === 'upright') {
    advice.push(`${present.nameKr}의 긍정적인 에너지를 최대한 활용하세요`);
  } else {
    advice.push(`${present.nameKr} 역방향이 나타내는 과제를 정면으로 마주하세요`);
  }
  
  if (outcome.orientation === 'upright') {
    advice.push('긍정적인 결과를 위해 현재의 노력을 지속하세요');
  } else {
    advice.push('예상과 다른 결과가 나올 수 있지만, 이 또한 성장의 기회입니다');
  }
  
  return advice.join('. ') + '.';
};

// 인사이트 이모지 가져오기
const getInsightEmoji = (insight: string): string => {
  if (insight.includes('전환점') || insight.includes('변화')) return '🌟';
  if (insight.includes('감정') || insight.includes('사랑')) return '💧';
  if (insight.includes('열정') || insight.includes('에너지')) return '🔥';
  if (insight.includes('사고') || insight.includes('지성')) return '⚔️';
  if (insight.includes('현실') || insight.includes('물질')) return '🪙';
  if (insight.includes('내면') || insight.includes('영혼')) return '🔄';
  if (insight.includes('균형') || insight.includes('조화')) return '⚖️';
  if (insight.includes('성장') || insight.includes('발전')) return '🌱';
  if (insight.includes('도전') || insight.includes('어려움')) return '🗿';
  if (insight.includes('기회') || insight.includes('가능성')) return '🌈';
  return '✨';
};

// 평점 제출
// 평점 제출
const submitRating = async (rating: number) => {
  if (!reading.value?.aiInterpretationId || userRating.value > 0) return;
  
  selectedRating.value = rating;
  userRating.value = rating;
  
  try {
    const aiService = new AIInterpretationService(userStore.isPremium);
    await aiService.submitRating(reading.value.aiInterpretationId, rating);
    console.log('평점 제출 성공:', rating);
  } catch (error) {
    console.error('평점 제출 오류:', error);
  }
};

// 평점 힌트 텍스트
const getRatingHint = () => {
  const rating = hoverRating.value || selectedRating.value;
  if (rating === 0) return '별점을 클릭해주세요';
  if (rating === 1) return '전혀 도움이 되지 않았어요';
  if (rating === 2) return '별로 도움이 되지 않았어요';
  if (rating === 3) return '보통이에요';
  if (rating === 4) return '도움이 되었어요';
  if (rating === 5) return '매우 도움이 되었어요!';
  return '';
};

onMounted(() => {
  console.log('ReadingResult 마운트됨');
  console.log('readingId:', readingId.value);
  console.log('reading:', reading.value);
  console.log('프리미엄 상태:', userStore.isPremium);
  console.log('스프레드 ID:', reading.value?.spreadId);
  console.log('커스텀 질문:', customQuestion.value);
  
  if (reading.value) {
    console.log('프리미엄 데이터 체크:');
    console.log('- 프리미엄 인사이트:', reading.value.premiumInsights);
    console.log('- 카드 조합:', reading.value.cardCombinations);
    console.log('- 심층 해석:', reading.value.deepInterpretation);
    console.log('- 확률 분석:', reading.value.probabilityAnalysis);
    console.log('- 카드 패턴:', reading.value.cardPattern);
    console.log('- 향상된 해석:', reading.value.enhancedInterpretation);
    console.log('- 개선된 해석:', reading.value.improvedInterpretation);
  }
  
  if (!reading.value && !readingId.value) {
    console.warn('점괘 데이터가 없습니다. 홈으로 리다이렉트');
    router.push('/app');
  }
});
</script>

<style scoped>
.reading-result {
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

/* 커스텀 질문 섹션 */
.custom-question-section {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.custom-question-section::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.custom-question-section h2 {
  color: #F59E0B;
  font-size: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.custom-question-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.custom-question-content p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 17px;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}



.cards-section {
  margin-bottom: 40px;
}

.cards-section h2 {
  color: #A855F7;
  margin-bottom: 25px;
  text-align: center;
  font-size: 24px;
}

.cards-grid {
  display: grid;
  gap: 25px;
}

.card-result {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
}

.card-result:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h3 {
  color: #F59E0B;
  margin: 0;
  font-size: 18px;
}

.card-orientation {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.card-orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.card-orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

.card-content {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  align-items: start;
}

.card-image {
  display: flex;
  justify-content: center;
  position: relative;
}

.card-image img {
  width: 80px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.card-image img.reversed {
  transform: rotate(180deg);
}

.card-placeholder {
  width: 80px;
  height: 120px;
  background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
}

.card-placeholder.reversed {
  transform: rotate(180deg);
}

.card-info h4 {
  color: white;
  margin-bottom: 10px;
  font-size: 20px;
}

.card-keywords {
  color: #F59E0B;
  margin-bottom: 15px;
  font-size: 14px;
}

.card-meaning {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 15px;
  font-size: 16px;
}

.card-advice {
  color: #A855F7;
  font-style: italic;
  line-height: 1.5;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  color: #EF4444;
  margin-bottom: 15px;
  font-size: 28px;
}

.error-state p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  font-size: 16px;
}

/* 켈틱 크로스 레이아웃 스타일 */
.celtic-cross-layout {
  position: relative;
  min-height: 500px;
  padding: 10px 10px 5px 10px;
}

.celtic-cross-layout .cards-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 500px;
  margin: 0 auto;
}

/* 카드 위치 */
.celtic-cross-layout .card-position {
  position: absolute;
  width: 80px;
  height: 120px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.celtic-cross-layout .card-position:hover {
  transform: scale(1.1);
  z-index: 100;
}

/* 각 위치별 좌표 - 간격을 좁혀서 조정 */
.celtic-cross-layout .position-1 { /* 현재내면 - 중앙 왼쪽 */
  top: 52%;
  left: calc(40% - 40px);
  transform: translate(-100%, 15%);
  z-index: 10;
}

.celtic-cross-layout .position-2 { /* 현재외부 - 중앙 오른쪽 */
  top: 50%;
  left: calc(40% + 40px);
  transform: translate(-70%, -5%);
  z-index: 10;
}

.celtic-cross-layout .position-3 { /* 근본 - 아래 */
  top: 78%;
  left: 40%;
  transform: translate(-90%, 45%);
}

.celtic-cross-layout .position-4 { /* 과거 - 왼쪽 */
  top: 50%;
  left: 8%;
  transform: translate(-120%, 5%);
}

.celtic-cross-layout .position-5 { /* 드러나는 모습 - 위 */
  top: 25%;
  left: 40%;
  transform: translate(-90%, -25%);
}

.celtic-cross-layout .position-6 { /* 미래 - 오른쪽 */
  top: 50%;
  left: 72%;
  transform: translate(-20%, 5%);
}

/* 오른쪽 기둥 - 간격 좁히기 */
.celtic-cross-layout .position-7 { /* 내가보는나 - 맨 아래 */
  top: 75%;
  left: 88%;
  transform: translate(50%, 90%);
}

.celtic-cross-layout .position-8 { /* 남이보는나 */
  top: 57%;
  left: 88%;
  transform: translate(70%, 40%);
}

.celtic-cross-layout .position-9 { /* 예상하는 결과 */
  top: 40%;
  left: 88%;
  transform: translate(50%, -10%);
}

.celtic-cross-layout .position-10 { /* 실제 결과 - 맨 위 */
  top: 22%;
  left: 88%;
  transform: translate(70%, -60%);
}

.card-mini {
  width: 80px;
  height: 120px;
  background: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.card-mini img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.card-mini img.reversed {
  transform: rotate(180deg);
}

.card-mini.reversed {
  border-color: #DC2626;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
}

.position-label {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(30, 27, 75, 0.9);
  color: #FFD700;
  font-weight: bold;
  font-size: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* .card-name 스타일 제거 - 더 이상 사용하지 않음 */

/* 선택된 카드 상세 정보 */
.selected-card-detail {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(168, 85, 247, 0.5);
  border-radius: 16px;
  padding: 25px;
  margin-top: 40px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-detail-header h3 {
  color: #FFD700;
  font-size: 22px;
  margin: 0;
}

.close-detail {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-detail:hover {
  color: white;
}

.card-detail-content {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  align-items: start;
}

.card-detail-content .card-image {
  width: 120px;
  height: 180px;
}

.card-detail-content .card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-detail-content h4 {
  color: white;
  font-size: 20px;
  margin-bottom: 10px;
}

.position-meaning {
  background: rgba(168, 85, 247, 0.1);
  border-left: 3px solid #A855F7;
  padding: 10px 15px;
  margin: 15px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 켈틱 크로스 전용 인사이트 */
.celtic-cross-insights {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.celtic-cross-insights::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.celtic-cross-insights h2 {
  text-align: center;
  color: #A855F7;
  font-size: 28px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}

.celtic-cross-insights .insight-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.celtic-cross-insights .insight-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.3);
}

.celtic-cross-insights .insight-card.relationships {
  border-left: 3px solid #F59E0B;
}

.celtic-cross-insights .insight-card.elements {
  border-left: 3px solid #3B82F6;
}

.celtic-cross-insights .insight-card.timeline {
  border-left: 3px solid #10B981;
}

.celtic-cross-insights .insight-card.keywords {
  border-left: 3px solid #EC4899;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.keyword-tag {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%);
  border: 1px solid rgba(168, 85, 247, 0.5);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.keyword-tag:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(236, 72, 153, 0.5) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

/* 프리미엄 인사이트 섹션 */
.premium-insights {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.premium-insights::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.premium-insights h2 {
  text-align: center;
  color: #FFD700;
  font-size: 28px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.insight-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.insight-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.insight-card h3 {
  color: #A855F7;
  font-size: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.insight-card p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-size: 16px;
}

.insight-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insight-card ul li {
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  padding-left: 25px;
}

.insight-card ul li:last-child {
  border-bottom: none;
}

.insight-card ul li::before {
  content: '★';
  position: absolute;
  left: 0;
  color: #FFD700;
}

/* 특별한 인사이트 카드 스타일 */
.cosmic-guidance {
  background: linear-gradient(135deg, rgba(25, 25, 112, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
  border-color: rgba(255, 215, 0, 0.3);
}

.cosmic-guidance h3 {
  color: #FFD700;
}

.love-guidance {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%);
  border-color: rgba(236, 72, 153, 0.3);
}

.love-guidance h3 {
  color: #EC4899;
}

/* 기본 켈틱 크로스 해석 */
.basic-celtic-insights {
  margin: 40px 0;
  padding: 25px;
  background: rgba(168, 85, 247, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 16px;
}

.basic-celtic-insights h2 {
  text-align: center;
  color: #A855F7;
  font-size: 24px;
  margin-bottom: 25px;
}

.basic-insight-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.basic-insight-card h3 {
  color: #F59E0B;
  font-size: 18px;
  margin-bottom: 12px;
}

.basic-insight-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 15px;
}

/* 프리미엄 없을 때 CTA */
.premium-cta {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
  text-align: center;
  padding: 40px;
  border-radius: 24px;
  margin: 40px 0;
  box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.premium-cta::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0%, 100% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
  50% { transform: translateX(-50%) translateY(-50%) rotate(180deg); }
}

.premium-cta h3 {
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.premium-cta p {
  margin-bottom: 25px;
  font-size: 18px;
  position: relative;
  z-index: 1;
}

.premium-cta .btn {
  background: #1E1B4B;
  color: #FFD700;
  font-weight: 700;
  font-size: 18px;
  padding: 16px 32px;
  border-radius: 12px;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(30, 27, 75, 0.3);
  transition: all 0.3s ease;
}

.premium-cta .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 27, 75, 0.4);
}

.premium-cta ul {
  list-style: none;
  padding: 0;
  margin: 30px auto;
  text-align: left;
  display: inline-block;
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.premium-cta ul li {
  padding: 8px 0;
  position: relative;
  padding-left: 30px;
}

.premium-cta ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@media (max-width: 480px) {
  .celtic-cross-layout .cards-container {
    transform: scale(0.65);
  }
  
  /* 더 작은 화면에서 카드 위치 더 조정 */
  .celtic-cross-layout .position-1 {
    left: calc(40% - 35px);
  }
  
  .celtic-cross-layout .position-2 {
    left: calc(40% + 35px);
  }
  
  /* 더 작은 화면에서 상하좌우 카드 위치 조정 */
  .celtic-cross-layout .position-3 {
    top: 78%;
  }
  
  .celtic-cross-layout .position-4 {
    left: 15%;
  }
  
  .celtic-cross-layout .position-5 {
    top: 22%;
  }
  
  .celtic-cross-layout .position-6 {
    left: 65%;
  }
  
  /* 더 작은 화면에서 오른쪽 기둥 조정 - 간격 더 좁히기 */
  .celtic-cross-layout .position-7 {
    top: 70%;
    right: 0;
  }
  
  .celtic-cross-layout .position-8 {
    top: 52%;
    right: 0;
  }
  
  .celtic-cross-layout .position-9 {
    top: 34%;
    right: 0;
  }
  
  .celtic-cross-layout .position-10 {
    top: 16%;
    right: 0;
  }
}

@media (max-width: 768px) {
  .card-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 15px;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
  
  /* 켈틱 크로스 모바일 스타일 */
  .celtic-cross-layout {
    min-height: 400px;
    padding: 5px;
  }
  
  .celtic-cross-layout .cards-container {
    height: 400px;
    transform: scale(0.75);
    transform-origin: top center;
  }
  
  /* 모바일에서 중앙 카드 위치 조정 */
  .celtic-cross-layout .position-1 {
    left: calc(40% - 25px);
  }
  
  .celtic-cross-layout .position-2 {
    left: calc(40% + 25px);
  }
  
  /* 모바일에서 상하좌우 카드 위치 조정 */
  .celtic-cross-layout .position-3 {
    top: 75%;
  }
  
  .celtic-cross-layout .position-4 {
    left: 12%;
  }
  
  .celtic-cross-layout .position-5 {
    top: 25%;
  }
  
  .celtic-cross-layout .position-6 {
    left: 60%;
  }
  
  /* 모바일에서 오른쪽 기둥 조정 - 간격 좁히기 */
  .celtic-cross-layout .position-7 {
    top: 72%;
    right: 5px;
    left: auto;
  }
  
  .celtic-cross-layout .position-8 {
    top: 54%;
    right: 5px;
    left: auto;
  }
  
  .celtic-cross-layout .position-9 {
    top: 36%;
    right: 5px;
    left: auto;
  }
  
  .celtic-cross-layout .position-10 {
    top: 18%;
    right: 5px;
    left: auto;
  }
  
  .card-detail-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .premium-insights {
    padding: 20px;
  }
  
  .insight-card h3 {
    font-size: 18px;
  }
  
  .insight-card p {
    font-size: 14px;
  }
}

/* 프리미엄 분석 섹션 */
.premium-analysis {
  margin: 40px 0;
  padding: 40px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%);
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2);
}

.premium-analysis::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  animation: rotate 40s linear infinite;
  pointer-events: none;
}

.premium-analysis h2 {
  text-align: center;
  font-size: 32px;
  color: #A855F7;
  margin-bottom: 40px;
  text-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
  position: relative;
  z-index: 1;
  font-weight: 700;
  letter-spacing: 1px;
}

.analysis-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.analysis-section h3 {
  color: #A855F7;
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 카드 조합 분석 */
.card-combinations .combination-list {
  display: grid;
  gap: 15px;
}

.combination-item {
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.combination-item:hover {
  background: rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
}

.combo-header {
  margin-bottom: 16px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.type-badge.special {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1E1B4B;
}

.type-badge.suit {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
}

.type-badge.number {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
}

.type-badge.element {
  background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
  color: white;
}

.combo-meaning {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 12px;
}

.combo-advice {
  color: #FFD700;
  font-style: italic;
  font-size: 15px;
  display: flex;
  align-items: start;
  gap: 8px;
}

.advice-icon {
  flex-shrink: 0;
}

/* 카드 패턴 분석 */
.card-pattern .pattern-content {
  background: rgba(168, 85, 247, 0.1);
  border-left: 4px solid #A855F7;
  padding: 20px;
  border-radius: 8px;
}

.pattern-name {
  font-size: 20px;
  font-weight: 600;
  color: #A855F7;
  margin-bottom: 10px;
}

.pattern-description {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 15px;
}

.pattern-implication {
  color: #FFD700;
  font-size: 16px;
}

/* 확률적 분석 */
.probability-analysis .probability-content {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12px;
  padding: 25px;
}

.probability-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.probability-item {
  text-align: center;
  padding: 24px;
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.probability-item:hover {
  transform: translateY(-5px);
}

.probability-item.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.probability-item.challenge {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.probability-item.uncertainty {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.probability-value {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.probability-item.success .probability-value {
  color: #22C55E;
}

.probability-item.challenge .probability-value {
  color: #EF4444;
}

.probability-item.uncertainty .probability-value {
  color: #FBBF24;
}

.probability-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.probability-reason {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  margin-top: 5px;
  text-align: center;
  font-style: italic;
}

.probability-recommendation {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
}

/* AI 심층 해석 */
.deep-interpretation .layers-analysis {
  margin-bottom: 30px;
}

.deep-interpretation h4 {
  color: #A855F7;
  font-size: 20px;
  margin-bottom: 20px;
  margin-top: 30px;
}

.layer-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.layer-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.layer-item.psychological {
  border-left: 3px solid #3B82F6;
}

.layer-item.spiritual {
  border-left: 3px solid #A855F7;
}

.layer-item.shadow {
  border-left: 3px solid #6B7280;
}

.layer-item h5 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #E5E7EB;
}

.layer-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 10px;
}

.layer-content p:last-child {
  margin-bottom: 0;
}

.shadow-aspect {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.shadow-aspect:last-child {
  margin-bottom: 0;
}

/* 종합 통찰 */
.synthesis {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.synthesis p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 17px;
}

/* 핵심 인사이트 */
.key-insights .insights-grid {
  display: grid;
  gap: 15px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(139, 92, 246, 0.05);
  padding: 15px 20px;
  border-radius: 10px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}

.insight-item:hover {
  background: rgba(139, 92, 246, 0.1);
  transform: translateX(5px);
}

.insight-emoji {
  font-size: 28px;
}

.insight-text {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

/* 실행 계획 */
.action-plan .action-timeline {
  display: grid;
  gap: 20px;
}

.action-phase {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.action-phase:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.action-phase.immediate {
  border-left: 3px solid #EF4444;
}

.action-phase.weekly {
  border-left: 3px solid #F59E0B;
}

.action-phase.monthly {
  border-left: 3px solid #10B981;
}

.action-phase h5 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #E5E7EB;
}

.action-phase ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.action-phase li {
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  padding-left: 20px;
}

.action-phase li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #A855F7;
}

/* 확언 */
.affirmations {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  border: 1px solid rgba(236, 72, 153, 0.3);
  box-shadow: 0 5px 25px rgba(236, 72, 153, 0.15);
}

.affirmation-list {
  display: grid;
  gap: 15px;
  margin-top: 20px;
}

.affirmation-item {
  font-size: 19px;
  font-style: italic;
  color: #FCD34D;
  line-height: 1.8;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  border: 1px solid rgba(252, 211, 77, 0.4);
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.affirmation-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(252, 211, 77, 0.3);
}

@media (max-width: 768px) {
  .premium-analysis {
    padding: 25px 15px;
  }
  
  .premium-analysis h2 {
    font-size: 24px;
  }
  
  .probability-grid {
    grid-template-columns: 1fr;
  }
  
  .probability-value {
    font-size: 28px;
  }
}

/* AI 해석 결과 섹션 */
.ai-interpretation-section {
  margin: 40px 0;
  padding: 30px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
  border: 2px solid rgba(168, 85, 247, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-interpretation-section::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}

.ai-interpretation-section h2 {
  text-align: center;
  color: #A855F7;
  font-size: 28px;
  margin-bottom: 25px;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.ai-interpretation-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.ai-interpretation-content p {
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.8;
  font-size: 16px;
  margin: 0;
  white-space: pre-wrap;
}

/* 평점 시스템 스타일 */
.rating-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.rating-section h4 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  font-weight: 500;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: grayscale(100%) opacity(0.5);
  padding: 5px;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.active {
  filter: grayscale(0%) opacity(1);
  transform: scale(1.1);
  animation: starPulse 0.3s ease;
}

@keyframes starPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

.rating-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  height: 20px;
  transition: all 0.2s ease;
}

.rating-submitted {
  margin-top: 25px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 12px;
  text-align: center;
  animation: slideInUp 0.5s ease-out;
}

.rating-submitted p {
  color: #22C55E;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

/* 해석 수정 버튼 */
.btn-edit-interpretation {
  background: rgba(107, 70, 193, 0.2);
  color: #6b46c1;
  border: 1px solid #6b46c1;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 15px;
}

.btn-edit-interpretation:hover {
  background: rgba(107, 70, 193, 0.3);
  transform: translateY(-1px);
}

/* 해석 수정 섹션 */
.correction-section {
  margin-top: 30px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  animation: fadeIn 0.3s ease;
}

.correction-section h4 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.interpretation-textarea {
  width: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 15px;
  font-family: inherit;
}

.interpretation-textarea:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.feedback-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  margin-bottom: 20px;
}

.feedback-input:focus {
  outline: none;
  border-color: rgba(168, 85, 247, 0.5);
}

.correction-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.correction-actions .btn {
  padding: 10px 24px;
}

@media (max-width: 768px) {
  .ai-interpretation-section {
    margin: 30px 0;
    padding: 20px;
  }
  
  .ai-interpretation-section h2 {
    font-size: 24px;
  }
  
  .ai-interpretation-content {
    padding: 20px;
  }
  
  .ai-interpretation-content p {
    font-size: 15px;
  }
  
  .star-btn {
    font-size: 28px;
  }
  
  .rating-hint {
    font-size: 13px;
  }
}
</style>
