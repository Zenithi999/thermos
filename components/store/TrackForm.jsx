"use client";

import { useActionState } from "react";
import { trackOrder } from "../../app/(store)/actions";
import OrderDetails from "./OrderDetails";

export default function TrackForm() {
  const [state, formAction, pending] = useActionState(trackOrder, null);
  const v = state?.values || {};

  return (
    <div className="track">
      <form action={formAction} className="panel track-form">
        <div className="field">
          <label htmlFor="order_number">Захиалгын дугаар</label>
          <input id="order_number" name="order_number" className="input" placeholder="NM-260930-1234" defaultValue={v.order_number} required />
        </div>
        <div className="field">
          <label htmlFor="phone">Утасны дугаар</label>
          <input id="phone" name="phone" className="input" inputMode="numeric" placeholder="99112233" defaultValue={v.phone} required />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending ? "Хайж байна…" : "Шалгах"}
        </button>
      </form>

      {state && !state.ok && <div className="alert alert-error" role="alert">{state.message}</div>}
      {state?.ok && (
        <div className="panel">
          <OrderDetails order={state.order} />
        </div>
      )}
    </div>
  );
}
