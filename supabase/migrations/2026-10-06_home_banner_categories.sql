-- Home page: banner image + category tiles with photos.
-- Run once in Supabase Dashboard → SQL Editor. Safe to re-run.

-- Photo shown on the category tile under the home banner, and whether it is shown there
alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists show_on_home boolean not null default false;

-- Wide banner at the top of the home page (uploaded from /admin/settings)
alter table public.settings add column if not exists hero_image_url text default '';
alter table public.settings add column if not exists hero_link text default '';

-- The four home page categories (switched on/off later from /admin/categories)
insert into public.categories (name, slug, sort_order, show_on_home) values
  ('Хоолны халуун сав', 'food-jar', 1, true),
  ('Усны сав', 'water-bottle', 2, true),
  ('Аяга', 'tumbler', 3, true),
  ('Багц', 'bundle', 4, true)
on conflict (slug) do update set sort_order = excluded.sort_order, show_on_home = true;

-- The older demo "Термос" category moves after the four (products keep their category)
update public.categories set sort_order = 10 where slug = 'thermos';
