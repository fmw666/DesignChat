# DesignChat Initialization Scripts

This directory contains scripts for initializing the DesignChat application's Supabase backend.

## Available Scripts

### Main Initialization Script
- `init.cjs` - Main orchestrator script that can run all or specific initialization scripts

### Individual Scripts
- `init_supabase_tables.cjs` - Creates database tables (chat_msgs, assets, model_configs)
- `init_supabase_storage.cjs` - Creates storage buckets and sets up security policies
- `init_supabase_auth.cjs` - Configures Supabase authentication settings (sets up email templates, updates auth policies, and applies recommended security/auth options)

## Quick Start

### 1. Set up Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
# Supabase Project URL (from Settings > API in your Supabase dashboard)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anon Key (from Settings > API in your Supabase dashboard)
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (for admin operations like creating buckets)
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Supabase Database Connection String (for table initialization)
VITE_SUPABASE_POSTGRES_URL=postgresql://postgres.your-project-ref:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Storage bucket name
VITE_SUPABASE_STORAGE_BUCKET_NAME=designchat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Initialization Scripts

#### Run All Scripts (Recommended)
```bash
npm run init
```

#### Run Specific Scripts
```bash
# Initialize only database tables
npm run init:tables

# Initialize only storage buckets
npm run init:storage

# Initialize only authentication settings
npm run init:auth

# Show help for all initialization scripts
npm run init:help

# Test environment variable configuration
npm run test:env

# Test Supabase storage security policies
npm run test:storage

# Run all scripts explicitly
npm run init:all
```

#### Direct Script Execution
```bash
# Run all scripts
node scripts/init.cjs

# Run specific script
node scripts/init.cjs tables
node scripts/init.cjs storage
node scripts/init.cjs auth

# Show help
node scripts/init.cjs --help
```

## Getting Supabase Credentials

### 1. Project URL and Anon Key
1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy the **Project URL** and **anon public key**

### 2. Database Connection String
1. Go to your Supabase project dashboard
2. Navigate to **Settings > Database**
3. Scroll down to **Connection string**
4. Select **URI** format
5. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

### 3. Service Role Key (Required for Storage Bucket Creation)
1. Go to your Supabase project dashboard
2. Navigate to **Settings > API**
3. Copy the **service_role secret key** (not the anon key)
4. This key has admin privileges and is required for creating storage buckets

## Script Features

### Environment Variable Support
- Automatically loads variables from `.env` file
- Validates required environment variables before execution
- Clear error messages for missing variables

### Error Handling
- Graceful handling of existing buckets/tables/auth settings
- Detailed logging with success/failure indicators
- Summary report after execution

### Storage Security Policies
The storage initialization script automatically sets up Row Level Security (RLS) policies:
- **Authenticated uploads**: Only logged-in users can upload files
- **Authenticated downloads**: Only logged-in users can view files
- **User ownership**: Users can only update/delete their own files (based on folder structure)
- **Public access**: Public read access for shared files

### Auth Initialization
The auth initialization script (`init_supabase_auth.cjs`) helps you:
- Set up custom authentication email templates (e.g., for magic link, password reset, etc.)
- Apply recommended authentication security settings
- Update auth policies as needed for your app
- Ensure a secure and user-friendly authentication experience

### Flexibility
- Run all scripts or specific ones
- Command-line argument support
- Help documentation built-in

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**
   - Ensure your `.env` file exists and contains all required variables
   - Check that variable names match exactly (case-sensitive)

2. **"Script file not found"**
   - Ensure you're running the script from the project root directory
   - Check that all script files exist in the `scripts/` directory

3. **"Connection failed"**
   - Verify your Supabase credentials are correct
   - Check your internet connection
   - Ensure your Supabase project is active

4. **"new row violates row-level security policy" (Storage Bucket Creation)**
   - This error occurs when trying to create storage buckets with anon key
   - **Solution**: Use the service role key instead of anon key
   - Set `VITE_SUPABASE_SERVICE_ROLE_KEY` in your `.env` file
   - The service role key has admin privileges and can bypass RLS policies

5. **"Auth configuration not applied" (Auth Initialization)**
   - Ensure you have the correct permissions and service role key for updating auth settings
   - Double-check your Supabase project and API keys

### Debug Mode
For more detailed logging, you can run scripts directly with Node.js debug flags:

```bash
NODE_OPTIONS="--trace-warnings" npm run init
```

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use environment variables in production deployments
- The anon key is safe for client-side use
- Keep service role keys secret and server-side only
