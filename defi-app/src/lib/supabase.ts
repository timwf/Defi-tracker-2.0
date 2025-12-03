import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://czklyzqlunbnkbziubeu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TIfP8N2HF5lTDAgvv9U0oA_U6YBGNI2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
