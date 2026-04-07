import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qusaxioqizwrkqaaftdx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1c2F4aW9xaXp3cmtxYWFmdGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjIwMjYsImV4cCI6MjA5MDY5ODAyNn0.3rUGmHJ2rBBHB8P0DsXyGmlaGHavUEYKD4XKrvsFq1g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
