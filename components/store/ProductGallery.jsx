"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ product }) {
  const images = [product.image_url, ...(product.gallery || [])].filter(Boolean);
  const [index, setIndex] = useState(0);
  const current = images[index];
  // The main photo is a transparent PNG shown on the brand gray; extra photos fill the frame.
  const isMain = index === 0;

  return (
    <div className="gallery">
      <div className={`gallery-main${isMain ? " is-cutout" : ""}`}>
        {current ? (
          <Image
            key={current}
            src={current}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 600px"
            className="gallery-img"
            priority
          />
        ) : (
          <span className="gallery-empty">Зураг байхгүй</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs" role="tablist" aria-label="Зургууд">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Зураг ${i + 1}`}
              className={`gallery-thumb${i === index ? " active" : ""}`}
              onClick={() => setIndex(i)}
            >
              <Image src={src} alt="" fill sizes="80px" className={i === 0 ? "thumb-contain" : "thumb-cover"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
