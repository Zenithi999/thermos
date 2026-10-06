"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="card card-pad admin-error">
      <h2>Алдаа гарлаа</h2>
      <p className="muted">{error?.message || "Үйлдлийг гүйцэтгэж чадсангүй."}</p>
      <button className="btn btn-primary" onClick={reset}>Дахин оролдох</button>
    </div>
  );
}
