"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { placeOrder } from "../../app/(store)/actions";
import { formatPrice } from "../../lib/format";
import { AIMAGS, UB, UB_DISTRICTS } from "../../lib/locations";
import { LAST_ORDER_KEY, shippingFor } from "../../lib/shipping";
import { useCart } from "../cart/CartProvider";
import Icon from "../Icons";

function Field({ name, label, error, children, hint, className = "" }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? (
        <span className="error-text" id={`${name}-error`}>{error}</span>
      ) : (
        hint && <span className="hint">{hint}</span>
      )}
    </div>
  );
}

export default function CheckoutForm({ settings, defaults = {}, signedIn = false }) {
  const router = useRouter();
  const { items, subtotal, hydrated, clear } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, null);
  const [city, setCity] = useState(state?.values?.city || defaults.city || UB);

  useEffect(() => {
    if (!state?.ok) return;
    try {
      window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(state.order));
    } catch {
      // sessionStorage unavailable — success page falls back to the order number in the URL
    }
    clear();
    router.replace(`/order/success?n=${encodeURIComponent(state.order.order_number)}`);
  }, [state, clear, router]);

  if (!hydrated) return <div className="skeleton" style={{ height: 480 }} />;

  if (!items.length && !state?.ok) {
    return (
      <div className="empty">
        <Icon name="bag" size={40} strokeWidth={1.3} />
        <h2>Таны сагс хоосон байна</h2>
        <p>Захиалга хийхийн тулд эхлээд бараа сонгоно уу.</p>
        <Link href="/shop" className="btn btn-primary">Дэлгүүр үзэх</Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal, settings);
  const errors = state?.errors || {};
  const v = state?.values || defaults;
  const invalid = (name) => (errors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});

  return (
    <form action={formAction} className="checkout" noValidate>
      <input type="hidden" name="items" value={JSON.stringify(items.map(({ id, quantity }) => ({ id, quantity })))} />

      <div className="checkout-main">
        {state?.message && (
          <div className="alert alert-error" role="alert">{state.message}</div>
        )}

        {!signedIn && (
          <div className="signin-nudge">
            <Icon name="user" size={20} />
            <span>Бүртгэлтэй юу? Нэвтэрвэл хаяг тань автоматаар бөглөгдөж, захиалгын түүхээ харах боломжтой.</span>
            <Link href="/account/login?next=/checkout" className="btn btn-outline btn-sm">Нэвтрэх</Link>
          </div>
        )}

        <section className="panel">
          <h2 className="panel-title"><span className="step-num">1</span>Холбоо барих мэдээлэл</h2>
          <div className="form-grid">
            <Field name="customer_name" label="Нэр" error={errors.customer_name}>
              <input id="customer_name" name="customer_name" className="input" autoComplete="name" defaultValue={v.customer_name} required {...invalid("customer_name")} />
            </Field>
            <Field name="phone" label="Утасны дугаар" error={errors.phone} hint="Хүргэлтийн үед энэ дугаар руу залгана">
              <input id="phone" name="phone" className="input" inputMode="numeric" autoComplete="tel" placeholder="99112233" maxLength={12} defaultValue={v.phone} required {...invalid("phone")} />
            </Field>
            <Field name="email" label="Имэйл (заавал биш)" error={errors.email} className="span-2">
              <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={v.email} {...invalid("email")} />
            </Field>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title"><span className="step-num">2</span>Хүргэлтийн хаяг</h2>
          <div className="form-grid">
            <Field name="city" label="Хот / аймаг" error={errors.city}>
              <select id="city" name="city" className="select" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value={UB}>{UB}</option>
                {AIMAGS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field name="district" label={city === UB ? "Дүүрэг" : "Сум"} error={errors.district}>
              {city === UB ? (
                <select id="district" name="district" className="select" defaultValue={v.district || ""} required {...invalid("district")}>
                  <option value="" disabled>Сонгох</option>
                  {UB_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input id="district" name="district" className="input" defaultValue={v.district} required {...invalid("district")} />
              )}
            </Field>
            <Field name="khoroo" label={city === UB ? "Хороо" : "Баг"}>
              <input id="khoroo" name="khoroo" className="input" placeholder={city === UB ? "Жишээ: 3-р хороо" : ""} defaultValue={v.khoroo} />
            </Field>
            <Field name="address" label="Дэлгэрэнгүй хаяг" error={errors.address} className="span-2">
              <textarea id="address" name="address" className="textarea" rows={3} placeholder="Байр, орц, давхар, тоот, орцны код" defaultValue={v.address} required {...invalid("address")} />
            </Field>
            <Field name="note" label="Нэмэлт тэмдэглэл" className="span-2">
              <input id="note" name="note" className="input" placeholder="Жишээ: 18:00-с хойш хүргэнэ үү" defaultValue={v.note} />
            </Field>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title"><span className="step-num">3</span>Төлбөр</h2>
          <div className="pay-options">
            <label className="pay-option selected">
              <input type="radio" name="payment" value="later" defaultChecked />
              <span className="pay-icon"><Icon name="phone" /></span>
              <span>
                <b>Захиалга баталгаажсаны дараа төлөх</b>
                <small>Манай ажилтан тантай холбогдож төлбөрийн мэдээллийг өгнө.</small>
              </span>
            </label>
            <div className="pay-option disabled" aria-disabled="true">
              <span className="pay-icon"><Icon name="card" /></span>
              <span>
                <b>QPay / Карт</b>
                <small>Удахгүй нэмэгдэнэ</small>
              </span>
            </div>
          </div>
        </section>
      </div>

      <aside className="checkout-summary panel">
        <h2 className="panel-title">Таны захиалга</h2>
        <ul className="summary-items">
          {items.map((item) => (
            <li key={item.id}>
              <span className="summary-thumb">
                {item.image && <Image src={item.image} alt="" width={60} height={108} />}
                <span className="summary-qty">{item.quantity}</span>
              </span>
              <span className="summary-name">
                {item.name}
                {item.capacity && <small>{item.capacity}</small>}
              </span>
              <span className="summary-price">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Барааны дүн</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div><dt>Хүргэлт</dt><dd>{shipping === 0 ? "Үнэгүй" : formatPrice(shipping)}</dd></div>
          <div className="totals-grand"><dt>Нийт</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
        </dl>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending}>
          {pending ? "Илгээж байна…" : "Захиалга батлах"}
        </button>
        <p className="summary-note">
          <Icon name="shield" size={16} /> Эцсийн үнэ, үлдэгдлийг захиалга үүсгэх үед дахин шалгана.
        </p>
      </aside>
    </form>
  );
}
