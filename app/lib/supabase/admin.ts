import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicConfig, serverConfig } from '@/app/lib/config/env';

if (!serverConfig.supabaseSecretKey) {
  throw new Error('SUPABASE_SECRET_KEY is required for server-side privileged operations.');
}

export const supabaseAdmin = createClient(
  publicConfig.supabaseUrl,
  serverConfig.supabaseSecretKey,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);
