"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/auth";
import { slugify } from "../../lib/format";
import { createClient } from "../../lib/supabase/server";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

function refreshStore() {
  revalidatePath("/", "layout");
}

const text = (fd, key) => String(fd.get(key) ?? "").trim();
const int = (fd, key) => {
  const raw = text(fd, key).replace(/[\s,]/g, "");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : NaN;
};

// ---------- Auth ----------

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Products ----------

export async function saveProduct(prevState, formData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");

  let gallery = [];
  try {
    gallery = JSON.parse(text(formData, "gallery") || "[]").filter((u) => typeof u === "string" && u);
  } catch {
    gallery = [];
  }

  const values = {
    name: text(formData, "name"),
    slug: slugify(text(formData, "slug") || text(formData, "name")),
    subtitle: text(formData, "subtitle") || null,
    capacity: text(formData, "capacity") || null,
    description: text(formData, "description") || null,
    category_id: text(formData, "category_id") || null,
    price: int(formData, "price"),
    compare_at_price: int(formData, "compare_at_price"),
    stock: int(formData, "stock") ?? 0,
    image_url: text(formData, "image_url") || null,
    gallery,
    bg_from: text(formData, "bg_from"),
    bg_to: text(formData, "bg_to"),
    accent: text(formData, "accent"),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    hero_order: int(formData, "hero_order") ?? 0,
  };

  const errors = {};
  if (values.name.length < 2) errors.name = "Нэрээ оруулна уу";
  if (!values.slug) errors.slug = "Холбоос (slug) буруу байна";
  if (values.price === null || Number.isNaN(values.price) || values.price < 0) errors.price = "Үнээ зөв оруулна уу";
  if (Number.isNaN(values.compare_at_price) || (values.compare_at_price !== null && values.compare_at_price < 0))
    errors.compare_at_price = "Зөв тоо оруулна уу";
  if (Number.isNaN(values.stock) || values.stock < 0) errors.stock = "Үлдэгдэл 0 эсвэл түүнээс их байна";
  if (Number.isNaN(values.hero_order)) errors.hero_order = "Тоо оруулна уу";
  for (const key of ["bg_from", "bg_to", "accent"]) {
    if (!HEX_RE.test(values[key])) errors[key] = "Өнгө #RRGGBB хэлбэртэй байна";
  }
  if (values.is_featured && !values.image_url) errors.image_url = "Hero-д харуулах бол үндсэн зураг заавал оруулна";

  if (Object.keys(errors).length) return { ok: false, errors, message: "Талбаруудаа шалгана уу." };

  const query = id
    ? supabase.from("products").update(values).eq("id", id)
    : supabase.from("products").insert(values);
  const { error } = await query;

  if (error) {
    if (error.code === "23505") {
      return { ok: false, errors: { slug: "Энэ холбоос өөр бүтээгдэхүүнд ашиглагдсан байна" }, message: "Холбоос давхцаж байна." };
    }
    return { ok: false, message: `Хадгалахад алдаа гарлаа: ${error.message}` };
  }

  refreshStore();
  redirect(`/admin/products?saved=${encodeURIComponent(values.name)}`);
}

export async function deleteProduct(formData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refreshStore();
  redirect("/admin/products?deleted=1");
}

export async function toggleProductFlag(formData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  const field = text(formData, "field");
  if (!["is_active", "is_featured"].includes(field)) return;
  const value = text(formData, "value") === "true";

  if (field === "is_featured" && value) {
    const { data } = await supabase.from("products").select("image_url").eq("id", id).single();
    if (!data?.image_url) return;
  }

  await supabase.from("products").update({ [field]: value }).eq("id", id);
  refreshStore();
  revalidatePath("/admin/products");
}

// ---------- Categories ----------

export async function saveCategory(prevState, formData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (name.length < 2) return { ok: false, message: "Ангиллын нэрээ оруулна уу." };

  const values = {
    name,
    slug: slugify(text(formData, "slug") || name),
    sort_order: int(formData, "sort_order") || 0,
  };
  if (!values.slug) return { ok: false, message: "Холбоос үүсгэж чадсангүй. Латин үсгээр slug оруулна уу." };

  const { error } = id
    ? await supabase.from("categories").update(values).eq("id", id)
    : await supabase.from("categories").insert(values);

  if (error) {
    return { ok: false, message: error.code === "23505" ? "Ийм холбоостой ангилал байна." : error.message };
  }
  refreshStore();
  revalidatePath("/admin/categories");
  return { ok: true, message: id ? "Хадгаллаа" : "Ангилал нэмэгдлээ", key: Date.now() };
}

export async function deleteCategory(formData) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", text(formData, "id"));
  refreshStore();
  revalidatePath("/admin/categories");
}

// ---------- Orders ----------

export async function updateOrderStatus(formData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!ORDER_STATUSES.includes(status)) return;
  const { error } = await supabase.rpc("set_order_status", { p_order_id: id, p_status: status });
  if (error) throw new Error(error.message.includes("ALREADY_CANCELLED") ? "Цуцлагдсан захиалгыг өөрчлөх боломжгүй." : error.message);
  refreshStore();
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updatePaymentStatus(formData) {
  const { supabase } = await requireAdmin();
  const id = text(formData, "id");
  const payment_status = text(formData, "payment_status");
  if (!PAYMENT_STATUSES.includes(payment_status)) return;
  await supabase.from("orders").update({ payment_status }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

// ---------- Settings ----------

export async function saveSettings(prevState, formData) {
  const { supabase } = await requireAdmin();
  const values = {
    shipping_fee: int(formData, "shipping_fee") ?? 0,
    free_shipping_over: int(formData, "free_shipping_over") ?? 0,
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    address: text(formData, "address"),
    instagram_url: text(formData, "instagram_url"),
    facebook_url: text(formData, "facebook_url"),
  };
  if (Number.isNaN(values.shipping_fee) || values.shipping_fee < 0 || Number.isNaN(values.free_shipping_over) || values.free_shipping_over < 0) {
    return { ok: false, message: "Хүргэлтийн дүнгээ зөв оруулна уу." };
  }
  for (const key of ["instagram_url", "facebook_url"]) {
    if (values[key] && !/^https?:\/\//.test(values[key])) {
      return { ok: false, message: "Сошиал холбоос https:// -ээр эхэлнэ." };
    }
  }

  const { error } = await supabase.from("settings").update(values).eq("id", 1);
  if (error) return { ok: false, message: error.message };
  refreshStore();
  return { ok: true, message: "Тохиргоо хадгалагдлаа", key: Date.now() };
}
