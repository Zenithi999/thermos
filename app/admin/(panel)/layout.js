import AdminNav from "../../../components/admin/AdminNav";
import { requireAdmin } from "../../../lib/auth";

export default async function AdminPanelLayout({ children }) {
  const { supabase, user } = await requireAdmin();
  const { count: pending } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="admin">
      <AdminNav email={user.email} pendingOrders={pending || 0} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
