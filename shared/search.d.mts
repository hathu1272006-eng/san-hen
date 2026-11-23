import type { Court, Filters } from '../client/src/app/core/models';

export function fold(text: string): string;
export function matchesCourt(court: Court, filters: Filters): boolean;
export function fallbackRecommendations(courts: Court[], viewed: Court): Court[];
