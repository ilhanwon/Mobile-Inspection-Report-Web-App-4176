import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://njmgfyttuzzrfmftxbll.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbWdmeXR0dXp6cmZtZnR4YmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzAxNjAsImV4cCI6MjA2NjcwNjE2MH0.Aqy9TRZsc061ANxl4OSOKHM4bGeOlE6bNI7LVEbUuzg'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false // URL에서 세션 감지 비활성화
  }
})