-- 이메일 확인 비활성화를 위한 설정
-- 이 설정은 Supabase 대시보드에서도 변경 가능합니다

-- RLS 정책 업데이트 (이메일 확인 없이도 접근 가능하도록)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles_fire_v2 (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'inspector');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 생성 시 자동으로 프로필 생성하는 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 이메일 확인 상태와 관계없이 로그인 허용하는 정책
ALTER TABLE user_profiles_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles_fire_v2 ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 프로필을 볼 수 있도록 허용
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles_fire_v2;
CREATE POLICY "Users can view all profiles" ON user_profiles_fire_v2 
  FOR SELECT USING (true);

-- 사용자가 자신의 프로필을 업데이트할 수 있도록 허용
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles_fire_v2;
CREATE POLICY "Users can update own profile" ON user_profiles_fire_v2 
  FOR UPDATE USING (auth.uid() = id);

-- 사용자가 자신의 프로필을 삽입할 수 있도록 허용
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles_fire_v2;
CREATE POLICY "Users can insert own profile" ON user_profiles_fire_v2 
  FOR INSERT WITH CHECK (auth.uid() = id);