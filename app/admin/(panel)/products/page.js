import Image from "next/image";
import Link from "next/link";
import Icon from "../../../../components/Icons";
import { requireAdmin } from "../../../../lib/auth";
import { formatPrice } from "../../../../lib/format";
import { toggleProductFlag } from "../../actions";

export const metadata = { title: "Бүтээгдэхүүн" };

function Toggle({ id, field, value, label, disabled }) {
  return (
    <form action={toggleProductFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!value)} />
      <button
        type="submit"
        className={`switch${value ? " on" : ""}`}
        role="switch"
        aria-checked={value}
        aria-label={label}
        title={disabled ? "Эхлээд үндсэн зураг оруулна уу" : label}
        disabled={disabled}
      >
        <span />
      </button>
    </form>
  );
}

export default async function AdminProductsPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const { q, saved, deleted } = await searchParams;
  const search = typeof q === "string" ? q.trim() : "";

  let query = supabase
    .from("products")
    .select("id, name, slug, price, stock, image_url, bg_from, bg_to, is_active, is_featured, hero_order, category:categories(name)")
    .order("is_featured", { ascending: false })
    .order("hero_order")
    .order("created_at", { ascending: false });
  if (search) query = query.ilike("name", `%${search.replace(/[%_]/g, "")}%`);
  const { data: products, error } = await query;
  if (error) throw new Error(error.message);

  const featuredCount = products.filter((p) => p.is_featured && p.is_active).length;

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Бүтээгдэхүүн</h1>
          <p className="muted">
            {products.length} бүтээгдэхүүн · Hero-д {featuredCount} харагдаж байна
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Icon name="plus" /> Шинээр нэмэх
        </Link>
      </header>

      {saved && <div className="alert alert-success flash">“{saved}” хадгалагдлаа.</div>}
      {deleted && <div className="alert alert-success flash">Бүтээгдэхүүн устгагдлаа.</div>}

      <div className="card">
        <form className="card-toolbar" role="search">
          <div className="search-input">
            <Icon name="search" size={18} />
            <input name="q" className="input" placeholder="Нэрээр хайх…" defaultValue={search} />
          </div>
          {search && <Link href="/admin/products" className="btn btn-ghost btn-sm">Цэвэрлэх</Link>}
        </form>

        {products.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Бүтээгдэхүүн</th>
                  <th>Ангилал</th>
                  <th className="num">Үнэ</th>
                  <th className="num">Үлдэгдэл</th>
                  <th className="center">Идэвхтэй</th>
                  <th className="center">Hero</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={!p.is_active ? "row-muted" : undefined}>
                    <td>
                      <Link href={`/admin/products/${p.id}`} className="product-cell">
                        <span className="thumb" style={{ background: `linear-gradient(160deg, ${p.bg_from}, ${p.bg_to})` }}>
                          {p.image_url && <Image src={p.image_url} alt="" width={40} height={72} />}
                        </span>
                        <span>
                          <b>{p.name}</b>
                          <small>/{p.slug}</small>
                        </span>
                      </Link>
                    </td>
                    <td className="muted">{p.category?.name || "—"}</td>
                    <td className="num">{formatPrice(p.price)}</td>
                    <td className="num">
                      <span className={p.stock === 0 ? "text-red" : p.stock <= 5 ? "text-amber" : undefined}>{p.stock}</span>
                    </td>
                    <td className="center">
                      <Toggle id={p.id} field="is_active" value={p.is_active} label="Дэлгүүрт харуулах" />
                    </td>
                    <td className="center">
                      <Toggle
                        id={p.id}
                        field="is_featured"
                        value={p.is_featured}
                        label="Нүүр хуудасны hero-д харуулах"
                        disabled={!p.image_url && !p.is_featured}
                      />
                    </td>
                    <td className="num">
                      <Link href={`/admin/products/${p.id}`} className="icon-btn" aria-label={`${p.name} засах`}>
                        <Icon name="edit" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card-empty">
            {search ? "Хайлтад тохирох бүтээгдэхүүн олдсонгүй." : "Одоогоор бүтээгдэхүүн алга. “Шинээр нэмэх” дарж эхлээрэй."}
          </div>
        )}
      </div>
    </>
  );
}
