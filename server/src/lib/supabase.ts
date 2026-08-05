import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bixrljfqzvwtxqkyrpoo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Admin client for server-side operations (uses service role key if available, falls back to anon key)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

export const supabase = createClient(supa