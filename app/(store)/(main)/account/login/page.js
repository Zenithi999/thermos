import { redirect } from "next/navigation";
import AuthForms from "../../../../../components/store/AuthForms";
import { getCurrentCustomer } from "../../../../../lib/account";

export const metadata = { title: "Нэвтрэх" };

export default async function AccountLoginPage({ searchParams }) {
  const { next, tab, error } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (await getCurrentCustomer()) redirect(nextPath);

  return (
    <div className="container auth-page">
      <header className="page-head auth-head">
        <h1>Тавтай морил</h1>
        <p className="muted">Бүртгэлдээ нэвтэрч захиалгаа хялбар удирдаарай.</p>
      </header>
      {error === "confirm" && (
        <div className="alert alert-error auth-alert">Баталгаажуулах холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Дахин нэвтэрч үзнэ үү.</div>
      )}
      <AuthForms next={nextPath} initialTab={tab === "signup" ? "signup" : "signin"} />
    </div>
  );
}
