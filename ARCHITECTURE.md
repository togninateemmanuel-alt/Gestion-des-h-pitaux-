# Architecture d'interconnexion — Ordonnance Mobile

## 1. Les quatre interfaces

```text
Patient ── rendez_vous ──> Hôpital ── ordonnance ──> Patient
   │                                             │
   └──────── commande_pharmacie <───────────────┘
                         │
                         ▼
                    Pharmacie
                         │
                         └── délivrance / stock

Admin = supervision transversale
Tous les flux = même projet Supabase
```

Les quatre applications originales fournies ont le même backend Supabase. Le dépôt centralise maintenant leur intégration sous `apps/` et fournit une couche partagée sous `shared/`.

## 2. Contrat de données

- `rendez_vous` relie le patient à l'hôpital.
- `ordonnances` appartient au parcours de consultation et contient les `ordonnance_lignes`.
- `commandes_pharmacie.ligne_id` identifie le médicament prescrit.
- `commandes_pharmacie.ordonnance_id` identifie explicitement l'ordonnance source.
- `commandes_pharmacie.pharmacie_id` relie la commande à l'établissement qui la délivre.
- Les tables d'assurance (`modeles_assurance`, `feuilles_assurance`, `delivrances_pharmacie`, `journal_feuilles_assurance`) complètent le parcours de prise en charge.

## 3. Temps réel

`shared/om-core.js` fournit le client commun et des helpers Realtime. Les applications conservent également leurs abonnements métier afin de ne pas casser les comportements existants des ZIP.

## 4. Dashboard Admin — intégrations à brancher

Le dashboard Admin doit devenir la couche de supervision, pas un second backend métier. Les indicateurs recommandés sont :

1. patients actifs ;
2. hôpitaux publiés / en attente ;
3. pharmacies publiées / en attente ;
4. rendez-vous du jour et états anormaux ;
5. ordonnances créées ;
6. commandes pharmacie par statut ;
7. ruptures de stock et ventes ;
8. opérations d'assurance ;
9. erreurs techniques et paiements à vérifier.

### Intelligence artificielle

L'IA doit être branchée comme une couche d'analyse en lecture contrôlée : elle reçoit des agrégats ou événements non nécessaires à l'identification directe du patient et produit des alertes/explications pour l'Admin. Elle ne doit pas modifier directement les données médicales, les paiements ou les stocks.

Flux cible :

```text
Supabase → agrégations sécurisées → fonction serveur IA → alertes/insights → Dashboard Admin
```

Pour les données médicales sensibles, la fonction serveur doit appliquer une minimisation stricte des données et des règles d'accès avant tout appel à un fournisseur IA.

## 5. Sécurité

- navigateur : clé publishable uniquement ;
- jamais de `service_role` dans les apps web ;
- RLS obligatoire sur les tables exposées ;
- fonctions sensibles vérifiées côté serveur ;
- paiements, délivrance et stock ne doivent pas être validés uniquement par le navigateur ;
- les flux d'assurance et les documents privés doivent conserver leurs politiques Storage/RLS.

## 6. État actuel

La première couche d'intégration et le lien `ordonnance_id` sont présents dans `main`. La prochaine étape de maintenance est de continuer le refactor des gros fichiers historiques sans supprimer leurs fonctions métier, puis de tester chaque flux avec les fonctions Supabase réellement déployées (`paiement-initier`, `paiement-test`, `soumettre_resultat`, `vente_comptoir`, `chercher_medicament`, `delivrer_commande`, selon ce qui existe effectivement dans le projet).
