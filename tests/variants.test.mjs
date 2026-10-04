import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBackend} from '../src/backend.mjs';

async function variantServer(siteVariant,run) {
  const {server,db}=createBackend({dbPath:':memory:',adminToken:'test-secret',siteVariant,siteUrl:`https://${siteVariant}.example`,publishReady:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve=>server.close(resolve)); db.close(); }
}

const mutate=(base,path,method,body)=>fetch(`${base}${path}`,{
  method,headers:{'Content-Type':'application/json','x-admin-token':'test-secret'},
  body:body?JSON.stringify(body):undefined
});

test('estate variant exposes only property inventory and allows its own edits',async()=>variantServer('estate',async base=>{
  const config=await (await fetch(`${base}/api/site-config`)).json();
  assert.deepEqual(config.sections,['estate']);
  const listings=await (await fetch(`${base}/api/listings`)).json();
  assert.ok(listings.length>0);
  assert.ok(listings.every(item=>item.section==='estate'));
  for(const path of ['/boutique.html','/collection.html','/cars.html'])
    assert.equal((await fetch(`${base}${path}`)).status,404,path);
  const rejected=await mutate(base,'/api/listings','POST',{section:'car',kind:'Rental',title:'Cross-site car',price:'Price on request',photos:[]});
  assert.equal(rejected.status,403);
  assert.equal((await mutate(base,'/api/enquiries','POST',{phone:'9876543210',consent:true,source:'boutique'})).status,400);
  assert.equal((await mutate(base,'/api/enquiries','POST',{phone:'9876543210',consent:true,source:'estate'})).status,201);
  const estate=await mutate(base,'/api/listings','POST',{section:'estate',kind:'Plot',title:'Own plot',price:'Price on request',photos:[]});
  assert.equal(estate.status,200);
  const property=await (await fetch(`${base}/property.html?id=e7`)).text();
  assert.match(property,/Harbour Link Commercial Plot/);
  assert.match(property,/https:\/\/estate\.example\/property\.html\?id=e7/);
}));

test('boutique variant hides and protects estate content and advertises only shop pages',async()=>variantServer('boutique',async base=>{
  const config=await (await fetch(`${base}/api/site-config`)).json();
  assert.deepEqual(config.sections,['boutique','car']);
  const listings=await (await fetch(`${base}/api/listings`)).json();
  assert.ok(listings.some(item=>item.section==='boutique'));
  assert.ok(listings.some(item=>item.section==='car'));
  assert.ok(listings.every(item=>item.section!=='estate'));
  for(const path of ['/estate.html','/properties.html','/property.html','/editorials.html','/article.html','/about.html'])
    assert.equal((await fetch(`${base}${path}`)).status,404,path);
  assert.equal((await mutate(base,'/api/enquiries','POST',{phone:'9876543210',consent:true,source:'estate'})).status,400);
  assert.equal((await mutate(base,'/api/enquiries','POST',{phone:'9876543210',consent:true,source:'boutique'})).status,201);
  assert.equal((await mutate(base,'/api/listings/e1','DELETE')).status,403);
  assert.equal((await mutate(base,'/api/editorials','POST',{title:'Hidden article',body:'Text'})).status,403);
  const sitemap=await (await fetch(`${base}/sitemap.xml`)).text();
  assert.match(sitemap,/boutique\.html/);
  assert.match(sitemap,/collection\.html/);
  assert.match(sitemap,/cars\.html/);
  assert.doesNotMatch(sitemap,/property\.html|estate\.html|article\.html/);
  const clothingPage=await (await fetch(`${base}/boutique.html`)).text();
  const carPage=await (await fetch(`${base}/cars.html`)).text();
  assert.match(clothingPage,/<title>Clothing and top sellers \| Ravi Seth Atelier<\/title>/);
  assert.match(carPage,/<title>Cars for sale and rent \| Ravi Seth Motor<\/title>/);
  assert.match(clothingPage,/https:\/\/boutique\.example\/boutique\.html/);
}));
