"use client";

import { useCart } from "../cart/CartProvider";
import Icon from "../Icons";

export default function AddToCartButton({ product, quantity = 1, compact = false, className = "" }) {
  const { add, items } = useCart();
  const inCart = items.find((i) => i.id === product.id)?.quantity || 0;
  const soldOut = product.stock <= 0;
  const maxed = inCart >= product.stock;

  if (compact) {
    return (
      <button
        type="button"
        className="pcard-add"
        onClick={() => add(product, quantity)}
        disabled={soldOut || maxed}
        aria-label={soldOut ? "Дууссан" : `${product.name} сагсанд нэмэх`}
      >
        {soldOut ? "Дууссан" : maxed ? "Үлдэгдэл хүрэлцэхгүй" : (
          <>
            <Icon name="plus" size={16} strokeWidth={2.2} /> Сагсанд нэмэх
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-primary btn-lg ${className}`}
      onClick={() => add(product, quantity)}
      disabled={soldOut || maxed}
    >
      <Icon name="cart" />
      {soldOut ? "Дууссан" : maxed ? "Үлдэгдэл хүрэлцэхгүй" : "Сагсанд нэмэх"}
    </button>
  );
}
