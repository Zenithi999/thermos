# Thermos — термосны онлайн дэлгүүр

Next.js 16 + Supabase дээр бүтсэн, монгол хэлтэй захиалгын дэлгүүр.

- **Дэлгүүр:** Thermos брэнд бүүкийн загвартай нүүр хуудас (статик hero), бүх бүтээгдэхүүн (ангилал, эрэмбэ), бүтээгдэхүүний хуудас, сагс, захиалга, захиалга шалгах
- **Админ (`/admin`):** хяналтын самбар, бүтээгдэхүүн (зураг upload, hero өнгө), ангилал, захиалга (төлөв, төлбөр), тохиргоо
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

## Hero-д бодит бараа гаргах

1. Админ → **Бүтээгдэхүүн → Шинээр нэмэх**
2. **Үндсэн зураг**-т арын фонгүй (transparent) PNG оруулна — босоо, ойролцоогоор 1000×1800px.
   Фон арилгахад remove.bg зэрэг үнэгүй хэрэгсэл ашиглаж болно.
3. Зураг оруулахад hero-гийн өнгийг зурагнаас автоматаар санал болгоно; баруун талын урьдчилсан харагдацаар шалгаад
   хүссэнээрээ засна.
4. **Нүүр хуудасны hero-д** асааж, **Hero дараалал**-аар эрэмбэлнэ.

Hero-д эхний 3 онцлох бараа (Hero дарааллаар) тавиур дээр зэрэгцэн харагдана; онцлох бараа байхгүй бол хамгийн сүүлд нэмэгдсэн бараанууд гарна.

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
