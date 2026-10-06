"use client";

import { useActionState } from "react";
import { saveSettings } from "../../app/admin/actions";

export default function SettingsForm({ settings }) {
  const [state, formAction, pending] = useActionState(saveSettings, null);
  const s = settings || {};

  return (
    <form action={formAction} className="settings-form">
      <section className="card card-pad">
        <h2 className="card-title">Хүргэлт</h2>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="shipping_fee">Хүргэлтийн төлбөр (₮)</label>
            <input id="shipping_fee" name="shipping_fee" className="input" inputMode="numeric" defaultValue={s.shipping_fee} />
          </div>
          <div className="field">
            <label htmlFor="free_shipping_over">Үнэгүй хүргэлтийн доод дүн (₮)</label>
            <input id="free_shipping_over" name="free_shipping_over" className="input" inputMode="numeric" defaultValue={s.free_shipping_over} />
            <span className="hint">0 бол үнэгүй хүргэлт байхгүй</span>
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <h2 className="card-title">Холбоо барих</h2>
        <p className="muted small">Сайтын доод хэсэг болон “Хүргэлт ба буцаалт” хуудсанд харагдана.</p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="phone">Утас</label>
            <input id="phone" name="phone" className="input" defaultValue={s.phone} placeholder="7700 0000" />
          </div>
          <div className="field">
            <label htmlFor="email">Имэйл</label>
            <input id="email" name="email" type="email" className="input" defaultValue={s.email} />
          </div>
          <div className="field span-2">
            <label htmlFor="address">Хаяг</label>
            <input id="address" name="address" className="input" defaultValue={s.address} placeholder="Улаанбаатар, Сүхбаатар дүүрэг, …" />
          </div>
          <div className="field">
            <label htmlFor="instagram_url">Instagram</label>
            <input id="instagram_url" name="instagram_url" className="input" defaultValue={s.instagram_url} placeholder="https://instagram.com/…" />
          </div>
          <div className="field">
            <label htmlFor="facebook_url">Facebook</label>
            <input id="facebook_url" name="facebook_url" className="input" defaultValue={s.facebook_url} placeholder="https://facebook.com/…" />
          </div>
        </div>
      </section>

      <div className="save-bar">
        {state?.message && (
          <span className={`form-msg ${state.ok ? "ok" : "err"}`} role="status">{state.message}</span>
        )}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Хадгалж байна…" : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}
