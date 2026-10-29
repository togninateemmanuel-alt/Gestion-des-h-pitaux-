-- Dashboard Admin: vues de lecture pour les indicateurs et demandes.
-- Cette migration ne contourne pas la RLS des tables sources.

create or replace view public.admin_dashboard_summary as
select
  (select count(*) from public.patients) as patients,
  (select count(*) from public.hopitaux) as hopitaux,
  (select count(*) from public.pharmacies) as pharmacies,
  (select count(*) from public.rendez_vous) as rendez_vous,
  (select count(*) from public.ordonnances) as ordonnances,
  (select count(*) from public.commandes_pharmacie) as commandes_pharmacie;

create index if not exists hopitaux_statut_idx on public.hopitaux(statut);
create index if not exists pharmacies_statut_idx on public.pharmacies(statut);
create index if not exists rendez_vous_statut_idx on public.rendez_vous(statut);
create index if not exists commandes_pharmacie_statut_idx on public.commandes_pharmacie(statut);
