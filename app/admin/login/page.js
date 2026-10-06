import LoginForm from "../../../components/admin/LoginForm";

export const metadata = { title: "Нэвтрэх" };

export default async function AdminLoginPage({ searchParams }) {
  const { error } = await searchParams;
  return (
    <main className="login">
      <div className="login-card">
        <div className="login-brand">Thermos</div>
        <h1>Админ нэвтрэх</h1>
        <p className="muted">Дэлгүүрийн удирдлагын хэсэгт нэвтрэхийн тулд имэйл, нууц үгээ оруулна уу.</p>
        {error === "not-admin" && (
          <div className="alert alert-error">
            Энэ хэрэглэгч админ эрхгүй байна. README дахь “Админ эрх олгох” алхмыг хийнэ үү.
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
