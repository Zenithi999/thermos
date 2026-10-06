"use client";

import { createClient } from "../../lib/supabase/browser";

export const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateImage(file) {
  if (!TYPES.includes(file.type)) return "Зөвхөн PNG, JPG, WEBP зураг оруулна.";
  if (file.size > MAX_BYTES) return "Зургийн хэмжээ 5MB-аас ихгүй байна.";
  return null;
}

export async function uploadImage(file) {
  const supabase = createClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

const MAX_SIDE = 1800;

// Crop away fully transparent margins (so the product fills the hero) and cap the
// longest side at MAX_SIDE. Photos without transparency are only resized.
export async function prepareProductImage(file) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);

  let crop = { x: 0, y: 0, w: width, h: height };
  if (file.type !== "image/jpeg") {
    const { data } = ctx.getImageData(0, 0, width, height);
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
      const row = y * width * 4;
      for (let x = 0; x < width; x++) {
        if (data[row + x * 4 + 3] > 12) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX >= 0) {
      const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
      const x = Math.max(0, minX - pad);
      const y = Math.max(0, minY - pad);
      crop = { x, y, w: Math.min(width, maxX + pad + 1) - x, h: Math.min(height, maxY + pad + 1) - y };
    }
  }

  const trimmed = crop.w < width * 0.97 || crop.h < height * 0.97;
  const scale = Math.min(1, MAX_SIDE / Math.max(crop.w, crop.h));
  if (!trimmed && scale === 1) return file;

  const out = document.createElement("canvas");
  out.width = Math.round(crop.w * scale);
  out.height = Math.round(crop.h * scale);
  out.getContext("2d").drawImage(canvas, crop.x, crop.y, crop.w, crop.h, 0, 0, out.width, out.height);

  const type = file.type === "image/jpeg" ? "image/jpeg" : file.type === "image/webp" ? "image/webp" : "image/png";
  const blob = await new Promise((resolve) => out.toBlob(resolve, type, 0.92));
  if (!blob) return file;
  return new File([blob], file.name, { type });
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

// Average color of the opaque pixels → a dark gradient + stone color in the same hue.
export async function suggestColors(file) {
  const bitmap = await createImageBitmap(file);
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 200) continue;
    // ignore near-white studio backgrounds on non-transparent photos
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  }
  if (!n) return null;

  const [h, s] = rgbToHsl(r / n, g / n, b / n);
  const sat = Math.min(45, s * 0.6);
  return {
    bg_from: hslToHex(h, sat, 24),
    bg_to: hslToHex(h, sat, 6),
    accent: hslToHex(h, sat, 32),
  };
}
