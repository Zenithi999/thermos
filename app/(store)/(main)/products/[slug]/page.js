import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "../../../../../components/Icons";
import ProductCard from "../../../../../components/store/ProductCard";
import ProductGallery from "../../../../../components/store/ProductGallery";
import ProductPurchase from "../../../../../components/store/ProductPurchase";
import { getProductBySlug, getRelatedProducts, getSettings } from "../../../../../lib/data";
import { formatPrice } from "../../../../../lib/format";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Олдсонгүй" };
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: product.image_url ? { images: [product.image_url] } : undefined,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([getRelatedProducts(product), getSettings()]);
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const soldOut = product.stock <= 0;

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Байршил">
        <Link href="/">Нүүр</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop">Дэлгүүр</Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
      </nav>

      <div className="product-layout">
        <ProductGallery product={product} />

        <div className="product-info">
          {product.category && <span className="eyebrow">{product.category.name}</span>}
          <h1>{product.name}</h1>
          {(product.subtitle || product.capacity) && (
            <p className="product-sub">{[product.subtitle, product.capacity].filter(Boolean).join(" · ")}</p>
          )}

          <div className="product-price">
            <span>{formatPrice(product.price)}</span>
            {onSale && <s>{formatPrice(product.compare_at_price)}</s>}
            {onSale && (
              <span className="badge badge-red badge-plain">
                −{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </span>
            )}
          </div>

          <p className={`stock ${soldOut ? "stock-out" : "stock-in"}`}>
            <span className="stock-dot" />
            {soldOut ? "Одоогоор дууссан" : "Бэлэн байгаа"}
          </p>

          <ProductPurchase product={product} />

          <ul className="product-perks">
            <li>
              <Icon name="truck" />
              <span>
                Улаанбаатарт 24–48 цагт хүргэнэ
                {settings.free_shipping_over > 0 && <> · {formatPrice(settings.free_shipping_over)}-с дээш үнэгүй</>}
              </span>
            </li>
            <li><Icon name="shield" /><span>Үйлдвэрийн гэмтэлд 1 жилийн баталгаа</span></li>
            <li><Icon name="box" /><span>7 хоногийн дотор буцаах боломжтой</span></li>
          </ul>

          {product.description && (
            <div className="product-desc">
              <h2>Тайлбар</h2>
              {product.description.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Танд таалагдаж магадгүй</h2>
          </div>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
