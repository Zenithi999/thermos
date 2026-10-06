"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../../lib/format";
import { shippingFor } from "../../lib/shipping";
import { useCart } from "../cart/CartProvider";
import Icon from "../Icons";
import QuantityStepper from "./QuantityStepper";

export default function CartView({ settings }) {
  const { items, subtotal, hydrated, setQuantity, remove } = useCart();

  if (!hydrated) return <div className="skeleton" style={{ height: 360 }} />;

  if (!items.length) {
    return (
      <div className="empty">
        <Icon name="bag" size={40} strokeWidth={1.3} />
        <h2>Таны сагс хоосон байна</h2>
        <p>Өөрт тохирох термосоо сонгоод сагсандаа нэмээрэй.</p>
        <Link href="/shop" className="btn btn-primary">Дэлгүүр үзэх</Link>
      </div>
    );
  }

  const shipping = shippingFor(subtotal, settings);
  const freeOver = settings.free_shipping_over;
  const remaining = freeOver > 0 ? Math.max(0, freeOver - subtotal) : 0;

  return (
    <div className="cart">
      <ul className="cart-items">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <Link href={`/products/${item.slug}`} className="cart-thumb">
              {item.image && <Image src={item.image} alt={item.name} width={90} height={162} />}
            </Link>
            <div className="cart-info">
              <Link href={`/products/${item.slug}`} className="cart-name">{item.name}</Link>
              {item.capacity && <span className="muted">{item.capacity}</span>}
              <span className="cart-unit">{formatPrice(item.price)}</span>
            </div>
            <div className="cart-actions">
              <QuantityStepper
                value={item.quantity}
                max={item.stock ?? 99}
                onChange={(q) => setQuantity(item.id, q)}
                size="sm"
              />
              <span className="cart-line">{formatPrice(item.price * item.quantity)}</span>
              <button type="button" className="icon-btn cart-remove" onClick={() => remove(item.id)} aria-label={`${item.name} хасах`}>
                <Icon name="trash" size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="cart-summary panel">
        <h2 className="panel-title">Нийт дүн</h2>
        {freeOver > 0 && (
          <div className="free-ship">
            <p>
              {remaining > 0 ? (
                <>Үнэгүй хүргэлт авахад <b>{formatPrice(remaining)}</b> дутуу байна</>
              ) : (
                <>Танд <b>үнэгүй хүргэлт</b> үйлчилнэ</>
              )}
            </p>
            <div className="free-ship-bar">
              <span style={{ width: `${Math.min(100, (subtotal / freeOver) * 100)}%` }} />
            </div>
          </div>
        )}
        <dl className="totals">
          <div><dt>Барааны дүн</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div><dt>Хүргэлт</dt><dd>{shipping === 0 ? "Үнэгүй" : formatPrice(shipping)}</dd></div>
          <div className="totals-grand"><dt>Нийт</dt><dd>{formatPrice(subtotal + shipping)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn btn-primary btn-lg btn-block">
          Захиалах <Icon name="arrowRight" />
        </Link>
        <Link href="/shop" className="btn btn-ghost btn-block">Худалдан авалтаа үргэлжлүүлэх</Link>
      </aside>
    </div>
  );
}
