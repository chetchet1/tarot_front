// 디버깅을 위한 테스트 페이지
import { useUserStore } from '../store/user';
import { useTarotStore } from '../store/tarot';
import { isPremiumSpread, hasUsedPremiumSpreadToday } from '../services/premium/premiumSpreadService';

export async function debugPremiumSpread() {
  const userStore = useUserStore();
  const tarotStore = useTarotStore();
  
  console.log('=== 프리미엄 배열 디버깅 ===');
  
  // 1. 사용자 상태 확인
  console.log('사용자 정보:', {
    currentUser: userStore.currentUser,
    isPremium: userStore.isPremium,
    isAnonymous: userStore.currentUser?.isAnonymous
  });
  
  // 2. 선택된 정보 확인
  console.log('선택된 정보:', {
    topic: tarotStore.selectedTopic,
    spread: tarotStore.selectedSpread
  });
  
  // 3. 켈틱 크로스가 프리미엄인지 확인
  console.log('켈틱 크로스 프리미엄 여부:', isPremiumSpread('celtic_cross'));
  
  // 4. 오늘 사용했는지 확인
  if (userStore.currentUser && !userStore.currentUser.isAnonymous) {
    const hasUsed = await hasUsedPremiumSpreadToday(userStore.currentUser.id);
    console.log('오늘 유료 배열 사용 여부:', hasUsed);
  }
  
  // 5. 스토어 함수들이 정상 작동하는지 확인
  console.log('스토어 함수 테스트:', {
    setSelectedTopic: typeof tarotStore.setSelectedTopic,
    setSelectedSpread: typeof tarotStore.setSelectedSpread
  });
  
  return '디버깅 완료';
}

// 전역으로 노출
if (typeof window !== 'undefined') {
  (window as any).debugPremiumSpread = debugPremiumSpread;
}
