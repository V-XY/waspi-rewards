'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicConfig } from '@/app/lib/config/env';

export const supabase = createBrowserClient(
  publicConfig.supabaseUrl,
  publicConfig.supabasePublishableKey
);
