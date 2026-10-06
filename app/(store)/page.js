import Image from "next/image";
import Link from "next/link";
import Icon from "../../components/Icons";
import ProductCard from "../../components/store/ProductCard";
import { getCategories, getFeaturedProducts, getProducts } from "../../lib/data";
import { formatPrice } from "../../lib/format";

const HERO_MAX = 3;

export default async function HomePage() {
  const [featured, products, categories] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ sort: "newest" }),
    getCategories(),
  ]);

  const latest = products.slice(0, 8);
  const lineup = (featured.length ? featured : products).filter((p) => p.image_url).slice(0, HERO_MAX);
  const center = Math.floor(lineup.length / 2);
  const picks = featured.filter((p) => !latest.slice(0, 4).some((l) => l.id === p.id)).slice(0, 4);

  // One representative photo per category for the shop-by-category tiles
  const categoryTiles = categories
    .map((c) => {
      const items = products.filter((p) => p.category?.slug === c.slug);
      return { ...c, count: items.length, image: items.find((p) => p.image_url)?.image_url };
    })
    .filter((c) => c.count > 0);

  return (
    <main>
      {/* ---------- Static hero ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">Вакуум тусгаарлалттай термос</span>
            <h1>
              Халуун нь халуунаараа.
              <span>Хүйтэн нь хүйтнээрээ.</span>
            </h1>
            <p>
              Монголын −40° өвөл, +35° зунд ч ундаа тань хүссэн хэмдээ. 18/8 зэвэрдэггүй ган, гоожихгүй таглаа,
              өдөр бүрийн хэрэглээнд.
            </p>
            <div className="hero-ctas">
              <Link href="/shop" className="btn btn-primary btn-lg">
                Дэлгүүр үзэх <Icon name="arrowRight" />
              </Link>
              <Link href="#new" className="btn btn-outline-light btn-lg">Шинэ ирэлт</Link>
            </div>
            <dl className="hero-stats">
              <div><dt>Халуун</dt><dd>12<small>цаг</small></dd></div>
              <div><dt>Хүйтэн</dt><dd>24<small>цаг</small></dd></div>
              <div><dt>Ган</dt><dd>18/8</dd></div>
            </dl>
          </div>

          {lineup.length > 0 && (
            <div className="hero-lineup" aria-label="Онцлох бүтээгдэхүүн">
              {lineup.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="hero-item"
                  style={{ "--h": `${100 - Math.abs(i - center) * 13}%`, "--glow": p.accent }}
                  title={p.name}
                >
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    width={500}
                    height={900}
                    sizes="(max-width: 900px) 22vw, 180px"
                    priority={i === center}
                  />
                  <span className="hero-tag">
                    <b>{p.name}</b>
                    {formatPrice(p.price)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Shop by category ---------- */}
      {categoryTiles.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Ангилал</span>
                <h2>Хэрэгцээгээрээ сонго</h2>
              </div>
              <Link href="/shop" className="link-arrow">
                Бүгдийг үзэх <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <div className="cat-grid">
              {categoryTiles.map((c) => (
                <Link key={c.id} href={`/shop?category=${c.slug}`} className="cat-tile">
                  <span className="cat-media">
                    {c.image && <Image src={c.image} alt="" width={300} height={540} sizes="160px" />}
                  </span>
                  <span className="cat-label">
                    <b>{c.name}</b>
                    <small>{c.count} бүтээгдэхүүн</small>
                  </span>
                  <Icon name="arrowRight" size={18} className="cat-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- New arrivals ---------- */}
      <section className="section section-tight" id="new">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Шинэ ирэлт</span>
              <h2>Сүүлд нэмэгдсэн</h2>
            </div>
            <Link href="/shop?sort=newest" className="link-arrow">
              Бүгдийг үзэх <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          {latest.length ? (
            <div className="product-grid">
              {latest.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="muted">Удахгүй шинэ бүтээгдэхүүн нэмэгдэнэ.</p>
          )}
        </div>
      </section>

      {/* ---------- Technology ---------- */}
      <section className="tech">
        <div className="container tech-inner">
          <div className="tech-copy">
            <span className="eyebrow">Thermos технологи</span>
            <h2>Давхар ханатай вакуум тусгаарлалт</h2>
            <p>
              Хоёр давхар зэвэрдэггүй гангийн хооронд агааргүй орон зай үүсгэснээр дулаан гадагшаа алдагдахгүй,
              гаднах хүйтэн дотогш нэвтрэхгүй. Тиймээс сав гаднаасаа хөлрөхгүй, гар түлэхгүй.
            </p>
            <ul className="tech-list">
              <li><Icon name="check" size={18} strokeWidth={2.2} /> 18/8 зэвэрдэггүй ган — үнэр, амт шингээхгүй</li>
              <li><Icon name="check" size={18} strokeWidth={2.2} /> BPA-гүй, гоожихгүй битүүмжлэлтэй таглаа</li>
              <li><Icon name="check" size={18} strokeWidth={2.2} /> Гаднаасаа хөлрөхгүй, цүнхэнд аюулгүй</li>
            </ul>
          </div>
          <div className="tech-cards">
            <div className="tech-card tech-hot">
              <Icon name="flame" size={30} strokeWidth={1.6} />
              <b>12<small>цаг</small></b>
              <span>Халуун цай, кофе, шөл</span>
            </div>
            <div className="tech-card tech-cold">
              <Icon name="snow" size={30} strokeWidth={1.6} />
              <b>24<small>цаг</small></b>
              <span>Хүйтэн ус, ундаа, мөс</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Featured picks ---------- */}
      {picks.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Онцлох</span>
                <h2>Бидний сонголт</h2>
              </div>
              <Link href="/shop" className="link-arrow">
                Дэлгүүр үзэх <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <div className="product-grid">
              {picks.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Closing banner ---------- */}
      <section className="section section-tight">
        <div className="container">
          <div className="banner">
            <div>
              <span className="eyebrow eyebrow-light">Захиалга</span>
              <h2>Өнөөдөр захиалаад, маргааш хэрэглэ</h2>
              <p>Захиалгаа өгөөд дугаараа хадгалаарай — явцаа хэзээ ч шалгах боломжтой.</p>
            </div>
            <div className="banner-ctas">
              <Link href="/shop" className="btn btn-light btn-lg">Дэлгүүр үзэх</Link>
              <Link href="/track" className="btn btn-outline-light btn-lg">Захиалга шалгах</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
