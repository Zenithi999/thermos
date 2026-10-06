"use client";

import { useActionState, useState } from "react";
import { saveProfile } from "../../app/(store)/(main)/account/actions";
import { AIMAGS, UB, UB_DISTRICTS } from "../../lib/locations";

export default function ProfileForm({ profile }) {
  const [state, formAction, pending] = useActionState(saveProfile, null);
  const [city, setCity] = useState(profile.city || UB);

  return (
    <form action={formAction} className="form-grid">
      <div className="field">
        <label htmlFor="full_name">Нэр</label>
        <input id="full_name" name="full_name" className="input" defaultValue={profile.full_name} autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="phone">Утас</label>
        <input id="phone" name="phone" className="input" inputMode="numeric" defaultValue={profile.phone} autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="city">Хот / аймаг</label>
        <select id="city" name="city" className="select" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value={UB}>{UB}</option>
          {AIMAGS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="district">{city === UB ? "Дүүрэг" : "Сум"}</label>
        {city === UB ? (
          <select id="district" name="district" className="select" defaultValue={UB_DISTRICTS.includes(profile.district) ? profile.district : ""}>
            <option value="">Сонгох</option>
            {UB_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        ) : (
          <input id="district" name="district" className="input" defaultValue={profile.district} />
        )}
      </div>
      <div className="field">
        <label htmlFor="khoroo">{city === UB ? "Хороо" : "Баг"}</label>
        <input id="khoroo" name="khoroo" className="input" defaultValue={profile.khoroo} />
      </div>
      <div className="field span-2">
        <label htmlFor="address">Дэлгэрэнгүй хаяг</label>
        <textarea id="address" name="address" className="textarea" rows={2} defaultValue={profile.address} placeholder="Байр, орц, давхар, тоот" />
      </div>
      <div className="span-2 form-actions">
        {state?.message && <span className={`form-msg ${state.ok ? "ok" : "err"}`} role="status">{state.message}</span>}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Хадгалж байна…" : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}
