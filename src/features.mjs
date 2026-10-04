// Paired labels keep each translation attached to its own feature.
export function legacyFeatureItems(english, telugu) {
  const split = value => String(value || '').split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  const en = split(english), te = split(telugu);
  return en.map((label, index) => ({en: label, te: te[index] || ''}));
}

export function validateFeatureItems(value) {
  return Array.isArray(value) && value.length <= 60 && value.every(row =>
    row && typeof row === 'object' && !Array.isArray(row) &&
    typeof row.en === 'string' && row.en.trim().length > 0 && row.en.length <= 120 &&
    typeof row.te === 'string' && row.te.length <= 120
  );
}

export function cleanFeatureItems(value) {
  return value.map(row => ({en: row.en.trim(), te: row.te.trim()}));
}
