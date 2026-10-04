// Server-side delivery to a Google Apps Script web app. The Sheet is never called from a visitor's browser.
export function createSheetDelivery(db,{url='',secret='',fetcher=fetch}={}){
  let running=false;
  const status=()=>({configured:Boolean(url&&secret),pending:db.prepare("SELECT COUNT(*) n FROM enquiries WHERE json_extract(data,'$.sheetStatus') IN ('not_configured','pending','failed')").get().n});
  async function syncOne(id){
    if(!url||!secret)return {ok:false,reason:'not_configured'};
    const row=db.prepare('SELECT data FROM enquiries WHERE id=?').get(id);
    if(!row)return {ok:false,reason:'missing'};
    const enquiry=JSON.parse(row.data);
    if(enquiry.sheetStatus==='synced')return {ok:true,alreadySynced:true};
    try{
      const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,request:enquiry}),signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw Error(`Google Sheet returned ${response.status}`);
      const result=await response.json();
      if(result.ok!==true||result.id!==id)throw Error('Google Sheet did not confirm the request ID');
      enquiry.sheetStatus='synced';enquiry.sheetError='';enquiry.syncedAt=new Date().toISOString();
      db.prepare('UPDATE enquiries SET data=? WHERE id=?').run(JSON.stringify(enquiry),id);
      return {ok:true};
    }catch(error){
      enquiry.sheetStatus='failed';enquiry.sheetError=String(error.message||error).slice(0,200);
      db.prepare('UPDATE enquiries SET data=? WHERE id=?').run(JSON.stringify(enquiry),id);
      return {ok:false,reason:enquiry.sheetError};
    }
  }
  async function syncPending(){
    if(running||!url||!secret)return status();
    running=true;
    try{const ids=db.prepare("SELECT id FROM enquiries WHERE json_extract(data,'$.sheetStatus') IN ('not_configured','pending','failed') ORDER BY created LIMIT 50").all().map(x=>x.id);for(const id of ids)await syncOne(id);return status();}
    finally{running=false;}
  }
  return {status,syncOne,syncPending};
}
