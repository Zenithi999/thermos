import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../../lib/format";
import AddToCartButton from "./AddToCartButton";

const NEW_FOR_MS = 30 * 24 * 60 * 60 * 1000;

export default function ProductCard({ product }) {
  const soldOut = product.stock <= 0;
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const isNew = product.created_at && Date.now() - new Date(product.created_at).getTime() < NEW_FOR_MS;
  const href = `/products/${product.slug}`;

  return (
    <article className="pcard">
      <Link href={href} className="pcard-media" aria-label={product.name}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={500}
            height={900}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 300px"
            className="pcard-img"
          />
        ) : (
          <span className="pcard-img pcard-img-empty" />
        )}
        <span className="pcard-flags">
          {soldOut && <span className="flag flag-dark">Дууссан</span>}
          {!soldOut && onSale && (
            <span className="flag flag-red">−{Math.round((1 - product.price / product.compare_at_price) * 100)}%</span>
          )}
          {!soldOut && isNew && <span className="flag flag-gold">Шинэ</span>}
        </span>
      </Link>

      <div className="pcard-body">
        {product.category && <span className="pcard-cat">{product.category.name}</span>}
        <Link href={href} className="pcard-name">{product.name}</Link>
        {(product.subtitle || product.capacity) && (
          <span className="pcard-meta">{[product.subtitle, product.capacity].filter(Boolean).join(" · ")}</span>
        )}
        <span className="pcard-price">
          <b className={onSale ? "is-sale" : undefined}>{formatPrice(product.price)}</b>
          {onSale && <s>{formatPrice(product.compare_at_price)}</s>}
        </span>
      </div>

      <AddToCartButton product={product} compact />
    </article>
  );
}
