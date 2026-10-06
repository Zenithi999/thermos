import CategoryForm from "../../../../components/admin/CategoryForm";
import ConfirmButton from "../../../../components/admin/ConfirmButton";
import Icon from "../../../../components/Icons";
import { requireAdmin } from "../../../../lib/auth";
import { deleteCategory } from "../../actions";

export const metadata = { title: "Ангилал" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, products(count)")
    .order("sort_order");

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Ангилал</h1>
          <p className="muted">Дэлгүүрийн шүүлтүүр болон нүүр хуудсанд харагдана.</p>
        </div>
      </header>

      <section className="card card-pad">
        <h2 className="card-title">Шинэ ангилал</h2>
        <CategoryForm />
      </section>

      <section className="card">
        <div className="category-head">
          <span>Нэр</span>
          <span>Холбоос</span>
          <span>Дараалал</span>
          <span />
        </div>
        {categories?.length ? (
          <ul className="category-list">
            {categories.map((c) => (
              <li key={c.id}>
                <CategoryForm category={c} />
                <span className="muted small">{c.products?.[0]?.count ?? 0} бараа</span>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton
                    message={`“${c.name}” ангиллыг устгах уу? Бараанууд устахгүй, зөвхөн ангилалгүй болно.`}
                    className="icon-btn danger-icon"
                    aria-label={`${c.name} устгах`}
                  >
                    <Icon name="trash" />
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-empty">Ангилал алга байна.</p>
        )}
      </section>
    </>
  );
}
