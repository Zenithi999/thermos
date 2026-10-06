"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "newest", label: "Шинэ эхэндээ" },
  { value: "price-asc", label: "Үнэ: багаас их" },
  { value: "price-desc", label: "Үнэ: ихээс бага" },
];

export default function SortSelect({ value }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <label className="sort">
      <span className="sr-only">Эрэмбэлэх</span>
      <select className="select" value={value} onChange={onChange}>
        {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
