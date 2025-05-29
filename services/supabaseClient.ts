import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

console.log('🔍 Environment Variable Debug:');
console.log('Raw SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('Raw SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
console.log('Processed URL:', supabaseUrl);
console.log('Processed Key:', supabaseAnonKey);

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'None',
  keyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : 'None'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  console.error('📝 Make sure your .env file has:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...');
} else {
  console.log('✅ Supabase configuration looks good!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection on startup
if (supabaseUrl && supabaseAnonKey) {
  console.log('🧪 Testing Supabase connection...');
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection test successful');
        console.log('Session status:', data.session ? 'Active session found' : 'No active session');
      }
    })
    .catch((error) => {
      console.error('❌ Supabase connection test error:', error);
    });
} 