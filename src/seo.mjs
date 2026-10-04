const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const cut=(value,length=155)=>{const text=clean(value);return text.length>length?`${text.slice(0,length-1).trimEnd()}…`:text};

export function pageSEO(path,params,{listings=[],editorials=[],siteUrl='',publishReady=false,variant='all'}={}){
 const base=siteUrl.replace(/\/$/,'');
 const property=path==='/property.html'?listings.find(x=>x.section==='estate'&&x.id===params.get('id')):null;
 const article=path==='/article.html'?editorials.find(x=>x.id===params.get('id')):null;
 let title=variant==='boutique'?'Ravi Seth Atelier | Clothing':'Ravi Seth Estate | Property in Visakhapatnam';
 let description=variant==='boutique'?'Browse clothing, sizes and photos, and request a call about availability. Explore cars for sale and rent.':'Explore homes, flats, plots and commercial property for sale or rent in Visakhapatnam. Compare details and request a call.';
 let image='';
 if(variant==='boutique'&&(path==='/'||path==='/boutique.html')){
  title='Clothing and top sellers | Ravi Seth Atelier';
 }else if(variant==='boutique'&&path==='/collection.html'){
  title='All clothing and sizes | Ravi Seth Atelier';
  description='Search clothing by category and view photos, sizes, fabric and care details before requesting a call.';
 }else if(variant==='boutique'&&path==='/cars.html'){
  title='Cars for sale and rent | Ravi Seth Motor';
  description='Browse available cars for sale or rent, compare details and request a call about availability.';
 }else if(path==='/property.html'){
  title=property?`${clean(property.title)} in ${clean(property.location)} | Ravi Seth Estate`:'Property not found | Ravi Seth Estate';
  description=property?cut(`${property.kind} for ${property.intent==='Rent'?'rent':'sale'} in ${property.location}. ${property.detail}. ${property.description||'Request a call for details.'}`):'This property is no longer available.';
  image=property?.photos?.[0]||property?.image||'';
 }else if(path==='/article.html'){
  title=article?`${clean(article.title)} | Ravi Seth Estate`:'Article not found | Ravi Seth Estate';
  description=article?cut(article.summary||article.body):'This article is no longer available.';
  image=article?.image||'';
 }else if(path==='/properties.html'){
  title='Property for sale and rent in Visakhapatnam | Ravi Seth Estate';
  description='Browse plots, commercial plots, flats, villas, houses and work spaces in Visakhapatnam. Filter by sale or rent and request a call.';
 }else if(path==='/editorials.html'){
  title='Vizag property guides and market notes | Ravi Seth Estate';
  description='Read practical guides to comparing property, checking documents and using AI in a Visakhapatnam property search.';
 }else if(path==='/about.html'){
  title='About Ravi Seth Estate | Visakhapatnam property';
  description='How we help people compare property details, ask better questions and arrange a conversation before a visit.';
 }
 const found=!(path==='/property.html'&&!property||path==='/article.html'&&!article);
 const indexable=publishReady&&Boolean(base)&&found;
 const canonical=base?`${base}${path==='/'?(variant==='boutique'?'/boutique.html':'/estate.html'):path}${params.has('id')?`?id=${encodeURIComponent(params.get('id'))}`:''}`:'';
 const tags=[`<title>${escape(title)}</title>`,`<meta name="description" content="${escape(description)}">`,`<meta name="robots" content="${indexable?'index,follow':'noindex,nofollow'}">`,`<meta property="og:type" content="${article?'article':'website'}">`,`<meta property="og:title" content="${escape(title)}">`,`<meta property="og:description" content="${escape(description)}">`];
 if(canonical){tags.push(`<link rel="canonical" href="${escape(canonical)}">`,`<meta property="og:url" content="${escape(canonical)}">`)}
 if(image)tags.push(`<meta property="og:image" content="${escape(image)}">`);
 if(article&&indexable)tags.push(`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:clean(article.title),description:clean(article.summary||article.body),datePublished:article.date||undefined,image:image||undefined,mainEntityOfPage:canonical}).replace(/</g,'\\u003c')}</script>`);
 return tags.join('');
}

export function sitemapXML({siteUrl='',publishReady=false,listings=[],editorials=[],variant='all'}={}){
 const base=siteUrl.replace(/\/$/,'');
 const estatePaths=['/estate.html','/properties.html','/about.html','/editorials.html',...listings.filter(x=>x.section==='estate').map(x=>`/property.html?id=${encodeURIComponent(x.id)}`),...editorials.map(x=>`/article.html?id=${encodeURIComponent(x.id)}`)];
 const boutiquePaths=['/boutique.html','/collection.html','/cars.html'];
 const paths=variant==='estate'?estatePaths:variant==='boutique'?boutiquePaths:[...estatePaths,...boutiquePaths];
 const urls=publishReady&&base?paths.map(path=>`<url><loc>${escape(base+path)}</loc></url>`).join(''):'';
 return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
