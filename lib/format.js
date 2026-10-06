export function formatPrice(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("en-US")}₮`;
}

export function formatDate(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const ORDER_STATUS = {
  pending: { label: "Хүлээгдэж буй", tone: "amber" },
  confirmed: { label: "Баталгаажсан", tone: "blue" },
  shipped: { label: "Хүргэлтэнд гарсан", tone: "violet" },
  delivered: { label: "Хүргэгдсэн", tone: "green" },
  cancelled: { label: "Цуцлагдсан", tone: "red" },
};

export const PAYMENT_STATUS = {
  unpaid: { label: "Төлөөгүй", tone: "amber" },
  paid: { label: "Төлсөн", tone: "green" },
  refunded: { label: "Буцаасан", tone: "red" },
};

export function slugify(text) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z", и: "i", й: "i",
    к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t", у: "u",
    ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e",
    ю: "yu", я: "ya",
  };
  return String(text)
    .toLowerCase()
    .split("")
    .map((c) => (c in map ? map[c] : c))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
