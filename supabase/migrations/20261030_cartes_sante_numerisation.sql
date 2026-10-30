-- Carte santé numérique : types, deux faces, OCR et reconstruction fidèle.
create table if not exists public.cartes_sante (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  type_carte text not null check (type_carte in ('INAM','AMU / CNSS','Autre')),
  organisme text,
  numero_carte text,
  nom text,
  prenom text,
  date_naissance date,
  date_expiration date,
  autres_informations text,
  face_avant_path text,
  face_arriere_path text,
  ocr_avant jsonb,
  ocr_arriere jsonb,
  reconstruction jsonb,
  couleur_dominante text,
  statut text not null default 'a_verifier' check (statut in ('a_verifier','confirmee','archivee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cartes_sante_quota (
  patient_id uuid primary key references public.patients(id) on delete cascade,
  cartes_gratuites integer not null default 5 check (cartes_gratuites >= 0),
  cartes_supplementaires integer not null default 0 check (cartes_supplementaires >= 0),
  updated_at timestamptz not null default now()
);

alter table public.cartes_sante enable row level security;
alter table public.cartes_sante_quota enable row level security;

create policy "patient voit ses cartes sante" on public.cartes_sante
for select to authenticated
using (exists (select 1 from public.patients p where p.id = cartes_sante.patient_id and p.user_id = (select auth.uid())));

create policy "patient cree ses cartes sante" on public.cartes_sante
for insert to authenticated
with check (exists (select 1 from public.patients p where p.id = cartes_sante.patient_id and p.user_id = (select auth.uid())));

create policy "patient modifie ses cartes sante" on public.cartes_sante
for update to authenticated
using (exists (select 1 from public.patients p where p.id = cartes_sante.patient_id and p.user_id = (select auth.uid())))
with check (exists (select 1 from public.patients p where p.id = cartes_sante.patient_id and p.user_id = (select auth.uid())));

create policy "patient supprime ses cartes sante" on public.cartes_sante
for delete to authenticated
using (exists (select 1 from public.patients p where p.id = cartes_sante.patient_id and p.user_id = (select auth.uid())));

create policy "patient voit son quota cartes" on public.cartes_sante_quota
for select to authenticated
using (exists (select 1 from public.patients p where p.id = cartes_sante_quota.patient_id and p.user_id = (select auth.uid())));

create policy "patient initialise son quota cartes" on public.cartes_sante_quota
for insert to authenticated
with check (exists (select 1 from public.patients p where p.id = cartes_sante_quota.patient_id and p.user_id = (select auth.uid())));

-- Le quota payant doit être augmenté uniquement par un flux de paiement côté serveur/admin.
create or replace function public.verifier_quota_cartes_sante()
returns trigger
language plpgsql
as $$
declare
  total_cartes integer;
  quota_total integer;
begin
  select count(*) into total_cartes from public.cartes_sante where patient_id = new.patient_id;
  select coalesce(cartes_gratuites,5) + coalesce(cartes_supplementaires,0) into quota_total
  from public.cartes_sante_quota where patient_id = new.patient_id;
  if quota_total is null then quota_total := 5; end if;
  if total_cartes >= quota_total then
    raise exception 'CARTE_SANTE_QUOTA_ATTEINT';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_verifier_quota_cartes_sante on public.cartes_sante;
create trigger trg_verifier_quota_cartes_sante
before insert on public.cartes_sante
for each row execute function public.verifier_quota_cartes_sante();