import PageImagesForm from "../../../../components/admin/PageImagesForm";
import { requireAdmin } from "../../../../lib/auth";

export const metadata = { title: "Хуудасны зураг" };

export default async function PageImagesPage() {
  const { supabase } = await requireAdmin();
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Хуудасны зураг</h1>
          <p className="muted">
            “Брэндийн тухай”, “Бүтээгдэхүүний тухай” хуудасны зургууд. Ашиглах эрхтэй (жишээ нь Thermos-оос авсан албан ёсны)
            зургаа оруулна уу. Зураггүй хэсэгт загвар харагдана.
          </p>
        </div>
      </header>
      <PageImagesForm images={settings?.page_images || {}} />
    </>
  );
}
