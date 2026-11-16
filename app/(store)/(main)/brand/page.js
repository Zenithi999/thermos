import { Source_Serif_4 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import Icon from "../../../../components/Icons";
import { getSettings } from "../../../../lib/data";
import { BRAND_HERO, HISTORY } from "../../../../lib/pageContent";

export const metadata = {
  title: "Брэндийн тухай",
  description: "Thermos брэндийн 1892 оноос өнөөг хүртэлх түүх.",
};

// Old-print serif for the history copy (thermos.com uses Minion; Source Serif is Adobe's
// open counterpart and covers the Mongolian Ө and Ү)
const historySerif = Source_Serif_4({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  style: ["normal", "italic"],
  variable: "--font-history",
  display: "swap",
});

export default async function BrandPage() {
  const settings = await getSettings();
  const images = settings.page_images || {};

  return (
    <div className={historySerif.variable}>
      <section className="bh">
        {images.brand_hero ? (
          <Image src={images.brand_hero} alt="Thermos-ийн түүх" fill priority sizes="100vw" className="bh-img" />
        ) : (
          // official banner: wide crop on desktop, square crop on phones
          <picture>
            <source media="(max-width: 640px)" srcSet={BRAND_HERO.mobile} />
            <img src={BRAND_HERO.desktop} alt="Thermos-ийн түүх" className="bh-img" fetchPriority="high" />
          </picture>
        )}
      </section>

      {/* the page heading stays for screen readers and search engines */}
      <h1 className="sr-only">Thermos-ийн түүх</h1>

      <section className="tl" aria-label="Thermos-ийн түүхэн он дараалал">
        <div className="tl-band" aria-hidden="true" />
        <ol className="tl-list">
          {HISTORY.map((h) => {
            const img = images[`history_${h.key}`] || h.image;
            return (
              <li key={h.key} className={`tl-item tl-${h.side}${h.major ? " is-major" : ""}`}>
                <div className="tl-text">
                  {h.title && <h2>{h.title}</h2>}
                  {h.subtitle && <p className="tl-sub">{h.subtitle}</p>}
                  {h.stat && <p className="tl-stat">{h.stat}</p>}
                  {h.text && <p>{h.text}</p>}
                  {h.highlight && <p className="tl-highlight">{h.highlight}</p>}
                </div>
                <div className="tl-mark">
                  <span className="tl-dot" />
                  <span className="tl-year">{h.year}</span>
                </div>
                {/* captions describe the photo, so they only appear once one is uploaded */}
                {img && (
                  <figure className="tl-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={h.caption || h.year} loading="lazy" />
                    {h.caption && <figcaption>{h.caption}</figcaption>}
                  </figure>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="container tl-cta">
        <h2>120 жилийн туршлагыг гартаа</h2>
        <Link href="/shop" className="btn btn-primary btn-lg">
          Бүтээгдэхүүн үзэх <Icon name="arrowRight" />
        </Link>
      </div>
    </div>
  );
}
