import Link from "next/link";
import Icon from "../../../../components/Icons";
import { requireAdmin } from "../../../../lib/auth";
import { ORDER_STATUS, PAYMENT_STATUS, formatDate, formatPrice } from "../../../../lib/format";

export const metadata = { title: "Захиалгууд" };

const PAGE_SIZE = 30;
const TABS = [{ value: "", label: "Бүгд" }, ...Object.entries(ORDER_STATUS).map(([value, s]) => ({ value, label: s.label }))];

export default async function OrdersPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = ORDER_STATUS[params.status] ? params.status : "";
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Number(params.page) || 1);

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, phone, city, district, total, status, payment_status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  if (search) {
    const s = search.replace(/[%_,()]/g, "");
    query = query.or(`order_number.ilike.%${s}%,phone.ilike.%${s}%,customer_name.ilike.%${s}%`);
  }

  const { data: orders, count, error } = await query;
  if (error) throw new Error(error.message);
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const hrefFor = (next) => {
    const q = new URLSearchParams();
    const merged = { status, q: search, page: 1, ...next };
    if (merged.status) q.set("status", merged.status);
    if (merged.q) q.set("q", merged.q);
    if (merged.page > 1) q.set("page", merged.page);
    const s = q.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Захиалгууд</h1>
          <p className="muted">{count || 0} захиалга</p>
        </div>
      </header>

      <nav className="tabs" aria-label="Төлөвөөр шүүх">
        {TABS.map((t) => (
          <Link key={t.value} href={hrefFor({ status: t.value })} className={`tab${status === t.value ? " active" : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="card">
        <form className="card-toolbar" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="search-input">
            <Icon name="search" size={18} />
            <input name="q" className="input" placeholder="Дугаар, утас, нэрээр хайх…" defaultValue={search} />
          </div>
          {search && <Link href={hrefFor({ q: "" })} className="btn btn-ghost btn-sm">Цэвэрлэх</Link>}
        </form>

        {orders.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Дугаар</th>
                  <th>Захиалагч</th>
                  <th>Хаяг</th>
                  <th>Огноо</th>
                  <th>Төлөв</th>
                  <th>Төлбөр</th>
                  <th className="num">Дүн</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const st = ORDER_STATUS[o.status];
                  const pay = PAYMENT_STATUS[o.payment_status];
                  return (
                    <tr key={o.id}>
                      <td><Link href={`/admin/orders/${o.id}`} className="row-link">{o.order_number}</Link></td>
                      <td>
                        <div className="cell-stack">
                          <b>{o.customer_name}</b>
                          <small>{o.phone}</small>
                        </div>
                      </td>
                      <td className="muted">{o.city}, {o.district}</td>
                      <td className="muted nowrap">{formatDate(o.created_at)}</td>
                      <td><span className={`badge badge-${st.tone}`}>{st.label}</span></td>
                      <td><span className={`badge badge-${pay.tone}`}>{pay.label}</span></td>
                      <td className="num">{formatPrice(o.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="card-empty">{search || status ? "Шүүлтүүрт тохирох захиалга алга." : "Одоогоор захиалга ирээгүй байна."}</p>
        )}

        {totalPages > 1 && (
          <div className="pager">
            {page > 1 ? <Link href={hrefFor({ page: page - 1 })} className="btn btn-outline btn-sm">← Өмнөх</Link> : <span />}
            <span className="muted">{page} / {totalPages}</span>
            {page < totalPages ? <Link href={hrefFor({ page: page + 1 })} className="btn btn-outline btn-sm">Дараах →</Link> : <span />}
          </div>
        )}
      </div>
    </>
  );
}
