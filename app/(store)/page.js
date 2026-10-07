import Image from "next/image";
import Link from "next/link";
import Icon from "../../components/Icons";
import ProductCard from "../../components/store/ProductCard";
import { getCategories, getFeaturedProducts, getProducts, getSettings } from "../../lib/data";

export default async function HomePage() {
  const [featured, products, categories, settings] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ sort: "newest" }),
    getCategories(),
    getSettings(),
  ]);

  const latest = products.slice(0, 8);
  const picks = featured.filter((p) => !latest.slice(0, 4).some((l) => l.id === p.id)).slice(0, 4);

  // Categories switched on in /admin/categories become the photo tiles under the banner
  // (admin sort order). Until the show_on_home migration runs, the first four are used.
  // Without an uploaded photo a tile falls back to a product cut-out from that category.
  const hasHomeFlag = categories.some((c) => "show_on_home" in c);
  const homeCategories = hasHomeFlag ? categories.filter((c) => c.show_on_home) : categories.slice(0, 4);
  const tiles = homeCategories.map((c) => ({
    ...c,
    fallback: c.image_url ? null : products.find((p) => p.category?.slug === c.slug && p.image_url)?.image_url,
  }));

  const bannerImage = settings.hero_image_url ? (
    <Image
      src={settings.hero_image_url}
      alt="Thermos"
      fill
      priority
      sizes="100vw"
      className="home-banner-img"
    />
  ) : (
    <div className="home-banner-fallback">
      <span className="eyebrow eyebrow-light">Вакуум тусгаарлалттай термос</span>
      <h1>
        Халуун нь халуунаараа. <span>Хүйтэн нь хүйтнээрээ.</span>
      </h1>
    </div>
  );

  return (
    <main>
      {/* ---------- Banner + category tiles ---------- */}
      <section className="home-hero">
        {settings.hero_link ? (
          <Link href={settings.hero_link} className="home-banner">{bannerImage}</Link>
        ) : (
          <div className="home-banner">{bannerImage}</div>
        )}

        {tiles.length > 0 && (
          <div className="container">
            <nav className="home-cats" aria-label="Ангилал">
              {tiles.map((c, i) => (
                <Link key={c.id} href={`/shop?category=${c.slug}`} className={`home-cat${c.image_url ? "" : " is-fallback"}`}>
                  {c.image_url ? (
                    <Image src={c.image_url} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="home-cat-img" priority={i < 2} />
                  ) : (
                    c.fallback && <Image src={c.fallback} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="home-cat-cutout" />
                  )}
                  <span className="home-cat-name">{c.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </section>

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

    </main>
  );
}
