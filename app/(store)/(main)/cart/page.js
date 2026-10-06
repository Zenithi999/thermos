import CartView from "../../../../components/store/CartView";
import { getSettings } from "../../../../lib/data";

export const metadata = { title: "Сагс" };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="container">
      <header className="page-head">
        <h1>Таны сагс</h1>
      </header>
      <CartView settings={{ shipping_fee: settings.shipping_fee, free_shipping_over: settings.free_shipping_over }} />
    </div>
  );
}
