import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBackend} from '../src/backend.mjs';
import {legacyFeatureItems} from '../src/features.mjs';

async function withServer(run) {
  const {server,db}=createBackend({dbPath:':memory:',adminToken:'test-secret'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve=>server.close(resolve)); db.close(); }
}

const save=(base,body)=>fetch(`${base}/api/listings`,{
  method:'POST',
  headers:{'Content-Type':'application/json','x-admin-token':'test-secret'},
  body:JSON.stringify(body)
});

test('legacy feature strings retain English and Telugu pairs',()=>{
  assert.deepEqual(legacyFeatureItems('Parking, Water\nPower','పార్కింగ్, నీరు\nవిద్యుత్'),[
    {en:'Parking',te:'పార్కింగ్'},
    {en:'Water',te:'నీరు'},
    {en:'Power',te:'విద్యుత్'}
  ]);
});

test('estate feature pairs support large lists and publish through the API',async()=>withServer(async base=>{
  const amenityItems=Array.from({length:40},(_,i)=>({en:`Amenity ${i+1}`,te:`సౌకర్యం ${i+1}`}));
  const connectivityItems=[{en:'Railway station, 4 km',te:'రైల్వే స్టేషన్, 4 కి.మీ.'},{en:'Hospital, 2 km',te:'ఆసుపత్రి, 2 కి.మీ.'}];
  const response=await save(base,{section:'estate',kind:'Flat',title:'Paired feature test',price:'Price on request',photos:[],amenityItems,connectivityItems});
  assert.equal(response.status,200);
  const created=await response.json();
  assert.deepEqual(created.amenityItems,amenityItems);
  assert.deepEqual(created.connectivityItems,connectivityItems);
  const publicItems=await (await fetch(`${base}/api/listings?section=estate`)).json();
  const published=publicItems.find(item=>item.id===created.id);
  assert.deepEqual(published.amenityItems,amenityItems);
  assert.deepEqual(published.connectivityItems,connectivityItems);
}));

test('malformed and oversized bilingual feature arrays are rejected',async()=>withServer(async base=>{
  const item={section:'estate',kind:'House',title:'Validation test',price:'Price on request',photos:[]};
  for(const change of [
    {amenityItems:Array.from({length:61},()=>({en:'Parking',te:'పార్కింగ్'}))},
    {amenityItems:[{en:'',te:'పార్కింగ్'}]},
    {connectivityItems:[{en:'School'}]},
    {connectivityItems:'School, Hospital'}
  ]) {
    const response=await save(base,{...item,...change});
    assert.equal(response.status,400,JSON.stringify(change).slice(0,100));
  }
}));

test('photo upload rejects bytes that do not match the declared image type',async()=>withServer(async base=>{
  const response=await fetch(`${base}/api/uploads`,{
    method:'POST',
    headers:{'Content-Type':'application/json','x-admin-token':'test-secret'},
    body:JSON.stringify({data:`data:image/png;base64,${Buffer.from('not an image').toString('base64')}`})
  });
  assert.equal(response.status,400);
  assert.match((await response.json()).error,/image format/i);
}));
