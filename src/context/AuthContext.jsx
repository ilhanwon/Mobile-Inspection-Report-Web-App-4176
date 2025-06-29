import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext();

// 이메일 유효성 검사 함수
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 사용자 세션 확인
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('세션 확인 오류:', error);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('세션 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // 안전한 프로필 생성 함수
  const ensureUserProfile = async (userId, fullName, email) => {
    try {
      console.log('프로필 확인/생성 시도:', { userId, fullName, email });

      // 먼저 프로필이 이미 존재하는지 확인
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles_fire_v2')
        .select('id, full_name, email')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log('프로필이 이미 존재함:', existingProfile);
        return { success: true, data: existingProfile };
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('프로필 조회 오류:', fetchError);
      }

      // 프로필이 없으면 생성
      console.log('프로필 생성 중...');
      const { data, error } = await supabase
        .from('user_profiles_fire_v2')
        .insert([{
          id: userId,
          full_name: fullName || 'User',
          email: email,
          role: 'inspector',
        }])
        .select()
        .single();

      if (error) {
        console.error('프로필 생성 오류:', error);
        
        // 중복 키 오류인 경우 다시 조회
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.log('중복 키 오류, 기존 프로필 조회 중...');
          const { data: retryData } = await supabase
            .from('user_profiles_fire_v2')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (retryData) {
            return { success: true, data: retryData };
          }
        }
        
        return { success: false, error: error.message };
      }

      console.log('프로필 생성 성공:', data);
      return { success: true, data };
    } catch (error) {
      console.error('프로필 처리 예외:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      console.log('회원가입 시도:', { email, fullName });

      // 입력값 검증
      if (!isValidEmail(email)) {
        throw new Error('올바른 이메일 주소를 입력해주세요. (예: user@example.com)');
      }

      if (password.length < 6) {
        throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
      }

      if (!fullName || !fullName.trim()) {
        throw new Error('이름을 입력해주세요.');
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanFullName = fullName.trim();

      // 1. 기존 사용자 확인
      console.log('기존 사용자 확인 중...');
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail?.(cleanEmail) || {};
      
      if (existingUser?.user) {
        throw new Error('이미 등록된 이메일입니다. 로그인을 시도해주세요.');
      }

      // 2. 회원가입 시도
      console.log('회원가입 진행 중...');
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName,
          },
          emailRedirectTo: undefined, // 이메일 확인 링크 비활성화
        }
      });

      if (error) {
        console.error('회원가입 오류:', error);
        
        // 구체적인 오류 메시지 처리
        if (error.message.includes('User already registered')) {
          throw new Error('이미 등록된 이메일입니다. 로그인을 시도해주세요.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('올바른 이메일 주소를 입력해주세요.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
        } else if (error.message.includes('Signup is disabled')) {
          throw new Error('현재 회원가입이 비활성화되어 있습니다.');
        } else if (error.message.includes('Database error')) {
          throw new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`회원가입에 실패했습니다: ${error.message}`);
        }
      }

      console.log('회원가입 결과:', { user: data.user?.id, session: !!data.session });

      if (!data.user) {
        throw new Error('사용자 생성에 실패했습니다.');
      }

      // 3. 프로필 확인/생성
      console.log('프로필 처리 중...');
      const profileResult = await ensureUserProfile(
        data.user.id, 
        cleanFullName, 
        cleanEmail
      );

      if (!profileResult.success) {
        console.warn('프로필 생성 실패, 하지만 계속 진행:', profileResult.error);
      }

      // 4. 세션이 있으면 즉시 로그인 완료
      if (data.session) {
        console.log('즉시 로그인 완료');
        setUser(data.user);
        return { 
          data, 
          error: null,
          success: true,
          message: '회원가입이 완료되고 자동으로 로그인되었습니다.'
        };
      }

      // 5. 세션이 없으면 자동 로그인 시도
      console.log('자동 로그인 시도 시작...');
      
      // 잠시 대기 후 로그인 시도
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 최대 3번 로그인 시도
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`자동 로그인 시도 ${attempt}/3...`);
        
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          
          if (!loginError && loginData.user) {
            console.log('자동 로그인 성공!');
            setUser(loginData.user);
            
            // 로그인 후 프로필 재확인
            await ensureUserProfile(loginData.user.id, cleanFullName, cleanEmail);
            
            return { 
              data: loginData, 
              error: null,
              success: true,
              message: '회원가입이 완료되고 자동으로 로그인되었습니다.'
            };
          }
          
          console.log(`자동 로그인 시도 ${attempt} 실패:`, loginError?.message);
        } catch (loginException) {
          console.error(`자동 로그인 시도 ${attempt} 예외:`, loginException);
        }
        
        // 마지막 시도가 아니라면 잠시 대기
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // 자동 로그인 실패 시 수동 로그인 안내
      console.log('자동 로그인 실패, 수동 로그인 필요');
      return { 
        data, 
        error: null,
        needsManualLogin: true,
        success: true,
        message: '회원가입이 완료되었습니다. 아래에서 로그인해주세요.'
      };

    } catch (error) {
      console.error('회원가입 최종 실패:', error);
      return { 
        data: null, 
        error,
        success: false
      };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('로그인 시도:', email);

      // 입력값 검증
      if (!isValidEmail(email)) {
        throw new Error('올바른 이메일 주소를 입력해주세요.');
      }

      if (!password || password.length < 1) {
        throw new Error('비밀번호를 입력해주세요.');
      }

      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error('로그인 오류:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('계정이 아직 활성화되지 않았습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`로그인에 실패했습니다: ${error.message}`);
        }
      }

      // 로그인 성공 시 프로필 확인
      if (data.user) {
        console.log('로그인 성공, 프로필 확인 중...');
        
        // 프로필이 없으면 생성
        await ensureUserProfile(
          data.user.id,
          data.user.user_metadata?.full_name || 'User',
          data.user.email
        );
      }

      console.log('로그인 완료:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('로그인 실패:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('로그아웃 시도');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('로그아웃 오류:', error);
        throw error;
      }
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};