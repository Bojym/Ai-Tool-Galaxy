import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
  console.log('💡 Make sure your .env file contains:');
  console.log('   SUPABASE_URL=your_supabase_url');
  console.log('   SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addMarketingCategory() {
  try {
    console.log('🚀 Adding Marketing category to database...');
    
    // Check if Marketing category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', 'Marketing')
      .single();
    
    if (existingCategory) {
      console.log('✅ Marketing category already exists!');
      console.log(`   ID: ${existingCategory.id}`);
      console.log(`   Description: ${existingCategory.description}`);
      return;
    }
    
    // Insert Marketing category
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: 'Marketing',
          description: 'AI tools for marketing strategies, copywriting, and content creation'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error adding Marketing category:', error.message);
      
      if (error.message.includes('relation "categories" does not exist')) {
        console.log('💡 It looks like the categories table doesn\'t exist yet.');
        console.log('   Please run the full database schema first:');
        console.log('   1. Go to Supabase Dashboard → SQL Editor');
        console.log('   2. Copy and paste the contents of supabase_schema.sql');
        console.log('   3. Click "Run"');
        console.log('   4. Then run this script again');
      }
      
      process.exit(1);
    }
    
    console.log('🎉 Marketing category added successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Description: ${data.description}`);
    console.log('');
    console.log('📈 You can now:');
    console.log('   - Filter tools by Marketing category');
    console.log('   - Add marketing tools like Jasper AI and Copy.ai');
    console.log('   - Search for marketing-related terms');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the function
addMarketingCategory();

export { addMarketingCategory }; 