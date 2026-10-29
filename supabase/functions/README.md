# Edge Functions

Fonctions serveur Supabase du projet. Les clés de fournisseurs externes restent des secrets côté serveur.

## `admin-ai-insights`

Analyse des agrégats administratifs après contrôle du rôle `admin`/`superadmin`. Elle utilise l’API Responses côté serveur quand `OPENAI_API_KEY` est configurée.

Secrets attendus : `OPENAI_API_KEY` et, facultativement, `OPENAI_MODEL`.
