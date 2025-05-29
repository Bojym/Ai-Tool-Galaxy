import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeUserAdmin(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // First, get the user ID from auth.users
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (authError) {
      console.error('❌ Error finding user:', authError);
      return;
    }

    if (!authUsers) {
      console.error('❌ User not found with email:', email);
      return;
    }

    console.log(`👤 Found user ID: ${authUsers.id}`);

    // Update the profile to make them admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', authUsers.id);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return;
    }

    console.log('✅ Successfully made user admin!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${authUsers.id}`);
    console.log('👑 Admin status: true');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npm run make-admin your-email@example.com');
  process.exit(1);
}

makeUserAdmin(email); 