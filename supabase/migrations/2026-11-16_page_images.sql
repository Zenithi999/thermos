-- Images for the "Брэндийн тухай" and "Бүтээгдэхүүний тухай" pages, uploaded from /admin/pages.
-- Stored as { "<slot key>": "<public image URL>" }. Run once in Supabase → SQL Editor. Safe to re-run.

alter table public.settings add column if not exists page_images jsonb not null default '{}'::jsonb;
