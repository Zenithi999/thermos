# Thermos — термосны онлайн дэлгүүр

Next.js 16 + Supabase дээр бүтсэн, монгол хэлтэй захиалгын дэлгүүр.

- **Дэлгүүр:** Thermos брэнд бүүкийн загвартай нүүр хуудас (баннер + 4 ангилал), бүх бүтээгдэхүүн (ангилал, эрэмбэ), бүтээгдэхүүний хуудас, сагс, захиалга, захиалга шалгах
- **Админ (`/admin`):** хяналтын самбар, бүтээгдэхүүн (зураг upload), ангилал (зурагтай), захиалга (төлөв, төлбөр), тохиргоо (нүүрний баннер)
- **Төлбөр:** одоогоор “баталгаажсаны дараа төлөх” — онлайн төлбөр (QPay г.м.) дараа нэмэгдэнэ

## 1. Supabase тохируулах (нэг удаа)

1. [supabase.com](https://supabase.com/dashboard) дээр шинэ project үүсгэнэ (Region: Singapore эсвэл Tokyo ойр).
2. **SQL Editor → New query** дээр [`supabase/schema.sql`](supabase/schema.sql)-ийн бүх агуулгыг хуулж **Run** дарна.
   Хүснэгтүүд, аюулгүй байдлын дүрэм (RLS), зургийн bucket бүгд үүснэ.
3. (Заавал биш) Жишээ 6 бүтээгдэхүүн оруулах бол [`supabase/seed.sql`](supabase/seed.sql)-г мөн ажиллуулна.
4. **Project Settings → API Keys** хэсгээс URL болон **Publishable key**-г авч, төслийн хавтаст `.env.local` файл үүсгэнэ:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

## 2. Админ эрх олгох

1. Supabase → **Authentication → Users → Add user → Create new user** — имэйл, нууц үгээ оруулж
   **Auto Confirm User**-г чагтална.
2. **SQL Editor** дээр (имэйлээ солиод) ажиллуулна:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'tanii@email.com';
   ```

3. `http://localhost:3000/admin` руу орж нэвтэрнэ.

## 3. Ажиллуулах

```bash
npm install
npm run dev
```

- Дэлгүүр: http://localhost:3000
- Админ: http://localhost:3000/admin

## Нүүр хуудасны баннер ба ангилал

> Шинэчлэлт: [`supabase/migrations/2026-10-06_home_banner_categories.sql`](supabase/migrations/2026-10-06_home_banner_categories.sql)-г
> SQL Editor дээр нэг удаа ажиллуулна (баннер, ангиллын зургийн багана + 4 ангилал нэмнэ).

1. **Баннер:** Админ → **Тохиргоо → Нүүр хуудасны баннер** — өргөн, нарийн зураг (ойролцоогоор 2400×560px).
   Зураггүй үед брэндийн бараан баннер гарна.
2. **Ангиллын 4 зураг:** Админ → **Ангилал** — мөр бүрийн зүүн талын жижиг дөрвөлжин дээр дарж зураг оруулаад **Хадгалах**.
   Дарааллаараа эхний 4 ангилал баннерын доор зурагтайгаа харагдана.
3. **Бараа нэмэх:** бараа нэмэхдээ ангиллаа сонговол тухайн ангилалд автоматаар орно.
4. **Онцлох бараа** (бараан дээрх “Онцлох” тохиргоо) нүүр хуудасны “Бидний сонголт” хэсэгт гарна.

## Бүтэц

```
app/(store)/        дэлгүүрийн хуудсууд (нүүр, shop, products, cart, checkout, track…)
app/admin/          админ хэсэг (login + (panel))
components/store/   дэлгүүрийн компонентууд (StoreHeader, ProductCard, CheckoutForm…)
components/admin/   админы компонентууд (ProductForm, AdminNav…)
lib/                Supabase client, өгөгдөл унших, формат
styles/             store.css, admin.css (брэнд токенууд: app/globals.css)
supabase/           schema.sql, seed.sql
proxy.js            /admin-ийн session шалгалт
```

## Аюулгүй байдлын тэмдэглэл

- Үнэ, үлдэгдлийг захиалга үүсгэх үед **database дотор** (`place_order` функц) дахин тооцдог — хэрэглэгч үнийг хөтөч дээрээс өөрчилж чадахгүй.
- Захиалга цуцлахад бараа үлдэгдэлд автоматаар буцаж нэмэгдэнэ.
- Хэрэглэгч захиалгаа зөвхөн **захиалгын дугаар + утасны дугаар** хоёулаа таарвал харна.
- Админ бичих эрх бүгд Supabase RLS (`is_admin()`)-аар хамгаалагдсан.

## Production-д гаргах (Vercel)

1. Код-оо GitHub руу push хийнэ → [vercel.com](https://vercel.com) дээр import хийнэ.
2. Environment Variables хэсэгт `.env.local`-ийн хоёр утгыг оруулна.
3. Supabase → Authentication → URL Configuration дээр сайтын домэйнээ нэмнэ.
