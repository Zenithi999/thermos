import Image from "next/image";
import { ORDER_STATUS, PAYMENT_STATUS, formatDate, formatPrice } from "../../lib/format";
import Icon from "../Icons";

const STEPS = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetails({ order }) {
  const cancelled = order.status === "cancelled";
  const currentStep = STEPS.indexOf(order.status);
  const payment = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.unpaid;

  return (
    <div className="order-details">
      <div className="order-head">
        <div>
          <span className="muted">Захиалгын дугаар</span>
          <strong className="order-number">{order.order_number}</strong>
          {order.created_at && <span className="muted">{formatDate(order.created_at)}</span>}
        </div>
        <span className={`badge badge-${payment.tone}`}>{payment.label}</span>
      </div>

      {cancelled ? (
        <div className="alert alert-error">Энэ захиалга цуцлагдсан байна.</div>
      ) : (
        <ol className="timeline" aria-label="Захиалгын явц">
          {STEPS.map((step, i) => (
            <li key={step} className={i <= currentStep ? "done" : undefined} aria-current={i === currentStep ? "step" : undefined}>
              <span className="timeline-dot">{i <= currentStep && <Icon name="check" size={14} strokeWidth={2.4} />}</span>
              <span className="timeline-label">{ORDER_STATUS[step].label}</span>
            </li>
          ))}
        </ol>
      )}

      {order.items?.length > 0 && (
        <ul className="summary-items">
          {order.items.map((item, i) => (
            <li key={i}>
              <span className="summary-thumb">
                {item.product_image && <Image src={item.product_image} alt="" width={60} height={108} />}
                <span className="summary-qty">{item.quantity}</span>
              </span>
              <span className="summary-name">{item.product_name}</span>
              <span className="summary-price">{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="totals">
        {order.subtotal != null && <div><dt>Барааны дүн</dt><dd>{formatPrice(order.subtotal)}</dd></div>}
        {order.shipping_fee != null && (
          <div><dt>Хүргэлт</dt><dd>{order.shipping_fee === 0 ? "Үнэгүй" : formatPrice(order.shipping_fee)}</dd></div>
        )}
        <div className="totals-grand"><dt>Нийт</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>

      {order.address && (
        <div className="order-address">
          <Icon name="pin" size={16} />
          <span>
            {[order.city, order.district].filter(Boolean).join(", ")} — {order.address}
          </span>
        </div>
      )}
    </div>
  );
}
