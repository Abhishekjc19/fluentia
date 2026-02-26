import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = 
  process.env.SUPABASE_SERVICE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY || '';

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseServiceKey}`);
}

// Use service key for both clients since we're doing server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
