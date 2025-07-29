<template>
  <transition name="slide-up">
    <div v-if="visible" class="position-meaning-overlay">
      <div class="meaning-card">
        <button class="close-button" @click="$emit('close')">
          <span>✕</span>
        </button>
        
        <div class="position-number">Position {{ position }}</div>
        
        <h3 class="position-title">{{ meaning?.title }}</h3>
        
        <p class="position-description">{{ meaning?.description }}</p>
        
        <div class="keywords" v-if="meaning?.keywords">
          <span class="keyword" v-for="keyword in meaning.keywords" :key="keyword">
            {{ keyword }}
          </span>
        </div>
        
        <div class="card-preview" v-if="card">
          <img :src="getCardImageUrl(card)" :alt="card.nameKr" />
          <h4>{{ card.nameKr }}</h4>
          <span class="orientation" :class="orientation">
            {{ orientation === 'upright' ? '정방향' : '역방향' }}
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getPositionMeaning } from '@/data/spreads/positionMeanings';

interface Props {
  visible: boolean;
  spreadId: string;
  position: number;
  card?: any;
  orientation?: 'upright' | 'reversed';
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const meaning = computed(() => {
  return getPositionMeaning(props.spreadId, props.position);
});

const getCardImageUrl = (card: any) => {
  // 카드 이미지 URL 생성 로직 (기존 로직 재사용)
  if (!card) return '';
  
  try {
    if (card.imageUrl && !card.imageUrl.includes('undefined')) {
      let finalUrl = card.imageUrl;
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/cups/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/wands/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/swords/', '/assets/tarot-cards/minor/');
      finalUrl = finalUrl.replace('/assets/tarot-cards/minor/pentacles/', '/assets/tarot-cards/minor/');
      
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
    
    // 기본 이미지 생성 로직
    if (card.arcana === 'minor') {
      const cardNumber = String(card.number || 1).padStart(2, '0');
      let cardName;
      
      if (card.suit) {
        if (card.number <= 10) {
          const numberNames = {
            1: 'ace',
            2: 'two', 3: 'three', 4: 'four', 5: 'five',
            6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
          };
          cardName = `${numberNames[card.number]}-of-${card.suit}`;
        } else {
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
    
    if (card.arcana === 'major') {
      const majorCardNames = {
        0: '00-the-Fool.png',
        1: '01-The-Magician.png',
        2: '02-The-High-Priestess.png',
        3: '03-The-Empress.png',
        4: '04-The-Emperor.png',
        5: '05-The-Hierophant.png',
        6: '06-The-Lovers.png',
        7: '07-The-Chariot.png',
        8: '08-Strength.png',
        9: '09-The-Hermit.png',
        10: '10-Wheel-of-Fortune.png',
        11: '11-Justice.png',
        12: '12-The-Hanged-Man.png',
        13: '13-Death.png',
        14: '14-Temperance.png',
        15: '15-The-Devil.png',
        16: '16-The-Tower.png',
        17: '17-The-Star.png',
        18: '18-The-Moon.png',
        19: '19-The-Sun.png',
        20: '20-Judgement.png',
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
</script>

<style scoped>
.position-meaning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.meaning-card {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border: 2px solid rgba(168, 85, 247, 0.5);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 18px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.position-number {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #A855F7;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 15px;
}

.position-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 15px;
  color: white;
  text-align: center;
}

.position-description {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  text-align: center;
}

.keywords {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

.keyword {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.card-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  margin-top: 20px;
}

.card-preview img {
  width: 80px;
  height: 120px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 10px;
  background: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.card-preview h4 {
  font-size: 16px;
  margin-bottom: 5px;
  color: white;
}

.orientation {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.orientation.upright {
  background: rgba(34, 197, 94, 0.2);
  color: #22C55E;
}

.orientation.reversed {
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
}

/* 애니메이션 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .meaning-card {
    padding: 20px;
  }
  
  .position-title {
    font-size: 24px;
  }
  
  .position-description {
    font-size: 14px;
  }
  
  .card-preview img {
    width: 60px;
    height: 90px;
  }
}
</style>
