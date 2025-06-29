-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles_fire_v2 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'inspector' CHECK (role IN ('inspector', 'admin', 'manager')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 점검 팀 멤버 테이블
CREATE TABLE IF NOT EXISTS inspection_team_members_fire_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections_fire_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles_fire_v2(id) ON DELETE CASCADE,
  added_by UUID REFERENCES user_profiles_fire_v2(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inspection_id, user_id)
);

-- 점검 댓글 테이블
CREATE TABLE IF NOT EXISTS inspection_comments_fire_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections_fire_v2(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues_fire_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles_fire_v2(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE user_profiles_fire_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_team_members_fire_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_comments_fire_v2 ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view all profiles" ON user_profiles_fire_v2
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles_fire_v2
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles_fire_v2
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 팀 멤버 정책
CREATE POLICY "Team members can view team" ON inspection_team_members_fire_v2
  FOR SELECT USING (true);

CREATE POLICY "Users can add team members" ON inspection_team_members_fire_v2
  FOR INSERT WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can remove team members they added" ON inspection_team_members_fire_v2
  FOR DELETE USING (auth.uid() = added_by OR auth.uid() = user_id);

-- 댓글 정책
CREATE POLICY "Anyone can view comments" ON inspection_comments_fire_v2
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add comments" ON inspection_comments_fire_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON inspection_comments_fire_v2
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON inspection_comments_fire_v2
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_inspection_team_members_inspection_id ON inspection_team_members_fire_v2(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_team_members_user_id ON inspection_team_members_fire_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_inspection_comments_inspection_id ON inspection_comments_fire_v2(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_comments_issue_id ON inspection_comments_fire_v2(issue_id);
CREATE INDEX IF NOT EXISTS idx_inspection_comments_user_id ON inspection_comments_fire_v2(user_id);

-- 트리거 함수 (업데이트 시간 자동 갱신)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles_fire_v2 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_comments_updated_at 
  BEFORE UPDATE ON inspection_comments_fire_v2 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();