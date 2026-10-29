# Supabase migration

ALTER TABLE public.commandes_pharmacie ADD COLUMN IF NOT EXISTS ordonnance_id bigint REFERENCES public.ordonnances(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS commandes_pharmacie_ordonnance_idx ON public.commandes_pharmacie(ordonnance_id);
CREATE INDEX IF NOT EXISTS commandes_pharmacie_ligne_idx ON public.commandes_pharmacie(ligne_id);