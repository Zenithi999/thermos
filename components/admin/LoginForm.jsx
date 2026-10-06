"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/browser";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    if (signInError) {
      setPending(false);
      setError(
        signInError.message.includes("Invalid login")
          ? "Имэйл эсвэл нууц үг буруу байна."
          : `Нэвтрэхэд алдаа гарлаа: ${signInError.message}`
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="login-form">
      <div className="field">
        <label htmlFor="email">Имэйл</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="password">Нууц үг</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Нэвтэрч байна…" : "Нэвтрэх"}
      </button>
    </form>
  );
}
