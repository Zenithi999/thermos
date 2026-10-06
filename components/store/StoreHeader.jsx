"use client";

/* Storefront header in the Thermos brand style: a dark announcement strip, then a sticky
   white bar with the red wordmark, uppercase category navigation and account / cart icons.
   Below 960px the navigation moves into a slide-in drawer. */

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "../../lib/format";
import { useCart } from "../cart/CartProvider";
import Icon from "../Icons";
import { useSignedIn } from "./useSignedIn";

const LOGO_SRC = "/images/logo_2x_25955799-cffe-4c70-98d1-3362d077a1ee.avif";

const Logo = ({ priority = false }) => (
  <Image src={LOGO_SRC} alt="Thermos" width={300} height={112} className="logo-img" priority={priority} />
);

export default function StoreHeader({ categories = [], freeShippingOver = 0, instagramUrl }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = pathname === "/shop" ? searchParams.get("category") : null;
  const { count, hydrated } = useCart();
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever navigation happens
  useEffect(() => setOpen(false), [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: "/shop", label: "Бүх бүтээгдэхүүн", active: pathname === "/shop" && !activeCategory },
    ...categories.map((c) => ({
      href: `/shop?category=${c.slug}`,
      label: c.name,
      active: activeCategory === c.slug,
    })),
    { href: "/delivery", label: "Хүргэлт", active: pathname.startsWith("/delivery") },
    { href: "/track", label: "Захиалга шалгах", active: pathname.startsWith("/track") },
  ];

  const badge = hydrated && count > 0 ? (count > 99 ? "99+" : count) : null;
  const accountHref = signedIn ? "/account" : "/account/login";
  const accountLabel = signedIn ? "Миний бүртгэл" : "Нэвтрэх";

  return (
    <>
      <div className="announce">
        <div className="container announce-inner">
          <span>
            <Icon name="truck" size={16} />
            {freeShippingOver > 0
              ? <>{formatPrice(freeShippingOver)}-с дээш захиалгад хүргэлт <b>үнэгүй</b></>
              : <>Улаанбаатарт 24–48 цагт хүргэнэ</>}
          </span>
          <span className="announce-extra">
            <Icon name="shield" size={16} /> 1 жилийн баталгаа
          </span>
        </div>
      </div>

      <header className={`sh${scrolled ? " is-scrolled" : ""}`}>
        <div className="container sh-inner">
          <button type="button" className="icon-btn sh-burger" onClick={() => setOpen(true)} aria-label="Цэс нээх" aria-expanded={open}>
            <Icon name="menu" size={22} />
          </button>

          <Link href="/" className="logo" aria-label="Thermos — нүүр хуудас">
            <Logo priority />
          </Link>

          <nav className="sh-nav" aria-label="Үндсэн цэс">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`sh-link${l.active ? " active" : ""}`} aria-current={l.active ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="sh-actions">
            <Link
              href={accountHref}
              className={`icon-btn sh-action${pathname.startsWith("/account") ? " active" : ""}`}
              aria-label={accountLabel}
              title={accountLabel}
            >
              <Icon name="user" size={22} />
              {signedIn && <span className="sh-dot" aria-hidden="true" />}
            </Link>
            <Link
              href="/cart"
              className={`icon-btn sh-action${pathname.startsWith("/cart") ? " active" : ""}`}
              aria-label={badge ? `Сагс, ${badge} бараа` : "Сагс"}
              title="Сагс"
            >
              <Icon name="bag" size={22} />
              {badge && <span className="sh-count">{badge}</span>}
            </Link>
          </div>
        </div>
      </header>

      <div className={`drawer${open ? " open" : ""}`} aria-hidden={!open} inert={!open}>
        <button type="button" className="drawer-scrim" onClick={() => setOpen(false)} aria-label="Цэс хаах" tabIndex={-1} />
        <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Цэс">
          <div className="drawer-head">
            <span className="logo"><Logo /></span>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Цэс хаах">
              <Icon name="close" size={22} />
            </button>
          </div>
          <nav className="drawer-nav" aria-label="Цэс">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={l.active ? "active" : undefined}>
                {l.label}
                <Icon name="arrowRight" size={18} />
              </Link>
            ))}
          </nav>
          <div className="drawer-foot">
            <Link href={accountHref} className="btn btn-outline btn-block">
              <Icon name="user" /> {accountLabel}
            </Link>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="drawer-social">
                <Icon name="instagram" /> Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
