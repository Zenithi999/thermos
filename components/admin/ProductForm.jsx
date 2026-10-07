"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { deleteProduct, saveProduct } from "../../app/admin/actions";
import { formatPrice, slugify } from "../../lib/format";
import Icon from "../Icons";
import { prepareProductImage, suggestColors, uploadImage, validateImage } from "./imageTools";

const PRESETS = [
  { name: "Хар", bg_from: "#3a3a3d", bg_to: "#0b0b0c", accent: "#4a4a4d" },
  { name: "Ногоон", bg_from: "#2f5142", bg_to: "#0c1712", accent: "#3f6b52" },
  { name: "Цэнхэр", bg_from: "#233f5e", bg_to: "#0a121c", accent: "#33517a" },
  { name: "Шаргал", bg_from: "#6b5847", bg_to: "#1a140f", accent: "#8a7358" },
  { name: "Бордо", bg_from: "#5a2430", bg_to: "#160a0d", accent: "#7a3040" },
  { name: "Мөнгөлөг", bg_from: "#54585f", bg_to: "#131417", accent: "#7a7f88" },
];

const EMPTY = {
  id: "",
  name: "",
  slug: "",
  subtitle: "",
  capacity: "",
  description: "",
  category_id: "",
  price: "",
  compare_at_price: "",
  stock: "0",
  image_url: "",
  gallery: [],
  ...PRESETS[0],
  is_active: true,
  is_featured: false,
  hero_order: "0",
};

function toFormValues(product) {
  if (!product) return EMPTY;
  const v = { ...EMPTY };
  for (const key of Object.keys(EMPTY)) {
    if (product[key] !== null && product[key] !== undefined) v[key] = product[key];
  }
  for (const key of ["price", "compare_at_price", "stock", "hero_order"]) {
    v[key] = v[key] === "" ? "" : String(v[key]);
  }
  return v;
}

function Field({ label, name, error, hint, children, className = "" }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error ? <span className="error-text">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

function ColorField({ label, value, onChange, error }) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="color-field">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} spellCheck={false} />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function HeroPreview({ v }) {
  return (
    <div className="hero-preview" style={{ background: `radial-gradient(120% 100% at 50% 0%, ${v.bg_from} 0%, ${v.bg_to} 70%)` }}>
      <div className="hero-preview-bottle">
        {v.image_url ? (
          <Image src={v.image_url} alt="" width={200} height={360} />
        ) : (
          <span className="hero-preview-empty">Зураг</span>
        )}
        {v.subtitle && <span className="hero-preview-etch">{v.subtitle}</span>}
      </div>
      <span className="hero-preview-base" style={{ background: `radial-gradient(120% 140% at 50% 20%, ${v.accent} 0%, ${v.bg_to} 90%)` }} />
      <span className="hero-preview-price">
        <small>{v.name || "Нэр"}</small>
        {v.price ? formatPrice(v.price) : "0₮"}
      </span>
    </div>
  );
}

export default function ProductForm({ product, categories }) {
  const [state, formAction, pending] = useActionState(saveProduct, null);
  const [v, setV] = useState(() => toFormValues(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [uploading, setUploading] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [suggested, setSuggested] = useState(null);
  const mainInput = useRef(null);
  const galleryInput = useRef(null);
  const errors = state?.errors || {};
  const isNew = !product;

  const set = (key) => (e) => setV((prev) => ({ ...prev, [key]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));

  const onName = (e) => {
    const name = e.target.value;
    setV((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  };

  const onMainFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return setUploadError(problem);
    setUploadError("");
    setUploading("main");
    try {
      const prepared = await prepareProductImage(file).catch(() => file);
      const [url, colors] = await Promise.all([uploadImage(prepared), suggestColors(prepared).catch(() => null)]);
      setV((prev) => ({ ...prev, image_url: url, ...(isNew && colors && !prev.colorsTouched ? colors : {}) }));
      setSuggested(colors);
    } catch (err) {
      setUploadError(`Зураг хуулахад алдаа гарлаа: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const onGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const problem = files.map(validateImage).find(Boolean);
    if (problem) return setUploadError(problem);
    setUploadError("");
    setUploading("gallery");
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f)));
      setV((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
    } catch (err) {
      setUploadError(`Зураг хуулахад алдаа гарлаа: ${err.message}`);
    } finally {
      setUploading(null);
    }
  };

  const setColors = (colors) => setV((prev) => ({ ...prev, ...colors, colorsTouched: true }));
  const setColor = (key) => (value) => setV((prev) => ({ ...prev, [key]: value, colorsTouched: true }));

  return (
    <>
      <form action={formAction} className="product-form" noValidate>
        <input type="hidden" name="id" value={v.id} />
        <input type="hidden" name="image_url" value={v.image_url} />
        <input type="hidden" name="gallery" value={JSON.stringify(v.gallery)} />

        {state?.message && !state.ok && <div className="alert alert-error form-alert" role="alert">{state.message}</div>}

        <div className="form-layout">
          <div className="form-main">
            <section className="card card-pad">
              <h2 className="card-title">Үндсэн мэдээлэл</h2>
              <div className="grid-2">
                <Field label="Нэр" name="name" error={errors.name} className="span-2">
                  <input id="name" name="name" className="input" value={v.name} onChange={onName} placeholder="Жишээ: Matte Black" required />
                </Field>
                <Field label="Холбоос (slug)" name="slug" error={errors.slug} hint={`/products/${v.slug || "…"}`}>
                  <input
                    id="slug"
                    name="slug"
                    className="input"
                    value={v.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug")(e);
                    }}
                  />
                </Field>
                <Field label="Ангилал" name="category_id">
                  <select id="category_id" name="category_id" className="select" value={v.category_id} onChange={set("category_id")}>
                    <option value="">— Ангилалгүй —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Сав дээрх бичиг" name="subtitle" hint="Hero дээр савны гадна бичигдэнэ. Жишээ: Classic 500ml">
                  <input id="subtitle" name="subtitle" className="input" value={v.subtitle} onChange={set("subtitle")} />
                </Field>
                <Field label="Багтаамж" name="capacity">
                  <input id="capacity" name="capacity" className="input" value={v.capacity} onChange={set("capacity")} placeholder="500ml" />
                </Field>
                <Field label="Тайлбар" name="description" className="span-2">
                  <textarea id="description" name="description" className="textarea" rows={5} value={v.description} onChange={set("description")} placeholder="Материал, хадгалах хугацаа, онцлог…" />
                </Field>
              </div>
            </section>

            <section className="card card-pad">
              <h2 className="card-title">Зураг</h2>
              <div className="image-grid">
                <div className="image-main">
                  <span className="label">Үндсэн зураг (hero)</span>
                  <button
                    type="button"
                    className={`dropzone${v.image_url ? " has-image" : ""}${errors.image_url ? " invalid" : ""}`}
                    style={v.image_url ? { background: `linear-gradient(160deg, ${v.bg_from}, ${v.bg_to})` } : undefined}
                    onClick={() => mainInput.current?.click()}
                    disabled={uploading === "main"}
                  >
                    {v.image_url ? (
                      <Image src={v.image_url} alt="" width={200} height={360} />
                    ) : (
                      <span className="dropzone-empty">
                        <Icon name="upload" size={26} />
                        <b>Зураг сонгох</b>
                        <small>PNG (арын фонгүй) · 15MB хүртэл</small>
                      </span>
                    )}
                    {uploading === "main" && <span className="dropzone-busy">Хуулж байна…</span>}
                  </button>
                  <input ref={mainInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onMainFile} />
                  {v.image_url && (
                    <div className="image-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => mainInput.current?.click()}>Солих</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setV((p) => ({ ...p, image_url: "" }))}>Устгах</button>
                    </div>
                  )}
                  {errors.image_url && <span className="error-text">{errors.image_url}</span>}
                </div>

                <div className="image-gallery">
                  <span className="label">Нэмэлт зургууд</span>
                  <div className="gallery-edit">
                    {v.gallery.map((url, i) => (
                      <div key={url} className="gallery-edit-item">
                        <Image src={url} alt="" fill sizes="120px" />
                        <button
                          type="button"
                          className="gallery-remove"
                          aria-label="Зураг хасах"
                          onClick={() => setV((p) => ({ ...p, gallery: p.gallery.filter((_, j) => j !== i) }))}
                        >
                          <Icon name="close" size={14} strokeWidth={2.4} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="gallery-add" onClick={() => galleryInput.current?.click()} disabled={uploading === "gallery"}>
                      {uploading === "gallery" ? "…" : <Icon name="plus" size={22} />}
                    </button>
                  </div>
                  <input ref={galleryInput} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={onGalleryFiles} />
                  <p className="hint">Бүтээгдэхүүний хуудсан дээр харагдана. Амьдралын хэв маягийн зураг тохиромжтой.</p>
                </div>
              </div>
              {uploadError && <div className="alert alert-error">{uploadError}</div>}
              <div className="tip">
                <Icon name="image" size={18} />
                <p>
                  Hero-д гоё харагдуулахын тулд <b>арын фонгүй PNG</b> зураг ашиглана уу. Зургийн эргэн тойрны хоосон зайг автоматаар тайрна.
                  Фон арилгахдаа remove.bg зэрэг үнэгүй хэрэгсэл ашиглаж болно.
                </p>
              </div>
            </section>

            <section className="card card-pad">
              <h2 className="card-title">Үнэ ба үлдэгдэл</h2>
              <div className="grid-3">
                <Field label="Үнэ (₮)" name="price" error={errors.price}>
                  <input id="price" name="price" className="input" inputMode="numeric" value={v.price} onChange={set("price")} placeholder="89000" />
                </Field>
                <Field label="Хуучин үнэ (₮)" name="compare_at_price" error={errors.compare_at_price} hint="Хямдрал харуулах бол">
                  <input id="compare_at_price" name="compare_at_price" className="input" inputMode="numeric" value={v.compare_at_price} onChange={set("compare_at_price")} />
                </Field>
                <Field label="Үлдэгдэл (ш)" name="stock" error={errors.stock}>
                  <input id="stock" name="stock" className="input" inputMode="numeric" value={v.stock} onChange={set("stock")} />
                </Field>
              </div>
            </section>
          </div>

          <aside className="form-side">
            <section className="card card-pad">
              <h2 className="card-title">Төлөв</h2>
              <label className="toggle-row">
                <span>
                  <b>Дэлгүүрт харуулах</b>
                  <small>Унтраавал хэрэглэгчдэд харагдахгүй</small>
                </span>
                <input type="checkbox" name="is_active" className="toggle" checked={v.is_active} onChange={set("is_active")} />
              </label>
              <label className="toggle-row">
                <span>
                  <b>Онцлох бараа</b>
                  <small>Нүүр хуудасны “Бидний сонголт” хэсэгт гарна</small>
                </span>
                <input type="checkbox" name="is_featured" className="toggle" checked={v.is_featured} onChange={set("is_featured")} />
              </label>
              {v.is_featured && (
                <Field label="Онцлох дараалал" name="hero_order" error={errors.hero_order} hint="Бага тоо эхэнд гарна">
                  <input id="hero_order" name="hero_order" className="input" inputMode="numeric" value={v.hero_order} onChange={set("hero_order")} />
                </Field>
              )}
              {!v.is_featured && <input type="hidden" name="hero_order" value={v.hero_order} />}
            </section>

            <section className="card card-pad">
              <h2 className="card-title">Hero өнгө</h2>
              <HeroPreview v={v} />
              <div className="presets" role="group" aria-label="Бэлэн өнгө">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className={`preset${v.bg_from === p.bg_from && v.bg_to === p.bg_to ? " active" : ""}`}
                    style={{ background: `linear-gradient(160deg, ${p.bg_from}, ${p.bg_to})` }}
                    onClick={() => setColors({ bg_from: p.bg_from, bg_to: p.bg_to, accent: p.accent })}
                    title={p.name}
                    aria-label={p.name}
                  />
                ))}
              </div>
              {suggested && (
                <button type="button" className="btn btn-outline btn-sm btn-block" onClick={() => setColors(suggested)}>
                  Зурагнаас өнгө авах
                </button>
              )}
              <ColorField label="Фон (дээд)" value={v.bg_from} onChange={setColor("bg_from")} error={errors.bg_from} />
              <ColorField label="Фон (доод)" value={v.bg_to} onChange={setColor("bg_to")} error={errors.bg_to} />
              <ColorField label="Чулуун суурь" value={v.accent} onChange={setColor("accent")} error={errors.accent} />
              <input type="hidden" name="bg_from" value={v.bg_from} />
              <input type="hidden" name="bg_to" value={v.bg_to} />
              <input type="hidden" name="accent" value={v.accent} />
            </section>
          </aside>
        </div>

        <div className="save-bar">
          <Link href="/admin/products" className="btn btn-ghost">Болих</Link>
          <button type="submit" className="btn btn-primary" disabled={pending || Boolean(uploading)}>
            {pending ? "Хадгалж байна…" : isNew ? "Бүтээгдэхүүн нэмэх" : "Хадгалах"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form
          action={deleteProduct}
          className="danger-zone card card-pad"
          onSubmit={(e) => {
            if (!window.confirm(`“${product.name}”-г устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={product.id} />
          <div>
            <b>Бүтээгдэхүүн устгах</b>
            <p className="muted">Өмнөх захиалгууд хэвээр үлдэнэ. Түр нуух бол “Дэлгүүрт харуулах”-г унтраагаарай.</p>
          </div>
          <button type="submit" className="btn btn-danger">
            <Icon name="trash" /> Устгах
          </button>
        </form>
      )}
    </>
  );
}
