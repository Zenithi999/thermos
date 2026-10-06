import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "../../../../components/store/ProductCard";
import SortSelect from "../../../../components/store/SortSelect";
import { getCategories, getProducts } from "../../../../lib/data";

export const metadata = { title: "Дэлгүүр" };

const SORTS = ["newest", "price-asc", "price-desc"];

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sort = SORTS.includes(params.sort) ? params.sort : "newest";

  const [categories, products] = await Promise.all([getCategories(), getProducts({ category, sort })]);
  const activeCategory = categories.find((c) => c.slug === category);

  const hrefFor = (slug) => {
    const q = new URLSearchParams();
    if (slug) q.set("category", slug);
    if (sort !== "newest") q.set("sort", sort);
    const s = q.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="container">
      <header className="page-head">
        <h1>{activeCategory ? activeCategory.name : "Бүх бүтээгдэхүүн"}</h1>
        <p className="muted">{products.length} бүтээгдэхүүн</p>
      </header>

      <div className="toolbar">
        <nav className="chips" aria-label="Ангилал">
          <Link href={hrefFor()} className={`chip${!category ? " active" : ""}`}>Бүгд</Link>
          {categories.map((c) => (
            <Link key={c.id} href={hrefFor(c.slug)} className={`chip${category === c.slug ? " active" : ""}`}>
              {c.name}
            </Link>
          ))}
        </nav>
        <Suspense>
          <SortSelect value={sort} />
        </Suspense>
      </div>

      {products.length ? (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="empty">
          <h2>Бүтээгдэхүүн олдсонгүй</h2>
          <p>Энэ ангилалд одоогоор бараа алга байна.</p>
          <Link href="/shop" className="btn btn-outline">Бүгдийг харах</Link>
        </div>
      )}
    </div>
  );
}
