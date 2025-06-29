-- 회원가입 즉시 계정 활성화를 위한 설정

-- 1. 새 사용자 생성 시 즉시 이메일 확인 상태로 설정하는 함수
CREATE OR REPLACE FUNCTION public.auto_confirm_user() 
RETURNS trigger AS $$
BEGIN
  -- 새로 생성된 사용자의 이메일을 즉시 확인된 상태로 설정
  UPDATE auth.users 
  SET email_confirmed_at = NOW(), 
      confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  -- 사용자 프로필도 함께 생성
  INSERT INTO public.user_profiles_fire_v2 (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    NEW.email, 
    'inspector'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles_fire_v2.full_name),
    email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 기존 트리거 제거 후 새 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;

CREATE TRIGGER auto_confirm_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.auto_confirm_user();

-- 3. 기존 미확인 사용자들도 모두 확인 상태로 변경
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- 4. 모든 테이블에 대한 포괄적인 RLS 정책 설정
-- 인증된 사용자라면 이메일 확인 상태와 관계없이 모든 작업 허용

-- 사용자 프로필 테이블
ALTER TABLE user_profiles_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON user_profiles_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON user_profiles_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 현장 테이블
ALTER TABLE sites_fire_inspection_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE sites_fire_inspection_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sites_fire_inspection_v2;
CREATE POLICY "Enable all operations for authenticated users" ON sites_fire_inspection_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 점검 테이블
ALTER TABLE inspections_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON inspections_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON inspections_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 지적사항 테이블
ALTER TABLE issues_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE issues_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON issues_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON issues_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 히스토리 테이블들
ALTER TABLE issue_history_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_history_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON issue_history_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON issue_history_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

ALTER TABLE location_history_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE location_history_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON location_history_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON location_history_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 협업 테이블들
ALTER TABLE inspection_team_members_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_team_members_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON inspection_team_members_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON inspection_team_members_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

ALTER TABLE inspection_comments_fire_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_comments_fire_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON inspection_comments_fire_v2;
CREATE POLICY "Enable all operations for authenticated users" ON inspection_comments_fire_v2 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. 인덱스 최적화
CREATE INDEX IF NOT EXISTS idx_auth_users_email_confirmed ON auth.users(email_confirmed_at);
CREATE INDEX IF NOT EXISTS idx_auth_users_confirmed ON auth.users(confirmed_at);

-- 6. 함수 권한 설정
GRANT EXECUTE ON FUNCTION public.auto_confirm_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_confirm_user() TO authenticated;