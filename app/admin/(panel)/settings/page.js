import SettingsForm from "../../../../components/admin/SettingsForm";
import { requireAdmin } from "../../../../lib/auth";

export const metadata = { title: "Тохиргоо" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Тохиргоо</h1>
          <p className="muted">Хүргэлтийн нөхцөл, холбоо барих мэдээлэл</p>
        </div>
      </header>
      <SettingsForm settings={settings} />
    </>
  );
}
