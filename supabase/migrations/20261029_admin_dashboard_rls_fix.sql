-- Les indicateurs du dashboard utilisent les requêtes RLS de l'interface et de la fonction serveur.
-- On ne publie pas une vue globale qui pourrait contourner les politiques RLS des tables de santé.
drop view if exists public.admin_dashboard_summary;
