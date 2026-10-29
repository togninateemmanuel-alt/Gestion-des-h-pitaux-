/* Ordonnance Mobile - couche commune Patient/Hôpital/Pharmacie/Admin */
(function(){
 const SUPABASE_URL='https://qiiqirkhdjfmtduzoqqk.supabase.co';
 const SUPABASE_ANON_KEY='sb_publishable_wsJjuTPF3o_efMRFONly_w_YsgVFgZ8';
 const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 window.OM={sb,SUPABASE_URL,SUPABASE_ANON_KEY,
  status:{rdv:['en_attente','attente','constantes','termine','annule'],commande:['en_attente','en_attente_paiement','paye','en_preparation','livre','annulee']},
  subscribe(name,tables,fn){const c=sb.channel(name);tables.forEach(t=>c.on('postgres_changes',{event:'*',schema:'public',table:t},fn));c.subscribe();return c;},
  async user(){return (await sb.auth.getUser()).data.user||null;},
  async order({patientId,pharmacyId,lineId,prescriptionId,product,amount,paymentMode,extra={}}){return sb.from('commandes_pharmacie').insert({patient_id:patientId,pharmacie_id:pharmacyId,ligne_id:lineId||null,ordonnance_id:prescriptionId||null,produit:product,montant:amount,mode_paiement:paymentMode,...extra}).select().single();}
 };
})();