// 테스트용 모의 서비스
export const authService = {
  async signUp(email: string, password: string, name?: string) {
    console.log('Mock signup:', email);
    return { data: { user: { id: 'test-user', email } }, error: null };
  },

  async signIn(email: string, password: string) {
    console.log('Mock signin:', email);
    return { data: { user: { id: 'test-user', email } }, error: null };
  },

  async signOut() {
    console.log('Mock signout');
  },

  async getCurrentUser() {
    return null;
  }
};

export const profileService = {
  async getProfile(userId: string) {
    return {
      id: userId,
      email: 'test@example.com',
      is_premium: false,
      preferences: {
        theme: 'dark',
        language: 'ko',
        notifications: {
          dailyReading: true,
          weeklyInsight: false,
          promotions: true
        },
        soundEnabled: true,
        vibrationEnabled: true
      }
    };
  },

  async updateProfile(userId: string, updates: any) {
    console.log('Mock update profile:', updates);
    return { ...updates, id: userId };
  }
};

export const readingService = {
  async createReading(reading: any) {
    console.log('Mock create reading:', reading);
    return { ...reading, id: 'test-reading-' + Date.now() };
  },

  async getReadings(userId: string, limit = 10) {
    return [];
  }
};

export const subscriptionService = {
  async getCurrentSubscription(userId: string) {
    return null;
  }
};

export const dailyCardService = {
  async saveDailyCard(userId: string, cardId: number, orientation: string) {
    console.log('Mock save daily card:', cardId, orientation);
    return { user_id: userId, card_id: cardId, orientation };
  },

  async getTodayCard(userId: string) {
    return null;
  }
};

export const masterDataService = {
  async getTarotCards() {
    // 로컬 데이터 사용
    return [];
  },

  async getTarotSpreads() {
    // 로컬 데이터 사용
    return [];
  }
};
