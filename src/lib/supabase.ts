import { createClient } from '@supabase/supabase-js';

// Support both Vite-style and Next.js-style envs without hardcoding
let viteEnv: any | undefined;
try {
  // import.meta is available in Vite/ESM builds
  // @ts-ignore
  viteEnv = (import.meta as any).env;
} catch {
  viteEnv = undefined;
}
const supabaseUrl: string | undefined = (viteEnv && viteEnv.VITE_SUPABASE_URL) || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string | undefined = (viteEnv && viteEnv.VITE_SUPABASE_ANON_KEY) || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Non-fatal: app can still run locally without realtime until vars are provided
  console.warn('[Supabase] Missing env: SUPABASE_URL or ANON_KEY');
}

export const supabase = createClient(
  (supabaseUrl as string) || '',
  (supabaseAnonKey as string) || ''
);


