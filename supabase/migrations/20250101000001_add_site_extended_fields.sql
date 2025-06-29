-- 현장 테이블에 추가 필드 추가
ALTER TABLE sites_fire_inspection_v2 ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE sites_fire_inspection_v2 ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE sites_fire_inspection_v2 ADD COLUMN IF NOT EXISTS manager_phone TEXT;
ALTER TABLE sites_fire_inspection_v2 ADD COLUMN IF NOT EXISTS manager_email TEXT;
ALTER TABLE sites_fire_inspection_v2 ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE sites_fire_inspection_v2 ADD COLUMN IF NOT EXISTS notes TEXT;

-- 테이블 설명 업데이트
COMMENT ON COLUMN sites_fire_inspection_v2.phone IS '현장 전화번호';
COMMENT ON COLUMN sites_fire_inspection_v2.manager_name IS '소방안전관리자 이름';
COMMENT ON COLUMN sites_fire_inspection_v2.manager_phone IS '소방안전관리자 전화번호';
COMMENT ON COLUMN sites_fire_inspection_v2.manager_email IS '소방안전관리자 이메일';
COMMENT ON COLUMN sites_fire_inspection_v2.approval_date IS '사용승인일';
COMMENT ON COLUMN sites_fire_inspection_v2.notes IS '현장 특이사항';