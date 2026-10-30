-- Patient hospital discovery fields: real coordinates, image and rating.
alter table public.hopitaux add column if not exists latitude numeric(9,6);
alter table public.hopitaux add column if not exists longitude numeric(9,6);
alter table public.hopitaux add column if not exists photo_url text;
alter table public.hopitaux add column if not exists note numeric(2,1) check (note is null or (note between 0 and 5));
create index if not exists hopitaux_geo_idx on public.hopitaux(latitude,longitude);
