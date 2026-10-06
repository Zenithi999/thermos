"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "../../app/admin/actions";
import Icon from "../Icons";

const LINKS = [
  { href: "/admin", label: "Хяналтын самбар", icon: "dashboard", exact: true },
  { href: "/admin/orders", label: "Захиалгууд", icon: "bag", badge: "orders" },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: "box" },
  { href: "/admin/categories", label: "Ангилал", icon: "tag" },
  { href: "/admin/settings", label: "Тохиргоо", icon: "settings" },
];

export default function AdminNav({ email, pendingOrders }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (l) => (l.exact ? pathname === l.href : pathname.startsWith(l.href));

  return (
    <>
      <div className="admin-topbar">
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Цэс нээх">
          <Icon name="menu" size={22} />
        </button>
        <span className="admin-logo">Thermos <small>Админ</small></span>
      </div>

      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-sidebar-head">
          <span className="admin-logo">Thermos <small>Админ</small></span>
          <button className="icon-btn admin-close" onClick={() => setOpen(false)} aria-label="Цэс хаах">
            <Icon name="close" />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Админ цэс">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l) ? "active" : undefined}>
              <Icon name={l.icon} />
              <span>{l.label}</span>
              {l.badge === "orders" && pendingOrders > 0 && <span className="nav-badge">{pendingOrders}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" target="_blank" className="admin-foot-link">
            <Icon name="external" size={16} /> Дэлгүүр харах
          </Link>
          <div className="admin-user">
            <span title={email}>{email}</span>
            <form action={signOut}>
              <button type="submit" className="icon-btn" aria-label="Гарах" title="Гарах">
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      {open && <div className="admin-scrim" onClick={() => setOpen(false)} />}
    </>
  );
}
