"use client";

/* One-click fix for product photos uploaded before margins were trimmed automatically:
   downloads each main image in the admin's browser, crops empty transparent / white
   margins with the same rules as new uploads, re-uploads it and points the product at it.
   Images that are already tight are left alone. */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setProductImage } from "../../app/admin/actions";
import Icon from "../Icons";
import { prepareProductImage, uploadImage, validateImage } from "./imageTools";

export default function ImageCleanup({ products }) {
  const router = useRouter();
  const [state, setState] = useState(null); // { done, total, fixed, failed, running }

  // Demo products point at bundled /images/… files; only uploaded photos can be rewritten
  const targets = products.filter((p) => p.image_url?.startsWith("https://"));

  const run = async () => {
    let fixed = 0;
    let failed = 0;
    setState({ done: 0, total: targets.length, fixed, failed, running: true });
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i];
      try {
        const res = await fetch(p.image_url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const file = new File([blob], p.image_url.split("/").pop(), { type: blob.type });
        if (validateImage(file)) throw new Error("unsupported");
        const prepared = await prepareProductImage(file);
        if (prepared !== file) {
          const url = await uploadImage(prepared);
          await setProductImage(p.id, url);
          fixed += 1;
        }
      } catch {
        failed += 1;
      }
      setState({ done: i + 1, total: targets.length, fixed, failed, running: i + 1 < targets.length });
    }
    router.refresh();
  };

  if (!targets.length) return null;

  return (
    <div className="image-cleanup">
      <button type="button" className="btn btn-outline btn-sm" onClick={run} disabled={state?.running}>
        <Icon name="image" size={16} />
        {state?.running ? `Цэгцэлж байна… ${state.done}/${state.total}` : "Зургуудыг цэгцлэх"}
      </button>
      {state && !state.running && (
        <span className={`form-msg ${state.failed ? "err" : "ok"}`} role="status">
          {state.fixed} зураг засагдлаа
          {state.total - state.fixed - state.failed > 0 && `, ${state.total - state.fixed - state.failed} нь аль хэдийн цэвэр`}
          {state.failed > 0 && `, ${state.failed} алдаа`}
        </span>
      )}
    </div>
  );
}
