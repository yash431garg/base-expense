import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPA_URL || ''; // Your Supabase URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPA_API_KEY || ''; // Your Anon Public API Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
