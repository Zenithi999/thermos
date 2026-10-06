"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{8}$/;

const text = (fd, key) => String(fd.get(key) ?? "").trim();

// Only allow redirects back into this site
function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

function authMessage(message = "") {
  if (message.includes("Invalid login")) return "Имэйл эсвэл нууц үг буруу байна.";
  if (message.includes("Email not confirmed")) return "Имэйлээ баталгаажуулаагүй байна. Ирсэн захидлын холбоос дээр дарна уу.";
  if (message.includes("already registered")) return "Энэ имэйлээр бүртгэл үүссэн байна. Нэвтэрнэ үү.";
  if (message.includes("Password should")) return "Нууц үг хамгийн багадаа 6 тэмдэгт байна.";
  if (message.toLowerCase().includes("rate limit")) return "Хэт олон оролдлого хийлээ. Түр хүлээгээд дахин оролдоно уу.";
  return `Алдаа гарлаа: ${message}`;
}

export async function signIn(prevState, formData) {
  const email = text(formData, "email");
  const password = String(formData.get("password") || "");
  if (!EMAIL_RE.test(email) || !password) {
    return { ok: false, message: "Имэйл, нууц үгээ оруулна уу.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: authMessage(error.message), values: { email } };

  revalidatePath("/", "layout");
  redirect(safeNext(text(formData, "next")));
}

export async function signUp(prevState, formData) {
  const values = {
    full_name: text(formData, "full_name"),
    phone: text(formData, "phone").replace(/\D/g, ""),
    email: text(formData, "email"),
  };
  const password = String(formData.get("password") || "");

  const errors = {};
  if (values.full_name.length < 2) errors.full_name = "Нэрээ оруулна уу";
  if (!PHONE_RE.test(values.phone)) errors.phone = "8 оронтой утасны дугаар";
  if (!EMAIL_RE.test(values.email)) errors.email = "Имэйл хаяг буруу байна";
  if (password.length < 6) errors.password = "Хамгийн багадаа 6 тэмдэгт";
  if (Object.keys(errors).length) return { ok: false, errors, values };

  const origin = (await headers()).get("origin") || "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: {
      data: { full_name: values.full_name, phone: values.phone },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });
  if (error) return { ok: false, message: authMessage(error.message), values };

  // Email confirmation turned on in Supabase → no session until the link is clicked
  if (!data.session) {
    return { ok: true, confirm: true, values };
  }

  await supabase.from("profiles").upsert({ id: data.user.id, full_name: values.full_name, phone: values.phone });
  revalidatePath("/", "layout");
  redirect(safeNext(text(formData, "next")));
}

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function saveProfile(prevState, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const values = {
    full_name: text(formData, "full_name"),
    phone: text(formData, "phone").replace(/\D/g, ""),
    city: text(formData, "city"),
    district: text(formData, "district"),
    khoroo: text(formData, "khoroo"),
    address: text(formData, "address"),
  };
  if (values.phone && !PHONE_RE.test(values.phone)) {
    return { ok: false, message: "Утасны дугаар 8 оронтой байна." };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...values, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: `Хадгалж чадсангүй: ${error.message}` };

  revalidatePath("/account");
  return { ok: true, message: "Мэдээлэл хадгалагдлаа", key: Date.now() };
}
