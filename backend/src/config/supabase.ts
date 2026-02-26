import { createClient } from '@supabase/supabase-js';

console.log('=== ALL ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('All keys containing SUPABASE:', Object.keys(process.env).filter(k => k.toUpperCase().includes('SUPABASE')));
console.log('Total env var count:', Object.keys(process.env).length);
console.log('=================================');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = 
  process.env.SUPABASE_SERVICE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY || '';

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing required Supabase configuration');
  console.error('SUPABASE_URL present:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY present:', !!supabaseServiceKey);
  throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseServiceKey}`);
}

// Use service key for both clients since we're doing server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
