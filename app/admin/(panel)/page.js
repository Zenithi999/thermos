import Link from "next/link";
import Icon from "../../../components/Icons";
import { requireAdmin } from "../../../lib/auth";
import { ORDER_STATUS, formatDate, formatPrice } from "../../../lib/format";

export const metadata = { title: "Хяналтын самбар" };

const UB_OFFSET_MS = 8 * 60 * 60 * 1000;

// Start of "today" and "this month" in Ulaanbaatar time, as UTC ISO strings
function ubBoundaries() {
  const ub = new Date(Date.now() + UB_OFFSET_MS);
  const y = ub.getUTCFullYear();
  const m = ub.getUTCMonth();
  const d = ub.getUTCDate();
  return {
    today: new Date(Date.UTC(y, m, d) - UB_OFFSET_MS).toISOString(),
    month: new Date(Date.UTC(y, m, 1) - UB_OFFSET_MS).toISOString(),
  };
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const { today, month } = ubBoundaries();

  const [monthOrders, recent, lowStock, productCount] = await Promise.all([
    supabase.from("orders").select("total, status, created_at").gte("created_at", month),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("id, name, stock, image_url")
      .eq("is_active", true)
      .lte("stock", 5)
      .order("stock")
      .limit(6),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const orders = monthOrders.data || [];
  const valid = orders.filter((o) => o.status !== "cancelled");
  const todayStart = new Date(today);
  const todayOrders = valid.filter((o) => new Date(o.created_at) >= todayStart);
  const pending = orders.filter((o) => o.status === "pending").length;

  const stats = [
    { label: "Өнөөдрийн захиалга", value: todayOrders.length, sub: formatPrice(todayOrders.reduce((s, o) => s + o.total, 0)) },
    { label: "Энэ сарын борлуулалт", value: formatPrice(valid.reduce((s, o) => s + o.total, 0)), sub: `${valid.length} захиалга` },
    { label: "Хүлээгдэж буй", value: pending, sub: "Баталгаажуулах шаардлагатай", tone: pending ? "amber" : undefined, href: "/admin/orders?status=pending" },
    { label: "Бүтээгдэхүүн", value: productCount.count ?? 0, sub: "Нийт", href: "/admin/products" },
  ];

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Хяналтын самбар</h1>
          <p className="muted">Дэлгүүрийн өнөөдрийн байдал</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Icon name="plus" /> Бүтээгдэхүүн нэмэх
        </Link>
      </header>

      <div className="stat-grid">
        {stats.map((s) => {
          const body = (
            <>
              <span className="stat-label">{s.label}</span>
              <strong className="stat-value">{s.value}</strong>
              <span className="stat-sub">{s.sub}</span>
            </>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className={`stat${s.tone ? ` stat-${s.tone}` : ""}`}>{body}</Link>
          ) : (
            <div key={s.label} className="stat">{body}</div>
          );
        })}
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card-head">
            <h2>Сүүлийн захиалгууд</h2>
            <Link href="/admin/orders" className="link-arrow">Бүгд <Icon name="arrowRight" size={16} /></Link>
          </div>
          {recent.data?.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Дугаар</th><th>Захиалагч</th><th>Огноо</th><th>Төлөв</th><th className="num">Дүн</th></tr>
                </thead>
                <tbody>
                  {recent.data.map((o) => {
                    const st = ORDER_STATUS[o.status];
                    return (
                      <tr key={o.id}>
                        <td><Link href={`/admin/orders/${o.id}`} className="row-link">{o.order_number}</Link></td>
                        <td>{o.customer_name}</td>
                        <td className="muted">{formatDate(o.created_at)}</td>
                        <td><span className={`badge badge-${st.tone}`}>{st.label}</span></td>
                        <td className="num">{formatPrice(o.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="card-empty">Одоогоор захиалга алга.</p>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Үлдэгдэл бага</h2>
          </div>
          {lowStock.data?.length ? (
            <ul className="mini-list">
              {lowStock.data.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                  <span className={`badge ${p.stock === 0 ? "badge-red" : "badge-amber"}`}>
                    {p.stock === 0 ? "Дууссан" : `${p.stock} ш`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card-empty">Бүх барааны үлдэгдэл хангалттай.</p>
          )}
        </section>
      </div>
    </>
  );
}
