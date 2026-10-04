import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageSEO,sitemapXML} from '../src/seo.mjs';

const listing={id:'sample-plot',section:'estate',title:'Vizag Plot',kind:'Plot',intent:'Sale',location:'Anandapuram',detail:'200 sq yd',description:'Sample property',photos:['https://example.com/plot.jpg']};
const article={id:'ai-guide',title:'Using AI to compare homes',summary:'A practical guide',body:'Long article',date:'2026-10-03',image:'https://example.com/article.jpg'};

test('preview pages stay out of search results until publication is configured',()=>{
 const preview=pageSEO('/property.html',new URLSearchParams('id=sample-plot'),{listings:[listing]});
 assert.match(preview,/noindex,nofollow/);
 assert.doesNotMatch(preview,/rel="canonical"/);
 assert.doesNotMatch(preview,/application\/ld\+json/);
 assert.doesNotMatch(sitemapXML({listings:[listing]}),/<url>/);
});

test('published property and article metadata follow live content',()=>{
 const options={listings:[listing],editorials:[article],siteUrl:'https://estate.example',publishReady:true};
 const property=pageSEO('/property.html',new URLSearchParams('id=sample-plot'),options);
 assert.match(property,/Vizag Plot in Anandapuram/);
 assert.match(property,/index,follow/);
 assert.match(property,/https:\/\/estate\.example\/property\.html\?id=sample-plot/);
 const story=pageSEO('/article.html',new URLSearchParams('id=ai-guide'),options);
 assert.match(story,/application\/ld\+json/);
 assert.match(story,/Using AI to compare homes/);
 const missing=pageSEO('/property.html',new URLSearchParams('id=missing'),options);
 assert.match(missing,/noindex,nofollow/);
 const sitemap=sitemapXML(options);
 assert.match(sitemap,/property\.html\?id=sample-plot/);
 assert.match(sitemap,/article\.html\?id=ai-guide/);
 assert.doesNotMatch(sitemap,/admin\.html/);
});
