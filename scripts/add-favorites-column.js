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

async function addFavoritesColumn() {
  try {
    console.log('Adding favorites column to profiles table...');
    
    // Add the favorites column if it doesn't exist
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'favorites'
          ) THEN
            ALTER TABLE profiles ADD COLUMN favorites uuid[] DEFAULT '{}';
            RAISE NOTICE 'Added favorites column to profiles table';
          ELSE
            RAISE NOTICE 'Favorites column already exists';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.error('Error adding favorites column:', error);
      return;
    }

    console.log('✅ Successfully added favorites column to profiles table');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addFavoritesColumn(); 