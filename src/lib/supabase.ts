import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://oqhfoooztypjhqsamsnl.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xaGZvb296dHlwamhxc2Ftc25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MjU0NTQsImV4cCI6MjExMDQwMTQ1NH0.naQcgrrJ_fhf2ks66UfNJ6a6HbkTX6uqg0Pqr2lKlgk'
)
