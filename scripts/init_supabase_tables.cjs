
/**
 * @file init_supabase_tables.cjs
 * @description Script to create default tables and policies in Supabase PostgreSQL database.
 * @author fmw666@github
 * @version 1.0.0
 * @date 2025-07-01
 *
 * This script connects to a Supabase PostgreSQL instance and creates the required tables (chat_msgs, assets, model_configs)
 * by executing the corresponding SQL files. It is intended for development and deployment automation.
 *
 * Usage:
 *   1. Ensure you have the correct Supabase connection string.
 *   2. Place your table definition SQL files in the docs/supbase/db directory.
 *   3. Run this script with Node.js: `node init_supabase_tables.cjs`
 *
 * Note: This script is for development/automation purposes. Do not expose credentials in production.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read SQL files for table creation
const create_chat_msgs_sql = fs.readFileSync(path.join(__dirname, '../docs/supabase/db/chat_msgs_table.sql'), 'utf8');
const create_assets_sql = fs.readFileSync(path.join(__dirname, '../docs/supabase/db/assets_table.sql'), 'utf8');
const create_model_configs_sql = fs.readFileSync(path.join(__dirname, '../docs/supabase/db/model_configs_table.sql'), 'utf8');

// ? -> Please refer to `docs/supabase/db/README.md` for how to get the connection string
const client = new Client({
  // replace with your Supabase connection string
  connectionString: process.env.VITE_SUPABASE_POSTGRES_URL,
});

/**
 * Main entry point for table creation.
 * Connects to the database, executes table creation SQL, and closes the connection.
 * Logs results to the console.
 *
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('[INFO] Connecting to Supabase...');
    await client.connect();

    // Create chat_msgs table (Run first)
    console.log('[INFO] Creating chat_msgs table...');
    const res_chat_msgs = await client.query(create_chat_msgs_sql);
    console.log('[INFO] Chat messages table result:', res_chat_msgs.rows);
    console.log('[INFO] Chat messages table created successfully.');

    // Create assets table
    console.log('[INFO] Creating assets table...');
    const res_assets = await client.query(create_assets_sql);
    console.log('[INFO] Assets table result:', res_assets.rows);
    console.log('[INFO] Assets table created successfully.');

    // Create model_configs table
    console.log('[INFO] Creating model_configs table...');
    const res_model_configs = await client.query(create_model_configs_sql);
    console.log('[INFO] Model configs table result:', res_model_configs.rows);
    console.log('[INFO] Model configs table created successfully.');
  } catch (error) {
    console.error('[ERROR] Error creating tables:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('[INFO] Tables created and connection closed.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('[ERROR] Error creating tables:', err);
  process.exit(1);
});
