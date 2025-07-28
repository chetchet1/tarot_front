// 웹용 Mock Supabase Service
// 실제 웹에서는 진짜 Supabase 클라이언트 사용

export interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: any;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export class SupabaseService {
  private static instance: SupabaseService;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Auth methods
  async signUp(email: string, password: string): Promise<AuthResponse> {
    console.log('Mock signUp:', email);
    
    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
      user_metadata: {}
    };

    const mockSession: Session = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user: mockUser
    };

    this.currentUser = mockUser;
    this.currentSession = mockSession;

    return {
      data: {
        user: mockUser,
        session: mockSession
      },
      error: null
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    console.log('Mock signIn:', email);
    return this.signUp(email, password); // Mock에서는 동일
  }

  async signOut(): Promise<{ error: Error | null }> {
    console.log('Mock signOut');
    this.currentUser = null;
    this.currentSession = null;
    return { error: null };
  }

  async getUser(): Promise<{ data: { user: User | null }; error: Error | null }> {
    return {
      data: { user: this.currentUser },
      error: null
    };
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: Error | null }> {
    return {
      data: { session: this.currentSession },
      error: null
    };
  }

  // Database methods
  from(table: string) {
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null })
        }),
        range: async (from: number, to: number) => ({ data: [], error: null }),
        then: async (callback: any) => callback({ data: [], error: null })
      }),
      insert: (data: any) => ({
        select: () => ({
          then: async (callback: any) => callback({ data: [data], error: null })
        }),
        then: async (callback: any) => callback({ data: [data], error: null })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => callback({ data: [data], error: null })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => callback({ data: null, error: null })
        })
      })
    };
  }

  // Storage methods
  get storage() {
    return {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => ({
          data: { path: `mock/${path}` },
          error: null
        }),
        download: async (path: string) => ({
          data: new Blob(['mock data']),
          error: null
        }),
        remove: async (paths: string[]) => ({
          data: null,
          error: null
        })
      })
    };
  }
}

export const supabaseService = SupabaseService.getInstance();

// 호환성을 위한 export
export const supabase = supabaseService;
