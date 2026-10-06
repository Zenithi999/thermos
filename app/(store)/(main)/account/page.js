import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "../../../../components/Icons";
import OrderDetails from "../../../../components/store/OrderDetails";
import ProfileForm from "../../../../components/store/ProfileForm";
import { getCurrentCustomer } from "../../../../lib/account";
import { ORDER_STATUS, formatDate, formatPrice } from "../../../../lib/format";
import { signOutCustomer } from "./actions";

export const metadata = { title: "Миний бүртгэл" };

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login");

  const { supabase, user, profile, isAdmin } = customer;
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, subtotal, shipping_fee, total, city, district, address, created_at, items:order_items(product_name, product_image, unit_price, quantity, line_total)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const firstName = (profile.full_name || "").split(" ")[0];

  return (
    <div className="container account">
      <header className="page-head account-head">
        <div>
          <span className="eyebrow">Миний бүртгэл</span>
          <h1>Сайн байна уу{firstName ? `, ${firstName}` : ""}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <div className="account-actions">
          {isAdmin && (
            <Link href="/admin" className="btn btn-primary">
              <Icon name="dashboard" /> Админ самбар
            </Link>
          )}
          <form action={signOutCustomer}>
            <button type="submit" className="btn btn-outline">
              <Icon name="logout" /> Гарах
            </button>
          </form>
        </div>
      </header>

      <div className="account-grid">
        <section className="panel">
          <h2 className="panel-title">Миний захиалгууд</h2>
          {orders?.length ? (
            <ul className="account-orders">
              {orders.map((o) => {
                const st = ORDER_STATUS[o.status];
                return (
                  <li key={o.id}>
                    <details>
                      <summary>
                        <span className="ao-main">
                          <b>{o.order_number}</b>
                          <small className="muted">{formatDate(o.created_at)} · {o.items?.length || 0} бараа</small>
                        </span>
                        <span className={`badge badge-${st.tone}`}>{st.label}</span>
                        <span className="ao-total">{formatPrice(o.total)}</span>
                        <Icon name="arrowRight" size={16} className="ao-chevron" />
                      </summary>
                      <div className="ao-body">
                        <OrderDetails order={o} />
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty empty-compact">
              <Icon name="bag" size={34} strokeWidth={1.3} />
              <p>Танд одоогоор захиалга алга.</p>
              <Link href="/shop" className="btn btn-primary btn-sm">Дэлгүүр үзэх</Link>
            </div>
          )}
        </section>

        <section className="panel">
          <h2 className="panel-title">Хүргэлтийн мэдээлэл</h2>
          <p className="muted small account-note">Захиалга хийхэд автоматаар бөглөгдөнө.</p>
          <ProfileForm profile={profile} />
        </section>
      </div>
    </div>
  );
}
