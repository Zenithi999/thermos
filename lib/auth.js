import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";

// Real authorization check for every admin page and action (proxy.js is only an early redirect).
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=not-admin");

  return { supabase, user };
}
