import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "../../../../../components/admin/ConfirmButton";
import Icon from "../../../../../components/Icons";
import { requireAdmin } from "../../../../../lib/auth";
import { ORDER_STATUS, PAYMENT_STATUS, formatDate, formatPrice } from "../../../../../lib/format";
import { updateOrderStatus, updatePaymentStatus } from "../../../actions";

export const metadata = { title: "Захиалга" };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const FLOW = ["pending", "confirmed", "shipped", "delivered"];
const NEXT_LABEL = {
  pending: "Баталгаажуулах",
  confirmed: "Хүргэлтэнд гаргах",
  shipped: "Хүргэгдсэн гэж тэмдэглэх",
};

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);
  if (!order) notFound();

  const st = ORDER_STATUS[order.status];
  const pay = PAYMENT_STATUS[order.payment_status];
  const cancelled = order.status === "cancelled";
  const nextStatus = FLOW[FLOW.indexOf(order.status) + 1];

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/orders" className="back-link">← Захиалгууд</Link>
          <h1 className="order-title">
            {order.order_number}
            <span className={`badge badge-${st.tone}`}>{st.label}</span>
          </h1>
          <p className="muted">{formatDate(order.created_at)}</p>
        </div>
        {!cancelled && nextStatus && (
          <form action={updateOrderStatus}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button type="submit" className="btn btn-primary">
              <Icon name="check" /> {NEXT_LABEL[order.status]}
            </button>
          </form>
        )}
      </header>

      <div className="form-layout">
        <div className="form-main">
          <section className="card card-pad">
            <h2 className="card-title">Бараа</h2>
            <ul className="order-items">
              {items?.map((item) => (
                <li key={item.id}>
                  <span className="thumb">
                    {item.product_image && <Image src={item.product_image} alt="" width={40} height={72} />}
                  </span>
                  <span className="order-item-name">
                    {item.product_id ? <Link href={`/admin/products/${item.product_id}`}>{item.product_name}</Link> : item.product_name}
                    <small>{formatPrice(item.unit_price)} × {item.quantity}</small>
                  </span>
                  <b>{formatPrice(item.line_total)}</b>
                </li>
              ))}
            </ul>
            <dl className="totals">
              <div><dt>Барааны дүн</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div><dt>Хүргэлт</dt><dd>{order.shipping_fee === 0 ? "Үнэгүй" : formatPrice(order.shipping_fee)}</dd></div>
              <div className="totals-grand"><dt>Нийт</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </section>

          {order.note && (
            <section className="card card-pad">
              <h2 className="card-title">Тэмдэглэл</h2>
              <p>{order.note}</p>
            </section>
          )}
        </div>

        <aside className="form-side">
          <section className="card card-pad">
            <h2 className="card-title">Захиалагч</h2>
            <dl className="info-list">
              <div><dt>Нэр</dt><dd>{order.customer_name}</dd></div>
              <div>
                <dt>Утас</dt>
                <dd><a href={`tel:${order.phone}`} className="link">{order.phone}</a></dd>
              </div>
              {order.email && (
                <div><dt>Имэйл</dt><dd><a href={`mailto:${order.email}`} className="link">{order.email}</a></dd></div>
              )}
              <div>
                <dt>Хаяг</dt>
                <dd>
                  {order.city}, {order.district}
                  {order.khoroo && `, ${order.khoroo}`}
                  <br />
                  {order.address}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card card-pad">
            <h2 className="card-title">Төлөв өөрчлөх</h2>
            {cancelled ? (
              <p className="muted">Цуцлагдсан захиалгыг өөрчлөх боломжгүй. Бараа үлдэгдэлд буцаж нэмэгдсэн.</p>
            ) : (
              <>
                <form action={updateOrderStatus} className="inline-form">
                  <input type="hidden" name="id" value={order.id} />
                  <select name="status" className="select" defaultValue={order.status} aria-label="Захиалгын төлөв">
                    {FLOW.map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
                  </select>
                  <button type="submit" className="btn btn-outline btn-sm">Хадгалах</button>
                </form>
                <form action={updateOrderStatus}>
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <ConfirmButton message="Захиалгыг цуцлах уу? Бараа үлдэгдэлд буцаж нэмэгдэнэ." className="btn btn-danger btn-sm btn-block">
                    Захиалга цуцлах
                  </ConfirmButton>
                </form>
              </>
            )}
          </section>

          <section className="card card-pad">
            <h2 className="card-title">
              Төлбөр <span className={`badge badge-${pay.tone}`}>{pay.label}</span>
            </h2>
            <form action={updatePaymentStatus} className="inline-form">
              <input type="hidden" name="id" value={order.id} />
              <select name="payment_status" className="select" defaultValue={order.payment_status} aria-label="Төлбөрийн төлөв">
                {Object.entries(PAYMENT_STATUS).map(([value, p]) => <option key={value} value={value}>{p.label}</option>)}
              </select>
              <button type="submit" className="btn btn-outline btn-sm">Хадгалах</button>
            </form>
          </section>
        </aside>
      </div>
    </>
  );
}
