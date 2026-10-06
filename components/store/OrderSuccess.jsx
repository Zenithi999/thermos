"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_ORDER_KEY } from "../../lib/shipping";
import Icon from "../Icons";
import OrderDetails from "./OrderDetails";

export default function OrderSuccess({ orderNumber }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(LAST_ORDER_KEY) || "null");
      if (saved && saved.order_number === orderNumber) setOrder(saved);
    } catch {
      // ignore — we still show the order number
    }
  }, [orderNumber]);

  return (
    <div className="success">
      <span className="success-icon"><Icon name="check" size={34} strokeWidth={2.2} /></span>
      <h1>Захиалга амжилттай!</h1>
      <p className="muted">
        Баярлалаа. Манай ажилтан тантай удахгүй холбогдож захиалгыг баталгаажуулна.
      </p>
      {orderNumber && !order && (
        <p className="success-number">
          Захиалгын дугаар: <strong>{orderNumber}</strong>
        </p>
      )}
      {order && (
        <div className="panel success-panel">
          <OrderDetails order={order} />
        </div>
      )}
      <p className="muted small">Захиалгын дугаараа хадгалаарай — явцаа “Захиалга шалгах” хэсгээс харах боломжтой.</p>
      <div className="success-actions">
        <Link href="/track" className="btn btn-outline">Захиалга шалгах</Link>
        <Link href="/shop" className="btn btn-primary">Дэлгүүр үргэлжлүүлэх</Link>
      </div>
    </div>
  );
}
