/**
 * @file init_supabase_storage.cjs
 * @description Script to create default storage buckets in Supabase.
 * @author fmw666@github
 * @version 1.0.0
 * @date 2025-07-01
 *
 * This script connects to a Supabase instance and creates the required storage buckets
 * for the DesignChat application. It is intended for development and deployment automation.
 *
 * Usage:
 *   1. Ensure you have the correct Supabase URL and anon key.
 *   2. Set the SUPABASE_URL and SUPABASE_ANON_KEY environment variables.
 *   3. Run this script with Node.js: `node init_supabase_storage.cjs`
 *
 * Note: This script is for development/automation purposes. Do not expose credentials in production.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
// ? -> Please refer to `docs/supabase/storage/README.md` for how to get the credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Storage bucket configurations for the DesignChat application
 */
const bucketConfigs = [
  {
    name: process.env.VITE_SUPABASE_STORAGE_BUCKET_NAME,
    options: {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: '50MB',
    },
    description: 'General assets images for DesignChat'
  },
];

/**
 * Creates a storage bucket with error handling
 * @param {string} bucketName - Name of the bucket to create
 * @param {Object} options - Bucket configuration options
 * @param {string} description - Description of the bucket purpose
 * @returns {Promise<Object>} Result of bucket creation
 */
async function createBucket(bucketName, options, description) {
  try {
    console.log(`[INFO] Creating bucket '${bucketName}' (${description})...`);
    
    const { data, error } = await supabase.storage.createBucket(bucketName, options);
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`[INFO] Bucket '${bucketName}' already exists, skipping...`);
        return { success: true, message: 'Bucket already exists' };
      }
      throw error;
    }
    
    console.log(`[INFO] Bucket '${bucketName}' created successfully:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`[ERROR] Failed to create bucket '${bucketName}':`, error.message);
    return { success: false, error };
  }
}

/**
 * Sets storage policies for a bucket using SQL
 * @param {string} bucketName - Name of the bucket
 * @returns {Promise<Object>} Result of policy creation
 */
async function setStoragePolicies(bucketName, policies) {
  try {
    console.log(`[INFO] Setting storage policies for bucket '${bucketName}'...`);
    
    // Use the PostgreSQL client for policy creation
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.VITE_SUPABASE_POSTGRES_URL,
    });
    
    await client.connect();
    
    // First, enable RLS on storage.objects if not already enabled
    try {
      await client.query('ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;');
      console.log('[INFO] Row Level Security enabled on storage.objects');
    } catch (error) {
      if (!error.message.includes('already enabled')) {
        console.warn('[WARN] Could not enable RLS on storage.objects:', error.message);
      }
    }
    
    // Drop existing policies for this bucket to avoid conflicts
    try {
      await client.query(`
        DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
        DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
        DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
        DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
      `);
      console.log('[INFO] Dropped existing policies for clean setup');
    } catch (error) {
      console.warn('[WARN] Could not drop existing policies:', error.message);
    }
    
    const results = [];
    
    // Create policies one by one with proper error handling
    const policyQueries = [
      {
        name: 'Allow authenticated uploads',
        sql: `
          CREATE POLICY "Allow authenticated uploads" ON storage.objects
          FOR INSERT
          TO authenticated
          WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'Allow authenticated downloads',
        sql: `
          CREATE POLICY "Allow authenticated downloads" ON storage.objects
          FOR SELECT
          TO authenticated
          USING (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'Allow users to update own files',
        sql: `
          CREATE POLICY "Allow users to update own files" ON storage.objects
          FOR UPDATE
          TO authenticated
          USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Allow users to delete own files',
        sql: `
          CREATE POLICY "Allow users to delete own files" ON storage.objects
          FOR DELETE
          TO authenticated
          USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      }
    ];
    
    for (const policyQuery of policyQueries) {
      try {
        console.log(`[INFO] Creating policy: ${policyQuery.name}`);
        const result = await client.query(policyQuery.sql);
        results.push({ policy: policyQuery.name, success: true, result });
      } catch (error) {
        console.error(`[ERROR] Failed to create policy '${policyQuery.name}':`, error.message);
        results.push({ policy: policyQuery.name, success: false, error });
      }
    }
    
    await client.end();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`[INFO] Storage policies summary: ${successful} successful, ${failed} failed`);
    return { success: failed === 0, results };
    
  } catch (error) {
    console.error(`[ERROR] Failed to set storage policies for bucket '${bucketName}':`, error.message);
    return { success: false, error };
  }
}

/**
 * Lists all existing buckets for verification
 * @returns {Promise<void>}
 */
async function listBuckets() {
  try {
    console.log('[INFO] Listing existing buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('[ERROR] Failed to list buckets:', error.message);
      return;
    }
    
    console.log('[INFO] Existing buckets:');
    data.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });
  } catch (error) {
    console.error('[ERROR] Error listing buckets:', error.message);
  }
}

/**
 * Main entry point for storage bucket creation.
 * Creates all configured buckets and lists existing ones for verification.
 *
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('[INFO] Initializing Supabase storage buckets...');
    console.log(`[INFO] Using Supabase URL: ${supabaseUrl}`);
    
    // List existing buckets first
    await listBuckets();
    
    console.log('\n[INFO] Creating configured buckets...');
    
    // Create all configured buckets
    const results = [];
    for (const config of bucketConfigs) {
      const result = await createBucket(config.name, config.options, config.description);
      results.push({ bucket: config.name, ...result });
      
      // Set storage policies if bucket was created successfully
      if (result.success) {
        console.log(`\n[INFO] Setting up storage policies for bucket '${config.name}'...`);
        const policyResult = await setStoragePolicies(config.name);
        
        if (policyResult.success) {
          console.log(`[INFO] ✅ Storage policies set successfully for bucket '${config.name}'`);
        } else {
          console.error(`[ERROR] ❌ Failed to set some storage policies for bucket '${config.name}'`);
        }
      }
    }
    
    // Summary
    console.log('\n[INFO] Storage initialization summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`  - Successfully created/verified: ${successful} buckets`);
    if (failed > 0) {
      console.log(`  - Failed to create: ${failed} buckets`);
    }
    
    // List buckets again to show final state
    console.log('\n[INFO] Final bucket list:');
    await listBuckets();
    
    console.log('\n[INFO] Storage initialization completed.');
    
  } catch (error) {
    console.error('[ERROR] Error initializing storage:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main().catch(err => {
  console.error('[ERROR] Error initializing storage:', err);
  process.exit(1);
});
