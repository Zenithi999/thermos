import Link from "next/link";
import ProductForm from "../../../../../components/admin/ProductForm";
import { requireAdmin } from "../../../../../lib/auth";

export const metadata = { title: "Шинэ бүтээгдэхүүн" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/products" className="back-link">← Бүтээгдэхүүн</Link>
          <h1>Шинэ бүтээгдэхүүн</h1>
        </div>
      </header>
      <ProductForm categories={categories || []} />
    </>
  );
}
