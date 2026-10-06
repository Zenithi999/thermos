import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";

// Signed-in customer for the current request (null when signed out).
export const getCurrentCustomer = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: admin }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);

  // Accounts confirmed by email have no profile row yet — fall back to sign-up details
  const meta = user.user_metadata || {};
  return {
    supabase,
    user,
    isAdmin: Boolean(admin),
    profile: {
      full_name: profile?.full_name ?? meta.full_name ?? "",
      phone: profile?.phone ?? meta.phone ?? "",
      city: profile?.city ?? "",
      district: profile?.district ?? "",
      khoroo: profile?.khoroo ?? "",
      address: profile?.address ?? "",
    },
  };
});
