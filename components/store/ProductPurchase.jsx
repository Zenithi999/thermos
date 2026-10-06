"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../cart/CartProvider";
import AddToCartButton from "./AddToCartButton";
import QuantityStepper from "./QuantityStepper";

export default function ProductPurchase({ product }) {
  const router = useRouter();
  const { add, items } = useCart();
  const inCart = items.find((i) => i.id === product.id)?.quantity || 0;
  const available = Math.max(0, product.stock - inCart);
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const quantity = Math.max(1, Math.min(qty, available || 1));

  const buyNow = () => {
    if (available > 0) add(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="purchase">
      <div className="purchase-row">
        <QuantityStepper value={quantity} max={Math.max(1, available)} onChange={setQty} size="lg" />
        <AddToCartButton product={product} quantity={quantity} className="purchase-add" />
      </div>
      <button type="button" className="btn btn-outline btn-lg btn-block" onClick={buyNow} disabled={soldOut}>
        Шууд захиалах
      </button>
      {!soldOut && product.stock <= 5 && (
        <p className="stock-warn">Сүүлийн {product.stock} ширхэг үлдлээ</p>
      )}
    </div>
  );
}
