# Gestion des hôpitaux / Ordonnance Mobile

Plateforme multi-interface basée sur un backend Supabase commun.

## Applications

- `apps/patient/` — parcours patient : rendez-vous, ordonnances, résultats, recherche/commande en pharmacie.
- `apps/hopital/` — accueil, constantes, consultation, orientation et ordonnance.
- `apps/pharmacie/` — commandes, délivrance, stock et ventes comptoir.
- `apps/admin/` — supervision des établissements et indicateurs.
- `shared/` — contrats et couche d'intégration commune.
- `supabase/migrations/` — évolutions du schéma partagé.

## Flux interconnecté

`Patient → rendez_vous → Hôpital → ordonnances → Patient → commandes_pharmacie → Pharmacie`

La commande pharmacie porte maintenant `ordonnance_id` en plus de `ligne_id`, afin de conserver le rattachement explicite à l'ordonnance source.

## Sources réintégrées

La base de travail provient des quatre applications fournies dans les ZIP : Patient, Hôpital, Pharmacie et Admin. Les fonctions métier originales doivent rester la référence lors des prochains refactors ; la couche `shared/` ne remplace pas leurs règles métier.

## Sécurité Supabase

Les clients web utilisent uniquement la clé publishable. Aucune clé `service_role` ne doit être ajoutée au navigateur. Les opérations sensibles (paiement, délivrance, stock, résultats médicaux) doivent rester protégées par Auth + RLS ou par des fonctions serveur contrôlées.

Voir `ARCHITECTURE.md` pour le détail du flux, du dashboard Admin et des intégrations prévues.
