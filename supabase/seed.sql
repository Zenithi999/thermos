-- Optional demo data: run after schema.sql to see the shop filled in.
-- Replace or delete these products from /admin once you add real ones.

insert into public.categories (name, slug, sort_order) values
  ('Термос', 'thermos', 1),
  ('Аяга', 'tumbler', 2)
on conflict (slug) do nothing;

insert into public.products
  (name, slug, subtitle, description, category_id, capacity, price, stock, image_url,
   bg_from, bg_to, accent, is_featured, hero_order)
select v.name, v.slug, v.subtitle, v.description,
       (select id from public.categories where slug = 'thermos'),
       v.capacity, v.price, 25, v.image_url, v.bg_from, v.bg_to, v.accent, true, v.hero_order
from (values
  ('Matte Black',  'matte-black',  'Classic 500ml', 'Давхар ханатай вакуум тусгаарлалт. Халуун ундааг 12 цаг, хүйтнийг 24 цаг хадгална.', '500ml', 89000, '/images/thermos-1.png', '#3a3a3d', '#0b0b0c', '#4a4a4d', 1),
  ('Forest Green', 'forest-green', 'Trail 500ml',   'Аялал, явган аялалд тохиромжтой бат бөх бүрхүүлтэй.',                                   '500ml', 95000, '/images/thermos-2.png', '#2f5142', '#0c1712', '#3f6b52', 2),
  ('Ocean Blue',   'ocean-blue',   'Voyage 600ml',  'Том багтаамжтай, нэг гараар онгойлгох таглаатай.',                                        '600ml', 99000, '/images/thermos-3.png', '#233f5e', '#0a121c', '#33517a', 3),
  ('Sand Beige',   'sand-beige',   'Desert 500ml',  'Зөөлөн матт өнгөлгөөтэй, гарт эвтэйхэн.',                                                 '500ml', 92000, '/images/thermos-4.png', '#6b5847', '#1a140f', '#8a7358', 4),
  ('Burgundy Red', 'burgundy-red', 'Reserve 500ml', 'Бэлэгт тохиромжтой, тансаг өнгө.',                                                        '500ml', 105000, '/images/thermos-5.png', '#5a2430', '#160a0d', '#7a3040', 5),
  ('Silver Steel', 'silver-steel', 'Metro 600ml',   'Зэвэрдэггүй ган, өдөр тутмын хэрэглээнд.',                                                '600ml', 98000, '/images/thermos-6.png', '#54585f', '#131417', '#7a7f88', 6)
) as v(name, slug, subtitle, description, capacity, price, image_url, bg_from, bg_to, accent, hero_order)
on conflict (slug) do nothing;
