import { cache } from "react";
import { isSupabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/public";

// Public storefront reads. RLS already hides inactive products from anonymous users.

const PRODUCT_FIELDS =
  "id, name, slug, subtitle, description, capacity, price, compare_at_price, stock, image_url, gallery, bg_from, bg_to, accent, is_featured, hero_order, category_id, created_at, category:categories(name, slug)";

function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export async function getFeaturedProducts() {
  if (!isSupabaseConfigured) return [];
  const supabase = createPublicClient();
  return unwrap(
    await supabase
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("hero_order", { ascending: true })
      .order("created_at", { ascending: false })
  );
}

const SORTS = {
  newest: ["created_at", false],
  "price-asc": ["price", true],
  "price-desc": ["price", false],
};

export async function getProducts({ category, sort = "newest", limit } = {}) {
  if (!isSupabaseConfigured) return [];
  const supabase = createPublicClient();
  const [column, ascending] = SORTS[sort] || SORTS.newest;

  let query = supabase
    .from("products")
    .select(category ? PRODUCT_FIELDS.replace("categories(", "categories!inner(") : PRODUCT_FIELDS)
    .eq("is_active", true)
    .order(column, { ascending });

  if (category) query = query.eq("category.slug", category);
  if (limit) query = query.limit(limit);

  return unwrap(await query);
}

export const getProductBySlug = cache(async (slug) => {
  if (!isSupabaseConfigured) return null;
  const supabase = createPublicClient();
  return unwrap(
    await supabase.from("products").select(PRODUCT_FIELDS).eq("slug", slug).eq("is_active", true).maybeSingle()
  );
});

export async function getRelatedProducts(product, limit = 4) {
  if (!isSupabaseConfigured) return [];
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(limit);
  if (product.category_id) query = query.eq("category_id", product.category_id);
  return unwrap(await query);
}

export const getCategories = cache(async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = createPublicClient();
  return unwrap(await supabase.from("categories").select("id, name, slug").order("sort_order"));
});

const DEFAULT_SETTINGS = { shipping_fee: 5000, free_shipping_over: 150000 };

export const getSettings = cache(async () => {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const supabase = createPublicClient();
  const data = unwrap(await supabase.from("settings").select("*").eq("id", 1).maybeSingle());
  return data || DEFAULT_SETTINGS;
});
