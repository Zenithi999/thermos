import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "../../../../../components/admin/ProductForm";
import Icon from "../../../../../components/Icons";
import { requireAdmin } from "../../../../../lib/auth";

export const metadata = { title: "Бүтээгдэхүүн засах" };

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function EditProductPage({ params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <>
      <header className="admin-head">
        <div>
          <Link href="/admin/products" className="back-link">← Бүтээгдэхүүн</Link>
          <h1>{product.name}</h1>
        </div>
        {product.is_active && (
          <Link href={`/products/${product.slug}`} target="_blank" className="btn btn-outline btn-sm">
            <Icon name="external" size={16} /> Дэлгүүрт харах
          </Link>
        )}
      </header>
      <ProductForm product={product} categories={categories || []} />
    </>
  );
}
