import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers:cors});
  const auth = req.headers.get("Authorization");
  if (!auth) return json({error:"Authentification requise."},401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {global:{headers:{Authorization:auth}}});
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) return json({error:"Session invalide."},401);
  const {data:profile} = await supabase.from("profiles").select("role").eq("id",user.id).single();
  if (!profile || !["admin","superadmin"].includes(profile.role)) return json({error:"Accès administrateur requis."},403);

  const [patients,hopitaux,pharmacies,rdv,ordonnances,commandes] = await Promise.all([
    count(supabase,"patients"), count(supabase,"hopitaux"), count(supabase,"pharmacies"),
    count(supabase,"rendez_vous"), count(supabase,"ordonnances"), count(supabase,"commandes_pharmacie")
  ]);
  const metrics={patients,hopitaux,pharmacies,rendez_vous:rdv,ordonnances,commandes_pharmacie:commandes};
  const apiKey=Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ai_enabled:false,metrics,message:"Backend IA prêt : ajoutez OPENAI_API_KEY comme secret de fonction pour activer l’analyse."});

  const model=Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";
  const prompt=`Tu es l’analyste administratif d’une plateforme de santé. Analyse uniquement ces agrégats : ${JSON.stringify(metrics)}. Ne déduis aucune information clinique individuelle. Réponds en JSON avec summary (string), alerts (array d’objets title/detail/severity), recommendations (array de strings). Signale clairement quand les données sont insuffisantes.`;
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model,input:prompt})});
  if(!response.ok) return json({error:"Le fournisseur IA a refusé la requête."},502);
  const result=await response.json();
  const text=result.output_text || "";
  let insights; try{insights=JSON.parse(text)}catch{insights={summary:text,alerts:[],recommendations:[]}}
  return json({ai_enabled:true,metrics,insights});
});

async function count(client:ReturnType<typeof createClient>,table:string){const {count,error}=await client.from(table).select("id",{count:"exact",head:true});return error?null:(count??0)}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}})}
