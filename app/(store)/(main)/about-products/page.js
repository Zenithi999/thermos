import Image from "next/image";
import Link from "next/link";
import Icon from "../../../../components/Icons";
import { getSettings } from "../../../../lib/data";
import { LIDS, PRODUCTS_INTRO, REASONS, VACUUM_STEPS } from "../../../../lib/pageContent";

export const metadata = {
  title: "Бүтээгдэхүүний тухай",
  description: "THERMOS® вакуум тусгаарлалтын технологи, тагны төрлүүд, Thermos-ийг сонгох шалтгаанууд.",
};

export default async function AboutProductsPage() {
  const settings = await getSettings();
  const images = settings.page_images || {};

  return (
    <div className="container ap">
      <header className="page-head ap-head">
        <span className="eyebrow">Бүтээгдэхүүний тухай</span>
        <h1>THERMOS® — дэлхийд алдартай брэнд</h1>
        <p>{PRODUCTS_INTRO}</p>
      </header>

      <nav className="ap-nav" aria-label="Хуудасны хэсгүүд">
        <a href="#vacuum">Вакуум технологи</a>
        <a href="#why">Яагаад Thermos</a>
        <a href="#lids">Тагны технологи</a>
      </nav>

      <section id="vacuum" className="ap-section">
        <p className="ap-banner">
          THERMOS™ вакуум тусгаарлалтын технологи халууныг халуунаар, хүйтнийг хүйтнээр нь удаан хугацаанд хадгална
        </p>
        <ol className="ap-steps">
          {VACUUM_STEPS.map((s, i) => {
            const img = images[`vacuum_${s.key}`] || s.image;
            return (
              <li key={s.key}>
                <span className="ap-step-num">{i + 1}</span>
                <div className="ap-step-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Схем ${i + 1}`} loading="lazy" />
                </div>
                <p>{s.text}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section id="why" className="ap-section">
        <h2 className="ap-title">Thermos-ийг сонгох 6 шалтгаан</h2>
        <ul className="ap-reasons">
          {REASONS.map((r) => (
            <li key={r.text}>
              <span className="ap-reason-icon">
                <Image src={r.image} alt="" width={160} height={160} />
              </span>
              <p>{r.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="lids" className="ap-section ap-lids">
        <h2 className="ap-title">Тагны технологи ба онцлог</h2>
        <p className="ap-lead">
          Thermos таны хэрэглээ, дуртай зүйлд тохирох олон төрлийн тагийг санал болгодог тул сав бүр хэрэглэхэд аль болох эвтэйхэн байдаг.
        </p>
        <div className="ap-lid-grid">
          {LIDS.map((l, i) => {
            const img = images[`lid_${l.key}`] || l.image;
            return (
              <article key={l.key} className="ap-lid">
                <div className={`ap-lid-media${img ? "" : " is-empty"}`}>
                  {img ? (
                    <Image src={img} alt={l.title} fill sizes="(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 360px" />
                  ) : (
                    <span className="ap-lid-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className="ap-lid-body">
                  <h3>{l.title}</h3>
                  <ul>
                    {l.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
        <div className="ap-cta">
          <Link href="/shop" className="btn btn-primary btn-lg">
            Дэлгүүр үзэх <Icon name="arrowRight" />
          </Link>
        </div>
      </section>
    </div>
  );
}
