import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "Configuration Supabase incomplète" }, 500);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Authentification requise" }, 401);

  // Vérifie l'identité avec le JWT de l'appelant.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Session invalide" }, 401);

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profileError || !profile || !["admin", "superadmin"].includes(profile.role)) {
    return json({ error: "Accès administrateur requis" }, 403);
  }

  // Service role uniquement côté serveur, après contrôle admin. Jamais exposé au navigateur.
  const adminClient = createClient(supabaseUrl, serviceKey);
  const tables = [
    "hopitaux",
    "pharmacies",
    "patients",
    "rendez_vous",
    "ordonnances",
    "commandes_pharmacie",
  ] as const;

  const results = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await adminClient.from(table).select("id", { count: "exact", head: true });
      return [table, error ? null : count ?? 0] as const;
    }),
  );
  const metrics = Object.fromEntries(results);

  const payload = {
    generated_at: new Date().toISOString(),
    metrics,
    scope: "agrégats administratifs uniquement",
  };

  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return json({
      ai_enabled: false,
      message: "OPENAI_API_KEY n'est pas configurée. Le dashboard reste fonctionnel et peut afficher les statistiques.",
      metrics: payload,
      insights: [],
    });
  }

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";
  const prompt = `Tu es l'analyste opérationnel de la plateforme Ordonnance Mobile. Analyse uniquement ces agrégats administratifs, sans inventer de données et sans faire de diagnostic médical. Retourne un JSON avec summary (string), alerts (array d'objets severity/category/title/detail), recommendations (array de strings).\n\n${JSON.stringify(payload)}`;

  const aiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: { format: { type: "json_object" } },
    }),
  });

  if (!aiResponse.ok) {
    const detail = await aiResponse.text();
    console.error("OpenAI error", detail);
    return json({ ai_enabled: true, error: "Le service IA n'a pas pu répondre", metrics: payload }, 502);
  }

  const completion = await aiResponse.json();
  const outputText = completion.output_text || "{}";
  let insights: unknown;
  try {
    insights = JSON.parse(outputText);
  } catch {
    insights = { summary: outputText, alerts: [], recommendations: [] };
  }

  return json({ ai_enabled: true, model, metrics: payload, insights });
});
