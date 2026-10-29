# Supabase Edge Functions

## `admin-ai-insights`

Fonction sécurisée appelée par le Dashboard Admin.

Flux :

`Admin authentifié → vérification du rôle → agrégats Supabase → IA → insights/alertes`

La clé `OPENAI_API_KEY` est uniquement un secret serveur. Elle ne doit jamais être placée dans `apps/admin` ni dans une variable publique du navigateur.

Secrets attendus :

- `OPENAI_API_KEY` : clé API OpenAI
- `OPENAI_MODEL` : modèle à utiliser, facultatif (valeur par défaut du code)

La fonction utilise le JWT de l'Admin pour l'authentification, puis le service role Supabase uniquement côté serveur après vérification du rôle. Les données envoyées au modèle sont des agrégats administratifs, pas les dossiers médicaux individuels.

OpenAI est appelé via la Responses API. Les nouvelles intégrations doivent utiliser Responses API plutôt que l'ancienne Assistants API.
