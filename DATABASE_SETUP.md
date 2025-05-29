# Database Setup Guide

This guide explains how to automatically sync your Supabase database with the `supabase_schema.sql` file.

## 🚀 Quick Setup

### Option 1: Automated Script (Recommended)

1. **Add your Service Role Key to environment variables:**
   ```bash
   # Add to your .env file
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
   > **Where to find your Service Role Key:**
   > - Go to your Supabase Dashboard
   > - Navigate to Settings → API
   > - Copy the `service_role` key (not the `anon` key)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the database initialization:**
   ```bash
   npm run db:init
   ```

### Option 2: Manual SQL Execution

If the automated script doesn't work, you can run the SQL manually:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Click "Run"

## 🔄 Keeping Schema in Sync

### For Development

Every time you update `supabase_schema.sql`, run:
```bash
npm run db:setup
```

### For Production/Team Collaboration

1. **Using Supabase CLI (Professional approach):**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize Supabase project
   supabase init
   
   # Link to your remote project
   supabase link --project-ref your-project-ref
   
   # Create a migration from your schema
   supabase db diff --file initial_schema
   
   # Apply migrations
   supabase db push
   ```

2. **Using GitHub Actions (CI/CD):**
   Create `.github/workflows/deploy-db.yml`:
   ```yaml
   name: Deploy Database
   on:
     push:
       branches: [main]
       paths: ['supabase_schema.sql']
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm install
         - run: npm run db:init
           env:
             SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
             SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   ```

## 📋 What the Script Does

The `scripts/init-database.js` script:

1. ✅ Creates the `profiles` table for user management
2. ✅ Creates the `categories` table for tool categories  
3. ✅ Creates the `products` table for AI tools
4. ✅ Creates search indexes for better performance
5. ✅ Inserts the Marketing category automatically
6. ✅ Handles conflicts gracefully (won't duplicate data)

## 🛠 Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY" Error
- Make sure you've added the service role key to your `.env` file
- The service role key is different from the anon key
- Find it in Supabase Dashboard → Settings → API

### "Permission Denied" Errors
- Ensure you're using the `service_role` key, not the `anon` key
- The service role key has admin privileges needed for schema changes

### Tables Already Exist
- This is normal! The script uses `CREATE TABLE IF NOT EXISTS`
- Existing data won't be affected

### Script Fails to Run
- Try running the SQL manually in Supabase SQL Editor
- Check your internet connection
- Verify your Supabase project is active

## 🔐 Security Notes

- **Never commit your `.env` file** - it contains sensitive keys
- Use environment variables in production
- The service role key has full database access - keep it secure
- For team projects, use Supabase CLI migrations instead

## 📚 Advanced: Migration-Based Approach

For larger teams or production apps, consider using Supabase migrations:

```bash
# Create a new migration
supabase migration new add_marketing_category

# Edit the migration file in supabase/migrations/
# Then apply it
supabase db push
```

This approach provides:
- Version control for database changes
- Rollback capabilities  
- Team collaboration
- Production deployment safety 