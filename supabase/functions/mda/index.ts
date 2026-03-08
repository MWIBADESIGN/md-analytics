const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/javascript",
  "Cache-Control": "public, max-age=300",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get("id");

  if (!projectId) {
    return new Response("// MD Analytics: missing project id", { headers: corsHeaders });
  }

  const trackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track`;

  const script = `
(function(){
  var PID="${projectId}";
  var URL="${trackUrl}";
  function uuid(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16)});}
  var vid=localStorage.getItem('mda_vid');
  if(!vid){vid='v_'+Math.random().toString(36).substr(2,9)+Date.now();localStorage.setItem('mda_vid',vid);}
  var sid=uuid();
  var start=Date.now();
  function send(ev,data){
    var body=JSON.stringify({project_id:PID,visitor_id:vid,session_id:sid,event_name:ev,event_data:data});
    if(ev==='session_end'&&navigator.sendBeacon){navigator.sendBeacon(URL,body);}
    else{fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true}).catch(function(){});}
  }
  send('pageview',{url:location.href,title:document.title,referrer:document.referrer,screen:screen.width+'x'+screen.height});
  window.addEventListener('beforeunload',function(){send('session_end',{duration:Math.round((Date.now()-start)/1000)});});
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a');
    if(a&&a.href){send('click',{url:a.href,text:(a.textContent||'').trim().substring(0,100)});}
  });
})();
`;

  return new Response(script.trim(), { headers: corsHeaders });
});
