import "../../styles/store.css";
import { CartProvider } from "../../components/cart/CartProvider";
import SetupNotice from "../../components/SetupNotice";
import SiteFooter from "../../components/store/SiteFooter";
import StoreHeader from "../../components/store/StoreHeader";
import { getCategories, getSettings } from "../../lib/data";
import { isSupabaseConfigured } from "../../lib/supabase/env";

// Product data, stock and prices change from /admin, so storefront pages render per request.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <CartProvider>
      <StoreHeader
        categories={categories}
        freeShippingOver={settings.free_shipping_over}
        instagramUrl={settings.instagram_url}
      />
      {children}
      <SiteFooter settings={settings} categories={categories} />
    </CartProvider>
  );
}
