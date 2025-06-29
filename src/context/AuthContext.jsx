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
  const createUserProfile = async (userId, fullName, email) => {
    try {
      console.log('프로필 생성 시도:', { userId, fullName, email });

      // 먼저 프로필이 이미 존재하는지 확인
      const { data: existingProfile } = await supabase
        .from('user_profiles_fire_v2')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log('프로필이 이미 존재함');
        return { success: true, isExisting: true };
      }

      // 프로필 생성 시도
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
        
        // 중복 키 오류인 경우 정상으로 처리
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.log('프로필이 이미 존재함 (중복 키)');
          return { success: true, isExisting: true };
        }
        
        return { success: false, error: error.message };
      }

      console.log('프로필 생성 성공:', data);
      return { success: true, data };
    } catch (error) {
      console.error('프로필 생성 예외:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      console.log('회원가입 시도:', { email, fullName });

      // 클라이언트 측 이메일 유효성 검사
      if (!isValidEmail(email)) {
        throw new Error('올바른 이메일 주소를 입력해주세요. (예: user@example.com)');
      }

      // 비밀번호 길이 확인
      if (password.length < 6) {
        throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
      }

      // 회원가입 (이메일 확인 비활성화)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
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
        } else {
          throw new Error(`회원가입에 실패했습니다: ${error.message}`);
        }
      }

      console.log('회원가입 성공:', data);

      // 사용자가 생성되었으면 프로필 생성 및 로그인 시도
      if (data.user) {
        try {
          // 1. 프로필 생성 (트리거가 실패할 수 있으므로 수동으로도 시도)
          const profileResult = await createUserProfile(
            data.user.id, 
            fullName, 
            email.trim().toLowerCase()
          );

          if (!profileResult.success && !profileResult.isExisting) {
            console.warn('프로필 생성 실패, 하지만 계속 진행:', profileResult.error);
          }

          // 2. 세션이 없다면 즉시 로그인 시도
          if (!data.session) {
            console.log('즉시 로그인 시도...');
            
            // 짧은 지연 후 로그인 시도
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 여러 번 로그인 시도
            for (let attempt = 1; attempt <= 5; attempt++) {
              console.log(`로그인 시도 ${attempt}/5...`);
              
              try {
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                  email: email.trim().toLowerCase(),
                  password,
                });
                
                if (!loginError && loginData.user) {
                  console.log('로그인 성공!');
                  setUser(loginData.user);
                  
                  // 로그인 성공 후 프로필 재확인
                  if (!profileResult.success) {
                    await createUserProfile(
                      loginData.user.id, 
                      fullName, 
                      email.trim().toLowerCase()
                    );
                  }
                  
                  return { data: loginData, error: null };
                }
                
                console.log(`로그인 시도 ${attempt} 실패:`, loginError?.message);
              } catch (loginException) {
                console.log(`로그인 시도 ${attempt} 예외:`, loginException.message);
              }
              
              // 마지막 시도가 아니라면 대기
              if (attempt < 5) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
            
            // 모든 시도 실패 시에도 성공으로 처리 (수동 로그인 안내)
            console.log('자동 로그인 실패, 수동 로그인 필요');
            return { 
              data, 
              error: null,
              needsManualLogin: true,
              message: '회원가입이 완료되었습니다. 로그인 탭에서 로그인해주세요.'
            };
          } else {
            // 세션이 이미 있다면 바로 설정
            console.log('세션이 이미 존재함');
            setUser(data.user);
            return { data, error: null };
          }
        } catch (profileError) {
          console.error('프로필 생성/로그인 중 예외:', profileError);
          
          // 프로필 생성 실패해도 계정은 생성되었으므로 성공으로 처리
          return { 
            data, 
            error: null,
            needsManualLogin: true,
            message: '회원가입이 완료되었습니다. 로그인 탭에서 로그인해주세요.'
          };
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('회원가입 실패:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('로그인 시도:', email);

      // 클라이언트 측 이메일 유효성 검사
      if (!isValidEmail(email)) {
        throw new Error('올바른 이메일 주소를 입력해주세요.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
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

      // 로그인 성공 시 프로필 확인 및 생성
      if (data.user) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles_fire_v2')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!profile) {
            console.log('프로필이 없음, 생성 시도...');
            await createUserProfile(
              data.user.id,
              data.user.user_metadata?.full_name || 'User',
              data.user.email
            );
          }
        } catch (profileError) {
          console.warn('프로필 확인/생성 중 오류:', profileError);
          // 프로필 오류가 있어도 로그인은 성공으로 처리
        }
      }

      console.log('로그인 성공:', data.user?.email);
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