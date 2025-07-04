/**
 * @file test-storage-policies.cjs
 * @description Test script to verify storage policies are working correctly
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

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.VITE_SUPABASE_STORAGE_BUCKET_NAME;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStoragePolicies() {
  try {
    console.log('[INFO] ========================================');
    console.log('[INFO] Testing Storage Policies');
    console.log('[INFO] ========================================');
    
    console.log(`[INFO] Testing bucket: ${bucketName}`);
    
    // Test 1: List buckets
    console.log('\n[INFO] Test 1: Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error(`  ❌ Failed to list buckets: ${bucketsError.message}`);
    } else {
      console.log(`  ✅ Successfully listed ${buckets.length} buckets`);
      buckets.forEach(bucket => {
        console.log(`    - ${bucket.name} (public: ${bucket.public})`);
      });
    }
    
    // Test 2: List files in bucket
    console.log('\n[INFO] Test 2: Listing files in bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list();
    
    if (filesError) {
      console.error(`  ❌ Failed to list files: ${filesError.message}`);
    } else {
      console.log(`  ✅ Successfully listed ${files.length} files in bucket`);
      if (files.length > 0) {
        files.forEach(file => {
          console.log(`    - ${file.name} (${file.metadata?.size || 'unknown size'} bytes)`);
        });
      }
    }
    
    // Test 3: Check bucket policies
    console.log('\n[INFO] Test 3: Checking bucket policies...');
    try {
      const { Client } = require('pg');
      const client = new Client({
        connectionString: process.env.VITE_SUPABASE_POSTGRES_URL,
      });
      
      await client.connect();
      
      const { rows: policies } = await client.query(`
        SELECT policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
        ORDER BY policyname;
      `);
      
      console.log(`  ✅ Found ${policies.length} policies on storage.objects`);
      policies.forEach(policy => {
        console.log(`    - ${policy.policyname} (${policy.cmd} for ${policy.roles.join(', ')})`);
      });
      
      await client.end();
    } catch (error) {
      console.error(`  ❌ Failed to check policies: ${error.message}`);
    }
    
    console.log('\n[INFO] Storage policy tests completed.');
    
  } catch (error) {
    console.error('[ERROR] Error during storage policy tests:', error);
  }
}

// Run the test
testStoragePolicies().catch(err => {
  console.error('[ERROR] Error running storage policy tests:', err);
  process.exit(1);
});
