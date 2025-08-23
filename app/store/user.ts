import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, UserPreferences, Subscription } from '../models/user';
import { authService, profileService } from '../services/supabase';
import { Capacitor } from '@capacitor/core';
import { SUPABASE_CONFIG } from '../config/env';
import { revenueCatService } from '../services/RevenueCatService';

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null);
  const isLoggedIn = computed(() => !!currentUser.value && !currentUser.value.isAnonymous);
  const isPremium = computed(() => currentUser.value?.isPremium || false);
  const isAdmin = computed(() => currentUser.value?.isAdmin || false);
  const isLoading = ref(false);
  const isInitialized = ref(false); // 초기화 완료 여부
  
  // 무료 점괘 관리 (통계용으로만 사용)
  const freeReadingsToday = ref(0);
  const lastFreeReadingDate = ref<string | null>(null);
  
  // 무료 점괘 사용 가능 여부 (항상 true - 광고 시청으로 무제한)
  const canUseFreeReading = computed(() => {
    // 기획 변경: 무료 사용자도 광고 시청으로 무제한 가능
    return true;
  });
  
  // 무료 점괘 사용 가능 여부 (통계용)
  const getFreeReadingStatus = () => {
    resetFreeReadingsIfNewDay(); // 날짜 변경 체크
    return {
      canUse: true, // 항상 가능 (광고 시청)
      remaining: -1, // 무제한
      total: -1, // 무제한
      used: freeReadingsToday.value // 통계용
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
  
  // 무료 점괘 사용 (통계용)
  const incrementFreeReading = () => {
    if (isPremium.value) return; // 프리미엄 사용자는 카운트 안함
    
    resetFreeReadingsIfNewDay(); // 날짜 바뀐었으면 리셋
    
    // 기획 변경: 제한 없이 카운트만 증가 (통계용)
    freeReadingsToday.value++;
    saveFreeReadingData();
  };
  
  // 무료 사용 초기화 (테스트용)
  const resetFreeReadings = () => {
    freeReadingsToday.value = 0;
    lastFreeReadingDate.value = getTodayString();
    saveFreeReadingData();
  };

  // 프리미엄 상태 확인 (특정 사용자의 프리미엄 상태 확인)
  const checkPremiumStatus = async (userId?: string): Promise<boolean> => {
    try {
      const targetUserId = userId || currentUser.value?.id;
      if (!targetUserId) {
        console.log('확인할 사용자 ID가 없음');
        return false;
      }

      // 프로필 테이블에서 프리미엄 상태 조회 (DB를 신뢰)
      const { data: profile, error } = await authService.supabase
        .from('profiles')
        .select('is_premium, email')
        .eq('id', targetUserId)
        .maybeSingle();
      
      if (error) {
        console.log('프로필 조회 실패:', error.message);
        return false;
      }
      
      // DB의 is_premium 값을 우선적으로 사용
      let isPremiumUser = profile?.is_premium || false;
      
      // 테스트 계정인 경우 DB 값과 관계없이 프리미엄으로 설정 (테스트용)
      if (profile?.email === 'premium@example.com' || currentUser.value?.email === 'premium@example.com') {
        console.log('🎉 프리미엄 테스트 계정 감지! DB 상태:', profile?.is_premium);
        isPremiumUser = true;
      }
      
      console.log(`사용자 ${profile?.email || targetUserId} 프리미엄 상태: ${isPremiumUser}`);
      
      // 현재 로그인 사용자의 경우 로컬 상태 업데이트
      if (!userId || targetUserId === currentUser.value?.id) {
        if (currentUser.value) {
          currentUser.value.isPremium = isPremiumUser;
        }
      }
      
      return isPremiumUser;
    } catch (error) {
      console.log('프리미엄 상태 확인 중 예외:', error);
      return false;
    }
  };

  // 프리미엄 상태 새로고침 (컴포넌트 이동 시 상태 유지를 위해)
  const refreshPremiumStatus = async (): Promise<boolean> => {
    if (!currentUser.value?.id) {
      console.log('[refreshPremiumStatus] 사용자 없음');
      return false;
    }
    
    console.log('[refreshPremiumStatus] 프리미엄 상태 새로고침 시작');
    const isPremiumUser = await checkPremiumStatus();
    console.log('[refreshPremiumStatus] 프리미엄 상태:', isPremiumUser);
    
    // 상태 재초기화
    if (currentUser.value) {
      currentUser.value.isPremium = isPremiumUser;
      saveUser();
    }
    
    return isPremiumUser;
  };

  // 프로필 생성 또는 업데이트
  const ensureProfileExists = async (userId: string, email?: string) => {
    try {
      // 프로필 존재 확인
      const { data: existingProfile } = await authService.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        // 프로필이 없으면 생성
        console.log('프로필 생성 시도:', userId);
        const { error: insertError } = await authService.supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            is_premium: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('프로필 생성 실패:', insertError);
          return false;
        }
        console.log('프로필 생성 성공');
      }
      return true;
    } catch (error) {
      console.error('프로필 확인/생성 실패:', error);
      return false;
    }
  };

  // 테스트 계정 프리미엄 설정
  const setTestAccountPremium = async (userId: string, isPremium: boolean = true) => {
    try {
      // 프로필 존재 확인 및 생성
      await ensureProfileExists(userId);

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
    try {
      if (currentUser.value) {
        localStorage.setItem('tarot_user', JSON.stringify(currentUser.value));
        console.log('사용자 저장 완료:', currentUser.value.isAnonymous ? '익명' : '로그인');
      }
    } catch (error) {
      console.error('사용자 저장 실패:', error);
    }
  };

  const loadUser = () => {
    console.log('사용자 로드 시도');
    try {
      const saved = localStorage.getItem('tarot_user');
      if (saved) {
        const userData = JSON.parse(saved);
        
        // 데이터 유효성 검증
        if (userData && typeof userData === 'object' && userData.id) {
          currentUser.value = userData;
          console.log('사용자 로드 성공:', userData.isAnonymous ? '익명' : '로그인');
          return;
        }
      }
      
      // 저장된 데이터가 없거나 유효하지 않으면 새 익명 사용자 생성
      console.log('저장된 사용자 없음, 새 익명 사용자 생성');
      currentUser.value = createAnonymousUser();
      saveUser();
    } catch (error) {
      console.error('사용자 로드 실패:', error);
      currentUser.value = createAnonymousUser();
      saveUser();
    }
  };

  // 사용자 초기화 (개선된 버전)
  const initializeUser = async () => {
    console.log('=== 사용자 초기화 시작 ===');
    
    try {
      isLoading.value = true;
      
      // 무료 점괴 데이터 로드
      loadFreeReadingData();
      
      // 로컬 스토리지에서 사용자 정보 로드 (BUT 익명 사용자는 무시)
      const saved = localStorage.getItem('tarot_user');
      if (saved) {
        const userData = JSON.parse(saved);
        // 익명 사용자는 무시하고 null로 설정
        if (userData && userData.isAnonymous) {
          console.log('저장된 익명 사용자 무시, 로그인 필요');
          localStorage.removeItem('tarot_user');
          currentUser.value = null;
        } else if (userData && userData.id && userData.email) {
          // 정상적인 로그인 사용자만 로드
          currentUser.value = userData;
          console.log('로컬 사용자 정보 로드 완료:', userData.email);
        } else {
          currentUser.value = null;
        }
      } else {
        currentUser.value = null;
      }
      
      // Supabase 인증 상태 확인 (웹에서만 자동 확인)
      const shouldCheckAuth = !Capacitor.isNativePlatform();
      console.log('Supabase 인증 상태 확인:', shouldCheckAuth ? '웹 환경 - 확인' : '모바일 환경 - 건너뛰기');
      
      try {
        let user = null;
        if (shouldCheckAuth) {
          user = await authService.getCurrentUser();
          console.log('Supabase 사용자 확인 결과:', user ? 'logged_in' : 'not_logged_in');
        } else {
          // 모바일에서는 명시적으로 세션만 확인 (자동 로그인 시도 안함)
          const { data: { session } } = await authService.supabase.auth.getSession();
          if (session?.user) {
            user = session.user;
            console.log('모바일 세션 확인:', user.email);
          }
        }
        
        if (user && user.email_confirmed_at) {
          // 이메일 인증이 완료된 사용자 - 정보 업데이트
          console.log('인증된 사용자 감지, 정보 업데이트 중...');
          
          // 프로필 존재 확인 및 생성
          await ensureProfileExists(user.id, user.email);
          
          // 프로필 정보 및 프리미엄 상태 확인 (오류 발생해도 계속 진행)
          let isPremiumUser = false;
          let isAdminUser = false;
          try {
            // 프로필 정보 가져오기
            const profile = await profileService.getProfile(user.id);
            if (profile) {
              isAdminUser = profile.is_admin || false;
              console.log('관리자 권한 확인:', isAdminUser);
            }
            
            // DB에서 프리미엄 상태 확인 (테스트 계정 처리는 checkPremiumStatus 내부에서)
            isPremiumUser = await checkPremiumStatus(user.id);
            console.log('프리미엄 상태 확인 완료:', isPremiumUser);
          } catch (premiumError) {
            console.warn('프로필/프리미엄 상태 확인 실패:', premiumError);
          }
          
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
            isAdmin: isAdminUser,
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
          console.log('로그인 사용자 정보 업데이트 완료');
        } else if (user && !user.email_confirmed_at) {
          console.log('이메일 미인증 사용자 - 익명 사용자로 처리');
          if (currentUser.value?.isAnonymous !== false) {
            currentUser.value = createAnonymousUser();
            saveUser();
          }
        } else {
          console.log('비로그인 상태 확인');
          // 로그인되지 않은 경우 currentUser를 null로 설정 (익명 사용자 생성하지 않음)
          if (currentUser.value) {
            console.log('로컬 로그인 정보 제거');
            localStorage.removeItem('tarot_user');
            currentUser.value = null;
          }
        }
      } catch (authError) {
        console.warn('Supabase 인증 확인 실패 (로컬 정보 유지):', authError.message);
        // 네트워크 오류 등의 경우 로컬 정보 유지
      }
      
      // 인증 상태 변화 감지 설정 (웹에서만)
      if (!Capacitor.isNativePlatform()) {
        authService.onAuthStateChange(async (event, session) => {
          console.log('인증 상태 변화:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          
          // 프로필 존재 확인 및 생성
          await ensureProfileExists(user.id, user.email);
          
          // 프리미엄 상태 확인
          let isPremiumUser = false;
          try {
            // DB에서 프리미엄 상태 확인 (테스트 계정 처리는 checkPremiumStatus 내부에서)
            isPremiumUser = await checkPremiumStatus(user.id);
          } catch (error) {
            console.warn('로그인 시 프리미엄 상태 확인 실패:', error);
          }
          
          // RevenueCat에 사용자 연결 (네이티브 앱에서만)
          if (Capacitor.isNativePlatform() && revenueCatService) {
            try {
              await revenueCatService.loginUser(user.id);
            } catch (error) {
              console.warn('RevenueCat 사용자 연결 실패:', error);
            }
          }
          
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
            isAdmin: isAdminUser,
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
          console.log('로그인 이벤트 처리 완료');
        } else if (event === 'SIGNED_OUT') {
          console.log('로그아웃 이벤트 처리');
          currentUser.value = null;
          localStorage.removeItem('tarot_user');
        }
      });
      }
      
    } catch (error) {
      console.error('사용자 초기화 실패:', error);
      // 오류 발생 시에도 currentUser는 null로 유지 (익명 사용자 생성하지 않음)
      if (currentUser.value) {
        localStorage.removeItem('tarot_user');
        currentUser.value = null;
      }
    } finally {
      // 로딩 상태 해제
      isLoading.value = false;
      isInitialized.value = true;
      console.log('사용자 초기화 완료');
    }
  };

  // 이메일 로그인
  const login = async (email: string, password: string) => {
    console.log('로그인 시작:', email);
    
    try {
      isLoading.value = true;
      
      // 로그인 시도
      const data = await authService.signIn(email, password);
      const user = data?.user;
      
      if (user) {
        console.log('로그인 성공:', user.email);
        
        // 프로필 확인은 비동기로 처리 (로그인 차단하지 않음)
        setTimeout(async () => {
          try {
            await ensureProfileExists(user.id, user.email);
            const isPremiumUser = await checkPremiumStatus(user.id);
            console.log('프리미엄 상태 확인:', isPremiumUser);
            
            // 프리미엄 상태만 업데이트
            if (currentUser.value) {
              currentUser.value.isPremium = isPremiumUser;
              saveUser();
            }
          } catch (error) {
            console.warn('프로필/프리미엄 확인 실패 (무시):', error);
          }
        }, 100);
        
        // 즉시 사용자 정보 설정 (프리미엄 상태와 관리자 권한은 DB에서 확인)
        let isPremiumUser = false;
        let isAdminUser = false;
        
        // DB에서 프리미엄 상태와 관리자 권한 확인
        try {
          const { data: profile } = await authService.supabase
            .from('profiles')
            .select('is_premium, is_admin')
            .eq('id', user.id)
            .maybeSingle();
          
          isPremiumUser = profile?.is_premium || false;
          isAdminUser = profile?.is_admin || false;
          
          // 테스트 계정인 경우 항상 프리미엄으로 설정
          if (email === 'premium@example.com') {
            console.log('🎯 프리미엄 테스트 계정 감지! DB 상태:', isPremiumUser);
            isPremiumUser = true;
          }
          
          if (isAdminUser) {
            console.log('👑 관리자 계정 로그인');
          }
        } catch (error) {
          console.warn('로그인 시 프로필 정보 확인 실패:', error);
        }
        
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
          isAdmin: isAdminUser,
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
        console.log('로그인 완료');
        return user;
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    } finally {
      // finally 블록은 항상 실행되도록 보장
      isLoading.value = false;
      console.log('로그인 로딩 상태 해제');
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
      
      const data = await authService.signUp(email, password, userData);
      const user = data?.user;
      
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
      
      // 개선된 OAuth 서비스 사용
      const { oauthService } = await import('../services/oauth');
      await oauthService.signInWithGoogle();
      
      // 모바일: Chrome Custom Tabs로 브라우저 열림
      // 웹: OAuth 리다이렉트가 일어나며, 콜백에서 로그인 처리
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
    console.log('로그아웃 시작');
    
    // 로딩 상태 즉시 설정
    isLoading.value = true;
    
    try {
      // 로그아웃 전 사용자 ID 저장 (기록 삭제용)
      const userId = currentUser.value?.id;
      const wasPremium = currentUser.value?.isPremium;
      
      // 먼저 로컬 상태 초기화
      currentUser.value = null;
      localStorage.removeItem('tarot_user');
      
      // 로컬 스토리지 정리
      const supabaseKey = 'sb-' + SUPABASE_CONFIG.url.replace('https://', '').split('.')[0] + '-auth-token';
      localStorage.removeItem(supabaseKey);
      
      // 프리미엄 사용자였다면 기록 삭제
      if (userId && wasPremium && !userId.startsWith('anon_')) {
        try {
          console.log('프리미엄 사용자 기록 삭제 시작:', userId);
          const { error } = await authService.supabase
            .from('reading_history')
            .delete()
            .eq('user_id', userId);
          
          if (error) {
            console.error('기록 삭제 실패:', error);
          } else {
            console.log('프리미엄 사용자 기록 삭제 완료');
          }
        } catch (error) {
          console.error('기록 삭제 중 오류:', error);
        }
      }
      
      // RevenueCat 로그아웃 (네이티브 앱에서만)
      if (Capacitor.isNativePlatform() && revenueCatService) {
        try {
          await revenueCatService.logoutUser();
        } catch (error) {
          console.warn('RevenueCat 로그아웃 실패:', error);
        }
      }
      
      // Supabase 로그아웃 시도 (비동기, 에러 무시)
      try {
        await authService.signOut();
        console.log('Supabase 로그아웃 성공');
      } catch (error) {
        console.warn('Supabase 로그아웃 실패 (무시):', error);
        // Supabase 로그아웃 실패해도 로컬 로그아웃은 이미 완료
      }
      
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      // 오류가 있어도 로컬에서는 로그아웃 처리
      currentUser.value = null;
      localStorage.removeItem('tarot_user');
    } finally {
      // 로딩 상태 해제 - 반드시 실행되도록 보장
      setTimeout(() => {
        isLoading.value = false;
      }, 0);
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

  // 구독 취소 (프리미엄 -> 무료)
  const cancelSubscription = async () => {
    if (!currentUser.value || currentUser.value.isAnonymous) return;
    
    try {
      const userId = currentUser.value.id;
      
      // 1. 프리미엄 상태 해제
      const { error: profileError } = await authService.supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('id', userId);
      
      if (profileError) {
        console.error('프리미엄 상태 해제 실패:', profileError);
        throw profileError;
      }
      
      // 2. 기록 삭제
      console.log('구독 취소 - 기록 삭제 시작:', userId);
      const { error: deleteError } = await authService.supabase
        .from('reading_history')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('기록 삭제 실패:', deleteError);
        // 기록 삭제 실패해도 계속 진행
      } else {
        console.log('구독 취소 - 기록 삭제 완료');
      }
      
      // 3. 로컬 상태 업데이트
      currentUser.value.isPremium = false;
      if (currentUser.value.subscription) {
        currentUser.value.subscription.status = 'cancelled';
      }
      saveUser();
      
      console.log('구독 취소 완료');
      return true;
    } catch (error) {
      console.error('구독 취소 실패:', error);
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
    isAdmin,
    isLoading,
    isInitialized,
    freeReadingsToday,
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
    cancelSubscription,
    resetPassword,
    resendVerificationEmail,
    incrementFreeReading,
    resetFreeReadings,
    upgradeToPremium,
    downgradeToPremium,
    refreshPremiumStatus,
    setTestAccountPremium,
    checkPremiumStatus,
    ensureProfileExists
  };
});
