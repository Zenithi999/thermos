import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, assertSupabaseEnv } from "./env";

// Cookie-less client for public storefront reads and checkout RPCs.
export function createPublicClient() {
  assertSupabaseEnv();
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
