import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container">
      <div className="empty" style={{ minHeight: "70svh", justifyContent: "center" }}>
        <span className="eyebrow">404</span>
        <h2>Хуудас олдсонгүй</h2>
        <p>Таны хайсан хуудас устсан эсвэл хаяг буруу байна.</p>
        <Link href="/" className="btn btn-primary">Нүүр хуудас</Link>
      </div>
    </main>
  );
}
