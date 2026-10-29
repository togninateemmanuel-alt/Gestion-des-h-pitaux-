# Flux d'interconnexion

```text
Patient ── rendez_vous ──> Hôpital ── ordonnance ──> Patient
   │                                             │
   └──────── commande_pharmacie <───────────────┘
                         │
                         ▼
                    Pharmacie
                         │
                         └── délivrance / stock

Admin = supervision des établissements et statistiques
Tous les flux = même backend Supabase
```

Contrats communs : `shared/om-contracts.js`.
Client et Realtime communs : `shared/om-core.js`.