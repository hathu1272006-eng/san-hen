import { Router } from 'express';
import { fallbackRecommendations, matchesCourt } from '../../../../shared/search.mjs';
import { config } from '../../config.js';
import { Court, publicCourt } from '../../models/court.js';
import { getCourt, getSlots } from './court-service.js';

export const courtRoutes = Router();

courtRoutes.get('/', async (request, response) => {
  const query = name => typeof request.query[name] === 'string' ? request.query[name].slice(0, 100) : '';
  const filters = { sport: query('sport'), area: query('area'), q: query('q') };
  const courts = await Court.find({}, publicCourt).sort({ ordinal: 1 }).lean();
  response.json(courts.filter(court => matchesCourt(court, filters)));
});

courtRoutes.get('/:slug', async (request, response) => {
  response.json(await getCourt(request.params.slug));
});

courtRoutes.get('/:slug/slots', async (request, response) => {
  const court = await getCourt(request.params.slug);
  response.json(await getSlots(court, request.query.date));
});

courtRoutes.get('/:slug/recommendations', async (request, response) => {
  const [viewed, courts] = await Promise.all([
    getCourt(request.params.slug),
    Court.find({}, publicCourt).sort({ ordinal: 1 }).lean(),
  ]);
  try {
    const url = new URL('/recommend/' + encodeURIComponent(viewed.slug), config.recommenderUrl);
    const result = await fetch(url, { signal: AbortSignal.timeout(900) });
    if (result.ok) {
      const { slugs } = await result.json();
      if (Array.isArray(slugs)) {
        const selected = [...new Set(slugs)].filter(slug => slug !== viewed.slug)
          .map(slug => courts.find(court => court.slug === slug)).filter(Boolean).slice(0, 2);
        if (selected.length > 0) return response.json({ source: 'tfidf', courts: selected });
      }
    }
  } catch {
    // Exercise the same endpoint when the optional recommender is offline.
  }
  return response.json({ source: 'fallback', courts: fallbackRecommendations(courts, viewed) });
});
