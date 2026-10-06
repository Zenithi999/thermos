"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "../../app/(store)/(main)/account/actions";
import Icon from "../Icons";

function SignInForm({ next }) {
  const [state, formAction, pending] = useActionState(signIn, null);
  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="si-email">Имэйл</label>
        <input id="si-email" name="email" type="email" className="input" autoComplete="email" defaultValue={state?.values?.email} required />
      </div>
      <div className="field">
        <label htmlFor="si-password">Нууц үг</label>
        <input id="si-password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      {state?.message && <div className="alert alert-error" role="alert">{state.message}</div>}
      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Нэвтэрч байна…" : "Нэвтрэх"}
      </button>
    </form>
  );
}

function SignUpForm({ next }) {
  const [state, formAction, pending] = useActionState(signUp, null);
  const errors = state?.errors || {};
  const v = state?.values || {};

  if (state?.confirm) {
    return (
      <div className="auth-confirm">
        <span className="success-icon"><Icon name="mail" size={30} /></span>
        <h2>Имэйлээ шалгана уу</h2>
        <p className="muted">
          <b>{v.email}</b> хаяг руу баталгаажуулах холбоос илгээлээ. Холбоос дээр дарсны дараа автоматаар нэвтэрнэ.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="auth-form">
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="su-name">Нэр</label>
        <input id="su-name" name="full_name" className="input" autoComplete="name" defaultValue={v.full_name} aria-invalid={Boolean(errors.full_name) || undefined} required />
        {errors.full_name && <span className="error-text">{errors.full_name}</span>}
      </div>
      <div className="field">
        <label htmlFor="su-phone">Утасны дугаар</label>
        <input id="su-phone" name="phone" className="input" inputMode="numeric" autoComplete="tel" placeholder="99112233" defaultValue={v.phone} aria-invalid={Boolean(errors.phone) || undefined} required />
        {errors.phone && <span className="error-text">{errors.phone}</span>}
      </div>
      <div className="field">
        <label htmlFor="su-email">Имэйл</label>
        <input id="su-email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email} aria-invalid={Boolean(errors.email) || undefined} required />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      <div className="field">
        <label htmlFor="su-password">Нууц үг</label>
        <input id="su-password" name="password" type="password" className="input" autoComplete="new-password" aria-invalid={Boolean(errors.password) || undefined} required />
        {errors.password ? <span className="error-text">{errors.password}</span> : <span className="hint">Хамгийн багадаа 6 тэмдэгт</span>}
      </div>
      {state?.message && <div className="alert alert-error" role="alert">{state.message}</div>}
      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
        {pending ? "Бүртгэж байна…" : "Бүртгүүлэх"}
      </button>
    </form>
  );
}

export default function AuthForms({ next = "/account", initialTab = "signin" }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "signin"} className={tab === "signin" ? "active" : undefined} onClick={() => setTab("signin")}>
          Нэвтрэх
        </button>
        <button type="button" role="tab" aria-selected={tab === "signup"} className={tab === "signup" ? "active" : undefined} onClick={() => setTab("signup")}>
          Бүртгүүлэх
        </button>
      </div>
      {tab === "signin" ? <SignInForm next={next} /> : <SignUpForm next={next} />}
      <ul className="auth-perks">
        <li><Icon name="check" size={16} strokeWidth={2} /> Хаягаа хадгалж, дараагийн захиалгаа хурдан хийнэ</li>
        <li><Icon name="check" size={16} strokeWidth={2} /> Бүх захиалгынхаа явцыг нэг дороос харна</li>
      </ul>
    </div>
  );
}
