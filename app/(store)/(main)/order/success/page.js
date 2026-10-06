import OrderSuccess from "../../../../../components/store/OrderSuccess";

export const metadata = { title: "Захиалга амжилттай" };

export default async function OrderSuccessPage({ searchParams }) {
  const { n } = await searchParams;
  return (
    <div className="container container-narrow">
      <OrderSuccess orderNumber={typeof n === "string" ? n : ""} />
    </div>
  );
}
