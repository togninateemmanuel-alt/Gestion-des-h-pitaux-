# Gestion des hôpitaux / Ordonnance Mobile

Plateforme multi-interface basée sur un backend Supabase commun.

## Applications

- `apps/patient/` — rendez-vous, ordonnances et pharmacie.
- `apps/hopital/` — accueil, consultation, constantes et prescriptions.
- `apps/pharmacie/` — commandes, délivrance, stock et ventes.
- `apps/admin/` — supervision, indicateurs et analyse IA.
- `shared/` — couche d'intégration commune.
- `supabase/` — migrations et fonctions serveur.

## Flux interconnecté

`Patient → rendez_vous → Hôpital → ordonnances → Patient → commandes_pharmacie → Pharmacie`

Le rattachement `commandes_pharmacie.ordonnance_id` conserve la traçabilité de l'ordonnance source.

## Portail

`index.html` fournit l'entrée unique vers les quatre interfaces.

## Dashboard Admin + IA

Le dashboard Admin lit les indicateurs et activités autorisés. `supabase/functions/admin-ai-insights/` prépare une analyse IA côté serveur à partir d'agrégats uniquement. La clé OpenAI ne doit jamais être placée dans le navigateur ni dans GitHub : elle doit être configurée comme secret de la fonction Supabase (`OPENAI_API_KEY`).

## Mise en service Supabase

1. Appliquer les migrations dans `supabase/migrations/` dans l'ordre chronologique.
2. Déployer `supabase/functions/admin-ai-insights/`.
3. Configurer `OPENAI_API_KEY` côté serveur si l'analyse IA doit être activée.
4. Vérifier Auth, RLS, Storage et les fonctions sensibles avant toute donnée médicale réelle.

## Sécurité

Les clients web utilisent uniquement la clé publishable. Aucune clé `service_role` ne doit être ajoutée au navigateur. Paiements, délivrance, stock et résultats médicaux doivent rester protégés par Auth + RLS ou par des fonctions serveur contrôlées.

## État

La structure d'intégration et le flux central sont dans `main`. Les versions compactes des interfaces servent de base intégrée ; les fonctionnalités détaillées propres aux ZIP d'origine doivent être réintégrées avant une mise en production complète. Le déploiement réel et l'application des migrations sur le projet Supabase restent des opérations d'environnement, à vérifier sur le projet cible.
