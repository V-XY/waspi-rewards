import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicConfig } from '@/app/lib/config/env';

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(publicConfig.supabaseUrl, publicConfig.supabasePublishableKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components may not be able to mutate cookies.
        }
      },
    },
  });
}
