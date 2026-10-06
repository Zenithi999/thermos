// Shown instead of the store while .env.local has no Supabase keys.
export default function SetupNotice() {
  return (
    <main className="setup">
      <div className="setup-card">
        <span className="badge badge-amber">Тохиргоо дутуу</span>
        <h1>Supabase холбогдоогүй байна</h1>
        <ol>
          <li>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">supabase.com</a> дээр шинэ project үүсгэнэ.
          </li>
          <li>
            <b>SQL Editor</b> дээр <code>supabase/schema.sql</code>, дараа нь (хүсвэл) <code>supabase/seed.sql</code>-г ажиллуулна.
          </li>
          <li>
            Төслийн хавтаст <code>.env.local</code> файл үүсгэж <b>Project Settings → API</b>-аас авсан утгуудыг оруулна:
            <pre>{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}</pre>
          </li>
          <li>
            <code>npm run dev</code>-г дахин эхлүүлнэ.
          </li>
        </ol>
        <p className="muted">Дэлгэрэнгүй заавар: README.md</p>
      </div>
    </main>
  );
}
