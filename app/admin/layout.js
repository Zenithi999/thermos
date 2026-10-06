import "../../styles/admin.css";
import SetupNotice from "../../components/SetupNotice";
import { isSupabaseConfigured } from "../../lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { default: "Админ", template: "%s · Thermos Админ" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return <div className="admin-root">{children}</div>;
}
