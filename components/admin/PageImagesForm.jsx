"use client";

import { useActionState } from "react";
import { savePageImages } from "../../app/admin/actions";
import { IMAGE_SLOTS } from "../../lib/pageContent";
import Icon from "../Icons";
import ImageField from "./ImageField";

export default function PageImagesForm({ images = {} }) {
  const [state, formAction, pending] = useActionState(savePageImages, null);

  return (
    <form action={formAction} className="settings-form">
      {IMAGE_SLOTS.map((group) => (
        <section key={group.group} className="card card-pad">
          <div className="page-images-head">
            <h2 className="card-title">{group.group}</h2>
            <a href={group.href} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              <Icon name="external" size={14} /> Хуудсыг харах
            </a>
          </div>
          <div className="page-images-grid">
            {group.slots.map((slot) => (
              <div key={slot.key} className={`page-image-slot${slot.wide ? " is-wide" : ""}`}>
                <span className="label">{slot.label}</span>
                <ImageField
                  name={`img_${slot.key}`}
                  defaultValue={images[slot.key]}
                  fallback={slot.fallback}
                  folder="pages"
                  variant={slot.wide ? "wide" : "card"}
                  label={slot.label}
                />
                {slot.hint && <span className="hint">{slot.hint}</span>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="save-bar">
        {state?.message && (
          <span className={`form-msg ${state.ok ? "ok" : "err"}`} role="status">{state.message}</span>
        )}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Хадгалж байна…" : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}
