import Link from "next/link";
import Icon from "../Icons";

export default function SiteFooter({ settings, categories = [] }) {
  const year = new Date().getFullYear();
  const { phone, email, address, instagram_url, facebook_url } = settings || {};

  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo logo-light">THERMOS</Link>
          <p>Халууныг халуунаар, хүйтнийг хүйтнээр нь. Өдөр бүрийн аялалд зориулсан вакуум термос, аяга.</p>
          {(instagram_url || facebook_url) && (
            <div className="footer-social">
              {instagram_url && (
                <a href={instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Icon name="instagram" />
                </a>
              )}
              {facebook_url && (
                <a href={facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Icon name="facebook" />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3>Дэлгүүр</h3>
          <ul>
            <li><Link href="/shop">Бүх бүтээгдэхүүн</Link></li>
            {categories.map((c) => (
              <li key={c.id}><Link href={`/shop?category=${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link href="/shop?sort=newest">Шинэ ирэлт</Link></li>
          </ul>
        </div>

        <div>
          <h3>Тусламж</h3>
          <ul>
            <li><Link href="/track">Захиалга шалгах</Link></li>
            <li><Link href="/delivery">Хүргэлт ба буцаалт</Link></li>
            <li><Link href="/account">Миний бүртгэл</Link></li>
            <li><Link href="/cart">Сагс</Link></li>
          </ul>
        </div>

        {(phone || email || address) && (
          <div>
            <h3>Холбоо барих</h3>
            <ul className="footer-contact">
              {phone && (
                <li>
                  <Icon name="phone" size={16} />
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </li>
              )}
              {email && (
                <li>
                  <Icon name="mail" size={16} />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {address && (
                <li>
                  <Icon name="pin" size={16} />
                  <span>{address}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="container footer-bottom">
        <span>© {year} Thermos. Бүх эрх хуулиар хамгаалагдсан.</span>
        <Link href="/delivery">Хүргэлт ба буцаалтын нөхцөл</Link>
      </div>
    </footer>
  );
}
