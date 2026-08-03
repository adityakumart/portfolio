import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from '../../config/supabase';

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_KEY;

// Fail fast if credentials are missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env file');
}

// Create and export the client
export const supabase = createClient(supabaseUrl, supabaseKey);
