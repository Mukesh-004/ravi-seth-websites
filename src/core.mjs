export const BUSINESS_WHATSAPP = ''; // Add an approved business number, digits only, before launch.
export const STORAGE_KEY = 'ravi-seth-demo-listings-v1';
export const ENQUIRIES_KEY = 'rs-demo-enquiries';

export function filterListings(items, {intent='All', kind='All', search=''}={}) {
  const query = search.trim().toLocaleLowerCase();
  return items.filter(item => (intent==='All' || item.intent===intent)
    && (kind==='All' || item.kind===kind)
    && (!query || [item.title,item.kind,item.location,item.detail,item.description].filter(Boolean).join(' ').toLocaleLowerCase().includes(query)));
}

export function validatePhone(value) {
  const digits = String(value).replace(/\D/g,'');
  return digits.length >= 10 && digits.length <= 13;
}

export function validateEnquiry({phone,consent}) {
  const errors={};
  if (!validatePhone(phone)) errors.phone='Enter a valid phone number.';
  if (!consent) errors.consent='Please agree to be contacted.';
  return errors;
}

export function whatsappURL(number, message) {
  const digits=String(number||'').replace(/\D/g,'');
  if (digits.length < 10 || digits.length > 15) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function cleanText(value,max=120) { return String(value||'').trim().slice(0,max); }
export function escapeHTML(value) { return String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export function validateListing(item) {
  const errors={};
  if (!cleanText(item.title,100)) errors.title='Add a title.';
  if (!['estate','boutique','car'].includes(item.section)) errors.section='Choose a section.';
  if (!cleanText(item.kind,60)) errors.kind='Add a category.';
  if (!cleanText(item.price,40)) errors.price='Add a price or “Price on request”.';
  if (item.image && !/^https?:\/\//i.test(item.image) && !/^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(item.image) && !/^data:image\/(jpeg|png|webp);base64,/.test(item.image)) errors.image='Use an image URL or upload a photo.';
  return errors;
}

export function normalizeListing(item) {
  return {
    id: cleanText(item.id,60) || `demo-${Date.now()}`,
    section: item.section,
    title: cleanText(item.title,100), kind: cleanText(item.kind,60),
    intent: ['Sale','Rent'].includes(item.intent)?item.intent:'Sale',
    location: cleanText(item.location,100), price: cleanText(item.price,40),
    detail: cleanText(item.detail,100), description: cleanText(item.description,500),
    sizes: Array.isArray(item.sizes)?item.sizes.map(x=>cleanText(x,12)).filter(Boolean):[],
    image: String(item.image||'').trim()
  };
}

export function readDemoListings(storage=globalThis.localStorage) {
  try { const v=JSON.parse(storage.getItem(STORAGE_KEY)||'[]'); return Array.isArray(v)?v.filter(x=>!Object.keys(validateListing(x)).length):[]; } catch { return []; }
}
export function saveDemoListings(items,storage=globalThis.localStorage) { storage.setItem(STORAGE_KEY,JSON.stringify(items)); }
export function readDemoEnquiries(storage=globalThis.localStorage) { try {const v=JSON.parse(storage.getItem(ENQUIRIES_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];} }
export function saveDemoEnquiries(items,storage=globalThis.localStorage) { storage.setItem(ENQUIRIES_KEY,JSON.stringify(items)); }
