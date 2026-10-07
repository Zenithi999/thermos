"use client";

import { useActionState } from "react";
import { saveCategory } from "../../app/admin/actions";
import ImageField from "./ImageField";

export default function CategoryForm({ category }) {
  const [state, formAction, pending] = useActionState(saveCategory, null);
  const isNew = !category;

  return (
    <form action={formAction} className={`category-form${isNew ? " is-new" : ""}`} key={isNew && state?.ok ? state.key : undefined}>
      {!isNew && <input type="hidden" name="id" value={category.id} />}
      <ImageField name="image_url" defaultValue={category?.image_url} folder="categories" variant="thumb" label="Ангиллын зураг" />
      <input name="name" className="input" placeholder="Ангиллын нэр" defaultValue={category?.name} aria-label="Нэр" required />
      <input name="slug" className="input" placeholder="slug (автоматаар)" defaultValue={category?.slug} aria-label="Холбоос" />
      <input name="sort_order" className="input input-num" inputMode="numeric" placeholder="0" defaultValue={category?.sort_order ?? ""} aria-label="Дараалал" />
      <button type="submit" className={`btn ${isNew ? "btn-primary" : "btn-outline"} btn-sm`} disabled={pending}>
        {pending ? "…" : isNew ? "Нэмэх" : "Хадгалах"}
      </button>
      {state?.message && (
        <span className={`form-msg ${state.ok ? "ok" : "err"}`} role="status">{state.message}</span>
      )}
    </form>
  );
}
