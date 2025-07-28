import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, UserPreferences, Subscription } from '../models/user';
import { authService } from '../services/supabase';

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null);
  const isLoggedIn = computed(() => !!currentUser.value && !currentUser.value.isAnonymous);
  const isPremium = computed(() => currentUser.value?.isPremium || false);
  const isLoading = ref(false);
  
  // 무료 점괴 관리
  const freeReadingsToday = ref(0);
  const maxFreeReadingsPerDay = ref(3);
  const lastFreeReadingDate = ref<string | null>(null);
  
  // 무료 점괄 사용 가능 여부
  const canUseFreeReading = computed(() => {
    if (isPremium.value) return true;
    
    // 날짜 확인은 여기서 하지 말고 getter로 처리
    return freeReadingsToday.value < maxFreeReadingsPerDay.value;
  });
  
  // 무료 점괄 사용 가능 여부 (날짜 체크 포함)
  const getFreeReadingStatus = () => {
    resetFreeReadingsIfNewDay(); // 날짜 변경 체크
    return {
      canUse: isPremium.value || freeReadingsToday.value < maxFreeReadingsPerDay.value,
      remaining: Math.max(0, maxFreeReadingsPerDay.value - freeReadingsToday.value),
      total: maxFreeReadingsPerDay.value,
      used: freeReadingsToday.value
    };
  };
  
  // 오늘 날짜 확인
  const getTodayString = () => {
    return new Date().toDateString();
  };
  
  // 무료 점괴 리셋 (날짜가 바뀐었을 때)
  const resetFreeReadingsIfNewDay = () => {
    const today = getTodayString();
    if (lastFreeReadingDate.value !== today) {
      freeReadingsToday.value = 0;
      lastFreeReadingDate.value = today;
      saveFreeReadingData();
    }
  };
  
  // 무료 점괄 데이터 저장
  const saveFreeReadingData = () => {
    const data = {
      count: freeReadingsToday.value,
      date: lastFreeReadingDate.value
    };
    localStorage.setItem('tarot_free_readings', JSON.stringify(data));
  };
  
  // 무료 점괄 데이터 로드
  const loadFreeReadingData = () => {
    try {
      const saved = localStorage.getItem('tarot_free_readings');
      if (saved) {
        const data = JSON.parse(saved);
        freeReadingsToday.value = data.count || 0;
        lastFreeReadingDate.value = data.date;
        // 날짜가 바뀐었는지 확인
        resetFreeReadingsIfNewDay();
      } else {
        // 처음 사용자
        lastFreeReadingDate.value = getTodayString();
        freeReadingsToday.value = 0;
        saveFreeReadingData();
      }
    } catch (error) {
      console.error('무료 점괄 데이터 로드 실패:', error);
      lastFreeReadingDate.value = getTodayString();
      freeReadingsToday.value = 0;
      saveFreeReadingData();
    }
  };
  
  // 무료 점괄 사용
  const incrementFreeReading = () => {
    if (isPremium.value) return; // 프리미엄 사용자는 카운트 안함
    
    resetFreeReadingsIfNewDay(); // 날짜 바뀐었으면 리셋
    
    if (canUseFreeReading.value) {
      freeReadingsToday.value++;
      saveFreeReadingData();
    }
  };
  
  // 무료 사용 초기화 (테스트용)
  const resetFreeReadings = () => {
    freeReadingsToday.value = 0;
    lastFreeReadingDate.value = getTodayString();
    saveFreeReadingData();
  };

  // 프리미엄 상태 확인
  const checkPremiumStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data: profile } = await authService.supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .single();
      
      return profile?.is_premium || false;
    } catch (error) {
      console.error('프리미엄 상태 확인 실패:', error);
      return false;
    }
  };

  // 테스트 계정 프리미엄 설정
  const setTestAccountPremium = async (userId: string, isPremium: boolean = true) => {
    try {
      const { error } = await authService.supabase
        .from('profiles')
        .update({ is_premium: isPremium })
        .eq('id', userId);
      
      if (error) throw error;
      
      // 로컬 상태 업데이트
      if (currentUser.value) {
        currentUser.value.isPremium = isPremium;
        saveUser();
      }
      
      console.log(`사용자 ${userId} 프리미엄 상태를 ${isPremium}로 설정`);
      return true;
    } catch (error) {
      console.error('프리미엄 상태 설정 실패:', error);
      return false;
    }
  };
  
  // 프리미엄 업그레이드 (테스트용)
  const upgradeToPremium = async () => {
    if (currentUser.value && !currentUser.value.isAnonymous) {
      const success = await setTestAccountPremium(currentUser.value.id, true);
      if (success) {
        console.log('프리미엄 업그레이드 성공');
      }
    } else if (currentUser.value) {
      // 익명 사용자의 경우 로컬에서만 업그레이드
      currentUser.value.isPremium = true;
      saveUser();
    }
  };

  // 프리미엄 다운그레이드 (테스트용)
  const downgradeToPremium = async () => {
    if (currentUser.value && !currentUser.value.isAnonymous) {
      const success = await setTestAccountPremium(currentUser.value.id, false);
      if (success) {
        console.log('프리미엄 다운그레이드 성공');
      }
    } else if (currentUser.value) {
      // 익명 사용자의 경우 로컬에서만 다운그레이드
      currentUser.value.isPremium = false;
      saveUser();
    }
  };

  // 프리미엄 상태 새로고침
  const refreshPremiumStatus = async () => {
    if (currentUser.value && !currentUser.value.isAnonymous) {
      const isPremiumUser = await checkPremiumStatus(currentUser.value.id);
      currentUser.value.isPremium = isPremiumUser;
      saveUser();
      console.log('프리미엄 상태 새로고침:', isPremiumUser);
      return isPremiumUser;
    }
    return false;
  };

  // 익명 사용자 생성
  const createAnonymousUser = (): User => {
    return {
      id: `anon_${Date.now()}`,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isAnonymous: true,
      isPremium: false,
      preferences: {
        theme: 'dark',
        language: 'ko',
        notifications: {
          dailyReading: true,
          weeklyInsight: false,
          promotions: true,
          newFeatures: false,
          weeklyReport: false
        },
        soundEnabled: true,
        vibrationEnabled: true,
        autoSaveReadings: true,
        privateProfile: false
      }
    };
  };

  // 로컬 스토리지 저장/불러오기
  const saveUser = () => {
    console.log('사용자 저장 시도:', currentUser.value);
    if (currentUser.value) {
      localStorage.setItem('tarot_user', JSON.stringify(currentUser.value));
      console.log('사용자 저장 완료');
    }
  };

  const loadUser = () => {
    console.log('사용자 로드 시도');
    try {
      const saved = localStorage.getItem('tarot_user');
      console.log('로컬스토리지에서 가져온 데이터:', saved);
      if (saved) {
        currentUser.value = JSON.parse(saved);
        console.log('사용자 로드 성공:', currentUser.value);
      } else {
        console.log('저장된 사용자 없음, 익명 사용자 생성');
        currentUser.value = createAnonymousUser();
        saveUser();
      }
    } catch (error) {
      console.error('사용자 로드 실패:', error);
      currentUser.value = createAnonymousUser();
      saveUser();
    }
  };

  // 사용자 초기화
  const initializeUser = async () => {
    console.log('=== 사용자 초기화 시작 ===');
    try {
      isLoading.value = true;
      console.log('Supabase 인증 상태 확인 시도...');
      
      // 무료 점괴 데이터 로드
      loadFreeReadingData();
      
      // Supabase 인증 상태 확인 (오류 처리 개선)
      const user = await authService.getCurrentUser();
      console.log('Supabase 사용자:', user);
      
      if (user && user.email_confirmed_at) {
        // 이메일 인증이 완료된 사용자만 로그인 처리
        console.log('인증된 사용자 감지');
        
        // 프리미엄 상태 확인
        const isPremiumUser = await checkPremiumStatus(user.id);
        console.log('프리미엄 상태:', isPremiumUser);
        
        currentUser.value = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          phone: user.user_metadata?.phone,
          avatarUrl: user.user_metadata?.avatar_url,
          createdAt: new Date(user.created_at),
          lastLoginAt: new Date(),
          isAnonymous: false,
          isPremium: isPremiumUser,
          preferences: {
            theme: 'dark',
            language: 'ko',
            notifications: {
              dailyReading: true,
              weeklyInsight: true,
              promotions: true,
              newFeatures: true,
              weeklyReport: false
            },
            soundEnabled: true,
            vibrationEnabled: true,
            autoSaveReadings: true,
            privateProfile: false
          }
        };
        saveUser();
      } else {
        // 로그인된 사용자가 없거나 이메일 미인증 사용자는 로컬 스토리지에서 로드
        console.log('비로그인 사용자 또는 미인증 사용자');
        loadUser();
      }
      
      // 인증 상태 변화 감지
      authService.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // 로그인 시 사용자 정보 업데이트
          const user = session.user;
          
          // 프리미엄 상태 확인
          const isPremiumUser = await checkPremiumStatus(user.id);
          console.log('로그인 시 프리미엄 상태:', isPremiumUser);
          
          currentUser.value = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email!.split('@')[0],
            phone: user.user_metadata?.phone,
            avatarUrl: user.user_metadata?.avatar_url,
            createdAt: new Date(user.created_at),
            lastLoginAt: new Date(),
            isAnonymous: false,
            isPremium: isPremiumUser,
            preferences: currentUser.value?.preferences || {
              theme: 'dark',
              language: 'ko',
              notifications: {
                dailyReading: true,
                weeklyInsight: true,
                promotions: true,
                newFeatures: true,
                weeklyReport: false
              },
              soundEnabled: true,
              vibrationEnabled: true,
              autoSaveReadings: true,
              privateProfile: false
            }
          };
          saveUser();
          isLoading.value = false;
        } else if (event === 'SIGNED_OUT') {
          // 로그아웃 시 익명 사용자로 전환
          currentUser.value = createAnonymousUser();
          saveUser();
          isLoading.value = false;
        }
      });
      
    } catch (error) {
      console.error('사용자 초기화 실패:', error);
      currentUser.value = createAnonymousUser();
      saveUser();
    } finally {
      isLoading.value = false;
    }
  };

  // 이메일 로그인
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true;
      
      const { user } = await authService.signIn(email, password);
      
      if (user) {
        // 프리미엄 상태 확인
        const isPremiumUser = await checkPremiumStatus(user.id);
        console.log('로그인 시 프리미엄 상태:', isPremiumUser);
        
        currentUser.value = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || email.split('@')[0],
          phone: user.user_metadata?.phone,
          avatarUrl: user.user_metadata?.avatar_url,
          createdAt: new Date(user.created_at),
          lastLoginAt: new Date(),
          isAnonymous: false,
          isPremium: isPremiumUser,
          preferences: {
            theme: 'dark',
            language: 'ko',
            notifications: {
              dailyReading: true,
              weeklyInsight: true,
              promotions: true,
              newFeatures: true,
              weeklyReport: false
            },
            soundEnabled: true,
            vibrationEnabled: true,
            autoSaveReadings: true,
            privateProfile: false
          }
        };
        saveUser();
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 이메일 회원가입
  const signUp = async (
    email: string, 
    password: string, 
    userData?: {
      name?: string;
      phone?: string;
      birthdate?: string;
      gender?: string;
    }
  ) => {
    try {
      isLoading.value = true;
      
      const { user } = await authService.signUp(email, password, userData);
      
      if (user) {
        console.log('회원가입 완료:', { email, userData });
        // 회원가입 성공 - 이메일 인증 완료 대기
        // 자동 로그인은 하지 않음 (이메일 인증 대기)
      }
      
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // 소셜 로그인 (Google)
  const signInWithGoogle = async () => {
    try {
      isLoading.value = true;
      await authService.signInWithGoogle();
      // OAuth 리다이렉트가 일어나며, 콜백에서 로그인 처리
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      isLoading.value = false;
      throw error;
    }
  };

  // 소셜 로그인 (GitHub)
  const signInWithGitHub = async () => {
    try {
      isLoading.value = true;
      await authService.signInWithGitHub();
      // OAuth 리다이렉트가 일어나며, 콜백에서 로그인 처리
    } catch (error) {
      console.error('GitHub 로그인 실패:', error);
      isLoading.value = false;
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      isLoading.value = true;
      
      await authService.signOut();
      
      // 익명 사용자로 전환
      currentUser.value = createAnonymousUser();
      saveUser();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 오류가 있어도 로컬에서는 로그아웃 처리
      currentUser.value = createAnonymousUser();
      saveUser();
    } finally {
      isLoading.value = false;
    }
  };

  // 환경설정 업데이트
  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!currentUser.value) return;

    try {
      const updatedPreferences = {
        ...currentUser.value.preferences,
        ...preferences
      };

      // 로컬 상태 업데이트
      currentUser.value.preferences = updatedPreferences;
      saveUser();
    } catch (error) {
      console.error('환경설정 업데이트 실패:', error);
      throw error;
    }
  };

  // 프로필 업데이트
  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
  }) => {
    if (!currentUser.value || currentUser.value.isAnonymous) return;

    try {
      // 로컬 상태 업데이트
      if (updates.name) currentUser.value.name = updates.name;
      if (updates.phone) currentUser.value.phone = updates.phone;
      if (updates.avatarUrl) currentUser.value.avatarUrl = updates.avatarUrl;
      
      saveUser();
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      throw error;
    }
  };

  // 구독 업데이트
  const updateSubscription = async (subscription: Subscription) => {
    if (!currentUser.value || currentUser.value.isAnonymous) return;

    try {
      // 로컬 상태 업데이트
      currentUser.value.subscription = subscription;
      currentUser.value.isPremium = subscription.status === 'active';
      saveUser();
    } catch (error) {
      console.error('구독 정보 업데이트 실패:', error);
      throw error;
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      console.log('비밀번호 재설정 이메일 전송:', email);
    } catch (error) {
      console.error('비밀번호 재설정 실패:', error);
      throw error;
    }
  };

  // 이메일 인증 메일 재전송
  const resendVerificationEmail = async (email: string) => {
    try {
      await authService.resendConfirmation(email);
      console.log('인증 이메일 재전송:', email);
    } catch (error) {
      console.error('인증 이메일 재전송 실패:', error);
      throw error;
    }
  };

  return {
    currentUser,
    isLoggedIn,
    isPremium,
    isLoading,
    freeReadingsToday,
    maxFreeReadingsPerDay,
    canUseFreeReading,
    getFreeReadingStatus,
    initializeUser,
    login,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    logout,
    updatePreferences,
    updateProfile,
    updateSubscription,
    resetPassword,
    resendVerificationEmail,
    incrementFreeReading,
    resetFreeReadings,
    upgradeToPremium,
    downgradeToPremium,
    refreshPremiumStatus,
    setTestAccountPremium,
    checkPremiumStatus
  };
});
