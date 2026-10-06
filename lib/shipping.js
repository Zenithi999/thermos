export const LAST_ORDER_KEY = "nomad-last-order";

// Mirrors the shipping rule inside place_order() in supabase/schema.sql.
export function shippingFor(subtotal, settings) {
  if (!subtotal) return 0;
  if (settings.free_shipping_over > 0 && subtotal >= settings.free_shipping_over) return 0;
  return settings.shipping_fee;
}
