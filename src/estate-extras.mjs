const icons={
 parking:'M5 20V4h8a5 5 0 0 1 0 10H5m0-5h8m5 5v-3',
 water:'M12 3c-3 4-6 7-6 10a6 6 0 0 0 12 0c0-3-3-6-6-10Z',
 security:'M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z',
 lift:'M6 4h12v16H6zM9 9l3-3 3 3M9 15l3 3 3-3',
 balcony:'M4 5h16v14H4zM4 12h16M8 12v7m4-7v7m4-7v7',
 power:'M13 2 6 13h5l-1 9 8-12h-5l1-8Z',
 road:'M9 3 5 21m10-18 4 18M12 4v3m0 4v3m0 4v3',
 open:'M3 18c4-3 6-3 9 0 3-3 5-3 9 0M3 10l5-5 4 4 4-4 5 5',
 gym:'M3 9v6m3-9v12m12-12v12m3-9v6M6 12h12',
 clubhouse:'M3 10 12 3l9 7v11H3V10Zm6 11v-7h6v7',
 fire:'M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 0 3 2 3 2 3 1-4 3-6 4-8 0 4 5 7 5 12 0 4-3 7-7 7Z',
 camera:'M3 7h3l2-2h8l2 2h3v13H3V7Zm9 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
 pool:'M3 6c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 12c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 18c3 0 3 2 6 2s3-2 6-2 3 2 6 2',
 play:'M4 21V9l6-6 6 6v12M4 13h12M18 10h3m-1.5-2v4',
 internet:'M2 9c6-6 14-6 20 0M5 13c4-4 10-4 14 0M9 17c2-2 4-2 6 0m-3 4h.01',
 other:'M12 3 3 8v13h18V8l-9-5Zm-5 8h10M7 15h10'
};

export function amenityIcon(name){
 const word=String(name).toLowerCase();
 const key=word.includes('park')?'parking':word.includes('water')||word.includes('bore')?'water':word.includes('secur')||word.includes('gated')?'security':word.includes('lift')||word.includes('elevator')?'lift':word.includes('balcon')?'balcony':word.includes('power')||word.includes('solar')||word.includes('generator')||word.includes('ev charging')?'power':word.includes('road')?'road':word.includes('open')||word.includes('garden')||word.includes('landscap')?'open':word.includes('gym')||word.includes('fitness')?'gym':word.includes('club')||word.includes('community hall')?'clubhouse':word.includes('fire')?'fire':word.includes('cctv')||word.includes('camera')?'camera':word.includes('pool')||word.includes('swim')?'pool':word.includes('play')?'play':word.includes('wifi')||word.includes('internet')?'internet':'other';
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[key]}"/></svg>`;
}

function pairedItems(items,english,telugu){
 if(Array.isArray(items)&&items.length)return items.filter(row=>row&&typeof row==='object'&&String(row.en||'').trim()).map(row=>({en:String(row.en).trim(),te:String(row.te||'').trim()}));
 const en=String(english||'').split(/[,\n]/).map(x=>x.trim()).filter(Boolean);
 const te=String(telugu||'').split(/[,\n]/).map(x=>x.trim()).filter(Boolean);
 return en.map((label,index)=>({en:label,te:te[index]||''}));
}

export function amenitySection(item,{lang='en',esc}={}){
 const entries=pairedItems(item.amenityItems,item.amenities,item.amenitiesTe);
 const tiles=entries.map(({en,te})=>`<div class="amenity-tile">${amenityIcon(en)}<span>${esc(lang==='te'?(te||en):en)}</span></div>`).join('');
 return `<section class="property-amenities"><div class="property-section-title"><span>02</span><h2>${lang==='te'?'సౌకర్యాలు':'Amenities'}</h2></div>${entries.length?`<div class="amenity-grid">${tiles}</div>`:`<p>${lang==='te'?'నిర్ధారించిన సౌకర్యాలు త్వరలో జోడిస్తాము.':'Verified amenities will be added soon.'}</p>`}</section>`;
}

export function connectivitySection(item,{lang='en',esc}={}){
 const entries=pairedItems(item.connectivityItems,item.connectivity,item.connectivityTe);
 const details=entries.length?`<ul class="connectivity-list">${entries.map(({en,te})=>`<li>${esc(lang==='te'?(te||en):en)}</li>`).join('')}</ul>`:`<p>${lang==='te'?'రాకపోకల సమాచారం త్వరలో జోడించబడుతుంది.':'Connectivity details will be added after verification.'}</p>`;
 return `<section class="property-connectivity"><h3>${lang==='te'?'రవాణా సౌకర్యం':'Connectivity'}</h3>${details}</section>`;
}

export function mapSection(item,{lang='en',esc}={}){
 const location=String(item.mapQuery||item.location||'').trim();
 if(!location)return '';
 const query=encodeURIComponent(location),embed=`https://maps.google.com/maps?q=${query}&output=embed`,link=`https://www.google.com/maps/search/?api=1&query=${query}`;
 return `<section class="property-map"><div class="property-section-title"><span>03</span><h2>${lang==='te'?'ప్రాంతం':'Location'}</h2></div><p>${esc(lang==='te'?(item.locationTe||item.location):item.location)}</p><div class="map-frame"><iframe title="${lang==='te'?'స్థానం మ్యాప్':'Location map'}" src="${esc(embed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><div class="map-foot"><small>${lang==='te'?'ఇది ప్రాంత సూచన మాత్రమే. ఖచ్చితమైన స్థలాన్ని కాల్‌లో నిర్ధారించుకోండి.':'Area guide only. Confirm the exact property location during a call.'}</small><a href="${esc(link)}" target="_blank" rel="noopener noreferrer">${lang==='te'?'Google Maps‌లో తెరవండి':'Open in Google Maps'} ↗</a></div></section>`;
}
