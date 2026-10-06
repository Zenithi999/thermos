import { getSettings } from "../../../../lib/data";
import { formatPrice } from "../../../../lib/format";

export const metadata = { title: "Хүргэлт ба буцаалт" };

export default async function DeliveryPage() {
  const settings = await getSettings();

  return (
    <div className="container container-narrow prose">
      <header className="page-head">
        <h1>Хүргэлт ба буцаалт</h1>
      </header>

      <h2>Хүргэлт</h2>
      <ul>
        <li>Улаанбаатар хотод захиалга баталгаажснаас хойш 24–48 цагийн дотор хүргэнэ.</li>
        <li>
          Хүргэлтийн төлбөр {formatPrice(settings.shipping_fee)}
          {settings.free_shipping_over > 0 && <>; {formatPrice(settings.free_shipping_over)}-с дээш захиалгад үнэгүй</>}.
        </li>
        <li>Орон нутагт унаагаар илгээх бөгөөд ачааны төлбөрийг хүлээн авагч төлнө.</li>
      </ul>

      <h2>Төлбөр</h2>
      <p>Захиалга өгсний дараа манай ажилтан тантай холбогдож төлбөрийн мэдээллийг өгнө. Онлайн төлбөр удахгүй нэмэгдэнэ.</p>

      <h2>Буцаалт ба солилт</h2>
      <ul>
        <li>Бараагаа хүлээн авснаас хойш 7 хоногийн дотор, ашиглаагүй, сав баглаа боодол нь бүрэн бол буцаах боломжтой.</li>
        <li>Үйлдвэрийн гэмтэлтэй бараанд 1 жилийн баталгаа үйлчилнэ.</li>
      </ul>
      {settings.phone && <p>Асуух зүйл байвал <a href={`tel:${settings.phone}`}>{settings.phone}</a> дугаарт холбогдоорой.</p>}
    </div>
  );
}
