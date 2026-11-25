"use client";

/* Product photo inside a card. Photos come in very different shapes (tall bottles, wide
   mugs), so once the image loads its aspect ratio is passed to CSS as --ar and the
   stylesheet sizes it to cover roughly the same visual area as every other product. */

import Image from "next/image";
import { useState } from "react";

export default function ProductThumb({ src, alt, sizes }) {
  const [ratio, setRatio] = useState(null);
  const measure = (img) => {
    if (img?.complete && img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
  };

  return (
    <Image
      // a cached image can finish loading before React hydrates and never fire onLoad
      ref={measure}
      src={src}
      alt={alt}
      width={500}
      height={900}
      sizes={sizes}
      className={`pcard-img${ratio ? " is-sized" : ""}`}
      style={ratio ? { "--ar": ratio } : undefined}
      onLoad={(e) => measure(e.currentTarget)}
    />
  );
}
