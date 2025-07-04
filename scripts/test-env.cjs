/**
 * @file test-env.cjs
 * @description Test script to verify environment variables are properly set
 * @author fmw666@github
 * @version 1.0.0
 * @date 2025-07-01
 */

// Load environment variables from .env file if it exists
try {
  const dotenv = require('dotenv');
  dotenv.config();
  console.log('[INFO] Loaded environment variables from .env file');
} catch (error) {
  console.log('[INFO] dotenv not available, using system environment variables');
}

// Required environment variables
const requiredVars = {
  'VITE_SUPABASE_URL': 'Supabase project URL',
  'VITE_SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',
  'VITE_SUPABASE_POSTGRES_URL': 'Database connection string',
  'VITE_SUPABASE_STORAGE_BUCKET_NAME': 'Storage bucket name'
};

// Optional environment variables
const optionalVars = {
  'VITE_SUPABASE_SERVICE_ROLE_KEY': 'Service role key (recommended for storage operations)'
};

console.log('[INFO] ========================================');
console.log('[INFO] Environment Variables Test');
console.log('[INFO] ========================================');

// Test Supabase connection (if service role key is available)
async function testSupabaseConnection() {
  if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n[INFO] Testing Supabase connection with service role key...');
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        console.log(`  ⚠️  Connection test failed: ${error.message}`);
      } else {
        console.log(`  ✅ Connection successful! Found ${data.length} existing buckets.`);
      }
    } catch (error) {
      console.log(`  ⚠️  Connection test failed: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  // Check required variables
  console.log('\n[INFO] Required Environment Variables:');
  let allRequiredSet = true;

  Object.entries(requiredVars).forEach(([varName, description]) => {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive values
      const maskedValue = varName.includes('KEY') || varName.includes('URL') 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
        : value;
      console.log(`  ✅ ${varName.padEnd(30)} - ${description} (${maskedValue})`);
    } else {
      console.log(`  ❌ ${varName.padEnd(30)} - ${description} (MISSING)`);
      allRequiredSet = false;
    }
  });

  // Check optional variables
  console.log('\n[INFO] Optional Environment Variables:');
  Object.entries(optionalVars).forEach(([varName, description]) => {
    const value = process.env[varName];
    if (value) {
      const maskedValue = `${value.substring(0, 10)}...${value.substring(value.length - 10)}`;
      console.log(`  ✅ ${varName.padEnd(30)} - ${description} (${maskedValue})`);
    } else {
      console.log(`  ⚠️  ${varName.padEnd(30)} - ${description} (NOT SET)`);
    }
  });

  // Summary
  console.log('\n[INFO] ========================================');
  if (allRequiredSet) {
    console.log('[INFO] ✅ All required environment variables are set!');
    console.log('[INFO] You can now run the initialization scripts.');
  } else {
    console.log('[ERROR] ❌ Some required environment variables are missing!');
    console.log('[ERROR] Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Test Supabase connection
  await testSupabaseConnection();

  console.log('\n[INFO] Environment test completed.');
}

// Run the main function
main().catch(err => {
  console.error('[ERROR] Error during environment test:', err);
  process.exit(1);
});
