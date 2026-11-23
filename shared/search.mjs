export function fold(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').trim();
}

export function matchesCourt(court, { sport = '', area = '', q = '' }) {
  const terms = fold(q).split(/\s+/).filter(Boolean);
  const text = fold([court.name, court.area, court.location, ...court.features].join(' '));
  return (!sport || court.sport === sport) &&
    (!area || court.area === area) &&
    terms.every(term => text.includes(term));
}

export function fallbackRecommendations(courts, viewed) {
  return courts.filter(court => court.slug !== viewed.slug)
    .sort((a, b) => score(b, viewed) - score(a, viewed) || a.price - b.price)
    .slice(0, 2);
}

function score(court, viewed) {
  return (court.sport === viewed.sport ? 3 : 0) + (court.area === viewed.area ? 1 : 0);
}
