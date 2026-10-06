"use client";

export default function StoreError({ error, reset }) {
  return (
    <main className="container">
      <div className="empty">
        <h2>Уучлаарай, алдаа гарлаа</h2>
        <p>Хуудсыг ачаалахад асуудал гарлаа. Түр хүлээгээд дахин оролдоно уу.</p>
        {process.env.NODE_ENV === "development" && <pre className="error-detail">{error?.message}</pre>}
        <button className="btn btn-primary" onClick={reset}>Дахин оролдох</button>
      </div>
    </main>
  );
}
