import test from 'node:test';
import assert from 'node:assert/strict';
import {estate,boutique,cars} from '../src/data.mjs';
import {escapeHTML,filterListings,normalizeListing,readDemoListings,readDemoEnquiries,saveDemoListings,saveDemoEnquiries,validateEnquiry,validateListing,validatePhone,whatsappURL} from '../src/core.mjs';

test('sample collections have unique IDs and usable display fields',()=>{
  const all=[...estate,...boutique,...cars];
  assert.equal(new Set(all.map(x=>x.id)).size,all.length);
  for(const item of all){assert.ok(item.title&&item.kind&&item.price&&item.image);assert.match(item.image,/^https:\/\//);}
  for(const item of estate)assert.ok(['Sale','Rent'].includes(item.intent));
  for(const item of boutique)assert.ok(item.sizes.length>0);
});
test('property filters combine sale/rent, type and search',()=>{
  assert.equal(filterListings(estate,{intent:'Rent'}).length,3);
  assert.equal(filterListings(estate,{intent:'Sale',kind:'Villa'}).length,1);
  assert.equal(filterListings(estate,{search:'SEASIDE'}).length,1);
  assert.equal(filterListings(estate,{search:'no matching listing'}).length,0);
});
test('boutique and car filtering is independent',()=>{
  assert.equal(filterListings(boutique,{kind:'Outerwear'}).length,3);
  assert.equal(filterListings(cars,{search:'diesel'}).length,1);
});
test('enquiry requires a valid phone and consent, with optional name',()=>{
  assert.equal(validatePhone('+91 98765 43210'),true);
  assert.equal(validatePhone('12345'),false);
  assert.deepEqual(Object.keys(validateEnquiry({name:'',phone:'12',consent:false})),['phone','consent']);
  assert.deepEqual(validateEnquiry({phone:'9876543210',consent:true}),{});
  assert.deepEqual(validateEnquiry({name:'Ravi',phone:'+91 98765 43210',consent:true}),{});
});
test('WhatsApp link is safe and inactive without a business number',()=>{
  assert.equal(whatsappURL('','hello'),null);
  assert.equal(whatsappURL('abc','hello'),null);
  assert.equal(whatsappURL('+91 98765 43210','Hello & welcome'),'https://wa.me/919876543210?text=Hello%20%26%20welcome');
});
test('listing validation catches missing fields and invalid image URLs',()=>{
  const bad=validateListing({section:'other',title:'',kind:'',price:'',image:'javascript:alert(1)'});
  assert.deepEqual(Object.keys(bad),['title','section','kind','price','image']);
  assert.deepEqual(validateListing({section:'estate',title:'Sample',kind:'House',price:'₹1 Cr',image:''}),{});
});
test('normalization bounds fields and escapes user content before rendering',()=>{
  const x=normalizeListing({section:'boutique',title:'  <script>  ',kind:'Dresses',price:'₹100',sizes:[' S ','M'],description:'a'.repeat(600)});
  assert.equal(x.title,'<script>');assert.equal(x.description.length,500);assert.deepEqual(x.sizes,['S','M']);
  assert.equal(escapeHTML(x.title),'&lt;script&gt;');
});
test('demo listings survive storage roundtrip and malformed storage is ignored',()=>{
  const map=new Map();const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
  const item=normalizeListing({section:'car',title:'Sample car',kind:'Pre-owned',price:'On request'});
  saveDemoListings([item],storage);assert.equal(readDemoListings(storage)[0].title,'Sample car');
  storage.setItem('ravi-seth-demo-listings-v1','{bad');assert.deepEqual(readDemoListings(storage),[]);
});
test('demo enquiries survive storage roundtrip and malformed storage is ignored',()=>{
  const map=new Map();const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
  saveDemoEnquiries([{name:'Visitor',phone:'9999999999'}],storage);
  assert.equal(readDemoEnquiries(storage)[0].name,'Visitor');
  storage.setItem('rs-demo-enquiries','{bad');assert.deepEqual(readDemoEnquiries(storage),[]);
});
