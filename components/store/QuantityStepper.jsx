"use client";

import Icon from "../Icons";

export default function QuantityStepper({ value, min = 1, max = 99, onChange, size = "md", label = "Тоо ширхэг" }) {
  return (
    <div className={`stepper stepper-${size}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Хасах">
        <Icon name="minus" size={16} strokeWidth={2} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Нэмэх">
        <Icon name="plus" size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
