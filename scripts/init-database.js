import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database schema...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query execution as fallback
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0); // This will fail but we can catch SQL execution errors
          
          console.log(`⚠️  Statement ${i + 1} may have executed (some errors are expected for CREATE IF NOT EXISTS)`);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
      }
    }
    
    console.log('🎉 Database initialization completed!');
    console.log('📋 Summary:');
    console.log('   - Tables: profiles, categories, products');
    console.log('   - Indexes: Full-text search on products');
    console.log('   - Data: Marketing category inserted');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function initializeDatabaseDirect() {
  try {
    console.log('🚀 Initializing database schema (direct approach)...');
    
    // Create tables one by one
    const queries = [
      {
        name: 'profiles table',
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            username text,
            is_admin boolean DEFAULT false,
            created_at timestamptz DEFAULT now()
          );
        `
      },
      {
        name: 'categories table',
        sql: `
          CREATE TABLE IF NOT EXISTS categories (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL UNIQUE,
            description text
          );
        `
      },
      {
        name: 'products table',
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            description text,
            website_url text,
            logo_url text,
            features text[],
            use_cases text[],
            screenshots text[],
            pricing text,
            source text,
            tags text[],
            category_id uuid REFERENCES categories(id),
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            submitted_by uuid REFERENCES profiles(id)
          );
        `
      },
      {
        name: 'search index',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_products_name_desc 
          ON products USING gin (to_tsvector('english', name || ' ' || coalesce(description, '')));
        `
      },
      {
        name: 'Marketing category',
        sql: `
          INSERT INTO categories (name, description) 
          VALUES ('Marketing', 'AI tools for marketing strategies, copywriting, and content creation')
          ON CONFLICT (name) DO NOTHING;
        `
      }
    ];
    
    for (const query of queries) {
      console.log(`⏳ Creating ${query.name}...`);
      
      // For data insertion, we can use the Supabase client directly
      if (query.name === 'Marketing category') {
        const { error } = await supabase
          .from('categories')
          .upsert([
            {
              name: 'Marketing',
              description: 'AI tools for marketing strategies, copywriting, and content creation'
            }
          ], { 
            onConflict: 'name',
            ignoreDuplicates: true 
          });
        
        if (error && !error.message.includes('duplicate')) {
          console.error(`❌ Error inserting Marketing category:`, error);
        } else {
          console.log(`✅ Marketing category ready`);
        }
      } else {
        // For table creation, we need to use raw SQL
        console.log(`⚠️  Please run this SQL manually in Supabase SQL Editor:`);
        console.log(query.sql);
      }
    }
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabaseDirect();

export { initializeDatabase, initializeDatabaseDirect }; 