-- Patient care request flow
-- Adds the fields required for the patient request -> doctor scheduling lifecycle.
alter table public.rendez_vous add column if not exists motif text;
alter table public.rendez_vous add column if not exists date_rdv date;
alter table public.rendez_vous add column if not exists heure_rdv time;
alter table public.rendez_vous add column if not exists paiement_statut text default 'en_attente';
alter table public.rendez_vous add column if not exists assurance text;
alter table public.rendez_vous add column if not exists numero_assure text;
alter table public.rendez_vous add column if not exists assurance_data jsonb not null default '{}'::jsonb;
alter table public.rendez_vous add column if not exists updated_at timestamptz not null default now();
alter table public.rendez_vous drop constraint if exists rendez_vous_statut_check;
alter table public.rendez_vous add constraint rendez_vous_statut_check check (statut in ('en_attente','attente','confirme','constantes','termine','annule'));
alter table public.rendez_vous alter column statut set default 'en_attente';
create index if not exists rendez_vous_patient_date_idx on public.rendez_vous(patient_id,date_rdv,heure_rdv);
