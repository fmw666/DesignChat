/**
 * @file init_supabase_auth.cjs
 * @description Script to update Supabase auth email template for verification codes.
 * @author fmw666@github
 * @version 1.0.0
 * @date 2025-07-01
 *
 * This script updates the Supabase authentication email templates (confirmation, magic link) for DesignChat.
 * It is intended for development and deployment automation.
 *
 * Usage:
 *   1. Ensure you have the correct Supabase access token and project ref.
 *   2. Set VITE_SUPABASE_ACCESS_TOKEN and VITE_SUPABASE_PROJECT_REF as environment variables.
 *   3. Run this script with Node.js: `node init_supabase_auth.cjs`
 *
 * Note: This script is for development/automation purposes. Do not expose credentials in production.
 */

// Use global fetch if available (Node 18+), otherwise require node-fetch
let fetchFn;
try {
  fetchFn = fetch;
} catch {
  fetchFn = require('node-fetch');
}

const SUPABASE_ACCESS_TOKEN = process.env.VITE_SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.VITE_SUPABASE_PROJECT_REF;

if (!SUPABASE_ACCESS_TOKEN || !PROJECT_REF) {
  console.error('[ERROR] VITE_SUPABASE_ACCESS_TOKEN and VITE_SUPABASE_PROJECT_REF must be set as environment variables.');
  process.exit(1);
}

const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const EMAIL_SUBJECT = '[DesignChat] Please confirm your verification code';
const EMAIL_CONTENT = '<h3>The verification code expires within <u>three minutes</u></h3>\n\n<p>Please enter this code: {{ .Token }}</p>';

const payload = {
  // signup confirm
  mailer_subjects_confirmation: EMAIL_SUBJECT,
  mailer_templates_confirmation_content: EMAIL_CONTENT,
  // magic link
  mailer_subjects_magic_link: EMAIL_SUBJECT,
  mailer_templates_magic_link_content: EMAIL_CONTENT,
};

/**
 * Updates the Supabase auth email templates for verification codes.
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('[INFO] Updating Supabase auth email templates for verification code...');
    const response = await fetchFn(API_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[ERROR] Failed to update email template:', data);
      process.exit(1);
    }
    console.log('[INFO] Email template updated successfully');
  } catch (error) {
    console.error('[ERROR] Error updating email template:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[ERROR] Error updating email template:', err);
  process.exit(1);
});
