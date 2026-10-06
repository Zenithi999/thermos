import Link from "next/link";
import CheckoutForm from "../../../../components/store/CheckoutForm";
import { getCurrentCustomer } from "../../../../lib/account";
import { getSettings } from "../../../../lib/data";

export const metadata = { title: "Захиалга хийх" };

export default async function CheckoutPage() {
  const [settings, customer] = await Promise.all([getSettings(), getCurrentCustomer()]);

  const defaults = customer
    ? {
        customer_name: customer.profile.full_name,
        phone: customer.profile.phone,
        email: customer.user.email,
        city: customer.profile.city,
        district: customer.profile.district,
        khoroo: customer.profile.khoroo,
        address: customer.profile.address,
      }
    : {};

  return (
    <div className="container">
      <header className="page-head">
        <Link href="/cart" className="back-link">← Сагс руу буцах</Link>
        <h1>Захиалга хийх</h1>
      </header>
      <CheckoutForm
        settings={{ shipping_fee: settings.shipping_fee, free_shipping_over: settings.free_shipping_over }}
        defaults={defaults}
        signedIn={Boolean(customer)}
      />
    </div>
  );
}
