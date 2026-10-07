"use client";

/* Upload one photo to Supabase Storage and submit its URL with the surrounding form
   through a hidden input. variant="wide" is the home banner, "thumb" a small square
   used inside the category rows. */

import { useRef, useState } from "react";
import Icon from "../Icons";
import { uploadImage, validateImage } from "./imageTools";

export default function ImageField({ name, defaultValue = "", folder, variant = "wide", label, hint }) {
  const input = useRef(null);
  const [url, setUrl] = useState(defaultValue || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const invalid = validateImage(file);
    if (invalid) return setError(invalid);
    setError("");
    setBusy(true);
    try {
      setUrl(await uploadImage(file, folder));
    } catch (err) {
      setError(`Хуулахад алдаа гарлаа: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`image-field image-field-${variant}`}>
      <input type="hidden" name={name} value={url} />
      <button
        type="button"
        className={`image-field-drop${url ? " has-image" : ""}`}
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={label || "Зураг оруулах"}
        title={label || "Зураг оруулах"}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" />
        ) : variant === "thumb" ? (
          <Icon name="image" size={20} />
        ) : (
          <span className="dropzone-empty">
            <Icon name="upload" size={26} />
            <b>Зураг сонгох</b>
            {hint && <small>{hint}</small>}
          </span>
        )}
        {busy && <span className="dropzone-busy">{variant === "thumb" ? "…" : "Хуулж байна…"}</span>}
      </button>
      {url && variant === "wide" && (
        <div className="image-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => input.current?.click()} disabled={busy}>
            Солих
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUrl("")} disabled={busy}>
            Устгах
          </button>
        </div>
      )}
      {url && variant === "thumb" && (
        <button type="button" className="image-field-clear" onClick={() => setUrl("")} aria-label="Зураг устгах" title="Зураг устгах">
          <Icon name="close" size={12} strokeWidth={2.4} />
        </button>
      )}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onFile} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
