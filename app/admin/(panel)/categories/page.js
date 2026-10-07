import CategoryForm from "../../../../components/admin/CategoryForm";
import ConfirmButton from "../../../../components/admin/ConfirmButton";
import Icon from "../../../../components/Icons";
import { requireAdmin } from "../../../../lib/auth";
import { deleteCategory, toggleCategoryHome } from "../../actions";

export const metadata = { title: "Ангилал" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("sort_order");

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Ангилал</h1>
          <p className="muted">“Нүүрт” асаалттай ангиллууд нүүр хуудасны баннерын доор дарааллаараа зурагтайгаа харагдана (4 нь хамгийн гоё).</p>
        </div>
      </header>

      <section className="card card-pad">
        <h2 className="card-title">Шинэ ангилал</h2>
        <CategoryForm />
      </section>

      <section className="card">
        <div className="category-head">
          <span>Зураг</span>
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
                <form action={toggleCategoryHome} className="category-home">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="value" value={String(!c.show_on_home)} />
                  <button
                    type="submit"
                    className={`switch${c.show_on_home ? " on" : ""}`}
                    role="switch"
                    aria-checked={Boolean(c.show_on_home)}
                    aria-label={`${c.name} — нүүр хуудсанд харуулах`}
                    title="Нүүр хуудсанд харуулах"
                  >
                    <span />
                  </button>
                  <small>Нүүрт</small>
                </form>
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
