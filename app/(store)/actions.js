"use server";

import { createPublicClient } from "../../lib/supabase/public";
import { createClient } from "../../lib/supabase/server";

const PHONE_RE = /^[0-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function orderErrorMessage(message = "") {
  if (message.includes("OUT_OF_STOCK")) {
    const name = message.split("OUT_OF_STOCK:")[1]?.trim();
    return name
      ? `“${name}” барааны үлдэгдэл хүрэлцэхгүй байна. Сагсаа шинэчилнэ үү.`
      : "Зарим барааны үлдэгдэл хүрэлцэхгүй байна.";
  }
  if (message.includes("PRODUCT_UNAVAILABLE")) return "Сагсанд байгаа нэг бараа худалдаанаас гарсан байна. Сагсаа шинэчилнэ үү.";
  if (message.includes("EMPTY_CART")) return "Таны сагс хоосон байна.";
  if (message.includes("MISSING_FIELDS")) return "Шаардлагатай талбаруудыг бөглөнө үү.";
  return "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.";
}

export async function placeOrder(prevState, formData) {
  const values = {
    customer_name: String(formData.get("customer_name") || "").trim(),
    phone: String(formData.get("phone") || "").replace(/\D/g, ""),
    email: String(formData.get("email") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    khoroo: String(formData.get("khoroo") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    note: String(formData.get("note") || "").trim(),
  };

  const errors = {};
  if (values.customer_name.length < 2) errors.customer_name = "Нэрээ оруулна уу";
  if (!PHONE_RE.test(values.phone)) errors.phone = "8 оронтой утасны дугаар оруулна уу";
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Имэйл хаяг буруу байна";
  if (!values.city) errors.city = "Хот/аймгаа сонгоно уу";
  if (!values.district) errors.district = "Дүүрэг/сумаа оруулна уу";
  if (values.address.length < 5) errors.address = "Хаягаа дэлгэрэнгүй оруулна уу";

  let items = [];
  try {
    items = JSON.parse(String(formData.get("items") || "[]"))
      .map((i) => ({ product_id: String(i.id), quantity: Math.floor(Number(i.quantity)) }))
      .filter((i) => i.product_id && i.quantity > 0);
  } catch {
    items = [];
  }

  if (Object.keys(errors).length) return { ok: false, errors, values };
  if (!items.length) return { ok: false, message: "Таны сагс хоосон байна.", values };

  // Session-aware client so place_order() links the order to a signed-in customer (auth.uid()).
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", { customer: values, items });
  if (error || !data?.[0]) {
    return { ok: false, message: orderErrorMessage(error?.message), values };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    // Remember the delivery details for next time
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: values.customer_name,
      phone: values.phone,
      city: values.city,
      district: values.district,
      khoroo: values.khoroo,
      address: values.address,
      updated_at: new Date().toISOString(),
    });
  }

  const orderNumber = data[0].order_number;
  const { data: order } = await supabase.rpc("get_order", { p_order_number: orderNumber, p_phone: values.phone });

  return { ok: true, order: order || { order_number: orderNumber, total: data[0].total } };
}

export async function trackOrder(prevState, formData) {
  const orderNumber = String(formData.get("order_number") || "").trim();
  const phone = String(formData.get("phone") || "").replace(/\D/g, "");
  const values = { order_number: orderNumber, phone };

  if (!orderNumber || !PHONE_RE.test(phone)) {
    return { ok: false, message: "Захиалгын дугаар болон 8 оронтой утасны дугаараа оруулна уу.", values };
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_order", { p_order_number: orderNumber, p_phone: phone });
  if (error) return { ok: false, message: "Алдаа гарлаа. Дахин оролдоно уу.", values };
  if (!data) return { ok: false, message: "Ийм захиалга олдсонгүй. Дугаараа шалгаад дахин оролдоно уу.", values };

  return { ok: true, order: data, values };
}
