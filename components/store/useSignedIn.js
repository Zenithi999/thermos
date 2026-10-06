"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase/env";
import { createClient } from "../../lib/supabase/browser";

// Whether a customer (or admin) is signed in. Re-checked on every navigation because
// sign-in/sign-out happen in server actions, which the browser client is not told about.
export function useSignedIn() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [pathname]);

  return signedIn;
}
