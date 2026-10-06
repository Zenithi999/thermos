export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Newer projects call it "publishable key", older ones "anon key" — either works.
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export function assertSupabaseEnv() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase тохируулаагүй байна. .env.local файлд NEXT_PUBLIC_SUPABASE_URL болон NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY-г оруулна уу (README-г үзнэ үү)."
    );
  }
}
